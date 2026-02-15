import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useTheme } from '../../hooks/useTheme';
import { Navbar } from './Navbar';

interface AppShellProps {
  children: ReactNode;
}

/**
 * AppShell — Root layout wrapper with persistent navbar and
 * clay reshape animation on theme changes.
 *
 * "Clay reshape" = elements briefly flatten (scale down) then
 * re-inflate (scale up) with the new color scheme, mimicking
 * clay being reshaped.
 */
export function AppShell({ children }: AppShellProps) {
  const { mode, preset } = useTheme();

  return (
    <div className="min-h-screen bg-clay-base transition-colors duration-300">
      <Navbar />

      {/* Main content with clay reshape animation on theme change */}
      <AnimatePresence mode="wait">
        <motion.main
          key={`${mode}-${preset}`}
          initial={{ scaleY: 0.95, scaleX: 0.98, opacity: 0.7 }}
          animate={{ scaleY: 1, scaleX: 1, opacity: 1 }}
          exit={{ scaleY: 0.95, scaleX: 0.98, opacity: 0.7 }}
          transition={{
            scaleX: {
              type: 'spring',
              stiffness: 150,
              damping: 12,
              mass: 0.8,
            },
            scaleY: {
              type: 'spring',
              stiffness: 150,
              damping: 12,
              mass: 0.8,
            },
            opacity: { duration: 0.15 },
          }}
          className="pt-16 min-h-screen"
          style={{ transformOrigin: 'top center' }}
        >
          {children}
        </motion.main>
      </AnimatePresence>
    </div>
  );
}
