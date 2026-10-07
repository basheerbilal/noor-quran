import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Bookmark,
  Copy,
  Share2,
  Check,
  RotateCcw,
  Sparkles,
  Columns,
  Rows,
  Minus,
  Plus,
  Compass,
  ScrollText,
  Volume2,
} from 'lucide-react';
import { Ayah, SurahDetail } from '../types';
import {
  TAFSIR_EDITIONS,
  TafsirEdition,
  AyahTafsir,
  getTafsirForAyah,
  getDefaultTafsirForTranslation,
  prefetchAdjacentAyahsTafsir,
} from '../api/tafsirApi';
import { useQuranSettings } from '../context/QuranSettingsContext';
import { useBookmarks } from '../context/BookmarksContext';
import { useAudio } from '../context/AudioContext';
import {
  cleanAyahText,
  copyToClipboard,
  shareAyah,
  isUrduTranslation,
  getTranslationTypographyClass,
} from '../utils/quranUtils';
import { MushafVerseRosette } from './ui/MushafOrnaments';

interface TafsirViewProps {
  surah: SurahDetail;
  translationSurah: SurahDetail | null;
  audioAyahs?: Ayah[];
  initialAyahNumber?: number;
  onClose?: () => void;
}

export const TafsirView: React.FC<TafsirViewProps> = ({
  surah,
  translationSurah,
  audioAyahs = [],
  initialAyahNumber = 1,
  onClose,
}) => {
  const { settings } = useQuranSettings();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { playTrack, togglePlayPause, isPlaying, currentTrack } = useAudio();
  const isMushafTheme = settings.theme === 'mushaf';

  // Active Ayah Index (0-based)
  const [currentAyahIndex, setCurrentAyahIndex] = useState<number>(() => {
    const valid = Math.max(1, Math.min(surah.numberOfAyahs, initialAyahNumber));
    return valid - 1;
  });

  // Selected Tafsir Edition
  const [selectedTafsirId, setSelectedTafsirId] = useState<string>(() => {
    const defaultEdition = getDefaultTafsirForTranslation(settings.translationEdition);
    return defaultEdition.id;
  });

  // Tafsir Data State
  const [tafsirData, setTafsirData] = useState<AyahTafsir | null>(null);
  const [loadingTafsir, setLoadingTafsir] = useState<boolean>(true);
  const [tafsirError, setTafsirError] = useState<boolean>(false);

  // View Layout Options
  const [layoutMode, setLayoutMode] = useState<'split' | 'stacked'>('split');
  const [tafsirFontSize, setTafsirFontSize] = useState<number>(16);
  const [copied, setCopied] = useState<boolean>(false);

  const currentAyah = surah.ayahs[currentAyahIndex];
  const currentTranslationAyah = translationSurah?.ayahs[currentAyahIndex];
  const currentAudioAyah = audioAyahs[currentAyahIndex];
  const selectedEdition =
    TAFSIR_EDITIONS.find((ed) => ed.id === selectedTafsirId) || TAFSIR_EDITIONS[0];

  const bookmarked = currentAyah
    ? isBookmarked(surah.number, currentAyah.numberInSurah)
    : false;

  const isCurrentAudioPlaying =
    currentAyah &&
    currentTrack?.surahNumber === surah.number &&
    currentTrack?.ayahNumberInSurah === currentAyah.numberInSurah &&
    isPlaying;

  // Fetch Tafsir when ayah or tafsir edition changes
  useEffect(() => {
    if (!currentAyah) return;

    let isMounted = true;
    setLoadingTafsir(true);
    setTafsirError(false);

    getTafsirForAyah(selectedTafsirId, surah.number, currentAyah.numberInSurah)
      .then((data) => {
        if (!isMounted) return;
        setTafsirData(data);
      })
      .catch((err) => {
        console.error('Failed to load tafsir', err);
        if (!isMounted) return;
        setTafsirError(true);
      })
      .finally(() => {
        if (isMounted) setLoadingTafsir(false);
      });

    // Prefetch adjacent ayahs
    prefetchAdjacentAyahsTafsir(
      selectedTafsirId,
      surah.number,
      currentAyah.numberInSurah,
      surah.numberOfAyahs
    );

    return () => {
      isMounted = false;
    };
  }, [selectedTafsirId, surah.number, currentAyah?.numberInSurah, surah.numberOfAyahs]);

  // Ayah navigation
  const handleNextAyah = () => {
    if (currentAyahIndex < surah.ayahs.length - 1) {
      setCurrentAyahIndex((prev) => prev + 1);
    }
  };

  const handlePrevAyah = () => {
    if (currentAyahIndex > 0) {
      setCurrentAyahIndex((prev) => prev - 1);
    }
  };

  const handleJumpToAyah = (ayahNum: number) => {
    const idx = Math.max(0, Math.min(surah.ayahs.length - 1, ayahNum - 1));
    setCurrentAyahIndex(idx);
  };

  // Audio Playback
  const handlePlayAudio = () => {
    if (!currentAyah) return;
    if (isCurrentAudioPlaying) {
      togglePlayPause();
    } else {
      const audioUrl = currentAudioAyah?.audio || currentAyah.audio;
      playTrack(
        {
          audioUrl,
          surahNumber: surah.number,
          ayahNumberInSurah: currentAyah.numberInSurah,
          globalAyahNumber: currentAyah.number,
          surahName: surah.englishName,
          reciterEdition: settings.reciterEdition || 'ar.alafasy',
        },
        currentAyahIndex < surah.ayahs.length - 1 ? handleNextAyah : undefined,
        currentAyahIndex > 0 ? handlePrevAyah : undefined
      );
    }
  };

  // Copy Ayah & Tafsir
  const handleCopy = async () => {
    if (!currentAyah) return;
    const cleanedArabic = cleanAyahText(
      currentAyah.text,
      surah.number,
      currentAyah.numberInSurah
    );
    const transText = currentTranslationAyah?.text
      ? `"${currentTranslationAyah.text}"\n\n`
      : '';
    const plainTafsir = tafsirData?.text
      ? tafsirData.text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
      : '';

    const textToCopy = `${cleanedArabic}\n\n${transText}— Surah ${surah.englishName} (${surah.number}:${currentAyah.numberInSurah})\n\n[Tafsir: ${selectedEdition.name}]\n${plainTafsir.slice(0, 1500)}${plainTafsir.length > 1500 ? '...' : ''}`;

    const ok = await copyToClipboard(textToCopy);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Share
  const handleShare = async () => {
    if (!currentAyah) return;
    const cleanedArabic = cleanAyahText(
      currentAyah.text,
      surah.number,
      currentAyah.numberInSurah
    );
    await shareAyah({
      surahName: surah.englishName,
      surahNumber: surah.number,
      ayahNumber: currentAyah.numberInSurah,
      arabicText: cleanedArabic,
      translationText: currentTranslationAyah?.text,
    });
  };

  // Bookmark Toggle
  const handleBookmarkToggle = () => {
    if (!currentAyah) return;
    const cleanedArabic = cleanAyahText(
      currentAyah.text,
      surah.number,
      currentAyah.numberInSurah
    );
    toggleBookmark({
      surahNumber: surah.number,
      surahName: surah.name,
      surahEnglishName: surah.englishName,
      ayahNumber: currentAyah.numberInSurah,
      globalAyahNumber: currentAyah.number,
      text: cleanedArabic,
      translationText: currentTranslationAyah?.text,
    });
  };

  if (!currentAyah) return null;

  const cleanedArabic = cleanAyahText(
    currentAyah.text,
    surah.number,
    currentAyah.numberInSurah
  );
  const isSajda = Boolean(currentAyah.sajda);

  return (
    <div className="space-y-6 animate-fadeIn" id="tafsir-view-container">
      {/* 1. Tafsir Top Control Bar */}
      <div
        className={`p-4 sm:p-5 rounded-3xl border shadow-xs transition-all ${
          isMushafTheme
            ? 'bg-[#faf5e8]/90 border-[#caa352]/50'
            : 'bg-[#fcfaf6] dark:bg-[#0c1412] border-emerald-900/10 dark:border-emerald-800/20'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: Tafsir Edition Dropdown Selector */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2">
              <ScrollText className="w-5 h-5 text-amber-500 shrink-0" />
              <span className="text-xs font-bold text-emerald-950 dark:text-emerald-50">
                Tafsir Exegesis:
              </span>
            </div>

            <div className="relative">
              <select
                value={selectedTafsirId}
                onChange={(e) => setSelectedTafsirId(e.target.value)}
                className={`pl-3 pr-8 py-2 text-xs font-semibold rounded-2xl border cursor-pointer appearance-none transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/40 ${
                  isMushafTheme
                    ? 'bg-[#fdfaf1] border-[#caa352] text-[#15366c]'
                    : 'bg-white dark:bg-stone-900 border-emerald-900/15 dark:border-emerald-700/40 text-emerald-950 dark:text-emerald-50'
                }`}
                id="tafsir-edition-select"
              >
                <optgroup label="🌟 Tafsir Ibn Kathir (English, Urdu, Arabic)">
                  <option value="en-tafsir-ibn-kathir">
                    🇬🇧 Tafsir Ibn Kathir (English Abridged)
                  </option>
                  <option value="ur-tafsir-ibn-kathir">
                    🇵🇰 تفسیر ابنِ کثیر (اردو — مکمل)
                  </option>
                  <option value="ar-tafsir-ibn-kathir">
                    🇸🇦 تفسير ابن كثير (العربية — تفسير القرآن العظيم)
                  </option>
                </optgroup>
                <optgroup label="📖 Classical & Contemporary Arabic Exegesis">
                  <option value="ar.jalalayn">🇸🇦 تفسير الجلالين (المحلي والسيوطي)</option>
                  <option value="ar.muyassar">🇸🇦 التفسير الميسر (مجمع الملك فهد)</option>
                  <option value="ar.qurtubi">🇸🇦 تفسير القرطبي (الجامع لأحكام القرآن)</option>
                  <option value="ar.waseet">🇸🇦 التفسير الوسيط (طنطاوي)</option>
                  <option value="ar.baghawi">🇸🇦 معالم التنزيل (البغوي)</option>
                </optgroup>
                <optgroup label="📚 English & Urdu In-Depth Commentaries">
                  <option value="en-tafsir-maarif-ul-quran">
                    🇬🇧 Ma'arif al-Qur'an (Mufti Muhammad Shafi)
                  </option>
                  <option value="tafsir-bayan-ul-quran">
                    🇵🇰 بیان القرآن (ڈاکٹر اسرار احمد)
                  </option>
                </optgroup>
              </select>
            </div>

            {/* Language Tag */}
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                selectedEdition.language === 'ur'
                  ? 'bg-emerald-800/15 text-emerald-800 dark:text-emerald-200 font-urdu'
                  : selectedEdition.language === 'ar'
                  ? 'bg-amber-500/15 text-amber-800 dark:text-amber-200 font-arabic'
                  : 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
              }`}
            >
              {selectedEdition.languageLabel}
            </span>
          </div>

          {/* Right: Ayah Navigator & Display Options */}
          <div className="flex items-center gap-2 flex-wrap justify-between md:justify-end">
            {/* Ayah Jump Selector */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrevAyah}
                disabled={currentAyahIndex <= 0}
                className="p-1.5 rounded-xl border border-emerald-900/10 dark:border-emerald-800/20 text-stone-600 dark:text-stone-300 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="Previous Ayah"
                aria-label="Previous Ayah"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <select
                value={currentAyah.numberInSurah}
                onChange={(e) => handleJumpToAyah(Number(e.target.value))}
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-950/5 dark:bg-emerald-950/30 border border-emerald-900/10 dark:border-emerald-800/30 text-emerald-950 dark:text-emerald-50 focus:outline-none cursor-pointer"
                title="Select Ayah"
              >
                {surah.ayahs.map((a) => (
                  <option key={a.numberInSurah} value={a.numberInSurah} className="dark:bg-stone-900">
                    Ayah {a.numberInSurah} of {surah.numberOfAyahs}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleNextAyah}
                disabled={currentAyahIndex >= surah.ayahs.length - 1}
                className="p-1.5 rounded-xl border border-emerald-900/10 dark:border-emerald-800/20 text-stone-600 dark:text-stone-300 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="Next Ayah"
                aria-label="Next Ayah"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Split / Stacked Layout Switcher (hidden on mobile, visible md+) */}
            <div className="hidden md:flex items-center p-0.5 rounded-xl bg-emerald-950/5 dark:bg-emerald-950/30 border border-emerald-900/10 dark:border-emerald-800/20 text-xs">
              <button
                type="button"
                onClick={() => setLayoutMode('split')}
                title="Side-by-side split layout"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  layoutMode === 'split'
                    ? 'bg-emerald-800 text-amber-200 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('stacked')}
                title="Stacked vertical layout"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  layoutMode === 'stacked'
                    ? 'bg-emerald-800 text-amber-200 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                <Rows className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Font Size adjustments for Tafsir */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setTafsirFontSize((s) => Math.max(13, s - 1))}
                className="p-1.5 rounded-xl text-stone-500 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                title="Decrease tafsir text size"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono text-stone-500 min-w-[28px] text-center">
                {tafsirFontSize}px
              </span>
              <button
                type="button"
                onClick={() => setTafsirFontSize((s) => Math.min(26, s + 1))}
                className="p-1.5 rounded-xl text-stone-500 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                title="Increase tafsir text size"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Ayah Number Navigation Strip */}
        <div className="mt-4 pt-3 border-t border-emerald-900/10 dark:border-emerald-800/15 flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          <span className="text-[11px] font-medium text-stone-400 shrink-0 mr-1">
            Verses:
          </span>
          {surah.ayahs.map((a, i) => (
            <button
              key={a.numberInSurah}
              type="button"
              onClick={() => setCurrentAyahIndex(i)}
              className={`shrink-0 w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                i === currentAyahIndex
                  ? isMushafTheme
                    ? 'bg-[#15366c] text-amber-100 ring-2 ring-[#caa352]'
                    : 'bg-emerald-800 text-amber-200 ring-2 ring-amber-400/40 shadow-xs'
                  : 'bg-emerald-950/5 dark:bg-emerald-950/20 text-stone-600 dark:text-stone-300 hover:bg-emerald-950/10 dark:hover:bg-emerald-800/30'
              }`}
            >
              {a.numberInSurah}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Main Content: Alongside Layout (Arabic on Left/Top, Tafsir on Right/Bottom) */}
      <div
        className={
          layoutMode === 'split'
            ? 'grid grid-cols-1 lg:grid-cols-12 gap-6 items-start'
            : 'space-y-6'
        }
      >
        {/* ============================================================== */}
        {/* COLUMN A: ARABIC TEXT & TRANSLATION CARD (Alongside Tafsir)     */}
        {/* ============================================================== */}
        <div
          className={`${
            layoutMode === 'split' ? 'lg:col-span-5 lg:sticky lg:top-24' : 'w-full'
          }`}
        >
          <div
            className={`p-6 sm:p-7 rounded-3xl border shadow-sm transition-all ${
              isMushafTheme
                ? 'bg-[#faf5e8]/95 border-2 border-[#caa352]'
                : 'bg-[#fcfaf6] dark:bg-[#0c1412] border-emerald-900/10 dark:border-emerald-800/20'
            }`}
          >
            {/* Meta Header */}
            <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-emerald-900/10 dark:border-emerald-800/15">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                    isMushafTheme
                      ? 'bg-[#15366c] text-[#fbf8ed] border border-[#caa352]'
                      : 'bg-emerald-950/10 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-200 border border-emerald-900/10'
                  }`}
                >
                  {currentAyah.numberInSurah}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-50">
                    Surah {surah.englishName}
                  </h4>
                  <p className="text-[10px] text-stone-500">
                    Juz {currentAyah.juz} • Page {currentAyah.page} • Verse{' '}
                    {currentAyah.numberInSurah}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                {/* Audio Button */}
                <button
                  type="button"
                  onClick={handlePlayAudio}
                  title={
                    isCurrentAudioPlaying
                      ? 'Pause recitation'
                      : 'Listen to recitation'
                  }
                  className={`p-2 rounded-xl transition-all cursor-pointer ${
                    isCurrentAudioPlaying
                      ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                      : 'text-stone-400 hover:text-emerald-800 dark:hover:text-emerald-200 hover:bg-emerald-950/5'
                  }`}
                >
                  {isCurrentAudioPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current" />
                  )}
                </button>

                {/* Bookmark Button */}
                <button
                  type="button"
                  onClick={handleBookmarkToggle}
                  title={bookmarked ? 'Remove Bookmark' : 'Bookmark Ayah'}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${
                    bookmarked
                      ? 'text-amber-600 bg-amber-500/10 dark:text-amber-400'
                      : 'text-stone-400 hover:text-amber-500 hover:bg-emerald-950/5'
                  }`}
                >
                  <Bookmark
                    className={`w-4 h-4 ${bookmarked ? 'fill-amber-500' : ''}`}
                  />
                </button>

                {/* Copy Button */}
                <button
                  type="button"
                  onClick={handleCopy}
                  title="Copy Ayah & Tafsir"
                  className="p-2 rounded-xl text-stone-400 hover:text-emerald-800 dark:hover:text-emerald-200 hover:bg-emerald-950/5 cursor-pointer"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>

                {/* Share Button */}
                <button
                  type="button"
                  onClick={handleShare}
                  title="Share Ayah"
                  className="p-2 rounded-xl text-stone-400 hover:text-emerald-800 dark:hover:text-emerald-200 hover:bg-emerald-950/5 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Sajda Tag if applicable */}
            {isSajda && (
              <div className="mb-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-800 dark:text-amber-200 border border-amber-500/30">
                  <Compass className="w-3 h-3" />
                  آية سجدة — Sajda Verse
                </span>
              </div>
            )}

            {/* Arabic Quranic Ayah Text */}
            <div className="py-3" dir="rtl">
              <p
                style={{
                  fontSize: `${isMushafTheme ? Math.max(30, settings.arabicFontSize) : settings.arabicFontSize}px`,
                  lineHeight: isMushafTheme ? 2.4 : settings.lineHeight,
                }}
                className={`font-bold transition-all ${
                  settings.arabicFont === 'scheherazade'
                    ? 'font-quran-scheherazade'
                    : 'font-quran-amiri'
                } ${
                  isMushafTheme
                    ? 'text-[#1c1b18]'
                    : 'text-emerald-950 dark:text-amber-100'
                }`}
              >
                {cleanedArabic}
                {isMushafTheme ? (
                  <MushafVerseRosette number={currentAyah.numberInSurah} />
                ) : (
                  <span className="inline-block mx-2 font-['Amiri'] text-amber-600 dark:text-amber-400 select-none text-[0.8em]">
                    ۝
                    <span className="text-[0.65em] -mr-3 font-sans font-medium text-stone-600 dark:text-stone-300">
                      {currentAyah.numberInSurah}
                    </span>
                  </span>
                )}
              </p>
            </div>

            {/* Primary Translation Reference Text */}
            {currentTranslationAyah?.text && (
              <div
                className="mt-4 pt-3.5 border-t border-emerald-900/10 dark:border-emerald-800/15"
                dir={
                  isUrduTranslation(settings.translationEdition) ? 'rtl' : 'ltr'
                }
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    Translation ({translationSurah?.edition?.name || 'Tarjumah'})
                  </span>
                </div>
                <p
                  style={{ fontSize: `${settings.translationFontSize}px` }}
                  className={`leading-relaxed text-stone-700 dark:text-stone-200 ${getTranslationTypographyClass(
                    settings.translationEdition
                  )}`}
                >
                  {isUrduTranslation(settings.translationEdition)
                    ? currentTranslationAyah.text
                    : `“${currentTranslationAyah.text}”`}
                </p>
              </div>
            )}

            {/* Quick Ayah Jump buttons below Arabic text */}
            <div className="mt-5 pt-3 border-t border-emerald-900/10 dark:border-emerald-800/15 flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrevAyah}
                disabled={currentAyahIndex <= 0}
                className="inline-flex items-center gap-1 text-xs font-semibold text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous Ayah
              </button>

              <span className="text-[11px] font-mono text-stone-400">
                {currentAyah.numberInSurah} / {surah.numberOfAyahs}
              </span>

              <button
                type="button"
                onClick={handleNextAyah}
                disabled={currentAyahIndex >= surah.ayahs.length - 1}
                className="inline-flex items-center gap-1 text-xs font-semibold text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                Next Ayah
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* COLUMN B: TAFSIR EXEGESIS COMMENTARY CARD                     */}
        {/* ============================================================== */}
        <div
          className={`${
            layoutMode === 'split' ? 'lg:col-span-7' : 'w-full'
          }`}
        >
          <div
            className={`p-6 sm:p-8 rounded-3xl border shadow-sm transition-all ${
              isMushafTheme
                ? 'bg-[#faf5e8]/95 border border-[#caa352]/70'
                : 'bg-[#fcfaf6] dark:bg-[#0c1412] border-emerald-900/10 dark:border-emerald-800/20'
            }`}
          >
            {/* Tafsir Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-emerald-900/10 dark:border-emerald-800/15">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3
                    className={`text-lg sm:text-xl font-bold ${
                      isMushafTheme
                        ? 'text-[#15366c]'
                        : 'text-emerald-950 dark:text-amber-200'
                    } ${
                      selectedEdition.language === 'ur'
                        ? 'font-urdu'
                        : selectedEdition.language === 'ar'
                        ? 'font-arabic'
                        : 'font-serif'
                    }`}
                  >
                    {tafsirData?.tafsirName || selectedEdition.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300">
                    تفسير معتمد
                  </span>
                </div>

                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Author: {tafsirData?.authorName || selectedEdition.author} •
                  Ayah {currentAyah.numberInSurah} of {surah.englishName}
                </p>
              </div>

              {/* Scholarly Description Pill */}
              <div className="text-[11px] text-stone-500 italic max-w-xs text-left sm:text-right hidden sm:block">
                {selectedEdition.description}
              </div>
            </div>

            {/* Tafsir Content Body */}
            {loadingTafsir ? (
              <div className="py-12 space-y-4">
                <div className="flex items-center gap-2 text-stone-400 text-xs animate-pulse">
                  <ScrollText className="w-4 h-4 text-amber-500 animate-spin" />
                  <span>Loading authentic tafsir commentary...</span>
                </div>
                <div className="h-4 bg-emerald-950/10 dark:bg-emerald-900/20 rounded-md w-3/4 animate-pulse" />
                <div className="h-4 bg-emerald-950/10 dark:bg-emerald-900/20 rounded-md w-full animate-pulse" />
                <div className="h-4 bg-emerald-950/10 dark:bg-emerald-900/20 rounded-md w-5/6 animate-pulse" />
                <div className="h-4 bg-emerald-950/10 dark:bg-emerald-900/20 rounded-md w-4/5 animate-pulse" />
                <div className="h-4 bg-emerald-950/10 dark:bg-emerald-900/20 rounded-md w-2/3 animate-pulse" />
              </div>
            ) : tafsirError ? (
              <div className="py-12 text-center space-y-3">
                <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">
                  Unable to load tafsir commentary for this verse.
                </p>
                <p className="text-xs text-stone-500">
                  Please check your internet connection or try switching to another tafsir edition.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setLoadingTafsir(true);
                    setTafsirError(false);
                    getTafsirForAyah(
                      selectedTafsirId,
                      surah.number,
                      currentAyah.numberInSurah
                    )
                      .then((d) => setTafsirData(d))
                      .catch(() => setTafsirError(true))
                      .finally(() => setLoadingTafsir(false));
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-800 text-amber-200 text-xs font-semibold cursor-pointer"
                >
                  Retry Loading Tafsir
                </button>
              </div>
            ) : tafsirData?.text ? (
              <div
                dir={selectedEdition.direction}
                style={{
                  fontSize: `${tafsirFontSize}px`,
                  lineHeight: selectedEdition.language === 'ur' ? 2.1 : 1.8,
                }}
                className={`prose prose-stone dark:prose-invert max-w-none transition-all ${
                  selectedEdition.language === 'ur'
                    ? 'font-urdu text-right'
                    : selectedEdition.language === 'ar'
                    ? 'font-quran-amiri text-right'
                    : 'text-left font-serif'
                } ${
                  isMushafTheme
                    ? 'text-[#2b2824]'
                    : 'text-stone-800 dark:text-stone-200'
                }`}
              >
                {/* Render HTML from Quran.com or sanitized text from AlQuran Cloud */}
                <div
                  className="space-y-4 tafsir-rich-text [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-amber-800 dark:[&_h1]:text-amber-300 [&_h1]:mt-4 [&_h1]:mb-2 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-emerald-900 dark:[&_h2]:text-emerald-300 [&_h2]:mt-3 [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-bold [&_p]:my-2.5 [&_blockquote]:border-l-4 [&_blockquote]:border-amber-500/50 [&_blockquote]:pl-4 [&_blockquote]:italic [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                  dangerouslySetInnerHTML={{
                    __html: tafsirData.text,
                  }}
                />
              </div>
            ) : (
              <div className="py-10 text-center text-xs text-stone-500">
                No detailed tafsir commentary found for this specific verse.
              </div>
            )}

            {/* Bottom Footer: Next Ayah Tafsir CTA */}
            <div className="mt-8 pt-5 border-t border-emerald-900/10 dark:border-emerald-800/15 flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrevAyah}
                disabled={currentAyahIndex <= 0}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-950/5 dark:bg-emerald-950/20 text-stone-700 dark:text-stone-200 hover:bg-emerald-950/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous Verse Tafsir
              </button>

              <button
                type="button"
                onClick={handleNextAyah}
                disabled={currentAyahIndex >= surah.ayahs.length - 1}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-800 hover:bg-emerald-700 text-amber-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-xs"
              >
                <span>Next Verse Tafsir</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
