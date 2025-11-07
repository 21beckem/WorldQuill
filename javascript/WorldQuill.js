import ThreeJsWorld from './supers/ThreeJsWorld.js';
import InteractTool from './InteractTool.js';

export class WorldQuill {
    static ThreeJsWorld;
    static tools = [];

    static map;
    static init() {
        this.ThreeJsWorld = new ThreeJsWorld();

        this.tools.push(new InteractTool());

        this.setToolMode('interact');
    }
    static setToolMode(mode) {
        this.ThreeJsWorld._raycaster.setMode(mode);
    }
}
window.WorldQuill = WorldQuill;