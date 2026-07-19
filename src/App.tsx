import { useState, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import { AppShell } from "./components/layout/AppShell";
import { SplashScreen } from "./components/SplashScreen";
import { ToastProvider } from "./components/shared/Toast";
import { TabBar } from "./components/layout/TabBar";
import { useMigration } from "./hooks/useMigration";
import { ReloadPrompt } from "@/components/pwa/ReloadPrompt";
import { InstallBanner } from "@/components/pwa/InstallBanner";
import { MotionProvider } from "@/components/animation/MotionProvider";
import { Scene3DProvider } from "@/components/3d/Scene3DProvider";
import { getSessionFlag, setSessionFlag } from "@/lib/session-flags";
import { useGpuTier } from "@/hooks/useGpuTier";

const SPLASH_SEEN_KEY = "wmtw:splash-seen";

function App() {
  // Splash plays once per browser session (SEO/CWV: an unskippable splash on
  // every load makes a good LCP impossible; first impression stays intact).
  const [showSplash, setShowSplash] = useState(
    () => !getSessionFlag(SPLASH_SEEN_KEY),
  );

  // Run legacy localStorage migration on mount (Plan 02-02)
  useMigration();

  // Low-GPU devices (tier 0-1): drop expensive backdrop-filter paints via a
  // root class the stylesheet keys off. Reuses the same detection that gates
  // the 3D scene, so there's no extra cost. See .perf-lite in app.css.
  const { tier, loading: gpuLoading } = useGpuTier();
  useEffect(() => {
    if (gpuLoading) return;
    document.documentElement.classList.toggle("perf-lite", tier <= 1);
  }, [tier, gpuLoading]);

  // Simple Analytics — cookieless, GDPR-compliant page view tracking (Plan 08-04, PRIV-02)
  // Manual script injection; auto mode tracks History API navigation (BrowserRouter).
  // Loaded outside splash guard so analytics fires immediately regardless of onboarding state.
  // Note: The noscript.gif pixel is NOT injected here — it only works in a static <noscript> tag
  // for non-JS environments. Since this is a React SPA that requires JS, it serves no purpose.
  // Ad blockers block it (ERR_BLOCKED_BY_CLIENT) creating console noise.
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://scripts.simpleanalyticscdn.com/latest.js";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  return (
    <MotionProvider>
      {/* Toast notifications — mounted at app root so toasts appear in all views (INTR-05) */}
      <ToastProvider />

      <AnimatePresence mode="wait">
        {showSplash && (
          <SplashScreen
            key="splash"
            onComplete={() => {
              setSessionFlag(SPLASH_SEEN_KEY);
              setShowSplash(false);
            }}
          />
        )}
      </AnimatePresence>

      {!showSplash && (
        <Scene3DProvider>
          <AppShell />

          {/* Footer bar with credits + mobile "More" button */}
          <TabBar />
        </Scene3DProvider>
      )}

      {/* PWA components — mounted outside splash guard so SW registers immediately (PWA-03, PWA-04) */}
      <ReloadPrompt />
      <InstallBanner />
    </MotionProvider>
  );
}

export default App;
