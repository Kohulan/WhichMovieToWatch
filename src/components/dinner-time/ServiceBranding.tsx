// Streaming service branding — themed badge + URLs for Netflix, Prime, Disney+ (DINR-03)

import { Tv } from 'lucide-react';

interface ServiceBrandingConfig {
  name: string;
  color: string;
  bgColor: string;
  gradientFrom: string;
  gradientTo: string;
  watchUrl: (title: string) => string;
}

const SERVICE_MAP: Record<number, ServiceBrandingConfig> = {
  // Netflix
  8: {
    name: 'Netflix',
    color: '#E50914',
    bgColor: 'bg-red-600',
    gradientFrom: 'from-red-900/20',
    gradientTo: 'to-red-800/10',
    watchUrl: (title) =>
      `https://www.netflix.com/search?q=${encodeURIComponent(title)}`,
  },
  // Amazon Prime Video
  9: {
    name: 'Prime Video',
    color: '#00A8E1',
    bgColor: 'bg-sky-500',
    gradientFrom: 'from-sky-900/20',
    gradientTo: 'to-sky-800/10',
    watchUrl: (title) =>
      `https://www.amazon.com/s?k=${encodeURIComponent(title)}&i=instant-video`,
  },
  // Amazon Prime Video (alternate ID used in some regions)
  119: {
    name: 'Prime Video',
    color: '#00A8E1',
    bgColor: 'bg-sky-500',
    gradientFrom: 'from-sky-900/20',
    gradientTo: 'to-sky-800/10',
    watchUrl: (title) =>
      `https://www.amazon.com/s?k=${encodeURIComponent(title)}&i=instant-video`,
  },
  // Disney+
  337: {
    name: 'Disney+',
    color: '#113CCF',
    bgColor: 'bg-blue-700',
    gradientFrom: 'from-blue-900/20',
    gradientTo: 'to-purple-900/10',
    watchUrl: (title) =>
      `https://www.disneyplus.com/search/${encodeURIComponent(title)}`,
  },
};

// Fallback for unknown services
const FALLBACK_SERVICE: ServiceBrandingConfig = {
  name: 'Streaming Service',
  color: '#6B7280',
  bgColor: 'bg-gray-500',
  gradientFrom: 'from-gray-900/20',
  gradientTo: 'to-gray-800/10',
  watchUrl: (title) =>
    `https://www.google.com/search?q=${encodeURIComponent(title)}+streaming`,
};

interface ServiceBrandingProps {
  serviceId: number;
}

/**
 * ServiceBranding — Renders a themed service badge for Netflix, Prime Video, or Disney+.
 *
 * Shows the service name styled with service-appropriate colors.
 * Used in DinnerTimePage to indicate which service has the movie. (DINR-03)
 */
export function ServiceBranding({ serviceId }: ServiceBrandingProps) {
  const config = SERVICE_MAP[serviceId] ?? FALLBACK_SERVICE;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${config.bgColor} text-white text-sm font-semibold shadow-md`}
      aria-label={`Available on ${config.name}`}
    >
      <Tv className="w-3.5 h-3.5" aria-hidden="true" />
      {config.name}
    </div>
  );
}

/**
 * getServiceConfig — Returns branding config (name, color, watchUrl) for a service ID.
 * Used by DinnerTimePage to get the watch URL and gradient colors.
 */
export function getServiceConfig(serviceId: number): ServiceBrandingConfig {
  return SERVICE_MAP[serviceId] ?? FALLBACK_SERVICE;
}
