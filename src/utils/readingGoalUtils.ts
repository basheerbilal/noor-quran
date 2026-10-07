import { DayReadingActivity } from '../types';

/**
 * Returns today's date formatted as 'YYYY-MM-DD' in local timezone.
 */
export function getLocalTodayDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns the previous day's date string 'YYYY-MM-DD'.
 */
export function getYesterdayDateString(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() - 1);
  return getLocalTodayDateString(date);
}

/**
 * Returns the difference in calendar days between two 'YYYY-MM-DD' dates.
 * dateStr2 - dateStr1 (positive if dateStr2 is after dateStr1)
 */
export function getDayDifference(dateStr1: string, dateStr2: string): number {
  if (!dateStr1 || !dateStr2) return 999;
  const [y1, m1, d1] = dateStr1.split('-').map(Number);
  const [y2, m2, d2] = dateStr2.split('-').map(Number);
  const utc1 = Date.UTC(y1, m1 - 1, d1);
  const utc2 = Date.UTC(y2, m2 - 1, d2);
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  return Math.round((utc2 - utc1) / MS_PER_DAY);
}

/**
 * Computes the last 7 days of reading activity for weekly visual cards and streaks.
 */
export function computeLast7DaysActivity(
  history: Record<string, number>,
  dailyTarget: number,
  todayDateStr: string = getLocalTodayDateString()
): DayReadingActivity[] {
  const days: DayReadingActivity[] = [];
  const [y, m, d] = todayDateStr.split('-').map(Number);

  for (let i = 6; i >= 0; i--) {
    const targetDate = new Date(y, m - 1, d);
    targetDate.setDate(targetDate.getDate() - i);
    const dateStr = getLocalTodayDateString(targetDate);
    const count = history[dateStr] || 0;
    const isToday = i === 0;

    const dayLabel = targetDate.toLocaleDateString(undefined, { weekday: 'short' });

    days.push({
      date: dateStr,
      dayLabel,
      count,
      goalMet: count >= dailyTarget && dailyTarget > 0,
      isToday,
    });
  }

  return days;
}

/**
 * Preset target options with descriptions and estimated duration
 */
export const READING_GOAL_PRESETS = [
  { count: 5, label: '5 Ayahs', time: '~2 mins', level: 'Gentle' },
  { count: 10, label: '10 Ayahs', time: '~5 mins', level: 'Balanced', recommended: true },
  { count: 20, label: '20 Ayahs', time: '~10 mins', level: '1 Ruku' },
  { count: 30, label: '30 Ayahs', time: '~15 mins', level: '1 Hizb' },
  { count: 50, label: '50 Ayahs', time: '~25 mins', level: 'Devoted' },
];

export const PRESET_GOALS = READING_GOAL_PRESETS;

/**
 * Inspiring Hadith & reflections on consistent Quran reading
 */
export const READING_GOAL_HADITHS = [
  {
    text: 'The most beloved deed to Allah is the most regular and constant even if it were little.',
    source: 'Sahih al-Bukhari 6464',
  },
  {
    text: 'Whoever recites a letter from the Book of Allah, he will receive one good deed, and each good deed is multiplied ten-fold.',
    source: 'Jami` at-Tirmidhi 2910',
  },
  {
    text: 'Read the Quran, for it will come as an intercessor for its reciters on the Day of Resurrection.',
    source: 'Sahih Muslim 804',
  },
  {
    text: 'The one who recites the Quran beautifully, smoothly, and precisely will be in the company of the noble and obedient angels.',
    source: 'Sahih al-Bukhari 4937',
  },
];
