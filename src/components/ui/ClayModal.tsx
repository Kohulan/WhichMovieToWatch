import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useId } from "react";

interface ClayModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  className?: string;
}

/**
 * ClayModal — Floating clay panel with backdrop blur overlay.
 *
 * Enters with spring scale animation, exits with fade-out.
 * Backdrop click closes the modal. Includes basic focus trapping
 * (autoFocus on close button) and full ARIA attributes.
 */
export function ClayModal({
  isOpen,
  onClose,
  children,
  title,
  className = "",
}: ClayModalProps) {
  const titleId = useId();

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);

    // Prevent body scroll when modal is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            className={`relative bg-clay-base/95 backdrop-blur-md sm:bg-clay-base/80 sm:backdrop-blur-2xl border border-white/10 rounded-2xl max-w-lg w-full mx-auto max-h-[90vh] overflow-y-auto transition-colors duration-300 ${className}`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              transition: {
                type: "spring",
                stiffness: 300,
                damping: 22,
              },
            }}
            exit={{
              scale: 0.95,
              opacity: 0,
              transition: { duration: 0.15 },
            }}
          >
            {/* Header with close button */}
            <div className="relative z-10 flex items-center justify-between p-6 pb-0">
              {title && (
                <h2
                  id={titleId}
                  className="font-heading text-xl text-clay-text"
                >
                  {title}
                </h2>
              )}
              <button
                onClick={onClose}
                autoFocus
                className="ml-auto p-2 rounded-xl bg-white/[0.08] border border-white/10 text-clay-text-muted hover:text-clay-text hover:bg-white/[0.12] transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="relative z-10 p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
