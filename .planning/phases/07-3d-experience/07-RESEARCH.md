# Phase 7: 3D Experience — Research

**Domain:** 3D WebGL scenes in a React PWA (Spline 3D integration)
**Researched:** 2026-02-19
**Overall confidence:** MEDIUM — Spline APIs are well-documented but real-world performance data for this exact use case (theme-adaptive cinematic scene, camera page transitions, gyroscope mobile parallax) required synthesis from multiple sources with some LOW-confidence inference.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Technology Stack](#technology-stack)
3. [Feature Landscape](#feature-landscape)
4. [Architecture](#architecture)
5. [Pitfalls & Risks](#pitfalls--risks)
6. [Roadmap Implications](#roadmap-implications)

---

## Executive Summary

This phase adds Spline 3D (`@splinetool/react-spline`) as a cinematic atmospheric layer to the app: an abstract film-studio hero scene on the HomePage, camera-driven page transitions, and a graceful 2D parallax fallback for low-end devices. The existing claymorphism UI, movie poster backdrops, and Framer Motion animations remain untouched.

**The core tension of this phase is performance vs. immersion.** The `@splinetool/runtime` package is ~6.8 MB unpacked (compresses to ~544 KB gzipped with server compression), and Spline scenes themselves add another 0.5-3+ MB depending on complexity. Even a simple Spline scene measured 17.9 seconds of CPU time on desktop in real-world benchmarks. The PERF-04 requirement (Lighthouse >= 90 on desktop) will be the hardest success criterion to meet. The entire 3D layer must be treated as a progressive enhancement that loads after the critical path is complete.

Spline's state-based animation model is the right tool for theme-adaptive lighting and camera transitions. The runtime API exposes `setVariable()` for controlling scene properties (lighting color, intensity) from React, and `emitEvent()`/`transition()` for triggering camera state changes programmatically. This means the Spline scene can be designed with multiple states (one per theme preset, one per light/dark mode, one per "page camera position") and the React app drives transitions between them.

The gyroscope parallax on mobile requires Device Orientation API permission (mandatory user gesture on iOS since iOS 13). This is a premium feature worth implementing but needs a tasteful permission prompt UX.

**Key finding:** Camera page transitions are the highest-risk feature. Spline's camera control is primarily editor-driven (design camera states in Spline, trigger from code). Programmatic camera position manipulation is possible but limited to finding the camera object by name and modifying its `position`/`rotation` properties -- smooth interpolation between arbitrary positions must be handled via Spline's built-in `transition()` API with pre-defined states, not freeform programmatic animation. This means the Spline scene must be designed with camera states for each page's "view," and page navigation triggers transitions between those states.

---

## Technology Stack

### Core Packages

| Package | Version | Purpose | Bundle Impact |
|---------|---------|---------|---------------|
| `@splinetool/react-spline` | ^4.1.0 | React component for Spline scenes | Thin wrapper (~5 KB), depends on runtime |
| `@splinetool/runtime` | ^1.12.x | WebGL runtime that renders .splinecode scenes | ~6.8 MB unpacked, ~544 KB gzipped |
| `detect-gpu` | ^5.0.x | GPU tier classification for degradation strategy | ~979 KB unpacked (includes benchmark data) |

**Confidence:** HIGH -- versions and sizes verified via npm and Bundlephobia search results.

### Supporting Libraries (Already in Project)

| Package | Purpose in Phase 7 |
|---------|---------------------|
| `motion` (Framer Motion) | 2D parallax fallback animations, page transition fallback |
| `zustand` | Extend themeStore to broadcast theme/mode changes to 3D layer |
| `react` ^19 | Suspense boundaries for lazy-loaded 3D components |

### Optional Bridge Package

| Package | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@splinetool/r3f-spline` | ^1.x | Load Spline scenes into React Three Fiber | Only if camera transitions need finer programmatic control than Spline's `transition()` API provides |
| `@splinetool/loader` | ^1.x | Three.js loader for Spline files | Peer dependency of r3f-spline, lighter than full runtime (2.2 MB) |
| `@react-three/fiber` | ^9.x | React renderer for Three.js | Only needed with r3f-spline bridge |
| `three` | ^0.170.x | Three.js core | Only needed with r3f-spline bridge |

**Recommendation:** Start with `@splinetool/react-spline` only. The r3f-spline bridge adds Three.js (~600 KB gzipped) plus R3F to the bundle. Only escalate to the bridge if the pure Spline approach cannot achieve smooth camera transitions between page states. The `transition()` API on SPEObjects (including cameras) should be sufficient for pre-defined camera positions.

### Vite Configuration

The existing `vite.config.ts` already has a `three-vendor` manual chunk configured. Update it to also isolate Spline:

```typescript
manualChunks: (id) => {
  // ... existing react-vendor, animation-vendor chunks ...
  if (id.includes('node_modules/@splinetool')) {
    return 'spline-vendor';
  }
  if (id.includes('node_modules/three') || id.includes('node_modules/@react-three')) {
    return 'three-vendor';
  }
}
```

### Installation

```bash
npm install @splinetool/react-spline @splinetool/runtime detect-gpu
```

**Confidence:** HIGH -- verified installation commands from official GitHub README.

---

## Feature Landscape

### Requirement Mapping

| Req ID | Requirement | Implementation Approach | Complexity |
|--------|-------------|------------------------|------------|
| 3DXP-01 | 3D hero scene with floating movie posters | Spline scene with poster textures (mix TMDB live + static) as background layer on HomePage | HIGH |
| 3DXP-02 | Interactive gallery with parallax depth | Mouse parallax via Spline's built-in mouse tracking + gyroscope hook for mobile | MEDIUM |
| 3DXP-03 | 3D transitions between views | Camera states in Spline scene, triggered via `transition()` API on route change | HIGH |
| 3DXP-04 | 3D background effects (particles, ambient motion) | Spline particle system + animated props (rotating film reel, spotlight sweep) | MEDIUM |
| 3DXP-05 | Graceful degradation to 2D | detect-gpu tier check + WebGL context probe; fallback to CSS parallax layers | MEDIUM |
| 3DXP-06 | Mobile-optimized 3D (<100 draw calls) | Reduced polygon scene export, compression, render-on-demand mode | HIGH |
| 3DXP-07 | Lazy-loaded 3D scenes | React.lazy + Suspense + IntersectionObserver for viewport-triggered load | LOW |
| PERF-01 | Three.js not in initial bundle | Spline runtime lazy-loaded via dynamic import, separate vendor chunk | LOW |
| PERF-04 | Lighthouse >= 90 desktop | 3D loads after LCP, no CLS from canvas, all 3D in deferred chunks | HIGH |

### Table Stakes (Must Have)

| Feature | Why Required | Complexity |
|---------|-------------|------------|
| Lazy-loaded Spline scene on HomePage | Without lazy loading, 6.8 MB runtime blocks initial render | LOW |
| GPU tier detection before loading 3D | Loading 3D on tier-0 devices crashes or freezes the app | LOW |
| 2D parallax fallback | ~30-40% of mobile users will not get 3D (old devices, no WebGL) | MEDIUM |
| Self-hosted .splinecode file | Avoids CORS issues, reduces latency, enables CDN caching | LOW |
| Render-on-demand mode | Without it, Spline continuously renders at 60fps even when static, burning CPU | LOW (default behavior) |
| Fixed canvas dimensions wrapper | Without it, CLS score degrades to 0.24 (near "poor" threshold) | LOW |

### Differentiators (Value-Add)

| Feature | Value | Complexity |
|---------|-------|------------|
| Theme-adaptive 3D lighting via variables | Scene matches warm-orange/gold/clean-white presets seamlessly | MEDIUM |
| Light/dark mode atmosphere shift | Noir cinematic vs bright studio -- premium feel | MEDIUM |
| Gyroscope parallax on mobile | Device-tilt-responsive 3D creates "wow" immersion | MEDIUM |
| Camera state transitions on page nav | Cinematic dolly/track/zoom between pages | HIGH |
| Live TMDB poster textures in scene | Dynamic content in 3D scene creates living atmosphere | HIGH |

### Anti-Features (Do NOT Build)

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|---------------------|
| Interactive/clickable 3D objects | Context says "mood-setter, not a navigation tool" | Posters are decorative only |
| Multiple Spline scenes per page | Docs recommend max 1-2 per page; performance degrades sharply | Single scene with camera states |
| Continuous rendering mode | Burns CPU/battery when scene is idle | Use default render-on-demand |
| 3D on all pages | Feature pages have existing poster backdrops; adding 3D would conflict | 3D hero on HomePage only; camera transitions between pages use the single scene |
| Custom Three.js shaders | Spline scenes are opaque -- you cannot inject custom shaders into them | Use Spline's built-in material system |

---

## Architecture

### Component Architecture

```
src/
  components/
    3d/
      SplineHero.tsx          # Lazy-loaded Spline scene wrapper
      SplineScene.tsx          # Core Spline component with theme/mode sync
      ParallaxFallback.tsx     # 2D CSS parallax for low-end devices
      GyroscopeProvider.tsx    # Device orientation hook + permission UI
      Scene3DProvider.tsx      # Context: GPU tier, 3D capability, scene ref
    animation/
      PageTransition.tsx       # UPDATED: conditionally use 3D camera transitions
  hooks/
    useGpuTier.ts              # detect-gpu wrapper, caches result
    useDeviceOrientation.ts    # Gyroscope data + iOS permission flow
    useSplineTheme.ts          # Syncs themeStore (preset + mode) to Spline variables
    use3DCapability.ts         # Combines GPU tier + WebGL check + reduced-motion pref
  stores/
    scene3dStore.ts            # Zustand: spline app ref, 3D enabled flag, loading state
```

### System Layers

```
Layer 0: GPU Detection (runs once on app start)
  |
  v
Layer 1: Scene3DProvider (context: can3D, gpuTier, isLoading)
  |
  +-- [can3D = true] --> Layer 2: Lazy Spline Scene
  |                         |
  |                         +-- SplineHero.tsx (React.lazy + Suspense)
  |                         |     |
  |                         |     +-- SplineScene.tsx (actual <Spline /> component)
  |                         |           |
  |                         |           +-- useSplineTheme (sets variables on theme change)
  |                         |           +-- GyroscopeProvider (mobile parallax input)
  |                         |           +-- Camera state manager (page transitions)
  |                         |
  |                         +-- PageTransition integration (3D camera)
  |
  +-- [can3D = false] --> Layer 2: Fallback
                            |
                            +-- ParallaxFallback.tsx (CSS layers + Framer Motion)
                            +-- Existing PageTransition.tsx (Framer Motion, unchanged)
```

### Data Flow: Theme to 3D Scene

```
themeStore.preset (warm-orange | gold | clean-white)
  --> useSplineTheme hook
    --> splineApp.setVariable('lightingHue', hueValue)
    --> splineApp.setVariable('lightingIntensity', intensityValue)
    --> splineApp.setVariable('lightingSaturation', satValue)

themeStore.mode (light | dark)
  --> useSplineTheme hook
    --> splineApp.setVariable('isDarkMode', boolean)
    --> [triggers Spline transition between "noir" and "studio" lighting states]
```

**How Spline Variables Work:** In the Spline editor, create Number/Boolean variables (e.g., `lightingHue`, `isDarkMode`). Attach these variables to light object properties (color H/S/L, intensity). From React code, call `splineApp.setVariable('lightingHue', 38)` for warm-orange, `80` for gold, `250` for clean-white. The Spline scene updates reactively.

**Confidence:** MEDIUM -- `setVariable()` API verified in runtime TypeScript definitions and documentation. Exact variable-to-light-property binding is editor-side configuration, not code-side. The approach is sound but the specific Spline editor workflow for connecting variables to light colors needs validation during scene design.

### Data Flow: Page Navigation to Camera Transition

```
react-router location change (e.g., / --> /trending)
  --> AppShell detects route
    --> scene3dStore.triggerCameraTransition('trending')
      --> splineApp.findObjectByName('Camera')
        --> cameraObject.transition({
              to: 'trending-view',
              duration: 400,
              easing: 'EASE_IN_OUT'
            })
```

**How Camera States Work:** In the Spline editor, select the Camera object, create named states (e.g., "home-view", "trending-view", "discover-view"), position the camera differently in each state. From code, call `transition()` on the camera object to smoothly animate between states. The `transition()` API accepts `to`, `from`, `duration`, `delay`, and `easing` parameters.

**Camera Transition Style Recommendation (Claude's Discretion):** Use a **lateral track** (horizontal camera slide) for sibling page transitions (Trending <-> Dinner Time <-> Free Movies) and a **dolly push** (forward camera movement + slight zoom) for hierarchical transitions (Home -> any feature page). This creates spatial meaning -- sibling pages feel "next to each other" while diving into a feature feels like "going deeper." Duration: 350-450ms to match existing Framer Motion page transition timing.

**Confidence:** MEDIUM -- `transition()` API confirmed in runtime TypeScript definitions with `TransitionParams` type. Camera-as-SPEObject confirmed (can find by name, has states). The specific UX of camera transitions is design-dependent and needs iteration.

### Integration with Existing AppShell

The 3D scene should render as a **fixed background layer behind the existing content**, matching the pattern already established by the ambient gradient blobs in `AppShell.tsx`:

```
Existing AppShell layers:
  z-0: Fixed gradient blobs (ambient background)
  z-1: Main content (pages via Outlet)

With 3D:
  z-0: Fixed gradient blobs (KEEP as fallback / blend base)
  z-0.5: Spline canvas (fixed, behind content, partially transparent)
  z-1: Main content (pages via Outlet, UNCHANGED)
```

The Spline scene sits between the gradient blobs and the content. On the HomePage, the scene is most visible (hero area above the bento grid). On other pages, the scene is mostly occluded by page content but camera position shifts create the illusion of cinematic movement between views.

**Confidence:** MEDIUM -- this integration pattern is an architectural recommendation based on the existing AppShell structure. The exact z-indexing and opacity blending will need visual iteration.

### 3D Load Timing (Claude's Discretion)

**Recommendation: Progressive load after splash screen completes.**

1. App launches -> Splash screen plays (~2.5s)
2. Splash completes -> App renders with 2D gradient blobs (existing behavior)
3. `useGpuTier` runs asynchronously (detect-gpu, ~100ms)
4. If GPU tier >= 2: `React.lazy` dynamically imports `SplineHero`
5. Spline runtime + .splinecode load in background (~2-4s on fast connection)
6. Scene fades in over gradient blobs with a 0.5s opacity transition
7. Until 3D loads, user sees existing gradient blobs -- no blank space, no layout shift

This ensures:
- LCP is not blocked by 3D loading (Lighthouse score protected)
- No CLS from canvas insertion (fixed position, pre-sized container)
- Users on slow connections still get full app functionality immediately
- 3D feels like a premium enhancement, not a loading bottleneck

### Degradation Strategy (Claude's Discretion)

```typescript
// use3DCapability.ts
type Capability = 'full-3d' | 'reduced-3d' | 'fallback-2d';

function determine3DCapability(gpuTier: number, isMobile: boolean): Capability {
  // Tier 0: No WebGL or blocklisted GPU
  if (gpuTier === 0) return 'fallback-2d';

  // Tier 1: Can render WebGL but < 30fps expected
  if (gpuTier === 1) return 'fallback-2d';

  // Tier 2: 30+ fps -- mobile gets reduced, desktop gets full
  if (gpuTier === 2) return isMobile ? 'reduced-3d' : 'full-3d';

  // Tier 3: 60+ fps -- full 3D everywhere
  return 'full-3d';
}
```

| Capability | What renders | Camera transitions |
|------------|-------------|-------------------|
| `full-3d` | Full Spline scene, all props, particles, mouse/gyro parallax | 3D camera state transitions |
| `reduced-3d` | Spline scene with reduced complexity (fewer particles, lower texture res) | 3D camera transitions at 30fps target |
| `fallback-2d` | CSS parallax layers with Framer Motion depth | Existing Framer Motion page transitions (unchanged) |

Also respect `prefers-reduced-motion`: if enabled, force `fallback-2d` regardless of GPU tier. This aligns with the existing `MotionProvider` that sets `reducedMotion="user"`.

**Confidence:** HIGH for detect-gpu tier system (well-documented). MEDIUM for the specific tier cutoffs (may need real-device testing to calibrate).

### 2D Parallax Fallback Architecture

```typescript
// ParallaxFallback.tsx
// 4-5 layered divs with CSS perspective + translateZ
// Each layer contains film-themed imagery (film reel SVG, spotlight gradient, etc.)
// Mouse position drives layer offsets via Framer Motion useMotionValue + useTransform
// Gyroscope data (if available) drives offsets on mobile
// Layer speeds: background 0.3x, mid 0.6x, foreground 1.0x
```

The fallback uses CSS `transform: perspective(1000px) translateZ()` with `transform-style: preserve-3d` on a container div. Child layers at different `translateZ` depths naturally parallax when the container rotates slightly with mouse/gyro input. This is GPU-accelerated (compositor thread), zero WebGL overhead, and achieves a convincing depth effect.

**Confidence:** HIGH -- CSS perspective parallax is a well-established technique with broad browser support.

---

## Pitfalls & Risks

### Critical Pitfalls

#### Pitfall 1: Spline Runtime Destroys Lighthouse Score
**What goes wrong:** The @splinetool/runtime is ~544 KB gzipped and requires 17+ seconds of CPU time even for simple scenes. If loaded synchronously or during the critical rendering path, Lighthouse performance score drops well below 90. Total Blocking Time (TBT) and Time to Interactive (TTI) are the primary victims.

**Why it happens:** Spline's runtime is a full WebGL engine. It parses scene geometry, builds WebGL buffers, compiles shaders, and initializes the render pipeline -- all on the main thread.

**Consequences:** PERF-04 failure (Lighthouse < 90). Slow first interaction. Users on mid-range devices see jank.

**Prevention:**
- Dynamic import via `React.lazy()` -- Spline runtime is never in the initial bundle
- Load 3D only after LCP event fires (or after splash screen completes)
- Use `requestIdleCallback` or `setTimeout` to defer Spline initialization
- Separate Vite chunk (`spline-vendor`) ensures no accidental bundling
- Pre-size the canvas container to prevent CLS

**Detection:** Run Lighthouse in CI. TBT spike > 200ms after 3D loads = warning.

**Confidence:** HIGH -- the 17.9s CPU time figure is from a real benchmark (Envato Tuts+ article).

#### Pitfall 2: CLS from Delayed Canvas Insertion
**What goes wrong:** When Spline loads asynchronously, the canvas element appears after initial layout, pushing content down. CLS score degrades to 0.24 (measured in real-world testing), near the "poor" threshold of 0.25.

**Why it happens:** Canvas has no intrinsic dimensions until Spline initializes. Browser reflows when the element appears.

**Prevention:** Wrap the Spline component in a `div` with explicit `width` and `height` (or `aspect-ratio`) set via CSS before the scene loads. Use `position: fixed` for the background scene layer (fixed elements don't contribute to CLS).

**Detection:** CLS > 0.1 in Lighthouse. Visual content shift on load.

**Confidence:** HIGH -- CLS measurement (0.24 without fix, 0.0 with fix) from Envato Tuts+ benchmark.

#### Pitfall 3: Camera Transitions Feel Janky or Disconnected
**What goes wrong:** The Spline camera transitions between page states don't sync with React Router's route animation, creating a visual disconnect where the 3D camera moves independently from the content fade.

**Why it happens:** Two animation systems (Spline's internal transition engine and Framer Motion's AnimatePresence) run independently with no shared timing.

**Prevention:**
- Match camera transition duration exactly to `pageTransition` duration (currently 350ms)
- Trigger camera transition at the same moment as route change (in `AppShell`)
- Disable Framer Motion exit animation when 3D is active (the camera movement IS the transition)
- Test on actual devices -- monitor frames where both systems are mid-transition

**Detection:** Visual review. Side-by-side recording of 3D camera vs content transition.

**Confidence:** MEDIUM -- this is an integration challenge that depends on precise timing coordination.

#### Pitfall 4: Memory Leaks from Undisposed Spline Scenes
**What goes wrong:** Spline's WebGL context and GPU buffers are not released when the React component unmounts, leading to progressive memory bloat.

**Why it happens:** WebGL contexts are limited (typically 8-16 per browser tab). If Spline scenes mount/unmount without proper cleanup, contexts accumulate.

**Prevention:**
- Call `splineApp.dispose()` in the `useEffect` cleanup function
- Use a single persistent Spline scene (mounted once in AppShell, never unmounted)
- If scene must unmount, verify via Chrome DevTools > Performance > Memory that GPU memory decreases

**Detection:** Chrome DevTools memory panel. GPU memory growth over time.

**Confidence:** HIGH -- react-spline docs confirm the library handles cleanup in `useEffect`, but the single-scene-persistent-mount pattern is safer.

### Moderate Pitfalls

#### Pitfall 5: iOS Gyroscope Permission Denied
**What goes wrong:** iOS requires `DeviceOrientationEvent.requestPermission()` called from a user gesture. If the permission prompt is shown at the wrong time or dismissed, gyroscope data is unavailable.

**Prevention:**
- Show a tasteful "Enable immersive tilt" button/card on first mobile visit
- Only call `requestPermission()` on button tap (not on page load)
- Gracefully degrade to touch-drag parallax if permission denied
- Cache permission result in localStorage to avoid re-prompting

**Confidence:** HIGH -- iOS permission requirement since iOS 13 is well-documented (MDN, Apple Developer Forums).

#### Pitfall 6: Self-Hosting .splinecode File Goes Stale
**What goes wrong:** The .splinecode file is downloaded from Spline and placed in `/public/3d-models/`. When the scene is updated in Spline editor, the local file is not automatically updated.

**Prevention:**
- Document the scene update workflow in CLAUDE.md
- Consider a simple script: `curl -o public/3d-models/scene.splinecode [SPLINE_URL]`
- Use Spline's "Production draft" feature to manage versioning

**Confidence:** HIGH -- self-hosting pattern confirmed in Spline docs and community repos.

#### Pitfall 7: Live TMDB Poster Textures in 3D Scene
**What goes wrong:** Fetching live poster images and applying them as textures in the Spline scene at runtime is complex. Spline's variable system supports string/number/boolean but NOT dynamic texture URLs. You cannot programmatically change a material's texture image via `setVariable()`.

**Why it happens:** Spline scenes are pre-baked. Textures are embedded in the .splinecode file at export time.

**Prevention:**
- Use static poster images baked into the .splinecode file for most props
- For "live" posters, render them as HTML overlay elements positioned over the 3D canvas (CSS pointer-events: none), using CSS `transform: perspective()` to match the 3D scene's depth
- Alternative: Use the r3f-spline bridge with Three.js `TextureLoader` to swap textures at runtime (but this adds Three.js to the bundle)

**Confidence:** MEDIUM -- Spline's variable types (number/string/boolean) are confirmed. The inability to set texture URLs via variables is inferred from the API surface. Needs validation.

### Minor Pitfalls

#### Pitfall 8: Multiple WebGL Contexts
**What goes wrong:** If other libraries in the app also create WebGL contexts (e.g., future canvas-based features), the browser may hit its context limit.

**Prevention:** Keep to one Spline scene (one context). Monitor total contexts in DevTools.

#### Pitfall 9: Spline Scene Too Large
**What goes wrong:** A detailed cinematic scene with photorealistic materials, multiple props, and particle systems could exceed 5 MB as a .splinecode file, causing slow loads on mobile.

**Prevention:**
- Target < 2 MB for the .splinecode file
- Use Spline's Performance Panel during design
- Limit to < 3 lights
- Keep polygon count low (1-2 subdivision levels)
- Enable compression in Spline export settings (select "Performance" geometry quality)
- Enable image compression for textures

---

## Spline Editor Design Specifications

These specifications guide whoever designs the Spline scene (may need Spline design tool expertise):

### Scene Variables to Create

| Variable Name | Type | Values | Connected To |
|---------------|------|--------|-------------|
| `lightingHue` | Number | 38 (warm-orange), 80 (gold), 250 (clean-white) | Main spotlight color H component |
| `lightingSaturation` | Number | 0.22 (warm-orange), 0.14 (gold), 0.003 (clean-white) | Main spotlight color S component |
| `lightingIntensity` | Number | 0.7 (dark), 1.0 (light) | Overall light intensity |
| `isDarkMode` | Boolean | true/false | Ambient light darkness, fog density, background color |

### Camera States to Create

| State Name | Camera Position Description | Used When |
|------------|---------------------------|-----------|
| `home-view` | Wide establishing shot of cinematic studio, centered | HomePage (default) |
| `trending-view` | Lateral track right, slight zoom to trending area | /trending |
| `discover-view` | Dolly push forward into discovery area | /discover |
| `dinner-view` | Lateral track left | /dinner-time |
| `free-view` | Lateral track further left | /free-movies |

### Props to Model

| Prop | Animation | Material |
|------|-----------|----------|
| Film reel | Slow continuous rotation (2 RPM) | Metallic, reflective |
| Clapperboard | Slight rock on spotlight catch | Wood + metal hinge |
| Vintage camera (tripod) | Static, subtle spotlight sweep | Metal body, leather grip |
| Director's chair | Static | Wood frame, leather/canvas seat |
| Floating movie posters (4-6) | Gentle drift/bob, atmospheric haze | Flat planes with poster textures |
| Spotlights (2-3) | Slow sweep, volumetric glow | Emissive |
| Particle system | Dust motes in spotlight beams | Small, low-count (<50 particles) |

### Performance Budget

| Metric | Target | Max |
|--------|--------|-----|
| .splinecode file size | < 1.5 MB | 2.5 MB |
| Polygon count | < 50K total | 100K |
| Texture count | < 8 | 12 |
| Light count | 2-3 | 3 |
| Particle count | < 50 | 100 |
| Draw calls (mobile) | < 60 | 100 |

---

## Roadmap Implications

### Suggested Phase Structure

**Sub-phase 7.1: Foundation & Detection (2-3 tasks)**
- Implement `useGpuTier` hook with detect-gpu
- Implement `use3DCapability` hook combining GPU tier + WebGL check + reduced-motion
- Create `Scene3DProvider` context with capability state
- Create `scene3dStore` Zustand store
- Update Vite config for spline-vendor chunk

**Sub-phase 7.2: 2D Parallax Fallback (2-3 tasks)**
- Build `ParallaxFallback.tsx` with CSS perspective layers
- Implement mouse-tracking parallax via Framer Motion useMotionValue
- Wire into HomePage as conditional render based on capability
- This delivers value immediately for ALL users (fallback IS the default)

**Sub-phase 7.3: Spline Scene Integration (3-4 tasks)**
- Design the Spline scene in Spline editor (external tool work)
- Export .splinecode, self-host in `/public/3d-models/`
- Build `SplineHero.tsx` with React.lazy + Suspense
- Build `SplineScene.tsx` with onLoad callback, fixed-size wrapper
- Implement progressive load timing (after splash, fade-in)

**Sub-phase 7.4: Theme & Mode Sync (2 tasks)**
- Build `useSplineTheme` hook subscribing to themeStore
- Map preset/mode changes to Spline variables (setVariable calls)
- Test transitions between all 6 theme variants (3 presets x 2 modes)

**Sub-phase 7.5: Mobile Gyroscope (2 tasks)**
- Build `useDeviceOrientation` hook with iOS permission flow
- Build `GyroscopeProvider` with permission prompt UI
- Connect gyroscope data to Spline scene input (mouse-like behavior)

**Sub-phase 7.6: Camera Page Transitions (3-4 tasks)**
- Define camera states in Spline scene for each page
- Build camera transition manager in `scene3dStore`
- Integrate with AppShell route changes
- Conditionally disable Framer Motion exit animations when 3D active
- Test transition timing synchronization

**Sub-phase 7.7: Performance Audit & Polish (2-3 tasks)**
- Lighthouse audit on desktop (target >= 90)
- Real-device testing on mobile (target 30+ fps on tier-2 devices)
- Optimize .splinecode (polygon reduction, texture compression)
- Verify CLS = 0, no TBT regression on initial load

### Phase Ordering Rationale

1. **Detection first** (7.1) because every subsequent sub-phase conditionally depends on capability
2. **2D fallback second** (7.2) because it works for 100% of users and provides the non-3D branch for testing
3. **Spline integration third** (7.3) because it is the core deliverable and unblocks all subsequent features
4. **Theme sync fourth** (7.4) because it enhances the scene but doesn't block camera work
5. **Gyroscope fifth** (7.5) because mobile-specific and independent of camera transitions
6. **Camera transitions sixth** (7.6) because they are the highest-risk feature and benefit from a stable scene
7. **Performance audit last** (7.7) because it validates everything and may trigger optimization loops

### Research Flags

- **Sub-phase 7.3 (Spline scene design):** Likely needs Spline editor expertise. The scene must be designed in the Spline tool, not in code. This is an external dependency -- someone needs to use the Spline GUI to create the cinematic studio scene with proper states, variables, and camera positions. Claude can generate the code integration but cannot create .splinecode files.
- **Sub-phase 7.6 (Camera transitions):** Highest uncertainty. The `transition()` API on camera objects needs real testing. If camera state transitions feel sluggish or limited, the r3f-spline bridge becomes necessary, which changes the bundle strategy significantly.
- **Sub-phase 7.4 (Live posters):** Dynamic texture loading in Spline scenes may not be feasible via variables alone. The HTML overlay approach or r3f-spline bridge may be needed. Flag for validation early.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack (packages, versions) | HIGH | Verified via npm, GitHub, Bundlephobia |
| Spline API surface | HIGH | Verified via TypeScript definitions (runtime.d.ts) and official docs |
| Performance characteristics | HIGH | Real-world benchmarks from Envato Tuts+ article (17.9s CPU, CLS data) |
| Camera transition approach | MEDIUM | API confirmed in types, but real-world smoothness untested for this use case |
| Theme variable sync | MEDIUM | setVariable API confirmed, but variable-to-light-property wiring is editor-side |
| Dynamic poster textures | LOW | Spline variables don't support texture URLs; workaround approaches are speculative |
| Bundle size (gzipped) | MEDIUM | Runtime is ~544 KB gzipped per Envato article; unpacked 6.8 MB per npm |
| Gyroscope implementation | HIGH | Device Orientation API well-documented; iOS permission flow well-known |
| 2D parallax fallback | HIGH | CSS perspective parallax is a mature, well-established technique |
| Lighthouse >= 90 with 3D | MEDIUM | Achievable with aggressive lazy loading, but 3D CPU time is inherently high |

---

## Sources

### Official Documentation
- [Spline react-spline GitHub](https://github.com/splinetool/react-spline) -- Component API, props, events, lazy loading
- [Spline r3f-spline GitHub](https://github.com/splinetool/r3f-spline) -- React Three Fiber bridge
- [Spline Code API for Web](https://docs.spline.design/doc/code-api-for-web/docAaCtKnMkZ) -- Runtime API overview
- [Spline Variables Documentation](https://docs.spline.design/interaction-states-events-and-actions/variables) -- Variable types and usage
- [Spline Scene Optimization](https://docs.spline.design/exporting-your-scene/how-to-optimize-your-scene) -- Performance panel, polygon reduction
- [Spline Exporting as Code](https://docs.spline.design/doc/exporting-as-code/docDdDWmkQri) -- Export formats, self-hosting
- [Spline Transition Action](https://docs.spline.design/doc/transition-action/docXxZEdpc6G) -- State transitions, easing, duration

### Performance Analysis
- [Optimizing Spline 3D for Core Web Vitals (Envato Tuts+)](https://webdesign.tutsplus.com/how-to-optimize-spline-3d-scenes-for-speed-and-core-web-vitals--cms-108749a) -- Real benchmark data: 17.9s CPU time, CLS measurements, runtime compression

### Libraries
- [detect-gpu (pmndrs)](https://github.com/pmndrs/detect-gpu) -- GPU tier classification system
- [@splinetool/runtime npm](https://www.npmjs.com/package/@splinetool/runtime) -- Package size, version info
- [@splinetool/runtime Bundlephobia](https://bundlephobia.com/package/@splinetool/runtime) -- Bundle analysis

### Device Orientation
- [MDN Device Orientation API](https://developer.mozilla.org/en-US/docs/Web/API/Device_orientation_events/Detecting_device_orientation) -- API reference, permission model
- [Gyro-web: Device orientation in JavaScript](https://trekhleb.dev/blog/2021/gyro-web/) -- Implementation patterns, iOS permission flow

### Community & Analysis
- [react-spline Performance (DeepWiki)](https://deepwiki.com/splinetool/react-spline/5.2-optimizing-performance) -- Render-on-demand, lazy loading, resource cleanup
- [react-spline Advanced Usage (DeepWiki)](https://deepwiki.com/splinetool/react-spline/5-advanced-usage) -- Object manipulation, event triggering
- [Spline Camera Control Discussion](https://github.com/splinetool/react-spline/discussions/83) -- Camera control limitations
- [CPU Usage 99% Issue](https://github.com/splinetool/react-spline/discussions/126) -- Real performance problems
- [Spline Self-Hosted Demo](https://github.com/mandrasch/spline-selfhosted) -- Self-hosting patterns
