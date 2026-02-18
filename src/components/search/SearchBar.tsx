import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { VoiceSearchButton } from './VoiceSearchButton';

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialValue?: string;
}

/** Strip HTML tags from input to prevent XSS (SECU-02) */
function sanitizeInput(input: string): string {
  return input.replace(/<[^>]*>/g, '').slice(0, 100);
}

/**
 * SearchBar — Text input with 300ms debounce, voice search, and XSS sanitization.
 *
 * Uses useDebouncedValue(inputValue, 300) to delay search triggering until
 * the user stops typing (SRCH-01). Input is sanitized by stripping HTML tags
 * and capped at 100 characters (SECU-02).
 *
 * Renders VoiceSearchButton when Web Speech API is supported.
 * Clear button (X) appears when input is non-empty.
 * Visible focus ring on keyboard navigation (A11Y-03).
 */
export function SearchBar({ onSearch, initialValue = '' }: SearchBarProps) {
  const [inputValue, setInputValue] = useState(initialValue);
  const debouncedValue = useDebouncedValue(inputValue, 300);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount (focus trap in SearchModal — A11Y-03)
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Trigger search when debounced value changes
  useEffect(() => {
    onSearch(debouncedValue);
  }, [debouncedValue, onSearch]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeInput(e.target.value);
    setInputValue(sanitized);
  }, []);

  const handleClear = useCallback(() => {
    setInputValue('');
    inputRef.current?.focus();
  }, []);

  const handleVoiceTranscript = useCallback((transcript: string) => {
    const sanitized = sanitizeInput(transcript);
    setInputValue(sanitized);
  }, []);

  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-clay-base clay-shadow-inset rounded-clay">
      {/* Search icon prefix */}
      <Search
        className="w-5 h-5 text-clay-text-muted flex-shrink-0"
        aria-hidden="true"
      />

      {/* Text input */}
      <input
        ref={inputRef}
        type="search"
        value={inputValue}
        onChange={handleChange}
        placeholder="Search movies..."
        aria-label="Search movies"
        maxLength={100}
        className="
          flex-1 bg-transparent outline-none
          font-body text-clay-text text-base
          placeholder:text-clay-text-muted
          focus-visible:outline-none
        "
      />

      {/* Clear button — visible when input non-empty */}
      {inputValue && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="
            flex-shrink-0 p-1 rounded-full
            text-clay-text-muted hover:text-clay-text
            hover:bg-clay-surface/40
            transition-colors
            outline-none focus-visible:ring-2 focus-visible:ring-accent
          "
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      )}

      {/* Voice search button */}
      <VoiceSearchButton onTranscript={handleVoiceTranscript} />
    </div>
  );
}
