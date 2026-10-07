import React from 'react';
import {
  Home,
  BookOpen,
  Bookmark,
  Search,
  Settings,
  Layers,
  FileText,
  Compass,
  Milestone,
  Sparkles,
  PenLine,
  Flame,
  CheckCircle,
} from 'lucide-react';
import { useBookmarks } from '../context/BookmarksContext';
import { useReadingGoal } from '../context/ReadingGoalContext';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string, params?: any) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const { bookmarks, reflections } = useBookmarks();
  const {
    dailyTarget,
    todayAyahsRead,
    todayProgressPercentage,
    currentStreak,
    isGoalMetToday,
    openGoalModal,
  } = useReadingGoal();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'quran', label: 'Surahs', icon: BookOpen },
    { id: 'juz', label: 'Juz (30)', icon: Layers },
    { id: 'divisions', label: 'Manzil & Divisions', icon: Milestone },
    { id: 'pages', label: 'Pages (604)', icon: FileText },
    { id: 'sajda', label: 'Sajda Verses', icon: Compass },
    { id: 'khatam', label: 'Khatam Tracker', icon: CheckCircle },
    { id: 'quiz', label: 'Hifz Quiz', icon: Sparkles },
    {
      id: 'bookmarks',
      label: 'Bookmarks',
      icon: Bookmark,
      badge: bookmarks?.length > 0 ? bookmarks.length : undefined,
    },
    {
      id: 'reflections',
      label: 'My Reflections',
      icon: PenLine,
      badge: reflections?.length > 0 ? reflections.length : undefined,
    },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-emerald-900/10 dark:border-emerald-800/20 bg-[#fcfaf6]/80 dark:bg-[#0c1412]/80 backdrop-blur-md p-4 min-h-[calc(100vh-4rem)] select-none">
      {/* Navigation Links */}
      <div className="space-y-1">
        <p className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-emerald-800/60 dark:text-emerald-300/50 uppercase font-['Cinzel',serif]">
          Quran Exploration
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-emerald-900 text-amber-200 dark:bg-emerald-800/60 dark:text-amber-300 shadow-sm border border-emerald-800/40 dark:border-amber-400/20'
                  : 'text-stone-600 dark:text-stone-300 hover:bg-emerald-950/5 dark:hover:bg-emerald-950/30 hover:text-emerald-900 dark:hover:text-emerald-100'
              }`}
              id={`sidebar-nav-${item.id}`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive
                      ? 'text-amber-300'
                      : 'text-emerald-800/60 dark:text-emerald-400/60'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    isActive
                      ? 'bg-amber-400 text-emerald-950'
                      : 'bg-emerald-900/10 dark:bg-emerald-700/20 text-emerald-800 dark:text-emerald-200'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Mini Reading Goal & Streak Widget in Sidebar */}
      <div className="mt-auto pt-4 space-y-3">
        <div
          onClick={openGoalModal}
          className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-emerald-900/5 dark:from-amber-500/15 dark:via-emerald-950/40 dark:to-emerald-900/20 border border-amber-500/25 hover:border-amber-500/40 transition-all cursor-pointer shadow-xs group"
          id="sidebar-reading-goal-card"
          title="Daily Reading Goal — Click to view streak & progress"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500 group-hover:scale-110 transition-transform" />
              <span>{currentStreak} Day Streak</span>
            </div>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-900 dark:text-amber-200">
              {todayAyahsRead}/{dailyTarget}
            </span>
          </div>

          <div className="w-full bg-emerald-950/10 dark:bg-emerald-800/30 h-1.5 rounded-full overflow-hidden mb-1.5">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isGoalMetToday ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${Math.max(4, todayProgressPercentage)}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] text-stone-500 dark:text-stone-400">
            <span>
              {isGoalMetToday
                ? 'Goal Met Today ✨'
                : `${Math.max(0, dailyTarget - todayAyahsRead)} ayahs left`}
            </span>
            <span className="text-amber-600 dark:text-amber-400 font-semibold group-hover:underline">
              Edit Goal →
            </span>
          </div>
        </div>

        {/* Spiritual Callout Banner in Sidebar Footer */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/5 to-emerald-900/10 dark:from-emerald-950/40 dark:to-emerald-900/20 border border-emerald-900/10 dark:border-emerald-800/30 space-y-2">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Sacred Words
            </span>
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-serif italic">
            "Indeed, in the remembrance of Allah do hearts find rest."
          </p>
          <p className="text-[10px] text-stone-400 dark:text-stone-500 font-sans">
            Surah Ar-Ra'd 13:28
          </p>
        </div>
      </div>
    </aside>
  );
};
