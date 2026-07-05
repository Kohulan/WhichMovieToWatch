import { test } from "node:test";
import assert from "node:assert/strict";
import { buildSitemap, buildRobots } from "./sitemap.mjs";

test("buildSitemap emits a valid urlset", () => {
  const xml = buildSitemap([
    { loc: "https://whichmovietowatch.online/", lastmod: "2026-07-04" },
    { loc: "https://whichmovietowatch.online/trending", lastmod: "2026-07-04" },
  ]);
  assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
  assert.ok(
    xml.includes(
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ),
  );
  assert.equal((xml.match(/<url>/g) ?? []).length, 2);
  assert.ok(
    xml.includes("<loc>https://whichmovietowatch.online/trending</loc>"),
  );
  assert.ok(xml.includes("<lastmod>2026-07-04</lastmod>"));
  assert.ok(xml.trimEnd().endsWith("</urlset>"));
});

test("buildSitemap escapes ampersands in URLs", () => {
  const xml = buildSitemap([
    { loc: "https://x.y/a?b=1&c=2", lastmod: "2026-01-01" },
  ]);
  assert.ok(xml.includes("a?b=1&amp;c=2"));
});

test("buildRobots allows all and points at the sitemap", () => {
  const txt = buildRobots("https://whichmovietowatch.online");
  assert.ok(txt.includes("User-agent: *"));
  assert.ok(txt.includes("Allow: /"));
  assert.ok(
    txt.includes("Sitemap: https://whichmovietowatch.online/sitemap.xml"),
  );
});
