import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  RotateCw,
  Copy,
  Check,
  Share2,
  BookOpen,
  Volume2,
  ChevronRight,
  ChevronLeft,
  Heart,
  Award,
} from 'lucide-react';
import { DhikrItem } from '../types';
import { DHIKR_LIST, getDailyDhikr } from '../data/dhikrData';
import { useQuranSettings } from '../context/QuranSettingsContext';
import { copyToClipboard } from '../utils/quranUtils';

const STORAGE_KEY_PREFIX = 'noor_dhikr_count_';

export const DailyDhikr: React.FC = () => {
  const { settings } = useQuranSettings();
  const isMushafTheme = settings.theme === 'mushaf';

  // Current selected dhikr index in DHIKR_LIST
  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    const today = getDailyDhikr();
    const idx = DHIKR_LIST.findIndex((item) => item.id === today.id);
    return idx >= 0 ? idx : 0;
  });

  const dhikr = DHIKR_LIST[currentIndex] || DHIKR_LIST[0];

  // Daily counter state for the currently active dhikr
  const todayDateStr = new Date().toISOString().slice(0, 10);
  const countKey = `${STORAGE_KEY_PREFIX}${todayDateStr}_${dhikr.id}`;

  const [counter, setCounter] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(countKey);
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });

  const [copied, setCopied] = useState(false);
  const [pulseTap, setPulseTap] = useState(false);

  // Sync count when dhikr changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(countKey);
      setCounter(saved ? parseInt(saved, 10) || 0 : 0);
    } catch {
      setCounter(0);
    }
  }, [countKey]);

  // Handle counter click
  const handleIncrement = () => {
    const nextCount = counter + 1;
    setCounter(nextCount);
    setPulseTap(true);
    setTimeout(() => setPulseTap(false), 200);

    try {
      localStorage.setItem(countKey, nextCount.toString());
    } catch {
      // Ignore quota errors
    }
  };

  const handleResetCount = () => {
    setCounter(0);
    try {
      localStorage.removeItem(countKey);
    } catch {
      // Ignore
    }
  };

  const handleNextDhikr = () => {
    setCurrentIndex((prev) => (prev + 1) % DHIKR_LIST.length);
  };

  const handlePrevDhikr = () => {
    setCurrentIndex((prev) => (prev - 1 + DHIKR_LIST.length) % DHIKR_LIST.length);
  };

  const handleCopy = async () => {
    const textToCopy = `${dhikr.arabic}\n\n${dhikr.transliteration}\n\n"${dhikr.translation}"\n\nVirtue: ${dhikr.virtue} (${dhikr.reference})\n— Recommended: ${dhikr.recommendedCount}x`;
    const success = await copyToClipboard(textToCopy);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Daily Dhikr: ${dhikr.title}`,
          text: `${dhikr.arabic}\n\n"${dhikr.translation}"\n\n${dhikr.virtue} (${dhikr.reference})`,
        });
      } catch {
        // Share cancelled or failed
      }
    } else {
      handleCopy();
    }
  };

  const isCompleted = counter >= dhikr.recommendedCount && dhikr.recommendedCount > 0;
  const progressPercent = Math.min(
    100,
    Math.round((counter / Math.max(1, dhikr.recommendedCount)) * 100)
  );

  const getCategoryLabel = (category: DhikrItem['category']) => {
    switch (category) {
      case 'morning_evening':
        return 'Morning & Evening';
      case 'forgiveness':
        return 'Seeking Forgiveness';
      case 'protection':
        return 'Divine Protection';
      case 'praise':
        return 'Praise & Glorification';
      case 'daily':
      default:
        return 'Daily Sunnah';
    }
  };

  return (
    <div
      className={`rounded-3xl p-5 sm:p-6 transition-all border shadow-xs relative overflow-hidden ${
        isMushafTheme
          ? 'bg-[#fcfaf4] border-[#caa352]/40 text-[#15366c]'
          : 'bg-[#fcfaf6] dark:bg-[#0c1412] border-emerald-900/10 dark:border-emerald-800/25 text-stone-800 dark:text-stone-100'
      }`}
      id="daily-dhikr-widget"
    >
      {/* Decorative subtle background seal */}
      <div className="absolute -right-8 -bottom-8 w-40 h-40 opacity-3 dark:opacity-5 pointer-events-none select-none text-emerald-900 dark:text-emerald-100">
        <Sparkles className="w-full h-full" />
      </div>

      {/* Header bar: Title, Category Badge, and Navigation / Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-emerald-900/10 dark:border-emerald-800/20">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
              isMushafTheme
                ? 'bg-[#15366c]/10 text-[#15366c]'
                : 'bg-amber-500/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/20'
            }`}
          >
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                Daily Dhikr
              </h2>
              <span className="text-xs font-serif text-amber-600 dark:text-amber-400 font-normal hidden xs:inline" dir="rtl">
                أذكار اليوم
              </span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              Recommended daily remembrance to purify the heart & soul
            </p>
          </div>
        </div>

        {/* Action Controls: Shuffle, Prev, Next, Copy, Share */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold tracking-wide uppercase bg-emerald-950/5 dark:bg-emerald-950/30 text-stone-600 dark:text-stone-300 border border-emerald-900/10 dark:border-emerald-800/20 hidden md:inline">
            {getCategoryLabel(dhikr.category)}
          </span>

          <div className="flex items-center border border-emerald-900/10 dark:border-emerald-800/20 rounded-xl overflow-hidden bg-emerald-950/5 dark:bg-emerald-950/30">
            <button
              onClick={handlePrevDhikr}
              className="p-1.5 hover:bg-emerald-950/10 dark:hover:bg-white/5 transition-colors cursor-pointer text-stone-600 dark:text-stone-300"
              title="Previous Dhikr"
              aria-label="Previous remembrance"
              id="daily-dhikr-prev-btn"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleNextDhikr}
              className="p-1.5 hover:bg-emerald-950/10 dark:hover:bg-white/5 transition-colors cursor-pointer text-stone-600 dark:text-stone-300"
              title="Next Dhikr"
              aria-label="Next remembrance"
              id="daily-dhikr-next-btn"
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
            title={copied ? 'Copied to clipboard!' : 'Copy Dhikr text and translation'}
            id="daily-dhikr-copy-btn"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleShare}
            className="p-2 rounded-xl border border-emerald-900/10 dark:border-emerald-800/20 bg-emerald-950/5 dark:bg-emerald-950/30 hover:bg-emerald-950/10 text-stone-600 dark:text-stone-300 transition-all cursor-pointer"
            title="Share this Dhikr"
            id="daily-dhikr-share-btn"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Content: Title, Arabic Calligraphy, Transliteration & Translation */}
      <div className="mt-4 space-y-4">
        {/* Title */}
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-bold text-amber-700 dark:text-amber-400">
            {dhikr.title}
          </h3>
          <span className="text-[11px] font-mono text-stone-400 dark:text-stone-500">
            {currentIndex + 1} of {DHIKR_LIST.length}
          </span>
        </div>

        {/* Arabic Text Display */}
        <div
          dir="rtl"
          className="p-4 sm:p-5 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/15 text-center leading-loose"
        >
          <p
            className={`font-amiri text-xl sm:text-2xl md:text-3xl font-medium tracking-normal ${
              isMushafTheme
                ? 'text-[#15366c]'
                : 'text-emerald-950 dark:text-emerald-50'
            }`}
            style={{ lineHeight: 2.1 }}
          >
            {dhikr.arabic}
          </p>
        </div>

        {/* Transliteration */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
            Transliteration
          </span>
          <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 italic font-serif leading-relaxed">
            {dhikr.transliteration}
          </p>
        </div>

        {/* Translation */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
            Translation
          </span>
          <p className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 leading-relaxed font-sans">
            "{dhikr.translation}"
          </p>
        </div>

        {/* Virtue & Hadith Reference Callout */}
        <div className="p-3 sm:p-3.5 rounded-2xl bg-emerald-950/5 dark:bg-emerald-950/25 border border-emerald-900/10 dark:border-emerald-800/20 text-xs space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-semibold">
            <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="text-[11px]">Spiritual Virtue & Benefit:</span>
          </div>
          <p className="text-stone-600 dark:text-stone-300 text-[11px] leading-relaxed">
            {dhikr.virtue}
          </p>
          <div className="text-[10px] text-stone-400 dark:text-stone-500 font-medium pt-0.5">
            Reference: {dhikr.reference}
          </div>
        </div>
      </div>

      {/* Interactive Tasbih Counter Footer */}
      <div className="mt-5 pt-4 border-t border-emerald-900/10 dark:border-emerald-800/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Progress & Target Details */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-stone-600 dark:text-stone-300">
              Recommended Recitation:
            </span>
            <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-800 dark:text-amber-200 text-xs font-bold font-mono">
              {dhikr.recommendedCount}x
            </span>
            {isCompleted && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                <Check className="w-3 h-3 stroke-[2.5]" />
                Completed!
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="w-32 sm:w-48 bg-stone-200 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isCompleted ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[11px] font-mono font-bold text-stone-500 dark:text-stone-400">
              {counter} / {dhikr.recommendedCount}
            </span>
          </div>
        </div>

        {/* Counter Buttons: Tap to Count & Reset */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {counter > 0 && (
            <button
              onClick={handleResetCount}
              className="px-2.5 py-2 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-[11px] font-semibold transition-colors cursor-pointer"
              title="Reset counter"
              id="daily-dhikr-reset-btn"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={handleIncrement}
            className={`group relative flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all transform active:scale-95 cursor-pointer shadow-sm ${
              isCompleted
                ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                : 'bg-amber-600 hover:bg-amber-700 text-stone-900'
            } ${pulseTap ? 'scale-98 ring-4 ring-amber-400/40' : ''}`}
            id="daily-dhikr-count-tap-btn"
            title="Tap to count your recitation"
          >
            <span>Tap to Count</span>
            <span className="px-2 py-0.5 rounded-lg bg-black/15 font-mono text-xs">
              +{counter}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
