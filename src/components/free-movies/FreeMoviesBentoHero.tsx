// FreeMoviesBentoHero — Compact bento hero for the Free Movies page (BENT-03)
//
// Compact 2-cell bento layout using BentoGrid(columns=6) placed above the
// existing FreeMoviesPageComponent. Additive — does not modify existing free movies content.
//
// Cells:
//   Cell 1 (glass, col-span 3): YouTube branding — red gradient, "Free on YouTube" heading, Film icon
//   Cell 2 (clay, col-span 3): Movie count stat — "1,000+" large number, "No subscription needed" note
//
// Wrapped in StaggerContainer for scroll-entry stagger animation.

import { Film } from 'lucide-react';
import { BentoGrid } from '@/components/bento/BentoGrid';
import { BentoCell } from '@/components/bento/BentoCell';
import {
  StaggerContainer,
  StaggerItem,
} from '@/components/animation/StaggerContainer';

export function FreeMoviesBentoHero() {
  return (
    <StaggerContainer stagger={0.12} className="mb-6">
      <BentoGrid columns={6}>
        {/* Cell 1 — YouTube branding: red gradient + "Free on YouTube" + Film icon */}
        <StaggerItem direction="up">
          <BentoCell
            colSpan={{ tablet: 2, desktop: 3 }}
            rowSpan={1}
            material="glass"
            className="min-h-[140px]"
          >
            {/* YouTube-themed red gradient background */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(135deg, #FF0000 0%, #CC0000 50%, #990000 100%)',
                opacity: 0.25,
              }}
              aria-hidden="true"
            />

            <div className="relative z-10 p-5 flex flex-col justify-between h-full gap-3">
              {/* Icon + heading */}
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-500/20 backdrop-blur-sm">
                  <Film
                    className="w-5 h-5 text-red-400"
                    aria-hidden="true"
                  />
                </div>
                <h2 className="text-clay-text font-heading font-semibold text-base leading-tight">
                  Free on YouTube
                </h2>
              </div>

              {/* YouTube branding mark */}
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center justify-center w-7 h-5 rounded"
                  style={{ backgroundColor: '#FF0000' }}
                  aria-hidden="true"
                >
                  {/* YouTube play triangle */}
                  <svg
                    viewBox="0 0 24 24"
                    fill="white"
                    className="w-3 h-3"
                    aria-hidden="true"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <span className="text-clay-text-muted text-sm">
                  Full movies, no sign-in required
                </span>
              </div>
            </div>
          </BentoCell>
        </StaggerItem>

        {/* Cell 2 — Movie count stat */}
        <StaggerItem direction="up">
          <BentoCell
            colSpan={{ tablet: 2, desktop: 3 }}
            rowSpan={1}
            material="clay"
            className="min-h-[140px]"
          >
            <div className="p-5 flex flex-col justify-between h-full gap-4">
              {/* Large count stat */}
              <div>
                <p className="text-4xl font-heading font-bold text-clay-text leading-none">
                  1,000+
                </p>
                <p className="text-clay-text-muted text-sm mt-1.5">
                  Free movies available
                </p>
              </div>

              {/* No subscription note */}
              <p className="text-clay-text-muted text-xs opacity-60">
                No subscription needed
              </p>
            </div>
          </BentoCell>
        </StaggerItem>
      </BentoGrid>
    </StaggerContainer>
  );
}
