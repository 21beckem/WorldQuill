import Tool from '../supers/Tool.js';
import * as THREE from '../assets/three.module.min.js';
import { WorldQuill } from '../WorldQuill.js';
import { tileWidth, chunkWidthInTiles, tileRimHeight } from '../constants.js';
import Cursor from '../assets/Cursor.js';

export default class ChunkTool extends Tool {
    constructor() {
        super('chunk', 'c');
        this.name = 'Chunk Manager';
        this.label = 'Chunk';
        this.icon = 'fas fa-cube';
        this.description = `This tool allows you to manipulate chunks. As you can see, the look of the map itself has changed. Click on any chunk to select it and see more options. You can also click on any newly-appeared gray chunk to insert a new chunk in its place. While a chunk is selected, you can also drag it to a new location on the map. <br><b>Note:</b> You can only drag it where a gray chunk appears. In other words, it must be ajacent to an existing chunk.`;
    }
    onActivate(args) {
        this._nonSelectedOpacity = 0.7;
        this._currentlyHoveringOverChunk = null;
        this._currentlySelectedChunk = null;
        this._currentlyDraggingChunk = null;
        this._newPositionChunkAfterDrag = null;
        this._fakeChunks = [];
        this.#makeFakeChunksAtNewPositions();
        this.#unselectChunk();
        this.#setUiDetails();
    }
    onDeactivate() {
        this.#unselectChunk();

        // remove all fake chunks
        this.#removeFakeChunks();

        // reset opacity
        WorldQuill.Map.children.forEach(c => c.setOpacity(1));
    }
    onDown(args) {
        // if no selected chunk, do nothing
        if (!this._currentlySelectedChunk) return;

        Cursor.reset();

        // get the chunk I'm pointing at
        const chunk = this.#getRaycastedChunk(args);
        
        // if I'm pointing at the selected chunk...
        if (!chunk || chunk.id !== this._currentlySelectedChunk.id) return;

        // starting to drag selected chunk
        this._currentlyDraggingChunk = chunk;
        Cursor.set(Cursor.grabbing);
        WorldQuill.ThreeJsWorld._controls.enabled = false;
    }
    onMove(args) {
        // if not currently dragging a chunk, do nothing
        if (!this._currentlyDraggingChunk) return;

        Cursor.set(Cursor.grabbing);
        
        // reset opacity on any previously hovered chunk
        this._currentlyHoveringOverChunk?.setOpacity(this._nonSelectedOpacity);
        
        // get current chunk hovering over
        const chunk = this.#getRaycastedChunk(args, true);
        if (!chunk) return;
        this._currentlyHoveringOverChunk = chunk;

        // highlight this chunk
        chunk.setOpacity(1);
        this._newPositionChunkAfterDrag = chunk;
    }
    onHoverMove(args) {
        // if currently selected a chunk, do nothing (except manage cursor)
        if (this._currentlySelectedChunk) {
            const chunk = this.#getRaycastedChunk(args, true);
            if (!chunk) return;
            if (chunk.id === this._currentlySelectedChunk.id)
                Cursor.set(Cursor.grab);
            else
                Cursor.reset();
            return;
        }

        Cursor.reset();

        // if currently hovering over a chunk, reset opacity
        this._currentlyHoveringOverChunk?.setOpacity(this._nonSelectedOpacity);

        // get this chunk if we're hovering over it
        const chunk = this.#getRaycastedChunk(args, true);
        if (!chunk) return;

        // highlight this chunk
        this._currentlyHoveringOverChunk = chunk;
        if (chunk.thisIsNotARealChunk)
            Cursor.set(Cursor.copy);
        else
            Cursor.set(Cursor.pointer);
        chunk.setOpacity(1);
    }
    onUp(args) {
        WorldQuill.ThreeJsWorld._controls.enabled = true;

        Cursor.reset();

        // if was dragging a chunk, move it
        this.#moveChunkToNewPosition();
    }
    onClick(args) {
        this.#unselectChunk();
        if (this._currentlyHoveringOverChunk) {
            this.#setSelectedChunk(this._currentlyHoveringOverChunk);
        }
    }
    #getRaycastedChunk(args, includeFakeChunks=false) {
        let searchArr = WorldQuill.Map.helpers.allTilesAndWalls;
        if (includeFakeChunks)
            searchArr.push(...this._fakeChunks);

        const foundList = args.castRay(searchArr);
        if (foundList.length < 1) return;
        return foundList[0].object.chunk;
    }


    #unselectChunk() {
        if (this._currentlySelectedChunk) {
            this._currentlySelectedChunk.setOpacity(this._nonSelectedOpacity);
            this._currentlySelectedChunk.children
                .filter(child => child.thisIsAnOutline)
                .forEach(outln => {
                    this._currentlySelectedChunk.remove(outln);
                });
            this._currentlySelectedChunk = null;
        }
        WorldQuill.Map.children.forEach(c => c.setOpacity(this._nonSelectedOpacity));
        this.#UI_updateMenu(false);
    }
    #setSelectedChunk(chunk) {
        if (chunk.thisIsNotARealChunk) {
            // if this is not a real chunk, make a new chunk here
            WorldQuill.Map.addChunk({
                l: [chunk._location.x, chunk._location.y]
            });
            this.#unselectChunk();
            this.#moveChunkToNewPosition();
        } else {
            // if this is a real chunk, just select it
            this._currentlySelectedChunk = chunk;
            this._currentlyHoveringOverChunk = null;
            chunk.setOpacity(1);
            this.#createOutline(chunk, false);
            this.#UI_updateMenu(true);
        }
    }

    #moveChunkToNewPosition() {
        if (this._currentlyDraggingChunk) {
            this._currentlyDraggingChunk.move(this._newPositionChunkAfterDrag._location.x, this._newPositionChunkAfterDrag._location.y);
        }
        this.#hardResetEntireTool();
    }
    #hardResetEntireTool() {
        this.activate();
        this.activate();
        WorldQuill.Map.reRender(true);
        setTimeout(() =>  WorldQuill.Map.reRender(true), 100);
        setTimeout(() =>  this.activate(), 200);
    }

    #createOutline(chunk) {
        return;
        const outln = this.#generateFakeChunkMeshAt(0, tileRimHeight/2, 0, {
            type: 'LineSegments',
            color: 0x0000ff,
            isFakeChunk: chunk.thisIsNotARealChunk
        });
        outln.thisIsAnOutline = true;
        chunk.add(outln);
    }


    #makeFakeChunksAtNewPositions() {
        this.#getPositionsOfPossibleNewChunks().forEach(this.#generateFakeChunk.bind(this));
    }
    #getPositionsOfPossibleNewChunks() {
        // create lookup table of all chunks based on location
        const chunks = {};
        WorldQuill.Map.children.forEach(chunk => {
            chunks[chunk._locationStr] = true;
        });

        // loop over all chunks and generate list of possible new chunks
        const possibleNewChunks = [];
        const possibleNewChunksStrs = [];
        function addPossibleLocation(x, y) {
            if (!chunks[`${x},${y}`] && !possibleNewChunksStrs.includes(`${x},${y}`)) {
                possibleNewChunks.push(new THREE.Vector2(x, y));
                possibleNewChunksStrs.push(`${x},${y}`);
            }
        }
        WorldQuill.Map.children.forEach(chunk => {
            const x = chunk._location.x;
            const y = chunk._location.y;
            addPossibleLocation(x+1, y);
            addPossibleLocation(x, y+1);
            addPossibleLocation(x-1, y);
            addPossibleLocation(x, y-1);
        });
        return possibleNewChunks;
    }
    #generateFakeChunkMeshAt(x, y, z, options={}) {
        const absoluteW = tileWidth*chunkWidthInTiles;
        const type = options.type || 'Mesh';
        const plane = new THREE[type](
            new THREE.PlaneGeometry(absoluteW, absoluteW),
            new THREE.MeshBasicMaterial({ 
                color: options.color || 0x0000ff,
                side: THREE.DoubleSide
            })
        );

        if (!options.isFakeChunk)
            plane.rotation.x = Math.PI / 2;
        
        plane.position.set(
            x - (tileWidth / 2),
            y,
            z - (tileWidth / 2)
        );
        plane.thisIsNotARealChunk = true;
        return plane;
    }
    #generateFakeChunk(pos){
        let newFake = this.#generateFakeChunkMeshAt(
            pos.x * tileWidth * chunkWidthInTiles,
            0,
            pos.y * tileWidth * chunkWidthInTiles,
            {
                color: 0xb8bfb8
            }
        );
        newFake.setOpacity = (opacity) => {
            newFake.material.transparent = (opacity !== 1.0);
            newFake.material.opacity = (opacity !== 1.0) ? opacity/2 : opacity;
        };
        newFake.chunk = newFake;
        newFake._location = new THREE.Vector2(pos.x, pos.y);
        this._fakeChunks.push(newFake);
        
        WorldQuill.Map.add(newFake);
    }
    #removeFakeChunks() {
        this._fakeChunks.forEach(fake => WorldQuill.Map.remove(fake));
        this._fakeChunks = [];
    }


    
    // UI
    #setUiDetails() {
        WorldQuill.PanelManager.setDetails([
            {
                type: 'i',
                attrs: [
                    ['style', 'text-align: center'], ['id', 'chunkToolDefaultMessage']
                ],
                content: 'Select a chunk to begin'
            },
            {
                type: 'div',
                attrs: [
                    ['id', 'chunkToolOptions'], ['style', `display: none; flex-direction: column; align-items: stretch; gap: 0.5em;`],
                ],
                children: [
                    {
                        type: 'i',
                        attrs: [['style', 'text-align: center; margin-bottom: 1em;']],
                        content: 'Chunk Options:',
                    },
                    {
                        type: 'button',
                        attrs: [
                            ['style', ' font-size: 1em'],
                            ['onclick', this.btn_removeChunk.bind(this)],
                        ],
                        content: 'Remove'
                    },
                    {
                        type: 'button',
                        attrs: [
                            ['style', ' font-size: 1em'],
                            ['onclick', this.btn_duplicateChunk.bind(this)],
                        ],
                        content: 'Duplicate'
                    },
                    {
                        type: 'button',
                        attrs: [
                            ['style', ' font-size: 1em'],
                            ['onclick', this.btn_exportChunk.bind(this)],
                        ],
                        content: 'Save to my collection'
                    },
                    {
                        type: 'button',
                        attrs: [
                            ['style', ' font-size: 1em'],
                            ['onclick', this.btn_copyChunkToClipboard.bind(this)],
                        ],
                        content: 'Copy to clipboard'
                    },
                    {
                        type: 'button',
                        attrs: [
                            ['style', ' font-size: 1em'],
                            ['disabled', 'disabled']
                        ],
                        content: '(To move it, just drag it to a gray square)',
                    }
                ]
            }
        ]);
    }
    #UI_updateMenu(isAChunkSelected) {
        let chunkToolDefaultMessage = WorldQuill.PanelManager.SidebarDetailsEl.querySelector('#chunkToolDefaultMessage');
        let chunkToolOptions = WorldQuill.PanelManager.SidebarDetailsEl.querySelector('#chunkToolOptions');
        if (!chunkToolDefaultMessage || !chunkToolOptions) return;

        if (isAChunkSelected) {
            chunkToolDefaultMessage.style.display = 'none';
            chunkToolOptions.style.display = 'flex';
        } else {
            chunkToolDefaultMessage.style.display = 'block';
            chunkToolOptions.style.display = 'none';
        }
    }
    btn_removeChunk() {
        if (!confirm('Are you sure you want to remove this chunk?')) return;
        WorldQuill.Map.remove(this._currentlySelectedChunk);
        WorldQuill.Map.reRender(true);
        this.#hardResetEntireTool();
    }
    btn_duplicateChunk() {
        // TODO
        alert('Duplicate chunk not implemented yet.');
        console.log(
            JSON.stringify(this._currentlySelectedChunk.serialize()
        ));
        this._currentlyInDuplicateMode = true;
    }
    btn_copyChunkToClipboard() {
        let map = {
            children: [this._currentlySelectedChunk.serialize()],
        };
        navigator.clipboard.writeText(JSON.stringify(map))
            .then(function() {
                console.log('Chunk copied to clipboard');
            })
            .catch(function(err) {
                console.error('Error copying chunk to clipboard:', err);
            });
    }
    btn_exportChunk() {
        let map = {
            children: [this._currentlySelectedChunk.serialize()],
        };
        WorldQuill.onSaveToCollection(map);
    }
}