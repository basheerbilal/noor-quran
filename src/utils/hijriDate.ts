
export interface HijriDate {
  date: string;
  format: string;
  day: string;
  weekday: {
    en: string;
    ar: string;
  };
  month: any;
  year: string;
  designation: {
    abbreviated: string;
    expanded: string;
  };
  holidays: string[];
}

export const fetchHijriDate = async (date?: string): Promise<HijriDate> => {
  // Use current date if no date provided
  const targetDate = date || new Date().toISOString().split('T')[0];
  // Format for AlAdhan: dd-mm-yyyy
  const [year, month, day] = targetDate.split('-');
  const formattedDate = `${day}-${month}-${year}`;

  const url = `https://api.aladhan.com/v1/gToH/${formattedDate}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  return data.data.hijri;
};
