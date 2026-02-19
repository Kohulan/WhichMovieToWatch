import { useState } from 'react';
import {
  ClayCard,
  ClayModal,
  ClayInput,
  ClayBadge,
  ClaySkeletonCard,
  MetalButton,
  MetalToggle,
  MetalSlider,
  MetalCheckbox,
  MetalDropdown,
  ThemeToggle,
  RotaryDial,
} from '../components/ui';

const streamingProviders = [
  { value: 'netflix', label: 'Netflix' },
  { value: 'disney', label: 'Disney+' },
  { value: 'prime', label: 'Prime Video' },
  { value: 'hbo', label: 'HBO Max' },
  { value: 'apple', label: 'Apple TV+' },
];

/** CSS variable names for the current theme's color palette */
const colorSwatches = [
  { variable: '--clay-base', label: 'clay-base' },
  { variable: '--clay-surface', label: 'clay-surface' },
  { variable: '--clay-elevated', label: 'clay-elevated' },
  { variable: '--clay-shadow', label: 'clay-shadow' },
  { variable: '--clay-highlight', label: 'clay-highlight' },
  { variable: '--metal-base', label: 'metal-base' },
  { variable: '--metal-shine', label: 'metal-shine' },
  { variable: '--metal-dark', label: 'metal-dark' },
  { variable: '--accent', label: 'accent' },
];

/**
 * Showcase — Comprehensive component gallery demonstrating every
 * design system component at all responsive breakpoints.
 *
 * Responsive grid:
 *   - 375px (mobile): single column
 *   - 768px (tablet): 2-column grid
 *   - 1024px (desktop): 3-column grid
 *   - 1440px (large): 3-column grid with max-width container, centered
 */
export function Showcase() {
  // Local state for interactive demos
  const [toggleOn, setToggleOn] = useState(false);
  const [toggleOff, setToggleOff] = useState(true);
  const [sliderValue, setSliderValue] = useState(65);
  const [checkboxChecked, setCheckboxChecked] = useState(true);
  const [checkboxUnchecked, setCheckboxUnchecked] = useState(false);
  const [dropdownValue, setDropdownValue] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInput, setModalInput] = useState('');

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
      {/* Page header */}
      <header className="mb-8 md:mb-12 text-center">
        <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl text-clay-text mb-3">
          Design System Showcase
        </h1>
        <p className="font-body text-base md:text-lg text-clay-text-muted max-w-2xl mx-auto">
          Every component in the WhichMovieToWatch design system.
          Toggle the theme switch in the navbar to see dark and light variants.
        </p>
      </header>

      {/* Responsive grid for component sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">

        {/* ============================================================
            SECTION A: Clay Surfaces
            ============================================================ */}

        {/* Clay Cards */}
        <section className="md:col-span-2 lg:col-span-3">
          <SectionTitle>Clay Surfaces</SectionTitle>
        </section>

        <div className="flex flex-col gap-4">
          <ClayCard>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-heading text-lg text-clay-text">ClayCard</h3>
                <ClayBadge variant="accent" size="sm">Elevated</ClayBadge>
              </div>
              <p className="font-body text-sm text-clay-text-muted">
                Hover to lift, press to depress. Notice the plasticine texture
                and bold 3D shadows that give this card its puffy clay feel.
              </p>
            </div>
          </ClayCard>

          <ClayCard elevated={false}>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-heading text-lg text-clay-text">ClayCard</h3>
                <ClayBadge variant="muted" size="sm">Flat</ClayBadge>
              </div>
              <p className="font-body text-sm text-clay-text-muted">
                Non-elevated variant with subtle shadow. Good for secondary content areas.
              </p>
            </div>
          </ClayCard>
        </div>

        {/* Clay Badges */}
        <div className="flex flex-col gap-4">
          <ClayCard>
            <div className="p-6">
              <h3 className="font-heading text-lg text-clay-text mb-4">ClayBadge</h3>
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                  <ClayBadge>Default</ClayBadge>
                  <ClayBadge variant="accent">Accent</ClayBadge>
                  <ClayBadge variant="muted">Muted</ClayBadge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <ClayBadge size="sm">Small</ClayBadge>
                  <ClayBadge variant="accent" size="sm">SM Accent</ClayBadge>
                  <ClayBadge variant="muted" size="sm">SM Muted</ClayBadge>
                </div>
              </div>
            </div>
          </ClayCard>
        </div>

        {/* Clay Input */}
        <div className="flex flex-col gap-4">
          <ClayCard>
            <div className="p-6 flex flex-col gap-4">
              <h3 className="font-heading text-lg text-clay-text mb-1">ClayInput</h3>
              <ClayInput label="Movie Title" placeholder="Search for a movie..." />
              <ClayInput placeholder="Without label" />
              <ClayInput
                label="Release Year"
                placeholder="2024"
                error="Please enter a valid year"
              />
            </div>
          </ClayCard>
        </div>

        {/* Skeleton Cards */}
        <div className="md:col-span-2 lg:col-span-3">
          <h4 className="font-heading text-base text-clay-text-muted mb-3">ClaySkeletonCard</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
            <ClaySkeletonCard />
            <ClaySkeletonCard hasImage={false} lines={2} />
          </div>
        </div>

        {/* ============================================================
            SECTION B: Hardware Controls
            ============================================================ */}

        <section className="md:col-span-2 lg:col-span-3 mt-4">
          <SectionTitle>Hardware Controls</SectionTitle>
        </section>

        {/* MetalButton — all variants and sizes */}
        <div className="flex flex-col gap-4">
          <ClayCard>
            <div className="p-6 flex flex-col gap-4">
              <h3 className="font-heading text-lg text-clay-text">MetalButton</h3>
              <div className="flex flex-col gap-3">
                <p className="font-body text-xs text-clay-text-muted uppercase tracking-wider">Primary</p>
                <div className="flex flex-wrap gap-2 items-center">
                  <MetalButton variant="primary" size="sm">Small</MetalButton>
                  <MetalButton variant="primary" size="md">Medium</MetalButton>
                  <MetalButton variant="primary" size="lg">Large</MetalButton>
                </div>
                <p className="font-body text-xs text-clay-text-muted uppercase tracking-wider mt-2">Secondary / Ghost / Disabled</p>
                <div className="flex flex-wrap gap-2 items-center">
                  <MetalButton variant="secondary">Secondary</MetalButton>
                  <MetalButton variant="ghost">Ghost</MetalButton>
                  <MetalButton variant="primary" disabled>Disabled</MetalButton>
                </div>
              </div>
            </div>
          </ClayCard>
        </div>

        {/* MetalToggle */}
        <div className="flex flex-col gap-4">
          <ClayCard>
            <div className="p-6 flex flex-col gap-4">
              <h3 className="font-heading text-lg text-clay-text">MetalToggle</h3>
              <MetalToggle
                checked={toggleOn}
                onChange={setToggleOn}
                label={toggleOn ? 'Enabled' : 'Disabled'}
              />
              <MetalToggle
                checked={toggleOff}
                onChange={setToggleOff}
                label={toggleOff ? 'Notifications On' : 'Notifications Off'}
              />
            </div>
          </ClayCard>
        </div>

        {/* MetalSlider */}
        <div className="flex flex-col gap-4">
          <ClayCard>
            <div className="p-6 flex flex-col gap-4">
              <h3 className="font-heading text-lg text-clay-text">MetalSlider</h3>
              <MetalSlider
                value={sliderValue}
                onChange={setSliderValue}
                min={0}
                max={100}
                step={1}
                label="Rating Threshold"
              />
            </div>
          </ClayCard>
        </div>

        {/* MetalCheckbox */}
        <div className="flex flex-col gap-4">
          <ClayCard>
            <div className="p-6 flex flex-col gap-4">
              <h3 className="font-heading text-lg text-clay-text">MetalCheckbox</h3>
              <MetalCheckbox
                checked={checkboxChecked}
                onChange={setCheckboxChecked}
                label="Include adult content"
              />
              <MetalCheckbox
                checked={checkboxUnchecked}
                onChange={setCheckboxUnchecked}
                label="HD only"
              />
            </div>
          </ClayCard>
        </div>

        {/* MetalDropdown */}
        <div className="flex flex-col gap-4">
          <ClayCard>
            <div className="p-6 flex flex-col gap-4">
              <h3 className="font-heading text-lg text-clay-text">MetalDropdown</h3>
              <MetalDropdown
                options={streamingProviders}
                value={dropdownValue}
                onChange={setDropdownValue}
                placeholder="Choose provider..."
                label="Streaming Provider"
              />
            </div>
          </ClayCard>
        </div>

        {/* ============================================================
            SECTION C: Theme Controls
            ============================================================ */}

        <section className="md:col-span-2 lg:col-span-3 mt-4">
          <SectionTitle>Theme Controls</SectionTitle>
        </section>

        <div className="md:col-span-2 lg:col-span-3">
          <ClayCard>
            <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center md:items-start">
              <div className="flex flex-col items-center gap-3 text-center">
                <h3 className="font-heading text-lg text-clay-text">RotaryDial</h3>
                <RotaryDial />
                <p className="font-body text-xs text-clay-text-muted max-w-[200px]">
                  Switch between Warm Orange, Gold, and White themes.
                </p>
              </div>
              <div className="hidden md:block w-px h-32 bg-clay-text-muted/20" />
              <div className="md:hidden w-32 h-px bg-clay-text-muted/20" />
              <div className="flex flex-col items-center gap-3 text-center">
                <h3 className="font-heading text-lg text-clay-text">ThemeToggle</h3>
                <ThemeToggle />
                <p className="font-body text-xs text-clay-text-muted max-w-[200px]">
                  Toggle between dark and light modes.
                </p>
              </div>
            </div>
          </ClayCard>
        </div>

        {/* ============================================================
            SECTION D: Modal Demo
            ============================================================ */}

        <section className="md:col-span-2 lg:col-span-3 mt-4">
          <SectionTitle>Modal Demo</SectionTitle>
        </section>

        <div className="md:col-span-2 lg:col-span-3">
          <ClayCard>
            <div className="p-6 flex flex-col items-center gap-4">
              <p className="font-body text-sm text-clay-text-muted text-center">
                Click the button to open a ClayModal with sample content, including
                a card, input, and buttons.
              </p>
              <MetalButton
                variant="primary"
                size="lg"
                onClick={() => setModalOpen(true)}
              >
                Open Modal
              </MetalButton>
            </div>
          </ClayCard>
        </div>

        {/* ============================================================
            SECTION E: Typography
            ============================================================ */}

        <section className="md:col-span-2 lg:col-span-3 mt-4">
          <SectionTitle>Typography</SectionTitle>
        </section>

        <div className="md:col-span-2 lg:col-span-3">
          <ClayCard>
            <div className="p-6 md:p-8 flex flex-col gap-4">
              <h1 className="font-heading text-[clamp(2rem,5vw,3.5rem)] text-clay-text leading-tight">
                Which Movie To Watch
              </h1>
              <h2 className="font-heading text-[clamp(1.5rem,3.5vw,2.5rem)] text-clay-text leading-tight">
                Discover Your Next Movie
              </h2>
              <h3 className="font-heading text-[clamp(1.25rem,2.5vw,2rem)] text-clay-text leading-tight">
                Trending Now
              </h3>

              <hr className="border-clay-text-muted/20 my-2" />

              <p className="font-body font-normal text-base text-clay-text leading-relaxed">
                <span className="text-clay-text-muted">(400)</span>{' '}
                The art of cinema transports us to worlds beyond imagination. Every frame tells a story,
                every cut reveals a new perspective, and every performance captures the essence of what it
                means to be human.
              </p>
              <p className="font-body font-medium text-base text-clay-text leading-relaxed">
                <span className="text-clay-text-muted">(500)</span>{' '}
                From the golden age of Hollywood to modern streaming, movies continue to push the boundaries
                of storytelling and visual expression.
              </p>
              <p className="font-body font-semibold text-base text-clay-text leading-relaxed">
                <span className="text-clay-text-muted">(600)</span>{' '}
                Discover your next favorite film with our curated recommendations, powered by intelligent
                algorithms and a passion for great cinema.
              </p>
              <p className="font-body font-bold text-base text-clay-text leading-relaxed">
                <span className="text-clay-text-muted">(700)</span>{' '}
                WhichMovieToWatch helps you find the perfect movie for any mood, any occasion, any moment.
              </p>
            </div>
          </ClayCard>
        </div>

        {/* ============================================================
            SECTION F: Color Palette
            ============================================================ */}

        <section className="md:col-span-2 lg:col-span-3 mt-4">
          <SectionTitle>Color Palette</SectionTitle>
        </section>

        <div className="md:col-span-2 lg:col-span-3">
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3">
            {colorSwatches.map(({ variable, label }) => (
              <div
                key={variable}
                className="bg-clay-surface rounded-clay clay-shadow-sm overflow-hidden transition-colors duration-300"
              >
                <div
                  className="w-full h-16 sm:h-20"
                  style={{ backgroundColor: `var(${variable})` }}
                />
                <p className="font-body text-[10px] sm:text-xs text-clay-text-muted text-center py-2 px-1 truncate">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Spacer at bottom */}
      <div className="h-12" />

      {/* ============================================================
          ClayModal (rendered at root level for portal behavior)
          ============================================================ */}
      <ClayModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Movie Details"
      >
        <div className="flex flex-col gap-4">
          <p className="font-body text-clay-text-muted">
            This is a ClayModal with sample content. It features spring animation entry,
            backdrop blur, and closes on Escape or backdrop click.
          </p>
          <ClayInput
            label="Search"
            placeholder="Type a movie name..."
            value={modalInput}
            onChange={(e) => setModalInput(e.target.value)}
          />
          <div className="flex gap-3 justify-end">
            <MetalButton
              variant="ghost"
              size="sm"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </MetalButton>
            <MetalButton
              variant="primary"
              size="sm"
              onClick={() => setModalOpen(false)}
            >
              Confirm
            </MetalButton>
          </div>
        </div>
      </ClayModal>
    </div>
  );
}

/** Reusable section title component */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-heading text-xl md:text-2xl text-clay-text pb-2 border-b border-clay-text-muted/20">
      {children}
    </h2>
  );
}
