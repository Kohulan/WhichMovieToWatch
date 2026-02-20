// IP geolocation country detection with timezone fallback

import type { IPInfoResponse } from "@/types/region";

const IPINFO_URL = "https://ipinfo.io/json";

export const DEFAULT_COUNTRY = "US";

/** Map IANA timezone to most likely ISO country code */
const TIMEZONE_TO_COUNTRY: Record<string, string> = {
  "Europe/Berlin": "DE",
  "Europe/Munich": "DE",
  "Europe/London": "GB",
  "Europe/Paris": "FR",
  "Europe/Madrid": "ES",
  "Europe/Rome": "IT",
  "Europe/Amsterdam": "NL",
  "Europe/Brussels": "BE",
  "Europe/Vienna": "AT",
  "Europe/Zurich": "CH",
  "Europe/Stockholm": "SE",
  "Europe/Oslo": "NO",
  "Europe/Copenhagen": "DK",
  "Europe/Helsinki": "FI",
  "Europe/Warsaw": "PL",
  "Europe/Prague": "CZ",
  "Europe/Budapest": "HU",
  "Europe/Bucharest": "RO",
  "Europe/Sofia": "BG",
  "Europe/Athens": "GR",
  "Europe/Istanbul": "TR",
  "Europe/Moscow": "RU",
  "Europe/Lisbon": "PT",
  "Europe/Dublin": "IE",
  "Europe/Kiev": "UA",
  "Europe/Kyiv": "UA",
  "Europe/Zagreb": "HR",
  "Europe/Belgrade": "RS",
  "Europe/Bratislava": "SK",
  "Europe/Ljubljana": "SI",
  "Europe/Tallinn": "EE",
  "Europe/Riga": "LV",
  "Europe/Vilnius": "LT",
  "Europe/Luxembourg": "LU",
  "America/New_York": "US",
  "America/Chicago": "US",
  "America/Denver": "US",
  "America/Los_Angeles": "US",
  "America/Phoenix": "US",
  "America/Anchorage": "US",
  "Pacific/Honolulu": "US",
  "America/Detroit": "US",
  "America/Indiana/Indianapolis": "US",
  "America/Toronto": "CA",
  "America/Vancouver": "CA",
  "America/Edmonton": "CA",
  "America/Winnipeg": "CA",
  "America/Halifax": "CA",
  "America/Montreal": "CA",
  "America/Mexico_City": "MX",
  "America/Cancun": "MX",
  "America/Tijuana": "MX",
  "America/Sao_Paulo": "BR",
  "America/Rio_Branco": "BR",
  "America/Manaus": "BR",
  "America/Bogota": "CO",
  "America/Buenos_Aires": "AR",
  "America/Argentina/Buenos_Aires": "AR",
  "America/Santiago": "CL",
  "America/Lima": "PE",
  "America/Caracas": "VE",
  "Asia/Tokyo": "JP",
  "Asia/Seoul": "KR",
  "Asia/Shanghai": "CN",
  "Asia/Hong_Kong": "HK",
  "Asia/Taipei": "TW",
  "Asia/Singapore": "SG",
  "Asia/Kolkata": "IN",
  "Asia/Calcutta": "IN",
  "Asia/Bangkok": "TH",
  "Asia/Jakarta": "ID",
  "Asia/Manila": "PH",
  "Asia/Kuala_Lumpur": "MY",
  "Asia/Ho_Chi_Minh": "VN",
  "Asia/Dubai": "AE",
  "Asia/Riyadh": "SA",
  "Asia/Karachi": "PK",
  "Asia/Dhaka": "BD",
  "Asia/Colombo": "LK",
  "Asia/Kathmandu": "NP",
  "Asia/Tehran": "IR",
  "Asia/Baghdad": "IQ",
  "Asia/Jerusalem": "IL",
  "Asia/Beirut": "LB",
  "Asia/Almaty": "KZ",
  "Asia/Tashkent": "UZ",
  "Africa/Cairo": "EG",
  "Africa/Lagos": "NG",
  "Africa/Nairobi": "KE",
  "Africa/Johannesburg": "ZA",
  "Africa/Casablanca": "MA",
  "Africa/Tunis": "TN",
  "Africa/Algiers": "DZ",
  "Australia/Sydney": "AU",
  "Australia/Melbourne": "AU",
  "Australia/Brisbane": "AU",
  "Australia/Perth": "AU",
  "Australia/Adelaide": "AU",
  "Pacific/Auckland": "NZ",
};

export async function detectCountry(): Promise<string> {
  // Primary: IPInfo geolocation API
  try {
    const response = await fetch(IPINFO_URL);

    if (response.ok) {
      const data: IPInfoResponse = await response.json();
      if (data.country) {
        return data.country;
      }
    }
  } catch {
    // Network error or blocked by ad blocker — fall through to timezone
  }

  // Fallback: infer country from browser timezone (much more reliable than navigator.language)
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && TIMEZONE_TO_COUNTRY[tz]) {
      return TIMEZONE_TO_COUNTRY[tz];
    }
  } catch {
    // Intl not available — fall through to default
  }

  return DEFAULT_COUNTRY;
}
