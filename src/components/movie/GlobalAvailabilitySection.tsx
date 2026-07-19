// Netflix global availability — shows all countries where a movie is on Netflix

import { useState, useEffect, useMemo } from "react";
import { fetchAllMovieProviders } from "@/services/tmdb/providers";
import { getCountryName } from "@/lib/country-names";
import { useReloadKey } from "@/hooks/useReloadKey";
import { RetryError } from "@/components/shared/RetryError";
import type { WatchProviderCountry } from "@/types/movie";

const NETFLIX_PROVIDER_ID = 8;

interface GlobalAvailabilitySectionProps {
  movieId: number;
  /**
   * All-region watch/providers data already embedded on the movie details
   * response (append_to_response — see useWatchProviders.ts's embedded-first
   * pattern). When present and non-empty, availability is derived
   * synchronously instead of re-fetching via fetchAllMovieProviders.
   */
  embeddedProviders?: Record<string, WatchProviderCountry>;
}

function deriveNetflixCountries(
  allProviders: Record<string, WatchProviderCountry>,
): Array<{ code: string; name: string }> {
  const netflixCountries: Array<{ code: string; name: string }> = [];
  for (const [code, data] of Object.entries(allProviders)) {
    if (data.flatrate?.some((p) => p.provider_id === NETFLIX_PROVIDER_ID)) {
      netflixCountries.push({ code, name: getCountryName(code) });
    }
  }
  netflixCountries.sort((a, b) => a.name.localeCompare(b.name));
  return netflixCountries;
}

export function GlobalAvailabilitySection({
  movieId,
  embeddedProviders,
}: GlobalAvailabilitySectionProps) {
  const hasEmbedded = !!(
    embeddedProviders && Object.keys(embeddedProviders).length > 0
  );

  const [fetchedCountries, setFetchedCountries] = useState<
    Array<{ code: string; name: string }>
  >([]);
  const [isFetchLoading, setIsFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [reloadKey, retry] = useReloadKey();

  // Embedded-first path: derive synchronously, no loading state, no effect.
  const embeddedCountries = useMemo(() => {
    if (!hasEmbedded) return null;
    return deriveNetflixCountries(embeddedProviders!);
  }, [embeddedProviders, hasEmbedded]);

  // Fallback fetch path — only runs when embedded data is missing/empty.
  // Retry/reload wiring stays bound to this path only.
  useEffect(() => {
    if (hasEmbedded) return;

    let cancelled = false;

    async function load() {
      setIsFetchLoading(true);
      setFetchError(null);
      try {
        const allProviders = await fetchAllMovieProviders(movieId);
        if (cancelled) return;

        setFetchedCountries(deriveNetflixCountries(allProviders));
      } catch (err) {
        if (!cancelled) {
          setFetchedCountries([]);
          setFetchError(
            err instanceof Error
              ? err.message
              : "Failed to load Netflix availability",
          );
        }
      } finally {
        if (!cancelled) setIsFetchLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [movieId, reloadKey, hasEmbedded]);

  const countries = hasEmbedded ? embeddedCountries! : fetchedCountries;
  const isLoading = hasEmbedded ? false : isFetchLoading;
  const error = hasEmbedded ? null : fetchError;

  if (isLoading) {
    return (
      <section aria-label="Netflix availability worldwide" className="mt-4">
        <h3 className="font-heading text-base font-semibold text-clay-text mb-3 flex items-center gap-2">
          <span className="text-brand-netflix font-bold text-lg leading-none">
            N
          </span>
          Netflix Availability
        </h3>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-7 w-20 bg-clay-surface/60 rounded animate-pulse"
              aria-hidden="true"
            />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section aria-label="Netflix availability worldwide" className="mt-4">
        <h3 className="font-heading text-base font-semibold text-clay-text mb-3 flex items-center gap-2">
          <span className="text-brand-netflix font-bold text-lg leading-none">
            N
          </span>
          Netflix Availability
        </h3>
        <RetryError
          message="Could not load Netflix availability."
          onRetry={retry}
          align="start"
        />
      </section>
    );
  }

  if (countries.length === 0) {
    return (
      <section aria-label="Netflix availability worldwide" className="mt-4">
        <h3 className="font-heading text-base font-semibold text-clay-text mb-3 flex items-center gap-2">
          <span className="text-brand-netflix font-bold text-lg leading-none">
            N
          </span>
          Netflix Availability
        </h3>
        <p className="text-clay-text-muted text-sm">
          Not available on Netflix in any region.
        </p>
      </section>
    );
  }

  return (
    <section aria-label="Netflix availability worldwide" className="mt-4">
      <h3 className="font-heading text-base font-semibold text-clay-text mb-3 flex items-center gap-2">
        <span className="text-brand-netflix font-bold text-lg leading-none">
          N
        </span>
        Available on Netflix in {countries.length}{" "}
        {countries.length === 1 ? "Country" : "Countries"}
      </h3>
      <div className="flex flex-wrap gap-1.5 max-h-[300px] overflow-y-auto pr-1">
        {countries.map(({ code, name }) => (
          <span
            key={code}
            title={name}
            className="
              inline-flex items-center gap-1.5 px-2.5 py-1
              text-xs font-semibold rounded-md
              bg-brand-netflix/10 text-brand-netflix
              border border-brand-netflix/20
            "
          >
            {code}
            <span className="font-normal text-clay-text-muted hidden sm:inline">
              {name}
            </span>
          </span>
        ))}
      </div>
    </section>
  );
}
