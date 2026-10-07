import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Bookmark,
  Copy,
  Share2,
  Image as ImageIcon,
  Play,
  Pause,
  Check,
  CheckCheck,
  MoreVertical,
  Compass,
  ScrollText,
  PenLine,
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { Ayah, Surah } from '../types';
import { AyahImageCard } from './AyahImageCard';
import { useBookmarks } from '../context/BookmarksContext';
import { useQuranSettings } from '../context/QuranSettingsContext';
import { useAudio } from '../context/AudioContext';
import { useReadingGoal } from '../context/ReadingGoalContext';
import {
  cleanAyahText,
  copyToClipboard,
  shareAyah,
  getTranslationTypographyClass,
} from '../utils/quranUtils';
import { MushafVerseRosette, GoldenAyahEndMarker } from './ui/MushafOrnaments';
import { TajweedText } from './ui/TajweedText';
import { VerseNoteModal } from './VerseNoteModal';

interface AyahCardProps {
  ayah: Ayah;
  surah: Surah;
  translationText?: string;
  audioUrl?: string;
  onPlayNext?: () => void;
  onPlayPrev?: () => void;
  isCurrentPlaying?: boolean;
  onOpenTafsir?: (ayahNumberInSurah: number) => void;
  tajweedEnabled?: boolean;
}

export const AyahCard: React.FC<AyahCardProps> = ({
  ayah,
  surah,
  translationText,
  audioUrl,
  onPlayNext,
  onPlayPrev,
  isCurrentPlaying = false,
  onOpenTafsir,
  tajweedEnabled = true,
}) => {
  const { isBookmarked, toggleBookmark, getBookmark } = useBookmarks();
  const { settings } = useQuranSettings();
  const { playTrack, togglePlayPause, isPlaying } = useAudio();
  const { recordAyahRead, unrecordAyahRead, isAyahReadToday } = useReadingGoal();

  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  const bookmarked = isBookmarked(surah.number, ayah.numberInSurah);
  const currentBookmark = getBookmark(surah.number, ayah.numberInSurah);
  const note = currentBookmark?.note;
  const hasNote = Boolean(note && note.trim().length > 0);
  const cleanedArabic = cleanAyahText(ayah.text, surah.number, ayah.numberInSurah);
  const isReadToday = isAyahReadToday(surah.number, ayah.numberInSurah);

  // Auto-record if audio is actively reciting this verse
  useEffect(() => {
    if (isCurrentPlaying) {
      recordAyahRead(surah.number, ayah.numberInSurah, true);
    }
  }, [isCurrentPlaying, surah.number, ayah.numberInSurah, recordAyahRead]);

  const handleCopy = async () => {
    const textToCopy = `${cleanedArabic}\n\n${translationText ? `"${translationText}"\n\n` : ''}— Surah ${surah.englishName} (${surah.number}:${ayah.numberInSurah})`;
    const success = await copyToClipboard(textToCopy);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const imageRef = useRef<HTMLDivElement>(null);

  const handleShareImage = useCallback(async () => {
    if (imageRef.current === null) return;
    try {
      const dataUrl = await toPng(imageRef.current, { cacheBust: true });
      const link = document.createElement('a');
      link.download = `ayah-${surah.number}-${ayah.numberInSurah}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate image', err);
    }
  }, [surah, ayah]);

  const handleShare = async () => {
    await shareAyah({
      surahName: surah.englishName,
      surahNumber: surah.number,
      ayahNumber: ayah.numberInSurah,
      arabicText: cleanedArabic,
      translationText,
    });
  };

  const handleBookmarkToggle = () => {
    toggleBookmark({
      surahNumber: surah.number,
      surahName: surah.name,
      surahEnglishName: surah.englishName,
      ayahNumber: ayah.numberInSurah,
      globalAyahNumber: ayah.number,
      text: cleanedArabic,
      translationText,
    });
  };

  const handlePlayAudio = () => {
    if (isCurrentPlaying) {
      togglePlayPause();
    } else {
      playTrack(
        {
          audioUrl: audioUrl || ayah.audio,
          surahNumber: surah.number,
          ayahNumberInSurah: ayah.numberInSurah,
          globalAyahNumber: ayah.number,
          surahName: surah.englishName,
          reciterEdition: settings.reciterEdition || 'ar.alafasy',
        },
        onPlayNext,
        onPlayPrev
      );
    }
  };

  const isSajda = Boolean(ayah.sajda);
  const isMushafTheme = settings.theme === 'mushaf';

  return (
    <div
      id={`ayah-${ayah.numberInSurah}`}
      className={`group relative transition-all duration-300 ${
        isMushafTheme
          ? `p-5 sm:p-7 rounded-3xl border-2 border-[#caa352]/70 shadow-sm bg-[#faf5e8]/95 ${
              isCurrentPlaying
                ? 'ring-2 ring-[#c59e45] bg-[#fdfaf1] shadow-md'
                : 'hover:border-[#caa352]'
            }`
          : `p-5 sm:p-7 rounded-3xl border border-amber-500/25 dark:border-amber-400/25 ring-1 ring-amber-500/10 shadow-md ${
              isCurrentPlaying
                ? 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-400/70 ring-2 ring-amber-400/40 shadow-xl'
                : 'bg-white dark:bg-gradient-to-b dark:from-[#0d1d17] dark:via-[#0a1612] dark:to-[#07110e] hover:border-amber-500/40 dark:hover:border-amber-400/40'
            }`
      }`}
    >
      {/* 4 Delicate Golden Arabesque Corner Ornaments (♦) */}
      <span className="absolute top-2 left-2.5 text-amber-600/40 dark:text-amber-400/35 text-xs select-none pointer-events-none">
        ♦
      </span>
      <span className="absolute top-2 right-2.5 text-amber-600/40 dark:text-amber-400/35 text-xs select-none pointer-events-none">
        ♦
      </span>
      <span className="absolute bottom-2 left-2.5 text-amber-600/40 dark:text-amber-400/35 text-xs select-none pointer-events-none">
        ♦
      </span>
      <span className="absolute bottom-2 right-2.5 text-amber-600/40 dark:text-amber-400/35 text-xs select-none pointer-events-none">
        ♦
      </span>

      {/* Top Ayah Meta Header & Actions Bar */}
      <div
        className={`flex items-center justify-between gap-2 pb-3 mb-3 ${
          isMushafTheme
            ? 'border-b border-[#caa352]/30'
            : 'border-b border-amber-500/15 dark:border-amber-400/15'
        }`}
      >
        {/* Left: Ayah Number Ornament Badge */}
        <div className="flex items-center gap-2.5">
          {isMushafTheme ? (
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-[#15366c] text-[#fbf8ed] font-bold text-xs border border-[#caa352] shadow-xs">
              <span>{ayah.numberInSurah}</span>
            </div>
          ) : (
            <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/20 via-emerald-950/40 to-emerald-900/30 text-amber-800 dark:text-amber-300 font-bold text-xs border border-amber-500/40 shadow-xs">
              <span>{ayah.numberInSurah}</span>
            </div>
          )}

          <span
            className={`text-[11px] font-semibold hidden sm:inline ${
              isMushafTheme
                ? 'text-[#8e6b23] font-["Cinzel",serif]'
                : 'text-amber-700/80 dark:text-amber-300/70'
            }`}
          >
            Juz {ayah.juz} • Page {ayah.page}
          </span>

          {isSajda && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                isMushafTheme
                  ? 'bg-[#9e2c2c]/10 text-[#9e2c2c] border-[#9e2c2c]/30'
                  : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
              }`}
            >
              <Compass className="w-3 h-3" />
              Sajda
            </span>
          )}
        </div>

        {/* Right: Quick Action buttons */}
        <div className="flex items-center gap-1">
          {/* Audio Play button */}
          <button
            onClick={handlePlayAudio}
            title={isCurrentPlaying && isPlaying ? 'Pause recitation' : 'Play Ayah recitation'}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              isCurrentPlaying
                ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                : isMushafTheme
                ? 'text-[#8e6b23] hover:text-[#15366c] hover:bg-[#caa352]/15'
                : 'text-stone-400 hover:text-emerald-800 dark:hover:text-emerald-200 hover:bg-emerald-950/5 dark:hover:bg-emerald-950/30'
            }`}
            aria-label="Play recitation"
          >
            {isCurrentPlaying && isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
          </button>

          {/* Bookmark button */}
          <button
            onClick={handleBookmarkToggle}
            title={bookmarked ? 'Remove Bookmark' : 'Bookmark Ayah'}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              bookmarked
                ? 'text-amber-600 bg-amber-500/10 dark:text-amber-400'
                : isMushafTheme
                ? 'text-[#8e6b23] hover:text-amber-600 hover:bg-[#caa352]/15'
                : 'text-stone-400 hover:text-amber-500 hover:bg-emerald-950/5 dark:hover:bg-emerald-950/30'
            }`}
            aria-label="Bookmark verse"
          >
            <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-amber-500' : ''}`} />
          </button>

          {/* Copy button */}
          <button
            onClick={handleCopy}
            title="Copy Ayah text"
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              isMushafTheme
                ? 'text-[#8e6b23] hover:text-[#15366c] hover:bg-[#caa352]/15'
                : 'text-stone-400 hover:text-emerald-800 dark:hover:text-emerald-200 hover:bg-emerald-950/5 dark:hover:bg-emerald-950/30'
            }`}
            aria-label="Copy verse text"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>

          {/* Share button */}
          <button
            onClick={handleShare}
            title="Share Ayah Text"
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              isMushafTheme
                ? 'text-[#8e6b23] hover:text-[#15366c] hover:bg-[#caa352]/15'
                : 'text-stone-400 hover:text-emerald-800 dark:hover:text-emerald-200 hover:bg-emerald-950/5 dark:hover:bg-emerald-950/30'
            }`}
            aria-label="Share verse text"
          >
            <Share2 className="w-4 h-4" />
          </button>
          
          {/* Share Image button */}
          <button
            onClick={handleShareImage}
            title="Share as Image"
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              isMushafTheme
                ? 'text-[#8e6b23] hover:text-[#15366c] hover:bg-[#caa352]/15'
                : 'text-stone-400 hover:text-emerald-800 dark:hover:text-emerald-200 hover:bg-emerald-950/5 dark:hover:bg-emerald-950/30'
            }`}
            aria-label="Share as Image"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          {/* Reflection / Note Button */}
          <button
            onClick={() => setIsNoteModalOpen(true)}
            title={hasNote ? 'Edit personal reflection / نوٹ دیکھیں' : 'Add personal reflection note / تدبر نوٹ لکھیں'}
            className={`relative p-2 rounded-xl transition-all cursor-pointer ${
              hasNote
                ? 'text-amber-600 bg-amber-500/15 dark:text-amber-300 dark:bg-amber-500/20'
                : isMushafTheme
                ? 'text-[#8e6b23] hover:text-[#15366c] hover:bg-[#caa352]/15'
                : 'text-stone-400 hover:text-amber-600 hover:bg-emerald-950/5 dark:hover:bg-emerald-950/30'
            }`}
            aria-label="Reflection note"
            id={`ayah-${ayah.numberInSurah}-note-btn`}
          >
            <PenLine className="w-4 h-4" />
            {hasNote && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-[#0c1412]" />
            )}
          </button>

          {/* Mark as read towards daily reading goal */}
          <button
            onClick={() => {
              if (isReadToday) {
                unrecordAyahRead(surah.number, ayah.numberInSurah);
              } else {
                recordAyahRead(surah.number, ayah.numberInSurah);
              }
            }}
            title={
              isReadToday
                ? "Counted towards today's reading goal (click to remove)"
                : "Mark as read for today's goal / روزانہ ہدف میں شمار کریں"
            }
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              isReadToday
                ? 'text-emerald-700 bg-emerald-500/20 dark:text-emerald-300 dark:bg-emerald-500/25 border border-emerald-500/30'
                : isMushafTheme
                ? 'text-[#8e6b23] hover:text-[#15366c] hover:bg-[#caa352]/15'
                : 'text-stone-400 hover:text-emerald-700 hover:bg-emerald-950/5 dark:hover:bg-emerald-950/30'
            }`}
            aria-label="Mark verse read towards daily goal"
            id={`ayah-${ayah.numberInSurah}-goal-read-btn`}
          >
            <CheckCheck className={`w-4 h-4 ${isReadToday ? 'stroke-[2.5]' : ''}`} />
          </button>

          {/* Tafsir button */}
          {onOpenTafsir && (
            <button
              onClick={() => onOpenTafsir(ayah.numberInSurah)}
              title="Read Tafsir Exegesis / مطالعہ تفسیر"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isMushafTheme
                  ? 'bg-[#15366c]/10 text-[#15366c] hover:bg-[#15366c] hover:text-amber-100 border border-[#caa352]/40'
                  : 'bg-emerald-950/5 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-800 hover:text-amber-200 border border-emerald-900/10 dark:border-emerald-800/30'
              }`}
              aria-label="Read Tafsir"
            >
              <ScrollText className="w-3.5 h-3.5" />
              <span className="text-[11px]">Tafsir</span>
            </button>
          )}
        </div>
      </div>

      {/* Arabic Quranic Text (RTL) */}
      {(settings.displayMode === 'both' || settings.displayMode === 'arabic') && (
        <div className="py-3 sm:py-4" dir="rtl">
          <p
            className={`tracking-normal leading-loose ${
              isMushafTheme
                ? 'text-center text-[#1c1b18] font-quran-amiri font-normal'
                : `text-right text-emerald-950 dark:text-emerald-50 ${
                    settings.arabicFont === 'amiri'
                      ? 'font-quran-amiri'
                      : 'font-quran-scheherazade'
                  }`
            }`}
            style={{
              fontSize: `${isMushafTheme ? Math.max(30, settings.arabicFontSize) : settings.arabicFontSize}px`,
              lineHeight: isMushafTheme ? 2.6 : Math.max(2.4, settings.lineHeight),
            }}
          >
            <TajweedText text={cleanedArabic} enabled={tajweedEnabled} />
            <GoldenAyahEndMarker number={ayah.numberInSurah} size={34} />
          </p>
        </div>
      )}

      {/* Translation Text (Urdu Nastaliq RTL or English LTR Garamond Italic) */}
      {(settings.displayMode === 'both' || settings.displayMode === 'translation') &&
        translationText && (() => {
          const { dir, className: fontClass, isUrdu } = getTranslationTypographyClass(
            settings.translationEdition
          );
          return (
            <div
              className={`pt-3.5 ${
                settings.displayMode === 'both'
                  ? 'mt-3 border-t border-amber-500/15 dark:border-amber-400/15'
                  : ''
              }`}
              dir={dir}
            >
              <p
                className={`${
                  isMushafTheme && !isUrdu
                    ? 'font-mushaf-translation text-center text-[#2b2824]'
                    : isUrdu
                    ? `${fontClass} text-stone-800 dark:text-stone-200 leading-relaxed font-normal`
                    : `${fontClass} text-stone-700 dark:text-stone-300 leading-relaxed font-normal`
                }`}
                style={{
                  fontSize: isUrdu
                    ? `${Math.max(17, settings.translationFontSize + 2)}px`
                    : isMushafTheme
                    ? `${Math.max(17, settings.translationFontSize + 1)}px`
                    : `${settings.translationFontSize}px`,
                }}
              >
                {isMushafTheme && !isUrdu ? `“${translationText}”` : translationText}
              </p>
            </div>
          );
        })()}

      {/* Personal Reflection Box if note exists */}
      {hasNote && (
        <div
          className={`mt-4 p-4 rounded-2xl border transition-all ${
            isMushafTheme
              ? 'bg-[#f4ebd0]/90 border-[#caa352]/60 text-stone-800'
              : 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/25 text-stone-800 dark:text-stone-200'
          }`}
          id={`ayah-${ayah.numberInSurah}-reflection-preview`}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <PenLine className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-emerald-950 dark:text-amber-200 font-['Cinzel',serif]">
                My Reflection
              </span>
              <span className="text-[11px] font-quran-amiri font-bold text-amber-600 dark:text-amber-400">
                تدبر
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsNoteModalOpen(true)}
              className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 hover:underline cursor-pointer"
            >
              Edit Reflection
            </button>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap text-stone-700 dark:text-stone-300">
            {note}
          </p>
        </div>
      )}

      {/* Personal Reflection Note Editor Modal */}
      <VerseNoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        surahNumber={surah.number}
        ayahNumber={ayah.numberInSurah}
        surahName={surah.name}
        surahEnglishName={surah.englishName}
        arabicText={cleanedArabic}
        translationText={translationText}
        globalAyahNumber={ayah.number}
      />
      
      {/* Hidden Ayah Image Card for Generation */}
      <div className="absolute -left-[9999px]">
        <AyahImageCard ref={imageRef} ayah={ayah} surah={surah} translationText={translationText} />
      </div>
    </div>
  );
};
