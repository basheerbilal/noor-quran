/**
 * Standard Bismillah prefixes that AlQuran Cloud embeds at the start of Ayah 1 in Surahs 2..114
 */
const BISMILLAH_PATTERNS = [
  /^﻿?بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\s*/u,
  /^﻿?بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ\s*/u,
  /^﻿?بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\s*/u,
  /^﻿?بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ\s*/u,
];

/**
 * Strips leading Bismillah from the first verse of surahs (2-114 except 9)
 * so it is not duplicated under the standalone ornamental Bismillah banner.
 * In Surah 1 (Al-Fatiha), Bismillah IS verse 1, so it is preserved.
 */
export function cleanAyahText(
  text: string,
  surahNumber: number,
  ayahNumberInSurah: number
): string {
  if (!text) return '';
  if (surahNumber === 1 || ayahNumberInSurah !== 1) {
    return text.trim();
  }

  let cleaned = text;
  for (const pattern of BISMILLAH_PATTERNS) {
    if (pattern.test(cleaned)) {
      cleaned = cleaned.replace(pattern, '');
      break;
    }
  }

  return cleaned.trim();
}

/**
 * Standard Bismillah Arabic text
 */
export const BISMILLAH_TEXT = 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ';
export const BISMILLAH_TRANSLATION =
  'In the name of Allah, the Most Gracious, the Most Merciful.';
export const BISMILLAH_URDU = 'شروع اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے';

export interface UrduEditionInfo {
  identifier: string;
  name: string;
  scholarEnglish: string;
  tagline?: string;
  popular?: boolean;
}

export const POPULAR_URDU_EDITIONS: UrduEditionInfo[] = [
  {
    identifier: 'ur.jalandhry',
    name: 'مولانا فتح محمد جالندھری',
    scholarEnglish: 'Fateh Muhammad Jalandhry',
    tagline: 'Classic, widely read across the subcontinent',
    popular: true,
  },
  {
    identifier: 'ur.junagarhi',
    name: 'مولانا محمد جوناگڑھی',
    scholarEnglish: 'Muhammad Junagarhi (Bayan-ul-Quran)',
    tagline: 'Authentic Tafsir Bayan-ul-Quran translation',
    popular: true,
  },
  {
    identifier: 'ur.maududi',
    name: 'سید ابوالاعلیٰ مودودی (تفہیم القرآن)',
    scholarEnglish: "Abul A'ala Maududi (Tafhim-ul-Quran)",
    tagline: 'Eloquent modern Urdu commentary and tarjumah',
    popular: true,
  },
  {
    identifier: 'ur.kanzuliman',
    name: 'امام احمد رضا خان (کنز الایمان)',
    scholarEnglish: 'Ahmed Raza Khan (Kanz-ul-Iman)',
    tagline: 'Revered devotional translation',
    popular: true,
  },
  {
    identifier: 'ur.qadri',
    name: 'ڈاکٹر محمد طاہر القادری (عرفان القرآن)',
    scholarEnglish: 'Tahir-ul-Qadri (Irfan-ul-Quran)',
    tagline: 'Accessible and lucid contemporary Urdu',
    popular: true,
  },
  {
    identifier: 'ur.ahmedali',
    name: 'مولانا احمد علی لاہوری',
    scholarEnglish: 'Ahmed Ali Lahori',
    tagline: 'Literal scholarly translation',
  },
  {
    identifier: 'ur.jawadi',
    name: 'علامہ ذیشان حیدر جوادی',
    scholarEnglish: 'Syed Zeeshan Haider Jawadi',
    tagline: 'Scholarly Ja\'fari perspective',
  },
  {
    identifier: 'ur.najafi',
    name: 'علامہ محمد حسین نجفی',
    scholarEnglish: 'Muhammad Hussain Najafi',
    tagline: 'Detailed scholarly Urdu tarjumah',
  },
];

/**
 * Determine if a given translation edition is Urdu
 */
export function isUrduTranslation(editionIdentifier?: string): boolean {
  if (!editionIdentifier) return false;
  return editionIdentifier.startsWith('ur.') || editionIdentifier === 'ur';
}

/**
 * Determine if an edition has RTL reading direction (Urdu, Arabic, Persian, Uyghur, Hebrew)
 */
export function isRtlTranslation(editionIdentifier?: string): boolean {
  if (!editionIdentifier) return false;
  const rtlPrefixes = ['ur.', 'ar.', 'fa.', 'ug.', 'he.', 'ps.'];
  return rtlPrefixes.some((p) => editionIdentifier.startsWith(p));
}

/**
 * Get display font class for the selected translation edition
 */
export function getTranslationTypographyClass(editionIdentifier?: string): {
  dir: 'rtl' | 'ltr';
  className: string;
  isUrdu: boolean;
} {
  const isUrdu = isUrduTranslation(editionIdentifier);
  const isRtl = isRtlTranslation(editionIdentifier);

  if (isUrdu) {
    return {
      dir: 'rtl',
      className: 'font-urdu text-right leading-[2.3] text-emerald-950 dark:text-emerald-100',
      isUrdu: true,
    };
  }

  if (isRtl) {
    return {
      dir: 'rtl',
      className: 'font-quran-amiri text-right leading-[2.2]',
      isUrdu: false,
    };
  }

  return {
    dir: 'ltr',
    className: 'font-sans text-left leading-relaxed',
    isUrdu: false,
  };
}

/**
 * Get Bismillah translation based on active edition
 */
export function getBismillahTranslationText(editionIdentifier?: string): string {
  if (isUrduTranslation(editionIdentifier)) {
    return BISMILLAH_URDU;
  }
  return BISMILLAH_TRANSLATION;
}

/**
 * Format numbers with leading zeros (e.g. 1 -> "01", 10 -> "10")
 */
export function padNumber(num: number, digits = 2): string {
  return String(num).padStart(digits, '0');
}

/**
 * Convert numbers to Arabic-Indic digits if needed
 */
export function toArabicDigits(num: number | string): string {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(num).replace(/[0-9]/g, (w) => arabicDigits[+w]);
}

/**
 * Copy text to clipboard with browser fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Failed to copy to clipboard', err);
    return false;
  }
}

/**
 * Native Web Share API with clipboard fallback
 */
export async function shareAyah(data: {
  surahName: string;
  surahNumber: number;
  ayahNumber: number;
  arabicText: string;
  translationText?: string;
}): Promise<boolean> {
  const shareText = `Surah ${data.surahName} (${data.surahNumber}:${data.ayahNumber})\n\n${data.arabicText}\n\n${
    data.translationText ? `"${data.translationText}"\n\n` : ''
  }— Read on NOOR Quran`;

  if (navigator?.share) {
    try {
      await navigator.share({
        title: `Surah ${data.surahName} [${data.surahNumber}:${data.ayahNumber}]`,
        text: shareText,
        url: window.location.href,
      });
      return true;
    } catch (error: any) {
      // User cancelled or share failed
      if (error?.name !== 'AbortError') {
        return copyToClipboard(shareText);
      }
      return false;
    }
  } else {
    return copyToClipboard(shareText);
  }
}
