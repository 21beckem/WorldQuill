import Tool from './supers/Tool.js';

export default class InteractTool extends Tool {
    constructor() {
        super('interact');
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
        const found = args.castRay();
        console.log('Interact click:', args, 'Found:', found);
    }
}