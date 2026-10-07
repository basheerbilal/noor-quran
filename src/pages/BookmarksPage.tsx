import React, { useState, useMemo } from 'react';
import {
  Bookmark,
  Trash2,
  ExternalLink,
  Copy,
  Share2,
  Check,
  Calendar,
  Sparkles,
  PenLine,
  Search,
  BookOpen,
  Quote,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Bookmark as BookmarkType } from '../types';
import { useBookmarks } from '../context/BookmarksContext';
import { copyToClipboard, shareAyah } from '../utils/quranUtils';
import { VerseNoteModal } from '../components/VerseNoteModal';

interface BookmarksPageProps {
  onOpenAyah: (surahNumber: number, ayahNumber: number) => void;
  onExploreQuran: () => void;
  initialTab?: 'bookmarks' | 'reflections';
}

export const BookmarksPage: React.FC<BookmarksPageProps> = ({
  onOpenAyah,
  onExploreQuran,
  initialTab = 'bookmarks',
}) => {
  const {
    bookmarks,
    reflections,
    removeBookmark,
    deleteNote,
    clearAllBookmarks,
  } = useBookmarks();

  const [activeTab, setActiveTab] = useState<'bookmarks' | 'reflections'>(initialTab);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [reflectionSearch, setReflectionSearch] = useState('');
  const [expandedVerseIds, setExpandedVerseIds] = useState<Record<string, boolean>>({});

  // Modal state for editing notes
  const [noteModalTarget, setNoteModalTarget] = useState<BookmarkType | null>(null);

  const toggleVerseExpand = (id: string) => {
    setExpandedVerseIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCopy = async (b: BookmarkType) => {
    const textToCopy = `${b.note ? `My Reflection:\n"${b.note}"\n\n` : ''}${
      b.text ? `${b.text}\n\n` : ''
    }${b.translationText ? `"${b.translationText}"\n\n` : ''}— Surah ${
      b.surahEnglishName
    } (${b.surahNumber}:${b.ayahNumber})`;

    const success = await copyToClipboard(textToCopy);
    if (success) {
      setCopiedId(b.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleShare = async (b: BookmarkType) => {
    await shareAyah({
      surahName: b.surahEnglishName,
      surahNumber: b.surahNumber,
      ayahNumber: b.ayahNumber,
      arabicText: b.text || '',
      translationText: b.note
        ? `Reflection: "${b.note}"\n\nTranslation: "${b.translationText || ''}"`
        : b.translationText,
    });
  };

  const formatDate = (ts?: number) => {
    if (!ts) return 'Recently';
    try {
      return new Date(ts).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recently';
    }
  };

  const formatDateTime = (ts?: number) => {
    if (!ts) return 'Recently';
    try {
      return new Date(ts).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Recently';
    }
  };

  // Filtered reflections
  const filteredReflections = useMemo(() => {
    const query = reflectionSearch.trim().toLowerCase();
    if (!query) return reflections;
    return reflections.filter((r) => {
      const matchNote = r.note?.toLowerCase().includes(query);
      const matchSurah = r.surahEnglishName.toLowerCase().includes(query);
      const matchNumber = `${r.surahNumber}:${r.ayahNumber}`.includes(query);
      const matchTranslation = r.translationText?.toLowerCase().includes(query);
      return matchNote || matchSurah || matchNumber || matchTranslation;
    });
  }, [reflections, reflectionSearch]);

  return (
    <div className="max-w-4xl mx-auto px-4 pb-20 pt-2 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-900/10 dark:border-emerald-800/20 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-950 dark:text-emerald-50 font-['Cinzel',serif]">
            {activeTab === 'reflections' ? 'My Reflections' : 'Your Bookmarks'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            {activeTab === 'reflections'
              ? 'Personal spiritual thoughts, insights, and prayers attached to verses of the Holy Quran.'
              : 'Verses and sacred reflections saved for your continuous contemplation.'}
          </p>
        </div>

        {/* Tab Switcher Pills */}
        <div className="inline-flex p-1 rounded-2xl bg-emerald-900/5 dark:bg-emerald-900/30 border border-emerald-900/10 dark:border-emerald-800/20 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('bookmarks')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'bookmarks'
                ? 'bg-emerald-800 text-amber-200 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-emerald-900 dark:hover:text-emerald-200'
            }`}
            id="tab-btn-bookmarks"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Bookmarks</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'bookmarks'
                  ? 'bg-amber-400/20 text-amber-200'
                  : 'bg-emerald-900/10 dark:bg-emerald-800/30 text-stone-600 dark:text-stone-300'
              }`}
            >
              {bookmarks.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reflections')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'reflections'
                ? 'bg-emerald-800 text-amber-200 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-emerald-900 dark:hover:text-emerald-200'
            }`}
            id="tab-btn-reflections"
          >
            <PenLine className="w-3.5 h-3.5" />
            <span>My Reflections</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'reflections'
                  ? 'bg-amber-400/20 text-amber-200'
                  : 'bg-emerald-900/10 dark:bg-emerald-800/30 text-stone-600 dark:text-stone-300'
              }`}
            >
              {reflections.length}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* REFLECTIONS TAB VIEW                                                      */}
      {/* ========================================================================= */}
      {activeTab === 'reflections' && (
        <div className="space-y-5">
          {/* Search bar inside Reflections */}
          {reflections.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={reflectionSearch}
                onChange={(e) => setReflectionSearch(e.target.value)}
                placeholder="Search reflections, surahs, or verse numbers..."
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-2xl bg-[#fcfaf6] dark:bg-[#0c1412] border border-emerald-900/10 dark:border-emerald-800/20 focus:outline-none focus:ring-2 focus:ring-amber-400/30 text-stone-900 dark:text-stone-100 placeholder-stone-400"
                id="search-reflections-input"
              />
            </div>
          )}

          {/* Empty State for Reflections */}
          {reflections.length === 0 ? (
            <div className="py-16 text-center rounded-3xl bg-emerald-950/5 dark:bg-emerald-950/20 border border-emerald-900/10 dark:border-emerald-800/20 space-y-4 max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                <PenLine className="w-7 h-7" />
              </div>
              <div className="space-y-1.5 px-4">
                <h3 className="text-lg font-bold text-emerald-950 dark:text-emerald-50">
                  No personal reflections yet
                </h3>
                <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-sm mx-auto leading-relaxed">
                  Deepen your connection with the divine revelation. While reading any Surah, click the reflection icon (<PenLine className="w-3.5 h-3.5 inline text-amber-600 dark:text-amber-400 mx-0.5" />) on any verse to attach your thoughts, lessons, and personal prayers.
                </p>
              </div>
              <button
                type="button"
                onClick={onExploreQuran}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-amber-200 font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Explore Surahs to Reflect</span>
              </button>
            </div>
          ) : filteredReflections.length === 0 ? (
            <div className="py-12 text-center text-stone-500 dark:text-stone-400 text-sm">
              No reflections matching "{reflectionSearch}".
            </div>
          ) : (
            /* Reflections List */
            <div className="space-y-4">
              {filteredReflections.map((r) => {
                const isExpanded = Boolean(expandedVerseIds[r.id]);
                const updatedAt = r.noteUpdatedAt || r.timestamp;

                return (
                  <div
                    key={r.id}
                    className="p-5 sm:p-6 rounded-3xl bg-[#fcfaf6] dark:bg-[#0c1412] border border-amber-500/20 dark:border-amber-500/30 hover:border-amber-500/40 transition-all space-y-4 shadow-xs"
                    id={`reflection-card-${r.id}`}
                  >
                    {/* Header: Surah, Reference, Date */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300 text-xs font-bold font-mono border border-amber-500/20">
                          {r.surahNumber}:{r.ayahNumber}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm sm:text-base text-emerald-950 dark:text-emerald-50">
                              Surah {r.surahEnglishName}
                            </h4>
                            <span
                              dir="rtl"
                              className="font-quran-amiri text-sm font-bold text-emerald-900 dark:text-amber-300"
                            >
                              {r.surahName}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-stone-400 mt-0.5">
                            <Clock className="w-3 h-3 text-amber-600/70 dark:text-amber-400/70" />
                            <span>Updated {formatDateTime(updatedAt)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setNoteModalTarget(r)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-900/5 dark:bg-emerald-900/30 text-emerald-900 dark:text-amber-200 border border-emerald-900/10 dark:border-emerald-800/20 hover:bg-emerald-900/10 transition-colors cursor-pointer"
                          title="Edit your reflection note"
                        >
                          <PenLine className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          <span>Edit Note</span>
                        </button>
                      </div>
                    </div>

                    {/* Personal Reflection Quote Box */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-stone-800 dark:text-stone-200 space-y-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                        <Quote className="w-3 h-3 fill-current" />
                        <span>My Reflection & Takeaway (تدبر)</span>
                      </div>
                      <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-sans">
                        {r.note}
                      </p>
                    </div>

                    {/* Collapsible Sacred Verse Context */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => toggleVerseExpand(r.id)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-emerald-900 dark:hover:text-amber-300 transition-colors cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{isExpanded ? 'Hide Quranic Verse' : 'View Quranic Verse'}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="mt-3 p-4 rounded-2xl bg-emerald-950/5 dark:bg-emerald-950/25 border border-emerald-900/10 dark:border-emerald-800/20 space-y-3 animate-in fade-in duration-150">
                          {r.text && (
                            <div dir="rtl">
                              <p className="font-quran-amiri text-xl sm:text-2xl text-right text-emerald-950 dark:text-emerald-50 leading-[2.2]">
                                {r.text}
                              </p>
                            </div>
                          )}
                          {r.translationText && (
                            <div className="pt-2 border-t border-emerald-900/10 dark:border-emerald-800/15">
                              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 italic leading-relaxed">
                                "{r.translationText}"
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-emerald-900/10 dark:border-emerald-800/20">
                      <button
                        type="button"
                        onClick={() => onOpenAyah(r.surahNumber, r.ayahNumber)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                      >
                        <span>Open in Reader</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleCopy(r)}
                          title="Copy Reflection & Verse"
                          className="p-1.5 rounded-lg text-stone-400 hover:text-emerald-900 dark:hover:text-emerald-200 transition-colors cursor-pointer"
                        >
                          {copiedId === r.id ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleShare(r)}
                          title="Share Reflection"
                          className="p-1.5 rounded-lg text-stone-400 hover:text-emerald-900 dark:hover:text-emerald-200 transition-colors cursor-pointer"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('Delete this reflection note?')) {
                              deleteNote(r.surahNumber, r.ayahNumber);
                            }
                          }}
                          title="Delete Reflection"
                          className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* ========================================================================= */}
      {/* BOOKMARKS TAB VIEW                                                        */}
      {/* ========================================================================= */}
      {activeTab === 'bookmarks' && (
        <div className="space-y-5">
          {bookmarks.length > 0 && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all bookmarks?')) {
                    clearAllBookmarks();
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Bookmarks</span>
              </button>
            </div>
          )}

          {bookmarks.length === 0 ? (
            <div className="py-16 text-center rounded-3xl bg-emerald-950/5 dark:bg-emerald-950/20 border border-emerald-900/10 dark:border-emerald-800/20 space-y-4 max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                <Bookmark className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-emerald-950 dark:text-emerald-50">
                  No bookmarks yet
                </h3>
                <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-xs mx-auto">
                  Save an Ayah to return to it later. While reading any Surah, click the bookmark icon next to any verse.
                </p>
              </div>
              <button
                type="button"
                onClick={onExploreQuran}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-amber-200 font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Explore Quran</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookmarks.map((b) => {
                const hasNote = Boolean(b.note && b.note.trim().length > 0);

                return (
                  <div
                    key={b.id}
                    className="p-5 sm:p-6 rounded-3xl bg-[#fcfaf6] dark:bg-[#0c1412] border border-emerald-900/10 dark:border-emerald-800/20 hover:border-amber-400/30 transition-all space-y-4 shadow-xs"
                  >
                    {/* Reference Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-900/10 dark:bg-emerald-800/30 text-emerald-950 dark:text-emerald-200 text-xs font-bold font-mono">
                          {b.surahNumber}:{b.ayahNumber}
                        </span>
                        <div>
                          <h4 className="font-semibold text-sm sm:text-base text-emerald-950 dark:text-emerald-50">
                            Surah {b.surahEnglishName}
                          </h4>
                          <div className="flex items-center gap-1.5 text-[11px] text-stone-400 mt-0.5">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(b.timestamp)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          dir="rtl"
                          className="font-quran-amiri text-lg font-bold text-emerald-900 dark:text-amber-200"
                        >
                          {b.surahName}
                        </span>
                      </div>
                    </div>

                    {/* Arabic text */}
                    {b.text && (
                      <div dir="rtl" className="py-1">
                        <p className="font-quran-amiri text-xl sm:text-2xl text-right text-emerald-950 dark:text-emerald-50 leading-[2.2]">
                          {b.text}
                        </p>
                      </div>
                    )}

                    {/* Translation text */}
                    {b.translationText && (
                      <div
                        dir="ltr"
                        className="pt-2 border-t border-emerald-900/5 dark:border-emerald-800/10"
                      >
                        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed italic">
                          "{b.translationText}"
                        </p>
                      </div>
                    )}

                    {/* Attached Note Preview if exists */}
                    {hasNote && (
                      <div className="p-3.5 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-xs text-stone-700 dark:text-stone-300 space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-bold text-amber-700 dark:text-amber-300">
                          <span className="flex items-center gap-1">
                            <PenLine className="w-3 h-3" />
                            Attached Reflection
                          </span>
                          <button
                            type="button"
                            onClick={() => setNoteModalTarget(b)}
                            className="hover:underline cursor-pointer"
                          >
                            Edit
                          </button>
                        </div>
                        <p className="line-clamp-2 leading-relaxed">{b.note}</p>
                      </div>
                    )}

                    {/* Actions Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-emerald-900/10 dark:border-emerald-800/20">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => onOpenAyah(b.surahNumber, b.ayahNumber)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                        >
                          <span>Open in Reader</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setNoteModalTarget(b)}
                          className="flex items-center gap-1 text-xs text-stone-500 hover:text-amber-600 dark:hover:text-amber-300 transition-colors cursor-pointer"
                        >
                          <PenLine className="w-3.5 h-3.5" />
                          <span>{hasNote ? 'Edit Note' : 'Add Note'}</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleCopy(b)}
                          title="Copy"
                          className="p-1.5 rounded-lg text-stone-400 hover:text-emerald-900 dark:hover:text-emerald-200 transition-colors cursor-pointer"
                        >
                          {copiedId === b.id ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleShare(b)}
                          title="Share"
                          className="p-1.5 rounded-lg text-stone-400 hover:text-emerald-900 dark:hover:text-emerald-200 transition-colors cursor-pointer"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => removeBookmark(b.id)}
                          title="Remove Bookmark"
                          className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Note Editing Modal when clicked from either tab */}
      {noteModalTarget && (
        <VerseNoteModal
          isOpen={Boolean(noteModalTarget)}
          onClose={() => setNoteModalTarget(null)}
          surahNumber={noteModalTarget.surahNumber}
          ayahNumber={noteModalTarget.ayahNumber}
          surahName={noteModalTarget.surahName}
          surahEnglishName={noteModalTarget.surahEnglishName}
          arabicText={noteModalTarget.text}
          translationText={noteModalTarget.translationText}
          globalAyahNumber={noteModalTarget.globalAyahNumber}
        />
      )}
    </div>
  );
};
