// Route wrapper for the Dinner Time page
import { DinnerTimeBentoHero } from '@/components/dinner-time/DinnerTimeBentoHero';
import { DinnerTimePage as DinnerTimePageComponent } from '@/components/dinner-time/DinnerTimePage';

// DinnerTimePageComponent manages its own full-width layout with a fixed backdrop.
// We place the bento hero in the same max-width container used by the page's own sections,
// then render the existing component without wrapping to avoid constraining its fixed backdrop.
export default function DinnerTimePage() {
  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
        <DinnerTimeBentoHero />
      </div>
      <DinnerTimePageComponent />
    </>
  );
}
