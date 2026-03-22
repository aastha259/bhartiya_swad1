"use client"

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ChefHat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HeroBackground from '@/components/HeroBackground';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden selection:bg-primary selection:text-white bg-[#FDFCFB]">
      <HeroBackground />
      
      {/* Top Notification Pill */}
      <div className="absolute top-8 left-0 w-full flex justify-center z-50 pointer-events-none">
        <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/60 backdrop-blur-xl rounded-full border border-black/5 shadow-sm animate-float-slow">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
          </span>
          <span className="text-xs font-black text-foreground/80 tracking-tight">New: Premium Thalis Available!</span>
        </div>
      </div>

      {/* Navigation */}
      <header className="fixed top-0 left-0 w-full p-10 flex justify-between items-center z-50">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-11 h-11 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20 transition-transform group-hover:scale-105">
            <ChefHat className="text-white w-6 h-6" />
          </div>
          <span className="font-headline text-2xl font-black tracking-tighter text-[#3D2B1F]">Bhartiya Swad</span>
        </div>
        
        <nav className="flex gap-12 items-center">
          <Link href="/menu" className="text-sm font-black text-primary hover:opacity-70 transition-opacity">
            Explore Menu
          </Link>
          <Link href="/login" className="text-sm font-black text-[#3D2B1F]/60 hover:text-primary transition-colors">
            Login
          </Link>
          <Link href="/signup">
            <Button className="bg-primary hover:bg-primary/90 text-white shadow-[0_15px_40px_rgba(229,92,10,0.3)] font-black px-10 rounded-2xl h-14 transition-all hover:scale-105 active:scale-95">
              Sign Up
            </Button>
          </Link>
        </nav>
      </header>

      {/* Main Hero Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pt-24">
        <div className="max-w-7xl mx-auto space-y-14">
          <h1 className="text-7xl md:text-[9.5rem] font-headline font-black text-[#3D2B1F] leading-[0.82] tracking-tighter">
            Taste of <span className="text-primary italic">India</span> at<br />
            Your <span className="relative inline-block">
              Doorstep
              <div className="absolute -bottom-6 left-0 w-full h-[14px] bg-accent/90 rounded-full" />
            </span>
          </h1>
          
          <p className="text-xl md:text-3xl text-[#3D2B1F]/50 max-w-4xl mx-auto leading-relaxed font-medium pt-6">
            Bhartiya Swad brings you the most authentic flavors from<br className="hidden md:block" /> 
            the streets of Mumbai to the heart of Delhi. Authentic,<br className="hidden md:block" /> 
            Fresh, and Delivered Fast.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center pt-10">
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-24 px-16 text-2xl rounded-[3rem] shadow-[0_25px_60px_rgba(229,92,10,0.4)] bg-primary hover:bg-primary/90 group font-black transition-all hover:scale-105 active:scale-95 text-white">
                Start Your Order 
                <ArrowRight className="ml-4 w-7 h-7 group-hover:translate-x-2 transition-transform duration-300" />
              </Button>
            </Link>
            <Link href="/menu" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-24 px-16 text-2xl rounded-[3rem] border-none bg-white shadow-2xl shadow-black/5 font-black hover:bg-white/80 transition-all hover:scale-105 active:scale-95 text-[#3D2B1F]">
                View Menu
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full p-16 flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 opacity-30 mb-2">
          <ChefHat className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.6em]">Bhartiya Swad</span>
        </div>
        <p className="text-[11px] text-[#3D2B1F]/20 font-black uppercase tracking-[0.5em]">
          © 2025 Pure Indian Taste. Delivered with Love.
        </p>
      </footer>

      {/* Floating Decorative Brand Icon */}
      <div className="fixed bottom-10 left-10 z-50">
        <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center shadow-2xl group cursor-pointer transition-transform hover:rotate-12 hover:scale-110">
          <span className="text-white font-headline font-black text-xl">B</span>
        </div>
      </div>
    </div>
  );
}