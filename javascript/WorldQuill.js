import ThreeJsWorld from './supers/ThreeJsWorld.js';
import PanelManager from './supers/PanelManager.js';
import Map from './Map.js';


export class WorldQuill {
    static init(options) {
        this.options = options;
        const {
            containerSelector = 'body',
            worldData = null,
            previewId = false,
        } = options || {};

        // // if this is a preview, check to see if we've cached the preview image
        // if (previewId && sessionStorage.getItem(previewId)) {
        //     let imgUrl = sessionStorage.getItem(previewId);
        //     let img = document.createElement('img');
        //     img.src = imgUrl;
        //     document.querySelector(containerSelector).appendChild(img);
        //     return;
        // }
        this.ThreeJsWorld = new ThreeJsWorld(containerSelector, previewId);
        
        if (!previewId)
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