import { useState } from 'react';
import { Film, Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from './hooks/useTheme';
import { ClayCard } from './components/ui/ClayCard';
import { ClayModal } from './components/ui/ClayModal';
import { ClayInput } from './components/ui/ClayInput';
import { ClayBadge } from './components/ui/ClayBadge';
import { ClaySkeletonCard } from './components/ui/ClaySkeletonCard';
import { MetalButton } from './components/ui/MetalButton';
import { MetalToggle } from './components/ui/MetalToggle';
import { MetalSlider } from './components/ui/MetalSlider';
import { MetalCheckbox } from './components/ui/MetalCheckbox';
import { MetalDropdown } from './components/ui/MetalDropdown';

const dropdownOptions = [
  { value: 'action', label: 'Action' },
  { value: 'comedy', label: 'Comedy' },
  { value: 'drama', label: 'Drama' },
  { value: 'horror', label: 'Horror' },
  { value: 'sci-fi', label: 'Sci-Fi' },
];

function App() {
  const { mode, preset, toggleMode, setPreset } = useTheme();
  const [toggleOn, setToggleOn] = useState(false);
  const [sliderValue, setSliderValue] = useState(50);
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [dropdownValue, setDropdownValue] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-clay-base text-clay-text p-8 flex flex-col items-center justify-center gap-6 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="flex flex-col items-center gap-6"
      >
        <Film className="w-16 h-16 text-accent" strokeWidth={1.5} />
        <h1 className="font-heading text-4xl text-center">
          Which Movie To Watch
        </h1>
        <p className="font-body text-lg text-clay-text-muted text-center">
          Theme System Active
        </p>

        {/* Theme test controls -- temporary, replaced by RotaryDial in Plan 05 */}
        <div className="bg-clay-surface rounded-clay p-6 shadow-lg max-w-md w-full flex flex-col gap-4">
          <p className="font-body text-xs text-clay-text-muted text-center uppercase tracking-wider">
            Theme Controls (dev)
          </p>

          <div className="flex justify-center">
            <button
              onClick={toggleMode}
              className="flex items-center gap-2 px-4 py-2 rounded-clay bg-clay-elevated text-clay-text font-body text-sm hover:bg-accent hover:text-clay-base transition-colors"
            >
              {mode === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
              {mode === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
            </button>
          </div>

          <div className="flex justify-center gap-2 flex-wrap">
            <button
              onClick={() => setPreset('cinema-gold')}
              className={`px-3 py-1.5 rounded-clay font-body text-xs transition-colors ${
                preset === 'cinema-gold'
                  ? 'bg-accent text-clay-base'
                  : 'bg-clay-elevated text-clay-text hover:bg-clay-highlight'
              }`}
            >
              Cinema Gold
            </button>
            <button
              onClick={() => setPreset('ocean-blue')}
              className={`px-3 py-1.5 rounded-clay font-body text-xs transition-colors ${
                preset === 'ocean-blue'
                  ? 'bg-accent text-clay-base'
                  : 'bg-clay-elevated text-clay-text hover:bg-clay-highlight'
              }`}
            >
              Ocean Blue
            </button>
            <button
              onClick={() => setPreset('neon-purple')}
              className={`px-3 py-1.5 rounded-clay font-body text-xs transition-colors ${
                preset === 'neon-purple'
                  ? 'bg-accent text-clay-base'
                  : 'bg-clay-elevated text-clay-text hover:bg-clay-highlight'
              }`}
            >
              Neon Purple
            </button>
          </div>

          <p className="font-body text-xs text-clay-text-muted text-center">
            {preset} / {mode}
          </p>
        </div>

        <div className="bg-clay-surface rounded-clay p-6 shadow-lg max-w-md w-full text-center">
          <p className="font-body text-sm text-clay-text-muted">
            React 19 + Vite 6 + TypeScript + Tailwind CSS v4
          </p>
        </div>

        {/* Clay surface components showcase -- temporary, for verification */}
        <div className="max-w-2xl w-full flex flex-col gap-6">
          <p className="font-body text-xs text-clay-text-muted text-center uppercase tracking-wider">
            Clay Components (dev showcase)
          </p>

          {/* ClayCard */}
          <ClayCard>
            <div className="p-6">
              <h3 className="font-heading text-lg mb-2">ClayCard</h3>
              <p className="font-body text-sm text-clay-text-muted">
                Hover to lift, press to depress. Notice the plasticine texture
                and bold 3D shadows.
              </p>
            </div>
          </ClayCard>

          <ClayCard elevated={false}>
            <div className="p-6">
              <h3 className="font-heading text-lg mb-2">ClayCard (flat)</h3>
              <p className="font-body text-sm text-clay-text-muted">
                Non-elevated variant with subtle shadow.
              </p>
            </div>
          </ClayCard>

          {/* ClayBadge variants */}
          <div className="flex flex-wrap gap-3 justify-center">
            <ClayBadge>Default</ClayBadge>
            <ClayBadge variant="accent">Accent</ClayBadge>
            <ClayBadge variant="muted">Muted</ClayBadge>
            <ClayBadge size="sm">Small</ClayBadge>
            <ClayBadge variant="accent" size="sm">Small Accent</ClayBadge>
          </div>

          {/* ClayInput */}
          <ClayCard>
            <div className="p-6 flex flex-col gap-4">
              <ClayInput label="Movie Title" placeholder="Search for a movie..." />
              <ClayInput
                label="Year"
                placeholder="2024"
                error="Please enter a valid year"
              />
            </div>
          </ClayCard>

          {/* ClayModal trigger */}
          <div className="flex justify-center">
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 rounded-clay bg-accent text-clay-base font-body text-sm hover:bg-accent-hover transition-colors"
            >
              Open ClayModal
            </button>
          </div>

          {/* ClaySkeletonCard */}
          <ClaySkeletonCard />
          <ClaySkeletonCard hasImage={false} lines={2} />
        </div>

        {/* Metal hardware components showcase -- temporary, replaced by real UI */}
        <div className="bg-clay-surface clay-shadow-md rounded-clay p-6 max-w-md w-full flex flex-col gap-6">
          <p className="font-body text-xs text-clay-text-muted text-center uppercase tracking-wider">
            Metal Hardware Controls (dev)
          </p>

          {/* MetalButton variants & sizes */}
          <div className="flex flex-col gap-3">
            <p className="font-body text-xs text-clay-text-muted">Buttons</p>
            <div className="flex flex-wrap gap-2 items-center">
              <MetalButton variant="primary" size="sm">Primary SM</MetalButton>
              <MetalButton variant="primary" size="md">Primary MD</MetalButton>
              <MetalButton variant="primary" size="lg">Primary LG</MetalButton>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <MetalButton variant="secondary">Secondary</MetalButton>
              <MetalButton variant="ghost">Ghost</MetalButton>
              <MetalButton variant="primary" disabled>Disabled</MetalButton>
            </div>
          </div>

          {/* MetalToggle */}
          <div className="flex flex-col gap-3">
            <p className="font-body text-xs text-clay-text-muted">Toggle</p>
            <MetalToggle
              checked={toggleOn}
              onChange={setToggleOn}
              label={toggleOn ? 'On' : 'Off'}
            />
          </div>

          {/* MetalSlider */}
          <div className="flex flex-col gap-3">
            <p className="font-body text-xs text-clay-text-muted">Slider</p>
            <MetalSlider
              value={sliderValue}
              onChange={setSliderValue}
              min={0}
              max={100}
              step={1}
              label="Volume"
            />
          </div>

          {/* MetalCheckbox */}
          <div className="flex flex-col gap-3">
            <p className="font-body text-xs text-clay-text-muted">Checkbox</p>
            <MetalCheckbox
              checked={checkboxChecked}
              onChange={setCheckboxChecked}
              label="Include adult content"
            />
          </div>

          {/* MetalDropdown */}
          <div className="flex flex-col gap-3">
            <p className="font-body text-xs text-clay-text-muted">Dropdown</p>
            <MetalDropdown
              options={dropdownOptions}
              value={dropdownValue}
              onChange={setDropdownValue}
              placeholder="Choose genre..."
              label="Favorite Genre"
            />
          </div>
        </div>
      </motion.div>

      {/* ClayModal */}
      <ClayModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Movie Details"
      >
        <p className="font-body text-clay-text-muted">
          This is a clay modal with backdrop blur, spring animation entry,
          and close on Escape/backdrop click.
        </p>
      </ClayModal>
    </div>
  );
}

export default App;
