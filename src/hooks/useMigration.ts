import { useEffect } from 'react';
import { useMovieHistoryStore } from '@/stores/movieHistoryStore';
import { usePreferencesStore } from '@/stores/preferencesStore';

const OLD_KEYS = [
  'watchedMovies',
  'lovedMovies',
  'notInterestedMovies',
  'shownMovies',
  'preferredProvider',
  'preferredGenre',
  'theme',
] as const;

const MIGRATION_FLAG = 'wmtw-v2-migrated';

function safeParseJSON<T>(raw: string | null, fallback: T): T {
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function useMigration(): void {
  useEffect(() => {
    if (localStorage.getItem(MIGRATION_FLAG)) return;

    // Read legacy data from old localStorage keys
    const shownMovies = safeParseJSON<number[]>(
      localStorage.getItem('shownMovies'),
      [],
    );
    const watchedMovies = safeParseJSON<number[]>(
      localStorage.getItem('watchedMovies'),
      [],
    );
    const lovedMovies = safeParseJSON<number[]>(
      localStorage.getItem('lovedMovies'),
      [],
    );
    const notInterestedMovies = safeParseJSON<number[]>(
      localStorage.getItem('notInterestedMovies'),
      [],
    );
    const preferredProvider = localStorage.getItem('preferredProvider');
    const preferredGenre = localStorage.getItem('preferredGenre');

    // Import into Zustand stores (synchronous via getState)
    useMovieHistoryStore.getState().importLegacy({
      shownMovies,
      watchedMovies,
      lovedMovies,
      notInterestedMovies,
    });

    usePreferencesStore.getState().importLegacy({
      preferredProvider,
      preferredGenre,
    });

    // Delete old keys (except 'theme' -- keep for backwards compat with vanilla app)
    for (const key of OLD_KEYS) {
      if (key !== 'theme') {
        localStorage.removeItem(key);
      }
    }

    // Mark migration complete
    localStorage.setItem(MIGRATION_FLAG, String(Date.now()));
    console.log('Legacy data migrated successfully');
  }, []);
}
