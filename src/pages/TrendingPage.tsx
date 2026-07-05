// Route wrapper for the Trending (Now Playing) page
import { TrendingBentoHero } from "@/components/trending/TrendingBentoHero";
import { TrendingPage as TrendingPageComponent } from "@/components/trending/TrendingPage";

export default function TrendingPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
      <TrendingBentoHero />
      <TrendingPageComponent />
    </div>
  );
}
