import { WorldQuill } from "../WorldQuill.js";

export default class Tool {
    constructor(mode, activateHotkey=null) {
        this.mode = mode;
        WorldQuill.ThreeJsWorld._raycaster.addTool(this);

        if (activateHotkey)
            this.registerHotkey(activateHotkey);
    }
    activate(){
        WorldQuill.ThreeJsWorld._raycaster.setMode(this.mode);
    }
    registerHotkey(keychar) {
        window.addEventListener('keydown', e => {
            if (e.key == keychar)
                this.activate();
        });
    }
    onActivate() {}
    onDeactivate() {}
    onDown(args) {}
    onMove(args) {}
    onUp(args) {}
    onClick(args) {}
}