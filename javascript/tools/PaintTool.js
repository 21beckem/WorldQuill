import Tool from '../supers/Tool.js';
import * as THREE from '../assets/three.module.min.js';
import JSColor from "../assets/jscolor.js";

export default class PaintTool extends Tool {
    _diameter = 4;
    _color = '#42f557';
    _subMode = 'paint';
    constructor() {
        super('paint', 'p');
        this.name = 'Paint Brush';
        this.label = 'Paint';
        this.icon = 'fas fa-paint-brush';
        this.description = `This is how you add color to your world! Click and drag accross the terrain to paint it.`;
    }
    onActivate() {
        WorldQuill.ThreeJsWorld._controls.enabled = false;
        this.setUiDetails();
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
        const found = args.castRay(WorldQuill.Map.helpers.allTilesAndWalls);
        if (found.length < 1) return;
        found[0].object.material.color = new THREE.Color(this._color);
    }



    // UI
    setUiDetails() {
        const colorPickerId = 'colorPicker_' + Date.now();
        WorldQuill.PanelManager.setDetails([
            {
                type: 'range',
                attrs: [
                    ['min', 1], ['max', 4], ['step', 1], ['value', this._diameter],
                    ['oninput', this.setBrushSize.bind(this)]
                ],
                label: 'Brush Size'
            },
            {
                type: 'input',
                attrs: [['id', colorPickerId], ['onChange', this.setColor.bind(this)]],
                label: 'Color',
                children: [{
                    type: 'button',
                    attrs: [['onclick', this.startEyedropper.bind(this)]],
                    content: 'I'
                }]
            },
            {
                type: 'select',
                attrs: [['onChange', this.setSubMode.bind(this)]],
                options: [
                    ['Paint Bush', 'paint', this._subMode=='paint'],
                    ['Bucket Fill', 'bucket', this._subMode=='bucket']
                ],
                label: 'Mode'
            },
        ]);
        new JSColor('#'+colorPickerId, {
            value: this._color
        });
    }
    setBrushSize(e) {
        this._diameter = e.target.value;
    }
    setColor(e) {
        this._color = e.target.value;
    }
    setSubMode(e) {
        this._subMode = e.target.value;
    }
    startEyedropper(e) {
        alert('would now let you use the eyedropper tool...');
    }
}