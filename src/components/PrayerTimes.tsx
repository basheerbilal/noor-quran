import React, { useState, useEffect } from 'react';
import {
  Clock,
  Compass,
  MapPin,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
  Navigation,
  Calendar,
  AlertCircle,
  Check,
} from 'lucide-react';
import { PrayerTimesData, PrayerName } from '../types';
import {
  PRAYER_LIST,
  PRESET_CITIES,
  CALCULATION_METHODS,
  formatPrayerTime,
  getPrayerTimelineStatus,
  NextPrayerStatus,
} from '../utils/prayerUtils';
import {
  fetchPrayerTimes,
  DEFAULT_LOCATION,
} from '../api/prayerApi';
import { fetchHijriDate } from '../utils/hijriDate';
import { useQuranSettings } from '../context/QuranSettingsContext';

const SAVED_LOCATION_STORAGE_KEY = 'noor_prayer_location_settings';

interface SavedPrayerSettings {
  lat: number;
  lng: number;
  locationName: string;
  methodId: number;
  school: number; // 0 = Shafi'i, 1 = Hanafi
  use24Hour: boolean;
  isCustomCity: boolean;
}

export const PrayerTimes: React.FC = () => {
  const { settings } = useQuranSettings();
  const isMushafTheme = settings.theme === 'mushaf';

  // Stored preferences with intelligent Pakistani / Karachi defaults
  const [locationSettings, setLocationSettings] = useState<SavedPrayerSettings>(() => {
    try {
      const saved = localStorage.getItem(SAVED_LOCATION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const locLower = (parsed.locationName || '').toLowerCase();
        const isPakistan =
          locLower.includes('karachi') ||
          locLower.includes('pakistan') ||
          locLower.includes('lahore') ||
          locLower.includes('islamabad') ||
          locLower.includes('rawalpindi') ||
          locLower.includes('faisalabad') ||
          locLower.includes('multan') ||
          locLower.includes('peshawar') ||
          locLower.includes('quetta');

        return {
          ...parsed,
          // If Pakistan is selected, ensure it uses University of Islamic Sciences Karachi (1) and Hanafi (1)
          methodId: isPakistan && (parsed.methodId === 4 || !parsed.methodId) ? 1 : (parsed.methodId ?? 1),
          school: parsed.school !== undefined ? parsed.school : (isPakistan ? 1 : 1),
        };
      }
    } catch {
      // Ignore parse error
    }

    // Default to Karachi, Pakistan with University of Islamic Sciences & Hanafi school
    return {
      lat: 24.8607,
      lng: 67.0011,
      locationName: 'Karachi, Pakistan',
      methodId: 1, // University of Islamic Sciences, Karachi
      school: 1, // Hanafi
      use24Hour: false,
      isCustomCity: true,
    };
  });

  const [prayerData, setPrayerData] = useState<PrayerTimesData | null>(null);
  const [holiday, setHoliday] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [now, setNow] = useState<Date>(new Date());

  // Save settings when changed
  const saveSettings = (newSettings: Partial<SavedPrayerSettings>) => {
    setLocationSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(SAVED_LOCATION_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore quota error
      }
      return updated;
    });
  };

  // Clock ticker updating every second for countdown and current time
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch holiday/special occasion
  useEffect(() => {
    fetchHijriDate()
      .then((data) => {
        if (data?.holidays && data.holidays.length > 0) {
          setHoliday(data.holidays[0]);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch prayer times whenever coordinates, method, or school changes
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const data = await fetchPrayerTimes(
          locationSettings.lat,
          locationSettings.lng,
          locationSettings.methodId,
          locationSettings.locationName,
          locationSettings.school
        );
        if (isMounted) {
          setPrayerData(data);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load prayer times:', err);
          setLoading(false);
        }
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [
    locationSettings.lat,
    locationSettings.lng,
    locationSettings.methodId,
    locationSettings.locationName,
    locationSettings.school,
  ]);

  // Request browser geolocation
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        saveSettings({
          lat: latitude,
          lng: longitude,
          locationName: 'Detected Location',
          isCustomCity: false,
        });
        setIsLocating(false);
        setShowSettingsModal(false);
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation permission denied or timed out:', err);
        setLocationError(
          'Location access was unavailable. Please select your city from the list below.'
        );
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  const handleSelectPresetCity = (city: typeof PRESET_CITIES[0]) => {
    saveSettings({
      lat: city.lat,
      lng: city.lng,
      locationName: `${city.name}, ${city.country}`,
      methodId: city.methodId !== undefined ? city.methodId : locationSettings.methodId,
      school: city.school !== undefined ? city.school : locationSettings.school,
      isCustomCity: true,
    });
    setLocationError(null);
    setShowSettingsModal(false);
  };

  // Timeline / status calculation (using target city's timezone)
  const timelineStatus: NextPrayerStatus | null = prayerData
    ? getPrayerTimelineStatus(prayerData.timings, now, prayerData.timezone)
    : null;

  const isFriday = now.getDay() === 5;

  const getPrayerIcon = (key: PrayerName, className = 'w-4 h-4') => {
    switch (key) {
      case 'Fajr':
        return <Moon className={`${className} text-indigo-400`} />;
      case 'Sunrise':
        return <Sunrise className={`${className} text-amber-500`} />;
      case 'Dhuhr':
        return <Sun className={`${className} text-amber-400`} />;
      case 'Asr':
        return <Sun className={`${className} text-orange-400`} />;
      case 'Maghrib':
        return <Sunset className={`${className} text-rose-400`} />;
      case 'Isha':
        return <Sparkles className={`${className} text-purple-400`} />;
      default:
        return <Clock className={`${className} text-stone-400`} />;
    }
  };

  return (
    <div
      className={`rounded-3xl p-5 sm:p-7 transition-all border shadow-lg ${
        isMushafTheme
          ? 'bg-[#fcfaf4] border-[#caa352]/40 text-[#15366c]'
          : 'bg-[#0f1d18]/90 dark:bg-[#0c1814]/95 border-emerald-800/25 dark:border-emerald-700/30 text-stone-100 shadow-emerald-950/20 backdrop-blur-md'
      }`}
      id="prayer-times-widget"
    >
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-emerald-800/20 dark:border-emerald-700/25">
        {/* Left: Title & Dates */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                isMushafTheme
                  ? 'bg-[#15366c]/10 text-[#15366c]'
                  : 'bg-gradient-to-br from-emerald-600/30 to-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}
            >
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white dark:text-emerald-50">
                  Prayer Times
                </h2>
                <span
                  className="text-xs sm:text-sm font-quran-amiri text-amber-400 dark:text-amber-300 font-normal px-2 py-0.5 rounded-md bg-amber-400/10 border border-amber-400/20"
                  dir="rtl"
                >
                  أَوْقَاتُ الصَّلَاةِ
                </span>
              </div>
            </div>
          </div>

          {/* Hijri & Gregorian Dates Strip */}
          {prayerData && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-stone-400 pt-0.5">
              <span className="font-semibold text-amber-300 flex items-center gap-1">
                <span>🌙</span>
                <span>
                  {prayerData.hijri.day} {prayerData.hijri.monthEn} {prayerData.hijri.year} {prayerData.hijri.designation}
                </span>
              </span>
              <span className="text-stone-600">•</span>
              <span className="font-quran-amiri text-xs text-stone-300" dir="rtl">
                {prayerData.hijri.day} {prayerData.hijri.monthAr} {prayerData.hijri.year} هـ
              </span>
              <span className="text-stone-600">•</span>
              <span className="text-stone-300">{prayerData.dateReadable}</span>

              {/* Special Event or Friday Notice */}
              {holiday ? (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>{holiday}</span>
                </span>
              ) : isFriday ? (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium flex items-center gap-1">
                  <span>✨</span>
                  <span>Jumu'ah Mubarak</span>
                </span>
              ) : null}
            </div>
          )}
        </div>

        {/* Right: Local Clock, Location & GPS controls */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {timelineStatus?.cityLocalTime && (
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold border ${
                isMushafTheme
                  ? 'bg-[#f5eac7] text-[#15366c] border-[#caa352]'
                  : 'bg-emerald-950/50 border-emerald-700/30 text-amber-300'
              }`}
              title={`Current wall clock time in ${locationSettings.locationName}`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{timelineStatus.cityLocalTime}</span>
            </div>
          )}

          <button
            onClick={() => setShowSettingsModal(true)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              isMushafTheme
                ? 'bg-[#f5eac7] text-[#15366c] border-[#caa352] hover:bg-[#eddcb2]'
                : 'bg-emerald-950/40 text-stone-200 border-emerald-700/30 hover:bg-emerald-900/40 hover:border-emerald-600/50'
            }`}
            title="Change city or prayer calculation settings"
            id="prayer-times-location-btn"
          >
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="max-w-[160px] sm:max-w-[200px] truncate">
              {locationSettings.locationName}
            </span>
            <ChevronDown className="w-3 h-3 opacity-60 ml-0.5 shrink-0" />
          </button>

          <button
            onClick={handleDetectLocation}
            disabled={isLocating}
            className={`p-2 rounded-xl border transition-all cursor-pointer disabled:opacity-50 ${
              isMushafTheme
                ? 'bg-[#f5eac7] text-[#15366c] border-[#caa352] hover:bg-[#eddcb2]'
                : 'bg-emerald-950/40 text-stone-200 border-emerald-700/30 hover:bg-emerald-900/40'
            }`}
            title="Auto-detect current GPS location"
            id="prayer-times-detect-gps-btn"
          >
            <Navigation className={`w-4 h-4 text-emerald-400 ${isLocating ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Next Prayer Feature Card */}
      {timelineStatus && (
        <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-emerald-950/50 to-emerald-900/30 border border-amber-500/30 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          {/* Subtle decorative glow */}
          <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

          {/* Left Details */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-inner">
              {getPrayerIcon(timelineStatus.nextPrayer.key, 'w-6 h-6')}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Upcoming Salah
                </span>
                <span className="text-xs text-stone-400">
                  {timelineStatus.isNextTomorrow ? "Tomorrow's" : "Today's"}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {timelineStatus.nextPrayer.nameEn}
                </h3>
                <span className="font-quran-amiri text-lg text-amber-300 font-semibold" dir="rtl">
                  {timelineStatus.nextPrayer.nameAr}
                </span>
                <span className="text-xs text-stone-400">
                  • {timelineStatus.nextPrayer.description} at{' '}
                  <strong className="text-amber-300 font-mono text-sm">
                    {formatPrayerTime(
                      prayerData?.timings[timelineStatus.nextPrayer.key] || '',
                      locationSettings.use24Hour
                    )}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* Right: Live Countdown Clock & Progress bar */}
          <div className="md:text-right space-y-2 bg-emerald-950/40 md:bg-transparent p-3 md:p-0 rounded-xl border md:border-none border-emerald-800/30">
            <div className="flex items-center md:justify-end gap-2">
              <span className="flex items-center gap-1.5 text-xs text-stone-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Time Remaining:</span>
              </span>
              <span className="px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 text-sm font-mono font-black tracking-wide shadow-xs">
                {timelineStatus.formattedCountdown}
              </span>
            </div>

            <div className="space-y-1">
              <div className="w-full md:w-56 bg-emerald-950/60 border border-emerald-800/40 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${timelineStatus.progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between md:justify-end gap-2 text-[10px] text-stone-400">
                <span>Interval completed: {timelineStatus.progressPercent}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid of All 6 Prayer Times */}
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {PRAYER_LIST.map((prayer) => {
          const rawTime = prayerData?.timings[prayer.key] || '--:--';
          const formattedTime = formatPrayerTime(rawTime, locationSettings.use24Hour);
          const isNext = timelineStatus?.nextPrayer.key === prayer.key;
          const isCurrent = timelineStatus?.currentPrayer.key === prayer.key;

          return (
            <div
              key={prayer.key}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all text-center flex flex-col justify-between relative overflow-hidden group ${
                isNext
                  ? 'border-amber-400/80 bg-gradient-to-b from-amber-500/25 via-amber-500/10 to-transparent shadow-lg shadow-amber-950/30 ring-1 ring-amber-400/50 scale-[1.02] -translate-y-0.5'
                  : isCurrent
                  ? 'border-emerald-500/60 bg-gradient-to-b from-emerald-500/20 via-emerald-500/10 to-transparent ring-1 ring-emerald-500/40'
                  : isMushafTheme
                  ? 'border-[#caa352]/25 bg-[#faf5e8]/80 hover:bg-[#faf5e8]'
                  : 'border-emerald-800/25 bg-emerald-950/30 hover:bg-emerald-900/30 hover:border-emerald-700/40'
              }`}
              id={`prayer-card-${prayer.key.toLowerCase()}`}
            >
              {/* Card Top: Icon & Arabic Name */}
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`p-1.5 rounded-xl border ${
                    isNext
                      ? 'bg-amber-500/20 border-amber-500/30'
                      : isCurrent
                      ? 'bg-emerald-500/20 border-emerald-500/30'
                      : 'bg-emerald-950/40 border-emerald-800/30'
                  }`}
                >
                  {getPrayerIcon(prayer.key, 'w-4 h-4')}
                </span>
                <span className="font-quran-amiri text-base font-bold text-stone-200" dir="rtl">
                  {prayer.nameAr}
                </span>
              </div>

              {/* Card Middle: English Name & Large Time */}
              <div className="space-y-1 my-1.5">
                <div className="text-xs font-semibold text-stone-300">
                  {prayer.nameEn}
                </div>
                <div
                  className={`text-base sm:text-lg font-black font-mono tracking-tight ${
                    isNext
                      ? 'text-amber-300 drop-shadow-xs'
                      : isCurrent
                      ? 'text-emerald-300'
                      : 'text-white'
                  }`}
                >
                  {loading ? (
                    <span className="inline-block w-14 h-5 bg-stone-700/50 animate-pulse rounded-md" />
                  ) : (
                    formattedTime
                  )}
                </div>
              </div>

              {/* Card Bottom: Badge or Subtitle */}
              <div className="mt-1 pt-2 border-t border-white/5">
                {isNext ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                    <span>Next</span>
                  </span>
                ) : isCurrent ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Active</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-stone-400 font-medium">
                    {prayer.description}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Bar: Method, School & Format */}
      <div className="mt-5 pt-3.5 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-400 border-t border-emerald-800/20 dark:border-emerald-700/25">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-stone-400">
            Method:{' '}
            <strong className="font-medium text-stone-200">
              {prayerData?.methodName || 'University of Islamic Sciences, Karachi'}
            </strong>
          </span>
          <span className="text-stone-600">•</span>
          <span className="text-[11px] text-stone-400">
            School (Asr):{' '}
            <strong className="font-semibold text-amber-400">
              {locationSettings.school === 1 ? 'Hanafi (حَنَفِي)' : "Shafi'i (شَافِعِي)"}
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* 12h / 24h Toggle button */}
          <button
            onClick={() => saveSettings({ use24Hour: !locationSettings.use24Hour })}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-800/30 text-stone-300 hover:text-amber-300 font-semibold cursor-pointer transition-colors"
            title="Switch between 12-hour and 24-hour time format"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{locationSettings.use24Hour ? 'Format: 24h' : 'Format: 12h (AM/PM)'}</span>
          </button>

          <span className="text-stone-600">•</span>

          <button
            onClick={() => setShowSettingsModal(true)}
            className="flex items-center gap-1 text-amber-400 hover:text-amber-300 hover:underline font-semibold cursor-pointer transition-colors"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>Customize Settings</span>
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div
            className={`w-full max-w-lg rounded-3xl p-6 border shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto ${
              isMushafTheme
                ? 'bg-[#fcfaf4] border-[#caa352] text-[#15366c]'
                : 'bg-[#0f1d18] border-emerald-700/40 text-stone-100'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-emerald-800/30">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Prayer Times Settings</h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-1.5 rounded-lg hover:bg-emerald-900/40 text-stone-400 hover:text-white cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Error Message if location detection failed */}
            {locationError && (
              <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-start gap-2 text-xs text-amber-200">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <span>{locationError}</span>
              </div>
            )}

            {/* Juristic School (Asr Time Calculation) */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300">
                Juristic School / فقہی طریقہ (Asr Time)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => saveSettings({ school: 1 })}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    locationSettings.school === 1
                      ? 'border-amber-400 bg-amber-500/20 text-amber-200 shadow-sm'
                      : 'border-emerald-800/30 bg-emerald-950/40 hover:bg-emerald-900/30 text-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">Hanafi (حَنَفِي)</span>
                    {locationSettings.school === 1 && (
                      <Check className="w-4 h-4 text-amber-400" />
                    )}
                  </div>
                  <div className="text-[11px] text-stone-400 mt-1">
                    Standard in Pakistan, India, Bangladesh (Asr starts later)
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => saveSettings({ school: 0 })}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    locationSettings.school === 0
                      ? 'border-amber-400 bg-amber-500/20 text-amber-200 shadow-sm'
                      : 'border-emerald-800/30 bg-emerald-950/40 hover:bg-emerald-900/30 text-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">Shafi'i / Standard</span>
                    {locationSettings.school === 0 && (
                      <Check className="w-4 h-4 text-amber-400" />
                    )}
                  </div>
                  <div className="text-[11px] text-stone-400 mt-1">
                    Shafi'i, Maliki, Hanbali (Asr starts earlier)
                  </div>
                </button>
              </div>
            </div>

            {/* Calculation Method Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300">
                Calculation Method (Fajr / Isha angles)
              </label>
              <select
                value={locationSettings.methodId}
                onChange={(e) => saveSettings({ methodId: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800/40 text-xs font-medium text-stone-100 focus:outline-none cursor-pointer"
              >
                {CALCULATION_METHODS.map((method) => (
                  <option key={method.id} value={method.id} className="bg-stone-900 text-white">
                    {method.name}
                  </option>
                ))}
              </select>
            </div>

            {/* GPS Detection Button */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300">
                Auto-Detection
              </label>
              <button
                onClick={handleDetectLocation}
                disabled={isLocating}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Detecting GPS Coordinates...' : 'Use My Current Location'}</span>
              </button>
            </div>

            {/* Preset Worldwide Cities */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300">
                Or Select A City
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                {PRESET_CITIES.map((city) => {
                  const isSelected =
                    locationSettings.locationName.toLowerCase().includes(city.name.toLowerCase());
                  return (
                    <button
                      key={city.name}
                      onClick={() => handleSelectPresetCity(city)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-amber-400 bg-amber-500/20 text-amber-200 font-bold'
                          : 'border-emerald-800/30 bg-emerald-950/40 hover:bg-emerald-900/40 text-stone-300 text-xs'
                      }`}
                    >
                      <div className="font-semibold text-xs text-white">{city.name}</div>
                      <div className="text-[10px] text-stone-400">{city.country}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 12h vs 24h format */}
            <div className="flex items-center justify-between pt-3 border-t border-emerald-800/30">
              <div>
                <div className="text-xs font-semibold text-white">24-Hour Time Format</div>
                <div className="text-[10px] text-stone-400">
                  Display prayer times in 24h format (e.g., 16:35 instead of 4:35 PM)
                </div>
              </div>
              <button
                type="button"
                onClick={() => saveSettings({ use24Hour: !locationSettings.use24Hour })}
                className={`w-12 h-6.5 rounded-full transition-colors relative cursor-pointer ${
                  locationSettings.use24Hour ? 'bg-amber-500' : 'bg-stone-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform absolute top-0.75 ${
                    locationSettings.use24Hour ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
