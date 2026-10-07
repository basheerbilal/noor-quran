import React, { useState, useEffect } from 'react';
import {
  Compass,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Calendar,
  Layers,
  Sparkles,
  Search,
} from 'lucide-react';
import { ManzilData, RukuData, HizbQuarterData } from '../types';
import { getManzil, getRuku, getHizbQuarter } from '../api/quranApi';
import { AyahCard } from '../components/AyahCard';
import { AyahReaderSkeleton, ErrorState } from '../components/ui/LoadingSkeleton';
import { useQuranSettings } from '../context/QuranSettingsContext';
import { isUrduTranslation } from '../utils/quranUtils';

// 7 Manzil stages
export const MANZIL_DETAILS = [
  {
    number: 1,
    titleEnglish: 'Manzil 1 (Day 1)',
    titleUrdu: 'منزل اول — دن ۱',
    surahRange: "Surah 1 (Al-Fatihah) – Surah 4 (An-Nisa)",
    surahRangeUrdu: 'سورۃ الفاتحہ تا سورۃ النساء',
    description: 'Stages traditionally recited on Sunday for weekly completion of the Holy Quran.',
    recommendedDay: 'Day 1 (Sunday)',
  },
  {
    number: 2,
    titleEnglish: 'Manzil 2 (Day 2)',
    titleUrdu: 'منزل دوم — دن ۲',
    surahRange: "Surah 5 (Al-Ma'idah) – Surah 9 (At-Tawbah)",
    surahRangeUrdu: 'سورۃ المائدہ تا سورۃ التوبہ',
    description: 'Recited on Monday: Law, covenants, faith, repentance and spiritual readiness.',
    recommendedDay: 'Day 2 (Monday)',
  },
  {
    number: 3,
    titleEnglish: 'Manzil 3 (Day 3)',
    titleUrdu: 'منزل سوم — دن ۳',
    surahRange: 'Surah 10 (Yunus) – Surah 16 (An-Nahl)',
    surahRangeUrdu: 'سورۃ یونس تا سورۃ النحل',
    description: 'Recited on Tuesday: Stories of prophets, patience, and divine wisdom.',
    recommendedDay: 'Day 3 (Tuesday)',
  },
  {
    number: 4,
    titleEnglish: 'Manzil 4 (Day 4)',
    titleUrdu: 'منزل چہارم — دن ۴',
    surahRange: 'Surah 17 (Al-Isra) – Surah 25 (Al-Furqan)',
    surahRangeUrdu: 'سورۃ الاسراء تا سورۃ الفرقان',
    description: 'Recited on Wednesday: The middle of the Quran, spiritual ascent and light.',
    recommendedDay: 'Day 4 (Wednesday)',
  },
  {
    number: 5,
    titleEnglish: 'Manzil 5 (Day 5)',
    titleUrdu: 'منزل پنجم — دن ۵',
    surahRange: 'Surah 26 (Ash-Shu’ara) – Surah 36 (Ya-Sin)',
    surahRangeUrdu: 'سورۃ الشعراء تا سورۃ یٰسین',
    description: 'Recited on Thursday: The Heart of the Quran (Ya-Sin) and divine creation.',
    recommendedDay: 'Day 5 (Thursday)',
  },
  {
    number: 6,
    titleEnglish: 'Manzil 6 (Day 6)',
    titleUrdu: 'منزل ششم — دن ۶',
    surahRange: 'Surah 37 (As-Saffat) – Surah 49 (Al-Hujurat)',
    surahRangeUrdu: 'سورۃ الصافات تا سورۃ الحجرات',
    description: 'Recited on Friday: Praises of angels, divine signs, and community ethics.',
    recommendedDay: 'Day 6 (Friday)',
  },
  {
    number: 7,
    titleEnglish: 'Manzil 7 (Day 7)',
    titleUrdu: 'منزل ہفتم — دن ۷',
    surahRange: 'Surah 50 (Qaf) – Surah 114 (An-Nas)',
    surahRangeUrdu: 'سورۃ ق تا سورۃ الناس',
    description: 'Recited on Saturday: The Mufassal chapters, completion of the Holy Quran recitation.',
    recommendedDay: 'Day 7 (Saturday)',
  },
];

interface DivisionsPageProps {
  onOpenSurah: (surahNumber: number, ayahNumber?: number) => void;
}

type DivisionTab = 'manzil' | 'hizb' | 'ruku';

export const DivisionsPage: React.FC<DivisionsPageProps> = ({ onOpenSurah }) => {
  const { settings } = useQuranSettings();
  const [activeTab, setActiveTab] = useState<DivisionTab>('manzil');

  // Active item states
  const [selectedManzil, setSelectedManzil] = useState<number | null>(null);
  const [selectedHizb, setSelectedHizb] = useState<number | null>(null);
  const [selectedRuku, setSelectedRuku] = useState<number | null>(null);

  // Search filter for Ruku or Hizb
  const [filterQuery, setFilterQuery] = useState('');

  // Loaded data states
  const [manzilData, setManzilData] = useState<{ arabic: ManzilData; translation: ManzilData } | null>(null);
  const [hizbData, setHizbData] = useState<{ arabic: HizbQuarterData; translation: HizbQuarterData } | null>(null);
  const [rukuData, setRukuData] = useState<{ arabic: RukuData; translation: RukuData } | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Load Manzil
  const loadManzil = async (num: number) => {
    setLoading(true);
    setError(false);
    try {
      const data = await getManzil(num, settings.translationEdition);
      setManzilData(data);
      setSelectedManzil(num);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Failed to load Manzil', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Load Hizb Quarter
  const loadHizb = async (num: number) => {
    setLoading(true);
    setError(false);
    try {
      const data = await getHizbQuarter(num, settings.translationEdition);
      setHizbData(data);
      setSelectedHizb(num);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Failed to load Hizb Quarter', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Load Ruku
  const loadRuku = async (num: number) => {
    setLoading(true);
    setError(false);
    try {
      const data = await getRuku(num, settings.translationEdition);
      setRukuData(data);
      setSelectedRuku(num);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Failed to load Ruku', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Auto-reload on translation setting change if viewing verses
  useEffect(() => {
    if (selectedManzil !== null) {
      loadManzil(selectedManzil);
    }
  }, [settings.translationEdition]);

  // ACTIVE READING VIEW: MANZIL
  if (selectedManzil !== null) {
    const detail = MANZIL_DETAILS.find((m) => m.number === selectedManzil);
    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-fadeIn">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-[#fcfaf6] dark:bg-[#0c1412] border border-emerald-900/10 dark:border-emerald-800/20 shadow-xs">
          <button
            onClick={() => {
              setSelectedManzil(null);
              setManzilData(null);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-900 dark:text-amber-200 hover:bg-emerald-950/5 dark:hover:bg-emerald-950/30 cursor-pointer transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>All Manzils</span>
          </button>

          <div className="text-center">
            <h2 className="text-sm font-bold text-emerald-950 dark:text-emerald-50">
              {detail?.titleEnglish}
            </h2>
            <p className="text-[11px] text-stone-500 font-urdu">{detail?.titleUrdu}</p>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => loadManzil(selectedManzil - 1)}
              disabled={selectedManzil <= 1}
              className="p-2 rounded-xl border border-emerald-900/10 dark:border-emerald-800/20 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-emerald-950/5 cursor-pointer"
              title="Previous Manzil"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => loadManzil(selectedManzil + 1)}
              disabled={selectedManzil >= 7}
              className="p-2 rounded-xl border border-emerald-900/10 dark:border-emerald-800/20 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-emerald-950/5 cursor-pointer"
              title="Next Manzil"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Manzil Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-950/5 to-emerald-900/15 dark:from-emerald-950/40 dark:to-emerald-900/20 border border-emerald-900/15 dark:border-emerald-800/30 text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5" />
            <span>{detail?.recommendedDay}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-['Cinzel',serif] text-emerald-950 dark:text-emerald-50">
            {detail?.titleEnglish}
          </h1>
          <p className="font-urdu text-lg text-emerald-800 dark:text-amber-200" dir="rtl">
            {detail?.titleUrdu} — {detail?.surahRangeUrdu}
          </p>
          <p className="text-xs text-stone-600 dark:text-stone-300 max-w-xl mx-auto italic">
            {detail?.description}
          </p>
        </div>

        {/* Ayahs List */}
        {loading && <AyahReaderSkeleton />}
        {error && <ErrorState message="Failed to load verses for this Manzil stage." onRetry={() => loadManzil(selectedManzil)} />}

        {!loading && !error && manzilData && (
          <div className="space-y-6">
            {manzilData.arabic.ayahs.map((ayah, index) => {
              const transAyah = manzilData.translation.ayahs[index];
              const surahRef = ayah.surah || {
                number: 1,
                name: 'سورة',
                englishName: 'Surah',
                englishNameTranslation: '',
                numberOfAyahs: 7,
                revelationType: 'Meccan',
              };
              return (
                <AyahCard
                  key={ayah.number}
                  ayah={ayah}
                  surah={surahRef}
                  translationText={transAyah?.text}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ACTIVE READING VIEW: HIZB QUARTER
  if (selectedHizb !== null) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-fadeIn">
        <div className="flex items-center justify-between p-4 rounded-2xl bg-[#fcfaf6] dark:bg-[#0c1412] border border-emerald-900/10 dark:border-emerald-800/20 shadow-xs">
          <button
            onClick={() => {
              setSelectedHizb(null);
              setHizbData(null);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-900 dark:text-amber-200 hover:bg-emerald-950/5 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>All Hizb Quarters</span>
          </button>
          <div className="text-center">
            <h2 className="text-sm font-bold text-emerald-950 dark:text-emerald-50">
              Hizb Quarter {selectedHizb} of 240
            </h2>
            <p className="text-[11px] text-stone-500">Rub' al-Hizb (ربع الحزب)</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => loadHizb(selectedHizb - 1)}
              disabled={selectedHizb <= 1}
              className="p-2 rounded-xl border border-emerald-900/10 dark:border-emerald-800/20 disabled:opacity-30 hover:bg-emerald-950/5 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => loadHizb(selectedHizb + 1)}
              disabled={selectedHizb >= 240}
              className="p-2 rounded-xl border border-emerald-900/10 dark:border-emerald-800/20 disabled:opacity-30 hover:bg-emerald-950/5 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loading && <AyahReaderSkeleton />}
        {error && <ErrorState message="Failed to load Hizb Quarter verses." onRetry={() => loadHizb(selectedHizb)} />}

        {!loading && !error && hizbData && (
          <div className="space-y-6">
            {hizbData.arabic.ayahs.map((ayah, index) => {
              const transAyah = hizbData.translation.ayahs[index];
              const surahRef = ayah.surah || {
                number: 1,
                name: 'سورة',
                englishName: 'Surah',
                englishNameTranslation: '',
                numberOfAyahs: 7,
                revelationType: 'Meccan',
              };
              return (
                <AyahCard
                  key={ayah.number}
                  ayah={ayah}
                  surah={surahRef}
                  translationText={transAyah?.text}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ACTIVE READING VIEW: RUKU
  if (selectedRuku !== null) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-fadeIn">
        <div className="flex items-center justify-between p-4 rounded-2xl bg-[#fcfaf6] dark:bg-[#0c1412] border border-emerald-900/10 dark:border-emerald-800/20 shadow-xs">
          <button
            onClick={() => {
              setSelectedRuku(null);
              setRukuData(null);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-900 dark:text-amber-200 hover:bg-emerald-950/5 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>All Rukus</span>
          </button>
          <div className="text-center">
            <h2 className="text-sm font-bold text-emerald-950 dark:text-emerald-50">
              Ruku {selectedRuku} of 556
            </h2>
            <p className="text-[11px] text-stone-500 font-urdu">قرآنی رکوع — سیاق و کلام</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => loadRuku(selectedRuku - 1)}
              disabled={selectedRuku <= 1}
              className="p-2 rounded-xl border border-emerald-900/10 dark:border-emerald-800/20 disabled:opacity-30 hover:bg-emerald-950/5 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => loadRuku(selectedRuku + 1)}
              disabled={selectedRuku >= 556}
              className="p-2 rounded-xl border border-emerald-900/10 dark:border-emerald-800/20 disabled:opacity-30 hover:bg-emerald-950/5 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loading && <AyahReaderSkeleton />}
        {error && <ErrorState message="Failed to load Ruku verses." onRetry={() => loadRuku(selectedRuku)} />}

        {!loading && !error && rukuData && (
          <div className="space-y-6">
            {rukuData.arabic.ayahs.map((ayah, index) => {
              const transAyah = rukuData.translation.ayahs[index];
              const surahRef = ayah.surah || {
                number: 1,
                name: 'سورة',
                englishName: 'Surah',
                englishNameTranslation: '',
                numberOfAyahs: 7,
                revelationType: 'Meccan',
              };
              return (
                <AyahCard
                  key={ayah.number}
                  ayah={ayah}
                  surah={surahRef}
                  translationText={transAyah?.text}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // MAIN DIRECTORY VIEW
  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16 animate-fadeIn">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-900/10 dark:bg-emerald-800/30 text-emerald-900 dark:text-amber-200 text-xs font-semibold border border-emerald-900/10 dark:border-emerald-700/30">
          <Compass className="w-3.5 h-3.5 text-amber-500" />
          <span>Quranic Divisions & Structural Units</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-emerald-950 dark:text-emerald-50 font-['Cinzel',serif]">
          Divisions of the Holy Quran
        </h1>
        <p className="text-sm text-stone-600 dark:text-stone-300 max-w-2xl mx-auto">
          Explore the Quran through its sacred divisions: <strong>7 Manzils</strong> for weekly
          recitation, <strong>240 Hizb Quarters</strong> for measured memorization, and{' '}
          <strong>556 Rukus</strong> for thematic reflection.
        </p>

        {/* Tab Switcher */}
        <div className="flex items-center justify-center gap-2 pt-4">
          {[
            { id: 'manzil', label: '7 Manzils (منزل)', icon: Calendar, badge: 'Weekly Khatm' },
            { id: 'hizb', label: '240 Hizb Quarters (أرباع الحزب)', icon: Layers, badge: 'Rub al-Hizb' },
            { id: 'ruku', label: '556 Rukus (رکوع)', icon: BookOpen, badge: 'Thematic' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as DivisionTab);
                  setFilterQuery('');
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-900 text-amber-200 dark:bg-emerald-800 dark:text-amber-300 shadow-md scale-102'
                    : 'bg-emerald-950/5 dark:bg-emerald-950/30 text-stone-600 dark:text-stone-300 hover:bg-emerald-900/10 border border-emerald-900/10 dark:border-emerald-800/20'
                }`}
              >
                <Icon className="w-4 h-4 text-amber-400" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: 7 MANZILS (WEEKLY RECITATION STAGES) */}
      {activeTab === 'manzil' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-emerald-950/5 dark:bg-emerald-950/30 border border-emerald-900/10 dark:border-emerald-800/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-50">
                The Seven Manzils (سَبْعَةُ مَنَازِل)
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                A prophetic tradition of the Sahabah (Companions) dividing the Holy Quran into 7 equal daily portions.
              </p>
            </div>
            {isUrduTranslation(settings.translationEdition) && (
              <span className="font-urdu text-sm text-emerald-800 dark:text-amber-300">
                ہفتہ وار تلاوت قرآن کے سات منازل
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MANZIL_DETAILS.map((manzil) => (
              <div
                key={manzil.number}
                onClick={() => loadManzil(manzil.number)}
                className="group relative p-6 rounded-3xl bg-[#fcfaf6] dark:bg-[#0c1412] border border-emerald-900/10 dark:border-emerald-800/25 hover:border-amber-500/50 dark:hover:border-amber-500/40 hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold text-xs flex items-center justify-center font-['Cinzel',serif]">
                      {manzil.number}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-950/5 dark:bg-emerald-950/40 text-stone-500 dark:text-stone-400 text-[11px] font-semibold">
                      {manzil.recommendedDay}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-50 group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
                      {manzil.titleEnglish}
                    </h3>
                    <p className="font-urdu text-sm text-emerald-800 dark:text-amber-200/80 pt-0.5" dir="rtl">
                      {manzil.titleUrdu}
                    </p>
                  </div>

                  <p className="text-xs font-medium text-emerald-900/80 dark:text-emerald-300/80">
                    {manzil.surahRange}
                  </p>

                  <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2">
                    {manzil.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-emerald-900/10 dark:border-emerald-800/20 flex items-center justify-between text-xs font-semibold text-amber-600 dark:text-amber-400">
                  <span>Read Manzil {manzil.number}</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: 240 HIZB QUARTERS (RUB' AL-HIZB) */}
      {activeTab === 'hizb' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-950/5 dark:bg-emerald-950/30 border border-emerald-900/10 dark:border-emerald-800/20">
            <div>
              <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-50">
                240 Hizb Quarters (أرباع الحزب)
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Each of the 30 Juz contains 2 Hizbs, divided into 4 quarters each (8 quarters per Juz = 240 total).
              </p>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                min="1"
                max="240"
                placeholder="Jump to Quarter (1–240)..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="pl-9 pr-4 py-1.5 rounded-xl bg-white dark:bg-stone-900 border border-emerald-900/10 dark:border-emerald-800/30 text-xs text-emerald-950 dark:text-emerald-50 focus:outline-none w-48"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
            {Array.from({ length: 240 }, (_, i) => i + 1)
              .filter((num) => (filterQuery ? num.toString().includes(filterQuery) : true))
              .map((num) => {
                const juzNum = Math.ceil(num / 8);
                return (
                  <button
                    key={num}
                    onClick={() => loadHizb(num)}
                    className="p-3 rounded-2xl bg-[#fcfaf6] dark:bg-[#0c1412] border border-emerald-900/10 dark:border-emerald-800/20 hover:border-amber-500/50 hover:bg-emerald-950/5 dark:hover:bg-emerald-950/30 transition-all text-center cursor-pointer group"
                  >
                    <span className="block text-xs font-bold text-emerald-950 dark:text-emerald-50 group-hover:text-amber-600 dark:group-hover:text-amber-300">
                      Quarter {num}
                    </span>
                    <span className="block text-[10px] text-stone-400">Juz {juzNum}</span>
                  </button>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 3: 556 RUKUS (THEMATIC BOWING SECTIONS) */}
      {activeTab === 'ruku' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-950/5 dark:bg-emerald-950/30 border border-emerald-900/10 dark:border-emerald-800/20">
            <div>
              <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-50">
                556 Rukus (الركوعات القرآنية)
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Thematic divisions marked in the Quran where the reader traditionally bows (ruku') during Taraweeh and prayer.
              </p>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                min="1"
                max="556"
                placeholder="Jump to Ruku (1–556)..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="pl-9 pr-4 py-1.5 rounded-xl bg-white dark:bg-stone-900 border border-emerald-900/10 dark:border-emerald-800/30 text-xs text-emerald-950 dark:text-emerald-50 focus:outline-none w-48"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
            {Array.from({ length: 556 }, (_, i) => i + 1)
              .filter((num) => (filterQuery ? num.toString().includes(filterQuery) : true))
              .map((num) => (
                <button
                  key={num}
                  onClick={() => loadRuku(num)}
                  className="p-3 rounded-2xl bg-[#fcfaf6] dark:bg-[#0c1412] border border-emerald-900/10 dark:border-emerald-800/20 hover:border-amber-500/50 hover:bg-emerald-950/5 dark:hover:bg-emerald-950/30 transition-all text-center cursor-pointer group"
                >
                  <span className="block text-xs font-bold text-emerald-950 dark:text-emerald-50 group-hover:text-amber-600 dark:group-hover:text-amber-300">
                    Ruku {num}
                  </span>
                  <span className="block text-[10px] text-stone-400 font-urdu">رکوع {num}</span>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
