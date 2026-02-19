// featuredStore — Shared cycling index for homepage bento cells.
//
// DiscoverHeroCell, RatingShowcaseCell, and TrendingPreviewCell all subscribe
// to the same index so they stay in sync. The store auto-cycles every 5s once
// started, and the total count is set by the component that knows the movie list.

import { create } from 'zustand';

interface FeaturedState {
  /** Current featured movie index into the trending movies array */
  index: number;
  /** Total number of movies available for cycling */
  total: number;
  /** Advance to the next movie (wraps around) */
  next: () => void;
  /** Set the total count (called when trending data loads) */
  setTotal: (n: number) => void;
}

export const useFeaturedStore = create<FeaturedState>((set, get) => ({
  index: 0,
  total: 0,
  next: () => {
    const { total } = get();
    if (total <= 1) return;
    set((s) => ({ index: (s.index + 1) % s.total }));
  },
  setTotal: (n: number) => set({ total: n, index: 0 }),
}));
