import { DiscoverPage } from "./DiscoverPage";

/**
 * MoviePage — /movie/:slug renders the discovery experience pinned to the
 * movie in the slug. useDeepLink (inside DiscoveryPage) reads the :slug
 * param, so this is a pure alias route. Head tags come from DiscoveryPage's
 * movie <Seo> (canonical already points at /movie/:slug).
 */
export function MoviePage() {
  return <DiscoverPage />;
}
