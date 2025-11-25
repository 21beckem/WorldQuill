import * as THREE from './assets/three.module.min.js';
export const renderer = new THREE.WebGLRenderer({
    antialias: true,
});
export const tileWidth = 5.0;
export const tileRimHeight = 0.5;
export const tileHeightStep = 2.0;
export const chunkWidthInTiles = 20; // must be divisible by 2 (even number)

export function getAbsolutePath(relativePath) {
    if (relativePath.startsWith('/')) relativePath = relativePath.substring(1);
    const baseUrl = new URL(import.meta.url);
    // Resolve the relative path to an absolute URL
    return new URL('../' + relativePath, baseUrl).href;
}