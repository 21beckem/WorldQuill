import ThreeJsWorld from './ThreeJsWorld.js';
import Raycaster from './Raycaster.js';

export class WorldQuill {
    static map;
    static init() {
        this.ThreeJsWorld = new ThreeJsWorld();
    }
}
window.WorldQuill = WorldQuill;