import { useState } from 'react';
import { Outlet } from 'react-router';
import { AnimatePresence } from 'motion/react';
import { AppShell } from './components/layout/AppShell';
import { SplashScreen } from './components/SplashScreen';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
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
