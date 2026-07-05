import { useEffect } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { AnimatePresence, motion } from "motion/react";
import { X, Wifi } from "lucide-react";

export function ReloadPrompt() {
  // With registerType: "autoUpdate" (see vite.config.ts), new service worker
  // versions call self.skipWaiting()/clients.claim() unconditionally on
  // install — there is no "update available, click to apply" state to show
  // the user. The only UI left here is the one-time "ready to work offline"
  // confirmation toast.
  const {
    offlineReady: [offlineReady, setOfflineReady],
  } = useRegisterSW({
    onRegistered(registration) {
      if (registration) {
        // Proactively check for updates every hour so long-lived tabs pick
        // up new deploys without waiting on the browser's own (infrequent)
        // update check. Any update found installs, activates, and reloads
        // automatically — see vite.config.ts skipWaiting/clientsClaim.
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

  const close = () => setOfflineReady(false);

  // Auto-dismiss offline-ready toast after 5 seconds
  useEffect(() => {
    if (!offlineReady) return;
    const timer = setTimeout(() => setOfflineReady(false), 5000);
    return () => clearTimeout(timer);
  }, [offlineReady, setOfflineReady]);

  return (
    <AnimatePresence>
      {offlineReady && (
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

            <div className="flex items-center gap-3 pr-4">
              <div className="text-accent shrink-0">
                <Wifi size={20} />
              </div>
              <p className="text-sm text-clay-text">
                App ready to work offline
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
