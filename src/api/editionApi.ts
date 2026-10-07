import { Edition } from '../types';
import { apiClient, API_BASE_URL } from './quranApi';

let cachedEditions: Edition[] | null = null;
let cachedUrduEditions: Edition[] | null = null;

export interface UrduEditionMetadata {
  identifier: string;
  urduName: string;
  scholarEnglish: string;
  commentaryName?: string;
  description: string;
  popular: boolean;
  sampleAyahText?: string;
}

/**
 * Enriched dictionary of all available Urdu translations on AlQuran Cloud API
 */
export const KNOWN_URDU_EDITIONS: Record<string, UrduEditionMetadata> = {
  'ur.jalandhry': {
    identifier: 'ur.jalandhry',
    urduName: 'مولانا فتح محمد جالندھری',
    scholarEnglish: 'Fateh Muhammad Jalandhry',
    commentaryName: 'مستند و مقبول عام ترجمہ',
    description: 'برصغیر میں سب سے زیادہ پڑھا جانے والا مستند اور کلاسیکی عام فہم اردو ترجمہ۔',
    popular: true,
    sampleAyahText: 'شروع اللہ کا نام لے کر جو بڑا مہربان نہایت رحم والا ہے',
  },
  'ur.junagarhi': {
    identifier: 'ur.junagarhi',
    urduName: 'مولانا محمد جوناگڑھی',
    scholarEnglish: 'Muhammad Junagarhi (Bayan-ul-Quran)',
    commentaryName: 'تفسیر بیان القرآن و ابن کثیر',
    description: 'شاہ فہد قرآن کمپلیکس مدینہ منورہ سے شائع شدہ مستند سلفی ترجمہ۔',
    popular: true,
    sampleAyahText: 'شروع کرتا ہوں اللہ تعالیٰ کے نام سے جو بڑا مہربان نہایت رحم والا ہے',
  },
  'ur.maududi': {
    identifier: 'ur.maududi',
    urduName: 'سید ابوالاعلیٰ مودودی',
    scholarEnglish: "Abul A'ala Maududi (Tafhim-ul-Quran)",
    commentaryName: 'تفہیم القرآن',
    description: 'عصر حاضر کی ضروریات اور فکری اسلوب کے مطابق فصیح و بلیغ اردو ترجمہ۔',
    popular: true,
    sampleAyahText: 'اللہ کے نام سے جو رحمان اور رحیم ہے',
  },
  'ur.kanzuliman': {
    identifier: 'ur.kanzuliman',
    urduName: 'امام احمد رضا خان',
    scholarEnglish: 'Ahmed Raza Khan (Kanz-ul-Iman)',
    commentaryName: 'کنز الایمان فی ترجمۃ القرآن',
    description: 'برصغیر پاک و ہند کا مشہور و معروف عقیدت و ادب سے مزین اردو ترجمہ۔',
    popular: true,
    sampleAyahText: 'اللہ کے نام سے شروع جو نہایت مہربان رحم والا',
  },
  'ur.qadri': {
    identifier: 'ur.qadri',
    urduName: 'ڈاکٹر محمد طاہر القادری',
    scholarEnglish: 'Tahir-ul-Qadri (Irfan-ul-Quran)',
    commentaryName: 'عرفان القرآن',
    description: 'سلیس، رواں اور جدید اردو زبان میں عام فہم مستند ترجمہ۔',
    popular: true,
    sampleAyahText: 'اللہ کے نام سے شروع جو نہایت مہربان ہمیشہ رحم فرمانے والا ہے',
  },
  'ur.ahmedali': {
    identifier: 'ur.ahmedali',
    urduName: 'مولانا احمد علی لاہوری',
    scholarEnglish: 'Ahmed Ali Lahori',
    commentaryName: 'معارف القرآن / ترجمہ لاہوری',
    description: 'علمائے دیوبند کا کلاسیکی لفظی و با محاورہ اردو ترجمہ قرآن۔',
    popular: false,
    sampleAyahText: 'شروع اللہ کے نام سے جو سب پر مہربان نہایت رحم والا ہے',
  },
  'ur.jawadi': {
    identifier: 'ur.jawadi',
    urduName: 'علامہ سید ذیشان حیدر جوادی',
    scholarEnglish: 'Syed Zeeshan Haider Jawadi',
    commentaryName: 'انوار القرآن و حواشی',
    description: 'مکتبہ اہل بیت کا بلند پایہ تحقیقی و علمی اردو ترجمہ مع توضیحی حواشی۔',
    popular: false,
    sampleAyahText: 'اللہ کے نام سے جو بڑا مہربان اور نہایت رحم کرنے والا ہے',
  },
  'ur.najafi': {
    identifier: 'ur.najafi',
    urduName: 'علامہ محمد حسین نجفی',
    scholarEnglish: 'Muhammad Hussain Najafi',
    commentaryName: 'فیض الرحمن فی ترجمۃ القرآن',
    description: 'دقیق کلامی و فقہی مباحث کے ساتھ تفصیلی اردو ترجمہ۔',
    popular: false,
    sampleAyahText: 'اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے',
  },
};

/**
 * Helper to get Urdu metadata for a given edition identifier
 */
export function getUrduMetadata(identifier: string): UrduEditionMetadata | undefined {
  return KNOWN_URDU_EDITIONS[identifier];
}

/**
 * Fetch the list of all available translations from the API
 * with optional explicit language filtering (e.g. 'ur').
 */
export async function getTranslations(language?: string): Promise<Edition[]> {
  if (language === 'ur') {
    return getUrduTranslations();
  }
  return getEditions({ format: 'text', type: 'translation', language });
}

/**
 * Fetch and return all available Urdu translation editions from the API.
 * Explicitly fetches translations, filters for Urdu editions (e.g., 'ur.maududi', 'ur.junagarhi', etc.),
 * and enriches them with authentic Nastaliq Urdu titles, scholarly commentary metadata, and RTL direction.
 */
export async function getUrduTranslations(): Promise<Edition[]> {
  if (cachedUrduEditions && cachedUrduEditions.length > 0) {
    return cachedUrduEditions;
  }

  try {
    // 1. Fetch available editions from AlQuran Cloud API
    let rawEditions: Edition[] = [];
    try {
      rawEditions = await apiClient.get<Edition[]>(
        `${API_BASE_URL}/edition?format=text&language=ur&type=translation`
      );
    } catch {
      // fallback to fetching all editions
      const all = await apiClient.get<Edition[]>(`${API_BASE_URL}/edition`);
      rawEditions = all;
    }

    if (!rawEditions || !Array.isArray(rawEditions) || rawEditions.length === 0) {
      const all = await apiClient.get<Edition[]>(`${API_BASE_URL}/edition`);
      rawEditions = all;
    }

    // 2. Explicitly filter for Urdu translation editions (e.g. 'ur.maududi', 'ur.junagarhi', etc.)
    const urduEditions = rawEditions.filter((ed) => {
      const isUrduLang = ed.language?.toLowerCase() === 'ur';
      const isUrduIdentifier = ed.identifier.toLowerCase().startsWith('ur.') || ed.identifier in KNOWN_URDU_EDITIONS;
      const isTextOrTranslation = (!ed.format || ed.format === 'text') && (!ed.type || ed.type === 'translation');
      return (isUrduLang || isUrduIdentifier) && isTextOrTranslation;
    });

    // Preferred scholarly presentation order with prominence for ur.maududi, ur.junagarhi, ur.jalandhry
    const preferredOrder = [
      'ur.jalandhry',
      'ur.junagarhi',
      'ur.maududi',
      'ur.kanzuliman',
      'ur.qadri',
      'ur.ahmedali',
      'ur.jawadi',
      'ur.najafi',
    ];

    // Ensure all known curated editions exist even if API returned a subset
    const editionMap = new Map<string, Edition>();

    // Add API-returned items
    urduEditions.forEach((ed) => {
      const meta = KNOWN_URDU_EDITIONS[ed.identifier];
      editionMap.set(ed.identifier, {
        ...ed,
        name: meta ? meta.urduName : ed.name,
        englishName: meta ? meta.scholarEnglish : ed.englishName,
        direction: 'rtl',
      });
    });

    // Ensure landmark editions (like ur.maududi and ur.junagarhi) are present
    Object.values(KNOWN_URDU_EDITIONS).forEach((m) => {
      if (!editionMap.has(m.identifier)) {
        editionMap.set(m.identifier, {
          identifier: m.identifier,
          language: 'ur',
          name: m.urduName,
          englishName: m.scholarEnglish,
          format: 'text',
          type: 'translation',
          direction: 'rtl',
        });
      }
    });

    const enriched: Edition[] = Array.from(editionMap.values());

    // Sort: preferred order first, then remaining alphabetically
    enriched.sort((a, b) => {
      const aIdx = preferredOrder.indexOf(a.identifier);
      const bIdx = preferredOrder.indexOf(b.identifier);
      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      if (aIdx !== -1) return -1;
      if (bIdx !== -1) return 1;
      return a.englishName.localeCompare(b.englishName);
    });

    cachedUrduEditions = enriched;
    return enriched;
  } catch (error) {
    console.warn('Failed to fetch Urdu translations from API, using curated local data', error);

    // Reliable fallback based on API verified list
    const fallback: Edition[] = Object.values(KNOWN_URDU_EDITIONS).map((m) => ({
      identifier: m.identifier,
      language: 'ur',
      name: m.urduName,
      englishName: m.scholarEnglish,
      format: 'text',
      type: 'translation',
      direction: 'rtl',
    }));

    cachedUrduEditions = fallback;
    return fallback;
  }
}

/**
 * Fetch list of all editions supported by the API
 */
export async function getEditions(filters?: {
  format?: 'text' | 'audio';
  type?: 'quran' | 'translation' | 'transliteration' | 'tafsir' | 'versebyverse';
  language?: string;
}): Promise<Edition[]> {
  // If specific Urdu translations requested, use the dedicated enriched fetcher
  if (
    filters?.language === 'ur' &&
    (!filters.type || filters.type === 'translation') &&
    (!filters.format || filters.format === 'text')
  ) {
    return getUrduTranslations();
  }

  if (!cachedEditions) {
    cachedEditions = await apiClient.get<Edition[]>(`${API_BASE_URL}/edition`);
  }

  let filtered = cachedEditions;

  if (filters?.format) {
    filtered = filtered.filter((ed) => ed.format === filters.format);
  }
  if (filters?.type) {
    filtered = filtered.filter((ed) => ed.type === filters.type);
  }
  if (filters?.language) {
    filtered = filtered.filter((ed) => ed.language === filters.language);
  }

  // Ensure any Urdu editions in the result are enriched with proper RTL and names
  return filtered.map((ed) => {
    if (ed.language === 'ur') {
      const meta = KNOWN_URDU_EDITIONS[ed.identifier];
      return {
        ...ed,
        name: meta ? meta.urduName : ed.name,
        englishName: meta ? meta.scholarEnglish : ed.englishName,
        direction: 'rtl',
      };
    }
    return ed;
  });
}

/**
 * Get popular/curated translation editions with Urdu translations prominently placed first
 */
export async function getPopularTranslations(): Promise<Edition[]> {
  const [urduTranslations, allTranslations] = await Promise.all([
    getUrduTranslations().catch(() => []),
    getEditions({ format: 'text', type: 'translation' }).catch(() => []),
  ]);

  // Exclude Urdu from allTranslations to avoid duplication
  const nonUrdu = allTranslations.filter((t) => t.language !== 'ur');

  // Preferred international identifiers
  const preferredNonUrduIds = [
    'en.sahih',
    'en.pickthall',
    'en.yusufali',
    'en.arberry',
    'en.asad',
    'fr.hamidullah',
    'id.indonesian',
    'tr.ates',
    'es.cortes',
    'de.bubenheim',
    'ru.kuliev',
    'bn.bengali',
    'zh.jian',
    'hi.hindi',
    'fa.ayati',
  ];

  // Sort non-Urdu translations
  const sortedNonUrdu = [...nonUrdu].sort((a, b) => {
    const aIndex = preferredNonUrduIds.indexOf(a.identifier);
    const bIndex = preferredNonUrduIds.indexOf(b.identifier);
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return a.englishName.localeCompare(b.englishName);
  });

  // Urdu editions come first, followed by curated international editions
  return [...urduTranslations, ...sortedNonUrdu];
}

/**
 * Get available audio reciter editions
 */
export async function getAudioReciters(): Promise<Edition[]> {
  return getEditions({ format: 'audio' });
}

/**
 * Get all edition types: [quran, versebyverse, transliteration, translation, tafsir]
 */
export async function getEditionTypes(): Promise<string[]> {
  return apiClient.get<string[]>(`${API_BASE_URL}/edition/type`);
}

/**
 * Get all editions for a specific type (/edition/type/{type})
 */
export async function getEditionsByType(type: string): Promise<Edition[]> {
  return apiClient.get<Edition[]>(`${API_BASE_URL}/edition/type/${type}`);
}

/**
 * Get all edition formats: [text, audio]
 */
export async function getEditionFormats(): Promise<string[]> {
  return apiClient.get<string[]>(`${API_BASE_URL}/edition/format`);
}

/**
 * Get all editions for a specific format (/edition/format/{format})
 */
export async function getEditionsByFormat(format: string): Promise<Edition[]> {
  return apiClient.get<Edition[]>(`${API_BASE_URL}/edition/format/${format}`);
}

/**
 * Get all edition languages
 */
export async function getEditionLanguages(): Promise<string[]> {
  return apiClient.get<string[]>(`${API_BASE_URL}/edition/language`);
}

/**
 * Get all editions for a specific language (/edition/language/{lang})
 */
export async function getEditionsByLanguage(lang: string): Promise<Edition[]> {
  if (lang === 'ur') {
    return getUrduTranslations();
  }
  return apiClient.get<Edition[]>(`${API_BASE_URL}/edition/language/${lang}`);
}
