'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase/client';
import type { DbPatient } from './supabase/types';

interface PatientAuthContextType {
  loading: boolean;
  patient: DbPatient | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (params: {
    email: string;
    password: string;
    fullName: string;
    cnic?: string;
    phone?: string;
    hospitalId: string;
  }) => Promise<{ needsEmailConfirmation: boolean }>;
  requestPasswordReset: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
}

const PatientAuthContext = createContext<PatientAuthContextType | undefined>(undefined);

// Finds or creates the Patient row for whoever is in the current session.
// Runs with an authenticated session, so it always satisfies RLS —
// unlike trying to write immediately after signUp(), which may still be
// unauthenticated if the project requires email confirmation first.
async function ensurePatientRecord(authUser: { id: string; email?: string; user_metadata?: any }): Promise<DbPatient | null> {
  const { data: existing } = await supabase.from('Patient').select('*').eq('authUserId', authUser.id).maybeSingle();
  if (existing) return existing as DbPatient;

  if (authUser.email) {
    const { data: unclaimed } = await supabase
      .from('Patient')
      .select('*')
      .eq('email', authUser.email)
      .is('authUserId', null)
      .maybeSingle();

    if (unclaimed) {
      const { data: claimed } = await supabase
        .from('Patient')
        .update({ authUserId: authUser.id })
        .eq('id', unclaimed.id)
        .select()
        .single();
      if (claimed) return claimed as DbPatient;
    }
  }

  const meta = authUser.user_metadata || {};
  const mrn = `MRN-${Date.now().toString().slice(-8)}`;
  const { data: created, error } = await supabase
    .from('Patient')
    .insert({
      authUserId: authUser.id,
      hospitalId: meta.hospitalId,
      mrn,
      fullName: meta.fullName || authUser.email || 'Patient',
      email: authUser.email || null,
      phone: meta.phone || null,
      cnic: meta.cnic || null,
      gender: 'OTHER',
      country: 'Pakistan',
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create patient record:', error.message);
    return null;
  }
  return created as DbPatient;
}

export function PatientAuthProvider({ children }: { children: React.ReactNode }) {
  const [patient, setPatient] = useState<DbPatient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const p = await ensurePatientRecord(session.user);
        setPatient(p);
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const p = await ensurePatientRecord(session.user);
        setPatient(p);
      } else {
        setPatient(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    if (data.user) setPatient(await ensurePatientRecord(data.user));
  };

  const register = async ({ email, password, fullName, cnic, phone, hospitalId }: {
    email: string; password: string; fullName: string; cnic?: string; phone?: string; hospitalId: string;
  }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { fullName, phone, cnic, hospitalId } },
    });
    if (error) throw new Error(error.message);

    if (data.session && data.user) {
      // Confirmation not required (or already auto-confirmed) — session is live now
      setPatient(await ensurePatientRecord(data.user));
      return { needsEmailConfirmation: false };
    }

    // No active session yet — Supabase is waiting on email confirmation.
    // The Patient record gets created automatically the first time they log in.
    return { needsEmailConfirmation: true };
  };

  const requestPasswordReset = async (email: string) => {
    const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/portal/reset-password` : undefined;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) throw new Error(error.message);
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(error.message);
  };

  const logout = () => {
    supabase.auth.signOut();
    setPatient(null);
  };

  return (
    <PatientAuthContext.Provider value={{ loading, patient, isAuthenticated: patient !== null, login, logout, register, requestPasswordReset, updatePassword }}>
      {children}
    </PatientAuthContext.Provider>
  );
}

export function usePatientAuth() {
  const context = useContext(PatientAuthContext);
  if (context === undefined) throw new Error('usePatientAuth must be used within PatientAuthProvider');
  return context;
}
