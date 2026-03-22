"use client"

import React, { useState, useEffect } from 'react';
import { Leaf, Wind, Sparkles } from 'lucide-react';
import dynamic from 'next/dynamic';

const ThreeBackground = dynamic(() => import('@/components/ThreeBackground'), { 
  ssr: false,
  loading: () => <div className="fixed inset-0 -z-10 bg-[#FDFCFB]" />
});

export default function HeroBackground() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 15,
        y: (e.clientY / window.innerHeight - 0.5) * 15,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Simplified ghostly layers to match the minimalist clay aesthetic
  const layers = [
    {
      id: 'bg',
      factor: 0.1,
      elements: [
        { type: 'blob', color: 'bg-primary/5', size: 'w-96 h-96', pos: 'top-[-10%] left-[-10%]', animation: 'animate-float-slow' },
        { type: 'blob', color: 'bg-accent/5', size: 'w-[30rem] h-[30rem]', pos: 'bottom-[-15%] right-[-10%]', animation: 'animate-float-premium' },
      ],
      blur: 'blur-3xl'
    },
    {
      id: 'mid',
      factor: 0.3,
      elements: [
        { type: 'icon', icon: Leaf, color: 'text-primary/5', size: 80, pos: 'top-[15%] left-[5%]', animation: 'animate-scale-soft' },
        { type: 'icon', icon: Sparkles, color: 'text-accent/5', size: 60, pos: 'bottom-[20%] right-[10%]', animation: 'animate-float-slow' },
      ],
      blur: 'blur-2xl'
    },
    {
      id: 'fg',
      factor: 0.6,
      elements: [
        { type: 'icon', icon: Wind, color: 'text-primary/10', size: 40, pos: 'top-[10%] right-[10%]', animation: 'animate-float-fast' },
      ],
      blur: 'blur-sm'
    }
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 bg-[#FDFCFB]">
      <ThreeBackground />
      
      {layers.map((layer) => (
        <div 
          key={layer.id}
          className="absolute inset-0 preserve-3d transition-transform duration-700 ease-out"
          style={{ 
            transform: `translate3d(${mousePos.x * layer.factor}px, ${mousePos.y * layer.factor}px, 0)`,
            willChange: 'transform'
          }}
        >
          {layer.elements.map((el, idx) => (
            <div 
              key={idx} 
              className={`absolute ${el.pos} ${el.animation} ${layer.blur} transition-all duration-1000 opacity-40`}
            >
              {el.type === 'blob' ? (
                <div className={`${el.size} ${el.color} rounded-full animate-pulse-glow`} />
              ) : el.icon ? (
                <el.icon 
                  size={el.size} 
                  className={`${el.color} drop-shadow-sm`}
                />
              ) : null}
            </div>
          ))}
        </div>
      ))}

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#FDFCFB]/30 z-0" />
    </div>
  );
}
