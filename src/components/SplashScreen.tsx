import { motion } from 'motion/react';
import { Film } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

/**
 * SplashScreen — Animated loading screen with staggered logo reveal,
 * progress bar, and smooth exit transition.
 */
export function SplashScreen({ onComplete }: SplashScreenProps) {
  const words = ['Which', 'Movie', 'To', 'Watch'];

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-clay-base"
      initial={{ opacity: 1 }}
      exit={{
        opacity: 0,
        scale: 1.05,
        filter: 'blur(8px)',
      }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 15,
          delay: 0.1,
        }}
        className="mb-6"
      >
        <Film
          className="w-14 h-14 text-accent"
          strokeWidth={1.5}
        />
      </motion.div>

      {/* Staggered word reveal */}
      <motion.div
        className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: 0.12, delayChildren: 0.4 },
          },
        }}
      >
        {words.map((word) => (
          <motion.span
            key={word}
            className="font-heading text-3xl sm:text-4xl md:text-5xl text-clay-text"
            variants={{
              hidden: { opacity: 0, y: 24, filter: 'blur(8px)' },
              visible: {
                opacity: 1,
                y: 0,
                filter: 'blur(0px)',
                transition: {
                  type: 'spring',
                  stiffness: 300,
                  damping: 20,
                },
              },
            }}
          >
            {word}
          </motion.span>
        ))}
      </motion.div>

      {/* Tagline */}
      <motion.p
        className="font-body text-sm text-clay-text-muted mt-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.4 }}
      >
        Discover your next favorite film
      </motion.p>

      {/* Progress bar */}
      <motion.div
        className="mt-8 w-48 h-1 rounded-full overflow-hidden bg-clay-surface"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <motion.div
          className="h-full rounded-full bg-accent"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ delay: 0.9, duration: 1.2, ease: 'easeInOut' }}
          onAnimationComplete={onComplete}
        />
      </motion.div>
    </motion.div>
  );
}
