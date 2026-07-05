// sitemap.xml + robots.txt generation.

function esc(s) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function buildSitemap(entries) {
  const urls = entries
    .map(
      (e) => `  <url>
    <loc>${esc(e.loc)}</loc>
    <lastmod>${e.lastmod}</lastmod>
  </url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

export function buildRobots(origin) {
  return `User-agent: *
Allow: /

Sitemap: ${origin}/sitemap.xml
`;
}
