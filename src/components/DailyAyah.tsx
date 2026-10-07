import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Copy,
  Share2,
  Bookmark,
  Check,
  RefreshCw,
  Play,
  Pause,
  ArrowUpRight,
  ScrollText,
  Calendar,
  Dices,
  Volume2,
  BookOpen,
  Quote,
  Lightbulb,
  PenLine,
} from 'lucide-react';
import { Ayah } from '../types';
import { getRandomAyah, getAyahWithTranslation } from '../api/quranApi';
import { useBookmarks } from '../context/BookmarksContext';
import { useAudio } from '../context/AudioContext';
import { useQuranSettings } from '../context/QuranSettingsContext';
import {
  cleanAyahText,
  copyToClipboard,
  shareAyah,
  getTranslationTypographyClass,
  isUrduTranslation,
} from '../utils/quranUtils';
import { MushafCornerLeaf, MushafVerseRosette } from './ui/MushafOrnaments';
import { VerseNoteModal } from './VerseNoteModal';

interface DailyAyahProps {
  onNavigateToAyah: (surahNumber: number, ayahNumber: number) => void;
  onOpenTafsir?: (surahNumber: number, ayahNumber: number) => void;
}

interface CuratedVerse {
  surah: number;
  ayah: number;
  theme: string;
  reflectionPrompt: string;
}

/**
 * Curated pool of reflective, spiritually uplifting Quranic verses for daily reflection
 */
const CURATED_DAILY_VERSES: CuratedVerse[] = [
  {
    surah: 94,
    ayah: 5,
    theme: 'Ease & Relief',
    reflectionPrompt:
      'Allah promises that alongside hardship, ease is already unfolding. What challenge are you facing that you can entrust to His infinite mercy today?',
  },
  {
    surah: 2,
    ayah: 255,
    theme: "Ayat al-Kursi (Allah's Majesty)",
    reflectionPrompt:
      'Reflect on Allah as Al-Hayy (the Ever-Living) and Al-Qayyum (the Sustainer of all). Neither fatigue nor slumber touches Him. Place your worries in His care.',
  },
  {
    surah: 13,
    ayah: 28,
    theme: 'Peace of the Heart',
    reflectionPrompt:
      'True serenity is never found in worldly pursuits alone, but in the conscious remembrance of Allah. Take a moment to calm your heart with Dhikr.',
  },
  {
    surah: 39,
    ayah: 53,
    theme: 'Infinite Mercy & Hope',
    reflectionPrompt:
      'Never despair of the mercy of Allah, for He forgives all sins. Turn back to Him with a humble heart—His door of forgiveness is always wide open.',
  },
  {
    surah: 3,
    ayah: 139,
    theme: 'Courage & Faith',
    reflectionPrompt:
      'Do not weaken and do not grieve. Stand steadfast in your convictions and moral integrity, knowing that genuine strength comes from faith in Allah.',
  },
  {
    surah: 14,
    ayah: 7,
    theme: 'Gratitude (Shukr)',
    reflectionPrompt:
      'If you are grateful, Allah will surely increase you. Name three blessings in your life right now, and express heartfelt thanks to your Creator.',
  },
  {
    surah: 2,
    ayah: 152,
    theme: 'Divine Remembrance',
    reflectionPrompt:
      '"Remember Me; I will remember you." How astonishing that the Lord of the heavens and the earth remembers you when you utter His name.',
  },
  {
    surah: 2,
    ayah: 186,
    theme: 'Closeness in Dua',
    reflectionPrompt:
      'Allah is near to you; He answers the prayer of the supplicant whenever they call. Pour out your heart to Him today with unwavering conviction.',
  },
  {
    surah: 65,
    ayah: 3,
    theme: 'Trust & Reliance (Tawakkul)',
    reflectionPrompt:
      'Whoever relies upon Allah, He alone is sufficient for them. Strive with your best effort, then surrender the outcome to the Best of Planners.',
  },
  {
    surah: 21,
    ayah: 87,
    theme: 'Relief from Distress',
    reflectionPrompt:
      'The heartfelt supplication of Yunus (AS) in the darkness: "There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers."',
  },
  {
    surah: 2,
    ayah: 286,
    theme: 'Divine Compassion',
    reflectionPrompt:
      'Allah does not burden any soul beyond what it can bear. Whatever struggles you carry, know that Allah has endowed you with the resilience to navigate them.',
  },
  {
    surah: 93,
    ayah: 3,
    theme: 'Divine Solace',
    reflectionPrompt:
      'Even when life feels quiet or isolating, your Lord has not abandoned you nor is He displeased. His gentleness envelops your days and nights.',
  },
  {
    surah: 25,
    ayah: 74,
    theme: 'Righteous Family & Legacy',
    reflectionPrompt:
      'Pray for your loved ones to be a source of joy, comfort, and righteous leadership. Seek goodness that echoes across generations.',
  },
  {
    surah: 50,
    ayah: 16,
    theme: 'Proximity to Allah',
    reflectionPrompt:
      'Allah knows what your soul whispers within you, and He is closer to you than your jugular vein. You are never alone in His presence.',
  },
  {
    surah: 103,
    ayah: 1,
    theme: 'The Value of Time',
    reflectionPrompt:
      'Time slips away like flowing water. Safeguard your hours through faith, righteous actions, mutual encouragement to truth, and enduring patience.',
  },
  {
    surah: 59,
    ayah: 22,
    theme: 'The Divine Attributes',
    reflectionPrompt:
      'He is Allah, the Knower of the unseen and the witnessed, the Entirely Merciful, the Especially Merciful. Contemplate His boundless attributes.',
  },
  {
    surah: 49,
    ayah: 13,
    theme: 'Universal Brotherhood',
    reflectionPrompt:
      'The most noble among you in the sight of Allah is the most conscious of Him. Practice compassion, humility, and justice with all people.',
  },
  {
    surah: 55,
    ayah: 13,
    theme: 'Contemplating Favors',
    reflectionPrompt:
      '"Which of the favors of your Lord will you deny?" From the air in your lungs to the sky above, divine mercy surrounds you at every breath.',
  },
];

export const DailyAyah: React.FC<DailyAyahProps> = ({
  onNavigateToAyah,
  onOpenTafsir,
}) => {
  const [arabicAyah, setArabicAyah] = useState<Ayah | null>(null);
  const [translationAyah, setTranslationAyah] = useState<Ayah | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<'daily' | 'random'>('daily');
  const [activeTranslationEdition, setActiveTranslationEdition] = useState<string>('');
  const [reflectionText, setReflectionText] = useState<string>('');
  const [showReflection, setShowReflection] = useState<boolean>(true);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState<boolean>(false);

  const { settings } = useQuranSettings();
  const { isBookmarked, toggleBookmark, getBookmark } = useBookmarks();
  const { playTrack, togglePlayPause, isPlaying, currentTrack } = useAudio();
  const isMushafTheme = settings.theme === 'mushaf';

  // Synchronize translation edition with settings by default
  const effectiveEdition = activeTranslationEdition || settings.translationEdition || 'en.sahih';

  // Calculate today's deterministic curated verse based on calendar date
  const getTodayCuratedVerse = (): CuratedVerse => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - startOfYear.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    return CURATED_DAILY_VERSES[dayOfYear % CURATED_DAILY_VERSES.length];
  };

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  const fetchDailyAyah = async (targetMode: 'daily' | 'random' = 'daily') => {
    setLoading(true);
    setError(false);
    try {
      if (targetMode === 'daily') {
        const curated = getTodayCuratedVerse();
        const result = await getAyahWithTranslation(
          curated.surah,
          curated.ayah,
          effectiveEdition
        );
        setArabicAyah(result.arabic);
        setTranslationAyah(result.translation);
        setReflectionText(curated.reflectionPrompt);
        setMode('daily');
      } else {
        const result = await getRandomAyah(effectiveEdition);
        setArabicAyah(result.arabic);
        setTranslationAyah(result.translation);
        setReflectionText(
          'Take a quiet moment to ponder this verse. How does its divine guidance, reassurance, or reminder speak to your heart and actions today?'
        );
        setMode('random');
      }
    } catch (e) {
      console.error('Failed to fetch daily ayah', e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyAyah(mode);
  }, [effectiveEdition]);

  const handleCopy = async () => {
    if (!arabicAyah) return;
    const surahName = arabicAyah.surah?.englishName || 'The Holy Quran';
    const surahNumber = arabicAyah.surah?.number || 1;
    const ayahInSurah = arabicAyah.numberInSurah || 1;
    const cleanArabic = cleanAyahText(arabicAyah.text, surahNumber, ayahInSurah);

    const textToCopy = `${cleanArabic}\n\n"${translationAyah?.text || ''}"\n\n— Surah ${surahName} (${surahNumber}:${ayahInSurah})\nRead on Holy Quran App`;
    const success = await copyToClipboard(textToCopy);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (!arabicAyah) return;
    const surahName = arabicAyah.surah?.englishName || 'The Holy Quran';
    const surahNumber = arabicAyah.surah?.number || 1;
    const ayahInSurah = arabicAyah.numberInSurah || 1;
    const cleanArabic = cleanAyahText(arabicAyah.text, surahNumber, ayahInSurah);

    await shareAyah({
      surahName,
      surahNumber,
      ayahNumber: ayahInSurah,
      arabicText: cleanArabic,
      translationText: translationAyah?.text,
    });
  };

  if (loading) {
    return (
      <div
        className={`relative overflow-hidden p-6 sm:p-9 rounded-3xl border transition-all ${
          isMushafTheme
            ? 'bg-[#faf5e8] border-[#caa352]/60'
            : 'bg-[#fcfaf6] dark:bg-[#0c1412] border-emerald-900/10 dark:border-emerald-800/20'
        } shadow-sm animate-pulse space-y-5`}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-emerald-900/15 dark:bg-emerald-700/20" />
            <div className="w-32 h-4 bg-emerald-900/10 dark:bg-emerald-700/20 rounded-md" />
          </div>
          <div className="w-24 h-4 bg-emerald-900/10 dark:bg-emerald-700/20 rounded-md" />
        </div>
        <div className="w-full h-16 bg-emerald-900/10 dark:bg-emerald-700/20 rounded-2xl" />
        <div className="w-4/5 h-6 bg-emerald-900/10 dark:bg-emerald-700/20 rounded-md" />
        <div className="flex justify-between items-center pt-3 border-t border-emerald-900/10 dark:border-emerald-800/20">
          <div className="w-36 h-4 bg-emerald-900/10 dark:bg-emerald-700/20 rounded-md" />
          <div className="w-24 h-8 bg-emerald-900/10 dark:bg-emerald-700/20 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !arabicAyah) {
    return (
      <div
        className={`p-7 rounded-3xl border text-center space-y-3 ${
          isMushafTheme
            ? 'bg-[#faf5e8] border-[#caa352]/60'
            : 'bg-[#fcfaf6] dark:bg-[#0c1412] border-emerald-900/10 dark:border-emerald-800/20'
        }`}
      >
        <Sparkles className="w-7 h-7 mx-auto text-amber-600 dark:text-amber-400" />
        <p className="text-sm font-medium text-stone-600 dark:text-stone-300">
          Unable to fetch the Ayah of reflection right now.
        </p>
        <button
          type="button"
          onClick={() => fetchDailyAyah(mode)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-800 hover:bg-emerald-700 text-amber-200 shadow-xs transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry Verse
        </button>
      </div>
    );
  }

  const surahName = arabicAyah.surah?.englishName || 'The Holy Quran';
  const surahArabicName = arabicAyah.surah?.name || 'القرآن الكريم';
  const surahNumber = arabicAyah.surah?.number || 1;
  const ayahInSurah = arabicAyah.numberInSurah || 1;
  const revelationType = arabicAyah.surah?.revelationType || 'Meccan';
  const juzNumber = arabicAyah.juz || 1;
  const bookmarked = isBookmarked(surahNumber, ayahInSurah);
  const dailyBookmark = getBookmark(surahNumber, ayahInSurah);
  const dailyNote = dailyBookmark?.note;
  const hasDailyNote = Boolean(dailyNote && dailyNote.trim().length > 0);

  const isCurrentPlaying =
    currentTrack?.surahNumber === surahNumber &&
    currentTrack?.ayahNumberInSurah === ayahInSurah;

  const handleBookmarkToggle = () => {
    toggleBookmark({
      surahNumber,
      surahName: surahArabicName,
      surahEnglishName: surahName,
      ayahNumber: ayahInSurah,
      globalAyahNumber: arabicAyah.number,
      text: cleanAyahText(arabicAyah.text, surahNumber, ayahInSurah),
      translationText: translationAyah?.text,
    });
  };

  const handlePlay = () => {
    if (isCurrentPlaying) {
      togglePlayPause();
    } else {
      playTrack({
        audioUrl: arabicAyah.audio,
        surahNumber,
        ayahNumberInSurah: ayahInSurah,
        globalAyahNumber: arabicAyah.number,
        surahName,
        reciterEdition: settings.reciterEdition || 'ar.alafasy',
      });
    }
  };

  const cleanedArabic = cleanAyahText(arabicAyah.text, surahNumber, ayahInSurah);
  const typography = getTranslationTypographyClass(effectiveEdition);
  const isUrdu = isUrduTranslation(effectiveEdition);

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border shadow-sm transition-all ${
        isMushafTheme
          ? 'bg-[#faf5e8] border-2 border-[#caa352] text-[#1c1917]'
          : 'bg-gradient-to-br from-[#fcfaf6] via-[#f8f5ee] to-[#f4eee2] dark:from-[#0c1412] dark:via-[#0a1b16] dark:to-[#08221b] border-emerald-900/15 dark:border-emerald-800/30'
      }`}
      id="daily-ayah-widget"
    >
      {/* 4 Gilded Corner Leaves in Mushaf Theme */}
      {isMushafTheme && (
        <>
          <div className="absolute top-2 left-2 pointer-events-none select-none">
            <MushafCornerLeaf position="top-left" />
          </div>
          <div className="absolute top-2 right-2 pointer-events-none select-none">
            <MushafCornerLeaf position="top-right" />
          </div>
          <div className="absolute bottom-2 left-2 pointer-events-none select-none">
            <MushafCornerLeaf position="bottom-left" />
          </div>
          <div className="absolute bottom-2 right-2 pointer-events-none select-none">
            <MushafCornerLeaf position="bottom-right" />
          </div>
        </>
      )}

      {/* Widget Header Strip */}
      <div
        className={`px-6 sm:px-8 pt-6 pb-4 border-b flex flex-wrap items-center justify-between gap-3 ${
          isMushafTheme
            ? 'border-[#caa352]/40 bg-[#faf5e8]/80'
            : 'border-emerald-900/10 dark:border-emerald-800/20 bg-emerald-950/5 dark:bg-emerald-950/20'
        }`}
      >
        {/* Title & Mode Badge */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-emerald-950 dark:text-emerald-50 font-['Cinzel',serif] tracking-wide">
                  {mode === 'daily' ? 'Daily Ayah' : 'Random Ayah'}
                </h3>
                <span className="text-xs font-quran-amiri font-bold text-amber-600 dark:text-amber-400">
                  {mode === 'daily' ? 'آية اليوم' : 'آية عشوائية'}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>{formattedDate}</span>
                <span className="text-stone-300 dark:text-stone-600">•</span>
                <span>Spiritual Contemplation</span>
              </p>
            </div>
          </div>
        </div>

        {/* Translation Edition Selector & Fetch Random Controls */}
        <div className="flex items-center gap-2">
          {/* Quick Language Toggle Pill */}
          <div className="inline-flex p-0.5 rounded-xl bg-emerald-900/5 dark:bg-emerald-900/30 border border-emerald-900/10 dark:border-emerald-800/20 text-[11px] font-medium">
            <button
              type="button"
              onClick={() => setActiveTranslationEdition('ur.jalandhry')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                isUrdu
                  ? 'bg-emerald-800 text-amber-200 shadow-xs font-bold'
                  : 'text-stone-600 dark:text-stone-300 hover:text-emerald-900 dark:hover:text-amber-300'
              }`}
              title="Urdu Translation (مولانا فتح محمد جالندھری)"
            >
              اردو
            </button>
            <button
              type="button"
              onClick={() => setActiveTranslationEdition('en.sahih')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                !isUrdu
                  ? 'bg-emerald-800 text-amber-200 shadow-xs font-bold'
                  : 'text-stone-600 dark:text-stone-300 hover:text-emerald-900 dark:hover:text-amber-300'
              }`}
              title="English Translation (Sahih International)"
            >
              English
            </button>
          </div>

          {/* Randomizer Button */}
          <button
            type="button"
            onClick={() => fetchDailyAyah('random')}
            title="Fetch another random verse"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/20 transition-all cursor-pointer"
            id="daily-ayah-randomize-btn"
          >
            <Dices className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Random Verse</span>
          </button>

          {/* Return to Today's Ayah (if currently in random mode) */}
          {mode === 'random' && (
            <button
              type="button"
              onClick={() => fetchDailyAyah('daily')}
              title="Return to Today's Ayah"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-800 hover:bg-emerald-700 text-amber-200 shadow-xs transition-all cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Today's Ayah</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Body */}
      <div className="p-6 sm:p-9 space-y-6">
        {/* Surah Reference Banner & Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500 dark:text-stone-400">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-emerald-900 dark:text-emerald-300 text-sm">
              Surah {surahName}
            </span>
            <span
              dir="rtl"
              className="font-quran-amiri text-base font-bold text-emerald-900 dark:text-amber-300"
            >
              {surahArabicName}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-mono font-bold text-[11px]">
              {surahNumber}:{ayahInSurah}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span className="px-2 py-0.5 rounded-lg bg-emerald-900/5 dark:bg-emerald-900/30 text-stone-600 dark:text-stone-300 border border-emerald-900/10 dark:border-emerald-800/20">
              {revelationType === 'Meccan' ? 'Meccan • مكّية' : 'Medinan • مدنيّة'}
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-emerald-900/5 dark:bg-emerald-900/30 text-stone-600 dark:text-stone-300 border border-emerald-900/10 dark:border-emerald-800/20">
              Juz {juzNumber} • جزء {juzNumber}
            </span>
          </div>
        </div>

        {/* Sacred Arabic Text (RTL) */}
        <div className="py-4 text-right" dir="rtl">
          <p
            className={`text-2xl sm:text-3xl md:text-4xl text-emerald-950 dark:text-emerald-50 leading-[2.3] sm:leading-[2.5] font-bold ${
              settings.arabicFont === 'scheherazade'
                ? 'font-quran-scheherazade'
                : 'font-quran-amiri'
            }`}
          >
            {cleanedArabic}
            {isMushafTheme ? (
              <MushafVerseRosette number={ayahInSurah} />
            ) : (
              <span className="inline-block mx-2 font-['Amiri'] text-amber-600 dark:text-amber-400 select-none text-[0.8em]">
                ۝
                <span className="text-[0.65em] -mr-3 font-sans font-medium text-stone-600 dark:text-stone-300">
                  {ayahInSurah}
                </span>
              </span>
            )}
          </p>
        </div>

        {/* Translation Text */}
        {translationAyah && (
          <div
            className="pt-4 pb-2 border-t border-emerald-900/10 dark:border-emerald-800/20"
            dir={typography.dir}
          >
            <div className="flex items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400 mb-2">
              <Quote className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                Translation ({isUrdu ? 'مولانا فتح محمد جالندھری' : 'Sahih International'}):
              </span>
            </div>
            <p
              className={`${typography.className} ${
                isUrdu
                  ? 'text-lg sm:text-xl text-stone-800 dark:text-stone-100 font-urdu leading-[2.3]'
                  : 'text-base sm:text-lg text-stone-700 dark:text-stone-200 leading-relaxed font-serif italic'
              }`}
            >
              {isUrdu ? translationAyah.text : `"${translationAyah.text}"`}
            </p>
          </div>
        )}

        {/* Tadabbur / Spiritual Reflection Guide */}
        {reflectionText && (
          <div
            className={`p-4 sm:p-5 rounded-2xl border transition-all ${
              isMushafTheme
                ? 'bg-[#f4ebd0]/70 border-[#caa352]/40 text-stone-800'
                : 'bg-emerald-950/5 dark:bg-emerald-950/30 border-emerald-900/10 dark:border-emerald-800/20 text-stone-700 dark:text-stone-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-100">
                    Tadabbur & Contemplation (تدبّر)
                  </h4>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
                    Reflection
                  </span>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-stone-600 dark:text-stone-300">
                  {reflectionText}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Personal Attached Note Box if user has written one for this verse */}
        {hasDailyNote && (
          <div
            className={`p-4 rounded-2xl border transition-all ${
              isMushafTheme
                ? 'bg-[#f4ebd0]/90 border-[#caa352]/70 text-stone-800'
                : 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/25 text-stone-800 dark:text-stone-200'
            }`}
            id="daily-ayah-user-note"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                <PenLine className="w-3.5 h-3.5" />
                <span>My Attached Reflection (یادداشت)</span>
              </div>
              <button
                type="button"
                onClick={() => setIsNoteModalOpen(true)}
                className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
              >
                Edit
              </button>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
              {dailyNote}
            </p>
          </div>
        )}

        {/* Action Controls & Navigation Strip */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-5 border-t border-emerald-900/10 dark:border-emerald-800/20">
          {/* Direct Navigation Links */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Read in Surah button */}
            <button
              type="button"
              onClick={() => onNavigateToAyah(surahNumber, ayahInSurah)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-800 hover:bg-emerald-700 text-amber-200 shadow-xs transition-all cursor-pointer group"
              id="daily-ayah-read-surah-cta"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Read in Surah</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>

            {/* Read Tafsir button */}
            {onOpenTafsir && (
              <button
                type="button"
                onClick={() => onOpenTafsir(surahNumber, ayahInSurah)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                  isMushafTheme
                    ? 'bg-[#15366c] text-[#fbf8ed] border-[#caa352]/50'
                    : 'bg-emerald-950/5 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-emerald-900/15 dark:border-emerald-800/30 hover:bg-emerald-900/10'
                }`}
                title="Read Tafsir exegesis for this verse"
                id="daily-ayah-tafsir-cta"
              >
                <ScrollText className="w-3.5 h-3.5" />
                <span>Read Tafsir (تفسیر)</span>
              </button>
            )}
          </div>

          {/* Audio, Bookmark, Copy, Share */}
          <div className="flex items-center justify-end gap-1.5 flex-wrap">
            {/* Audio Recitation */}
            <button
              type="button"
              onClick={handlePlay}
              title={
                isCurrentPlaying && isPlaying
                  ? 'Pause recitation'
                  : 'Listen to recitation (Mishary Alafasy)'
              }
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isCurrentPlaying && isPlaying
                  ? 'bg-amber-500 text-emerald-950 shadow-xs'
                  : 'bg-emerald-900/10 dark:bg-emerald-800/20 text-emerald-900 dark:text-emerald-100 hover:bg-emerald-900/20'
              }`}
              id="daily-ayah-audio-btn"
            >
              {isCurrentPlaying && isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Recite</span>
                </>
              )}
            </button>

            {/* Bookmark button */}
            <button
              type="button"
              onClick={handleBookmarkToggle}
              title={bookmarked ? 'Remove Bookmark' : 'Bookmark Ayah'}
              className={`p-2 rounded-xl transition-all cursor-pointer border ${
                bookmarked
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400'
                  : 'bg-emerald-900/5 dark:bg-emerald-800/10 border-emerald-900/10 dark:border-emerald-800/20 text-stone-500 hover:text-amber-600'
              }`}
              id="daily-ayah-bookmark-btn"
            >
              <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
            </button>

            {/* Reflection Note button */}
            <button
              type="button"
              onClick={() => setIsNoteModalOpen(true)}
              title={hasDailyNote ? 'Edit personal reflection' : 'Attach personal reflection note'}
              className={`relative p-2 rounded-xl transition-all cursor-pointer border ${
                hasDailyNote
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400'
                  : 'bg-emerald-900/5 dark:bg-emerald-800/10 border-emerald-900/10 dark:border-emerald-800/20 text-stone-500 hover:text-amber-600'
              }`}
              id="daily-ayah-note-btn"
            >
              <PenLine className="w-4 h-4" />
              {hasDailyNote && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-[#0c1412]" />
              )}
            </button>

            {/* Copy button */}
            <button
              type="button"
              onClick={handleCopy}
              title="Copy verse and translation"
              className="p-2 rounded-xl bg-emerald-900/5 dark:bg-emerald-800/10 border border-emerald-900/10 dark:border-emerald-800/20 text-stone-500 hover:text-emerald-900 dark:hover:text-emerald-200 transition-colors cursor-pointer"
              id="daily-ayah-copy-btn"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>

            {/* Share button */}
            <button
              type="button"
              onClick={handleShare}
              title="Share verse"
              className="p-2 rounded-xl bg-emerald-900/5 dark:bg-emerald-800/10 border border-emerald-900/10 dark:border-emerald-800/20 text-stone-500 hover:text-emerald-900 dark:hover:text-emerald-200 transition-colors cursor-pointer"
              id="daily-ayah-share-btn"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Personal Reflection Note Modal */}
      <VerseNoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        surahNumber={surahNumber}
        ayahNumber={ayahInSurah}
        surahName={surahArabicName}
        surahEnglishName={surahName}
        arabicText={cleanedArabic}
        translationText={translationAyah?.text}
        globalAyahNumber={arabicAyah.number}
      />
    </div>
  );
};
