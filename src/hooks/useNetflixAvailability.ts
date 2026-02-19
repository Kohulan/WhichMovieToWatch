import { useState, useEffect } from 'react';
import { fetchAllMovieProviders } from '@/services/tmdb/providers';

const NETFLIX_PROVIDER_ID = 8;
const MAX_CONCURRENT = 4;

// Module-level semaphore shared across all hook instances
let inFlight = 0;
const queue: Array<() => void> = [];

function acquireSlot(): Promise<void> {
  if (inFlight < MAX_CONCURRENT) {
    inFlight++;
    return Promise.resolve();
  }
  return new Promise<void>((resolve) => {
    queue.push(() => {
      inFlight++;
      resolve();
    });
  });
}

function releaseSlot() {
  inFlight--;
  const next = queue.shift();
  if (next) next();
}

export function useNetflixAvailability(movieId: number): {
  countries: string[];
  isLoading: boolean;
} {
  const [countries, setCountries] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      await acquireSlot();
      if (cancelled) {
        releaseSlot();
        return;
      }

      try {
        const allProviders = await fetchAllMovieProviders(movieId);
        if (cancelled) return;

        const netflixCountries: string[] = [];
        for (const [countryCode, data] of Object.entries(allProviders)) {
          if (
            data.flatrate?.some((p) => p.provider_id === NETFLIX_PROVIDER_ID)
          ) {
            netflixCountries.push(countryCode);
          }
        }

        netflixCountries.sort();
        setCountries(netflixCountries);
      } catch {
        if (!cancelled) setCountries([]);
      } finally {
        releaseSlot();
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [movieId]);

  return { countries, isLoading };
}
