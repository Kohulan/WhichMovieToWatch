import { test } from "node:test";
import assert from "node:assert/strict";
import content from "../../src/seo/seo-content.json" with { type: "json" };

const { site, routes } = content;

test("site config uses the apex origin", () => {
  assert.equal(site.origin, "https://whichmovietowatch.online");
  assert.ok(site.name.length > 0);
  assert.ok(site.defaultOgImage.startsWith(site.origin));
});

test("route paths are unique and well-formed", () => {
  const paths = routes.map((r) => r.path);
  assert.equal(new Set(paths).size, paths.length, "duplicate path");
  for (const p of paths) {
    assert.ok(p.startsWith("/"), `${p} must start with /`);
    assert.ok(!p.endsWith("/") || p === "/", `${p} must not end with /`);
  }
});

test("all 19 TMDB genres and 8 providers are present", () => {
  const genres = routes.filter((r) => r.list?.kind === "genre");
  const providers = routes.filter((r) => r.list?.kind === "provider");
  assert.equal(genres.length, 19);
  assert.equal(providers.length, 8);
  const genreIds = new Set(genres.map((r) => r.list.genreId));
  for (const id of [
    28, 12, 16, 35, 80, 99, 18, 10751, 14, 36, 27, 10402, 9648, 10749, 878,
    10770, 53, 10752, 37,
  ]) {
    assert.ok(genreIds.has(id), `missing genre id ${id}`);
  }
  const providerIds = new Set(providers.map((r) => r.list.providerId));
  for (const id of [8, 337, 9, 350, 531, 1899, 15, 386]) {
    assert.ok(providerIds.has(id), `missing provider id ${id}`);
  }
});

test("titles and descriptions are SERP-sized", () => {
  for (const r of routes) {
    assert.ok(
      r.title.length >= 15 && r.title.length <= 65,
      `${r.path} title length ${r.title.length}`,
    );
    assert.ok(
      r.description.length >= 70 && r.description.length <= 160,
      `${r.path} description length ${r.description.length}`,
    );
    assert.ok(r.h1.length > 0, `${r.path} missing h1`);
  }
});

test("every intro is authored (100-200 words, no placeholders)", () => {
  for (const r of routes) {
    assert.ok(!r.intro.includes("__AUTHOR__"), `${r.path} intro not authored`);
    const words = r.intro.trim().split(/\s+/).length;
    assert.ok(words >= 60 && words <= 220, `${r.path} intro is ${words} words`);
  }
});

test("intros are unique (no copy-paste)", () => {
  const intros = routes.map((r) => r.intro);
  assert.equal(new Set(intros).size, intros.length);
});

test("static routes carry a fixed lastmod date", () => {
  for (const r of routes.filter((x) => x.changes === "static")) {
    assert.match(
      r.lastmod ?? "",
      /^\d{4}-\d{2}-\d{2}$/,
      `${r.path} needs lastmod`,
    );
  }
});
