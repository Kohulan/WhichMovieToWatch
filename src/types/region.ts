// Region types for geolocation and manual override

export interface RegionInfo {
  countryCode: string;
  countryName: string;
  detectedAt: number;
}

export interface IPInfoResponse {
  ip: string;
  city: string;
  region: string;
  country: string;
  loc: string;
  org: string;
  timezone: string;
}
