import { motion, AnimatePresence } from "motion/react";
import { Check } from "lucide-react";
import { useCallback, useId } from "react";

interface MetalCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function MetalCheckbox({
  checked,
  onChange,
  label,
  disabled = false,
  className = "",
}: MetalCheckboxProps) {
  const id = useId();

  const handleChange = useCallback(() => {
    if (!disabled) {
      onChange(!checked);
    }
  }, [checked, disabled, onChange]);

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Hidden native checkbox for form semantics */}
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        className="sr-only"
      />

      {/* Visual custom checkbox */}
      <div
        onClick={handleChange}
        className={`
          relative w-5 h-5 rounded-md flex items-center justify-center
          cursor-pointer transition-colors duration-150
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
        style={{
          /* Metal frame border using gradient */
          border: "2px solid transparent",
          backgroundImage: checked
            ? `linear-gradient(var(--accent), var(--accent)), linear-gradient(45deg, var(--metal-dark), var(--metal-shine), var(--metal-base), var(--metal-shine), var(--metal-dark))`
            : `linear-gradient(var(--clay-base), var(--clay-base)), linear-gradient(45deg, var(--metal-dark), var(--metal-shine), var(--metal-base), var(--metal-shine), var(--metal-dark))`,
          backgroundOrigin: "border-box",
          backgroundClip: "padding-box, border-box",
          boxShadow: checked
            ? "none"
            : "inset 1px 1px 3px rgba(0,0,0,0.15), inset -1px -1px 2px rgba(255,255,255,0.1)",
        }}
      >
        {/* Checkmark */}
        <AnimatePresence>
          {checked && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="flex items-center justify-center"
            >
              <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {label && (
        <label
          htmlFor={id}
          className={`font-body text-clay-text select-none ${disabled ? "opacity-50" : "cursor-pointer"}`}
        >
          {label}
        </label>
      )}
    </div>
  );
}
