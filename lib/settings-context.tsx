'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface BrandSettings {
  primaryColor: string;
  accentColor: string;
  logo: string | null;
  hospitalName: string;
}

const defaultSettings: BrandSettings = {
  primaryColor: '#6366f1',
  accentColor: '#06b6d4',
  logo: null,
  hospitalName: 'MediCare',
};

interface SettingsContextType {
  settings: BrandSettings;
  updateSettings: (settings: Partial<BrandSettings>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<BrandSettings>(defaultSettings);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem('hospitalSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
    setMounted(true);
  }, []);

  const updateSettings = (newSettings: Partial<BrandSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('hospitalSettings', JSON.stringify(updated));
    
    // Apply colors to CSS variables
    if (newSettings.primaryColor) {
      document.documentElement.style.setProperty('--primary-custom', newSettings.primaryColor);
    }
    if (newSettings.accentColor) {
      document.documentElement.style.setProperty('--accent-custom', newSettings.accentColor);
    }
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('hospitalSettings');
    document.documentElement.style.removeProperty('--primary-custom');
    document.documentElement.style.removeProperty('--accent-custom');
  };

  if (!mounted) return <>{children}</>;

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      <style>{`
        :root {
          --primary-custom: ${settings.primaryColor};
          --accent-custom: ${settings.accentColor};
        }
      `}</style>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}
