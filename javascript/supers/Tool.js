import { WorldQuill } from "../WorldQuill.js";

class Tool {
    constructor(mode) {
        WorldQuill.ThreeJsWorld._raycaster.addTool(mode,
            this.onDown.bind(this),
            this.onMove.bind(this),
            this.onUp.bind(this),
            this.onClick.bind(this)
        );
    }
    onDown(args) {}
    onMove(args) {}
    onUp(args) {}
    onClick(args) {}
}
export default Tool;