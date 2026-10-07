import React, { useEffect, useState } from 'react';
import {
  X,
  PenLine,
  Save,
  Trash2,
  Check,
  Sparkles,
  Calendar,
  BookOpen,
  Quote,
  Lightbulb,
} from 'lucide-react';
import { useBookmarks } from '../context/BookmarksContext';
import { useQuranSettings } from '../context/QuranSettingsContext';

interface VerseNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  surahNumber: number;
  ayahNumber: number;
  surahName?: string;
  surahEnglishName?: string;
  arabicText?: string;
  translationText?: string;
  globalAyahNumber?: number;
}

const INSPIRATION_PROMPTS = [
  'What is Allah teaching me in this verse?',
  'A personal Dua inspired by this Ayah',
  'Gratitude (Shukr) for divine mercy',
  'A practical action I will take today',
];

export const VerseNoteModal: React.FC<VerseNoteModalProps> = ({
  isOpen,
  onClose,
  surahNumber,
  ayahNumber,
  surahName,
  surahEnglishName,
  arabicText,
  translationText,
  globalAyahNumber,
}) => {
  const { getBookmark, saveNote, deleteNote } = useBookmarks();
  const { settings } = useQuranSettings();
  const isMushafTheme = settings.theme === 'mushaf';

  const [noteText, setNoteText] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync state whenever modal opens or verse changes
  useEffect(() => {
    if (isOpen) {
      const bookmark = getBookmark(surahNumber, ayahNumber);
      setNoteText(bookmark?.note || '');
      setSavedSuccess(false);
      setIsDeleting(false);
    }
  }, [isOpen, surahNumber, ayahNumber, getBookmark]);

  if (!isOpen) return null;

  const currentBookmark = getBookmark(surahNumber, ayahNumber);
  const hasExistingNote = Boolean(currentBookmark?.note && currentBookmark.note.trim().length > 0);
  const noteUpdatedAt = currentBookmark?.noteUpdatedAt || currentBookmark?.timestamp;

  const handleSave = () => {
    saveNote(surahNumber, ayahNumber, noteText, {
      surahName: surahName || 'سورة',
      surahEnglishName: surahEnglishName || `Surah ${surahNumber}`,
      ayahNumber,
      globalAyahNumber: globalAyahNumber || 0,
      text: arabicText || '',
      translationText: translationText || '',
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  const handleDelete = () => {
    deleteNote(surahNumber, ayahNumber);
    setNoteText('');
    setIsDeleting(false);
    onClose();
  };

  const handleAddPrompt = (prompt: string) => {
    setNoteText((prev) => {
      const trimmed = prev.trim();
      const prefix = trimmed ? `${trimmed}\n\n• ${prompt}:\n` : `• ${prompt}:\n`;
      return prefix;
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/60 dark:bg-black/70 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      id="verse-note-modal-overlay"
    >
      <div
        className={`relative w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden transition-all ${
          isMushafTheme
            ? 'bg-[#faf5e8] border-2 border-[#caa352] text-[#1c1917]'
            : 'bg-[#fcfaf6] dark:bg-[#0c1412] border-emerald-900/20 dark:border-emerald-800/40 text-stone-900 dark:text-stone-100'
        }`}
        id="verse-note-modal-container"
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isMushafTheme
              ? 'border-[#caa352]/40 bg-[#f4ebd0]/80'
              : 'border-emerald-900/10 dark:border-emerald-800/20 bg-emerald-950/5 dark:bg-emerald-950/20'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <PenLine className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-emerald-950 dark:text-emerald-50 font-['Cinzel',serif]">
                  Personal Reflection
                </h3>
                <span className="text-xs font-quran-amiri font-bold text-amber-600 dark:text-amber-400">
                  تدبر
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Surah {surahEnglishName || surahNumber} • Ayah {surahNumber}:{ayahNumber}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-500/10 transition-colors cursor-pointer"
            id="verse-note-close-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Verse Preview Banner */}
          {(arabicText || translationText) && (
            <div
              className={`p-3.5 rounded-2xl border space-y-2 text-xs ${
                isMushafTheme
                  ? 'bg-[#f4ebd0]/60 border-[#caa352]/30 text-stone-800'
                  : 'bg-emerald-950/5 dark:bg-emerald-950/30 border-emerald-900/10 dark:border-emerald-800/20 text-stone-600 dark:text-stone-300'
              }`}
            >
              {arabicText && (
                <p
                  dir="rtl"
                  className="font-quran-amiri text-base sm:text-lg text-emerald-950 dark:text-amber-200 line-clamp-2 leading-relaxed"
                >
                  {arabicText}
                </p>
              )}
              {translationText && (
                <p className="italic line-clamp-2 text-stone-500 dark:text-stone-400">
                  "{translationText}"
                </p>
              )}
            </div>
          )}

          {/* Reflection Prompts Chips */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-500 dark:text-stone-400">
              <Lightbulb className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Inspiration Prompts (Click to add)</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {INSPIRATION_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleAddPrompt(prompt)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    isMushafTheme
                      ? 'bg-[#faf5e8] border-[#caa352]/50 text-stone-700 hover:bg-[#caa352]/20'
                      : 'bg-emerald-900/5 dark:bg-emerald-900/20 border-emerald-900/10 dark:border-emerald-800/20 text-stone-600 dark:text-stone-300 hover:bg-emerald-900/10 dark:hover:bg-emerald-900/40'
                  }`}
                >
                  + {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Text Area */}
          <div className="space-y-1">
            <label
              htmlFor="reflection-note-textarea"
              className="text-xs font-semibold text-stone-600 dark:text-stone-300"
            >
              Your Reflections & Personal Takeaways:
            </label>
            <textarea
              id="reflection-note-textarea"
              rows={5}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="What thoughts, lessons, prayers, or personal commitments come to your mind as you contemplate this verse?"
              className={`w-full p-3.5 text-sm rounded-2xl resize-none transition-all focus:outline-none ${
                isMushafTheme
                  ? 'bg-[#fdfbf6] border border-[#caa352] text-[#1c1917] placeholder-stone-400 focus:ring-2 focus:ring-[#caa352]'
                  : 'bg-emerald-950/5 dark:bg-emerald-950/40 border border-emerald-900/15 dark:border-emerald-800/30 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:ring-2 focus:ring-amber-400/40'
              }`}
              maxLength={2000}
              autoFocus
            />
            <div className="flex justify-between items-center text-[11px] text-stone-400 pt-0.5">
              <span>
                {noteUpdatedAt && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Last saved:{' '}
                    {new Date(noteUpdatedAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                )}
              </span>
              <span>{noteText.length} / 2000</span>
            </div>
          </div>

          {/* Delete confirmation strip if triggered */}
          {isDeleting && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between">
              <span>Delete this reflection note?</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-700 cursor-pointer"
                >
                  Yes, Delete
                </button>
                <button
                  type="button"
                  onClick={() => setIsDeleting(false)}
                  className="px-2 py-1 text-stone-500 hover:text-stone-700 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-t ${
            isMushafTheme
              ? 'border-[#caa352]/40 bg-[#f4ebd0]/50'
              : 'border-emerald-900/10 dark:border-emerald-800/20 bg-emerald-950/5 dark:bg-emerald-950/10'
          }`}
        >
          <div>
            {hasExistingNote && !isDeleting && (
              <button
                type="button"
                onClick={() => setIsDeleting(true)}
                className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                id="verse-note-delete-btn"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Note</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-500/10 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer ${
                savedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-800 hover:bg-emerald-700 text-amber-200'
              }`}
              id="verse-note-save-btn"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Reflection</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
