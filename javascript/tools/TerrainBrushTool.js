import Tool from '../supers/Tool.js';

export default class TerrainBrushTool extends Tool {
    _diameter = 4;
    _lastTileId = null;
    constructor() {
        super('terrain-brush', 't');
        getCircleFill(this._diameter);
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
        const foundList = args.castRay(args.tileList);
        if (foundList.length < 1) return;

        const tile = foundList[0].object;
        if (this._lastTileId === tile.uuid)
            return;
        this._lastTileId = tile.uuid;

        getCircleFill(this._diameter).forEach(([x, y]) =>
            tile.getNeighbour(x, y)?.modifyHeight(1, false)
        );
        tile.parent.reRender();

        args.resetMoveDistance();
    }
}


const getCircleFill = (diameter) => {
    let output = [];
    circleLayersLookup.slice(0, diameter).forEach(layer => {
        output.push(...layer);
    });
    return output;
};

const circleLayersLookup = [
    [
        [0,0]
    ],
    [
        [1,1],
        [1,0],
        [1,-1],
        [0,-1],
        [-1,-1],
        [-1,0],
        [-1,1],
        [0,1]
    ],
    [
        [1,2],
        [2,1],
        [2,0],
        [2,-1],
        [1,-2],
        [0,-2],
        [-1,-2],
        [-2,-1],
        [-2,0],
        [-2,1],
        [-1,2],
        [0,2]
    ],
    [
        [0,3],
        [1,3],
        [2,2],
        [3,1],
        [3,0],
        [3,-1],
        [2,-2],
        [1,-3],
        [0,-3],
        [-1,-3],
        [-2,-2],
        [-3,-1],
        [-3,0],
        [-3,1],
        [-2,2],
        [-1,3]
    ]
]