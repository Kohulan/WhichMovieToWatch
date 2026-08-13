// Main discovery screen — cinematic hero, ratings, providers, actions, similar movies

import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
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
import { getMoviePosterLayoutId } from "@/lib/layout-ids";
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
import { RetryError } from "@/components/shared/RetryError";
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
  tmdbImageUrl,
} from "@/hooks/useResponsiveImage";
import { ShareButton } from "@/components/share/ShareButton";
import { Seo, routeSeoProps } from "@/components/seo/Seo";
import { getRouteMeta, SITE } from "@/seo/meta";
import { movieJsonLd } from "@/../tools/lib/jsonld.mjs";
import { moviePath } from "@/lib/movie-url";
import { MoodFilterBar } from "./MoodFilterBar";
import { WatchlistRouletteModal } from "./WatchlistRouletteModal";
import { CouplesDecideModal } from "./CouplesDecideModal";
import { Dices, Users } from "lucide-react";
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
  const navigate = useNavigate();
  const [announce, Announcer] = useAnnounce();
  const [lovedMovieId, setLovedMovieId] = useState<number | null>(null);
  const [globalProviders, setGlobalProviders] = useState(false);
  const [showTickets, setShowTickets] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [rouletteOpen, setRouletteOpen] = useState(false);
  const [couplesOpen, setCouplesOpen] = useState(false);

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
  const {
    deepLinkMovieId,
    showAllProviders,
    isTrendingSource,
    isCanonicalMoviePath,
    clearDeepLink,
  } = useDeepLink();
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
    isLoading: providersLoading,
    error: providersError,
    retry: retryProviders,
  } = useWatchProviders(currentMovie?.id ?? null, currentMovie?.title ?? "");
  const providers = myServices.length > 0 ? myProviders : allProviders;

  // Similar movies — only triggered after Love action (INTR-01)
  const {
    movies: similarMovies,
    isLoading: similarLoading,
    error: similarError,
    retry: retrySimilar,
  } = useSimilarMovies(lovedMovieId);

  // Full-bleed backdrop URL
  const backdropUrl = currentMovie?.backdrop_path
    ? getBackdropUrl(currentMovie.backdrop_path, "original")
    : null;

  // Initialize on mount: show onboarding for new users, apply persisted filters + discover for returning users.
  // Post-onboarding discover is handled by handleOnboardingComplete — no deps needed here.
  // Skipped entirely when a deep link pins a movie (deepLinkMovieId) — that movie takes
  // over the display and onboarding/discover would only race with it. Canonical
  // /movie/:slug pages keep their URL for the whole visit (see the deep-link effect
  // below), so this mount effect never re-fires mid-visit; it only runs again once the
  // user explicitly leaves via Next/Skip, landing on plain /discover — at which point a
  // fresh onboarding prompt or discover() is exactly the intended (pre-existing) behavior.
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

  // When deep link movie is loaded, set it as current movie in store.
  // Capture showAllProviders/isTrendingSource before any clearing — URL params
  // disappear after clearDeepLink(). On the canonical /movie/:slug path, the URL is
  // NOT auto-cleared: it must stay put for the whole visit (shareable link, SEO
  // canonical, and clearing it would remount the page and reset showTickets/
  // globalProviders back to their initial false). Only the legacy ?movie=ID query
  // form strips its params here — same route, no remount, so it's harmless.
  // Leaving /movie/:slug happens explicitly via Next/Skip (see handleNext).
  useEffect(() => {
    if (deepLinkMovie) {
      setGlobalProviders(showAllProviders);
      setShowTickets(isTrendingSource);
      setCurrentMovie(deepLinkMovie);
      if (!isCanonicalMoviePath) {
        clearDeepLink();
      }
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
  // Same deep-link-pinning problem as handleNext: while a deep link pins the display,
  // setCurrentMovie(null) + discover() would be invisible (currentMovie still resolves
  // to the pinned deepLinkMovie). Leave deep-link mode first and let the post-remount
  // mount effect run the fresh discover().
  const handleSettingsSaved = useCallback(() => {
    setSettingsOpen(false);
    setLovedMovieId(null);
    setGlobalProviders(false);
    setShowTickets(false);
    if (deepLinkMovieId !== null) {
      clearDeepLink();
      return;
    }
    setCurrentMovie(null);
    discover();
  }, [discover, setCurrentMovie, deepLinkMovieId, clearDeepLink]);

  // Handle Next action — resets global provider view back to regional.
  // While a deep link pins the display (deepLinkMovieId), currentMovie always
  // resolves to that pinned movie regardless of discover() — so leave deep-link
  // mode first. On /movie/:slug that navigates to /discover, remounting this
  // component; its mount-only effect then runs the fresh discover() (avoids
  // kicking off a second, redundant discover() call here that would race it).
  const handleNext = useCallback(() => {
    setLovedMovieId(null);
    setGlobalProviders(false);
    setShowTickets(false);
    if (deepLinkMovieId !== null) {
      clearDeepLink();
      return;
    }
    discover();
  }, [discover, deepLinkMovieId, clearDeepLink]);

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
        if (isCanonicalMoviePath) {
          // currentMovie always prefers the pinned deep-link movie while the URL
          // stays on /movie/:slug — setCurrentMovie() alone would be invisible.
          // Navigate to the new movie's own canonical page instead; the resulting
          // remount picks it up as the new deep link, keeping the URL/canonical in
          // sync with what's actually displayed.
          // Set the store first: the zustand store survives the slug→slug
          // remount, so the freshly-mounted page renders this movie instantly
          // instead of flashing the old movie while useMovieDetails re-resolves
          // it (from cache) after the remount.
          setCurrentMovie(details);
          navigate(moviePath(details));
          return;
        }
        setCurrentMovie(details);
        setLovedMovieId(null);
      } catch (err) {
        console.warn("[DiscoveryPage] Failed to load similar movie:", err);
      }
    },
    [setCurrentMovie, isCanonicalMoviePath, navigate],
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
        <Seo {...routeSeoProps(getRouteMeta("/discover")!)} />
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
        <Seo {...routeSeoProps(getRouteMeta("/discover")!)} />
        <Announcer />
        <LoadingQuotes />
      </div>
    );
  }

  // Error state — open preferences with a warning so the user can pick different filters
  if (error && !currentMovie) {
    return (
      <div className="relative z-10 w-full flex flex-col items-center justify-center min-h-[60vh] px-4 py-6">
        <Seo {...routeSeoProps(getRouteMeta("/discover")!)} />
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
        <Seo {...routeSeoProps(getRouteMeta("/discover")!)} />
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

      {/* Dynamic OG/Twitter Card meta tags + Movie JSON-LD — React 19 native hoisting (SOCL-02, SOCL-03) */}
      {/* Only claim the movie's own canonical when the URL actually pins it
          (canonical /movie/:slug, or legacy /discover?movie=ID). A random
          discover() result on plain /discover keeps the route's own
          canonical — otherwise every reshuffled random movie would hijack
          /discover's canonical to point at itself (DISC-canonical bug). */}
      {currentMovie && (isCanonicalMoviePath || deepLinkMovieId !== null) ? (
        <Seo
          title={`${currentMovie.title} — Where to Stream & Ratings`}
          description={`${currentMovie.title}${currentMovie.release_date ? ` (${currentMovie.release_date.slice(0, 4)})` : ""} — ${(currentMovie.overview ?? "").slice(0, 120)}…`}
          path={moviePath(currentMovie)}
          ogImage={
            currentMovie.poster_path
              ? tmdbImageUrl(currentMovie.poster_path, "w1280")
              : undefined
          }
          ogType="video.movie"
          jsonLd={[movieJsonLd(currentMovie, SITE.origin)]}
        />
      ) : (
        <Seo {...routeSeoProps(getRouteMeta("/discover")!)} />
      )}

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
              {/* Time Budget & Mood Matrix Filter Bar */}
              <MoodFilterBar onFilterChange={() => discover()} />

              {/* Action buttons — immediately below title/overview (DISP-06) */}
              <MovieActions
                movieId={currentMovie.id}
                movieGenres={currentMovie.genres ?? []}
                releaseYear={currentMovie.release_date?.slice(0, 4) ?? ""}
                onNext={handleNext}
                onLove={handleLove}
                isLoading={showLoading}
              />

              {/* Quick Decision Helpers: Watchlist Roulette & Couples Quick-Decide */}
              <div className="flex gap-2 pt-1 pb-2">
                <button
                  type="button"
                  onClick={() => setRouletteOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] text-clay-text text-xs font-medium border border-white/10 transition-colors cursor-pointer"
                >
                  <Dices className="w-3.5 h-3.5 text-accent" />
                  Spin Saved
                </button>
                <button
                  type="button"
                  onClick={() => setCouplesOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] text-clay-text text-xs font-medium border border-white/10 transition-colors cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5 text-accent" />
                  Couples Match
                </button>
              </div>

              {/* Rating badges (DISP-02) */}
              <RatingBadges
                tmdbRating={currentMovie.vote_average}
                imdbRating={imdbRating}
                rottenTomatoes={rottenTomatoes}
                metascore={metascore}
              />

              {/* Streaming providers (DISP-05) — show global availability when navigating from Netflix search */}
              {globalProviders ? (
                <GlobalAvailabilitySection
                  movieId={currentMovie.id}
                  embeddedProviders={currentMovie["watch/providers"]?.results}
                />
              ) : (
                <ProviderSection
                  providers={providers}
                  findMovieLink={findMovieLink}
                  hasServiceMismatch={hasServiceMismatch}
                  allProviders={allProviders}
                  isLoading={providersLoading}
                  error={providersError}
                  onRetry={retryProviders}
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
      {/* Skip the heading entirely when there's nothing to show (no movies,
          no skeleton, no error) so we never strand a heading over empty space. */}
      {lovedMovieId !== null &&
        (similarLoading || similarError || similarMovies.length > 0) && (
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
                ) : similarError ? (
                  <RetryError
                    message="Could not load similar movies."
                    onRetry={retrySimilar}
                    align="start"
                  />
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
                            className="w-28 text-left rounded-lg overflow-hidden bg-clay-surface clay-shadow-sm hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-accent"
                            onClick={() => handleSimilarMovieClick(movie.id)}
                            aria-label={`Load ${movie.title}${year ? ` (${year})` : ""}`}
                          >
                            {posterUrl ? (
                              <motion.img
                                layoutId={getMoviePosterLayoutId(movie.id)}
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
                                layoutId={getMoviePosterLayoutId(movie.id)}
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

      {/* Watchlist Roulette Modal */}
      <WatchlistRouletteModal
        open={rouletteOpen}
        onClose={() => setRouletteOpen(false)}
        onSelectMovie={(movie) => {
          setCurrentMovie(movie);
          if (isCanonicalMoviePath) {
            navigate(moviePath(movie));
          }
        }}
      />

      {/* Couples Quick-Decide Modal */}
      <CouplesDecideModal
        open={couplesOpen}
        onClose={() => setCouplesOpen(false)}
        candidateMovies={currentMovie ? [currentMovie, ...similarMovies] : similarMovies}
        onSelectMovie={(movie) => {
          setCurrentMovie(movie);
          if (isCanonicalMoviePath) {
            navigate(moviePath(movie));
          }
        }}
      />
    </div>
  );
}
