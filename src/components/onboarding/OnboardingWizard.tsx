// Multi-step first-visit onboarding wizard for provider + genre preferences

import { useState } from 'react';
import { ClayModal } from '@/components/ui/ClayModal';
import { MetalButton } from '@/components/ui';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { ProviderSelector } from './ProviderSelector';
import { GenreSelector } from './GenreSelector';

interface OnboardingWizardProps {
  isOpen: boolean;
  onComplete: () => void;
}

/**
 * OnboardingWizard - 2-step modal wizard for first-visit preferences.
 *
 * Step 1: Provider selection (streaming services).
 * Step 2: Genre selection (preferred genre or "Any").
 * Progress shown as 2 dots at the top.
 * Skip closes without saving. Get Started persists selections. (PREF-01 through PREF-05, INTR-02, INTR-03)
 */
export function OnboardingWizard({ isOpen, onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedProviderIds, setSelectedProviderIds] = useState<number[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  const setMyServices = usePreferencesStore((s) => s.setMyServices);
  const setPreferredGenre = usePreferencesStore((s) => s.setPreferredGenre);

  function handleNext() {
    setStep(2);
  }

  function handleSkip() {
    onComplete();
  }

  function handleGetStarted() {
    setMyServices(selectedProviderIds);
    setPreferredGenre(selectedGenre);
    onComplete();
  }

  function handleClose() {
    handleSkip();
  }

  return (
    <ClayModal isOpen={isOpen} onClose={handleClose}>
      <div className="flex flex-col max-h-[calc(90vh-3rem)]">
        {/* Fixed header: progress dots + title */}
        <div className="flex-shrink-0 space-y-3 pb-3">
          <div
            className="flex items-center justify-center gap-2"
            aria-label={`Step ${step} of 2`}
          >
            <div
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                step >= 1 ? 'bg-clay-accent scale-125' : 'bg-clay-base'
              }`}
              aria-hidden="true"
            />
            <div
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                step >= 2 ? 'bg-clay-accent scale-125' : 'bg-clay-base'
              }`}
              aria-hidden="true"
            />
          </div>

          <div>
            <h2 className="font-heading text-xl font-bold text-clay-text text-center">
              {step === 1 ? 'Choose Your Streaming Services' : 'What genres do you enjoy?'}
            </h2>
            <p className="text-clay-text-muted text-sm text-center mt-1">
              {step === 1 ? "We'll find movies on your platforms" : 'Select your favorites or choose Any'}
            </p>
          </div>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto min-h-0 py-2">
          {step === 1 && (
            <ProviderSelector
              selectedIds={selectedProviderIds}
              onSelectionChange={setSelectedProviderIds}
            />
          )}

          {step === 2 && (
            <GenreSelector
              selectedGenre={selectedGenre}
              onGenreChange={setSelectedGenre}
            />
          )}
        </div>

        {/* Fixed footer: Skip + action button */}
        <div className="flex-shrink-0 flex items-center justify-between pt-4 border-t border-clay-base/30">
          <button
            onClick={handleSkip}
            className="text-sm text-clay-text-muted hover:text-clay-text transition-colors underline underline-offset-2"
            aria-label="Skip onboarding setup"
          >
            Skip
          </button>

          {step === 1 ? (
            <MetalButton variant="primary" size="md" onClick={handleNext}>
              Next
            </MetalButton>
          ) : (
            <MetalButton variant="primary" size="md" onClick={handleGetStarted}>
              Get Started
            </MetalButton>
          )}
        </div>
      </div>
    </ClayModal>
  );
}
