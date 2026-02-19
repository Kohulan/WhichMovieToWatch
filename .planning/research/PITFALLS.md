# Domain Pitfalls: React PWA Rewrite with Three.js, Framer Motion, and Complex Theming

**Domain:** Movie discovery PWA - vanilla JS to React migration with 3D, animations, claymorphism, and dynamic theming
**Researched:** 2026-02-15
**Confidence:** HIGH (official docs + multiple current sources)

## Critical Pitfalls

These mistakes cause rewrites, major performance issues, or complete feature loss.

### Pitfall 1: Feature Parity Blindness During Migration
**What goes wrong:** Shipping a rewrite with far fewer features than the current application, breaking user workflows and losing 25+ validated capabilities.

**Why it happens:** Full rewrite approach carries high risk of "feature parity" gaps and long time-to-market. Developers focus on new shiny features (3D, animations) while quietly dropping edge cases, API integrations, or less-visible features from the vanilla JS version.

**Consequences:**
- Users lose critical functionality they depend on
- Long time-to-market delays feedback on final product
- Shipping an unproven application with missing capabilities
- Need for emergency patches or second rewrite to restore features

**Prevention:**
1. Create feature inventory spreadsheet tracking ALL 25+ current features
2. Map each feature to React component equivalents BEFORE starting
3. Use automated behavioral parity validation (capture real behavior: routing, data flow, edge cases)
4. Defer major UX enhancements to post-migration phase
5. Focus purely on functional parity in initial migration
6. Implement route-level checks and snapshot comparisons as safety net
7. Use integration testing between old and new components (Jest/Jasmine)

**Detection:**
- Warning signs: "We'll add that later" repeated for multiple features
- No written feature parity checklist exists
- Testing only covers "happy path" scenarios
- TMDB/OMDB API integration tests missing
- Advanced search filters not documented in migration plan

**Phase mapping:** Phase 1 (Foundation) must include feature inventory and parity validation strategy.

**Sources:**
- [Xebia: Migrating to React Step by Step](https://xebia.com/blog/migrating-to-react-step-by-step/)
- [Full Stack Techies: React Migration Checklist](https://fullstacktechies.com/react-js-migration-checklist-legacy-to-ai/)
- [Medium: AI-Assisted React Migration Testing](https://laniltee.medium.com/from-legacy-to-react-19-how-we-used-ai-to-migrate-20-000-unit-tests-in-weeks-not-months-49f7e0b75026)

### Pitfall 2: Three.js Bundle Size Explosion
**What goes wrong:** Bundle size jumps 5x after adding Three.js, causing 10+ second initial load times on mobile, destroying PWA experience.

**Why it happens:** Three.js core is ~168kB gzipped, but developers import entire library instead of using tree-shaking, add unoptimized 3D assets without compression, and fail to code-split 3D features from critical path.

**Consequences:**
- Initial load time exceeds 10 seconds on 3G networks
- Mobile users abandon app before it loads
- PWA installation rates plummet
- GitHub Pages static hosting becomes unusable due to size
- Lighthouse scores drop below 50

**Prevention:**
1. Use named imports from Three.js (not `import * as THREE`)
2. Implement dynamic imports for 3D experience: `const Three = lazy(() => import('./3DExperience'))`
3. Use Draco compression for 3D geometry (90%+ size reduction)
4. Use KTX2 compression for textures
5. Cap device pixel ratio at 1.5 on mobile: `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))`
6. Code-split React Three Fiber into separate chunk
7. Monitor bundle size with Vite bundle visualizer
8. Set budget alert at 500kB total JS

**Detection:**
- Warning signs: `npm run build` shows chunks > 500kB
- Lighthouse performance score < 70
- Time to Interactive > 5 seconds
- Three.js imports use `import * as THREE`
- No dynamic imports for 3D components

**Phase mapping:** Phase 2 (3D Integration) must include bundle analysis and code-splitting strategy from day one.

**Sources:**
- [React Three Fiber: Reducing Bundle Size](https://gracious-keller-98ef35.netlify.app/docs/recipes/reducing-bundle-size/)
- [Gatsby: Three.js Performance Optimization](https://www.gatsbyjs.com/blog/performance-optimization-for-three-js-web-animations/)
- [Codrops: Building Efficient Three.js Scenes](https://tympanus.net/codrops/2025/02/11/building-efficient-three-js-scenes-optimize-performance-while-maintaining-quality/)
- [Utsubo: 100 Three.js Performance Tips](https://www.utsubo.com/blog/threejs-best-practices-100-tips)

### Pitfall 3: Mobile 3D Performance Collapse
**What goes wrong:** 3D experience runs at 60fps on desktop but drops to 5-10fps on mobile devices, causing janky animations and battery drain.

**Why it happens:** Developers test only on desktop/high-end devices, create objects in useFrame loops triggering garbage collection, use too many draw calls (>100), and apply expensive post-processing effects without mobile detection.

**Consequences:**
- App becomes unusable on mid-range Android devices (60%+ of users)
- Battery drains in minutes
- Device overheating
- Users disable 3D features or uninstall app
- Poor app store ratings

**Prevention:**
1. Target < 100 draw calls per frame (use R3F-Perf to monitor)
2. Use instancing for repeated objects (90%+ draw call reduction)
3. Reuse materials and geometries globally with useMemo
4. Avoid creating new Vector3/objects in useFrame
5. Use LOD (Level of Detail) with Drei's `<Detailed>` component (30-40% FPS improvement)
6. Implement adaptive quality: detect mobile and reduce geometry/effects
7. Never use setState in useFrame (causes React re-renders)
8. Use refs for direct mutations instead
9. Test on actual mid-range Android devices, not just iPhone
10. Disable expensive effects on mobile: `const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)`

**Detection:**
- Warning signs: FPS < 30 on mobile devices
- R3F-Perf shows > 100 draw calls
- Creating objects inside useFrame
- No mobile-specific quality settings
- Testing only on MacBook/iPhone Pro

**Phase mapping:** Phase 2 (3D Integration) requires mobile performance testing and adaptive quality system.

**Sources:**
- [React Three Fiber: Performance Pitfalls](https://r3f.docs.pmnd.rs/advanced/pitfalls)
- [Utsubo: 100 Three.js Performance Tips](https://www.utsubo.com/blog/threejs-best-practices-100-tips)
- [MoldStud: Optimizing Three.js for Mobile](https://moldstud.com/articles/p-optimizing-threejs-for-mobile-devices)
- [Medium: R3F Lessons Learned the Hard Way](https://medium.com/@koler778/from-zero-to-hero-in-three-js-react-three-fiber-lessons-learned-the-hard-way-7a119d66a5e0)

### Pitfall 4: Service Worker Caching Hell
**What goes wrong:** After deploying updates, users continue seeing old version for 24+ hours. Worse: broken deployment gets cached, preventing fixes from reaching users.

**Why it happens:** PWA service workers aggressively cache assets. If `service-worker.js` itself gets cached, new deployments can't reach users until cache expires (typically 24 hours). CRA's default "offline-first" behavior causes unexpected stale content.

**Consequences:**
- Critical bug fixes don't reach users
- Users report features that were "fixed" days ago
- Support team confusion over which version users see
- Emergency need to manually clear user caches (impossible at scale)
- Broken deployments become persistent disasters

**Prevention:**
1. Set `Cache-Control: max-age=0, no-cache` header for `service-worker.js`
2. Implement update notification: prompt users when new version available
3. Use Vite PWA plugin with `registerType: 'autoUpdate'` or `registerType: 'prompt'`
4. Never enable service worker in development (causes frustration)
5. Implement versioning in SW: change cache name on each deployment
6. Clear old caches: `caches.keys().then(names => Promise.all(names.map(cache.delete)))`
7. Test PWA update flow before deploying
8. Monitor service worker lifecycle events
9. Add manual "Check for updates" button in settings

**Detection:**
- Warning signs: Users report seeing old version after deployment
- Service worker file has `max-age > 0`
- No update notification mechanism
- Service worker enabled in development
- No cache versioning strategy

**Phase mapping:** Phase 4 (PWA Features) must include service worker update strategy and testing.

**Sources:**
- [Hasura: Service Worker Caching Strategies](https://hasura.io/blog/strategies-for-service-worker-caching-d66f3c828433)
- [Medium: Service Worker Caching the Right Way](https://medium.com/@dirk.deboer88/handling-service-worker-caching-in-react-js-the-right-way-eb9145b0a99c)
- [Create React App: Making a PWA](https://create-react-app.dev/docs/making-a-progressive-web-app/)
- [Medium: PWA Updates in React with Vite](https://medium.com/@leybov.anton/how-to-control-and-handle-last-app-updates-in-pwa-with-react-and-vite-cfb98499b500)

### Pitfall 5: GitHub Pages SPA Routing Black Hole
**What goes wrong:** React Router works perfectly in development but all routes return 404 on GitHub Pages. Direct navigation to `/movie/12345` breaks entirely.

**Why it happens:** GitHub Pages assumes static HTML files for each route. It doesn't support SPA client-side routing. When users navigate to `/movie/12345`, GitHub Pages looks for `movie/12345/index.html`, finds nothing, returns 404.

**Consequences:**
- All bookmarked URLs break
- Social media shares lead to 404 errors
- Users can't deep link to specific movies
- SEO completely broken
- Back button breaks navigation
- Emergency migration to different hosting platform

**Prevention:**

**Option 1: HashRouter (Recommended for GitHub Pages)**
```tsx
import { HashRouter } from 'react-router-dom'
// URLs become: yoursite.github.io/#/movie/12345
```
Pros: Works immediately, no server config
Cons: Ugly URLs with #, poor SEO, broken link previews

**Option 2: Custom 404.html Redirect**
Create 404.html that redirects to index.html with path in query string
Cons: Brave browser shows warning, no link previews (404 header sent)

**Option 3: Migrate to Cloudflare Pages/Vercel (Recommended long-term)**
Both have native SPA support with proper routing

**Option 4: Vite Base URL + HashRouter Hybrid**
```ts
// vite.config.ts
export default defineConfig({
  base: '/WhichMovieToWatch/',
})
```

**Detection:**
- Warning signs: Using BrowserRouter with GitHub Pages deployment
- No routing strategy documented
- Direct route URLs not tested on production
- Link previews not tested
- vite.config.ts missing `base` for repo name

**Phase mapping:** Phase 1 (Foundation) - routing strategy must be decided BEFORE building features.

**Sources:**
- [GitHub Community: SPA Routing Not Supported](https://github.com/orgs/community/discussions/64096)
- [Medium: React Router on GitHub Pages Fix](https://medium.com/@faithnjah5/react-router-on-github-pages-fix-deployment-issues-in-6-simple-steps-ec8c1b358e76)
- [Medium: Deploying React with Client-Side Routing](https://medium.com/@swarajgosavi20/how-to-deploy-react-app-with-client-side-routing-on-github-pages-8a3fefe5b0d5)

### Pitfall 6: TMDB API Key Exposure + Rate Limiting Cascade
**What goes wrong:** API keys exposed in client-side code get abused by scrapers. Rate limits hit unexpectedly, breaking app for all users during peak usage.

**Why it happens:** Client-side apps must include API keys in source code. TMDB enforces 50 requests/second, 20 connections/IP. One user spamming search triggers rate limit for entire IP range. Scrapers steal keys from source code.

**Consequences:**
- API key gets revoked due to abuse
- All users blocked during rate limit (especially bad for shared IPs)
- Emergency key rotation breaks all deployed versions
- TMDB might ban domain entirely
- Lost development time debugging "why did it stop working?"

**Prevention:**
1. Implement request throttling: max 40 requests/second with delay between calls
2. Implement client-side caching: cache TMDB responses in localStorage/IndexedDB
3. Add cache expiry: 1 hour for movie details, 24 hours for static data
4. Track request count in sliding window: `requestsInLastSecond < 40`
5. Show loading states instead of parallel requests
6. Debounce search input: wait 500ms after typing stops
7. Backend proxy option: Create simple backend with cache management (reduces API calls by 90%+)
8. Monitor API usage: log requests in development
9. Graceful degradation: show cached data when rate limited
10. Consider TMDB API v4 authentication for better security

**Detection:**
- Warning signs: Multiple parallel API requests on page load
- No client-side caching implementation
- Search triggers API call on every keystroke
- No request throttling logic
- API keys in plaintext in .env committed to git

**Phase mapping:** Phase 3 (API Integration) must include caching and throttling from day one.

**Sources:**
- [TMDB: Rate Limiting Documentation](https://developer.themoviedb.org/docs/rate-limiting)
- [TMDB Talk: Forced to Expose API Key Client-Side](https://www.themoviedb.org/talk/6576fa9be93e95218f6b822a?language=en-US)
- [TMDB Talk: Rate Limit Discussion](https://www.themoviedb.org/talk/6558fa627f054018d5168d91)

## Moderate Pitfalls

These cause significant issues but are recoverable without major rewrites.

### Pitfall 7: Framer Motion Layout Thrashing
**What goes wrong:** Beautiful Framer Motion animations run at 60fps on desktop but cause janky 20fps performance on mobile, especially when animating multiple elements.

**Why it happens:** Animating CSS properties like `width`, `height`, `top`, `left` triggers layout recalculation and repaint on every frame. These properties aren't GPU-accelerated and block the main thread.

**Consequences:**
- Janky animations destroy perceived performance
- Increased CPU usage and battery drain
- Layout thrashing causes frame drops
- Complex animations become unusable on mobile
- Users disable animations or perceive app as low-quality

**Prevention:**
1. Only animate GPU-accelerated properties: `x`, `y`, `scale`, `rotate`, `opacity`
2. Never animate: `width`, `height`, `top`, `left`, `margin`, `padding`
3. Use transform properties instead:
```tsx
// BAD
<motion.div animate={{ width: 200, left: 100 }} />

// GOOD
<motion.div animate={{ x: 100, scale: 1.2, opacity: 1 }} />
```
4. Use Framer Motion's `layout` prop for smooth state transitions (automatic FLIP animation)
5. Leverage `whileTap` and `whileHover` props (internally optimized)
6. Use `useInView` for lazy animation loading
7. Keep exit animations short (< 300ms)
8. Memoize complex calculations: `useMemo`, `useCallback`
9. Minimize unnecessary re-renders with React.memo
10. Avoid animating during route transitions

**Detection:**
- Warning signs: Animations feel janky on mobile
- DevTools Performance tab shows layout thrashing
- Animating properties other than transform/opacity
- Multiple elements animating simultaneously
- No use of `layout` prop for state changes

**Phase mapping:** Phase 5 (Animation System) - animation performance testing required before merge.

**Sources:**
- [Framer Motion: Performance Tips](https://tillitsdone.com/blogs/framer-motion-performance-tips/)
- [Study Raid: Best Practices for Performant Animations](https://app.studyraid.com/en/read/7850/206073/best-practices-for-performant-animations)
- [LogRocket: Best React Animation Libraries 2026](https://blog.logrocket.com/best-react-animation-libraries/)

### Pitfall 8: Claymorphism Accessibility Disaster
**What goes wrong:** Beautiful claymorphism design makes text unreadable for users with low vision, fails WCAG 2.2 contrast requirements, and causes performance issues on low-end devices.

**Why it happens:** Claymorphism/glassmorphism uses `backdrop-filter: blur()` which is GPU-intensive, semi-transparent backgrounds that destroy contrast ratios, and layered effects that create visual clutter.

**Consequences:**
- WCAG 2.2 compliance failure (legal risk for some organizations)
- Users with low vision or color blindness can't read content
- Text disappears over colorful backgrounds
- Performance tanks on devices with weaker GPUs
- Accessibility audits fail
- Reduced usability for 15-20% of users

**Prevention:**
1. Limit blur values to 8-15px (higher values exponentially more expensive)
2. Reduce to 6-8px on mobile devices
3. Limit glass effects to 2-3 elements per viewport
4. Never stack multiple blurred layers
5. Ensure 4.5:1 contrast ratio minimum (WCAG AA)
6. Add solid color fallback for reduced motion preference:
```css
@media (prefers-reduced-transparency: reduce) {
  .glass { backdrop-filter: none; background: solid; }
}
```
7. Test on actual low-end Android devices
8. Provide "Reduce transparency" toggle in settings
9. Use darker/more opaque backgrounds behind text
10. Avoid pure white text on glass (use cream/light gray)
11. Test with color blindness simulators
12. Never use glass effect on critical UI (buttons, forms)

**Detection:**
- Warning signs: Contrast ratio < 4.5:1 in Chrome DevTools
- Blur values > 15px
- Multiple layered glass effects
- No reduced transparency media query
- Text readability complaints
- Performance issues on mobile

**Phase mapping:** Phase 6 (Visual Design System) - accessibility testing mandatory before launch.

**Sources:**
- [Axess Lab: Glassmorphism Meets Accessibility](https://axesslab.com/glassmorphism-meets-accessibility-can-frosted-glass-be-inclusive/)
- [New Target: Glassmorphism with Accessibility](https://www.newtarget.com/web-insights-blog/glassmorphism/)
- [Developer Playground: Glassmorphism Implementation Guide 2025](https://playground.halfaccessible.com/blog/glassmorphism-design-trend-implementation-guide)

### Pitfall 9: Theme Switching Re-render Storm
**What goes wrong:** Switching themes causes entire app to re-render, freezing UI for 500-2000ms and providing terrible user experience.

**Why it happens:** Using React Context + CSS-in-JS ThemeProvider forces every emotion/styled-component to re-render when theme changes. All component styles must be regenerated and serialized.

**Consequences:**
- UI freeze during theme switch (especially bad on mobile)
- Poor user experience
- Excessive battery drain
- Memory pressure from re-serializing styles
- Larger style bundle size (duplicate styles for each theme)

**Prevention:**
1. Use CSS Variables instead of CSS-in-JS for theming:
```tsx
// BAD: ThemeProvider causes full re-render
<ThemeProvider theme={darkTheme}>

// GOOD: CSS Variables, only root updates
document.documentElement.style.setProperty('--bg-color', '#000')
```
2. Only component managing theme needs to re-render
3. Browser handles paint without React involvement
4. CSS variable mode is default in Ant Design 6.0+ (proven approach)
5. Styles shared across themes (reduces bundle size)
6. No re-serialization needed on theme switch
7. Store theme preference in localStorage
8. Preload both themes to avoid flash
9. Use `color-scheme` meta tag for system theme
10. Animate theme transitions with CSS:
```css
* { transition: background 0.3s, color 0.3s; }
```

**Detection:**
- Warning signs: UI freezes when switching themes
- Using ThemeProvider from styled-components/emotion
- React DevTools shows full app re-render on theme change
- Styles duplicated for each theme in bundle
- No CSS variables in codebase

**Phase mapping:** Phase 6 (Visual Design System) - CSS variable approach required from start.

**Sources:**
- [Epic React: CSS Variables Instead of React Context](https://www.epicreact.dev/css-variables)
- [Ant Design: CSS Variables Documentation](https://ant.design/docs/react/css-variables/)
- [Josh W. Comeau: CSS Variables for React Devs](https://www.joshwcomeau.com/css/css-variables-for-react-devs/)
- [Bits and Pieces: Theming React with CSS Variables](https://blog.bitsrc.io/theming-react-components-with-css-variables-ee52d1bb3d90)

### Pitfall 10: Bento Grid Performance Collapse
**What goes wrong:** Responsive bento grid re-renders constantly during resize, causes layout thrashing, and performs poorly with Framer Motion animations.

**Why it happens:** react-grid-layout triggers re-renders on every grid change. Without memoization, children components re-create on each render. Animating grid items during drag/resize causes performance issues.

**Consequences:**
- Janky drag/resize interactions
- Poor mobile performance
- Excessive re-renders
- Memory leaks from layout state tracking
- Frozen UI during grid operations

**Prevention:**
1. Wrap grid children in React.memo:
```tsx
const GridItem = React.memo(({ children }) => <div>{children}</div>)
```
2. Memoize layouts with useMemo:
```tsx
const layouts = useMemo(() => ({
  lg: layoutLg,
  md: layoutMd
}), []) // Only create once
```
3. Save layout state onChange causes re-renders - avoid inline updates
4. Use `will-change: transform` for grid items
5. Limit animations during drag: disable Framer Motion during interaction
6. Test breakpoints on real devices (tablet, phone, desktop)
7. Avoid too many grid items (< 20 per viewport recommended)
8. Use CSS Grid for static layouts (faster than react-grid-layout)
9. Debounce layout change handlers
10. Profile with React DevTools Profiler

**Detection:**
- Warning signs: Grid re-renders on every interaction
- No memoization of children or layouts
- Layout state saved on every change
- Janky drag/resize
- React DevTools shows constant re-renders

**Phase mapping:** Phase 6 (Visual Design System) - bento grid performance testing required.

**Sources:**
- [GitHub: react-grid-layout](https://github.com/react-grid-layout/react-grid-layout)
- [GitHub: react-bento](https://github.com/anbrela/react-bento)
- [Magic UI: Bento Grid Component](https://magicui.design/docs/components/bento-grid)

### Pitfall 11: Framer Motion 3D + React Three Fiber Context Conflict
**What goes wrong:** Using Framer Motion 3D's MotionCanvas breaks React Three Fiber components, causing runtime errors and breaking 3D scene functionality.

**Why it happens:** React Three Fiber's `<Canvas>` component establishes context for 3D scene. Framer Motion 3D's `<MotionCanvas>` tries to link DOM Motion context with 3D context but breaks R3F's internal context system.

**Consequences:**
- Runtime errors when R3F components try to access context
- 3D scene fails to render
- Cryptic error messages about missing context
- Animations don't work as expected
- Need to choose between Framer Motion 3D or R3F features

**Prevention:**
1. Use standard R3F `<Canvas>` for 3D scenes
2. Animate 3D objects with R3F's built-in animation methods:
   - `useFrame` hook for manual animations
   - `react-spring/three` for spring animations
   - Drei's animation helpers
3. Use Framer Motion for DOM/2D UI only
4. If mixing is required, use separate contexts:
```tsx
{/* 2D UI with Framer Motion */}
<motion.div>
  {/* 3D scene with R3F Canvas */}
  <Canvas>
    <Scene />
  </Canvas>
</motion.div>
```
5. Animate Camera position via refs, not MotionCanvas
6. Keep Motion 3D for simple 3D text/elements only
7. Document animation approach early in Phase 2

**Detection:**
- Warning signs: Using both MotionCanvas and R3F components
- Runtime errors about missing R3F context
- 3D scene not rendering when animations added
- Mixing framer-motion-3d with @react-three/fiber

**Phase mapping:** Phase 2 (3D Integration) - animation strategy must be decided before implementation.

**Sources:**
- [Motion Dev: Motion for React Three Fiber](https://motion.dev/docs/react-three-fiber)
- [GitHub Issue: MotionCanvas Causes R3F Components to Throw](https://github.com/framer/motion/issues/1635)
- [NPM: framer-motion-3d](https://www.npmjs.com/package/framer-motion-3d)
- [Medium: Adding Motion to 3D Models](https://medium.com/@izushidaichi/adding-motion-to-3d-models-with-framer-motion-and-three-js-0eb55fae4193)

### Pitfall 12: TypeScript Strict Mode Migration Chaos
**What goes wrong:** Enabling TypeScript strict mode all at once generates 1000+ errors, blocking development and causing team to abandon types or use `any` everywhere.

**Why it happens:** Vanilla JS to TypeScript migration is already complex. Enabling strict mode simultaneously multiplies complexity. TypeScript 7 enables strictness by default, catching teams off-guard.

**Consequences:**
- Development paralyzed by type errors
- Team frustration and TypeScript abandonment
- Escape hatch: `any` used everywhere (defeating purpose)
- Rushed fixes introduce bugs
- Migration timeline blown
- Type safety benefits lost

**Prevention:**
1. Start with `"strict": false` for large migrations
2. Enable flags incrementally in order:
   - `noImplicitAny` first (easiest wins)
   - `strictNullChecks` second (most impactful)
   - Other strict flags one by one
3. Allow temporary `any` types during migration, refine over time
4. Use `// @ts-ignore` or `// @ts-expect-error` sparingly for blockers
5. Don't try for 100% perfect types from day one
6. Think carefully about optional (`?`) vs. required fields
7. Be aware: TypeScript 7 defaults to strict mode (breaking change)
8. For new projects: enable strict from start
9. Use helper functions and type assertions for edge cases
10. Consider `noUncheckedIndexedAccess` for extra safety (later)

**Detection:**
- Warning signs: 1000+ TypeScript errors after enabling strict
- Team using `any` frequently to bypass types
- `"strict": true` enabled in initial migration
- No gradual adoption plan
- TypeScript 7 upgrade without preparation

**Phase mapping:** Phase 1 (Foundation) - TypeScript strategy with gradual strict mode adoption.

**Sources:**
- [Bitovi: Incrementally Migrate to TypeScript Strict Mode](https://www.bitovi.com/blog/how-to-incrementally-migrate-an-angular-project-to-typescript-strict-mode)
- [OneUpTime: Configure TypeScript Strict Mode](https://oneuptime.com/blog/post/2026-01-24-typescript-strict-mode/view)
- [Bitwarden: Adopt TypeScript Strict Flag](https://contributing.bitwarden.com/architecture/adr/typescript-strict/)
- [InfoQ: TypeScript 7 Progress Update](https://www.infoq.com/news/2026/01/typescript-7-progress/)

## Minor Pitfalls

These cause annoyance but are easily fixed.

### Pitfall 13: Vite Environment Variable Misconfiguration
**What goes wrong:** Environment variables work in development but are `undefined` in production builds, breaking API integrations and features.

**Why it happens:** Vite requires `VITE_` prefix for environment variables. Using `REACT_APP_` (CRA convention) or unprefixed variables won't work. Developers forget to use `import.meta.env` instead of `process.env`.

**Consequences:**
- Production builds break silently
- API calls fail without error messages
- Features work in dev, fail in production
- Debugging confusion
- Emergency hotfix deployment

**Prevention:**
1. Always prefix with `VITE_`: `VITE_TMDB_API_KEY`
2. Use `import.meta.env.VITE_TMDB_API_KEY` (not `process.env`)
3. Verify `.env` file is in project root
4. Add `.env` to `.gitignore` (never commit API keys)
5. Create `.env.example` with dummy values
6. Validate env vars on app startup:
```tsx
if (!import.meta.env.VITE_TMDB_API_KEY) {
  throw new Error('Missing VITE_TMDB_API_KEY')
}
```
7. Document all required env vars in README
8. Test production build locally before deploying

**Detection:**
- Warning signs: Variables `undefined` in production
- Using `process.env` instead of `import.meta.env`
- No `VITE_` prefix on environment variables
- `.env` file committed to git
- No startup validation

**Phase mapping:** Phase 1 (Foundation) - environment variable setup with validation.

**Sources:**
- [Mindful Chase: Troubleshooting Vite](https://mindfulchase.com/explore/troubleshooting-tips/build-bundling/troubleshooting-common-issues-in-vite.html)
- [Medium: React TypeScript Vite Production Setup](https://medium.com/@robinviktorsson/complete-guide-to-setting-up-react-with-typescript-and-vite-2025-468f6556aaf2)
- [Vite: Building for Production](https://vite.dev/guide/build)

### Pitfall 14: Static Site Hydration Mismatch
**What goes wrong:** Console floods with "Hydration failed" errors, content flashes incorrectly, and React throws warnings about server/client mismatch despite being a client-only app.

**Why it happens:** Even client-only apps can have hydration-like issues when using SSG/prerendering. Date/time rendering, random content, browser-only APIs (`window`, `localStorage`), or conditional rendering based on client state causes initial render to differ from subsequent renders.

**Consequences:**
- Console error spam
- Content flash on load (bad UX)
- Potential bugs from mismatched state
- React warnings in production
- Confused developers debugging phantom SSR

**Prevention:**
1. Avoid date/time in initial render:
```tsx
const [time, setTime] = useState(null)
useEffect(() => setTime(new Date()), [])
```
2. Use `useEffect` for browser-only APIs:
```tsx
useEffect(() => {
  const saved = localStorage.getItem('theme')
}, [])
```
3. Avoid random content in initial render
4. Use `suppressHydrationWarning` only when truly unavoidable
5. Keep rendering logic predictable
6. Test with React StrictMode enabled
7. Check for `window` before using:
```tsx
if (typeof window !== 'undefined') {
  // Browser-only code
}
```

**Detection:**
- Warning signs: Console shows hydration errors
- Using `window` or `localStorage` in component body
- Date/time rendered during initial mount
- Content flashes on page load
- Random or conditional content in first render

**Phase mapping:** Phase 1 (Foundation) - avoid hydration issues from start with proper patterns.

**Sources:**
- [Josh W. Comeau: The Perils of Hydration](https://www.joshwcomeau.com/react/the-perils-of-rehydration/)
- [PropelAuth: Understanding Hydration Errors](https://www.propelauth.com/post/understanding-hydration-errors)
- [Medium: Fix Hydration Failed Error](https://medium.com/@ankit.exe/how-to-fix-hydration-failed-because-the-initial-ui-does-not-match-error-in-next-js-1a8cf423f3c0)

### Pitfall 15: Vite Plugin Configuration Conflicts
**What goes wrong:** Vite build fails with cryptic errors, HMR stops working, or plugins behave unexpectedly after adding new plugins.

**Why it happens:** Plugins installed in wrong order, conflicting plugin configurations, outdated plugin versions, or missing peer dependencies.

**Consequences:**
- Build failures blocking deployment
- HMR broken during development (frustrating DX)
- Wasted debugging time
- Reverting plugin additions
- Delayed feature implementation

**Prevention:**
1. Install plugins in correct order (order matters)
2. Check plugin compatibility with current Vite version
3. Update plugins regularly: `npm outdated`
4. Read plugin documentation for configuration requirements
5. Test plugins individually before combining
6. Use official Vite plugins when available
7. Check for peer dependency warnings
8. Verify plugin configurations don't conflict
9. Keep `vite.config.ts` organized and commented

**Detection:**
- Warning signs: Build errors after adding plugin
- HMR stops working
- Plugin behavior doesn't match documentation
- Peer dependency warnings in console
- Outdated plugin versions

**Phase mapping:** Phase 1 (Foundation) - establish plugin configuration early, test thoroughly.

**Sources:**
- [Mindful Chase: Troubleshooting Common Issues in Vite](https://mindfulchase.com/explore/troubleshooting-tips/build-bundling/troubleshooting-common-issues-in-vite.html)
- [Vite: Getting Started](https://vite.dev/guide/)

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Phase 1: Foundation | TypeScript strict mode chaos (Pitfall 12) | Start with strict: false, enable incrementally |
| Phase 1: Foundation | GitHub Pages routing (Pitfall 5) | Decide HashRouter vs. migration to Cloudflare Pages early |
| Phase 1: Foundation | Vite env vars (Pitfall 13) | Set up VITE_ prefix and validation from day one |
| Phase 2: 3D Integration | Bundle size explosion (Pitfall 2) | Code-split 3D, monitor bundle size, use Draco compression |
| Phase 2: 3D Integration | Mobile 3D performance (Pitfall 3) | Test on real Android devices, implement adaptive quality |
| Phase 2: 3D Integration | Framer Motion 3D conflict (Pitfall 11) | Choose animation approach: R3F native or Motion for UI only |
| Phase 3: API Integration | TMDB rate limiting (Pitfall 6) | Implement caching and throttling from start |
| Phase 3: API Integration | Feature parity loss (Pitfall 1) | Create feature inventory, test ALL 25+ existing features |
| Phase 4: PWA Features | Service worker caching hell (Pitfall 4) | Proper cache headers, update notifications, version caches |
| Phase 5: Animation System | Framer Motion layout thrashing (Pitfall 7) | Only animate transform/opacity, use layout prop |
| Phase 6: Visual Design | Claymorphism accessibility (Pitfall 8) | Test contrast ratios, limit blur, provide transparency toggle |
| Phase 6: Visual Design | Theme switching re-renders (Pitfall 9) | Use CSS Variables from start, not ThemeProvider |
| Phase 6: Visual Design | Bento grid performance (Pitfall 10) | Memoize children and layouts, limit grid complexity |

## Research Confidence Assessment

| Area | Confidence | Source Quality |
|------|------------|----------------|
| React Three Fiber pitfalls | HIGH | Official R3F docs + multiple 2026 sources |
| Framer Motion performance | HIGH | Official Motion docs + verified community sources |
| Three.js bundle/performance | HIGH | Official docs + Codrops + multiple 2026 articles |
| PWA service worker issues | HIGH | Multiple verified migration guides + official CRA docs |
| GitHub Pages SPA routing | HIGH | GitHub community discussions + multiple 2026 solutions |
| TMDB API limitations | MEDIUM | Official TMDB docs + community discussions (OMDB not found) |
| Claymorphism accessibility | HIGH | Axess Lab + multiple accessibility-focused sources |
| React migration patterns | HIGH | Multiple 2026 migration guides + real case studies |
| TypeScript strict mode | HIGH | Official TS resources + 2026 TS7 context |
| Vite configuration | MEDIUM | Official Vite docs + community troubleshooting guides |
| Bento grid performance | MEDIUM | react-grid-layout docs + component libraries |
| Theme switching | HIGH | Epic React + Ant Design + multiple verified sources |

## Sources

### Critical Pitfalls
- [Performance pitfalls - React Three Fiber](https://r3f.docs.pmnd.rs/advanced/pitfalls)
- [100 Three.js Tips That Actually Improve Performance (2026)](https://www.utsubo.com/blog/threejs-best-practices-100-tips)
- [Building Efficient Three.js Scenes: Optimize Performance While Maintaining Quality](https://tympanus.net/codrops/2025/02/11/building-efficient-three-js-scenes-optimize-performance-while-maintaining-quality/)
- [Migrating Your Front-end To React, Step By Step](https://xebia.com/blog/migrating-to-react-step-by-step/)
- [React Migration Checklist: Legacy To AI Stack 2025](https://fullstacktechies.com/react-js-migration-checklist-legacy-to-ai/)
- [Strategies for Service Worker Caching for Progressive Web Apps](https://hasura.io/blog/strategies-for-service-worker-caching-d66f3c828433)
- [GitHub Pages does not support routing for single page apps](https://github.com/orgs/community/discussions/64096)
- [Rate Limiting - TMDB Developer](https://developer.themoviedb.org/docs/rate-limiting)

### Moderate Pitfalls
- [Framer Motion Tips for Performance in React](https://tillitsdone.com/blogs/framer-motion-performance-tips/)
- [Glassmorphism Meets Accessibility: Can Glass Be Inclusive?](https://axesslab.com/glassmorphism-meets-accessibility-can-frosted-glass-be-inclusive/)
- [Use CSS Variables instead of React Context](https://www.epicreact.dev/css-variables)
- [React-grid-layout GitHub](https://github.com/react-grid-layout/react-grid-layout)
- [Motion for React Three Fiber](https://motion.dev/docs/react-three-fiber)
- [How to Incrementally Migrate to TypeScript Strict Mode](https://www.bitovi.com/blog/how-to-incrementally-migrate-an-angular-project-to-typescript-strict-mode)

### Minor Pitfalls
- [Troubleshooting Common Issues in Vite](https://mindfulchase.com/explore/troubleshooting-tips/build-bundling/troubleshooting-common-issues-in-vite.html)
- [The Perils of Hydration](https://www.joshwcomeau.com/react/the-perils-of-rehydration/)
- [Building for Production - Vite](https://vite.dev/guide/build)
