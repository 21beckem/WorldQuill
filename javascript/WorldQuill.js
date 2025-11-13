import ThreeJsWorld from './supers/ThreeJsWorld.js';
import PanelManager from './supers/PanelManager.js';
import Map from './Map.js';

import InteractTool from './tools/InteractTool.js';
import PaintTool from './tools/PaintTool.js';
import TerrainBrushTool from './tools/TerrainBrushTool.js';
import ChunkTool from './tools/ChunkTool.js';

class Tools extends Array {
    constructor() {
        super(...arguments);
    }
    activate(mode) {
        this.filter(tool => tool.mode == mode).forEach(tool => tool.activate());
    }
}

export class WorldQuill {
    static tools = new Tools();
    static Map;

    static init(containerSelector='body') {
        this.ThreeJsWorld = new ThreeJsWorld(containerSelector);
        this.PanelManager = new PanelManager(containerSelector);

        this.tools.push(new InteractTool());
        this.tools.push(new PaintTool());
        this.tools.push(new TerrainBrushTool());
        this.tools.push(new ChunkTool());

        this.Map = new Map();
    }
    static setToolMode(mode) {
        this.ThreeJsWorld._raycaster.setMode(mode);
    }
}
window.WorldQuill = WorldQuill;