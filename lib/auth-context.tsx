'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase/client';
import type { DbUser } from './supabase/types';

interface AuthContextType {
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  user: DbUser | null;
  requestPasswordReset: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  mfaChallenge: { factorId: string; challengeId: string } | null;
  verifyMfaCode: (code: string) => Promise<void>;
  cancelMfaChallenge: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DbUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [mfaChallenge, setMfaChallenge] = useState<{ factorId: string; challengeId: string } | null>(null);

  const loadProfile = async (authUserId: string) => {
    const { data, error } = await supabase
      .from('User')
      .select('*')
      .eq('id', authUserId)
      .single();
    if (!error && data) {
      setUser(data as DbUser);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setUser(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);

    // If this account has 2FA enrolled, the session so far only reaches
    // aal1 -- we need a verified TOTP code before it's actually usable.
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal && aal.nextLevel === 'aal2' && aal.currentLevel !== aal.nextLevel) {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totpFactor = factors?.totp?.find((f) => f.status === 'verified');
      if (totpFactor) {
        const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: totpFactor.id });
        if (challengeError) throw new Error(challengeError.message);
        setMfaChallenge({ factorId: totpFactor.id, challengeId: challenge.id });
        return; // Wait for verifyMfaCode() before completing sign-in
      }
    }

    if (data.user) await loadProfile(data.user.id);
  };

  const verifyMfaCode = async (code: string) => {
    if (!mfaChallenge) return;
    const { error } = await supabase.auth.mfa.verify({
      factorId: mfaChallenge.factorId,
      challengeId: mfaChallenge.challengeId,
      code,
    });
    if (error) throw new Error(error.message);
    setMfaChallenge(null);
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) await loadProfile(session.user.id);
  };

  const cancelMfaChallenge = () => {
    setMfaChallenge(null);
    supabase.auth.signOut();
  };

  const logout = () => {
    supabase.auth.signOut();
    setUser(null);
  };

  const requestPasswordReset = async (email: string) => {
    const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : undefined;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) throw new Error(error.message);
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(error.message);
  };

  return (
    <AuthContext.Provider
      value={{
        loading,
        login,
        logout,
        isAuthenticated: user !== null,
        user,
        requestPasswordReset,
        updatePassword,
        mfaChallenge,
        verifyMfaCode,
        cancelMfaChallenge,
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
