// Route wrapper for the Dinner Time page
import { useEffect } from "react";
import { useIsPresent } from "motion/react";
import { DinnerTimeBentoHero } from "@/components/dinner-time/DinnerTimeBentoHero";
import { DinnerTimePage as DinnerTimePageComponent } from "@/components/dinner-time/DinnerTimePage";
import { useDinnerTime } from "@/hooks/useDinnerTime";
import { useRegionProviders } from "@/hooks/useWatchProviders";

// DinnerTimePageComponent manages its own full-width layout with a fixed backdrop.
// Bento hero sits below the movie content and fades in on scroll.
// Service state is lifted here so both components share it.
export default function DinnerTimePage() {
  const isPresent = useIsPresent();
  const dinnerTime = useDinnerTime();
  const { providers: regionProviders } = useRegionProviders();

  // Abort in-flight fetches as soon as the exit animation begins.
  // Without this, fetches that resolve during the 350ms exit window trigger
  // setState → re-render → nested AnimatePresence transitions, which can
  // stall the parent AnimatePresence and prevent the new page from mounting.
  useEffect(() => {
    if (!isPresent) {
      dinnerTime.forceAbort();
    }
  }, [isPresent]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <DinnerTimePageComponent
        dinnerTime={dinnerTime}
        regionProviders={regionProviders}
      />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <DinnerTimeBentoHero
          currentService={dinnerTime.currentService}
          setService={dinnerTime.setService}
          regionProviders={regionProviders}
        />
      </div>
    </>
  );
}
