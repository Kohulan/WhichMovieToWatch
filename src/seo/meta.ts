// Typed accessor for the SEO content config.
// The JSON is the single source of truth shared with tools/prerender.mjs.

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

export const SITE = content.site as {
  origin: string;
  name: string;
  defaultOgImage: string;
};

const byPath = new Map<string, RouteMeta>(
  (content.routes as RouteMeta[]).map((r) => [r.path, r]),
);

export function getRouteMeta(path: string): RouteMeta | null {
  return byPath.get(path) ?? null;
}

export function getAllRouteMeta(): RouteMeta[] {
  return content.routes as RouteMeta[];
}
