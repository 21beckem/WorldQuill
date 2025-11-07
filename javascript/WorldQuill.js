import ThreeJsWorld from './supers/ThreeJsWorld.js';
import InteractTool from './InteractTool.js';
import PaintTool from './PaintTool.js';
import Map from './Map.js';

class Tools extends Array {
    constructor() {
        super(...arguments);
    }
    activate(mode) {
        this.filter(tool => tool.mode == mode).forEach(tool => tool.activate());
    }
}

export class WorldQuill {
    static ThreeJsWorld;
    static tools = new Tools();

    static Map;
    static init() {
        this.ThreeJsWorld = new ThreeJsWorld();

        this.tools.push(new InteractTool());
        this.tools.push(new PaintTool());

        this.Map = new Map();
        this.Map.addChunk(0,0);
    }
    static setToolMode(mode) {
        this.ThreeJsWorld._raycaster.setMode(mode);
    }
}
window.WorldQuill = WorldQuill;