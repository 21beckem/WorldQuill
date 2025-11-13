import Tool from '../supers/Tool.js';
import * as THREE from '../supers/three.module.min.js';

export default class PaintTool extends Tool {
    constructor() {
        super('paint', 'p');
        this.name = 'Paint Brush';
        this.label = 'Paint';
        this.icon = 'fas fa-paint-brush';
        this.description = `This is how you add color to your world! Click and drag accross the terrain to paint it.`;
    }
    onActivate() {
        WorldQuill.ThreeJsWorld._controls.enabled = false;
    }
    onDeactivate() {
        WorldQuill.ThreeJsWorld._controls.enabled = true;
    }
    onDown(args) {
        this.paint(args);
    }
    onMove(args) {
        this.paint(args);
    }
    onUp(args) {
        this.paint(args);
    }
    onClick(args) {
        this.paint(args);
    }
    paint(args) {
        const found = args.castRay(WorldQuill.Map.helpers.allTiles);
        if (found.length < 1) return;
        found[0].object.material.color = new THREE.Color('#42f557');
    }
}