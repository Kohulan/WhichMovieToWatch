import { useCallback, useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { useThemeStore, type ColorPreset } from "../../stores/themeStore";
import { playTick } from "../../hooks/useSound";

const PRESETS: readonly ColorPreset[] = [
  "warm-orange",
  "gold",
  "clean-white",
] as const;

const PRESET_LABELS: Record<ColorPreset, string> = {
  "warm-orange": "Warm Orange",
  gold: "Gold",
  "clean-white": "White",
};

/** Indicator dot color per preset */
const PRESET_DOTS: Record<ColorPreset, string> = {
  "warm-orange": "#ff6a37",
  gold: "#d4a647",
  "clean-white": "#e8e4de",
};

/** 3 positions at 120 degrees apart */
const ANGLES = [0, 120, 240];

/**
 * RotaryDial — Skeuomorphic rotary knob that clicks between
 * 3 color presets with spring animation and tick sound.
 */
export function RotaryDial({ className = "" }: { className?: string }) {
  const preset = useThemeStore((s) => s.preset);
  const setPreset = useThemeStore((s) => s.setPreset);

  const currentIndex = PRESETS.indexOf(preset);
  const targetAngle = ANGLES[currentIndex >= 0 ? currentIndex : 0];

  /* Glow ring state — active for 2s after each click */
  const [isGlowing, setIsGlowing] = useState(false);
  const glowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const advance = useCallback(
    (direction: 1 | -1 = 1) => {
      const idx = currentIndex >= 0 ? currentIndex : 0;
      const next = (idx + direction + PRESETS.length) % PRESETS.length;
      setPreset(PRESETS[next]);
      playTick();
      /* Trigger glow ring for 2s */
      setIsGlowing(true);
      if (glowTimerRef.current) clearTimeout(glowTimerRef.current);
      glowTimerRef.current = setTimeout(() => setIsGlowing(false), 2000);
    },
    [currentIndex, setPreset],
  );

  /* Cleanup timer on unmount */
  useEffect(() => {
    return () => {
      if (glowTimerRef.current) clearTimeout(glowTimerRef.current);
    };
  }, []);

  const handleClick = useCallback(() => advance(1), [advance]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        advance(1);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
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
      <div
        className={`relative w-14 h-14 flex items-center justify-center ${isGlowing ? "accent-glow-active" : ""}`}
        style={{ borderRadius: "50%" }}
      >
        {ANGLES.map((angle, i) => {
          const rad = ((angle - 90) * Math.PI) / 180;
          const x = Math.cos(rad) * 24;
          const y = Math.sin(rad) * 24;
          const isActive = i === currentIndex;
          return (
            <div
              key={angle}
              className="absolute w-1.5 h-1.5 rounded-full transition-all duration-200"
              style={{
                transform: `translate(${x}px, ${y}px)`,
                backgroundColor: isActive
                  ? PRESET_DOTS[PRESETS[i]]
                  : "rgba(255,255,255,0.25)",
                boxShadow: isActive
                  ? `0 0 10px ${PRESET_DOTS[PRESETS[i]]}, 0 0 20px ${PRESET_DOTS[PRESETS[i]]}40`
                  : "none",
              }}
            />
          );
        })}

        <motion.div
          onClick={handleClick}
          animate={{ rotate: targetAngle }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="metal-knob-enhanced metal-shadow w-12 h-12 rounded-full cursor-pointer relative flex items-center justify-center"
          aria-label={`Current preset: ${PRESET_LABELS[preset]}`}
        >
          <div
            className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-2.5 rounded-full"
            style={{
              backgroundColor: PRESET_DOTS[preset] ?? "var(--accent)",
              boxShadow: `0 0 4px ${PRESET_DOTS[preset] ?? "var(--accent)"}`,
            }}
          />
          <div
            className="w-3 h-3 rounded-full"
            style={{
              background:
                "radial-gradient(circle, var(--metal-dark) 0%, var(--metal-base) 100%)",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.4)",
            }}
          />
        </motion.div>
      </div>

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
