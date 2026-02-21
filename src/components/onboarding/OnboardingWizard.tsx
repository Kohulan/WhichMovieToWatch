// Cinematic 2-step onboarding wizard for provider + genre preferences
// Supports both first-visit onboarding and re-edit settings mode.

import { useState, useCallback, useEffect, useId } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Tv, Sparkles, ArrowLeft, ArrowRight, X } from "lucide-react";
import { MetalButton } from "@/components/ui";
import { usePreferencesStore } from "@/stores/preferencesStore";
import { useDiscoveryStore } from "@/stores/discoveryStore";
import { useRegionProviders } from "@/hooks/useWatchProviders";
import { getProviderLogoUrl } from "@/lib/provider-registry";
import { getAllGenres } from "@/lib/genre-map";

interface OnboardingWizardProps {
  isOpen: boolean;
  onComplete: () => void;
  /** When true, shows "Save" instead of "Get Started" and pre-fills current preferences */
  mode?: "onboarding" | "settings";
  /** Optional warning shown at the top of the modal (e.g. when previous filters returned no results) */
  warningMessage?: string | null;
}

/** Top streaming services shown first (by TMDB provider ID) */
const TOP_PROVIDER_IDS = new Set([
  8, 337, 9, 119, 15, 384, 350, 531, 386, 283, 2, 3, 10,
]);

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
    scale: 0.97,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
    scale: 0.97,
  }),
};

/**
 * OnboardingWizard — Cinematic 2-step preference setup.
 *
 * Step 1: Pick streaming providers (multi-select logo grid).
 *         User clicks "Next" in footer to advance.
 * Step 2: Pick ONE genre or "Any" (single-select pill chips).
 *
 * Footer with Skip/Back and action buttons is always pinned to the bottom.
 */
export function OnboardingWizard({
  isOpen,
  onComplete,
  mode = "onboarding",
  warningMessage,
}: OnboardingWizardProps) {
  const currentProvider = usePreferencesStore((s) => s.preferredProvider);
  const currentGenre = usePreferencesStore((s) => s.preferredGenre);
  const myServices = usePreferencesStore((s) => s.myServices);

  const [step, setStep] = useState<1 | 2>(1);
  const [direction, setDirection] = useState(1);
  const [selectedProviders, setSelectedProviders] = useState<Set<number>>(
    () => {
      if (mode === "settings") {
        if (myServices.length > 0) return new Set(myServices);
        if (currentProvider) return new Set([Number(currentProvider)]);
      }
      return new Set();
    },
  );
  const [selectedGenre, setSelectedGenre] = useState<string | null>(
    mode === "settings" ? currentGenre : null,
  );

  const setPreferredProvider = usePreferencesStore(
    (s) => s.setPreferredProvider,
  );
  const setPreferredGenre = usePreferencesStore((s) => s.setPreferredGenre);
  const setMyServices = usePreferencesStore((s) => s.setMyServices);
  const completeOnboarding = usePreferencesStore((s) => s.completeOnboarding);
  const setFilters = useDiscoveryStore((s) => s.setFilters);

  const { providers, isLoading: providersLoading } = useRegionProviders();
  const genres = getAllGenres();
  const titleId = useId();

  // Sort providers: top ones first, then alphabetical
  const sortedProviders = [...providers].sort((a, b) => {
    const aTop = TOP_PROVIDER_IDS.has(a.provider_id);
    const bTop = TOP_PROVIDER_IDS.has(b.provider_id);
    if (aTop && !bTop) return -1;
    if (!aTop && bTop) return 1;
    return a.provider_name.localeCompare(b.provider_name);
  });

  // Toggle provider in/out of multi-select set
  const handleProviderSelect = useCallback((providerId: number) => {
    setSelectedProviders((prev) => {
      const next = new Set(prev);
      if (next.has(providerId)) {
        next.delete(providerId);
      } else {
        next.add(providerId);
      }
      return next;
    });
  }, []);

  const handleBack = useCallback(() => {
    setDirection(-1);
    setStep(1);
  }, []);

  const handleSave = useCallback(() => {
    const providerArray = [...selectedProviders];
    setMyServices(providerArray);
    // Backward compat: keep preferredProvider as the first selected service
    setPreferredProvider(
      providerArray.length > 0 ? String(providerArray[0]) : null,
    );
    setPreferredGenre(selectedGenre);

    setFilters({
      providerIds: providerArray,
      genreId: selectedGenre,
    });

    if (mode === "onboarding") {
      completeOnboarding();
    }

    onComplete();
  }, [
    selectedProviders,
    selectedGenre,
    setMyServices,
    setPreferredProvider,
    setPreferredGenre,
    setFilters,
    completeOnboarding,
    mode,
    onComplete,
  ]);

  const handleSkip = useCallback(() => {
    if (mode === "onboarding") {
      completeOnboarding();
    }
    onComplete();
  }, [mode, completeOnboarding, onComplete]);

  // Close on Escape key and lock body scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleSkip();
    };

    document.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, handleSkip]);

  // Reset step when opening in settings mode
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      if (mode === "settings") {
        const services = usePreferencesStore.getState().myServices;
        const provider = usePreferencesStore.getState().preferredProvider;
        if (services.length > 0) {
          setSelectedProviders(new Set(services));
        } else if (provider) {
          setSelectedProviders(new Set([Number(provider)]));
        } else {
          setSelectedProviders(new Set());
        }
        setSelectedGenre(currentGenre);
      }
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const isSettingsMode = mode === "settings";
  const ctaLabel = isSettingsMode ? "Save" : "Get Started";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleSkip}
            aria-hidden="true"
          />

          {/* Modal panel — flex column, overflow managed internally */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative bg-clay-base/95 backdrop-blur-md sm:bg-clay-base/90 sm:backdrop-blur-2xl border border-white/10 rounded-2xl max-w-xl w-full mx-auto max-h-[85vh] flex flex-col overflow-hidden transition-colors duration-300"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              transition: { type: "spring", stiffness: 300, damping: 22 },
            }}
            exit={{
              scale: 0.95,
              opacity: 0,
              transition: { duration: 0.15 },
            }}
          >
            {/* Sticky header: warning + close button + progress bar */}
            <div className="flex-shrink-0 p-5 pb-0">
              {/* Warning banner when previous filters returned no results */}
              {warningMessage && (
                <div className="mb-3 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
                  <p className="text-red-400 text-sm font-medium">
                    {warningMessage}
                  </p>
                </div>
              )}

              {/* Close button */}
              <div className="flex justify-end mb-3">
                <button
                  onClick={handleSkip}
                  autoFocus
                  className="p-2 rounded-xl bg-white/[0.08] border border-white/10 text-clay-text-muted hover:text-clay-text hover:bg-white/[0.12] transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="h-1 w-full bg-clay-surface rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-accent rounded-full"
                    animate={{ width: step === 1 ? "50%" : "100%" }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                </div>
                <div className="flex justify-between mt-1.5 px-0.5">
                  <span
                    className={`text-[11px] font-medium transition-colors ${
                      step === 1 ? "text-accent" : "text-clay-text-muted"
                    }`}
                  >
                    1. Streaming
                  </span>
                  <span
                    className={`text-[11px] font-medium transition-colors ${
                      step === 2 ? "text-accent" : "text-clay-text-muted"
                    }`}
                  >
                    2. Genre
                  </span>
                </div>
              </div>
            </div>

            {/* Scrollable content area — only this part scrolls */}
            <div className="flex-1 overflow-y-auto min-h-0 px-5">
              <AnimatePresence mode="wait" custom={direction}>
                {step === 1 && (
                  <motion.div
                    key="step-1"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                  >
                    {/* Step 1 Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center flex-shrink-0">
                        <Tv className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <h2
                          id={titleId}
                          className="font-heading text-lg font-bold text-clay-text"
                        >
                          {isSettingsMode
                            ? "Change Streaming Services"
                            : "Where do you watch?"}
                        </h2>
                        <p className="text-clay-text-muted text-xs">
                          Tap your platforms
                        </p>
                      </div>
                    </div>

                    {/* Provider grid — multi-select */}
                    {providersLoading ? (
                      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5 pb-4">
                        {Array.from({ length: 10 }).map((_, i) => (
                          <div
                            key={i}
                            className="aspect-square rounded-xl bg-clay-surface animate-pulse"
                          />
                        ))}
                      </div>
                    ) : (
                      <div
                        className="grid grid-cols-4 sm:grid-cols-5 gap-2.5 pb-4"
                        role="group"
                        aria-label="Streaming service selection"
                      >
                        {sortedProviders.map((provider) => {
                          const isSelected = selectedProviders.has(
                            provider.provider_id,
                          );
                          return (
                            <motion.button
                              key={provider.provider_id}
                              onClick={() =>
                                handleProviderSelect(provider.provider_id)
                              }
                              role="checkbox"
                              aria-checked={isSelected}
                              aria-label={provider.provider_name}
                              title={provider.provider_name}
                              className="group flex flex-col items-center gap-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent rounded-xl p-1"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 20,
                              }}
                            >
                              <div
                                className={`
                                  relative w-full aspect-square rounded-xl overflow-hidden transition-[box-shadow,opacity] duration-200
                                  ${
                                    isSelected
                                      ? "ring-[3px] ring-accent shadow-[0_0_16px_rgba(var(--accent-rgb,255,140,50),0.35)] opacity-100"
                                      : "ring-1 ring-white/10 opacity-60 group-hover:opacity-85"
                                  }
                                `}
                              >
                                {provider.logo_path ? (
                                  <img
                                    src={getProviderLogoUrl(provider.logo_path)}
                                    alt=""
                                    loading="lazy"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-clay-surface flex items-center justify-center">
                                    <span className="text-clay-text-muted text-xs font-medium">
                                      {provider.provider_name.slice(0, 3)}
                                    </span>
                                  </div>
                                )}
                                {isSelected && (
                                  <motion.div
                                    className="absolute inset-0 bg-accent/20 flex items-center justify-center"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.15 }}
                                  >
                                    <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center shadow-lg">
                                      <svg
                                        width="12"
                                        height="12"
                                        viewBox="0 0 12 12"
                                        fill="none"
                                        className="text-white"
                                      >
                                        <path
                                          d="M2 6L5 9L10 3"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                      </svg>
                                    </div>
                                  </motion.div>
                                )}
                              </div>
                              <span
                                className={`text-[10px] leading-tight text-center line-clamp-1 max-w-full transition-colors ${
                                  isSelected
                                    ? "text-accent font-semibold"
                                    : "text-clay-text-muted"
                                }`}
                              >
                                {provider.provider_name}
                              </span>
                            </motion.button>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step-2"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                  >
                    {/* Step 2 Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <h2 className="font-heading text-lg font-bold text-clay-text">
                          {isSettingsMode
                            ? "Change Genre"
                            : "What are you in the mood for?"}
                        </h2>
                        <p className="text-clay-text-muted text-xs">
                          Pick a genre or leave it on Any
                        </p>
                      </div>
                    </div>

                    {/* Genre pills — single select */}
                    <div
                      className="flex flex-wrap gap-2 pb-4"
                      role="radiogroup"
                      aria-label="Genre selection"
                    >
                      {/* "Any" option */}
                      <motion.button
                        role="radio"
                        aria-checked={selectedGenre === null}
                        onClick={() => setSelectedGenre(null)}
                        className="focus:outline-none focus:ring-2 focus:ring-accent rounded-full cursor-pointer"
                        whileHover={{ scale: 1.06 }}
                        whileTap={{ scale: 0.94 }}
                      >
                        <span
                          className={`
                            inline-flex items-center px-4 py-2 rounded-full font-body font-semibold text-sm
                            transition-colors duration-200 select-none
                            ${
                              selectedGenre === null
                                ? "bg-accent text-white shadow-[0_0_12px_rgba(var(--accent-rgb,255,140,50),0.3)]"
                                : "bg-clay-surface/70 text-clay-text-muted border border-white/10 hover:border-white/20"
                            }
                          `}
                        >
                          Any Genre
                        </span>
                      </motion.button>

                      {genres.map((genre) => {
                        const isSelected = selectedGenre === String(genre.id);
                        return (
                          <motion.button
                            key={genre.id}
                            role="radio"
                            aria-checked={isSelected}
                            onClick={() =>
                              setSelectedGenre(
                                isSelected ? null : String(genre.id),
                              )
                            }
                            className="focus:outline-none focus:ring-2 focus:ring-accent rounded-full cursor-pointer"
                            whileHover={{ scale: 1.06 }}
                            whileTap={{ scale: 0.94 }}
                          >
                            <span
                              className={`
                                inline-flex items-center px-4 py-2 rounded-full font-body font-medium text-sm
                                transition-colors duration-200 select-none
                                ${
                                  isSelected
                                    ? "bg-accent text-white shadow-[0_0_12px_rgba(var(--accent-rgb,255,140,50),0.3)]"
                                    : "bg-clay-surface/70 text-clay-text border border-white/10 hover:border-white/20"
                                }
                              `}
                            >
                              {genre.name}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sticky footer — always pinned to bottom of modal */}
            <div className="flex-shrink-0 flex items-center justify-between p-5 border-t border-white/[0.06] bg-clay-base/80 backdrop-blur-md">
              {step === 1 ? (
                <button
                  onClick={handleSkip}
                  className="text-sm text-clay-text-muted hover:text-clay-text transition-colors underline underline-offset-2 cursor-pointer"
                >
                  {isSettingsMode ? "Cancel" : "Skip"}
                </button>
              ) : (
                <MetalButton variant="ghost" size="sm" onClick={handleBack}>
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </MetalButton>
              )}

              {step === 1 && selectedProviders.size > 0 && (
                <MetalButton
                  variant="primary"
                  size="md"
                  onClick={() => {
                    setDirection(1);
                    setStep(2);
                  }}
                >
                  Next
                  <ArrowRight className="w-3.5 h-3.5" />
                </MetalButton>
              )}

              {step === 2 && (
                <MetalButton variant="primary" size="md" onClick={handleSave}>
                  {ctaLabel}
                </MetalButton>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
