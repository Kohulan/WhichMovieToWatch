import { Seo } from "@/components/seo/Seo";
import { MoviePosterCard } from "@/components/seo/MoviePosterCard";
import { useMovieList } from "@/hooks/useMovieList";
import { SITE, type RouteMeta } from "@/seo/meta";
import {
  itemListJsonLd,
  breadcrumbJsonLd,
} from "../../../tools/lib/jsonld.mjs";
import {
  fetchTonightList,
  fetchGenreList,
  fetchProviderList,
} from "@/services/tmdb/seo-lists";
import { fetchNowPlaying } from "@/services/tmdb/trending";
import { LoadingQuotes } from "@/components/animation/LoadingQuotes";
import type { TMDBMovie } from "@/types/movie";

function loaderFor(meta: RouteMeta): () => Promise<TMDBMovie[]> {
  const list = meta.list!;
  switch (list.kind) {
    case "tonight":
      return fetchTonightList;
    case "genre":
      return () => fetchGenreList(list.genreId);
    case "provider":
      return () => fetchProviderList(list.providerId, list.region);
    case "trending":
      return async () => (await fetchNowPlaying("US", 1)).results.slice(0, 20);
  }
}

/** Shared hub-page shell: Seo + h1 + editorial intro + poster grid. */
export function HubPage({ meta }: { meta: RouteMeta }) {
  const { movies, isLoading, error } = useMovieList(meta.path, loaderFor(meta));
  const pageUrl = SITE.origin + meta.path;

  return (
    <section className="mx-auto max-w-6xl space-y-6 p-4">
      <Seo
        title={meta.title}
        description={meta.description}
        path={meta.path}
        jsonLd={[
          ...(movies.length
            ? [itemListJsonLd({ movies, pageUrl, origin: SITE.origin })]
            : []),
          breadcrumbJsonLd(
            [
              { name: "Home", path: "/" },
              { name: meta.h1, path: meta.path },
            ],
            SITE.origin,
          ),
        ]}
      />
      <header className="space-y-3">
        <h1 className="text-2xl font-heading font-semibold text-clay-text">
          {meta.h1}
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-clay-text-muted">
          {meta.intro}
        </p>
      </header>

      {isLoading && movies.length === 0 && (
        <div aria-busy="true" aria-label="Loading movies">
          <LoadingQuotes />
        </div>
      )}
      {error && movies.length === 0 && (
        <p className="text-sm text-clay-text-muted">{error}</p>
      )}

      <div
        role="list"
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
      >
        {movies.map((movie) => (
          <MoviePosterCard key={movie.id} movie={movie} />
        ))}
      </div>
    </section>
  );
}
