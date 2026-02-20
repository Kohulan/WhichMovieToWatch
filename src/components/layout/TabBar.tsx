import { Coffee, Github } from "lucide-react";
import { Link } from "react-router";

/**
 * BottomBar — Fixed bottom bar with footer credits.
 *
 * Displays "Made with coffee by Kohulan.R" with copyright,
 * links to website, privacy policy, and GitHub repo.
 * Matches the frosted-glass style of the top Navbar.
 */
export function TabBar() {
  const year = new Date().getFullYear();

  return (
    <footer
      role="contentinfo"
      className="
        fixed bottom-0 left-0 right-0 z-40
        mx-3 sm:mx-5 mb-3
        rounded-2xl
        bg-clay-base/60 backdrop-blur-xl
        border border-white/[0.08]
        pb-[env(safe-area-inset-bottom)]
        transition-colors duration-500 ease-in-out
      "
    >
      <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 text-xs text-clay-text-muted">
        {/* Left: credit + GitHub */}
        <div className="flex items-center gap-1.5">
          <span>Made with</span>
          <Coffee
            className="w-3.5 h-3.5 text-accent animate-[steam_4s_ease-in-out_infinite]"
            aria-label="coffee"
          />
          <span>by</span>
          <a
            href="https://kohulanr.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-clay-text hover:text-accent transition-colors duration-200"
          >
            Kohulan.R
          </a>
          <span className="text-clay-text-muted/30">|</span>
          <a
            href="https://github.com/Kohulan/WhichMovieToWatch"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-clay-text transition-colors duration-200"
          >
            <Github className="w-3 h-3" aria-hidden="true" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>

        {/* Right: copyright + Privacy */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-clay-text-muted/60 hidden sm:inline">
            &copy; {year} Kohulan Rajan. All rights reserved.
          </span>
          <span className="text-[10px] text-clay-text-muted/60 sm:hidden">
            &copy; {year}
          </span>
          <span className="text-clay-text-muted/30">|</span>
          <Link
            to="/privacy"
            className="hover:text-clay-text transition-colors duration-200"
          >
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
