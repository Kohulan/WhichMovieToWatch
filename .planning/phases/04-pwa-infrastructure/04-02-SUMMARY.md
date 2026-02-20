---
phase: 04-pwa-infrastructure
plan: 02
subsystem: pwa
tags: [pwa, install-prompt, service-worker, offline, claymorphism, useRegisterSW]

# Dependency graph
requires:
  - phase: 04-pwa-infrastructure
    plan: 01
    provides: vite-plugin-pwa with registerType:'prompt', service worker lifecycle hooks

provides:
  - ReloadPrompt toast component for offline-ready and update-available SW states
  - InstallBanner component with Chromium native install and iOS step-by-step instructions
  - useInstallPrompt hook capturing beforeinstallprompt with 7-day dismissal cooldown
  - PWA components mounted in App.tsx outside splash guard for immediate SW registration

affects:
  - App.tsx (PWA components added to app root)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - useRegisterSW from virtual:pwa-register/react for SW lifecycle state
    - BeforeInstallPromptEvent interface extends Event for type-safe install prompt capture
    - AnimatePresence + motion.div for enter/exit animations (slide-up for banner, slide-right for toast)
    - wmtw-pwa-install-dismissed localStorage key for 7-day dismissal cooldown
    - Standalone mode check via matchMedia('(display-mode: standalone)') + navigator.standalone (iOS)
    - Auto-dismiss offlineReady after 5s via useEffect setTimeout

key-files:
  created:
    - src/hooks/useInstallPrompt.ts
    - src/components/pwa/InstallBanner.tsx
    - src/components/pwa/ReloadPrompt.tsx
  modified:
    - src/App.tsx

key-decisions:
  - "ReloadPrompt and InstallBanner mounted outside splash guard — SW registers immediately regardless of onboarding state"
  - "offlineReady auto-dismisses after 5s (non-critical info); needRefresh persists until user acts (requires explicit reload)"
  - "iOS detection uses userAgent regex (iPad|iPhone|iPod) + MSStream check — no additional library dependency"
  - "beforeinstallprompt listener calls e.preventDefault() to defer native prompt and store event for user-controlled install"

requirements-completed: [PWA-03, PWA-04]

# Metrics
duration: 2min
completed: 2026-02-18
---

# Phase 4 Plan 02: PWA User-Facing Components Summary

**ReloadPrompt toast using useRegisterSW for SW offline-ready/update-available states, InstallBanner with Chromium native install button and iOS Share > Add to Home Screen instructions, useInstallPrompt hook with 7-day dismissal cooldown**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-18T19:57:09Z
- **Completed:** 2026-02-18T19:59:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Created `useInstallPrompt` hook that captures the `beforeinstallprompt` event on Chromium (stores event, shows banner after 2s delay), detects iOS via userAgent, checks standalone mode to suppress banner on installed app, and enforces 7-day dismissal cooldown via `wmtw-pwa-install-dismissed` localStorage key
- Created `InstallBanner` component with two platform-specific variants: native Install button with Download icon on Chromium (calls `installEvent.prompt()`), and step-by-step Share > Add to Home Screen instructions with Share2 icon inline on iOS
- Created `ReloadPrompt` component using `useRegisterSW` from `virtual:pwa-register/react`: shows "App ready to work offline" Wifi toast (auto-dismisses in 5s), shows "New version available" RefreshCw toast with Update button calling `updateServiceWorker(true)`, sets up hourly SW update check via `setInterval`
- Both components use claymorphism styling: `bg-surface-clay/95 backdrop-blur-md border border-clay-border rounded-xl shadow-clay-md`
- AnimatePresence animations: InstallBanner slides up (y: 100 → 0), ReloadPrompt slides in from right (x: 100 → 0)
- Both mounted in `App.tsx` outside the `!showSplash` guard so the service worker registers immediately on first load

## Task Commits

Each task was committed atomically:

1. **Task 1: Create useInstallPrompt hook and InstallBanner component** - `842cee4` (feat)
2. **Task 2: Create ReloadPrompt component and mount PWA components in App.tsx** - `a9d1481` (feat)

## Files Created/Modified

- `src/hooks/useInstallPrompt.ts` - Install prompt hook with Chromium/iOS detection, 7-day cooldown, standalone check
- `src/components/pwa/InstallBanner.tsx` - Platform-aware install banner (native button vs iOS steps)
- `src/components/pwa/ReloadPrompt.tsx` - SW lifecycle toast for offline-ready and update-available states
- `src/App.tsx` - Added ReloadPrompt and InstallBanner imports and mounts outside splash guard

## Decisions Made

- Mounted both PWA components outside the splash screen guard — the service worker needs to register on first load, not after the splash completes (which could be several seconds later)
- `offlineReady` auto-dismisses after 5s since it's informational; `needRefresh` stays visible until the user explicitly clicks Update or dismisses, since it requires a user action
- iOS install detection uses `userAgent` regex — no additional library needed, and `navigator.userAgent` is stable across iOS Safari versions
- `e.preventDefault()` on `beforeinstallprompt` defers the native browser mini-infobar so we can show our own styled banner at the right time

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED

- `src/hooks/useInstallPrompt.ts` — exists and exports `useInstallPrompt`
- `src/components/pwa/InstallBanner.tsx` — exists, imports `useInstallPrompt`
- `src/components/pwa/ReloadPrompt.tsx` — exists, imports `useRegisterSW` from `virtual:pwa-register/react`
- `src/App.tsx` — contains `ReloadPrompt` and `InstallBanner` mounts
- `npx tsc --noEmit` — passed (0 errors)
- `npm run build` — succeeded, dist/sw.js generated, 28 precached entries
- Commit `842cee4` — Task 1
- Commit `a9d1481` — Task 2

---
*Phase: 04-pwa-infrastructure*
*Completed: 2026-02-18*
