export const TMDB_BASE_URL = "https://api.themoviedb.org/3";
export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";
export const OMDB_BASE_URL = "https://www.omdbapi.com";

export function tmdbImage(path: string | null, size: string = "w500"): string {
  if (!path) return "/placeholder-poster.svg";
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function tmdbBackdrop(path: string | null): string {
  if (!path) return "";
  return `${TMDB_IMAGE_BASE}/original${path}`;
}

export const PROVIDER_ID_MAP: Record<string, number> = {
  netflix: 8,
  "amazon-prime": 9,
  "disney-plus": 337,
  hulu: 15,
  max: 1899,
  "apple-tv": 350,
  "paramount-plus": 531,
  peacock: 386,
};

export const ANIMATION_CONFIG = {
  spring: {
    default: { type: "spring" as const, stiffness: 300, damping: 24 },
    snappy: { type: "spring" as const, stiffness: 400, damping: 30 },
    gentle: { type: "spring" as const, stiffness: 200, damping: 20 },
    bouncy: { type: "spring" as const, stiffness: 500, damping: 15 },
  },
  duration: {
    fast: 0.15,
    normal: 0.3,
    slow: 0.5,
    page: 0.4,
  },
  stagger: {
    fast: 0.05,
    normal: 0.08,
    slow: 0.12,
  },
} as const;
