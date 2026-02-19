# Phase 8: Polish & Optimization - Context

**Gathered:** 2026-02-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Finalize the app with WCAG 2.1 AA accessibility compliance, performance optimization (Lighthouse 90+, bundle <500KB gzipped), social sharing (Instagram story cards, OG/Twitter Card meta tags), Content Security Policy, Simple Analytics integration, privacy policy, and deployment automation. No new features — polish what exists.

</domain>

<decisions>
## Implementation Decisions

### Story Cards & Sharing
- Instagram story card (1080x1920): **Movie poster dominant** — large poster image with title, rating, and app branding at bottom
- Story card branding: **Theme-aware** — gradient and accent colors match user's current theme preset (Cinema Gold/Ocean Blue/Neon Purple)
- OG/Twitter Card preview: **Generated branded card** — landscape format with poster + ratings + app logo (not raw poster)
- Share button: **Floating share button** — fixed position, opens share sheet
- Share options: **Both with fallback** — Native Web Share API on mobile (if supported), custom share menu on desktop (copy link, Instagram story, Twitter/X, WhatsApp)
- Story card download: **Match existing vanilla JS implementation** — reference `scripts/story-card.js` for the current canvas-based approach and replicate in React

### Privacy & Analytics
- Analytics level: **Page views only** — minimal tracking with Simple Analytics, no event tracking
- Privacy policy: **Dedicated route** at `/privacy` — full page, not a modal
- Privacy link: **Update existing footer link** to point to the new `/privacy` route
- Consent model: Claude's discretion (Simple Analytics is cookieless and GDPR-compliant by design)

### Deployment Strategy
- Hosting platform: Claude's discretion — evaluate GitHub Pages (meta-tag CSP, HashRouter) vs Cloudflare Pages (HTTP header CSP, clean URLs) based on security/effort trade-off
- CI/CD pipeline: Claude's discretion — consider adding Lighthouse CI if practical
- If migrating: Update deploy workflow, switch HashRouter to BrowserRouter, configure SPA routing

### Accessibility
- Screen reader target: Claude's discretion — pick the most practical testing target
- Keyboard navigation: Claude's discretion — evaluate whether custom shortcuts (N/L/W) add value
- Color contrast: Claude's discretion — AA minimum (4.5:1) as baseline, target higher where practical
- 3D scene accessibility: Claude's discretion — 3D is decorative enhancement, focus on core UI
- Skip navigation link: Required (A11Y-07 from requirements)

### Claude's Discretion
- Dynamic meta tags approach (client-side SPA limitations)
- Share button visibility scope (all pages vs movie view only)
- Hosting platform final decision
- CI/CD pipeline additions
- All accessibility implementation specifics listed above

</decisions>

<specifics>
## Specific Ideas

- Story card download should match existing vanilla JS implementation in `scripts/story-card.js` — canvas-based generation, similar download workflow
- Privacy policy link should update the existing footer link (already in the app)
- Design references from roadmap: concentric ripple/wave surface texture on light-mode panels, porcelain/ceramic material feel for light-mode rotary knobs, multi-material contrast refinement, perforated dot-grid textures, LED indicator strips/cyan accents on panel edges

</specifics>

<deferred>
## Deferred Ideas

- Home page "Discover your next movie" hero should show what streaming movies are trending now — this is a feature change to homepage content, not polish/optimization scope

</deferred>

---

*Phase: 08-polish-optimization*
*Context gathered: 2026-02-19*
