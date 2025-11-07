import Tool from '../supers/Tool.js';

export default class TerrainBrushTool extends Tool {
    _lastTileId = null;
    constructor() {
        super('terrain-brush');
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
        const foundList = args.castRay(args.tileList);
        if (foundList.length < 1) return;

        const tile = foundList[0].object;
        if (this._lastTileId !== tile.uuid) {
            this._lastTileId = tile.uuid;
            tile.addHeight(1);
        }
    }
}