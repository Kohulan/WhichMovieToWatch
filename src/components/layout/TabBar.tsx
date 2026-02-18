import { NavLink } from 'react-router';
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
 */
export function TabBar() {
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

  return (
    <nav
      className="
        fixed bottom-0 left-0 right-0 z-40
        bg-clay-surface clay-shadow-sm clay-texture
        h-16
        pb-[env(safe-area-inset-bottom)]
        transition-colors duration-500 ease-in-out
      "
      aria-label="Main navigation"
    >
      <div className="flex h-full items-center justify-around px-2">
        {tabs.map(({ to, end, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                'flex flex-col items-center justify-center gap-0.5',
                'flex-1 h-full px-2',
                'transition-colors duration-200',
                'outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset',
                isActive ? 'text-accent' : 'text-clay-text-muted',
              ].join(' ')
            }
            aria-label={label}
          >
            {({ isActive }) => (
              <>
                <Icon
                  className="w-5 h-5"
                  strokeWidth={isActive ? 2.5 : 1.5}
                  aria-hidden="true"
                />
                <span className="text-xs font-medium leading-none">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
