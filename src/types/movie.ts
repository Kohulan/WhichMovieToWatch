export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  original_language: string;
  popularity: number;
  adult: boolean;
}

export interface MovieDetail extends Movie {
  runtime: number | null;
  genres: Genre[];
  tagline: string | null;
  budget: number;
  revenue: number;
  status: string;
  production_companies: ProductionCompany[];
  videos?: { results: Video[] };
  credits?: { cast: Cast[]; crew: Crew[] };
  "watch/providers"?: WatchProviderResponse;
}

export interface Genre {
  id: number;
  name: string;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface Crew {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface ProductionCompany {
  id: number;
  name: string;
  logo_path: string | null;
}

export interface StreamingProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priority: number;
}

export interface WatchProviderResponse {
  results: Record<
    string,
    {
      link?: string;
      flatrate?: StreamingProvider[];
      rent?: StreamingProvider[];
      buy?: StreamingProvider[];
    }
  >;
}

export interface ExternalRatings {
  imdbRating?: string;
  imdbVotes?: string;
  rottenTomatoesRating?: string;
  metacriticRating?: string;
  imdbID?: string;
}

export interface TMDBDiscoverResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface TMDBSearchResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export const GENRES: Genre[] = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 36, name: "History" },
  { id: 27, name: "Horror" },
  { id: 10402, name: "Music" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Science Fiction" },
  { id: 10770, name: "TV Movie" },
  { id: 53, name: "Thriller" },
  { id: 10752, name: "War" },
  { id: 37, name: "Western" },
];

export const STREAMING_PROVIDERS = [
  { id: 8, name: "Netflix", color: "#E50914" },
  { id: 9, name: "Amazon Prime Video", color: "#00A8E1" },
  { id: 337, name: "Disney Plus", color: "#113CCF" },
  { id: 15, name: "Hulu", color: "#1CE783" },
  { id: 1899, name: "Max", color: "#741DFF" },
  { id: 350, name: "Apple TV Plus", color: "#000000" },
  { id: 531, name: "Paramount Plus", color: "#0064FF" },
  { id: 386, name: "Peacock", color: "#000000" },
] as const;

export type StreamingProviderName = (typeof STREAMING_PROVIDERS)[number]["name"];
