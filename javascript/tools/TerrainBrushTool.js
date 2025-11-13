import GeneralBrushTool from '../supers/GeneralBrushTool.js';

export default class TerrainBrushTool extends GeneralBrushTool {
    _diameter = 4;
    _lastTileId = null;
    constructor() {
        super('terrain-brush', 't');
        this.name = 'Terrain Brush';
        this.label = 'Terrain';
        this.icon = 'fas fa-mountain';
        this.description = `This is how you add height to your world! Click and drag accross the terrain to raise and lower it.`;
    }
    onActivate() {
        WorldQuill.ThreeJsWorld._controls.enabled = false;
    }
    onDeactivate() {
        WorldQuill.ThreeJsWorld._controls.enabled = true;
    }
    onDown(args) {
        // this.paint(args);
    }
    onMove(args) {
        this.paint(args);
    }
    onUp(args) {
        this._lastTileId = null;
    }
    onClick(args) {
        this.paint(args);
        this._lastTileId = null;
    }
    paint(args) {
        const foundList = args.castRay(WorldQuill.Map.helpers.allTiles);
        if (foundList.length < 1) return;

        const tile = foundList[0].object;
        if (this._lastTileId === tile.uuid)
            return;
        this._lastTileId = tile.uuid;

        this.GeneralBrushTool_applyBrush(this._diameter, tile, (tile) =>
            tile.modifyHeight(1, false)
        );
        
        WorldQuill.Map.reRender();

        args.resetMoveDistance();
    }
}