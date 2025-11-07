import ThreeJsWorld from './supers/ThreeJsWorld.js';
import InteractTool from './InteractTool.js';
import Map from './Map.js';

export class WorldQuill {
    static ThreeJsWorld;
    static tools = [];

    static Map;
    static init() {
        this.ThreeJsWorld = new ThreeJsWorld();

        this.tools.push(new InteractTool());
        this.setToolMode('interact');

        this.Map = new Map();
        this.Map.addChunk();
    }
    static setToolMode(mode) {
        this.ThreeJsWorld._raycaster.setMode(mode);
    }
}
window.WorldQuill = WorldQuill;