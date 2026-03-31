"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser, useAuth as useFirebaseAuth } from '@/firebase';
import { browserLocalPersistence, setPersistence } from 'firebase/auth';
import toast from 'react-hot-toast';

type Role = 'user' | 'admin' | null;

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: Role;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const { user: firebaseUser, isUserLoading } = useUser();
  const auth = useFirebaseAuth();
  const [internalLoading, setInternalLoading] = useState(true);

  // 1. Explicit Persistence Setting
  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch(err => {
      console.warn("Persistence could not be set:", err);
    });
  }, [auth]);

  // 2. Path Persistence: Store last visited page
  useEffect(() => {
    if (typeof window !== 'undefined' && !isUserLoading) {
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/signup' && path !== '/') {
        localStorage.setItem('bhartiya_swad_last_page', path);
      }
    }
  }, [isUserLoading]);

  // 3. User State Synchronization & Unified Loading
  useEffect(() => {
    if (isUserLoading) {
      setInternalLoading(true);
      return;
    }

    if (firebaseUser) {
      const isEmailAdmin = firebaseUser.email === 'xyz@admin.com';
      const isAdminSession = typeof window !== 'undefined' && localStorage.getItem('bhartiya_swad_admin') === 'true';
      const isAdmin = isEmailAdmin || (isAdminSession && firebaseUser.email === 'xyz@admin.com');

      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Guest',
        role: isAdmin ? 'admin' : 'user',
        isAdmin: isAdmin
      });
    } else {
      setUser(null);
    }
    
    // Crucial: Give a small buffer for state to propagate
    const timer = setTimeout(() => setInternalLoading(false), 100);
    return () => clearTimeout(timer);
  }, [firebaseUser, isUserLoading]);

  // 4. 30-Minute Inactivity Timeout
  useEffect(() => {
    if (!firebaseUser) return;

    let timeout: NodeJS.Timeout;

    const resetTimer = () => {
      if (timeout) clearTimeout(timeout);
      
      timeout = setTimeout(() => {
        auth.signOut();
        if (typeof window !== 'undefined') {
          localStorage.removeItem('bhartiya_swad_admin');
        }
        toast("Session expired due to inactivity. Please login again.", {
          icon: '⏳',
          duration: 5000
        });
      }, 30 * 60 * 1000); // 30 minutes
    };

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      if (timeout) clearTimeout(timeout);
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [firebaseUser, auth]);

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bhartiya_swad_admin');
      localStorage.removeItem('bhartiya_swad_last_page');
    }
    auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading: internalLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
