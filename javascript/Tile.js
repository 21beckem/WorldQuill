import * as THREE from './supers/three.module.min.js';
import { tileWidth, tileRimHeight } from './constants.js';

export default class Tile extends THREE.Mesh {
    constructor(posX, posY) {
        super(
            BoxNoBottomGeometry(tileWidth, tileRimHeight, tileWidth),
            new THREE.MeshStandardMaterial({
                color: 0x808080,
            })
        );
        this.position.set(posX, 0, posY);
        // console.log(posX, posY);
        
    }
}

function BoxNoBottomGeometry(ww, hh, dd) {
    const geometry = new THREE.BufferGeometry();
    let w = ww / 2;
    let h = hh / 2;  // ┘ , ┐ , ┌  <-old            ┌ , └ , ┘
    let d = dd / 2; // ┘ , ┌ , └  <-old            ┌ , ┘ , ┐
    const vertices = new Float32Array([
        // Front face
        -w, h, d,  -w,-h, d,   w,-h, d,
        -w, h, d,   w,-h, d,   w, h, d,
        // Back face
            w, h,-d,   w,-h,-d,  -w,-h,-d,
            w, h,-d,  -w,-h,-d,  -w, h,-d,
        // Top face
        -w, h,-d,  -w, h, d,   w, h, d,
        -w, h,-d,   w, h, d,   w, h,-d,
        // Right face
        -w, h,-d,  -w,-h,-d,  -w,-h, d,
        -w, h,-d,  -w,-h, d,  -w, h, d,
        // Left face
            w, h, d,   w,-h, d,   w,-h,-d,
            w, h, d,   w,-h,-d,   w, h,-d,
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