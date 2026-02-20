// OMDB ratings lookup by IMDB ID with aggressive caching to conserve 1000/day quota

import { getCached, setCache, TTL } from "@/services/cache/cache-manager";

const OMDB_BASE_URL = "https://www.omdbapi.com";

export interface OmdbRatings {
  imdbRating: string;
  rottenTomatoes: string | null;
  metascore: string | null;
}

interface OmdbApiResponse {
  Response: string;
  imdbRating?: string;
  Metascore?: string;
  Ratings?: Array<{ Source: string; Value: string }>;
}

export async function fetchOmdbRatings(
  imdbId: string,
): Promise<OmdbRatings | null> {
  if (!imdbId) return null;

  const cacheKey = `omdb-${imdbId}`;

  // Aggressively cache: return ANY cached value (stale or not) to conserve 1000/day quota.
  // OMDB ratings rarely change, so stale data is far better than burning quota.
  const cached = await getCached<OmdbRatings | null>(cacheKey);
  if (cached.value !== null) {
    return cached.value;
  }
  // Also check for explicitly cached null (movie not found in OMDB)
  if (!cached.isStale) {
    return null;
  }

  const apiKey = import.meta.env.VITE_OMDB_API_KEY;
  const url = `${OMDB_BASE_URL}?apikey=${apiKey}&i=${imdbId}`;

  const response = await fetch(url);
  if (!response.ok) {
    return null;
  }

  const data: OmdbApiResponse = await response.json();

  if (data.Response === "False") {
    // Cache null result to avoid re-fetching a movie OMDB doesn't have
    await setCache(cacheKey, null, TTL.OMDB_RATINGS);
    return null;
  }

  const rtRating = data.Ratings?.find((r) => r.Source === "Rotten Tomatoes");

  const ratings: OmdbRatings = {
    imdbRating: data.imdbRating === "N/A" ? "N/A" : data.imdbRating || "N/A",
    rottenTomatoes: rtRating?.Value || null,
    metascore: data.Metascore === "N/A" ? null : data.Metascore || null,
  };

  await setCache(cacheKey, ratings, TTL.OMDB_RATINGS);

  return ratings;
}
