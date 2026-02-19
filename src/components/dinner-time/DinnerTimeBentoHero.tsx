// DinnerTimeBentoHero — Compact bento hero for the Dinner Time page (BENT-03)
//
// Compact 2-cell bento layout using BentoGrid(columns=6) placed above the
// existing DinnerTimePageComponent. Additive — does not modify existing dinner time content.
//
// Cells:
//   Cell 1 (glass, col-span 3): Feature intro — UtensilsCrossed icon, "Family Movie Night", subtext
//   Cell 2 (clay, col-span 3): Service logos — Netflix, Prime, Disney+ logos with label
//
// Wrapped in StaggerContainer for scroll-entry stagger animation.

import { UtensilsCrossed } from 'lucide-react';
import { BentoGrid } from '@/components/bento/BentoGrid';
import { BentoCell } from '@/components/bento/BentoCell';
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

export function DinnerTimeBentoHero() {
  return (
    <StaggerContainer stagger={0.12} className="mb-6">
      <BentoGrid columns={6}>
        {/* Cell 1 — Feature intro: icon + heading + subtext */}
        <StaggerItem direction="up">
          <BentoCell
            colSpan={{ tablet: 2, desktop: 3 }}
            rowSpan={1}
            material="glass"
            className="min-h-[140px]"
          >
            {/* Warm gradient background */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(135deg, oklch(0.55 0.18 45deg / 0.35) 0%, oklch(0.5 0.22 20deg / 0.2) 100%)',
              }}
              aria-hidden="true"
            />

            <div className="relative z-10 p-5 flex flex-col justify-between h-full gap-3">
              {/* Icon + heading */}
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-orange-500/20 backdrop-blur-sm">
                  <UtensilsCrossed
                    className="w-5 h-5 text-orange-400"
                    aria-hidden="true"
                  />
                </div>
                <h2 className="text-clay-text font-heading font-semibold text-base leading-tight">
                  Family Movie Night
                </h2>
              </div>

              {/* Subtext */}
              <p className="text-clay-text-muted text-sm leading-relaxed">
                Pick a streaming service, get a family-friendly movie pick for tonight.
              </p>
            </div>
          </BentoCell>
        </StaggerItem>

        {/* Cell 2 — Service logos: Netflix, Prime, Disney+ */}
        <StaggerItem direction="up">
          <BentoCell
            colSpan={{ tablet: 2, desktop: 3 }}
            rowSpan={1}
            material="clay"
            className="min-h-[140px]"
          >
            <div className="p-5 flex flex-col justify-between h-full gap-4">
              {/* Label */}
              <p className="text-clay-text-muted text-xs font-medium uppercase tracking-wider">
                Choose your service below
              </p>

              {/* Service logo row */}
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
                      <span className="text-clay-text-muted text-xs leading-tight text-center">
                        {config.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </BentoCell>
        </StaggerItem>
      </BentoGrid>
    </StaggerContainer>
  );
}
