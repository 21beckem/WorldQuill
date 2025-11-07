import Tool from '../supers/Tool.js';
import * as THREE from '../supers/three.module.min.js';

export default class PaintTool extends Tool {
    constructor() {
        super('paint');
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
        const found = args.castRay(args.tileList);
        found.forEach(f => {
            f.object.material.color = new THREE.Color('#42f557');
        });
    }
}