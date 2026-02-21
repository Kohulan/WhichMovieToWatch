// Provider tiers for a movie hook — categorizes by flatrate/rent/buy/free/ads

import { useState, useEffect, useMemo } from "react";
import {
  fetchMovieProviders,
  fetchRegionProviders,
} from "@/services/tmdb/providers";
import { getCached } from "@/services/cache/cache-manager";
import { useRegionStore } from "@/stores/regionStore";
import { usePreferencesStore } from "@/stores/preferencesStore";
import { isFreeProvider, getProviderDeepLink } from "@/lib/provider-registry";
import type {
  WatchProviderCountry,
  WatchProvider,
  TMDBMovieDetails,
} from "@/types/movie";
import type { MovieProviders, ProviderInfo } from "@/types/provider";

/** Map raw WatchProvider to ProviderInfo with per-provider deep link */
function toProviderInfo(
  provider: WatchProvider,
  movieTitle: string,
  tmdbLink: string,
): ProviderInfo {
  return {
    provider_id: provider.provider_id,
    provider_name: provider.provider_name,
    logo_path: provider.logo_path,
    display_priority: provider.display_priority,
    deep_link: getProviderDeepLink(provider.provider_id, movieTitle, tmdbLink),
  };
}

/** Map a list of WatchProviders to ProviderInfo[] */
function mapProviders(
  providers: WatchProvider[] | undefined,
  movieTitle: string,
  tmdbLink: string,
): ProviderInfo[] | undefined {
  if (!providers || providers.length === 0) return undefined;
  return providers.map((p) => toProviderInfo(p, movieTitle, tmdbLink));
}

export function useWatchProviders(movieId: number | null, movieTitle = "") {
  const [rawData, setRawData] = useState<WatchProviderCountry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const region = useRegionStore((s) => s.effectiveRegion)();
  const myServices = usePreferencesStore((s) => s.myServices);

  useEffect(() => {
    if (movieId === null) {
      setRawData(null);
      return;
    }

    let cancelled = false;

    async function load() {
      setIsLoading(true);

      try {
        // Try reading from movie-details cache first (already fetched by useRandomMovie)
        const detailsCache = await getCached<TMDBMovieDetails>(
          `movie-details-${movieId}`,
        );
        const embedded =
          detailsCache.value?.["watch/providers"]?.results?.[region];

        if (embedded) {
          if (!cancelled) setRawData(embedded);
        } else {
          // Fallback to dedicated provider fetch
          const data = await fetchMovieProviders(movieId!, region);
          if (!cancelled) setRawData(data);
        }
      } catch (err) {
        if (!cancelled) {
          console.warn("[providers] Failed to fetch:", err);
          setRawData(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [movieId, region]);

  // Derive categorized providers from raw data
  const providers: MovieProviders = useMemo(() => {
    if (!rawData) {
      return { tmdb_link: "" };
    }

    const tmdbLink = rawData.link || "";

    return {
      flatrate: mapProviders(rawData.flatrate, movieTitle, tmdbLink),
      rent: mapProviders(rawData.rent, movieTitle, tmdbLink),
      buy: mapProviders(rawData.buy, movieTitle, tmdbLink),
      free: mapProviders(rawData.free, movieTitle, tmdbLink),
      ads: mapProviders(rawData.ads, movieTitle, tmdbLink),
      tmdb_link: tmdbLink,
    };
  }, [rawData, movieTitle]);

  // Filter streaming tiers to user's selected services.
  // Rent/buy are kept unfiltered — they're one-time purchases, not subscriptions.
  const myProviders: MovieProviders = useMemo(() => {
    if (!rawData) return { tmdb_link: "" };

    const mySet = new Set(myServices);
    const filterByMyServices = (list: ProviderInfo[] | undefined) =>
      list?.filter((p) => mySet.has(p.provider_id));

    return {
      flatrate: filterByMyServices(providers.flatrate),
      free: filterByMyServices(providers.free),
      ads: filterByMyServices(providers.ads),
      rent: providers.rent,
      buy: providers.buy,
      tmdb_link: providers.tmdb_link,
    };
  }, [providers, myServices, rawData]);

  // All providers with isFree enrichment (already available via isFreeProvider util)
  const allProviders = providers;

  // Service mismatch: user has services selected but none appear in streaming
  // tiers (flatrate/free/ads). This covers both "other services have it" and
  // "movie is rent/buy-only" — either way the user's subscription doesn't help.
  const hasServiceMismatch = useMemo(() => {
    if (myServices.length === 0) return false;

    const mySet = new Set(myServices);
    const streamingTiers = [providers.flatrate, providers.free, providers.ads];
    const hasMatch = streamingTiers.some((tier) =>
      tier?.some((p) => mySet.has(p.provider_id)),
    );
    return !hasMatch;
  }, [providers, myServices]);

  return {
    providers,
    isLoading,
    myProviders,
    allProviders,
    hasServiceMismatch,
  };
}

/** Hook to fetch all available providers for the user's region (for settings UI) */
export function useRegionProviders() {
  const [providers, setProviders] = useState<
    Array<{
      provider_id: number;
      provider_name: string;
      logo_path: string;
      display_priorities: Record<string, number>;
      isFree: boolean;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const region = useRegionStore((s) => s.effectiveRegion)();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);

      try {
        const results = await fetchRegionProviders(region);
        if (!cancelled) {
          setProviders(
            results.map((p) => ({
              ...p,
              isFree: isFreeProvider(p.provider_id),
            })),
          );
        }
      } catch (err) {
        if (!cancelled) {
          console.warn("[providers] Failed to fetch region providers:", err);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [region]);

  return { providers, isLoading };
}
