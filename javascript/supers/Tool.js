import { WorldQuill } from "../WorldQuill.js";

export default class Tool {
    constructor(mode) {
        this.mode = mode;
        WorldQuill.ThreeJsWorld._raycaster.addTool(this);
    }
    activate(){
        WorldQuill.ThreeJsWorld._raycaster.setMode(this.mode);
    }
    onActivate() {}
    onDeactivate() {}
    onDown(args) {}
    onMove(args) {}
    onUp(args) {}
    onClick(args) {}
}