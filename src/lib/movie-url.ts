// App-side entry point for the shared slug module (tools/lib/slug.mjs).
export { movieSlug, parseMovieIdFromSlug } from "../../tools/lib/slug.mjs";
import { movieSlug as slug } from "../../tools/lib/slug.mjs";

export function moviePath(movie: { id: number; title: string }): string {
  return `/movie/${slug(movie)}`;
}
