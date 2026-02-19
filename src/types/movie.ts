// TMDB movie types and enriched movie type with OMDB data

export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  runtime: number | null;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genres: Array<{ id: number; name: string }>;
  genre_ids?: number[];
  original_language: string;
  adult: boolean;
}

export interface TMDBMovieDetails extends TMDBMovie {
  imdb_id: string | null;
  budget: number;
  revenue: number;
  tagline: string;
  status: string;
  production_companies: Array<{
    id: number;
    name: string;
    logo_path: string | null;
  }>;
  credits?: {
    cast: Array<{
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }>;
    crew: Array<{
      id: number;
      name: string;
      job: string;
      department: string;
    }>;
  };
  videos?: {
    results: Array<{
      key: string;
      site: string;
      type: string;
      name: string;
    }>;
  };
  'watch/providers'?: {
    results: Record<string, WatchProviderCountry>;
  };
}

export interface WatchProviderCountry {
  link: string;
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
  free?: WatchProvider[];
  ads?: WatchProvider[];
}

export interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priority: number;
}

export interface EnrichedMovie extends TMDBMovieDetails {
  omdb?: {
    imdbRating: string;
    rottenTomatoes: string;
    metascore: string;
  };
}

export interface TMDBDiscoverResponse {
  page: number;
  total_pages: number;
  total_results: number;
  results: TMDBMovie[];
}

export interface TMDBSearchResponse {
  page: number;
  total_pages: number;
  total_results: number;
  results: TMDBMovie[];
}
