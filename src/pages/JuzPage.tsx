import React, { useState, useEffect } from 'react';
import { Layers, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { JuzData } from '../types';
import { getJuz } from '../api/quranApi';
import { AyahCard } from '../components/AyahCard';
import { AyahReaderSkeleton, ErrorState } from '../components/ui/LoadingSkeleton';
import { useQuranSettings } from '../context/QuranSettingsContext';

// Traditional names/start points of all 30 Juz
const JUZ_LIST = [
  { number: 1, name: 'Alif Lam Meem', startSurah: 'Al-Faatiha 1:1', ayahCount: 148 },
  { number: 2, name: 'Sayaqool', startSurah: 'Al-Baqara 2:142', ayahCount: 111 },
  { number: 3, name: 'Tilka ar-Rusul', startSurah: 'Al-Baqara 2:253', ayahCount: 126 },
  { number: 4, name: 'Lan Tanaaloo', startSurah: "Ali 'Imran 3:93", ayahCount: 131 },
  { number: 5, name: 'Wal Muhsanat', startSurah: 'An-Nisa 4:24', ayahCount: 124 },
  { number: 6, name: 'La Yuhibbullah', startSurah: 'An-Nisa 4:148', ayahCount: 110 },
  { number: 7, name: 'Wa Iza Samiu', startSurah: "Al-Ma'idah 5:82", ayahCount: 149 },
  { number: 8, name: 'Wa Lau Annana', startSurah: "Al-An'am 6:111", ayahCount: 142 },
  { number: 9, name: 'Qalal Malao', startSurah: "Al-A'raf 7:88", ayahCount: 159 },
  { number: 10, name: "Wa A'lamoo", startSurah: 'Al-Anfal 8:41', ayahCount: 127 },
  { number: 11, name: 'Yatazeroon', startSurah: 'At-Tawbah 9:93', ayahCount: 151 },
  { number: 12, name: 'Wa Mamin Da’abbah', startSurah: 'Hud 11:6', ayahCount: 170 },
  { number: 13, name: 'Wa Ma Ubrioo', startSurah: 'Yusuf 12:53', ayahCount: 154 },
  { number: 14, name: 'Rubama', startSurah: 'Al-Hijr 15:1', ayahCount: 227 },
  { number: 15, name: 'Subhanallazi', startSurah: 'Al-Isra 17:1', ayahCount: 185 },
  { number: 16, name: 'Qala Alam', startSurah: 'Al-Kahf 18:75', ayahCount: 269 },
  { number: 17, name: 'Iqtaraba', startSurah: 'Al-Anbiya 21:1', ayahCount: 190 },
  { number: 18, name: 'Qad Aflaha', startSurah: "Al-Mu'minoon 23:1", ayahCount: 202 },
  { number: 19, name: 'Wa Qalallazina', startSurah: 'Al-Furqan 25:21', ayahCount: 339 },
  { number: 20, name: 'Amman Khalaqa', startSurah: 'An-Naml 27:60', ayahCount: 171 },
  { number: 21, name: 'Utlu Ma Oohiya', startSurah: 'Al-Ankaboot 29:46', ayahCount: 178 },
  { number: 22, name: 'Wa Manyaqnut', startSurah: 'Al-Ahzab 33:31', ayahCount: 169 },
  { number: 23, name: 'Wa Maliya', startSurah: 'Ya-Sin 36:28', ayahCount: 357 },
  { number: 24, name: 'Faman Azlamu', startSurah: 'Az-Zumar 39:32', ayahCount: 175 },
  { number: 25, name: 'Ilayhi Yuraddu', startSurah: 'Fussilat 41:47', ayahCount: 246 },
  { number: 26, name: 'Ha-Meem', startSurah: 'Al-Ahqaf 46:1', ayahCount: 195 },
  { number: 27, name: 'Qala Fama Khatbukum', startSurah: 'Az-Zariyat 51:31', ayahCount: 399 },
  { number: 28, name: 'Qadd Sami Allah', startSurah: 'Al-Mujadila 58:1', ayahCount: 137 },
  { number: 29, name: 'Tabarakallazi', startSurah: 'Al-Mulk 67:1', ayahCount: 431 },
  { number: 30, name: 'Amma Yatasa’aloon', startSurah: 'An-Naba 78:1', ayahCount: 564 },
];

interface JuzPageProps {
  onOpenSurah: (surahNumber: number, ayahNumber?: number) => void;
}

export const JuzPage: React.FC<JuzPageProps> = ({ onOpenSurah }) => {
  const { settings } = useQuranSettings();
  const [selectedJuz, setSelectedJuz] = useState<number | null>(null);
  const [juzData, setJuzData] = useState<{ arabic: JuzData; translation: JuzData } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchJuzVerses = async (juzNum: number) => {
    setLoading(true);
    setError(false);
    try {
      const data = await getJuz(juzNum, settings.translationEdition);
      setJuzData(data);
      setSelectedJuz(juzNum);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Failed to load Juz verses', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (selectedJuz !== null) {
    const currentJuzMeta = JUZ_LIST[selectedJuz - 1];

    return (
      <div className="max-w-4xl mx-auto px-4 pb-20 pt-2 space-y-6">
        {/* Navigation back */}
        <div className="flex items-center justify-between border-b border-emerald-900/10 dark:border-emerald-800/20 pb-4">
          <button
            onClick={() => setSelectedJuz(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-emerald-950/5 dark:hover:bg-emerald-950/30 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>All 30 Juzs</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchJuzVerses(selectedJuz - 1)}
              disabled={selectedJuz <= 1}
              className="p-1.5 rounded-lg border border-emerald-900/10 disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold font-mono">
              Juz {selectedJuz} of 30
            </span>
            <button
              onClick={() => fetchJuzVerses(selectedJuz + 1)}
              disabled={selectedJuz >= 30}
              className="p-1.5 rounded-lg border border-emerald-900/10 disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="p-8 rounded-3xl bg-gradient-to-br from-emerald-950/5 via-emerald-900/10 to-transparent dark:from-emerald-950/40 dark:via-emerald-900/20 dark:to-transparent border border-emerald-900/15 dark:border-emerald-800/30 text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-emerald-950 dark:text-emerald-50 font-['Cinzel',serif]">
            Juz {selectedJuz} — {currentJuzMeta.name}
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Begins at {currentJuzMeta.startSurah} • {juzData?.arabic.ayahs.length || currentJuzMeta.ayahCount} Verses
          </p>
        </div>

        {/* Loading / Error / Ayahs */}
        {loading && <AyahReaderSkeleton />}

        {error && (
          <ErrorState
            message={`Unable to load Juz ${selectedJuz}.`}
            onRetry={() => fetchJuzVerses(selectedJuz)}
          />
        )}

        {!loading && !error && juzData && (
          <div className="space-y-6">
            {juzData.arabic.ayahs.map((ayah, index) => {
              const transAyah = juzData.translation.ayahs[index];
              const surahInfo = ayah.surah || {
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
                  surah={surahInfo}
                  translationText={transAyah?.text}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 pb-20 pt-2 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-950 dark:text-emerald-50 font-['Cinzel',serif]">
          The 30 Juz of the Quran
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
          Explore the traditional 30 equal divisions (Paras) of the Holy Quran, structured for monthly reading.
        </p>
      </div>

      {/* 30 Juz Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {JUZ_LIST.map((juz) => (
          <div
            key={juz.number}
            onClick={() => fetchJuzVerses(juz.number)}
            className="group p-5 rounded-2xl bg-[#fcfaf6] dark:bg-[#0c1412] hover:bg-emerald-950/5 dark:hover:bg-emerald-950/30 border border-emerald-900/10 dark:border-emerald-800/20 hover:border-amber-400/30 cursor-pointer transition-all space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-900/10 dark:bg-emerald-800/30 text-emerald-950 dark:text-emerald-200 text-xs font-bold font-mono">
                {juz.number}
              </span>
              <span className="text-[11px] font-mono text-stone-400">
                ~{juz.ayahCount} Ayahs
              </span>
            </div>

            <div>
              <h3 className="font-semibold text-sm sm:text-base text-emerald-950 dark:text-emerald-50 group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
                {juz.name}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Starts at {juz.startSurah}
              </p>
            </div>

            <div className="pt-2 border-t border-emerald-900/5 dark:border-emerald-800/10 flex items-center justify-between text-xs font-semibold text-emerald-800 dark:text-emerald-300 group-hover:text-amber-600 dark:group-hover:text-amber-400">
              <span>Read Juz {juz.number}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
