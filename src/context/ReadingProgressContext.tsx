import React, { createContext, useContext, useEffect, useState } from 'react';
import { ReadingProgress } from '../types';

const PROGRESS_STORAGE_KEY = 'noor_quran_last_read';

interface ReadingProgressContextType {
  lastRead: ReadingProgress | null;
  saveProgress: (
    surahNumber: number,
    surahName: string,
    surahEnglishName: string,
    ayahNumber: number,
    totalAyahs: number,
    scrollPosition?: number
  ) => void;
  clearProgress: () => void;
}

const ReadingProgressContext = createContext<ReadingProgressContextType | undefined>(undefined);

export const ReadingProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lastRead, setLastRead] = useState<ReadingProgress | null>(() => {
    try {
      const stored = localStorage.getItem(PROGRESS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load reading progress from localStorage', e);
    }
    return null;
  });

  const saveProgress = (
    surahNumber: number,
    surahName: string,
    surahEnglishName: string,
    ayahNumber: number,
    totalAyahs: number,
    scrollPosition?: number
  ) => {
    const progressPercentage = Math.min(
      100,
      Math.max(1, Math.round((ayahNumber / Math.max(1, totalAyahs)) * 100))
    );

    const data: ReadingProgress = {
      surahNumber,
      surahName,
      surahEnglishName,
      ayahNumber,
      totalAyahs,
      progressPercentage,
      scrollPosition,
      timestamp: Date.now(),
    };

    setLastRead(data);
    try {
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save reading progress', e);
    }
  };

  const clearProgress = () => {
    setLastRead(null);
    try {
      localStorage.removeItem(PROGRESS_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear reading progress', e);
    }
  };

  return (
    <ReadingProgressContext.Provider
      value={{
        lastRead,
        saveProgress,
        clearProgress,
      }}
    >
      {children}
    </ReadingProgressContext.Provider>
  );
};

export function useReadingProgress(): ReadingProgressContextType {
  const context = useContext(ReadingProgressContext);
  if (!context) {
    throw new Error('useReadingProgress must be used within a ReadingProgressProvider');
  }
  return context;
}
