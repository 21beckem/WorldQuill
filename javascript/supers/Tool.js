class Tool {
    constructor(raycaster) {
        raycaster.addTool('interact', this.onDown.bind(this), this.onMove.bind(this), this.onUp.bind(this));
    }
    onDown(args) {
        console.log('down:', args);
    }
    onMove(args) {
        console.log('move:', args);
    }
    onUp(args) {
        console.log('up:', args);
    }
}
export default Tool;