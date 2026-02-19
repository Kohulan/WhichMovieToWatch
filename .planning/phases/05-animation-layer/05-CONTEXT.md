# Phase 5: Animation Layer - Context

**Gathered:** 2026-02-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Add Framer Motion animations for page transitions, scroll-triggered reveals, micro-interactions, and skeuomorphic material enhancements to the existing claymorphism/metal UI. Includes a Netflix-style splash screen animation. All animations must respect prefers-reduced-motion. No new features or capabilities — this enhances the visual experience of existing Phase 1-4 components and pages.

</domain>

<decisions>
## Implementation Decisions

### Page Transitions
- Claude's discretion on transition type between pages (fade, slide, scale, or combination) — pick what fits claymorphism best
- Transition tempo: smooth (300-450ms) — noticeable but not slow, premium feel
- Search modal: dramatic overlay — slides up from bottom with backdrop blur, cinematic panel feel
- Movie detail views: hero expand — movie poster expands from card into detail view using shared layout animation (Framer Motion layoutId)
- "Next Movie" on Discovery: morph transition — current movie poster/details dissolve and morph into the new movie, fluid and cinematic

### Splash Screen
- Netflix-style logo animation on app launch (every page load/refresh)
- WMTW logo assembles/reveals with dramatic lighting on dark background — like Netflix's "N" animation
- Always plays through (~2-3s), no skip button — it's the brand moment
- Only on app launch, not on subsequent in-app navigations

### Scroll Reveal Choreography
- Mixed approach: sections fade in as units, individual cards within stagger slightly
- Dramatic vertical travel (60-100px) — elements really "arrive" on screen
- Replay on scroll-back with shorter duration — first appearance is full animation, re-entries are quicker/subtler
- Horizontal lists (provider logos, genre badges): slide in as a group from one side — clean and unified

### Micro-Interaction Personality
- Refined precision feel — crisp, controlled movements with subtle scale and color shifts. Premium and intentional, like Apple's UI
- Signature action button animations: heart pulse for Love, checkmark draw for Watched, X slide for Not Interested — each action has its own animation
- Tab bar: both sliding indicator + icon state change (outline → filled with subtle bounce) — maximum feedback on tab switch
- Claude's discretion on toast notification animations — pick what fits the refined precision feel

### Material Enhancements (Skeuomorphism References)
- Full implementation of all 5 enhancement areas from SKEUOMORPHISM-REFERENCES.md:
  1. Dramatic directional lighting (specular highlights, rim light on knobs/toggles)
  2. Deeper inset track shadows on MetalToggle and MetalSlider
  3. Material contrast strengthening (metallic knobs on matte surfaces, rubber buttons on ceramic panels)
  4. Accent glow rings on active controls (orange dark mode, cyan light mode)
  5. Surface texture enhancement (existing + new)
- Accent glow: animated pulse — gentle pulsing glow on active controls, feels alive like a power indicator
- Light-mode clay cards: subtle CSS radial-gradient ripple texture for ceramic/porcelain feel (Kosma reference)
- RotaryDial: Claude's discretion on enhancement level — pick what looks best with claymorphism aesthetic

### Claude's Discretion
- Page transition type selection (fade, slide, scale, or combination)
- Toast notification entrance animation style
- RotaryDial enhancement level (full brushed metal vs glow ring + shadow only)
- Exact spring physics parameters for all animations
- Loading animation design (movie-themed content per ANIM-06)
- prefers-reduced-motion implementation approach

</decisions>

<specifics>
## Specific Ideas

- "Look into other professional websites and get more idea" — research Netflix, Apple TV+, Disney+, Letterboxd for animation inspiration
- Netflix-style splash screen is a priority — dramatic logo reveal on dark background, ~2-3s, always plays on launch
- The morph transition for "Next Movie" should feel fluid and cinematic, not jarring
- Hero expand for movie details should use Framer Motion's shared layout animation (layoutId) for spatial connection
- All skeuomorphic enhancements should reference the 3 Dribbble images in `.planning/references/`

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-animation-layer*
*Context gathered: 2026-02-18*
