/** Base URL for constructing full TMDB provider logo URLs */
export const PROVIDER_LOGOS_BASE = "https://image.tmdb.org/t/p/original";

/** Construct full logo URL from TMDB logo_path */
export function getProviderLogoUrl(logoPath: string): string {
  return `${PROVIDER_LOGOS_BASE}${logoPath}`;
}

/** TMDB provider IDs known to be free-with-ads */
const KNOWN_FREE_PROVIDERS = new Set<number>([
  73, // Tubi
  300, // Pluto TV
  12, // Crackle
  538, // Plex
  613, // Freevee
  207, // Roku Channel
  386, // Peacock Free
  344, // Xumo
  191, // Kanopy
  212, // Hoopla
]);

/** Check if a provider is known to be free-with-ads */
export function isFreeProvider(providerId: number): boolean {
  return KNOWN_FREE_PROVIDERS.has(providerId);
}

/**
 * Search URL patterns for major streaming services, keyed by TMDB provider_id.
 * These open the service's own search page with the movie title pre-filled,
 * so the user lands directly on the streaming platform instead of JustWatch.
 * Uses `{q}` as placeholder for the URL-encoded movie title.
 */
const PROVIDER_SEARCH_URLS: Record<number, string> = {
  // Subscription streaming
  8: "https://www.netflix.com/search?q={q}", // Netflix
  9: "https://www.primevideo.com/search/ref=atv_nb_sr?phrase={q}", // Amazon Prime Video
  337: "https://www.disneyplus.com/search/{q}", // Disney+
  350: "https://tv.apple.com/search?term={q}", // Apple TV+
  1899: "https://play.max.com/search?q={q}", // Max (HBO)
  15: "https://www.hulu.com/search?q={q}", // Hulu
  531: "https://www.paramountplus.com/search/?q={q}", // Paramount+
  386: "https://www.peacocktv.com/search?q={q}", // Peacock
  387: "https://www.peacocktv.com/search?q={q}", // Peacock Premium
  283: "https://www.crunchyroll.com/search?q={q}", // Crunchyroll
  2: "https://tv.apple.com/search?term={q}", // Apple iTunes
  192: "https://www.youtube.com/results?search_query={q}+movie", // YouTube
  188: "https://www.youtube.com/results?search_query={q}+movie", // YouTube Premium
  3: "https://play.google.com/store/search?q={q}&c=movies", // Google Play Movies
  10: "https://www.amazon.com/s?k={q}&i=instant-video", // Amazon Video (rent/buy)
  // Free/ad-supported
  73: "https://tubitv.com/search/{q}", // Tubi
  300: "https://pluto.tv/search/details/{q}", // Pluto TV
  207: "https://therokuchannel.roku.com/search?q={q}", // The Roku Channel
  538: "https://www.plex.tv/search/?query={q}", // Plex
  // Other
  11: "https://www.mubi.com/search?query={q}", // MUBI
  307: "https://www.sky.de/search?q={q}&section=movies", // Sky (DE)
  30: "https://www.wow.de/search?q={q}", // WOW (DE)
  298: "https://www.rtlplus.de/search?q={q}", // RTL+ (DE)
  421: "https://www.joyn.de/search?q={q}", // Joyn (DE)
  178: "https://www.magenta-tv.de/search?q={q}", // MagentaTV (DE)
};

/**
 * Get a direct link to search for a movie on the streaming provider.
 * Falls back to the TMDB/JustWatch link for unknown providers.
 */
export function getProviderDeepLink(
  providerId: number,
  movieTitle: string,
  tmdbLink: string,
): string {
  const pattern = PROVIDER_SEARCH_URLS[providerId];
  if (!pattern) return tmdbLink;
  return pattern.replace("{q}", encodeURIComponent(movieTitle));
}
