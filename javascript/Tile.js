import * as THREE from './assets/three.module.min.js';
import { tileWidth, tileHeightStep, tileRimHeight, chunkWidthInTiles } from './constants.js';
import { WorldQuill } from './WorldQuill.js';

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
    }
    assignAbsoluteLocation() {
        this._absoluteLoc = new THREE.Vector2(
            this._localLoc.x + (chunkWidthInTiles * this.parent._location.x),
            this._localLoc.y + (chunkWidthInTiles * this.parent._location.y)
        );
    }
    makeWalls() {
        if (this.position.y == 0)
            return;

        if (this.children.length > 0)
            this.children.forEach(c => this.remove(c));

        // for each of the 4 adjacent tiles
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
            let opponent = this.getNeighbour(side[0], side[1]);
            let opponentHeight;
            if (!opponent)
                opponentHeight = 0;
            else
                opponentHeight = opponent.position.y;
            
            // if their height is more than or equal to mine: continue
            if (opponentHeight >= this.position.y) { continue; }

            let minH = -(tileRimHeight / 2);
            let oppH = opponentHeight - (tileRimHeight / 2) - this.position.y;
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
                    color: new THREE.Color(this.wallColor),
                })
            );
            // walls.material.side = THREE.DoubleSide;
            walls.setColor = (color) => {
                this.wallColor = new THREE.Color(color);
                walls.material.color = this.wallColor;
            }
            walls.castShadow = true;
            walls.receiveShadow = true;
            walls.userData.wall = true;
            walls.chunk = this.parent;
            this.add(walls);
        }
    }
    setColor(color) {
        this.material.color = new THREE.Color(color);
    }
    getNeighbour(offsetX, offsetY) {
        let x = this._absoluteLoc.x + offsetX;
        let y = this._absoluteLoc.y + offsetY;

        let found = WorldQuill.Map.helpers.allTiles.find(t => t._absoluteLoc.x == x && t._absoluteLoc.y == y);
        // console.log('found Neighbour', x, y, found);
        return found;
    }
    modifyHeight() {
        arguments[0] = (this.position.y + (arguments[0] * tileHeightStep)) / tileHeightStep;
        this.setHeight(...arguments);
    }
    setHeight(height, updateChunk=true) {
        this.position.y = height * tileHeightStep;
        if (updateChunk)
            this.parent.reRender();
        else
            this.parent._needsReRender = true;
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