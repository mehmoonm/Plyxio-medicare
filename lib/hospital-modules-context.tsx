'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase/client';
import { useAuth } from './auth-context';

export type ModuleKey = 'admissions' | 'lab' | 'radiology' | 'inventory' | 'billing' | 'messaging';

// New hospitals start on the basic plan -- these paid add-on modules are
// off until a platform admin enables them for a hospital's plan.
const DEFAULT_MODULES: Record<ModuleKey, boolean> = {
  admissions: false,
  lab: false,
  radiology: false,
  inventory: false,
  billing: false,
  messaging: false,
};

interface ModulesContextType {
  modules: Record<ModuleKey, boolean>;
  loading: boolean;
  isEnabled: (key: ModuleKey) => boolean;
  updateModules: (updates: Partial<Record<ModuleKey, boolean>>) => Promise<{ error?: string }>;
  subscriptionStatus: string | null;
}

const ModulesContext = createContext<ModulesContextType | undefined>(undefined);

export function ModulesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [modules, setModules] = useState<Record<ModuleKey, boolean>>(DEFAULT_MODULES);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user?.hospitalId) { setLoading(false); return; }
    const { data } = await supabase.from('Hospital').select('enabledModules, subscriptionStatus').eq('id', user.hospitalId).single();
    if (data?.enabledModules) {
      setModules({ ...DEFAULT_MODULES, ...data.enabledModules });
    }
    setSubscriptionStatus(data?.subscriptionStatus || null);
    setLoading(false);
  }, [user?.hospitalId]);

  useEffect(() => { load(); }, [load]);

  const isEnabled = (key: ModuleKey) => modules[key] !== false;

  const updateModules = async (updates: Partial<Record<ModuleKey, boolean>>) => {
    if (!user?.hospitalId) return { error: 'No hospital context' };
    const next = { ...modules, ...updates };
    const { error } = await supabase.from('Hospital').update({ enabledModules: next }).eq('id', user.hospitalId);
    if (error) return { error: error.message };
    setModules(next);
    return {};
  };

  return (
    <ModulesContext.Provider value={{ modules, loading, isEnabled, updateModules, subscriptionStatus }}>
      {children}
    </ModulesContext.Provider>
  );
}

export function useModules() {
  const context = useContext(ModulesContext);
  if (context === undefined) throw new Error('useModules must be used within ModulesProvider');
  return context;
}
