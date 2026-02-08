"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "motion/react";
import { Play, Shuffle, Sparkles } from "lucide-react";
import { tmdbBackdrop, tmdbImage } from "@/lib/constants";
import { formatYear } from "@/lib/utils";
import { RatingRing } from "@/components/ui/RatingRing";
import { ClayButton } from "@/components/ui/ClayButton";
import type { Movie } from "@/types/movie";
import { GENRES } from "@/types/movie";

interface HeroSectionProps {
  movie: Movie;
  onSelect?: (id: number) => void;
  onShuffle?: () => void;
}

export function HeroSection({ movie, onSelect, onShuffle }: HeroSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const backdropY = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const genreNames = movie.genre_ids
    .slice(0, 3)
    .map((id) => GENRES.find((g) => g.id === id)?.name)
    .filter(Boolean);

  // Kinetic title — split into characters
  const titleChars = movie.title.split("");

  return (
    <section
      ref={ref}
      className="relative h-[85vh] md:h-[90vh] w-full overflow-hidden"
    >
      {/* Backdrop image with parallax */}
      <motion.div
        className="absolute inset-0"
        style={{ y: prefersReduced ? 0 : backdropY }}
      >
        {movie.backdrop_path && (
          <Image
            src={tmdbBackdrop(movie.backdrop_path)}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            priority
            quality={85}
          />
        )}
        {/* Multi-layer gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-base)] via-[var(--bg-base)]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-base)]/80 to-transparent" />
      </motion.div>

      {/* Content */}
      <motion.div
        className="relative z-10 h-full flex flex-col justify-end pb-16 md:pb-20 px-6 md:px-12 lg:px-20 max-w-5xl"
        style={{ y: prefersReduced ? 0 : contentY, opacity }}
      >
        {/* Genre pills */}
        <motion.div
          className="flex gap-2 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {genreNames.map((name) => (
            <span
              key={name}
              className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/80 backdrop-blur-sm border border-white/10"
            >
              {name}
            </span>
          ))}
        </motion.div>

        {/* Kinetic title */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight">
          {titleChars.map((char, i) => (
            <motion.span
              key={i}
              className="inline-block"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: prefersReduced ? 0 : 0.3 + i * 0.02,
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </h1>

        {/* Year & Rating */}
        <motion.div
          className="flex items-center gap-4 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <span className="text-white/60 text-lg">
            {formatYear(movie.release_date)}
          </span>
          <RatingRing
            rating={movie.vote_average}
            size={48}
            strokeWidth={3}
          />
        </motion.div>

        {/* Overview */}
        <motion.p
          className="text-white/70 text-base md:text-lg max-w-2xl mb-6 line-clamp-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          {movie.overview}
        </motion.p>

        {/* Action buttons */}
        <motion.div
          className="flex gap-3 flex-wrap"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <ClayButton
            variant="accent"
            size="lg"
            onClick={() => onSelect?.(movie.id)}
          >
            <Sparkles size={18} className="mr-2 inline" />
            View Details
          </ClayButton>
          <ClayButton variant="ghost" size="lg" onClick={onShuffle}>
            <Shuffle size={18} className="mr-2 inline" />
            Surprise Me
          </ClayButton>
        </motion.div>
      </motion.div>
    </section>
  );
}
