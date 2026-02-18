import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useLocation } from 'react-router';
import { useTheme } from '../../hooks/useTheme';
import { useThemeStore } from '@/stores/themeStore';
import { Navbar } from './Navbar';
import { pageVariants, pageTransition } from '@/components/animation/PageTransition';

interface AppShellProps {
  children: ReactNode;
}

/**
 * AppShell — Root layout wrapper with cinematic ambient gradient,
 * frosted-glass navbar, and smooth route transitions.
 *
 * ANIM-07: Ambient gradient blobs are motion.div elements keyed by preset.
 * AnimatePresence mode="sync" creates a smooth crossfade when switching
 * between color presets (warm-orange, gold, clean-white). The old blobs
 * fade/scale out while new blobs fade/scale in simultaneously.
 */
export function AppShell({ children }: AppShellProps) {
  useTheme();
  const location = useLocation();
  const preset = useThemeStore((s) => s.preset);

  return (
    <div className="min-h-screen bg-clay-base transition-colors duration-500 ease-in-out">
      {/* Fixed cinematic gradient background with animated blobs on theme change */}
      <div className="fixed inset-0 z-0" aria-hidden="true">
        <div className="absolute inset-0 bg-clay-base" />

        <AnimatePresence mode="sync">
          {/* Blob 1 — top-right large warm glow */}
          <motion.div
            key={`blob-1-${preset}`}
            className="absolute top-[-20%] right-[-10%] w-[80%] h-[70%] rounded-full bg-accent/[0.14] blur-[140px]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
          {/* Blob 2 — bottom-left mid glow */}
          <motion.div
            key={`blob-2-${preset}`}
            className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent/[0.06] blur-[120px]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.05 }}
          />
          {/* Blob 3 — center-left subtle accent */}
          <motion.div
            key={`blob-3-${preset}`}
            className="absolute top-[30%] left-[20%] w-[30%] h-[30%] rounded-full bg-accent/[0.04] blur-[100px]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
          />
        </AnimatePresence>
      </div>

      {/* Skip navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-clay-surface focus:text-clay-text focus:rounded-lg focus:shadow-lg"
      >
        Skip to main content
      </a>

      <Navbar />

      <AnimatePresence mode="wait">
        <motion.main
          id="main-content"
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
          className="relative z-[1] pt-20 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] min-h-screen"
        >
          {children}
        </motion.main>
      </AnimatePresence>
    </div>
  );
}
