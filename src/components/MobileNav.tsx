import React from 'react';
import { Home, BookOpen, Search, Bookmark, Settings, CheckCircle } from 'lucide-react';
import { useBookmarks } from '../context/BookmarksContext';

interface MobileNavProps {
  currentPage: string;
  onNavigate: (page: string, params?: any) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentPage, onNavigate }) => {
  const { bookmarks } = useBookmarks();

  const items = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'quran', label: 'Quran', icon: BookOpen },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'khatam', label: 'Khatam', icon: CheckCircle },
    {
      id: 'bookmarks',
      label: 'Saved',
      icon: Bookmark,
      badge: bookmarks?.length > 0 ? bookmarks.length : undefined,
    },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#fcfaf6]/95 dark:bg-[#0c1412]/95 backdrop-blur-xl border-t border-emerald-900/10 dark:border-emerald-800/30 px-1 sm:px-2 py-1 pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
      id="mobile-bottom-nav"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.id === 'bookmarks'
              ? currentPage === 'bookmarks' || currentPage === 'reflections'
              : currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`relative flex flex-col items-center justify-center flex-1 min-w-0 max-w-[64px] py-1 px-0.5 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-amber-600 dark:text-amber-400 font-bold scale-105'
                  : 'text-stone-500 dark:text-stone-400 hover:text-emerald-900 dark:hover:text-emerald-200'
              }`}
              id={`mobilenav-${item.id}`}
            >
              <div className="relative">
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'stroke-[2.4]' : 'stroke-2'}`} />
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-amber-500 text-stone-900 text-[9px] font-bold flex items-center justify-center shadow-xs">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] sm:text-[11px] mt-0.5 truncate max-w-full text-center leading-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
