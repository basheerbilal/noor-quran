export interface AudioSourceOptions {
  surahNumber: number;
  ayahNumberInSurah: number;
  globalAyahNumber?: number;
  reciterEdition?: string;
  customUrl?: string;
}

export function pad3(num: number): string {
  return String(num).padStart(3, '0');
}

export function getReciterDisplayName(reciterEdition = 'ar.alafasy'): string {
  switch (reciterEdition) {
    case 'ar.abdulbasitmurattal':
      return 'Abdul Basit Abdul Samad';
    case 'ar.minshawi':
      return 'Mohamed Siddiq El-Minshawi';
    case 'ar.husary':
      return 'Mahmoud Khalil Al-Husary';
    case 'ar.hudhaify':
      return 'Ali Al-Hudhaify';
    case 'ar.alafasy':
    default:
      return 'Mishary Rashid Alafasy';
  }
}

/**
 * Generate an ordered list of high-reliability audio URLs with CORS headers
 * (verses.quran.com, everyayah.com, and cdn.islamic.network fallbacks)
 */
export function getAyahAudioCandidates(options: AudioSourceOptions): string[] {
  const {
    surahNumber,
    ayahNumberInSurah,
    globalAyahNumber,
    reciterEdition = 'ar.alafasy',
    customUrl,
  } = options;

  const paddedSurah = pad3(surahNumber);
  const paddedAyah = pad3(ayahNumberInSurah);
  const verseKey = `${paddedSurah}${paddedAyah}`;

  const candidates: string[] = [];

  // High-reliability CORS-enabled sources first
  if (reciterEdition === 'ar.alafasy') {
    candidates.push(`https://verses.quran.com/Alafasy/mp3/${verseKey}.mp3`);
    candidates.push(`https://everyayah.com/data/Alafasy_128kbps/${verseKey}.mp3`);
  } else if (reciterEdition === 'ar.abdulbasitmurattal') {
    candidates.push(`https://everyayah.com/data/Abdul_Basit_Murattal_192kbps/${verseKey}.mp3`);
  } else if (reciterEdition === 'ar.minshawi') {
    candidates.push(`https://everyayah.com/data/Minshawy_Murattal_128kbps/${verseKey}.mp3`);
  } else if (reciterEdition === 'ar.husary') {
    candidates.push(`https://everyayah.com/data/Husary_128kbps/${verseKey}.mp3`);
  } else if (reciterEdition === 'ar.hudhaify') {
    candidates.push(`https://everyayah.com/data/Hudhaify_128kbps/${verseKey}.mp3`);
  } else {
    candidates.push(`https://everyayah.com/data/Alafasy_128kbps/${verseKey}.mp3`);
    candidates.push(`https://verses.quran.com/Alafasy/mp3/${verseKey}.mp3`);
  }

  // If customUrl was provided and is valid, add it
  if (customUrl && customUrl.startsWith('http') && !candidates.includes(customUrl)) {
    candidates.push(customUrl);
  }

  // Fallback AlQuran Cloud CDN URLs
  if (globalAyahNumber && globalAyahNumber > 0) {
    candidates.push(`https://cdn.islamic.network/quran/audio/128/${reciterEdition}/${globalAyahNumber}.mp3`);
    candidates.push(`https://cdn.islamic.network/quran/audio/64/${reciterEdition}/${globalAyahNumber}.mp3`);
    if (reciterEdition !== 'ar.alafasy') {
      candidates.push(`https://cdn.islamic.network/quran/audio/128/ar.alafasy/${globalAyahNumber}.mp3`);
    }
  }

  return Array.from(new Set(candidates));
}
