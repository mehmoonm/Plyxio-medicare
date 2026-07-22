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
  // Self-registration: creates the auth user, then either claims an existing
  // unclaimed Patient record (matched by email) or creates a brand new one.
  register: (params: {
    email: string;
    password: string;
    fullName: string;
    cnic?: string;
    phone?: string;
    hospitalId: string;
  }) => Promise<void>;
}

const PatientAuthContext = createContext<PatientAuthContextType | undefined>(undefined);

export function PatientAuthProvider({ children }: { children: React.ReactNode }) {
  const [patient, setPatient] = useState<DbPatient | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPatient = async (authUserId: string) => {
    const { data } = await supabase.from('Patient').select('*').eq('authUserId', authUserId).maybeSingle();
    setPatient(data as DbPatient | null);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadPatient(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadPatient(session.user.id);
      } else {
        setPatient(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    if (data.user) await loadPatient(data.user.id);
  };

  const register = async ({ email, password, fullName, cnic, phone, hospitalId }: {
    email: string; password: string; fullName: string; cnic?: string; phone?: string; hospitalId: string;
  }) => {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) throw new Error(signUpError.message);
    const authUserId = signUpData.user?.id;
    if (!authUserId) throw new Error('Registration did not return a user. Check your email to confirm your account, then log in.');

    // Try to claim an existing staff-created record with the same email that hasn't been claimed yet
    const { data: existing } = await supabase
      .from('Patient')
      .select('id')
      .eq('email', email)
      .is('authUserId', null)
      .maybeSingle();

    if (existing) {
      const { error: claimError } = await supabase.from('Patient').update({ authUserId }).eq('id', existing.id);
      if (claimError) throw new Error(claimError.message);
    } else {
      const mrn = `MRN-${Date.now().toString().slice(-8)}`;
      const { error: insertError } = await supabase.from('Patient').insert({
        authUserId,
        hospitalId,
        mrn,
        fullName,
        email,
        cnic: cnic || null,
        phone: phone || null,
        gender: 'OTHER',
        country: 'Pakistan',
      });
      if (insertError) throw new Error(insertError.message);
    }

    await loadPatient(authUserId);
  };

  const logout = () => {
    supabase.auth.signOut();
    setPatient(null);
  };

  return (
    <PatientAuthContext.Provider value={{ loading, patient, isAuthenticated: patient !== null, login, logout, register }}>
      {children}
    </PatientAuthContext.Provider>
  );
}

export function usePatientAuth() {
  const context = useContext(PatientAuthContext);
  if (context === undefined) throw new Error('usePatientAuth must be used within PatientAuthProvider');
  return context;
}
