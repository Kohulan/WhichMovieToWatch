import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ColorPreset = 'warm-orange' | 'gold' | 'clean-white';
export type ThemeMode = 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  preset: ColorPreset;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  setPreset: (preset: ColorPreset) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'dark',
      preset: 'warm-orange',
      setMode: (mode) => set({ mode }),
      toggleMode: () =>
        set((state) => ({ mode: state.mode === 'light' ? 'dark' : 'light' })),
      setPreset: (preset) => set({ preset }),
    }),
    {
      name: 'theme-preferences',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
