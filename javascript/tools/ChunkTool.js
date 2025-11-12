import Tool from '../supers/Tool.js';
import * as THREE from '../supers/three.module.min.js';
import { WorldQuill } from '../WorldQuill.js';
import { tileWidth, chunkWidthInTiles, tileRimHeight } from '../constants.js';

export default class ChunkTool extends Tool {
    _nonSelectedOpacity = 0.7;
    _currentlyHoveringOverChunk = null;
    _currentlySelectedChunk = null;
    
    constructor() {
        super('chunk', 'c');
    }
    onActivate(args) {
        this.#unselectChunk();
        WorldQuill.Map.children.forEach(c => c.setOpacity(this._nonSelectedOpacity));
        this.#makeFakeChunksAtNewPositions();
    }
    onDeactivate() {
        this.#unselectChunk();

        // remove all fake chunks
        WorldQuill.Map.children.filter(c => c.thisIsNotARealChunk).forEach(c => WorldQuill.Map.remove(c));

        // reset opacity
        WorldQuill.Map.children.forEach(c => c.setOpacity(1));
    }
    onDown(args) {
        // if no selected chunk, do nothing
        if (!this._currentlySelectedChunk) return;

        // get the chunk I'm pointing at
        const chunk = this.#getRaycastedChunk(args);
        
        // if I'm pointing at the selected chunk...
        if (!chunk || chunk.id !== this._currentlySelectedChunk.id) return;

        // starting to drag selected chunk
        WorldQuill.ThreeJsWorld._controls.enabled = false;
        console.log('starting to drag selected chunk!');
    }
    onMove(args) {
        // console.log('Interact move:', args);
    }
    onHoverMove(args) {
        // if currently selected a chunk, do nothing
        if (this._currentlySelectedChunk) return;

        // if currently hovering over a chunk, reset opacity
        this._currentlyHoveringOverChunk?.setOpacity(this._nonSelectedOpacity);

        // get this chunk if we're hovering over it
        const chunk = this.#getRaycastedChunk(args);
        if (!chunk) return;
        // highlight this chunk
        this._currentlyHoveringOverChunk = chunk;
        chunk.setOpacity(1);
    }
    onUp(args) {
        WorldQuill.ThreeJsWorld._controls.enabled = true;
    }
    onClick(args) {
        this.#unselectChunk();
        if (this._currentlyHoveringOverChunk) {
            this.#setSelectedChunk(this._currentlyHoveringOverChunk);
        }
    }
    #getRaycastedChunk(args) {
        const foundList = args.castRay(WorldQuill.Map.helpers.allTilesAndWalls);
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
    }
    #setSelectedChunk(chunk) {
        this._currentlySelectedChunk = chunk;
        this._currentlyHoveringOverChunk = null;
        chunk.setOpacity(1);
        this.#createOutline(chunk, false);
    }

    #createOutline(chunk) {
        const outln = this.#generateFakeChunkAt(0, tileRimHeight/2, 0, {
            type: 'LineSegments',
            color: 0x0000ff
        });
        outln.thisIsAnOutline = true;
        chunk.add(outln);
    }


    #makeFakeChunksAtNewPositions() {
        this.#getPositionsOfPossibleNewChunks().forEach(pos => {
            let newFake = this.#generateFakeChunkAt(
                pos.x * tileWidth * chunkWidthInTiles,
                0,
                pos.y * tileWidth * chunkWidthInTiles,
                {
                    color: 0xd4d4d4
                }
            );
            console.log(newFake);
            
            WorldQuill.Map.add(newFake);
        });
    }
    #getPositionsOfPossibleNewChunks() {
        // create lookup table of all chunks based on location
        const chunks = {};
        WorldQuill.Map.children.forEach(chunk => {
            chunks[chunk._locationStr] = true;
        });

        // loop over all chunks and generate list of possible new chunks
        const possibleNewChunks = [];
        WorldQuill.Map.children.forEach(chunk => {
            const x = chunk._location.x;
            const y = chunk._location.y;
            if (!chunks[`${x+1},${y}`]) possibleNewChunks.push(new THREE.Vector2(x+1, y));
            if (!chunks[`${x},${y+1}`]) possibleNewChunks.push(new THREE.Vector2(x, y+1));
            if (!chunks[`${x-1},${y}`]) possibleNewChunks.push(new THREE.Vector2(x-1, y));
            if (!chunks[`${x},${y-1}`]) possibleNewChunks.push(new THREE.Vector2(x, y-1));
        });
        return possibleNewChunks;
    }
    #generateFakeChunkAt(x, y, z, options={}) {
        const absoluteW = tileWidth*chunkWidthInTiles;
        const type = options.type || 'Mesh';
        const plane = new THREE[type](
            new THREE.PlaneGeometry(absoluteW, absoluteW),
            new THREE.MeshBasicMaterial({ 
                color: options.color || 0x0000ff,
                side: THREE.DoubleSide
            })
        );
        plane.rotation.x = Math.PI / 2;
        plane.position.set(
            x - (tileWidth / 2),
            y,
            z - (tileWidth / 2)
        );
        plane.thisIsNotARealChunk = true;
        return plane;
    }
}