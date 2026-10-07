import React, { useState, useEffect } from 'react';
import {
  Search as SearchIcon,
  X,
  Bookmark,
  Copy,
  Share2,
  Check,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { SearchMatch } from '../types';
import { searchQuran } from '../api/searchApi';
import { getSurahs } from '../api/quranApi';
import { Surah } from '../types';
import { SearchSkeleton, ErrorState } from '../components/ui/LoadingSkeleton';
import { useBookmarks } from '../context/BookmarksContext';
import { copyToClipboard, shareAyah, isUrduTranslation } from '../utils/quranUtils';

interface SearchPageProps {
  initialQuery?: string;
  onOpenAyah: (surahNumber: number, ayahNumber: number) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({ initialQuery = '', onOpenAyah }) => {
  const [keyword, setKeyword] = useState(initialQuery);
  const [selectedSurah, setSelectedSurah] = useState<number | 'all'>('all');
  const [selectedEdition, setSelectedEdition] = useState<string>('en.sahih');
  const [results, setResults] = useState<SearchMatch[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [searchedKeyword, setSearchedKeyword] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState(false);
  const [surahList, setSurahList] = useState<Surah[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const { isBookmarked, toggleBookmark } = useBookmarks();

  useEffect(() => {
    getSurahs().then(setSurahList).catch(console.error);
  }, []);

  useEffect(() => {
    if (initialQuery.trim()) {
      handleSearch(initialQuery.trim());
    }
  }, [initialQuery]);

  const handleSearch = async (term?: string) => {
    const queryTerm = (term !== undefined ? term : keyword).trim();
    if (!queryTerm) return;

    setLoading(true);
    setError(false);
    setSearchedKeyword(queryTerm);
    setHasSearched(true);

    try {
      const response = await searchQuran(
        queryTerm,
        selectedSurah,
        selectedEdition
      );
      setResults(response.matches);
      setTotalCount(response.count);
    } catch (err) {
      console.error('Search error', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const highlightKeyword = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark
              key={i}
              className="bg-amber-400/30 text-emerald-950 dark:text-amber-200 px-1 py-0.5 rounded font-semibold"
            >
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const handleCopy = async (match: SearchMatch) => {
    const textToCopy = `${match.text}\n\n— Surah ${match.surah.englishName} (${match.surah.number}:${match.numberInSurah})`;
    const success = await copyToClipboard(textToCopy);
    if (success) {
      setCopiedId(match.number);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleShare = async (match: SearchMatch) => {
    await shareAyah({
      surahName: match.surah.englishName,
      surahNumber: match.surah.number,
      ayahNumber: match.numberInSurah,
      arabicText: '',
      translationText: match.text,
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pb-20 pt-2 space-y-6">
      {/* Search Header */}
      <div className="text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-950 dark:text-emerald-50 font-['Cinzel',serif]">
          Search the Quran
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
          Find verses across translations, themes, keywords, and specific surahs.
        </p>
      </div>

      {/* Search Form Card */}
      <form
        onSubmit={handleFormSubmit}
        className="p-4 sm:p-6 rounded-3xl bg-emerald-950/5 dark:bg-emerald-950/20 border border-emerald-900/10 dark:border-emerald-800/20 space-y-4 shadow-sm"
        id="quran-search-page-form"
      >
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search keywords (e.g. 'peace', 'patience', 'mercy', 'paradise')..."
            className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-[#fcfaf6] dark:bg-[#0c1412] border border-emerald-900/10 dark:border-emerald-800/30 text-emerald-950 dark:text-emerald-50 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-sm sm:text-base transition-all"
            id="search-page-input"
          />
          {keyword && (
            <button
              type="button"
              onClick={() => setKeyword('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Surah Filter */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1.5">
              Surah Filter
            </label>
            <select
              value={selectedSurah}
              onChange={(e) =>
                setSelectedSurah(
                  e.target.value === 'all' ? 'all' : Number(e.target.value)
                )
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#fcfaf6] dark:bg-[#0c1412] border border-emerald-900/10 dark:border-emerald-800/30 text-xs font-medium text-emerald-950 dark:text-emerald-50 focus:outline-none cursor-pointer"
            >
              <option value="all">All Quran (Entire 114 Surahs)</option>
              {surahList.map((s) => (
                <option key={s.number} value={s.number} className="dark:bg-stone-900">
                  {s.number}. {s.englishName} ({s.name})
                </option>
              ))}
            </select>
          </div>

          {/* Translation Edition */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1.5">
              Edition / Translation
            </label>
            <select
              value={selectedEdition}
              onChange={(e) => setSelectedEdition(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#fcfaf6] dark:bg-[#0c1412] border border-emerald-900/10 dark:border-emerald-800/30 text-xs font-medium text-emerald-950 dark:text-emerald-50 focus:outline-none cursor-pointer"
            >
              <optgroup label="اردو تراجم (Urdu Tarjumah)">
                <option value="ur.jalandhry">اردو — مولانا جالندھری (Jalandhry)</option>
                <option value="ur.junagarhi">اردو — مولانا جوناگڑھی (Junagarhi)</option>
                <option value="ur.maududi">اردو — سید مودودی (Maududi)</option>
                <option value="ur.kanzuliman">اردو — احمد رضا خان (Kanzul Iman)</option>
                <option value="ur.qadri">اردو — طاہر القادری (Irfan-ul-Quran)</option>
                <option value="ur.ahmedali">اردو — مولانا احمد علی لاہوری</option>
              </optgroup>
              <optgroup label="English & Others">
                <option value="en.sahih">English — Saheeh International</option>
                <option value="en.pickthall">English — Pickthall</option>
                <option value="en.yusufali">English — Yusuf Ali</option>
                <option value="fr.hamidullah">French — Hamidullah</option>
                <option value="id.indonesian">Indonesian — Bahasa Indonesia</option>
                <option value="tr.ates">Turkish — Süleyman Ateş</option>
                <option value="quran-uthmani">Arabic — Uthmani Script</option>
              </optgroup>
            </select>
          </div>
        </div>

        {/* Submit button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={!keyword.trim() || loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-amber-200 font-semibold text-xs sm:text-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm transition-all"
            id="execute-search-btn"
          >
            <SearchIcon className="w-4 h-4" />
            <span>Search Verses</span>
          </button>
        </div>
      </form>

      {/* Loading Skeleton */}
      {loading && <SearchSkeleton />}

      {/* Error state */}
      {error && (
        <ErrorState
          message="Unable to complete search request."
          onRetry={() => handleSearch()}
        />
      )}

      {/* Results Section */}
      {!loading && !error && hasSearched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-900/10 dark:border-emerald-800/20">
            <p className="text-sm font-semibold text-emerald-950 dark:text-emerald-50">
              Search results for "{searchedKeyword}"
            </p>
            <span className="text-xs font-mono font-semibold text-stone-500 dark:text-stone-400 bg-emerald-950/5 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full">
              {totalCount} {totalCount === 1 ? 'match' : 'matches'}
            </span>
          </div>

          {/* Empty search matches */}
          {results.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-emerald-950/5 dark:bg-emerald-950/20 border border-emerald-900/10 dark:border-emerald-800/20">
              <p className="text-base font-semibold text-emerald-950 dark:text-emerald-50 mb-1">
                No matching Ayahs found.
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Try using another spelling, synonym, or changing the translation edition.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((match) => {
                const isBooked = isBookmarked(
                  match.surah.number,
                  match.numberInSurah
                );

                return (
                  <div
                    key={`${match.surah.number}:${match.numberInSurah}`}
                    className="p-5 sm:p-6 rounded-2xl bg-[#fcfaf6] dark:bg-[#0c1412] border border-emerald-900/10 dark:border-emerald-800/20 hover:border-amber-400/30 transition-all space-y-3"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-900/10 dark:bg-emerald-800/30 text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                          {match.surah.number}:{match.numberInSurah}
                        </span>
                        <h4 className="font-semibold text-sm text-emerald-950 dark:text-emerald-50">
                          Surah {match.surah.englishName} ({match.surah.name})
                        </h4>
                      </div>

                      <button
                        onClick={() =>
                          onOpenAyah(match.surah.number, match.numberInSurah)
                        }
                        className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                      >
                        <span>Open Ayah</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Matched Text with Highlight */}
                    <div
                      dir={
                        isUrduTranslation(match.edition?.identifier || selectedEdition) ||
                        (match.edition?.identifier || selectedEdition) === 'quran-uthmani'
                          ? 'rtl'
                          : 'ltr'
                      }
                    >
                      <p
                        className={
                          isUrduTranslation(match.edition?.identifier || selectedEdition)
                            ? 'font-urdu text-base sm:text-lg leading-[2.2] text-stone-900 dark:text-stone-100 text-right'
                            : (match.edition?.identifier || selectedEdition) === 'quran-uthmani'
                            ? 'font-quran-amiri text-xl sm:text-2xl text-stone-900 dark:text-amber-200 text-right leading-loose'
                            : 'text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-sans text-left'
                        }
                      >
                        {highlightKeyword(match.text, searchedKeyword)}
                      </p>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-emerald-900/5 dark:border-emerald-800/10 text-xs text-stone-400">
                      <span>{match.edition?.name || selectedEdition}</span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            toggleBookmark({
                              surahNumber: match.surah.number,
                              surahName: match.surah.name,
                              surahEnglishName: match.surah.englishName,
                              ayahNumber: match.numberInSurah,
                              globalAyahNumber: match.number,
                              text: '',
                              translationText: match.text,
                            })
                          }
                          title="Bookmark"
                          className="p-1.5 rounded-lg text-stone-400 hover:text-amber-500 transition-colors"
                        >
                          <Bookmark
                            className={`w-4 h-4 ${
                              isBooked ? 'fill-amber-500 text-amber-500' : ''
                            }`}
                          />
                        </button>

                        <button
                          onClick={() => handleCopy(match)}
                          title="Copy"
                          className="p-1.5 rounded-lg text-stone-400 hover:text-emerald-900 dark:hover:text-emerald-200 transition-colors"
                        >
                          {copiedId === match.number ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          onClick={() => handleShare(match)}
                          title="Share"
                          className="p-1.5 rounded-lg text-stone-400 hover:text-emerald-900 dark:hover:text-emerald-200 transition-colors"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
