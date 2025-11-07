import { renderer } from './constants.js';
import * as THREE from './supers/three.module.min.js';

class Raycaster {
    _tools = Array();
    #mode = null;
    constructor(camera, scene) {
        this._camera = camera;
        this._scene = scene;
        this._raycaster = new THREE.Raycaster();
		this._pointer = new THREE.Vector2();
		this._clickMouse = new THREE.Vector2();
		this._moveMouse = new THREE.Vector2();
		this._moveMouseDistance = 0;
        this._draggingMouseMovedYet = false;
        this._mouseIsDown = false;

        this.#setupPointerDown();
        this.#setupPointerMove();
        this.#setupPointerUp();
    }
    #setupPointerDown() {
        renderer.domElement.addEventListener('pointerdown', event => {
            // console.log('down');
            this._mouseIsDown = true;
			this._draggingMouseMovedYet = false;
			this._moveMouseDistance = 0;

            this.#doOnAllEvents(event, false);
            this.#sendEvent('onDown');
		});
    }
    #setupPointerMove() {
		renderer.domElement.addEventListener('pointermove', event => {
            if (!this._mouseIsDown) return;
			// console.log('move');
            this.#doOnAllEvents(event);

            // if we haven't move far yet, don't bother calling functions
            if (!this._draggingMouseMovedYet)
                return;
            this.#sendEvent('onMove');
		});
    }
    #setupPointerUp() {
        renderer.domElement.addEventListener('pointerup', event => {
            if (!this._mouseIsDown) return;
            // console.log('up');
            this.#doOnAllEvents(event);
            this.#sendEvent('onUp');
            
			this._draggingMouseMovedYet = false;
			this._moveMouseDistance = 0;
            this._mouseIsDown = false;
        });
    }
    #doOnAllEvents(event, calculateDistance=true) {
        let newMouseX = (event.clientX / window.innerWidth) * 2 - 1;
        let newMouseY = -(event.clientY / window.innerHeight) * 2 + 1

        if (calculateDistance) {
            this._moveMouseDistance += Math.sqrt(Math.pow(this._moveMouse.y - newMouseY, 2) + Math.pow(this._moveMouse.x - newMouseX, 2));
			if (this._moveMouseDistance > 0.1) {
				this._draggingMouseMovedYet = true;
			}
        }

        this._moveMouse.x = newMouseX;
        this._moveMouse.y = newMouseY;
        this._raycaster.setFromCamera(this._clickMouse, this._camera);
    }
    #sendEvent(funcName) {
        this._tools.filter(tool => tool.mode == this.#mode).forEach(tool => {
            tool[funcName]({
                raycaster: this._raycaster,
                clickOrigin: this._clickMouse,
                currentMousePosition: this._moveMouse,
                castRay: (intersectables) => this.castFunction(intersectables),
            });
        });
    }
    castFunction(intersectables=null) {
        if (!intersectables.length == 0)
            intersectables = this._scene.children;
        return this._raycaster.intersectObjects(intersectables);
    }
    setMode(mode) {
        this.#mode = mode;
    }
    addTool(mode, onDown, onMove, onUp) {
        if (this._tools.some(tool => tool.mode == mode))
            throw new Error(`There is already a tool with mode ${mode}`);
        this._tools.push({
            mode,
            onDown,
            onMove,
            onUp
        });
    }
}

export default Raycaster;