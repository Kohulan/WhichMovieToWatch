import { useId, useCallback } from 'react';

interface DualRangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
  label?: string;
  formatValue?: (v: number) => string;
}

/**
 * DualRangeSlider — Two-thumb range input on a shared rail.
 *
 * Renders two overlaid native range inputs. The left thumb cannot exceed the right
 * thumb value and vice versa, preventing crossing.
 * Metal gradient thumbs on an inset clay rail, consistent with the claymorphism design system.
 * Fully accessible with ARIA labels, aria-valuemin/max/now on each thumb.
 * Visible focus rings on keyboard navigation (A11Y-03).
 *
 * @example
 * <DualRangeSlider
 *   min={0} max={10}
 *   value={[3, 8]}
 *   onChange={(range) => setRatingRange(range)}
 *   step={0.5}
 *   label="Rating"
 *   formatValue={(v) => v.toFixed(1)}
 * />
 */
export function DualRangeSlider({
  min,
  max,
  value,
  onChange,
  step = 1,
  label,
  formatValue = (v) => String(v),
}: DualRangeSliderProps) {
  const baseId = useId();
  const minId = `${baseId}-min`;
  const maxId = `${baseId}-max`;

  const [minValue, maxValue] = value;

  const handleMinChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newMin = Number(e.target.value);
      // Prevent crossing: min thumb cannot exceed max thumb
      onChange([Math.min(newMin, maxValue), maxValue]);
    },
    [maxValue, onChange],
  );

  const handleMaxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newMax = Number(e.target.value);
      // Prevent crossing: max thumb cannot go below min thumb
      onChange([minValue, Math.max(newMax, minValue)]);
    },
    [minValue, onChange],
  );

  // Percentage positions for visual fill
  const minPct = ((minValue - min) / (max - min)) * 100;
  const maxPct = ((maxValue - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col gap-2">
      {/* Header: label + range display */}
      <div className="flex items-center justify-between">
        {label && (
          <span className="font-body text-sm text-clay-text">{label}</span>
        )}
        <span className="font-body text-sm text-clay-text-muted tabular-nums ml-auto">
          {formatValue(minValue)} — {formatValue(maxValue)}
        </span>
      </div>

      {/* Slider track container */}
      <div className="relative h-6 flex items-center">
        {/* Recessed rail */}
        <div
          className="absolute inset-x-0 h-1.5 rounded-full"
          style={{
            background: 'var(--clay-base)',
            boxShadow:
              'inset 2px 2px 4px rgba(0,0,0,0.2), inset -1px -1px 2px rgba(255,255,255,0.08)',
          }}
        />

        {/* Active fill between thumbs */}
        <div
          className="absolute h-1.5 rounded-full bg-accent"
          style={{
            left: `${minPct}%`,
            right: `${100 - maxPct}%`,
          }}
        />

        {/* Min thumb (left) */}
        <input
          type="range"
          id={minId}
          min={min}
          max={max}
          step={step}
          value={minValue}
          onChange={handleMinChange}
          aria-label={label ? `${label} minimum` : 'Minimum value'}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={minValue}
          className="
            absolute inset-0 w-full h-full
            appearance-none bg-transparent cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:cursor-grab
            [&::-webkit-slider-thumb]:active:cursor-grabbing
            [&::-webkit-slider-thumb]:border-0
            [&::-webkit-slider-thumb]:[background:linear-gradient(135deg,var(--metal-shine),var(--metal-base),var(--metal-dark))]
            [&::-webkit-slider-thumb]:[box-shadow:0_2px_4px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.3)]
            [&::-moz-range-thumb]:w-5
            [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:border-0
            [&::-moz-range-thumb]:[background:linear-gradient(135deg,var(--metal-shine),var(--metal-base),var(--metal-dark))]
            [&::-moz-range-thumb]:[box-shadow:0_2px_4px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.3)]
            [&::-webkit-slider-runnable-track]:bg-transparent
            [&::-moz-range-track]:bg-transparent
            outline-none
            focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1
            pointer-events-none
            [&::-webkit-slider-thumb]:pointer-events-auto
            [&::-moz-range-thumb]:pointer-events-auto
          "
        />

        {/* Max thumb (right) */}
        <input
          type="range"
          id={maxId}
          min={min}
          max={max}
          step={step}
          value={maxValue}
          onChange={handleMaxChange}
          aria-label={label ? `${label} maximum` : 'Maximum value'}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={maxValue}
          className="
            absolute inset-0 w-full h-full
            appearance-none bg-transparent cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:cursor-grab
            [&::-webkit-slider-thumb]:active:cursor-grabbing
            [&::-webkit-slider-thumb]:border-0
            [&::-webkit-slider-thumb]:[background:linear-gradient(135deg,var(--metal-shine),var(--metal-base),var(--metal-dark))]
            [&::-webkit-slider-thumb]:[box-shadow:0_2px_4px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.3)]
            [&::-moz-range-thumb]:w-5
            [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:border-0
            [&::-moz-range-thumb]:[background:linear-gradient(135deg,var(--metal-shine),var(--metal-base),var(--metal-dark))]
            [&::-moz-range-thumb]:[box-shadow:0_2px_4px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.3)]
            [&::-webkit-slider-runnable-track]:bg-transparent
            [&::-moz-range-track]:bg-transparent
            outline-none
            focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1
            pointer-events-none
            [&::-webkit-slider-thumb]:pointer-events-auto
            [&::-moz-range-thumb]:pointer-events-auto
          "
        />
      </div>
    </div>
  );
}
