import React from 'react';
import { BookOpen, ArrowRight, Sparkles } from 'lucide-react';
import { useReadingProgress } from '../context/ReadingProgressContext';

interface ContinueReadingProps {
  onContinue: (surahNumber: number, ayahNumber?: number) => void;
  onExplore: () => void;
}

export const ContinueReading: React.FC<ContinueReadingProps> = ({
  onContinue,
  onExplore,
}) => {
  const { lastRead } = useReadingProgress();

  if (!lastRead) {
    return (
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-900/10 via-emerald-950/5 to-transparent dark:from-emerald-900/30 dark:via-emerald-950/20 dark:to-transparent border border-emerald-900/15 dark:border-emerald-800/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Begin Your Journey
              </span>
            </div>
            <h3 className="text-xl font-bold text-emerald-950 dark:text-emerald-50">
              Begin your Quran journey
            </h3>
            <p className="text-sm text-stone-600 dark:text-stone-300 max-w-md">
              Start with Surah Al-Fatiha (The Opening) and embark on a peaceful reading reflection.
            </p>
          </div>

          <button
            onClick={() => onContinue(1, 1)}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-800 hover:bg-emerald-700 text-amber-200 font-semibold text-sm shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            id="begin-journey-btn"
          >
            <BookOpen className="w-4 h-4" />
            <span>Start Reading</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-[#fcfaf6] dark:bg-[#0c1412] border border-emerald-900/15 dark:border-emerald-800/30 shadow-sm">
      {/* Subtle Background Ornament */}
      <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-5 dark:opacity-10 pointer-events-none flex items-center justify-end pr-6">
        <span className="text-8xl font-serif select-none font-['Amiri']">📖</span>
      </div>

      <div className="relative z-10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-amber-600 dark:text-amber-400 uppercase">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Continue Reading</span>
          </div>

          <span className="text-xs font-mono font-semibold text-emerald-900 dark:text-emerald-300 bg-emerald-900/10 dark:bg-emerald-800/30 px-2.5 py-1 rounded-full">
            {lastRead.progressPercentage}% completed
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-3">
              <h3 className="text-2xl font-bold text-emerald-950 dark:text-emerald-50">
                {lastRead.surahEnglishName}
              </h3>
              <span className="text-sm text-stone-500 dark:text-stone-400">
                {lastRead.surahName}
              </span>
            </div>
            <p className="text-sm text-stone-600 dark:text-stone-300 mt-1">
              Ayah {lastRead.ayahNumber} of {lastRead.totalAyahs}
            </p>
          </div>

          <button
            onClick={() => onContinue(lastRead.surahNumber, lastRead.ayahNumber)}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-emerald-800 hover:bg-emerald-700 text-amber-200 font-semibold text-sm shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            id="continue-reading-btn"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-emerald-950/10 dark:bg-emerald-800/30 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.max(3, lastRead.progressPercentage)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
