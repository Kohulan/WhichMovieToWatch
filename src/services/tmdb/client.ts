// Base TMDB HTTP client with retry and rate limit handling

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export async function tmdbFetch<T>(
  path: string,
  params?: Record<string, string | number | boolean>,
  retries = 3,
): Promise<T> {
  const apiKey = import.meta.env.VITE_TMDB_API_KEY;
  const url = new URL(`${TMDB_BASE_URL}${path}`);
  url.searchParams.set('api_key', apiKey);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value));
    }
  }

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url.toString());

      if (response.status === 429) {
        // Rate limited — exponential backoff, max 30s
        const delay = Math.min(Math.pow(2, attempt) * 1000, 30000);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      if (!response.ok) {
        const body = await response.json().catch(() => ({ status_message: response.statusText }));
        throw new Error(`TMDB ${response.status}: ${body.status_message || response.statusText}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      // Network error (not HTTP error) — retry with linear backoff
      if (error instanceof TypeError || (error instanceof Error && !error.message.startsWith('TMDB '))) {
        if (attempt < retries - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
          continue;
        }
      }
      throw error;
    }
  }

  // Should not reach here, but satisfies TypeScript
  throw new Error('TMDB: max retries exceeded');
}

export function getPosterUrl(
  path: string | null,
  size: 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500',
): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function getBackdropUrl(
  path: string | null,
  size: 'w300' | 'w780' | 'w1280' | 'original' = 'w1280',
): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}
