---
phase: 01-foundation-design-system
plan: 04
subsystem: ui
tags: [metal-components, brushed-metal, skeuomorphic, spring-animations, motion-react, hardware-controls]

# Dependency graph
requires:
  - phase: 01-02
    provides: "6 CSS theme variants with --metal-base, --metal-shine, --metal-dark variables per preset"
provides:
  - "metal.css with brushed metal gradient, shadow presets, knob radial gradient, text styling"
  - "MetalButton component with primary/secondary/ghost variants and 3 sizes"
  - "MetalToggle component with spring-animated sliding metal knob"
  - "MetalSlider component with draggable metal knob on recessed rail"
  - "MetalCheckbox component with metal-gradient border frame and animated checkmark"
  - "MetalDropdown component with metal trigger and clay dropdown panel"
  - "Two-material design language: metal hardware controls distinct from clay surfaces"
affects: [01-05, 01-06, all-subsequent-phases]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "metal.css utility classes (metal-gradient, metal-shadow, metal-shadow-pressed, metal-shadow-hover, metal-text, metal-knob)"
    - "Motion spring animations with high stiffness (300-500) for firm hardware feel"
    - "HTMLMotionProps<'button'> for composable motion.button components (avoids onDrag type conflict)"
    - "AnimatePresence for mount/unmount animations (checkbox checkmark, dropdown panel)"
    - "Two-material pattern: metal for interactive controls, clay for passive surfaces"
    - "Metal finish auto-matched per theme preset via CSS variables (brass/chrome/gunmetal)"

key-files:
  created: [src/styles/metal.css, src/components/ui/MetalButton.tsx, src/components/ui/MetalToggle.tsx, src/components/ui/MetalSlider.tsx, src/components/ui/MetalCheckbox.tsx, src/components/ui/MetalDropdown.tsx]
  modified: [src/styles/app.css, src/App.tsx]

key-decisions:
  - "Used HTMLMotionProps<'button'> instead of ButtonHTMLAttributes to avoid onDrag type conflict between React and Motion"
  - "MetalDropdown uses two-material pattern: metal-gradient trigger, clay-elevated dropdown panel"
  - "Spring stiffness 300-500 for metal components (vs lower for clay) to convey firm hardware feel"
  - "MetalSlider uses motion drag with dragConstraints instead of native range input for consistent skeuomorphic appearance"

patterns-established:
  - "Metal components import from motion/react, use --metal-* CSS variables"
  - "Shadow state management: default -> hover -> pressed via whileHover/whileTap animate props"
  - "Accessibility via hidden native inputs (checkbox) or ARIA roles (toggle switch, slider, listbox)"
  - "Keyboard navigation: Enter/Space for toggle/checkbox, arrows for slider/dropdown, Escape to close dropdown"

# Metrics
duration: 4min
completed: 2026-02-15
---

# Phase 1 Plan 04: Metal Hardware Controls Summary

**5 skeuomorphic metal hardware components (button, toggle, slider, checkbox, dropdown) with brushed metal gradients, theme-matched finishes (brass/chrome/gunmetal), and firm spring-physics animations**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-15T07:56:03Z
- **Completed:** 2026-02-15T08:00:05Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- metal.css foundation with brushed 45-degree multi-stop linear gradient, 3 shadow presets, radial knob gradient, and metal text styling
- MetalButton with primary/secondary/ghost variants, sm/md/lg sizes, spring hover lift and tap depress, disabled state
- MetalToggle with sliding metal knob on accent/clay track, spring animation stiffness 300, switch ARIA role
- MetalSlider with draggable metal knob on recessed rail, fill bar, keyboard arrow navigation, value display
- MetalCheckbox with metal-gradient border frame, animated scale-in checkmark via AnimatePresence, hidden native input
- MetalDropdown with metal-gradient trigger and clay-elevated panel, AnimatePresence open/close, keyboard navigation (arrows, Enter, Escape), click-outside close
- Temporary showcase section in App.tsx rendering all 5 components for visual verification

## Task Commits

Each task was committed atomically:

1. **Task 1: Create metal.css base styles for brushed metal effects** - `562e846` (feat)
2. **Task 2: Build MetalButton, MetalToggle, MetalSlider, MetalCheckbox, and MetalDropdown components** - `c06955d` (feat)

## Files Created/Modified
- `src/styles/metal.css` - Brushed metal gradient, 3 shadow presets, metal text, radial knob gradient
- `src/styles/app.css` - Added metal.css import after clay.css
- `src/components/ui/MetalButton.tsx` - Brushed metal button with variant/size system and spring animations
- `src/components/ui/MetalToggle.tsx` - Toggle switch with sliding metal knob and spring transition
- `src/components/ui/MetalSlider.tsx` - Horizontal slider with draggable metal knob and recessed rail
- `src/components/ui/MetalCheckbox.tsx` - Checkbox with metal-gradient border and animated checkmark
- `src/components/ui/MetalDropdown.tsx` - Metal trigger button with clay dropdown panel and keyboard navigation
- `src/App.tsx` - Added metal component showcase section with interactive state

## Decisions Made
- **HTMLMotionProps over ButtonHTMLAttributes:** React's `onDrag` type conflicts with Motion's drag API. Using `HTMLMotionProps<'button'>` resolves the type incompatibility while preserving all button semantics.
- **Two-material dropdown:** MetalDropdown uses metal-gradient for the trigger (interactive hardware) and clay-elevated for the panel (passive surface), demonstrating the material-matches-function design principle.
- **Higher spring stiffness for metal:** Metal components use stiffness 300-500 (vs clay's softer values) to convey the tactile feel of precision hardware rather than soft clay.
- **Custom drag slider over native range:** Using motion drag with constraints produces a consistent skeuomorphic metal knob appearance across browsers, with proper ARIA slider role for accessibility.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed MetalButton type conflict with HTMLMotionProps**
- **Found during:** Task 2 (MetalButton component)
- **Issue:** Extending `ButtonHTMLAttributes<HTMLButtonElement>` caused TypeScript error because React's `onDrag` event handler is incompatible with Motion's `onDrag` (different parameter types)
- **Fix:** Changed interface to extend `Omit<HTMLMotionProps<'button'>, 'children'>` instead of `ButtonHTMLAttributes`
- **Files modified:** `src/components/ui/MetalButton.tsx`
- **Verification:** TypeScript compilation passes, full production build succeeds
- **Committed in:** c06955d (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Type system fix necessary for correctness. No scope creep.

## Issues Encountered
None beyond the type conflict resolved above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 5 metal hardware controls ready for use in subsequent plans
- Two-material design language complete: clay surfaces (Plan 03) + metal controls (Plan 04)
- Theme-matched metal finishes auto-switch: brass (Cinema Gold), chrome (Ocean Blue), gunmetal (Neon Purple)
- Temporary showcase in App.tsx available for visual verification; will be replaced by real UI in later plans
- MetalDropdown pattern available for any future select/menu components
- RotaryDial (Plan 05) can reuse metal-knob radial gradient for the dial component

## Self-Check: PASSED

All 9 files verified present. Commits 562e846 and c06955d verified in git log. Production build succeeds with all metal components included in output bundle.

---
*Phase: 01-foundation-design-system*
*Completed: 2026-02-15*
