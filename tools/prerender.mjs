#!/usr/bin/env node
// SSG-lite prerender: runs AFTER `vite build`, rewrites dist/index.html per
// route with real head tags + JSON-LD + crawler-visible content, and emits
// movie pages, sitemap.xml, and robots.txt. See
// docs/superpowers/specs/2026-07-04-seo-overhaul-design.md.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import content from "../src/seo/seo-content.json" with { type: "json" };
import { applyHead, injectRoot } from "./lib/html.mjs";
import { renderListBody, renderMovieBody } from "./lib/render.mjs";
import { movieSlug } from "./lib/slug.mjs";
import { buildSitemap, buildRobots } from "./lib/sitemap.mjs";
import {
  webSiteJsonLd,
  organizationJsonLd,
  itemListJsonLd,
  movieJsonLd,
  breadcrumbJsonLd,
} from "./lib/jsonld.mjs";
import { fetchAllData } from "./lib/tmdb-build.mjs";

const SITE = content.site;

function outFileFor(distDir, path) {
  if (path === "/") return join(distDir, "index.html");
  return join(distDir, `${path.slice(1)}.html`);
}

function jsonLdForRoute(route, movies, pageUrl) {
  const blocks = [];
  if (route.path === "/") {
    blocks.push(webSiteJsonLd(SITE), organizationJsonLd(SITE));
  } else {
    blocks.push(
      breadcrumbJsonLd(
        [
          { name: "Home", path: "/" },
          { name: route.h1, path: route.path },
        ],
        SITE.origin,
      ),
    );
  }
  if (movies?.length) {
    blocks.push(itemListJsonLd({ movies, pageUrl, origin: SITE.origin }));
  }
  return blocks;
}

export async function prerender({ distDir = "dist", data } = {}) {
  const template = readFileSync(join(distDir, "index.html"), "utf8");
  if (!data) {
    const apiKey = process.env.VITE_TMDB_API_KEY;
    if (!apiKey) throw new Error("VITE_TMDB_API_KEY is required");
    data = await fetchAllData({ apiKey });
  }

  const today = new Date().toISOString().slice(0, 10);
  const sitemapEntries = [];
  let routePages = 0;
  let moviePages = 0;

  // 1. seo-content routes
  for (const route of content.routes) {
    const canonical = SITE.origin + (route.path === "/" ? "/" : route.path);
    const movies = route.list ? (data.lists[route.path] ?? []) : [];
    let html = applyHead(template, {
      title: route.title,
      description: route.description,
      canonical,
      ogImage: SITE.defaultOgImage,
      ogType: "website",
      jsonLd: jsonLdForRoute(route, movies, canonical),
    });
    html = injectRoot(
      html,
      renderListBody({ entry: route, movies, site: SITE }),
    );
    const file = outFileFor(distDir, route.path);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, html);
    routePages++;
    sitemapEntries.push({
      loc: canonical,
      lastmod: route.changes === "daily" ? today : (route.lastmod ?? today),
    });
  }

  // 2. movie pages
  for (const movie of data.movies) {
    const slug = movieSlug(movie);
    const canonical = `${SITE.origin}/movie/${slug}`;
    const year = (movie.release_date || "").slice(0, 4);
    const description = `${movie.title}${year ? ` (${year})` : ""} — ratings, trailer, and where to stream it. ${(movie.overview ?? "").slice(0, 90)}…`;
    let html = applyHead(template, {
      title: `${movie.title}${year ? ` (${year})` : ""} — Where to Stream & Ratings`,
      description,
      canonical,
      ogImage: movie.poster_path
        ? `https://image.tmdb.org/t/p/w1280${movie.poster_path}`
        : SITE.defaultOgImage,
      ogType: "video.movie",
      jsonLd: [
        movieJsonLd(movie, SITE.origin),
        breadcrumbJsonLd(
          [
            { name: "Home", path: "/" },
            { name: "Movies", path: "/trending" },
            { name: movie.title, path: `/movie/${slug}` },
          ],
          SITE.origin,
        ),
      ],
    });
    html = injectRoot(html, renderMovieBody({ movie, site: SITE }));
    const file = join(distDir, "movie", `${slug}.html`);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, html);
    moviePages++;
    sitemapEntries.push({ loc: canonical, lastmod: today });
  }

  // 3. sitemap + robots
  writeFileSync(join(distDir, "sitemap.xml"), buildSitemap(sitemapEntries));
  writeFileSync(join(distDir, "robots.txt"), buildRobots(SITE.origin));

  const summary = {
    routePages,
    moviePages,
    sitemapUrls: sitemapEntries.length,
  };
  console.log(
    `[prerender] ${routePages} route pages, ${moviePages} movie pages, ${summary.sitemapUrls} sitemap URLs`,
  );
  return summary;
}

// CLI entry
if (import.meta.url === `file://${process.argv[1]}`) {
  prerender({ distDir: process.argv[2] ?? "dist" }).catch((err) => {
    console.error("[prerender] FAILED:", err);
    process.exit(1);
  });
}
