import {
  Component,
  type ReactNode,
  type ErrorInfo,
  lazy,
  Suspense,
  useRef,
  useEffect,
  useState,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLocation, useOutlet } from "react-router";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";
import { useThemeStore } from "@/stores/themeStore";
import { useScene3dStore } from "@/stores/scene3dStore";
import { Navbar } from "./Navbar";
import {
  pageVariants,
  pageTransition,
  pageVariants3D,
  pageTransition3D,
} from "@/components/animation/PageTransition";
import { ParallaxFallback } from "@/components/3d/ParallaxFallback";

/**
 * Catches Spline runtime errors (e.g. invalid .splinecode) that throw during
 * React render and cannot be caught by the Spline onError callback.
 * Falls back to ParallaxFallback so the app keeps working.
 */
class SplineErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn(
      "[SplineErrorBoundary] 3D scene crashed, falling back to 2D parallax:",
      error.message,
      info.componentStack,
    );
    const store = useScene3dStore.getState();
    store.setSceneError(true);
    store.setSceneLoaded(false);
  }

  render() {
    if (this.state.hasError) {
      return <ParallaxFallback />;
    }
    return this.props.children;
  }
}

/**
 * PageErrorBoundary — Catches unhandled rendering errors in page content.
 * Without this, a throw during mount/update leaves the motion.main at opacity:0
 * (blank screen). With it, the user sees an actionable error message.
 */
class PageErrorBoundary extends Component<
  { children: ReactNode; locationKey: string },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(
      "[PageErrorBoundary] Page crashed:",
      error.message,
      info.componentStack,
    );
  }

  componentDidUpdate(prevProps: { locationKey: string }) {
    // Reset error state when navigating to a new route
    if (
      prevProps.locationKey !== this.props.locationKey &&
      this.state.hasError
    ) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] px-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
          <h2 className="text-lg font-semibold text-clay-text mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-clay-text-muted mb-6">
            This page encountered an error. Please try again.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/20 text-accent text-sm font-medium hover:bg-accent/30 transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * LazySplineHero — Code-split Spline 3D scene, loaded only on capable devices.
 * The Spline runtime + detect-gpu are isolated in the spline-vendor Vite chunk
 * (configured in vite.config.ts), so neither package is in the initial bundle.
 * Suspense fallback=null means gradient blobs show while Spline loads — seamless
 * progressive enhancement with no visible loading indicator.
 */
const LazySplineHero = lazy(() => import("@/components/3d/SplineHero"));

/**
 * LazyCameraTransitionManager — Watches route changes and fires Spline camera
 * state transitions (lateral track for sibling pages, dolly push for home→feature).
 * Renderless — returns null. Only mounted when 3D scene is fully loaded.
 */
const LazyCameraTransitionManager = lazy(
  () => import("@/components/3d/CameraTransitionManager"),
);

/**
 * FrozenOutlet — Captures the router outlet at mount time and freezes it.
 *
 * With AnimatePresence mode="sync", both exiting and entering motion.main
 * elements are in the DOM simultaneously. Without freezing, both would read
 * from the live router context (already updated to the new route) and render
 * the NEW route's content — the exiting page would show the wrong content
 * during its fade-out.
 *
 * By freezing the outlet with useState (captured once on mount, never updated),
 * the exiting wrapper keeps rendering the OLD route's content during exit.
 * The entering wrapper gets a fresh FrozenOutlet that captures the NEW route.
 */
function FrozenOutlet() {
  const outlet = useOutlet();
  const [frozen] = useState(outlet);
  return frozen;
}

/**
 * AppShell — Root layout wrapper with cinematic ambient gradient,
 * frosted-glass navbar, smooth route transitions, and 3D/parallax background.
 *
 * ANIM-07: Ambient gradient blobs are motion.div elements keyed by preset.
 * AnimatePresence mode="sync" creates a smooth crossfade when switching
 * between color presets (warm-orange, gold, clean-white). The old blobs
 * fade/scale out while new blobs fade/scale in simultaneously.
 *
 * 3DXP-05 / 3DXP-07: A global 3D/parallax layer renders between the gradient
 * blobs and page content. Opacity is route-controlled:
 *   - HomePage (/): opacity 1  — 3D scene is the primary hero experience
 *   - Feature pages: opacity 0.15 — poster backdrops take visual precedence
 * The layer stays MOUNTED on all routes to support camera transitions (Plan 07-04).
 *
 * 3DXP-03 (Plan 07-04): When 3D scene is loaded and capable, page transitions
 * simplify to fade-only (pageVariants3D) so the Spline camera movement provides
 * the spatial feedback — no competing slide/scale transforms on content.
 * CameraTransitionManager handles the camera transition on route change.
 * Standard slide+scale+fade transitions (pageVariants) remain for fallback-2d.
 */
export function AppShell() {
  useTheme();
  const location = useLocation();
  const preset = useThemeStore((s) => s.preset);
  const capability = useScene3dStore((s) => s.capability);
  const sceneLoaded = useScene3dStore((s) => s.sceneLoaded);
  const sceneError = useScene3dStore((s) => s.sceneError);

  // Show parallax when: explicitly fallback-2d, OR Spline failed/invalid scene
  const showParallax = capability === "fallback-2d" || sceneError;

  // HomePage is the primary 3D hero experience (user decision: "Hero scene on HomePage")
  // Feature pages use their own poster backdrops — 3D/parallax layer fades behind them
  const isHomePage = location.pathname === "/";

  // 3D transitions are active when a capable GPU has a fully-loaded Spline scene.
  // fallback-2d users continue to use standard slide+scale+fade page transitions.
  const use3DTransitions =
    (capability === "full-3d" || capability === "reduced-3d") && sceneLoaded;

  // Select transition variants based on 3D state:
  //   3D active  → fade-only (camera movement provides spatial context)
  //   3D inactive → standard slide+scale+fade cinematic transitions
  const activeVariants = use3DTransitions ? pageVariants3D : pageVariants;
  const activeTransition = use3DTransitions ? pageTransition3D : pageTransition;

  // A11Y-01: Ref to main content for programmatic focus on route change.
  const mainRef = useRef<HTMLElement>(null);

  // Scroll to top on every route change. Without this, navigating from a
  // scrolled page (e.g. Dinner Time with BentoHero) leaves the new page at
  // the old scroll position — content is rendered above the viewport and
  // the user sees a blank screen. Hash router doesn't provide built-in
  // scroll restoration, so we handle it explicitly.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // A11Y-01: Move focus to main content after each route change so screen reader
  // users hear the new page content. Delay must exceed exit + enter animation
  // duration (~350ms) because AnimatePresence mode="wait" unmounts the old
  // motion.main (detaching mainRef) before mounting the new one. At 150ms the
  // ref was null. 500ms ensures the entering page's motion.main is mounted and
  // the ref is attached.
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      mainRef.current?.focus({ preventScroll: true });
    }, 500);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen bg-clay-base transition-colors duration-500 ease-in-out">
      {/* Fixed cinematic gradient background with animated blobs on theme change */}
      <div className="fixed inset-0 z-0" aria-hidden="true">
        <div className="absolute inset-0 bg-clay-base" />

        <AnimatePresence mode="sync">
          {/* Blob 1 — top-right large warm glow (reduced blur on mobile for GPU perf) */}
          <motion.div
            key={`blob-1-${preset}`}
            className="absolute top-[-20%] right-[-10%] w-[80%] h-[70%] rounded-full bg-accent/[0.14] blur-[60px] sm:blur-[140px]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
          {/* Blob 2 — bottom-left mid glow */}
          <motion.div
            key={`blob-2-${preset}`}
            className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent/[0.06] blur-[40px] sm:blur-[120px]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.05 }}
          />
          {/* Blob 3 — center-left subtle accent */}
          <motion.div
            key={`blob-3-${preset}`}
            className="absolute top-[30%] left-[20%] w-[30%] h-[30%] rounded-full bg-accent/[0.04] blur-[30px] sm:blur-[100px]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
          />
        </AnimatePresence>
      </div>

      {/* 3D / Parallax background layer — renders globally for camera transitions,
          but opacity is route-controlled:
          - HomePage (/): opacity 1 — this IS the hero experience
            (user decision: "Hero scene on HomePage — primary 3D experience")
          - Feature pages (/trending, /dinner-time, /free-movies, /discover): opacity 0.15
            -> poster backdrops take visual precedence; 3D scene stays subtly visible beneath
            -> scene MUST remain mounted (not conditionally rendered) so that camera
               transitions (Plan 07-04) can fire as the user navigates between routes
          Per user decision: "3D camera movement transitions between pages"

          While capability is null (GPU detection still in progress), the wrapper div
          renders with no visible child — gradient blobs are sufficient in that window. */}
      <div
        className="fixed inset-0 transition-opacity duration-500"
        style={{ opacity: isHomePage ? 1 : 0.15 }}
        aria-hidden="true"
      >
        {showParallax && <ParallaxFallback />}
        {!sceneError &&
          (capability === "full-3d" || capability === "reduced-3d") && (
            <SplineErrorBoundary>
              <Suspense fallback={null}>
                <LazySplineHero reduced={capability === "reduced-3d"} />
              </Suspense>
            </SplineErrorBoundary>
          )}
      </div>

      {/* CameraTransitionManager — renderless, watches route changes, fires Spline camera
          state transitions. Only mounted when 3D scene is loaded and capable.
          Placed outside AnimatePresence — it watches routes globally, not per-page.
          Suspense fallback=null — no UI impact if chunk loads slowly. */}
      {use3DTransitions && (
        <Suspense fallback={null}>
          <LazyCameraTransitionManager />
        </Suspense>
      )}

      {/* Skip navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-clay-surface focus:text-clay-text focus:rounded-lg focus:shadow-lg"
      >
        Skip to main content
      </a>

      <Navbar />

      <AnimatePresence mode="sync">
        <motion.main
          ref={mainRef}
          id="main-content"
          key={location.pathname}
          tabIndex={-1}
          variants={activeVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={activeTransition}
          className="relative z-[1] pt-20 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] min-h-screen outline-none"
        >
          <PageErrorBoundary locationKey={location.pathname}>
            <FrozenOutlet />
          </PageErrorBoundary>
        </motion.main>
      </AnimatePresence>
    </div>
  );
}
