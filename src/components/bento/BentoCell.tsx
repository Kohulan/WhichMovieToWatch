// BentoCell — Individual cell wrapper for BentoGrid layouts.
//
// Supports two material variants:
//   - glass: glassmorphism (backdrop blur, translucent surface) — for hero/large cells
//   - clay: claymorphism (soft 3D clay depth) — for supporting cells
//
// Features:
//   - Variable column + row spanning via static Tailwind class lookup objects
//   - Full hover treatment: scale 1.03 + elevated shadow + accent glow
//   - Layout animation with inline borderRadius (prevents FLIP distortion)
//   - Overlay content that reveals on hover (desktop) or tap-to-expand (mobile)
//   - Mobile tap-to-expand: first tap shows overlay, second tap calls onClick
//   - Auto-collapse after 4s timeout (prevents stale expanded state)
//   - hideOnMobile prop for decorative cells
//   - Keyboard accessibility (role=button, tabIndex, Enter/Space handler)
//
// CRITICAL: All col-span/row-span classes use static lookup objects.
// Dynamic class names like `lg:col-span-${n}` DO NOT work with Tailwind v4.

import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useCallback, type ReactNode } from 'react';

export type CellMaterial = 'glass' | 'clay';

export interface BentoCellProps {
  children: ReactNode;
  /** Column span at each breakpoint. Use lookup objects, not dynamic classes. */
  colSpan?: {
    mobile?: 1;
    tablet?: 1 | 2;
    desktop: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  };
  /** Row span at desktop (default: 1) */
  rowSpan?: 1 | 2 | 3;
  /** Material variant */
  material?: CellMaterial;
  className?: string;
  /** Content revealed on hover (desktop) and on tap-to-expand (mobile) */
  overlay?: ReactNode;
  /** Click/tap handler — if provided, enables tap-to-expand on mobile */
  onClick?: () => void;
  /** Hide on mobile (decorative cells) */
  hideOnMobile?: boolean;
}

// --- Static Tailwind class lookup objects ---
// NEVER construct these with template literals — Tailwind v4 static analysis won't detect them.

const lgColSpanClasses: Record<number, string> = {
  1: 'lg:col-span-1',
  2: 'lg:col-span-2',
  3: 'lg:col-span-3',
  4: 'lg:col-span-4',
  5: 'lg:col-span-5',
  6: 'lg:col-span-6',
  7: 'lg:col-span-7',
  8: 'lg:col-span-8',
  9: 'lg:col-span-9',
  10: 'lg:col-span-10',
  11: 'lg:col-span-11',
  12: 'lg:col-span-12',
};

const mdColSpanClasses: Record<number, string> = {
  1: 'md:col-span-1',
  2: 'md:col-span-2',
};

const lgRowSpanClasses: Record<number, string> = {
  1: '',
  2: 'lg:row-span-2',
  3: 'lg:row-span-3',
};

// --- Material style definitions ---

const materialClasses: Record<CellMaterial, string> = {
  // Glassmorphism — for hero/large cells with movie imagery beneath
  glass: 'bg-white/[0.08] backdrop-blur-xl border border-white/10 shadow-lg shadow-black/10',
  // Claymorphism — for supporting cells, reuses existing clay system
  clay: 'bg-clay-surface border border-white/10 clay-shadow-md',
};

/**
 * BentoCell — Individual animated cell for use inside BentoGrid.
 *
 * Desktop hover: scale 1.03 + elevated box shadow + accent glow on border.
 * Mobile tap: first tap reveals overlay/expanded content; second tap calls onClick.
 * Auto-collapses after 4s to prevent stale expanded state.
 *
 * Uses inline `style={{ borderRadius }}` (not `rounded-*` className) to prevent
 * FLIP animation distortion during layout transitions.
 */
export function BentoCell({
  children,
  colSpan = { desktop: 3 },
  rowSpan = 1,
  material = 'clay',
  className = '',
  overlay,
  onClick,
  hideOnMobile = false,
}: BentoCellProps) {
  const [expanded, setExpanded] = useState(false);

  // Auto-collapse expanded state after 4s (prevents stale expanded state)
  useEffect(() => {
    if (!expanded) return;
    const timer = setTimeout(() => setExpanded(false), 4000);
    return () => clearTimeout(timer);
  }, [expanded]);

  const handleClick = useCallback(() => {
    // Mobile tap-to-expand: first tap shows overlay, second tap calls onClick
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      if (!expanded) {
        setExpanded(true);
        return;
      }
    }
    // Desktop: always call onClick directly; Mobile second tap: also call onClick
    onClick?.();
  }, [expanded, onClick]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick],
  );

  // Build Tailwind class list from static lookup objects
  const colSpanClasses = [
    // Mobile: always col-span-1 (single column stack)
    colSpan.mobile ? '' : 'col-span-1',
    // Tablet: optional 1 or 2 column span
    colSpan.tablet ? (mdColSpanClasses[colSpan.tablet] ?? '') : '',
    // Desktop: configurable 1-12 column span
    lgColSpanClasses[colSpan.desktop] ?? 'lg:col-span-3',
    // Row span at desktop only
    lgRowSpanClasses[rowSpan] ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  const isInteractive = Boolean(onClick);

  return (
    <motion.div
      layout
      transition={{
        layout: { type: 'spring', stiffness: 200, damping: 25 },
      }}
      // Inline borderRadius and boxShadow prevent FLIP animation distortion.
      // When layout prop animates via CSS transforms (scaleX/scaleY), CSS
      // class-based borderRadius appears stretched. Inline values are corrected
      // by Framer Motion automatically.
      style={{ borderRadius: '1rem' }}
      className={[
        'relative overflow-hidden',
        materialClasses[material],
        colSpanClasses,
        // Enable group hover for overlay reveal
        'group',
        // Cursor and visibility
        isInteractive ? 'cursor-pointer' : '',
        hideOnMobile ? 'hidden md:block' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      // Hover treatment: scale + elevated shadow + accent glow
      whileHover={{
        scale: 1.03,
        boxShadow: '0 20px 40px rgba(0,0,0,0.15), 0 0 0 1px oklch(var(--accent))',
        transition: { type: 'spring', stiffness: 300, damping: 20 },
      }}
      whileTap={{ scale: 0.98 }}
      onClick={isInteractive ? handleClick : undefined}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-expanded={isInteractive && overlay ? expanded : undefined}
    >
      {/* Main cell content */}
      {children}

      {/* Overlay: reveals on desktop hover (CSS group-hover) */}
      {overlay && (
        <div
          className={[
            'absolute inset-0 flex items-end',
            // Desktop: CSS-based hover reveal via group-hover
            'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
          ].join(' ')}
          aria-hidden={!expanded}
        >
          {overlay}
        </div>
      )}

      {/* Mobile tap-to-expand: animated overlay reveal */}
      <AnimatePresence>
        {expanded && overlay && (
          <motion.div
            key="mobile-expanded"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="absolute inset-0 flex items-end md:hidden"
          >
            {overlay}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
