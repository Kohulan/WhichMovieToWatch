import { NavLink, useLocation } from 'react-router';
import { motion } from 'motion/react';
import { Compass, TrendingUp, UtensilsCrossed, Film } from 'lucide-react';

/**
 * TabBar — Fixed bottom navigation bar with 4 mode tabs.
 *
 * Provides persistent navigation between:
 *   - Discover (/)
 *   - Trending (/trending)
 *   - Dinner Time (/dinner-time)
 *   - Free Movies (/free-movies)
 *
 * Uses NavLink for active state detection. Active tab shows accent color.
 * Includes iOS safe area padding for home indicator clearance.
 *
 * ANIM-03: Sliding indicator uses layoutId="tab-indicator" for smooth
 * spring-based inter-tab animation. Active icon bounces on tab switch.
 */

// Module-level constant for stability — array identity never changes across renders
const tabs = [
  {
    to: '/',
    end: true,
    icon: Compass,
    label: 'Discover',
  },
  {
    to: '/trending',
    end: false,
    icon: TrendingUp,
    label: 'Trending',
  },
  {
    to: '/dinner-time',
    end: false,
    icon: UtensilsCrossed,
    label: 'Dinner',
  },
  {
    to: '/free-movies',
    end: false,
    icon: Film,
    label: 'Free',
  },
];

export function TabBar() {
  const location = useLocation();

  return (
    <nav
      className="
        fixed bottom-0 left-0 right-0 z-40
        mx-3 sm:mx-5 mb-3
        rounded-2xl
        bg-clay-base/60 backdrop-blur-xl
        border border-white/[0.08]
        h-14
        pb-[env(safe-area-inset-bottom)]
        transition-colors duration-500 ease-in-out
      "
      aria-label="Main navigation"
    >
      <div className="flex h-full items-center justify-around px-2 relative">
        {tabs.map(({ to, end, icon: Icon, label }) => {
          // Determine active state via location pathname for layoutId indicator
          const isActive = end
            ? location.pathname === to
            : location.pathname.startsWith(to);

          return (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={[
                'flex flex-col items-center justify-center gap-0.5',
                'flex-1 h-full px-2',
                'relative',
                'outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset',
                isActive ? 'text-accent' : 'text-clay-text-muted',
              ].join(' ')}
              aria-label={label}
            >
              {/* Sliding background indicator — layoutId enables spring morph between tabs */}
              {isActive && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute inset-1 rounded-xl bg-accent/10"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}

              {/* Icon with bounce animation on tab activation */}
              <motion.div
                animate={isActive ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <Icon
                  className="w-5 h-5"
                  strokeWidth={isActive ? 2.5 : 1.5}
                  aria-hidden="true"
                />
              </motion.div>

              <span className="text-xs font-medium leading-none">{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
