import GeneralBrushTool from '../supers/GeneralBrushTool.js';
import * as THREE from '../assets/three.module.min.js';
import JSColor from "../assets/jscolor.js";

export default class PaintTool extends GeneralBrushTool {
    _diameter = 2;
    _color = '#42f557';
    _subMode = 'paint';
    constructor() {
        super('paint', 'p');
        this.name = 'Paint Brush';
        this.label = 'Paint';
        this.icon = 'fas fa-paint-brush';
        this.description = `This is how you add color to your world! Click and drag accross the terrain to paint it.`;
        this._inEyeDropperMode = false;
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
        this.#stopEyedropper();
    }
    onClick(args) {
        this.paint(args);
       this.#stopEyedropper();
    }
    paint(args) {
        const found = args.castRay(WorldQuill.Map.helpers.allTilesAndWalls);
        if (found.length < 1) return;

        if (this._inEyeDropperMode)
            this.setColor('#'+found[0].object.material.color.getHexString());
        else
            this.GeneralBrushTool_applyBrush(this._diameter, found[0].object, (tile) => {
                tile.setColor(this._color);
            });
    }



    // UI
    setUiDetails() {
        this._UI_colorPickerId = 'colorPicker_' + Date.now();
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
                attrs: [['id', this._UI_colorPickerId], ['onChange', (e)=>this.setColor(e.target.value) ]],
                label: 'Color',
                children: [{
                    type: 'button',
                    attrs: [['onclick', this.startEyedropper.bind(this)]],
                    content: '<i class="fa-solid fa-eye-dropper"></i>'
                }]
            },
            // {
            //     type: 'select',
            //     attrs: [['onChange', this.setSubMode.bind(this)]],
            //     options: [
            //         ['Paint Bush', 'paint', this._subMode=='paint'],
            //         ['Bucket Fill', 'bucket', this._subMode=='bucket']
            //     ],
            //     label: 'Mode'
            // }
        ]);
        new JSColor('#'+this._UI_colorPickerId, {
            value: this._color
        });
    }
    setBrushSize(e) {
        this._diameter = e.target.value;
    }
    setColor(val) {
        this._color = val;
        document.getElementById(this._UI_colorPickerId).jscolor.fromString(this._color);
    }
    setSubMode(e) {
        this._subMode = e.target.value;
    }
    startEyedropper(e) {
        this._eyedropperEl = e.target;
        if (this._inEyeDropperMode) return this.stopEyedropper();
        this._eyedropperEl.style.opacity = 0.2;
        this._inEyeDropperMode = true;
    }
    #stopEyedropper() {
        if (!this._inEyeDropperMode) return;
        this._eyedropperEl.style.opacity = 1.0;
        this._inEyeDropperMode = false;
    }
}