import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

export async function cloudCreate(ypos, model, color) {
    const material = new THREE.MeshStandardMaterial({
        color: color, // Light Red color (adjust as needed)
        roughness: 0.7,
        metalness: 0.0,
    });

    const objLoader = new OBJLoader();
    let object = await objLoader.loadAsync('models/'+ model + '.obj');

    object.traverse(child => {
        if (child instanceof THREE.Mesh) {
            child.material = material;
        }
    });

    const cloud = object;
    cloud.rotation.set(Math.PI/2 + 0.1, 0, 0);
    cloud.scale.set(0.02, 0.02, 0.02);

    return cloud;
}
