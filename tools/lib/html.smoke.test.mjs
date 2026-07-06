// Smoke test that exercises applyHead() against the REAL built dist/index.html
// (as produced by `npm run build`), not a synthetic fixture. html.test.mjs
// already covers applyHead's string-transform logic against a hand-written
// template; this test guards against tag-shape drift — if a future edit to
// the source index.html changes a meta tag's attribute order/quoting such
// that setMeta's regex no longer matches, it would silently no-op instead of
// throwing, and the synthetic-fixture test would never notice. Skips (rather
// than fails) when dist/ hasn't been built yet, since dist/ is gitignored
// build output.

import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { applyHead } from "./html.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_INDEX = join(__dirname, "..", "..", "dist", "index.html");

test("applyHead against the real built dist/index.html", (t) => {
  if (!existsSync(DIST_INDEX)) {
    t.skip("dist/index.html not found — run `npm run build` first");
    return;
  }

  const template = readFileSync(DIST_INDEX, "utf8");
  const title = "Smoke Test Title";
  const description = "Smoke test description for real-build verification.";
  const ogImage = "https://whichmovietowatch.online/smoke-test.png";
  const canonical = "https://whichmovietowatch.online/smoke-test";
  const out = applyHead(template, {
    title,
    description,
    canonical,
    ogImage,
    jsonLd: [{ "@type": "WebSite", name: "Smoke Test" }],
  });

  // Real index.html wraps long meta tags across multiple lines (one
  // attribute per line), unlike the single-line synthetic fixture used in
  // html.test.mjs. Assertions here extract each tag as a whole (`[^>]*`
  // spans newlines) rather than assuming a collapsed one-line shape, so this
  // test actually exercises that tag-shape drift.
  function metaContent(attr, name) {
    const re = new RegExp(`<meta\\b[^>]*\\b${attr}="${name}"[^>]*>`);
    const tag = out.match(re)?.[0];
    return tag?.match(/content="([^"]*)"/)?.[1] ?? null;
  }

  assert.ok(out.includes(`<title>${title}</title>`), "<title> was rewritten");
  assert.equal(
    metaContent("name", "description"),
    description,
    "meta description was rewritten",
  );
  assert.equal(
    metaContent("property", "og:title"),
    title,
    "og:title was rewritten",
  );
  assert.equal(
    metaContent("property", "og:description"),
    description,
    "og:description was rewritten",
  );
  assert.equal(
    metaContent("property", "og:image"),
    ogImage,
    "og:image was rewritten",
  );
  assert.equal(
    metaContent("name", "twitter:title"),
    title,
    "twitter:title was rewritten",
  );
  assert.equal(
    metaContent("name", "twitter:description"),
    description,
    "twitter:description was rewritten",
  );
  assert.ok(
    out.includes(`<link rel="canonical" href="${canonical}" />`),
    "canonical link was inserted",
  );
  assert.ok(
    out.includes('"@type":"WebSite"') && out.includes('"name":"Smoke Test"'),
    "JSON-LD block was inserted",
  );
  assert.ok(
    !out.includes("Which Movie To Watch - Find Your Next Movie"),
    "original title/description text was fully replaced",
  );
});
