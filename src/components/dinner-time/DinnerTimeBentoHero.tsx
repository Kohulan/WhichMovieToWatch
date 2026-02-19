// DinnerTimeBentoHero — Compact bento hero for the Dinner Time page (BENT-03)
//
// Compact 2-cell bento layout placed below movie content.
// Cell 2 includes a glass-styled "More services" dropdown on the right.

import { useMemo } from 'react';
import { ChevronDown, UtensilsCrossed } from 'lucide-react';
import { BentoGrid } from '@/components/bento/BentoGrid';
import { BentoCell } from '@/components/bento/BentoCell';
import { ScrollReveal } from '@/components/animation/ScrollReveal';
import {
  StaggerContainer,
  StaggerItem,
} from '@/components/animation/StaggerContainer';
import {
  getServiceConfig,
  getServiceLogoUrl,
} from '@/components/dinner-time/ServiceBranding';
import { DINNER_TIME_SERVICES } from '@/hooks/useDinnerTime';

// Services shown in the hero logo strip
const HERO_SERVICES = [
  DINNER_TIME_SERVICES.NETFLIX,
  DINNER_TIME_SERVICES.PRIME,
  DINNER_TIME_SERVICES.DISNEY_PLUS,
] as const;

const FEATURED_IDS = new Set<number>(HERO_SERVICES);

interface RegionProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

interface DinnerTimeBentoHeroProps {
  currentService: number;
  setService: (id: number) => void;
  regionProviders: RegionProvider[];
}

export function DinnerTimeBentoHero({
  currentService,
  setService,
  regionProviders,
}: DinnerTimeBentoHeroProps) {
  const isCustomService = !FEATURED_IDS.has(currentService);

  // Build dropdown options: exclude the 3 featured services already shown as logos
  const moreServiceOptions = useMemo(
    () =>
      regionProviders
        .filter((p) => !FEATURED_IDS.has(p.provider_id))
        .sort((a, b) => a.provider_name.localeCompare(b.provider_name)),
    [regionProviders],
  );

  return (
    <ScrollReveal travel={60} delay={0.3} className="mb-6">
      <StaggerContainer stagger={0.12}>
        <BentoGrid columns={6}>
        {/* Cell 1 — Feature intro: icon + heading + subtext */}
        <StaggerItem direction="up" className="md:col-span-2 lg:col-span-3">
          <BentoCell
            colSpan={{ tablet: 2, desktop: 3 }}
            rowSpan={1}
            material="glass"
            className="min-h-[140px]"
          >
            {/* 50% transparent frosted glass overlay */}
            <div
              className="absolute inset-0 bg-black/50"
              aria-hidden="true"
            />

            <div className="relative z-10 p-5 flex flex-col justify-between h-full gap-3">
              {/* Icon + heading */}
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-orange-500/25">
                  <UtensilsCrossed
                    className="w-5 h-5 text-orange-400"
                    aria-hidden="true"
                  />
                </div>
                <h2
                  className="font-heading font-semibold text-base leading-tight text-white drop-shadow-md"
                >
                  Family Movie Night
                </h2>
              </div>

              {/* Subtext */}
              <p className="text-white/80 text-sm leading-relaxed drop-shadow-sm">
                Pick a streaming service, get a family-friendly movie pick for tonight.
              </p>
            </div>
          </BentoCell>
        </StaggerItem>

        {/* Cell 2 — Service logos + "More services" dropdown */}
        <StaggerItem direction="up" className="md:col-span-2 lg:col-span-3">
          <BentoCell
            colSpan={{ tablet: 2, desktop: 3 }}
            rowSpan={1}
            material="glass"
            className="min-h-[140px]"
          >
            {/* 50% transparent frosted glass overlay */}
            <div
              className="absolute inset-0 bg-black/50"
              aria-hidden="true"
            />
            <div className="relative z-10 p-5 flex items-center justify-between h-full gap-4">
              {/* Left side: label + logos stacked */}
              <div className="flex flex-col gap-3">
                <p className="text-white/70 text-xs font-medium uppercase tracking-wider drop-shadow-sm">
                  Choose your service below
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  {HERO_SERVICES.map((serviceId) => {
                    const config = getServiceConfig(serviceId);
                    const logoUrl = getServiceLogoUrl(serviceId);
                    return (
                      <div
                        key={serviceId}
                        className="flex flex-col items-center gap-1.5"
                        aria-label={config.name}
                      >
                        {logoUrl ? (
                          <img
                            src={logoUrl}
                            alt={config.name}
                            className="w-10 h-10 rounded-xl object-cover shadow-md"
                          />
                        ) : (
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md"
                            style={{ backgroundColor: config.color }}
                          >
                            {config.name[0]}
                          </div>
                        )}
                        <span className="text-white/80 text-xs leading-tight text-center drop-shadow-sm">
                          {config.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Glass-styled "More services" dropdown — right-aligned, vertically centered */}
                {moreServiceOptions.length > 0 && (
                  <div className="relative shrink-0">
                    <select
                      value={isCustomService ? String(currentService) : ''}
                      onChange={(e) => {
                        if (e.target.value) setService(Number(e.target.value));
                      }}
                      aria-label="More streaming services"
                      className="
                        appearance-none
                        bg-white/10 backdrop-blur-sm
                        border border-white/20 rounded-lg
                        text-white/90 text-xs
                        pl-3 pr-7 py-2
                        outline-none cursor-pointer
                        transition-all duration-200
                        hover:bg-white/15 hover:border-white/30
                        focus:bg-white/15 focus:border-white/40 focus:ring-1 focus:ring-white/20
                        drop-shadow-sm
                      "
                      style={{ minWidth: '8.5rem' }}
                    >
                      <option value="" className="bg-gray-900 text-white">
                        More services...
                      </option>
                      {moreServiceOptions.map((p) => (
                        <option
                          key={p.provider_id}
                          value={String(p.provider_id)}
                          className="bg-gray-900 text-white"
                        >
                          {p.provider_name}
                        </option>
                      ))}
                    </select>

                    {/* Custom chevron icon over the native one */}
                    <ChevronDown
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/60 pointer-events-none"
                      aria-hidden="true"
                    />
                  </div>
                )}
            </div>
          </BentoCell>
        </StaggerItem>
        </BentoGrid>
      </StaggerContainer>
    </ScrollReveal>
  );
}
