import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Flame,
  Target,
  Trophy,
  CheckCircle2,
  Bell,
  BellOff,
  Plus,
  Minus,
  RotateCcw,
  X,
  BookOpen,
  Sparkles,
  Calendar,
  Check,
} from 'lucide-react';
import { useReadingGoal } from '../context/ReadingGoalContext';
import { READING_GOAL_PRESETS, READING_GOAL_HADITHS } from '../utils/readingGoalUtils';

interface ReadingGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReadingGoalModal: React.FC<ReadingGoalModalProps> = ({ isOpen, onClose }) => {
  const {
    dailyTarget,
    todayAyahsRead,
    todayProgressPercentage,
    currentStreak,
    longestStreak,
    isGoalMetToday,
    recentDaysActivity,
    notificationsEnabled,
    setDailyTarget,
    recordAyahsCount,
    resetTodayProgress,
    toggleNotifications,
  } = useReadingGoal();

  const [customTarget, setCustomTarget] = useState<number>(dailyTarget);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  // Keep custom target in sync with current dailyTarget
  React.useEffect(() => {
    setCustomTarget(dailyTarget);
  }, [dailyTarget]);

  if (!isOpen) return null;

  const randomHadith = READING_GOAL_HADITHS[0];

  const handleApplyCustomTarget = (value: number) => {
    const val = Math.max(1, Math.min(286, value));
    setCustomTarget(val);
    setDailyTarget(val);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="relative w-full max-w-lg rounded-3xl bg-[#fcfaf6] dark:bg-[#0c1412] border border-emerald-900/20 dark:border-emerald-800/40 shadow-2xl p-5 sm:p-7 overflow-hidden z-10 space-y-6 my-8"
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/30 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-xs">
                <Flame className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight text-emerald-950 dark:text-emerald-50 font-['Cinzel',serif]">
                  Daily Reading Goal
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Build a blessed daily habit of reciting the Sacred Quran
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-emerald-950/5 dark:hover:bg-emerald-950/30 transition-colors cursor-pointer"
              aria-label="Close modal"
              id="close-reading-goal-modal-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Today's Progress & Streak Banner */}
          <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-emerald-950/5 via-amber-500/5 to-emerald-900/10 dark:from-emerald-950/40 dark:via-amber-500/10 dark:to-emerald-900/20 border border-emerald-900/15 dark:border-emerald-800/30 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Today's Progress
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl font-bold text-emerald-950 dark:text-emerald-50 font-mono">
                    {todayAyahsRead}
                  </span>
                  <span className="text-sm font-medium text-stone-500 dark:text-stone-400">
                    / {dailyTarget} Ayahs
                  </span>
                  {isGoalMetToday && (
                    <span className="inline-flex items-center gap-1 ml-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/20 dark:bg-emerald-500/30 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                      <Check className="w-3 h-3" /> Met Today!
                    </span>
                  )}
                </div>
              </div>

              {/* Streak Badge */}
              <div className="text-right">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 shadow-xs">
                  <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="text-sm font-bold">{currentStreak} Day{currentStreak === 1 ? '' : 's'}</span>
                </div>
                <div className="text-[11px] text-stone-400 mt-1 flex items-center justify-end gap-1">
                  <Trophy className="w-3 h-3 text-amber-500" />
                  <span>Best: {longestStreak} day{longestStreak === 1 ? '' : 's'}</span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full bg-emerald-950/10 dark:bg-emerald-800/30 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isGoalMetToday
                      ? 'bg-gradient-to-r from-emerald-500 to-amber-400'
                      : 'bg-gradient-to-r from-amber-500 to-amber-400'
                  }`}
                  style={{ width: `${Math.max(4, todayProgressPercentage)}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-stone-500 dark:text-stone-400">
                <span>
                  {isGoalMetToday
                    ? 'Target achieved! Any extra recitation is abundant blessing.'
                    : `${Math.max(0, dailyTarget - todayAyahsRead)} Ayah${
                        dailyTarget - todayAyahsRead === 1 ? '' : 's'
                      } remaining today`}
                </span>
                <span className="font-mono font-semibold">{todayProgressPercentage}%</span>
              </div>
            </div>
          </div>

          {/* 7-Day Activity Matrix */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-stone-300">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                <span>Last 7 Days Recitation</span>
              </div>
              <span className="text-[11px] text-stone-400">Green = Goal Met</span>
            </div>

            <div className="grid grid-cols-7 gap-2 p-3 rounded-2xl bg-emerald-950/5 dark:bg-emerald-950/30 border border-emerald-900/10 dark:border-emerald-800/20">
              {recentDaysActivity.map((day) => (
                <div
                  key={day.date}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                    day.isToday
                      ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/40'
                      : day.goalMet
                      ? 'border-emerald-500/40 bg-emerald-500/10'
                      : 'border-emerald-900/10 dark:border-emerald-800/20'
                  }`}
                >
                  <span className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase">
                    {day.isToday ? 'Today' : day.dayLabel}
                  </span>
                  <div className="my-1">
                    {day.goalMet ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto" />
                    ) : day.count > 0 ? (
                      <span className="w-4 h-4 rounded-full bg-amber-400/40 flex items-center justify-center text-[10px] font-bold text-amber-700 dark:text-amber-200 mx-auto">
                        •
                      </span>
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-dashed border-stone-300 dark:border-stone-700 block mx-auto opacity-50" />
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-stone-600 dark:text-stone-300">
                    {day.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Goal Presets & Custom Configuration */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
              Select Daily Ayah Target
            </label>

            {/* Quick Preset Buttons */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {READING_GOAL_PRESETS.map((preset) => {
                const isSelected = dailyTarget === preset.count;
                return (
                  <button
                    key={preset.count}
                    onClick={() => handleApplyCustomTarget(preset.count)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/15 text-emerald-950 dark:text-amber-200 font-bold shadow-xs'
                        : 'border-emerald-900/10 dark:border-emerald-800/20 text-stone-600 dark:text-stone-400 hover:bg-emerald-950/5'
                    }`}
                    id={`goal-preset-${preset.count}`}
                  >
                    <span className="block text-sm font-bold">{preset.count}</span>
                    <span className="block text-[10px] text-stone-400">{preset.time}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Target Stepper */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-950/5 dark:bg-emerald-950/30 border border-emerald-900/10 dark:border-emerald-800/20">
              <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                Custom Daily Target:
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleApplyCustomTarget(customTarget - 1)}
                  disabled={customTarget <= 1}
                  className="p-1.5 rounded-lg bg-emerald-950/10 dark:bg-emerald-800/30 text-stone-700 dark:text-stone-200 hover:bg-emerald-950/20 disabled:opacity-30 cursor-pointer"
                  aria-label="Decrease target"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                <input
                  type="number"
                  min={1}
                  max={286}
                  value={customTarget}
                  onChange={(e) => handleApplyCustomTarget(Number(e.target.value))}
                  className="w-16 text-center py-1 text-sm font-bold font-mono rounded-lg bg-white dark:bg-[#121c19] border border-emerald-900/20 dark:border-emerald-800/40 text-emerald-950 dark:text-emerald-50 focus:outline-none"
                  id="custom-goal-target-input"
                />

                <button
                  onClick={() => handleApplyCustomTarget(customTarget + 1)}
                  disabled={customTarget >= 286}
                  className="p-1.5 rounded-lg bg-emerald-950/10 dark:bg-emerald-800/30 text-stone-700 dark:text-stone-200 hover:bg-emerald-950/20 disabled:opacity-30 cursor-pointer"
                  aria-label="Increase target"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs text-stone-400 font-medium">Ayahs</span>
              </div>
            </div>
          </div>

          {/* Quick Manual Recitation Logging */}
          <div className="p-4 rounded-2xl bg-emerald-950/5 dark:bg-emerald-950/30 border border-emerald-900/10 dark:border-emerald-800/20 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                Quick Log (Paper Mushaf or Offline Recitation)
              </span>
              <BookOpen className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => recordAyahsCount(1)}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-amber-200 text-xs font-semibold transition-all shadow-xs cursor-pointer"
                id="quick-log-1-btn"
              >
                +1 Ayah
              </button>
              <button
                onClick={() => recordAyahsCount(5)}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-800/90 hover:bg-emerald-700 text-amber-200 text-xs font-semibold transition-all shadow-xs cursor-pointer"
                id="quick-log-5-btn"
              >
                +5 Ayahs
              </button>
              <button
                onClick={() => recordAyahsCount(10)}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-amber-200 text-xs font-semibold transition-all shadow-xs cursor-pointer"
                id="quick-log-10-btn"
              >
                +10 Ayahs
              </button>
            </div>
          </div>

          {/* Notifications & Reset Options */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-emerald-900/10 dark:border-emerald-800/20">
            {/* Notification Toggle */}
            <button
              onClick={toggleNotifications}
              className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-300 hover:text-emerald-900 dark:hover:text-emerald-100 cursor-pointer"
              id="toggle-goal-notifications-btn"
            >
              {notificationsEnabled ? (
                <>
                  <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Milestone notifications active</span>
                </>
              ) : (
                <>
                  <BellOff className="w-4 h-4 text-stone-400" />
                  <span className="text-stone-400">Notifications muted</span>
                </>
              )}
            </button>

            {/* Reset Today's Count */}
            <div>
              {showConfirmReset ? (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">Reset today?</span>
                  <button
                    onClick={() => {
                      resetTodayProgress();
                      setShowConfirmReset(false);
                    }}
                    className="px-2 py-0.5 text-xs font-bold text-rose-600 bg-rose-500/10 rounded-lg hover:bg-rose-500/20 cursor-pointer"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setShowConfirmReset(false)}
                    className="px-2 py-0.5 text-xs text-stone-500 hover:text-stone-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowConfirmReset(true)}
                  className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Today's Count</span>
                </button>
              )}
            </div>
          </div>

          {/* Inspirational Sacred Hadith Footer */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="text-xs text-emerald-950 dark:text-amber-100 italic leading-relaxed">
                "{randomHadith.text}"
              </p>
              <p className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">
                — {randomHadith.source}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
