import Tool from '../supers/Tool.js';
import { WorldQuill } from '../WorldQuill.js';
import { getAbsolutePath } from '../constants.js';
import * as THREE from '../assets/three.module.min.js';
import { tileWidth, chunkWidthInTiles } from '../constants.js';
import Cursor from '../assets/Cursor.js';

export default class ImportTool extends Tool {
    chunkJson = null;
    constructor() {
        super('import', 'p');
        this.name = 'Import Chunk(s)';
        this.label = 'Import';
        this.icon = 'fa-solid fa-upload';
        this.description = `Take other creations for yourself or others and add them to your world! Begin by find a design <a href="/browse/" target="_blank">here</a>, or by copying an existing chunk in this world using the Chunk Manager tool.`;
    }
    onActivate(args) {
        this.#setUiDetails();

        this.#loadRequestedMap();
        this._fakeChunks = [];
        this._currentlyHoveringOverChunk = null;
        this._nonSelectedOpacity = 0.7;
    }
    onDeactivate() {
        this.#removeFakeChunks();
    }
    onDown(args) {
    }
    onMove(args) {
    }
    onHoverMove(args) {
        Cursor.reset();

        // if currently hovering over a chunk, reset opacity
        this._currentlyHoveringOverChunk?.setOpacity(this._nonSelectedOpacity);

        // get this chunk if we're hovering over it
        const chunk = this.#getRaycastedChunk(args);
        if (!chunk) return this._currentlyHoveringOverChunk = null;

        // highlight this chunk
        this._currentlyHoveringOverChunk = chunk;
        if (chunk.thisIsNotARealChunk)
            Cursor.set(Cursor.copy);
        else
            Cursor.set(Cursor.pointer);
        chunk.setOpacity(1);
    }
    onUp(args) {
    }
    onClick(args) {
        if (!this._currentlyHoveringOverChunk) return;
        console.log(this._currentlyHoveringOverChunk);
        this.chunkJson.l = this._currentlyHoveringOverChunk._location.toArray();
        WorldQuill.Map.addChunk(this.chunkJson);
        this.#removeFakeChunks();
        this.#makeFakeChunksAtNewPositions();
    }



    #getRaycastedChunk(args) {
        const foundList = args.castRay(this._fakeChunks);
        if (foundList.length < 1) return;
        return foundList[0].object.chunk;
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
        newFake.setOpacity(this._nonSelectedOpacity);
        this._fakeChunks.push(newFake);
        
        WorldQuill.Map.add(newFake);
    }
    #removeFakeChunks() {
        this._fakeChunks.forEach(fake => WorldQuill.Map.remove(fake));
        this._fakeChunks = [];
    }



    #loadRequestedMap() {
        let key = 'thisIsTheChunkToolFromWorldQuill.CouldYouPleasePasteThisJson';
        if (sessionStorage.getItem(key)){
            this.#parseClipboard(sessionStorage.getItem(key));
            sessionStorage.removeItem(key);
        } else if (this.chunkJson) {
            this.#loadMapPreview();
        }
    }
    #loadMapPreview() {
        let chunkPreviewContainer = WorldQuill.PanelManager.SidebarDetailsEl.querySelector('#chunkPreviewContainer');
        if (!chunkPreviewContainer) return;

        let mapJsonStr = encodeURIComponent(JSON.stringify({
            children: [this.chunkJson],
        }));

        chunkPreviewContainer.querySelector('iframe').src = `${getAbsolutePath('preview.html')}?timestamp=${Date.now()}#${mapJsonStr}`;

        chunkPreviewContainer.style.display = 'flex';
    }



    async #parseClipboard(clipText) {
        // attempt to parse as JSON
        let parsedJson;
        try {
            parsedJson = JSON.parse(clipText);
        } catch(err) {
            alert('Uh oh. Looks like that wasn\'t a valid WorldQuill object. Please re-copy it and try again.');
        }
        if (!parsedJson) return console.error('clipText could not be parsed as JSON', clipText);


        // validate JSON
        let valid = (()=>{
            if (!parsedJson.children) return false;
            if (parsedJson.children.length == 0) return false;
            if (!parsedJson.children.every(c => {
                c.l && Array.isArray(c.l) && c.l.length == 2 &&
                c.c && Array.isArray(c.c) && c.c.length == chunkWidthInTiles*chunkWidthInTiles &&
                c.e && Array.isArray(c.e)
            })) return false;
            return true;
        });
        if (!valid) return alert('Oh no! It looks like something may be wrong with the WorldQuill object you pasted. Please re-copy it and try again.');

        this.chunkJson = parsedJson.children[0];
        this.#loadMapPreview();        
    }

    
    // UI
    #setUiDetails() {
        WorldQuill.PanelManager.setDetails([
            {
                type: 'button',
                attrs: [
                    ['style', ' font-size: 1em; flex: 1; margin-bottom: 1em;'],
                    ['onclick', this.btn_pasteFromClipboard.bind(this)]
                ],
                content: 'Paste from Clipboard <i class="fa-regular fa-clipboard"></i>'
            },
            {
                type: 'div',
                attrs: [
                    ['id', 'chunkPreviewContainer'], ['style', `display: none; flex-direction: column; align-items: stretch; gap: 0.5em;`],
                ],
                children: [
                    {
                        type: 'i',
                        attrs: [['style', 'text-align: center; margin-bottom: 0.5em;']],
                        content: 'Preview:',
                    },
                    {
                        type: 'iframe',
                        attrs: [
                            ['src', ''],
                            ['style', 'aspect-ratio: 1; width: 100%; border-radius: 10px; border: 4px solid #d4cfa8; box-sizing: border-box;'],
                        ],
                        content: 'Remove'
                    },
                    {
                        type: 'button',
                        attrs: [
                            ['style', ' font-size: 1em'],
                            ['onclick', this.btn_placeMap.bind(this)]
                        ],
                        content: 'Place'
                    }
                ]
            }
        ]);
    }
    async btn_pasteFromClipboard() {
        // attempt to get clipboard text
        let clipText;
        try {
            clipText = await navigator.clipboard.readText();
        } catch(err) {
            alert('It looks like you didn\'t give permission for reading your clipboard. Please click on the lock at far left of the address bar, then allow clipboard permissions.');
        }
        if (!clipText) return console.error('clipboard access not given');

        this.#parseClipboard(clipText);
    }
    btn_placeMap() {
        this.#makeFakeChunksAtNewPositions();
    }
}