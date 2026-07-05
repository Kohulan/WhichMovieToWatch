import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  existsSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { prerender } from "./prerender.mjs";

const TEMPLATE = `<!DOCTYPE html><html lang="en"><head>
<meta name="title" content="T" /><meta name="description" content="D" />
<meta property="og:title" content="T" /><meta property="og:description" content="D" />
<meta property="og:image" content="I" /><meta property="og:url" content="U" />
<meta property="og:type" content="website" />
<meta name="twitter:title" content="T" /><meta name="twitter:description" content="D" />
<meta name="twitter:image" content="I" />
<title>T</title></head><body><div id="root"></div></body></html>`;

function fakeMovie(id, title) {
  return {
    id,
    title,
    poster_path: `/p${id}.jpg`,
    release_date: "2024-05-01",
    vote_average: 7.7,
    vote_count: 500,
    overview: "Overview.",
    runtime: 110,
    genres: [{ id: 28, name: "Action" }],
    credits: { cast: [], crew: [] },
  };
}

test("prerender writes route pages, movie pages, sitemap, robots", async () => {
  const dist = mkdtempSync(join(tmpdir(), "dist-"));
  writeFileSync(join(dist, "index.html"), TEMPLATE);
  const data = {
    generatedAt: new Date().toISOString(),
    lists: Object.fromEntries(
      (
        await import("../src/seo/seo-content.json", { with: { type: "json" } })
      ).default.routes
        .filter((r) => r.list)
        .map((r) => [r.path, [fakeMovie(1, "Alpha"), fakeMovie(2, "Beta")]]),
    ),
    movies: [fakeMovie(1, "Alpha"), fakeMovie(2, "Beta")],
  };
  const summary = await prerender({ distDir: dist, data });

  // home transformed in place
  const home = readFileSync(join(dist, "index.html"), "utf8");
  assert.ok(home.includes("Find What to Watch Tonight"));
  assert.ok(
    home.includes('rel="canonical" href="https://whichmovietowatch.online/"'),
  );
  assert.ok(home.includes('"@type":"WebSite"'));
  assert.ok(home.includes('class="seo-static"'));

  // hub page
  const trending = readFileSync(join(dist, "trending.html"), "utf8");
  assert.ok(trending.includes("Trending Movies This Week"));
  assert.ok(trending.includes('"@type":"ItemList"'));
  assert.ok(trending.includes('href="/movie/alpha-1"'));

  // nested route path
  assert.ok(existsSync(join(dist, "movies/genre/action.html")));
  // movie page
  const alpha = readFileSync(join(dist, "movie/alpha-1.html"), "utf8");
  assert.ok(alpha.includes("<h1>Alpha (2024)</h1>"));
  assert.ok(alpha.includes('"@type":"Movie"'));
  assert.ok(alpha.includes('property="og:type" content="video.movie"'));

  // sitemap + robots
  const sitemap = readFileSync(join(dist, "sitemap.xml"), "utf8");
  assert.ok(
    sitemap.includes(
      "<loc>https://whichmovietowatch.online/movie/alpha-1</loc>",
    ),
  );
  assert.ok(
    sitemap.includes("<loc>https://whichmovietowatch.online/trending</loc>"),
  );
  assert.ok(
    readFileSync(join(dist, "robots.txt"), "utf8").includes("Sitemap:"),
  );

  assert.equal(summary.routePages, 35);
  assert.equal(summary.moviePages, 2);
});
