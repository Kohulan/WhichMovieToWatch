// Trailer link — finds YouTube trailer from movie videos (DISP-03)

import { Play } from 'lucide-react';
import { MetalButton } from '@/components/ui';
import { ExternalLink } from '@/components/shared/ExternalLink';
import type { TMDBMovieDetails } from '@/types/movie';

interface TrailerLinkProps {
  videos: TMDBMovieDetails['videos'];
}

/** Find the best YouTube video from the videos list */
function findYouTubeVideo(
  videos: TMDBMovieDetails['videos'],
): string | null {
  if (!videos?.results?.length) return null;

  const youtubeVideos = videos.results.filter((v) => v.site === 'YouTube');
  if (youtubeVideos.length === 0) return null;

  // Prefer official Trailer type
  const trailer = youtubeVideos.find((v) => v.type === 'Trailer');
  const video = trailer ?? youtubeVideos[0];

  return video.key;
}

/**
 * TrailerLink — Renders a YouTube trailer button.
 *
 * Finds the first YouTube trailer from videos.results.
 * Falls back to any YouTube video if no trailer type found.
 * Renders nothing if no YouTube videos are available.
 */
export function TrailerLink({ videos }: TrailerLinkProps) {
  const videoKey = findYouTubeVideo(videos);

  if (!videoKey) return null;

  const youtubeUrl = `https://www.youtube.com/watch?v=${videoKey}`;

  return (
    <ExternalLink href={youtubeUrl} className="inline-flex">
      <MetalButton variant="ghost" size="sm" aria-label="Watch trailer on YouTube">
        <Play className="w-4 h-4" aria-hidden="true" />
        Watch Trailer
      </MetalButton>
    </ExternalLink>
  );
}
