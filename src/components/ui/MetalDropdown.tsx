import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';

interface DropdownOption {
  value: string;
  label: string;
}

interface MetalDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

const containerVariants = {
  hidden: { opacity: 0, y: -8, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 28,
      staggerChildren: 0.03,
      delayChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    y: -4,
    scale: 0.98,
    transition: {
      duration: 0.15,
      staggerChildren: 0.02,
      staggerDirection: -1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring' as const, stiffness: 400, damping: 25 } },
  exit: { opacity: 0, x: 8, transition: { duration: 0.1 } },
};

export function MetalDropdown({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  label,
  className = '',
}: MetalDropdownProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedOption = options.find((o) => o.value === value);
  const displayLabel = selectedOption?.label ?? placeholder;

  useEffect(() => {
    if (!open) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [open]);

  useEffect(() => {
    if (open && focusedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[role="option"]');
      items[focusedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [focusedIndex, open]);

  const selectOption = useCallback(
    (optionValue: string) => {
      onChange(optionValue);
      setOpen(false);
      setFocusedIndex(-1);
    },
    [onChange],
  );

  const handleTriggerKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'Enter':
        case ' ':
        case 'ArrowDown':
          e.preventDefault();
          setOpen(true);
          setFocusedIndex(
            options.findIndex((o) => o.value === value) >= 0
              ? options.findIndex((o) => o.value === value)
              : 0,
          );
          break;
        case 'Escape':
          e.preventDefault();
          setOpen(false);
          setFocusedIndex(-1);
          break;
      }
    },
    [options, value],
  );

  const handleListKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) => Math.min(prev + 1, options.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < options.length) {
            selectOption(options[focusedIndex].value);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setOpen(false);
          setFocusedIndex(-1);
          break;
        case 'Home':
          e.preventDefault();
          setFocusedIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setFocusedIndex(options.length - 1);
          break;
      }
    },
    [focusedIndex, options, selectOption],
  );

  const listboxId = `${id}-listbox`;

  return (
    <div className={`flex flex-col gap-2 ${className}`} ref={containerRef}>
      {label && (
        <label htmlFor={id} className="font-body text-sm text-clay-text">
          {label}
        </label>
      )}

      {/* Trigger — metal surface */}
      <button
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={handleTriggerKeyDown}
        className="
          metal-gradient metal-shadow metal-text metal-brushed
          relative overflow-hidden
          flex items-center justify-between gap-2
          w-full px-4 py-2.5 rounded-lg
          font-body text-sm cursor-pointer
          select-none
        "
      >
        <span className={`relative z-10 ${selectedOption ? '' : 'opacity-60'}`}>
          {displayLabel}
        </span>
        <motion.span
          className="relative z-10"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.span>
      </button>

      {/* Dropdown panel — clay surface with staggered items */}
      <div className="relative">
        <AnimatePresence>
          {open && (
            <motion.ul
              ref={listRef}
              id={listboxId}
              role="listbox"
              aria-label={label ?? 'Options'}
              tabIndex={-1}
              onKeyDown={handleListKeyDown}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ transformOrigin: 'top center' }}
              className="
                absolute z-50 top-1 left-0 right-0
                bg-clay-elevated rounded-clay clay-texture
                py-1 overflow-hidden
                max-h-60 overflow-y-auto
              "
              onAnimationComplete={() => {
                if (open && listRef.current) {
                  listRef.current.focus();
                }
              }}
            >
              {options.map((option, idx) => (
                <motion.li
                  key={option.value}
                  variants={itemVariants}
                  role="option"
                  aria-selected={option.value === value}
                  onClick={() => selectOption(option.value)}
                  onMouseEnter={() => setFocusedIndex(idx)}
                  className={`
                    px-4 py-2.5 font-body text-sm cursor-pointer
                    select-none transition-colors duration-100
                    ${option.value === value ? 'text-accent font-semibold bg-clay-surface/50' : 'text-clay-text'}
                    ${idx === focusedIndex ? 'bg-clay-surface' : 'hover:bg-clay-surface'}
                  `}
                >
                  {option.label}
                </motion.li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
