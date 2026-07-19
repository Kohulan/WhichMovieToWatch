// Eager-safe SEO constants for the always-eager entry graph (HomePage, <Seo>).
//
// Values come from `virtual:seo-eager` (see seoEagerContent in vite.config.ts),
// which extracts ONLY the site block and the "/" route from seo-content.json
// at build time — the JSON stays the single source of truth, but the other
// ~34 routes' titles/descriptions/intros no longer ship in the eager index
// chunk. Lazy pages keep using getRouteMeta()/getAllRouteMeta() from ./meta,
// which imports the full JSON into their own lazy chunks.
import { site, homeRoute } from "virtual:seo-eager";
import type { RouteMeta } from "./meta";

export const SITE = site;
export const HOME_META: RouteMeta = homeRoute;
