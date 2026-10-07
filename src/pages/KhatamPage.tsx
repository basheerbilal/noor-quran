import React, { useEffect, useState } from 'react';
import { CheckCircle, Circle, BookOpen } from 'lucide-react';
import { getSurahs } from '../api/quranApi';
import { Surah } from '../types';
import { useKhatamProgress } from '../context/KhatamProgressContext';
import { ErrorState, SurahListSkeleton } from '../components/ui/LoadingSkeleton';

export const KhatamPage: React.FC = () => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { completedSurahs, toggleSurahCompletion, isSurahCompleted, progressPercentage } = useKhatamProgress();

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

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 pb-16">
      {/* Header */}
      <div className="text-center sm:text-left pt-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-950 dark:text-emerald-50 font-['Cinzel',serif]">
          Khatam-al-Quran Tracker
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
          Track your journey through the Holy Quran.
        </p>
      </div>

      {/* Progress Visualization */}
      <div className="p-6 rounded-3xl bg-emerald-950/5 dark:bg-emerald-950/20 border border-emerald-900/10 dark:border-emerald-800/20">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-emerald-950 dark:text-emerald-50">Overall Progress</h2>
          <span className="text-2xl font-bold text-emerald-800 dark:text-emerald-300">{progressPercentage}%</span>
        </div>
        <div className="w-full bg-stone-200 dark:bg-stone-700 rounded-full h-4 overflow-hidden">
          <div
            className="bg-emerald-600 h-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-2">
          {completedSurahs.length} of 114 Surahs completed
        </p>
      </div>

      {/* Surah List */}
      {loading && <SurahListSkeleton />}
      {error && <ErrorState message="Unable to load Surahs." onRetry={fetchSurahList} />}
      {!loading && !error && (
        <div className="space-y-2">
          {surahs.map((surah) => {
            const completed = isSurahCompleted(surah.number);
            return (
              <button
                key={surah.number}
                onClick={() => toggleSurahCompletion(surah.number)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  completed
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500/30'
                    : 'bg-[#fcfaf6] dark:bg-[#0c1412] border-emerald-900/10 dark:border-emerald-800/20 hover:border-emerald-500/30'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-stone-400 w-8">{surah.number}</span>
                  <div className="text-left">
                    <p className={`font-semibold ${completed ? 'text-emerald-950 dark:text-emerald-50' : 'text-stone-900 dark:text-stone-100'}`}>
                      {surah.englishName}
                    </p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">{surah.englishNameTranslation}</p>
                  </div>
                </div>
                {completed ? (
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                ) : (
                  <Circle className="w-6 h-6 text-stone-300 dark:text-stone-600" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
