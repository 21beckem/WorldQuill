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
        WorldQuill.Map.children.forEach(chunk => chunk.setOpacity(this._nonSelectedOpacity));
    }
    onDeactivate() {
        this.#unselectChunk();
        WorldQuill.Map.children.forEach(chunk => chunk.setOpacity(1));
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
        const absoluteW = tileWidth*chunkWidthInTiles;

        // Create the line segments object
        const outln = new THREE.LineSegments(
            new THREE.EdgesGeometry(
                new THREE.PlaneGeometry( absoluteW, absoluteW, 1, 1 )
            ),
            new THREE.LineBasicMaterial( { color: 0x0000ff } )
        );
        outln.rotation.x = Math.PI / 2;
        outln.renderOrder = 1;
        outln.material.linewidth = 20;
        outln.position.set(
            outln.position.x - (tileWidth / 2),
            tileRimHeight / 2,
            outln.position.z - (tileWidth / 2)
        );
        console.log(outln);
        
        outln.thisIsAnOutline = true;
        chunk.add(outln);
    }
}