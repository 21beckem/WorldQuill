import Tool from '../supers/Tool.js';
import { WorldQuill } from '../WorldQuill.js';

export default class InteractTool extends Tool {
    constructor() {
        super('interact', 'i');
    }
    onDown(args) {
        // console.log('Interact down:', args);
    }
    onMove(args) {
        // console.log('Interact move:', args);
    }
    onUp(args) {
        // console.log('Interact up:', args);
    }
    onClick(args) {
        const found = args.castRay( [...WorldQuill.Map.helpers.allTiles, ...WorldQuill.Map.helpers.allEntities] );
        console.log('Interact click:', args, 'Found:', found);
    }
}