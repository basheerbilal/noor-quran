import axios, {
  AxiosInstance,
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import {
  Surah,
  SurahDetail,
  Ayah,
  JuzData,
  PageData,
  ManzilData,
  RukuData,
  HizbQuarterData,
  SajdaVerse,
  QuranMeta,
} from '../types';
import { toast } from '../utils/toast';

export const API_BASE_URL = 'https://api.alquran.cloud/v1';

/**
 * Custom request configuration extending AxiosRequestConfig
 */
export interface RequestConfig extends AxiosRequestConfig {
  skipErrorToast?: boolean;
  skipCache?: boolean;
  cacheTimeMs?: number;
  timeoutMs?: number;
}

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipErrorToast?: boolean;
    skipCache?: boolean;
    cacheTimeMs?: number;
    timeoutMs?: number;
  }
}

/**
 * Standardized error structure representing Quran API failures
 */
export class QuranApiError extends Error {
  public status?: number;
  public statusText?: string;
  public endpoint: string;
  public isNetworkError: boolean;
  public isTimeout: boolean;
  public is404: boolean;
  public is500: boolean;
  public code?: string | number;
  public originalError?: unknown;

  constructor(params: {
    message: string;
    status?: number;
    statusText?: string;
    endpoint: string;
    isNetworkError?: boolean;
    isTimeout?: boolean;
    is404?: boolean;
    is500?: boolean;
    code?: string | number;
    originalError?: unknown;
  }) {
    super(params.message);
    this.name = 'QuranApiError';
    this.status = params.status;
    this.statusText = params.statusText;
    this.endpoint = params.endpoint;
    this.isNetworkError = Boolean(params.isNetworkError);
    this.isTimeout = Boolean(params.isTimeout);
    this.is404 = Boolean(params.is404);
    this.is500 = Boolean(params.is500);
    this.code = params.code;
    this.originalError = params.originalError;
  }
}

/**
 * Create centralized Axios instance for AlQuran Cloud API
 */
export const quranAxios: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
  },
});

// Alias for convenience
export const axiosInstance = quranAxios;

/**
 * Centralized Request Interceptor
 * Checks client connectivity before launching requests
 */
quranAxios.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // If timeoutMs was provided in config, apply it to axios timeout
    if (config.timeoutMs) {
      config.timeout = config.timeoutMs;
    }

    // Check offline connectivity
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      if (!config.skipErrorToast) {
        toast.error('You appear to be offline. Please check your internet connection.', {
          title: 'Network Offline',
          duration: 6000,
        });
      }
      return Promise.reject(
        new QuranApiError({
          message: 'No internet connection. Please check your network connection.',
          endpoint: config.url || '',
          isNetworkError: true,
        })
      );
    }

    return config;
  },
  (error: any) => Promise.reject(error)
);

/**
 * Centralized Response Interceptor
 * Catches 404, 500, network, and rate-limit errors globally,
 * triggering user-friendly toast notifications.
 */
quranAxios.interceptors.response.use(
  (response: AxiosResponse) => {
    const config = response.config as RequestConfig;
    const body = response.data;

    // AlQuran Cloud API sometimes returns HTTP 200 with an internal failure code in JSON
    // e.g. { code: 404, status: "Not Found", data: "Could not find..." }
    if (body && typeof body === 'object' && body.code && body.code !== 200 && body.status !== 'OK') {
      const is404 = body.code === 404;
      const is500 = typeof body.code === 'number' && body.code >= 500;
      const errorMessage =
        typeof body.data === 'string'
          ? body.data
          : body.status || 'Failed to retrieve Quran data';

      if (!config?.skipErrorToast) {
        if (is404) {
          toast.warning(errorMessage || 'The requested Quran resource was not found (404).', {
            title: 'Not Found (404)',
          });
        } else if (is500) {
          toast.error('The AlQuran Cloud server encountered an issue. Please try again.', {
            title: 'Server Error (500)',
          });
        } else {
          toast.error(errorMessage, {
            title: `API Notice (${body.code})`,
          });
        }
      }

      const apiError = new QuranApiError({
        message: errorMessage,
        code: body.code,
        status: body.code,
        endpoint: config?.url || '',
        is404,
        is500,
      });

      return Promise.reject(apiError);
    }

    // Attach .json() helper for backward compatibility with Fetch API response style
    if (!(response as any).json) {
      (response as any).json = async () => response.data;
    }

    return response;
  },
  (error: AxiosError | any) => {
    // If already wrapped as a QuranApiError, forward immediately
    if (error instanceof QuranApiError) {
      return Promise.reject(error);
    }

    const config = (error?.config || {}) as RequestConfig;
    const skipToast = Boolean(config.skipErrorToast);

    const status = error.response?.status;
    const statusText = error.response?.statusText;
    const endpoint = config.url || error.config?.url || '';
    const responseData = error.response?.data;

    // Detect error categories
    const isNetworkError =
      !error.response ||
      error.code === 'ERR_NETWORK' ||
      error.message === 'Network Error' ||
      (typeof navigator !== 'undefined' && !navigator.onLine);

    const isTimeout =
      error.code === 'ECONNABORTED' ||
      Boolean(error.message?.toLowerCase().includes('timeout'));

    const is404 = status === 404;
    const is500 = Boolean(status && status >= 500);

    // Extract descriptive message if available
    let errorMessage = error.message || 'An unexpected error occurred';
    if (responseData && typeof responseData === 'object') {
      if (typeof responseData.data === 'string') {
        errorMessage = responseData.data;
      } else if (typeof responseData.message === 'string') {
        errorMessage = responseData.message;
      }
    }

    // Trigger centralized toasts for each distinct case
    if (!skipToast) {
      if (is404) {
        toast.warning('The requested Surah, Ayah, or edition was not found (404).', {
          title: 'Not Found (404)',
        });
      } else if (is500) {
        toast.error('The AlQuran Cloud server is temporarily experiencing issues (500). Please try again.', {
          title: 'Server Error (500)',
        });
      } else if (isTimeout) {
        toast.error('The Quran API request timed out. Please check your internet connection.', {
          title: 'Connection Timeout',
        });
      } else if (isNetworkError) {
        toast.error('Unable to reach the Quran API. Please check your internet connection.', {
          title: 'Network Connection Error',
          duration: 6000,
        });
      } else if (status === 429) {
        toast.warning('Too many requests sent to the Quran API. Please wait a moment.', {
          title: 'Rate Limit Reached',
        });
      } else {
        toast.error(errorMessage, {
          title: status ? `Error (${status})` : 'Request Failed',
        });
      }
    }

    const apiError = new QuranApiError({
      message: is404
        ? 'The requested Quran resource or verse could not be found (404).'
        : is500
        ? 'The AlQuran Cloud server encountered an internal error (500).'
        : isNetworkError
        ? 'Network error. Unable to connect to the Quran API.'
        : errorMessage,
      status,
      statusText,
      endpoint,
      is404,
      is500,
      isNetworkError,
      isTimeout,
      code: error.code || status,
      originalError: error,
    });

    return Promise.reject(apiError);
  }
);

/**
 * Unified API Client wrapper managing Axios calls,
 * in-memory caching, and typed access.
 */
export class QuranApiClient {
  public axios: AxiosInstance = quranAxios;

  /**
   * Request method providing an AxiosResponse with a .json() compatibility helper
   */
  public async request(url: string, config: RequestConfig = {}): Promise<any> {
    const response = await this.axios.request({
      url,
      method: (config.method as any) || 'GET',
      ...config,
    });

    if (!(response as any).json) {
      (response as any).json = async () => response.data;
    }

    return response;
  }

  /**
   * Typed GET method unwrapping the response data
   */
  public async get<T>(url: string, config: RequestConfig = {}): Promise<T> {
    const response = await this.axios.get<any>(url, config);
    const body = response.data;
    return (body && body.data !== undefined ? body.data : body) as T;
  }
}

// Global singleton instance
export const apiClient = new QuranApiClient();

// In-memory cache for fast repeated reads
const cache = new Map<string, { data: any; timestamp: number }>();

/**
 * Standardized fetch wrapper with automatic caching, error handling, and toast notifications
 */
export async function fetchWithCache<T>(
  url: string,
  cacheTimeMs = 1000 * 60 * 30,
  config: RequestConfig = {}
): Promise<T> {
  const skipCache = config.skipCache ?? false;

  if (!skipCache) {
    const cached = cache.get(url);
    if (cached && Date.now() - cached.timestamp < cacheTimeMs) {
      return cached.data as T;
    }
  }

  const data = await apiClient.get<T>(url, {
    ...config,
    cacheTimeMs,
  });

  // Only store successful non-null data in cache
  if (data !== undefined && data !== null) {
    cache.set(url, { data, timestamp: Date.now() });
  }

  return data;
}

/**
 * Clear the in-memory cache if needed
 */
export function clearQuranCache(): void {
  cache.clear();
}

/**
 * Fetch all 114 Surahs
 */
export async function getSurahs(): Promise<Surah[]> {
  return fetchWithCache<Surah[]>(`${API_BASE_URL}/surah`);
}

/**
 * Fetch a single Surah in a specific edition
 */
export async function getSurah(
  surahNumber: number,
  edition = 'quran-uthmani'
): Promise<SurahDetail> {
  return fetchWithCache<SurahDetail>(`${API_BASE_URL}/surah/${surahNumber}/${edition}`);
}

/**
 * Fetch Surah with both Arabic text and chosen translation
 */
export async function getSurahWithTranslation(
  surahNumber: number,
  translationEdition = 'en.sahih'
): Promise<{ arabic: SurahDetail; translation: SurahDetail }> {
  const url = `${API_BASE_URL}/surah/${surahNumber}/editions/quran-uthmani,${translationEdition}`;
  try {
    const data = await fetchWithCache<SurahDetail[]>(url, undefined, { skipErrorToast: true });
    if (Array.isArray(data) && data.length >= 2) {
      return { arabic: data[0], translation: data[1] };
    }
    if (Array.isArray(data) && data.length === 1) {
      const fallbackTranslation = await getSurah(surahNumber, translationEdition);
      return { arabic: data[0], translation: fallbackTranslation };
    }
  } catch {
    // If the combined editions endpoint failed, attempt separate requests
    const [arabic, translation] = await Promise.all([
      getSurah(surahNumber, 'quran-uthmani'),
      getSurah(surahNumber, translationEdition),
    ]);
    return { arabic, translation };
  }
  throw new QuranApiError({
    message: 'Could not parse Surah editions',
    endpoint: url,
  });
}

/**
 * Fetch Surah audio recitation (e.g. ar.alafasy)
 */
export async function getSurahAudio(
  surahNumber: number,
  reciter = 'ar.alafasy',
  config: RequestConfig = {}
): Promise<SurahDetail> {
  return fetchWithCache<SurahDetail>(
    `${API_BASE_URL}/surah/${surahNumber}/${reciter}`,
    undefined,
    config
  );
}

/**
 * Fetch a single Ayah
 */
export async function getAyah(
  ayahNumber: number,
  edition = 'quran-uthmani'
): Promise<Ayah> {
  return fetchWithCache<Ayah>(`${API_BASE_URL}/ayah/${ayahNumber}/${edition}`);
}

/**
 * Fetch a random Ayah with translation
 */
export async function getRandomAyah(translationEdition = 'en.sahih'): Promise<{
  arabic: Ayah;
  translation: Ayah;
}> {
  const url = `${API_BASE_URL}/ayah/random/editions/quran-uthmani,${translationEdition}`;
  try {
    const data = await apiClient.get<Ayah[]>(url, { skipCache: true, skipErrorToast: true });
    if (Array.isArray(data) && data.length >= 2) {
      return { arabic: data[0], translation: data[1] };
    }
  } catch {
    // Fallback: single random
  }

  const single = await apiClient.get<Ayah>(`${API_BASE_URL}/ayah/random`, { skipCache: true });
  return { arabic: single, translation: single };
}

/**
 * Fetch a specific Ayah with both Arabic and translation
 */
export async function getAyahWithTranslation(
  surahNumber: number,
  ayahNumber: number,
  translationEdition = 'en.sahih'
): Promise<{
  arabic: Ayah;
  translation: Ayah;
}> {
  const url = `${API_BASE_URL}/ayah/${surahNumber}:${ayahNumber}/editions/quran-uthmani,${translationEdition}`;
  try {
    const data = await apiClient.get<Ayah[]>(url, { skipErrorToast: true });
    if (Array.isArray(data) && data.length >= 2) {
      return { arabic: data[0], translation: data[1] };
    }
  } catch {
    // fallback
  }

  const single = await apiClient.get<Ayah>(
    `${API_BASE_URL}/ayah/${surahNumber}:${ayahNumber}/quran-uthmani`
  );
  return { arabic: single, translation: single };
}

/**
 * Fetch Juz verses in Arabic and translation
 */
export async function getJuz(
  juzNumber: number,
  translationEdition = 'en.sahih'
): Promise<{ arabic: JuzData; translation: JuzData }> {
  const [arabic, translation] = await Promise.all([
    fetchWithCache<JuzData>(`${API_BASE_URL}/juz/${juzNumber}/quran-uthmani`),
    fetchWithCache<JuzData>(`${API_BASE_URL}/juz/${juzNumber}/${translationEdition}`),
  ]);
  return { arabic, translation };
}

/**
 * Fetch Page verses in Arabic and translation
 */
export async function getPage(
  pageNumber: number,
  translationEdition = 'en.sahih'
): Promise<{ arabic: PageData; translation: PageData }> {
  const [arabic, translation] = await Promise.all([
    fetchWithCache<PageData>(`${API_BASE_URL}/page/${pageNumber}/quran-uthmani`),
    fetchWithCache<PageData>(`${API_BASE_URL}/page/${pageNumber}/${translationEdition}`),
  ]);
  return { arabic, translation };
}

/**
 * Fetch Sajda (prostration) verses
 */
export async function getSajda(
  translationEdition = 'en.sahih'
): Promise<{ arabicVerses: SajdaVerse[]; translationVerses: SajdaVerse[] }> {
  const [arabicData, translationData] = await Promise.all([
    fetchWithCache<{ ayahs: SajdaVerse[] }>(`${API_BASE_URL}/sajda/quran-uthmani`),
    fetchWithCache<{ ayahs: SajdaVerse[] }>(`${API_BASE_URL}/sajda/${translationEdition}`),
  ]);
  return {
    arabicVerses: arabicData.ayahs,
    translationVerses: translationData.ayahs,
  };
}

/**
 * Fetch Quran Meta information (counts of surahs, ayahs, juzs, pages, etc.)
 */
export async function getMeta(): Promise<QuranMeta> {
  return fetchWithCache<QuranMeta>(`${API_BASE_URL}/meta`, 1000 * 60 * 60 * 24);
}

/**
 * Fetch Manzil verses (1 to 7 stages) in Arabic and translation
 */
export async function getManzil(
  manzilNumber: number,
  translationEdition = 'en.sahih',
  offset?: number,
  limit?: number
): Promise<{ arabic: ManzilData; translation: ManzilData }> {
  const queryParams = new URLSearchParams();
  if (offset !== undefined) queryParams.set('offset', offset.toString());
  if (limit !== undefined) queryParams.set('limit', limit.toString());
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

  const [arabic, translation] = await Promise.all([
    fetchWithCache<ManzilData>(`${API_BASE_URL}/manzil/${manzilNumber}/quran-uthmani${queryString}`),
    fetchWithCache<ManzilData>(`${API_BASE_URL}/manzil/${manzilNumber}/${translationEdition}${queryString}`),
  ]);
  return { arabic, translation };
}

/**
 * Fetch Ruku verses (1 to 556 sections) in Arabic and translation
 */
export async function getRuku(
  rukuNumber: number,
  translationEdition = 'en.sahih',
  offset?: number,
  limit?: number
): Promise<{ arabic: RukuData; translation: RukuData }> {
  const queryParams = new URLSearchParams();
  if (offset !== undefined) queryParams.set('offset', offset.toString());
  if (limit !== undefined) queryParams.set('limit', limit.toString());
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

  const [arabic, translation] = await Promise.all([
    fetchWithCache<RukuData>(`${API_BASE_URL}/ruku/${rukuNumber}/quran-uthmani${queryString}`),
    fetchWithCache<RukuData>(`${API_BASE_URL}/ruku/${rukuNumber}/${translationEdition}${queryString}`),
  ]);
  return { arabic, translation };
}

/**
 * Fetch Hizb Quarter verses (1 to 240) in Arabic and translation
 */
export async function getHizbQuarter(
  hizbQuarterNumber: number,
  translationEdition = 'en.sahih',
  offset?: number,
  limit?: number
): Promise<{ arabic: HizbQuarterData; translation: HizbQuarterData }> {
  const queryParams = new URLSearchParams();
  if (offset !== undefined) queryParams.set('offset', offset.toString());
  if (limit !== undefined) queryParams.set('limit', limit.toString());
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

  const [arabic, translation] = await Promise.all([
    fetchWithCache<HizbQuarterData>(`${API_BASE_URL}/hizbQuarter/${hizbQuarterNumber}/quran-uthmani${queryString}`),
    fetchWithCache<HizbQuarterData>(`${API_BASE_URL}/hizbQuarter/${hizbQuarterNumber}/${translationEdition}${queryString}`),
  ]);
  return { arabic, translation };
}

/**
 * Fetch Ayah for multiple editions simultaneously (/ayah/{number}/editions/{editions})
 */
export async function getAyahEditions(
  ayahNumber: number,
  editions: string[]
): Promise<Ayah[]> {
  const editionsStr = editions.join(',');
  return fetchWithCache<Ayah[]>(`${API_BASE_URL}/ayah/${ayahNumber}/editions/${editionsStr}`);
}
