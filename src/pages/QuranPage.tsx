import React, { useEffect, useState, useMemo } from 'react';
import { Search, LayoutGrid, List, Sparkles } from 'lucide-react';
import { Surah } from '../types';
import { getSurahs } from '../api/quranApi';
import { SurahCard } from '../components/SurahCard';
import { SurahListSkeleton, ErrorState } from '../components/ui/LoadingSkeleton';
import { useReadingProgress } from '../context/ReadingProgressContext';

interface QuranPageProps {
  onSelectSurah: (surahNumber: number) => void;
}

export const QuranPage: React.FC<QuranPageProps> = ({ onSelectSurah }) => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'meccan' | 'medinan'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { lastRead } = useReadingProgress();

  const fetchSurahList = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getSurahs();
      setSurahs(data);
    } catch (err) {
      console.error('Failed to load surahs', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurahList();
  }, []);

  // Filtered & searched surahs
  const filteredSurahs = useMemo(() => {
    return surahs.filter((surah) => {
      // Type filter
      if (filterType === 'meccan' && surah.revelationType.toLowerCase() !== 'meccan') {
        return false;
      }
      if (filterType === 'medinan' && surah.revelationType.toLowerCase() !== 'medinan') {
        return false;
      }

      // Query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const matchNumber = String(surah.number) === q;
      const matchEnglish = surah.englishName.toLowerCase().includes(q);
      const matchTranslation = surah.englishNameTranslation.toLowerCase().includes(q);
      const matchArabic = surah.name.includes(q);

      return matchNumber || matchEnglish || matchTranslation || matchArabic;
    });
  }, [surahs, searchQuery, filterType]);

  const counts = useMemo(() => {
    const meccan = surahs.filter((s) => s.revelationType.toLowerCase() === 'meccan').length;
    const medinan = surahs.filter((s) => s.revelationType.toLowerCase() === 'medinan').length;
    return { all: surahs.length, meccan, medinan };
  }, [surahs]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 pb-16">
      {/* Page Header */}
      <div className="text-center sm:text-left pt-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-950 dark:text-emerald-50 font-['Cinzel',serif]">
          The Holy Quran
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
          Explore all 114 Surahs with revelation contexts, verse counts, and translations.
        </p>
      </div>

      {/* Search & Filter Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2 rounded-2xl bg-emerald-950/5 dark:bg-emerald-950/20 border border-emerald-900/10 dark:border-emerald-800/20">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Surah by name, number, or translation..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-[#fcfaf6] dark:bg-[#0c1412] border border-emerald-900/10 dark:border-emerald-800/30 text-emerald-950 dark:text-emerald-50 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all"
            id="surah-search-input"
          />
        </div>

        {/* Filter Tabs & Layout Toggle */}
        <div className="flex items-center justify-between sm:justify-end gap-2">
          {/* Revelation filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#fcfaf6] dark:bg-[#0c1412] rounded-xl border border-emerald-900/10 dark:border-emerald-800/20 text-xs font-medium">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                filterType === 'all'
                  ? 'bg-emerald-800 text-amber-200 dark:bg-emerald-700 font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-emerald-900'
              }`}
            >
              All ({counts.all || 114})
            </button>
            <button
              onClick={() => setFilterType('meccan')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                filterType === 'meccan'
                  ? 'bg-emerald-800 text-amber-200 dark:bg-emerald-700 font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-emerald-900'
              }`}
            >
              Meccan ({counts.meccan || 86})
            </button>
            <button
              onClick={() => setFilterType('medinan')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                filterType === 'medinan'
                  ? 'bg-emerald-800 text-amber-200 dark:bg-emerald-700 font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-emerald-900'
              }`}
            >
              Medinan ({counts.medinan || 28})
            </button>
          </div>

          {/* View mode toggle */}
          <div className="hidden sm:flex items-center gap-1 p-1 bg-[#fcfaf6] dark:bg-[#0c1412] rounded-xl border border-emerald-900/10 dark:border-emerald-800/20">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-emerald-800 text-amber-200'
                  : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-emerald-800 text-amber-200'
                  : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && <SurahListSkeleton />}

      {/* Error state */}
      {error && (
        <ErrorState
          message="Unable to load Quran Surah list."
          onRetry={fetchSurahList}
        />
      )}

      {/* Empty Search Results */}
      {!loading && !error && filteredSurahs.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-emerald-950/5 dark:bg-emerald-950/20 border border-emerald-900/10 dark:border-emerald-800/20">
          <p className="text-base font-semibold text-emerald-950 dark:text-emerald-50 mb-1">
            No matching Surahs found.
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Try adjusting your search keywords or clearing filters.
          </p>
        </div>
      )}

      {/* Surah List / Grid */}
      {!loading && !error && filteredSurahs.length > 0 && (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-2'
          }
        >
          {filteredSurahs.map((surah) => (
            <SurahCard
              key={surah.number}
              surah={surah}
              onClick={() => onSelectSurah(surah.number)}
              isLastRead={lastRead?.surahNumber === surah.number}
            />
          ))}
        </div>
      )}
    </div>
  );
};
