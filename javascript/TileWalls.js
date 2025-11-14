import * as THREE from './assets/three.module.min.js';
import { tileWidth } from './constants.js';

export default class TileWalls extends THREE.Mesh {
    constructor(parent, chunk, wallColor) {
        super(
            BoxNoBottomOrTopGeometry(tileWidth, 1, tileWidth),
            new THREE.MeshStandardMaterial({
                color: wallColor,
            })
        );
        this.scale.set(1, 0, 1);

        this.parent = parent;
        this.chunk = chunk;

        this.#initMesh();
    }
    #initMesh() {
        this.castShadow = true;
        this.receiveShadow = true;
        this.userData.wall = true;
    }
    setColor(color) {
        this.material.color =  new THREE.Color(color);
    }

    render() {
        this.scale.set(1, this.parent.position.y, 1);
    }
}


function BoxNoBottomOrTopGeometry(ww, hh, dd) {
    const geometry = new THREE.BufferGeometry();
    let w = ww / 2;
    let d = dd / 2;
    const vertices = new Float32Array([
        // Front face
        -w, 0, d,  -w,-hh, d,   w,-hh, d,
        -w, 0, d,   w,-hh, d,   w, 0, d,
        // Back face
        w, 0,-d,   w,-hh,-d,  -w,-hh,-d,
        w, 0,-d,  -w,-hh,-d,  -w, 0,-d,
        // Right face
        -w, 0,-d,  -w,-hh,-d,  -w,-hh, d,
        -w, 0,-d,  -w,-hh, d,  -w, 0, d,
        // Left face
        w, 0, d,   w,-hh, d,   w,-hh,-d,
        w, 0, d,   w,-hh,-d,   w, 0,-d,
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