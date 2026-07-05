// Static crawler-visible body HTML for prerendered pages. React's
// createRoot().render() replaces this content on mount — it exists for
// crawlers, social scrapers, and as an instant first paint.

import { escapeHtml } from "./html.mjs";
import { movieSlug } from "./slug.mjs";

const NAV_LINKS = [
  ["/", "Home"],
  ["/what-to-watch-tonight", "What to Watch Tonight"],
  ["/trending", "Trending"],
  ["/discover", "Discover"],
  ["/browse", "Browse"],
  ["/free-movies", "Free Movies"],
];

function nav() {
  const items = NAV_LINKS.map(
    ([href, label]) => `<li><a href="${href}">${escapeHtml(label)}</a></li>`,
  ).join("");
  return `<nav aria-label="Main"><ul>${items}</ul></nav>`;
}

function posterImg(movie, size = "w342") {
  if (!movie.poster_path) return "";
  return `<img src="https://image.tmdb.org/t/p/${size}${escapeHtml(movie.poster_path)}" alt="${escapeHtml(movie.title)} poster" loading="lazy" width="342" height="513" />`;
}

function movieCard(movie) {
  const year = (movie.release_date || "").slice(0, 4);
  return `<li><a href="/movie/${movieSlug(movie)}">${posterImg(movie)}<p class="t">${escapeHtml(movie.title)}${year ? ` (${year})` : ""}</p><p class="y">★ ${Number(movie.vote_average ?? 0).toFixed(1)}/10</p></a></li>`;
}

export function renderListBody({ entry, movies, site }) {
  return `<div class="seo-static">
${nav()}
<main>
<h1>${escapeHtml(entry.h1)}</h1>
<p class="intro">${escapeHtml(entry.intro)}</p>
<ul class="grid">
${movies.map(movieCard).join("\n")}
</ul>
</main>
<footer><p><a href="/">${escapeHtml(site.name)}</a> — movie data from TMDB.</p></footer>
</div>`;
}

export function renderMovieBody({ movie, site }) {
  const year = (movie.release_date || "").slice(0, 4);
  const facts = [
    year,
    movie.runtime ? `${movie.runtime} min` : null,
    (movie.genres ?? []).map((g) => escapeHtml(g.name)).join(", ") || null,
    movie.vote_count > 0
      ? `★ ${Number(movie.vote_average ?? 0).toFixed(1)}/10 (${movie.vote_count.toLocaleString("en-US")} ratings)`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return `<div class="seo-static">
${nav()}
<main>
<nav aria-label="Breadcrumb"><a href="/">Home</a> › <a href="/trending">Movies</a> › ${escapeHtml(movie.title)}</nav>
<h1>${escapeHtml(movie.title)}${year ? ` (${year})` : ""}</h1>
<p>${facts}</p>
${posterImg(movie, "w500")}
<p>${escapeHtml(movie.overview ?? "")}</p>
<p>Open this page in the app to see live streaming availability for your country, the trailer, and similar movies.</p>
</main>
<footer><p><a href="/">${escapeHtml(site.name)}</a> — movie data from TMDB.</p></footer>
</div>`;
}
