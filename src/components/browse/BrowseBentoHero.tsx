import { Tv, Sparkles } from "lucide-react";
import { BentoGrid } from "@/components/bento/BentoGrid";
import { BentoCell } from "@/components/bento/BentoCell";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/animation/StaggerContainer";

interface BrowseBentoHeroProps {
  providerName: string | null;
  totalResults: number;
  isLoading: boolean;
  sortLabel: string;
}

export function BrowseBentoHero({
  providerName,
  totalResults,
  isLoading,
  sortLabel,
}: BrowseBentoHeroProps) {
  return (
    <StaggerContainer stagger={0.12} className="mb-6">
      <BentoGrid columns={6}>
        {/* Cell 1 — Cinematic hero: accent gradient + branding */}
        <StaggerItem direction="up" className="md:col-span-2 lg:col-span-3">
          <BentoCell
            colSpan={{ tablet: 2, desktop: 3 }}
            rowSpan={1}
            material="glass"
            className="min-h-[140px] overflow-hidden"
          >
            {/* Accent gradient background */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, var(--accent) 0%, color-mix(in oklch, var(--accent) 60%, #000) 60%, color-mix(in oklch, var(--accent) 30%, #000) 100%)",
                opacity: 0.2,
              }}
              aria-hidden="true"
            />

            {/* Subtle grid pattern overlay */}
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
              aria-hidden="true"
            />

            <div className="relative z-10 p-5 flex flex-col justify-between h-full gap-3">
              {/* Icon + badge */}
              <div className="flex items-center gap-2.5">
                <div
                  className="p-2 rounded-xl backdrop-blur-sm"
                  style={{
                    background:
                      "color-mix(in oklch, var(--accent) 20%, transparent)",
                    boxShadow:
                      "0 0 20px color-mix(in oklch, var(--accent) 15%, transparent), inset 0 1px 0 rgba(255,255,255,0.1)",
                  }}
                >
                  <Tv
                    className="w-5 h-5 text-accent"
                    style={{
                      filter: "drop-shadow(0 0 6px var(--accent))",
                    }}
                    aria-hidden="true"
                  />
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/20 text-accent text-xs font-semibold backdrop-blur-sm border border-accent/10">
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"
                    aria-hidden="true"
                  />
                  Streaming
                </span>
              </div>

              {/* Title + subtitle */}
              <div>
                <h1
                  data-testid="browse-heading"
                  className="text-clay-text font-heading font-bold text-xl leading-tight"
                >
                  Browse
                </h1>
                {providerName ? (
                  <p className="text-clay-text-muted text-sm mt-1 font-medium flex items-center gap-1.5">
                    <Sparkles
                      className="w-3.5 h-3.5 text-accent/60"
                      aria-hidden="true"
                    />
                    {providerName} catalog
                  </p>
                ) : (
                  <p className="text-clay-text-muted text-sm mt-1">
                    Select a platform to explore
                  </p>
                )}
              </div>
            </div>
          </BentoCell>
        </StaggerItem>

        {/* Cell 2 — Stats: movie count + sort info */}
        <StaggerItem direction="up" className="md:col-span-2 lg:col-span-3">
          <BentoCell
            colSpan={{ tablet: 2, desktop: 3 }}
            rowSpan={1}
            material="clay"
            className="min-h-[140px]"
          >
            <div className="p-5 grid grid-cols-2 gap-4 h-full items-stretch divide-x divide-clay-border">
              {/* Left stat \u2014 movie count */}
              <div className="flex flex-col justify-center pr-2">
                <span className="text-clay-text-muted text-[11px] uppercase tracking-wider font-medium">
                  In catalog
                </span>
                {isLoading && totalResults === 0 ? (
                  <div className="h-7 w-20 rounded bg-clay-border animate-pulse mt-1" />
                ) : (
                  <p className="text-2xl font-heading font-bold text-clay-text leading-none tabular-nums mt-1">
                    {totalResults > 0
                      ? totalResults.toLocaleString()
                      : "\u2014"}
                  </p>
                )}
              </div>

              {/* Right stat — current sort */}
              <div className="flex flex-col justify-center pl-4">
                <span className="text-clay-text-muted text-[11px] uppercase tracking-wider font-medium">
                  Sorted by
                </span>
                <p className="text-base font-heading font-semibold text-clay-text leading-tight mt-1">
                  {sortLabel}
                </p>
              </div>
            </div>
          </BentoCell>
        </StaggerItem>
      </BentoGrid>
    </StaggerContainer>
  );
}
