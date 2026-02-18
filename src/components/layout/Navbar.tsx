import { useState } from 'react';
import { Film, Search } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { RotaryDial } from '../ui/RotaryDial';
import { SearchModal } from '../search/SearchModal';

/**
 * Navbar — Fixed top navigation bar with theme controls and search.
 *
 * Contains:
 *   - App identity (logo + title)
 *   - Search icon that opens SearchModal (SRCH-01)
 *   - ThemeToggle (dark/light)
 *   - RotaryDial (color presets)
 *
 * Clay surface with subtle elevation. z-50 to float above all content.
 */
export function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <nav
        className="
          fixed top-0 left-0 right-0 z-40
          bg-clay-surface clay-shadow-sm clay-texture
          h-16 flex items-center justify-between
          px-4 sm:px-6
          transition-colors duration-500 ease-in-out
        "
      >
        {/* Left: App identity */}
        <div className="flex items-center gap-2">
          <Film className="w-6 h-6 text-accent" strokeWidth={1.5} />
          <span className="font-heading text-lg text-clay-text hidden sm:inline">
            WhichMovieToWatch
          </span>
          <span className="font-heading text-lg text-clay-text sm:hidden">
            WMTW
          </span>
        </div>

        {/* Right: Search + Theme controls */}
        <div className="flex items-center gap-2">
          {/* Search icon — opens SearchModal (SRCH-01) */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search movies"
            className="
              p-2 rounded-full text-clay-text-muted
              hover:text-clay-text hover:bg-clay-base/40
              transition-colors duration-200
              outline-none focus-visible:ring-2 focus-visible:ring-accent
            "
          >
            <Search className="w-5 h-5" aria-hidden="true" />
          </button>

          <ThemeToggle />
          <RotaryDial />
        </div>
      </nav>

      {/* SearchModal — rendered outside nav to avoid z-index stacking issues */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
