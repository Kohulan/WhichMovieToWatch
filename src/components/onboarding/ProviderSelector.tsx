// Provider logo grid for onboarding — toggle selection with show/hide all

import { useState } from 'react';
import { useRegionProviders } from '@/hooks/useWatchProviders';
import { getProviderLogoUrl } from '@/lib/provider-registry';

interface ProviderSelectorProps {
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
}

/** Top 8 priority provider IDs to feature prominently (PREF-03) */
const TOP_PROVIDER_IDS = [8, 337, 9, 119, 15, 384, 350, 531, 386];

/**
 * ProviderSelector — Logo grid for selecting streaming services.
 *
 * Shows top 8 providers prominently. "Show all" expands remaining providers.
 * Toggle selection via local Set<number> → calls onSelectionChange with array.
 * Selected providers: highlighted ring. Unselected: dimmed. (PREF-03)
 */
export function ProviderSelector({ selectedIds, onSelectionChange }: ProviderSelectorProps) {
  const { providers, isLoading } = useRegionProviders();
  const [showAll, setShowAll] = useState(false);

  const selectedSet = new Set(selectedIds);

  function toggleProvider(providerId: number) {
    const next = new Set(selectedSet);
    if (next.has(providerId)) {
      next.delete(providerId);
    } else {
      next.add(providerId);
    }
    onSelectionChange(Array.from(next));
  }

  // Separate top providers from others
  const topProviderIdSet = new Set(TOP_PROVIDER_IDS);
  const topProviders = providers.filter((p) => topProviderIdSet.has(p.provider_id));
  const otherProviders = providers.filter((p) => !topProviderIdSet.has(p.provider_id));

  // If top providers not found in region results, synthesize placeholders for them
  // using well-known TMDB data (grayed out)
  const foundTopIds = new Set(topProviders.map((p) => p.provider_id));
  const missingTopIds = TOP_PROVIDER_IDS.filter((id) => !foundTopIds.has(id));

  if (isLoading) {
    return (
      <div
        className="grid grid-cols-3 sm:grid-cols-4 gap-3"
        aria-label="Loading streaming services"
        aria-busy="true"
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="w-12 h-12 rounded-xl bg-clay-base animate-pulse mx-auto"
            aria-hidden="true"
          />
        ))}
      </div>
    );
  }

  function ProviderButton({
    provider_id,
    provider_name,
    logo_path,
    disabled = false,
  }: {
    provider_id: number;
    provider_name: string;
    logo_path: string;
    disabled?: boolean;
  }) {
    const isSelected = selectedSet.has(provider_id) && !disabled;

    return (
      <button
        key={provider_id}
        onClick={() => !disabled && toggleProvider(provider_id)}
        disabled={disabled}
        className={`
          flex flex-col items-center gap-1.5 p-1 rounded-xl transition-all
          focus:outline-none focus:ring-2 focus:ring-clay-accent
          ${disabled ? 'cursor-default' : 'cursor-pointer hover:opacity-90'}
        `}
        aria-pressed={isSelected}
        aria-label={`${provider_name}${disabled ? ' (not available in your region)' : ''}`}
        title={provider_name}
      >
        <div
          className={`
            w-12 h-12 rounded-xl overflow-hidden transition-all
            ${isSelected ? 'ring-2 ring-clay-accent opacity-100' : 'opacity-50'}
            ${disabled ? 'grayscale opacity-30' : ''}
          `}
        >
          {logo_path ? (
            <img
              src={getProviderLogoUrl(logo_path)}
              alt={provider_name}
              width={48}
              height={48}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-clay-base flex items-center justify-center">
              <span className="text-clay-text-muted text-xs text-center px-0.5 leading-tight">
                {provider_name.slice(0, 3)}
              </span>
            </div>
          )}
        </div>
        <span className="text-clay-text-muted text-xs text-center leading-tight max-w-[60px] line-clamp-1">
          {provider_name}
        </span>
      </button>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top 8 providers */}
      <div
        className="grid grid-cols-3 sm:grid-cols-4 gap-2"
        role="group"
        aria-label="Top streaming services"
      >
        {topProviders.map((p) => (
          <ProviderButton key={p.provider_id} {...p} />
        ))}

        {/* Grayed-out placeholders for top providers not in region */}
        {missingTopIds.map((id) => (
          <div key={id} className="flex flex-col items-center gap-1.5 p-1">
            <div className="w-12 h-12 rounded-xl bg-clay-base opacity-20" aria-hidden="true" />
          </div>
        ))}
      </div>

      {/* "Show all" toggle for remaining providers */}
      {otherProviders.length > 0 && (
        <div className="space-y-3">
          <button
            onClick={() => setShowAll((v) => !v)}
            className="text-sm text-clay-text-muted underline underline-offset-2 hover:text-clay-text transition-colors"
            aria-expanded={showAll}
          >
            {showAll ? 'Show less' : `Show all (${otherProviders.length} more)`}
          </button>

          {showAll && (
            <div
              className="grid grid-cols-3 sm:grid-cols-4 gap-2"
              role="group"
              aria-label="All streaming services"
            >
              {otherProviders.map((p) => (
                <ProviderButton key={p.provider_id} {...p} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
