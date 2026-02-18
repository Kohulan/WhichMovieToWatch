import { AnimatePresence, motion } from 'motion/react';
import { Download, X, Share2 } from 'lucide-react';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { MetalButton } from '@/components/ui/MetalButton';

export function InstallBanner() {
  const { showPrompt, isIOS, isInstalled, install, dismiss } = useInstallPrompt();

  if (!showPrompt || isInstalled) {
    return null;
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          key="install-banner"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed bottom-24 left-0 right-0 z-50 mx-4"
        >
          <div className="bg-surface-clay/95 backdrop-blur-md border border-clay-border rounded-2xl shadow-clay-md p-4">
            {/* Dismiss button */}
            <button
              onClick={dismiss}
              aria-label="Dismiss install banner"
              className="absolute top-3 right-3 text-clay-text-muted hover:text-clay-text transition-colors p-1 rounded-full"
            >
              <X size={18} />
            </button>

            {isIOS ? (
              /* iOS: step-by-step instructions */
              <div className="pr-6">
                <p className="text-sm font-semibold text-clay-text mb-2">
                  Install Which Movie To Watch
                </p>
                <p className="text-xs text-clay-text-muted mb-3">
                  To install, tap the{' '}
                  <Share2 className="inline-block align-middle" size={14} />{' '}
                  Share button then &ldquo;Add to Home Screen&rdquo;
                </p>
                <ol className="text-xs text-clay-text-muted space-y-1 list-none">
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-accent min-w-[16px]">1.</span>
                    <span>
                      Tap <Share2 className="inline-block align-middle" size={12} /> in the Safari
                      toolbar
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-accent min-w-[16px]">2.</span>
                    <span>Scroll down and tap &ldquo;Add to Home Screen&rdquo;</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-accent min-w-[16px]">3.</span>
                    <span>Tap &ldquo;Add&rdquo; to confirm</span>
                  </li>
                </ol>
              </div>
            ) : (
              /* Chromium: native install button */
              <div className="flex items-center gap-4 pr-6">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-clay-text truncate">
                    Install Which Movie To Watch
                  </p>
                  <p className="text-xs text-clay-text-muted">
                    Add to home screen for quick access
                  </p>
                </div>
                <MetalButton
                  variant="primary"
                  size="sm"
                  onClick={install}
                  className="shrink-0"
                >
                  <Download size={14} />
                  Install
                </MetalButton>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
