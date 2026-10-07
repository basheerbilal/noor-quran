import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  Moon,
  Sun,
  Laptop,
  RotateCcw,
  Check,
  Languages,
  Type,
  Trash2,
  Sparkles,
  Flame,
  Target,
  Bell,
  ChevronRight,
} from 'lucide-react';
import { useQuranSettings } from '../context/QuranSettingsContext';
import { useReadingGoal } from '../context/ReadingGoalContext';
import { PRESET_GOALS } from '../utils/readingGoalUtils';
import { TranslationSelector } from '../components/TranslationSelector';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, resetSettings } = useQuranSettings();
  const {
    dailyTarget,
    setDailyTarget,
    todayAyahsRead,
    todayProgressPercentage,
    currentStreak,
    longestStreak,
    isGoalMetToday,
    notificationsEnabled,
    toggleNotifications,
    openGoalModal,
    resetTodayProgress,
  } = useReadingGoal();
  const [savedNotice, setSavedNotice] = useState(false);

  const triggerSaveNotice = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 pb-24 pt-2 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-emerald-900/10 dark:border-emerald-800/20 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-950 dark:text-emerald-50 font-['Cinzel',serif]">
            Reading Preferences
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Personalize your Sacred Quran typography, translation, and display themes.
          </p>
        </div>

        {savedNotice && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-full animate-fadeIn">
            <Check className="w-3.5 h-3.5" />
            <span>Preferences Saved</span>
          </div>
        )}
      </div>

      {/* Section 1: Appearance & Theme */}
      <div className="p-6 rounded-3xl bg-[#fcfaf6] dark:bg-[#0c1412] border border-emerald-900/10 dark:border-emerald-800/20 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
          Appearance & Theme
        </h3>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Select your reading environment. Designed to reduce eye strain during prolonged contemplation.
        </p>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => {
              updateSettings({ theme: 'light' });
              triggerSaveNotice();
            }}
            className={`p-4 rounded-2xl border text-left flex items-center justify-between cursor-pointer transition-all ${
              settings.theme === 'light'
                ? 'border-amber-500 bg-amber-500/10 text-emerald-950 font-semibold shadow-xs'
                : 'border-emerald-900/10 dark:border-emerald-800/20 text-stone-600 hover:bg-emerald-950/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <Sun className="w-5 h-5 text-amber-600" />
              <div>
                <span className="block text-sm font-semibold">Warm Ivory</span>
                <span className="text-xs text-stone-500">Daytime Reflection</span>
              </div>
            </div>
            {settings.theme === 'light' && <Check className="w-4 h-4 text-amber-600" />}
          </button>

          <button
            onClick={() => {
              updateSettings({ theme: 'dark' });
              triggerSaveNotice();
            }}
            className={`p-4 rounded-2xl border text-left flex items-center justify-between cursor-pointer transition-all ${
              settings.theme === 'dark'
                ? 'border-amber-500 bg-amber-500/10 text-emerald-50 font-semibold shadow-xs'
                : 'border-emerald-900/10 dark:border-emerald-800/20 text-stone-400 hover:bg-emerald-950/20'
            }`}
          >
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-amber-400" />
              <div>
                <span className="block text-sm font-semibold">Emerald Night</span>
                <span className="text-xs text-stone-500">Nighttime Reading</span>
              </div>
            </div>
            {settings.theme === 'dark' && <Check className="w-4 h-4 text-amber-400" />}
          </button>
        </div>
      </div>

      {/* Section 2: Quranic Script & Typography */}
      <div className="p-6 rounded-3xl bg-[#fcfaf6] dark:bg-[#0c1412] border border-emerald-900/10 dark:border-emerald-800/20 space-y-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
          Quranic Script & Font Sizes
        </h3>

        {/* Arabic Font Size Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-stone-700 dark:text-stone-300">Arabic Script Size</span>
            <span className="font-mono text-amber-600 dark:text-amber-400">{settings.arabicFontSize}px</span>
          </div>
          <input
            type="range"
            min={24}
            max={64}
            step={2}
            value={settings.arabicFontSize}
            onChange={(e) => {
              updateSettings({ arabicFontSize: Number(e.target.value) });
              triggerSaveNotice();
            }}
            className="w-full h-2 bg-emerald-950/10 dark:bg-emerald-800/30 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>

        {/* Live Arabic Script Preview */}
        <div className="p-5 rounded-2xl bg-emerald-950/5 dark:bg-emerald-950/30 border border-emerald-900/10 dark:border-emerald-800/20 text-center">
          <p
            dir="rtl"
            className={settings.arabicFont === 'amiri' ? 'font-quran-amiri' : 'font-quran-scheherazade'}
            style={{ fontSize: `${settings.arabicFontSize}px`, lineHeight: settings.lineHeight }}
          >
            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </p>
        </div>

        {/* Translation Font Size */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-stone-700 dark:text-stone-300">Translation Font Size</span>
            <span className="font-mono text-amber-600 dark:text-amber-400">{settings.translationFontSize}px</span>
          </div>
          <input
            type="range"
            min={14}
            max={24}
            step={1}
            value={settings.translationFontSize}
            onChange={(e) => {
              updateSettings({ translationFontSize: Number(e.target.value) });
              triggerSaveNotice();
            }}
            className="w-full h-2 bg-emerald-950/10 dark:bg-emerald-800/30 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>

        {/* Script Type Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
            Arabic Calligraphic Style
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                updateSettings({ arabicFont: 'amiri' });
                triggerSaveNotice();
              }}
              className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                settings.arabicFont === 'amiri'
                  ? 'border-amber-500 bg-amber-500/10 text-emerald-950 dark:text-amber-200 font-semibold'
                  : 'border-emerald-900/10 dark:border-emerald-800/20 text-stone-600 dark:text-stone-400'
              }`}
            >
              <span className="block text-sm font-semibold">Amiri Calligraphy</span>
              <span className="text-xs text-stone-500">Standard Naskh Quranic Script</span>
            </button>

            <button
              onClick={() => {
                updateSettings({ arabicFont: 'scheherazade' });
                triggerSaveNotice();
              }}
              className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                settings.arabicFont === 'scheherazade'
                  ? 'border-amber-500 bg-amber-500/10 text-emerald-950 dark:text-amber-200 font-semibold'
                  : 'border-emerald-900/10 dark:border-emerald-800/20 text-stone-600 dark:text-stone-400'
              }`}
            >
              <span className="block text-sm font-semibold">Scheherazade New</span>
              <span className="text-xs text-stone-500">Traditional Classical Script</span>
            </button>
          </div>
        </div>

        {/* Display Mode */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
            Reading Layout
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'both', label: 'Arabic & Translation' },
              { id: 'arabic', label: 'Arabic Only' },
              { id: 'translation', label: 'Translation Only' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  updateSettings({ displayMode: m.id as any });
                  triggerSaveNotice();
                }}
                className={`p-3 rounded-xl border text-xs font-medium transition-all text-center cursor-pointer ${
                  settings.displayMode === m.id
                    ? 'border-amber-500 bg-amber-500/10 text-emerald-950 dark:text-amber-200 font-semibold'
                    : 'border-emerald-900/10 dark:border-emerald-800/20 text-stone-600 dark:text-stone-400'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Section 3: Translation & Audio Recitation */}
      <div className="p-6 rounded-3xl bg-[#fcfaf6] dark:bg-[#0c1412] border border-emerald-900/10 dark:border-emerald-800/20 space-y-6">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Translation Edition & Tarjumah
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Choose from renowned Urdu translations and major world language editions from the AlQuran Cloud API.
          </p>
        </div>

        {/* Modular Translation Selector Component */}
        <TranslationSelector
          variant="full"
          onChange={(id) => {
            updateSettings({ translationEdition: id });
            triggerSaveNotice();
          }}
        />

        {/* Reciter selector */}
        <div className="space-y-1.5 border-t border-emerald-900/10 dark:border-emerald-800/20 pt-4">
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
            Quran Reciter (Qari)
          </label>
          <select
            value={settings.reciterEdition}
            onChange={(e) => {
              updateSettings({ reciterEdition: e.target.value });
              triggerSaveNotice();
            }}
            className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-950/5 dark:bg-emerald-950/30 border border-emerald-900/10 dark:border-emerald-800/30 text-xs font-medium text-emerald-950 dark:text-emerald-50 focus:outline-none cursor-pointer"
          >
            <option value="ar.alafasy">Mishary Rashid Alafasy (Murattal)</option>
            <option value="ar.abdulbasitmurattal">Abdul Basit Abdul Samad (Murattal)</option>
            <option value="ar.hudhaify">Ali Al-Hudhaify</option>
            <option value="ar.husary">Mahmoud Khalil Al-Husary</option>
            <option value="ar.minshawi">Mohamed Siddiq El-Minshawi</option>
          </select>
        </div>
      </div>

      {/* Section 4: Daily Reading Goal & Habit Streaks */}
      <div className="p-6 rounded-3xl bg-[#fcfaf6] dark:bg-[#0c1412] border border-emerald-900/10 dark:border-emerald-800/20 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
              <h3 className="text-sm font-bold uppercase tracking-wider">
                Daily Quran Reading Goal & Streaks
              </h3>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Build a lifelong Quran habit with daily Ayah targets, streak tracking, and milestone notifications.
            </p>
          </div>
          <button
            onClick={openGoalModal}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-semibold text-xs transition-all cursor-pointer"
            id="settings-open-goal-dashboard-btn"
          >
            <span>Goal Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Current Goal and Streak Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-emerald-950/5 dark:bg-emerald-950/30 border border-emerald-900/10 dark:border-emerald-800/20 text-center">
            <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">Daily Target</span>
            <p className="text-xl font-extrabold text-emerald-950 dark:text-emerald-50 font-mono mt-0.5">
              {dailyTarget} <span className="text-xs font-normal">Ayahs</span>
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-950/5 dark:bg-emerald-950/30 border border-emerald-900/10 dark:border-emerald-800/20 text-center">
            <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">Today's Progress</span>
            <p className="text-xl font-extrabold text-emerald-950 dark:text-emerald-50 font-mono mt-0.5">
              {todayAyahsRead} <span className="text-xs font-bold text-amber-600">({todayProgressPercentage}%)</span>
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
            <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-200">Current Streak</span>
            <p className="text-xl font-extrabold text-amber-700 dark:text-amber-300 font-mono mt-0.5">
              {currentStreak} <span className="text-xs font-normal">Days</span>
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-950/5 dark:bg-emerald-950/30 border border-emerald-900/10 dark:border-emerald-800/20 text-center">
            <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">Longest Streak</span>
            <p className="text-xl font-extrabold text-emerald-950 dark:text-emerald-50 font-mono mt-0.5">
              {longestStreak} <span className="text-xs font-normal">Days</span>
            </p>
          </div>
        </div>

        {/* Goal Preset Selectors */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
            Select Daily Ayah Target
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PRESET_GOALS.map((preset) => {
              const isSelected = dailyTarget === preset.count;
              return (
                <button
                  key={preset.count}
                  type="button"
                  onClick={() => {
                    setDailyTarget(preset.count);
                    triggerSaveNotice();
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-amber-500/60 bg-amber-500/15 text-amber-900 dark:text-amber-100 ring-2 ring-amber-500/30'
                      : 'border-emerald-900/10 dark:border-emerald-800/20 bg-emerald-950/5 dark:bg-emerald-950/30 hover:bg-emerald-950/10 dark:hover:bg-emerald-950/50 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base font-extrabold font-mono">{preset.count}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
                  </div>
                  <div className="text-[11px] font-semibold mt-0.5">{preset.label}</div>
                  <div className="text-[10px] text-stone-500 dark:text-stone-400 truncate">{preset.time}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notification Toggle */}
        <div className="flex items-center justify-between pt-4 border-t border-emerald-900/10 dark:border-emerald-800/20">
          <div>
            <div className="text-xs font-semibold text-stone-800 dark:text-stone-200">
              Goal & Streak Progress Notifications
            </div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400">
              Receive gentle encouragement toasts at 50% halfway and 100% daily target completion.
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              toggleNotifications();
              triggerSaveNotice();
            }}
            className={`w-12 h-6.5 rounded-full transition-colors relative cursor-pointer ${
              notificationsEnabled ? 'bg-amber-600' : 'bg-stone-300 dark:bg-stone-700'
            }`}
            id="settings-notifications-toggle"
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform absolute top-0.75 ${
                notificationsEnabled ? 'right-1' : 'left-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Reset & Storage management */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-emerald-900/10 dark:border-emerald-800/20">
        <button
          onClick={() => {
            if (window.confirm('Reset all reading settings to defaults?')) {
              resetSettings();
              triggerSaveNotice();
            }
          }}
          className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All Defaults</span>
        </button>

        <p className="text-xs text-stone-400 text-center sm:text-right">
          NOOR Quran • Powered by AlQuran Cloud API
        </p>
      </div>
    </div>
  );
};
