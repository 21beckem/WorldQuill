import Tool from '../supers/Tool.js';
import * as THREE from '../supers/three.module.min.js';
import { WorldQuill } from '../WorldQuill.js';
import { tileWidth, chunkWidthInTiles, tileRimHeight } from '../constants.js';

export default class ChunkTool extends Tool {
    _nonSelectedOpacity = 0.7;
    _currentlyHoveringOverChunk = null;
    _currentlySelectedChunk = null;
    
    _listOfTilesANDwalls = [];
    constructor() {
        super('chunk', 'c');
    }
    onActivate(args) {
        this.#unselectChunk();
        this.#updateListOfTilesAndWalls(args.tileList);
        WorldQuill.Map.children.forEach(chunk => chunk.setOpacity(this._nonSelectedOpacity));
    }
    onDeactivate() {
        this.#unselectChunk();
        WorldQuill.Map.children.forEach(chunk => chunk.setOpacity(1));
    }
    onDown(args) {
        // console.log('Interact down:', args);
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
        const foundList = args.castRay(this._listOfTilesANDwalls);
        if (foundList.length < 1) return;
        const chunk = foundList[0].object.chunk;

        // highlight this chunk
        this._currentlyHoveringOverChunk = chunk;
        chunk.setOpacity(1);
    }
    onUp(args) {
        // console.log('Interact up:', args);
    }
    onClick(args) {
        this.#unselectChunk();
        if (this._currentlyHoveringOverChunk) {
            this.#setSelectedChunk(this._currentlyHoveringOverChunk);
        }
    }



    #updateListOfTilesAndWalls(tileList) {
        this._listOfTilesANDwalls = [];
        tileList.forEach(tile => {
            this._listOfTilesANDwalls.push(tile);
            this._listOfTilesANDwalls.push(...tile.children);
        });
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