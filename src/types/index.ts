export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan' | string;
}

export interface SajdaDetail {
  id?: number;
  recommended?: boolean;
  obligatory?: boolean;
}

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean | SajdaDetail;
  audio?: string;
  audioSecondary?: string[];
  surah?: Surah;
}

export interface Edition {
  identifier: string;
  language: string;
  name: string;
  englishName: string;
  format: 'text' | 'audio';
  type: 'quran' | 'translation' | 'transliteration' | 'tafsir' | 'versebyverse';
  direction?: 'ltr' | 'rtl';
}

export interface SurahDetail extends Surah {
  ayahs: Ayah[];
  edition?: Edition;
}

export interface JuzData {
  number: number;
  ayahs: Ayah[];
  surahs?: Record<string, Surah>;
}

export interface PageData {
  number: number;
  ayahs: Ayah[];
  surahs?: Record<string, Surah>;
}

export interface ManzilData {
  number: number;
  ayahs: Ayah[];
  surahs?: Record<string, Surah>;
}

export interface RukuData {
  number: number;
  ayahs: Ayah[];
  surahs?: Record<string, Surah>;
}

export interface HizbQuarterData {
  number: number;
  ayahs: Ayah[];
  surahs?: Record<string, Surah>;
}

export type QuranDivisionCategory = 'juz' | 'page' | 'manzil' | 'ruku' | 'hizbQuarter';

export interface SajdaVerse extends Ayah {
  surah: Surah;
}

export interface SearchMatch {
  number: number;
  text: string;
  edition?: Edition;
  surah: Surah;
  numberInSurah: number;
}

export interface SearchResult {
  count: number;
  total?: number;
  offset?: number;
  limit?: number;
  matches: SearchMatch[];
}

export interface QuranMetaReference {
  number: number;
  name?: string;
  englishName?: string;
  englishNameTranslation?: string;
  numberOfAyahs?: number;
  revelationType?: string;
  ayah?: number;
  surah?: number;
}

export interface QuranMeta {
  ayahs: { count: number };
  surahs: { count: number; references: QuranMetaReference[] };
  sajdas: { count: number; references: QuranMetaReference[] };
  rukus: { count: number; references: QuranMetaReference[] };
  pages: { count: number; references: QuranMetaReference[] };
  manzils: { count: number; references: QuranMetaReference[] };
  hizbQuarters: { count: number; references: QuranMetaReference[] };
  juzs: { count: number; references: QuranMetaReference[] };
}

export interface Bookmark {
  id: string;
  surahNumber: number;
  surahName: string;
  surahEnglishName: string;
  ayahNumber: number;
  globalAyahNumber: number;
  text: string;
  translationText?: string;
  timestamp: number;
  note?: string;
  noteUpdatedAt?: number;
}

export interface ReadingProgress {
  surahNumber: number;
  surahName: string;
  surahEnglishName: string;
  ayahNumber: number;
  totalAyahs: number;
  progressPercentage: number;
  scrollPosition?: number;
  timestamp: number;
}

export type ThemeMode = 'mushaf' | 'light' | 'dark' | 'system';
export type ArabicFontChoice = 'amiri' | 'scheherazade';
export type DisplayMode = 'both' | 'arabic' | 'translation';

export interface UserSettings {
  arabicFontSize: number;
  translationFontSize: number;
  lineHeight: number;
  arabicFont: ArabicFontChoice;
  translationEdition: string;
  reciterEdition: string;
  displayMode: DisplayMode;
  theme: ThemeMode;
  autoSaveLastRead: boolean;
  rememberSettings: boolean;
  reducedMotion: boolean;
}

export interface AudioPlaybackState {
  isPlaying: boolean;
  currentAyahNumber?: number;
  currentSurahNumber?: number;
  currentAyahInSurah?: number;
  surahName?: string;
  audioUrl?: string;
  reciterName?: string;
  duration: number;
  currentTime: number;
  volume: number;
}

export interface DayReadingActivity {
  date: string; // 'YYYY-MM-DD'
  dayLabel: string; // 'Mon', 'Tue', etc.
  count: number;
  goalMet: boolean;
  isToday: boolean;
}

export interface ReadingGoalData {
  dailyTarget: number;
  todayDate: string; // 'YYYY-MM-DD'
  todayAyahsRead: number;
  readAyahKeysToday: string[]; // e.g. ["1:1", "1:2"]
  currentStreak: number;
  longestStreak: number;
  lastGoalMetDate: string;
  lastActiveDate: string;
  history: Record<string, number>; // 'YYYY-MM-DD' -> count
  notificationsEnabled: boolean;
  celebratedMilestonesToday: number[]; // e.g. [50, 100] percent milestones already notified today
}

export type PrayerName = 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

export interface PrayerTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Sunset: string;
  Maghrib: string;
  Isha: string;
  Imsak?: string;
  Midnight?: string;
}

export interface HijriDateInfo {
  date: string;
  day: string;
  weekdayEn: string;
  weekdayAr: string;
  monthEn: string;
  monthAr: string;
  year: string;
  designation: string;
}

export interface PrayerTimesData {
  timings: PrayerTimings;
  dateReadable: string;
  hijri: HijriDateInfo;
  timezone: string;
  methodName: string;
  locationName: string;
  latitude: number;
  longitude: number;
  lastUpdated: number;
}

export interface DhikrItem {
  id: string;
  title: string;
  arabic: string;
  transliteration: string;
  translation: string;
  meaning?: string;
  virtue: string;
  reference: string;
  recommendedCount: number;
  category: 'daily' | 'morning_evening' | 'praise' | 'forgiveness' | 'protection';
}

export interface HadithItem {
  id: string;
  narrator: string;
  arabic?: string;
  english: string;
  urdu: string;
  source: string;
  chapter?: string;
  hadithNumber?: string | number;
  grade?: string;
  topic: string;
  lesson?: string;
  urduLesson?: string;
}

export interface DuaItem {
  id: string;
  title: string;
  arabic: string;
  transliteration: string;
  translation: string;
  urduTranslation: string;
  occasion: string;
  urduOccasion?: string;
  source: string;
  benefits?: string;
  urduBenefits?: string;
  category: 'quranic' | 'prophetic' | 'morning_evening' | 'distress' | 'guidance' | 'forgiveness';
}
