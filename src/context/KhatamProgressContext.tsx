import React, { createContext, useContext, useEffect, useState } from 'react';

const KHATAM_STORAGE_KEY = 'noor_quran_khatam_progress';

interface KhatamProgressContextType {
  completedSurahs: number[];
  toggleSurahCompletion: (surahNumber: number) => void;
  isSurahCompleted: (surahNumber: number) => boolean;
  progressPercentage: number;
}

const KhatamProgressContext = createContext<KhatamProgressContextType | undefined>(undefined);

export const KhatamProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [completedSurahs, setCompletedSurahs] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem(KHATAM_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load khatam progress from localStorage', e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(KHATAM_STORAGE_KEY, JSON.stringify(completedSurahs));
    } catch (e) {
      console.error('Failed to save khatam progress', e);
    }
  }, [completedSurahs]);

  const toggleSurahCompletion = (surahNumber: number) => {
    setCompletedSurahs((prev) =>
      prev.includes(surahNumber)
        ? prev.filter((s) => s !== surahNumber)
        : [...prev, surahNumber]
    );
  };

  const isSurahCompleted = (surahNumber: number) => completedSurahs.includes(surahNumber);

  const progressPercentage = Math.round((completedSurahs.length / 114) * 100);

  return (
    <KhatamProgressContext.Provider
      value={{
        completedSurahs,
        toggleSurahCompletion,
        isSurahCompleted,
        progressPercentage,
      }}
    >
      {children}
    </KhatamProgressContext.Provider>
  );
};

export function useKhatamProgress(): KhatamProgressContextType {
  const context = useContext(KhatamProgressContext);
  if (!context) {
    throw new Error('useKhatamProgress must be used within a KhatamProgressProvider');
  }
  return context;
}
