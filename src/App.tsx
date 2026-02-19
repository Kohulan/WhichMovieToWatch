import { useState, useEffect } from 'react';
import { Outlet } from 'react-router';
import { AnimatePresence } from 'motion/react';
import { AppShell } from './components/layout/AppShell';
import { SplashScreen } from './components/SplashScreen';
import { ToastProvider } from './components/shared/Toast';
import { TabBar } from './components/layout/TabBar';
import { useMigration } from './hooks/useMigration';
import { ReloadPrompt } from '@/components/pwa/ReloadPrompt';
import { InstallBanner } from '@/components/pwa/InstallBanner';
import { MotionProvider } from '@/components/animation/MotionProvider';
import { Scene3DProvider } from '@/components/3d/Scene3DProvider';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  // Run legacy localStorage migration on mount (Plan 02-02)
  useMigration();

  // Simple Analytics — cookieless, GDPR-compliant page view tracking (Plan 08-04, PRIV-02)
  // Manual script injection with hash mode for HashRouter navigation tracking.
  // Loaded outside splash guard so analytics fires immediately regardless of onboarding state.
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://scripts.simpleanalyticscdn.com/latest.js';
    script.async = true;
    script.defer = true;
    script.dataset.mode = 'hash';
    document.body.appendChild(script);

    // noscript fallback pixel for non-JS environments
    const noscriptImg = document.createElement('img');
    noscriptImg.src = 'https://queue.simpleanalyticscdn.com/noscript.gif';
    noscriptImg.alt = '';
    noscriptImg.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
    noscriptImg.style.display = 'none';
    document.body.appendChild(noscriptImg);

    return () => {
      // Cleanup on unmount (dev StrictMode double-invoke guard)
      if (document.body.contains(script)) document.body.removeChild(script);
      if (document.body.contains(noscriptImg)) document.body.removeChild(noscriptImg);
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
            onComplete={() => setShowSplash(false)}
          />
        )}
      </AnimatePresence>

      {!showSplash && (
        <Scene3DProvider>
          <AppShell>
            <Outlet />
          </AppShell>

          {/* Tab bar — persistent bottom navigation (DISC-03) */}
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
