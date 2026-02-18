import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface TasteProfile {
  genres: Record<number, number>;
  decades: Record<string, number>;
  directors: Record<number, number>;
  lastUpdated: number;
}

interface PreferencesState {
  preferredProvider: string | null;
  preferredGenre: string | null;
  myServices: number[];
  tasteProfile: TasteProfile;

  setPreferredProvider: (provider: string | null) => void;
  setPreferredGenre: (genre: string | null) => void;
  setMyServices: (services: number[]) => void;
  toggleMyService: (providerId: number) => void;
  recordLove: (genres: number[], decade: string, directorId?: number) => void;
  recordNotInterested: (
    genres: number[],
    decade: string,
    directorId?: number,
  ) => void;
  importLegacy: (data: {
    preferredProvider: string | null;
    preferredGenre: string | null;
  }) => void;
  resetTasteProfile: () => void;
}

const EMPTY_TASTE_PROFILE: TasteProfile = {
  genres: {},
  decades: {},
  directors: {},
  lastUpdated: 0,
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      preferredProvider: null,
      preferredGenre: null,
      myServices: [],
      tasteProfile: { ...EMPTY_TASTE_PROFILE },

      setPreferredProvider: (provider) => set({ preferredProvider: provider }),
      setPreferredGenre: (genre) => set({ preferredGenre: genre }),
      setMyServices: (services) => set({ myServices: services }),

      toggleMyService: (providerId) =>
        set((state) => {
          const exists = state.myServices.includes(providerId);
          return {
            myServices: exists
              ? state.myServices.filter((id) => id !== providerId)
              : [...state.myServices, providerId],
          };
        }),

      recordLove: (genres, decade, directorId) =>
        set((state) => {
          const tp: TasteProfile = {
            genres: { ...state.tasteProfile.genres },
            decades: { ...state.tasteProfile.decades },
            directors: { ...state.tasteProfile.directors },
            lastUpdated: Date.now(),
          };
          for (const g of genres) {
            tp.genres[g] = (tp.genres[g] || 0) + 1;
          }
          tp.decades[decade] = (tp.decades[decade] || 0) + 1;
          if (directorId != null) {
            tp.directors[directorId] = (tp.directors[directorId] || 0) + 1;
          }
          return { tasteProfile: tp };
        }),

      recordNotInterested: (genres, decade, directorId) =>
        set((state) => {
          const tp: TasteProfile = {
            genres: { ...state.tasteProfile.genres },
            decades: { ...state.tasteProfile.decades },
            directors: { ...state.tasteProfile.directors },
            lastUpdated: Date.now(),
          };
          for (const g of genres) {
            tp.genres[g] = (tp.genres[g] || 0) - 1;
          }
          tp.decades[decade] = (tp.decades[decade] || 0) - 0.5;
          if (directorId != null) {
            tp.directors[directorId] = (tp.directors[directorId] || 0) - 1;
          }
          return { tasteProfile: tp };
        }),

      importLegacy: (data) =>
        set({
          preferredProvider: data.preferredProvider,
          preferredGenre: data.preferredGenre,
        }),

      resetTasteProfile: () =>
        set({ tasteProfile: { ...EMPTY_TASTE_PROFILE } }),
    }),
    {
      name: 'wmtw-preferences',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
