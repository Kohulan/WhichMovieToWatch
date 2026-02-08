"use client";

import { useQuery } from "@tanstack/react-query";
import type { MovieDetail, TMDBDiscoverResponse, ExternalRatings } from "@/types/movie";

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export function useMovieDetail(id: number | null) {
  return useQuery<MovieDetail>({
    queryKey: ["movie", id],
    queryFn: () => fetchJSON(`/api/movies/${id}`),
    enabled: id !== null && id > 0,
    staleTime: 1000 * 60 * 30,
  });
}

export function useDiscover(params: {
  page?: number;
  genre?: string;
  provider?: string;
}) {
  return useQuery<TMDBDiscoverResponse>({
    queryKey: ["discover", params],
    queryFn: () => {
      const search = new URLSearchParams();
      if (params.page) search.set("page", String(params.page));
      if (params.genre) search.set("genre", params.genre);
      if (params.provider) search.set("provider", params.provider);
      return fetchJSON(`/api/movies/discover?${search.toString()}`);
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useTrending() {
  return useQuery<TMDBDiscoverResponse>({
    queryKey: ["trending"],
    queryFn: () => fetchJSON("/api/movies/trending"),
    staleTime: 1000 * 60 * 15,
  });
}

export function useSearch(query: string, page: number = 1) {
  return useQuery<TMDBDiscoverResponse>({
    queryKey: ["search", query, page],
    queryFn: () =>
      fetchJSON(`/api/movies/search?query=${encodeURIComponent(query)}&page=${page}`),
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 10,
  });
}

export function useExternalRatings(imdbId: string | undefined) {
  return useQuery<ExternalRatings>({
    queryKey: ["ratings", imdbId],
    queryFn: () => fetchJSON(`/api/ratings?imdbId=${imdbId}`),
    enabled: !!imdbId,
    staleTime: 1000 * 60 * 60,
  });
}
