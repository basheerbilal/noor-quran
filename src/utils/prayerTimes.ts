
export interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export const fetchPrayerTimes = async (latitude: number, longitude: number): Promise<PrayerTimes> => {
  const date = new Date().toISOString().split('T')[0];
  const url = `https://api.aladhan.com/v1/timings/${date}?latitude=${latitude}&longitude=${longitude}&method=2`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  return data.data.timings;
};
