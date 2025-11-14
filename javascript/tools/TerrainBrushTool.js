import GeneralBrushTool from '../supers/GeneralBrushTool.js';

export default class TerrainBrushTool extends GeneralBrushTool {
    _diameter = 4;
    _addSubtract = 1;
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
        this.setUiDetails();
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
            tile.modifyHeight(this._addSubtract, false)
        );
        
        WorldQuill.Map.reRender();

        args.resetMoveDistance();
    }


    // UI
    setUiDetails() {
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
                type: 'div',
                style: 'display: flex; gap: 5px;',
                class: ['action-buttons'],
                children: [
                    {
                        type: 'button',
                        style: 'flex: 1; font-size: 16px;',
                        class: [this._addSubtract==-1 ? 'active' : ''],
                        attrs: [['data-value', '-1'], ['onclick', this.setAddSubtract.bind(this)]],
                        content: '<i class="fa-solid fa-angles-down"></i> Lower'
                    },
                    {
                        type: 'button',
                        style: 'flex: 1; font-size: 16px;',
                        class: [this._addSubtract==0 ? 'active' : ''],
                        attrs: [['data-value', '0'], ['onclick', this.setAddSubtract.bind(this)]],
                        content: '<i class="fa-solid fa-mound"></i> Smooth'
                    },
                    {
                        type: 'button',
                        style: 'flex: 1; font-size: 16px;',
                        class: [this._addSubtract==1 ? 'active' : ''],
                        attrs: [['data-value', '1'], ['onclick', this.setAddSubtract.bind(this)]],
                        content: 'Raise <i class="fa-solid fa-angles-up"></i>'
                    }
                ]
            }
        ]);
    }
    setBrushSize(e) {
        this._diameter = e.target.value;
    }
    setAddSubtract(e) {
        console.log(e);
        WorldQuill.PanelManager.SidebarDetailsEl.querySelectorAll('button.active').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        this._addSubtract = parseInt(e.target.dataset.value);
        console.log(this._addSubtract);
        
    }
}