// Trending (Now Playing) page — horizontal scroll strip with auto-refresh (TRND-01, TRND-02, TRND-03, TRND-04)

import { RefreshCw, Clock, AlertCircle } from "lucide-react";
import { useTrending } from "@/hooks/useTrending";
import { ClaySkeletonCard } from "@/components/ui";
import { LoadingQuotes } from "@/components/animation/LoadingQuotes";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/animation/StaggerContainer";
import { MoviePosterCard } from "@/components/seo/MoviePosterCard";
import { Seo, routeSeoProps } from "@/components/seo/Seo";
import { getRouteMeta, SITE } from "@/seo/meta";
import { itemListJsonLd } from "../../../tools/lib/jsonld.mjs";

/**
 * TrendingPage — Horizontal scroll row of now-playing movies with auto-refresh.
 *
 * Shows region-aware Now Playing movies from TMDB. Automatically falls back to
 * popular movies if now_playing returns empty for the current region.
 * Auto-refreshes every 30 minutes. Supports manual refresh via refresh button.
 * Tapping a movie navigates to /movie/<slug>?source=trending. (TRND-04)
 */
export function TrendingPage() {
  const { movies, isLoading, error, refresh } = useTrending();

  if (isLoading && movies.length === 0) {
    return (
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-heading font-semibold text-clay-text">
            Now Playing
          </h2>
        </div>
        <div aria-busy="true" aria-label="Loading now playing movies">
          <LoadingQuotes />
        </div>
      </div>
    );
  }

  if (error && movies.length === 0) {
    return (
      <div className="space-y-4 p-4">
        <h2 className="text-xl font-heading font-semibold text-clay-text">
          Now Playing
        </h2>
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <AlertCircle className="w-10 h-10 text-red-400" aria-hidden="true" />
          <p className="text-clay-text-muted text-sm">{error}</p>
          <button
            onClick={refresh}
            className="text-sm text-clay-text underline underline-offset-2 hover:opacity-80 transition-opacity"
            aria-label="Retry loading now playing movies"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-3 p-4" aria-labelledby="trending-heading">
      {movies.length > 0 && (
        <Seo
          {...routeSeoProps(getRouteMeta("/trending")!)}
          jsonLd={[
            itemListJsonLd({
              movies,
              pageUrl: `${SITE.origin}/trending`,
              origin: SITE.origin,
            }),
          ]}
        />
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2
          id="trending-heading"
          className="text-xl font-heading font-semibold text-clay-text"
        >
          Now Playing
        </h2>
        <div className="flex items-center gap-2">
          {/* Last updated indicator */}
          {!isLoading && movies.length > 0 && (
            <span
              className="text-xs text-clay-text-muted flex items-center gap-1"
              aria-live="polite"
            >
              <Clock className="w-3 h-3" aria-hidden="true" />
              Live
            </span>
          )}
          {/* Manual refresh button */}
          <button
            onClick={refresh}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-clay-text-muted hover:text-clay-text hover:bg-clay-base/30 transition-colors disabled:opacity-50"
            aria-label="Refresh now playing movies"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      {/* Responsive grid — horizontal scroll on mobile, grid on desktop */}
      {/* StaggerContainer staggers card entrances with 50ms between each (ANIM-02) */}
      <StaggerContainer
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 scrollbar-hide md:grid md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 md:overflow-visible md:mx-0 md:px-0"
        stagger={0.05}
        direction="up"
        role="list"
        aria-label="Now playing movies"
      >
        {movies.map((movie) => (
          <StaggerItem
            key={movie.id}
            direction="up"
            className="flex-shrink-0 snap-start w-40 md:w-full"
          >
            <MoviePosterCard movie={movie} search="?source=trending" />
          </StaggerItem>
        ))}
      </StaggerContainer>
    </section>
  );
}
