import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes } from 'react';

interface ClayInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

/**
 * ClayInput — Indented clay text input with inset shadows.
 *
 * Appears pressed into the clay surface (inset shadows) rather than
 * elevated. Focus state adds deeper inset + accent ring glow.
 * Error state adds red border and error message below.
 * Fully accessible with label/input linking and aria attributes.
 */
export const ClayInput = forwardRef<HTMLInputElement, ClayInputProps>(
  ({ label, error, className = '', id: propId, ...inputProps }, ref) => {
    const generatedId = useId();
    const inputId = propId || generatedId;
    const errorId = `${inputId}-error`;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="font-body font-medium text-sm text-clay-text"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? errorId : undefined}
            className={`
              w-full px-4 py-3 rounded-clay
              bg-clay-base clay-texture clay-shadow-inset
              font-body text-clay-text
              placeholder:text-clay-text-muted
              transition-all duration-200
              outline-none
              focus:ring-2 focus:ring-accent
              focus:shadow-[inset_6px_6px_12px_var(--clay-shadow),inset_-3px_-3px_8px_var(--clay-highlight)]
              ${error ? 'ring-2 ring-red-500 shadow-[inset_6px_6px_12px_var(--clay-shadow),inset_-3px_-3px_8px_var(--clay-highlight)]' : ''}
              ${className}
            `}
            {...inputProps}
          />
        </div>
        {error && (
          <p id={errorId} className="font-body text-xs text-red-500 mt-0.5" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

ClayInput.displayName = 'ClayInput';
