import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import { getRandomAyah } from '../api/quranApi';
import { getSurahs } from '../api/quranApi';
import { Ayah, Surah } from '../types';

export const QuizPage: React.FC = () => {
  const [ayah, setAyah] = useState<{ arabic: Ayah; translation: Ayah } | null>(null);
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [options, setOptions] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const loadQuiz = async () => {
    setLoading(true);
    setIsCorrect(null);
    setSelectedSurah(null);
    try {
      const [ayahData, surahList] = await Promise.all([getRandomAyah(), getSurahs()]);
      setAyah(ayahData);
      setSurahs(surahList);
      
      const surahNum = ayahData.arabic.surah?.number;
      const correctSurah = surahNum ? surahList.find(s => s.number === surahNum) : undefined;
      
      // Generate 3 random wrong options
      const wrongOptions = surahList
        .filter(s => s.number !== correctSurah?.number)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
        
      const allOptions = [correctSurah, ...wrongOptions].filter(Boolean).sort(() => 0.5 - Math.random()) as Surah[];
      setOptions(allOptions);
    } catch (err) {
      console.error('Failed to load quiz', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuiz();
  }, []);

  const handleSelect = (surah: Surah) => {
    if (isCorrect !== null) return;
    setSelectedSurah(surah);
    setIsCorrect(surah.number === ayah?.arabic.surah?.number);
  };

  if (loading) return <div className="p-8 text-center">Loading quiz...</div>;
  if (!ayah) return null;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center text-emerald-950 dark:text-emerald-50">Memorization Quiz</h1>
      
      <div className="p-8 bg-[#fcfaf6] dark:bg-[#0c1412] rounded-3xl border border-emerald-900/10 shadow-sm text-center">
        <p dir="rtl" className="text-3xl font-quran-amiri leading-relaxed mb-6">{ayah.arabic.text}</p>
        <p className="text-stone-600 dark:text-stone-300 italic">"{ayah.translation.text}"</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {options.map(surah => (
          <button
            key={surah.number}
            onClick={() => handleSelect(surah)}
            className={`p-4 rounded-xl border transition-all ${
              selectedSurah?.number === surah.number
                ? isCorrect 
                  ? 'bg-emerald-500 text-white border-emerald-600'
                  : 'bg-red-500 text-white border-red-600'
                : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-emerald-500'
            }`}
          >
            {surah.englishName}
          </button>
        ))}
      </div>

      {isCorrect !== null && (
        <div className="text-center space-y-4">
          <p className={`text-xl font-semibold ${isCorrect ? 'text-emerald-600' : 'text-red-600'}`}>
            {isCorrect ? 'Correct!' : `Incorrect! It was ${ayah.arabic.surah?.englishName || 'another surah'}.`}
          </p>
          <button onClick={loadQuiz} className="flex items-center gap-2 mx-auto px-6 py-3 bg-emerald-800 text-white rounded-xl">
            Next Ayah <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
