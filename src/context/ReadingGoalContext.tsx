import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { ReadingGoalData, DayReadingActivity } from '../types';
import {
  getLocalTodayDateString,
  getYesterdayDateString,
  getDayDifference,
  computeLast7DaysActivity,
} from '../utils/readingGoalUtils';
import { toast } from '../utils/toast';

const GOAL_STORAGE_KEY = 'noor_quran_reading_goal_data';
const DEFAULT_DAILY_TARGET = 10;

interface ReadingGoalContextType {
  dailyTarget: number;
  todayAyahsRead: number;
  todayProgressPercentage: number;
  currentStreak: number;
  longestStreak: number;
  isGoalMetToday: boolean;
  history: Record<string, number>;
  recentDaysActivity: DayReadingActivity[];
  notificationsEnabled: boolean;
  readAyahKeysToday: string[];
  isGoalModalOpen: boolean;
  setDailyTarget: (count: number) => void;
  recordAyahRead: (surahNumber: number, ayahNumber: number, silent?: boolean) => boolean;
  unrecordAyahRead: (surahNumber: number, ayahNumber: number) => void;
  recordAyahsCount: (count: number, silent?: boolean) => void;
  isAyahReadToday: (surahNumber: number, ayahNumber: number) => boolean;
  resetTodayProgress: () => void;
  toggleNotifications: () => void;
  openGoalModal: () => void;
  closeGoalModal: () => void;
}

const ReadingGoalContext = createContext<ReadingGoalContextType | undefined>(undefined);

function getInitialGoalData(): ReadingGoalData {
  const todayStr = getLocalTodayDateString();
  const defaultState: ReadingGoalData = {
    dailyTarget: DEFAULT_DAILY_TARGET,
    todayDate: todayStr,
    todayAyahsRead: 0,
    readAyahKeysToday: [],
    currentStreak: 0,
    longestStreak: 0,
    lastGoalMetDate: '',
    lastActiveDate: '',
    history: {},
    notificationsEnabled: true,
    celebratedMilestonesToday: [],
  };

  try {
    const raw = localStorage.getItem(GOAL_STORAGE_KEY);
    if (!raw) return defaultState;

    const parsed: Partial<ReadingGoalData> = JSON.parse(raw);
    const storedDate = parsed.todayDate || '';

    // If still the same day, restore everything directly
    if (storedDate === todayStr) {
      return {
        dailyTarget: parsed.dailyTarget || DEFAULT_DAILY_TARGET,
        todayDate: todayStr,
        todayAyahsRead: parsed.todayAyahsRead || 0,
        readAyahKeysToday: parsed.readAyahKeysToday || [],
        currentStreak: parsed.currentStreak || 0,
        longestStreak: parsed.longestStreak || 0,
        lastGoalMetDate: parsed.lastGoalMetDate || '',
        lastActiveDate: parsed.lastActiveDate || '',
        history: parsed.history || {},
        notificationsEnabled: parsed.notificationsEnabled ?? true,
        celebratedMilestonesToday: parsed.celebratedMilestonesToday || [],
      };
    }

    // It's a new day! Calculate streak preservation
    const yesterday = getYesterdayDateString(todayStr);
    const lastGoalMet = parsed.lastGoalMetDate || '';
    const wasGoalMetYesterday = lastGoalMet === yesterday;
    const dayDiff = getDayDifference(lastGoalMet, todayStr);

    let streak = parsed.currentStreak || 0;
    // If the last goal met was NOT yesterday, the streak is broken
    if (!wasGoalMetYesterday && dayDiff > 1) {
      streak = 0;
    }

    const newData: ReadingGoalData = {
      dailyTarget: parsed.dailyTarget || DEFAULT_DAILY_TARGET,
      todayDate: todayStr,
      todayAyahsRead: 0,
      readAyahKeysToday: [],
      currentStreak: streak,
      longestStreak: parsed.longestStreak || 0,
      lastGoalMetDate: lastGoalMet,
      lastActiveDate: parsed.lastActiveDate || '',
      history: parsed.history || {},
      notificationsEnabled: parsed.notificationsEnabled ?? true,
      celebratedMilestonesToday: [],
    };

    localStorage.setItem(GOAL_STORAGE_KEY, JSON.stringify(newData));
    return newData;
  } catch (e) {
    console.error('Failed to load reading goal data from localStorage', e);
    return defaultState;
  }
}

export const ReadingGoalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<ReadingGoalData>(getInitialGoalData);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  // Sync to localStorage whenever data changes
  const saveGoalData = useCallback((updated: ReadingGoalData) => {
    setData(updated);
    try {
      localStorage.setItem(GOAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to persist reading goal data', e);
    }
  }, []);

  // Periodic day transition check (e.g., if user leaves app open past midnight)
  useEffect(() => {
    const checkDayTransition = () => {
      const currentToday = getLocalTodayDateString();
      if (data.todayDate !== currentToday) {
        setData((prev) => {
          const yesterday = getYesterdayDateString(currentToday);
          const wasGoalMetYesterday = prev.lastGoalMetDate === yesterday;
          const dayDiff = getDayDifference(prev.lastGoalMetDate, currentToday);

          let streak = prev.currentStreak;
          if (!wasGoalMetYesterday && dayDiff > 1) {
            streak = 0;
          }

          const refreshed: ReadingGoalData = {
            ...prev,
            todayDate: currentToday,
            todayAyahsRead: 0,
            readAyahKeysToday: [],
            currentStreak: streak,
            celebratedMilestonesToday: [],
          };
          try {
            localStorage.setItem(GOAL_STORAGE_KEY, JSON.stringify(refreshed));
          } catch (e) {
            console.error('Error saving transitioned goal data', e);
          }
          return refreshed;
        });
      }
    };

    const interval = setInterval(checkDayTransition, 60000); // check every minute
    return () => clearInterval(interval);
  }, [data.todayDate]);

  const setDailyTarget = useCallback((target: number) => {
    const sanitized = Math.max(1, Math.min(286, Math.round(target)));
    setData((prev) => {
      const updated: ReadingGoalData = {
        ...prev,
        dailyTarget: sanitized,
      };

      // Check if lowering the target met the goal right now
      if (
        updated.todayAyahsRead >= sanitized &&
        prev.lastGoalMetDate !== prev.todayDate
      ) {
        const yesterday = getYesterdayDateString(prev.todayDate);
        const continuedStreak =
          prev.lastGoalMetDate === yesterday ? prev.currentStreak + 1 : 1;
        updated.currentStreak = continuedStreak;
        updated.longestStreak = Math.max(prev.longestStreak, continuedStreak);
        updated.lastGoalMetDate = prev.todayDate;
        if (!updated.celebratedMilestonesToday.includes(100)) {
          updated.celebratedMilestonesToday = [...updated.celebratedMilestonesToday, 100];
        }

        if (updated.notificationsEnabled) {
          toast.success(
            `Target updated to ${sanitized} Ayahs. Today's goal is complete! 🔥 Current streak: ${continuedStreak} day(s).`,
            { title: '🎉 Daily Reading Goal Reached!' }
          );
        }
      }

      try {
        localStorage.setItem(GOAL_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save updated target', e);
      }
      return updated;
    });
  }, []);

  const isAyahReadToday = useCallback(
    (surahNumber: number, ayahNumber: number) => {
      const key = `${surahNumber}:${ayahNumber}`;
      return data.readAyahKeysToday.includes(key);
    },
    [data.readAyahKeysToday]
  );

  const recordAyahRead = useCallback(
    (surahNumber: number, ayahNumber: number, silent: boolean = false): boolean => {
      const key = `${surahNumber}:${ayahNumber}`;
      if (data.readAyahKeysToday.includes(key)) {
        return false;
      }

      const todayStr = getLocalTodayDateString();
      const newCount = data.todayAyahsRead + 1;
      const newKeys = [...data.readAyahKeysToday, key];
      const newHistory = { ...data.history, [todayStr]: newCount };
      const target = data.dailyTarget;

      let newStreak = data.currentStreak;
      let newLongest = data.longestStreak;
      let newLastGoalMet = data.lastGoalMetDate;
      const newMilestones = [...data.celebratedMilestonesToday];

      // Check 100% goal achievement
      if (newCount >= target && newLastGoalMet !== todayStr) {
        const yesterday = getYesterdayDateString(todayStr);
        newStreak = newLastGoalMet === yesterday ? data.currentStreak + 1 : 1;
        newLongest = Math.max(data.longestStreak, newStreak);
        newLastGoalMet = todayStr;

        if (!newMilestones.includes(100)) {
          newMilestones.push(100);
          if (data.notificationsEnabled && !silent) {
            toast.success(
              `Mabrook! You reached your goal of ${target} Ayahs today. 🔥 ${newStreak}-day streak!`,
              { title: '🎉 Daily Goal Complete!' }
            );
          }
        }
      } else if (
        newCount === Math.floor(target / 2) &&
        target >= 8 &&
        !newMilestones.includes(50)
      ) {
        // Halfway notification
        newMilestones.push(50);
        if (data.notificationsEnabled && !silent) {
          toast.info(
            `You have read ${newCount} of ${target} Ayahs today. Keep the blessed momentum going!`,
            { title: '🌟 Halfway to Daily Goal' }
          );
        }
      }

      const updated: ReadingGoalData = {
        ...data,
        todayDate: todayStr,
        todayAyahsRead: newCount,
        readAyahKeysToday: newKeys,
        currentStreak: newStreak,
        longestStreak: newLongest,
        lastGoalMetDate: newLastGoalMet,
        lastActiveDate: todayStr,
        history: newHistory,
        celebratedMilestonesToday: newMilestones,
      };

      saveGoalData(updated);
      return true;
    },
    [data, saveGoalData]
  );

  const unrecordAyahRead = useCallback(
    (surahNumber: number, ayahNumber: number) => {
      const key = `${surahNumber}:${ayahNumber}`;
      if (!data.readAyahKeysToday.includes(key)) return;

      const newKeys = data.readAyahKeysToday.filter((k) => k !== key);
      const newCount = Math.max(0, data.todayAyahsRead - 1);
      const todayStr = getLocalTodayDateString();
      const newHistory = { ...data.history, [todayStr]: newCount };

      const updated: ReadingGoalData = {
        ...data,
        todayAyahsRead: newCount,
        readAyahKeysToday: newKeys,
        history: newHistory,
      };

      saveGoalData(updated);
    },
    [data, saveGoalData]
  );

  const recordAyahsCount = useCallback(
    (increment: number, silent: boolean = false) => {
      if (increment <= 0) return;
      const todayStr = getLocalTodayDateString();
      const newCount = data.todayAyahsRead + increment;
      const newHistory = { ...data.history, [todayStr]: newCount };
      const target = data.dailyTarget;

      let newStreak = data.currentStreak;
      let newLongest = data.longestStreak;
      let newLastGoalMet = data.lastGoalMetDate;
      const newMilestones = [...data.celebratedMilestonesToday];

      if (newCount >= target && newLastGoalMet !== todayStr) {
        const yesterday = getYesterdayDateString(todayStr);
        newStreak = newLastGoalMet === yesterday ? data.currentStreak + 1 : 1;
        newLongest = Math.max(data.longestStreak, newStreak);
        newLastGoalMet = todayStr;

        if (!newMilestones.includes(100)) {
          newMilestones.push(100);
          if (data.notificationsEnabled && !silent) {
            toast.success(
              `Mabrook! You logged +${increment} Ayahs (${newCount}/${target}). 🔥 ${newStreak}-day streak!`,
              { title: '🎉 Daily Goal Complete!' }
            );
          }
        }
      } else if (!silent) {
        toast.success(`Logged +${increment} Ayahs towards today's goal (${newCount}/${target}).`, {
          title: '📖 Progress Recorded',
        });
      }

      const updated: ReadingGoalData = {
        ...data,
        todayDate: todayStr,
        todayAyahsRead: newCount,
        currentStreak: newStreak,
        longestStreak: newLongest,
        lastGoalMetDate: newLastGoalMet,
        lastActiveDate: todayStr,
        history: newHistory,
        celebratedMilestonesToday: newMilestones,
      };

      saveGoalData(updated);
    },
    [data, saveGoalData]
  );

  const resetTodayProgress = useCallback(() => {
    const todayStr = getLocalTodayDateString();
    const newHistory = { ...data.history, [todayStr]: 0 };
    const updated: ReadingGoalData = {
      ...data,
      todayAyahsRead: 0,
      readAyahKeysToday: [],
      history: newHistory,
      celebratedMilestonesToday: [],
    };
    saveGoalData(updated);
    toast.info("Today's read Ayah progress has been reset.", { title: 'Goal Progress Reset' });
  }, [data, saveGoalData]);

  const toggleNotifications = useCallback(() => {
    setData((prev) => {
      const nextVal = !prev.notificationsEnabled;
      const updated = { ...prev, notificationsEnabled: nextVal };
      try {
        localStorage.setItem(GOAL_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save notification preference', e);
      }
      toast.info(
        nextVal
          ? 'Daily reading progress and streak notifications enabled.'
          : 'Daily reading goal notifications muted.',
        { title: 'Notification Settings' }
      );
      return updated;
    });
  }, []);

  const todayProgressPercentage = useMemo(() => {
    if (data.dailyTarget <= 0) return 0;
    return Math.min(100, Math.round((data.todayAyahsRead / data.dailyTarget) * 100));
  }, [data.todayAyahsRead, data.dailyTarget]);

  const isGoalMetToday = useMemo(() => {
    return data.todayAyahsRead >= data.dailyTarget && data.dailyTarget > 0;
  }, [data.todayAyahsRead, data.dailyTarget]);

  const recentDaysActivity = useMemo(() => {
    return computeLast7DaysActivity(data.history, data.dailyTarget, data.todayDate);
  }, [data.history, data.dailyTarget, data.todayDate]);

  return (
    <ReadingGoalContext.Provider
      value={{
        dailyTarget: data.dailyTarget,
        todayAyahsRead: data.todayAyahsRead,
        todayProgressPercentage,
        currentStreak: data.currentStreak,
        longestStreak: data.longestStreak,
        isGoalMetToday,
        history: data.history,
        recentDaysActivity,
        notificationsEnabled: data.notificationsEnabled,
        readAyahKeysToday: data.readAyahKeysToday,
        isGoalModalOpen,
        setDailyTarget,
        recordAyahRead,
        unrecordAyahRead,
        recordAyahsCount,
        isAyahReadToday,
        resetTodayProgress,
        toggleNotifications,
        openGoalModal: () => setIsGoalModalOpen(true),
        closeGoalModal: () => setIsGoalModalOpen(false),
      }}
    >
      {children}
    </ReadingGoalContext.Provider>
  );
};

export function useReadingGoal(): ReadingGoalContextType {
  const context = useContext(ReadingGoalContext);
  if (!context) {
    throw new Error('useReadingGoal must be used within a ReadingGoalProvider');
  }
  return context;
}
