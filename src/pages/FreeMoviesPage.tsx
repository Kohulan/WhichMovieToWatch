// Route wrapper for the Free Movies page
import { FreeMoviesBentoHero } from "@/components/free-movies/FreeMoviesBentoHero";
import { FreeMoviesPage as FreeMoviesPageComponent } from "@/components/free-movies/FreeMoviesPage";
import { Seo, routeSeoProps } from "@/components/seo/Seo";
import { getRouteMeta } from "@/seo/meta";

// FreeMoviesPageComponent manages its own full-width layout with a fixed backdrop.
// We place the bento hero in the same max-width container used by the page's own sections,
// then render the existing component without wrapping to avoid constraining its fixed backdrop.
export default function FreeMoviesPage() {
  return (
    <>
      <Seo {...routeSeoProps(getRouteMeta("/free-movies")!)} />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
        <FreeMoviesBentoHero />
      </div>
      <FreeMoviesPageComponent />
    </>
  );
}
