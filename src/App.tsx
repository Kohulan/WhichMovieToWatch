import { useState } from 'react';
import { Outlet } from 'react-router';
import { AnimatePresence } from 'motion/react';
import { AppShell } from './components/layout/AppShell';
import { SplashScreen } from './components/SplashScreen';
import { ToastProvider } from './components/shared/Toast';

function App() {
  const [showSplash, setShowSplash] = useState(true);

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
        <AppShell>
          <Outlet />
        </AppShell>
      )}
    </>
  );
}

export default App;
