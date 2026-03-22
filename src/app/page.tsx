"use client"

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ChefHat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HeroBackground from '@/components/HeroBackground';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden selection:bg-primary selection:text-white bg-background">
      <HeroBackground />
      
      {/* Navigation */}
      <header className="fixed top-0 left-0 w-full p-6 md:p-10 flex justify-between items-center z-50">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
            <ChefHat className="text-white w-6 h-6" />
          </div>
          <span className="font-headline text-xl font-black tracking-tight text-foreground">Bhartiya Swad</span>
        </div>
        
        <nav className="flex gap-8 items-center">
          <Link href="/menu" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
            Menu
          </Link>
          <Link href="/login" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
            Login
          </Link>
          <Link href="/signup">
            <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg font-bold px-6 rounded-xl h-11 transition-all hover:scale-105 active:scale-95">
              Sign Up
            </Button>
          </Link>
        </nav>
      </header>

      {/* Main Hero Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-5xl md:text-7xl font-headline font-black text-foreground leading-tight tracking-tight">
            Taste of <span className="text-primary">India</span> at Your Doorstep
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
            Bhartiya Swad brings you the most authentic flavors from across the sub-continent. Fresh, flavorful, and delivered fast.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-2xl shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 group font-bold transition-all hover:scale-105 active:scale-95 text-white">
                Start Your Order 
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/menu" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg rounded-2xl bg-white/50 backdrop-blur-sm shadow-md font-bold hover:bg-white transition-all hover:scale-105 active:scale-95">
                View Menu
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full p-10 flex flex-col items-center gap-4 border-t bg-white/30 backdrop-blur-sm">
        <div className="flex items-center gap-2 opacity-50 mb-2">
          <ChefHat className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">Bhartiya Swad</span>
        </div>
        <p className="text-xs text-muted-foreground font-medium">
          © 2025 Bhartiya Swad. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
