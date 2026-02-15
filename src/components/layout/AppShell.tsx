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
 */
export function AppShell({ children }: AppShellProps) {
  const { mode, preset } = useTheme();

  return (
    <div className="min-h-screen bg-clay-base transition-colors duration-500 ease-in-out">
      <Navbar />

      <AnimatePresence mode="wait">
        <motion.main
          key={`${mode}-${preset}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: 0.25, ease: 'easeInOut' },
          }}
          className="pt-16 min-h-screen"
        >
          {children}
        </motion.main>
      </AnimatePresence>
    </div>
  );
}
