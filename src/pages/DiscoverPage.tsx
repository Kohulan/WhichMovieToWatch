// Route-level page composing DiscoveryPage + OnboardingWizard

import { useState } from "react";
import { usePreferencesStore } from "@/stores/preferencesStore";
import { DiscoveryPage } from "@/components/discovery/DiscoveryPage";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

/**
 * DiscoverPage — Route-level wrapper for the discovery experience.
 *
 * Shows OnboardingWizard on first visit (when no services or genre are set).
 * After onboarding (or skip), shows DiscoveryPage for movie discovery. (INTR-02, INTR-03, PREF-01)
 */
export function DiscoverPage() {
  // "Never onboarded" = no services selected AND no preferred genre set
  const hasOnboarded =
    usePreferencesStore.getState().myServices.length > 0 ||
    usePreferencesStore.getState().preferredGenre !== null;

  const [showOnboarding, setShowOnboarding] = useState(!hasOnboarded);

  function handleOnboardingComplete() {
    setShowOnboarding(false);
  }

  return (
    <>
      <DiscoveryPage />
      <OnboardingWizard
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
      />
    </>
  );
}
