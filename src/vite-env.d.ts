/// <reference types="vite-plugin-pwa/react" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TMDB_API_KEY: string;
  readonly VITE_OMDB_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Set by src/main.tsx right after the app bundle calls render(). The boot
// watchdog inline script in index.html polls this flag to detect a
// service-worker/cache combo that's serving a build whose JS never executes.
interface Window {
  __WMTW_MOUNTED?: boolean;
}
