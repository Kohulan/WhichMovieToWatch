import { useMemo, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { useRegionProviders } from "@/hooks/useWatchProviders";
import { useRegionStore } from "@/stores/regionStore";
import { usePreferencesStore } from "@/stores/preferencesStore";
import { MAJOR_STREAMING_PROVIDERS } from "@/lib/provider-registry";
import { getProviderLayoutId } from "@/lib/layout-ids";
import { ProviderLogo } from "@/components/shared/ProviderLogo";

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

  const { myProviders, featuredMajors, otherProviders } = useMemo(() => {
    const myServicesSet = new Set(myServices);
    const majorSet = new Set(MAJOR_STREAMING_PROVIDERS);
    const providerById = new Map(providers.map((p) => [p.provider_id, p]));

    const my = providers
      .filter((p) => myServicesSet.has(p.provider_id))
      .sort(
        (a, b) =>
          myServices.indexOf(a.provider_id) - myServices.indexOf(b.provider_id),
      );

    // Hide any major TMDB doesn't return for this region (e.g. Hulu in DE).
    const major = MAJOR_STREAMING_PROVIDERS.filter(
      (id) => !myServicesSet.has(id),
    )
      .map((id) => providerById.get(id))
      .filter((p): p is RegionProvider => p !== undefined);

    // Exclude both myServices AND majors so no provider appears twice.
    // TMDB display_priorities: lower number = more prominent in this region.
    const other = providers
      .filter(
        (p) =>
          !myServicesSet.has(p.provider_id) && !majorSet.has(p.provider_id),
      )
      .sort((a, b) => {
        const ap = a.display_priorities?.[region] ?? Number.MAX_SAFE_INTEGER;
        const bp = b.display_priorities?.[region] ?? Number.MAX_SAFE_INTEGER;
        return ap - bp;
      });

    return { myProviders: my, featuredMajors: major, otherProviders: other };
  }, [providers, myServices, region]);

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
        <ProviderSection
          headingId="my-services-heading"
          heading="Your services"
          providers={myProviders}
          onSelect={onSelect}
          prominent
        />
      )}

      {featuredMajors.length > 0 && (
        <ProviderSection
          headingId="featured-heading"
          heading={myProviders.length > 0 ? "Featured" : "Streaming services"}
          providers={featuredMajors}
          onSelect={onSelect}
          prominent
        />
      )}

      <ProviderSection
        headingId="all-platforms-heading"
        heading="All platforms"
        providers={visibleOthers}
        onSelect={onSelect}
        gridClass="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-7 gap-3"
      >
        {hiddenCount > 0 && !showAll && (
          <ToggleAllLink expanded={false} onClick={() => setShowAll(true)}>
            Show {hiddenCount} more
          </ToggleAllLink>
        )}
        {showAll && otherProviders.length > DEFAULT_LIMIT && (
          <ToggleAllLink expanded={true} onClick={() => setShowAll(false)}>
            Show fewer
          </ToggleAllLink>
        )}
      </ProviderSection>
    </motion.div>
  );
}

interface ProviderSectionProps {
  headingId: string;
  heading: string;
  providers: RegionProvider[];
  onSelect: (id: number) => void;
  prominent?: boolean;
  /** Override the default 6-col prominent grid for the long-tail. */
  gridClass?: string;
  children?: ReactNode;
}

const PROMINENT_GRID =
  "grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4";

function ProviderSection({
  headingId,
  heading,
  providers,
  onSelect,
  prominent,
  gridClass,
  children,
}: ProviderSectionProps) {
  return (
    <motion.section variants={sectionItem} aria-labelledby={headingId}>
      <h2
        id={headingId}
        className="text-clay-text-muted text-xs uppercase tracking-wider font-semibold mb-4"
      >
        {heading}
      </h2>
      <div className={gridClass ?? PROMINENT_GRID}>
        {providers.map((p) => (
          <ProviderCard
            key={p.provider_id}
            provider={p}
            onSelect={onSelect}
            prominent={prominent}
          />
        ))}
      </div>
      {children}
    </motion.section>
  );
}

interface ToggleAllLinkProps {
  expanded: boolean;
  onClick: () => void;
  children: ReactNode;
}

function ToggleAllLink({ expanded, onClick, children }: ToggleAllLinkProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={expanded}
      className="
        mt-6 inline-flex items-center gap-1
        text-sm text-clay-text-muted hover:text-clay-text
        underline underline-offset-4 decoration-clay-border
        hover:decoration-clay-text-muted
        transition-colors duration-200 cursor-pointer
        outline-none focus-visible:ring-2 focus-visible:ring-accent rounded
      "
    >
      {children}
    </button>
  );
}

interface ProviderCardProps {
  provider: RegionProvider;
  onSelect: (id: number) => void;
  prominent?: boolean;
}

function ProviderCard({ provider, onSelect, prominent }: ProviderCardProps) {
  const dim = prominent ? 96 : 72;
  const layoutId = getProviderLayoutId(provider.provider_id);
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
          <ProviderLogo
            logoPath={provider.logo_path}
            size={dim}
            layoutId={layoutId}
          />
        ) : (
          <motion.div
            layoutId={layoutId}
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
