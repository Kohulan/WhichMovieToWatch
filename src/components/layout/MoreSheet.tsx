import { useEffect } from "react";
import { NavLink, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { TrendingUp, Film, X, Coffee, Github } from "lucide-react";
import { ThemeToggle } from "../ui/ThemeToggle";
import { RotaryDial } from "../ui/RotaryDial";
import { RegionPicker } from "./RegionPicker";

const extraPages = [
  { to: "/trending", icon: TrendingUp, label: "Trending" },
  { to: "/free-movies", icon: Film, label: "Free Movies" },
];

/**
 * MoreSheet — Side drawer sliding in from the right on mobile.
 * Triggered by the hamburger button in the Navbar.
 * Contains items not shown in the mobile top navbar:
 * Trending, Free Movies, Region picker, Theme toggle, Rotary dial.
 */
export function MoreSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const location = useLocation();

  // Close on route change
  useEffect(() => {
    if (open) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm sm:hidden"
          />

          {/* Side drawer — slides in from right */}
          <motion.div
            key="drawer-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            className="
              fixed top-0 right-0 bottom-0 z-50
              sm:hidden
              w-72
              bg-clay-base/95 backdrop-blur-2xl
              border-l border-white/[0.12]
              shadow-[-8px_0_40px_rgba(0,0,0,0.25)]
              flex flex-col
            "
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-[env(safe-area-inset-top)] mt-4 mb-2">
              <span className="text-sm font-semibold text-clay-text">Menu</span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="p-1.5 -mr-1.5 rounded-full text-clay-text-muted hover:text-clay-text transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 pb-6">
              {/* Navigation links */}
              <div className="space-y-1 mb-5">
                <p className="text-[10px] uppercase tracking-wider text-clay-text-muted px-3 mb-2">
                  Pages
                </p>
                {extraPages.map(({ to, icon: Icon, label }) => {
                  const isActive = location.pathname.startsWith(to);
                  return (
                    <NavLink
                      key={to}
                      to={to}
                      onClick={onClose}
                      className={`
                        flex items-center gap-3 px-3 py-3 rounded-xl
                        transition-colors duration-200
                        ${
                          isActive
                            ? "bg-accent/15 text-accent"
                            : "text-clay-text hover:bg-white/[0.06]"
                        }
                      `}
                    >
                      <Icon
                        className="w-5 h-5"
                        strokeWidth={isActive ? 2.2 : 1.5}
                      />
                      <span className="text-sm font-medium">{label}</span>
                    </NavLink>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="border-t border-white/[0.08] my-4" />

              {/* Settings */}
              <div className="space-y-4">
                <p className="text-[10px] uppercase tracking-wider text-clay-text-muted px-3">
                  Settings
                </p>

                {/* Region picker */}
                <div className="flex items-center justify-between px-3">
                  <span className="text-sm text-clay-text">Region</span>
                  <RegionPicker variant="mobile" />
                </div>

                {/* Theme + Color preset row */}
                <div className="flex items-center justify-between px-3">
                  <span className="text-sm text-clay-text">Theme</span>
                  <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <RotaryDial />
                  </div>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="px-5 pb-4 pt-2 border-t border-white/[0.08]">
              <p className="text-[10px] uppercase tracking-wider text-clay-text-muted mb-2">
                About
              </p>
              <p className="text-xs text-clay-text-muted leading-relaxed mb-3">
                A free movie discovery app to help you decide what to watch
                next. Browse trending films, get personalized picks, and find
                where to stream them.
              </p>
              <div className="flex items-center gap-1.5 text-xs text-clay-text-muted">
                <span>Made with</span>
                <Coffee className="w-3 h-3 text-accent" />
                <span>by</span>
                <a
                  href="https://kohulanr.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-clay-text hover:text-accent transition-colors"
                >
                  Kohulan.R
                </a>
              </div>
              <a
                href="https://github.com/Kohulan/WhichMovieToWatch"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-2 text-xs text-clay-text-muted hover:text-clay-text transition-colors"
              >
                <Github className="w-3.5 h-3.5" />
                View on GitHub
              </a>
            </div>

            {/* Safe area bottom padding */}
            <div className="pb-[env(safe-area-inset-bottom)]" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
