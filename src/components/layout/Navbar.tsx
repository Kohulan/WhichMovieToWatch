import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { NavLink, useLocation } from "react-router";
import { motion } from "motion/react";
import {
  Film,
  Search,
  Home,
  Compass,
  TrendingUp,
  UtensilsCrossed,
  Tv,
  Menu,
} from "lucide-react";
import logoSrc from "@/../assets/logo.png";
import { ThemeToggle } from "../ui/ThemeToggle";
import { RotaryDial } from "../ui/RotaryDial";
import { RegionPicker } from "./RegionPicker";

// The search overlay (SpotlightSearch + its results/filters cluster) and the
// mobile More sheet are on-demand UI (~1300 lines) that used to ship in the
// eager index chunk because Navbar imported them statically. They're lazy
// now, mounted once `overlaysReady` flips — on browser idle (prefetch, so the
// chunk is warm before the first tap) or on the first open click, whichever
// comes first — and stay mounted afterwards so close animations and internal
// state behave exactly as before.
const SpotlightSearch = lazy(() =>
  import("../search/SpotlightSearch").then((m) => ({
    default: m.SpotlightSearch,
  })),
);
const MoreSheet = lazy(() =>
  import("./MoreSheet").then((m) => ({ default: m.MoreSheet })),
);

/** All tabs — shown on desktop (sm+) */
const allTabs = [
  { to: "/", end: true, icon: Home, label: "Home" },
  { to: "/discover", end: false, icon: Compass, label: "Discover" },
  { to: "/browse", end: false, icon: Tv, label: "Browse" },
  { to: "/trending", end: false, icon: TrendingUp, label: "Trending" },
  { to: "/dinner-time", end: false, icon: UtensilsCrossed, label: "Dinner" },
  { to: "/free-movies", end: false, icon: Film, label: "Free" },
];

/** Mobile-only subset — Trending & Free Movies move to MoreSheet */
const mobileTabs = [
  { to: "/", end: true, icon: Home, label: "Home" },
  { to: "/discover", end: false, icon: Compass, label: "Discover" },
  { to: "/browse", end: false, icon: Tv, label: "Browse" },
  { to: "/dinner-time", end: false, icon: UtensilsCrossed, label: "Dinner" },
];

const brandTextClass =
  "text-2xs font-bold tracking-[0.15em] text-clay-text/80 uppercase group-hover:text-clay-text transition-colors duration-200";

export function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchPreset, setSearchPreset] = useState<number | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [overlaysReady, setOverlaysReady] = useState(false);
  const location = useLocation();

  // Warm the lazy overlay chunk during idle time so the first tap on
  // Search/Netflix/More doesn't wait on a network fetch. Same
  // requestIdleCallback-with-setTimeout-fallback shape as AppShell's
  // idleReady (see the type-narrowing note there).
  useEffect(() => {
    const ric = (
      window as unknown as {
        requestIdleCallback?: (
          callback: () => void,
          options?: { timeout?: number },
        ) => number;
      }
    ).requestIdleCallback;
    if (ric) {
      const id = ric(() => setOverlaysReady(true), { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }
    const t = window.setTimeout(() => setOverlaysReady(true), 1500);
    return () => window.clearTimeout(t);
  }, []);

  const openSearch = useCallback(() => {
    setOverlaysReady(true);
    setSearchPreset(null);
    setSearchOpen(true);
  }, []);

  function openNetflixSearch() {
    setOverlaysReady(true);
    setSearchPreset(8);
    setSearchOpen(true);
  }

  function handleClose() {
    setSearchOpen(false);
    setSearchPreset(null);
  }

  // Listen for 'open-search' events from SearchCell (or other components)
  useEffect(() => {
    window.addEventListener("open-search", openSearch);
    return () => window.removeEventListener("open-search", openSearch);
  }, [openSearch]);

  // Listen for 'open-netflix-search' events from MoreSheet
  useEffect(() => {
    function handleNetflix() {
      openNetflixSearch();
    }
    window.addEventListener("open-netflix-search", handleNetflix);
    return () =>
      window.removeEventListener("open-netflix-search", handleNetflix);
  }, []);

  function renderTab({ to, end, icon: Icon, label }: (typeof allTabs)[number]) {
    const isActive = end
      ? location.pathname === to
      : location.pathname.startsWith(to);

    return (
      <NavLink
        key={to}
        to={to}
        end={end}
        className={[
          // min-h/min-w 44px keeps the icon-only mobile tabs a real touch
          // target; sm:min-w-0 lets the labeled desktop tabs size to content.
          "relative flex items-center justify-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg cursor-pointer",
          "min-h-11 min-w-11 sm:min-h-0 sm:min-w-0",
          "text-[11px] font-medium tracking-wide",
          "outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-1 focus-visible:ring-offset-clay-base/50",
          "transition-colors duration-200",
          isActive
            ? "text-clay-text"
            : "text-clay-text-muted hover:text-clay-text",
        ].join(" ")}
        aria-label={label}
      >
        {isActive && (
          <motion.div
            layoutId="nav-indicator"
            className="absolute inset-0 rounded-lg bg-accent/[0.12] border border-accent/[0.15]"
            style={{
              boxShadow:
                "0 0 16px color-mix(in oklch, var(--accent) 35%, transparent), inset 0 1px 0 rgba(255,255,255,0.08)",
            }}
            transition={{
              type: "spring",
              stiffness: 380,
              damping: 26,
            }}
          />
        )}
        {!isActive && (
          <span className="absolute inset-0 rounded-lg bg-white/0 hover:bg-white/[0.04] transition-colors duration-200" />
        )}
        <motion.div
          animate={isActive ? { scale: [1, 1.1, 1] } : { scale: 1 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative z-[1]"
        >
          <Icon
            className={`w-3.5 h-3.5 transition-colors duration-200 ${isActive ? "drop-shadow-[0_0_4px_var(--accent)]" : ""}`}
            strokeWidth={isActive ? 2.5 : 1.5}
            aria-hidden="true"
          />
        </motion.div>
        <span className="relative z-[1] hidden sm:inline">{label}</span>
      </NavLink>
    );
  }

  return (
    <>
      <nav
        aria-label="Main navigation"
        className="
          fixed top-0 left-0 right-0 z-40
          mx-2 sm:mx-4 mt-2 sm:mt-3
          rounded-2xl
          bg-clay-base/92 sm:bg-clay-base/50 backdrop-blur-md sm:backdrop-blur-2xl sm:backdrop-saturate-[1.8]
          border border-white/[0.12]
          shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.06)]
          h-12 flex items-center
          px-2.5 sm:px-4
          transition-colors duration-500 ease-in-out
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
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            />
            <span className={`hidden lg:inline ${brandTextClass}`}>
              WhichMovieToWatch
            </span>
            <span className={`hidden sm:inline lg:hidden ${brandTextClass}`}>
              WhichMovie
            </span>
          </NavLink>

          <div className="hidden sm:block w-px h-5 bg-gradient-to-b from-transparent via-white/[0.12] to-transparent flex-shrink-0" />

          {/* Mobile tabs — subset (Home, Discover, Dinner) */}
          <div className="flex sm:hidden items-center">
            {mobileTabs.map(renderTab)}
          </div>

          {/* Desktop tabs — full set */}
          <div className="hidden sm:flex items-center sm:ml-1">
            {allTabs.map(renderTab)}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5 ml-auto flex-shrink-0">
          {/* Netflix button — visible on all sizes */}
          <motion.button
            type="button"
            onClick={openNetflixSearch}
            aria-label="Search Netflix movies"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            className="
              inline-flex items-center justify-center gap-1
              min-h-11 sm:min-h-0
              px-2 sm:px-2.5 py-1 rounded-full cursor-pointer
              text-white text-2xs font-bold tracking-wider uppercase
              bg-brand-netflix hover:bg-brand-netflix-dark
              transition-colors duration-200
              outline-none focus-visible:ring-2 focus-visible:ring-brand-netflix/50
              shadow-[0_2px_8px_color-mix(in_oklch,var(--color-brand-netflix)_35%,transparent),0_0_12px_color-mix(in_oklch,var(--color-brand-netflix)_15%,transparent)]
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
              inline-flex items-center justify-center min-w-11 min-h-11
              rounded-lg text-clay-text-muted cursor-pointer
              hover:text-clay-text hover:bg-white/[0.06]
              transition-colors duration-200
              outline-none focus-visible:ring-2 focus-visible:ring-accent/50
            "
          >
            <Search className="w-4 h-4" aria-hidden="true" />
          </motion.button>

          {/* More button — mobile only, opens bottom sheet */}
          <motion.button
            type="button"
            onClick={() => {
              setOverlaysReady(true);
              setMoreOpen(true);
            }}
            aria-label="More options"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="
              sm:hidden
              inline-flex items-center justify-center min-w-11 min-h-11
              rounded-lg text-clay-text-muted cursor-pointer
              hover:text-clay-text hover:bg-white/[0.06]
              transition-colors duration-200
              outline-none focus-visible:ring-2 focus-visible:ring-accent/50
            "
          >
            <Menu className="w-4 h-4" aria-hidden="true" />
          </motion.button>

          {/* Theme, rotary dial, region — desktop only (in MoreSheet on mobile) */}
          <div className="hidden sm:block w-px h-5 bg-gradient-to-b from-transparent via-white/[0.10] to-transparent" />

          <div className="hidden sm:contents">
            <ThemeToggle />
            <RotaryDial />
            <RegionPicker />
          </div>
        </div>
      </nav>

      {/* Mount-gated: placing the lazy subtree in the JSX is what triggers
          the dynamic import — an ungated <Suspense> would fetch on initial
          mount, same as the old static imports. fallback={null} matches the
          closed state's appearance, so pre-load renders nothing either way. */}
      {overlaysReady && (
        <Suspense fallback={null}>
          <SpotlightSearch
            isOpen={searchOpen}
            onClose={handleClose}
            initialProviderId={searchPreset}
            netflixMode={searchPreset === 8}
          />

          <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
        </Suspense>
      )}
    </>
  );
}
