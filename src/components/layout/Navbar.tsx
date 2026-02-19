import { useState, useEffect, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router';
import { motion } from 'motion/react';
import { Film, Search, Home, Compass, TrendingUp, UtensilsCrossed } from 'lucide-react';
import logoSrc from '@/../assets/logo.png';
import { ThemeToggle } from '../ui/ThemeToggle';
import { RotaryDial } from '../ui/RotaryDial';
import { SpotlightSearch } from '../search/SpotlightSearch';
import { RegionPicker } from './RegionPicker';

const tabs = [
  { to: '/', end: true, icon: Home, label: 'Home' },
  { to: '/discover', end: false, icon: Compass, label: 'Discover' },
  { to: '/trending', end: false, icon: TrendingUp, label: 'Trending' },
  { to: '/dinner-time', end: false, icon: UtensilsCrossed, label: 'Dinner' },
  { to: '/free-movies', end: false, icon: Film, label: 'Free' },
];

const brandTextClass = 'text-[10px] font-bold tracking-[0.15em] text-clay-text/80 uppercase group-hover:text-clay-text transition-colors duration-200';

export function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchPreset, setSearchPreset] = useState<number | null>(null);
  const location = useLocation();

  const openSearch = useCallback(() => {
    setSearchPreset(null);
    setSearchOpen(true);
  }, []);

  function openNetflixSearch() {
    setSearchPreset(8);
    setSearchOpen(true);
  }

  function handleClose() {
    setSearchOpen(false);
    setSearchPreset(null);
  }

  // Listen for 'open-search' events from SearchCell (or other components)
  useEffect(() => {
    window.addEventListener('open-search', openSearch);
    return () => window.removeEventListener('open-search', openSearch);
  }, [openSearch]);

  return (
    <>
      <nav
        aria-label="Main navigation"
        className="
          fixed top-0 left-0 right-0 z-40
          mx-2 sm:mx-4 mt-2 sm:mt-3
          rounded-2xl
          bg-clay-base/50 backdrop-blur-2xl backdrop-saturate-[1.8]
          border border-white/[0.12]
          shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.06)]
          h-12 flex items-center
          px-2.5 sm:px-4
          transition-all duration-500 ease-in-out
        "
      >
        {/* Left: Brand + Nav */}
        <div className="flex items-center min-w-0">
          <NavLink
            to="/"
            aria-label="Home"
            className="flex items-center gap-1.5 flex-shrink-0 mr-2 sm:mr-3 cursor-pointer group"
          >
            <motion.img
              src={logoSrc}
              alt="Which Movie To Watch"
              className="w-6 h-6 object-contain drop-shadow-[0_0_6px_var(--accent)]"
              whileHover={{ rotate: -8, scale: 1.1 }}
              whileTap={{ scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            />
            <span className={`hidden lg:inline ${brandTextClass}`}>
              WhichMovieToWatch
            </span>
            <span className={`hidden sm:inline lg:hidden ${brandTextClass}`}>
              WhichMovie
            </span>
          </NavLink>

          <div className="hidden sm:block w-px h-5 bg-gradient-to-b from-transparent via-white/[0.12] to-transparent flex-shrink-0" />

          <div className="flex items-center sm:ml-1">
            {tabs.map(({ to, end, icon: Icon, label }) => {
              const isActive = end
                ? location.pathname === to
                : location.pathname.startsWith(to);

              return (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={[
                    'relative flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg cursor-pointer',
                    'text-[11px] font-medium tracking-wide',
                    'outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-1 focus-visible:ring-offset-clay-base/50',
                    'transition-all duration-200',
                    isActive
                      ? 'text-accent'
                      : 'text-clay-text-muted hover:text-clay-text',
                  ].join(' ')}
                  aria-label={label}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 rounded-lg bg-accent/[0.12] border border-accent/[0.15]"
                      style={{
                        boxShadow: '0 0 16px color-mix(in oklch, var(--accent) 35%, transparent), inset 0 1px 0 rgba(255,255,255,0.08)',
                      }}
                      transition={{ type: 'spring', stiffness: 380, damping: 26 }}
                    />
                  )}
                  {!isActive && (
                    <span className="absolute inset-0 rounded-lg bg-white/0 hover:bg-white/[0.04] transition-colors duration-200" />
                  )}
                  <motion.div
                    animate={isActive ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="relative z-[1]"
                  >
                    <Icon
                      className={`w-3.5 h-3.5 transition-all duration-200 ${isActive ? 'drop-shadow-[0_0_4px_var(--accent)]' : ''}`}
                      strokeWidth={isActive ? 2.5 : 1.5}
                      aria-hidden="true"
                    />
                  </motion.div>
                  <span className="relative z-[1] hidden sm:inline">{label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5 ml-auto flex-shrink-0">
          <motion.button
            type="button"
            onClick={openNetflixSearch}
            aria-label="Search Netflix movies"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            className="
              hidden sm:inline-flex items-center gap-1
              px-2.5 py-1 rounded-full cursor-pointer
              text-white text-[10px] font-bold tracking-wider uppercase
              bg-[#E50914] hover:bg-[#F40612]
              transition-colors duration-200
              outline-none focus-visible:ring-2 focus-visible:ring-[#E50914]/50
              shadow-[0_2px_8px_rgba(229,9,20,0.35),0_0_12px_rgba(229,9,20,0.15)]
            "
          >
            Netflix
          </motion.button>

          <motion.button
            type="button"
            onClick={openSearch}
            aria-label="Search movies"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="
              p-2 rounded-lg text-clay-text-muted cursor-pointer
              hover:text-clay-text hover:bg-white/[0.06]
              transition-colors duration-200
              outline-none focus-visible:ring-2 focus-visible:ring-accent/50
            "
          >
            <Search className="w-4 h-4" aria-hidden="true" />
          </motion.button>

          <div className="hidden sm:block w-px h-5 bg-gradient-to-b from-transparent via-white/[0.10] to-transparent" />

          <ThemeToggle />
          <RotaryDial />
          <RegionPicker />
        </div>
      </nav>

      <SpotlightSearch
        isOpen={searchOpen}
        onClose={handleClose}
        initialProviderId={searchPreset}
        netflixMode={searchPreset === 8}
      />
    </>
  );
}
