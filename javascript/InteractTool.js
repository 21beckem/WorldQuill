import Tool from './supers/Tool.js';

class InteractTool extends Tool {
    mode = 'interact';
    onDown(args) {
        console.log('down:', args);
    }
    onMove(args) {
        console.log('HAHAA move:', args);
    }
    onUp(args) {
        console.log('up:', args);
    }
}

export default InteractTool;