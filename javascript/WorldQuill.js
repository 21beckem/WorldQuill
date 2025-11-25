import ThreeJsWorld from './supers/ThreeJsWorld.js';
import PanelManager from './supers/PanelManager.js';
import Map from './Map.js';


export class WorldQuill {
    static init(options) {
        this.options = options;
        const {
            containerSelector = 'body',
            worldData = null,
            preview = false,
        } = options || {};
        this.ThreeJsWorld = new ThreeJsWorld(containerSelector, preview);
        
        if (!preview)
            this.PanelManager = new PanelManager(containerSelector);

        this.Map = new Map(worldData);
    }
    static onSave(worldData) {
        console.log('worldData', worldData);
        alert('ERROR: WorldQuill.onSave function not implemented yet.\nworldData has been printed in console.');
    }
    static onSaveToCollection(worldData) {
        console.log('worldData', worldData);
        alert('ERROR: WorldQuill.onSaveToCollection function not implemented yet.\nworldData has been printed in console.');
    }
}
window.WorldQuill = WorldQuill;