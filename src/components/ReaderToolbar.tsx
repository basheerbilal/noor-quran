import React, { useState } from 'react';
import {
  Minus,
  Plus,
  Type,
  Sun,
  Moon,
  SlidersHorizontal,
  Bookmark,
  Languages,
  Sparkles,
} from 'lucide-react';
import { useQuranSettings } from '../context/QuranSettingsContext';

interface ReaderToolbarProps {
  onOpenSettingsModal: () => void;
  onOpenBookmarks?: () => void;
}

export const ReaderToolbar: React.FC<ReaderToolbarProps> = ({
  onOpenSettingsModal,
  onOpenBookmarks,
}) => {
  const { settings, updateSettings, toggleTheme } = useQuranSettings();
  const [showQuickSlider, setShowQuickSlider] = useState(false);

  const increaseFont = () => {
    updateSettings({
      arabicFontSize: Math.min(64, settings.arabicFontSize + 2),
      translationFontSize: Math.min(24, settings.translationFontSize + 1),
    });
  };

  const decreaseFont = () => {
    updateSettings({
      arabicFontSize: Math.max(24, settings.arabicFontSize - 2),
      translationFontSize: Math.max(14, settings.translationFontSize - 1),
    });
  };

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-8 z-30 flex flex-col items-end gap-2 select-none">
      {/* Expanded Quick Sliders Card */}
      {showQuickSlider && (
        <div className="p-4 rounded-2xl bg-[#fcfaf6]/95 dark:bg-[#0c1412]/95 backdrop-blur-xl border border-emerald-900/15 dark:border-emerald-800/30 shadow-xl w-64 space-y-3 mb-1 animate-fadeIn">
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-stone-600 dark:text-stone-300">
              <span>Arabic Font Size</span>
              <span className="font-mono text-amber-500 font-semibold">{settings.arabicFontSize}px</span>
            </div>
            <input
              type="range"
              min={24}
              max={64}
              step={2}
              value={settings.arabicFontSize}
              onChange={(e) => updateSettings({ arabicFontSize: Number(e.target.value) })}
              className="w-full h-1.5 bg-emerald-950/20 dark:bg-emerald-800/40 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-stone-600 dark:text-stone-300">
              <span>Translation Size</span>
              <span className="font-mono text-amber-500 font-semibold">{settings.translationFontSize}px</span>
            </div>
            <input
              type="range"
              min={14}
              max={24}
              step={1}
              value={settings.translationFontSize}
              onChange={(e) => updateSettings({ translationFontSize: Number(e.target.value) })}
              className="w-full h-1.5 bg-emerald-950/20 dark:bg-emerald-800/40 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>
        </div>
      )}

      {/* Floating Pill Toolbar */}
      <div
        className={`flex items-center gap-1 p-1.5 rounded-full backdrop-blur-xl border shadow-xl ${
          settings.theme === 'mushaf'
            ? 'bg-[#faf5e8]/95 border-[#caa352]/60 text-[#2b2824]'
            : 'bg-[#fcfaf6]/95 dark:bg-[#0c1412]/95 border-emerald-900/15 dark:border-emerald-800/30 text-stone-700 dark:text-stone-200'
        }`}
      >
        {/* A- */}
        <button
          onClick={decreaseFont}
          title="Decrease font size"
          className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-xs font-semibold cursor-pointer transition-colors"
          aria-label="Decrease font size"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        {/* Aa quick slider toggle */}
        <button
          onClick={() => setShowQuickSlider(!showQuickSlider)}
          title="Adjust Font Size"
          className={`px-2.5 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
            showQuickSlider
              ? settings.theme === 'mushaf'
                ? 'bg-[#15366c] text-amber-100'
                : 'bg-amber-500 text-stone-950'
              : 'hover:bg-black/5 dark:hover:bg-white/5'
          }`}
          aria-label="Font size slider"
        >
          Aa
        </button>

        {/* A+ */}
        <button
          onClick={increaseFont}
          title="Increase font size"
          className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-xs font-semibold cursor-pointer transition-colors"
          aria-label="Increase font size"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-black/10 dark:bg-white/10 mx-0.5" />

        {/* Theme Toggle (Royal Mushaf -> Dark -> Light) */}
        <button
          onClick={toggleTheme}
          title={`Theme: ${
            settings.theme === 'mushaf'
              ? 'Royal Mushaf'
              : settings.theme === 'dark'
              ? 'Dark Night'
              : 'Light'
          }`}
          className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
          aria-label="Toggle theme"
        >
          {settings.theme === 'mushaf' ? (
            <Sparkles className="w-4 h-4 text-[#a1771c]" />
          ) : settings.theme === 'dark' ? (
            <Moon className="w-4 h-4 text-amber-300" />
          ) : (
            <Sun className="w-4 h-4 text-amber-600" />
          )}
        </button>

        {/* Translation / Script Settings */}
        <button
          onClick={onOpenSettingsModal}
          title="Reading Settings & Translations"
          className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors text-amber-600 dark:text-amber-400"
          aria-label="Settings"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>

        {/* Bookmarks view */}
        {onOpenBookmarks && (
          <button
            onClick={onOpenBookmarks}
            title="Bookmarks"
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
            aria-label="Open bookmarks"
          >
            <Bookmark className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
