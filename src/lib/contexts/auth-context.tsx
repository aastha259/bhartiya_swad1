
"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser, useAuth as useFirebaseAuth } from '@/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

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
  login: (email: string, role: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const { user: firebaseUser, isUserLoading } = useUser();
  const auth = useFirebaseAuth();

  useEffect(() => {
    if (!isUserLoading) {
      if (firebaseUser) {
        // In a real app, we'd fetch the role from Firestore. 
        // For this prototype, we'll check the email for admin status.
        const isAdmin = firebaseUser.email === 'xyz@admin.com';
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
    }
  }, [firebaseUser, isUserLoading]);

  const login = (email: string, role: Role) => {
    // This is now handled via Firebase Auth sign-in in the login page
  };

  const logout = () => {
    auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading: isUserLoading, login, logout }}>
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
