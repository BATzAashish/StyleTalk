// Tenor GIF API Service

const TENOR_API_KEY = import.meta.env.VITE_TENOR_API_KEY;
const TENOR_BASE_URL = 'https://tenor.googleapis.com/v2';

export interface TenorGif {
  id: string;
  url: string;
  preview: string;
  title: string;
  width: number;
  height: number;
}

interface TenorSearchResponse {
  results: Array<{
    id: string;
    title: string;
    media_formats: {
      gif: {
        url: string;
        dims: number[];
      };
      tinygif: {
        url: string;
        dims: number[];
      };
      nanogif: {
        url: string;
        dims: number[];
      };
    };
  }>;
}

// Map tone to appropriate GIF search queries
const toneToGifQueries: Record<string, string[]> = {
  formal: ['professional', 'business', 'handshake', 'office'],
  casual: ['happy', 'thumbs up', 'smile', 'friendly'],
  genz: ['fire', 'vibes', 'mood', 'cool', 'lit'],
  concise: ['fast', 'quick', 'lightning', 'speed'],
  detailed: ['thinking', 'explaining', 'reading', 'study'],
  grammar: ['correct', 'checkmark', 'success', 'perfect'],
  neutral: ['thumbs up', 'okay', 'good', 'nice'],
  translation: ['world', 'languages', 'travel', 'hello'],
};

// Cache for GIF results
const gifCache = new Map<string, TenorGif[]>();

/**
 * Search for GIFs based on tone
 */
export const searchGifsByTone = async (
  tone: string,
  limit: number = 5
): Promise<TenorGif[]> => {
  // Check cache first
  const cacheKey = `${tone}-${limit}`;
  if (gifCache.has(cacheKey)) {
    console.log(`[Tenor] Cache hit for tone: ${tone}`);
    return gifCache.get(cacheKey)!;
  }

  try {
    // Get search queries for this tone
    const queries = toneToGifQueries[tone] || toneToGifQueries.casual;
    const randomQuery = queries[Math.floor(Math.random() * queries.length)];

    const url = new URL(`${TENOR_BASE_URL}/search`);
    url.searchParams.append('q', randomQuery);
    url.searchParams.append('key', TENOR_API_KEY);
    url.searchParams.append('limit', limit.toString());
    url.searchParams.append('media_filter', 'gif,tinygif');
    url.searchParams.append('contentfilter', 'medium');

    console.log(`[Tenor] Searching GIFs for tone: ${tone}, query: ${randomQuery}`);

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Tenor API error: ${response.status}`);
    }

    const data: TenorSearchResponse = await response.json();

    // Transform Tenor response to our format
    const gifs: TenorGif[] = data.results.map(result => ({
      id: result.id,
      url: result.media_formats.gif.url,
      preview: result.media_formats.tinygif?.url || result.media_formats.nanogif?.url || result.media_formats.gif.url,
      title: result.title,
      width: result.media_formats.gif.dims[0],
      height: result.media_formats.gif.dims[1],
    }));

    // Cache the results
    gifCache.set(cacheKey, gifs);

    console.log(`[Tenor] Found ${gifs.length} GIFs for tone: ${tone}`);
    return gifs;

  } catch (error) {
    console.error('[Tenor] Error fetching GIFs:', error);
    return [];
  }
};

/**
 * Search for GIFs based on custom query
 */
export const searchGifs = async (
  query: string,
  limit: number = 5
): Promise<TenorGif[]> => {
  const cacheKey = `custom-${query}-${limit}`;
  if (gifCache.has(cacheKey)) {
    return gifCache.get(cacheKey)!;
  }

  try {
    const url = new URL(`${TENOR_BASE_URL}/search`);
    url.searchParams.append('q', query);
    url.searchParams.append('key', TENOR_API_KEY);
    url.searchParams.append('limit', limit.toString());
    url.searchParams.append('media_filter', 'gif,tinygif');

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Tenor API error: ${response.status}`);
    }

    const data: TenorSearchResponse = await response.json();

    const gifs: TenorGif[] = data.results.map(result => ({
      id: result.id,
      url: result.media_formats.gif.url,
      preview: result.media_formats.tinygif?.url || result.media_formats.nanogif?.url || result.media_formats.gif.url,
      title: result.title,
      width: result.media_formats.gif.dims[0],
      height: result.media_formats.gif.dims[1],
    }));

    gifCache.set(cacheKey, gifs);
    return gifs;

  } catch (error) {
    console.error('[Tenor] Error searching GIFs:', error);
    return [];
  }
};

/**
 * Get featured/trending GIFs
 */
export const getFeaturedGifs = async (limit: number = 10): Promise<TenorGif[]> => {
  try {
    const url = new URL(`${TENOR_BASE_URL}/featured`);
    url.searchParams.append('key', TENOR_API_KEY);
    url.searchParams.append('limit', limit.toString());
    url.searchParams.append('media_filter', 'gif,tinygif');

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Tenor API error: ${response.status}`);
    }

    const data: TenorSearchResponse = await response.json();

    return data.results.map(result => ({
      id: result.id,
      url: result.media_formats.gif.url,
      preview: result.media_formats.tinygif?.url || result.media_formats.nanogif?.url || result.media_formats.gif.url,
      title: result.title,
      width: result.media_formats.gif.dims[0],
      height: result.media_formats.gif.dims[1],
    }));

  } catch (error) {
    console.error('[Tenor] Error fetching featured GIFs:', error);
    return [];
  }
};

/**
 * Clear GIF cache
 */
export const clearGifCache = () => {
  gifCache.clear();
  console.log('[Tenor] Cache cleared');
};
