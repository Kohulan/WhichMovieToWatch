// TrendingBentoHero — Compact bento hero for the Trending page (BENT-03)
//
// Compact 2-cell bento layout using BentoGrid(columns=6) placed above the
// existing TrendingPageComponent. Additive — does not modify existing trending content.
//
// Cells:
//   Cell 1 (glass, col-span 3): First trending movie backdrop + title + "Now Playing" badge + rating
//   Cell 2 (clay, col-span 3): Stats — movie count, trending icon, auto-refresh note
//
// Wrapped in StaggerContainer for scroll-entry stagger animation.

import { TrendingUp } from "lucide-react";
import { BentoGrid } from "@/components/bento/BentoGrid";
import { BentoCell } from "@/components/bento/BentoCell";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/animation/StaggerContainer";
import { useTrending } from "@/hooks/useTrending";
import { getBackdropUrl } from "@/services/tmdb/client";

export function TrendingBentoHero() {
  const { movies, isLoading } = useTrending();

  const featuredMovie = movies[0] ?? null;
  const movieCount = movies.length;

  const backdropUrl = featuredMovie?.backdrop_path
    ? getBackdropUrl(featuredMovie.backdrop_path, "w780")
    : null;

  const ratingDisplay = featuredMovie
    ? (featuredMovie.vote_average * 10).toFixed(0) + "%"
    : null;

  return (
    <StaggerContainer stagger={0.12} className="mb-6">
      <BentoGrid columns={6}>
        {/* Cell 1 — Highlight: featured movie backdrop + title + rating */}
        <StaggerItem direction="up" className="md:col-span-2 lg:col-span-3">
          <BentoCell
            colSpan={{ tablet: 2, desktop: 3 }}
            rowSpan={1}
            material="glass"
            className="min-h-[140px] overflow-hidden"
          >
            {/* Background backdrop image */}
            {backdropUrl && (
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${backdropUrl})` }}
                aria-hidden="true"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
              </div>
            )}

            {/* Content overlay */}
            <div className="relative z-10 p-5 flex flex-col justify-between h-full gap-3">
              {/* Now Playing badge */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/80 text-white text-xs font-semibold backdrop-blur-sm">
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"
                    aria-hidden="true"
                  />
                  Now Playing
                </span>
              </div>

              {/* Movie title + rating */}
              {isLoading && !featuredMovie ? (
                <div className="space-y-2">
                  <div className="h-5 w-2/3 rounded bg-white/20 animate-pulse" />
                  <div className="h-4 w-1/3 rounded bg-white/10 animate-pulse" />
                </div>
              ) : featuredMovie ? (
                <div>
                  <p className="text-white font-heading font-semibold text-lg leading-tight line-clamp-2 drop-shadow-md">
                    {featuredMovie.title}
                  </p>
                  {ratingDisplay && (
                    <p className="text-white/70 text-sm mt-1 font-medium">
                      {ratingDisplay} audience score
                    </p>
                  )}
                </div>
              ) : null}
            </div>
          </BentoCell>
        </StaggerItem>

        {/* Cell 2 — Liveness pulse strip + freshness label.
            Deliberately not the [big number + label + note] template; the
            visual centerpiece is a row of pulse bars conveying "live data"
            instead of a single stat. */}
        <StaggerItem direction="up" className="md:col-span-2 lg:col-span-3">
          <BentoCell
            colSpan={{ tablet: 2, desktop: 3 }}
            rowSpan={1}
            material="clay"
            className="min-h-[140px]"
          >
            <div className="p-5 flex flex-col h-full gap-3">
              {/* Status pill — replaces the [Heading + Icon] header */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/15 text-accent text-[11px] font-semibold uppercase tracking-wider">
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"
                    aria-hidden="true"
                  />
                  Live
                </span>
                <TrendingUp
                  className="w-4 h-4 text-clay-text-muted"
                  aria-hidden="true"
                />
              </div>

              {/* Pulse bar row — animated bars instead of a big number */}
              <div
                className="flex items-end gap-1 h-8 flex-1"
                aria-hidden="true"
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <span
                    key={i}
                    className="flex-1 rounded-sm bg-accent/30 animate-pulse"
                    style={{
                      height: `${30 + ((i * 17) % 70)}%`,
                      animationDelay: `${i * 80}ms`,
                      animationDuration: "1.6s",
                    }}
                  />
                ))}
              </div>

              {/* Inline status row: count + freshness — kept compact */}
              <p className="text-clay-text text-sm">
                <span className="font-heading font-semibold tabular-nums">
                  {isLoading && movieCount === 0 ? "—" : movieCount}
                </span>{" "}
                <span className="text-clay-text-muted">
                  in theaters · refreshes every 30 min
                </span>
              </p>
            </div>
          </BentoCell>
        </StaggerItem>
      </BentoGrid>
    </StaggerContainer>
  );
}
