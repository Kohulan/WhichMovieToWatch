import { useEffect } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { AnimatePresence, motion } from "motion/react";
import { RefreshCw, X, Wifi } from "lucide-react";
import { MetalButton } from "@/components/ui/MetalButton";

export function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(registration) {
      if (registration) {
        // Check for updates every hour
        setInterval(
          () => {
            registration.update();
          },
          60 * 60 * 1000,
        );
      }
    },
    onRegisterError(error) {
      console.error("SW registration error", error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  // Auto-dismiss offline-ready toast after 5 seconds
  useEffect(() => {
    if (!offlineReady) return;
    const timer = setTimeout(() => setOfflineReady(false), 5000);
    return () => clearTimeout(timer);
  }, [offlineReady, setOfflineReady]);

  const isVisible = offlineReady || needRefresh;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="reload-prompt"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-24 right-4 z-50"
        >
          <div className="bg-surface-clay/95 backdrop-blur-md border border-clay-border rounded-xl shadow-clay-md p-4 max-w-sm">
            {/* Dismiss button */}
            <button
              onClick={close}
              aria-label="Dismiss notification"
              className="absolute top-3 right-3 text-clay-text-muted hover:text-clay-text transition-colors p-1 rounded-full"
            >
              <X size={16} />
            </button>

            {offlineReady ? (
              /* Offline-ready state */
              <div className="flex items-center gap-3 pr-4">
                <div className="text-accent shrink-0">
                  <Wifi size={20} />
                </div>
                <p className="text-sm text-clay-text">
                  App ready to work offline
                </p>
              </div>
            ) : needRefresh ? (
              /* Update available state */
              <div className="pr-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-accent shrink-0">
                    <RefreshCw size={20} />
                  </div>
                  <p className="text-sm font-semibold text-clay-text">
                    New version available
                  </p>
                </div>
                <MetalButton
                  variant="primary"
                  size="sm"
                  onClick={() => updateServiceWorker(true)}
                  className="w-full"
                >
                  <RefreshCw size={14} />
                  Update
                </MetalButton>
              </div>
            ) : null}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
