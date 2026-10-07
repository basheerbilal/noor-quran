import React, { useState, useEffect } from 'react';
import { Compass, ExternalLink } from 'lucide-react';
import { SajdaVerse } from '../types';
import { getSajda } from '../api/quranApi';
import { AyahReaderSkeleton, ErrorState } from '../components/ui/LoadingSkeleton';
import { useQuranSettings } from '../context/QuranSettingsContext';

interface SajdaPageProps {
  onOpenAyah: (surahNumber: number, ayahNumber: number) => void;
}

export const SajdaPage: React.FC<SajdaPageProps> = ({ onOpenAyah }) => {
  const { settings } = useQuranSettings();
  const [arabicVerses, setArabicVerses] = useState<SajdaVerse[]>([]);
  const [translationVerses, setTranslationVerses] = useState<SajdaVerse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchSajdas = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getSajda(settings.translationEdition);
      setArabicVerses(data.arabicVerses);
      setTranslationVerses(data.translationVerses);
    } catch (err) {
      console.error('Failed to load sajda verses', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSajdas();
  }, [settings.translationEdition]);

  return (
    <div className="max-w-4xl mx-auto px-4 pb-20 pt-2 space-y-6">
      {/* Header */}
      <div className="text-center sm:text-left">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
          <Compass className="w-4 h-4" />
          <span>Sujaad Al-Tilawah</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-950 dark:text-emerald-50 font-['Cinzel',serif]">
          Sajda Verses (Verses of Prostration)
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1 max-w-2xl">
          The 14 designated Quranic verses upon recitation or listening to which performing prostration (Sajda Tilawah) is a beloved sunnah and act of humility before Allah.
        </p>
      </div>

      {loading && <AyahReaderSkeleton />}

      {error && (
        <ErrorState
          message="Unable to load Sajda verses."
          onRetry={fetchSajdas}
        />
      )}

      {!loading && !error && (
        <div className="space-y-4">
          {arabicVerses.map((ayah, index) => {
            const transAyah = translationVerses[index];
            const surah = ayah.surah || {
              number: 1,
              name: 'سورة',
              englishName: 'Surah',
              englishNameTranslation: '',
              numberOfAyahs: 7,
              revelationType: 'Meccan',
            };

            const sajdaType =
              typeof ayah.sajda === 'object' && ayah.sajda?.obligatory
                ? 'Obligatory'
                : 'Recommended (Sunnah)';

            return (
              <div
                key={ayah.number}
                className="p-6 rounded-3xl bg-[#fcfaf6] dark:bg-[#0c1412] border border-emerald-900/10 dark:border-emerald-800/20 hover:border-amber-400/30 transition-all space-y-4 shadow-xs"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold font-mono">
                      {ayah.surah?.number}:{ayah.numberInSurah}
                    </span>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base text-emerald-950 dark:text-emerald-50">
                        Surah {ayah.surah?.englishName} ({ayah.surah?.name})
                      </h3>
                      <p className="text-[11px] text-stone-400">
                        Juz {ayah.juz} • Page {ayah.page}
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                    {sajdaType}
                  </span>
                </div>

                {/* Arabic text */}
                <div dir="rtl" className="py-2">
                  <p
                    className="font-quran-amiri text-2xl sm:text-3xl text-right text-emerald-950 dark:text-emerald-50 leading-[2.2]"
                    style={{ fontSize: `${settings.arabicFontSize}px` }}
                  >
                    {ayah.text}
                    <span className="inline-block mx-2 text-amber-600 dark:text-amber-400 select-none">
                      ۩
                    </span>
                  </p>
                </div>

                {/* Translation text */}
                {transAyah && (
                  <div dir="ltr" className="pt-2 border-t border-emerald-900/5 dark:border-emerald-800/10">
                    <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed italic">
                      "{transAyah.text}"
                    </p>
                  </div>
                )}

                {/* Footer Link */}
                <div className="pt-3 border-t border-emerald-900/10 dark:border-emerald-800/20 flex justify-end">
                  <button
                    onClick={() => onOpenAyah(surah.number, ayah.numberInSurah)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                  >
                    <span>Read in context of Surah</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
