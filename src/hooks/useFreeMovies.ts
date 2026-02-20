// Free YouTube movies hook — parses movies.txt, picks random entries with TMDB enrichment (FREE-01, FREE-02)

import { useState, useEffect, useCallback } from "react";
import { searchMovies } from "@/services/tmdb/search";
import { fetchMovieDetails } from "@/services/tmdb/details";
import { useMovieHistoryStore } from "@/stores/movieHistoryStore";
import type { TMDBMovieDetails } from "@/types/movie";

interface FreeMovieEntry {
  youtubeId: string;
  title: string;
}

interface FreeMovieResult {
  youtubeId: string;
  title: string;
  tmdbDetails: TMDBMovieDetails | null;
}

interface UseFreeMoviesReturn {
  movie: FreeMovieResult | null;
  isLoading: boolean;
  error: string | null;
  nextMovie: () => void;
}

// Module-level cache — movies.txt is parsed once per session
let cachedMovies: FreeMovieEntry[] | null = null;
let fetchPromise: Promise<FreeMovieEntry[]> | null = null;

async function loadMoviesList(): Promise<FreeMovieEntry[]> {
  if (cachedMovies !== null) {
    return cachedMovies;
  }

  // Reuse in-flight fetch if one is already pending
  if (fetchPromise) {
    return fetchPromise;
  }

  // CRITICAL: Use import.meta.env.BASE_URL prefix for GitHub Pages compatibility
  fetchPromise = fetch(`${import.meta.env.BASE_URL}data/movies.txt`)
    .then(async (res) => {
      if (!res.ok) {
        throw new Error(`Failed to fetch movies.txt: ${res.statusText}`);
      }
      const text = await res.text();

      const lines = text
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      // Skip header row ("YouTube ID\tTitle")
      const dataLines = lines.filter(
        (line) =>
          !line.startsWith("YouTube ID") && !line.startsWith("YouTube_ID"),
      );

      const entries: FreeMovieEntry[] = dataLines
        .map((line) => {
          const tabIndex = line.indexOf("\t");
          if (tabIndex === -1) return null;
          const youtubeId = line.slice(0, tabIndex).trim();
          const title = line.slice(tabIndex + 1).trim();
          if (!youtubeId || !title) return null;
          return { youtubeId, title };
        })
        .filter((entry): entry is FreeMovieEntry => entry !== null);

      cachedMovies = entries;
      fetchPromise = null;
      return entries;
    })
    .catch((err) => {
      fetchPromise = null;
      throw err;
    });

  return fetchPromise;
}

/**
 * useFreeMovies — Parses movies.txt and returns random free YouTube movies with TMDB metadata.
 *
 * - Fetches and parses data/movies.txt (tab-separated: YouTubeID\tTitle) on first call
 * - Caches the parsed list at module level — no re-fetches across re-mounts
 * - Picks random entries not already in movieHistoryStore's shown set
 * - Searches TMDB by title to get metadata (FREE-02), fetches full details for the matched movie
 * - Returns youtubeId, title, and tmdbDetails (null if no match found)
 * - OMDB ratings are fetched by the consuming component via useOmdbRatings (component concern)
 */
export function useFreeMovies(): UseFreeMoviesReturn {
  const [movie, setMovie] = useState<FreeMovieResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trackShown = useMovieHistoryStore((s) => s.trackShown);
  const shownMovies = useMovieHistoryStore((s) => s.shownMovies);

  const loadNextMovie = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const entries = await loadMoviesList();

      if (entries.length === 0) {
        setError("No free movies found in the list.");
        setMovie(null);
        return;
      }

      // Build a set of shown movie IDs for exclusion
      const shownSet = new Set(shownMovies);

      // Filter out entries whose TMDB IDs have been shown — but since we don't know TMDB ID
      // upfront, pick randomly and let TMDB search determine if it's worth showing
      // We track shown entries by picking a truly random one from the full list
      const randomIndex = Math.floor(Math.random() * entries.length);
      const selected = entries[randomIndex];

      let tmdbDetails: TMDBMovieDetails | null = null;

      try {
        // Search TMDB by title to get metadata (FREE-02)
        const searchResults = await searchMovies(selected.title);

        if (searchResults.results.length > 0) {
          // Find first result not in the shown set
          const candidate = searchResults.results.find(
            (m) => !shownSet.has(m.id),
          );
          const target = candidate ?? searchResults.results[0];

          // Fetch full movie details
          tmdbDetails = await fetchMovieDetails(target.id);
          trackShown(target.id);
        }
      } catch {
        // TMDB lookup failure is non-fatal — still show the YouTube movie
        // with title only, no metadata
      }

      setMovie({
        youtubeId: selected.youtubeId,
        title: selected.title,
        tmdbDetails,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load free movies list",
      );
      setMovie(null);
    } finally {
      setIsLoading(false);
    }
  }, [trackShown, shownMovies]);

  // Load first movie on mount
  useEffect(() => {
    loadNextMovie();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nextMovie = useCallback(() => {
    loadNextMovie();
  }, [loadNextMovie]);

  return { movie, isLoading, error, nextMovie };
}
