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
        this.move(x, y);

        this.#initChildren();
    }
    #initChildren() {
        const halfWidth = chunkWidthInTiles / 2.0;
        for (let w = -halfWidth; w < halfWidth; w++) {
            for (let l = -halfWidth; l < halfWidth; l++) {

                let tile = new Tile(w, l, this);
                // tile.setHeight(l + w); // obviously change this later
                this.add(tile);
                
            }
        }
    }
    reRender() {
        this.children.forEach(tile => tile.makeWalls());
    }
    move(x, y) {
        this._location = [x, y];
        this.position.set(x*tileWidth*chunkWidthInTiles, 0, y*tileWidth*chunkWidthInTiles);
    }
    setOpacity(opacity) {
        this.children.forEach(tile =>{
            tile.material.transparent = (opacity !== 1.0);
            tile.material.opacity = opacity;
            if (tile.children.length > 0) {
                tile.children[0].material.transparent = (opacity !== 1.0);
                tile.children[0].material.opacity = opacity;
            }
        });
    }
}