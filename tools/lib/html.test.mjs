import { test } from "node:test";
import assert from "node:assert/strict";
import { escapeHtml, applyHead, injectRoot } from "./html.mjs";

const TEMPLATE = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8" />
<meta name="title" content="Old Title" />
<meta name="description" content="Old description." />
<meta property="og:title" content="Old Title" />
<meta property="og:description" content="Old description." />
<meta property="og:image" content="https://example.com/old.png" />
<meta property="og:url" content="https://example.com/" />
<meta property="og:type" content="website" />
<meta name="twitter:title" content="Old Title" />
<meta name="twitter:description" content="Old description." />
<meta name="twitter:image" content="https://example.com/old.png" />
<title>Old Title</title>
</head><body><div id="root"></div><script src="/app.js"></script></body></html>`;

test("escapeHtml", () => {
  assert.equal(
    escapeHtml(`<a href="x">&'`),
    "&lt;a href=&quot;x&quot;&gt;&amp;&#39;",
  );
});

test("applyHead swaps title/description and inserts canonical + JSON-LD", () => {
  const out = applyHead(TEMPLATE, {
    title: 'Trending "Now"',
    description: "Fresh & new.",
    canonical: "https://whichmovietowatch.online/trending",
    ogImage: "https://whichmovietowatch.online/img.png",
    ogType: "website",
    jsonLd: [{ "@type": "ItemList" }],
  });
  assert.ok(out.includes("<title>Trending &quot;Now&quot;</title>"));
  assert.ok(
    out.includes('<meta name="description" content="Fresh &amp; new." />'),
  );
  assert.ok(
    out.includes(
      '<link rel="canonical" href="https://whichmovietowatch.online/trending" />',
    ),
  );
  assert.ok(
    out.includes(
      'property="og:url" content="https://whichmovietowatch.online/trending"',
    ),
  );
  assert.ok(out.includes('"@type":"ItemList"'));
  assert.ok(!out.includes("Old Title"));
  assert.ok(!out.includes("Old description."));
});

test("injectRoot fills the root div and adds the static stylesheet", () => {
  const out = injectRoot(TEMPLATE, "<h1>Hello</h1>");
  assert.ok(out.includes('<div id="root"><h1>Hello</h1></div>'));
  assert.ok(out.includes('<style id="seo-static">'));
  assert.ok(out.includes("<script"), "app script must survive");
});
