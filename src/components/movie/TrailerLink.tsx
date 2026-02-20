// Trailer link — finds YouTube trailer from movie videos (DISP-03)

import { PlayCircle } from "lucide-react";
import { ExternalLink } from "@/components/shared/ExternalLink";
import type { TMDBMovieDetails } from "@/types/movie";

interface TrailerLinkProps {
  videos: TMDBMovieDetails["videos"];
}

/** Find the best YouTube video from the videos list */
function findYouTubeVideo(videos: TMDBMovieDetails["videos"]): string | null {
  if (!videos?.results?.length) return null;

  const youtubeVideos = videos.results.filter((v) => v.site === "YouTube");
  if (youtubeVideos.length === 0) return null;

  // Prefer official Trailer type
  const trailer = youtubeVideos.find((v) => v.type === "Trailer");
  const video = trailer ?? youtubeVideos[0];

  return video.key;
}

/**
 * TrailerLink — Prominent YouTube trailer button with play icon.
 *
 * Designed to sit below the movie poster. Full-width with a large
 * play circle icon for clear affordance.
 */
export function TrailerLink({ videos }: TrailerLinkProps) {
  const videoKey = findYouTubeVideo(videos);

  if (!videoKey) return null;

  const youtubeUrl = `https://www.youtube.com/watch?v=${videoKey}`;

  return (
    <ExternalLink href={youtubeUrl} className="block w-full">
      <div className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-xl bg-white/[0.08] backdrop-blur-md border border-white/10 text-clay-text font-medium text-sm hover:bg-white/[0.12] transition-colors">
        <PlayCircle className="w-5 h-5 text-red-500" aria-hidden="true" />
        Watch Trailer
      </div>
    </ExternalLink>
  );
}
