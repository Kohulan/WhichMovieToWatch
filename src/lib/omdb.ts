import { OMDB_BASE_URL } from "./constants";
import type { ExternalRatings } from "@/types/movie";

const OMDB_KEY = process.env.OMDB_API_KEY || "";

export async function getExternalRatings(imdbId: string): Promise<ExternalRatings> {
  if (!OMDB_KEY || !imdbId) return {};

  const url = `${OMDB_BASE_URL}?apikey=${OMDB_KEY}&i=${encodeURIComponent(imdbId)}`;
  const response = await fetch(url, { next: { revalidate: 86400 } }); // Cache 24h

  if (!response.ok) return {};

  const data = await response.json();

  if (data.Response === "False") return {};

  const ratings: ExternalRatings = {
    imdbRating: data.imdbRating !== "N/A" ? data.imdbRating : undefined,
    imdbVotes: data.imdbVotes !== "N/A" ? data.imdbVotes : undefined,
    imdbID: data.imdbID,
  };

  if (data.Ratings) {
    for (const rating of data.Ratings) {
      if (rating.Source === "Rotten Tomatoes") {
        ratings.rottenTomatoesRating = rating.Value;
      }
      if (rating.Source === "Metacritic") {
        ratings.metacriticRating = rating.Value;
      }
    }
  }

  return ratings;
}
