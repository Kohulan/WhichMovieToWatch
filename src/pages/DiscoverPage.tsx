// Route-level page for the discovery experience.
// Onboarding is managed entirely within DiscoveryPage using hasCompletedOnboarding
// from the preferences store — no duplicate wizard needed here.

import { DiscoveryPage } from "@/components/discovery/DiscoveryPage";

export function DiscoverPage() {
  return <DiscoveryPage />;
}
