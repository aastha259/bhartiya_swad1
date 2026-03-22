"use client"

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xFDFCFB); // Solid light cream
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ 
        alpha: false, 
        antialias: true,
        powerPreference: "high-performance"
      });
    } catch (e) {
      return;
    }
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Soft Diffused Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.2);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // Ghostly Palette: Very pale terracotta, muted gold, soft peach
    const colors = [
      0xE2725B, // Terracotta
      0xE9C46A, // Muted Gold
      0xF4A261, // Soft Peach
    ];

    const items: THREE.Group[] = [];

    const createMatka = (color: number) => {
      const group = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.SphereGeometry(1, 32, 32),
        createMaterial(color)
      );
      body.scale.set(1, 0.9, 1);
      const rim = new THREE.Mesh(
        new THREE.TorusGeometry(0.4, 0.1, 16, 32),
        createMaterial(color)
      );
      rim.rotation.x = Math.PI / 2;
      rim.position.y = 0.9;
      group.add(body, rim);
      return group;
    };

    const createCinnamon = (color: number) => {
      const group = new THREE.Group();
      const stick = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.15, 3, 16),
        createMaterial(color)
      );
      group.add(stick);
      return group;
    };

    const createAnise = (color: number) => {
      const group = new THREE.Group();
      for (let i = 0; i < 6; i++) {
        const petal = new THREE.Mesh(
          new THREE.BoxGeometry(0.2, 0.8, 0.1),
          createMaterial(color)
        );
        petal.rotation.z = (i * Math.PI) / 3;
        petal.position.set(
          Math.cos((i * Math.PI) / 3) * 0.4,
          Math.sin((i * Math.PI) / 3) * 0.4,
          0
        );
        group.add(petal);
      }
      return group;
    };

    const createMaterial = (color: number) => {
      return new THREE.MeshPhysicalMaterial({ 
        color: color,
        roughness: 1, // Full matte clay
        metalness: 0,
        transparent: true,
        opacity: 0.3, // Ethereal ghost-like appearance
        transmission: 0,
        thickness: 0
      });
    };

    // Distribution: Strictly at edges and corners
    const itemCount = 14;
    for (let i = 0; i < itemCount; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      let mesh: THREE.Group;
      
      const type = i % 3;
      if (type === 0) mesh = createMatka(color);
      else if (type === 1) mesh = createCinnamon(color);
      else mesh = createAnise(color);
      
      const side = Math.random() > 0.5 ? 1 : -1;
      const vertical = Math.random() > 0.5 ? 1 : -1;
      
      const x = side * (12 + Math.random() * 8);
      const y = vertical * (8 + Math.random() * 6);
      const z = (Math.random() - 0.5) * 5;

      mesh.position.set(x, y, z);
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      mesh.scale.setScalar(Math.random() * 0.5 + 0.6);
      
      scene.add(mesh);
      items.push(mesh);
    }

    camera.position.z = 15;

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      const time = Date.now() * 0.0003;
      items.forEach((item, i) => {
        item.rotation.x += 0.001;
        item.rotation.y += 0.0005;
        item.position.y += Math.sin(time + i) * 0.003;
        item.position.x += Math.cos(time * 0.5 + i) * 0.002;
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
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 -z-10 pointer-events-none bg-[#FDFCFB]" />;
}
