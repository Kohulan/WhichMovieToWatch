---
phase: 05-animation-layer
plan: 05
subsystem: ui
tags: [css, skeuomorphism, metal, clay, animation, framer-motion, zustand]

# Dependency graph
requires:
  - phase: 05-animation-layer (plans 01-04)
    provides: Metal and clay CSS foundations, MetalToggle, MetalSlider, RotaryDial, ClayCard components

provides:
  - Enhanced metal knob specular highlight (metal-knob-enhanced CSS class)
  - Deep inset track shadows (metal-track-deep CSS class)
  - Rim light knob effect (metal-knob-rim CSS class)
  - Pulsing accent glow on checked controls (accent-glow-active CSS + @keyframes)
  - Ceramic concentric ripple texture for light-mode clay cards (ceramic-ripple CSS class)
  - Enhanced floating clay shadow (clay-shadow-deep CSS class)
  - MetalToggle with deeper track, specular knob, pulsing glow when checked
  - MetalSlider with deeper rail and specular knob
  - RotaryDial with 2s orange glow ring on interaction, stronger preset dot glow
  - ClayCard with light-mode ceramic ripple texture via useThemeStore

affects: [05-animation-layer, 06-movie-pages, 07-3d-effects]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - accent-glow-active applied conditionally based on interactive state (checked/clicked)
    - isGlowing state + useRef timer for transient 2s glow, cleared on unmount
    - isDark derived inline from useThemeStore mode comparison (mode === 'dark')
    - CSS @keyframes defined in metal.css for colocation with affected elements

key-files:
  created: []
  modified:
    - src/styles/metal.css
    - src/styles/clay.css
    - src/components/ui/MetalToggle.tsx
    - src/components/ui/MetalSlider.tsx
    - src/components/ui/RotaryDial.tsx
    - src/components/ui/ClayCard.tsx

key-decisions:
  - "accent-glow-pulse @keyframes added to metal.css (not a separate animations.css) for CSS colocation with metal components"
  - "RotaryDial glow ring applied to knob wrapper div (w-14 h-14 container) not the motion.div, so glow surrounds entire dial area"
  - "isDark in ClayCard derived as mode === 'dark' inline (themeStore has no isDark computed property)"
  - "metal-knob-enhanced replaces metal-knob class on enhanced knobs — background property overrides cleanly since CSS specificity is equal"

patterns-established:
  - "Transient glow state pattern: useState boolean + useRef timer + clearTimeout on unmount for 2s interaction feedback"
  - "Conditional CSS class for theme-aware texture: !isDark ? 'ceramic-ripple' : '' — no inline styles needed"
  - "Specular highlight via stacked radial-gradients: bright ellipse at 35% 25% layered above base dome gradient"

requirements-completed: [ANIM-03]

# Metrics
duration: 3min
completed: 2026-02-18
---

# Phase 05 Plan 05: Skeuomorphic Material Enhancements Summary

**Specular highlights, deep track shadows, accent glow rings, and ceramic ripple texture applied to MetalToggle, MetalSlider, RotaryDial, and ClayCard for hyper-realistic hardware aesthetic**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-02-18T21:11:18Z
- **Completed:** 2026-02-18T21:14:23Z
- **Tasks:** 2 completed
- **Files modified:** 6

## Accomplishments

- Added 6 new CSS classes to metal.css and clay.css covering specular highlights, deep track shadows, rim lights, pulsing accent glow, ceramic ripple, and enhanced floating shadow
- Applied enhanced classes to all 4 target components with conditional state-driven behavior (checked/glowing/dark mode)
- RotaryDial glow ring fades cleanly after 2s via useRef timer with unmount cleanup

## Task Commits

1. **Task 1: Enhance metal.css and clay.css with material classes** - `1f53ec9` (feat)
2. **Task 2: Apply material enhancements to MetalToggle, MetalSlider, RotaryDial, and ClayCard** - `8d2baa0` (feat)

## Files Created/Modified

- `src/styles/metal.css` - Added .metal-knob-enhanced, .metal-track-deep, .metal-knob-rim, @keyframes accent-glow-pulse, .accent-glow-active
- `src/styles/clay.css` - Added .ceramic-ripple (with ::before pseudo-element), .clay-shadow-deep
- `src/components/ui/MetalToggle.tsx` - Deeper track boxShadow, metal-knob-enhanced on knob, accent-glow-active when checked
- `src/components/ui/MetalSlider.tsx` - Deeper rail boxShadow, metal-knob-enhanced on knob with rim light
- `src/components/ui/RotaryDial.tsx` - isGlowing state + timer, accent-glow-active on wrapper div, metal-knob-enhanced, stronger dot glow (10px + 20px layer)
- `src/components/ui/ClayCard.tsx` - useThemeStore import, isDark derivation, ceramic-ripple in light mode

## Decisions Made

- `accent-glow-pulse` @keyframes defined in metal.css (not a separate animations.css) since the plan references animations.css which does not exist. Colocation with metal components keeps the animation definition near its consumers.
- RotaryDial glow ring wraps the entire `w-14 h-14` container div (not just the motion.div) so the glow correctly surrounds the full dial + indicator dots area.
- `isDark` derived inline as `mode === 'dark'` since themeStore has no computed `isDark` property — matches existing pattern in RotaryDial (already imports useThemeStore).
- `metal-knob-enhanced` replaces `metal-knob` on all enhanced knobs — the two-layer radial-gradient background in the enhanced class supersedes the single-layer base class cleanly.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added accent-glow-pulse @keyframes to metal.css**
- **Found during:** Task 1 (CSS class creation)
- **Issue:** Plan references `src/styles/animations.css` for accent-glow-active animation, but that file does not exist in the project. Without the @keyframes definition, the class would apply no animation.
- **Fix:** Defined `@keyframes accent-glow-pulse` and `.accent-glow-active` directly in metal.css, colocated with other metal enhancement classes.
- **Files modified:** src/styles/metal.css
- **Verification:** Build succeeds, class present in compiled CSS output
- **Committed in:** 1f53ec9 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 missing critical)
**Impact on plan:** Essential for correct animation behavior. No scope creep — accent-glow-active is referenced in must_haves and key_links, just placed in a different file than the non-existent animations.css.

## Issues Encountered

None - build passed cleanly on both tasks.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 5 skeuomorphic enhancement areas from SKEUOMORPHISM-REFERENCES.md are implemented
- Metal and clay components now have full hardware-realistic depth (specular highlights, deep shadows, accent glows, ceramic texture)
- Ready for Phase 6: Movie Pages where these enhanced components will appear in full feature context

---
*Phase: 05-animation-layer*
*Completed: 2026-02-18*
