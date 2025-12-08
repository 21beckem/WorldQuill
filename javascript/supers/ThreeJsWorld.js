import { renderer } from '../constants.js';
import * as THREE from '../assets/three.module.min.js';
import { OrbitControls } from '../assets/OrbitControls.min.js';
import Raycaster from './Raycaster.js';
import Cursor from '../assets/Cursor.js';

export default class ThreeJsWorld {
    constructor(containerSelector, previewMode=false) {
        this._scene = new THREE.Scene();
		this._previewMode = previewMode;

        this.#initThree(containerSelector);
        this.#handleWindowResize();
        this.#createCamera();
        this.#createLight();
        this.#createSkybox();
        
        this.#setupOrbitControls();
        this.#setupRenderLoop();
		this.#setupRaycaster();
    }
    #initThree(containerSelector) {
        renderer.domElement.id = 'WorldQuillDomElement';
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);
		
		const container = document.querySelector(containerSelector);
		if (container) {
			container.appendChild(renderer.domElement);
			Cursor.target = renderer.domElement;
		} else {
        	document.body.appendChild(renderer.domElement);
		}
    }
    #handleWindowResize() {
        const onWindowResize = () => {
            if (this._camera) {
                this._camera.aspect = window.innerWidth / window.innerHeight;
                this._camera.updateProjectionMatrix();
            }
            renderer.setSize(window.innerWidth, window.innerHeight);
			if (this._previewMode) {
				renderer.render(this._scene, this._camera);
				try { // only try to save if we can. if we can't, no big deal
					sessionStorage.setItem(this._previewMode, renderer.domElement.toDataURL('image/jpeg', 1));
				} catch (e) {}
			}
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
		// render loop
		renderer.setAnimationLoop(() => this.#renderFirstTime());
    }
	#renderFirstTime() {
		// place camera to show all objects
		const box = new THREE.Box3().setFromObject(this._scene.children.at(-1));
		const center = new THREE.Vector3();
		const size = new THREE.Vector3();
		box.getCenter(center);
		box.getSize(size);

		const maxDim = Math.max(size.x, size.y, size.z);

		const cameraZ = maxDim / Math.tan(this._camera.fov * Math.PI / 360) * 0.5;
		this._camera.position.set(center.x, 200, center.z + cameraZ);

		this._camera.lookAt(center);
		this._controls.target.set(center.x, 0, center.z);
		this._controls.update();

		// render scene
		renderer.render(this._scene, this._camera);

		if (this._previewMode)
			renderer.setAnimationLoop(null); // turn off render loop
		else
			renderer.setAnimationLoop(() => {
				renderer.render(this._scene, this._camera);
			});
	}
	#setupRaycaster() {
		if (this._previewMode) return;
		this._raycaster = new Raycaster(this._camera, this._scene);
	}

    #setupOrbitControls() {
		this._controls = new OrbitControls(
			this._camera, renderer.domElement
		);

		if (this._previewMode)
			this._controls.enabled = false;
    }
    #makeSimpleBox(x, y, z) {
		const box = new THREE.Mesh(
			new THREE.BoxGeometry(2, 2, 2),
			new THREE.MeshStandardMaterial({
				color: 'red',
			}));
		box.position.set(x, y, z);
		box.castShadow = true;
		box.receiveShadow = true;
		this._scene.add(box);
	}
}