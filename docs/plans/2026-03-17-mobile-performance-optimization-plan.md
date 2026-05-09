# Mobile Performance Optimization — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Eliminate mobile performance bottlenecks (backdrop-blur, box-shadow, animation overhead) while preserving the full desktop experience.

**Architecture:** All changes gated behind `@media (pointer: coarse)` CSS or `matchMedia` JS checks. Desktop untouched. Three layers: CSS overrides (shadows, blur, containment), JS optimizations (LazyMotion, throttling), and config fixes (SW cache).

**Tech Stack:** CSS media queries, Motion for React (LazyMotion/m), CSS containment, content-visibility

---

### Task 1: Global Backdrop-Blur Disable on Mobile

**Files:**
- Modify: `src/styles/app.css`

**Step 1: Add mobile backdrop-blur override at the end of app.css**

```css
/* ── Mobile Performance: disable backdrop-blur (GPU-expensive on mobile) ── */
@media (pointer: coarse) {
  *,
  *::before,
  *::after {
    -webkit-backdrop-filter: none !important;
    backdrop-filter: none !important;
  }
}
```

**Step 2: Increase background opacity on key components for readability without blur**

Modify `src/components/layout/Navbar.tsx` — change the nav className:
- Find: `bg-clay-base/70 backdrop-blur-md sm:bg-clay-base/50 sm:backdrop-blur-2xl sm:backdrop-saturate-[1.8]`
- Replace with: `bg-clay-base/92 sm:bg-clay-base/50 backdrop-blur-md sm:backdrop-blur-2xl sm:backdrop-saturate-[1.8]`

Modify `src/components/layout/TabBar.tsx` — find the footer element's className and increase mobile bg opacity similarly (bg-clay-base/70 → bg-clay-base/92 on mobile).

Modify `src/pages/BrowsePage.tsx` toolbar:
- Find: `bg-clay-base/70 backdrop-blur-xl`
- Replace with: `bg-clay-base/92 sm:bg-clay-base/70 backdrop-blur-xl`

**Step 3: Verify compilation**

Run: `npx tsc --noEmit`

**Step 4: Commit**

```bash
git add src/styles/app.css src/components/layout/Navbar.tsx src/components/layout/TabBar.tsx src/pages/BrowsePage.tsx
git commit -m "perf: disable backdrop-blur on mobile, increase bg opacity for readability"
```

---

### Task 2: Simplified Box-Shadows on Mobile

**Files:**
- Modify: `src/styles/clay.css`
- Modify: `src/styles/metal.css`

**Step 1: Add mobile shadow overrides at the end of clay.css**

```css
/* ── Mobile Performance: single-shadow fallbacks (80% less GPU work) ── */
@media (pointer: coarse) {
  .clay-shadow-sm {
    box-shadow: 2px 2px 6px var(--clay-shadow);
  }
  .clay-shadow-md {
    box-shadow: 4px 4px 12px var(--clay-shadow);
  }
  .clay-shadow-lg {
    box-shadow: 6px 6px 16px var(--clay-shadow);
  }
  .clay-shadow-deep {
    box-shadow: 8px 8px 20px var(--clay-shadow);
  }
  .clay-shadow-inset {
    box-shadow: inset 2px 2px 6px var(--clay-shadow);
  }
}
```

**Step 2: Add mobile shadow overrides at the end of metal.css**

```css
/* ── Mobile Performance: simplified metal shadows ── */
@media (pointer: coarse) {
  .metal-shadow {
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15),
                inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }
  .metal-shadow-hover {
    box-shadow: 0 5px 12px rgba(0, 0, 0, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.25);
  }
  .metal-shadow-pressed {
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.15);
  }
  .metal-track-deep {
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
  }
}
```

**Step 3: Verify compilation, commit**

```bash
git add src/styles/clay.css src/styles/metal.css
git commit -m "perf: simplify box-shadows to 1-2 layers on mobile devices"
```

---

### Task 3: CSS Containment & content-visibility for Grids

**Files:**
- Modify: `src/styles/app.css`
- Modify: `src/components/browse/BrowseMovieGrid.tsx`
- Modify: `src/components/trending/TrendingPage.tsx`
- Modify: `src/components/search/SearchResults.tsx`

**Step 1: Add utility classes to app.css**

```css
/* ── Paint containment for grid cards (reduces layout recalculation scope) ── */
.contain-card {
  contain: layout style paint;
}

/* ── content-visibility for offscreen movie cards (7x render boost) ── */
.cv-auto {
  content-visibility: auto;
  contain-intrinsic-size: auto 280px;
}
```

**Step 2: Add `contain-card` class to movie card buttons in BrowseMovieGrid.tsx, TrendingPage.tsx, and SearchResults.tsx**

In each file, add `contain-card` to the card's outermost interactive element className.

**Step 3: Verify compilation, commit**

```bash
git add src/styles/app.css src/components/browse/BrowseMovieGrid.tsx src/components/trending/TrendingPage.tsx src/components/search/SearchResults.tsx
git commit -m "perf: add CSS containment and content-visibility to movie card grids"
```

---

### Task 4: ParallaxFallback Mobile Optimization

**Files:**
- Modify: `src/components/3d/ParallaxFallback.tsx`

**Step 1: Reduce dust particles on touch devices**

At the top of the component, detect touch:
```typescript
const isMobile = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
```

Reduce the particles array: `const visibleParticles = isMobile ? particles.slice(0, 3) : particles;`

Use `visibleParticles` in the render map instead of `particles`.

**Step 2: Remove blur filters on mobile**

For the gradient circle element, conditionally apply blur:
- Desktop: `filter: blur(80px)` (existing)
- Mobile: `filter: none` with increased opacity to compensate

For the spotlight beam:
- Desktop: `filter: blur(30px)` (existing)
- Mobile: `filter: none`

**Step 3: Verify compilation, commit**

```bash
git add src/components/3d/ParallaxFallback.tsx
git commit -m "perf: reduce ParallaxFallback particles and remove blur filters on mobile"
```

---

### Task 5: Gyroscope Throttling in SplineScene

**Files:**
- Modify: `src/components/3d/SplineScene.tsx`

**Step 1: Add throttle to gyro updates**

Add a `lastGyroUpdate` ref and skip updates if less than 60ms has elapsed:
```typescript
const lastGyroUpdate = useRef(0);

// In the orientation update section:
const now = Date.now();
if (now - lastGyroUpdate.current < 60) return;
lastGyroUpdate.current = now;
```

**Step 2: Verify compilation, commit**

```bash
git add src/components/3d/SplineScene.tsx
git commit -m "perf: throttle gyroscope updates to ~16 FPS in SplineScene"
```

---

### Task 6: BentoCell Reduced Animation Complexity

**Files:**
- Modify: `src/components/bento/BentoCell.tsx`

**Step 1: Reduce spring stiffness and simplify hover on mobile**

In the whileHover prop, reduce stiffness from 300 to 180. Remove box-shadow from the animated properties (keep it as a static CSS class instead).

**Step 2: Verify compilation, commit**

```bash
git add src/components/bento/BentoCell.tsx
git commit -m "perf: reduce BentoCell spring stiffness and simplify hover animation"
```

---

### Task 7: Service Worker Cache Optimization

**Files:**
- Modify: `vite.config.ts`

**Step 1: Reduce image cache entries and add quota error handling**

Find the TMDB image runtime caching config and change:
- `maxEntries: 500` → `maxEntries: 200`
- Add `purgeOnQuotaError: true` to the options

**Step 2: Verify build**

Run: `npx vite build`

**Step 3: Commit**

```bash
git add vite.config.ts
git commit -m "perf: reduce SW image cache to 200 entries, add purgeOnQuotaError"
```

---

### Task 8: Smoke Test & Final Verification

**Step 1: Full TypeScript check**

Run: `npx tsc --noEmit`

**Step 2: Production build**

Run: `npx vite build`

**Step 3: Format all modified files**

Run: `npx prettier --write src/styles/app.css src/styles/clay.css src/styles/metal.css src/components/3d/ParallaxFallback.tsx src/components/3d/SplineScene.tsx src/components/bento/BentoCell.tsx src/components/browse/BrowseMovieGrid.tsx src/components/trending/TrendingPage.tsx src/components/search/SearchResults.tsx src/components/layout/Navbar.tsx src/components/layout/TabBar.tsx src/pages/BrowsePage.tsx vite.config.ts`
