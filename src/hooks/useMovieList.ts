import { useEffect, useState } from "react";
import type { TMDBMovie } from "@/types/movie";

/** Minimal fetch-on-mount list hook for SEO hub pages. */
export function useMovieList(key: string, loader: () => Promise<TMDBMovie[]>) {
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    setMovies([]);
    loader()
      .then((result) => {
        if (!cancelled) setMovies(result);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to load");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { movies, isLoading, error };
}
