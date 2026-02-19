# Phase 6: Bento Grid Layouts - Context

**Gathered:** 2026-02-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Create animated bento grid layouts for a new home page hero section and feature showcases across existing pages, with responsive breakpoints. The Discover page remains untouched — bento grids are additive to the home page and enhance other feature pages.

</domain>

<decisions>
## Implementation Decisions

### Grid Content & Placement
- New home page with bento hero grid — features immediate movie discovery action (prominent discover/CTA cell) alongside feature showcase cells highlighting app capabilities
- Bento sections also appear within existing feature pages (Trending, Dinner Time, Free Movies) — Claude decides best integration approach per page (replace layout vs hero section above existing content)
- Hero/feature cells are promotional with CTAs; accent cells show live data snippets (rating numbers, poster thumbnails, provider logos)

### Card Sizing & Visual Hierarchy
- Discover page stays completely untouched — no bento modifications
- Mix of materials: hero/large cells use glassmorphism (backdrop blur, translucent surfaces over movie imagery), smaller cells use existing claymorphism (soft 3D clay depth)
- Mixed content approach: promotional cells with CTAs for features, live data preview cells for trending/ratings

### Claude's Discretion — Sizing
- Cell grouping arrangement (which features share cells, which get dedicated cells)
- Gap/spacing between bento cells — pick what looks best with the clay/glass material mix
- Column/row span ratios for the desktop grid composition

### Hover & Reveal Animations
- Full hover treatment: card lifts (scale ~1.03-1.05x) + elevated shadow + accent glow on border + hidden content/overlay reveals (CTA button, extra info)
- Staggered fade-up on scroll entry: cards fade in and slide up one by one with 100-150ms stagger delay
- Smooth morph layout animation on viewport resize — cells visibly rearrange with spring physics when breakpoint changes
- Click behavior per cell type is Claude's discretion (direct navigation vs expand-in-place preview based on content type)

### Responsive Stacking Strategy
- Mobile (375px): single column stack, all cells vertical in priority order — hero first, then features top to bottom
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

</decisions>

<specifics>
## Specific Ideas

- "Make it visually stunning" — user explicitly wants high visual impact
- Mix of materials creates depth hierarchy: glass for hero/prominent cells, clay for supporting cells
- Tap-to-expand on mobile gives users a preview before committing to navigation
- Live data snippets (real posters, ratings, provider logos) in accent cells make the grid feel alive, not static

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 06-bento-grid-layouts*
*Context gathered: 2026-02-18*
