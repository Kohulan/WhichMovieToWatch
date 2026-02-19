# Phase 6: Bento Grid Layouts - Research

**Researched:** 2026-02-18
**Domain:** CSS Grid bento layouts, Framer Motion layout animations, glassmorphism/claymorphism material design
**Confidence:** HIGH

## Summary

Phase 6 adds animated bento grid layouts to the app: a new home page with a hero bento grid, and bento sections integrated into existing feature pages (Trending, Dinner Time, Free Movies). The implementation uses CSS Grid for layout with Tailwind v4 utility classes, Framer Motion `layout` prop for smooth viewport resize reflow, and the existing `ScrollReveal`/`StaggerContainer` animation components for scroll-triggered staggered reveals.

The project already has all the building blocks needed: ClayCard for claymorphism cells, glassmorphism patterns (`bg-white/[0.06] backdrop-blur-xl border border-white/10`) used throughout, Framer Motion v11 with layout animation support, and working data hooks (`useTrending`, `useFreeMovies`, `useDinnerTime`, `useRandomMovie`). The primary new work is: (1) a reusable `BentoGrid` component using CSS Grid with variable column/row spanning, (2) a `BentoCell` component with two material variants (glass for hero cells, clay for supporting cells), (3) a new home page route that replaces the current index route, (4) bento hero sections for Trending/DinnerTime/FreeMovies pages, and (5) responsive breakpoint handling with Framer Motion layout animation on resize.

**Primary recommendation:** Use CSS Grid (`grid-template-columns: repeat(12, 1fr)` on desktop, collapsing to 1-column on mobile) with Tailwind's responsive `col-span-*` / `row-span-*` utilities for static layout, and Framer Motion `layout` prop on each cell for animated reflow on breakpoint transitions. No new dependencies needed.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Grid Content & Placement
- New home page with bento hero grid -- features immediate movie discovery action (prominent discover/CTA cell) alongside feature showcase cells highlighting app capabilities
- Bento sections also appear within existing feature pages (Trending, Dinner Time, Free Movies) -- Claude decides best integration approach per page (replace layout vs hero section above existing content)
- Hero/feature cells are promotional with CTAs; accent cells show live data snippets (rating numbers, poster thumbnails, provider logos)

#### Card Sizing & Visual Hierarchy
- Discover page stays completely untouched -- no bento modifications
- Mix of materials: hero/large cells use glassmorphism (backdrop blur, translucent surfaces over movie imagery), smaller cells use existing claymorphism (soft 3D clay depth)
- Mixed content approach: promotional cells with CTAs for features, live data preview cells for trending/ratings

#### Hover & Reveal Animations
- Full hover treatment: card lifts (scale ~1.03-1.05x) + elevated shadow + accent glow on border + hidden content/overlay reveals (CTA button, extra info)
- Staggered fade-up on scroll entry: cards fade in and slide up one by one with 100-150ms stagger delay
- Smooth morph layout animation on viewport resize -- cells visibly rearrange with spring physics when breakpoint changes
- Click behavior per cell type is Claude's discretion (direct navigation vs expand-in-place preview based on content type)

#### Responsive Stacking Strategy
- Mobile (375px): single column stack, all cells vertical in priority order -- hero first, then features top to bottom
- Mobile touch: tap expands cell to show more info, second tap navigates to the feature page
- Tablet (768px): Claude decides best layout (2-column or scaled-down desktop)
- Mobile cell visibility: Claude decides which cells are essential vs decorative and hides appropriately

### Claude's Discretion
- Tablet grid layout approach
- Which cells to hide on mobile for conciseness
- Per-page integration strategy (replace vs augment existing layouts)
- Click interaction pattern per cell type (direct nav vs expand preview)
- Cell gap/spacing values
- Feature cell grouping and arrangement
- Cell grouping arrangement (which features share cells, which get dedicated cells)
- Column/row span ratios for the desktop grid composition

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| BENT-01 | Bento grid layout component with variable column/row spanning | CSS Grid 12-column pattern with Tailwind col-span/row-span utilities; BentoGrid + BentoCell component architecture |
| BENT-02 | Animated bento grid hero section displaying trending movies, ratings, and providers | useTrending hook provides movie data; glassmorphism material for hero cells; poster thumbnails + rating badges as live data cells |
| BENT-03 | Bento grid for feature showcase sections (discovery, dinner mode, free movies, search) | New home page with feature CTA cells + bento hero sections above existing page content for Trending/DinnerTime/FreeMovies |
| BENT-04 | Responsive bento grids that stack on mobile, 2-col on tablet, full on desktop | Tailwind responsive prefixes (sm/md/lg) on col-span + Framer Motion layout prop for animated reflow |
| BENT-05 | Hover scale effects and staggered reveal animations on bento cards | Existing StaggerContainer (100-150ms stagger), ScrollReveal, motion.div whileHover with scale/shadow/glow |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| CSS Grid | Native | 12-column bento layout with variable cell spanning | Native browser API, zero bundle cost, works with Tailwind utilities |
| Tailwind CSS | v4.0 | Responsive col-span/row-span utilities, gap, backdrop-blur | Already in project, CSS-first config via @tailwindcss/vite |
| Framer Motion (motion) | v11.0 | Layout animation on resize, hover/tap micro-interactions, staggered reveals | Already in project, layout prop handles FLIP-based reflow animation |
| React | v19.0 | Component composition for BentoGrid/BentoCell | Already in project |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Zustand | v5.0 | State for expanded mobile cell tracking | Already in project, only if tap-to-expand needs global state |
| Lucide React | v0.469 | Icons in CTA cells (Compass, TrendingUp, etc.) | Already in project, same icons as TabBar |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS Grid 12-col | CSS Grid auto-fit/minmax | 12-col gives explicit control over cell spans needed for bento asymmetry; auto-fit is better for uniform grids |
| Framer Motion layout | CSS transitions on grid changes | CSS cannot animate between grid-template-columns changes; FM layout prop handles this via FLIP technique |

**Installation:**
No new packages needed. All dependencies are already installed.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── bento/
│   │   ├── BentoGrid.tsx          # Reusable grid container with responsive breakpoints
│   │   ├── BentoCell.tsx          # Individual cell with material variants (glass/clay)
│   │   ├── cells/                 # Content-specific cell components
│   │   │   ├── DiscoverHeroCell.tsx    # Large CTA cell for movie discovery
│   │   │   ├── TrendingPreviewCell.tsx # Live trending movie posters
│   │   │   ├── RatingShowcaseCell.tsx  # Live rating numbers display
│   │   │   ├── ProviderLogosCell.tsx   # Streaming provider logo grid
│   │   │   ├── DinnerTimeCell.tsx      # Dinner Time feature CTA
│   │   │   ├── FreeMoviesCell.tsx      # Free Movies feature CTA
│   │   │   └── SearchCell.tsx          # Search feature CTA
│   │   └── index.ts               # Barrel exports
│   └── ...existing...
├── pages/
│   ├── HomePage.tsx               # NEW: Home page with bento hero grid
│   ├── DiscoverPage.tsx           # UNCHANGED per user constraint
│   └── ...existing...
└── ...existing...
```

### Pattern 1: BentoGrid Container Component
**What:** A CSS Grid container with 12-column layout on desktop, responsive collapse, and Framer Motion layout animation on children.
**When to use:** Every bento grid section (home page hero, page hero sections).
**Example:**
```typescript
// BentoGrid.tsx — CSS Grid container with responsive breakpoints
import { motion } from 'motion/react';
import type { ReactNode } from 'react';

interface BentoGridProps {
  children: ReactNode;
  className?: string;
  /** Gap between cells in Tailwind spacing (default: gap-4) */
  gap?: string;
}

export function BentoGrid({ children, className = '', gap = 'gap-4' }: BentoGridProps) {
  return (
    <motion.div
      className={`
        grid grid-cols-1
        md:grid-cols-2
        lg:grid-cols-12
        lg:auto-rows-[minmax(120px,auto)]
        grid-flow-dense
        ${gap}
        ${className}
      `}
      layout
    >
      {children}
    </motion.div>
  );
}
```

### Pattern 2: BentoCell with Material Variants
**What:** A cell wrapper supporting two material styles (glassmorphism for hero/large cells, claymorphism for supporting cells) with hover lift, accent glow, and optional hidden content reveal.
**When to use:** Every cell inside a BentoGrid.
**Example:**
```typescript
// BentoCell.tsx — Cell with glass/clay material + hover animation
import { motion, type Variants } from 'motion/react';
import { useState, type ReactNode } from 'react';

type CellMaterial = 'glass' | 'clay';

interface BentoCellProps {
  children: ReactNode;
  /** Column span at each breakpoint */
  span?: { mobile?: number; tablet?: number; desktop: number };
  /** Row span */
  rowSpan?: number;
  material?: CellMaterial;
  className?: string;
  /** Content revealed on hover (desktop) or tap (mobile) */
  overlay?: ReactNode;
  onClick?: () => void;
}

const materialClasses: Record<CellMaterial, string> = {
  glass: 'bg-white/[0.08] backdrop-blur-xl border border-white/10 shadow-lg shadow-black/10',
  clay: 'bg-clay-surface border border-white/10 clay-shadow-md',
};

export function BentoCell({
  children,
  span = { desktop: 3 },
  rowSpan = 1,
  material = 'clay',
  className = '',
  overlay,
  onClick,
}: BentoCellProps) {
  const [expanded, setExpanded] = useState(false);
  const colClasses = [
    span.mobile ? `col-span-${span.mobile}` : 'col-span-1',
    span.tablet ? `md:col-span-${span.tablet}` : '',
    `lg:col-span-${span.desktop}`,
  ].filter(Boolean).join(' ');
  const rowClass = rowSpan > 1 ? `lg:row-span-${rowSpan}` : '';

  return (
    <motion.div
      layout
      className={`
        rounded-2xl overflow-hidden relative
        ${materialClasses[material]}
        ${colClasses} ${rowClass}
        ${className}
      `}
      whileHover={{
        scale: 1.03,
        transition: { type: 'spring', stiffness: 300, damping: 20 },
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      transition={{ layout: { type: 'spring', stiffness: 200, damping: 25 } }}
    >
      {children}
      {overlay && (
        <motion.div
          className="absolute inset-0 bg-black/40 flex items-end p-4"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {overlay}
        </motion.div>
      )}
    </motion.div>
  );
}
```

### Pattern 3: Staggered Scroll Reveal for Bento Cells
**What:** Reuse existing StaggerContainer/StaggerItem pattern for bento cells entering viewport.
**When to use:** Wrapping BentoGrid content for scroll-triggered stagger.
**Example:**
```typescript
// Wrap BentoGrid cells in StaggerContainer for scroll entry
<StaggerContainer stagger={0.12} direction="up">
  <StaggerItem direction="up">
    <BentoCell material="glass" span={{ desktop: 6 }} rowSpan={2}>
      <DiscoverHeroCell />
    </BentoCell>
  </StaggerItem>
  <StaggerItem direction="up">
    <BentoCell material="clay" span={{ desktop: 3 }}>
      <TrendingPreviewCell />
    </BentoCell>
  </StaggerItem>
  {/* ...more cells... */}
</StaggerContainer>
```

### Pattern 4: Mobile Tap-to-Expand
**What:** On mobile, first tap expands a cell (shows more info/CTA), second tap navigates. Uses React state local to each cell.
**When to use:** Feature CTA cells on mobile that need preview before navigation.
**Example:**
```typescript
// Inside a feature CTA cell
const [isExpanded, setIsExpanded] = useState(false);

function handleClick() {
  if (window.innerWidth < 768 && !isExpanded) {
    setIsExpanded(true);
    return;
  }
  // Navigate to feature page
  navigate('/trending');
}
```

### Pattern 5: New Home Page Route Architecture
**What:** Add a new `/home` or make `/` the home page with bento grid, move Discover to `/discover`.
**When to use:** The home page is the landing experience; Discover remains unchanged at its own route.
**Recommended approach:**
```typescript
// main.tsx — Updated routes
const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },       // NEW: Bento grid home
      { path: 'discover', element: <DiscoverPage /> }, // Moved from index
      { path: 'trending', element: <TrendingPage /> },
      { path: 'dinner-time', element: <DinnerTimePage /> },
      { path: 'free-movies', element: <FreeMoviesPage /> },
      { path: 'showcase', element: <Showcase /> },
    ],
  },
]);
```
The TabBar needs a new "Home" tab (e.g., Home icon) and the Discover tab moves to a secondary position. Alternatively, make the home page a dedicated entry section accessed only on first load and keep the TabBar as-is with Discover as the functional default tab.

### Anti-Patterns to Avoid
- **layout on every element:** Only add Framer Motion `layout` prop to the grid container and direct cell children. Applying layout to deeply nested elements causes cascading FLIP calculations that hurt performance.
- **Animating grid-template-columns directly:** CSS cannot transition between grid-template-columns values. Use Framer Motion layout instead to animate element positions/sizes.
- **Dynamic Tailwind class names:** `col-span-${n}` will NOT work because Tailwind v4 uses static analysis. Use a mapping object or explicit class strings.
- **Mixed sizing units in grid:** Keep all cells on the same 12-column grid. Do not mix fixed px widths with fr units in the same grid definition.
- **Forgetting grid-flow-dense:** Without `grid-flow-dense`, smaller cells may leave gaps in the grid when larger cells push them to the next row.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Scroll-triggered stagger | Custom IntersectionObserver stagger | Existing StaggerContainer + StaggerItem | Already built in Phase 5, handles whileInView with configurable stagger/direction |
| Layout reflow animation | CSS transition or JS animation loop | Framer Motion `layout` prop | FLIP-based animation handles complex position/size changes automatically |
| Glassmorphism material | Custom CSS class per cell | Shared pattern `bg-white/[0.08] backdrop-blur-xl border border-white/10` | Already used across ClayCard, MovieHero, ClayBadge, SearchModal, TabBar |
| Hover micro-interactions | Custom hover state tracking | Framer Motion `whileHover` / `whileTap` | Already established pattern in ClayCard, MetalButton, DinnerTimePage service buttons |
| Responsive breakpoints | Custom matchMedia hooks | Tailwind responsive prefixes (md:, lg:) | Already the standard approach throughout the project |

**Key insight:** This phase is primarily a layout and composition exercise. Almost every animation primitive, material style, and data hook already exists in the codebase. The new work is composing them into bento grid layouts and creating a home page.

## Common Pitfalls

### Pitfall 1: Framer Motion layout + borderRadius/boxShadow Distortion
**What goes wrong:** When layout animations change element size, `borderRadius` and `boxShadow` can appear distorted (stretched/squished) during the transition because Framer Motion uses CSS transforms internally.
**Why it happens:** The layout FLIP technique applies `scaleX`/`scaleY` transforms, which distort non-transform properties like borderRadius.
**How to avoid:** Set `borderRadius` and `boxShadow` as inline styles on the motion.div, NOT as CSS classes. Framer Motion automatically corrects distortion for inline style values. Example: `style={{ borderRadius: '1rem' }}` instead of `className="rounded-2xl"`.
**Warning signs:** Border radius looks oval/stretched during resize transitions; shadows stretch diagonally.

### Pitfall 2: Dynamic Tailwind Class Names
**What goes wrong:** Using `col-span-${variable}` in JSX produces no CSS because Tailwind v4 performs static analysis at build time and cannot detect dynamically constructed class names.
**Why it happens:** Tailwind's JIT compiler scans source files for complete class strings. Template literals with variables are not detected.
**How to avoid:** Use a lookup object mapping span numbers to full class strings:
```typescript
const colSpanClasses: Record<number, string> = {
  1: 'lg:col-span-1',
  2: 'lg:col-span-2',
  3: 'lg:col-span-3',
  4: 'lg:col-span-4',
  6: 'lg:col-span-6',
  8: 'lg:col-span-8',
  12: 'lg:col-span-12',
};
```
**Warning signs:** Cells all collapse to 1-column width despite span props being set correctly.

### Pitfall 3: Performance with Many layout Elements
**What goes wrong:** Applying `layout` to dozens of elements causes janky animation on resize because every element triggers a FLIP measurement+animation cycle.
**Why it happens:** Each `layout` element measures its bounding box before and after layout change, then animates the delta. With many elements, this becomes expensive.
**How to avoid:** Apply `layout` only to direct BentoCell wrappers (the grid items), NOT to content inside cells. Use `layout="position"` where only position changes (not size). Limit to under 20 layout-animated elements per grid.
**Warning signs:** Stuttering during viewport resize, high paint times in DevTools.

### Pitfall 4: CSS Grid + auto-rows Height Collapse on Mobile
**What goes wrong:** Using `grid-auto-rows: 1fr` on mobile causes all cells to be the same height, squishing content or creating excessive whitespace.
**Why it happens:** `1fr` distributes available space equally. On mobile with single-column, this means all cells match the tallest cell's height.
**How to avoid:** Only apply `auto-rows-[minmax(120px,auto)]` or `auto-rows-fr` at the desktop breakpoint (`lg:`). On mobile, let rows auto-size to content with `auto-rows-auto` (the default).
**Warning signs:** Mobile cells have huge empty spaces or content is cut off.

### Pitfall 5: Tap-to-Expand State Persistence
**What goes wrong:** Mobile tap-to-expand state persists when user scrolls away and returns, creating a confusing UI where cells appear already expanded.
**Why it happens:** React state persists as long as the component is mounted.
**How to avoid:** Reset expanded state when the cell leaves the viewport (via IntersectionObserver or on scroll). Or auto-collapse after a timeout (3-5 seconds).
**Warning signs:** User returns to grid and sees cells in expanded state they did not just tap.

### Pitfall 6: Home Page Route Conflict with Discover
**What goes wrong:** The current app has Discover (DiscoveryPage) as the index route (`/`). Adding a home page at `/` requires moving Discover elsewhere, which breaks existing deep links and user expectations.
**Why it happens:** HashRouter routes are positional -- `{ index: true }` can only match one component.
**How to avoid:** Two viable approaches: (A) Home at `/`, Discover moves to `/discover`, update TabBar to have Home + Discover tabs. (B) Keep Discover at `/`, add home bento content above DiscoveryPage as a scroll-up hero section. Approach (A) is cleaner. Update the TabBar to include a Home icon as the first tab.
**Warning signs:** Deep links to `/#/?movie=123` break; TabBar active states are wrong.

## Code Examples

### CSS Grid 12-Column Bento Layout with Tailwind
```typescript
// Home page hero grid — 12 columns on desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 lg:auto-rows-[minmax(120px,auto)] grid-flow-dense gap-4 lg:gap-5">
  {/* Hero CTA cell — 6 columns, 2 rows */}
  <div className="md:col-span-2 lg:col-span-6 lg:row-span-2">
    <DiscoverHeroCell />
  </div>

  {/* Trending preview — 3 columns, 2 rows */}
  <div className="lg:col-span-3 lg:row-span-2">
    <TrendingPreviewCell />
  </div>

  {/* Rating showcase — 3 columns, 1 row */}
  <div className="lg:col-span-3">
    <RatingShowcaseCell />
  </div>

  {/* Provider logos — 3 columns, 1 row */}
  <div className="lg:col-span-3">
    <ProviderLogosCell />
  </div>

  {/* Dinner Time CTA — 4 columns, 1 row */}
  <div className="lg:col-span-4">
    <DinnerTimeCell />
  </div>

  {/* Free Movies CTA — 4 columns, 1 row */}
  <div className="lg:col-span-4">
    <FreeMoviesCell />
  </div>

  {/* Search CTA — 4 columns, 1 row */}
  <div className="lg:col-span-4">
    <SearchCell />
  </div>
</div>
```

### Framer Motion Layout Animation for Grid Resize
```typescript
// BentoCell with layout animation for smooth breakpoint transitions
import { motion } from 'motion/react';

<motion.div
  layout
  transition={{
    layout: {
      type: 'spring',
      stiffness: 200,
      damping: 25,
    },
  }}
  style={{ borderRadius: '1rem' }}  // Inline to prevent distortion
  className="bg-white/[0.08] backdrop-blur-xl border border-white/10 overflow-hidden"
>
  {/* Cell content */}
</motion.div>
```

### Hover Effect with Scale + Shadow + Glow
```typescript
// Full hover treatment per user decision
<motion.div
  whileHover={{
    scale: 1.03,
    boxShadow: '0 20px 40px rgba(0,0,0,0.15), 0 0 0 1px var(--accent)',
    transition: { type: 'spring', stiffness: 300, damping: 20 },
  }}
  whileTap={{ scale: 0.98 }}
  className="rounded-2xl overflow-hidden relative group"
>
  {/* Content */}
  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
    {/* Hidden overlay content revealed on hover */}
  </div>
</motion.div>
```

### Mobile Tap-to-Expand Cell
```typescript
// Tap once to expand (show CTA), tap again to navigate
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';

function FeatureCell({ route, title, description, children }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const handleClick = useCallback(() => {
    // Desktop: always navigate directly
    if (window.innerWidth >= 768) {
      navigate(route);
      return;
    }
    // Mobile: first tap expands, second tap navigates
    if (!expanded) {
      setExpanded(true);
    } else {
      navigate(route);
    }
  }, [expanded, navigate, route]);

  return (
    <motion.div layout onClick={handleClick} className="...">
      {children}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <p>{description}</p>
            <span>Tap again to open</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
```

### Glassmorphism Hero Cell with Movie Backdrop
```typescript
// Large hero cell with movie backdrop image + glassmorphism overlay
<div className="relative overflow-hidden rounded-2xl">
  {/* Background movie poster/backdrop */}
  <img
    src={backdropUrl}
    alt=""
    className="absolute inset-0 w-full h-full object-cover"
    aria-hidden="true"
  />
  {/* Glassmorphism overlay */}
  <div className="relative bg-black/30 backdrop-blur-md p-6 lg:p-8 h-full flex flex-col justify-end">
    <h2 className="font-heading text-2xl lg:text-3xl text-white font-semibold">
      Discover Your Next Movie
    </h2>
    <p className="text-white/70 text-sm mt-2">
      Smart recommendations powered by your taste
    </p>
    <MetalButton variant="primary" size="lg" className="mt-4 w-fit">
      Start Discovering
    </MetalButton>
  </div>
</div>
```

## Claude's Discretion Recommendations

### Tablet Layout (768px)
**Recommendation:** 2-column grid. Map desktop 12-column spans to 2 columns:
- Desktop 6+ columns = full width (md:col-span-2)
- Desktop 3-4 columns = half width (md:col-span-1)
- This preserves the visual hierarchy while fitting tablet viewport

### Which Cells to Hide on Mobile
**Recommendation:** Hide provider logos cell and rating showcase cell on mobile. These are decorative data preview cells. Keep:
- Discover hero CTA (essential -- primary action)
- Trending preview (engaging visual content)
- Dinner Time CTA (feature promotion)
- Free Movies CTA (feature promotion)
- Search CTA (utility)

Use `hidden md:block` on decorative cells.

### Per-Page Integration Strategy
**Recommendation:**
- **Trending page:** Add a compact 3-cell bento hero above the existing movie grid (trending highlight + rating + CTA). Keep the existing horizontal scroll grid below.
- **Dinner Time page:** Add a small bento section above the service selector showing the feature's value proposition (3 cells: family icon, service logos, CTA).
- **Free Movies page:** Add a compact bento hero above existing content (2-3 cells: YouTube branding, movie count stat, CTA).
- These are additive sections, not replacements. The existing page functionality remains intact below.

### Click Interaction Pattern
**Recommendation:**
- **Feature CTA cells:** Direct navigation on desktop, tap-to-expand on mobile
- **Live data preview cells (trending posters, ratings):** Direct navigation to the relevant page on both desktop and mobile
- **Hero discover CTA:** Always direct navigation to `/discover`
- **Search CTA:** Opens SearchModal directly (no navigation)

### Cell Gap/Spacing
**Recommendation:** `gap-4` (16px) on mobile, `gap-5` (20px) on desktop (`gap-4 lg:gap-5`). This matches the existing spacing patterns (Trending grid uses `gap-4`, Showcase uses `gap-6 md:gap-8`). 16-20px is within the standard bento gutter range.

### Feature Cell Grouping
**Recommendation for home page hero grid (desktop 12-col):**
| Cell | Col Span | Row Span | Material | Content |
|------|----------|----------|----------|---------|
| Discover CTA | 6 | 2 | glass | Movie backdrop + CTA button |
| Trending Preview | 3 | 2 | glass | 2-3 trending movie posters |
| Rating Showcase | 3 | 1 | clay | Live rating numbers (TMDB/IMDb) |
| Provider Logos | 3 | 1 | clay | Top streaming provider logos |
| Dinner Time CTA | 4 | 1 | clay | Family icon + CTA |
| Free Movies CTA | 4 | 1 | clay | YouTube icon + movie count |
| Search CTA | 4 | 1 | clay | Search icon + CTA |

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| JS-based grid libraries (Masonry, Isotope) | Native CSS Grid with grid-flow-dense | CSS Grid supported in all browsers | No JS dependency for layout; better performance |
| Framer Motion v6-10 layout animations | Motion v11 with improved React 19 concurrent rendering support | 2025 | More reliable layout animations in concurrent mode |
| Manual FLIP animations | Framer Motion `layout` prop | Stable since FM v5 | One prop replaces hundreds of lines of FLIP code |
| CSS @media queries only for responsive | Tailwind responsive prefixes + Framer Motion layout | Ongoing | Static layout via CSS, animated transitions via FM |

**Deprecated/outdated:**
- `framer-motion` package name: Now `motion` (the project already uses `motion/react` imports correctly)
- `LayoutGroup` wrapping for sibling animations: Only needed when multiple instances of the same layoutId exist; not needed for basic grid reflow

## Open Questions

1. **Home Page Route Architecture**
   - What we know: The current index route is DiscoverPage. A new home page needs to be the landing page.
   - What's unclear: Whether to add a new "Home" tab to TabBar (5 tabs) or replace the current Discover tab with a combined home/discover experience.
   - Recommendation: Add Home as the index route, move Discover to `/discover`, and add a 5th "Home" tab to TabBar. The home page provides a showcase; Discover is the functional movie finder. If 5 tabs feels crowded, make the home page accessible via the app logo in the Navbar instead.

2. **Live Data Fetching for Home Page**
   - What we know: useTrending fetches now-playing movies. These can populate the trending preview cell.
   - What's unclear: How much data to fetch on the home page vs. lazy loading cells.
   - Recommendation: Fetch trending data eagerly (it's small and cached). Provider logos are static. Ratings can show a curated placeholder or the first trending movie's rating. Keep it lightweight -- home page is a showcase, not a data-heavy page.

3. **Scroll Position Management**
   - What we know: Adding bento hero sections above existing page content increases scroll depth.
   - What's unclear: Whether scroll position should be managed (auto-scroll past hero on return visits).
   - Recommendation: No scroll position management needed. Users expect to see the hero on each visit. If the hero is too tall, keep it compact (2 rows max on desktop).

## Sources

### Primary (HIGH confidence)
- Codebase analysis: All existing components, hooks, pages, styles, and routing verified by reading source files
- [Motion layout animations docs](https://motion.dev/docs/react-layout-animations) - Layout prop, layoutId, LayoutGroup, FLIP technique
- [Motion React component docs](https://motion.dev/docs/react-motion-component) - whileHover, whileTap, layout prop API

### Secondary (MEDIUM confidence)
- [Maxime Heckel blog - Framer Motion layout animations](https://blog.maximeheckel.com/posts/framer-motion-layout-animations/) - layout prop variants ("position", "size"), distortion fixes, LayoutGroup usage, borderRadius/boxShadow inline style requirement
- [iamsteve.me - Bento layout CSS Grid](https://iamsteve.me/blog/bento-layout-css-grid) - 12-column grid, grid-flow-dense, responsive breakpoints, Tailwind implementation
- [SaaSFrame - Bento grids 2026 practical guide](https://www.saasframe.io/blog/designing-bento-grids-that-actually-work-a-2026-practical-guide) - Cell sizing ratios, visual hierarchy, mobile stacking, gap recommendations, common mistakes
- [Inkbot Design - Bento grid design 2026](https://inkbotdesign.com/bento-grid-design/) - Modular hierarchy principles

### Tertiary (LOW confidence)
- None -- all findings verified against codebase or official documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in the project; CSS Grid is native; verified Motion v11 layout capabilities
- Architecture: HIGH - Based on thorough codebase analysis of existing components, routing, hooks, and styling patterns
- Pitfalls: HIGH - borderRadius distortion documented in official Motion docs; dynamic Tailwind classes is a known Tailwind v4 behavior; performance limits from Motion docs
- Discretion areas: MEDIUM - Recommendations based on design principles and codebase patterns, but specific layouts may need visual iteration

**Research date:** 2026-02-18
**Valid until:** 2026-03-18 (stable domain -- CSS Grid and Framer Motion layout APIs are mature)
