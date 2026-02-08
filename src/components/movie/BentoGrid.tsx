"use client";

import { motion } from "motion/react";
import { MovieCard } from "./MovieCard";
import type { Movie } from "@/types/movie";
import { ANIMATION_CONFIG } from "@/lib/constants";
import { Flame, Popcorn, Crown, Clapperboard, Sparkles, Tv } from "lucide-react";
import { ClayCard } from "@/components/ui/ClayCard";

interface BentoGridProps {
  movies: Movie[];
  onSelectMovie?: (id: number) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: ANIMATION_CONFIG.stagger.normal,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: ANIMATION_CONFIG.spring.default,
  },
};

export function BentoGrid({ movies, onSelectMovie }: BentoGridProps) {
  if (!movies?.length) return null;

  const featured = movies[0];
  const secondary = movies.slice(1, 5);
  const tertiary = movies.slice(5, 9);

  return (
    <motion.section
      className="px-4 md:px-8 lg:px-12"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
    >
      <motion.h2
        className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-6"
        variants={itemVariants}
      >
        <Sparkles size={24} className="inline mr-2 text-[var(--accent-warm)]" />
        For You
      </motion.h2>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[280px]">
        {/* Featured — large card spanning 2x2 */}
        <motion.div
          className="md:col-span-2 md:row-span-2"
          variants={itemVariants}
        >
          <MovieCard
            movie={featured}
            size="large"
            onSelect={onSelectMovie}
            index={0}
          />
        </motion.div>

        {/* Secondary cards */}
        {secondary.map((movie, i) => (
          <motion.div key={movie.id} variants={itemVariants}>
            <MovieCard
              movie={movie}
              onSelect={onSelectMovie}
              index={i + 1}
            />
          </motion.div>
        ))}

        {/* Feature cards — quick access tiles */}
        <motion.div variants={itemVariants}>
          <FeatureTile
            icon={<Flame size={28} className="text-orange-400" />}
            title="Trending"
            subtitle="What's hot right now"
            color="from-orange-500/20"
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <FeatureTile
            icon={<Crown size={28} className="text-yellow-400" />}
            title="Top Rated"
            subtitle="All-time classics"
            color="from-yellow-500/20"
          />
        </motion.div>

        {/* More movie cards */}
        {tertiary.map((movie, i) => (
          <motion.div key={movie.id} variants={itemVariants}>
            <MovieCard
              movie={movie}
              onSelect={onSelectMovie}
              index={i + 5}
            />
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

function FeatureTile({
  icon,
  title,
  subtitle,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color: string;
}) {
  return (
    <ClayCard
      className={`h-full flex flex-col items-center justify-center text-center p-6 bg-gradient-to-br ${color} to-transparent`}
    >
      <div className="mb-3">{icon}</div>
      <h3 className="font-bold text-[var(--text-primary)] text-lg">{title}</h3>
      <p className="text-sm text-[var(--text-muted)] mt-1">{subtitle}</p>
    </ClayCard>
  );
}
