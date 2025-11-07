import * as THREE from './supers/three.module.min.js';
import Tile from './Tile.js';
import { tileWidth, chunkWidthInTiles } from './constants.js';
// import { Serializable } from './supers/Serializable.js';

export default class Chunk extends THREE.Group {
    static toSerialize = [
        'uuid',
        'children',
        '_location',
        '_entities'
    ];
    _location = new THREE.Vector2();
    _entities = Array();
    constructor(x, y) {
        super();
        this._location.set(x, y);

        this.#initChildren();
    }
    #initChildren() {
        const halfWidth = chunkWidthInTiles / 2.0;
        for (let w = -halfWidth; w < halfWidth; w++) {
            for (let l = -halfWidth; l < halfWidth; l++) {
                
                console.log(w, l);
                let tile = new Tile(w*tileWidth, l*tileWidth);
                this.add(tile);
                
            }
            
        }
    }
}