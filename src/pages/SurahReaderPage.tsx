import React, { useEffect, useState, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SlidersHorizontal,
  Bookmark,
  Share2,
  BookOpen,
  ScrollText,
  Flame,
} from 'lucide-react';
import { SurahDetail, Ayah } from '../types';
import { getSurahWithTranslation, getSurahAudio } from '../api/quranApi';
import { AyahCard } from '../components/AyahCard';
import { TranslationSelector } from '../components/TranslationSelector';
import { ReaderToolbar } from '../components/ReaderToolbar';
import { TafsirView } from '../components/TafsirView';
import { AyahReaderSkeleton, ErrorState } from '../components/ui/LoadingSkeleton';
import { useQuranSettings } from '../context/QuranSettingsContext';
import { useReadingProgress } from '../context/ReadingProgressContext';
import { useReadingGoal } from '../context/ReadingGoalContext';
import { useAudio } from '../context/AudioContext';
import {
  BISMILLAH_TEXT,
  BISMILLAH_TRANSLATION,
  BISMILLAH_URDU,
  isUrduTranslation,
  cleanAyahText,
} from '../utils/quranUtils';
import {
  MushafCornerLeaf,
  MushafHeaderMedallion,
  MushafVineFlourish,
  GoldenAyahEndMarker,
  toArabicDigits,
} from '../components/ui/MushafOrnaments';
import { TajweedText, TajweedLegend } from '../components/ui/TajweedText';
import { IndoPak16LineMushaf } from '../components/mushaf/IndoPak16LineMushaf';

interface SurahReaderPageProps {
  surahNumber: number;
  initialAyahNumber?: number;
  initialViewMode?: 'standard' | 'mushaf' | 'tafsir';
  onNavigateSurah: (surahNumber: number, ayahNumber?: number) => void;
  onOpenSettingsModal: () => void;
  onOpenBookmarks?: () => void;
}

export const SurahReaderPage: React.FC<SurahReaderPageProps> = ({
  surahNumber,
  initialAyahNumber,
  initialViewMode = 'standard',
  onNavigateSurah,
  onOpenSettingsModal,
  onOpenBookmarks,
}) => {
  const { settings, updateSettings } = useQuranSettings();
  const { saveProgress } = useReadingProgress();
  const {
    dailyTarget,
    todayAyahsRead,
    todayProgressPercentage,
    currentStreak,
    isGoalMetToday,
    openGoalModal,
    recordAyahRead,
  } = useReadingGoal();
  const { playTrack, togglePlayPause, isPlaying, currentTrack } = useAudio();
  const isMushafTheme = settings.theme === 'mushaf';

  const [arabicSurah, setArabicSurah] = useState<SurahDetail | null>(null);
  const [translationSurah, setTranslationSurah] = useState<SurahDetail | null>(null);
  const [audioAyahs, setAudioAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedAyahIndex, setSelectedAyahIndex] = useState<number | null>(null);
  const [tajweedEnabled, setTajweedEnabled] = useState(true);
  const [viewMode, setViewMode] = useState<'standard' | 'mushaf' | 'tafsir'>(initialViewMode);
  const [tafsirAyahNumber, setTafsirAyahNumber] = useState<number>(initialAyahNumber || 1);

  useEffect(() => {
    if (initialViewMode) {
      setViewMode(initialViewMode);
    }
  }, [initialViewMode]);

  useEffect(() => {
    if (initialAyahNumber) {
      setTafsirAyahNumber(initialAyahNumber);
    }
  }, [initialAyahNumber]);

  const containerRef = useRef<HTMLDivElement>(null);

  const fetchSurah = async () => {
    setLoading(true);
    setError(false);
    try {
      const { arabic, translation } = await getSurahWithTranslation(
        surahNumber,
        settings.translationEdition
      );
      setArabicSurah(arabic);
      setTranslationSurah(translation);

      // Background fetch audio metadata for smooth sequential recitation
      getSurahAudio(surahNumber, settings.reciterEdition || 'ar.alafasy', { skipErrorToast: true })
        .then((audioData) => {
          if (audioData?.ayahs) {
            setAudioAyahs(audioData.ayahs);
          }
        })
        .catch((e) => console.warn('Audio recitation fetch notice:', e));
    } catch (err) {
      console.error('Failed to fetch surah', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurah();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [surahNumber, settings.translationEdition, settings.reciterEdition]);

  // Scroll to initialAyahNumber if specified
  useEffect(() => {
    if (!loading && initialAyahNumber && arabicSurah) {
      setTimeout(() => {
        const el = document.getElementById(`ayah-${initialAyahNumber}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  }, [loading, initialAyahNumber, arabicSurah]);

  // Track reading progress on scroll / view
  useEffect(() => {
    if (!arabicSurah || !settings.autoSaveLastRead) return;

    const handleScroll = () => {
      // Find the topmost visible ayah
      const ayahElements = document.querySelectorAll('[id^="ayah-"]');
      for (const el of Array.from(ayahElements)) {
        const rect = el.getBoundingClientRect();
        if (rect.top >= 0 && rect.top <= window.innerHeight / 2) {
          const ayahNum = Number(el.id.replace('ayah-', ''));
          if (ayahNum) {
            saveProgress(
              arabicSurah.number,
              arabicSurah.name,
              arabicSurah.englishName,
              ayahNum,
              arabicSurah.numberOfAyahs,
              window.scrollY
            );
            // Count towards daily reading goal silently
            recordAyahRead(arabicSurah.number, ayahNum, true);
          }
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [arabicSurah, settings.autoSaveLastRead, recordAyahRead, saveProgress]);

  // Sequential audio player helper
  const handlePlayAyah = (index: number) => {
    if (!arabicSurah || !arabicSurah.ayahs[index]) return;
    const ayah = arabicSurah.ayahs[index];
    const audioAyah = audioAyahs[index];
    const audioUrl = audioAyah?.audio || ayah.audio;

    setSelectedAyahIndex(index);

    const onNext =
      index < arabicSurah.ayahs.length - 1
        ? () => handlePlayAyah(index + 1)
        : undefined;

    const onPrev = index > 0 ? () => handlePlayAyah(index - 1) : undefined;

    playTrack(
      {
        audioUrl,
        surahNumber: arabicSurah.number,
        ayahNumberInSurah: ayah.numberInSurah,
        globalAyahNumber: ayah.number,
        surahName: arabicSurah.englishName,
        reciterEdition: settings.reciterEdition || 'ar.alafasy',
      },
      onNext,
      onPrev
    );

    // Smooth scroll to active ayah
    const el = document.getElementById(`ayah-${ayah.numberInSurah}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const isSurahPlaying =
    currentTrack?.surahNumber === surahNumber && isPlaying;

  if (loading) {
    return (
      <div className="py-6 px-4">
        <AyahReaderSkeleton />
      </div>
    );
  }

  if (error || !arabicSurah) {
    return (
      <div className="py-12 px-4">
        <ErrorState
          message={`Unable to load Surah ${surahNumber}.`}
          onRetry={fetchSurah}
        />
      </div>
    );
  }

  // Check if Bismillah banner should be shown:
  // Show at start of every Surah EXCEPT Surah 9 (At-Tawbah)
  const showBismillahBanner = surahNumber !== 9;

  return (
    <div ref={containerRef} className="max-w-4xl mx-auto px-4 pb-28 pt-2 space-y-8">
      {/* Top Surah Navigation Header */}
      <div className="flex items-center justify-between gap-2 border-b border-emerald-900/10 dark:border-emerald-800/20 pb-4">
        {/* Previous Surah button */}
        <button
          onClick={() => onNavigateSurah(surahNumber - 1)}
          disabled={surahNumber <= 1}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-emerald-950/5 dark:hover:bg-emerald-950/30 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
          id="prev-surah-btn"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous Surah</span>
        </button>

        {/* Quick Ayah Jump Selector & Translation Quick Selector */}
        <div className="flex items-center gap-2">
          <select
            value={currentTrack?.ayahNumberInSurah || 1}
            onChange={(e) => {
              const num = Number(e.target.value);
              const el = document.getElementById(`ayah-${num}`);
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-950/5 dark:bg-emerald-950/30 border border-emerald-900/10 dark:border-emerald-800/30 text-xs font-medium text-emerald-950 dark:text-emerald-50 focus:outline-none cursor-pointer"
            title="Jump to Ayah"
          >
            {arabicSurah.ayahs.map((a) => (
              <option key={a.numberInSurah} value={a.numberInSurah} className="dark:bg-stone-900">
                Ayah {a.numberInSurah}
              </option>
            ))}
          </select>

          {/* Dynamic Translation Edition Switcher */}
          <TranslationSelector
            variant="dropdown"
            className="hidden sm:flex max-w-[210px]"
          />
        </div>

        {/* Next Surah button */}
        <button
          onClick={() => onNavigateSurah(surahNumber + 1)}
          disabled={surahNumber >= 114}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-emerald-950/5 dark:hover:bg-emerald-950/30 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
          id="next-surah-btn"
        >
          <span className="hidden sm:inline">Next Surah</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Daily Reading Goal Banner */}
      <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/25 transition-all">
        <div
          onClick={openGoalModal}
          className="flex items-center gap-2 cursor-pointer group"
          id="reader-goal-info-pill"
          title="Click to view streak & adjust goal"
        >
          <div className="w-7 h-7 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-emerald-950 dark:text-emerald-50">
                Daily Goal: {todayAyahsRead} / {dailyTarget} Ayahs
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-900 dark:text-amber-200">
                {todayProgressPercentage}%
              </span>
              {currentStreak > 0 && (
                <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 hidden sm:inline">
                  • {currentStreak}d Streak
                </span>
              )}
            </div>
            <p className="text-[10px] text-stone-500 dark:text-stone-400 leading-none mt-0.5">
              {isGoalMetToday
                ? 'Target reached today! Alhamdulillah.'
                : `${Math.max(0, dailyTarget - todayAyahsRead)} ayahs remaining to hit target`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-16 sm:w-28 bg-amber-500/20 h-2 rounded-full overflow-hidden hidden xs:block">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isGoalMetToday ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${Math.max(5, todayProgressPercentage)}%` }}
            />
          </div>
          <button
            onClick={openGoalModal}
            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-emerald-950/5 dark:bg-emerald-950/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 transition-all cursor-pointer"
            id="reader-goal-adjust-btn"
          >
            Adjust
          </button>
        </div>
      </div>

      {/* View Mode Switcher: Standard Translation vs Mushaf Page vs Tafsir Exegesis */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 pb-2">
        <div
          className={`inline-flex p-1 rounded-2xl border shadow-xs ${
            isMushafTheme
              ? 'bg-[#faf5e8] border-[#caa352]/50'
              : 'bg-emerald-950/5 dark:bg-emerald-950/30 border-emerald-900/10 dark:border-emerald-800/20'
          }`}
        >
          <button
            type="button"
            onClick={() => setViewMode('standard')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              viewMode === 'standard'
                ? isMushafTheme
                  ? 'bg-[#15366c] text-[#fbf8ed] shadow-xs'
                  : 'bg-emerald-800 text-amber-200 shadow-xs'
                : 'text-stone-600 dark:text-stone-300 hover:text-emerald-900 dark:hover:text-amber-200'
            }`}
            id="tab-standard-view"
          >
            <BookOpen className="w-4 h-4" />
            <span>Ayah by Ayah</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('mushaf')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              viewMode === 'mushaf'
                ? isMushafTheme
                  ? 'bg-[#15366c] text-[#fbf8ed] shadow-xs'
                  : 'bg-emerald-800 text-amber-200 shadow-xs'
                : 'text-stone-600 dark:text-stone-300 hover:text-emerald-900 dark:hover:text-amber-200'
            }`}
            id="tab-mushaf-view"
          >
            <ScrollText className="w-4 h-4 text-amber-400" />
            <span className="font-urdu">۱۶ سطری رنگین نسخہ (16-Line Mushaf)</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('tafsir')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              viewMode === 'tafsir'
                ? isMushafTheme
                  ? 'bg-[#15366c] text-[#fbf8ed] shadow-xs'
                  : 'bg-emerald-800 text-amber-200 shadow-xs'
                : 'text-stone-600 dark:text-stone-300 hover:text-emerald-900 dark:hover:text-amber-200'
            }`}
            id="tab-tafsir-view"
          >
            <span>Tafsir (تفسیر)</span>
          </button>
        </div>

        {/* Rangeen Tajweed Toggle Button */}
        <button
          type="button"
          onClick={() => setTajweedEnabled(!tajweedEnabled)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
            tajweedEnabled
              ? 'bg-amber-500/20 border-amber-400 text-amber-900 dark:text-amber-200 shadow-xs ring-1 ring-amber-400/30'
              : 'bg-emerald-950/5 dark:bg-emerald-950/30 border-emerald-900/10 dark:border-emerald-800/30 text-stone-500'
          }`}
          title="Toggle Rangeen Tajweed Coloration (رنگین تجوید)"
          id="toggle-tajweed-btn"
        >
          <span>🎨</span>
          <span>{tajweedEnabled ? 'Rangeen Tajweed: ON' : 'Rangeen Tajweed: OFF'}</span>
          <span className={`w-2 h-2 rounded-full ${tajweedEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}`} />
        </button>
      </div>

      {/* Tajweed Color Legend Bar when Rangeen is ON */}
      {tajweedEnabled && (
        <TajweedLegend />
      )}

      {/* Render either Tafsir View, Mushaf Page View, or Standard Reading View */}
      {viewMode === 'tafsir' ? (
        <TafsirView
          surah={arabicSurah}
          translationSurah={translationSurah}
          audioAyahs={audioAyahs}
          initialAyahNumber={tafsirAyahNumber}
          onClose={() => setViewMode('standard')}
        />
      ) : viewMode === 'mushaf' ? (
        /* Authentic Indo-Pak 16-Line Tajweed Quran Page (۱۶ سطری رنگین نسخہ) */
        <IndoPak16LineMushaf
          surah={arabicSurah}
          audioAyahs={audioAyahs}
          translationSurah={translationSurah}
          onOpenTafsir={(ayahNum) => {
            setTafsirAyahNumber(ayahNum);
            setViewMode('tafsir');
          }}
          initialAyahNumber={initialAyahNumber}
        />
      ) : (
        <>
          {/* Surah Title Banner & Info Card */}
      {isMushafTheme ? (
        <div className="relative overflow-hidden p-6 sm:p-10 rounded-3xl border-2 border-[#caa352] bg-[#faf5e8]/90 shadow-sm text-center space-y-4">
          {/* 4 Gilded Corner Leaves in Mushaf Theme */}
          <div className="absolute top-1.5 left-1.5 pointer-events-none">
            <MushafCornerLeaf position="top-left" />
          </div>
          <div className="absolute top-1.5 right-1.5 pointer-events-none">
            <MushafCornerLeaf position="top-right" />
          </div>

          {/* Authentic Top Royal Medallion from AlQuran.cloud screenshot */}
          <MushafHeaderMedallion
            title={`${arabicSurah.englishName} • ${arabicSurah.name}`}
            surahNumber={arabicSurah.number}
          />

          {/* Subtitle Details */}
          <div className="space-y-1">
            <p className="text-sm font-['Cinzel',serif] tracking-wider text-[#8e6b23]">
              {arabicSurah.englishNameTranslation}
            </p>
            <p className="text-xs text-stone-500">
              {arabicSurah.revelationType} Revelation • {arabicSurah.numberOfAyahs} Verses
            </p>
          </div>

          {/* Play Full Surah Recitation CTA */}
          <div className="pt-2">
            <button
              onClick={() => handlePlayAyah(0)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#15366c] hover:bg-[#1f4585] text-amber-100 font-semibold text-xs shadow-sm border border-[#caa352] hover:scale-[1.02] transition-all cursor-pointer"
              id="play-surah-audio-btn"
            >
              {isSurahPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Playing Recitation</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play Surah Recitation</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-emerald-950/5 via-emerald-900/10 to-transparent dark:from-emerald-950/40 dark:via-emerald-900/20 dark:to-transparent border border-emerald-900/15 dark:border-emerald-800/30 text-center space-y-4 shadow-sm">
          {/* Arabic Calligraphy Title */}
          <h1
            dir="rtl"
            className="font-quran-amiri text-4xl sm:text-5xl lg:text-6xl font-bold text-emerald-950 dark:text-emerald-50 tracking-wider"
          >
            {arabicSurah.name}
          </h1>

          {/* English Name & Translation */}
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-emerald-900 dark:text-amber-200 font-['Cinzel',serif]">
              {arabicSurah.englishName}
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-300 italic">
              "{arabicSurah.englishNameTranslation}"
            </p>
          </div>

          {/* Badges: Revelation Type, Ayahs count, Active Translation */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs font-medium text-stone-600 dark:text-stone-300">
            <span className="px-3 py-1 rounded-full bg-emerald-950/10 dark:bg-emerald-800/30 border border-emerald-900/10 dark:border-emerald-700/30">
              Surah {arabicSurah.number}
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-950/10 dark:bg-emerald-800/30 border border-emerald-900/10 dark:border-emerald-700/30">
              {arabicSurah.revelationType}
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-950/10 dark:bg-emerald-800/30 border border-emerald-900/10 dark:border-emerald-700/30">
              {arabicSurah.numberOfAyahs} Ayahs
            </span>
            {isUrduTranslation(settings.translationEdition) && (
              <span className="px-3 py-1 rounded-full bg-emerald-800/15 dark:bg-emerald-700/30 text-emerald-800 dark:text-emerald-200 border border-emerald-800/30 font-urdu text-xs">
                اردو ترجمہ فعال ہے
              </span>
            )}
          </div>

          {/* Play Full Surah Recitation CTA */}
          <div className="pt-3">
            <button
              onClick={() => handlePlayAyah(0)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-800 hover:bg-emerald-700 text-amber-200 font-semibold text-xs shadow-sm hover:scale-[1.02] transition-all cursor-pointer"
              id="play-surah-audio-btn"
            >
              {isSurahPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Playing Recitation</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play Recitation</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Bismillah Calligraphy (Shown for all Surahs except Surah 9 At-Tawbah) */}
      {showBismillahBanner && (
        <div
          className={`py-8 text-center space-y-2 select-none ${
            isMushafTheme
              ? 'border-y border-[#caa352]/30 my-4 bg-[#faf5e8]/50'
              : 'border-b border-emerald-900/10 dark:border-emerald-800/20'
          }`}
        >
          <p
            dir="rtl"
            className={`font-quran-amiri text-2xl sm:text-3xl md:text-4xl tracking-wider ${
              isMushafTheme ? 'text-[#1c1b18]' : 'text-emerald-950 dark:text-amber-200'
            }`}
          >
            {BISMILLAH_TEXT}
          </p>
          <p
            dir={isUrduTranslation(settings.translationEdition) ? 'rtl' : 'ltr'}
            className={`tracking-wide ${
              isMushafTheme
                ? 'font-mushaf-translation text-sm sm:text-base text-[#3d382e]'
                : isUrduTranslation(settings.translationEdition)
                ? 'font-urdu text-base sm:text-lg text-stone-600 dark:text-stone-300'
                : 'text-xs sm:text-sm font-sans italic text-stone-500 dark:text-stone-400'
            }`}
          >
            {isUrduTranslation(settings.translationEdition)
              ? BISMILLAH_URDU
              : `“${BISMILLAH_TRANSLATION}”`}
          </p>
        </div>
      )}

      {/* Surah Ayahs List */}
      <div className="space-y-6">
        {arabicSurah.ayahs.map((ayah, index) => {
          const translationAyah = translationSurah?.ayahs[index];
          const audioAyah = audioAyahs[index];
          const isCurrentlyPlaying =
            currentTrack?.surahNumber === surahNumber &&
            currentTrack?.ayahNumberInSurah === ayah.numberInSurah;

          return (
            <AyahCard
              key={ayah.number}
              ayah={ayah}
              surah={arabicSurah}
              translationText={translationAyah?.text}
              audioUrl={audioAyah?.audio}
              isCurrentPlaying={isCurrentlyPlaying}
              onPlayNext={
                index < arabicSurah.ayahs.length - 1
                  ? () => handlePlayAyah(index + 1)
                  : undefined
              }
              onPlayPrev={index > 0 ? () => handlePlayAyah(index - 1) : undefined}
              onOpenTafsir={(ayahNum) => {
                setTafsirAyahNumber(ayahNum);
                setViewMode('tafsir');
              }}
              tajweedEnabled={tajweedEnabled}
            />
          );
        })}
      </div>

      {/* Looping Vine Flourish at bottom of Mushaf page (from screenshot) */}
      {isMushafTheme && <MushafVineFlourish />}
        </>
      )}

      {/* Bottom Surah Navigation */}
      <div className="flex items-center justify-between gap-4 pt-8 border-t border-emerald-900/10 dark:border-emerald-800/20">
        <button
          onClick={() => onNavigateSurah(surahNumber - 1)}
          disabled={surahNumber <= 1}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#fcfaf6] dark:bg-[#0c1412] border border-emerald-900/10 dark:border-emerald-800/30 text-xs font-semibold text-emerald-950 dark:text-emerald-50 hover:bg-emerald-950/5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous Surah</span>
        </button>

        <span className="text-xs font-serif italic text-stone-400">
          صدق الله العظيم
        </span>

        <button
          onClick={() => onNavigateSurah(surahNumber + 1)}
          disabled={surahNumber >= 114}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#fcfaf6] dark:bg-[#0c1412] border border-emerald-900/10 dark:border-emerald-800/30 text-xs font-semibold text-emerald-950 dark:text-emerald-50 hover:bg-emerald-950/5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          <span>Next Surah</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Reader Toolbar */}
      <ReaderToolbar
        onOpenSettingsModal={onOpenSettingsModal}
        onOpenBookmarks={onOpenBookmarks}
      />
    </div>
  );
};
