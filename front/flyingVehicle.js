import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

export async function flyingVehicleCreate() {
  const loader = new OBJLoader();
  const redMaterial = new THREE.MeshStandardMaterial({
    color: 0xff0000, // Red color
    roughness: 0.5, // Adjust roughness as needed
    metalness: 0.5, // Adjust metalness as needed
  });

  let obj = await loader.loadAsync("models/plane.obj");
  const flyingVehicle = obj;
  // Apply the red material to the flying vehicle
  flyingVehicle.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.material = redMaterial;
    }
  });

  // Set the position, rotation, and scale of the flying vehicle
  flyingVehicle.position.set(-0.3, 0, 1);
  flyingVehicle.scale.set(0.01, 0.01, 0.01);

  // Assuming you've identified the propeller mesh, let's call it 'propellerMesh'
  const propellerMesh = flyingVehicle.getObjectByName('Propeller'); // Assuming 'propeller' is the name of the propeller mesh

  if (!propellerMesh) {
    console.error('Could not find propeller mesh in the loaded model.');
  }

  return { flyingVehicle, propellerMesh };
}