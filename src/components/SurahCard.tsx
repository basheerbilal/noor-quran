import React from 'react';
import { Surah } from '../types';
import { padNumber } from '../utils/quranUtils';

interface SurahCardProps {
  surah: Surah;
  onClick: () => void;
  isLastRead?: boolean;
}

export const SurahCard: React.FC<SurahCardProps> = ({ surah, onClick, isLastRead }) => {
  const isMeccan = surah.revelationType.toLowerCase() === 'meccan';

  return (
    <div
      onClick={onClick}
      id={`surah-card-${surah.number}`}
      className={`group relative p-5 rounded-2xl cursor-pointer transition-all duration-200 border select-none ${
        isLastRead
          ? 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/40 shadow-sm ring-1 ring-amber-500/30'
          : 'bg-[#fcfaf6] dark:bg-[#0c1412] hover:bg-emerald-950/5 dark:hover:bg-emerald-950/30 border-emerald-900/10 dark:border-emerald-800/20 hover:border-amber-400/30 hover:shadow-md'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left: Number & Names */}
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Surah Number Ornament */}
          <div className="flex items-center justify-center w-10 h-10 shrink-0 rounded-xl bg-emerald-950/5 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-200 font-mono text-xs font-bold border border-emerald-900/10 dark:border-emerald-700/30 group-hover:border-amber-400/40 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
            {padNumber(surah.number, 2)}
          </div>

          <div className="min-w-0">
            <h4 className="font-semibold text-sm sm:text-base text-emerald-950 dark:text-emerald-50 truncate group-hover:text-emerald-800 dark:group-hover:text-amber-200 transition-colors">
              {surah.englishName}
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
              {surah.englishNameTranslation}
            </p>
          </div>
        </div>

        {/* Right: Arabic Name */}
        <div className="text-right shrink-0">
          <p
            dir="rtl"
            className="font-quran-amiri text-lg sm:text-xl font-bold text-emerald-950 dark:text-emerald-50 group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors"
          >
            {surah.name}
          </p>
        </div>
      </div>

      {/* Footer Info: Ayahs count & Revelation Type */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-emerald-900/5 dark:border-emerald-800/15 text-[11px] text-stone-500 dark:text-stone-400 font-medium">
        <span>{surah.numberOfAyahs} Ayahs</span>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold ${
            isMeccan
              ? 'bg-emerald-900/10 dark:bg-emerald-800/30 text-emerald-800 dark:text-emerald-300'
              : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
          }`}
        >
          {surah.revelationType}
        </span>
      </div>
    </div>
  );
};
