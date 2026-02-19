# Phase 7: 3D Experience - Context

**Gathered:** 2026-02-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Add 3D scenes to the app using Spline 3D (@splinetool/react-spline) — an abstract cinematic hero scene on the HomePage, 3D camera transitions between pages, and graceful degradation to animated 2D parallax on low-end devices. The existing claymorphism UI, movie poster backdrops, and Phase 5 animations remain untouched.

</domain>

<decisions>
## Implementation Decisions

### 3D Scene Design
- Abstract cinematic space — moody atmospheric scene with film equipment, spotlights, and movie posters emerging from the ambience
- Film equipment props: film reels, clapperboards, vintage camera, director's chair — classic filmmaking aesthetic
- Realistic materials for 3D props: metal film reels, wooden clapperboard, leather director's chair — photorealistic textures (contrasts against soft clay UI)
- Theme-adaptive lighting: warm amber/orange for warm-orange preset, rich golden for gold preset, bright clean white for clean-white preset
- Light/dark mode responsive: dark mode = moody noir cinematic lighting, light mode = bright studio lighting
- Movie posters in scene are a mix: some live trending data from TMDB, some static iconic film posters for consistent atmosphere

### 3D Scope Across App
- Hero scene on HomePage — primary 3D experience
- 3D camera movement transitions between pages — cinematic page navigation
- Existing movie poster backdrops on feature pages remain untouched

### Interaction Model
- Desktop: mouse parallax only — scene subtly shifts with cursor movement, atmospheric depth effect, no direct manipulation or click-to-select
- Mobile: gyroscope parallax — scene shifts based on device tilt/orientation (requires device motion permission)
- 3D scene is a mood-setter, not a navigation tool — posters in the scene are decorative, not interactive

### Degradation Strategy
- Fallback when device can't handle 3D: animated 2D parallax with layered CSS depth (still feels dimensional without WebGL)
- Page transition fallback: existing Framer Motion transitions from Phase 5 (no extra 2D transition work)
- 3D detection and degradation strategy: Claude's discretion
- 3D load timing (lazy, during splash, progressive): Claude's discretion

### Design Integration
- Existing full-bleed movie poster backdrops on feature pages stay unchanged — 3D integrates around them, not replacing them
- How 3D scene blends with clay UI (background layer vs contained vs full-bleed): Claude's discretion based on existing backdrop pattern
- Theme sync depth (lighting only vs full atmosphere shift): Claude's discretion

### Technology
- Spline 3D (@splinetool/react-spline) as the implementation tool — user explicitly requested Spline over raw React Three Fiber
- Research Spline performance optimization: polygon reduction, lazy loading, mobile considerations
- @splinetool/r3f-spline bridge available if React Three Fiber integration needed for advanced control

### Claude's Discretion
- 3D page transition camera style (dolly zoom, lateral track, or other)
- Detection strategy for WebGL capability and device tier
- 3D load timing (lazy after page ready, during splash, progressive enhancement)
- How 3D scene visually integrates with existing clay UI and poster backdrops
- Theme sync depth (lighting color only vs full atmosphere adaptation)
- Spline scene optimization approach (polygon budget, texture resolution, lazy loading strategy)

</decisions>

<specifics>
## Specific Ideas

- Scene should feel like an abstract cinematic studio space — not a literal movie theater, more like being inside the filmmaking process
- Film equipment props give it personality: a slowly rotating film reel, a clapperboard catching spotlight, vintage camera on a tripod
- Gyroscope on mobile is a premium immersive touch — worth the device motion permission prompt
- Posters should feel like they're floating in the atmospheric haze, not mounted on a wall
- The warm-orange/gold/white theme colors directly map to the 3D lighting palette

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 07-3d-experience*
*Context gathered: 2026-02-19*
