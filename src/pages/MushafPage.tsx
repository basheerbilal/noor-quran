import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, Layers } from 'lucide-react';
import { Ayah } from '../types';
import { getPage } from '../api/quranApi';
import { AyahCard } from '../components/AyahCard';
import { AyahReaderSkeleton, ErrorState } from '../components/ui/LoadingSkeleton';
import { useQuranSettings } from '../context/QuranSettingsContext';

interface MushafPageProps {
  onOpenAyah: (surahNumber: number, ayahNumber: number) => void;
}

export const MushafPage: React.FC<MushafPageProps> = ({ onOpenAyah }) => {
  const { settings } = useQuranSettings();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageAyahs, setPageAyahs] = useState<Ayah[]>([]);
  const [transAyahs, setTransAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchPage = async (pageNo: number) => {
    setLoading(true);
    setError(false);
    try {
      const data = await getPage(pageNo, settings.translationEdition);
      setPageAyahs(data.arabic.ayahs);
      setTransAyahs(data.translation.ayahs);
      setCurrentPage(pageNo);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Failed to load page', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage(currentPage);
  }, [currentPage]);

  const surahNames = Array.from(
    new Set(pageAyahs.map((a) => a.surah?.englishName).filter(Boolean))
  );

  return (
    <div className="max-w-4xl mx-auto px-4 pb-20 pt-2 space-y-6">
      {/* Header & Page Controller */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-900/10 dark:border-emerald-800/20 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-950 dark:text-emerald-50 font-['Cinzel',serif]">
            Mushaf Page Reader
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Browse through the 604 standard printed Madani Mushaf pages.
          </p>
        </div>

        {/* Page selector and nav */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1 || loading}
            className="p-2 rounded-xl border border-emerald-900/10 dark:border-emerald-800/30 text-stone-600 dark:text-stone-300 disabled:opacity-30 cursor-pointer"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <span>Page</span>
            <input
              type="number"
              min={1}
              max={604}
              value={currentPage}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val >= 1 && val <= 604) {
                  setCurrentPage(val);
                }
              }}
              className="w-16 px-2 py-1 text-center font-mono rounded-lg bg-emerald-950/5 dark:bg-emerald-950/30 border border-emerald-900/10 dark:border-emerald-800/30 text-emerald-950 dark:text-emerald-50 focus:outline-none"
            />
            <span className="text-stone-400">/ 604</span>
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(604, p + 1))}
            disabled={currentPage >= 604 || loading}
            className="p-2 rounded-xl border border-emerald-900/10 dark:border-emerald-800/30 text-stone-600 dark:text-stone-300 disabled:opacity-30 cursor-pointer"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Page Context Card */}
      <div className="p-4 sm:p-6 rounded-2xl bg-emerald-950/5 dark:bg-emerald-950/20 border border-emerald-900/10 dark:border-emerald-800/20 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-600 dark:text-stone-300">
        <div>
          <span className="font-semibold text-emerald-950 dark:text-emerald-50">
            Surah: {surahNames.join(', ') || '...'}
          </span>
        </div>
        <div>
          <span>Juz {pageAyahs[0]?.juz || '—'}</span>
        </div>
      </div>

      {loading && <AyahReaderSkeleton />}

      {error && (
        <ErrorState
          message={`Unable to load Mushaf page ${currentPage}.`}
          onRetry={() => fetchPage(currentPage)}
        />
      )}

      {!loading && !error && (
        <div className="space-y-4">
          {pageAyahs.map((ayah, index) => {
            const surah = ayah.surah || {
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
                surah={surah}
                translationText={transAyahs[index]?.text}
              />
            );
          })}
        </div>
      )}

      {/* Bottom Page Nav */}
      <div className="flex items-center justify-between pt-6 border-t border-emerald-900/10 dark:border-emerald-800/20">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage <= 1 || loading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#fcfaf6] dark:bg-[#0c1412] border border-emerald-900/10 dark:border-emerald-800/30 text-xs font-semibold disabled:opacity-30 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Page {Math.max(1, currentPage - 1)}</span>
        </button>

        <span className="text-xs font-mono text-stone-400">
          Page {currentPage} of 604
        </span>

        <button
          onClick={() => setCurrentPage((p) => Math.min(604, p + 1))}
          disabled={currentPage >= 604 || loading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#fcfaf6] dark:bg-[#0c1412] border border-emerald-900/10 dark:border-emerald-800/30 text-xs font-semibold disabled:opacity-30 cursor-pointer"
        >
          <span>Page {Math.min(604, currentPage + 1)}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
