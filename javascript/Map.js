import * as THREE from './supers/three.module.min.js';
import Chunk from './Chunk.js';
// import { Serializable } from './supers/Serializable.js';

export default class Map extends THREE.Group {
    static toSerialize = [
        'uuid',
        'children'
    ];
    constructor() {
        super();
        WorldQuill.ThreeJsWorld._scene.add(this);
        
        this.addChunk(0,0);
        this.addChunk(1,0);
        this.addChunk(0,1);
        this.addChunk(1,1);
    }
    #checkifChunkExists(x, y) {
        return this.children.some(chunk => chunk._location[0] == x && chunk._location[1] == y);
    }
    addChunk(x, y) {
        if (this.#checkifChunkExists(x, y)) return alert('Chunk already exists');
        this.add(new Chunk(x, y));
    }
}