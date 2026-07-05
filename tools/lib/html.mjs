// HTML string transforms for the prerender pipeline. The built dist/index.html
// is the template; these functions rewrite head tags and inject static body
// content without any HTML parser dependency.

export function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function setMeta(html, attr, name, value) {
  const re = new RegExp(`(<meta ${attr}="${name}" content=")[^"]*(")`);
  return html.replace(re, (_m, p1, p2) => p1 + escapeHtml(value) + p2);
}

/**
 * Rewrite the template's head for one page. Assumes the tag shapes present in
 * this repo's index.html (meta name=…/property=… with content=…).
 */
export function applyHead(
  html,
  { title, description, canonical, ogImage, ogType = "website", jsonLd = [] },
) {
  let out = html.replace(
    /<title>[^<]*<\/title>/,
    () => `<title>${escapeHtml(title)}</title>`,
  );
  out = setMeta(out, "name", "title", title);
  out = setMeta(out, "name", "description", description);
  out = setMeta(out, "property", "og:title", title);
  out = setMeta(out, "property", "og:description", description);
  out = setMeta(out, "property", "og:url", canonical);
  out = setMeta(out, "property", "og:type", ogType);
  out = setMeta(out, "name", "twitter:title", title);
  out = setMeta(out, "name", "twitter:description", description);
  if (ogImage) {
    out = setMeta(out, "property", "og:image", ogImage);
    out = setMeta(out, "name", "twitter:image", ogImage);
  }
  const extra = [
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
    ...jsonLd.map(
      (ld) =>
        `<script type="application/ld+json">${JSON.stringify(ld).replaceAll("</", "<\\/")}</script>`,
    ),
  ].join("\n");
  return out.replace("</head>", () => `${extra}\n</head>`);
}

const STATIC_CSS = `
#root .seo-static{max-width:72rem;margin:0 auto;padding:4rem 1rem 6rem;font-family:system-ui,sans-serif;color:oklch(0.95 0.01 60);line-height:1.6}
.seo-static a{color:oklch(0.7 0.22 38);text-decoration:none}
.seo-static h1{font-size:1.6rem;margin:1rem 0}
.seo-static p.intro{max-width:48rem;color:oklch(0.72 0.015 60)}
.seo-static nav ul{list-style:none;padding:0;display:flex;flex-wrap:wrap;gap:.75rem}
.seo-static .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:1rem;padding:0;list-style:none}
.seo-static .grid img{width:100%;border-radius:12px;aspect-ratio:2/3;object-fit:cover;background:oklch(0.17 0.005 60)}
.seo-static .grid .t{font-size:.85rem;margin:.4rem 0 0}
.seo-static .grid .y{font-size:.75rem;color:oklch(0.72 0.015 60)}
body{background:oklch(0.13 0.005 60)}
`;

export function injectRoot(html, bodyHtml) {
  return html
    .replace(
      "</head>",
      () => `<style id="seo-static">${STATIC_CSS}</style>\n</head>`,
    )
    .replace('<div id="root"></div>', () => `<div id="root">${bodyHtml}</div>`);
}
