import { useState } from 'react';
import { Outlet } from 'react-router';
import { AnimatePresence } from 'motion/react';
import { AppShell } from './components/layout/AppShell';
import { SplashScreen } from './components/SplashScreen';
import { ToastProvider } from './components/shared/Toast';
import { TabBar } from './components/layout/TabBar';
import { useMigration } from './hooks/useMigration';
import { ReloadPrompt } from '@/components/pwa/ReloadPrompt';
import { InstallBanner } from '@/components/pwa/InstallBanner';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  // Run legacy localStorage migration on mount (Plan 02-02)
  useMigration();

  return (
    <>
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
        <>
          <AppShell>
            <Outlet />
          </AppShell>

          {/* Tab bar — persistent bottom navigation (DISC-03) */}
          <TabBar />
        </>
      )}

      {/* PWA components — mounted outside splash guard so SW registers immediately (PWA-03, PWA-04) */}
      <ReloadPrompt />
      <InstallBanner />
    </>
  );
}

export default App;
