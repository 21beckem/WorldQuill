import * as THREE from './supers/three.module.min.js';
import Chunk from './Chunk.js';
import { WorldQuill } from './WorldQuill.js';
// import { Serializable } from './supers/Serializable.js';

export default class Map extends THREE.Group {
    static toSerialize = [
        'uuid',
        'children'
    ];
    helpers = {
        allTiles: Array(),
        allWalls: Array(),
        allEntities: Array(),
        allTilesAndWalls: Array(),
        update: this.#updateHelpers.bind(this)
    }
    constructor() {
        super();
        WorldQuill.ThreeJsWorld._scene.add(this);
        
        this.addChunk(0,0);
        this.addChunk(1,0);
        this.addChunk(0,1);
        this.addChunk(1,1);
    }
    checkifChunkExists(x, y) {
        return this.children.some(chunk => chunk._location.x == x && chunk._location.y == y);
    }
    #updateHelpers() {
        this.helpers.allTiles = this.children.flatMap(chunk => chunk.children);
        this.helpers.allWalls = this.children.flatMap(chunk => chunk.children.flatMap(tile => tile.children));
        this.helpers.allEntities = this.children.flatMap(chunk => chunk._entities);
        this.helpers.allTilesAndWalls = this.helpers.allTiles.concat(this.helpers.allWalls);
    }
    addChunk(x, y) {
        if (this.checkifChunkExists(x, y)) return alert('Chunk already exists');
        let newChunk = new Chunk(x, y);
        this.helpers.allTiles.push(...newChunk.children);
        this.add(newChunk);
    }
    reRender(forceAll=false) {
        if (forceAll)
            this.children.forEach(chunk => !chunk.thisIsNotARealChunk && chunk.reRender());
        else
            this.children.forEach(chunk => !chunk.thisIsNotARealChunk && chunk._needsReRender && chunk.reRender());
    }
}