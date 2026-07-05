/**
 * Seo — per-route head tags via React 19 native metadata hoisting.
 * <title>, <meta>, and <link> are hoisted into <head> automatically.
 * JSON-LD <script> blocks are valid anywhere in the document per Google.
 *
 * Crawlers see these on prerendered pages (tools/prerender.mjs bakes the
 * same values into static HTML); this component keeps the head correct
 * during client-side navigation.
 */
import { SITE } from "@/seo/meta";

interface SeoProps {
  title: string;
  description: string;
  /** Path starting with "/" — canonical is SITE.origin + path. */
  path: string;
  ogImage?: string;
  ogType?: "website" | "video.movie";
  jsonLd?: object[];
}

export function Seo({
  title,
  description,
  path,
  ogImage = SITE.defaultOgImage,
  ogType = "website",
  jsonLd = [],
}: SeoProps) {
  const url = SITE.origin + (path === "/" ? "/" : path);
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE.name} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      {jsonLd.map((ld, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />
      ))}
    </>
  );
}

/** Convenience: build <Seo> props straight from a seo-content.json entry. */
export function routeSeoProps(meta: {
  title: string;
  description: string;
  path: string;
}) {
  return {
    title: meta.title,
    description: meta.description,
    path: meta.path,
  };
}
