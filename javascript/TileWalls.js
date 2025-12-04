import * as THREE from './assets/three.module.min.js';
import { tileWidth, tileRimHeight } from './constants.js';
import { WorldQuill } from './WorldQuill.js';

export default class TileWalls extends THREE.Mesh {
    constructor(parent, chunk, wallColor) {
        let geometry = WorldQuill.Map.tileWallRenderMethod == 'scale' ? BoxNoBottomOrTopGeometry(tileWidth, 1, tileWidth) : new THREE.BufferGeometry();
        super(
            geometry,
            new THREE.MeshStandardMaterial({
                color: wallColor,
            })
        );

        if (WorldQuill.Map.tileWallRenderMethod == 'scale')
            this.scale.set(1, 0, 1);

        
        this.parent = parent;
        this.chunk = chunk;
        
        this.#initMesh();

        WorldQuill.addEventListener('changedRenderMethod', () => {
            if (WorldQuill.Map.tileWallRenderMethod == 'scale') {
                this.scale.set(1, 0, 1);
                this.geometry = BoxNoBottomOrTopGeometry(tileWidth, 1, tileWidth);
            }
            else if (WorldQuill.Map.tileWallRenderMethod == 'generate') {
                this.scale.set(1, 1, 1);
                this.geometry = new THREE.BufferGeometry();
            }
        });
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
        if (WorldQuill.Map.tileWallRenderMethod == 'scale')
            this.scale.set(1, this.parent.position.y, 1);
        else if (WorldQuill.Map.tileWallRenderMethod == 'generate') {
            this.#renderPointForPoint();
        }
    }

    #renderPointForPoint() {
        let rawVerts = new Array();
        let rawUv = new Array();
        
        // find 4 corners for this tile
        let numHelperX = -(tileWidth / 2);
        let numHelperY = -(tileWidth / 2);
        const corners = [
            [ // topLeft
                numHelperX + tileWidth,
                numHelperY + tileWidth
            ],
            [ // topRight
                numHelperX,
                numHelperY + tileWidth
            ],
            [ // bottomLeft
                numHelperX + tileWidth,
                numHelperY
            ],
            [ // bottomRight
                numHelperX,
                numHelperY
            ]
        ];
        const addFace = (x1, y1, z1, x2, y2, z2, x3, y3, z3, x4, y4, z4) => {
            rawVerts.push(x1, y1, z1, x2, y2, z2, x4, y4, z4);
            rawVerts.push(x2, y2, z2, x3, y3, z3, x4, y4, z4);
            let repeatY = (y1 - y2) / tileWidth;
            rawUv.push(0, 0, repeatY, 0, 0, 1);
            rawUv.push(repeatY, 0, repeatY, 1, 0, 1);
        };

        let sides = [ [1,0, 0,2], [-1,0, 3,1], [0,1, 1,0], [0,-1, 2,3] ];
        for (let k = 0; k < sides.length; k++) {
            const side = sides[k];

            // if that tiles doesn't exist: continue
            let opponent = this.parent.getNeighbour(side[0], side[1]);
            // debugger;
            let opponentHeight;
            if (!opponent)
                opponentHeight = 0;
            else
                opponentHeight = opponent.position.y;
            
            // if their height is more than or equal to mine: continue
            if (opponent?._hasChangedHeight && opponentHeight >= this.parent.position.y) { continue; }

            let minH = 0;
            let oppH = opponentHeight - this.parent.position.y;
            addFace(
                corners[side[2]][0], minH, corners[side[2]][1],
                corners[side[2]][0], oppH, corners[side[2]][1],
                corners[side[3]][0], oppH, corners[side[3]][1],
                corners[side[3]][0], minH, corners[side[3]][1]
            );
        }
        if (rawVerts.length > 0) {
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.BufferAttribute( new Float32Array(rawVerts), 3 ));
            geometry.setAttribute('uv', new THREE.Float32BufferAttribute(rawUv, 2));
            // geometry.computeFaceNormals(); // not needed with simple color texture
            geometry.computeVertexNormals();
            this.geometry = geometry;
        }
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