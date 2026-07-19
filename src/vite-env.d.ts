/// <reference types="vite-plugin-pwa/react" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TMDB_API_KEY: string;
  readonly VITE_OMDB_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Provided by the seoEagerContent plugin in vite.config.ts: the site block
// and the "/" route from src/seo/seo-content.json, extracted at build time
// so the eager entry graph doesn't inline the whole routes array.
declare module "virtual:seo-eager" {
  export const site: {
    origin: string;
    name: string;
    defaultOgImage: string;
  };
  export const homeRoute: import("./seo/meta").RouteMeta;
}

// Set by src/main.tsx right after the app bundle calls render(). The boot
// watchdog inline script in index.html polls this flag to detect a
// service-worker/cache combo that's serving a build whose JS never executes.
interface Window {
  __WMTW_MOUNTED?: boolean;
}
