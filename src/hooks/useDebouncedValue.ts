// Generic debounce hook — delays value update until input settles

import { useState, useEffect } from "react";

/**
 * useDebouncedValue — Returns a debounced copy of value.
 *
 * The returned value only updates after delay ms have elapsed
 * since the last change to value. Useful for search inputs,
 * filter controls, and any high-frequency state changes.
 *
 * @param value - The value to debounce
 * @param delay - Debounce delay in milliseconds
 * @returns The debounced value
 *
 * @example
 * const [query, setQuery] = useState('');
 * const debouncedQuery = useDebouncedValue(query, 300);
 * // debouncedQuery updates 300ms after query stops changing
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
