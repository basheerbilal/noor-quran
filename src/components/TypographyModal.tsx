import React from 'react';
import { X, Check, RotateCcw } from 'lucide-react';
import { useQuranSettings } from '../context/QuranSettingsContext';
import { TranslationSelector } from './TranslationSelector';

interface TypographyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TypographyModal: React.FC<TypographyModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, resetSettings } = useQuranSettings();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#fcfaf6] dark:bg-[#0f1715] border border-emerald-900/15 dark:border-emerald-800/30 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-900/10 dark:border-emerald-800/20">
          <div>
            <h3 className="font-semibold text-emerald-950 dark:text-emerald-50 text-base">
              Reading Typography & Display
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Customize your Sacred Reading experience
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-emerald-900/5 dark:hover:bg-emerald-800/20 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Arabic Font Size */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-stone-700 dark:text-stone-300">Arabic Script Size</span>
              <span className="font-mono text-amber-600 dark:text-amber-400 font-semibold">
                {settings.arabicFontSize}px
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-stone-400">A</span>
              <input
                type="range"
                min={24}
                max={64}
                step={2}
                value={settings.arabicFontSize}
                onChange={(e) => updateSettings({ arabicFontSize: Number(e.target.value) })}
                className="flex-1 h-2 bg-emerald-950/10 dark:bg-emerald-800/30 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <span className="text-base font-bold text-stone-600 dark:text-stone-300">A</span>
            </div>
            {/* Arabic Script Preview */}
            <div className="mt-2 p-4 rounded-xl bg-emerald-950/5 dark:bg-emerald-950/30 border border-emerald-900/10 dark:border-emerald-800/20 text-center">
              <p
                dir="rtl"
                className={settings.arabicFont === 'amiri' ? 'font-quran-amiri' : 'font-quran-scheherazade'}
                style={{ fontSize: `${settings.arabicFontSize}px`, lineHeight: settings.lineHeight }}
              >
                بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
              </p>
            </div>
          </div>

          {/* Translation Font Size */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-stone-700 dark:text-stone-300">Translation Size</span>
              <span className="font-mono text-amber-600 dark:text-amber-400 font-semibold">
                {settings.translationFontSize}px
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-stone-400">a</span>
              <input
                type="range"
                min={14}
                max={24}
                step={1}
                value={settings.translationFontSize}
                onChange={(e) => updateSettings({ translationFontSize: Number(e.target.value) })}
                className="flex-1 h-2 bg-emerald-950/10 dark:bg-emerald-800/30 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <span className="text-base font-bold text-stone-600 dark:text-stone-300">A</span>
            </div>
          </div>

          {/* Arabic Font Choice */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-stone-700 dark:text-stone-300">
              Arabic Script Style
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateSettings({ arabicFont: 'amiri' })}
                className={`p-3 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                  settings.arabicFont === 'amiri'
                    ? 'border-amber-500 bg-amber-500/10 text-emerald-900 dark:text-amber-200'
                    : 'border-emerald-900/10 dark:border-emerald-800/30 hover:bg-emerald-950/5'
                }`}
              >
                <span className="block font-semibold">Amiri Calligraphy</span>
                <span className="text-xs text-stone-500">Classic Naskh</span>
              </button>

              <button
                type="button"
                onClick={() => updateSettings({ arabicFont: 'scheherazade' })}
                className={`p-3 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                  settings.arabicFont === 'scheherazade'
                    ? 'border-amber-500 bg-amber-500/10 text-emerald-900 dark:text-amber-200'
                    : 'border-emerald-900/10 dark:border-emerald-800/30 hover:bg-emerald-950/5'
                }`}
              >
                <span className="block font-semibold">Scheherazade New</span>
                <span className="text-xs text-stone-500">Traditional Script</span>
              </button>
            </div>
          </div>

          {/* Theme Selection */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-stone-700 dark:text-stone-300">
              Color Theme
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  id: 'mushaf',
                  label: 'Royal Mushaf',
                  sub: 'Parchment & Gold',
                  badge: 'AlQuran',
                },
                { id: 'light', label: 'Emerald Light', sub: 'Clean Day', badge: '' },
                { id: 'dark', label: 'Dark Night', sub: 'Eye-Safe', badge: '' },
              ].map((th) => (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => updateSettings({ theme: th.id as any })}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    settings.theme === th.id
                      ? th.id === 'mushaf'
                        ? 'border-[#caa352] bg-[#f5eccd] text-[#1c1b18] ring-1 ring-[#caa352]'
                        : 'border-amber-500 bg-amber-500/10 text-emerald-950 dark:text-amber-200 font-semibold ring-1 ring-amber-500/50'
                      : 'border-emerald-900/10 dark:border-emerald-800/30 text-stone-600 dark:text-stone-400 hover:bg-emerald-950/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">{th.label}</span>
                    {th.badge && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-[#15366c] text-amber-200 font-sans">
                        {th.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 block mt-0.5">
                    {th.sub}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Display Mode */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-stone-700 dark:text-stone-300">
              View Layout
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'both', label: 'Arabic & Translation' },
                { id: 'arabic', label: 'Arabic Only' },
                { id: 'translation', label: 'Translation Only' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => updateSettings({ displayMode: m.id as any })}
                  className={`p-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer text-center ${
                    settings.displayMode === m.id
                      ? 'border-amber-500 bg-amber-500/10 text-emerald-950 dark:text-amber-200 font-semibold'
                      : 'border-emerald-900/10 dark:border-emerald-800/30 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Translation Selection & Urdu Tarjumah */}
          <TranslationSelector variant="full" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-emerald-900/10 dark:border-emerald-800/20 bg-emerald-950/5 dark:bg-emerald-950/20">
          <button
            onClick={resetSettings}
            className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-medium text-sm cursor-pointer shadow-sm transition-colors"
          >
            <Check className="w-4 h-4" />
            Apply Settings
          </button>
        </div>
      </div>
    </div>
  );
};
