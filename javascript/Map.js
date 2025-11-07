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
    }
    addChunk() {
        this.add(new Chunk());
    }
}