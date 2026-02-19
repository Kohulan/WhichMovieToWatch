# Skeuomorphism Design References

Collected 2026-02-17 from Dribbble. Apply during Phase 5 (Animation Layer) and Phase 8 (Polish).

## Reference Images

### 1. `skeu-toggle-dark.png`
**Source:** https://cdn.dribbble.com/userupload/42905172/file/original-7297a316279080dafa011359ca300447.mp4

Hyper-realistic 3D toggle switch on dark background.

**Key techniques to adopt:**
- Metallic sphere knob with specular highlight and rim light
- Deep inset track with sharp inner shadow
- Dramatic directional lighting (top-right light source)
- Subtle glow/bloom around the knob on interaction
- High contrast between knob surface and recessed track

**Apply to:** MetalToggle, MetalCheckbox

### 2. `skeu-settings-dark.png`
**Source:** https://cdn.dribbble.com/userupload/5872861/file/original-93a57cf4420105a98ea07a72649c399e.png

Dark skeuomorphic settings UI with large rotary dial and segmented controls.

**Key techniques to adopt:**
- Large brushed-metal rotary knob with orange glowing ring accent
- Inset numeric displays with monospace typography
- Segmented control bar (80 | 60 | 30) with active state highlight
- Orange accent color for active/selected states on dark surfaces
- Two-panel layout showing active vs resting states side by side

**Apply to:** RotaryDial (theme selector), MetalSlider value display, filter panel controls

### 3. `skeu-panel-light-kosma.jpg`
**Source:** https://cdn.dribbble.com/userupload/17893813/file/original-cc466bfabb586fab62312d39cb1f42b3.jpg

Light-mode hardware panel ("SoulExtender" by Kosma). White/cream aesthetic.

**Key techniques to adopt:**
- Concentric ripple/wave embossing on panel surface (radiating from central knob)
- White porcelain/ceramic rotary knobs with position indicator dots
- Dark rubber push buttons (contrasting material from panel)
- Perforated dot-grid speaker grilles (decorative texture element)
- Cyan LED indicator strips on panel edges
- Deep soft shadow beneath entire panel (floating effect)
- Rounded panel corners with subtle edge bevel

**Apply to:** AppShell panel surfaces (light mode), ClayCard surface texture, push-button variants for action buttons

## Cross-cutting Themes

1. **Dramatic lighting** — All three use strong directional light with specular highlights and rim effects. Current metal components use gradient-only approach; add CSS radial-gradient highlights and box-shadow glow on hover/active.

2. **Deeper inset tracks** — Toggle tracks and slider grooves should feel physically recessed with stronger `inset` box-shadows (current implementation is subtle).

3. **Material contrast** — Multiple materials in one component: metallic knobs on matte surfaces, rubber buttons on ceramic panels. Strengthen the existing two-material pattern.

4. **Accent glow** — Colored glow rings (orange in dark mode, cyan in light mode) around active controls. Use theme accent color with `box-shadow` glow and CSS `filter: drop-shadow()`.

5. **Surface texture** — Concentric ripples (light mode panel), brushed metal grain (dark mode knobs). Enhance existing SVG feTurbulence textures or add CSS radial-gradient patterns.
