// Taste profile and user preference types

export interface TasteProfile {
  genres: Record<number, number>;
  decades: Record<string, number>;
  directors: Record<number, number>;
  lastUpdated: number;
}

export type TasteSignal = 'love' | 'not-interested';

export interface MovieInteraction {
  movieId: number;
  signal: TasteSignal;
  genres: number[];
  decade: string;
  directorId: number | undefined;
  timestamp: number;
}
