// Local-first profile export and import utility for device transfer and backups
// Zero backend, pure JSON validation, privacy-preserving.

import { usePreferencesStore } from "@/stores/preferencesStore";
import { useMovieHistoryStore } from "@/stores/movieHistoryStore";
import { useThemeStore } from "@/stores/themeStore";
import { useRegionStore } from "@/stores/regionStore";

export interface ExportedProfile {
  version: 2;
  exportedAt: string;
  preferences: {
    preferredProvider: string | null;
    preferredGenre: string | null;
    myServices: number[];
    tasteProfile: {
      genres: Record<number, number>;
      decades: Record<string, number>;
      directors: Record<number, number>;
      lastUpdated: number;
    };
    hasCompletedOnboarding: boolean;
  };
  history: {
    shownMovies: number[];
    watchedMovies: number[];
    lovedMovies: number[];
    notInterestedMovies: number[];
    dinnerTimeLikes: number[];
    dinnerTimeDislikes: number[];
  };
  theme?: {
    preset: string;
    mode: "light" | "dark";
  };
  region?: string;
}

/** Export all local stores to a JSON string */
export function exportProfileData(): string {
  const prefs = usePreferencesStore.getState();
  const hist = useMovieHistoryStore.getState();
  const theme = useThemeStore.getState();
  const region = useRegionStore.getState();

  const data: ExportedProfile = {
    version: 2,
    exportedAt: new Date().toISOString(),
    preferences: {
      preferredProvider: prefs.preferredProvider,
      preferredGenre: prefs.preferredGenre,
      myServices: prefs.myServices,
      tasteProfile: prefs.tasteProfile,
      hasCompletedOnboarding: prefs.hasCompletedOnboarding,
    },
    history: {
      shownMovies: hist.shownMovies,
      watchedMovies: hist.watchedMovies,
      lovedMovies: hist.lovedMovies,
      notInterestedMovies: hist.notInterestedMovies,
      dinnerTimeLikes: hist.dinnerTimeLikes,
      dinnerTimeDislikes: hist.dinnerTimeDislikes,
    },
    theme: {
      preset: theme.preset,
      mode: theme.mode,
    },
    region: region.effectiveRegion(),
  };

  return JSON.stringify(data, null, 2);
}

/** Trigger download of exported JSON file */
export function downloadProfileBackup(): void {
  const json = exportProfileData();
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const dateStr = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `whichmovietowatch-profile-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Validate and import JSON profile data into stores */
export function importProfileData(jsonString: string): { success: boolean; error?: string } {
  try {
    const data = JSON.parse(jsonString) as Partial<ExportedProfile>;

    if (!data || typeof data !== "object") {
      return { success: false, error: "Invalid backup format: Not a JSON object" };
    }

    if (data.preferences) {
      const prefs = usePreferencesStore.getState();
      if (Array.isArray(data.preferences.myServices)) {
        prefs.setMyServices(data.preferences.myServices);
      }
      if (data.preferences.preferredProvider !== undefined) {
        prefs.setPreferredProvider(data.preferences.preferredProvider);
      }
      if (data.preferences.preferredGenre !== undefined) {
        prefs.setPreferredGenre(data.preferences.preferredGenre);
      }
      if (data.preferences.hasCompletedOnboarding) {
        prefs.completeOnboarding();
      }
      if (data.preferences.tasteProfile && typeof data.preferences.tasteProfile === "object") {
        usePreferencesStore.setState({
          tasteProfile: {
            genres: data.preferences.tasteProfile.genres || {},
            decades: data.preferences.tasteProfile.decades || {},
            directors: data.preferences.tasteProfile.directors || {},
            lastUpdated: data.preferences.tasteProfile.lastUpdated || Date.now(),
          },
        });
      }
    }

    if (data.history) {
      useMovieHistoryStore.setState({
        shownMovies: Array.isArray(data.history.shownMovies) ? data.history.shownMovies : [],
        watchedMovies: Array.isArray(data.history.watchedMovies) ? data.history.watchedMovies : [],
        lovedMovies: Array.isArray(data.history.lovedMovies) ? data.history.lovedMovies : [],
        notInterestedMovies: Array.isArray(data.history.notInterestedMovies) ? data.history.notInterestedMovies : [],
        dinnerTimeLikes: Array.isArray(data.history.dinnerTimeLikes) ? data.history.dinnerTimeLikes : [],
        dinnerTimeDislikes: Array.isArray(data.history.dinnerTimeDislikes) ? data.history.dinnerTimeDislikes : [],
      });
    }

    if (data.theme) {
      if (data.theme.mode === "light" || data.theme.mode === "dark") {
        useThemeStore.getState().setMode(data.theme.mode);
      }
      if (data.theme.preset) {
        useThemeStore.getState().setPreset(data.theme.preset as any);
      }
    }

    if (data.region && typeof data.region === "string") {
      useRegionStore.getState().setManualOverride(data.region);
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to parse profile JSON",
    };
  }
}
