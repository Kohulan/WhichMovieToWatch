# Phase 5: Animation Layer - Research

**Researched:** 2026-02-18
**Domain:** Framer Motion animations, page transitions, scroll reveals, micro-interactions, skeuomorphic CSS enhancements
**Confidence:** HIGH

## Summary

Phase 5 adds a comprehensive animation layer to the existing React + claymorphism UI using the already-installed `motion` library (v11.18.2, imported as `motion/react`). The codebase already has foundational animation infrastructure: `AnimatePresence` wraps route transitions in `AppShell.tsx`, the `SplashScreen` uses staggered word reveals with spring physics, `MetalButton`/`ClayCard`/`RotaryDial`/`MetalSlider` all use `motion` components with `whileHover`/`whileTap` and spring transitions. This phase enhances those foundations with: (1) enriched page transitions with layoutId-based hero expand and morph transitions, (2) scroll-triggered reveal choreography with stagger, (3) signature micro-interaction animations for action buttons, (4) a dramatic Netflix-style splash screen upgrade, (5) skeuomorphic material enhancements via CSS, and (6) a global `prefers-reduced-motion` kill switch via `MotionConfig`.

The project already has the entire `motion` library available (not using the tree-shaken `m` component), so all APIs -- `AnimatePresence`, `motion.path`, `layoutId`, `useInView`, `useReducedMotion`, `MotionConfig`, `useScroll`, `useTransform` -- are available with no additional installation. The skeuomorphic material enhancements are purely CSS (box-shadow, radial-gradient, filter) and do not require any new dependencies.

**Primary recommendation:** Structure work into 5-6 focused plans: (1) MotionConfig + reduced-motion infrastructure, (2) splash screen redesign, (3) page transitions + layoutId hero expand, (4) scroll reveal choreography, (5) micro-interaction signature animations, (6) skeuomorphic CSS material enhancements. Start with the reduced-motion infrastructure since it must wrap everything else.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

**Page Transitions:**
- Claude's discretion on transition type between pages (fade, slide, scale, or combination) -- pick what fits claymorphism best
- Transition tempo: smooth (300-450ms) -- noticeable but not slow, premium feel
- Search modal: dramatic overlay -- slides up from bottom with backdrop blur, cinematic panel feel
- Movie detail views: hero expand -- movie poster expands from card into detail view using shared layout animation (Framer Motion layoutId)
- "Next Movie" on Discovery: morph transition -- current movie poster/details dissolve and morph into the new movie, fluid and cinematic

**Splash Screen:**
- Netflix-style logo animation on app launch (every page load/refresh)
- WMTW logo assembles/reveals with dramatic lighting on dark background -- like Netflix's "N" animation
- Always plays through (~2-3s), no skip button -- it's the brand moment
- Only on app launch, not on subsequent in-app navigations

**Scroll Reveal Choreography:**
- Mixed approach: sections fade in as units, individual cards within stagger slightly
- Dramatic vertical travel (60-100px) -- elements really "arrive" on screen
- Replay on scroll-back with shorter duration -- first appearance is full animation, re-entries are quicker/subtler
- Horizontal lists (provider logos, genre badges): slide in as a group from one side -- clean and unified

**Micro-Interaction Personality:**
- Refined precision feel -- crisp, controlled movements with subtle scale and color shifts. Premium and intentional, like Apple's UI
- Signature action button animations: heart pulse for Love, checkmark draw for Watched, X slide for Not Interested -- each action has its own animation
- Tab bar: both sliding indicator + icon state change (outline to filled with subtle bounce) -- maximum feedback on tab switch
- Claude's discretion on toast notification animations -- pick what fits the refined precision feel

**Material Enhancements (Skeuomorphism References):**
- Full implementation of all 5 enhancement areas from SKEUOMORPHISM-REFERENCES.md:
  1. Dramatic directional lighting (specular highlights, rim light on knobs/toggles)
  2. Deeper inset track shadows on MetalToggle and MetalSlider
  3. Material contrast strengthening (metallic knobs on matte surfaces, rubber buttons on ceramic panels)
  4. Accent glow rings on active controls (orange dark mode, cyan light mode)
  5. Surface texture enhancement (existing + new)
- Accent glow: animated pulse -- gentle pulsing glow on active controls, feels alive like a power indicator
- Light-mode clay cards: subtle CSS radial-gradient ripple texture for ceramic/porcelain feel (Kosma reference)
- RotaryDial: Claude's discretion on enhancement level -- pick what looks best with claymorphism aesthetic

### Claude's Discretion
- Page transition type selection (fade, slide, scale, or combination)
- Toast notification entrance animation style
- RotaryDial enhancement level (full brushed metal vs glow ring + shadow only)
- Exact spring physics parameters for all animations
- Loading animation design (movie-themed content per ANIM-06)
- prefers-reduced-motion implementation approach

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ANIM-01 | Framer Motion page transitions between routes (fade, slide, scale variants) | AppShell already has AnimatePresence + motion.main with key={location.pathname}. Enhance with richer variants and tune timing to 300-450ms. Add layoutId for hero expand. |
| ANIM-02 | Scroll-triggered reveal animations for sections (whileInView, staggered children) | Use `whileInView` with variants and `staggerChildren`. Set `amount: 0.2` for partial viewport trigger. Implement replay with `once: false` and conditional shorter duration. |
| ANIM-03 | Micro-interactions: button hover/tap feedback, card tilt, toggle animations | MetalButton/ClayCard already have whileHover/whileTap. Add SVG path draw animations for action button icons. Add tab bar sliding indicator with layoutId. |
| ANIM-04 | Layout animations for dynamic content changes (AnimatePresence, layoutId) | Use layoutId for hero expand (movie card to detail), morph transition for Next Movie, and service selector glow (already uses layoutId). AnimatePresence for content swap. |
| ANIM-05 | prefers-reduced-motion fully respected -- all animations disabled when set | Wrap App root in `<MotionConfig reducedMotion="user">`. This auto-disables transform/layout animations. Add CSS `@media (prefers-reduced-motion: reduce)` for CSS animations. |
| ANIM-06 | Loading animations with movie-themed content (quotes, film reel) | Design loading state with rotating movie quotes, animated film reel icon using motion.path for the sprocket animation. Replace static ClaySkeletonCard usage. |
| ANIM-07 | Smooth animated transitions when switching color scheme presets | Theme CSS variables already use `transition-colors duration-500`. Enhance with motion-based cross-fade on the ambient gradient blobs in AppShell. |
| A11Y-05 | prefers-reduced-motion disables all animations | Same as ANIM-05. MotionConfig handles Framer Motion; CSS media query handles CSS transitions/keyframes. Both paths covered. |

</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| motion | 11.18.2 | All React animations (transitions, layout, scroll, SVG) | Already installed. The `motion/react` import provides AnimatePresence, motion components, layoutId, whileInView, useReducedMotion, MotionConfig, useScroll, useTransform, motion.path |
| react-router | 7.13.0 | Routing with location-keyed transitions | Already installed. useLocation provides pathname for AnimatePresence key |
| sonner | 2.0.7 | Toast notifications | Already installed. Has built-in entrance/exit animations. CSS customization only needed. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | 0.469.0 | SVG icons for animated action buttons | Already installed. Use for heart/check/x SVG paths in signature animations |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| motion whileInView | Intersection Observer + manual animation | More code, no automatic variants/stagger integration, skip |
| CSS @keyframes for glow pulse | motion.animate for glow | CSS keyframes are simpler for infinite pulse loops, more performant, use CSS |
| motion for theme transitions | CSS transitions only | CSS `transition-colors duration-500` already works; motion unnecessary here |

**Installation:**
```bash
# No new packages needed -- everything is already installed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── animation/            # NEW: Animation wrapper components
│   │   ├── MotionProvider.tsx       # MotionConfig wrapper with reducedMotion="user"
│   │   ├── PageTransition.tsx       # Reusable page transition wrapper (variants)
│   │   ├── ScrollReveal.tsx         # whileInView wrapper with stagger support
│   │   ├── StaggerContainer.tsx     # Parent container for staggered children
│   │   └── AnimatedActionIcon.tsx   # SVG path-draw icon animations
│   ├── SplashScreen.tsx      # MODIFY: Netflix-style dramatic redesign
│   ├── layout/
│   │   ├── AppShell.tsx      # MODIFY: Enhanced page transition variants
│   │   └── TabBar.tsx        # MODIFY: Sliding indicator + icon animation
│   ├── movie/
│   │   ├── MovieActions.tsx  # MODIFY: Signature icon animations per action
│   │   └── MovieHero.tsx     # MODIFY: layoutId on poster for hero expand
│   ├── ui/
│   │   ├── MetalToggle.tsx   # MODIFY: Enhanced shadows, specular highlight, accent glow
│   │   ├── MetalSlider.tsx   # MODIFY: Deeper inset shadows, accent glow on active
│   │   ├── RotaryDial.tsx    # MODIFY: Orange glow ring, enhanced knob shadows
│   │   ├── ClayCard.tsx      # MODIFY: Light-mode ceramic texture, scroll reveal ready
│   │   └── MetalButton.tsx   # MODIFY: Refined spring parameters
│   └── discovery/
│       └── DiscoveryPage.tsx # MODIFY: Morph transition for Next Movie, scroll reveals
├── hooks/
│   └── useReducedMotion.ts   # NEW: Re-export from motion/react with app-specific helpers
├── styles/
│   ├── clay.css              # MODIFY: Add ceramic ripple texture for light mode
│   ├── metal.css             # MODIFY: Enhanced specular highlights, deeper shadows
│   └── animations.css        # NEW: CSS keyframes for glow pulse, reduced-motion overrides
└── App.tsx                   # MODIFY: Wrap in MotionProvider
```

### Pattern 1: MotionConfig Provider at App Root
**What:** Wrap the entire app in `<MotionConfig reducedMotion="user">` to globally respect the user's reduced-motion preference.
**When to use:** Always -- this is the single entry point for accessibility compliance.
**Example:**
```typescript
// src/components/animation/MotionProvider.tsx
import { MotionConfig } from 'motion/react';
import type { ReactNode } from 'react';

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      {children}
    </MotionConfig>
  );
}

// src/App.tsx
function App() {
  return (
    <MotionProvider>
      {/* ... existing app content ... */}
    </MotionProvider>
  );
}
```
**Source:** https://motion.dev/docs/react-motion-config

**How MotionConfig reducedMotion="user" works:** When the user's OS has reduced-motion enabled, all `motion` components automatically disable **transform** and **layout** animations (x, y, scale, rotate, layoutId morphs). Other animations like `opacity` and `backgroundColor` still play. This means fade-in effects remain visible while bouncy/sliding/scaling animations are suppressed. This is exactly the behavior we want -- graceful degradation, not total animation removal.

### Pattern 2: Reusable ScrollReveal Wrapper
**What:** A wrapper component using `whileInView` with configurable variants for consistent scroll-triggered animations.
**When to use:** Wrap any section or card group that should animate on scroll.
**Example:**
```typescript
// src/components/animation/ScrollReveal.tsx
import { motion, type Variants } from 'motion/react';
import { useRef, useState, type ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  /** Vertical travel distance in px (default 80) */
  travel?: number;
  /** Delay before animation starts */
  delay?: number;
  /** Only animate once (default false -- replays on re-enter) */
  once?: boolean;
}

export function ScrollReveal({
  children,
  className = '',
  travel = 80,
  delay = 0,
  once = false,
}: ScrollRevealProps) {
  const [hasAnimated, setHasAnimated] = useState(false);

  // First entry: full animation. Re-entries: shorter/subtler
  const duration = hasAnimated ? 0.3 : 0.6;
  const actualTravel = hasAnimated ? travel * 0.4 : travel;

  const variants: Variants = {
    hidden: { opacity: 0, y: actualTravel },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ amount: 0.2, once }}
      variants={variants}
      onAnimationComplete={() => setHasAnimated(true)}
    >
      {children}
    </motion.div>
  );
}
```

### Pattern 3: Staggered Children Container
**What:** Parent container that staggers its children's entrance animations.
**When to use:** Card grids, movie lists, badge rows, provider logo strips.
**Example:**
```typescript
// src/components/animation/StaggerContainer.tsx
import { motion, type Variants } from 'motion/react';
import type { ReactNode } from 'react';

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  /** Delay between children in seconds */
  stagger?: number;
  /** Direction: vertical fade-up or horizontal slide-in */
  direction?: 'up' | 'left' | 'right';
}

const containerVariants: Variants = {
  hidden: {},
  visible: (stagger: number) => ({
    transition: {
      staggerChildren: stagger,
      delayChildren: 0.1,
    },
  }),
};

const childVariantsMap = {
  up: {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 },
    },
  },
  left: {
    hidden: { opacity: 0, x: 60 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 },
    },
  },
  right: {
    hidden: { opacity: 0, x: -60 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 },
    },
  },
} as const;

export { childVariantsMap };

export function StaggerContainer({
  children,
  className = '',
  stagger = 0.08,
  direction = 'up',
}: StaggerContainerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ amount: 0.15 }}
      variants={containerVariants}
      custom={stagger}
    >
      {children}
    </motion.div>
  );
}
```

### Pattern 4: layoutId for Hero Expand
**What:** Connect a movie poster thumbnail to its full detail view using `layoutId` so the poster visually expands into place.
**When to use:** Clicking similar movie cards to load them as the main movie, or any card-to-detail transition.
**Example:**
```typescript
// In a movie card (e.g., similar movie thumbnail):
<motion.img
  layoutId={`poster-${movie.id}`}
  src={posterUrl}
  className="w-full aspect-[2/3] object-cover"
/>

// In MovieHero.tsx (the detail view):
<motion.img
  layoutId={`poster-${movie.id}`}
  src={posterUrl}
  className="w-48 md:w-[280px] aspect-[2/3] rounded-2xl"
/>
```
**Critical notes:**
- `layoutId` is **global** across the entire app. Use `LayoutGroup` with unique `id` props if you have multiple instances that could collide.
- Both elements must be rendered simultaneously during the transition for the crossfade/morph to work. `AnimatePresence` handles the timing.
- `layoutId` morphs work best when both elements share the same general shape/aspect ratio.

### Pattern 5: SVG Path Draw for Signature Icons
**What:** Animate SVG paths from `pathLength: 0` to `pathLength: 1` to create draw-on effects for action icons.
**When to use:** Heart pulse (Love), checkmark draw (Watched), X slide (Not Interested).
**Example:**
```typescript
// Heart pulse animation on Love action
<motion.svg viewBox="0 0 24 24" className="w-4 h-4">
  <motion.path
    d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    initial={{ pathLength: 0, scale: 1 }}
    animate={{ pathLength: 1, scale: [1, 1.3, 1] }}
    transition={{ pathLength: { duration: 0.4 }, scale: { duration: 0.5, times: [0, 0.5, 1] } }}
  />
</motion.svg>
```
**Source:** https://motion.dev/docs/react-svg-animation

### Pattern 6: Morph Transition for Next Movie
**What:** When user clicks "Next Movie" on Discovery, the current movie dissolves and the new one morphs in, rather than a hard cut.
**When to use:** DiscoveryPage next movie action, DinnerTimePage next movie.
**Example:**
```typescript
// Wrap the movie display area in AnimatePresence with mode="wait"
<AnimatePresence mode="wait">
  <motion.div
    key={currentMovie.id}
    initial={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
    exit={{ opacity: 0, scale: 1.02, filter: 'blur(6px)' }}
    transition={{
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    }}
  >
    <MovieHero movie={currentMovie} ... />
  </motion.div>
</AnimatePresence>
```

### Anti-Patterns to Avoid
- **Animating layout properties (width/height) directly:** Use the `layout` prop or `layoutId` instead. Direct width/height animations cause layout thrashing and poor performance. Framer Motion's FLIP-based layout animations are GPU-accelerated.
- **Re-rendering on every animation frame:** Never use React state to drive per-frame animation values. Use `useMotionValue` and `useTransform` instead. The MetalSlider already does this correctly.
- **Missing `key` on AnimatePresence children:** AnimatePresence tracks children by key. Without a unique key, exit animations won't fire. Current AppShell correctly uses `key={location.pathname}`.
- **Competing animation systems:** The project must NOT use GSAP alongside motion for the same elements. The old vanilla JS project used GSAP; the React rewrite uses motion exclusively. Do not import GSAP.
- **Overly long animation durations:** Streaming apps (Netflix, Disney+, Apple TV+) use 200-500ms for UI transitions. The locked decision of 300-450ms is correct. Anything over 600ms feels sluggish.
- **Forgetting to handle both mount and re-enter states for scroll reveals:** The decision requires replay on scroll-back with shorter duration. Use component state to track if element has been seen before, then adjust travel/duration accordingly.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Reduced motion detection | Manual `matchMedia` listener + context | `<MotionConfig reducedMotion="user">` | Handles all motion components automatically, re-renders on preference change, disables transform/layout while keeping opacity |
| Scroll-triggered animations | Intersection Observer + manual state | `whileInView` prop on motion components | Built-in viewport detection, automatic cleanup, works with variants/stagger out of the box |
| Layout/shared element transitions | Manual FLIP calculations | `layoutId` prop + `AnimatePresence` | Motion handles FLIP (First-Last-Invert-Play) internally with GPU-accelerated transforms, crossfade between dissimilar elements |
| SVG path drawing | Manual stroke-dasharray/dashoffset manipulation | `motion.path` with `pathLength` | Framer Motion handles dasharray math internally, integrates with spring/tween transitions |
| Spring physics | Manual spring math or requestAnimationFrame | `type: 'spring'` transition with stiffness/damping | Motion's spring solver is battle-tested, handles interruption/gesture mid-animation gracefully |
| CSS glow pulse animation | JS-driven glow with requestAnimationFrame | CSS `@keyframes` with `animation` | CSS keyframes for infinite loops are more performant and don't occupy the JS thread. Use will-change: box-shadow for GPU hint |

**Key insight:** The `motion` library already handles all the complex animation math (FLIP layout, spring physics, SVG path interpolation, viewport detection). The phase work is about wiring these capabilities into the existing components with the right parameters, not building animation infrastructure.

## Common Pitfalls

### Pitfall 1: layoutId Collisions
**What goes wrong:** Two unrelated movie cards with the same `layoutId` pattern cause unexpected morphing between wrong elements.
**Why it happens:** `layoutId` is global across the entire component tree. If TrendingPage and DiscoveryPage both render `poster-{movieId}` with the same movie ID, they'll try to animate between each other during page transitions.
**How to avoid:** Prefix layoutId with the context: `discovery-poster-${id}`, `trending-poster-${id}`, `similar-poster-${id}`. Or wrap each page in a `<LayoutGroup id="discovery">` to scope layoutId matching.
**Warning signs:** Posters "flying" across the screen during page transitions to unexpected positions.

### Pitfall 2: AnimatePresence with Outlet Not Triggering Exit
**What goes wrong:** Exit animations don't play when navigating between routes because the `<Outlet />` component doesn't unmount/remount in a way AnimatePresence can track.
**Why it happens:** AnimatePresence needs a direct child with a changing `key` prop. If the key doesn't change (or Outlet manages its own children internally), exits won't fire.
**How to avoid:** The current AppShell pattern is correct: `<AnimatePresence mode="wait"><motion.main key={location.pathname}>...</motion.main></AnimatePresence>`. Keep this pattern. Do NOT move AnimatePresence inside individual page components.
**Warning signs:** Pages appear/disappear instantly instead of fading.

### Pitfall 3: Scroll Reveal Re-triggering Causing Jank
**What goes wrong:** Elements that scroll in and out rapidly (fast scrolling) trigger many animation starts/interruptions, causing visual glitches.
**Why it happens:** `whileInView` fires every time the element enters/leaves viewport. Without debouncing or `once: true`, rapid scrolling creates animation pile-ups.
**How to avoid:** Set `viewport={{ amount: 0.2 }}` so the element must be at least 20% visible before triggering. For cards in long lists, consider `once: true` to animate only on first appearance. The decision says to replay but with shorter duration -- use state to track first-seen and adjust.
**Warning signs:** Cards flickering or jumping during fast scroll.

### Pitfall 4: CSS Transition Conflicts with Framer Motion
**What goes wrong:** A component has both CSS `transition` properties and Framer Motion `animate` targeting the same property, causing double-animation or override.
**Why it happens:** CSS transitions and Framer Motion's JS-driven animations compete. Framer Motion sets inline styles which trigger CSS transitions unexpectedly.
**How to avoid:** Remove CSS `transition` on properties that Framer Motion animates. Keep CSS transitions only for properties not managed by motion (like `background-color` for theme changes, `color` for text). Never use CSS `transition` on `transform`, `opacity`, or `box-shadow` if motion also animates them.
**Warning signs:** Animations feel "doubled" or sluggish, elements overshoot their targets.

### Pitfall 5: Performance with Many Animated Elements
**What goes wrong:** Trending page with 20+ movie cards all animating simultaneously causes frame drops on mobile.
**Why it happens:** Too many concurrent GPU-composited layers or too many spring solvers running in parallel.
**How to avoid:** Stagger card reveals so only 3-4 animate at once. Use `will-change: transform` sparingly (only on actively animating elements). For the Trending grid, set `viewport={{ amount: 0.1 }}` with a stagger of `0.05s` so cards cascade rather than all firing at once. On mobile, consider reducing travel distance to 40-60px instead of 80px.
**Warning signs:** FPS drops below 30 during scroll, janky card appearances.

### Pitfall 6: Splash Screen Blocking Content Load
**What goes wrong:** The 2-3s splash screen delays API calls and content rendering, making the app feel slow.
**Why it happens:** Current implementation shows splash and only renders `<AppShell>` + `<Outlet>` after splash completes. API calls in DiscoveryPage don't start until the component mounts.
**How to avoid:** Start API calls (random movie fetch) during the splash screen, not after. Either move the initial `discover()` call to the App level so it runs immediately, or use a prefetch pattern. The splash animation plays while data loads in parallel.
**Warning signs:** User sees splash for 2.5s, then sees a loading skeleton for another 1-2s. Total wait >4s.

## Code Examples

### Netflix-Style Splash Screen
Verified pattern combining dramatic reveal with the project's existing structure:

```typescript
// Enhanced SplashScreen.tsx — Netflix-inspired dramatic reveal
import { motion, AnimatePresence } from 'motion/react';
import { Film } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black overflow-hidden"
      exit={{
        opacity: 0,
        scale: 1.1,
        filter: 'blur(12px)',
        transition: { duration: 0.6, ease: 'easeInOut' },
      }}
    >
      {/* Dramatic ambient light sweep */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full"
          style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)' }}
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{
            opacity: [0, 0.4, 0.2],
            scale: [0.3, 1.5, 2],
          }}
          transition={{ duration: 2.5, ease: 'easeOut' }}
        />
      </motion.div>

      {/* Film icon — dramatic scale-in with rotation */}
      <motion.div
        initial={{ scale: 0, rotate: -180, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{
          type: 'spring',
          stiffness: 180,
          damping: 14,
          delay: 0.2,
        }}
        className="mb-6 relative z-10"
      >
        <Film className="w-16 h-16 text-accent" strokeWidth={1.5} />
        {/* Specular highlight glow behind icon */}
        <motion.div
          className="absolute inset-0 blur-xl"
          style={{ backgroundColor: 'var(--accent)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0.3] }}
          transition={{ duration: 1.5, delay: 0.3 }}
        />
      </motion.div>

      {/* Staggered word reveal with blur-in */}
      <motion.div
        className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 relative z-10"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: 0.12, delayChildren: 0.5 },
          },
        }}
      >
        {['Which', 'Movie', 'To', 'Watch'].map((word) => (
          <motion.span
            key={word}
            className="font-heading font-bold text-4xl sm:text-5xl md:text-6xl text-white"
            variants={{
              hidden: { opacity: 0, y: 30, filter: 'blur(12px)' },
              visible: {
                opacity: 1,
                y: 0,
                filter: 'blur(0px)',
                transition: {
                  y: { type: 'spring', stiffness: 250, damping: 18 },
                  opacity: { duration: 0.4 },
                  filter: { duration: 0.5 },
                },
              },
            }}
          >
            {word}
          </motion.span>
        ))}
      </motion.div>

      {/* Tagline fade-in */}
      <motion.p
        className="font-body font-light text-sm text-white/60 mt-4 relative z-10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        Discover your next favorite film
      </motion.p>

      {/* Cinematic progress bar */}
      <motion.div
        className="mt-8 w-48 h-0.5 rounded-full overflow-hidden bg-white/10 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <motion.div
          className="h-full rounded-full bg-accent"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ delay: 1.0, duration: 1.3, ease: [0.4, 0, 0.2, 1] }}
          onAnimationComplete={onComplete}
        />
      </motion.div>
    </motion.div>
  );
}
```

### Tab Bar with Sliding Indicator
```typescript
// Enhanced TabBar — sliding indicator + icon state change
import { NavLink, useLocation } from 'react-router';
import { motion } from 'motion/react';
import { Compass, TrendingUp, UtensilsCrossed, Film } from 'lucide-react';

const tabs = [
  { to: '/', end: true, icon: Compass, label: 'Discover' },
  { to: '/trending', end: false, icon: TrendingUp, label: 'Trending' },
  { to: '/dinner-time', end: false, icon: UtensilsCrossed, label: 'Dinner' },
  { to: '/free-movies', end: false, icon: Film, label: 'Free' },
];

export function TabBar() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 mx-3 sm:mx-5 mb-3 rounded-2xl bg-clay-base/60 backdrop-blur-xl border border-white/[0.08] h-14 pb-[env(safe-area-inset-bottom)]">
      <div className="flex h-full items-center justify-around px-2 relative">
        {tabs.map(({ to, end, icon: Icon, label }) => {
          const isActive = end
            ? location.pathname === to
            : location.pathname.startsWith(to);

          return (
            <NavLink
              key={to}
              to={to}
              end={end}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full px-2 relative outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset"
              aria-label={label}
            >
              {/* Sliding background indicator */}
              {isActive && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute inset-1 rounded-xl bg-accent/10"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}

              {/* Icon with bounce on active */}
              <motion.div
                animate={isActive ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <Icon
                  className={`w-5 h-5 transition-colors duration-200 ${isActive ? 'text-accent' : 'text-clay-text-muted'}`}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  aria-hidden="true"
                />
              </motion.div>

              <span className={`text-xs font-medium leading-none transition-colors duration-200 ${isActive ? 'text-accent' : 'text-clay-text-muted'}`}>
                {label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
```

### CSS Accent Glow Pulse (for active controls)
```css
/* src/styles/animations.css */

/* Accent glow pulse — gentle breathing effect on active controls */
@keyframes accent-glow-pulse {
  0%, 100% {
    box-shadow:
      0 0 8px var(--accent),
      0 0 16px color-mix(in oklch, var(--accent) 40%, transparent);
  }
  50% {
    box-shadow:
      0 0 12px var(--accent),
      0 0 24px color-mix(in oklch, var(--accent) 50%, transparent);
  }
}

.accent-glow-active {
  animation: accent-glow-pulse 2s ease-in-out infinite;
}

/* Ceramic ripple texture for light-mode clay cards (Kosma reference) */
.ceramic-ripple::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  opacity: 0.04;
  background:
    radial-gradient(circle at 50% 40%, transparent 30%, rgba(0,0,0,0.02) 35%, transparent 40%),
    radial-gradient(circle at 50% 40%, transparent 50%, rgba(0,0,0,0.015) 55%, transparent 60%),
    radial-gradient(circle at 50% 40%, transparent 70%, rgba(0,0,0,0.01) 75%, transparent 80%);
}

/* Enhanced specular highlight for metal knobs */
.metal-knob-enhanced {
  background:
    radial-gradient(
      ellipse at 35% 25%,
      rgba(255,255,255,0.5) 0%,
      transparent 30%
    ),
    radial-gradient(
      ellipse at 40% 30%,
      var(--metal-shine) 0%,
      var(--metal-base) 55%,
      var(--metal-dark) 100%
    );
}

/* Deeper inset track for toggles and sliders */
.metal-track-deep {
  box-shadow:
    inset 0 3px 6px rgba(0,0,0,0.4),
    inset 0 1px 3px rgba(0,0,0,0.3),
    inset 0 -1px 2px rgba(255,255,255,0.08),
    0 1px 0 rgba(255,255,255,0.05);
}

/* Reduced motion: disable all CSS animations */
@media (prefers-reduced-motion: reduce) {
  .accent-glow-active {
    animation: none;
  }

  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Enhanced MetalToggle with Specular Highlight and Deeper Shadows
```typescript
// Key CSS enhancements for MetalToggle
const enhancedTrackStyle = {
  boxShadow: [
    'inset 0 3px 6px rgba(0,0,0,0.4)',     // deeper top shadow
    'inset 0 1px 3px rgba(0,0,0,0.3)',       // secondary inset
    'inset 0 -1px 2px rgba(255,255,255,0.08)', // bottom highlight
    '0 1px 0 rgba(255,255,255,0.05)',         // outer rim light
  ].join(', '),
  backgroundColor: checked ? 'var(--accent)' : 'var(--clay-base)',
};

// Knob with specular highlight
const enhancedKnobStyle = {
  background: `
    radial-gradient(ellipse at 35% 25%, rgba(255,255,255,0.5) 0%, transparent 30%),
    radial-gradient(ellipse at 40% 30%, var(--metal-shine) 0%, var(--metal-base) 55%, var(--metal-dark) 100%)
  `,
  boxShadow: [
    '0 2px 4px rgba(0,0,0,0.35)',             // drop shadow
    '0 4px 8px rgba(0,0,0,0.15)',             // extended shadow
    'inset 0 1px 0 rgba(255,255,255,0.4)',     // top rim light
    'inset 0 -1px 2px rgba(0,0,0,0.15)',       // bottom shadow
  ].join(', '),
};
```

## Recommended Spring Physics Parameters

Based on Framer Motion defaults (stiffness: 100, damping: 10, mass: 1) and the "refined precision" feel requested:

| Animation Type | Stiffness | Damping | Mass | Character |
|---------------|-----------|---------|------|-----------|
| Page transitions | N/A (tween) | N/A | N/A | Use `ease: [0.25, 0.1, 0.25, 1]`, `duration: 0.35` |
| Tab indicator slide | 350 | 30 | 1 | Crisp snap, minimal overshoot |
| Button hover lift | 400 | 20 | 1 | Quick response, subtle bounce |
| Button tap press | 500 | 25 | 1 | Immediate, firm press |
| Toggle knob slide | 300 | 20 | 1 | Smooth but decisive |
| Rotary dial rotation | 300 | 20 | 1 | Already correct (keep current) |
| Card hover lift | 300 | 20 | 1 | Gentle, controlled (keep current) |
| Splash icon entrance | 180 | 14 | 1 | Dramatic, slight bounce |
| Scroll reveal (spring) | 300 | 24 | 1 | Controlled arrival, no wobble |
| Heart pulse (Love) | 400 | 15 | 1 | Bouncy, energetic |
| Checkmark draw | N/A (tween) | N/A | N/A | `duration: 0.4, ease: 'easeOut'` |
| X slide (Not Interested) | 350 | 22 | 1 | Quick dismissal feel |
| layoutId morphs | 300 | 25 | 1 | Smooth spatial connection |
| Search modal slide-up | 300 | 30 | 1 | Already correct (keep current) |

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `framer-motion` package | `motion` package (same library) | Oct 2024 (v11) | Import from `motion/react` instead of `framer-motion`. Project already uses new import. |
| `AnimateSharedLayout` wrapper | `layoutId` prop (no wrapper needed) | Framer Motion v5 | Old wrapper component removed. Just add `layoutId` prop directly. |
| Manual IntersectionObserver for scroll animations | `whileInView` prop | Framer Motion v6 | Built-in viewport detection, no manual setup needed. |
| Manual `@media (prefers-reduced-motion)` checks | `<MotionConfig reducedMotion="user">` | Framer Motion v7+ | Single wrapper handles all motion components automatically. |
| `useAnimation` controls for complex sequences | Declarative variants with staggerChildren | Stable since v4 | Imperative API still available but declarative variants are preferred for most cases. |

**Deprecated/outdated:**
- `AnimateSharedLayout`: Removed in favor of standalone `layoutId` prop. Do not use.
- `positionTransition` / `layoutTransition`: Replaced by `layout` prop. Do not use.
- `framer-motion` package name: Still works but `motion` is the official package now. Project already uses `motion`.

## CSS Enhancement Strategy for Skeuomorphism

Based on the three reference images, here are the specific CSS techniques to apply:

### From skeu-toggle-dark.png
- **Specular highlight on knob:** Overlay `radial-gradient(ellipse at 35% 25%, rgba(255,255,255,0.5) 0%, transparent 30%)` on the existing `metal-knob` gradient. The highlight sits off-center (top-left) simulating a top-right light source.
- **Rim light:** Add `0 -1px 2px rgba(255,255,255,0.15)` to the bottom edge of the knob, simulating light wrapping around the sphere.
- **Deep track recess:** Increase inset shadow depth: `inset 0 3px 6px rgba(0,0,0,0.4)` instead of current `inset 0 2px 4px rgba(0,0,0,0.3)`.

### From skeu-settings-dark.png
- **Orange glow ring on RotaryDial:** Add `box-shadow: 0 0 12px var(--accent), 0 0 24px color-mix(in oklch, var(--accent) 40%, transparent)` when the dial is in active/focused state. Apply the `accent-glow-pulse` CSS animation.
- **Contrast between knob and panel:** The dark panel has a matte finish while the knob has a glossy metallic finish. Strengthen this by using lower opacity on the panel texture and higher specular intensity on knobs.

### From skeu-panel-light-kosma.jpg
- **Concentric ripple embossing (light mode only):** Apply via CSS `radial-gradient` creating 3-4 concentric semi-transparent rings emanating from a center point. Apply to ClayCard surfaces when in light mode only.
- **Cyan LED accents in light mode:** Use `box-shadow: 0 0 8px oklch(0.75 0.15 200)` for active control indicators in light mode. The Kosma panel uses cyan LED strips as accent.
- **Dark rubber push buttons:** For action buttons (Not Interested, Skip), use darker `bg-clay-base` with stronger inset shadows in light mode to create the contrasting rubber button feel.
- **Deep panel float shadow:** Enhance the overall card/panel shadow to `0 20px 40px rgba(0,0,0,0.15)` in light mode for the floating hardware feel.

### Theme-Aware Accent Glow
```css
/* Dark mode: orange/gold accent glow */
.dark .accent-glow-active {
  --glow-color: var(--accent);
}

/* Light mode: cyan accent glow (Kosma reference) */
:not(.dark) .accent-glow-active {
  --glow-color: oklch(0.75 0.15 200);
}
```

## Loading Animation Design (ANIM-06 -- Claude's Discretion)

**Recommendation:** Movie-themed loading state with rotating film quotes and an animated film sprocket icon.

**Design:**
1. **Film sprocket icon** using `motion.path` with rotating animation -- the sprocket teeth spin while the reel stays centered
2. **Rotating movie quotes** displayed one at a time with fade-in/out: "Life is like a box of chocolates", "Here's looking at you, kid", "May the Force be with you", etc. (8-10 quotes)
3. **Subtle accent-colored glow** behind the sprocket that pulses
4. **Quote attribution** in smaller muted text below the quote

This replaces the static `ClaySkeletonCard` for the initial movie load. Skeleton cards remain appropriate for secondary content (similar movies, search results) where the structure is predictable.

## Toast Animation (Claude's Discretion)

**Recommendation:** Sonner's built-in animations are already well-suited. The default slide-up-from-bottom with spring easing matches the "refined precision" aesthetic. No custom Framer Motion wrapper needed.

**Enhancements to apply via CSS only:**
- Increase the border-radius to match clay aesthetic (already done: `borderRadius: '12px'`)
- Add a subtle `backdrop-filter: blur(8px)` for glassmorphism integration
- Success toasts: brief green accent glow on appearance
- The Sonner `<Toaster />` already handles enter/exit animations internally

## RotaryDial Enhancement (Claude's Discretion)

**Recommendation:** Glow ring + enhanced shadow (not full brushed metal redesign). The current RotaryDial design with its simple radial-gradient knob already looks good. Adding the full brushed metal texture from the reference would be overdesign for a 14x14 pixel control.

**Specific enhancements:**
1. Orange glow ring around the knob when the dial is focused or recently interacted with (use `accent-glow-pulse` animation, fading out after 2s of inactivity)
2. Deeper inset shadow behind the knob (currently only indicator dots around it)
3. Specular highlight on the knob surface (radial-gradient overlay at 35% 25%)
4. The dot indicators already glow -- enhance glow intensity for the active dot

## Open Questions

1. **Backdrop image transition on Next Movie**
   - What we know: Current DiscoveryPage uses a fixed full-screen backdrop image with no transition animation when the movie changes. The backdrop just snaps to the new image.
   - What's unclear: Should the backdrop crossfade between movies as part of the morph transition? This would require AnimatePresence on the backdrop image as well.
   - Recommendation: Yes, add a crossfade (opacity 0 to 1 over 0.5s) on the backdrop image when movie changes. Key the image by `currentMovie.id`.

2. **Parallel Data Loading During Splash**
   - What we know: Currently, API calls don't start until the splash screen completes because `<Outlet>` (containing DiscoveryPage) doesn't mount until `showSplash` becomes false.
   - What's unclear: Should we restructure to mount DiscoveryPage behind the splash (hidden) to allow parallel loading?
   - Recommendation: Move the initial `discover()` call to App level or use a prefetch hook that runs regardless of splash state. The splash screen plays for ~2.5s -- use that time productively.

3. **layoutId Scope for Similar Movies to Hero**
   - What we know: The user wants poster-expand from similar movie cards to the main MovieHero display.
   - What's unclear: Both elements exist on the same page simultaneously (DiscoveryPage). When clicking a similar movie, the old hero unmounts and the new one renders with the same `<MovieHero>` component. Can layoutId bridge this transition?
   - Recommendation: Yes, but carefully. Give the similar movie poster a `layoutId={`poster-${movie.id}`}` and give the MovieHero poster the same. Wrap the hero section in `AnimatePresence mode="wait"` with `key={currentMovie.id}` so the old hero exits before the new one enters, allowing the layoutId to connect the similar card poster to the new hero poster.

## Sources

### Primary (HIGH confidence)
- **motion v11.18.2** (installed, verified via node_modules) -- All APIs confirmed available: AnimatePresence, layoutId, whileInView, useReducedMotion, MotionConfig, motion.path
- **react-router v7.13.0** (installed, verified) -- useLocation for pathname-keyed transitions
- **Existing codebase** -- Read all 15+ components that will be modified; current animation patterns verified

### Secondary (MEDIUM confidence)
- https://motion.dev/docs/react-motion-config -- MotionConfig reducedMotion options ("user", "always", "never")
- https://motion.dev/docs/react-accessibility -- useReducedMotion hook, behavior details
- https://motion.dev/docs/react-layout-animations -- layoutId, FLIP, shared element patterns
- https://motion.dev/docs/react-animate-presence -- AnimatePresence modes (wait, sync, popLayout)
- https://motion.dev/docs/react-svg-animation -- motion.path, pathLength animation
- https://motion.dev/docs/react-use-reduced-motion -- Hook API details

### Tertiary (LOW confidence)
- Netflix splash screen recreation patterns from various GitHub repos and tutorials -- used as visual inspiration, not code copied
- Streaming app animation timing research (Netflix, Disney+, Apple TV+) -- general patterns, 200-500ms timing window confirmed across multiple sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- All libraries already installed and verified in codebase. No new dependencies needed.
- Architecture: HIGH -- Patterns derived directly from official motion docs and verified against current codebase structure. Existing AnimatePresence + motion patterns already working correctly.
- Pitfalls: HIGH -- Based on known Framer Motion edge cases (layoutId collisions, AnimatePresence key requirements, CSS transition conflicts) documented in official troubleshooting and community discussions.
- Spring physics parameters: MEDIUM -- Based on Framer Motion defaults and the project's existing values. Will need visual tuning during implementation.
- Skeuomorphic CSS: MEDIUM -- CSS techniques verified via MDN and reference images. Exact opacity/blur values will need visual tuning per reference images.

**Research date:** 2026-02-18
**Valid until:** 2026-03-18 (motion library is stable; API unlikely to change in 30 days)
