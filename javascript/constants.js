import * as THREE from './supers/three.module.min.js';
export const renderer = new THREE.WebGLRenderer({
    antialias: true,
});
export const tileWidth = 5.0;
export const tileRimHeight = 0.5;
export const tileHeightStep = 2.0;
export const chunkWidthInTiles = 16;