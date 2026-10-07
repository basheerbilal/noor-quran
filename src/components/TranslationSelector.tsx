import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Check,
  Search,
  Globe,
  Sparkles,
  Info,
  ChevronDown,
  RotateCcw,
  Languages,
} from 'lucide-react';
import { Edition } from '../types';
import {
  getUrduTranslations,
  getPopularTranslations,
  getUrduMetadata,
  KNOWN_URDU_EDITIONS,
  UrduEditionMetadata,
} from '../api/editionApi';
import { useQuranSettings } from '../context/QuranSettingsContext';
import { isUrduTranslation } from '../utils/quranUtils';

export interface TranslationSelectorProps {
  value?: string;
  onChange?: (editionIdentifier: string) => void;
  variant?: 'full' | 'cards' | 'dropdown';
  showPreview?: boolean;
  className?: string;
  label?: string;
}

export const TranslationSelector: React.FC<TranslationSelectorProps> = ({
  value,
  onChange,
  variant = 'full',
  showPreview = true,
  className = '',
  label,
}) => {
  const { settings, updateSettings } = useQuranSettings();
  const activeEdition = value ?? settings.translationEdition;

  const handleSelect = (editionId: string) => {
    if (onChange) {
      onChange(editionId);
    } else {
      updateSettings({ translationEdition: editionId });
    }
  };

  const [urduTranslations, setUrduTranslations] = useState<Edition[]>([]);
  const [allTranslations, setAllTranslations] = useState<Edition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'urdu' | 'english' | 'all'>('urdu');
  const [previewVerseIndex, setPreviewVerseIndex] = useState<0 | 1>(0);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([getUrduTranslations(), getPopularTranslations()])
      .then(([urdu, popular]) => {
        if (!isMounted) return;
        setUrduTranslations(urdu);
        setAllTranslations(popular);
      })
      .catch((err) => {
        console.error('Failed to load translations in TranslationSelector', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const isCurrentUrdu = isUrduTranslation(activeEdition);
  const currentUrduMeta = getUrduMetadata(activeEdition);

  // Filtered lists based on search query
  const filteredUrdu = useMemo(() => {
    if (!searchQuery.trim()) return urduTranslations;
    const q = searchQuery.toLowerCase();
    return urduTranslations.filter((ed) => {
      const meta = getUrduMetadata(ed.identifier);
      return (
        ed.name.toLowerCase().includes(q) ||
        ed.englishName.toLowerCase().includes(q) ||
        ed.identifier.toLowerCase().includes(q) ||
        meta?.scholarEnglish.toLowerCase().includes(q) ||
        meta?.commentaryName?.toLowerCase().includes(q)
      );
    });
  }, [urduTranslations, searchQuery]);

  const filteredAll = useMemo(() => {
    if (!searchQuery.trim()) return allTranslations;
    const q = searchQuery.toLowerCase();
    return allTranslations.filter(
      (ed) =>
        ed.name.toLowerCase().includes(q) ||
        ed.englishName.toLowerCase().includes(q) ||
        ed.language.toLowerCase().includes(q) ||
        ed.identifier.toLowerCase().includes(q)
    );
  }, [allTranslations, searchQuery]);

  // Sample verse texts for preview
  const sampleAyahs = {
    bismillah: {
      ar: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
      urdu:
        currentUrduMeta?.sampleAyahText ||
        'شروع اللہ کا نام لے کر جو بڑا مہربان نہایت رحم والا ہے',
      en: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
    },
    verse2: {
      ar: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ',
      urdu: 'سب تعریفیں اللہ ہی کے لیے ہیں جو تمام جہانوں کا پالنے والا ہے',
      en: '[All] praise is [due] to Allah, Lord of the worlds.',
    },
  };

  // ----------------------------------------------------
  // Variant: DROPDOWN
  // ----------------------------------------------------
  if (variant === 'dropdown') {
    return (
      <div className={`relative flex items-center gap-2 ${className}`}>
        {label && (
          <label className="text-xs font-medium text-stone-700 dark:text-stone-300 whitespace-nowrap">
            {label}
          </label>
        )}
        <div className="relative flex-1">
          <select
            value={activeEdition}
            onChange={(e) => handleSelect(e.target.value)}
            className="w-full pl-3 pr-8 py-1.5 text-xs font-medium rounded-xl bg-emerald-950/5 dark:bg-emerald-950/30 border border-emerald-900/10 dark:border-emerald-800/30 text-emerald-950 dark:text-emerald-50 focus:outline-none focus:ring-2 focus:ring-amber-500/40 cursor-pointer appearance-none truncate"
            id="translation-dropdown-select"
          >
            <optgroup label="🇵🇰 اردو تراجم (Urdu Tarjumah)">
              {(urduTranslations.length > 0
                ? urduTranslations
                : Object.values(KNOWN_URDU_EDITIONS).map((m) => ({
                    identifier: m.identifier,
                    name: m.urduName,
                    englishName: m.scholarEnglish,
                    language: 'ur',
                    format: 'text' as const,
                    type: 'translation' as const,
                  }))
              ).map((ed) => {
                const meta = getUrduMetadata(ed.identifier);
                return (
                  <option key={ed.identifier} value={ed.identifier} className="dark:bg-stone-900">
                    اردو — {meta ? meta.urduName : ed.name} ({meta?.scholarEnglish || ed.englishName})
                  </option>
                );
              })}
            </optgroup>

            <optgroup label="English & International">
              {allTranslations
                .filter((t) => t.language !== 'ur')
                .map((ed) => (
                  <option key={ed.identifier} value={ed.identifier} className="dark:bg-stone-900">
                    {ed.language.toUpperCase()} — {ed.name} ({ed.englishName})
                  </option>
                ))}
            </optgroup>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
        </div>

        {/* Quick toggle pill if Urdu is active */}
        {isCurrentUrdu && (
          <span className="shrink-0 px-2 py-0.5 text-[10px] font-urdu rounded-md bg-emerald-800/10 dark:bg-emerald-700/30 text-emerald-800 dark:text-emerald-200 border border-emerald-800/30">
            اردو
          </span>
        )}
      </div>
    );
  }

  // ----------------------------------------------------
  // Variant: FULL & CARDS
  // ----------------------------------------------------
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-50">
            {label || 'Quran Translation Edition'}
          </h3>
          {isCurrentUrdu && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium font-urdu bg-emerald-800/15 dark:bg-emerald-700/30 text-emerald-800 dark:text-emerald-200 border border-emerald-800/30">
              اردو ترجمہ فعال ہے
            </span>
          )}
        </div>

        {/* Tabs: Urdu vs English vs All */}
        <div className="flex items-center p-1 rounded-xl bg-emerald-950/5 dark:bg-emerald-950/30 border border-emerald-900/10 dark:border-emerald-800/20 text-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setSelectedTab('urdu')}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedTab === 'urdu'
                ? 'bg-emerald-800 text-amber-200 shadow-xs font-semibold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <span className="font-urdu text-xs">اردو تراجم</span>
            <span className="text-[10px] opacity-80">({urduTranslations.length || 8})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedTab('english')}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              selectedTab === 'english'
                ? 'bg-emerald-800 text-amber-200 shadow-xs font-semibold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            English
          </button>

          <button
            type="button"
            onClick={() => setSelectedTab('all')}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1 ${
              selectedTab === 'all'
                ? 'bg-emerald-800 text-amber-200 shadow-xs font-semibold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Globe className="w-3 h-3" />
            <span>All Editions</span>
          </button>
        </div>
      </div>

      {/* Primary Language Quick Selector Banner */}
      <div className="p-3 rounded-2xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/25 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <Languages className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <div>
            <div className="text-xs font-bold text-emerald-950 dark:text-emerald-100 flex items-center gap-1.5">
              <span>Primary Translation:</span>
              <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                isCurrentUrdu
                  ? 'bg-emerald-800 text-amber-200 font-urdu'
                  : 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
              }`}>
                {isCurrentUrdu ? 'اردو (Urdu)' : 'English / Other'}
              </span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              {isCurrentUrdu
                ? `منتخب مترجم: ${currentUrduMeta?.urduName || activeEdition}`
                : 'Switch quickly to authentic Urdu scholars below'}
            </p>
          </div>
        </div>

        {/* Quick Scholar Selection Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => handleSelect('ur.maududi')}
            className={`px-2.5 py-1 rounded-xl text-xs font-urdu transition-all cursor-pointer ${
              activeEdition === 'ur.maududi'
                ? 'bg-emerald-800 text-amber-200 shadow-xs font-bold ring-1 ring-amber-400/50'
                : 'bg-white/80 dark:bg-stone-900 border border-emerald-900/10 dark:border-emerald-800/30 text-emerald-950 dark:text-emerald-100 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
            }`}
            title="سید ابوالاعلیٰ مودودی - تفہیم القرآن"
          >
            سید مودودی
          </button>

          <button
            type="button"
            onClick={() => handleSelect('ur.junagarhi')}
            className={`px-2.5 py-1 rounded-xl text-xs font-urdu transition-all cursor-pointer ${
              activeEdition === 'ur.junagarhi'
                ? 'bg-emerald-800 text-amber-200 shadow-xs font-bold ring-1 ring-amber-400/50'
                : 'bg-white/80 dark:bg-stone-900 border border-emerald-900/10 dark:border-emerald-800/30 text-emerald-950 dark:text-emerald-100 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
            }`}
            title="مولانا محمد جوناگڑھی - بیان القرآن و شاہ فہد کمپلیکس"
          >
            مولانا جوناگڑھی
          </button>

          <button
            type="button"
            onClick={() => handleSelect('ur.jalandhry')}
            className={`px-2.5 py-1 rounded-xl text-xs font-urdu transition-all cursor-pointer ${
              activeEdition === 'ur.jalandhry'
                ? 'bg-emerald-800 text-amber-200 shadow-xs font-bold ring-1 ring-amber-400/50'
                : 'bg-white/80 dark:bg-stone-900 border border-emerald-900/10 dark:border-emerald-800/30 text-emerald-950 dark:text-emerald-100 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
            }`}
            title="مولانا فتح محمد جالندھری - مقبول عام کلاسیکی ترجمہ"
          >
            مولانا جالندھری
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={
            selectedTab === 'urdu'
              ? 'مترجم یا تفسیر تلاش کریں (جالندھری، مودودی، جوناگڑھی، کنز الایمان...)'
              : 'Search translator, scholar or language...'
          }
          className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl bg-white dark:bg-[#0c1412] border border-emerald-900/10 dark:border-emerald-800/30 text-emerald-950 dark:text-emerald-50 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-8 text-center text-xs text-stone-500 space-y-2">
          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Loading translations from AlQuran Cloud API...</p>
        </div>
      )}

      {/* Tab: Urdu Translations Grid */}
      {!loading && selectedTab === 'urdu' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {filteredUrdu.map((ed) => {
              const isSelected = activeEdition === ed.identifier;
              const meta: UrduEditionMetadata | undefined = getUrduMetadata(ed.identifier);

              return (
                <button
                  key={ed.identifier}
                  type="button"
                  onClick={() => handleSelect(ed.identifier)}
                  className={`relative p-3.5 rounded-2xl border text-right transition-all cursor-pointer text-emerald-950 dark:text-emerald-50 ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500/15 dark:bg-amber-500/10 ring-2 ring-amber-500/40 shadow-xs'
                      : 'border-emerald-900/10 dark:border-emerald-800/25 bg-white/60 dark:bg-[#0c1412]/60 hover:bg-emerald-900/5 dark:hover:bg-emerald-950/40 hover:border-emerald-900/20'
                  }`}
                >
                  {/* Top Row: Selected Checkmark & Urdu Translator Name */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 pt-0.5">
                      {isSelected ? (
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-700 text-amber-200 text-xs shadow-xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      ) : (
                        <span className="w-5 h-5 rounded-full border border-stone-300 dark:border-stone-700" />
                      )}
                      {meta?.popular && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 font-medium">
                          مقبول عام
                        </span>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="font-urdu text-base font-bold text-emerald-950 dark:text-emerald-100 block leading-[1.8]">
                        {meta?.urduName || ed.name}
                      </span>
                    </div>
                  </div>

                  {/* Middle Row: Commentary Title & English Scholar Name */}
                  <div className="mt-1 flex items-center justify-between gap-2 text-left">
                    <span className="text-xs font-semibold text-stone-600 dark:text-stone-300 font-sans truncate">
                      {meta?.scholarEnglish || ed.englishName}
                    </span>
                    {meta?.commentaryName && (
                      <span className="font-urdu text-xs text-amber-700 dark:text-amber-300/90 shrink-0 text-right">
                        {meta.commentaryName}
                      </span>
                    )}
                  </div>

                  {/* Bottom Row: Scholarly description */}
                  {meta?.description && (
                    <p className="mt-1.5 text-[11px] text-stone-500 dark:text-stone-400 font-urdu text-right leading-relaxed border-t border-emerald-900/5 dark:border-emerald-800/15 pt-1.5">
                      {meta.description}
                    </p>
                  )}
                </button>
              );
            })}
          </div>

          {filteredUrdu.length === 0 && (
            <p className="text-center py-6 text-xs text-stone-500 font-urdu">
              کوئی اردو ترجمہ نہیں ملا۔ براہ کرم تلاش کا لفظ تبدیل کریں۔
            </p>
          )}
        </div>
      )}

      {/* Tab: English Translations */}
      {!loading && selectedTab === 'english' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {filteredAll
            .filter((t) => t.language === 'en')
            .map((ed) => {
              const isSelected = activeEdition === ed.identifier;
              return (
                <button
                  key={ed.identifier}
                  type="button"
                  onClick={() => handleSelect(ed.identifier)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500/15 dark:bg-amber-500/10 ring-2 ring-amber-500/40 shadow-xs'
                      : 'border-emerald-900/10 dark:border-emerald-800/25 bg-white/60 dark:bg-[#0c1412]/60 hover:bg-emerald-900/5 dark:hover:bg-emerald-950/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-950 dark:text-emerald-50">
                      {ed.name}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
                  </div>
                  <span className="text-xs text-stone-500 dark:text-stone-400 block mt-0.5">
                    {ed.englishName}
                  </span>
                  <span className="text-[10px] font-mono text-stone-400 mt-1 block">
                    {ed.identifier}
                  </span>
                </button>
              );
            })}
        </div>
      )}

      {/* Tab: All Editions / Search List */}
      {!loading && selectedTab === 'all' && (
        <div className="space-y-2">
          <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
            {filteredAll.map((ed) => {
              const isSelected = activeEdition === ed.identifier;
              const isUrdu = ed.language === 'ur';

              return (
                <button
                  key={ed.identifier}
                  type="button"
                  onClick={() => handleSelect(ed.identifier)}
                  className={`w-full p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-left ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500/15 dark:bg-amber-500/10 font-semibold'
                      : 'border-emerald-900/10 dark:border-emerald-800/20 hover:bg-emerald-950/5 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono uppercase ${
                        isUrdu
                          ? 'bg-emerald-800 text-amber-200 font-bold'
                          : 'bg-emerald-950/10 dark:bg-emerald-800/30 text-stone-600 dark:text-stone-300'
                      }`}
                    >
                      {isUrdu ? '🇵🇰 UR' : ed.language}
                    </span>
                    <div className="truncate">
                      <span className="text-xs font-semibold text-emerald-950 dark:text-emerald-50 block truncate">
                        {ed.name}
                      </span>
                      <span className="text-[11px] text-stone-500 truncate block">
                        {ed.englishName}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Live Verse Preview Section */}
      {showPreview && (
        <div className="p-4 rounded-2xl bg-emerald-950/5 dark:bg-emerald-950/30 border border-emerald-900/10 dark:border-emerald-800/25 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-medium text-stone-600 dark:text-stone-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Live Translation Preview</span>
            </div>

            {/* Switch preview verse */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPreviewVerseIndex(0)}
                className={`px-2 py-0.5 text-[10px] rounded-md transition-colors cursor-pointer ${
                  previewVerseIndex === 0
                    ? 'bg-emerald-800 text-amber-200 font-semibold'
                    : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                Bismillah
              </button>
              <button
                type="button"
                onClick={() => setPreviewVerseIndex(1)}
                className={`px-2 py-0.5 text-[10px] rounded-md transition-colors cursor-pointer ${
                  previewVerseIndex === 1
                    ? 'bg-emerald-800 text-amber-200 font-semibold'
                    : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                Al-Fatiha: 2
              </button>
            </div>
          </div>

          {/* Arabic Original */}
          <div className="text-center py-1">
            <p dir="rtl" className="font-quran-amiri text-lg sm:text-xl text-emerald-950 dark:text-amber-100 font-bold">
              {previewVerseIndex === 0 ? sampleAyahs.bismillah.ar : sampleAyahs.verse2.ar}
            </p>
          </div>

          {/* Active Translation Rendering */}
          <div
            dir={isCurrentUrdu ? 'rtl' : 'ltr'}
            className={`p-3 rounded-xl ${
              isCurrentUrdu
                ? 'bg-emerald-900/10 dark:bg-emerald-800/20 border border-emerald-800/20'
                : 'bg-white/80 dark:bg-black/20 border border-stone-200 dark:border-stone-800'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] text-stone-500 dark:text-stone-400 mb-1 font-sans">
              <span>
                {isCurrentUrdu
                  ? currentUrduMeta?.urduName || 'اردو ترجمہ'
                  : allTranslations.find((t) => t.identifier === activeEdition)?.englishName ||
                    activeEdition}
              </span>
              <span className="font-mono">{activeEdition}</span>
            </div>

            <p
              className={
                isCurrentUrdu
                  ? 'font-urdu text-base sm:text-lg text-emerald-950 dark:text-emerald-100 leading-[2.4] text-right font-medium'
                  : 'font-sans text-xs sm:text-sm text-stone-700 dark:text-stone-300 italic leading-relaxed'
              }
            >
              {isCurrentUrdu
                ? previewVerseIndex === 0
                  ? sampleAyahs.bismillah.urdu
                  : sampleAyahs.verse2.urdu
                : previewVerseIndex === 0
                ? sampleAyahs.bismillah.en
                : sampleAyahs.verse2.en}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
export default TranslationSelector;
