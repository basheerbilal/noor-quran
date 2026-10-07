import { useEffect } from 'react';
import { fetchPrayerTimes, PrayerTimes } from '../utils/prayerTimes';

export const usePrayerNotification = (location: { latitude: number; longitude: number } | null) => {
  useEffect(() => {
    if (!location) return;

    const checkPrayerTimes = async () => {
      const times = await fetchPrayerTimes(location.latitude, location.longitude);
      
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      Object.entries(times).forEach(([prayer, time]) => {
        if (time === currentTime) {
          if (Notification.permission === 'granted') {
            new Notification(`Prayer Time: ${prayer}`, {
              body: `It is time for ${prayer} prayer.`,
            });
          }
        }
      });
    };

    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }

    const interval = setInterval(checkPrayerTimes, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [location]);
};
