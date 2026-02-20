// Dinner Time — cinematic family-friendly movie finder (DINR-02, DINR-03, DINR-04, DINR-05)

import { useRef, useEffect, useState } from "react";
import { ThumbsUp, ThumbsDown, SkipForward, AlertCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { ScrollReveal } from "@/components/animation/ScrollReveal";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/animation/StaggerContainer";
import {
  DINNER_TIME_SERVICES,
  type UseDinnerTimeReturn,
} from "@/hooks/useDinnerTime";
import { useOmdbRatings } from "@/hooks/useOmdbRatings";
import { useMovieHistoryStore } from "@/stores/movieHistoryStore";
import { getServiceConfig, getServiceLogoUrl } from "./ServiceBranding";
import { ServiceRotaryDial } from "./ServiceRotaryDial";
import { MovieHero } from "@/components/movie/MovieHero";
import { RatingBadges } from "@/components/movie/RatingBadges";
import { TrailerLink } from "@/components/movie/TrailerLink";
import { MetalButton } from "@/components/ui/MetalButton";
import { ClayCard } from "@/components/ui/ClayCard";
import { ClaySkeletonCard } from "@/components/ui/ClaySkeletonCard";
import { ExternalLink } from "@/components/shared/ExternalLink";
import { showToast } from "@/components/shared/Toast";
import { useAnnounce } from "@/components/shared/ScreenReaderAnnouncer";
import { getBackdropUrl } from "@/services/tmdb/client";
import { tmdbBackdropSrcSet, backdropSizes } from "@/hooks/useResponsiveImage";

const SERVICES = [
  { id: DINNER_TIME_SERVICES.NETFLIX, label: "Netflix" },
  { id: DINNER_TIME_SERVICES.PRIME, label: "Prime Video" },
  { id: DINNER_TIME_SERVICES.DISNEY_PLUS, label: "Disney+" },
] as const;

const FEATURED_IDS = new Set([
  DINNER_TIME_SERVICES.NETFLIX,
  DINNER_TIME_SERVICES.PRIME,
  DINNER_TIME_SERVICES.DISNEY_PLUS,
]);

interface RegionProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

interface DinnerTimePageProps {
  dinnerTime: UseDinnerTimeReturn;
  regionProviders: RegionProvider[];
}

export function DinnerTimePage({
  dinnerTime,
  regionProviders,
}: DinnerTimePageProps) {
  const { movie, isLoading, error, nextMovie, setService, currentService } =
    dinnerTime;
  const [announce, Announcer] = useAnnounce();

  const markDinnerLike = useMovieHistoryStore((s) => s.markDinnerLike);
  const markDinnerDislike = useMovieHistoryStore((s) => s.markDinnerDislike);

  const imdbId = movie?.imdb_id ?? null;
  const { imdbRating, rottenTomatoes, metascore } = useOmdbRatings(imdbId);

  const isCustomService = !FEATURED_IDS.has(currentService as 8 | 9 | 337);

  // Find custom provider metadata for dynamic branding
  const customProvider = isCustomService
    ? regionProviders.find((p) => p.provider_id === currentService)
    : undefined;

  const serviceConfig = getServiceConfig(
    currentService,
    customProvider?.provider_name,
    customProvider?.logo_path,
  );

  // Persist the last valid backdrop so it stays visible during loading (DINR-05)
  const lastBackdropRef = useRef<string | null>(null);
  const backdropUrl = movie?.backdrop_path
    ? getBackdropUrl(movie.backdrop_path, "original")
    : null;
  if (backdropUrl) lastBackdropRef.current = backdropUrl;
  const visibleBackdrop = backdropUrl ?? lastBackdropRef.current;

  // Service-change color flash — briefly tint overlay with new brand color (DINR-05)
  const [serviceFlash, setServiceFlash] = useState(false);
  const prevServiceRef = useRef(currentService);
  useEffect(() => {
    if (prevServiceRef.current !== currentService) {
      prevServiceRef.current = currentService;
      setServiceFlash(true);
      const timer = setTimeout(() => setServiceFlash(false), 600);
      return () => clearTimeout(timer);
    }
  }, [currentService]);

  // A11Y-01: Announce movie title to screen readers when a new movie loads (A11Y-04)
  useEffect(() => {
    if (movie?.title) {
      announce(`Now showing on ${serviceConfig.name}: ${movie.title}`);
    }
  }, [movie?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const watchUrl = movie ? serviceConfig.watchUrl(movie.title) : "#";

  function handleGreatPick() {
    if (!movie) return;
    markDinnerLike(movie.id);
    showToast(`Loved "${movie.title}"! Loading next...`, "success");
    nextMovie();
  }

  function handleNotThis() {
    if (!movie) return;
    markDinnerDislike(movie.id);
    nextMovie();
  }

  return (
    <div className="w-full">
      <Announcer />

      {/* Fixed full-screen backdrop — persists during provider switch (DINR-05) */}
      {visibleBackdrop && (
        <div
          className="fixed inset-0 z-0 pointer-events-none"
          aria-hidden="true"
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={backdropUrl ?? "persisted"}
              src={visibleBackdrop}
              srcSet={
                movie?.backdrop_path
                  ? tmdbBackdropSrcSet(movie.backdrop_path)
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

          {/* Service brand color flash overlay (DINR-05) */}
          <div
            className="absolute inset-0 transition-opacity duration-500 pointer-events-none"
            style={{
              backgroundColor: serviceConfig.color,
              opacity: serviceFlash ? 0.12 : 0,
            }}
          />
        </div>
      )}

      {/* Page header — once: header near top of page, only animates on first view (ANIM-02) */}
      <ScrollReveal
        travel={40}
        once
        className="relative z-10 px-4 sm:px-6 lg:px-8 pt-4"
      >
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-clay-text">
            Dinner Time
          </h1>
          <p className="text-sm text-clay-text-muted font-light mt-1">
            Choose your service below
          </p>
        </div>
      </ScrollReveal>

      {/* Service selector — icon buttons + rotary knob */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 pt-5 pb-4">
        <StaggerContainer
          className="flex items-center justify-center gap-3 sm:gap-4"
          stagger={0.1}
          direction="up"
          role="group"
          aria-label="Select streaming service"
        >
          {SERVICES.map((service) => {
            const isActive = currentService === service.id;
            const logoUrl = getServiceLogoUrl(service.id);
            const config = getServiceConfig(service.id);

            return (
              <StaggerItem key={service.id} direction="up">
                <motion.button
                  type="button"
                  onClick={() => setService(service.id)}
                  aria-pressed={isActive}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className={`
                    relative flex flex-col items-center gap-2 px-5 py-4 sm:px-8 sm:py-5
                    rounded-2xl border transition-all duration-300
                    outline-none focus-visible:ring-2 focus-visible:ring-accent
                    ${
                      isActive
                        ? "bg-white/[0.12] backdrop-blur-sm border-white/20 shadow-lg shadow-black/10"
                        : "bg-white/[0.04] border-white/[0.06] opacity-50 hover:opacity-80"
                    }
                  `}
                >
                  {/* Active glow ring */}
                  {isActive && (
                    <motion.div
                      layoutId="service-glow"
                      className="absolute inset-0 rounded-2xl"
                      style={{
                        boxShadow: `0 0 20px ${config.color}30, 0 0 40px ${config.color}15`,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                      }}
                    />
                  )}

                  {/* Provider logo */}
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt=""
                      className={`
                        w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover
                        shadow-md transition-shadow duration-300
                        ${isActive ? "shadow-lg" : ""}
                      `}
                      aria-hidden="true"
                    />
                  ) : (
                    <div
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: config.color }}
                    >
                      {service.label[0]}
                    </div>
                  )}

                  {/* Label */}
                  <span
                    className={`
                    text-xs sm:text-sm font-medium transition-colors duration-300
                    ${isActive ? "text-clay-text" : "text-clay-text-muted"}
                  `}
                  >
                    {service.label}
                  </span>

                  {/* Active dot */}
                  {isActive && (
                    <motion.div
                      layoutId="service-dot"
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: config.color }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                      }}
                    />
                  )}
                </motion.button>
              </StaggerItem>
            );
          })}

          {/* Rotary knob — inline with the service icons */}
          <StaggerItem direction="up">
            <ServiceRotaryDial
              currentService={currentService}
              onServiceChange={setService}
            />
          </StaggerItem>
        </StaggerContainer>
      </div>

      {/* Unified content area — loading / error / movie crossfade (DINR-05) */}
      <AnimatePresence mode="wait">
        {/* Loading state */}
        {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="relative z-10 w-full px-4 py-6"
          >
            <ClaySkeletonCard
              hasImage
              lines={4}
              className="w-full max-w-7xl mx-auto"
            />
          </motion.div>
        )}

        {/* Error state */}
        {!isLoading && error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="relative z-10 w-full px-4 py-6"
          >
            <ClayCard className="max-w-7xl mx-auto">
              <div className="p-6 text-center">
                <AlertCircle
                  className="w-12 h-12 text-yellow-400 mx-auto mb-3"
                  aria-hidden="true"
                />
                <p className="text-clay-text font-semibold mb-1">
                  No movies found on {serviceConfig.name}
                </p>
                <p className="text-clay-text-muted text-sm mb-4">{error}</p>
                <MetalButton variant="secondary" size="sm" onClick={nextMovie}>
                  Try another
                </MetalButton>
              </div>
            </ClayCard>
          </motion.div>
        )}

        {/* Movie hero — morph transition on Next Movie */}
        {!isLoading && !error && movie && (
          <motion.section
            key={`movie-${movie.id}`}
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.01, y: -6 }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative z-10 flex flex-col justify-end px-4 sm:px-6 lg:px-8 pb-8"
          >
            <div className="max-w-7xl mx-auto w-full">
              <MovieHero
                movie={movie}
                posterFooter={<TrailerLink videos={movie.videos} />}
              >
                {/* Watch on Service — prominent branded button */}
                <ExternalLink href={watchUrl} className="block">
                  <MetalButton
                    variant="primary"
                    size="md"
                    className="w-full sm:w-auto gap-2"
                    style={{ backgroundColor: serviceConfig.color }}
                    aria-label={`Watch ${movie.title} on ${serviceConfig.name}`}
                  >
                    {(() => {
                      const logoUrl = getServiceLogoUrl(
                        currentService,
                        customProvider?.logo_path,
                      );
                      return logoUrl ? (
                        <img
                          src={logoUrl}
                          alt=""
                          className="w-5 h-5 rounded object-cover"
                          aria-hidden="true"
                        />
                      ) : null;
                    })()}
                    Watch on {serviceConfig.name}
                  </MetalButton>
                </ExternalLink>

                {/* Like / Dislike / Skip */}
                <div
                  className="flex gap-2 flex-wrap"
                  role="group"
                  aria-label="Movie actions"
                >
                  <MetalButton
                    variant="secondary"
                    size="sm"
                    onClick={handleGreatPick}
                    className="gap-1.5"
                    aria-label="Great pick — mark as liked and load next"
                  >
                    <ThumbsUp className="w-4 h-4" aria-hidden="true" />
                    Great Pick
                  </MetalButton>

                  <MetalButton
                    variant="secondary"
                    size="sm"
                    onClick={handleNotThis}
                    className="gap-1.5"
                    aria-label="Not this one — mark as disliked and load next"
                  >
                    <ThumbsDown className="w-4 h-4" aria-hidden="true" />
                    Not This
                  </MetalButton>

                  <MetalButton
                    variant="ghost"
                    size="sm"
                    onClick={nextMovie}
                    aria-label="Skip to next movie"
                  >
                    <SkipForward className="w-4 h-4" aria-hidden="true" />
                  </MetalButton>
                </div>

                {/* Rating badges */}
                <RatingBadges
                  tmdbRating={movie.vote_average}
                  imdbRating={imdbRating}
                  rottenTomatoes={rottenTomatoes}
                  metascore={metascore}
                />
              </MovieHero>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
