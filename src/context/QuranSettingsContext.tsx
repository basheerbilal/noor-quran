import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserSettings, ThemeMode } from '../types';

const DEFAULT_SETTINGS: UserSettings = {
  arabicFontSize: 32,
  translationFontSize: 16,
  lineHeight: 2.2,
  arabicFont: 'amiri',
  translationEdition: 'en.sahih',
  reciterEdition: 'ar.alafasy',
  displayMode: 'both',
  theme: 'mushaf', // Default: Al-Quran Al-Karim (alquran.cloud) Royal Mushaf Theme
  autoSaveLastRead: true,
  rememberSettings: true,
  reducedMotion: false,
};

const SETTINGS_STORAGE_KEY = 'noor_quran_settings';

interface QuranSettingsContextType {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  resetSettings: () => void;
  toggleTheme: () => void;
}

const QuranSettingsContext = createContext<QuranSettingsContextType | undefined>(undefined);

export const QuranSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (e) {
      console.error('Failed to load Quran settings from localStorage', e);
    }
    return DEFAULT_SETTINGS;
  });

  // Apply theme classes to document root
  useEffect(() => {
    const root = document.documentElement;
    const isDark =
      settings.theme === 'dark' ||
      (settings.theme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
    const isMushaf = settings.theme === 'mushaf';

    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('theme-mushaf');
    } else if (isMushaf) {
      root.classList.remove('dark');
      root.classList.add('theme-mushaf');
    } else {
      root.classList.remove('dark');
      root.classList.remove('theme-mushaf');
    }
  }, [settings.theme]);

  // Persist to localStorage
  useEffect(() => {
    if (settings.rememberSettings) {
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      } catch (e) {
        console.error('Failed to persist settings', e);
      }
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  const toggleTheme = () => {
    setSettings((prev) => {
      const nextTheme: ThemeMode =
        prev.theme === 'mushaf' ? 'dark' : prev.theme === 'dark' ? 'light' : 'mushaf';
      return { ...prev, theme: nextTheme };
    });
  };

  return (
    <QuranSettingsContext.Provider
      value={{
        settings,
        updateSettings,
        resetSettings,
        toggleTheme,
      }}
    >
      {children}
    </QuranSettingsContext.Provider>
  );
};

export function useQuranSettings(): QuranSettingsContextType {
  const context = useContext(QuranSettingsContext);
  if (!context) {
    throw new Error('useQuranSettings must be used within a QuranSettingsProvider');
  }
  return context;
}
