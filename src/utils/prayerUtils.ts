import { PrayerName, PrayerTimings } from '../types';

export interface PrayerMetaInfo {
  key: PrayerName;
  nameEn: string;
  nameAr: string;
  transliteration: string;
  description: string;
  isPrayer: boolean; // false for Sunrise/Shurooq
}

export const PRAYER_LIST: PrayerMetaInfo[] = [
  {
    key: 'Fajr',
    nameEn: 'Fajr',
    nameAr: 'الفجر',
    transliteration: 'Al-Fajr',
    description: 'Dawn Prayer',
    isPrayer: true,
  },
  {
    key: 'Sunrise',
    nameEn: 'Sunrise',
    nameAr: 'الشروق',
    transliteration: 'Ash-Shurooq',
    description: 'Sunrise / Ishraq',
    isPrayer: false,
  },
  {
    key: 'Dhuhr',
    nameEn: 'Dhuhr',
    nameAr: 'الظهر',
    transliteration: 'Adh-Dhuhr',
    description: 'Noon Prayer',
    isPrayer: true,
  },
  {
    key: 'Asr',
    nameEn: 'Asr',
    nameAr: 'العصر',
    transliteration: 'Al-Asr',
    description: 'Afternoon Prayer',
    isPrayer: true,
  },
  {
    key: 'Maghrib',
    nameEn: 'Maghrib',
    nameAr: 'المغرب',
    transliteration: 'Al-Maghrib',
    description: 'Sunset Prayer',
    isPrayer: true,
  },
  {
    key: 'Isha',
    nameEn: 'Isha',
    nameAr: 'العشاء',
    transliteration: 'Al-Isha',
    description: 'Night Prayer',
    isPrayer: true,
  },
];

export interface PresetCity {
  name: string;
  country: string;
  lat: number;
  lng: number;
  methodId?: number;
  school?: number; // 0 = Shafi'i, 1 = Hanafi
  timezone?: string;
}

export const PRESET_CITIES: PresetCity[] = [
  { name: 'Karachi', country: 'Pakistan', lat: 24.8607, lng: 67.0011, methodId: 1, school: 1 },
  { name: 'Lahore', country: 'Pakistan', lat: 31.5204, lng: 74.3587, methodId: 1, school: 1 },
  { name: 'Islamabad', country: 'Pakistan', lat: 33.6844, lng: 73.0479, methodId: 1, school: 1 },
  { name: 'Rawalpindi', country: 'Pakistan', lat: 33.5651, lng: 73.0169, methodId: 1, school: 1 },
  { name: 'Faisalabad', country: 'Pakistan', lat: 31.4504, lng: 73.1350, methodId: 1, school: 1 },
  { name: 'Multan', country: 'Pakistan', lat: 30.1575, lng: 71.5249, methodId: 1, school: 1 },
  { name: 'Peshawar', country: 'Pakistan', lat: 34.0151, lng: 71.5249, methodId: 1, school: 1 },
  { name: 'Quetta', country: 'Pakistan', lat: 30.1798, lng: 66.9750, methodId: 1, school: 1 },
  { name: 'Makkah', country: 'Saudi Arabia', lat: 21.4225, lng: 39.8262, methodId: 4, school: 0 },
  { name: 'Madinah', country: 'Saudi Arabia', lat: 24.4672, lng: 39.6111, methodId: 4, school: 0 },
  { name: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708, methodId: 8, school: 0 },
  { name: 'Istanbul', country: 'Turkey', lat: 41.0082, lng: 28.9784, methodId: 13, school: 1 },
  { name: 'Cairo', country: 'Egypt', lat: 30.0444, lng: 31.2357, methodId: 5, school: 0 },
  { name: 'London', country: 'United Kingdom', lat: 51.5074, lng: -0.1278, methodId: 3, school: 1 },
  { name: 'New York', country: 'United States', lat: 40.7128, lng: -74.006, methodId: 2, school: 0 },
  { name: 'Toronto', country: 'Canada', lat: 43.6532, lng: -79.3832, methodId: 2, school: 0 },
  { name: 'Kuala Lumpur', country: 'Malaysia', lat: 3.139, lng: 101.6869, methodId: 3, school: 0 },
  { name: 'Jakarta', country: 'Indonesia', lat: -6.2088, lng: 106.8456, methodId: 3, school: 0 },
];

export interface CalculationMethod {
  id: number;
  name: string;
}

export const CALCULATION_METHODS: CalculationMethod[] = [
  { id: 1, name: 'University of Islamic Sciences, Karachi (Pakistan & South Asia)' },
  { id: 4, name: 'Umm Al-Qura University, Makkah (Saudi Arabia)' },
  { id: 3, name: 'Muslim World League' },
  { id: 2, name: 'Islamic Society of North America (ISNA)' },
  { id: 5, name: 'Egyptian General Authority of Survey' },
  { id: 13, name: 'Diyanet İşleri Başkanlığı, Turkey' },
  { id: 8, name: 'Gulf Region' },
  { id: 12, name: 'Union des Organisations Islamiques de France' },
];

/**
 * Clean timing string from API (strips out timezone labels like "05:14 (EET)" -> "05:14")
 */
export function cleanTimeString(rawTime: string): string {
  if (!rawTime) return '00:00';
  const match = rawTime.match(/(\d{1,2}:\d{2})/);
  return match ? match[1] : rawTime.slice(0, 5);
}

/**
 * Format 24h time ("15:45") to 12h with AM/PM ("3:45 PM") or 24h ("15:45")
 */
export function formatPrayerTime(time24: string, use24Hour: boolean = false): string {
  const clean = cleanTimeString(time24);
  if (use24Hour) return clean;

  const [hStr, mStr] = clean.split(':');
  const h = parseInt(hStr, 10);
  const m = mStr || '00';
  if (isNaN(h)) return clean;

  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m} ${period}`;
}

/**
 * Converts "HH:MM" on a specific Date to a Date object
 */
export function prayerTimeToDate(time24: string, baseDate: Date = new Date()): Date {
  const clean = cleanTimeString(time24);
  const [hStr, mStr] = clean.split(':');
  const d = new Date(baseDate);
  d.setHours(parseInt(hStr, 10) || 0, parseInt(mStr, 10) || 0, 0, 0);
  return d;
}

export interface NextPrayerStatus {
  currentPrayer: PrayerMetaInfo;
  nextPrayer: PrayerMetaInfo;
  timeRemainingSeconds: number;
  formattedCountdown: string;
  isNextTomorrow: boolean;
  progressPercent: number;
  cityLocalTime: string;
}

/**
 * Gets the current date/time in the target location's timezone.
 * Constructs a local Date object with the target timezone's wall-clock time
 * so comparisons against prayer times match accurately regardless of user device timezone.
 */
export function getNowInTimezone(timezone?: string, baseDate: Date = new Date()): Date {
  if (!timezone) return baseDate;
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    });
    const parts = formatter.formatToParts(baseDate);
    const partMap: Record<string, string> = {};
    for (const p of parts) {
      partMap[p.type] = p.value;
    }

    const year = parseInt(partMap.year, 10);
    const month = parseInt(partMap.month, 10) - 1;
    const day = parseInt(partMap.day, 10);
    let hour = parseInt(partMap.hour, 10);
    if (hour === 24) hour = 0;
    const minute = parseInt(partMap.minute, 10);
    const second = parseInt(partMap.second, 10);

    return new Date(year, month, day, hour, minute, second);
  } catch (e) {
    return baseDate;
  }
}

/**
 * Calculates which prayer is currently active and which prayer is next,
 * along with the countdown and progress bar.
 */
export function getPrayerTimelineStatus(
  timings: PrayerTimings,
  now: Date = new Date(),
  timezone?: string
): NextPrayerStatus | null {
  if (!timings) return null;

  // Accurately adjust now to the target location's timezone
  const targetNow = timezone ? getNowInTimezone(timezone, now) : now;

  const fajr = prayerTimeToDate(timings.Fajr, targetNow);
  const sunrise = prayerTimeToDate(timings.Sunrise, targetNow);
  const dhuhr = prayerTimeToDate(timings.Dhuhr, targetNow);
  const asr = prayerTimeToDate(timings.Asr, targetNow);
  const maghrib = prayerTimeToDate(timings.Maghrib, targetNow);
  const isha = prayerTimeToDate(timings.Isha, targetNow);

  const nowMs = targetNow.getTime();

  let currentKey: PrayerName = 'Isha';
  let nextKey: PrayerName = 'Fajr';
  let startTime = isha;
  let endTime = new Date(fajr.getTime() + 24 * 60 * 60 * 1000);
  let isNextTomorrow = false;

  if (nowMs < fajr.getTime()) {
    // Before Fajr today (still in Isha period from yesterday)
    currentKey = 'Isha';
    nextKey = 'Fajr';
    startTime = new Date(isha.getTime() - 24 * 60 * 60 * 1000);
    endTime = fajr;
  } else if (nowMs < sunrise.getTime()) {
    // Between Fajr and Sunrise
    currentKey = 'Fajr';
    nextKey = 'Sunrise';
    startTime = fajr;
    endTime = sunrise;
  } else if (nowMs < dhuhr.getTime()) {
    // Between Sunrise and Dhuhr (Duha time)
    currentKey = 'Sunrise';
    nextKey = 'Dhuhr';
    startTime = sunrise;
    endTime = dhuhr;
  } else if (nowMs < asr.getTime()) {
    // Between Dhuhr and Asr
    currentKey = 'Dhuhr';
    nextKey = 'Asr';
    startTime = dhuhr;
    endTime = asr;
  } else if (nowMs < maghrib.getTime()) {
    // Between Asr and Maghrib
    currentKey = 'Asr';
    nextKey = 'Maghrib';
    startTime = asr;
    endTime = maghrib;
  } else if (nowMs < isha.getTime()) {
    // Between Maghrib and Isha
    currentKey = 'Maghrib';
    nextKey = 'Isha';
    startTime = maghrib;
    endTime = isha;
  } else {
    // After Isha tonight, next is tomorrow's Fajr
    currentKey = 'Isha';
    nextKey = 'Fajr';
    startTime = isha;
    endTime = new Date(fajr.getTime() + 24 * 60 * 60 * 1000);
    isNextTomorrow = true;
  }

  const remainingMs = Math.max(0, endTime.getTime() - nowMs);
  const remainingSec = Math.floor(remainingMs / 1000);

  const hours = Math.floor(remainingSec / 3600);
  const minutes = Math.floor((remainingSec % 3600) / 60);
  const seconds = remainingSec % 60;

  let countdownStr = '';
  if (hours > 0) {
    countdownStr = `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    countdownStr = `${minutes}m ${seconds}s`;
  } else {
    countdownStr = `${seconds}s`;
  }

  const totalDurationMs = Math.max(1, endTime.getTime() - startTime.getTime());
  const elapsedMs = Math.max(0, nowMs - startTime.getTime());
  const progressPercent = Math.min(100, Math.max(0, Math.round((elapsedMs / totalDurationMs) * 100)));

  const currentMeta = PRAYER_LIST.find((p) => p.key === currentKey) || PRAYER_LIST[0];
  const nextMeta = PRAYER_LIST.find((p) => p.key === nextKey) || PRAYER_LIST[0];
  const h12 = targetNow.getHours() % 12 || 12;
  const ampm = targetNow.getHours() >= 12 ? 'PM' : 'AM';
  const cityLocalTime = `${h12}:${String(targetNow.getMinutes()).padStart(2, '0')}:${String(targetNow.getSeconds()).padStart(2, '0')} ${ampm}`;

  return {
    currentPrayer: currentMeta,
    nextPrayer: nextMeta,
    timeRemainingSeconds: remainingSec,
    formattedCountdown: countdownStr,
    isNextTomorrow,
    progressPercent,
    cityLocalTime,
  };
}
