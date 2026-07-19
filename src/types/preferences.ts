// Taste profile and user preference types

export interface TasteProfile {
  genres: Record<number, number>;
  decades: Record<string, number>;
  directors: Record<number, number>;
  lastUpdated: number;
}
