"use client"

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Check if WebGL is supported
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      console.warn('WebGL not supported, disabling 3D background effects.');
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ 
        alpha: true, 
        antialias: true,
        powerPreference: "high-performance"
      });
    } catch (e) {
      console.warn('Failed to initialize THREE.WebGLRenderer:', e);
      return;
    }
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Soft Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.3);
    pointLight.position.set(-5, -5, 5);
    scene.add(pointLight);

    // Color Palette: Terracotta, Muted Yellow, Soft Peach
    const colors = [
      0xE2725B, // Terracotta
      0xE9C46A, // Muted Yellow
      0xF4A261, // Soft Peach
      0xEEB4B4  // Muted Rose/Peach
    ];

    const geometries = [
      new THREE.TorusGeometry(1, 0.3, 16, 100),
      new THREE.SphereGeometry(0.8, 32, 32),
      new THREE.BoxGeometry(1.2, 0.6, 0.6), // Rectangular Prisms
    ];

    const items: THREE.Mesh[] = [];

    // Create floating abstract elements
    for (let i = 0; i < 12; i++) {
      const geometry = geometries[Math.floor(Math.random() * geometries.length)];
      
      // Clay-render style material: Matte, rough, semi-transparent
      const material = new THREE.MeshPhysicalMaterial({ 
        color: colors[Math.floor(Math.random() * colors.length)],
        roughness: 0.9,
        metalness: 0.1,
        transparent: true,
        opacity: 0.7,
        transmission: 0.1,
        thickness: 0.5
      });

      const mesh = new THREE.Mesh(geometry, material);
      
      // Position them away from the center to create negative space for text
      const radius = 8 + Math.random() * 5;
      const angle = Math.random() * Math.PI * 2;
      
      mesh.position.set(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 5 - 5
      );

      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      mesh.scale.setScalar(Math.random() * 0.8 + 0.4);
      
      scene.add(mesh);
      items.push(mesh);
    }

    camera.position.z = 12;

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      items.forEach((item, i) => {
        // Slow, elegant floating movement
        item.rotation.x += 0.002;
        item.rotation.y += 0.001;
        item.position.y += Math.sin(Date.now() * 0.0005 + i) * 0.005;
        item.position.x += Math.cos(Date.now() * 0.0003 + i) * 0.003;
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometries.forEach(g => g.dispose());
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 -z-10 pointer-events-none" />;
}
