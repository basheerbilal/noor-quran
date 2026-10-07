import React, { useEffect, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { fetchHijriDate, HijriDate } from '../utils/hijriDate';

export const HijriDashboardWidget: React.FC = () => {
  const [hijriDate, setHijriDate] = useState<HijriDate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDate = async () => {
      try {
        const data = await fetchHijriDate();
        console.log('Hijri API full response data:', data);
        setHijriDate(data);
      } catch (e) {
        console.error('Failed to load Hijri date', e);
      } finally {
        setLoading(false);
      }
    };
    loadDate();
  }, []);

  if (loading) {
    return (
      <div className="p-4 rounded-2xl bg-emerald-950/5 dark:bg-emerald-950/20 animate-pulse h-24">
        <div className="h-4 w-1/3 bg-emerald-900/10 rounded mb-2"></div>
        <div className="h-6 w-2/3 bg-emerald-900/10 rounded"></div>
      </div>
    );
  }

  if (!hijriDate) return null;

  console.log('hijriDate:', hijriDate);
  console.log('hijriDate.holidays:', hijriDate.holidays);

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-amber-50 dark:from-emerald-950/40 dark:to-emerald-900/20 border border-emerald-900/10 dark:border-emerald-800/20 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <CalendarDays className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
        <h3 className="text-sm font-semibold text-emerald-950 dark:text-emerald-50">
          Islamic Date
        </h3>
      </div>
      <div className="text-xl font-bold text-emerald-900 dark:text-emerald-100">
        {hijriDate.day || ''} {hijriDate.month?.en || ''} {hijriDate.year || ''} AH
      </div>
      <div className="text-xs text-emerald-700/70 dark:text-emerald-300/60 mt-1">
        {hijriDate.weekday?.en || ''}
      </div>
      {hijriDate.holidays && hijriDate.holidays.length > 0 && (
        <div className="mt-3 text-xs text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded-md">
          Today: {hijriDate.holidays[0]}
        </div>
      )}
    </div>
  );
};
