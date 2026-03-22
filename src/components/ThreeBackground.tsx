"use client"

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xFDFCFB);
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ 
        alpha: false, 
        antialias: true,
        powerPreference: "high-performance"
      });
    } catch (e) {
      console.warn("WebGL not supported");
      return;
    }
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    const palette = {
      yellow: 0xE9C46A,
      peach: 0xF4A261,
      terracotta: 0xE2725B,
      clay: 0xBA9B91
    };

    const createClayMaterial = (color: number) => {
      return new THREE.MeshPhysicalMaterial({ 
        color: color,
        roughness: 0.95,
        metalness: 0,
        reflectivity: 0,
        opacity: 0.4,
        transparent: true
      });
    };

    const geometries = [
      new THREE.TorusGeometry(1, 0.35, 16, 100),
      new THREE.SphereGeometry(1, 32, 32),
      new THREE.BoxGeometry(1.5, 1, 0.8)
    ];

    const colors = [palette.yellow, palette.peach, palette.terracotta, palette.clay];
    const items: THREE.Mesh[] = [];

    // Distribution: Primarily bottom and edges to keep center clear
    const itemCount = 14;
    for (let i = 0; i < itemCount; i++) {
      const geo = geometries[i % geometries.length];
      const color = colors[i % colors.length];
      const mesh = new THREE.Mesh(geo, createClayMaterial(color));
      
      const side = Math.random() > 0.5 ? 1 : -1;
      
      // Force elements away from the center (x: > 8 or < -8)
      const x = side * (8 + Math.random() * 12);
      const y = (Math.random() * 20) - 10; 
      const z = (Math.random() - 0.5) * 5;

      mesh.position.set(x, y, z);
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      mesh.scale.setScalar(Math.random() * 0.8 + 0.8);
      
      scene.add(mesh);
      items.push(mesh);
    }

    camera.position.z = 15;

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      const time = Date.now() * 0.0001;
      items.forEach((item, i) => {
        item.rotation.x += 0.002;
        item.rotation.y += 0.001;
        item.position.y += Math.sin(time + i) * 0.004;
        item.position.x += Math.cos(time * 0.5 + i) * 0.003;
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