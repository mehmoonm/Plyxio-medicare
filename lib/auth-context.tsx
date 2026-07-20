'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from './types';
import { mockUsers } from './mock-data';

interface AuthContextType {
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  user: User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Load session from localStorage on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('hospital_session');
    if (savedSession) {
      try {
        setSession(JSON.parse(savedSession));
      } catch (error) {
        localStorage.removeItem('hospital_session');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const user = mockUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const newSession: Session = {
      user,
      token: `token_${Date.now()}`,
    };

    setSession(newSession);
    localStorage.setItem('hospital_session', JSON.stringify(newSession));
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem('hospital_session');
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        loading,
        login,
        logout,
        isAuthenticated: session !== null,
        user: session?.user || null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
