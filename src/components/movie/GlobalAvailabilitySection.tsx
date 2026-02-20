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

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
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
      } catch {
        if (!cancelled) setCountries([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [movieId]);

  if (isLoading) {
    return (
      <section aria-label="Netflix availability worldwide" className="mt-4">
        <h3 className="font-heading text-base font-semibold text-clay-text mb-3 flex items-center gap-2">
          <span className="text-[#E50914] font-bold text-lg leading-none">
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

  if (countries.length === 0) {
    return (
      <section aria-label="Netflix availability worldwide" className="mt-4">
        <h3 className="font-heading text-base font-semibold text-clay-text mb-3 flex items-center gap-2">
          <span className="text-[#E50914] font-bold text-lg leading-none">
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
        <span className="text-[#E50914] font-bold text-lg leading-none">N</span>
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
              bg-[#E50914]/10 text-[#E50914]
              border border-[#E50914]/20
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
