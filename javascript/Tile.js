import * as THREE from './supers/three.module.min.js';
import { tileWidth, tileHeightStep, tileRimHeight, chunkWidthInTiles } from './constants.js';
import { WorldQuill } from './WorldQuill.js';

export default class Tile extends THREE.Mesh {
    constructor(locX, locY) {
        super(
            BoxNoBottomGeometry(tileWidth, tileRimHeight, tileWidth),
            new THREE.MeshStandardMaterial({
                color: 0x808080,
            })
        );
        WorldQuill.ThreeJsWorld._raycaster._flatListOfTiles.push(this);
        this.position.set(locX * tileWidth, 0, locY * tileWidth);
        this._locX = locX;
        this._locY = locY;
        this.setHeight(0);
    }
    #makeWalls() {
        if (this.position.y == 0)
            return;

        if (this.children.length > 0)
            this.children.forEach(c => this.remove(c));

        // for each of the 4 adjacent tiles
        let rawVerts = new Array();
        let rawUv = new Array();
        
        // find 4 corners for this tile
        let numHelperX = (this._locX * tileWidth) - (tileWidth / 2);
        let numHelperY = (this._locY * tileWidth) - (tileWidth / 2);
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
            let opponent = this.getNeighbour(side[0], side[1]);
            let opponentHeight;
            if (!opponent)
                opponentHeight = 0;
            else
                opponentHeight = opponent.position.y;
            
            // if their height is more than or equal to mine: continue
            if (opponentHeight >= this.position.y) { continue; }

            let minH = this.position.y - (tileRimHeight / 2);
            let oppH = opponentHeight - (tileRimHeight / 2);
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
            geometry.computeFaceNormals();
            geometry.computeVertexNormals();
            let walls = new THREE.Mesh(
                geometry,
                new THREE.MeshStandardMaterial({
                    color: 0x808080,
                })
            );
            walls.material.side = THREE.DoubleSide;
            // walls.userData.motherTile = littleSquare;
            walls.castShadow = true;
            walls.receiveShadow = true;
            walls.userData.wall = true;
            this.parent.add(walls);
            // this._groundANDwallTiles1D.push(walls);
            // littleSquare.userData.wallMesh = walls;
        }
    }
    getNeighbour(offsetX, offsetY) {
        let x = this._locX + offsetX;
        let y = this._locY + offsetY;
        let halfWidth = chunkWidthInTiles / 2;
        console.log('halfWidth', halfWidth);
        

        if (x < -halfWidth || x >= halfWidth || y < -halfWidth || y >= halfWidth)
            return console.log('Tile out of bounds of this chunk', x, y);
        
        let found = this.parent.children.find(t => t._locX == x && t._locY == y);
        console.log('found Neighbour', x, y, found);
        return found;
    }
    addHeight(height) {
        this.position.y += height * tileHeightStep;
        this.#makeWalls();
    }
    setHeight(height) {
        this.position.y = height * tileHeightStep;
        this.#makeWalls();
    }
}

function BoxNoBottomGeometry(ww, hh, dd) {
    const geometry = new THREE.BufferGeometry();
    let w = ww / 2;
    let h = hh / 2;
    let d = dd / 2;
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