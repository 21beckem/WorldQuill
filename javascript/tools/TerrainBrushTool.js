import GeneralBrushTool from '../supers/GeneralBrushTool.js';
import TileWalls from '../TileWalls.js';

export default class TerrainBrushTool extends GeneralBrushTool {
    _diameter = 2;
    _addSubtract = 1;
    _intensity = 0.5;
    _lastTileId = null;
    _firstTileHeight = null;
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
        const foundList = args.castRay(WorldQuill.Map.helpers.allTiles);
        if (foundList.length < 1) return;

        let tile = foundList[0].object instanceof TileWalls ? foundList[0].object.parent : foundList[0].object;

        this._firstTileHeight = tile.height;
        this.paint(args);
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

        if (Number.isNaN(this._addSubtract)) {
            this.#smooth(args, tile);
        }
        else if (this._addSubtract == 0) { // in zero mode
            this.GeneralBrushTool_applyBrush(this._diameter, tile, (tile) =>
                tile.setHeight(this._firstTileHeight, false)
            );
        } else {
            this.GeneralBrushTool_applyBrush(this._diameter, tile, (tile) =>
                tile.modifyHeight(this._addSubtract*this._intensity, false)
            );
        }
        WorldQuill.Map.reRender();

        // args.resetMoveDistance();
    }
    #smooth(args, originalTile) {
        let heights = [];
        let avgHeight = 0;

        function calculateAverage(numbers) {
            if (numbers.length === 0) {
                return 0; // Handle empty array case
            }
            const sum = numbers.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
            return sum / numbers.length;
        }

        const getDistanceIntensity = (tile) => {
            return 1 - (Math.sqrt(
                Math.pow(tile._absoluteLoc.x - originalTile._absoluteLoc.x, 2)
                    +
                Math.pow(tile._absoluteLoc.y - originalTile._absoluteLoc.y, 2)
            ) / this._diameter);
        }

        const modifyMyHeight = (tile, index) => {
            if (index == 0) avgHeight = Math.round(calculateAverage(heights));
            if (avgHeight == tile.height) return;
            let upDown = (avgHeight - tile.height > 0) ? 1 : -1;
            let toChange = upDown * getDistanceIntensity(tile) * this._intensity;
            tile.modifyHeight(toChange, false);
        }

        this.GeneralBrushTool_applyBrush(this._diameter, originalTile, modifyMyHeight, (tile) => {
            heights.push(tile.height);
            return tile;
        });
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
                type: 'range',
                attrs: [
                    ['min', 0.1], ['max', 1.5], ['step', 0.1], ['value', this._intensity],
                    ['oninput', this.setIntensity.bind(this)]
                ],
                label: 'Intensity'
            },
            {
                type: 'div',
                style: 'display: flex; gap: 5px; flex-wrap: wrap;',
                class: ['action-buttons'],
                children: [
                    {
                        type: 'button',
                        style: 'flex: 1; font-size: 16px; flex-basis: calc(50% - 20px);',
                        class: [this._addSubtract==-1 ? 'active' : ''],
                        attrs: [['data-value', '-1'], ['onclick', this.setAddSubtract.bind(this)]],
                        content: '<i class="fa-solid fa-angles-down"></i> Lower'
                    },
                    {
                        type: 'button',
                        style: 'flex: 1; font-size: 16px; flex-basis: calc(50% - 20px);',
                        class: [this._addSubtract==1 ? 'active' : ''],
                        attrs: [['data-value', '1'], ['onclick', this.setAddSubtract.bind(this)]],
                        content: 'Raise <i class="fa-solid fa-angles-up"></i>'
                    },
                    {
                        type: 'button',
                        style: 'flex: 1; font-size: 16px; flex-basis: calc(50% - 20px);',
                        class: [Number.isNaN(this._addSubtract) ? 'active' : ''],
                        attrs: [['data-value', 'NaN'], ['onclick', this.setAddSubtract.bind(this)]],
                        content: '<i class="fa-solid fa-mound"></i> Smooth'
                    },
                    {
                        type: 'button',
                        style: 'flex: 1; font-size: 16px; flex-basis: calc(50% - 20px);',
                        class: [this._addSubtract==0 ? 'active' : ''],
                        attrs: [['data-value', '0'], ['onclick', this.setAddSubtract.bind(this)]],
                        content: '<i class="fa-solid fa-arrows-down-to-line"></i> Flatten'
                    }
                ]
            }
        ]);
    }
    setIntensity(e) {
        this._intensity = e.target.value;
    }
    setBrushSize(e) {
        this._diameter = e.target.value;
    }
    setAddSubtract(e) {
        WorldQuill.PanelManager.SidebarDetailsEl.querySelectorAll('button.active').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        this._addSubtract = parseInt(e.target.dataset.value);
    }
}