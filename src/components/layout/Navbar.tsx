import { Film } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { RotaryDial } from '../ui/RotaryDial';

/**
 * Navbar — Fixed top navigation bar with theme controls.
 *
 * Always visible, contains the ThemeToggle (dark/light) and
 * RotaryDial (color presets) side by side. Clay surface with
 * subtle elevation. z-50 to float above all content.
 */
export function Navbar() {
  return (
    <nav
      className="
        fixed top-0 left-0 right-0 z-50
        bg-clay-surface clay-shadow-sm clay-texture
        h-16 flex items-center justify-between
        px-4 sm:px-6
        transition-colors duration-300
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

      {/* Right: Theme controls */}
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <RotaryDial />
      </div>
    </nav>
  );
}
