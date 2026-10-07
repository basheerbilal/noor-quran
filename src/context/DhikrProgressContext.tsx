import React, { createContext, useContext, useEffect, useState } from 'react';

const DHIKR_STORAGE_KEY = 'noor_quran_dhikr_progress';

export interface DhikrItem {
  id: string;
  name: string;
  target: number;
  count: number;
}

interface DhikrProgressContextType {
  dhikrItems: DhikrItem[];
  incrementDhikr: (id: string) => void;
  resetDhikr: (id: string) => void;
}

const DhikrProgressContext = createContext<DhikrProgressContextType | undefined>(undefined);

export const DhikrProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dhikrItems, setDhikrItems] = useState<DhikrItem[]>(() => {
    try {
      const stored = localStorage.getItem(DHIKR_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load dhikr progress from localStorage', e);
    }
    return [
      { id: '1', name: 'SubhanAllah', target: 33, count: 0 },
      { id: '2', name: 'Alhamdulillah', target: 33, count: 0 },
      { id: '3', name: 'AllahuAkbar', target: 34, count: 0 },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem(DHIKR_STORAGE_KEY, JSON.stringify(dhikrItems));
    } catch (e) {
      console.error('Failed to save dhikr progress', e);
    }
  }, [dhikrItems]);

  const incrementDhikr = (id: string) => {
    // Trigger haptic feedback
    if (window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
    setDhikrItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, count: Math.min(item.count + 1, item.target) } : item
      )
    );
  };

  const resetDhikr = (id: string) => {
    setDhikrItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, count: 0 } : item))
    );
  };

  return (
    <DhikrProgressContext.Provider
      value={{
        dhikrItems,
        incrementDhikr,
        resetDhikr,
      }}
    >
      {children}
    </DhikrProgressContext.Provider>
  );
};

export function useDhikrProgress(): DhikrProgressContextType {
  const context = useContext(DhikrProgressContext);
  if (!context) {
    throw new Error('useDhikrProgress must be used within a DhikrProgressProvider');
  }
  return context;
}
