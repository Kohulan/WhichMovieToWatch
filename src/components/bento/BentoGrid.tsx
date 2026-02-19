// BentoGrid — Responsive CSS Grid container with Framer Motion layout animation.
//
// Creates a 12-column bento grid on desktop, 2-column on tablet, 1-column on mobile.
// Uses Framer Motion `layout` prop for smooth FLIP-based reflow animation when
// the viewport crosses breakpoints.
//
// CRITICAL: Uses static Tailwind class lookup object — NOT dynamic template literals.
// `lg:grid-cols-${columns}` does NOT work with Tailwind v4 static analysis.
//
// Key pitfall avoided: Do NOT apply lg:auto-rows on mobile/tablet — let rows
// auto-size to content. Only apply minmax(120px,auto) at desktop breakpoint.

import { motion } from 'motion/react';
import type { ReactNode } from 'react';

interface BentoGridProps {
  children: ReactNode;
  className?: string;
  /** Number of columns at desktop breakpoint (default: 12) */
  columns?: 4 | 6 | 12;
}

// Static Tailwind class lookup — NEVER construct these dynamically with template literals.
// Tailwind v4 uses static analysis; dynamic class names are not detected.
const desktopColClasses: Record<number, string> = {
  4: 'lg:grid-cols-4',
  6: 'lg:grid-cols-6',
  12: 'lg:grid-cols-12',
};

/**
 * BentoGrid — Responsive CSS Grid container for bento layouts.
 *
 * Layout progression:
 * - Mobile (default): 1 column, rows auto-size to content
 * - Tablet (md:): 2 columns, rows auto-size to content
 * - Desktop (lg:): Configurable 4/6/12 columns, min 120px row height with auto-expand
 *
 * Uses Framer Motion layout animation for smooth reflow on breakpoint transitions.
 * `grid-flow-dense` prevents gaps when large cells push smaller ones to next row.
 */
export function BentoGrid({ children, className = '', columns = 12 }: BentoGridProps) {
  const desktopCols = desktopColClasses[columns] ?? 'lg:grid-cols-12';

  return (
    <motion.div
      layout
      transition={{
        layout: { type: 'spring', stiffness: 200, damping: 25 },
      }}
      className={[
        'grid',
        'grid-cols-1',
        'md:grid-cols-2',
        desktopCols,
        'lg:auto-rows-[minmax(120px,auto)]',
        'grid-flow-dense',
        'gap-4 lg:gap-5',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </motion.div>
  );
}
