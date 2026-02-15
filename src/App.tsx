import { useState } from 'react';
import { motion } from 'motion/react';
import { AppShell } from './components/layout/AppShell';
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
} from './components/ui';

const dropdownOptions = [
  { value: 'action', label: 'Action' },
  { value: 'comedy', label: 'Comedy' },
  { value: 'drama', label: 'Drama' },
  { value: 'horror', label: 'Horror' },
  { value: 'sci-fi', label: 'Sci-Fi' },
];

function App() {
  const [toggleOn, setToggleOn] = useState(false);
  const [sliderValue, setSliderValue] = useState(50);
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [dropdownValue, setDropdownValue] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <AppShell>
      <div className="flex flex-col items-center gap-8 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="flex flex-col items-center gap-6 max-w-2xl w-full"
        >
          <h1 className="font-heading text-4xl text-center text-clay-text">
            Which Movie To Watch
          </h1>
          <p className="font-body text-lg text-clay-text-muted text-center">
            Design System Component Showcase
          </p>

          {/* Clay surface components */}
          <div className="w-full flex flex-col gap-6">
            <p className="font-body text-xs text-clay-text-muted text-center uppercase tracking-wider">
              Clay Surface Components
            </p>

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
              <MetalButton
                variant="primary"
                onClick={() => setModalOpen(true)}
              >
                Open ClayModal
              </MetalButton>
            </div>

            {/* ClaySkeletonCard */}
            <ClaySkeletonCard />
            <ClaySkeletonCard hasImage={false} lines={2} />
          </div>

          {/* Metal hardware components showcase */}
          <div className="bg-clay-surface clay-shadow-md rounded-clay p-6 w-full flex flex-col gap-6">
            <p className="font-body text-xs text-clay-text-muted text-center uppercase tracking-wider">
              Metal Hardware Controls
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
    </AppShell>
  );
}

export default App;
