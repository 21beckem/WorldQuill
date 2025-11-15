import ThreeJsWorld from './supers/ThreeJsWorld.js';
import PanelManager from './supers/PanelManager.js';
import Map from './Map.js';

import InteractTool from './tools/InteractTool.js';
import PaintTool from './tools/PaintTool.js';
import TerrainBrushTool from './tools/TerrainBrushTool.js';
import ChunkTool from './tools/ChunkTool.js';
import SaveButton from './controlButtons/SaveButton.js';

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

    static init(containerSelector='body', worldData=null) {
        this.ThreeJsWorld = new ThreeJsWorld(containerSelector);
        this.PanelManager = new PanelManager(containerSelector);

        this.PanelManager.addTool(new InteractTool());
        this.PanelManager.addTool(new PaintTool());
        this.PanelManager.addTool(new TerrainBrushTool());
        this.PanelManager.addTool(new ChunkTool());

        this.PanelManager.addControlButton(new SaveButton());

        this.Map = new Map(worldData);
    }
    static onSave(worldData) {
        console.log('worldData', worldData);
        alert('ERROR: WorldQuill.onSave function not implemented yet.\nworldData has been printed in console.');
    }
}
window.WorldQuill = WorldQuill;