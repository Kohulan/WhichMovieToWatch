import { motion } from 'motion/react';
import { useCallback, useId } from 'react';

interface MetalToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function MetalToggle({
  checked,
  onChange,
  label,
  disabled = false,
  className = '',
}: MetalToggleProps) {
  const id = useId();

  const handleToggle = useCallback(() => {
    if (!disabled) {
      onChange(!checked);
    }
  }, [checked, disabled, onChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onChange(!checked);
      }
    },
    [checked, disabled, onChange],
  );

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Track */}
      <div
        role="switch"
        aria-checked={checked}
        aria-label={label ?? 'Toggle'}
        aria-disabled={disabled}
        id={id}
        tabIndex={disabled ? -1 : 0}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={`
          relative w-12 h-6 rounded-full cursor-pointer
          transition-colors duration-200
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        style={{
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), inset 0 -1px 2px rgba(255,255,255,0.1)',
          backgroundColor: checked ? 'var(--accent)' : 'var(--clay-base)',
        }}
      >
        {/* Knob */}
        <motion.div
          className="metal-knob absolute top-[2px] w-5 h-5 rounded-full"
          animate={{ x: checked ? 24 : 2 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          style={{
            boxShadow: '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)',
          }}
        />
      </div>

      {label && (
        <label
          htmlFor={id}
          className={`font-body text-clay-text select-none ${disabled ? 'opacity-50' : 'cursor-pointer'}`}
        >
          {label}
        </label>
      )}
    </div>
  );
}
