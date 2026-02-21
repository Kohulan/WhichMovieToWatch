// Main discovery screen — cinematic hero, ratings, providers, actions, similar movies

import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SlidersHorizontal } from "lucide-react";
import { useDiscoveryStore } from "@/stores/discoveryStore";
import { usePreferencesStore } from "@/stores/preferencesStore";
import { useMovieHistoryStore } from "@/stores/movieHistoryStore";
import { useRandomMovie } from "@/hooks/useRandomMovie";
import { useMovieDetails } from "@/hooks/useMovieDetails";
import { useOmdbRatings } from "@/hooks/useOmdbRatings";
import { useWatchProviders } from "@/hooks/useWatchProviders";
import { useSimilarMovies } from "@/hooks/useSimilarMovies";
import { useDeepLink } from "@/hooks/useDeepLink";
import { useAnnounce } from "@/components/shared/ScreenReaderAnnouncer";
import { MovieHero } from "@/components/movie/MovieHero";
import { RatingBadges } from "@/components/movie/RatingBadges";
import { ProviderSection } from "@/components/movie/ProviderSection";
import { GlobalAvailabilitySection } from "@/components/movie/GlobalAvailabilitySection";
import { TrailerLink } from "@/components/movie/TrailerLink";
import { TicketSearch } from "@/components/movie/TicketSearch";
import { MovieActions } from "@/components/movie/MovieActions";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { ClayCard } from "@/components/ui/ClayCard";
import { ClaySkeletonCard } from "@/components/ui/ClaySkeletonCard";
import { MetalButton } from "@/components/ui";
import { LoadingQuotes } from "@/components/animation/LoadingQuotes";
import { ScrollReveal } from "@/components/animation/ScrollReveal";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/animation/StaggerContainer";
import { getPosterUrl, getBackdropUrl } from "@/services/tmdb/client";
import {
  tmdbBackdropSrcSet,
  backdropSizes,
  tmdbPosterSrcSet,
  posterSizes,
} from "@/hooks/useResponsiveImage";
import { ShareButton } from "@/components/share/ShareButton";
import { MovieMetaTags } from "@/components/share/MovieMetaTags";
import type { TMDBMovieDetails } from "@/types/movie";

/**
 * DiscoveryPage — Main cinematic discovery screen.
 *
 * Composes MovieHero, RatingBadges, ProviderSection, TrailerLink, MovieActions.
 * Shows onboarding wizard on first visit to set provider + genre preferences.
 * Handles deep links (?movie=ID), loading/error states, and the "You might also like"
 * similar movies section triggered by Love action. (DISC-01 through DISC-04, INTR-01 through INTR-04)
 */
export function DiscoveryPage() {
  const [announce, Announcer] = useAnnounce();
  const [lovedMovieId, setLovedMovieId] = useState<number | null>(null);
  const [globalProviders, setGlobalProviders] = useState(false);
  const [showTickets, setShowTickets] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const {
    discover,
    isLoading,
    error,
    currentMovie: discoveryMovie,
  } = useRandomMovie();
  const setCurrentMovie = useDiscoveryStore((s) => s.setCurrentMovie);
  const setFilters = useDiscoveryStore((s) => s.setFilters);
  const markLoved = useMovieHistoryStore((s) => s.markLoved);
  const recordLove = usePreferencesStore((s) => s.recordLove);

  // Onboarding state
  const hasCompletedOnboarding = usePreferencesStore(
    (s) => s.hasCompletedOnboarding,
  );
  const myServices = usePreferencesStore((s) => s.myServices);
  const preferredProvider = usePreferencesStore((s) => s.preferredProvider);
  const preferredGenre = usePreferencesStore((s) => s.preferredGenre);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Deep link support (DISC-04)
  const { deepLinkMovieId, showAllProviders, isTrendingSource, clearDeepLink } =
    useDeepLink();
  const { data: deepLinkMovie, isLoading: deepLinkLoading } =
    useMovieDetails(deepLinkMovieId);

  // Use deep link movie or the randomly discovered movie
  const currentMovie: TMDBMovieDetails | null = deepLinkMovie ?? discoveryMovie;

  // OMDB ratings for current movie
  const { imdbRating, rottenTomatoes, metascore } = useOmdbRatings(
    currentMovie?.imdb_id ?? null,
  );

  // Watch providers for current movie — show only user's selected services when set
  const {
    providers: allProviders,
    myProviders,
    hasServiceMismatch,
  } = useWatchProviders(currentMovie?.id ?? null, currentMovie?.title ?? "");
  const providers = myServices.length > 0 ? myProviders : allProviders;

  // Similar movies — only triggered after Love action (INTR-01)
  const { movies: similarMovies, isLoading: similarLoading } =
    useSimilarMovies(lovedMovieId);

  // Full-bleed backdrop URL
  const backdropUrl = currentMovie?.backdrop_path
    ? getBackdropUrl(currentMovie.backdrop_path, "original")
    : null;

  // Initialize on mount: show onboarding for new users, apply persisted filters + discover for returning users.
  // Post-onboarding discover is handled by handleOnboardingComplete — no deps needed here.
  useEffect(() => {
    if (!hasCompletedOnboarding && !deepLinkMovieId) {
      setShowOnboarding(true);
    } else if (hasCompletedOnboarding && !deepLinkMovieId) {
      // Returning user — restore persisted filters and discover
      const providerIds =
        myServices.length > 0
          ? myServices
          : preferredProvider
            ? [Number(preferredProvider)]
            : [];
      setFilters({
        providerIds,
        genreId: preferredGenre,
      });
      discover();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // When deep link movie is loaded, set it as current movie in store and clear param.
  // Capture showAllProviders before clearing — URL params disappear after clearDeepLink().
  useEffect(() => {
    if (deepLinkMovie) {
      setGlobalProviders(showAllProviders);
      setShowTickets(isTrendingSource);
      setCurrentMovie(deepLinkMovie);
      clearDeepLink();
    }
  }, [deepLinkMovie]); // eslint-disable-line react-hooks/exhaustive-deps

  // Announce movie title to screen readers when it changes (A11Y-04)
  useEffect(() => {
    if (currentMovie?.title) {
      announce(`Now showing: ${currentMovie.title}`);
    }
  }, [currentMovie?.id, announce]);

  // Onboarding complete — filters are already set by the wizard, trigger first discover
  const handleOnboardingComplete = useCallback(() => {
    setShowOnboarding(false);
    // Discover with the newly set filters
    discover();
  }, [discover]);

  // Settings saved — clear old movie and re-discover with new filters.
  // Clearing currentMovie ensures the error state can render if discovery fails.
  const handleSettingsSaved = useCallback(() => {
    setSettingsOpen(false);
    setLovedMovieId(null);
    setGlobalProviders(false);
    setShowTickets(false);
    setCurrentMovie(null);
    discover();
  }, [discover, setCurrentMovie]);

  // Handle Next action — resets global provider view back to regional
  const handleNext = useCallback(() => {
    setLovedMovieId(null);
    setGlobalProviders(false);
    setShowTickets(false);
    discover();
  }, [discover]);

  // Handle Love action (INTR-01, INTR-04)
  const handleLove = useCallback(() => {
    if (!currentMovie) return;
    const genreIds = currentMovie.genres?.map((g) => g.id) ?? [];
    const decade = currentMovie.release_date
      ? `${currentMovie.release_date.slice(0, 3)}0s`
      : "unknown";
    const director = currentMovie.credits?.crew?.find(
      (c) => c.job === "Director",
    );

    markLoved(currentMovie.id);
    recordLove(genreIds, decade, director?.id);

    // Trigger similar movies fetch
    setLovedMovieId(currentMovie.id);
  }, [currentMovie, markLoved, recordLove]);

  // Click a similar movie to load it as current (INTR-01)
  const handleSimilarMovieClick = useCallback(
    async (movieId: number) => {
      // Import fetchMovieDetails inline to avoid circular hook dependency
      const { fetchMovieDetails } = await import("@/services/tmdb/details");
      try {
        const details = await fetchMovieDetails(movieId);
        setCurrentMovie(details);
        setLovedMovieId(null);
      } catch (err) {
        console.warn("[DiscoveryPage] Failed to load similar movie:", err);
      }
    },
    [setCurrentMovie],
  );

  // Determine TMDB find-movie link for cross-region search (DISP-05)
  const findMovieLink = currentMovie
    ? `https://www.themoviedb.org/movie/${currentMovie.id}`
    : undefined;

  const showLoading = isLoading || deepLinkLoading;

  // Onboarding modal
  if (showOnboarding) {
    return (
      <div className="relative z-10 w-full flex flex-col items-center justify-center min-h-[60vh] px-4 py-6">
        <Announcer />
        <OnboardingWizard
          isOpen
          onComplete={handleOnboardingComplete}
          mode="onboarding"
        />
      </div>
    );
  }

  // Loading state
  if (showLoading) {
    return (
      <div className="relative z-10 w-full flex flex-col items-center justify-center min-h-[60vh] px-4 py-6">
        <Announcer />
        <LoadingQuotes />
      </div>
    );
  }

  // Error state — open preferences with a warning so the user can pick different filters
  if (error && !currentMovie) {
    return (
      <div className="relative z-10 w-full flex flex-col items-center justify-center min-h-[60vh] px-4 py-6">
        <Announcer />
        <OnboardingWizard
          isOpen
          onComplete={handleSettingsSaved}
          mode="settings"
          warningMessage={error}
        />
      </div>
    );
  }

  // Empty state (no movie loaded yet)
  if (!currentMovie) {
    return (
      <div className="relative z-10 w-full px-4 py-6">
        <Announcer />
        <ClayCard className="max-w-7xl mx-auto">
          <div className="p-6 text-center">
            <p className="text-clay-text-muted mb-4">
              No movie loaded yet. Discover something!
            </p>
            <MetalButton variant="primary" size="md" onClick={discover}>
              Discover a Movie
            </MetalButton>
          </div>
        </ClayCard>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Announcer />

      {/* Dynamic OG/Twitter Card meta tags — React 19 native hoisting (SOCL-02, SOCL-03) */}
      <MovieMetaTags movie={currentMovie} />

      {/* Settings modal — same wizard in settings mode */}
      <OnboardingWizard
        isOpen={settingsOpen}
        onComplete={handleSettingsSaved}
        mode="settings"
      />

      {/* Fixed full-screen backdrop — crossfades between movies */}
      {backdropUrl && (
        <div
          className="fixed inset-0 z-0 pointer-events-none"
          aria-hidden="true"
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={currentMovie.id}
              src={backdropUrl}
              srcSet={
                currentMovie.backdrop_path
                  ? tmdbBackdropSrcSet(currentMovie.backdrop_path)
                  : undefined
              }
              sizes={backdropSizes}
              alt=""
              loading="lazy"
              decoding="async"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-clay-base from-5% via-clay-base/80 via-35% to-clay-base/20" />
        </div>
      )}

      {/* Hero section — morph transition on Next Movie */}
      <AnimatePresence mode="wait">
        <motion.section
          key={currentMovie.id}
          initial={{ opacity: 0, scale: 0.97, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.01, y: -6 }}
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative z-10 flex flex-col justify-end px-4 sm:px-6 lg:px-8 pt-4 pb-8"
        >
          <div className="max-w-7xl mx-auto w-full">
            {/* Cinematic hero with all info in the right column (DISP-01) */}
            <MovieHero
              movie={currentMovie}
              movieId={currentMovie.id}
              posterFooter={
                <div className="space-y-2 w-full">
                  <TrailerLink videos={currentMovie.videos} />
                  <button
                    onClick={() => setSettingsOpen(true)}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-xl bg-white/[0.06] backdrop-blur-md border border-white/10 text-clay-text-muted font-medium text-sm hover:bg-white/[0.10] hover:text-clay-text transition-colors cursor-pointer"
                    aria-label="Change discovery preferences"
                  >
                    <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
                    Preferences
                  </button>
                  <ShareButton movie={currentMovie} />
                </div>
              }
            >
              {/* Action buttons — immediately below title/overview (DISP-06) */}
              <MovieActions
                movieId={currentMovie.id}
                movieGenres={currentMovie.genres ?? []}
                releaseYear={currentMovie.release_date?.slice(0, 4) ?? ""}
                onNext={handleNext}
                onLove={handleLove}
              />

              {/* Rating badges (DISP-02) */}
              <RatingBadges
                tmdbRating={currentMovie.vote_average}
                imdbRating={imdbRating}
                rottenTomatoes={rottenTomatoes}
                metascore={metascore}
              />

              {/* Streaming providers (DISP-05) — show global availability when navigating from Netflix search */}
              {globalProviders ? (
                <GlobalAvailabilitySection movieId={currentMovie.id} />
              ) : (
                <ProviderSection
                  providers={providers}
                  findMovieLink={findMovieLink}
                  hasServiceMismatch={hasServiceMismatch}
                  allProviders={allProviders}
                >
                  {/* Ticket search — only shown for trending (now playing) movies */}
                  {showTickets && (
                    <TicketSearch
                      movieTitle={currentMovie.title}
                      releaseYear={currentMovie.release_date?.slice(0, 4)}
                    />
                  )}
                </ProviderSection>
              )}
            </MovieHero>
          </div>
        </motion.section>
      </AnimatePresence>

      {/* Below-fold section — opaque bg covers the fixed backdrop as user scrolls */}
      {/* ScrollReveal: section slides up when user scrolls to the "You might also like" area (ANIM-02) */}
      {lovedMovieId !== null && (
        <ScrollReveal travel={60} className="relative z-10 bg-clay-base">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <section aria-label="Similar movies you might enjoy">
              <h3 className="font-heading text-base font-semibold text-clay-text mb-3">
                You might also like
              </h3>

              {similarLoading ? (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-shrink-0 w-28 h-44 bg-clay-surface rounded-lg clay-shadow-sm animate-pulse"
                      aria-hidden="true"
                    />
                  ))}
                </div>
              ) : similarMovies.length > 0 ? (
                /* StaggerContainer: horizontal slide-in from left for similar movie posters (ANIM-02) */
                <StaggerContainer
                  className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory"
                  direction="left"
                  stagger={0.06}
                  role="list"
                  aria-label="Similar movies"
                >
                  {similarMovies.slice(0, 10).map((movie) => {
                    const posterUrl = getPosterUrl(movie.poster_path, "w185");
                    const year = movie.release_date?.slice(0, 4) ?? "";

                    return (
                      <StaggerItem
                        key={movie.id}
                        direction="left"
                        className="flex-shrink-0 snap-start"
                      >
                        <button
                          role="listitem"
                          className="w-28 text-left rounded-lg overflow-hidden bg-clay-surface clay-shadow-sm hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-clay-accent"
                          onClick={() => handleSimilarMovieClick(movie.id)}
                          aria-label={`Load ${movie.title}${year ? ` (${year})` : ""}`}
                        >
                          {posterUrl ? (
                            <motion.img
                              layoutId={`similar-poster-${movie.id}`}
                              src={posterUrl}
                              srcSet={
                                movie.poster_path
                                  ? tmdbPosterSrcSet(movie.poster_path)
                                  : undefined
                              }
                              sizes={posterSizes}
                              alt={`${movie.title} poster`}
                              loading="lazy"
                              decoding="async"
                              className="w-full aspect-[2/3] object-cover"
                            />
                          ) : (
                            <motion.div
                              layoutId={`similar-poster-${movie.id}`}
                              className="w-full aspect-[2/3] bg-clay-base flex items-center justify-center"
                            >
                              <span className="text-clay-text-muted text-xs text-center px-1">
                                {movie.title}
                              </span>
                            </motion.div>
                          )}
                          <div className="p-2">
                            <p className="text-clay-text text-xs font-medium line-clamp-2 leading-tight">
                              {movie.title}
                            </p>
                            {year && (
                              <p className="text-clay-text-muted text-xs mt-0.5">
                                {year}
                              </p>
                            )}
                          </div>
                        </button>
                      </StaggerItem>
                    );
                  })}
                </StaggerContainer>
              ) : null}
            </section>
          </div>
        </ScrollReveal>
      )}
    </div>
  );
}
