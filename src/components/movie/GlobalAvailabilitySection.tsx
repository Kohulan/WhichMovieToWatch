// Netflix global availability — shows all countries where a movie is on Netflix

import { useState, useEffect } from "react";
import { fetchAllMovieProviders } from "@/services/tmdb/providers";
import { getCountryName } from "@/lib/country-names";

const NETFLIX_PROVIDER_ID = 8;

interface GlobalAvailabilitySectionProps {
  movieId: number;
}

export function GlobalAvailabilitySection({
  movieId,
}: GlobalAvailabilitySectionProps) {
  const [countries, setCountries] = useState<
    Array<{ code: string; name: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const allProviders = await fetchAllMovieProviders(movieId);
        if (cancelled) return;

        const netflixCountries: Array<{ code: string; name: string }> = [];
        for (const [code, data] of Object.entries(allProviders)) {
          if (
            data.flatrate?.some((p) => p.provider_id === NETFLIX_PROVIDER_ID)
          ) {
            netflixCountries.push({ code, name: getCountryName(code) });
          }
        }

        netflixCountries.sort((a, b) => a.name.localeCompare(b.name));
        setCountries(netflixCountries);
      } catch (err) {
        if (!cancelled) {
          setCountries([]);
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load Netflix availability",
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [movieId, reloadKey]);

  const retry = () => setReloadKey((k) => k + 1);

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
      <section
        aria-label="Netflix availability worldwide"
        className="mt-4"
        role="alert"
      >
        <h3 className="font-heading text-base font-semibold text-clay-text mb-3 flex items-center gap-2">
          <span className="text-brand-netflix font-bold text-lg leading-none">
            N
          </span>
          Netflix Availability
        </h3>
        <p className="text-clay-text-muted text-sm mb-3">
          Could not load Netflix availability.
        </p>
        <button
          type="button"
          onClick={retry}
          className="inline-flex items-center justify-center min-w-11 min-h-11 px-4 py-2 rounded-lg bg-clay-surface text-clay-text text-sm font-medium hover:opacity-80 transition-opacity border border-clay-border"
        >
          Try again
        </button>
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
        <span className="text-brand-netflix font-bold text-lg leading-none">N</span>
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
