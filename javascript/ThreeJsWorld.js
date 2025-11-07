import { renderer } from './constants.js';
import * as THREE from './three.module.min.js';
import { OrbitControls } from './OrbitControls.min.js';

class ThreeJsWorld {
    constructor() {
        this._scene = new THREE.Scene();

        this.#initThree();
        this.#handleWindowResize();
        this.#createCamera();
        this.#createLight();
        this.#createSkybox();
        
        this.#setupOrbitControls();
        this.#setupRenderLoop();

        this.#makeSimpleBox(0, 0, 0);
    }
    #initThree() {
        renderer.domElement.id = 'WorldQuillDomElement';
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);
    }
    #handleWindowResize() {
        const onWindowResize = () => {
            if (this._camera) {
                this._camera.aspect = window.innerWidth / window.innerHeight;
                this._camera.updateProjectionMatrix();
            }
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
        window.addEventListener('resize', onWindowResize.bind(this), false);
		setTimeout(onWindowResize.bind(this), 10);
    }
    #createCamera() {
		const fov = 60;
		const aspect = 1920 / 1080;
		const near = 1.0;
		const far = 1000.0;
		this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
		this._camera.position.set(14, 147, -124);
		this._camera.rotation.set(0, 0, 0);
	}
    #createLight() {
		let dLight = new THREE.DirectionalLight(0xFFFFFF, 0.5);
		dLight.position.set(20, 100, 10);
		dLight.target.position.set(0, 0, 0);
		dLight.castShadow = true;
		dLight.shadow.bias = -0.001;
		dLight.shadow.mapSize.width = 2048;
		dLight.shadow.mapSize.height = 2048;
		dLight.shadow.camera.near = 0.1;
		dLight.shadow.camera.far = 500.0;
		dLight.shadow.camera.near = 0.5;
		dLight.shadow.camera.far = 500.0;
		dLight.shadow.camera.left = 100;
		dLight.shadow.camera.right = -100;
		dLight.shadow.camera.top = 100;
		dLight.shadow.camera.bottom = -100;
		this._scene.add(dLight);

		let aLight = new THREE.AmbientLight(0x101010, 8.0);
		this._scene.add(aLight);
	}
    #createSkybox() {
		// const loader = new THREE.CubeTextureLoader();
		// const texture = loader.load([
		// 	'./resources/posx.jpg',
		// 	'./resources/negx.jpg',
		// 	'./resources/posy.jpg',
		// 	'./resources/negy.jpg',
		// 	'./resources/posz.jpg',
		// 	'./resources/negz.jpg',
		// ]);
		// this._scene.background = texture;
		this._scene.background = new THREE.Color( 0xf0f0f0 );
	}
    #setupRenderLoop() {
        renderer.setAnimationLoop(() => {
            renderer.render(this._scene, this._camera);
        });
    }

    #setupOrbitControls() {
        this._controls = new OrbitControls(
			this._camera, renderer.domElement
		);
		this._controls.target.set(0, 20, 0);
		this._controls.update();
    }
    #makeSimpleBox(x, y, z) {
		const box = new THREE.Mesh(
			new THREE.BoxGeometry(2, 2, 2),
			new THREE.MeshStandardMaterial({
				color: 0x808080,
			}));
		box.position.set(x, y, z);
		box.castShadow = true;
		box.receiveShadow = true;
		this._scene.add(box);
	}
}
export default ThreeJsWorld;