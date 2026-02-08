import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

export function formatYear(dateString: string): string {
  if (!dateString) return "N/A";
  return new Date(dateString).getFullYear().toString();
}

export function formatRuntime(minutes: number | null): string {
  if (!minutes) return "N/A";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

export function getTrailerUrl(videos: { key: string; site: string; type: string }[]): string | null {
  const trailer = videos.find(
    (v) => v.site === "YouTube" && v.type === "Trailer"
  );
  const teaser = videos.find(
    (v) => v.site === "YouTube" && v.type === "Teaser"
  );
  const video = trailer || teaser || videos[0];
  return video ? `https://www.youtube.com/watch?v=${video.key}` : null;
}

export function getYouTubeEmbedUrl(key: string): string {
  return `https://www.youtube.com/embed/${key}?autoplay=1&mute=1&controls=0&loop=1&playlist=${key}`;
}

export function extractDominantHue(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let hue = 0;

  if (delta === 0) return 0;
  if (max === r) hue = ((g - b) / delta) % 6;
  else if (max === g) hue = (b - r) / delta + 2;
  else hue = (r - g) / delta + 4;

  hue = Math.round(hue * 60);
  if (hue < 0) hue += 360;

  return hue;
}
