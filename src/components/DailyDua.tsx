import React, { useState, useEffect } from 'react';
import {
  Heart,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Share2,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Languages,
} from 'lucide-react';
import { DuaItem } from '../types';
import { DUA_LIST, getDailyDua } from '../data/duaData';
import { useQuranSettings } from '../context/QuranSettingsContext';
import { copyToClipboard } from '../utils/quranUtils';

type DuaLangMode = 'both' | 'urdu' | 'english';
const DUA_PRACTICED_KEY_PREFIX = 'noor_dua_practiced_';
const DUA_LANG_KEY = 'noor_dua_lang_mode';

export const DailyDua: React.FC = () => {
  const { settings } = useQuranSettings();
  const isMushafTheme = settings.theme === 'mushaf';

  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    const today = getDailyDua();
    const idx = DUA_LIST.findIndex((item) => item.id === today.id);
    return idx >= 0 ? idx : 0;
  });

  const [langMode, setLangMode] = useState<DuaLangMode>(() => {
    try {
      const saved = localStorage.getItem(DUA_LANG_KEY);
      if (saved === 'both' || saved === 'urdu' || saved === 'english') {
        return saved;
      }
    } catch {
      // Ignore
    }
    return 'both';
  });

  const [copied, setCopied] = useState(false);
  const dua = DUA_LIST[currentIndex] || DUA_LIST[0];

  const todayDateStr = new Date().toISOString().slice(0, 10);
  const practicedKey = `${DUA_PRACTICED_KEY_PREFIX}${todayDateStr}_${dua.id}`;

  const [practiced, setPracticed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(practicedKey) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(DUA_LANG_KEY, langMode);
    } catch {
      // Ignore
    }
  }, [langMode]);

  const handleTogglePracticed = () => {
    const nextState = !practiced;
    setPracticed(nextState);
    try {
      if (nextState) {
        localStorage.setItem(practicedKey, 'true');
      } else {
        localStorage.removeItem(practicedKey);
      }
    } catch {
      // Ignore
    }
  };

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % DUA_LIST.length;
    setCurrentIndex(nextIdx);
    checkPracticed(DUA_LIST[nextIdx].id);
  };

  const handlePrev = () => {
    const prevIdx = (currentIndex - 1 + DUA_LIST.length) % DUA_LIST.length;
    setCurrentIndex(prevIdx);
    checkPracticed(DUA_LIST[prevIdx].id);
  };

  const checkPracticed = (duaId: string) => {
    try {
      const isSaved = localStorage.getItem(`${DUA_PRACTICED_KEY_PREFIX}${todayDateStr}_${duaId}`) === 'true';
      setPracticed(isSaved);
    } catch {
      setPracticed(false);
    }
  };

  const handleCopy = async () => {
    const parts: string[] = [dua.title, dua.arabic, dua.transliteration];

    if (langMode === 'urdu' || langMode === 'both') {
      parts.push(`اردو ترجمہ:\n"${dua.urduTranslation}"`);
    }

    if (langMode === 'english' || langMode === 'both') {
      parts.push(`English:\n"${dua.translation}"`);
    }

    parts.push(`Occasion: ${dua.occasion}`);
    if (dua.urduOccasion && (langMode === 'urdu' || langMode === 'both')) {
      parts.push(`موقع: ${dua.urduOccasion}`);
    }

    parts.push(`Source: ${dua.source}`);

    if (langMode === 'urdu' && dua.urduBenefits) {
      parts.push(`فضیلت و فوائد:\n${dua.urduBenefits}`);
    } else if (langMode === 'english' && dua.benefits) {
      parts.push(`Benefits:\n${dua.benefits}`);
    } else if (langMode === 'both') {
      if (dua.urduBenefits) parts.push(`فضیلت:\n${dua.urduBenefits}`);
      if (dua.benefits) parts.push(`Benefits:\n${dua.benefits}`);
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
        ? `${dua.arabic}\n\n${dua.urduTranslation}\n\n— ${dua.source}`
        : `${dua.arabic}\n\n"${dua.translation}"\n\n${dua.urduTranslation}\n\n— ${dua.source}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Daily Dua: ${dua.title}`,
          text: shareText,
        });
      } catch {
        // Fallback or user canceled
      }
    } else {
      handleCopy();
    }
  };

  const getCategoryBadge = (cat: DuaItem['category']) => {
    switch (cat) {
      case 'quranic':
        return { label: 'Quranic Dua', urduLabel: 'قرآنی دعا', bg: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/20' };
      case 'prophetic':
        return { label: 'Prophetic Sunnah', urduLabel: 'مسنون دعا', bg: 'bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-500/20' };
      case 'distress':
        return { label: 'Relief & Protection', urduLabel: 'پریشانی سے نجات', bg: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/20' };
      case 'forgiveness':
        return { label: 'Forgiveness', urduLabel: 'استغفار و بخشش', bg: 'bg-purple-500/15 text-purple-800 dark:text-purple-300 border-purple-500/20' };
      default:
        return { label: 'Supplication', urduLabel: 'دعا', bg: 'bg-stone-500/15 text-stone-700 dark:text-stone-300 border-stone-500/20' };
    }
  };

  const badge = getCategoryBadge(dua.category);

  return (
    <div
      className={`rounded-3xl p-5 sm:p-6 transition-all border shadow-xs relative overflow-hidden ${
        isMushafTheme
          ? 'bg-[#fcfaf4] border-[#caa352]/40 text-[#15366c]'
          : 'bg-[#fcfaf6] dark:bg-[#0c1412] border-emerald-900/10 dark:border-emerald-800/25 text-stone-800 dark:text-stone-100'
      }`}
      id="daily-dua-widget"
    >
      {/* Subtle decorative background */}
      <div className="absolute -right-8 -bottom-8 w-36 h-36 opacity-3 dark:opacity-5 pointer-events-none select-none text-rose-800 dark:text-rose-200">
        <Heart className="w-full h-full" />
      </div>

      {/* Header bar: Title, Arabic callout, Category, Language Switcher & Navigation controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-emerald-900/10 dark:border-emerald-800/20">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
              isMushafTheme
                ? 'bg-[#15366c]/10 text-[#15366c]'
                : 'bg-rose-500/15 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/20'
            }`}
          >
            <Heart className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                Daily Dua
              </h2>
              <span className="text-xs font-serif text-rose-600 dark:text-rose-400 font-normal hidden xs:inline" dir="rtl">
                دعاء اليوم
              </span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              Heartfelt supplications from the Holy Quran and Sunnah with Urdu translation
            </p>
          </div>
        </div>

        {/* Action Controls & Language Switcher */}
        <div className="flex items-center flex-wrap gap-2 self-start sm:self-auto">
          {/* Language Switcher */}
          <div className="flex items-center p-0.5 rounded-xl border border-emerald-900/10 dark:border-emerald-800/20 bg-emerald-950/5 dark:bg-emerald-950/30 text-[11px]">
            <button
              onClick={() => setLangMode('urdu')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer font-urdu ${
                langMode === 'urdu'
                  ? 'bg-rose-600 text-white shadow-xs font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
              title="صرف اردو ترجمہ دیکھیں"
              id="dua-lang-urdu-btn"
            >
              اردو
            </button>
            <button
              onClick={() => setLangMode('english')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                langMode === 'english'
                  ? 'bg-rose-600 text-white shadow-xs font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
              title="Show English translation only"
              id="dua-lang-en-btn"
            >
              English
            </button>
            <button
              onClick={() => setLangMode('both')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1 ${
                langMode === 'both'
                  ? 'bg-rose-600 text-white shadow-xs font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
              title="Show both Urdu & English translations"
              id="dua-lang-both-btn"
            >
              <Languages className="w-3 h-3 hidden xs:inline" />
              <span>دونوں (Both)</span>
            </button>
          </div>

          <span
            className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold tracking-wide uppercase border hidden lg:inline ${badge.bg}`}
          >
            {langMode === 'urdu' ? badge.urduLabel : badge.label}
          </span>

          <div className="flex items-center border border-emerald-900/10 dark:border-emerald-800/20 rounded-xl overflow-hidden bg-emerald-950/5 dark:bg-emerald-950/30">
            <button
              onClick={handlePrev}
              className="p-1.5 hover:bg-emerald-950/10 dark:hover:bg-white/5 transition-colors cursor-pointer text-stone-600 dark:text-stone-300"
              title="Previous Dua"
              aria-label="Previous Dua"
              id="daily-dua-prev-btn"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 hover:bg-emerald-950/10 dark:hover:bg-white/5 transition-colors cursor-pointer text-stone-600 dark:text-stone-300"
              title="Next Dua"
              aria-label="Next Dua"
              id="daily-dua-next-btn"
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
            title={copied ? 'کاپی ہو گیا! / Copied!' : 'Copy Dua text'}
            id="daily-dua-copy-btn"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleShare}
            className="p-2 rounded-xl border border-emerald-900/10 dark:border-emerald-800/20 bg-emerald-950/5 dark:bg-emerald-950/30 hover:bg-emerald-950/10 text-stone-600 dark:text-stone-300 transition-all cursor-pointer"
            title="Share Dua"
            id="daily-dua-share-btn"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="mt-4 space-y-4">
        {/* Title and Occasion */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
          <h3 className="text-xs sm:text-sm font-bold text-rose-700 dark:text-rose-400">
            {dua.title}
          </h3>
          <div className="flex items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400">
            <span className="font-medium">
              {langMode === 'urdu' ? 'پڑھنے کا موقع:' : 'When to recite:'}
            </span>
            <span className="italic text-stone-700 dark:text-stone-300">
              {langMode === 'urdu' && dua.urduOccasion ? dua.urduOccasion : dua.occasion}
            </span>
          </div>
        </div>

        {/* Arabic Calligraphy */}
        <div
          dir="rtl"
          className="p-4 sm:p-5 rounded-2xl bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/15 text-center leading-loose"
        >
          <p
            className={`font-amiri text-xl sm:text-2xl md:text-3xl font-medium tracking-normal ${
              isMushafTheme
                ? 'text-[#15366c]'
                : 'text-emerald-950 dark:text-emerald-50'
            }`}
            style={{ lineHeight: 2.1 }}
          >
            {dua.arabic}
          </p>
        </div>

        {/* Transliteration */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
            Transliteration (تلفظ)
          </span>
          <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 italic font-serif leading-relaxed">
            {dua.transliteration}
          </p>
        </div>

        {/* Urdu Translation */}
        {(langMode === 'urdu' || langMode === 'both') && (
          <div
            dir="rtl"
            className="relative pr-3.5 border-r-3 border-rose-500 dark:border-rose-400 bg-rose-500/4 dark:bg-rose-500/10 p-3 sm:p-4 rounded-xl"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-rose-800 dark:text-rose-300 font-urdu">
                اردو ترجمہ:
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-200 font-urdu font-medium">
                دعا و التجا
              </span>
            </div>
            <p className="font-urdu text-sm sm:text-base md:text-lg text-stone-900 dark:text-stone-100 font-normal leading-loose">
              "{dua.urduTranslation}"
            </p>
          </div>
        )}

        {/* English Translation */}
        {(langMode === 'english' || langMode === 'both') && (
          <div className="space-y-1 relative pl-3.5 border-l-2 border-stone-300 dark:border-stone-700">
            {langMode === 'both' && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 block">
                English Translation
              </span>
            )}
            <p className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 leading-relaxed font-sans">
              "{dua.translation}"
            </p>
          </div>
        )}

        {/* Spiritual Benefits Callout */}
        {(dua.benefits || dua.urduBenefits) && (
          <div className="p-3 sm:p-3.5 rounded-2xl bg-emerald-950/5 dark:bg-emerald-950/25 border border-emerald-900/10 dark:border-emerald-800/20 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-[11px]">
                {langMode === 'urdu' ? 'فضیلت و برکت (Spiritual Benefits):' : 'Spiritual Benefit & Meaning:'}
              </span>
            </div>

            {/* Urdu Benefits */}
            {(langMode === 'urdu' || langMode === 'both') && dua.urduBenefits && (
              <p dir="rtl" className="font-urdu text-xs sm:text-sm text-emerald-950 dark:text-emerald-200 leading-relaxed font-normal">
                {dua.urduBenefits}
              </p>
            )}

            {/* English Benefits */}
            {(langMode === 'english' || langMode === 'both') && dua.benefits && (
              <p className="text-stone-600 dark:text-stone-300 text-[11px] leading-relaxed">
                {dua.benefits}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Footer: Source reference & Recited/Practiced toggle */}
      <div className="mt-4 pt-3.5 border-t border-emerald-900/10 dark:border-emerald-800/20 flex flex-wrap items-center justify-between gap-3 text-[11px]">
        <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-400">
          <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span className="font-semibold text-stone-800 dark:text-stone-200">
            {dua.source}
          </span>
        </div>

        {/* Practiced / Recited Checkmark button */}
        <button
          onClick={handleTogglePracticed}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
            practiced
              ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
              : 'bg-emerald-950/5 dark:bg-emerald-950/30 border-emerald-900/10 dark:border-emerald-800/20 text-stone-600 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
          id="daily-dua-practiced-btn"
          title={practiced ? 'آج تلاوت کی جا چکی ہے / Marked as recited today' : 'Click to mark as recited today'}
        >
          <CheckCircle2
            className={`w-3.5 h-3.5 ${
              practiced ? 'text-emerald-600 dark:text-emerald-400 fill-emerald-500/20' : ''
            }`}
          />
          <span>{practiced ? (langMode === 'urdu' ? 'آج پڑھ لی گئی' : 'Recited Today') : (langMode === 'urdu' ? 'پڑھنے کا نشان لگائیں' : 'Mark as Recited')}</span>
        </button>
      </div>
    </div>
  );
};
