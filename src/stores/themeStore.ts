import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ColorPreset = 'cinema-gold' | 'ocean-blue' | 'neon-purple';
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
      mode: 'light',
      preset: 'cinema-gold',
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
