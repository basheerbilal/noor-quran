import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  BookOpen,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { SurahDetail, Ayah } from '../../types';
import { TajweedText, TajweedLegend } from '../ui/TajweedText';
import { GoldenAyahEndMarker, toArabicDigits } from '../ui/MushafOrnaments';
import { useAudio } from '../../context/AudioContext';
import { cleanAyahText, BISMILLAH_TEXT } from '../../utils/quranUtils';

interface IndoPak16LineMushafProps {
  surah: SurahDetail;
  audioAyahs?: { audio?: string }[] | Ayah[];
  translationSurah?: SurahDetail | null;
  onOpenTafsir?: (ayahNumberInSurah: number) => void;
  initialAyahNumber?: number;
}

// Arabic Para / Juz titles
const JUZ_NAMES_URDU: Record<number, string> = {
  1: 'الٓمّٓ (پارہ ۱)',
  2: 'سَيَقُولُ (پارہ ۲)',
  3: 'تِلْكَ الرُّسُلُ (پارہ ۳)',
  4: 'لَنْ تَنَالُوا (پارہ ۴)',
  5: 'وَالْمُحْصَنَاتُ (پارہ ۵)',
  6: 'لَا يُحِبُّ اللَّهُ (پارہ ۶)',
  7: 'وَإِذَا سَمِعُوا (پارہ ۷)',
  8: 'وَلَوْ أَنَّنَا (پارہ ۸)',
  9: 'قَالَ الْمَلَأُ (پارہ ۹)',
  10: 'وَاعْلَمُوا (پارہ ۱۰)',
  11: 'يَعْتَذِرُونَ (پارہ ۱۱)',
  12: 'وَمَا مِنْ دَابَّةٍ (پارہ ۱۲)',
  13: 'وَمَا أُبَرِّئُ (پارہ ۱۳)',
  14: 'رُبَمَا (پارہ ۱۴)',
  15: 'سُبْحَانَ الَّذِي (پارہ ۱۵)',
  16: 'قَالَ أَلَمْ (پارہ ۱۶)',
  17: 'اقْتَرَبَ (پارہ ۱۷)',
  18: 'قَدْ أَفْلَحَ (پارہ ۱۸)',
  19: 'وَقَالَ الَّذِينَ (پارہ ۱۹)',
  20: 'أَمَّنْ خَلَقَ (پارہ ۲۰)',
  21: 'اتْلُ مَا أُوحِيَ (پارہ ۲۱)',
  22: 'وَمَنْ يَقْنُتْ (پارہ ۲۲)',
  23: 'وَمَا لِيَ (پارہ ۲۳)',
  24: 'فَمَنْ أَظْلَمُ (پارہ ۲۴)',
  25: 'إِلَيْهِ يُرَدُّ (پارہ ۲۵)',
  26: 'حم (پارہ ۲۶)',
  27: 'قَالَ فَمَا خَطْبُكُمْ (پارہ ۲۷)',
  28: 'قَدْ سَمِعَ اللَّهُ (پارہ ۲۸)',
  29: 'تَبَارَكَ الَّذِي (پارہ ۲۹)',
  30: 'عَمَّ يَتَسَاءَلُونَ (پارہ ۳۰)',
};

export const IndoPak16LineMushaf: React.FC<IndoPak16LineMushafProps> = ({
  surah,
  audioAyahs = [],
  translationSurah,
  onOpenTafsir,
  initialAyahNumber,
}) => {
  const { currentTrack, playTrack, isPlaying, togglePlayPause } = useAudio();
  const [tajweedEnabled, setTajweedEnabled] = useState(true);
  const [fontSize, setFontSize] = useState(32);
  const [selectedAyahIndex, setSelectedAyahIndex] = useState<number | null>(
    initialAyahNumber ? initialAyahNumber - 1 : null
  );
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Group Ayahs by their page number
  const pages = useMemo(() => {
    const pageMap = new Map<number, Ayah[]>();
    surah.ayahs.forEach((ayah) => {
      const p = ayah.page || 1;
      if (!pageMap.has(p)) {
        pageMap.set(p, []);
      }
      pageMap.get(p)!.push(ayah);
    });

    const sortedPages = Array.from(pageMap.entries()).sort((a, b) => a[0] - b[0]);
    return sortedPages.map(([pageNumber, ayahs]) => ({
      pageNumber,
      ayahs,
      juz: ayahs[0]?.juz || 1,
      manzil: ayahs[0]?.manzil || 1,
      ruku: ayahs[0]?.ruku || 1,
      hasSurahStart: ayahs.some((a) => a.numberInSurah === 1),
    }));
  }, [surah]);

  // Current active page index
  const [currentPageIdx, setCurrentPageIdx] = useState(0);
  const activePage = pages[currentPageIdx] || pages[0];

  // Selected ayah data for bottom translation bar
  const selectedAyah =
    selectedAyahIndex !== null ? surah.ayahs[selectedAyahIndex] : null;
  const selectedTranslation =
    selectedAyahIndex !== null ? translationSurah?.ayahs[selectedAyahIndex] : null;

  const handleAyahClick = (globalIndex: number) => {
    setSelectedAyahIndex(globalIndex);
    const audioUrl = audioAyahs[globalIndex]?.audio;
    if (audioUrl) {
      playTrack({
        surahNumber: surah.number,
        surahName: surah.name,
        ayahNumberInSurah: surah.ayahs[globalIndex].numberInSurah,
        reciterName: 'Al-Afasy (Tajweed)',
        audioUrl,
      });
    }
  };

  const handleNextPage = () => {
    if (currentPageIdx < pages.length - 1) {
      setCurrentPageIdx(currentPageIdx + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPageIdx > 0) {
      setCurrentPageIdx(currentPageIdx - 1);
    }
  };

  return (
    <div className={`space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 overflow-y-auto bg-stone-900 p-2 sm:p-6' : ''}`}>
      {/* Top Toolbar: Tajweed toggle, Zoom, Fullscreen, and Page Navigator */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 backdrop-blur-md shadow-xs select-none">
        <div className="flex items-center gap-2">
          {/* Tajweed Toggle */}
          <button
            type="button"
            onClick={() => setTajweedEnabled(!tajweedEnabled)}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
              tajweedEnabled
                ? 'bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 text-white shadow-pink-500/20'
                : 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>🎨 رنگین تجوید: {tajweedEnabled ? 'آن (ON)' : 'آف (OFF)'}</span>
          </button>

          {/* Zoom In / Out */}
          <div className="hidden sm:flex items-center gap-1 bg-white/70 dark:bg-stone-800/70 rounded-xl p-1 border border-amber-500/20">
            <button
              type="button"
              onClick={() => setFontSize((s) => Math.max(22, s - 2))}
              className="p-1 rounded-lg hover:bg-amber-500/20 text-stone-700 dark:text-stone-300 cursor-pointer"
              title="چھوٹا کریں (Zoom Out)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-1 font-bold text-stone-700 dark:text-stone-300">
              {fontSize}px
            </span>
            <button
              type="button"
              onClick={() => setFontSize((s) => Math.min(48, s + 2))}
              className="p-1 rounded-lg hover:bg-amber-500/20 text-stone-700 dark:text-stone-300 cursor-pointer"
              title="بڑا کریں (Zoom In)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Page Switcher */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleNextPage}
            disabled={currentPageIdx >= pages.length - 1}
            className="p-1.5 rounded-xl bg-white dark:bg-stone-800 hover:bg-amber-500/20 text-stone-700 dark:text-stone-200 disabled:opacity-30 border border-amber-500/20 transition-all flex items-center gap-1 text-xs cursor-pointer"
            title="اگلا صفحہ (Next Page)"
          >
            <span>اگلا صفحہ</span>
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs sm:text-sm font-bold font-mono px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-900 dark:text-amber-200 border border-amber-500/30">
            صفحہ {toArabicDigits(activePage.pageNumber)} ({currentPageIdx + 1} / {pages.length})
          </span>

          <button
            type="button"
            onClick={handlePrevPage}
            disabled={currentPageIdx <= 0}
            className="p-1.5 rounded-xl bg-white dark:bg-stone-800 hover:bg-amber-500/20 text-stone-700 dark:text-stone-200 disabled:opacity-30 border border-amber-500/20 transition-all flex items-center gap-1 text-xs cursor-pointer"
            title="پچھلا صفحہ (Previous Page)"
          >
            <ChevronRight className="w-4 h-4" />
            <span>پچھلا صفحہ</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl bg-white dark:bg-stone-800 hover:bg-amber-500/20 text-stone-700 dark:text-stone-200 border border-amber-500/20 transition-all hidden md:flex cursor-pointer"
            title="فل اسکرین موڈ"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Tajweed Legend Bar */}
      {tajweedEnabled && <TajweedLegend />}

      {/* =========================================================================
          THE AUTHENTIC 16-LINE INDO-PAK TAJWEED QURAN PAGE (USER IMAGE REPLICA)
          ========================================================================= */}
      <div className="relative mx-auto max-w-4xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden transition-all duration-300">
        
        {/* Outer Ornate Floral Frame (Pink, Red, Emerald & Gold Borders) */}
        <div className="p-2 sm:p-3.5 bg-gradient-to-br from-pink-500 via-rose-500 to-amber-500 rounded-2xl sm:rounded-3xl shadow-inner">
          
          {/* Inner Decorative Pinstripe Rings */}
          <div className="p-1 sm:p-2 bg-gradient-to-r from-emerald-600 via-amber-400 to-rose-600 rounded-xl sm:rounded-2xl">
            
            {/* The Parchment Page Body (Always solid white/cream paper, jet black text) */}
            <div className="relative bg-[#fffdf9] text-[#111827] border-[3px] border-[#1c1917] rounded-lg sm:rounded-xl shadow-lg px-2 sm:px-6 py-4 sm:py-6 overflow-hidden">
              
              {/* Subtle traditional Islamic background geometric watermark */}
              <div
                className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                  backgroundImage:
                    'radial-gradient(#000 1.2px, transparent 1.2px), radial-gradient(#000 1.2px, #fffdf9 1.2px)',
                  backgroundSize: '24px 24px',
                  backgroundPosition: '0 0, 12px 12px',
                }}
              />

              {/* ------------------------------------------------------------------
                  1. TOP HEADER BAR: Three Distinctive Pink Cartouches
                     (Left: Surah Name | Center: Page Number | Right: Para Name)
                  ------------------------------------------------------------------ */}
              <div className="relative z-10 flex items-center justify-between border-b-[2.5px] border-[#1c1917] pb-3 mb-3 select-none">
                
                {/* Left Cartouche: Surah Name */}
                <div className="relative group">
                  <div className="px-3 sm:px-5 py-1 rounded-full border-2 border-pink-500 bg-gradient-to-r from-pink-100 via-pink-50 to-pink-100 text-pink-950 font-bold shadow-xs flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500 shrink-0" />
                    <span className="font-urdu text-sm sm:text-base tracking-wide font-bold">
                      {surah.name} ({toArabicDigits(surah.number)})
                    </span>
                  </div>
                  <div className="absolute -top-1 -right-1 text-pink-500 text-xs select-none">✿</div>
                  <div className="absolute -bottom-1 -left-1 text-pink-500 text-xs select-none">✿</div>
                </div>

                {/* Center Cartouche: Page Number (صفحہ نمبر) */}
                <div className="relative">
                  <div className="px-4 sm:px-6 py-1 rounded-full border-2 border-pink-500 bg-gradient-to-r from-pink-200 via-rose-100 to-pink-200 text-pink-950 font-extrabold shadow-sm flex items-center justify-center min-w-[70px]">
                    <span className="font-urdu text-lg sm:text-xl font-bold">
                      {toArabicDigits(activePage.pageNumber)}
                    </span>
                  </div>
                  <div className="absolute -top-1 -right-1 text-pink-600 text-xs select-none">✦</div>
                  <div className="absolute -bottom-1 -left-1 text-pink-600 text-xs select-none">✦</div>
                </div>

                {/* Right Cartouche: Para / Juz Name */}
                <div className="relative group">
                  <div className="px-3 sm:px-5 py-1 rounded-full border-2 border-pink-500 bg-gradient-to-r from-pink-100 via-pink-50 to-pink-100 text-pink-950 font-bold shadow-xs flex items-center gap-1.5">
                    <span className="font-urdu text-sm sm:text-base tracking-wide font-bold">
                      {JUZ_NAMES_URDU[activePage.juz] || `پارہ ${toArabicDigits(activePage.juz)}`}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500 shrink-0" />
                  </div>
                  <div className="absolute -top-1 -right-1 text-pink-500 text-xs select-none">✿</div>
                  <div className="absolute -bottom-1 -left-1 text-pink-500 text-xs select-none">✿</div>
                </div>

              </div>

              {/* Surah Title Plaque & Bismillah Banner (When Surah starts on this page) */}
              {activePage.hasSurahStart && (
                <div className="relative z-10 my-3 text-center space-y-2 select-none">
                  {/* Surah Plaque Banner */}
                  <div className="p-2 sm:p-2.5 rounded-xl border-2 border-pink-500 bg-gradient-to-r from-pink-100 via-amber-100 to-pink-100 text-pink-950 shadow-xs flex items-center justify-center gap-2">
                    <span className="font-urdu text-lg sm:text-2xl font-bold text-pink-950">
                      سُوْرَةُ {surah.name.replace(/^سُوْرَةُ\s+|^سورة\s+/, '')} ({surah.revelationType === 'Meccan' ? 'مَكِّيَّةٌ' : 'مَدَنِيَّةٌ'}) • آيَاتُهَا {toArabicDigits(surah.numberOfAyahs)}
                    </span>
                  </div>

                  {/* Bismillah Calligraphy Banner (Except Surah 9) */}
                  {surah.number !== 9 && (
                    <div className="py-1 border-b border-[#1c1917]/25 pb-2">
                      <p
                        dir="rtl"
                        className="font-quran-scheherazade text-2xl sm:text-3xl lg:text-4xl font-bold text-[#111827] tracking-wider"
                      >
                        {BISMILLAH_TEXT}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ------------------------------------------------------------------
                  2. MAIN TEXT CONTAINER WITH SIDE MARGINS & CRISP ARABIC CALLIGRAPHY
                  ------------------------------------------------------------------ */}
              <div className="relative z-10 flex items-stretch">
                
                {/* Right Side Margin: Traditional Side Badges (ع ركوع / وقف / سجدہ) */}
                <div className="hidden sm:flex flex-col items-center justify-around w-10 sm:w-12 border-l-2 border-[#1c1917]/80 pr-1 select-none">
                  {/* Ruku Indicator Badge */}
                  <div className="my-2 flex flex-col items-center justify-center p-1 rounded-lg border border-pink-400 bg-pink-50/80 text-pink-950 text-center shadow-xs">
                    <span className="font-urdu text-base font-bold text-pink-700 leading-none">ع</span>
                    <span className="font-mono text-xs font-bold text-pink-900 leading-none mt-0.5">
                      {toArabicDigits(activePage.ruku)}
                    </span>
                    <span className="text-[9px] font-urdu text-stone-500">رکوع</span>
                  </div>

                  {/* Waqf Lazim Badge */}
                  <div className="my-2 writing-vertical-rl py-2 px-1 rounded-md border border-amber-500 bg-amber-50/90 text-amber-900 text-[10px] font-urdu font-bold shadow-xs">
                    وقف لازم
                  </div>

                  {/* Juz Badge */}
                  <div className="my-2 writing-vertical-rl py-2 px-1 rounded-md border border-emerald-500 bg-emerald-50/90 text-emerald-900 text-[10px] font-urdu font-bold shadow-xs">
                    الجزء {toArabicDigits(activePage.juz)}
                  </div>
                </div>

                {/* ----------------------------------------------------------------
                    THE ARABIC TEXT AREA (HIGH CONTRAST JET BLACK INK)
                    ---------------------------------------------------------------- */}
                <div
                  dir="rtl"
                  className="flex-1 px-1 sm:px-4 text-justify select-text leading-[2.6] sm:leading-[2.8] font-quran-scheherazade font-bold text-[#111827]"
                  style={{
                    fontSize: `${fontSize}px`,
                  }}
                >
                  {activePage.ayahs.map((ayah) => {
                    const globalIdx = surah.ayahs.findIndex((a) => a.number === ayah.number);
                    const cleaned = cleanAyahText(ayah.text, surah.number, ayah.numberInSurah);
                    const isCurrentlyPlaying =
                      currentTrack?.surahNumber === surah.number &&
                      currentTrack?.ayahNumberInSurah === ayah.numberInSurah;
                    const isSelected = selectedAyahIndex === globalIdx;

                    return (
                      <span
                        key={ayah.number}
                        id={`mushaf-16-ayah-${ayah.numberInSurah}`}
                        onClick={() => handleAyahClick(globalIdx)}
                        className={`inline cursor-pointer transition-all rounded-md px-1 py-0.5 relative group ${
                          isCurrentlyPlaying
                            ? 'bg-amber-300/40 ring-2 ring-amber-500 shadow-xs'
                            : isSelected
                            ? 'bg-pink-300/25 ring-1 ring-pink-500/50'
                            : 'hover:bg-amber-400/15'
                        }`}
                        title={`Ayah ${ayah.numberInSurah} (Click to play audio & see translation)`}
                      >
                        {/* Rangeen Tajweed Arabic Text */}
                        <TajweedText text={cleaned} enabled={tajweedEnabled} forceDarkText={true} />

                        {/* Traditional Round Golden Ayah Stop Medallion ۝ */}
                        <GoldenAyahEndMarker number={ayah.numberInSurah} size={fontSize + 4} />
                      </span>
                    );
                  })}
                </div>

                {/* Left Side Margin: Reference indicator */}
                <div className="hidden sm:flex flex-col items-center justify-around w-10 sm:w-12 border-r-2 border-[#1c1917]/80 pl-1 select-none">
                  <div className="my-2 flex flex-col items-center justify-center p-1 rounded-lg border border-pink-400 bg-pink-50/80 text-pink-950 text-center shadow-xs">
                    <span className="font-urdu text-xs font-bold text-pink-800">
                      آیات {toArabicDigits(activePage.ayahs.length)}
                    </span>
                  </div>

                  <div className="my-2 writing-vertical-rl py-2 px-1 rounded-md border border-stone-400 bg-stone-100 text-stone-800 text-[10px] font-sans font-bold shadow-xs">
                    Page {activePage.pageNumber}
                  </div>
                </div>

              </div>

              {/* ------------------------------------------------------------------
                  3. BOTTOM FOOTER BAR: Center Manzil Pill & Bottom Border
                  ------------------------------------------------------------------ */}
              <div className="relative z-10 flex items-center justify-center border-t-[2.5px] border-[#1c1917] pt-2.5 mt-3 select-none">
                
                {/* Center Manzil Cartouche */}
                <div className="relative">
                  <div className="px-5 sm:px-8 py-1 rounded-full border-2 border-pink-500 bg-gradient-to-r from-pink-100 via-rose-50 to-pink-100 text-pink-950 font-bold shadow-xs flex items-center justify-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-600 shrink-0" />
                    <span className="font-urdu text-sm sm:text-base font-bold">
                      مَنْزِل {toArabicDigits(activePage.manzil)}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-600 shrink-0" />
                  </div>
                  <div className="absolute -top-1 -right-1 text-pink-500 text-xs select-none">✿</div>
                  <div className="absolute -bottom-1 -left-1 text-pink-500 text-xs select-none">✿</div>
                </div>

              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Selected Ayah Interactive Translation & Audio Player Drawer */}
      {selectedAyah && (
        <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-stone-800/90 border border-amber-500/30 backdrop-blur-md shadow-xl transition-all">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/20 pb-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-amber-500 text-stone-900 font-bold flex items-center justify-center text-xs">
                {selectedAyah.numberInSurah}
              </span>
              <span className="font-bold text-sm text-stone-900 dark:text-amber-100">
                {surah.englishName} — Ayah {selectedAyah.numberInSurah}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Play Audio Button */}
              {audioAyahs[selectedAyahIndex!]?.audio && (
                <button
                  type="button"
                  onClick={() => {
                    if (
                      currentTrack?.surahNumber === surah.number &&
                      currentTrack?.ayahNumberInSurah === selectedAyah.numberInSurah
                    ) {
                      togglePlayPause();
                    } else {
                      handleAyahClick(selectedAyahIndex!);
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  {isPlaying && currentTrack?.ayahNumberInSurah === selectedAyah.numberInSurah ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause Recitation</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Play Recitation</span>
                    </>
                  )}
                </button>
              )}

              {/* Tafsir Button */}
              {onOpenTafsir && (
                <button
                  type="button"
                  onClick={() => onOpenTafsir(selectedAyah.numberInSurah)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-200 font-bold text-xs flex items-center gap-1.5 border border-amber-500/30 transition-all cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>تفسیر (Tafsir)</span>
                </button>
              )}
            </div>
          </div>

          {/* Translation Text */}
          {selectedTranslation?.text && (
            <p
              dir="rtl"
              className="font-urdu text-base sm:text-lg text-stone-800 dark:text-stone-200 leading-relaxed"
            >
              {selectedTranslation.text}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
