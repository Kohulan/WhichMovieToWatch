import { motion, useMotionValue, useTransform } from 'motion/react';
import { useCallback, useId, useRef, useEffect } from 'react';

interface MetalSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  className?: string;
}

export function MetalSlider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  className = '',
}: MetalSliderProps) {
  const id = useId();
  const railRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  /* Percentage of current value within range */
  const percentage = ((value - min) / (max - min)) * 100;

  /* Motion values for drag interaction */
  const x = useMotionValue(0);

  /* Sync motion value when value prop changes (external updates) */
  useEffect(() => {
    if (!isDragging.current && railRef.current) {
      const railWidth = railRef.current.offsetWidth - 20; // knob diameter
      x.set((percentage / 100) * railWidth);
    }
  }, [percentage, x]);

  const fillWidth = useTransform(x, (latest) => {
    if (!railRef.current) return `${percentage}%`;
    const railWidth = railRef.current.offsetWidth - 20;
    const pct = railWidth > 0 ? Math.max(0, Math.min(100, ((latest + 10) / railRef.current.offsetWidth) * 100)) : percentage;
    return `${pct}%`;
  });

  const clampToStep = useCallback(
    (raw: number) => {
      const clamped = Math.max(min, Math.min(max, raw));
      return Math.round((clamped - min) / step) * step + min;
    },
    [min, max, step],
  );

  const handleDrag = useCallback(() => {
    if (!railRef.current) return;
    const railWidth = railRef.current.offsetWidth - 20;
    const currentX = x.get();
    const pct = currentX / railWidth;
    const rawValue = min + pct * (max - min);
    onChange(clampToStep(rawValue));
  }, [x, min, max, onChange, clampToStep]);

  const handleDragStart = useCallback(() => {
    isDragging.current = true;
  }, []);

  const handleDragEnd = useCallback(() => {
    isDragging.current = false;
    handleDrag();
  }, [handleDrag]);

  /* Click on rail to jump to position */
  const handleRailClick = useCallback(
    (e: React.MouseEvent) => {
      if (!railRef.current) return;
      const rect = railRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const pct = clickX / rect.width;
      const rawValue = min + pct * (max - min);
      const stepped = clampToStep(rawValue);
      onChange(stepped);
    },
    [min, max, onChange, clampToStep],
  );

  /* Keyboard navigation */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      let newValue = value;
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowUp':
          e.preventDefault();
          newValue = Math.min(max, value + step);
          break;
        case 'ArrowLeft':
        case 'ArrowDown':
          e.preventDefault();
          newValue = Math.max(min, value - step);
          break;
        case 'Home':
          e.preventDefault();
          newValue = min;
          break;
        case 'End':
          e.preventDefault();
          newValue = max;
          break;
        default:
          return;
      }
      onChange(clampToStep(newValue));
    },
    [value, min, max, step, onChange, clampToStep],
  );

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Label & value display */}
      {label && (
        <div className="flex justify-between items-center">
          <label htmlFor={id} className="font-body text-sm text-clay-text">
            {label}
          </label>
          <span className="font-body text-sm text-clay-text-muted tabular-nums">
            {value}
          </span>
        </div>
      )}

      {/* Rail */}
      <div
        ref={railRef}
        id={id}
        role="slider"
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-label={label ?? 'Slider'}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onClick={handleRailClick}
        className="relative w-full h-5 flex items-center cursor-pointer"
      >
        {/* Background rail (recessed groove) */}
        <div
          className="absolute inset-x-0 h-1 rounded-full bg-clay-base"
          style={{
            boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.2), inset -1px -1px 2px rgba(255,255,255,0.1)',
          }}
        />

        {/* Fill */}
        <motion.div
          className="absolute left-0 h-1 rounded-full bg-accent"
          style={{ width: fillWidth }}
        />

        {/* Knob */}
        <motion.div
          className="metal-knob absolute w-5 h-5 rounded-full cursor-grab active:cursor-grabbing"
          style={{
            x,
            boxShadow: '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)',
          }}
          drag="x"
          dragConstraints={railRef}
          dragElastic={0}
          dragMomentum={false}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        />
      </div>
    </div>
  );
}
