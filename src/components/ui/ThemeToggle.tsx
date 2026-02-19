import { useCallback } from 'react';
import { motion } from 'motion/react';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';

/**
 * ThemeToggle — Skeuomorphic dark/light toggle switch.
 *
 * Hardware-quality toggle with sliding metal knob, sun/moon icons
 * inside the track, and spring animation. Matches the premium
 * aesthetic of the RotaryDial companion component.
 */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const mode = useThemeStore((s) => s.mode);
  const toggleMode = useThemeStore((s) => s.toggleMode);
  const isDark = mode === 'dark';

  const handleClick = useCallback(() => {
    toggleMode();
  }, [toggleMode]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleMode();
      }
    },
    [toggleMode],
  );

  return (
    <div
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle dark mode"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`relative inline-flex items-center cursor-pointer select-none ${className}`}
    >
      {/* Track */}
      <div
        className="relative w-[52px] h-7 rounded-full transition-colors duration-200"
        style={{
          backgroundColor: isDark ? 'var(--accent)' : 'var(--clay-elevated)',
          boxShadow:
            'inset 0 2px 4px rgba(0,0,0,0.3), inset 0 -1px 2px rgba(255,255,255,0.1)',
        }}
      >
        {/* Sun icon (left side — visible in light mode) */}
        <Sun
          className="absolute left-1.5 top-1/2 -translate-y-1/2 transition-opacity duration-200"
          style={{
            width: 14,
            height: 14,
            color: isDark ? 'rgba(255,255,255,0.3)' : 'var(--clay-text)',
            opacity: isDark ? 0.3 : 0.8,
          }}
        />

        {/* Moon icon (right side — visible in dark mode) */}
        <Moon
          className="absolute right-1.5 top-1/2 -translate-y-1/2 transition-opacity duration-200"
          style={{
            width: 14,
            height: 14,
            color: isDark ? 'var(--clay-base)' : 'var(--clay-text-muted)',
            opacity: isDark ? 0.9 : 0.3,
          }}
        />

        {/* Sliding metal knob */}
        <motion.div
          className="metal-knob absolute top-[3px] w-[22px] h-[22px] rounded-full"
          animate={{ x: isDark ? 25 : 3 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          style={{
            boxShadow:
              '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)',
          }}
        />
      </div>
    </div>
  );
}
