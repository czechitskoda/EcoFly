import * as THREE from "three";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

export async function earthCreate() {
  const mtlLoader = new MTLLoader();
  let materials = await mtlLoader.loadAsync("models/planet.mtl");
  materials.side=THREE.DoubleSide
  materials.preload();

  const objLoader = new OBJLoader();
  objLoader.setMaterials(materials);
  let obj = await objLoader.loadAsync("models/planet.obj");

  return obj;
}
