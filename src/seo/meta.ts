// Typed accessor for the SEO content config.
// The JSON is the single source of truth shared with tools/prerender.mjs.
//
// NOTE: this module inlines the ENTIRE seo-content.json into whatever chunk
// imports it — only lazy pages may import it. Eager modules (HomePage, Seo)
// must use ./site instead, which carries just the site block + home route.

import content from "./seo-content.json";

export interface RouteMeta {
  path: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  changes: "daily" | "static";
  lastmod?: string;
  list:
    | null
    | { kind: "tonight" }
    | { kind: "trending" }
    | { kind: "genre"; genreId: number }
    | { kind: "provider"; providerId: number; region: string };
}

// SITE lives in ./site (fed by the eager-safe virtual module); re-exported
// here so lazy pages can keep importing everything from one place.
export { SITE } from "./site";

const byPath = new Map<string, RouteMeta>(
  (content.routes as RouteMeta[]).map((r) => [r.path, r]),
);

export function getRouteMeta(path: string): RouteMeta | null {
  return byPath.get(path) ?? null;
}

export function getAllRouteMeta(): RouteMeta[] {
  return content.routes as RouteMeta[];
}
