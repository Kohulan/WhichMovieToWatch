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
 * Get the best available link for a provider.
 * Deep link patterns are unreliable across regions and change frequently,
 * so we always use the TMDB-provided JustWatch link as the reliable option.
 */
export function getProviderDeepLink(
  _providerId: number,
  tmdbLink: string,
): string {
  return tmdbLink;
}
