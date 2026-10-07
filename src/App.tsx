import React, { useState } from 'react';
import { useGeolocation } from './hooks/useGeolocation';
import { usePrayerNotification } from './hooks/usePrayerNotification';
import { QuranSettingsProvider } from './context/QuranSettingsContext';
import { BookmarksProvider } from './context/BookmarksContext';
import { ReadingProgressProvider } from './context/ReadingProgressContext';
import { ReadingGoalProvider, useReadingGoal } from './context/ReadingGoalContext';
import { KhatamProgressProvider } from './context/KhatamProgressContext';
import { DhikrProgressProvider } from './context/DhikrProgressContext';
import { AudioProvider, useAudio } from './context/AudioContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { AudioPlayer } from './components/AudioPlayer';
import { TypographyModal } from './components/TypographyModal';
import { ReadingGoalModal } from './components/ReadingGoalModal';
import { HomePage } from './pages/HomePage';
import { QuranPage } from './pages/QuranPage';
import { SurahReaderPage } from './pages/SurahReaderPage';
import { SearchPage } from './pages/SearchPage';
import { BookmarksPage } from './pages/BookmarksPage';
import { JuzPage } from './pages/JuzPage';
import { SajdaPage } from './pages/SajdaPage';
import { MushafPage } from './pages/MushafPage';
import { DivisionsPage } from './pages/DivisionsPage';
import { SettingsPage } from './pages/SettingsPage';
import { KhatamPage } from './pages/KhatamPage';
import { QuizPage } from './pages/QuizPage';
import { ToastContainer } from './components/ui/ToastContainer';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { AnimatePresence } from 'motion/react';
import { useEffect } from 'react';

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  const { location } = useGeolocation();
  usePrayerNotification(location);
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [selectedSurah, setSelectedSurah] = useState<number>(1);
  const [targetAyah, setTargetAyah] = useState<number | undefined>(undefined);
  const [targetViewMode, setTargetViewMode] = useState<'standard' | 'tafsir'>('standard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isTypographyModalOpen, setIsTypographyModalOpen] = useState(false);
  const { isGoalModalOpen, closeGoalModal } = useReadingGoal();
  const { currentTrack } = useAudio();

  const handleNavigate = (page: string, params?: any) => {
    setCurrentPage(page);
    if (params?.query) {
      setSearchQuery(params.query);
    }
    if (params?.surahNumber) {
      setSelectedSurah(params.surahNumber);
      setTargetAyah(params.ayahNumber);
      if (params.viewMode) {
        setTargetViewMode(params.viewMode);
      } else {
        setTargetViewMode('standard');
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenSurah = (
    surahNumber: number,
    ayahNumber?: number,
    viewMode: 'standard' | 'tafsir' = 'standard'
  ) => {
    setSelectedSurah(surahNumber);
    setTargetAyah(ayahNumber);
    setTargetViewMode(viewMode);
    setCurrentPage('surah');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAyah = (surahNumber: number, ayahNumber: number) => {
    handleOpenSurah(surahNumber, ayahNumber, 'standard');
  };

  return (
    <div className="min-h-screen bg-[#fcfaf6] dark:bg-[#0c1412] text-stone-800 dark:text-stone-100 flex flex-col font-sans transition-colors">
      <AnimatePresence>
        {isLoading && <LoadingScreen />}
      </AnimatePresence>
      
      {/* Sticky Global Navigation Header */}
      <Header
        onNavigate={handleNavigate}
        currentPage={currentPage}
        onOpenTypographyModal={() => setIsTypographyModalOpen(true)}      />

      {/* Main App Body with Desktop Sidebar */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Persistent Desktop Sidebar */}
        <Sidebar
          currentPage={currentPage}
          onNavigate={handleNavigate}
        />

        {/* Dynamic Page Views */}
        <main
          className={`flex-1 min-w-0 p-3 sm:p-6 lg:p-8 ${
            currentTrack ? 'pb-44 lg:pb-16' : 'pb-24 lg:pb-8'
          }`}
        >
          {currentPage === 'home' && (
            <HomePage
              onNavigate={handleNavigate}
              onOpenSurah={handleOpenSurah}
            />
          )}

          {currentPage === 'quran' && (
            <QuranPage
              onSelectSurah={(num) => handleOpenSurah(num)}
            />
          )}

          {currentPage === 'surah' && (
            <SurahReaderPage
              surahNumber={selectedSurah}
              initialAyahNumber={targetAyah}
              initialViewMode={targetViewMode}
              onNavigateSurah={(num) => handleOpenSurah(num)}
              onOpenSettingsModal={() => setIsTypographyModalOpen(true)}
              onOpenBookmarks={() => handleNavigate('bookmarks')}
            />
          )}

          {currentPage === 'search' && (
            <SearchPage
              initialQuery={searchQuery}
              onOpenAyah={handleOpenAyah}
            />
          )}

          {(currentPage === 'bookmarks' || currentPage === 'reflections') && (
            <BookmarksPage
              initialTab={currentPage === 'reflections' ? 'reflections' : 'bookmarks'}
              onOpenAyah={handleOpenAyah}
              onExploreQuran={() => handleNavigate('quran')}
            />
          )}

          {currentPage === 'juz' && (
            <JuzPage
              onOpenSurah={handleOpenSurah}
            />
          )}

          {currentPage === 'sajda' && (
            <SajdaPage
              onOpenAyah={handleOpenAyah}
            />
          )}

          {currentPage === 'pages' && (
            <MushafPage
              onOpenAyah={handleOpenAyah}
            />
          )}

          {currentPage === 'divisions' && (
            <DivisionsPage
              onOpenSurah={handleOpenSurah}
            />
          )}

          {currentPage === 'settings' && (
            <SettingsPage />
          )}

          {currentPage === 'khatam' && (
            <KhatamPage />
          )}

          {currentPage === 'quiz' && (
            <QuizPage />
          )}
        </main>
      </div>

      {/* Persistent Audio Recitation Player Bar */}
      <AudioPlayer />

      {/* Quick Typography Customization Modal */}
      <TypographyModal
        isOpen={isTypographyModalOpen}
        onClose={() => setIsTypographyModalOpen(false)}
      />

      {/* Daily Reading Goal Modal */}
      <ReadingGoalModal
        isOpen={isGoalModalOpen}
        onClose={closeGoalModal}
      />

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav
        currentPage={currentPage}
        onNavigate={handleNavigate}
      />

      {/* Global Toast Notification Container */}
      <ToastContainer />
    </div>
  );
}
export default function App() {
  return (
    <QuranSettingsProvider>
      <BookmarksProvider>
        <ReadingProgressProvider>
          <ReadingGoalProvider>
            <KhatamProgressProvider>
              <DhikrProgressProvider>
                <AudioProvider>
                  <AppContent />
                </AudioProvider>
              </DhikrProgressProvider>
            </KhatamProgressProvider>
          </ReadingGoalProvider>
        </ReadingProgressProvider>
      </BookmarksProvider>
    </QuranSettingsProvider>
  );
}
