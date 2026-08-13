// schema.org JSON-LD builders shared by the React app and tools/prerender.mjs.
// Only currently-supported Google types: WebSite, Organization, ItemList,
// Movie (+AggregateRating), BreadcrumbList. Deliberately NO FAQPage/HowTo/
// SearchAction — dead rich-result types as of 2025-26.

import { movieSlug } from "./slug.mjs";

const TMDB_IMG = "https://image.tmdb.org/t/p";

export function webSiteJsonLd(site) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.origin + "/",
  };
}

export function organizationJsonLd(site) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.origin + "/",
    logo: site.origin + "/favicon_io/android-chrome-512x512.png",
  };
}

export function itemListJsonLd({ movies, pageUrl, origin }) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    url: pageUrl,
    numberOfItems: movies.length,
    itemListElement: movies.map((m, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: m.title,
      url: `${origin}/movie/${movieSlug(m)}`,
      ...(m.poster_path ? { image: `${TMDB_IMG}/w500${m.poster_path}` } : {}),
    })),
  };
}

export function videoObjectJsonLd(movie, video, origin) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: `${movie.title} — Official Trailer`,
    description: movie.overview || `Official trailer for ${movie.title}`,
    thumbnailUrl: [
      `https://img.youtube.com/vi/${video.key}/hqdefault.jpg`,
      `https://img.youtube.com/vi/${video.key}/maxresdefault.jpg`,
    ],
    uploadDate: movie.release_date || new Date().toISOString().slice(0, 10),
    contentUrl: `https://www.youtube.com/watch?v=${video.key}`,
    embedUrl: `https://www.youtube.com/embed/${video.key}`,
  };
}

export function movieJsonLd(movie, origin) {
  const directors = (movie.credits?.crew ?? [])
    .filter((c) => c.job === "Director")
    .map((c) => ({ "@type": "Person", name: c.name }));
  const actors = (movie.credits?.cast ?? [])
    .slice(0, 5)
    .map((c) => ({ "@type": "Person", name: c.name }));

  const trailer = movie.videos?.results?.find(
    (v) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser"),
  );

  const ld = {
    "@context": "https://schema.org",
    "@type": "Movie",
    name: movie.title,
    url: `${origin}/movie/${movieSlug(movie)}`,
    description: movie.overview || undefined,
    ...(movie.poster_path
      ? { image: `${TMDB_IMG}/w780${movie.poster_path}` }
      : {}),
    ...(movie.release_date ? { datePublished: movie.release_date } : {}),
    ...(movie.genres?.length ? { genre: movie.genres.map((g) => g.name) } : {}),
    ...(directors.length ? { director: directors } : {}),
    ...(actors.length ? { actor: actors } : {}),
    ...(trailer ? { trailer: videoObjectJsonLd(movie, trailer, origin) } : {}),
  };

  if (movie.vote_count > 0) {
    ld.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: movie.vote_average,
      ratingCount: movie.vote_count,
      bestRating: 10,
      worstRating: 0,
    };
  }
  return ld;
}

export function breadcrumbJsonLd(crumbs, origin) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: origin + (c.path === "/" ? "/" : c.path),
    })),
  };
}
