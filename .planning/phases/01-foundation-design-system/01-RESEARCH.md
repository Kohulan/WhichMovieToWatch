# Phase 1: Foundation & Design System - Research

**Researched:** 2026-02-15
**Domain:** React 19 + Vite 6 + TypeScript scaffolding, claymorphism design system, skeuomorphic controls, theme system
**Confidence:** HIGH

## Summary

Phase 1 establishes the entire project foundation: a React 19 + Vite 6 + TypeScript 5.7 scaffold with Tailwind CSS v4 (CSS-first configuration via `@theme`), Zustand for state with localStorage persistence, and HashRouter for GitHub Pages SPA routing. On top of this foundation sits a bold claymorphism design system with two distinct material languages -- clay surfaces for passive elements and skeuomorphic metal hardware for interactive controls -- across three dramatically different color presets (Cinema Gold, Ocean Blue, Neon Purple), each with light and dark variants.

The claymorphism implementation uses layered `box-shadow` (two inset + one outset), large border-radius (16-50px), and an SVG `feTurbulence` noise overlay for clay texture. Skeuomorphic hardware controls use multi-stop linear gradients at 45 degrees to simulate brushed metal reflections. Theme switching is powered by CSS custom properties defined in Tailwind v4's `@theme inline` directive, overridden per-preset and per-mode via CSS classes on `<html>`. Framer Motion (now the `motion` package) provides spring-physics animations for clay deformation on hover/press and the signature "clay reshape" transition when switching themes.

**Primary recommendation:** Scaffold with `npm create vite@latest -- --template react-ts`, install Tailwind v4 via `@tailwindcss/vite` plugin (no PostCSS config needed), define all design tokens as CSS custom properties in a single `@theme inline` block, and implement theme switching by toggling CSS classes that override those properties. Use the `motion` package (not `framer-motion`) for React 19 compatibility.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Claymorphism visual style
- Bold, full clay toy feel -- pronounced puffy 3D look, not subtle
- Visible plasticine/clay texture overlay on surfaces (not smooth/glossy)
- Tinted clay -- surfaces take on the active theme color as a tint (gold-tinted clay for Cinema Gold, blue-tinted for Ocean Blue, etc.)
- Dark mode uses dark-colored clay material (deep charcoal/navy), not dimmed lighting -- rich and saturated
- Layered clay approach: subtle flat clay base for background, elevated clay components (cards, modals) on top for depth hierarchy
- Interaction: both shape deformation AND lighting shift on hover/press (clay depresses on press, lifts on hover, shadow angle changes)
- Framer Motion spring animations for all clay interaction responses (within Phase 1 scope for component-level transitions; full page animations in Phase 5)

#### Skeuomorphic hardware controls
- All interactive controls (buttons, toggles, sliders, checkboxes, dropdowns) styled as premium hardware -- brushed metal, precision feel
- Contrasting metal finish against clay surfaces -- buttons clearly look like a different material for visual hierarchy
- Text inputs and text fields are indented clay (pressed into surface) -- material matches function: clay for passive elements, hardware for interactive ones
- Design rule: Clay = surfaces, containers, text inputs (things you look at). Hardware = buttons, toggles, sliders, checkboxes, dropdowns (things you interact with)

#### Theme switching experience
- Theme controls always visible in top nav bar -- toggle + preset dial side by side
- Dark/light toggle is a skeuomorphic hardware toggle switch matching the premium aesthetic
- Color preset switcher is a skeuomorphic rotary dial/knob -- premium hardware-style selector that clicks between 3 positions
- Dial has click animation + subtle "tick" sound when landing on a preset -- real rotary switch feel
- Theme transition uses "clay reshape" animation -- elements briefly flatten then re-inflate with new colors (Framer Motion springs)
- First visit: respects system dark/light preference, defaults to Cinema Gold preset
- Theme preferences stored per-device in localStorage (no cross-device sync)

#### Color presets -- dramatically different worlds
- **Cinema Gold:** Modern cinema premium -- muted gold, charcoal, subtle brass. Luxury cinema lounge feel, refined not flashy
- **Ocean Blue:** Deep ocean -- navy, teal, seafoam accents. Deep and immersive, calm but powerful
- **Neon Purple:** Cyberpunk/synthwave -- electric purple, hot pink, neon cyan accents. Blade Runner vibes, dramatic, high contrast, futuristic
- Each preset dramatically transforms the entire experience -- like entering a different room, not just changing an accent color
- Clay surfaces tinted per preset (warm gold clay, deep blue clay, electric purple clay)

#### Component library -- full clay/skeuo treatment
- Full set in Phase 1: cards, buttons, toggles, modals, inputs, dropdowns, sliders -- complete design system, not partial
- Medium sizing -- balanced density with standard padding, enough room for clay effects without feeling sparse
- Modals are floating clay panels with backdrop blur/dim -- still clay-styled but clearly a separate hovering layer
- All base components must work at 375px, 768px, 1024px, 1440px breakpoints

### Claude's Discretion
- Metal finish per color preset (matched metals like brass/chrome/gunmetal vs universal finish) -- pick what creates best cohesion
- Exact clay texture implementation approach (CSS noise, SVG filters, etc.)
- Spring animation parameters for clay reshape transitions
- Loading skeleton design within clay aesthetic
- Error state visual treatment
- Exact spacing scale and typography choices
- Sound file format and implementation for dial tick

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.x | UI framework | Latest stable with compiler auto-memoization, concurrent rendering, `use` hook, ref-as-prop |
| Vite | 6.x | Build tool + dev server | Native ESM dev server with <100ms HMR, Rollup-based production builds, zero-config TypeScript |
| TypeScript | 5.7.x | Type safety | Included in Vite's `react-ts` template, stricter inference, better DX |
| Tailwind CSS | 4.x | Utility-first CSS | CSS-first config via `@theme` directive (no `tailwind.config.js`), design token system via CSS custom properties, Vite plugin (no PostCSS setup) |
| motion | 11.x+ | Animation library | Renamed from `framer-motion`, React 19 compatible, spring physics, layout animations, AnimatePresence |
| Zustand | 5.x | State management | Minimal API, persist middleware with localStorage, no boilerplate, tree-shakable |
| react-router | 7.x | Client-side routing | HashRouter for GitHub Pages SPA, `createHashRouter` data API, imports from `react-router` (not `react-router-dom`) |
| Lucide React | latest | SVG icon system | 1000+ icons, tree-shakable named imports, TypeScript support, shadcn/ui default |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @tailwindcss/vite | 4.x | Tailwind Vite plugin | Required for Tailwind v4 -- replaces PostCSS config entirely |
| @fontsource/righteous | latest | Heading font (self-hosted) | Eliminates external Google Fonts request, ~300ms faster load |
| @fontsource/poppins | latest | Body font (self-hosted) | Same benefit as above, import only needed weights (400, 500, 600, 700) |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Tailwind v4 | CSS Modules | More CSS authoring freedom but lose utility-first speed and `@theme` design token system |
| Zustand | Jotai | Atomic state model good for derived state but overkill for simple preferences store |
| motion | react-spring | Lower-level spring API but less integrated with React layout/presence patterns |
| Lucide React | React Icons | React Icons bundles multiple icon sets (heavier), Lucide is focused and tree-shakable |
| Fontsource | Google Fonts CDN | CDN adds extra DNS lookup + blocked rendering; self-hosting is faster with HTTP/2 |

**Installation:**
```bash
npm create vite@latest whichmovietowatch -- --template react-ts
cd whichmovietowatch
npm install
npm install tailwindcss @tailwindcss/vite
npm install motion
npm install zustand
npm install react-router
npm install lucide-react
npm install @fontsource/righteous @fontsource/poppins
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── components/
│   ├── ui/                    # Design system primitives
│   │   ├── ClayCard.tsx
│   │   ├── ClayModal.tsx
│   │   ├── ClayInput.tsx
│   │   ├── ClayBadge.tsx
│   │   ├── ClaySkeletonCard.tsx
│   │   ├── MetalButton.tsx
│   │   ├── MetalToggle.tsx
│   │   ├── MetalSlider.tsx
│   │   ├── MetalCheckbox.tsx
│   │   ├── MetalDropdown.tsx
│   │   ├── RotaryDial.tsx
│   │   └── index.ts           # Barrel export
│   └── layout/
│       ├── Navbar.tsx          # Theme controls live here
│       └── AppShell.tsx
├── hooks/
│   ├── useTheme.ts            # Theme state + system detection
│   └── useSound.ts            # Audio playback for dial tick
├── stores/
│   └── themeStore.ts          # Zustand persist store for theme prefs
├── styles/
│   ├── app.css                # @import "tailwindcss" + @theme tokens
│   ├── clay.css               # Claymorphism base styles + texture
│   └── metal.css              # Skeuomorphic hardware styles
├── lib/
│   └── theme-tokens.ts        # Theme preset color definitions (TS constants)
├── App.tsx
├── main.tsx
└── vite-env.d.ts
```

### Pattern 1: Tailwind v4 CSS-First Theme Tokens

**What:** Define all design tokens as CSS custom properties using `@theme inline`, then override via CSS classes for presets and modes.
**When to use:** Always -- this is the single source of truth for the entire design system.

```css
/* src/styles/app.css */
@import "tailwindcss";

@theme inline {
  /* Map to CSS variables that get overridden per-theme */
  --color-clay-base: var(--clay-base);
  --color-clay-surface: var(--clay-surface);
  --color-clay-elevated: var(--clay-elevated);
  --color-clay-shadow: var(--clay-shadow);
  --color-clay-highlight: var(--clay-highlight);
  --color-clay-text: var(--clay-text);
  --color-clay-text-muted: var(--clay-text-muted);
  --color-metal-base: var(--metal-base);
  --color-metal-shine: var(--metal-shine);
  --color-metal-dark: var(--metal-dark);
  --color-accent: var(--accent);
  --color-accent-hover: var(--accent-hover);
  --radius-clay: 1.5rem;
  --radius-clay-lg: 2rem;
  --radius-clay-xl: 3rem;
  --shadow-clay-sm: /* small clay shadow */;
  --shadow-clay-md: /* medium clay shadow */;
  --shadow-clay-lg: /* large clay shadow */;
  --font-heading: 'Righteous', cursive;
  --font-body: 'Poppins', sans-serif;
}

/* Cinema Gold Light (default) */
:root,
.theme-cinema-gold {
  --clay-base: oklch(0.92 0.03 85);
  --clay-surface: oklch(0.95 0.025 85);
  --clay-elevated: oklch(0.97 0.02 85);
  --clay-shadow: oklch(0.55 0.05 85);
  --clay-highlight: oklch(0.99 0.01 85);
  --clay-text: oklch(0.25 0.02 85);
  --clay-text-muted: oklch(0.5 0.03 85);
  --metal-base: oklch(0.75 0.02 85);
  --metal-shine: oklch(0.92 0.01 85);
  --metal-dark: oklch(0.45 0.03 85);
  --accent: oklch(0.7 0.12 85);
  --accent-hover: oklch(0.65 0.14 85);
}

/* Cinema Gold Dark */
.dark.theme-cinema-gold {
  --clay-base: oklch(0.22 0.03 85);
  --clay-surface: oklch(0.28 0.025 85);
  --clay-elevated: oklch(0.32 0.02 85);
  --clay-shadow: oklch(0.12 0.04 85);
  --clay-highlight: oklch(0.4 0.02 85);
  --clay-text: oklch(0.92 0.015 85);
  --clay-text-muted: oklch(0.7 0.02 85);
  --metal-base: oklch(0.5 0.02 85);
  --metal-shine: oklch(0.7 0.01 85);
  --metal-dark: oklch(0.3 0.03 85);
  --accent: oklch(0.75 0.12 85);
  --accent-hover: oklch(0.7 0.14 85);
}
```

### Pattern 2: Zustand Persist Store for Theme Preferences

**What:** Single Zustand store for all theme state, persisted to localStorage with synchronous hydration.
**When to use:** Theme mode (light/dark) and preset (cinema-gold/ocean-blue/neon-purple) selection.

```typescript
// src/stores/themeStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type ColorPreset = 'cinema-gold' | 'ocean-blue' | 'neon-purple';
type ThemeMode = 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  preset: ColorPreset;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  setPreset: (preset: ColorPreset) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'light', // overridden by system detection on first visit
      preset: 'cinema-gold',
      setMode: (mode) => set({ mode }),
      toggleMode: () => set((s) => ({ mode: s.mode === 'light' ? 'dark' : 'light' })),
      setPreset: (preset) => set({ preset }),
    }),
    {
      name: 'theme-preferences',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

### Pattern 3: System Color Scheme Detection

**What:** Detect `prefers-color-scheme` on first visit, listen for changes, apply to store.
**When to use:** On app initialization, before first render when no stored preference exists.

```typescript
// src/hooks/useTheme.ts
import { useEffect } from 'react';
import { useThemeStore } from '../stores/themeStore';

export function useTheme() {
  const { mode, preset, setMode, toggleMode, setPreset } = useThemeStore();

  // Detect system preference on first visit
  useEffect(() => {
    const hasStored = localStorage.getItem('theme-preferences');
    if (!hasStored) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setMode(prefersDark ? 'dark' : 'light');
    }
  }, [setMode]);

  // Apply classes to <html> element
  useEffect(() => {
    const html = document.documentElement;
    html.classList.toggle('dark', mode === 'dark');
    html.className = html.className.replace(/theme-\S+/g, '');
    html.classList.add(`theme-${preset}`);
  }, [mode, preset]);

  // Listen for system preference changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setMode(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [setMode]);

  return { mode, preset, toggleMode, setPreset, setMode };
}
```

### Pattern 4: Vite Manual Chunks for Code Splitting

**What:** Configure `build.rollupOptions.output.manualChunks` to separate vendor libraries into cacheable chunks.
**When to use:** In `vite.config.ts` for production builds.

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/', // adjust for GitHub Pages if needed
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/motion') || id.includes('node_modules/framer-motion')) {
            return 'animation-vendor';
          }
          if (id.includes('node_modules/three') || id.includes('node_modules/@react-three')) {
            return 'three-vendor';
          }
        },
      },
    },
  },
});
```

### Pattern 5: HashRouter for GitHub Pages

**What:** Use `createHashRouter` from `react-router` for SPA routing on static hosting.
**When to use:** Required for GitHub Pages which doesn't support server-side URL rewriting.

```typescript
// src/main.tsx
import { createHashRouter, RouterProvider } from 'react-router';
import App from './App';

const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    children: [
      // routes added in later phases
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
```

### Anti-Patterns to Avoid

- **Don't use `tailwind.config.js` for theming:** Tailwind v4 uses `@theme` in CSS. The JS config file is legacy and won't be generated.
- **Don't import from `framer-motion`:** The package is renamed to `motion`. Import from `motion/react`.
- **Don't import from `react-router-dom`:** In v7, everything imports from `react-router` directly.
- **Don't use `useRef()` without arguments:** React 19 requires `useRef(null)` or `useRef(undefined)`.
- **Don't use `forwardRef`:** React 19 passes ref as a regular prop. `forwardRef` is no longer needed.
- **Don't create multiple Zustand stores for related state:** Keep theme mode + preset in a single store to avoid synchronization issues.
- **Don't reference `import.meta.env` variables dynamically:** Vite statically replaces them at build time. Always use full string like `import.meta.env.VITE_TMDB_API_KEY`.

## Discretionary Decisions (Recommendations)

### Metal Finish Per Color Preset: Use Matched Metals

**Recommendation:** Match metal finish to each color preset for maximum cohesion.

| Preset | Metal Finish | Rationale |
|--------|-------------|-----------|
| Cinema Gold | Warm brass/brushed gold | Natural pairing with gold clay tones, luxury cinema feel |
| Ocean Blue | Cool chrome/brushed steel | Cold metal matches deep ocean palette, industrial calm |
| Neon Purple | Gunmetal/dark chrome | Dark metal suits cyberpunk aesthetic, high contrast against neon accents |

**Implementation:** Define metal gradient stops per preset in the CSS custom property overrides. The 45-degree linear gradient structure stays the same, only the color stops change.

```css
.theme-cinema-gold {
  --metal-base: oklch(0.72 0.06 85);    /* warm brass */
  --metal-shine: oklch(0.88 0.04 85);
  --metal-dark: oklch(0.42 0.07 85);
}
.theme-ocean-blue {
  --metal-base: oklch(0.72 0.01 240);   /* cool chrome */
  --metal-shine: oklch(0.9 0.005 240);
  --metal-dark: oklch(0.45 0.015 240);
}
.theme-neon-purple {
  --metal-base: oklch(0.4 0.02 280);    /* gunmetal */
  --metal-shine: oklch(0.6 0.015 280);
  --metal-dark: oklch(0.22 0.025 280);
}
```

**Confidence:** HIGH -- this is a design decision backed by color theory (warm metals with warm palettes, cool metals with cool palettes).

### Clay Texture: SVG feTurbulence Filter

**Recommendation:** Use an inline SVG `<feTurbulence>` filter applied as a pseudo-element overlay. This provides visible plasticine/clay grain texture without loading external images.

```html
<!-- Hidden SVG in App root, referenced by CSS -->
<svg width="0" height="0" style="position:absolute">
  <filter id="clay-texture">
    <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
    <feColorMatrix type="saturate" values="0" />
    <feBlend in="SourceGraphic" mode="overlay" />
  </filter>
</svg>
```

```css
.clay-surface::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: url("data:image/svg+xml,..."); /* inline SVG noise */
  opacity: 0.08;
  pointer-events: none;
  mix-blend-mode: overlay;
}
```

**Alternative approach:** Generate noise via CSS `background-image` with a data URI SVG inline. More portable, no DOM element needed, same visual result. This is the recommended approach for Tailwind utility usage.

**Confidence:** HIGH -- SVG feTurbulence is supported in all modern browsers and is more performant than image-based textures.

### Spring Animation Parameters for Clay Reshape

**Recommendation:** Use these Framer Motion spring presets:

```typescript
// Clay interaction springs
export const claySpring = {
  hover: { type: 'spring', stiffness: 300, damping: 20, mass: 0.8 },   // lift up, quick response
  press: { type: 'spring', stiffness: 400, damping: 25, mass: 1.2 },   // depress, heavier feel
  release: { type: 'spring', stiffness: 200, damping: 15, mass: 0.6 }, // bounce back
};

// Theme reshape transition (signature animation)
export const reshapeSpring = {
  flatten: { type: 'spring', stiffness: 500, damping: 30, mass: 1.0 },  // quick flatten
  inflate: { type: 'spring', stiffness: 150, damping: 12, mass: 0.8 },  // slow, bouncy re-inflate
};
```

**Rationale:**
- Higher stiffness for press (400) makes clay feel firm/responsive
- Lower damping for release (15) adds a satisfying bounce-back
- Reshape uses high stiffness for flatten (fast squish) then low stiffness + low damping for inflate (slow, bouncy return) -- like real clay being remolded

**Confidence:** MEDIUM -- values will need visual tuning during implementation; these are informed starting points.

### Loading Skeleton Design

**Recommendation:** Clay-styled skeleton loaders that match the elevated clay surface appearance. Use the same `box-shadow` and `border-radius` as clay cards but with a shimmer gradient animation in place of content.

```css
.clay-skeleton {
  background: var(--clay-surface);
  border-radius: var(--radius-clay);
  box-shadow:
    8px 8px 16px var(--clay-shadow),
    inset -4px -4px 8px var(--clay-shadow),
    inset 0 6px 12px var(--clay-highlight);
  position: relative;
  overflow: hidden;
}

.clay-skeleton::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--clay-highlight) 50%,
    transparent 100%
  );
  animation: shimmer 1.5s ease-in-out infinite;
  background-size: 200% 100%;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

**Confidence:** HIGH -- standard shimmer technique adapted to clay aesthetic.

### Error State Visual Treatment

**Recommendation:** Error states use a red-tinted clay surface with a subtle crack texture. For form validation errors, the clay input indentation deepens slightly (increased inset shadow) and the border tints red. Toast/alert errors use a raised clay card with red tint and a warning icon from Lucide.

**Confidence:** MEDIUM -- visual design will need refinement during implementation.

### Spacing Scale and Typography

**Recommendation:** Use Tailwind's default spacing scale (4px base) with these typography settings:

```css
@theme inline {
  --font-heading: 'Righteous', cursive;
  --font-body: 'Poppins', sans-serif;
}
```

Typography scale using CSS clamp for fluid sizing:

| Element | Min (375px) | Preferred | Max (1440px) | Tailwind class |
|---------|-------------|-----------|--------------|----------------|
| H1 | 1.75rem | 3vw | 3rem | `text-[clamp(1.75rem,3vw,3rem)]` |
| H2 | 1.5rem | 2.5vw | 2.25rem | `text-[clamp(1.5rem,2.5vw,2.25rem)]` |
| H3 | 1.25rem | 2vw | 1.75rem | `text-[clamp(1.25rem,2vw,1.75rem)]` |
| Body | 0.875rem | 1vw | 1rem | `text-[clamp(0.875rem,1vw,1rem)]` |
| Small | 0.75rem | 0.8vw | 0.875rem | `text-[clamp(0.75rem,0.8vw,0.875rem)]` |

Font weight usage: Poppins 400 (body), 500 (emphasis), 600 (strong), 700 (bold accents). Righteous only regular 400 (display/heading use).

**Confidence:** MEDIUM -- clamp values need visual testing; scale is based on common practices.

### Sound File Format and Dial Tick Implementation

**Recommendation:** Use a short WAV or MP3 file (~50ms duration, <5KB) for the tick sound, loaded via the Web Audio API for zero-latency playback. The HTML5 `Audio()` constructor has a small delay on first play; Web Audio API buffers the sound upfront.

```typescript
// src/hooks/useSound.ts
const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
let tickBuffer: AudioBuffer | null = null;

export async function loadTickSound() {
  const response = await fetch('/sounds/dial-tick.mp3');
  const arrayBuffer = await response.arrayBuffer();
  tickBuffer = await audioContext.decodeAudioData(arrayBuffer);
}

export function playTick() {
  if (!tickBuffer) return;
  const source = audioContext.createBufferSource();
  source.buffer = tickBuffer;
  source.connect(audioContext.destination);
  source.start(0);
}
```

**Format recommendation:** MP3 for broadest browser support and smallest size. WAV as fallback. Keep file under 5KB for instant loading.

**Important caveat:** AudioContext must be created/resumed after a user gesture (browser autoplay policy). Initialize on first user interaction.

**Confidence:** HIGH -- Web Audio API is well-documented and supported across all modern browsers.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| State persistence to localStorage | Custom serialization/deserialization logic | Zustand persist middleware | Handles JSON serialization, hydration timing, partialize, and edge cases (race conditions fixed in v5.0.10) |
| Dark mode detection | Manual `matchMedia` wiring everywhere | `useTheme` hook wrapping Zustand store | Single source of truth, auto-syncs with system changes, persists preference |
| Icon system | Custom SVG sprite or inline SVGs | Lucide React | 1000+ icons, tree-shakable, TypeScript props, consistent 24px grid |
| Font loading | Manual `@font-face` declarations | Fontsource packages | Pre-bundled, optimized subsets, Vite-friendly imports, no FOIT/FOUT complexity |
| CSS design tokens | Manual CSS variable management | Tailwind v4 `@theme inline` | Auto-generates utilities from tokens, single source of truth, IDE support |
| Code splitting | Manual `React.lazy` for every vendor | Vite `manualChunks` | Declarative chunk naming, automatic cache busting, handles circular dependencies |
| Routing on GitHub Pages | 404.html redirect hack | HashRouter via `react-router` | Zero server config, works with all static hosts, no redirect latency |
| Audio playback with low latency | `new Audio()` element | Web Audio API with pre-buffered AudioBuffer | Zero latency on repeat plays, no re-fetch, precise timing control |

**Key insight:** This phase has zero API/data concerns -- it is purely UI foundation. Every "don't hand-roll" item is about avoiding common build/styling/state infrastructure pitfalls that slow down later phases.

## Common Pitfalls

### Pitfall 1: Tailwind v4 Configuration Confusion

**What goes wrong:** Developers create a `tailwind.config.js` or `postcss.config.js` by habit, then theme tokens don't work or duplicate.
**Why it happens:** Tailwind v3 muscle memory. Every tutorial before 2025 shows the old config approach.
**How to avoid:** No `tailwind.config.js` file. No `postcss.config.js`. Use `@tailwindcss/vite` plugin only. All configuration lives in CSS via `@import "tailwindcss"` and `@theme`.
**Warning signs:** Utility classes not being generated, "unknown at rule" warnings, duplicate styles.

### Pitfall 2: Framer Motion / Motion Package Import Path

**What goes wrong:** Code imports from `framer-motion` instead of `motion/react`, causing React 19 incompatibility or bundle issues.
**Why it happens:** The library was renamed. Most tutorials and StackOverflow answers still reference `framer-motion`.
**How to avoid:** Install `motion` (not `framer-motion`). Import everything from `motion/react`.
**Warning signs:** Peer dependency warnings, `forwardRef` deprecation errors in React 19, drag undefined errors in Strict Mode.

### Pitfall 3: React Router v7 Package Imports

**What goes wrong:** Installing `react-router-dom` separately and importing HashRouter from it.
**Why it happens:** Every v5/v6 tutorial uses `react-router-dom`.
**How to avoid:** Install only `react-router`. Import `createHashRouter`, `RouterProvider`, etc. from `react-router`.
**Warning signs:** Duplicate React Router instances in bundle, type mismatches.

### Pitfall 4: CSS Custom Property Transition Limitations

**What goes wrong:** Theme color transitions don't animate smoothly because CSS custom properties are not animatable by default.
**Why it happens:** CSS transitions work on computed values, not custom properties. `transition: --clay-base 0.3s` does nothing.
**How to avoid:** Use `@property` declarations to register custom properties with a syntax type, or animate via Framer Motion's spring transitions on actual CSS properties (background-color, box-shadow, etc.) rather than the variables themselves. For the "clay reshape" transition, animate `transform` (scale) and `opacity` with Framer Motion, then swap the CSS classes mid-animation.
**Warning signs:** Colors snap instantly instead of transitioning, theme switch feels jarring.

### Pitfall 5: AudioContext Autoplay Policy

**What goes wrong:** Dial tick sound doesn't play on first interaction.
**Why it happens:** Browsers require a user gesture before creating or resuming an AudioContext.
**How to avoid:** Create AudioContext lazily on first user click/touch. Use a one-time event listener on `document` to `audioContext.resume()`.
**Warning signs:** Console warning "AudioContext was not allowed to start", silent first interaction.

### Pitfall 6: Vite Environment Variable Static Replacement

**What goes wrong:** Dynamic access like `import.meta.env[key]` returns undefined in production.
**Why it happens:** Vite statically replaces `import.meta.env.VITE_*` references at build time. Dynamic key access is not replaced.
**How to avoid:** Always use the full string: `import.meta.env.VITE_TMDB_API_KEY`. Never destructure or alias `import.meta.env`.
**Warning signs:** Works in dev, fails in production build. API calls return 401.

### Pitfall 7: Claymorphism Accessibility -- Shadow-Only Depth Cues

**What goes wrong:** In high-contrast mode or for low-vision users, clay 3D depth is invisible because it relies entirely on subtle shadows.
**Why it happens:** Shadows are decorative. `box-shadow` is not visible in Windows High Contrast Mode.
**How to avoid:** Ensure all interactive elements have visible borders (not just shadows), focus rings, and sufficient color contrast (4.5:1 minimum for text). Test with `forced-colors: active` media query.
**Warning signs:** Elements disappear in Windows High Contrast Mode, buttons indistinguishable from background.

### Pitfall 8: GitHub Pages Base Path

**What goes wrong:** Assets fail to load on GitHub Pages because paths resolve to root instead of the repo subdirectory.
**Why it happens:** GitHub project pages serve from `username.github.io/repo-name/`, not root.
**How to avoid:** If deploying to a subdirectory, set `base: '/repo-name/'` in `vite.config.ts`. If using a custom domain (whichmovieto.watch), `base: '/'` is correct.
**Warning signs:** 404 errors for JS/CSS files on deployed site, blank page.

### Pitfall 9: Zustand Persist Hydration Timing

**What goes wrong:** Theme flashes wrong mode on page load before localStorage hydration completes.
**Why it happens:** With synchronous storage (localStorage), Zustand hydrates at store creation, but React may render before the store subscriber fires.
**How to avoid:** Apply a CSS class to `<html>` in `index.html` using an inline `<script>` that reads localStorage directly (before React mounts). This prevents flash of wrong theme.
**Warning signs:** Brief flash of light mode before dark mode applies (FOUC-like).

```html
<!-- index.html, before React mounts -->
<script>
  (function() {
    try {
      const stored = JSON.parse(localStorage.getItem('theme-preferences'));
      if (stored?.state?.mode === 'dark') document.documentElement.classList.add('dark');
      if (stored?.state?.preset) document.documentElement.classList.add('theme-' + stored.state.preset);
    } catch(e) {}
  })();
</script>
```

## Code Examples

### Claymorphism Card Component

```tsx
// src/components/ui/ClayCard.tsx
import { motion } from 'motion/react';

interface ClayCardProps {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
}

export function ClayCard({ children, className = '', elevated = true }: ClayCardProps) {
  return (
    <motion.div
      className={`
        relative overflow-hidden
        bg-clay-surface rounded-clay-lg
        ${elevated
          ? 'shadow-[16px_16px_32px_var(--clay-shadow),inset_-6px_-6px_12px_rgba(0,0,0,0.1),inset_0_8px_16px_var(--clay-highlight)]'
          : 'shadow-[4px_4px_8px_var(--clay-shadow)]'
        }
        ${className}
      `}
      whileHover={{
        y: -2,
        boxShadow: '20px 20px 40px var(--clay-shadow), inset -6px -6px 12px rgba(0,0,0,0.1), inset 0 10px 20px var(--clay-highlight)',
      }}
      whileTap={{
        y: 1,
        scale: 0.98,
        boxShadow: '8px 8px 16px var(--clay-shadow), inset -8px -8px 16px rgba(0,0,0,0.15), inset 0 4px 8px var(--clay-highlight)',
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Clay texture overlay */}
      <div
        className="absolute inset-0 rounded-[inherit] pointer-events-none opacity-8 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
```

### Skeuomorphic Metal Button Component

```tsx
// src/components/ui/MetalButton.tsx
import { motion } from 'motion/react';

interface MetalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export function MetalButton({ children, variant = 'primary', size = 'md', className = '', ...props }: MetalButtonProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-7 py-3.5 text-lg',
  };

  return (
    <motion.button
      className={`
        relative font-body font-semibold
        rounded-lg cursor-pointer select-none
        ${sizeClasses[size]}
        ${className}
      `}
      style={{
        background: `linear-gradient(
          45deg,
          var(--metal-dark) 5%,
          var(--metal-shine) 10%,
          var(--metal-base) 30%,
          var(--metal-shine) 50%,
          var(--metal-base) 70%,
          var(--metal-shine) 80%,
          var(--metal-dark) 95%
        )`,
        boxShadow: '0 3px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
        textShadow: '0 1px 2px rgba(255,255,255,0.3)',
        color: 'var(--clay-text)',
      }}
      whileHover={{
        y: -1,
        boxShadow: '0 5px 10px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.3)',
      }}
      whileTap={{
        y: 1,
        boxShadow: '0 1px 2px rgba(0,0,0,0.3), inset 0 2px 4px rgba(0,0,0,0.2)',
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
```

### Theme Reshape Animation (Signature Transition)

```tsx
// Theme switching with clay reshape animation
import { motion, AnimatePresence } from 'motion/react';

function ThemeWrapper({ children, themeKey }: { children: React.ReactNode; themeKey: string }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={themeKey}
        initial={{ scaleY: 0.95, scaleX: 0.98, opacity: 0.7 }}    // flatten
        animate={{ scaleY: 1, scaleX: 1, opacity: 1 }}              // inflate
        exit={{ scaleY: 0.95, scaleX: 0.98, opacity: 0.7 }}         // flatten out
        transition={{
          scaleY: { type: 'spring', stiffness: 150, damping: 12, mass: 0.8 },
          scaleX: { type: 'spring', stiffness: 200, damping: 15, mass: 0.8 },
          opacity: { duration: 0.15 },
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

### Rotary Dial Component (Theme Preset Selector)

```tsx
// src/components/ui/RotaryDial.tsx
import { motion, useMotionValue, useTransform } from 'motion/react';
import { useThemeStore } from '../../stores/themeStore';
import { playTick } from '../../hooks/useSound';

const PRESETS = ['cinema-gold', 'ocean-blue', 'neon-purple'] as const;
const ANGLES = [0, 120, 240]; // 3 positions at 120 degrees apart

export function RotaryDial() {
  const { preset, setPreset } = useThemeStore();
  const currentIndex = PRESETS.indexOf(preset);
  const targetAngle = ANGLES[currentIndex];

  const handleClick = () => {
    const nextIndex = (currentIndex + 1) % PRESETS.length;
    setPreset(PRESETS[nextIndex]);
    playTick();
  };

  return (
    <motion.div
      className="w-12 h-12 rounded-full cursor-pointer relative"
      style={{
        background: `radial-gradient(circle at 40% 40%, var(--metal-shine), var(--metal-base) 60%, var(--metal-dark))`,
        boxShadow: '0 2px 6px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.2)',
      }}
      animate={{ rotate: targetAngle }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={handleClick}
      role="listbox"
      aria-label="Color theme selector"
    >
      {/* Indicator notch */}
      <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-3 bg-accent rounded-full" />
      {/* Position markers */}
      {ANGLES.map((angle, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-metal-dark"
          style={{
            top: '50%',
            left: '50%',
            transform: `rotate(${angle}deg) translateY(-22px) translate(-50%, -50%)`,
          }}
        />
      ))}
    </motion.div>
  );
}
```

### GitHub Actions Deploy Workflow (Updated for Vite)

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
          node-version: 22
          cache: npm

      - run: npm ci

      - run: npm run build
        env:
          VITE_TMDB_API_KEY: ${{ secrets.API_KEY }}
          VITE_OMDB_API_KEY: ${{ secrets.OMDB_API_KEY }}

      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

      - uses: actions/deploy-pages@v4
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tailwind.config.js` (JS config) | `@theme` directive (CSS-first) | Tailwind v4, Jan 2025 | No config file needed, tokens are CSS variables |
| `framer-motion` package | `motion` package, import from `motion/react` | Motion v11, 2025 | Package rename, React 19 compat, vanilla JS support added |
| `react-router-dom` separate package | Everything from `react-router` | React Router v7, 2024 | One package, simplified imports |
| `forwardRef()` wrapper | `ref` as regular prop | React 19, Dec 2024 | Less boilerplate for component refs |
| `useMemo`/`useCallback` manual optimization | React Compiler auto-memoization | React 19+, 2025 | Compiler handles optimization, less manual work |
| `useRef()` no argument | `useRef(null)` required | React 19 TypeScript | Type safety improvement, breaking change for TS users |
| PostCSS + autoprefixer for Tailwind | `@tailwindcss/vite` plugin | Tailwind v4, Jan 2025 | Zero PostCSS config, faster builds |
| Google Fonts CDN `<link>` | Fontsource npm self-hosting | Ongoing trend | ~300ms faster, no extra DNS/TLS, HTTP/2 reuse |
| `peaceiris/actions-gh-pages` deploy | `actions/deploy-pages` (official) | GitHub 2023+ | Official Pages deployment, artifact-based |

**Deprecated/outdated:**
- `tailwind.config.js` / `tailwind.config.ts`: Still works but unnecessary in v4 for most projects
- `framer-motion` npm package: Still published but redirects to `motion`; will eventually be deprecated
- `react-router-dom`: Still works but `react-router` is the canonical package in v7
- `forwardRef()`: Still works but unnecessary in React 19
- `useRef()` without argument: TypeScript error in React 19

## Open Questions

1. **React Compiler availability in Vite**
   - What we know: React Compiler is available as a Babel plugin (`babel-plugin-react-compiler`) and is being adopted by Meta internally.
   - What's unclear: Whether it is stable enough for production use with Vite's React plugin in Feb 2026. The `@vitejs/plugin-react` may need a specific configuration to enable it.
   - Recommendation: Skip React Compiler for Phase 1. It is an optimization layer, not a requirement. Can be added later without code changes. Focus on correctness first.

2. **oklch() color space browser support for theme colors**
   - What we know: oklch() is supported in all modern browsers (Chrome 111+, Firefox 113+, Safari 15.4+).
   - What's unclear: Whether all target users' browsers support it, especially on older Android devices.
   - Recommendation: Use oklch() for perceptually uniform color manipulation. Provide fallback hex values using `@supports` if needed. The target audience (movie enthusiasts using modern browsers) very likely has support.

3. **Tailwind v4 `@theme inline` vs `@theme` behavior**
   - What we know: `@theme inline` prevents Tailwind from generating corresponding CSS variables (they reference existing vars). `@theme` (without inline) generates new CSS variables.
   - What's unclear: Exact interaction when variables reference other variables that change via CSS class overrides.
   - Recommendation: Use `@theme inline` for variables that reference runtime `var()` values (theme colors). Use `@theme` for static tokens (spacing, radius, font family). Test early.

4. **Custom domain vs GitHub Pages subdirectory base path**
   - What we know: The project has a CNAME file pointing to `whichmovieto.watch`. If custom domain is active, `base: '/'` is correct.
   - What's unclear: Whether the deployment will continue using custom domain during development.
   - Recommendation: Keep `base: '/'` since the CNAME file exists. The deploy workflow should handle this correctly.

## Sources

### Primary (HIGH confidence)
- Vite official docs (vite.dev/guide/) -- scaffolding, env variables, static deploy, build options
- Tailwind CSS v4 official docs (tailwindcss.com/docs/theme) -- @theme directive, CSS-first config
- React Router v7 API reference (api.reactrouter.com/v7) -- createHashRouter
- Zustand persist middleware docs (zustand.docs.pmnd.rs/middlewares/persist) -- persist configuration, hydration
- Motion upgrade guide (motion.dev/docs/react-upgrade-guide) -- framer-motion to motion migration
- MDN Web Audio API (developer.mozilla.org) -- AudioContext, audio playback

### Secondary (MEDIUM confidence)
- LogRocket: Implementing claymorphism with CSS (blog.logrocket.com) -- shadow values, implementation patterns
- ibelick.com: Creating metallic effects with CSS -- gradient code for brushed metal
- Maxime Heckel blog: Physics behind spring animations -- stiffness/damping/mass explanation
- Multiple Medium articles on Tailwind v4 multi-theme systems -- CSS variable override pattern verified against official docs
- Fontsource docs (fontsource.org) -- font package installation and usage

### Tertiary (LOW confidence)
- Spring animation parameter values (300/20, 400/25, 150/12) -- educated starting points, not from official recommendations. Will need visual tuning.
- oklch color values for theme presets -- representative values for the described color moods, will need design refinement.
- Rotary dial implementation -- custom component pattern synthesized from react-rotary-knob concepts and Motion animation, no authoritative source for this exact approach.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- All libraries verified against official docs/releases with current versions confirmed
- Architecture: HIGH -- Patterns follow official recommendations from Vite, Tailwind v4, Zustand, and React Router docs
- Claymorphism implementation: HIGH -- CSS technique well-documented with consistent sources
- Skeuomorphic controls: MEDIUM -- Gradient technique is well-known, but exact visual quality depends on design tuning
- Spring animation parameters: MEDIUM -- Physics are well-understood, specific values need visual refinement
- Theme system architecture: HIGH -- CSS custom property override pattern verified across multiple Tailwind v4 sources
- Pitfalls: HIGH -- All pitfalls documented from official migration guides and known issues

**Research date:** 2026-02-15
**Valid until:** 2026-03-15 (30 days -- stable technologies, unlikely to have breaking changes)
