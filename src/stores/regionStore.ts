import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

interface RegionState {
  detectedCountry: string;
  manualOverride: string | null;
  lastDetected: number;

  effectiveRegion: () => string;
  setDetectedCountry: (country: string) => void;
  setManualOverride: (country: string | null) => void;
  needsDetection: () => boolean;
}

export const useRegionStore = create<RegionState>()(
  persist(
    (set, get) => ({
      detectedCountry: 'US',
      manualOverride: null,
      lastDetected: 0,

      effectiveRegion: () => {
        const state = get();
        return state.manualOverride || state.detectedCountry;
      },

      setDetectedCountry: (country) =>
        set({ detectedCountry: country, lastDetected: Date.now() }),

      setManualOverride: (country) => set({ manualOverride: country }),

      needsDetection: () => {
        const state = get();
        return (
          state.lastDetected === 0 ||
          Date.now() - state.lastDetected > TWENTY_FOUR_HOURS
        );
      },
    }),
    {
      name: 'wmtw-region',
      storage: createJSONStorage(() => localStorage),
      version: 2,
      migrate: () => ({
        detectedCountry: 'US',
        manualOverride: null,
        lastDetected: 0,
      }),
      partialize: (state) => ({
        detectedCountry: state.detectedCountry,
        manualOverride: state.manualOverride,
        lastDetected: state.lastDetected,
      }),
    },
  ),
);
