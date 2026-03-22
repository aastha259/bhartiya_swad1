"use client"

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const ThreeBackground = dynamic(() => import('@/components/ThreeBackground'), { 
  ssr: false,
  loading: () => <div className="fixed inset-0 -z-10 bg-[#FDFCFB]" />
});

export default function HeroBackground() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 40,
        y: (e.clientY / window.innerHeight - 0.5) * 40,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const layers = [
    {
      id: 'bg-glows',
      factor: 0.1,
      elements: [
        // Saffron glow top-left
        { color: 'bg-[#FF9933]/15', size: 'w-[800px] h-[800px]', pos: 'top-[-20%] left-[-10%]' },
        // Light orange glow bottom-right
        { color: 'bg-[#FFB347]/15', size: 'w-[700px] h-[700px]', pos: 'bottom-[-15%] right-[-5%]' },
        // Cream central highlight
        { color: 'bg-[#FFF5E1]/20', size: 'w-[900px] h-[900px]', pos: 'top-[10%] left-[15%]' },
      ],
      blur: 'blur-[120px]'
    },
    {
      id: 'mid-glows',
      factor: 0.3,
      elements: [
        // Subtle accent glows behind elements
        { color: 'bg-[#FF9933]/10', size: 'w-[400px] h-[400px]', pos: 'top-[25%] right-[15%]' },
        { color: 'bg-[#FFB347]/10', size: 'w-[350px] h-[350px]', pos: 'bottom-[30%] left-[20%]' },
      ],
      blur: 'blur-[80px]'
    }
  ];

  const foodItems = [
    { id: 1, pos: 'top-[15%] left-[8%]', size: 'w-36 h-36', animation: 'animate-float-premium', factor: 0.8, imgId: 'hero-pizza' },
    { id: 2, pos: 'bottom-[15%] left-[12%]', size: 'w-44 h-44', animation: 'animate-float-slow', factor: 0.6, imgId: 'hero-dosa', delay: '1.5s' },
    { id: 3, pos: 'top-[20%] right-[10%]', size: 'w-32 h-32', animation: 'animate-float-premium', factor: 0.9, imgId: 'hero-burger', delay: '0.5s' },
    { id: 4, pos: 'bottom-[25%] right-[15%]', size: 'w-48 h-44', animation: 'animate-float-slow', factor: 0.5, imgId: 'hero-thali', delay: '2s' },
    { id: 5, pos: 'top-[50%] left-[4%]', size: 'w-28 h-28', animation: 'animate-float-premium', factor: 1.1, imgId: 'hero-samosa', delay: '3s' },
    { id: 6, pos: 'top-[65%] right-[5%]', size: 'w-32 h-32', animation: 'animate-float-slow', factor: 0.7, imgId: 'cat-fast-food', delay: '4s' },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 bg-[#FDFCFB]">
      {/* Base warm radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#FFF5E1_0%,_#FDFCFB_70%)]" />
      
      <ThreeBackground />
      
      {/* Background Glow Layers */}
      {layers.map((layer) => (
        <div 
          key={layer.id}
          className="absolute inset-0 preserve-3d transition-transform duration-1000 ease-out"
          style={{ 
            transform: `translate3d(${mousePos.x * layer.factor}px, ${mousePos.y * layer.factor}px, 0)`,
            willChange: 'transform'
          }}
        >
          {layer.elements.map((el, idx) => (
            <div 
              key={idx} 
              className={`absolute ${el.pos} ${layer.blur} opacity-60 transition-all duration-1000`}
            >
              <div className={`${el.size} ${el.color} rounded-full animate-pulse-glow`} />
            </div>
          ))}
        </div>
      ))}

      {/* Floating Food Elements Layer with individual glows */}
      <div 
        className="absolute inset-0 preserve-3d transition-transform duration-700 ease-out"
        style={{ 
          transform: `translate3d(${mousePos.x * 1.2}px, ${mousePos.y * 1.2}px, 0)`,
          willChange: 'transform'
        }}
      >
        {foodItems.map((item) => {
          const imageData = PlaceHolderImages.find(img => img.id === item.imgId);
          if (!imageData) return null;

          return (
            <div 
              key={item.id}
              className={`absolute ${item.pos} ${item.animation} mix-blend-multiply transition-all duration-1000`}
              style={{ 
                animationDelay: (item as any).delay || '0s',
                transform: `translate3d(${mousePos.x * item.factor}px, ${mousePos.y * item.factor}px, 0)`
              }}
            >
              {/* Individual element glow */}
              <div className="absolute inset-[-40px] bg-primary/5 blur-3xl rounded-full" />
              
              <div className={`${item.size} relative rounded-full overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-4 border-white/40`}>
                <Image 
                  src={imageData.imageUrl}
                  alt={imageData.description}
                  fill
                  className="object-cover scale-110"
                  data-ai-hint={imageData.imageHint}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#FDFCFB]/40 z-0" />
    </div>
  );
}