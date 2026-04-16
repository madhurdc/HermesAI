import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const HermesModel = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 1.2);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // optimize for high DPI

    // Clear out any previous children when hot-reloading
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }
    containerRef.current.appendChild(renderer.domElement);

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
    loader.load(
      '/models/hermes/scene.gltf', // Public folder path
      (gltf) => {
        object = gltf.scene;

        // --- MAKE IT LOOK LIKE METAL ---
        object.traverse((node) => {
          if (node.isMesh && node.material) {
            node.material.metalness = 1;   // Maximum metal feel
            node.material.roughness = 0.35; // Changed from 0.45 to 0.2 per request
          }
        });

        // --- CENTER MODEL GEOMETRY ---
        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        object.position.sub(center);

        // --- FORCE MODEL TO FACE CAMERA ---
        object.rotation.y = -Math.PI / 2;

        // Add model to pivot
        pivot.add(object);
      },
      undefined,
      (error) => {
        console.error("Error loading model:", error);
      }
    );

    // COLORS
    const goldMain = 0xFFD700;
    const goldFaceFill = 0xFFF4BD;

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

    // 4. BOTTOM-LEFT (Face Fill) - User asked for Intensity 1.8 to 2.0 Shift forward (Z-axis)
    const blLight = new THREE.DirectionalLight(goldFaceFill, 2.0);
    blLight.position.set(-5, -5, 8); // Shifted Z forward
    scene.add(blLight);

    // 5. BOTTOM (Chin & Neck Fill)
    const bLight = new THREE.DirectionalLight(goldFaceFill, 2.0);
    bLight.position.set(0, -5, 8); // Shifted Z forward
    scene.add(bLight);

    // 6. BOTTOM-RIGHT (Face Fill)
    const brLight = new THREE.DirectionalLight(goldFaceFill, 2.0);
    brLight.position.set(5, -5, 8); // Shifted Z forward
    scene.add(brLight);

    // Soft Global Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Animation loop — shared counter increments at 0.05/frame (same as DottedSurface)
    let animationFrameId;
    let floatCount = 0;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

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

        // Floating motion — synced to DottedSurface (0.05/frame)
        pivot.position.y = Math.sin(floatCount * 0.3) * 0.03;
        floatCount += 0.05;
      }

      renderer.render(scene, camera);
    };

    // Resize handling
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Mouse tracking
    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    document.addEventListener('mousemove', handleMouseMove);

    // Start
    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousemove', handleMouseMove);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      // Dispose materials/geometries if necessary for large models
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full cursor-move" />;
};

export default HermesModel;
