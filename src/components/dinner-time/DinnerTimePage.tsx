// Dinner Time — cinematic family-friendly movie finder (DINR-02, DINR-03, DINR-04)

import { ThumbsUp, ThumbsDown, SkipForward, AlertCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { ScrollReveal } from '@/components/animation/ScrollReveal';
import { StaggerContainer, StaggerItem } from '@/components/animation/StaggerContainer';
import {
  useDinnerTime,
  DINNER_TIME_SERVICES,
  type DinnerTimeServiceId,
} from '@/hooks/useDinnerTime';
import { useOmdbRatings } from '@/hooks/useOmdbRatings';
import { useMovieHistoryStore } from '@/stores/movieHistoryStore';
import { getServiceConfig, getServiceLogoUrl } from './ServiceBranding';
import { MovieHero } from '@/components/movie/MovieHero';
import { RatingBadges } from '@/components/movie/RatingBadges';
import { TrailerLink } from '@/components/movie/TrailerLink';
import { MetalButton } from '@/components/ui/MetalButton';
import { ClayCard } from '@/components/ui/ClayCard';
import { ClaySkeletonCard } from '@/components/ui/ClaySkeletonCard';
import { ExternalLink } from '@/components/shared/ExternalLink';
import { showToast } from '@/components/shared/Toast';
import { getBackdropUrl } from '@/services/tmdb/client';

const SERVICES = [
  { id: DINNER_TIME_SERVICES.NETFLIX, label: 'Netflix' },
  { id: DINNER_TIME_SERVICES.PRIME, label: 'Prime Video' },
  { id: DINNER_TIME_SERVICES.DISNEY_PLUS, label: 'Disney+' },
] as const;

export function DinnerTimePage() {
  const { movie, isLoading, error, nextMovie, setService, currentService } =
    useDinnerTime();

  const markDinnerLike = useMovieHistoryStore((s) => s.markDinnerLike);
  const markDinnerDislike = useMovieHistoryStore((s) => s.markDinnerDislike);

  const imdbId = movie?.imdb_id ?? null;
  const { imdbRating, rottenTomatoes, metascore } = useOmdbRatings(imdbId);

  const serviceConfig = getServiceConfig(currentService);

  const backdropUrl = movie?.backdrop_path
    ? getBackdropUrl(movie.backdrop_path, 'original')
    : null;

  const watchUrl = movie ? serviceConfig.watchUrl(movie.title) : '#';

  function handleGreatPick() {
    if (!movie) return;
    markDinnerLike(movie.id);
    showToast(`Loved "${movie.title}"! Loading next...`, 'success');
    nextMovie();
  }

  function handleNotThis() {
    if (!movie) return;
    markDinnerDislike(movie.id);
    nextMovie();
  }

  return (
    <div className="w-full">
      {/* Fixed full-screen backdrop — crossfades between movies */}
      {backdropUrl && (
        <div className="fixed inset-0 z-0" aria-hidden="true">
          <AnimatePresence mode="wait">
            <motion.img
              key={movie!.id}
              src={backdropUrl}
              alt=""
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

      {/* Page header — once: header near top of page, only animates on first view (ANIM-02) */}
      <ScrollReveal travel={40} once className="relative z-10 px-4 sm:px-6 lg:px-8 pt-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-clay-text">
            Dinner Time
          </h1>
          <p className="text-sm text-clay-text-muted font-light mt-1">
            Pick a service, find the perfect family movie
          </p>
        </div>
      </ScrollReveal>

      {/* Service selector — centered, with provider logos */}
      {/* StaggerContainer: 3 service buttons stagger their entrance (ANIM-02) */}
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
              /* StaggerItem: each service button staggers its entrance from the container (ANIM-02) */
              <StaggerItem key={service.id} direction="up">
                <motion.button
                  type="button"
                  onClick={() => setService(service.id as DinnerTimeServiceId)}
                  aria-pressed={isActive}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className={`
                    relative flex flex-col items-center gap-2 px-5 py-4 sm:px-8 sm:py-5
                    rounded-2xl border transition-all duration-300
                    outline-none focus-visible:ring-2 focus-visible:ring-accent
                    ${isActive
                      ? 'bg-white/[0.12] backdrop-blur-xl border-white/20 shadow-lg shadow-black/10'
                      : 'bg-white/[0.04] backdrop-blur-sm border-white/[0.06] opacity-50 hover:opacity-80'
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
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
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
                        ${isActive ? 'shadow-lg' : ''}
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
                  <span className={`
                    text-xs sm:text-sm font-medium transition-colors duration-300
                    ${isActive ? 'text-clay-text' : 'text-clay-text-muted'}
                  `}>
                    {service.label}
                  </span>

                  {/* Active dot */}
                  {isActive && (
                    <motion.div
                      layoutId="service-dot"
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: config.color }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    />
                  )}
                </motion.button>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="relative z-10 w-full px-4 py-6">
          <ClaySkeletonCard hasImage lines={4} className="w-full max-w-7xl mx-auto" />
        </div>
      )}

      {/* Error state */}
      {!isLoading && error && (
        <div className="relative z-10 w-full px-4 py-6">
          <ClayCard className="max-w-7xl mx-auto">
            <div className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-3" aria-hidden="true" />
              <p className="text-clay-text font-semibold mb-1">
                No movies found on {serviceConfig.name}
              </p>
              <p className="text-clay-text-muted text-sm mb-4">{error}</p>
              <MetalButton variant="secondary" size="sm" onClick={nextMovie}>
                Try another
              </MetalButton>
            </div>
          </ClayCard>
        </div>
      )}

      {/* Movie hero — morph transition on Next Movie */}
      <AnimatePresence mode="wait">
        {!isLoading && !error && movie && (
          <motion.section
            key={movie.id}
            initial={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.02, filter: 'blur(6px)' }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
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
                      const logoUrl = getServiceLogoUrl(currentService);
                      return logoUrl ? (
                        <img src={logoUrl} alt="" className="w-5 h-5 rounded object-cover" aria-hidden="true" />
                      ) : null;
                    })()}
                    Watch on {serviceConfig.name}
                  </MetalButton>
                </ExternalLink>

                {/* Like / Dislike / Skip */}
                <div className="flex gap-2 flex-wrap" role="group" aria-label="Movie actions">
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
