import Tool from '../supers/Tool.js';
import { WorldQuill } from '../WorldQuill.js';

export default class ChunkTool extends Tool {
    _nonSelectedOpacity = 0.5;
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
            this._currentlySelectedChunk = null;
        }
    }
    #setSelectedChunk(chunk) {
        this._currentlySelectedChunk = chunk;
        this._currentlyHoveringOverChunk = null;
        this._currentlySelectedChunk.setOpacity(1);
    }
}