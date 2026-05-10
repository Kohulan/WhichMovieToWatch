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
    <div
      className="
        inline-flex items-center gap-2 pl-1.5 pr-1 py-1
        rounded-full bg-clay-surface clay-shadow-sm
        border border-white/[0.08]
        max-w-full min-w-0
      "
    >
      {logo_path ? (
        <ProviderLogo
          logoPath={logo_path}
          size={28}
          layoutId={layoutId}
          className="w-7 h-7 rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <motion.span
          layoutId={layoutId}
          className="w-7 h-7 rounded-full bg-clay-base flex items-center justify-center text-clay-text-muted text-2xs font-semibold flex-shrink-0"
          aria-hidden="true"
        >
          {provider_name.slice(0, 2)}
        </motion.span>
      )}
      <span className="text-clay-text font-semibold text-sm truncate min-w-0">
        {provider_name}
      </span>
      <motion.button
        type="button"
        onClick={onClear}
        whileTap={{ scale: 0.9 }}
        aria-label={`Change platform (currently ${provider_name})`}
        className="
          ml-0.5 inline-flex items-center justify-center w-7 h-7 rounded-full
          text-clay-text-muted hover:text-clay-text
          hover:bg-white/[0.08]
          transition-colors duration-150
          cursor-pointer flex-shrink-0
          outline-none focus-visible:ring-2 focus-visible:ring-accent/50
        "
      >
        <X className="w-3.5 h-3.5" aria-hidden="true" />
      </motion.button>
    </div>
  );
}
