"use client"

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ChefHat, Truck, Clock, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HeroBackground from '@/components/HeroBackground';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden selection:bg-primary selection:text-white bg-[#FDFCFB]">
      <HeroBackground />
      
      {/* Navigation */}
      <header className="fixed top-0 left-0 w-full p-8 flex justify-between items-center z-50">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
            <ChefHat className="text-white w-7 h-7" />
          </div>
          <span className="font-headline text-2xl font-black tracking-tighter text-foreground">Bhartiya Swad</span>
        </div>
        
        <nav className="flex gap-8 items-center">
          <Link href="/menu" className="hidden md:block">
            <span className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors cursor-pointer">Explore Menu</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="font-bold text-foreground/70 hover:text-primary rounded-xl px-6">Login</Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/20 font-black px-8 rounded-2xl h-12 transition-all hover:scale-105 active:scale-95">
                Sign Up
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Hero Content */}
      <main className="relative z-10 text-center max-w-5xl px-6 flex flex-col items-center">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/60 backdrop-blur-xl rounded-full border border-white/20 mb-12 shadow-sm animate-float-fast cursor-default">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
          </span>
          <span className="text-xs font-black uppercase tracking-[0.2em] text-primary/80">New: Premium Thalis Available!</span>
        </div>
        
        <h1 className="text-6xl md:text-[7rem] font-headline font-black mb-10 leading-[0.9] tracking-tighter text-foreground">
          Bhartiya Swad – <br />
          Taste of <span className="text-primary italic relative inline-block">
            India
            <div className="absolute -bottom-2 left-0 w-full h-3 bg-primary/10 rounded-full blur-md -z-10" />
          </span> <br />
          at Your <span className="text-accent underline decoration-[12px] underline-offset-[16px] decoration-accent/10">Doorstep</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground/80 mb-16 max-w-2xl mx-auto leading-relaxed font-medium">
          Authentic, Fresh, and Delivered Fast from your favorite Indian kitchens. Experience the true heart of Bharat.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-8 justify-center items-center w-full">
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto h-20 px-14 text-xl rounded-3xl shadow-[0_20px_60px_rgba(229,92,10,0.25)] bg-primary hover:bg-primary/90 group font-black transition-all hover:scale-105 active:scale-95 text-white">
              Start Your Order 
              <ArrowRight className="ml-4 w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
            </Button>
          </Link>
          <Link href="/menu" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto h-20 px-14 text-xl rounded-3xl backdrop-blur-md border-2 border-primary/10 font-black hover:bg-white hover:text-primary hover:border-primary/20 transition-all hover:scale-105 active:scale-95 shadow-lg bg-white/30">
              View Menu
            </Button>
          </Link>
        </div>

        {/* Features Minimalist */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-20 mt-32 max-w-4xl mx-auto opacity-60">
          {[
            { icon: ChefHat, label: "Top Chefs" },
            { icon: Truck, label: "Fast Delivery" },
            { icon: Clock, label: "24/7 Service" },
            { icon: Heart, label: "Fresh Food" }
          ].map((feature, i) => (
            <div key={i} className="flex flex-col items-center gap-4 group cursor-default transition-all hover:opacity-100">
              <div className="w-14 h-14 rounded-2xl bg-white shadow-xl flex items-center justify-center border border-border/50 group-hover:border-primary/20 group-hover:scale-110 transition-all duration-500">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <p className="font-black text-xs uppercase tracking-[0.2em] text-foreground">{feature.label}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer minimal */}
      <footer className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
        <div className="px-8 py-3 bg-white/20 backdrop-blur-2xl rounded-full border border-white/10 shadow-2xl flex items-center gap-8">
          <p className="text-[10px] text-foreground/30 font-black uppercase tracking-[0.4em]">
            © 2025 Bhartiya Swad. Pure Indian Taste.
          </p>
          <div className="flex gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-primary/20 animate-pulse" />
            <span className="w-1.5 h-1.5 rounded-full bg-accent/20 animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
        </div>
      </footer>
    </div>
  );
}
