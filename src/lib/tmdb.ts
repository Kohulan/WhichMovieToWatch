import { TMDB_BASE_URL } from "./constants";
import type {
  TMDBDiscoverResponse,
  TMDBSearchResponse,
  MovieDetail,
} from "@/types/movie";

const API_KEY = process.env.TMDB_API_KEY || "";

async function tmdbFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.set("api_key", API_KEY);
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });

  const response = await fetch(url.toString(), {
    next: { revalidate: 300 }, // Cache for 5 minutes
  });

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function discoverMovies(params: {
  page?: number;
  genre?: string;
  provider?: string;
  minRating?: number;
  minVotes?: number;
  sortBy?: string;
  year?: number;
  language?: string;
  region?: string;
}): Promise<TMDBDiscoverResponse> {
  const queryParams: Record<string, string> = {
    page: String(params.page || Math.floor(Math.random() * 20) + 1),
    sort_by: params.sortBy || "popularity.desc",
    "vote_count.gte": String(params.minVotes ?? 500),
    "vote_average.gte": String(params.minRating ?? 6.0),
    include_adult: "false",
  };

  if (params.genre && params.genre !== "any") {
    queryParams.with_genres = params.genre;
  }
  if (params.provider) {
    queryParams.with_watch_providers = params.provider;
    queryParams.watch_region = params.region || "US";
  }
  if (params.year) {
    queryParams.primary_release_year = String(params.year);
  }
  if (params.language) {
    queryParams.with_original_language = params.language;
  }

  return tmdbFetch<TMDBDiscoverResponse>("/discover/movie", queryParams);
}

export async function searchMovies(
  query: string,
  page: number = 1,
  year?: number
): Promise<TMDBSearchResponse> {
  const params: Record<string, string> = {
    query,
    page: String(page),
    include_adult: "false",
  };
  if (year) params.year = String(year);

  return tmdbFetch<TMDBSearchResponse>("/search/movie", params);
}

export async function getMovieDetail(id: number): Promise<MovieDetail> {
  return tmdbFetch<MovieDetail>(`/movie/${id}`, {
    append_to_response: "videos,credits,watch/providers",
  });
}

export async function getTrending(): Promise<TMDBDiscoverResponse> {
  return tmdbFetch<TMDBDiscoverResponse>("/trending/movie/week");
}
