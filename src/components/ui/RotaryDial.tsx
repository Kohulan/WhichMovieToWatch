import { useCallback } from 'react';
import { motion } from 'motion/react';
import { useThemeStore, type ColorPreset } from '../../stores/themeStore';
import { playTick } from '../../hooks/useSound';

const PRESETS: readonly ColorPreset[] = [
  'cinema-gold',
  'ocean-blue',
  'neon-purple',
] as const;

const PRESET_LABELS: Record<ColorPreset, string> = {
  'cinema-gold': 'Cinema Gold',
  'ocean-blue': 'Ocean Blue',
  'neon-purple': 'Neon Purple',
};

/** 3 positions at 120 degrees apart */
const ANGLES = [0, 120, 240];

/**
 * RotaryDial — Skeuomorphic rotary knob that clicks between
 * 3 color presets with spring animation and tick sound.
 *
 * Premium hardware-style selector matching high-end audio equipment.
 */
export function RotaryDial({ className = '' }: { className?: string }) {
  const preset = useThemeStore((s) => s.preset);
  const setPreset = useThemeStore((s) => s.setPreset);

  const currentIndex = PRESETS.indexOf(preset);
  const targetAngle = ANGLES[currentIndex] ?? 0;

  /** Advance to next preset (cycles) */
  const advance = useCallback(
    (direction: 1 | -1 = 1) => {
      const next =
        (currentIndex + direction + PRESETS.length) % PRESETS.length;
      setPreset(PRESETS[next]);
      playTick();
    },
    [currentIndex, setPreset],
  );

  const handleClick = useCallback(() => advance(1), [advance]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        advance(1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        advance(-1);
      }
    },
    [advance],
  );

  return (
    <div
      className={`relative inline-flex flex-col items-center ${className}`}
      role="listbox"
      aria-label="Color theme selector"
      aria-activedescendant={`preset-${preset}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Position markers — 3 dots around the outside */}
      <div className="relative w-14 h-14 flex items-center justify-center">
        {ANGLES.map((angle, i) => {
          const rad = ((angle - 90) * Math.PI) / 180;
          const x = Math.cos(rad) * 24;
          const y = Math.sin(rad) * 24;
          const isActive = i === currentIndex;
          return (
            <div
              key={angle}
              className={`absolute w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
                isActive ? 'bg-accent' : 'bg-clay-text-muted/40'
              }`}
              style={{
                transform: `translate(${x}px, ${y}px)`,
              }}
            />
          );
        })}

        {/* The rotary knob */}
        <motion.div
          onClick={handleClick}
          animate={{ rotate: targetAngle }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="metal-knob metal-shadow w-12 h-12 rounded-full cursor-pointer relative flex items-center justify-center"
          aria-label={`Current preset: ${PRESET_LABELS[preset]}`}
        >
          {/* Indicator notch at top */}
          <div
            className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-2.5 rounded-full bg-accent"
            style={{
              boxShadow: '0 0 4px var(--accent)',
            }}
          />

          {/* Subtle center dimple */}
          <div
            className="w-3 h-3 rounded-full"
            style={{
              background:
                'radial-gradient(circle, var(--metal-dark) 0%, var(--metal-base) 100%)',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.4)',
            }}
          />
        </motion.div>
      </div>

      {/* Hidden options for accessibility */}
      {PRESETS.map((p) => (
        <div
          key={p}
          id={`preset-${p}`}
          role="option"
          aria-selected={p === preset}
          className="sr-only"
        >
          {PRESET_LABELS[p]}
        </div>
      ))}
    </div>
  );
}
