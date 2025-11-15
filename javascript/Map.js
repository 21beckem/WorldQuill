import * as THREE from './assets/three.module.min.js';
import Chunk from './Chunk.js';
import { chunkWidthInTiles } from './constants.js';
import { WorldQuill } from './WorldQuill.js';
// import { Serializable } from './supers/Serializable.js';

export default class Map extends THREE.Group {
    serialize() {
        return {
            children: this.children.map(chunk => chunk.serialize()),
        }
    }

    static toSerialize = [
        'uuid',
        'children'
    ];
    helpers = {
        allTiles: Array(),
        allWalls: Array(),
        allEntities: Array(),
        allTilesAndWalls: Array(),
        update: this.#updateHelpers.bind(this)
    }
    constructor(data=null) {
        super();

        if (!data)
            data = Map.makeDefaultMapData();

        if (data.uuid)
            this.uuid = data.uuid;

        WorldQuill.ThreeJsWorld._scene.add(this);

        data.children.forEach(chunkData =>
            this.addChunk(chunkData)
        );
    }
    checkifChunkExists(x, y) {
        return this.realChunks.some(chunk => chunk._location.x == x && chunk._location.y == y);
    }
    #updateHelpers() {
        this.helpers.allTiles = this.children.flatMap(chunk => chunk.children);
        this.helpers.allWalls = this.children.flatMap(chunk => chunk.children.flatMap(tile => tile.children));
        this.helpers.allEntities = this.children.flatMap(chunk => chunk._entities);
        this.helpers.allTilesAndWalls = this.helpers.allTiles.concat(this.helpers.allWalls);
    }
    addChunk(chunkData) {
        if (this.checkifChunkExists(chunkData.l[0], chunkData.l[1])) return alert('Chunk already exists');
        let newChunk = new Chunk(chunkData);
        this.helpers.allTiles.push(...newChunk.children);
        this.add(newChunk);
        newChunk.reRender(true);
        return newChunk;
    }
    reRender(forceAll=false) {
        if (forceAll)
            this.realChunks.forEach(chunk => chunk.reRender());
        else
            this.realChunks.forEach(chunk => chunk._needsReRender && chunk.reRender());
    }

    get realChunks() {
        return this.children.filter(chunk => !chunk.thisIsNotARealChunk);
    }





    static makeDefaultMapData() {
        return {
            children: [
                Map.makeDefaultChunkData(0,0),
                Map.makeDefaultChunkData(1,0),
                Map.makeDefaultChunkData(0,1),
                Map.makeDefaultChunkData(1,1)
            ]
        }
    }
    static makeDefaultChunkData(x, y) {
        return {
            l: [x,y],
            c: Map.makeDefaultTilesData()
        }
    }
    static makeDefaultTilesData() {
        return new Array(chunkWidthInTiles*chunkWidthInTiles).fill({
            c: '#069937',
            w: '#57360b',
            h: 0
        });
    }
}