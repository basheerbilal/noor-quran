import axios from 'axios';
import { apiClient, API_BASE_URL } from './quranApi';

export interface TafsirEdition {
  id: string;
  name: string;
  author: string;
  language: 'en' | 'ur' | 'ar' | string;
  languageLabel: string;
  source: 'quran_com' | 'alquran_cloud';
  resourceId?: number;
  slug?: string;
  direction: 'ltr' | 'rtl';
  description: string;
  popular?: boolean;
}

export interface AyahTafsir {
  surahNumber: number;
  ayahNumber: number;
  tafsirId: string;
  tafsirName: string;
  authorName: string;
  text: string;
  direction: 'ltr' | 'rtl';
  language: string;
}

/**
 * Curated list of prominent, authentic Tafsir editions
 * Prioritizing Tafsir Ibn Kathir across English, Urdu, and Arabic
 */
export const TAFSIR_EDITIONS: TafsirEdition[] = [
  {
    id: 'en-tafsir-ibn-kathir',
    name: 'Tafsir Ibn Kathir',
    author: 'Hafiz Ibn Kathir (Abridged)',
    language: 'en',
    languageLabel: 'English',
    source: 'quran_com',
    resourceId: 169,
    slug: 'en-tafisr-ibn-kathir',
    direction: 'ltr',
    description: 'The most celebrated classical exegesis of the Quran in the Sunni tradition.',
    popular: true,
  },
  {
    id: 'ur-tafsir-ibn-kathir',
    name: 'تفسیر ابنِ کثیر',
    author: 'حافظ عماد الدین ابن کثیر',
    language: 'ur',
    languageLabel: 'اردو',
    source: 'quran_com',
    resourceId: 160,
    slug: 'tafseer-ibn-e-kaseer-urdu',
    direction: 'rtl',
    description: 'برصغیر میں مقبول ترین مستند و جامع سلفی تفسیری شاہکار اردو میں۔',
    popular: true,
  },
  {
    id: 'ar-tafsir-ibn-kathir',
    name: 'تفسير ابن كثير',
    author: 'الحافظ إسماعيل بن كثير الدمشقي',
    language: 'ar',
    languageLabel: 'العربية',
    source: 'quran_com',
    resourceId: 14,
    slug: 'ar-tafsir-ibn-kathir',
    direction: 'rtl',
    description: 'تفسير القرآن العظيم، عمدة التفاسير المأثورة المعتمدة.',
    popular: true,
  },
  {
    id: 'ar.jalalayn',
    name: 'تفسير الجلالين',
    author: 'جلال الدين المحلي وجلال الدين السيوطي',
    language: 'ar',
    languageLabel: 'العربية',
    source: 'alquran_cloud',
    direction: 'rtl',
    description: 'تفسير موجز محكم معتمد في العالم الإسلامي منذ قرون.',
    popular: true,
  },
  {
    id: 'ar.muyassar',
    name: 'التفسير الميسر',
    author: 'مجمع الملك فهد لطباعة المصحف الشريف',
    language: 'ar',
    languageLabel: 'العربية',
    source: 'alquran_cloud',
    direction: 'rtl',
    description: 'تفسير مبسط معتمد صادر عن مجمع الملك فهد بالمدينة المنورة.',
    popular: true,
  },
  {
    id: 'en-tafsir-maarif-ul-quran',
    name: "Ma'arif al-Qur'an",
    author: 'Mufti Muhammad Shafi',
    language: 'en',
    languageLabel: 'English',
    source: 'quran_com',
    resourceId: 168,
    slug: 'en-tafsir-maarif-ul-quran',
    direction: 'ltr',
    description: 'Comprehensive contemporary 8-volume commentary by Mufti Muhammad Shafi.',
    popular: false,
  },
  {
    id: 'tafsir-bayan-ul-quran',
    name: 'بیان القرآن',
    author: 'ڈاکٹر اسرار احمد',
    language: 'ur',
    languageLabel: 'اردو',
    source: 'quran_com',
    resourceId: 159,
    slug: 'tafsir-bayan-ul-quran',
    direction: 'rtl',
    description: 'قرآنی فلسفہ، فہم اور حکمت کے ساتھ ڈاکٹر اسرار احمد کی فکری تفسیر۔',
    popular: false,
  },
  {
    id: 'ar.qurtubi',
    name: 'الجامع لأحكام القرآن (القرطبي)',
    author: 'الإمام أبو عبد الله القرطبي',
    language: 'ar',
    languageLabel: 'العربية',
    source: 'alquran_cloud',
    direction: 'rtl',
    description: 'أهم كتب التفسير الفقهية واستنباط الأحكام الشرعية.',
    popular: false,
  },
  {
    id: 'ar.waseet',
    name: 'التفسير الوسيط (طنطاوي)',
    author: 'الشيخ محمد سيد طنطاوي',
    language: 'ar',
    languageLabel: 'العربية',
    source: 'alquran_cloud',
    direction: 'rtl',
    description: 'تفسير وسيط ميسر يجمع بين الرواية والدراية وأسلوب العصر.',
    popular: false,
  },
  {
    id: 'ar.baghawi',
    name: 'معالم التنزيل (البغوي)',
    author: 'الإمام الحسين بن مسعود البغوي',
    language: 'ar',
    languageLabel: 'العربية',
    source: 'alquran_cloud',
    direction: 'rtl',
    description: 'تفسير أهل السنة المأثور المحرر الخالي من البدع.',
    popular: false,
  },
];

// In-memory cache: key = `${tafsirId}:${surahNumber}:${ayahNumber}`
const tafsirCache = new Map<string, AyahTafsir>();

// In-memory cache for whole surah from AlQuran Cloud: key = `${editionId}:${surahNumber}`
const surahTafsirCache = new Map<string, Record<number, string>>();

/**
 * Find tafsir edition metadata by ID
 */
export function getTafsirEdition(id: string): TafsirEdition | undefined {
  return TAFSIR_EDITIONS.find((ed) => ed.id === id);
}

/**
 * Determine default tafsir based on user translation edition
 */
export function getDefaultTafsirForTranslation(translationEdition: string): TafsirEdition {
  if (translationEdition.startsWith('ur.')) {
    return TAFSIR_EDITIONS.find((t) => t.id === 'ur-tafsir-ibn-kathir') || TAFSIR_EDITIONS[0];
  }
  if (translationEdition.startsWith('ar.')) {
    return TAFSIR_EDITIONS.find((t) => t.id === 'ar-tafsir-ibn-kathir') || TAFSIR_EDITIONS[0];
  }
  return TAFSIR_EDITIONS[0]; // en-tafsir-ibn-kathir
}

/**
 * Fetch Tafsir for a specific Ayah with caching and multiple fallbacks
 */
export async function getTafsirForAyah(
  tafsirId: string,
  surahNumber: number,
  ayahNumber: number
): Promise<AyahTafsir> {
  const cacheKey = `${tafsirId}:${surahNumber}:${ayahNumber}`;
  if (tafsirCache.has(cacheKey)) {
    return tafsirCache.get(cacheKey)!;
  }

  const edition = getTafsirEdition(tafsirId) || TAFSIR_EDITIONS[0];

  // 1. Source: AlQuran Cloud API (e.g. ar.jalalayn, ar.muyassar, etc.)
  if (edition.source === 'alquran_cloud') {
    // Check if entire surah is cached
    const surahKey = `${edition.id}:${surahNumber}`;
    if (surahTafsirCache.has(surahKey)) {
      const ayahsMap = surahTafsirCache.get(surahKey)!;
      const text = ayahsMap[ayahNumber] || '';
      const result: AyahTafsir = {
        surahNumber,
        ayahNumber,
        tafsirId: edition.id,
        tafsirName: edition.name,
        authorName: edition.author,
        text,
        direction: edition.direction,
        language: edition.language,
      };
      tafsirCache.set(cacheKey, result);
      return result;
    }

    // Try fetching the entire surah from AlQuran Cloud
    try {
      const response = await apiClient.get<{
        ayahs: Array<{ numberInSurah: number; text: string }>;
      }>(`${API_BASE_URL}/surah/${surahNumber}/${edition.id}`);

      if (response && response.ayahs) {
        const ayahsMap: Record<number, string> = {};
        response.ayahs.forEach((a) => {
          ayahsMap[a.numberInSurah] = a.text;
          const k = `${edition.id}:${surahNumber}:${a.numberInSurah}`;
          tafsirCache.set(k, {
            surahNumber,
            ayahNumber: a.numberInSurah,
            tafsirId: edition.id,
            tafsirName: edition.name,
            authorName: edition.author,
            text: a.text,
            direction: edition.direction,
            language: edition.language,
          });
        });
        surahTafsirCache.set(surahKey, ayahsMap);

        const text = ayahsMap[ayahNumber] || '';
        return {
          surahNumber,
          ayahNumber,
          tafsirId: edition.id,
          tafsirName: edition.name,
          authorName: edition.author,
          text,
          direction: edition.direction,
          language: edition.language,
        };
      }
    } catch {
      // Fallback to single ayah query on AlQuran Cloud
      const singleRes = await apiClient.get<{ text: string }>(
        `${API_BASE_URL}/ayah/${surahNumber}:${ayahNumber}/${edition.id}`
      );
      const result: AyahTafsir = {
        surahNumber,
        ayahNumber,
        tafsirId: edition.id,
        tafsirName: edition.name,
        authorName: edition.author,
        text: singleRes.text || '',
        direction: edition.direction,
        language: edition.language,
      };
      tafsirCache.set(cacheKey, result);
      return result;
    }
  }

  // 2. Source: Quran.com API (e.g. Tafsir Ibn Kathir English, Urdu, Arabic, Ma'arif, etc.)
  const slug = edition.slug || 'en-tafisr-ibn-kathir';
  const resourceId = edition.resourceId || 169;

  let text = '';
  let fetchedName = edition.name;
  let fetchedAuthor = edition.author;

  // Try QuranCDN first (fast Cloudflare CDN)
  try {
    const res = await axios.get(
      `https://api.qurancdn.com/api/qdc/tafsirs/${slug}/by_ayah/${surahNumber}:${ayahNumber}`,
      { timeout: 7000 }
    );
    if (res.data?.tafsir?.text) {
      text = res.data.tafsir.text;
      if (res.data.tafsir.resource_name) {
        fetchedName = res.data.tafsir.resource_name;
      }
    }
  } catch {
    // Fallback to api.quran.com
    try {
      const fallbackRes = await axios.get(
        `https://api.quran.com/api/v4/tafsirs/${resourceId}/by_ayah/${surahNumber}:${ayahNumber}`,
        { timeout: 8000 }
      );
      if (fallbackRes.data?.tafsir?.text) {
        text = fallbackRes.data.tafsir.text;
        if (fallbackRes.data.tafsir.resource_name) {
          fetchedName = fallbackRes.data.tafsir.resource_name;
        }
      }
    } catch (fallbackError) {
      console.warn(`Failed to fetch tafsir for ${surahNumber}:${ayahNumber}`, fallbackError);
      throw fallbackError;
    }
  }

  const result: AyahTafsir = {
    surahNumber,
    ayahNumber,
    tafsirId: edition.id,
    tafsirName: fetchedName || edition.name,
    authorName: fetchedAuthor || edition.author,
    text,
    direction: edition.direction,
    language: edition.language,
  };

  tafsirCache.set(cacheKey, result);
  return result;
}

/**
 * Prefetch Tafsir for adjacent ayahs to ensure smooth reading transitions
 */
export function prefetchAdjacentAyahsTafsir(
  tafsirId: string,
  surahNumber: number,
  currentAyah: number,
  totalAyahs: number
): void {
  const nextAyah = currentAyah + 1;
  const prevAyah = currentAyah - 1;

  if (nextAyah <= totalAyahs) {
    const key = `${tafsirId}:${surahNumber}:${nextAyah}`;
    if (!tafsirCache.has(key)) {
      getTafsirForAyah(tafsirId, surahNumber, nextAyah).catch(() => {});
    }
  }

  if (prevAyah >= 1) {
    const key = `${tafsirId}:${surahNumber}:${prevAyah}`;
    if (!tafsirCache.has(key)) {
      getTafsirForAyah(tafsirId, surahNumber, prevAyah).catch(() => {});
    }
  }
}
