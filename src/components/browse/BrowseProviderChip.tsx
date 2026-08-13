import { motion } from "motion/react";
import { X } from "lucide-react";
import { getProviderLayoutId } from "@/lib/layout-ids";
import { ProviderLogo } from "@/components/shared/ProviderLogo";

export interface ChipProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

interface BrowseProviderChipProps {
  provider: ChipProvider;
  onClear: () => void;
}

export function BrowseProviderChip({
  provider,
  onClear,
}: BrowseProviderChipProps) {
  const { provider_id, provider_name, logo_path } = provider;
  const layoutId = getProviderLayoutId(provider_id);

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="
        inline-flex items-center gap-2.5 pl-2.5 pr-2 h-10
        rounded-2xl bg-black/[0.03] dark:bg-white/[0.05]
        border border-black/[0.06] dark:border-white/[0.1]
        hover:border-accent/40
        transition-colors duration-200
        max-w-full min-w-0 flex-shrink-0
      "
    >
      {logo_path ? (
        <ProviderLogo
          logoPath={logo_path}
          size={24}
          layoutId={layoutId}
          className="w-6 h-6 rounded-full object-cover flex-shrink-0 shadow-xs ring-1 ring-black/5 dark:ring-white/10"
        />
      ) : (
        <motion.span
          layoutId={layoutId}
          className="w-6 h-6 rounded-full bg-clay-base border border-black/5 dark:border-white/10 flex items-center justify-center text-clay-text-muted text-2xs font-semibold flex-shrink-0"
          aria-hidden="true"
        >
          {provider_name.slice(0, 2)}
        </motion.span>
      )}
      <span className="text-clay-text font-semibold text-xs sm:text-sm tracking-tight truncate min-w-0">
        {provider_name}
      </span>
      <motion.button
        type="button"
        onClick={onClear}
        whileHover={{ rotate: 90, scale: 1.15 }}
        whileTap={{ scale: 0.85 }}
        aria-label={`Change platform (currently ${provider_name})`}
        className="
          inline-flex items-center justify-center w-5 h-5 rounded-full
          text-clay-text-muted hover:text-accent
          hover:bg-accent/15
          transition-colors duration-150
          cursor-pointer flex-shrink-0 ml-0.5
          outline-none focus-visible:ring-2 focus-visible:ring-accent
        "
      >
        <X className="w-3.5 h-3.5" aria-hidden="true" />
      </motion.button>
    </motion.div>
  );
}
