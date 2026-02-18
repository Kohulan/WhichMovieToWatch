import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useTheme } from '../../hooks/useTheme';
import { Navbar } from './Navbar';

interface AppShellProps {
  children: ReactNode;
}

/**
 * AppShell — Root layout wrapper with persistent navbar and
 * smooth fade transition on theme changes.
 *
 * Includes skip navigation link as first focusable element (A11Y-07).
 */
export function AppShell({ children }: AppShellProps) {
  const { mode, preset } = useTheme();

  return (
    <div className="min-h-screen bg-clay-base transition-colors duration-500 ease-in-out">
      {/* Skip navigation — first focusable element for keyboard/screen reader users (A11Y-07) */}
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
          key={`${mode}-${preset}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: 0.25, ease: 'easeInOut' },
          }}
          className="pt-16 pb-[calc(4rem+env(safe-area-inset-bottom,0px)+0.5rem)] min-h-screen"
        >
          {children}
        </motion.main>
      </AnimatePresence>
    </div>
  );
}
