// Streaming provider grouped list — Stream/Rent/Buy/Free tiers (DISP-05)

import { ExternalLink } from "@/components/shared/ExternalLink";
import { getProviderLogoUrl } from "@/lib/provider-registry";
import type { MovieProviders, ProviderInfo } from "@/types/provider";

interface ProviderSectionProps {
  providers: MovieProviders;
  findMovieLink?: string;
  children?: React.ReactNode;
}

interface ProviderTierProps {
  label: string;
  providers: ProviderInfo[];
  tmdbLink: string;
}

/** Renders a single provider tier (Stream / Rent / Buy / Free) */
function ProviderTier({ label, providers, tmdbLink }: ProviderTierProps) {
  if (!providers || providers.length === 0) return null;

  return (
    <div className="mb-3">
      <h4 className="text-xs font-semibold text-clay-text-muted uppercase tracking-wide mb-2">
        {label}
      </h4>
      <div className="flex flex-wrap gap-2">
        {providers.map((provider) => (
          <ExternalLink
            key={provider.provider_id}
            href={provider.deep_link ?? tmdbLink}
            className="block rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
            title={provider.provider_name}
          >
            <img
              src={getProviderLogoUrl(provider.logo_path)}
              alt={provider.provider_name}
              width={40}
              height={40}
              loading="lazy"
              className="w-10 h-10 rounded-lg object-cover"
            />
          </ExternalLink>
        ))}
      </div>
    </div>
  );
}

/** Check if a MovieProviders object has any providers at all */
function hasAnyProviders(providers: MovieProviders): boolean {
  return (
    (providers.flatrate?.length ?? 0) > 0 ||
    (providers.rent?.length ?? 0) > 0 ||
    (providers.buy?.length ?? 0) > 0 ||
    (providers.free?.length ?? 0) > 0 ||
    (providers.ads?.length ?? 0) > 0
  );
}

/** Merge free + ads into a single "Free" tier */
function getFreeProviders(providers: MovieProviders): ProviderInfo[] {
  const free = providers.free ?? [];
  const ads = providers.ads ?? [];
  // Deduplicate by provider_id
  const seen = new Set<number>();
  return [...free, ...ads].filter((p) => {
    if (seen.has(p.provider_id)) return false;
    seen.add(p.provider_id);
    return true;
  });
}

/**
 * ProviderSection — Streaming availability grouped by tier.
 *
 * Groups providers into Stream / Rent / Buy / Free sections with logos.
 * Each logo links to the TMDB JustWatch link via ExternalLink.
 * Shows "Not available" message with a Find Movie link if no providers. (DISP-05)
 * ARIA labeled for screen readers. (A11Y-02)
 */
export function ProviderSection({
  providers,
  findMovieLink,
  children,
}: ProviderSectionProps) {
  const freeProviders = getFreeProviders(providers);
  const hasProviders = hasAnyProviders(providers);

  return (
    <section aria-label="Streaming availability" className="mt-4">
      <h3 className="font-heading text-base font-semibold text-clay-text mb-3">
        Where to Watch
      </h3>

      {children}

      {hasProviders ? (
        <div>
          <ProviderTier
            label="Stream"
            providers={providers.flatrate ?? []}
            tmdbLink={providers.tmdb_link}
          />
          <ProviderTier
            label="Free"
            providers={freeProviders}
            tmdbLink={providers.tmdb_link}
          />
          <ProviderTier
            label="Rent"
            providers={providers.rent ?? []}
            tmdbLink={providers.tmdb_link}
          />
          <ProviderTier
            label="Buy"
            providers={providers.buy ?? []}
            tmdbLink={providers.tmdb_link}
          />
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-clay-text-muted text-sm mb-3">
            Not available in your region
          </p>
          {findMovieLink && (
            <ExternalLink
              href={findMovieLink}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-clay-surface text-clay-text text-sm font-medium hover:opacity-80 transition-opacity border border-clay-border"
            >
              Find Movie
            </ExternalLink>
          )}
        </div>
      )}
    </section>
  );
}
