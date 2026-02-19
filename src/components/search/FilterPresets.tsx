import { useCallback } from 'react';
import { useSearchStore } from '@/stores/searchStore';
import type { AdvancedFilters } from '@/stores/searchStore';

interface PresetDefinition {
  id: string;
  label: string;
  filters: Partial<AdvancedFilters>;
  sortBy?: string;
}

const PRESETS: PresetDefinition[] = [
  {
    id: '90s-classics',
    label: '90s Classics',
    filters: { yearRange: [1990, 1999], ratingRange: [7, 10] },
    sortBy: 'popularity.desc',
  },
  {
    id: 'hidden-gems',
    label: 'Hidden Gems',
    filters: { ratingRange: [7, 10] },
    sortBy: 'vote_average.desc',
  },
  {
    id: 'short-sweet',
    label: 'Short & Sweet',
    filters: { runtimeRange: [0, 90] },
    sortBy: 'popularity.desc',
  },
  {
    id: 'epic-adventures',
    label: 'Epic Adventures',
    filters: { genres: [12], runtimeRange: [120, 300] },
    sortBy: 'popularity.desc',
  },
  {
    id: 'date-night',
    label: 'Date Night',
    filters: { genres: [10749], ratingRange: [6, 10] },
    sortBy: 'popularity.desc',
  },
  {
    id: 'family-fun',
    label: 'Family Fun',
    filters: { genres: [10751], ratingRange: [6, 10] },
    sortBy: 'popularity.desc',
  },
  {
    id: 'award-winners',
    label: 'Award Winners',
    filters: { ratingRange: [8, 10] },
    sortBy: 'vote_average.desc',
  },
];

interface FilterPresetsProps {
  activePresetId: string | null;
  onPresetSelect: (presetId: string | null) => void;
}

/**
 * FilterPresets — Horizontal scrollable strip of quick filter preset buttons.
 *
 * Each preset applies a predefined set of advancedFilters + sortBy to the search store.
 * Active preset is visually highlighted. Tapping an active preset deselects it (resets).
 * Styled as ClayBadge-like interactive chips (ADVS-04).
 */
export function FilterPresets({ activePresetId, onPresetSelect }: FilterPresetsProps) {
  const setAdvancedFilters = useSearchStore((s) => s.setAdvancedFilters);
  const resetAdvancedFilters = useSearchStore((s) => s.resetAdvancedFilters);
  const setSortBy = useSearchStore((s) => s.setSortBy);

  const handlePresetClick = useCallback(
    (preset: PresetDefinition) => {
      if (activePresetId === preset.id) {
        // Deselect: reset all filters
        resetAdvancedFilters();
        setSortBy('popularity.desc');
        onPresetSelect(null);
      } else {
        // Apply preset
        resetAdvancedFilters();
        setAdvancedFilters(preset.filters);
        if (preset.sortBy) {
          setSortBy(preset.sortBy);
        }
        onPresetSelect(preset.id);
      }
    },
    [activePresetId, resetAdvancedFilters, setAdvancedFilters, setSortBy, onPresetSelect],
  );

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1 px-4 scrollbar-hide"
      role="group"
      aria-label="Quick filter presets"
    >
      {PRESETS.map((preset) => {
        const isActive = activePresetId === preset.id;
        return (
          <button
            key={preset.id}
            type="button"
            onClick={() => handlePresetClick(preset)}
            aria-pressed={isActive}
            aria-label={`${preset.label} preset filter`}
            className={`
              flex-shrink-0
              inline-flex items-center
              rounded-clay clay-shadow-sm
              font-body font-medium text-sm
              px-3 py-1.5
              transition-all duration-200
              outline-none focus-visible:ring-2 focus-visible:ring-accent
              ${
                isActive
                  ? 'bg-accent text-clay-base'
                  : 'bg-clay-surface text-clay-text hover:bg-clay-elevated'
              }
            `}
          >
            {preset.label}
          </button>
        );
      })}
    </div>
  );
}
