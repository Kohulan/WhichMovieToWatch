import { motion } from 'motion/react';
import logoSrc from '@/../assets/logo.png';

interface SplashScreenProps {
  onComplete: () => void;
}

/**
 * SplashScreen — Netflix-style dramatic logo reveal.
 *
 * Always plays on app launch (~2.5s). Dark background with accent-colored
 * ambient light bloom, specular glow behind Film icon, bold white text with
 * blur-in stagger, and a thin cinematic progress bar. No skip button —
 * this is the brand moment. (Per user decision in CONTEXT.md)
 *
 * Exit: opacity + scale + blur for cinematic screen-away feel.
 */
export function SplashScreen({ onComplete }: SplashScreenProps) {
  const words = ['Which', 'Movie', 'To', 'Watch'];

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{
        opacity: 0,
        scale: 1.1,
        filter: 'blur(12px)',
        transition: { duration: 0.6, ease: 'easeInOut' },
      }}
    >
      {/* Dramatic ambient light sweep — accent-colored radial bloom */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full"
          style={{
            background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)',
          }}
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{
            opacity: [0, 0.4, 0.2],
            scale: [0.3, 1.5, 2],
          }}
          transition={{ duration: 2.5, ease: 'easeOut' }}
        />
      </motion.div>

      {/* Logo — dramatic spring entrance with rotation */}
      <motion.div
        initial={{ scale: 0, rotate: -180, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{
          type: 'spring',
          stiffness: 180,
          damping: 14,
          delay: 0.2,
        }}
        className="mb-6 relative z-10"
      >
        <img
          src={logoSrc}
          alt="Which Movie To Watch"
          className="w-20 h-20 object-contain"
        />
        {/* Specular glow behind logo — blurred accent-colored halo */}
        <motion.div
          className="absolute inset-0 blur-xl pointer-events-none"
          style={{ backgroundColor: 'var(--accent)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0.3] }}
          transition={{ duration: 1.5, delay: 0.3 }}
        />
      </motion.div>

      {/* Staggered word reveal with blur-in */}
      <motion.div
        className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 relative z-10"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: 0.12, delayChildren: 0.5 },
          },
        }}
      >
        {words.map((word) => (
          <motion.span
            key={word}
            className="font-heading font-bold text-4xl sm:text-5xl md:text-6xl text-white"
            variants={{
              hidden: { opacity: 0, y: 30, filter: 'blur(12px)' },
              visible: {
                opacity: 1,
                y: 0,
                filter: 'blur(0px)',
                transition: {
                  y: { type: 'spring', stiffness: 250, damping: 18 },
                  opacity: { duration: 0.4 },
                  filter: { duration: 0.5 },
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
        className="font-body font-light text-sm text-white/60 mt-4 relative z-10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        Discover your next favorite film
      </motion.p>

      {/* Cinematic progress bar — thin, white track, accent fill */}
      <motion.div
        className="mt-8 w-48 h-0.5 rounded-full overflow-hidden bg-white/10 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <motion.div
          className="h-full rounded-full bg-accent"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ delay: 1.0, duration: 1.3, ease: [0.4, 0, 0.2, 1] }}
          onAnimationComplete={onComplete}
        />
      </motion.div>
    </motion.div>
  );
}
