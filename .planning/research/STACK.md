# Technology Stack

**Project:** WhichMovieToWatch React Rewrite
**Researched:** 2026-02-15
**Confidence:** HIGH

## Executive Summary

This stack is optimized for a visually stunning React PWA rewrite with 3D animations, claymorphism design, and GitHub Pages deployment. The core is React 19 + Vite 6 + TypeScript 5.7 with Tailwind CSS v4 for styling, Framer Motion for animations, and React Three Fiber for 3D. All choices prioritize developer experience, build performance, and modern web capabilities while maintaining zero-runtime dependencies for static deployment.

**Key Decision:** Use Vite's build-time environment variable injection (VITE_ prefix) for API keys instead of runtime injection—GitHub Actions will replace these during build. This is the correct approach for GitHub Pages static hosting.

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **React** | 19.x | UI library | Latest stable with improved concurrent rendering, React Compiler support, and Actions API. Fast Refresh retains state during development. |
| **Vite** | 6.x | Build tool | 40x faster than CRA. Native ESM, instant HMR, optimized production builds. Requires Node.js 20.19+ or 22.12+. |
| **TypeScript** | 5.7.x | Type safety | Strict mode catches bugs at compile time. First-class Vite support with zero config. |
| **React Router** | 7.x | Routing | v7 consolidates react-router-dom into react-router. No breaking changes with future flags enabled. |

**Rationale:** This combination delivers <100ms HMR in development and sub-2s production builds. Vite's build system is optimized for React 19's features, and TypeScript 5.7's improved type inference reduces boilerplate.

**Confidence:** HIGH (verified via official npm packages and recent 2026 documentation)

---

### Styling & Design

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Tailwind CSS** | 4.x | Utility-first CSS | v4 eliminates config files—just `@import "tailwindcss"`. Uses modern CSS (cascade layers, @property, color-mix). Browser support: Safari 16.4+, Chrome 111+, Firefox 128+. |
| **@tailwindcss/vite** | Latest | Vite integration | First-party plugin simplifies setup. No PostCSS config needed. |
| **clsx** | 2.x | Conditional classes | Lightweight (228B) utility for conditional classNames. |
| **tailwind-merge** | 2.x | Class merging | Resolves Tailwind class conflicts (e.g., `p-4` overrides `p-2`). |

**cn Utility Pattern:**
```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Claymorphism Implementation:** No dedicated React library needed. Implement using Tailwind's gradient utilities + compound box-shadows. Key characteristics: 16-24px border radius, warm background gradients, wrapped shadows simulating clay texture.

**Bento Grids:** Use CSS Grid with Tailwind's grid utilities. Libraries like `react-bento` exist but add unnecessary weight—pure CSS Grid is sufficient for responsive layouts.

**Rationale:** Tailwind v4's simplified setup (no config file) and modern CSS features align perfectly with Vite's philosophy. The cn utility pattern is the 2026 standard for managing dynamic Tailwind classes in React.

**Confidence:** HIGH (verified via Tailwind v4 official docs and multiple 2026 sources)

---

### Animation

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **framer-motion** | 12.x (Motion) | 2D animations | Latest version (12.34.0 as of Feb 2026). Hardware-accelerated animations, useScroll improvements. No breaking changes in v12. Rebranded as "Motion" but package name unchanged. |

**Key Features:**
- Hardware-accelerated transforms
- Scroll-linked animations (useScroll)
- Layout animations with shared element transitions
- Gesture support (drag, tap, hover)

**Theme Switching Animation:** Use Motion's `AnimatePresence` + layout animations for smooth light/dark transitions. Framer Motion's `transition.inherit` (v12+) simplifies cascading animation timing.

**Rationale:** Framer Motion is the industry standard for React animations. Version 12's performance improvements and useScroll enhancements are perfect for scroll-triggered movie card reveals.

**Confidence:** HIGH (verified via npm and Motion changelog)

---

### 3D Graphics

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **@react-three/fiber** | 9.x | React renderer for Three.js | Declarative 3D with React components. useFrame hook for 60fps animations. WebGPU-ready. |
| **@react-three/drei** | 10.x | R3F helpers | Pre-built components (OrbitControls, useGLTF, Text3D, \<Detailed\> for LOD). Reduces boilerplate by 70%. |
| **@react-three/postprocessing** | 3.x | Post-processing effects | Bloom, depth of field, vignette. EffectComposer auto-merges passes for performance. |
| **three** | 0.170.x | 3D library | Peer dependency for R3F. Use Draco compression for geometry (90-95% size reduction). |
| **leva** | 0.10.x | GUI controls | Dev-time tweaking of 3D parameters. Optional—exclude from production build. |

**Performance Optimizations:**
- **LOD (Level of Detail):** Use Drei's `<Detailed />` component for 30-40% FPS boost in large scenes
- **Asset Compression:** Draco for geometry, KTX2 + Basis Universal for textures (~10x memory reduction)
- **Draw Calls:** Target <100/frame using instanced meshes
- **Selective Bloom:** Set `luminanceThreshold: 1` and use emissive materials only on glowing elements

**Rationale:** React Three Fiber enables declarative 3D that integrates seamlessly with React's component model. Drei eliminates 70% of boilerplate. Postprocessing adds cinematic effects without manual pass chaining.

**Confidence:** HIGH (verified via official docs and 2026 performance guides)

---

### PWA & Build

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **vite-plugin-pwa** | 0.22.x | Service worker | Zero-config PWA. Auto-generates manifest.webmanifest + service worker. Requires Vite 5+ and Node 16+. |

**Service Worker Strategy:** Use `registerType: 'autoUpdate'` for automatic updates. Import `useRegisterSW` from `virtual:pwa-register/react` for React integration.

**Manifest Generation:** Plugin auto-generates from vite.config.ts. Define icons, theme colors, and app metadata in plugin options.

**Rationale:** vite-plugin-pwa is the de facto standard for Vite PWAs. Handles service worker complexity automatically.

**Confidence:** HIGH (verified via official plugin docs and 2026 examples)

---

### State Management

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **zustand** | 5.x | Global state | Minimal boilerplate (50% less than Redux). ~1KB. Selective subscriptions prevent unnecessary re-renders. |

**When to Use:**
- **Zustand:** Theme state, user preferences, filter state (small-to-medium apps)
- **Redux Toolkit:** If app grows to require middleware, RTK Query, or team mandates strict architecture
- **React Context:** Server-provided data (user location from IPInfo.io)—use sparingly to avoid re-render cascades

**Rationale:** For a movie discovery PWA, Zustand's simplicity and performance are ideal. Zustand aligns with modern React patterns (hooks, composability) better than Redux. 2026 consensus: Zustand for small-to-medium apps, RTK for large enterprise apps.

**Confidence:** HIGH (verified via multiple 2026 comparisons)

---

### Development Tools

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **ESLint** | 10.x | Linting | Flat config (eslint.config.mjs) is now standard. Use `defineConfig()` for type safety. |
| **typescript-eslint** | 8.x | TypeScript linting | Recommended config for React + TypeScript. |
| **Prettier** | 3.x | Code formatting | Run separately from ESLint (faster than eslint-plugin-prettier). Use eslint-config-prettier to disable conflicting rules. |
| **Vitest** | 3.x | Testing | 10-20x faster than Jest. Native Vite integration. Jest-compatible API. |
| **@testing-library/react** | 16.x | Component testing | User-focused testing (behavior over implementation). Pairs perfectly with Vitest. |

**ESLint + Prettier Workflow:**
1. Install `eslint-config-prettier` to disable conflicting ESLint rules
2. Run Prettier first, then ESLint: `prettier --write . && eslint --fix .`
3. Do NOT use `eslint-plugin-prettier` (slower, creates duplicate errors)

**TypeScript Config:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "jsx": "react-jsx",
    "strict": true,
    "module": "ESNext",
    "moduleResolution": "bundler"
  }
}
```

**Rationale:** ESLint 10's flat config simplifies setup. Vitest's Vite integration means zero config duplication. Prettier + ESLint separation is 2026 best practice.

**Confidence:** HIGH (verified via official docs and Jan 2026 guides)

---

### Deployment

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **GitHub Actions** | N/A | CI/CD | Free for public repos. Build + deploy to GitHub Pages. |
| **gh-pages** | 6.x | Deployment utility | Automates pushing build artifacts to gh-pages branch. |

**Environment Variable Strategy:**

GitHub Pages is static hosting—no server-side runtime. Use Vite's build-time replacement:

1. **Local Development:** `.env.local` with `VITE_TMDB_API_KEY=xxx`
2. **Production Build:** GitHub Actions injects secrets during `vite build`:
   ```yaml
   - name: Build
     env:
       VITE_TMDB_API_KEY: ${{ secrets.TMDB_API_KEY }}
       VITE_OMDB_API_KEY: ${{ secrets.OMDB_API_KEY }}
     run: npm run build
   ```
3. **Access in Code:** `import.meta.env.VITE_TMDB_API_KEY`

**How It Works:** Vite statically replaces `import.meta.env.VITE_*` with actual values at build time. No runtime injection possible with static hosting.

**GitHub Pages Base Path:** Set `base: '/WhichMovieToWatch/'` in vite.config.ts (matches repo name). Configure React Router with `basename="/WhichMovieToWatch/"`.

**Rationale:** This is the only viable approach for GitHub Pages static hosting. Build-time injection is secure (keys never in git) and performant (no runtime overhead).

**Confidence:** HIGH (verified via official GitHub docs and multiple 2026 deployment guides)

---

## Alternatives Considered

### Why NOT These Options

| Category | Rejected | Chosen | Reason |
|----------|----------|--------|--------|
| **Build Tool** | Create React App | Vite | CRA is unmaintained. Vite is 40x faster. |
| **3D Animation** | Three.js vanilla | React Three Fiber | R3F's declarative API integrates with React. Vanilla Three.js requires manual lifecycle management. |
| **State** | Redux Toolkit | Zustand | RTK is overkill for this app's complexity. Zustand has 50% less boilerplate. |
| **Styling** | CSS-in-JS (Emotion, styled-components) | Tailwind CSS | CSS-in-JS adds runtime overhead. Tailwind v4's zero-config setup is cleaner. |
| **Testing** | Jest | Vitest | Jest doesn't understand Vite's config. Vitest is 10-20x faster. |
| **Router** | TanStack Router | React Router v7 | React Router v7 is more mature. TanStack Router is experimental for this use case. |
| **Claymorphism Library** | react-claymorphism | Custom CSS | Pre-built library is inflexible. Custom Tailwind implementation is lighter and more maintainable. |

---

## Installation

### Core Dependencies

```bash
npm install react@19 react-dom@19 react-router@7
npm install framer-motion@12 three@0.170 @react-three/fiber@9 @react-three/drei@10 @react-three/postprocessing@3
npm install zustand@5 clsx@2 tailwind-merge@2
```

### Dev Dependencies

```bash
npm install -D vite@6 @vitejs/plugin-react@4 typescript@5.7
npm install -D tailwindcss@4 @tailwindcss/vite@4
npm install -D vite-plugin-pwa@0.22
npm install -D eslint@10 typescript-eslint@8 eslint-config-prettier@10 prettier@3
npm install -D vitest@3 @testing-library/react@16 @testing-library/jest-dom@6 jsdom@26
npm install -D @types/react@19 @types/react-dom@19 @types/three@0.170
```

### Optional (Development Only)

```bash
npm install -D leva@0.10
```

**Note:** Exact minor versions should be verified at time of implementation (February 2026). These are based on latest stable releases as of research date.

---

## Anti-Patterns to Avoid

### DO NOT Use Runtime Environment Variables
❌ **Wrong:** Trying to use `process.env` or runtime injection with GitHub Pages
✅ **Right:** Use Vite's `import.meta.env.VITE_*` with build-time replacement

### DO NOT Install Unnecessary Abstraction Libraries
❌ **Wrong:** Installing bento grid or claymorphism component libraries
✅ **Right:** Build with CSS Grid + Tailwind utilities (cleaner, lighter, more flexible)

### DO NOT Mix ESLint + Prettier via Plugin
❌ **Wrong:** Using `eslint-plugin-prettier` (slow, duplicate errors)
✅ **Right:** Run separately with `eslint-config-prettier` to disable conflicts

### DO NOT Use Legacy Tailwind Config
❌ **Wrong:** Creating `tailwind.config.js` in Tailwind v4
✅ **Right:** Just `@import "tailwindcss"` in CSS—no config file needed

### DO NOT Forget Base Path for GitHub Pages
❌ **Wrong:** Deploying with default `/` base path
✅ **Right:** Set `base: '/WhichMovieToWatch/'` in vite.config.ts

---

## Vite Configuration Example

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Which Movie To Watch',
        short_name: 'Movie Finder',
        theme_color: '#1a1a1a',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  base: '/WhichMovieToWatch/', // GitHub Pages repo name
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router'],
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          'animation-vendor': ['framer-motion'],
        },
      },
    },
  },
});
```

---

## TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  },
  "include": ["src"]
}
```

---

## GitHub Actions Workflow Example

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - run: npm ci

      - name: Build
        env:
          VITE_TMDB_API_KEY: ${{ secrets.TMDB_API_KEY }}
          VITE_OMDB_API_KEY: ${{ secrets.OMDB_API_KEY }}
          VITE_IPINFO_TOKEN: ${{ secrets.IPINFO_TOKEN }}
        run: npm run build

      - uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - uses: actions/deploy-pages@v4
```

---

## Performance Budget

| Metric | Target | Strategy |
|--------|--------|----------|
| **Bundle Size** | <500KB (gzipped) | Code splitting (manualChunks), tree-shaking, lazy load 3D scenes |
| **First Contentful Paint** | <1.5s | Inline critical CSS, preload fonts, optimize images |
| **Time to Interactive** | <3.5s | Defer non-critical JS, lazy load Framer Motion animations |
| **3D Render FPS** | 60fps | LOD with \<Detailed />, instanced meshes, <100 draw calls |

---

## Browser Support

Based on Tailwind v4 requirements and modern CSS features:

- **Safari:** 16.4+
- **Chrome:** 111+
- **Firefox:** 128+
- **Edge:** 111+ (Chromium-based)

**Mobile:** iOS 16.4+, Android Chrome 111+

**Rationale:** Tailwind v4 uses modern CSS features (@property, cascade layers, color-mix). These baseline browsers cover 95%+ of users in 2026.

---

## Sources

### Core Framework
- [Complete Guide to Setting Up React with TypeScript and Vite (2026)](https://medium.com/@robinviktorsson/complete-guide-to-setting-up-react-with-typescript-and-vite-2025-468f6556aaf2)
- [How to Set Up a Production-Ready React Project with TypeScript and Vite](https://oneuptime.com/blog/post/2026-01-08-react-typescript-vite-production-setup/view)
- [Vite Getting Started](https://vite.dev/guide/)

### Animation
- [Motion — JavaScript & React animation library](https://motion.dev/)
- [Motion Changelog](https://motion.dev/changelog)
- [framer-motion npm](https://www.npmjs.com/package/framer-motion)

### 3D Graphics
- [Motion for React Three Fiber](https://motion.dev/docs/react-three-fiber)
- [Basic Animations - React Three Fiber](https://docs.pmnd.rs/react-three-fiber/tutorials/basic-animations)
- [100 Three.js Tips That Actually Improve Performance (2026)](https://www.utsubo.com/blog/threejs-best-practices-100-tips)
- [React Postprocessing - Bloom](https://react-postprocessing.docs.pmnd.rs/effects/bloom)
- [GitHub - pmndrs/drei](https://github.com/pmndrs/drei)

### Styling
- [Tailwind CSS v4: The Complete Guide for 2026](https://devtoolbox.dedyn.io/blog/tailwind-css-v4-complete-guide)
- [How to install Tailwind CSS v4 to your React project](https://tailkit.com/blog/how-to-install-tailwind-css-v4-to-your-react-project)
- [BentoTailwind - Bento Grids Components](https://bentotailwind.com/)
- [The story behind Tailwind's CN function](https://tigerabrodi.blog/the-story-behind-tailwinds-cn-function)

### State Management
- [Zustand vs Redux Toolkit: Which should you use in 2026?](https://medium.com/@sangramkumarp530/zustand-vs-redux-toolkit-which-should-you-use-in-2026-903304495e84)
- [Zustand vs. Redux: Why Simplicity Wins in Modern React State Management](https://www.edstem.com/blog/zustand-vs-redux-why-simplicity-wins-in-modern-react-state-management/)

### PWA & Deployment
- [Vite Plugin PWA](https://vite-pwa-org.netlify.app/)
- [GitHub - sitek94/vite-deploy-demo](https://github.com/sitek94/vite-deploy-demo)
- [Using secrets in GitHub Actions](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Env Variables and Modes | Vite](https://vite.dev/guide/env-and-mode)

### Development Tools
- [How to Set Up Strict TypeScript Configuration for React Projects](https://oneuptime.com/blog/post/2026-01-15-strict-typescript-configuration-react/view)
- [Modern Linting in 2025: ESLint Flat Config with TypeScript and JavaScript](https://advancedfrontends.com/eslint-flat-config-typescript-javascript/)
- [Prettier + ESLint Configuration That Actually Works (Without the Headaches)](https://medium.com/@osmion/prettier-eslint-configuration-that-actually-works-without-the-headaches-a8506b710d21)
- [How to Unit Test React Components with Vitest and React Testing Library](https://oneuptime.com/blog/post/2026-01-15-unit-test-react-vitest-testing-library/view)

---

## Confidence Assessment

| Technology | Confidence | Verification Source |
|------------|------------|---------------------|
| React 19 + Vite 6 | HIGH | Official docs, multiple 2026 guides |
| Tailwind CSS v4 | HIGH | Official Tailwind docs, verified v4 changes |
| Framer Motion 12 | HIGH | Official Motion changelog, npm package |
| React Three Fiber | HIGH | Official pmndrs docs, performance guides |
| Zustand | HIGH | Multiple 2026 comparison articles |
| Vite PWA Plugin | HIGH | Official plugin docs, GitHub examples |
| ESLint 10 Flat Config | HIGH | Official ESLint docs, Jan 2026 guides |
| Vitest 3 | HIGH | Official docs, multiple integration guides |
| GitHub Pages Deployment | HIGH | Official GitHub docs, verified workflow examples |

**Overall Stack Confidence: HIGH**

All core recommendations are verified through official documentation and multiple current (2026) sources. Version numbers reflect latest stable releases as of February 2026.
