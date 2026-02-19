import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { VoiceSearchButton } from './VoiceSearchButton';

interface SpotlightInputProps {
  onSearch: (query: string) => void;
  initialValue?: string;
  netflixMode?: boolean;
  placeholder?: string;
}

/** Strip HTML tags from input to prevent XSS (SECU-02) */
function sanitizeInput(input: string): string {
  return input.replace(/<[^>]*>/g, '').slice(0, 100);
}

export function SpotlightInput({
  onSearch,
  initialValue = '',
  netflixMode = false,
  placeholder,
}: SpotlightInputProps) {
  const [inputValue, setInputValue] = useState(initialValue);
  const debouncedValue = useDebouncedValue(inputValue, 300);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus after spring animation settles
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
    return () => cancelAnimationFrame(raf);
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

  const ringColor = netflixMode
    ? 'focus-within:ring-[#E50914]/60'
    : 'focus-within:ring-accent/60';

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3.5
        bg-clay-base clay-shadow-inset rounded-clay
        ring-2 ring-transparent transition-all duration-200
        ${ringColor}
      `}
    >
      {/* Icon prefix — Netflix N or search magnifier */}
      {netflixMode ? (
        <span
          className="flex-shrink-0 text-[#E50914] font-bold text-lg leading-none select-none"
          aria-hidden="true"
        >
          N
        </span>
      ) : (
        <Search
          className="w-5 h-5 text-clay-text-muted flex-shrink-0"
          aria-hidden="true"
        />
      )}

      <input
        ref={inputRef}
        type="search"
        value={inputValue}
        onChange={handleChange}
        placeholder={placeholder ?? (netflixMode ? 'Search Netflix...' : 'Search movies...')}
        aria-label={netflixMode ? 'Search Netflix movies' : 'Search movies'}
        maxLength={100}
        className="
          flex-1 bg-transparent outline-none
          font-body text-clay-text text-base
          placeholder:text-clay-text-muted
          focus-visible:outline-none
        "
      />

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

      <VoiceSearchButton onTranscript={handleVoiceTranscript} />
    </div>
  );
}
