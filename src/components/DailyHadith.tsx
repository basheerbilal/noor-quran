import React, { useState, useEffect } from 'react';
import {
  BookMarked,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Share2,
  Quote,
  Sparkles,
  CheckCircle2,
  Languages,
} from 'lucide-react';
import { HadithItem } from '../types';
import { HADITH_LIST, getDailyHadith } from '../data/hadithData';
import { useQuranSettings } from '../context/QuranSettingsContext';
import { copyToClipboard } from '../utils/quranUtils';

type HadithLangMode = 'both' | 'urdu' | 'english';
const HADITH_LANG_KEY = 'noor_hadith_lang_mode';

export const DailyHadith: React.FC = () => {
  const { settings } = useQuranSettings();
  const isMushafTheme = settings.theme === 'mushaf';

  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    const today = getDailyHadith();
    const idx = HADITH_LIST.findIndex((item) => item.id === today.id);
    return idx >= 0 ? idx : 0;
  });

  const [langMode, setLangMode] = useState<HadithLangMode>(() => {
    try {
      const saved = localStorage.getItem(HADITH_LANG_KEY);
      if (saved === 'both' || saved === 'urdu' || saved === 'english') {
        return saved;
      }
    } catch {
      // Ignore
    }
    return 'both';
  });

  const [copied, setCopied] = useState(false);
  const hadith = HADITH_LIST[currentIndex] || HADITH_LIST[0];

  useEffect(() => {
    try {
      localStorage.setItem(HADITH_LANG_KEY, langMode);
    } catch {
      // Ignore
    }
  }, [langMode]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % HADITH_LIST.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + HADITH_LIST.length) % HADITH_LIST.length);
  };

  const handleCopy = async () => {
    const parts: string[] = [];
    if (hadith.arabic) {
      parts.push(hadith.arabic);
    }

    if (langMode === 'urdu' || langMode === 'both') {
      parts.push(`اردو ترجمہ:\n${hadith.urdu}`);
    }

    if (langMode === 'english' || langMode === 'both') {
      parts.push(`English Translation:\n"${hadith.english}"`);
    }

    parts.push(`Narrated by: ${hadith.narrator}`);
    parts.push(`Source: ${hadith.source}${hadith.hadithNumber ? ` #${hadith.hadithNumber}` : ''} (${hadith.grade || 'Sahih'})`);

    if (langMode === 'urdu' && hadith.urduLesson) {
      parts.push(`سبق: ${hadith.urduLesson}`);
    } else if (langMode === 'english' && hadith.lesson) {
      parts.push(`Lesson: ${hadith.lesson}`);
    } else if (langMode === 'both') {
      if (hadith.urduLesson) parts.push(`سبق: ${hadith.urduLesson}`);
      if (hadith.lesson) parts.push(`Lesson: ${hadith.lesson}`);
    }

    const success = await copyToClipboard(parts.join('\n\n'));
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    const shareText =
      langMode === 'urdu'
        ? `${hadith.arabic ? hadith.arabic + '\n\n' : ''}${hadith.urdu}\n\n— ${hadith.source}`
        : `${hadith.arabic ? hadith.arabic + '\n\n' : ''}"${hadith.english}"\n\n${hadith.urdu}\n\n— ${hadith.source}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Daily Hadith: ${hadith.topic}`,
          text: shareText,
        });
      } catch {
        // Canceled or unsupported
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div
      className={`rounded-3xl p-5 sm:p-6 transition-all border shadow-xs relative overflow-hidden ${
        isMushafTheme
          ? 'bg-[#fcfaf4] border-[#caa352]/40 text-[#15366c]'
          : 'bg-[#fcfaf6] dark:bg-[#0c1412] border-emerald-900/10 dark:border-emerald-800/25 text-stone-800 dark:text-stone-100'
      }`}
      id="daily-hadith-widget"
    >
      {/* Subtle background seal */}
      <div className="absolute -right-8 -top-8 w-36 h-36 opacity-3 dark:opacity-5 pointer-events-none select-none text-emerald-800 dark:text-emerald-200">
        <Quote className="w-full h-full" />
      </div>

      {/* Header bar: Title, Hadith Arabic callout, Language Switcher & Navigation controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-emerald-900/10 dark:border-emerald-800/20">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
              isMushafTheme
                ? 'bg-[#15366c]/10 text-[#15366c]'
                : 'bg-emerald-600/15 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20'
            }`}
          >
            <BookMarked className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                Daily Hadith
              </h2>
              <span className="text-xs font-serif text-emerald-700 dark:text-emerald-400 font-normal hidden xs:inline" dir="rtl">
                الحديث النبوي الشريف
              </span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              Timeless wisdom & guidance from Prophet Muhammad ﷺ with Urdu translation
            </p>
          </div>
        </div>

        {/* Action Controls & Language Switcher */}
        <div className="flex items-center flex-wrap gap-2 self-start sm:self-auto">
          {/* Translation Language Filter: Urdu / English / Both */}
          <div className="flex items-center p-0.5 rounded-xl border border-emerald-900/10 dark:border-emerald-800/20 bg-emerald-950/5 dark:bg-emerald-950/30 text-[11px]">
            <button
              onClick={() => setLangMode('urdu')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer font-urdu ${
                langMode === 'urdu'
                  ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
              title="صرف اردو ترجمہ دیکھیں"
              id="hadith-lang-urdu-btn"
            >
              اردو
            </button>
            <button
              onClick={() => setLangMode('english')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                langMode === 'english'
                  ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
              title="Show English translation only"
              id="hadith-lang-en-btn"
            >
              English
            </button>
            <button
              onClick={() => setLangMode('both')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1 ${
                langMode === 'both'
                  ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
              title="Show both Urdu & English translations"
              id="hadith-lang-both-btn"
            >
              <Languages className="w-3 h-3 hidden xs:inline" />
              <span>دونوں (Both)</span>
            </button>
          </div>

          <div className="flex items-center border border-emerald-900/10 dark:border-emerald-800/20 rounded-xl overflow-hidden bg-emerald-950/5 dark:bg-emerald-950/30">
            <button
              onClick={handlePrev}
              className="p-1.5 hover:bg-emerald-950/10 dark:hover:bg-white/5 transition-colors cursor-pointer text-stone-600 dark:text-stone-300"
              title="Previous Hadith"
              aria-label="Previous Hadith"
              id="daily-hadith-prev-btn"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 hover:bg-emerald-950/10 dark:hover:bg-white/5 transition-colors cursor-pointer text-stone-600 dark:text-stone-300"
              title="Next Hadith"
              aria-label="Next Hadith"
              id="daily-hadith-next-btn"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleCopy}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              copied
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'border-emerald-900/10 dark:border-emerald-800/20 bg-emerald-950/5 dark:bg-emerald-950/30 hover:bg-emerald-950/10 text-stone-600 dark:text-stone-300'
            }`}
            title={copied ? 'کاپی ہو گیا! / Copied!' : 'Copy Hadith with Urdu/English'}
            id="daily-hadith-copy-btn"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleShare}
            className="p-2 rounded-xl border border-emerald-900/10 dark:border-emerald-800/20 bg-emerald-950/5 dark:bg-emerald-950/30 hover:bg-emerald-950/10 text-stone-600 dark:text-stone-300 transition-all cursor-pointer"
            title="Share Hadith"
            id="daily-hadith-share-btn"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="mt-4 space-y-4">
        {/* Narrator badge and Topic */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span className="font-medium text-[11px] sm:text-xs">Narrated by / راوی:</span>
            <span className="font-semibold text-stone-800 dark:text-stone-200">
              {hadith.narrator}
            </span>
          </div>
          <span className="text-[11px] font-mono text-stone-400 dark:text-stone-500 shrink-0">
            {currentIndex + 1} of {HADITH_LIST.length}
          </span>
        </div>

        {/* Arabic Hadith Statement */}
        {hadith.arabic && (
          <div
            dir="rtl"
            className="p-4 sm:p-5 rounded-2xl bg-emerald-950/5 dark:bg-emerald-950/20 border border-emerald-900/10 dark:border-emerald-800/20 text-center leading-loose"
          >
            <p
              className={`font-amiri text-lg sm:text-xl md:text-2xl font-medium tracking-normal ${
                isMushafTheme
                  ? 'text-[#15366c]'
                  : 'text-emerald-950 dark:text-emerald-50'
              }`}
              style={{ lineHeight: 2.1 }}
            >
              {hadith.arabic}
            </p>
          </div>
        )}

        {/* Urdu Translation */}
        {(langMode === 'urdu' || langMode === 'both') && (
          <div
            dir="rtl"
            className="relative pr-3.5 border-r-3 border-emerald-600 dark:border-emerald-500 bg-emerald-950/3 dark:bg-emerald-950/15 p-3 sm:p-4 rounded-xl"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 font-urdu">
                اردو ترجمہ:
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 font-urdu font-medium">
                حدیثِ مبارکہ
              </span>
            </div>
            <p className="font-urdu text-sm sm:text-base md:text-lg text-stone-900 dark:text-stone-100 font-normal leading-loose">
              {hadith.urdu}
            </p>
          </div>
        )}

        {/* English Translation */}
        {(langMode === 'english' || langMode === 'both') && (
          <div className="relative pl-3.5 border-l-2 border-emerald-600/60 dark:border-emerald-500/60">
            {langMode === 'both' && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 block mb-1">
                English Translation
              </span>
            )}
            <p className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 leading-relaxed font-sans">
              "{hadith.english}"
            </p>
          </div>
        )}

        {/* Spiritual Lesson / Practical Takeaway */}
        {(hadith.lesson || hadith.urduLesson) && (
          <div className="p-3 sm:p-3.5 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-xs space-y-2">
            <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="text-[11px]">
                {langMode === 'urdu' ? 'حکمت و سبق (Lesson):' : 'Key Reflection & Lesson:'}
              </span>
            </div>

            {/* Urdu Lesson */}
            {(langMode === 'urdu' || langMode === 'both') && hadith.urduLesson && (
              <p
                dir="rtl"
                className="font-urdu text-xs sm:text-sm text-amber-950 dark:text-amber-100 leading-relaxed font-normal"
              >
                {hadith.urduLesson}
              </p>
            )}

            {/* English Lesson */}
            {(langMode === 'english' || langMode === 'both') && hadith.lesson && (
              <p className="text-stone-700 dark:text-stone-300 text-[11px] sm:text-xs leading-relaxed">
                {hadith.lesson}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Footer: Source, Book Number, Authenticity Grade & Topic */}
      <div className="mt-4 pt-3.5 border-t border-emerald-900/10 dark:border-emerald-800/20 flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-500 dark:text-stone-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-stone-700 dark:text-stone-300">
            {hadith.source}
          </span>
          {hadith.hadithNumber && (
            <span className="px-1.5 py-0.5 rounded bg-stone-200 dark:bg-stone-800 font-mono text-[10px] text-stone-600 dark:text-stone-300">
              #{hadith.hadithNumber}
            </span>
          )}
          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-950/5 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-900/10 dark:border-emerald-800/20">
            {hadith.topic}
          </span>
        </div>
        {hadith.grade && (
          <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span>{hadith.grade}</span>
          </div>
        )}
      </div>
    </div>
  );
};
