// Streaming service branding — logos, colors, URLs for Netflix, Prime, Disney+ (DINR-03)

import { PROVIDER_LOGOS_BASE } from "@/lib/provider-registry";

interface ServiceBrandingConfig {
  name: string;
  color: string;
  logoPath: string;
  watchUrl: (title: string) => string;
}

const SERVICE_MAP: Record<number, ServiceBrandingConfig> = {
  8: {
    name: "Netflix",
    color: "#E50914",
    logoPath: "/t2yyOv40HZeVlLjYsCsPHnWLk4W.jpg",
    watchUrl: (title) =>
      `https://www.netflix.com/search?q=${encodeURIComponent(title)}`,
  },
  9: {
    name: "Prime Video",
    color: "#00A8E1",
    logoPath: "/emthp39XA2YScoYL1p0sdbAH2WA.jpg",
    watchUrl: (title) =>
      `https://www.amazon.com/s?k=${encodeURIComponent(title)}&i=instant-video`,
  },
  119: {
    name: "Prime Video",
    color: "#00A8E1",
    logoPath: "/emthp39XA2YScoYL1p0sdbAH2WA.jpg",
    watchUrl: (title) =>
      `https://www.amazon.com/s?k=${encodeURIComponent(title)}&i=instant-video`,
  },
  337: {
    name: "Disney+",
    color: "#113CCF",
    logoPath: "/7rwgEs15tFwyR9NPQ5vpzxTj19Q.jpg",
    watchUrl: (title) =>
      `https://www.disneyplus.com/search/${encodeURIComponent(title)}`,
  },
};

const FALLBACK_SERVICE: ServiceBrandingConfig = {
  name: "Streaming Service",
  color: "#6B7280",
  logoPath: "",
  watchUrl: (title) =>
    `https://www.google.com/search?q=${encodeURIComponent(title)}+streaming`,
};

/**
 * Get branding for a service. For known services (Netflix, Prime, Disney+),
 * returns curated branding. For arbitrary TMDB providers, constructs branding
 * from the provided metadata (name + logo path).
 */
export function getServiceConfig(
  serviceId: number,
  providerName?: string,
  logoPath?: string,
): ServiceBrandingConfig {
  const known = SERVICE_MAP[serviceId];
  if (known) return known;

  // Build dynamic config from TMDB metadata when available
  if (providerName) {
    return {
      name: providerName,
      color: FALLBACK_SERVICE.color,
      logoPath: logoPath ?? "",
      watchUrl: (title) =>
        `https://www.google.com/search?q=${encodeURIComponent(title)}+watch+on+${encodeURIComponent(providerName)}`,
    };
  }

  return FALLBACK_SERVICE;
}

export function getServiceLogoUrl(
  serviceId: number,
  logoPath?: string,
): string | null {
  const config = SERVICE_MAP[serviceId];
  const path = config?.logoPath ?? logoPath;
  if (!path) return null;
  return `${PROVIDER_LOGOS_BASE}${path}`;
}

interface ServiceBrandingProps {
  serviceId: number;
  providerName?: string;
  logoPath?: string;
}

export function ServiceBranding({
  serviceId,
  providerName,
  logoPath,
}: ServiceBrandingProps) {
  const config = getServiceConfig(serviceId, providerName, logoPath);
  const logoUrl = getServiceLogoUrl(serviceId, logoPath);

  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-white text-sm font-semibold shadow-md"
      style={{ backgroundColor: config.color }}
      aria-label={`Available on ${config.name}`}
    >
      {logoUrl && (
        <img
          src={logoUrl}
          alt=""
          className="w-5 h-5 rounded object-cover"
          aria-hidden="true"
        />
      )}
      {config.name}
    </div>
  );
}
