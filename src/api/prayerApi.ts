import { PrayerTimesData, PrayerTimings, HijriDateInfo } from '../types';

const CACHE_KEY = 'noor_cached_prayer_times';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  locationName?: string;
  source: 'gps' | 'preset' | 'default';
}

export const DEFAULT_LOCATION: LocationCoordinates = {
  latitude: 21.4225,
  longitude: 39.8262,
  locationName: 'Makkah, Saudi Arabia',
  source: 'default',
};

/**
 * Fetch reverse geocoded city name for given coordinates
 */
export async function getCityNameFromCoordinates(
  lat: number,
  lng: number
): Promise<string> {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
    );
    if (res.ok) {
      const data = await res.json();
      const city = data.city || data.locality || data.principalSubdivision;
      const country = data.countryName;
      if (city && country) {
        return `${city}, ${country}`;
      } else if (city) {
        return city;
      } else if (country) {
        return country;
      }
    }
  } catch (err) {
    console.warn('Reverse geocoding error:', err);
  }

  return `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`;
}

/**
 * Fetches prayer times from AlAdhan API with localStorage caching
 */
export async function fetchPrayerTimes(
  lat: number,
  lng: number,
  methodId: number = 1,
  customLocationName?: string,
  school: number = 1
): Promise<PrayerTimesData> {
  const cacheKeyWithParams = `${CACHE_KEY}_${lat.toFixed(3)}_${lng.toFixed(3)}_${methodId}_${school}`;

  try {
    const response = await fetch(
      `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=${methodId}&school=${school}`
    );

    if (!response.ok) {
      throw new Error(`Prayer API returned status ${response.status}`);
    }

    const json = await response.json();
    if (json.code !== 200 || !json.data) {
      throw new Error('Invalid response structure from Prayer API');
    }

    const data = json.data;
    const timings: PrayerTimings = {
      Fajr: data.timings.Fajr,
      Sunrise: data.timings.Sunrise,
      Dhuhr: data.timings.Dhuhr,
      Asr: data.timings.Asr,
      Sunset: data.timings.Sunset,
      Maghrib: data.timings.Maghrib,
      Isha: data.timings.Isha,
      Imsak: data.timings.Imsak,
      Midnight: data.timings.Midnight,
    };

    const hijri: HijriDateInfo = {
      date: data.date.hijri.date,
      day: data.date.hijri.day,
      weekdayEn: data.date.hijri.weekday.en,
      weekdayAr: data.date.hijri.weekday.ar,
      monthEn: data.date.hijri.month.en,
      monthAr: data.date.hijri.month.ar,
      year: data.date.hijri.year,
      designation: data.date.hijri.designation?.abbreviated || 'AH',
    };

    let resolvedLocationName = customLocationName;
    if (!resolvedLocationName) {
      resolvedLocationName = await getCityNameFromCoordinates(lat, lng);
    }

    const result: PrayerTimesData = {
      timings,
      dateReadable: data.date.readable,
      hijri,
      timezone: data.meta.timezone || 'UTC',
      methodName: data.meta.method?.name || 'Umm al-Qura University, Makkah',
      locationName: resolvedLocationName,
      latitude: lat,
      longitude: lng,
      lastUpdated: Date.now(),
    };

    // Cache to localStorage
    try {
      localStorage.setItem(cacheKeyWithParams, JSON.stringify(result));
    } catch {
      // Ignore quota errors
    }

    return result;
  } catch (error) {
    console.warn('Network fetch for prayer times failed, checking cache:', error);

    // Try reading from cache
    try {
      const cached = localStorage.getItem(cacheKeyWithParams);
      if (cached) {
        return JSON.parse(cached) as PrayerTimesData;
      }
    } catch {
      // Ignore parse errors
    }

    // Graceful offline fallback with approximate Makkah timings
    return getOfflineFallbackPrayerTimes(lat, lng, customLocationName);
  }
}

/**
 * Returns safe fallback prayer times if offline and no cache exists
 */
function getOfflineFallbackPrayerTimes(
  lat: number,
  lng: number,
  customLocationName?: string
): PrayerTimesData {
  const now = new Date();
  return {
    timings: {
      Fajr: '05:15',
      Sunrise: '06:30',
      Dhuhr: '12:30',
      Asr: '15:55',
      Sunset: '18:35',
      Maghrib: '18:35',
      Isha: '19:50',
      Imsak: '05:05',
      Midnight: '00:30',
    },
    dateReadable: now.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    hijri: {
      date: '11-03-1448',
      day: '11',
      weekdayEn: 'Tuesday',
      weekdayAr: 'الثلاثاء',
      monthEn: 'Rabi al-Awwal',
      monthAr: 'رَبِيع الأوّل',
      year: '1448',
      designation: 'AH',
    },
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    methodName: 'Umm Al-Qura University, Makkah',
    locationName: customLocationName || 'Makkah, Saudi Arabia',
    latitude: lat,
    longitude: lng,
    lastUpdated: Date.now(),
  };
}
