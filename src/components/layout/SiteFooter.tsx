import { Link } from "react-router";
import { getAllRouteMeta } from "@/seo/meta";

/**
 * SiteFooter — in-flow footer with the full internal link graph.
 * This is load-bearing for SEO: crawlers discover genre/provider/hub pages
 * through these real <a href> links on every page.
 */
export function SiteFooter() {
  const routes = getAllRouteMeta();
  const genres = routes.filter((r) => r.list?.kind === "genre");
  const providers = routes.filter((r) => r.list?.kind === "provider");
  const core = [
    { path: "/what-to-watch-tonight", label: "What to Watch Tonight" },
    { path: "/trending", label: "Trending Movies" },
    { path: "/discover", label: "Discover" },
    { path: "/browse", label: "Browse" },
    { path: "/free-movies", label: "Free Movies" },
    { path: "/dinner-time", label: "Dinner Time" },
  ];

  const linkCls =
    "text-clay-text-muted hover:text-clay-text transition-colors duration-200";

  return (
    <footer
      aria-label="Explore Which Movie To Watch"
      className="relative z-[1] mx-auto max-w-6xl px-4 pb-24 pt-10 text-xs"
    >
      <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
        <nav aria-labelledby="footer-explore">
          <h2
            id="footer-explore"
            className="mb-3 font-semibold uppercase tracking-wide text-clay-text"
          >
            Explore
          </h2>
          <ul className="space-y-1.5">
            {core.map((l) => (
              <li key={l.path}>
                <Link className={linkCls} to={l.path}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-labelledby="footer-genres">
          <h2
            id="footer-genres"
            className="mb-3 font-semibold uppercase tracking-wide text-clay-text"
          >
            By genre
          </h2>
          <ul className="grid grid-cols-1 gap-1.5 lg:grid-cols-2">
            {genres.map((g) => (
              <li key={g.path}>
                <Link className={linkCls} to={g.path}>
                  {g.h1.replace(/^Best | right now$/gi, "")}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-labelledby="footer-streaming">
          <h2
            id="footer-streaming"
            className="mb-3 font-semibold uppercase tracking-wide text-clay-text"
          >
            By streaming service
          </h2>
          <ul className="space-y-1.5">
            {providers.map((p) => (
              <li key={p.path}>
                <Link className={linkCls} to={p.path}>
                  {p.h1.replace(/^Best movies on | right now$/gi, "")}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
