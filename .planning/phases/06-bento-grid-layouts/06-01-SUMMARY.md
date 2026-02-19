---
phase: 06-bento-grid-layouts
plan: 01
subsystem: bento-grid
tags: [css-grid, framer-motion, glassmorphism, claymorphism, responsive, layout-animation]
dependency_graph:
  requires:
    - src/styles/clay.css (clay-shadow-md, bg-clay-surface classes)
    - motion/react (layout prop, whileHover, AnimatePresence)
  provides:
    - src/components/bento/BentoGrid.tsx (responsive 12-col CSS Grid container)
    - src/components/bento/BentoCell.tsx (glass/clay cell with hover/tap effects)
    - src/components/bento/index.ts (barrel exports)
  affects:
    - All future plans in phase 06 (home page, page bento sections)
tech_stack:
  added: []
  patterns:
    - Static Tailwind class lookup objects for responsive col/row span
    - Inline style borderRadius/boxShadow on layout-animated elements (prevents FLIP distortion)
    - Framer Motion layout prop for FLIP-based grid reflow animation
    - Mobile tap-to-expand with auto-collapse timeout pattern
key_files:
  created:
    - src/components/bento/BentoGrid.tsx
    - src/components/bento/BentoCell.tsx
    - src/components/bento/index.ts
  modified: []
decisions:
  - "Static Tailwind lookup objects for all col-span/row-span values — Tailwind v4 static analysis cannot detect template literal class names"
  - "Inline style borderRadius: 1rem on layout-animated motion.div — prevents FLIP scaleX/scaleY transform distortion"
  - "Mobile tap-to-expand: first tap shows overlay, second tap calls onClick, auto-collapses after 4s"
  - "lg:auto-rows-[minmax(120px,auto)] applied only at desktop breakpoint — mobile/tablet rows auto-size to content"
  - "grid-flow-dense on BentoGrid — prevents gaps when large cells push smaller ones to next row"
metrics:
  duration: 2 min
  completed: 2026-02-19
  tasks_completed: 2
  files_created: 3
  files_modified: 0
---

# Phase 06 Plan 01: BentoGrid and BentoCell Foundation Summary

**One-liner:** Responsive 12-column CSS Grid container (BentoGrid) and material-variant cell component (BentoCell) with Framer Motion layout animation, glass/clay materials, hover scale+glow effects, and mobile tap-to-expand.

## What Was Built

### BentoGrid (`src/components/bento/BentoGrid.tsx`)

Responsive CSS Grid container with three breakpoints:
- **Mobile (default):** `grid-cols-1` — single column stack
- **Tablet (md:):** `grid-cols-2` — 2-column grid
- **Desktop (lg:):** Configurable `grid-cols-4 / grid-cols-6 / grid-cols-12` via `columns` prop (default: 12)

Key behaviors:
- Framer Motion `layout` prop with spring physics `{ stiffness: 200, damping: 25 }` for animated FLIP reflow when viewport crosses breakpoints
- `lg:auto-rows-[minmax(120px,auto)]` — desktop minimum 120px row height with auto-expand; mobile/tablet rows auto-size to avoid height collapse pitfall
- `grid-flow-dense` — prevents gaps from large cells pushing smaller cells to next row
- `gap-4 lg:gap-5` — 16px mobile gap, 20px desktop gap
- Static Tailwind class lookup object `{ 4: 'lg:grid-cols-4', 6: 'lg:grid-cols-6', 12: 'lg:grid-cols-12' }` — no dynamic template literals

### BentoCell (`src/components/bento/BentoCell.tsx`)

Individual animated cell wrapper with:

**Material variants:**
- `glass`: `bg-white/[0.08] backdrop-blur-xl border border-white/10 shadow-lg shadow-black/10` — glassmorphism for hero/large cells
- `clay`: `bg-clay-surface border border-white/10 clay-shadow-md` — claymorphism for supporting cells

**Column/row spanning:**
- All classes from static lookup objects: `lgColSpanClasses[1-12]`, `mdColSpanClasses[1-2]`, `lgRowSpanClasses[1-3]`
- Inline `style={{ borderRadius: '1rem' }}` prevents FLIP animation distortion when layout animates via CSS transforms

**Hover treatment (full, per locked user decision):**
- `whileHover`: `scale: 1.03` + `boxShadow: '0 20px 40px rgba(0,0,0,0.15), 0 0 0 1px oklch(var(--accent))'`
- Transition: spring `{ stiffness: 300, damping: 20 }`
- Overlay div: `opacity-0 group-hover:opacity-100 transition-opacity duration-200` via CSS `group` class

**Mobile tap-to-expand:**
- `useState(false)` for `expanded` state
- First tap on mobile (`window.innerWidth < 768`): sets `expanded(true)`, returns (shows overlay)
- Second tap or desktop click: calls `onClick` prop
- `useEffect` auto-collapse: 4s `setTimeout` resets `expanded` to false (prevents stale state)
- `AnimatePresence` with fade-in/slide-up `motion.div` for expanded overlay reveal

**Accessibility:**
- `role="button"` + `tabIndex={0}` when `onClick` provided
- `onKeyDown` handler for Enter/Space keys
- `aria-expanded` on interactive cells with overlay
- `aria-hidden` on overlay div when not expanded

**Other:**
- `hideOnMobile`: adds `hidden md:block` for decorative cells
- `layout` prop on motion.div for FLIP-based size/position animation

### Barrel Exports (`src/components/bento/index.ts`)

```typescript
export { BentoGrid } from './BentoGrid';
export { BentoCell } from './BentoCell';
export type { BentoCellProps, CellMaterial } from './BentoCell';
```

## Commits

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| Task 1 | BentoGrid responsive container | 64fc6b0 | src/components/bento/BentoGrid.tsx |
| Task 2 | BentoCell + index.ts barrel exports | b5aaf50 | src/components/bento/BentoCell.tsx, src/components/bento/index.ts |

## Deviations from Plan

None — plan executed exactly as written.

All anti-patterns from research were avoided:
- No dynamic Tailwind class names in executable code (comment on line 18 illustrates the anti-pattern only)
- No `auto-rows` on mobile/tablet
- `borderRadius` as inline style (not `rounded-*` className)
- `layout` prop on direct cell wrapper only (not deeply nested children)

## Self-Check

### Files Created
- [x] `src/components/bento/BentoGrid.tsx` — FOUND
- [x] `src/components/bento/BentoCell.tsx` — FOUND
- [x] `src/components/bento/index.ts` — FOUND

### Commits
- [x] `64fc6b0` — feat(06-01): create BentoGrid responsive CSS Grid container — FOUND
- [x] `b5aaf50` — feat(06-01): create BentoCell with materials, hover effects, and tap-to-expand — FOUND

### TypeScript
- [x] `npx tsc --noEmit` passes with zero errors

## Self-Check: PASSED
