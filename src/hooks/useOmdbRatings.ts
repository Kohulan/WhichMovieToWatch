// Lazy OMDB ratings hook — only for single displayed movie, NEVER in lists

import { useState, useEffect } from "react";
import { fetchOmdbRatings } from "@/services/omdb/client";
import type { OmdbRatings } from "@/services/omdb/client";

export function useOmdbRatings(imdbId: string | null) {
  const [ratings, setRatings] = useState<OmdbRatings | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!imdbId) {
      setRatings(null);
      return;
    }

    let cancelled = false;

    async function load() {
      setIsLoading(true);

      try {
        const result = await fetchOmdbRatings(imdbId!);
        if (!cancelled) {
          setRatings(result);
        }
      } catch (err) {
        // Don't break UI over missing ratings — log warning only
        if (!cancelled) {
          console.warn("[omdb] Failed to fetch ratings:", err);
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
  }, [imdbId]);

  return {
    imdbRating: ratings?.imdbRating ?? null,
    rottenTomatoes: ratings?.rottenTomatoes ?? null,
    metascore: ratings?.metascore ?? null,
    isLoading,
  };
}
