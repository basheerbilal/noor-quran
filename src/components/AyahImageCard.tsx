import React, { forwardRef } from 'react';
import { Ayah, Surah } from '../types';

interface AyahImageCardProps {
  ayah: Ayah;
  surah: Surah;
  translationText?: string;
}

export const AyahImageCard = forwardRef<HTMLDivElement, AyahImageCardProps>(
  ({ ayah, surah, translationText }, ref) => {
    return (
      <div
        ref={ref}
        className="w-[600px] bg-[#fcfaf6] p-12 rounded-3xl border-8 border-emerald-900 shadow-2xl space-y-8 text-center"
        style={{ fontFamily: 'sans-serif' }}
      >
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-emerald-900">
            {surah.englishName} ({surah.number}:{ayah.numberInSurah})
          </h2>
          <div className="w-16 h-1 bg-amber-500 mx-auto rounded-full" />
        </div>

        <p
          dir="rtl"
          className="text-4xl text-emerald-950 font-quran-amiri leading-loose"
        >
          {ayah.text}
        </p>

        {translationText && (
          <p className="text-xl text-stone-700 italic border-t border-emerald-900/20 pt-8">
            "{translationText}"
          </p>
        )}

        <div className="pt-8 text-sm text-emerald-800 font-semibold uppercase tracking-widest">
          NOOR Quran
        </div>
      </div>
    );
  }
);
