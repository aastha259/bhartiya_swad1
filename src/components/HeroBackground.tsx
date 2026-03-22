"use client"

import React from 'react';
import dynamic from 'next/dynamic';

const ThreeBackground = dynamic(() => import('@/components/ThreeBackground'), { 
  ssr: false,
  loading: () => <div className="fixed inset-0 -z-10 bg-background" />
});

export default function HeroBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {/* Background radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_var(--tw-gradient-from)_0%,_transparent_70%)] from-primary/5" />
      
      <ThreeBackground />
      
      {/* Animated Blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] animate-float opacity-60" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[80px] animate-float opacity-40" style={{ animationDelay: '2s' }} />
      
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/20" />
    </div>
  );
}
