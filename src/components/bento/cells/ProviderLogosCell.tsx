// ProviderLogosCell — Streaming provider logos grid.
//
// Designed as col-span-3, row-span-1 on desktop. hideOnMobile=true (decorative).
// Shows top 6 streaming provider logos using known TMDB provider IDs.
// Clay material cell.

// Static provider data — well-known services with TMDB logo paths
const PROVIDERS = [
  { id: 8, name: 'Netflix', logo: '/t2yyOv40HZeVlLjYsCsPHnWLk4W.jpg' },
  { id: 337, name: 'Disney+', logo: '/7rwgEs15tFwyR9NPQ5vpzxTj19Q.jpg' },
  { id: 9, name: 'Amazon Prime', logo: '/emthp39XA2YScoY2NXdzmugugiU.jpg' },
  { id: 350, name: 'Apple TV+', logo: '/6uhKBfmtzFqOcLousHwZuzcrScK.jpg' },
  { id: 384, name: 'HBO Max', logo: '/Ajqyt5oPwR6fSMPY5V1lNMWaEQX.jpg' },
  { id: 531, name: 'Paramount+', logo: '/fi83B1oztoS47xxcemFdPMhIzK.jpg' },
] as const;

const TMDB_LOGO_BASE = 'https://image.tmdb.org/t/p/original';

export function ProviderLogosCell() {
  return (
    <div className="w-full h-full flex flex-col justify-center p-4 gap-3">
      {/* Label */}
      <span className="text-xs font-semibold text-clay-text-muted uppercase tracking-wide">
        60+ Streaming Services
      </span>

      {/* Provider logo grid */}
      <div className="grid grid-cols-3 gap-2">
        {PROVIDERS.map((provider) => (
          <div
            key={provider.id}
            className="aspect-square rounded-lg overflow-hidden bg-white/10 flex items-center justify-center"
            title={provider.name}
          >
            <img
              src={`${TMDB_LOGO_BASE}${provider.logo}`}
              alt={provider.name}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                // Hide broken provider logos gracefully
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
