import * as THREE from './assets/three.module.min.js';
import Tile from './Tile.js';
import { tileWidth, chunkWidthInTiles } from './constants.js';
import Map from './Map.js';

export default class Chunk extends THREE.Group {
    serialize() {
        return {
            c: this.children.map(tile => tile.serialize()),
            l: [this._location.x, this._location.y],
            e: [] // entities
        };
    }

    _location = new THREE.Vector2();
    _entities = Array();
    _needsReRender = false;
    constructor(data) {
        super();
        this.move(data.l[0], data.l[1]);

        this.#initChildren(data.c);
    }
    #initChildren(childData) {
        if (!childData)
            childData = Map.makeDefaultTilesData();
        const halfWidth = chunkWidthInTiles / 2.0;
        let dataI = 0;
        for (let w = -halfWidth; w < halfWidth; w++) {
            for (let l = -halfWidth; l < halfWidth; l++) {

                let tile = new Tile(w, l, this, childData[dataI++]);
                this.add(tile);
                
            }
        }
    }
    reRender() {
        this.children.forEach(tile => {
            tile.render();
            tile.assignAbsoluteLocation();
        });
    }
    move(x, y) {
        if (this.parent?.checkifChunkExists(x, y)) return alert('Invalid movement. Chunk already exists in that location.');
        this._location = new THREE.Vector2(x, y);
        this._locationStr = `${x},${y}`;
        this.position.set(x*tileWidth*chunkWidthInTiles, 0, y*tileWidth*chunkWidthInTiles);
    }
    rotateRight() {
        this.rotateLeft();
        this.rotateLeft();
        this.rotateLeft();
    }
    rotateLeft() {
        let oldArr = this.serialize().c;
        let newArr = [];
        let total = chunkWidthInTiles*chunkWidthInTiles;
        let firstI = (chunkWidthInTiles*(chunkWidthInTiles-1)) + 1;

        for (let i = firstI; i <= total; i++) {
            for (let j = i; j > 0; j-=chunkWidthInTiles) {
                newArr.push( oldArr[j-1] );
            }
        }

        this.children.forEach(tile => this.remove(tile));
        this.children = [];
        this.#initChildren(newArr);
        this._needsReRender = true;
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