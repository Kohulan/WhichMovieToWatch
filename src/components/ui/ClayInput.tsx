import { forwardRef, useId } from "react";
import type { InputHTMLAttributes } from "react";

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
  ({ label, error, className = "", id: propId, ...inputProps }, ref) => {
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
            aria-invalid={error ? "true" : undefined}
            aria-describedby={error ? errorId : undefined}
            className={`
              w-full px-4 py-2.5 rounded-xl
              bg-white/[0.06] backdrop-blur-sm border border-white/10
              font-body text-clay-text text-sm
              placeholder:text-clay-text-muted
              transition-all duration-200
              outline-none
              focus:ring-2 focus:ring-accent/50 focus:border-accent/30
              ${error ? "ring-2 ring-red-500/50 border-red-500/30" : ""}
              ${className}
            `}
            {...inputProps}
          />
        </div>
        {error && (
          <p
            id={errorId}
            className="font-body text-xs text-red-500 mt-0.5"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);

ClayInput.displayName = "ClayInput";
