// Import Three.js
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 1.2);

// Renderer
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("container3D").appendChild(renderer.domElement);

// Mouse tracking
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

// Pivot (IMPORTANT 🔥)
const pivot = new THREE.Group();
scene.add(pivot);

// Model reference
let object = null;

// Load model
const loader = new GLTFLoader();
loader.load("./models/hermes/scene.gltf", (gltf) => {

  object = gltf.scene;
  // --- MAKE IT LOOK LIKE METAL ---
object.traverse((node) => {
  if (node.isMesh) {
    node.material.metalness = 1;   // 1 is maximum metal feel
    node.material.roughness = 0.45; // Lower is shinier
  }
});
  // --- CENTER MODEL GEOMETRY ---
  const box = new THREE.Box3().setFromObject(object);
  const center = box.getCenter(new THREE.Vector3());
  object.position.sub(center);

  // // Slight downward adjustment for framing
  // const size = box.getSize(new THREE.Vector3());
  // object.position.y -= size.y * 0.15;

  // --- FORCE MODEL TO FACE CAMERA ---
  object.rotation.y = -Math.PI / 2;

  // Add model to pivot
  pivot.add(object);
});

// COLORS
const goldMain = 0xFFD700; 
const goldFaceFill = 0xFFF4BD; // A brighter gold to pop the facial features

// 1. TOP-LEFT
const tlLight = new THREE.DirectionalLight(goldMain, 2.5);
tlLight.position.set(-5, 5, 2);
scene.add(tlLight);

// 2. TOP
const tLight = new THREE.DirectionalLight(goldMain, 2.5);
tLight.position.set(0, 5, 2);
scene.add(tLight);

// 3. TOP-RIGHT
const trLight = new THREE.DirectionalLight(goldMain, 2.5);
trLight.position.set(5, 5, 2);
scene.add(trLight);

// 4. BOTTOM-LEFT (Face Fill)
const blLight = new THREE.DirectionalLight(goldFaceFill, 1.3); // Increased from 0.8
blLight.position.set(-5, -5, 5); // Z increased to 5 to hit the front
scene.add(blLight);

// 5. BOTTOM (Chin & Neck Fill)
const bLight = new THREE.DirectionalLight(goldFaceFill, 1.5); // Stronger center fill
bLight.position.set(0, -5, 5); // Z increased to 5
scene.add(bLight);

// 6. BOTTOM-RIGHT (Face Fill)
const brLight = new THREE.DirectionalLight(goldFaceFill, 1.3); // Increased from 0.8
brLight.position.set(5, -5, 5); // Z increased to 5
scene.add(brLight);

// Soft Global Light
scene.add(new THREE.AmbientLight(0xffffff, 0.4));

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  if (object) {

    // Normalize mouse [-1, 1]
    const xNorm = (mouseX / window.innerWidth) * 2 - 1;
    const yNorm = (mouseY / window.innerHeight) * 2 - 1;

    // Movement limits
    const maxY = Math.PI / 8;
    const maxX = Math.PI / 14;

    // Smooth pivot rotation
    pivot.rotation.y += (xNorm * maxY - pivot.rotation.y) * 0.08;
    pivot.rotation.x += (yNorm * maxX - pivot.rotation.x) * 0.08;

    // Subtle floating motion
    pivot.position.y = Math.sin(Date.now() * 0.001) * 0.03;
  }

  renderer.render(scene, camera);
}

// Resize handling
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Mouse tracking
document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// Start
animate();