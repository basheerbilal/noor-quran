import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Bookmark } from '../types';

const BOOKMARKS_STORAGE_KEY = 'noor_quran_bookmarks';

interface BookmarksContextType {
  bookmarks: Bookmark[];
  reflections: Bookmark[];
  addBookmark: (bookmark: Omit<Bookmark, 'id' | 'timestamp'>) => void;
  removeBookmark: (id: string) => void;
  toggleBookmark: (bookmark: Omit<Bookmark, 'id' | 'timestamp'>) => boolean;
  isBookmarked: (surahNumber: number, ayahNumber: number) => boolean;
  getBookmark: (surahNumber: number, ayahNumber: number) => Bookmark | undefined;
  getNote: (surahNumber: number, ayahNumber: number) => string | undefined;
  saveNote: (
    surahNumber: number,
    ayahNumber: number,
    note: string,
    ayahContext?: Partial<Omit<Bookmark, 'id' | 'timestamp' | 'note' | 'noteUpdatedAt'>>
  ) => void;
  deleteNote: (surahNumber: number, ayahNumber: number) => void;
  clearAllBookmarks: () => void;
}

const BookmarksContext = createContext<BookmarksContextType | undefined>(undefined);

export const BookmarksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    try {
      const stored = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load bookmarks from localStorage', e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
    } catch (e) {
      console.error('Failed to persist bookmarks', e);
    }
  }, [bookmarks]);

  const reflections = useMemo(() => {
    return bookmarks
      .filter((b) => typeof b.note === 'string' && b.note.trim().length > 0)
      .sort((a, b) => (b.noteUpdatedAt || b.timestamp) - (a.noteUpdatedAt || a.timestamp));
  }, [bookmarks]);

  const isBookmarked = (surahNumber: number, ayahNumber: number) => {
    return bookmarks.some(
      (b) => b.surahNumber === surahNumber && b.ayahNumber === ayahNumber
    );
  };

  const getBookmark = (surahNumber: number, ayahNumber: number): Bookmark | undefined => {
    const id = `${surahNumber}:${ayahNumber}`;
    return bookmarks.find((b) => b.id === id);
  };

  const getNote = (surahNumber: number, ayahNumber: number): string | undefined => {
    const id = `${surahNumber}:${ayahNumber}`;
    return bookmarks.find((b) => b.id === id)?.note;
  };

  const addBookmark = (bookmark: Omit<Bookmark, 'id' | 'timestamp'>) => {
    const id = `${bookmark.surahNumber}:${bookmark.ayahNumber}`;
    const newBookmark: Bookmark = {
      ...bookmark,
      id,
      timestamp: Date.now(),
    };
    setBookmarks((prev) => [newBookmark, ...prev.filter((b) => b.id !== id)]);
  };

  const removeBookmark = (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  const toggleBookmark = (bookmark: Omit<Bookmark, 'id' | 'timestamp'>): boolean => {
    const id = `${bookmark.surahNumber}:${bookmark.ayahNumber}`;
    const existing = bookmarks.find((b) => b.id === id);
    if (existing) {
      // If it has a note, we keep the bookmark or toggle it
      removeBookmark(id);
      return false;
    } else {
      addBookmark(bookmark);
      return true;
    }
  };

  const saveNote = (
    surahNumber: number,
    ayahNumber: number,
    noteText: string,
    ayahContext?: Partial<Omit<Bookmark, 'id' | 'timestamp' | 'note' | 'noteUpdatedAt'>>
  ) => {
    const id = `${surahNumber}:${ayahNumber}`;
    const trimmed = noteText.trim();
    const now = Date.now();

    setBookmarks((prev) => {
      const existingIndex = prev.findIndex((b) => b.id === id);
      if (existingIndex >= 0) {
        const existing = prev[existingIndex];
        const updated: Bookmark = {
          ...existing,
          note: trimmed.length > 0 ? trimmed : undefined,
          noteUpdatedAt: trimmed.length > 0 ? now : undefined,
          text: existing.text || ayahContext?.text || '',
          translationText: existing.translationText || ayahContext?.translationText,
          surahName: existing.surahName || ayahContext?.surahName || '',
          surahEnglishName: existing.surahEnglishName || ayahContext?.surahEnglishName || '',
          globalAyahNumber: existing.globalAyahNumber || ayahContext?.globalAyahNumber || 0,
        };
        const newArr = [...prev];
        newArr[existingIndex] = updated;
        return newArr;
      } else {
        if (trimmed.length === 0) return prev;
        const newBookmark: Bookmark = {
          id,
          surahNumber,
          surahName: ayahContext?.surahName || '',
          surahEnglishName: ayahContext?.surahEnglishName || `Surah ${surahNumber}`,
          ayahNumber,
          globalAyahNumber: ayahContext?.globalAyahNumber || 0,
          text: ayahContext?.text || '',
          translationText: ayahContext?.translationText,
          timestamp: now,
          note: trimmed,
          noteUpdatedAt: now,
        };
        return [newBookmark, ...prev];
      }
    });
  };

  const deleteNote = (surahNumber: number, ayahNumber: number) => {
    const id = `${surahNumber}:${ayahNumber}`;
    setBookmarks((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          const updated = { ...b };
          delete updated.note;
          delete updated.noteUpdatedAt;
          return updated;
        }
        return b;
      })
    );
  };

  const clearAllBookmarks = () => {
    setBookmarks([]);
  };

  return (
    <BookmarksContext.Provider
      value={{
        bookmarks,
        reflections,
        addBookmark,
        removeBookmark,
        toggleBookmark,
        isBookmarked,
        getBookmark,
        getNote,
        saveNote,
        deleteNote,
        clearAllBookmarks,
      }}
    >
      {children}
    </BookmarksContext.Provider>
  );
};

export function useBookmarks(): BookmarksContextType {
  const context = useContext(BookmarksContext);
  if (!context) {
    throw new Error('useBookmarks must be used within a BookmarksProvider');
  }
  return context;
}
