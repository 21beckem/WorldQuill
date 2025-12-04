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

        this.Map = new Map();
        this.Map.init(worldData);
    }
    static onSave(worldData) {
        console.log('worldData', worldData);
        alert('ERROR: WorldQuill.onSave function not implemented yet.\nworldData has been printed in console.');
    }
    static onSaveToCollection(worldData) {
        console.log('worldData', worldData);
        alert('ERROR: WorldQuill.onSaveToCollection function not implemented yet.\nworldData has been printed in console.');
    }

    // event listeners
    static eventListeners = {};
    static addEventListener(name, callback) {
        if (!this.eventListeners[name])
            this.eventListeners[name] = [];
        this.eventListeners[name].push(callback);
        return () => { this.removeEventListener(name, callback); };
    }
    static removeEventListener(name, callback) {
        const index = this.eventListeners[name].indexOf(callback);
        if (index > -1) {
            this.eventListeners[name].splice(index, 1);
            if (this.eventListeners[name].length == 0)
                delete this.eventListeners[name];
        }
    }
    static dispatchEvent(name, ...args) {
        if (this.eventListeners[name])
            this.eventListeners[name].forEach(callback => callback(...args));
    }
}
window.WorldQuill = WorldQuill;