// IP geolocation country detection with navigator.language fallback

import type { IPInfoResponse } from '@/types/region';

const IPINFO_URL = 'https://ipinfo.io/json';

export const DEFAULT_COUNTRY = 'DE';

export async function detectCountry(): Promise<string> {
  try {
    const response = await fetch(IPINFO_URL);

    if (response.ok) {
      const data: IPInfoResponse = await response.json();
      if (data.country) {
        return data.country;
      }
    }
  } catch {
    // Network error — fall through to navigator.language fallback
  }

  // Fallback: extract country from browser locale (e.g., 'de-DE' -> 'DE', 'en-US' -> 'US')
  try {
    const locale = navigator.language;
    if (locale && locale.includes('-')) {
      const country = locale.split('-').pop()?.toUpperCase();
      if (country && country.length === 2) {
        return country;
      }
    }
  } catch {
    // navigator not available (SSR) — fall through to default
  }

  return DEFAULT_COUNTRY;
}
