// Service Rotary Dial — compact skeuomorphic knob to switch streaming services

import { useCallback, useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  DINNER_TIME_SERVICES,
} from '@/hooks/useDinnerTime';
import { getServiceConfig } from './ServiceBranding';
import { playTick } from '@/hooks/useSound';

interface ServiceRotaryDialProps {
  currentService: number;
  onServiceChange: (id: number) => void;
}

const SERVICES: readonly number[] = [
  DINNER_TIME_SERVICES.NETFLIX,
  DINNER_TIME_SERVICES.PRIME,
  DINNER_TIME_SERVICES.DISNEY_PLUS,
];

/** 3 positions at 120 degrees apart */
const ANGLES = [0, 120, 240] as const;

/** Brand colors keyed by service ID */
const SERVICE_COLORS: Record<number, string> = {
  [DINNER_TIME_SERVICES.NETFLIX]: '#E50914',
  [DINNER_TIME_SERVICES.PRIME]: '#00A8E1',
  [DINNER_TIME_SERVICES.DISNEY_PLUS]: '#113CCF',
};

export function ServiceRotaryDial({
  currentService,
  onServiceChange,
}: ServiceRotaryDialProps) {
  const currentIndex = SERVICES.indexOf(currentService);
  const activeColor = SERVICE_COLORS[currentService] ?? '#6B7280';

  /* Glow ring state — active for 2s after each click */
  const [isGlowing, setIsGlowing] = useState(false);
  const glowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Track cumulative angle for smooth multi-turn rotation */
  const cumulativeAngle = useRef(ANGLES[currentIndex >= 0 ? currentIndex : 0]);
  const prevIndex = useRef(currentIndex >= 0 ? currentIndex : 0);

  /* Drag state */
  const dragStartAngle = useRef(0);
  const knobRef = useRef<HTMLDivElement>(null);

  const triggerGlow = useCallback(() => {
    setIsGlowing(true);
    if (glowTimerRef.current) clearTimeout(glowTimerRef.current);
    glowTimerRef.current = setTimeout(() => setIsGlowing(false), 2000);
  }, []);

  const advance = useCallback(
    (direction: 1 | -1 = 1) => {
      const idx = currentIndex >= 0 ? currentIndex : 0;
      const next = (idx + direction + SERVICES.length) % SERVICES.length;
      onServiceChange(SERVICES[next]);
      playTick();
      triggerGlow();
    },
    [currentIndex, onServiceChange, triggerGlow],
  );

  /* Update cumulative angle to always rotate the shortest path */
  useEffect(() => {
    const idx = currentIndex >= 0 ? currentIndex : 0;
    const prev = prevIndex.current;
    if (idx !== prev) {
      let delta = ANGLES[idx] - ANGLES[prev];
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      cumulativeAngle.current += delta;
      prevIndex.current = idx;
    }
  }, [currentIndex]);

  useEffect(() => {
    return () => {
      if (glowTimerRef.current) clearTimeout(glowTimerRef.current);
    };
  }, []);

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

  /* Drag-to-rotate */
  const getAngleFromPointer = useCallback((clientX: number, clientY: number) => {
    if (!knobRef.current) return 0;
    const rect = knobRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return Math.atan2(clientY - cy, clientX - cx) * (180 / Math.PI);
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      dragStartAngle.current = getAngleFromPointer(e.clientX, e.clientY);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [getAngleFromPointer],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      const endAngle = getAngleFromPointer(e.clientX, e.clientY);
      let delta = endAngle - dragStartAngle.current;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      if (Math.abs(delta) < 30) return;
      advance(delta > 0 ? 1 : -1);
    },
    [getAngleFromPointer, advance],
  );

  const config = getServiceConfig(currentService);

  return (
    <div
      className="inline-flex flex-col items-center gap-2"
      role="listbox"
      aria-label="Select streaming service"
      aria-activedescendant={`service-${currentService}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Knob with glow ring */}
      <div className="relative" style={{ width: 80, height: 80 }}>
        {/* Glow ring */}
        <div
          className="absolute inset-0 rounded-full transition-shadow duration-300"
          style={{
            boxShadow: isGlowing
              ? `0 0 16px ${activeColor}50, 0 0 32px ${activeColor}25, 0 0 48px ${activeColor}15`
              : `0 0 8px ${activeColor}20`,
          }}
        />

        {/* Metal knob */}
        <motion.div
          ref={knobRef}
          onClick={handleClick}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          animate={{ rotate: cumulativeAngle.current }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="absolute inset-2 metal-knob-enhanced metal-shadow rounded-full cursor-pointer flex items-center justify-center touch-none"
          aria-label={`Current service: ${config.name}. Click to switch.`}
        >
          {/* Indicator notch */}
          <div
            className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-3 rounded-full transition-colors duration-300"
            style={{
              backgroundColor: activeColor,
              boxShadow: `0 0 6px ${activeColor}`,
            }}
          />

          {/* Center dimple */}
          <div
            className="w-4 h-4 rounded-full"
            style={{
              background:
                'radial-gradient(circle, var(--metal-dark) 0%, var(--metal-base) 100%)',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.4)',
            }}
          />
        </motion.div>
      </div>

      {/* Active service name crossfade */}
      <AnimatePresence mode="wait">
        <motion.span
          key={currentService}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className="text-xs font-medium text-clay-text-muted"
        >
          {config.name}
        </motion.span>
      </AnimatePresence>

      {/* Screen-reader-only options */}
      {SERVICES.map((serviceId) => (
        <div
          key={serviceId}
          id={`service-${serviceId}`}
          role="option"
          aria-selected={serviceId === currentService}
          className="sr-only"
        >
          {getServiceConfig(serviceId).name}
        </div>
      ))}
    </div>
  );
}
