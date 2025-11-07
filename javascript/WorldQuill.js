import ThreeJsWorld from './supers/ThreeJsWorld.js';
import Raycaster from './Raycaster.js';
import InteractTool from './InteractTool.js';

export class WorldQuill {
    static ThreeJsWorld;
    static Raycaster;
    static tools = [];

    static map;
    static init() {
        this.ThreeJsWorld = new ThreeJsWorld();
        this.Raycaster = new Raycaster(this.ThreeJsWorld._camera, this.ThreeJsWorld._scene);

        this.tools.push(new InteractTool(this.Raycaster));

        this.Raycaster.setMode('interact');
    }
}
window.WorldQuill = WorldQuill;