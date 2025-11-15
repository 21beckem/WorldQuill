import { WorldQuill } from "../WorldQuill.js";

export default class SaveButton {
    constructor() {
        this.domElement = document.createElement('tool-btn');
        this.domElement.innerHTML = `<i class="fa-solid fa-save"></i>&nbsp;&nbsp;Save`;
        this.domElement.addEventListener('click', () => {
            WorldQuill.onSave(WorldQuill.Map.serialize());
        });
    }
}