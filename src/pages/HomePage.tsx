// HomePage — Bento grid hero landing page.
//
// Composes 7 bento cell content components into a 12-column desktop grid using
// BentoGrid + BentoCell from the bento system. StaggerContainer wraps the grid
// so all cells fade up on scroll entry with a 0.12s stagger between cells.
//
// Layout (desktop 12-column):
// | Discover CTA (6 cols, 2 rows, glass) | Trending (3 cols, 2 rows, glass) | Rating (3 cols, 1 row, clay) |
// |                                       |                                   | Providers (3 cols, 1 row)    |
// | Dinner Time (4 cols, 1 row, clay)     | Free Movies (4 cols, 1 row, clay) | Search (4 cols, 1 row, clay) |

import { BentoGrid, BentoCell } from '@/components/bento';
import { StaggerContainer, StaggerItem } from '@/components/animation/StaggerContainer';
import { useNavigate } from 'react-router';

import { DiscoverHeroCell } from '@/components/bento/cells/DiscoverHeroCell';
import { TrendingPreviewCell } from '@/components/bento/cells/TrendingPreviewCell';
import { RatingShowcaseCell } from '@/components/bento/cells/RatingShowcaseCell';
import { ProviderLogosCell } from '@/components/bento/cells/ProviderLogosCell';
import { DinnerTimeCell } from '@/components/bento/cells/DinnerTimeCell';
import { FreeMoviesCell } from '@/components/bento/cells/FreeMoviesCell';
import { SearchCell } from '@/components/bento/cells/SearchCell';

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Page header */}
      <div className="mb-5">
        <h1 className="font-heading text-xl font-bold text-clay-text">
          Welcome
        </h1>
        <p className="text-sm text-clay-text-muted">
          Your movie discovery hub
        </p>
      </div>

      {/* Bento grid with staggered fade-up animation on scroll entry */}
      <StaggerContainer
        stagger={0.12}
        role="region"
        aria-label="Movie discovery features"
      >
        <BentoGrid columns={12}>
          {/* Discover CTA — glass hero, 6 cols, 2 rows */}
          <StaggerItem direction="up">
            <BentoCell
              material="glass"
              colSpan={{ tablet: 2, desktop: 6 }}
              rowSpan={2}
              onClick={() => navigate('/discover')}
              overlay={
                <div className="w-full p-3 text-xs text-white/80 font-medium bg-black/30 backdrop-blur-sm">
                  Tap to explore
                </div>
              }
            >
              <DiscoverHeroCell />
            </BentoCell>
          </StaggerItem>

          {/* Trending Preview — glass, 3 cols, 2 rows */}
          <StaggerItem direction="up">
            <BentoCell
              material="glass"
              colSpan={{ desktop: 3 }}
              rowSpan={2}
              onClick={() => navigate('/trending')}
              overlay={
                <div className="w-full p-3 text-xs text-white/80 font-medium bg-black/30 backdrop-blur-sm">
                  Tap to explore
                </div>
              }
            >
              <TrendingPreviewCell />
            </BentoCell>
          </StaggerItem>

          {/* Rating Showcase — clay, 3 cols, 1 row */}
          <StaggerItem direction="up">
            <BentoCell
              material="clay"
              colSpan={{ desktop: 3 }}
              onClick={() => navigate('/trending')}
            >
              <RatingShowcaseCell />
            </BentoCell>
          </StaggerItem>

          {/* Provider Logos — clay, 3 cols, 1 row, hidden on mobile */}
          <StaggerItem direction="up">
            <BentoCell
              material="clay"
              colSpan={{ desktop: 3 }}
              hideOnMobile={true}
            >
              <ProviderLogosCell />
            </BentoCell>
          </StaggerItem>

          {/* Dinner Time — clay, 4 cols, 1 row */}
          <StaggerItem direction="up">
            <BentoCell
              material="clay"
              colSpan={{ desktop: 4 }}
              onClick={() => navigate('/dinner-time')}
              overlay={
                <div className="w-full p-3 text-xs text-clay-text-muted font-medium bg-clay-base/40 backdrop-blur-sm">
                  Tap to explore
                </div>
              }
            >
              <DinnerTimeCell />
            </BentoCell>
          </StaggerItem>

          {/* Free Movies — clay, 4 cols, 1 row */}
          <StaggerItem direction="up">
            <BentoCell
              material="clay"
              colSpan={{ desktop: 4 }}
              onClick={() => navigate('/free-movies')}
              overlay={
                <div className="w-full p-3 text-xs text-clay-text-muted font-medium bg-clay-base/40 backdrop-blur-sm">
                  Tap to explore
                </div>
              }
            >
              <FreeMoviesCell />
            </BentoCell>
          </StaggerItem>

          {/* Search — clay, 4 cols, 1 row */}
          <StaggerItem direction="up">
            <BentoCell
              material="clay"
              colSpan={{ desktop: 4 }}
              onClick={() => navigate('/discover')}
              overlay={
                <div className="w-full p-3 text-xs text-clay-text-muted font-medium bg-clay-base/40 backdrop-blur-sm">
                  Tap to explore
                </div>
              }
            >
              <SearchCell />
            </BentoCell>
          </StaggerItem>
        </BentoGrid>
      </StaggerContainer>
    </div>
  );
}
