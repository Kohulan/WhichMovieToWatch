import { useState, useRef, useEffect, useMemo } from 'react';
import { Globe, Check, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useRegion } from '@/hooks/useRegion';
import { COUNTRY_NAMES, getCountryName } from '@/lib/country-names';

/** Popular countries shown at the top of the list */
const POPULAR_CODES = new Set([
  'US', 'GB', 'DE', 'FR', 'CA', 'AU', 'IN', 'JP', 'BR', 'ES',
  'IT', 'NL', 'SE', 'MX', 'KR', 'CH', 'AT', 'BE', 'NO', 'DK',
]);

/** All countries sorted alphabetically by name */
const ALL_COUNTRIES = Object.entries(COUNTRY_NAMES)
  .map(([code, name]) => ({ code, name }))
  .sort((a, b) => a.name.localeCompare(b.name));

/**
 * RegionPicker — Clickable country selector with searchable dropdown.
 * Uses useRegion hook for auto-detect and manual override.
 */
export function RegionPicker() {
  const { region, manualOverride, detectedCountry, setOverride } = useRegion();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const countryName = getCountryName(region);
  const isOverridden = manualOverride !== null;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Focus input when opened
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  const { popular, rest, isSearching } = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) {
      // No search: show popular first, then all others alphabetically
      const pop = ALL_COUNTRIES.filter((c) => POPULAR_CODES.has(c.code));
      const others = ALL_COUNTRIES.filter((c) => !POPULAR_CODES.has(c.code));
      return { popular: pop, rest: others, isSearching: false };
    }
    // Search: filter all countries, no limit
    const matched = ALL_COUNTRIES.filter(
      ({ code, name }) =>
        name.toLowerCase().includes(q) || code.toLowerCase().includes(q),
    );
    return { popular: [], rest: matched, isSearching: true };
  }, [query]);

  function handleSelect(code: string) {
    setOverride(code);
    setOpen(false);
    setQuery('');
  }

  function handleReset() {
    setOverride(null);
    setOpen(false);
    setQuery('');
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="
          flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl
          text-xs text-clay-text-muted font-medium
          bg-white/[0.06] border border-white/[0.08]
          hover:bg-white/[0.10] hover:text-clay-text
          transition-colors duration-200
          outline-none focus-visible:ring-2 focus-visible:ring-accent
        "
        aria-label={`Region: ${countryName}. Click to change.`}
        aria-expanded={open}
      >
        <Globe className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{countryName}</span>
        <span className="sm:hidden">{region}</span>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="
              absolute top-full mt-2 left-0
              w-64 max-h-80
              bg-clay-base/90 backdrop-blur-2xl
              border border-white/10
              rounded-2xl shadow-2xl shadow-black/20
              overflow-hidden z-50
              flex flex-col
            "
          >
            {/* Search input */}
            <div className="p-2">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search country..."
                className="
                  w-full px-3 py-2 rounded-xl
                  bg-white/[0.06] border border-white/10
                  text-sm text-clay-text placeholder:text-clay-text-muted
                  outline-none focus:ring-1 focus:ring-accent/50
                "
              />
            </div>

            {/* Reset to auto-detect */}
            {isOverridden && !query && (
              <button
                onClick={handleReset}
                className="
                  flex items-center gap-2 px-4 py-2 mx-2 mb-1
                  text-xs text-accent font-medium
                  rounded-lg hover:bg-white/[0.06]
                  transition-colors
                "
              >
                <RotateCcw className="w-3 h-3" />
                Reset to auto-detect ({getCountryName(detectedCountry)})
              </button>
            )}

            {/* Country list */}
            <div className="flex-1 overflow-y-auto px-2 pb-2">
              {popular.length > 0 && (
                <>
                  <p className="text-[10px] uppercase tracking-wider text-clay-text-muted px-2 pt-1 pb-1.5">
                    Popular
                  </p>
                  {popular.map((c) => (
                    <CountryRow key={c.code} code={c.code} name={c.name} isActive={c.code === region} onSelect={handleSelect} />
                  ))}
                  <div className="border-t border-white/[0.06] my-1.5" />
                  <p className="text-[10px] uppercase tracking-wider text-clay-text-muted px-2 pt-1 pb-1.5">
                    All Countries
                  </p>
                </>
              )}
              {rest.map((c) => (
                <CountryRow key={c.code} code={c.code} name={c.name} isActive={c.code === region} onSelect={handleSelect} />
              ))}
              {isSearching && rest.length === 0 && (
                <p className="text-sm text-clay-text-muted text-center py-4">
                  No countries found
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CountryRow({ code, name, isActive, onSelect }: {
  code: string; name: string; isActive: boolean; onSelect: (code: string) => void;
}) {
  return (
    <button
      onClick={() => onSelect(code)}
      className={`
        w-full flex items-center justify-between gap-2 px-3 py-2
        text-sm rounded-lg
        transition-colors duration-100
        ${isActive
          ? 'bg-accent/15 text-accent font-medium'
          : 'text-clay-text hover:bg-white/[0.06]'
        }
      `}
    >
      <span className="truncate">{name}</span>
      <span className="flex items-center gap-1.5 flex-shrink-0">
        <span className="text-[10px] text-clay-text-muted">{code}</span>
        {isActive && <Check className="w-3.5 h-3.5 text-accent" />}
      </span>
    </button>
  );
}
