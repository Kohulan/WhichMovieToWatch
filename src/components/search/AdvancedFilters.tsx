import { useState, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSearchStore } from '@/stores/searchStore';
import { MetalCheckbox, MetalDropdown, MetalButton } from '@/components/ui';
import { DualRangeSlider } from '@/components/shared/DualRangeSlider';
import { getAllGenres } from '@/lib/genre-map';
import { useRegionProviders } from '@/hooks/useWatchProviders';

const CURRENT_YEAR = new Date().getFullYear();

/** Format runtime minutes as "Xh Ym" */
function formatRuntime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

const LANGUAGES = [
  { value: '', label: 'Any language' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'hi', label: 'Hindi' },
  { value: 'zh', label: 'Chinese' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
];

const SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Most Popular' },
  { value: 'popularity.asc', label: 'Least Popular' },
  { value: 'vote_average.desc', label: 'Highest Rated' },
  { value: 'vote_average.asc', label: 'Lowest Rated' },
  { value: 'primary_release_date.desc', label: 'Newest' },
  { value: 'primary_release_date.asc', label: 'Oldest' },
];

/**
 * AdvancedFilters — Expandable multi-criteria filter panel.
 *
 * Collapsed by default. ChevronDown toggle expands/collapses.
 * Filters:
 *   - Genre: MetalCheckbox multi-select (all TMDB genres)
 *   - Year range: DualRangeSlider [1900, currentYear]
 *   - Rating range: DualRangeSlider [0, 10] step 0.5
 *   - Runtime range: DualRangeSlider [0, 300] step 15 (Xh Ym format)
 *   - Language: MetalDropdown
 *   - Streaming service: MetalDropdown (from useRegionProviders)
 *   - Sort by: MetalDropdown with 6 options
 * "Clear Filters" resets all to defaults. (ADVS-01 through ADVS-07)
 */
export function AdvancedFilters() {
  const [isExpanded, setIsExpanded] = useState(false);

  const advancedFilters = useSearchStore((s) => s.advancedFilters);
  const sortBy = useSearchStore((s) => s.sortBy);
  const setAdvancedFilters = useSearchStore((s) => s.setAdvancedFilters);
  const resetAdvancedFilters = useSearchStore((s) => s.resetAdvancedFilters);
  const setSortBy = useSearchStore((s) => s.setSortBy);

  const { providers: regionProviders } = useRegionProviders();

  const allGenres = getAllGenres();

  // Provider options: "Any" + region providers
  const providerOptions = [
    { value: '', label: 'Any service' },
    ...regionProviders.map((p) => ({
      value: String(p.provider_id),
      label: p.provider_name,
    })),
  ];

  const handleGenreToggle = useCallback(
    (genreId: number, checked: boolean) => {
      const current = advancedFilters.genres;
      const updated = checked
        ? [...current, genreId]
        : current.filter((id) => id !== genreId);
      setAdvancedFilters({ genres: updated });
    },
    [advancedFilters.genres, setAdvancedFilters],
  );

  const handleClearFilters = useCallback(() => {
    resetAdvancedFilters();
    setSortBy('popularity.desc');
  }, [resetAdvancedFilters, setSortBy]);

  const hasActiveFilters =
    advancedFilters.genres.length > 0 ||
    advancedFilters.yearRange[0] !== 1900 ||
    advancedFilters.yearRange[1] !== CURRENT_YEAR ||
    advancedFilters.ratingRange[0] !== 0 ||
    advancedFilters.ratingRange[1] !== 10 ||
    advancedFilters.runtimeRange[0] !== 0 ||
    advancedFilters.runtimeRange[1] !== 300 ||
    advancedFilters.language !== null ||
    advancedFilters.providerId !== null;

  return (
    <div className="px-4">
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        aria-expanded={isExpanded}
        aria-controls="advanced-filters-panel"
        className="
          flex items-center gap-2 w-full py-2
          text-sm font-body font-medium text-clay-text-muted
          hover:text-clay-text transition-colors
          outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm
        "
      >
        <motion.span
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <ChevronDown className="w-4 h-4" aria-hidden="true" />
        </motion.span>
        <span>Advanced Filters</span>
        {hasActiveFilters && (
          <span
            className="ml-1 w-2 h-2 rounded-full bg-accent"
            aria-label="Filters active"
          />
        )}
      </button>

      {/* Expandable panel */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            id="advanced-filters-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="space-y-5 py-3">
              {/* Genre multi-select */}
              <div>
                <p className="font-body text-sm font-medium text-clay-text mb-2">
                  Genre
                </p>
                <div className="flex flex-wrap gap-2">
                  {allGenres.map((genre) => (
                    <MetalCheckbox
                      key={genre.id}
                      checked={advancedFilters.genres.includes(genre.id)}
                      onChange={(checked) => handleGenreToggle(genre.id, checked)}
                      label={genre.name}
                    />
                  ))}
                </div>
              </div>

              {/* Year range (ADVS-07) */}
              <DualRangeSlider
                label="Release Year"
                min={1900}
                max={CURRENT_YEAR}
                step={1}
                value={advancedFilters.yearRange}
                onChange={(range) => setAdvancedFilters({ yearRange: range })}
              />

              {/* Rating range (ADVS-07) */}
              <DualRangeSlider
                label="Rating"
                min={0}
                max={10}
                step={0.5}
                value={advancedFilters.ratingRange}
                onChange={(range) => setAdvancedFilters({ ratingRange: range })}
                formatValue={(v) => v.toFixed(1)}
              />

              {/* Runtime range (ADVS-07) */}
              <DualRangeSlider
                label="Runtime"
                min={0}
                max={300}
                step={15}
                value={advancedFilters.runtimeRange}
                onChange={(range) => setAdvancedFilters({ runtimeRange: range })}
                formatValue={formatRuntime}
              />

              {/* Language (ADVS-02) */}
              <MetalDropdown
                label="Language"
                options={LANGUAGES}
                value={advancedFilters.language ?? ''}
                onChange={(val) =>
                  setAdvancedFilters({ language: val === '' ? null : val })
                }
                placeholder="Any language"
              />

              {/* Streaming service (ADVS-02) */}
              <MetalDropdown
                label="Streaming Service"
                options={providerOptions}
                value={advancedFilters.providerId ? String(advancedFilters.providerId) : ''}
                onChange={(val) =>
                  setAdvancedFilters({ providerId: val === '' ? null : Number(val) })
                }
                placeholder="Any service"
              />

              {/* Sort by (ADVS-03) */}
              <MetalDropdown
                label="Sort By"
                options={SORT_OPTIONS}
                value={sortBy}
                onChange={setSortBy}
              />

              {/* Clear filters button */}
              <div className="flex justify-end">
                <MetalButton
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  disabled={!hasActiveFilters}
                >
                  Clear Filters
                </MetalButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
