# Phase 1: Foundation & Design System - Context

**Gathered:** 2026-02-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish React 19 + Vite 6 + TypeScript 5.7 foundation with a claymorphism design system featuring light/dark modes and 3 color scheme presets. Deliver all base UI components with full clay + skeuomorphic treatment. Core features, API integration, PWA, and animation layer are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Claymorphism visual style
- Bold, full clay toy feel — pronounced puffy 3D look, not subtle
- Visible plasticine/clay texture overlay on surfaces (not smooth/glossy)
- Tinted clay — surfaces take on the active theme color as a tint (gold-tinted clay for Cinema Gold, blue-tinted for Ocean Blue, etc.)
- Dark mode uses dark-colored clay material (deep charcoal/navy), not dimmed lighting — rich and saturated
- Layered clay approach: subtle flat clay base for background, elevated clay components (cards, modals) on top for depth hierarchy
- Interaction: both shape deformation AND lighting shift on hover/press (clay depresses on press, lifts on hover, shadow angle changes)
- Framer Motion spring animations for all clay interaction responses (within Phase 1 scope for component-level transitions; full page animations in Phase 5)

### Skeuomorphic hardware controls
- All interactive controls (buttons, toggles, sliders, checkboxes, dropdowns) styled as premium hardware — brushed metal, precision feel
- Contrasting metal finish against clay surfaces — buttons clearly look like a different material for visual hierarchy
- Text inputs and text fields are indented clay (pressed into surface) — material matches function: clay for passive elements, hardware for interactive ones
- Design rule: Clay = surfaces, containers, text inputs (things you look at). Hardware = buttons, toggles, sliders, checkboxes, dropdowns (things you interact with)

### Theme switching experience
- Theme controls always visible in top nav bar — toggle + preset dial side by side
- Dark/light toggle is a skeuomorphic hardware toggle switch matching the premium aesthetic
- Color preset switcher is a skeuomorphic rotary dial/knob — premium hardware-style selector that clicks between 3 positions
- Dial has click animation + subtle "tick" sound when landing on a preset — real rotary switch feel
- Theme transition uses "clay reshape" animation — elements briefly flatten then re-inflate with new colors (Framer Motion springs)
- First visit: respects system dark/light preference, defaults to Cinema Gold preset
- Theme preferences stored per-device in localStorage (no cross-device sync)

### Color presets — dramatically different worlds
- **Cinema Gold:** Modern cinema premium — muted gold, charcoal, subtle brass. Luxury cinema lounge feel, refined not flashy
- **Ocean Blue:** Deep ocean — navy, teal, seafoam accents. Deep and immersive, calm but powerful
- **Neon Purple:** Cyberpunk/synthwave — electric purple, hot pink, neon cyan accents. Blade Runner vibes, dramatic, high contrast, futuristic
- Each preset dramatically transforms the entire experience — like entering a different room, not just changing an accent color
- Clay surfaces tinted per preset (warm gold clay, deep blue clay, electric purple clay)

### Component library — full clay/skeuo treatment
- Full set in Phase 1: cards, buttons, toggles, modals, inputs, dropdowns, sliders — complete design system, not partial
- Medium sizing — balanced density with standard padding, enough room for clay effects without feeling sparse
- Modals are floating clay panels with backdrop blur/dim — still clay-styled but clearly a separate hovering layer
- All base components must work at 375px, 768px, 1024px, 1440px breakpoints

### Claude's Discretion
- Metal finish per color preset (matched metals like brass/chrome/gunmetal vs universal finish) — pick what creates best cohesion
- Exact clay texture implementation approach (CSS noise, SVG filters, etc.)
- Spring animation parameters for clay reshape transitions
- Loading skeleton design within clay aesthetic
- Error state visual treatment
- Exact spacing scale and typography choices
- Sound file format and implementation for dial tick

</decisions>

<specifics>
## Specific Ideas

- Premium hardware buttons/toggles inspired by hi-fi equipment and car dashboard switches — brushed metal, precision tactile feel
- Clay reshape transition: elements flatten → re-inflate with new theme colors (like clay being remolded). This is the signature transition.
- Rotary dial for color presets with audible tick — centerpiece interaction of the theme system
- "Material matches function" rule: passive surfaces = clay, interactive controls = hardware. Two distinct material languages.
- Dark mode should feel like dark-colored clay material, not the same clay under dim lights — rich saturated dark tones
- Research references: modern skeuomorphic toggle switches, claymorphism CSS techniques, Framer Motion spring animations for physical feel

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation-design-system*
*Context gathered: 2026-02-15*
