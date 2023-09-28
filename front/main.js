import * as THREE from 'three';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { loadFlyingVehicle } from './flyingVehicle.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

renderer.shadowMap.enabled = true;


const rimLight = new THREE.PointLight(0xffffff, 90); // Adjust intensity and color
rimLight.position.set(0, 0, 5); // Adjust position
rimLight.rotation.x = 90
rimLight.castShadow = true
scene.add(rimLight);

scene.background = new THREE.Color(0x9EE4E4);

const mtlLoader = new MTLLoader();
mtlLoader.load('models/planet.mtl', (materials) => {
    materials.preload();

    const objLoader = new OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.load('models/planet.obj', (object) => {
        const ball = object;
        scene.add(ball);

        //ball.position.y = -2; // Adjust the position to be at the bottom of the screen

        function animate() {
            requestAnimationFrame(animate);
            ball.rotation.y -= 0.003;

            renderer.render(scene, camera);
        }

        animate();
    });
});

loadFlyingVehicle(scene, camera, renderer);

camera.position.z = 0.7;
camera.position.y = -0.5;
camera.rotation.x = 90