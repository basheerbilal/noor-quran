import React, { useState } from 'react';
import {
  Search,
  Bookmark,
  Sun,
  Moon,
  SlidersHorizontal,
  Sparkles,
  Volume2,
  Flame,
} from 'lucide-react';
import { useQuranSettings } from '../context/QuranSettingsContext';
import { useBookmarks } from '../context/BookmarksContext';
import { useAudio } from '../context/AudioContext';
import { useReadingGoal } from '../context/ReadingGoalContext';
import { AlQuranSealLogo } from './ui/MushafOrnaments';

interface HeaderProps {
  onNavigate: (page: string, params?: any) => void;
  currentPage: string;
  onOpenTypographyModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNavigate,
  currentPage,
  onOpenTypographyModal,
}) => {
  const { settings, toggleTheme } = useQuranSettings();
  const { bookmarks } = useBookmarks();
  const { isPlaying, currentTrack, togglePlayPause } = useAudio();
  const {
    dailyTarget,
    todayAyahsRead,
    todayProgressPercentage,
    currentStreak,
    isGoalMetToday,
    openGoalModal,
  } = useReadingGoal();
  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onNavigate('search', { query: searchInput.trim() });
    }
  };

  const isMushaf = settings.theme === 'mushaf';

  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur-md transition-colors ${
        isMushaf
          ? 'bg-[#faf5e8]/95 border-b border-[#caa352]/40 shadow-xs text-[#1c1b18]'
          : 'bg-[#fcfaf6]/90 dark:bg-[#0c1412]/90 border-b border-emerald-900/10 dark:border-emerald-800/20'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand Logo (AlQuran.cloud Seal in mushaf theme) */}
        <div
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none group shrink-0"
          id="header-logo-brand"
        >
          {isMushaf ? (
            <AlQuranSealLogo size={36} />
          ) : (
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-950 dark:from-emerald-700 dark:to-emerald-900 flex items-center justify-center text-amber-300 shadow-sm border border-amber-400/20 group-hover:scale-105 transition-transform">
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
                  <circle cx="16" cy="7" r="1" fill="currentColor" />
                </svg>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-bold tracking-wider font-['Cinzel',serif] text-emerald-950 dark:text-emerald-50">
                    NOOR
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                </div>
                <p className="hidden sm:block text-[10px] tracking-widest text-emerald-800/70 dark:text-emerald-300/70 font-medium uppercase -mt-0.5">
                  Read • Reflect • Remember
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Center: Desktop Search Quran Input */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full" id="header-search-form">
            <Search
              className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${
                isMushaf ? 'text-[#8e6b23]' : 'text-emerald-800/40 dark:text-emerald-300/40'
              }`}
            />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search the Quran..."
              className={`w-full pl-10 pr-12 py-2 text-sm rounded-full transition-all focus:outline-none ${
                isMushaf
                  ? 'bg-[#f5ecce]/60 border border-[#caa352]/50 text-[#1c1b18] placeholder-stone-500 focus:ring-2 focus:ring-[#caa352]/50'
                  : 'bg-emerald-950/5 dark:bg-emerald-950/30 border border-emerald-900/10 dark:border-emerald-800/30 text-emerald-950 dark:text-emerald-50 placeholder-stone-400 dark:placeholder-stone-500 focus:ring-2 focus:ring-amber-400/40'
              }`}
              id="header-search-input"
            />
            <kbd
              className={`absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono rounded border ${
                isMushaf
                  ? 'text-[#8e6b23] bg-[#fbf7eb] border-[#caa352]/40'
                  : 'text-stone-400 dark:text-stone-500 bg-emerald-900/5 dark:bg-emerald-800/20 border-emerald-900/10 dark:border-emerald-700/30'
              }`}
            >
              ↵
            </kbd>
          </form>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Active Audio reciter indicator if playing */}
          {currentTrack && (
            <button
              onClick={togglePlayPause}
              title={`Recitation: Surah ${currentTrack.surahName} Ayah ${currentTrack.ayahNumberInSurah}`}
              className={`hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                isMushaf
                  ? 'bg-[#f5eac7] text-[#15366c] border-[#caa352] hover:bg-[#eddcb2]'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
              }`}
              id="header-audio-pill"
            >
              <Volume2
                className={`w-3.5 h-3.5 ${
                  isPlaying
                    ? 'animate-pulse text-amber-600 dark:text-amber-400'
                    : 'text-stone-500'
                }`}
              />
              <span className="max-w-[90px] truncate">{currentTrack.surahName}</span>
            </button>
          )}

          {/* Reading Goal & Streak indicator */}
          <button
            onClick={openGoalModal}
            title={`Daily Reading Goal: ${todayAyahsRead}/${dailyTarget} Ayahs (${todayProgressPercentage}%) • ${currentStreak} Day Streak — Click to view details or set goal`}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold border transition-all cursor-pointer shrink-0 ${
              isMushaf
                ? isGoalMetToday
                  ? 'bg-[#e8f5e9] text-[#1b5e20] border-[#81c784] hover:bg-[#c8e6c9]'
                  : 'bg-[#fbf7eb] text-[#8e6b23] border-[#caa352] hover:bg-[#f3ebd3]'
                : isGoalMetToday
                ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
            }`}
            id="header-reading-goal-pill"
          >
            <Flame
              className={`w-3.5 h-3.5 ${
                isGoalMetToday
                  ? 'fill-emerald-500 text-emerald-500'
                  : currentStreak > 0
                  ? 'fill-amber-500 text-amber-500 animate-pulse'
                  : 'text-amber-500'
              }`}
            />
            <span className="font-mono text-[11px] sm:text-xs">
              {todayAyahsRead}/{dailyTarget}
            </span>
            <span className="text-[10px] opacity-75 font-mono hidden xs:inline border-l border-current/25 pl-1">
              {currentStreak}d
            </span>
          </button>

          {/* Quick Typography settings modal trigger */}
          {onOpenTypographyModal && (
            <button
              onClick={onOpenTypographyModal}
              title="Arabic Typography Settings"
              className={`p-1.5 sm:p-2 rounded-xl transition-colors cursor-pointer shrink-0 ${
                isMushaf
                  ? 'text-[#8e6b23] hover:text-[#15366c] hover:bg-[#f3ebd3]'
                  : 'text-stone-600 dark:text-stone-300 hover:bg-emerald-950/5 dark:hover:bg-emerald-950/30'
              }`}
              aria-label="Typography settings"
              id="header-typography-btn"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          )}

          {/* Bookmarks Icon with badge (Visible on desktop; mobile uses bottom Saved tab) */}
          <button
            onClick={() => onNavigate('bookmarks')}
            title="Bookmarks"
            className={`hidden sm:flex relative p-2 rounded-xl transition-colors cursor-pointer ${
              isMushaf
                ? 'text-[#8e6b23] hover:text-[#a8383b] hover:bg-[#f3ebd3]'
                : 'text-stone-600 dark:text-stone-300 hover:bg-emerald-950/5 dark:hover:bg-emerald-950/30 hover:text-amber-500'
            }`}
            aria-label="Bookmarks"
            id="header-bookmarks-btn"
          >
            <Bookmark className="w-4 h-4" />
            {bookmarks.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#15366c] text-amber-100 text-[10px] font-bold flex items-center justify-center">
                {bookmarks.length > 99 ? '99+' : bookmarks.length}
              </span>
            )}
          </button>

          {/* Theme Toggle (Royal Mushaf / Dark / Light) */}
          <button
            onClick={toggleTheme}
            title={`Theme: ${
              settings.theme === 'mushaf'
                ? 'Royal Mushaf (AlQuran.cloud)'
                : settings.theme === 'dark'
                ? 'Dark Night'
                : 'Light'
            } — Click to toggle`}
            className={`p-1.5 sm:p-2 rounded-xl transition-colors cursor-pointer shrink-0 ${
              isMushaf
                ? 'text-[#c59e45] bg-[#f5eccd]/70 hover:bg-[#eddcae] border border-[#caa352]/40'
                : 'text-stone-600 dark:text-stone-300 hover:bg-emerald-950/5 dark:hover:bg-emerald-950/30 hover:text-amber-400'
            }`}
            aria-label="Toggle theme"
            id="header-theme-btn"
          >
            {settings.theme === 'mushaf' ? (
              <Sparkles className="w-4 h-4 text-[#a1771c]" />
            ) : settings.theme === 'dark' ? (
              <Moon className="w-4 h-4 text-amber-300" />
            ) : (
              <Sun className="w-4 h-4 text-amber-600" />
            )}
          </button>

          {/* Authentic Gold Border Menu Button (Visible on desktop; mobile uses bottom navigation) */}
          <button
            onClick={() => onNavigate('home')}
            className={`hidden sm:flex p-2 rounded-lg transition-all cursor-pointer ${
              isMushaf
                ? 'border-2 border-[#caa352] bg-[#fbf7eb] text-[#8e6b23] hover:bg-[#f3ebd3] shadow-xs'
                : 'rounded-xl text-stone-600 dark:text-stone-300 hover:bg-emerald-950/5 dark:hover:bg-emerald-950/30'
            }`}
            title="Browse Surahs / Menu"
            aria-label="Surah Menu"
            id="header-mushaf-menu-btn"
          >
            <div className="w-4 h-3.5 flex flex-col justify-between items-center py-0.5">
              <span className="w-full h-0.5 bg-current rounded-full" />
              <span className="w-full h-0.5 bg-current rounded-full" />
              <span className="w-full h-0.5 bg-current rounded-full" />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
