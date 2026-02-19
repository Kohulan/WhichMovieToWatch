// Provider tiers for a movie hook — categorizes by flatrate/rent/buy/free/ads

import { useState, useEffect, useMemo } from 'react';
import { fetchMovieProviders, fetchRegionProviders } from '@/services/tmdb/providers';
import { useRegionStore } from '@/stores/regionStore';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { isFreeProvider } from '@/lib/provider-registry';
import type { WatchProviderCountry, WatchProvider } from '@/types/movie';
import type { MovieProviders, ProviderInfo } from '@/types/provider';

/** Map raw WatchProvider to ProviderInfo with isFree flag */
function toProviderInfo(
  provider: WatchProvider,
  tmdbLink: string,
): ProviderInfo {
  return {
    provider_id: provider.provider_id,
    provider_name: provider.provider_name,
    logo_path: provider.logo_path,
    display_priority: provider.display_priority,
    deep_link: tmdbLink,
  };
}

/** Map a list of WatchProviders to ProviderInfo[] */
function mapProviders(
  providers: WatchProvider[] | undefined,
  tmdbLink: string,
): ProviderInfo[] | undefined {
  if (!providers || providers.length === 0) return undefined;
  return providers.map((p) => toProviderInfo(p, tmdbLink));
}

export function useWatchProviders(movieId: number | null) {
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
        const data = await fetchMovieProviders(movieId!, region);
        if (!cancelled) {
          setRawData(data);
        }
      } catch (err) {
        if (!cancelled) {
          console.warn('[providers] Failed to fetch:', err);
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
      return { tmdb_link: '' };
    }

    const tmdbLink = rawData.link || '';

    return {
      flatrate: mapProviders(rawData.flatrate, tmdbLink),
      rent: mapProviders(rawData.rent, tmdbLink),
      buy: mapProviders(rawData.buy, tmdbLink),
      free: mapProviders(rawData.free, tmdbLink),
      ads: mapProviders(rawData.ads, tmdbLink),
      tmdb_link: tmdbLink,
    };
  }, [rawData]);

  // Filter providers to only those in user's myServices
  const myProviders: MovieProviders = useMemo(() => {
    if (!rawData) return { tmdb_link: '' };

    const mySet = new Set(myServices);
    const filterByMyServices = (list: ProviderInfo[] | undefined) =>
      list?.filter((p) => mySet.has(p.provider_id));

    return {
      flatrate: filterByMyServices(providers.flatrate),
      rent: filterByMyServices(providers.rent),
      buy: filterByMyServices(providers.buy),
      free: filterByMyServices(providers.free),
      ads: filterByMyServices(providers.ads),
      tmdb_link: providers.tmdb_link,
    };
  }, [providers, myServices, rawData]);

  // All providers with isFree enrichment (already available via isFreeProvider util)
  const allProviders = providers;

  return { providers, isLoading, myProviders, allProviders };
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
          console.warn('[providers] Failed to fetch region providers:', err);
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
