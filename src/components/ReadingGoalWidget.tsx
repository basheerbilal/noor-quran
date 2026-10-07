import React from 'react';
import {
  Flame,
  Target,
  Trophy,
  CheckCircle2,
  ChevronRight,
  Plus,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { useReadingGoal } from '../context/ReadingGoalContext';

interface ReadingGoalWidgetProps {
  onOpenSurah?: (surahNumber: number, ayahNumber?: number) => void;
}

export const ReadingGoalWidget: React.FC<ReadingGoalWidgetProps> = () => {
  const {
    dailyTarget,
    todayAyahsRead,
    todayProgressPercentage,
    currentStreak,
    longestStreak,
    isGoalMetToday,
    openGoalModal,
    recordAyahsCount,
  } = useReadingGoal();

  return (
    <div className="relative overflow-hidden p-6 sm:p-7 rounded-3xl bg-[#fcfaf6] dark:bg-[#0c1412] border border-emerald-900/15 dark:border-emerald-800/30 shadow-sm transition-all hover:border-amber-500/30">
      {/* Subtle decorative glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 dark:bg-amber-400/5 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

      <div className="relative z-10 space-y-4">
        {/* Top Header Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/30 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <span className="text-xs font-semibold tracking-wider text-amber-600 dark:text-amber-400 uppercase">
                Daily Reading Goal
              </span>
              <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-50 leading-tight">
                {isGoalMetToday ? 'Target Completed!' : 'Keep Your Daily Habit Alive'}
              </h4>
            </div>
          </div>

          {/* Current Streak Pill */}
          <div
            onClick={openGoalModal}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-bold text-xs cursor-pointer hover:bg-amber-500/25 transition-all shadow-xs"
            title="Click to view streak details & reading history"
            id="reading-goal-streak-pill"
          >
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" />
            <span>{currentStreak} Day Streak</span>
          </div>
        </div>

        {/* Middle Stats Row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-950 dark:text-emerald-50 font-mono tracking-tight">
                {todayAyahsRead}
              </span>
              <span className="text-sm font-semibold text-stone-500 dark:text-stone-400">
                / {dailyTarget} Ayahs
              </span>
              <span className="ml-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-900/10 dark:bg-emerald-800/30 px-2 py-0.5 rounded-full">
                {todayProgressPercentage}%
              </span>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
              {isGoalMetToday
                ? 'Alhamdulillah! You achieved your daily Quran goal.'
                : `${Math.max(0, dailyTarget - todayAyahsRead)} Ayah${
                    dailyTarget - todayAyahsRead === 1 ? '' : 's'
                  } left to reach today's target.`}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => recordAyahsCount(1)}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-950/5 dark:bg-emerald-950/40 hover:bg-emerald-950/10 dark:hover:bg-emerald-800/30 border border-emerald-900/15 dark:border-emerald-800/30 text-emerald-950 dark:text-emerald-100 font-semibold text-xs transition-all cursor-pointer"
              title="Add 1 Ayah read from paper Mushaf or offline"
              id="widget-quick-add-1-btn"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+1 Ayah</span>
            </button>

            <button
              onClick={() => recordAyahsCount(5)}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-950/5 dark:bg-emerald-950/40 hover:bg-emerald-950/10 dark:hover:bg-emerald-800/30 border border-emerald-900/15 dark:border-emerald-800/30 text-emerald-950 dark:text-emerald-100 font-semibold text-xs transition-all cursor-pointer"
              title="Add 5 Ayahs read"
              id="widget-quick-add-5-btn"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+5</span>
            </button>

            <button
              onClick={openGoalModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-amber-200 font-semibold text-xs shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              id="widget-adjust-goal-btn"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Adjust Goal</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-emerald-950/10 dark:bg-emerald-800/30 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isGoalMetToday
                ? 'bg-gradient-to-r from-emerald-500 to-amber-400'
                : 'bg-gradient-to-r from-amber-500 to-amber-400'
            }`}
            style={{ width: `${Math.max(3, todayProgressPercentage)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
