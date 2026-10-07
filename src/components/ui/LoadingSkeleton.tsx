import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const SurahListSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="p-5 rounded-2xl bg-emerald-950/5 dark:bg-emerald-950/30 border border-emerald-900/10 dark:border-emerald-800/20"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-900/10 dark:bg-emerald-700/20" />
              <div>
                <div className="w-24 h-4 bg-emerald-900/10 dark:bg-emerald-700/20 rounded mb-1.5" />
                <div className="w-16 h-3 bg-emerald-900/10 dark:bg-emerald-700/10 rounded" />
              </div>
            </div>
            <div className="w-16 h-6 bg-emerald-900/10 dark:bg-emerald-700/20 rounded" />
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-emerald-900/5 dark:border-emerald-800/10">
            <div className="w-14 h-3 bg-emerald-900/10 dark:bg-emerald-700/10 rounded" />
            <div className="w-12 h-3 bg-emerald-900/10 dark:bg-emerald-700/10 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const AyahReaderSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse max-w-4xl mx-auto">
      {/* Surah Header Skeleton */}
      <div className="p-8 rounded-3xl bg-emerald-950/5 dark:bg-emerald-950/30 border border-emerald-900/10 dark:border-emerald-800/20 text-center space-y-4">
        <div className="w-48 h-8 bg-emerald-900/10 dark:bg-emerald-700/20 rounded-full mx-auto" />
        <div className="w-32 h-5 bg-emerald-900/10 dark:bg-emerald-700/10 rounded mx-auto" />
        <div className="w-64 h-4 bg-emerald-900/10 dark:bg-emerald-700/10 rounded mx-auto" />
      </div>

      {/* Ayahs Skeletons */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="p-6 rounded-2xl bg-emerald-950/5 dark:bg-emerald-950/20 border border-emerald-900/10 dark:border-emerald-800/20 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-full bg-emerald-900/10 dark:bg-emerald-700/20" />
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-900/10 dark:bg-emerald-700/20" />
              <div className="w-7 h-7 rounded-lg bg-emerald-900/10 dark:bg-emerald-700/20" />
            </div>
          </div>
          <div className="space-y-2 py-4">
            <div className="w-full h-8 bg-emerald-900/10 dark:bg-emerald-700/20 rounded" />
            <div className="w-4/5 h-8 bg-emerald-900/10 dark:bg-emerald-700/20 rounded ml-auto" />
          </div>
          <div className="space-y-2 pt-2 border-t border-emerald-900/5 dark:border-emerald-800/10">
            <div className="w-full h-4 bg-emerald-900/10 dark:bg-emerald-700/10 rounded" />
            <div className="w-3/4 h-4 bg-emerald-900/10 dark:bg-emerald-700/10 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const SearchSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="p-5 rounded-2xl bg-emerald-950/5 dark:bg-emerald-950/30 border border-emerald-900/10 dark:border-emerald-800/20 space-y-3"
        >
          <div className="flex justify-between items-center">
            <div className="w-32 h-4 bg-emerald-900/10 dark:bg-emerald-700/20 rounded" />
            <div className="w-20 h-4 bg-emerald-900/10 dark:bg-emerald-700/20 rounded" />
          </div>
          <div className="w-full h-5 bg-emerald-900/10 dark:bg-emerald-700/10 rounded" />
          <div className="w-2/3 h-5 bg-emerald-900/10 dark:bg-emerald-700/10 rounded" />
        </div>
      ))}
    </div>
  );
};

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Unable to load Quran data.',
  onRetry,
}) => {
  return (
    <div className="p-8 my-8 text-center rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 max-w-md mx-auto">
      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-semibold text-emerald-950 dark:text-emerald-50 mb-1">
        {message}
      </h3>
      <p className="text-sm text-stone-500 dark:text-stone-400 mb-5">
        Please check your connection and try again.
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-medium text-sm transition-colors shadow-sm cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
};
