/**
 * MovieMetaTags.tsx
 * React 19 native metadata hoisting for OG and Twitter Card tags.
 * Tags are client-side only — social media crawlers will not see them (accepted SPA limitation).
 */

interface MovieMetaTagsProps {
  movie: {
    id: number;
    title: string;
    overview?: string;
    poster_path?: string | null;
    release_date?: string;
  };
}

export function MovieMetaTags({ movie }: MovieMetaTagsProps) {
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w1280${movie.poster_path}`
    : "/assets/images/preview.png";

  const pageUrl = `https://www.whichmovietowatch.online/#/discover?movie=${movie.id}`;

  const year = movie.release_date?.slice(0, 4) ?? "";
  const snippet = movie.overview?.slice(0, 150) ?? "Discover this movie";
  const description = `${movie.title}${year ? ` (${year})` : ""} - ${snippet}...`;

  return (
    <>
      <title>{movie.title} - Which Movie To Watch</title>

      {/* Open Graph */}
      <meta
        property="og:title"
        content={`${movie.title} - Which Movie To Watch`}
      />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={posterUrl} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:type" content="video.movie" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta
        name="twitter:title"
        content={`${movie.title} - Which Movie To Watch`}
      />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={posterUrl} />
    </>
  );
}
