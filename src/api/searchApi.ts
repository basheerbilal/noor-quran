import { SearchResult } from '../types';
import { apiClient, API_BASE_URL, QuranApiError } from './quranApi';
import { toast } from '../utils/toast';

/**
 * Search the Quran using the AlQuran Cloud search endpoints
 *
 * Supported patterns:
 * /search/{keyword}
 * /search/{keyword}/{surah}
 * /search/{keyword}/{surah}/{language}
 * /search/{keyword}/all/{edition}
 */
export async function searchQuran(
  keyword: string,
  surahNumber?: number | 'all',
  editionOrLanguage?: string,
  offset?: number,
  limit?: number
): Promise<SearchResult> {
  const trimmed = keyword.trim();
  if (!trimmed) {
    return { count: 0, matches: [] };
  }

  const encodedWord = encodeURIComponent(trimmed);
  let url = `${API_BASE_URL}/search/${encodedWord}`;

  if (surahNumber && surahNumber !== 'all') {
    url += `/${surahNumber}`;
    if (editionOrLanguage) {
      url += `/${editionOrLanguage}`;
    }
  } else if (editionOrLanguage) {
    url += `/all/${editionOrLanguage}`;
  }

  const queryParams = new URLSearchParams();
  if (offset !== undefined) queryParams.set('offset', offset.toString());
  if (limit !== undefined) queryParams.set('limit', limit.toString());
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  url += queryString;

  try {
    // For search, suppress automatic 404 toast because 404 simply means 0 matches found
    const response = await apiClient.request(url, { skipErrorToast: true });
    const json = await response.json();
    if (json.code === 200 && json.data) {
      return {
        count: json.data.count || (json.data.matches ? json.data.matches.length : 0),
        total: json.data.total,
        offset: json.data.offset,
        limit: json.data.limit,
        matches: json.data.matches || [],
      };
    }
    return { count: 0, matches: [] };
  } catch (err: any) {
    if (err instanceof QuranApiError) {
      // 404 is normal for 0 search matches in AlQuran Cloud API
      if (err.is404 || err.status === 404) {
        return { count: 0, matches: [] };
      }
      // Notify for genuine network or server errors
      if (err.isNetworkError) {
        toast.error('Search failed due to network connection issues. Please check your internet.', {
          title: 'Network Offline',
        });
      } else {
        toast.error(err.message || 'Search request failed. Please try again.', {
          title: 'Search Error',
        });
      }
    }
    return { count: 0, matches: [] };
  }
}
