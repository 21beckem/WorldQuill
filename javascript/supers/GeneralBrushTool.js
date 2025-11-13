import Tool from '../supers/Tool.js';

export default class GeneralBrushTool extends Tool {
    constructor() {
        super(...arguments);
    }
    GeneralBrushTool_applyBrush(diameter, tile, applyMethod) {
        getCircleFill(diameter)
            .map(([x, y]) => tile.getNeighbour(x, y))
            .filter(tile => !!tile)
            .forEach(tile => {
                console.log(tile);
                applyMethod(tile);
            });
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