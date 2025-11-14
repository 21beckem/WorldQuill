import * as THREE from './assets/three.module.min.js';
import { tileWidth, tileHeightStep, tileRimHeight, chunkWidthInTiles } from './constants.js';
import { WorldQuill } from './WorldQuill.js';
import TileWalls from './TileWalls.js';

export default class Tile extends THREE.Mesh {
    constructor(locX, locY, parent) {
        super(
            BoxNoBottomGeometry(tileWidth, tileRimHeight, tileWidth),
            new THREE.MeshStandardMaterial({
                color: 0x069937,
            })
        );
        this.parent = parent;
        this.chunk = parent;
        this.wallColor = new THREE.Color(0x57360b);
        WorldQuill.ThreeJsWorld._raycaster._flatListOfTiles.push(this);
        this.position.set(locX * tileWidth, 0, locY * tileWidth);
        this._localLoc = new THREE.Vector2(locX, locY);
        this.assignAbsoluteLocation();
        this.setHeight(0);

        this.add(new TileWalls(this, this.parent, this.wallColor));
    }
    assignAbsoluteLocation() {
        this._absoluteLoc = new THREE.Vector2(
            this._localLoc.x + (chunkWidthInTiles * this.parent._location.x),
            this._localLoc.y + (chunkWidthInTiles * this.parent._location.y)
        );
    }
    render() {
        this.children[0]?.render();
    }
    setColor(color) {
        this.material.color = new THREE.Color(color);
    }
    getNeighbour(offsetX, offsetY) {
        let x = this._absoluteLoc.x + offsetX;
        let y = this._absoluteLoc.y + offsetY;

        if (!WorldQuill.Map) return; // everything is still initializing
        let found = WorldQuill.Map.helpers.allTiles.find(t => t._absoluteLoc.x == x && t._absoluteLoc.y == y);
        // console.log('found Neighbour', x, y, found);
        return found;
    }
    get height() {
        return this.position.y / tileHeightStep;
    }
    modifyHeight() {
        arguments[0] = (this.position.y + (arguments[0] * tileHeightStep)) / tileHeightStep;
        this.setHeight(...arguments);
    }
    setHeight(height, updateChunk=true) {
        let currentHeight = this.position.y;
        this.position.y = Math.max(height * tileHeightStep, 0);

        if (currentHeight == this.position.y) return; // no change

        if (updateChunk)
            this.parent.reRender();
        else {
            this.parent._needsReRender = true;
        }
    }
}

function BoxNoBottomGeometry(ww, hh, dd) {
    const geometry = new THREE.BufferGeometry();
    let w = ww / 2;
    let d = dd / 2;
    const vertices = new Float32Array([
        // Front face
        -w,hh, d,  -w, 0, d,   w, 0, d,
        -w,hh, d,   w, 0, d,   w,hh, d,
        // Back face
        w,hh,-d,   w, 0,-d,  -w, 0,-d,
        w,hh,-d,  -w, 0,-d,  -w,hh,-d,
        // Top face
        -w,hh,-d,  -w,hh, d,   w,hh, d,
        -w,hh,-d,   w,hh, d,   w,hh,-d,
        // Right face
        -w,hh,-d,  -w, 0,-d,  -w, 0, d,
        -w,hh,-d,  -w, 0, d,  -w,hh, d,
        // Left face
        w,hh, d,   w, 0, d,   w, 0,-d,
        w,hh, d,   w, 0,-d,   w,hh,-d,
    ]);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();
    const Y = 1 - (hh / ww);
    const uv = new Float32Array([
        // Front face
        Y, 0,  1, 0,  1, 1,	
        Y, 0,  1, 1,  Y, 1,
        // Back face
        Y, 0,  1, 0,  1, 1,	
        Y, 0,  1, 1,  Y, 1,
        // Top face
        0, 0, 1, 0, 1, 1,
        0, 0, 1, 1, 0, 1,
        // Right face
        Y, 0,  1, 0,  1, 1,	
        Y, 0,  1, 1,  Y, 1,
        // Left face
        Y, 0,  1, 0,  1, 1,	
        Y, 0,  1, 1,  Y, 1,
    ]);
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));

    return geometry;
}