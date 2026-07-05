// Build-time TMDB fetcher for the prerender pipeline.
// Fail-soft: on success writes a snapshot JSON; on network/API failure the
// previous snapshot (restored by the CI cache) is used so a TMDB outage
// never breaks the deploy.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import content from "../../src/seo/seo-content.json" with { type: "json" };

const API = "https://api.themoviedb.org/3";
const MOVIE_PAGE_SOURCES = [
  ["/movie/popular", 8],
  ["/movie/now_playing", 5],
];
const MOVIE_CAP = 250;
const DETAIL_CONCURRENCY = 8;

/** Mirror of src/services/tmdb/seo-lists.ts — a test pins these. */
export function discoverParamsFor(list) {
  switch (list.kind) {
    case "tonight":
      return {
        sort_by: "popularity.desc",
        "vote_average.gte": 7,
        "vote_count.gte": 500,
        include_adult: false,
        page: 1,
      };
    case "trending":
      return {
        sort_by: "popularity.desc",
        "vote_count.gte": 500,
        include_adult: false,
        page: 1,
        region: "US",
      };
    case "genre":
      return {
        with_genres: list.genreId,
        sort_by: "popularity.desc",
        "vote_count.gte": 200,
        include_adult: false,
        page: 1,
      };
    case "provider":
      return {
        with_watch_providers: list.providerId,
        watch_region: list.region,
        with_watch_monetization_types: "flatrate",
        sort_by: "popularity.desc",
        "vote_count.gte": 100,
        include_adult: false,
        page: 1,
      };
    default:
      throw new Error(`unknown list kind ${list.kind}`);
  }
}

async function apiGet(fetchImpl, apiKey, path, params = {}, retries = 3) {
  const url = new URL(API + path);
  url.searchParams.set("api_key", apiKey);
  for (const [k, v] of Object.entries(params))
    url.searchParams.set(k, String(v));
  let lastError;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetchImpl(url.toString());
      if (res.status === 429) {
        await new Promise((r) =>
          setTimeout(r, Math.min(2 ** attempt * 1000, 10000)),
        );
        continue;
      }
      if (!res.ok) throw new Error(`TMDB ${res.status} for ${path}`);
      return await res.json();
    } catch (err) {
      lastError = err;
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
    }
  }
  throw lastError ?? new Error(`TMDB failed for ${path}`);
}

async function mapConcurrent(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker),
  );
  return results;
}

export async function fetchAllData({
  apiKey,
  fetchImpl = fetch,
  snapshotPath = new URL("../.tmdb-snapshot.json", import.meta.url).pathname,
  retries = 3,
} = {}) {
  const listRoutes = content.routes.filter((r) => r.list);
  try {
    // 1. Hub-page lists
    const lists = {};
    for (const route of listRoutes) {
      const params = discoverParamsFor(route.list);
      const path =
        route.list.kind === "trending"
          ? "/movie/now_playing"
          : "/discover/movie";
      const cleaned = { ...params };
      if (route.list.kind === "trending") {
        delete cleaned.sort_by;
        delete cleaned["vote_count.gte"];
        delete cleaned.include_adult;
      }
      const res = await apiGet(fetchImpl, apiKey, path, cleaned, retries);
      lists[route.path] = (res.results ?? []).slice(0, 20);
    }

    // 2. Movie set: popular + now-playing pages, deduped, capped
    const seen = new Set();
    const baseMovies = [];
    for (const [path, pages] of MOVIE_PAGE_SOURCES) {
      for (let page = 1; page <= pages; page++) {
        const res = await apiGet(fetchImpl, apiKey, path, { page }, retries);
        for (const m of res.results ?? []) {
          if (!seen.has(m.id)) {
            seen.add(m.id);
            baseMovies.push(m);
          }
        }
      }
    }
    const top = baseMovies.slice(0, MOVIE_CAP);

    // 3. Details for each (credits for JSON-LD director/actor)
    const movies = await mapConcurrent(top, DETAIL_CONCURRENCY, (m) =>
      apiGet(
        fetchImpl,
        apiKey,
        `/movie/${m.id}`,
        { append_to_response: "credits" },
        retries,
      ),
    );

    const data = { generatedAt: new Date().toISOString(), lists, movies };
    mkdirSync(dirname(snapshotPath), { recursive: true });
    writeFileSync(snapshotPath, JSON.stringify(data));
    return data;
  } catch (err) {
    try {
      const snapshot = JSON.parse(readFileSync(snapshotPath, "utf8"));
      console.warn(
        `[prerender] TMDB fetch failed (${err.message}); using snapshot from ${snapshot.generatedAt}`,
      );
      return { ...snapshot, fromSnapshot: true };
    } catch {
      throw new Error(
        `TMDB fetch failed and no snapshot available: ${err.message}`,
      );
    }
  }
}
