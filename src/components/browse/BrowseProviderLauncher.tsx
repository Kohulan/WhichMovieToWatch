import { useState } from "react";
import { motion } from "motion/react";
import { useRegionProviders } from "@/hooks/useWatchProviders";
import { useRegionStore } from "@/stores/regionStore";
import { usePreferencesStore } from "@/stores/preferencesStore";
import {
  getProviderLogoUrl,
  MAJOR_STREAMING_PROVIDERS,
} from "@/lib/provider-registry";

interface BrowseProviderLauncherProps {
  onSelect: (providerId: number) => void;
}

interface RegionProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priorities: Record<string, number>;
}

/** Top-tier providers shown by default. Long-tail hidden behind "Show all". */
const DEFAULT_LIMIT = 24;

/**
 * Section stagger for the launcher entrance. Subtle: 80ms gap, ease-out-quint,
 * 8px y-offset. Reads as "the page composes itself" rather than a page-load
 * choreography. Disabled under prefers-reduced-motion via the project's
 * MotionProvider (reducedMotion='user').
 */
const sectionContainer = {
  initial: {},
  animate: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
};

const sectionItem = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function BrowseProviderLauncher({
  onSelect,
}: BrowseProviderLauncherProps) {
  const { providers, isLoading } = useRegionProviders() as {
    providers: RegionProvider[];
    isLoading: boolean;
  };
  const myServices = usePreferencesStore((s) => s.myServices);
  const region = useRegionStore((s) => s.effectiveRegion)();
  const [showAll, setShowAll] = useState(false);

  const myServicesSet = new Set(myServices);
  const majorSet = new Set<number>(MAJOR_STREAMING_PROVIDERS);

  // Section 1: user's own services (only renders if non-empty), in user order.
  const myProviders = providers
    .filter((p) => myServicesSet.has(p.provider_id))
    .sort(
      (a, b) =>
        myServices.indexOf(a.provider_id) - myServices.indexOf(b.provider_id),
    );

  // Section 2: featured majors not already in myServices, in canonical order.
  // Hide any major TMDB doesn't return for this region (e.g. Hulu in DE).
  const providerById = new Map(providers.map((p) => [p.provider_id, p]));
  const featuredMajors = MAJOR_STREAMING_PROVIDERS.filter(
    (id) => !myServicesSet.has(id),
  )
    .map((id) => providerById.get(id))
    .filter((p): p is RegionProvider => p !== undefined);

  // Section 3: long-tail by region priority. Excludes both myServices AND
  // majors so the same provider never appears twice on the page.
  const otherProviders = providers
    .filter(
      (p) => !myServicesSet.has(p.provider_id) && !majorSet.has(p.provider_id),
    )
    .sort((a, b) => {
      const ap = a.display_priorities?.[region] ?? Number.MAX_SAFE_INTEGER;
      const bp = b.display_priorities?.[region] ?? Number.MAX_SAFE_INTEGER;
      return ap - bp;
    });

  const visibleOthers = showAll
    ? otherProviders
    : otherProviders.slice(0, DEFAULT_LIMIT);
  const hiddenCount = otherProviders.length - visibleOthers.length;

  if (isLoading && providers.length === 0) {
    return (
      <div
        className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-7 gap-3"
        aria-busy="true"
        aria-label="Loading streaming services"
      >
        {Array.from({ length: 14 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-2xl bg-clay-surface/60 animate-pulse"
            aria-hidden="true"
          />
        ))}
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <p className="text-clay-text-muted text-sm py-8">
        No streaming in this region yet. Try a different country from the
        navbar.
      </p>
    );
  }

  return (
    <motion.div
      className="space-y-10 sm:space-y-12"
      variants={sectionContainer}
      initial="initial"
      animate="animate"
    >
      {myProviders.length > 0 && (
        <motion.section
          variants={sectionItem}
          aria-labelledby="my-services-heading"
        >
          <h2
            id="my-services-heading"
            className="text-clay-text-muted text-xs uppercase tracking-wider font-semibold mb-4"
          >
            Your services
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {myProviders.map((p) => (
              <ProviderCard
                key={p.provider_id}
                provider={p}
                onSelect={onSelect}
                prominent
              />
            ))}
          </div>
        </motion.section>
      )}

      {featuredMajors.length > 0 && (
        <motion.section
          variants={sectionItem}
          aria-labelledby="featured-heading"
        >
          <h2
            id="featured-heading"
            className="text-clay-text-muted text-xs uppercase tracking-wider font-semibold mb-4"
          >
            {myProviders.length > 0 ? "Featured" : "Streaming services"}
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {featuredMajors.map((p) => (
              <ProviderCard
                key={p.provider_id}
                provider={p}
                onSelect={onSelect}
                prominent
              />
            ))}
          </div>
        </motion.section>
      )}

      <motion.section variants={sectionItem} aria-labelledby="all-platforms-heading">
        <h2
          id="all-platforms-heading"
          className="text-clay-text-muted text-xs uppercase tracking-wider font-semibold mb-4"
        >
          All platforms
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-7 gap-3">
          {visibleOthers.map((p) => (
            <ProviderCard
              key={p.provider_id}
              provider={p}
              onSelect={onSelect}
            />
          ))}
        </div>

        {hiddenCount > 0 && !showAll && (
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="
              mt-6 inline-flex items-center gap-1
              text-sm text-clay-text-muted hover:text-clay-text
              underline underline-offset-4 decoration-clay-border
              hover:decoration-clay-text-muted
              transition-colors duration-200 cursor-pointer
              outline-none focus-visible:ring-2 focus-visible:ring-accent rounded
            "
            aria-expanded="false"
          >
            Show {hiddenCount} more
          </button>
        )}
        {showAll && otherProviders.length > DEFAULT_LIMIT && (
          <button
            type="button"
            onClick={() => setShowAll(false)}
            className="
              mt-6 inline-flex items-center gap-1
              text-sm text-clay-text-muted hover:text-clay-text
              underline underline-offset-4 decoration-clay-border
              hover:decoration-clay-text-muted
              transition-colors duration-200 cursor-pointer
              outline-none focus-visible:ring-2 focus-visible:ring-accent rounded
            "
            aria-expanded="true"
          >
            Show fewer
          </button>
        )}
      </motion.section>
    </motion.div>
  );
}

interface ProviderCardProps {
  provider: RegionProvider;
  onSelect: (id: number) => void;
  prominent?: boolean;
}

function ProviderCard({ provider, onSelect, prominent }: ProviderCardProps) {
  const dim = prominent ? 96 : 72;
  return (
    <motion.button
      type="button"
      onClick={() => onSelect(provider.provider_id)}
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="
        group flex flex-col items-center gap-2 p-1.5 cursor-pointer
        rounded-2xl
        outline-none focus-visible:ring-2 focus-visible:ring-accent
      "
      aria-label={`Browse ${provider.provider_name}`}
      title={provider.provider_name}
    >
      <div
        className="
          relative aspect-square w-full rounded-2xl overflow-hidden
          bg-clay-surface clay-shadow-sm
          transition-shadow duration-300
          group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.16),0_0_0_1px_color-mix(in_oklch,var(--accent)_35%,transparent)]
          contain-card
        "
      >
        {provider.logo_path ? (
          <motion.img
            layoutId={`browse-provider-${provider.provider_id}`}
            src={getProviderLogoUrl(provider.logo_path)}
            alt=""
            width={dim}
            height={dim}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
        ) : (
          <motion.div
            layoutId={`browse-provider-${provider.provider_id}`}
            className="w-full h-full flex items-center justify-center text-clay-text-muted text-sm font-semibold"
          >
            {provider.provider_name.slice(0, 3)}
          </motion.div>
        )}
      </div>
      <span
        className={`
          ${prominent ? "text-sm" : "text-xs"}
          text-clay-text-muted text-center leading-tight line-clamp-2
          group-hover:text-clay-text transition-colors duration-200
        `}
      >
        {provider.provider_name}
      </span>
    </motion.button>
  );
}
