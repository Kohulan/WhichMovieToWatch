import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fetchAllData, discoverParamsFor } from "./tmdb-build.mjs";

function fakeMovie(id, title = `Movie ${id}`) {
  return {
    id,
    title,
    poster_path: `/p${id}.jpg`,
    release_date: "2024-01-01",
    vote_average: 7.5,
    vote_count: 1000,
    overview: "o",
    genre_ids: [28],
  };
}

/** fetch stub: /discover & /movie/popular & /movie/now_playing return pages of fake movies; /movie/{id} returns details. */
function stubFetch() {
  const calls = [];
  return {
    calls,
    fetch: async (url) => {
      calls.push(String(url));
      const u = new URL(url);
      let body;
      if (/\/movie\/\d+$/.test(u.pathname)) {
        const id = Number(u.pathname.split("/").pop());
        body = {
          ...fakeMovie(id),
          runtime: 120,
          genres: [{ id: 28, name: "Action" }],
          credits: { cast: [], crew: [] },
        };
      } else {
        const page = Number(u.searchParams.get("page") ?? 1);
        const base = page * 100;
        body = {
          page,
          total_pages: 10,
          total_results: 200,
          results: Array.from({ length: 20 }, (_, i) => fakeMovie(base + i)),
        };
      }
      return { ok: true, status: 200, json: async () => body };
    },
  };
}

test("discoverParamsFor mirrors the app's seo-lists params", () => {
  assert.deepEqual(discoverParamsFor({ kind: "tonight" }), {
    sort_by: "popularity.desc",
    "vote_average.gte": 7,
    "vote_count.gte": 500,
    include_adult: false,
    page: 1,
  });
  assert.deepEqual(discoverParamsFor({ kind: "genre", genreId: 28 }), {
    with_genres: 28,
    sort_by: "popularity.desc",
    "vote_count.gte": 200,
    include_adult: false,
    page: 1,
  });
  assert.deepEqual(
    discoverParamsFor({ kind: "provider", providerId: 8, region: "US" }),
    {
      with_watch_providers: 8,
      watch_region: "US",
      with_watch_monetization_types: "flatrate",
      sort_by: "popularity.desc",
      "vote_count.gte": 100,
      include_adult: false,
      page: 1,
    },
  );
});

test("fetchAllData returns lists for every list route and ~250 movie details, and writes the snapshot", async () => {
  const dir = mkdtempSync(join(tmpdir(), "tmdb-build-"));
  const snapshotPath = join(dir, "snap.json");
  const { fetch } = stubFetch();
  const data = await fetchAllData({
    apiKey: "k",
    fetchImpl: fetch,
    snapshotPath,
  });
  assert.ok(Object.keys(data.lists).length >= 29, "one list per list-route");
  for (const movies of Object.values(data.lists)) {
    assert.ok(movies.length > 0 && movies.length <= 20);
  }
  assert.ok(data.movies.length > 0 && data.movies.length <= 250);
  assert.ok(data.movies[0].runtime, "details fetched");
  assert.ok(existsSync(snapshotPath), "snapshot written");
});

test("fetchAllData falls back to the snapshot when fetch fails", async () => {
  const dir = mkdtempSync(join(tmpdir(), "tmdb-build-"));
  const snapshotPath = join(dir, "snap.json");
  const canned = {
    generatedAt: "2026-07-01T00:00:00.000Z",
    lists: { "/trending": [fakeMovie(1)] },
    movies: [{ ...fakeMovie(1), runtime: 100 }],
  };
  writeFileSync(snapshotPath, JSON.stringify(canned));
  const failingFetch = async () => {
    throw new TypeError("network down");
  };
  const data = await fetchAllData({
    apiKey: "k",
    fetchImpl: failingFetch,
    snapshotPath,
    retries: 1,
  });
  assert.equal(data.movies[0].id, 1);
  assert.equal(data.fromSnapshot, true);
});

test("fetchAllData throws when fetch fails and no snapshot exists", async () => {
  const dir = mkdtempSync(join(tmpdir(), "tmdb-build-"));
  await assert.rejects(
    fetchAllData({
      apiKey: "k",
      fetchImpl: async () => {
        throw new TypeError("down");
      },
      snapshotPath: join(dir, "none.json"),
      retries: 1,
    }),
    /no snapshot/i,
  );
});
