import React from 'react';
import { BookOpen, Sparkles, Compass, Layers, ArrowRight, Bookmark } from 'lucide-react';
import { PrayerTimes } from '../components/PrayerTimes';
import { HijriDashboardWidget } from '../components/HijriDashboardWidget';
import { ReadingGoalWidget } from '../components/ReadingGoalWidget';
import { DhikrTracker } from '../components/DhikrTracker';
import { DailyHadith } from '../components/DailyHadith';
import { DailyDua } from '../components/DailyDua';
import { ContinueReading } from '../components/ContinueReading';
import { DailyAyah } from '../components/DailyAyah';
import { BISMILLAH_TEXT, BISMILLAH_TRANSLATION } from '../utils/quranUtils';

interface HomePageProps {
  onNavigate: (page: string, params?: any) => void;
  onOpenSurah: (
    surahNumber: number,
    ayahNumber?: number,
    viewMode?: 'standard' | 'tafsir'
  ) => void;
}

const QUICK_SURAHS = [
  { number: 1, name: 'سورة الفاتحة', englishName: 'Al-Faatiha', desc: 'The Opening', ayahs: 7 },
  { number: 2, name: 'سورة البقرة', englishName: 'Al-Baqara', desc: 'The Cow', ayahs: 286 },
  { number: 18, name: 'سورة الكهف', englishName: 'Al-Kahf', desc: 'The Cave', ayahs: 110 },
  { number: 36, name: 'سورة يس', englishName: 'Yaseen', desc: 'Ya-Sin', ayahs: 83 },
  { number: 55, name: 'سورة الرحمن', englishName: 'Ar-Rahmaan', desc: 'The Beneficent', ayahs: 78 },
  { number: 67, name: 'سورة الملك', englishName: 'Al-Mulk', desc: 'The Sovereignty', ayahs: 30 },
];

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenSurah }) => {
  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-14 sm:pb-16 text-center space-y-6">
        {/* Subtle Background glow & geometric hint */}
        <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-30 dark:opacity-20 pointer-events-none">
          <div className="w-96 h-96 rounded-full bg-emerald-700/10 blur-3xl" />
        </div>

        {/* Sacred Bismillah Calligraphy */}
        <div className="space-y-2 select-none">
          <p
            dir="rtl"
            className="font-quran-amiri text-2xl sm:text-3xl md:text-4xl text-emerald-900 dark:text-amber-200 tracking-wide"
          >
            {BISMILLAH_TEXT}
          </p>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 font-sans tracking-wide">
            "{BISMILLAH_TRANSLATION}"
          </p>
        </div>

        {/* Main Heading & Tagline */}
        <div className="max-w-2xl mx-auto space-y-3 px-4">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-emerald-950 dark:text-emerald-50 font-['Cinzel',serif] leading-tight">
            Read the Quran.
            <br />
            <span className="text-amber-600 dark:text-amber-400">Find your peace.</span>
          </h1>
          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed font-sans max-w-xl mx-auto">
            Explore the words of Allah with a beautiful, distraction-free reading experience.
            Equipped with authentic translations, audio recitations, and sacred contemplation.
          </p>
        </div>

        {/* Primary & Secondary CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onOpenSurah(1, 1)}
            className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-emerald-800 hover:bg-emerald-700 text-amber-200 font-semibold text-sm shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            id="hero-continue-reading-cta"
          >
            <BookOpen className="w-4 h-4" />
            <span>Continue Reading</span>
          </button>

          <button
            onClick={() => onNavigate('quran')}
            className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-emerald-950/5 dark:bg-emerald-950/40 hover:bg-emerald-950/10 dark:hover:bg-emerald-900/30 text-emerald-950 dark:text-emerald-100 border border-emerald-900/15 dark:border-emerald-800/30 font-semibold text-sm transition-all cursor-pointer"
            id="hero-explore-quran-cta"
          >
            <span>Explore Quran</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Prayer Times & Islamic Daily Companion */}
      <section className="max-w-4xl mx-auto px-4">
        <PrayerTimes />
      </section>

      {/* Daily Quran Reading Goal & Streak Widget */}
      <section className="max-w-4xl mx-auto px-4">
        <ReadingGoalWidget onOpenSurah={onOpenSurah} />
      </section>

      {/* Daily Dhikr & Remembrance Widget */}
      <section className="max-w-4xl mx-auto px-4">
        <DhikrTracker />
      </section>

      {/* Daily Hadith Widget */}
      <section className="max-w-4xl mx-auto px-4">
        <DailyHadith />
      </section>

      {/* Daily Dua Widget */}
      <section className="max-w-4xl mx-auto px-4">
        <DailyDua />
      </section>

      {/* Continue Reading Card */}
      <section className="max-w-4xl mx-auto px-4">
        <ContinueReading
          onContinue={(surah, ayah) => onOpenSurah(surah, ayah)}
          onExplore={() => onNavigate('quran')}
        />
      </section>

      {/* Daily Ayah Section */}
      <section className="max-w-4xl mx-auto px-4">
        <DailyAyah
          onNavigateToAyah={(surah, ayah) => onOpenSurah(surah, ayah, 'standard')}
          onOpenTafsir={(surah, ayah) => onOpenSurah(surah, ayah, 'tafsir')}
        />
      </section>

      {/* Quick Surah Exploration Shortcuts */}
      <section className="max-w-4xl mx-auto px-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-lg font-bold text-emerald-950 dark:text-emerald-50">
              Frequently Read Surahs
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Quick access to beloved chapters of the Holy Quran
            </p>
          </div>
          <button
            onClick={() => onNavigate('quran')}
            className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
          >
            <span>View all 114</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {QUICK_SURAHS.map((s) => (
            <button
              key={s.number}
              onClick={() => onOpenSurah(s.number)}
              className="group p-4 rounded-2xl bg-[#fcfaf6] dark:bg-[#0c1412] hover:bg-emerald-950/5 dark:hover:bg-emerald-950/30 border border-emerald-900/10 dark:border-emerald-800/20 hover:border-amber-400/30 transition-all text-left flex items-center justify-between cursor-pointer"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                    {s.number}.
                  </span>
                  <span className="font-semibold text-sm text-emerald-950 dark:text-emerald-50 group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
                    {s.englishName}
                  </span>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  {s.desc} • {s.ayahs} ayahs
                </p>
              </div>
              <span
                dir="rtl"
                className="font-quran-amiri text-base font-bold text-emerald-900 dark:text-emerald-300 group-hover:scale-105 transition-transform"
              >
                {s.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Quran Structural Divisions Grid (Powered by AlQuran Cloud API /meta) */}
      <section className="max-w-4xl mx-auto px-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-950 dark:text-emerald-50 font-['Cinzel',serif]">
            Quranic Divisions
          </h2>
          <span className="text-xs text-stone-500 dark:text-stone-400">
            AlQuran Cloud Structure
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Surahs', count: '114', sub: 'Chapters', page: 'quran' },
            { label: 'Juzs', count: '30', sub: 'Para Parts', page: 'juz' },
            { label: 'Manzils', count: '7', sub: 'Weekly Stages', page: 'divisions' },
            { label: 'Pages', count: '604', sub: 'Mushaf Pages', page: 'pages' },
            { label: 'Rukus', count: '556', sub: 'Thematic Sections', page: 'divisions' },
            { label: 'Sajdas', count: '15', sub: 'Prostrations', page: 'sajda' },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => onNavigate(item.page)}
              className="p-4 rounded-2xl bg-emerald-950/5 dark:bg-emerald-950/20 border border-emerald-900/10 dark:border-emerald-800/20 hover:border-amber-500/40 hover:bg-emerald-950/10 dark:hover:bg-emerald-900/30 transition-all text-center cursor-pointer group"
            >
              <p className="text-xl sm:text-2xl font-bold font-mono text-emerald-950 dark:text-emerald-50 group-hover:text-amber-600 dark:group-hover:text-amber-300">
                {item.count}
              </p>
              <p className="text-xs font-semibold text-stone-700 dark:text-stone-200 mt-1">
                {item.label}
              </p>
              <p className="text-[10px] text-stone-400 dark:text-stone-500">
                {item.sub}
              </p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
