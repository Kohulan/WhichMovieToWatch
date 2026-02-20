// Provider types with pricing tier categorization

export type ProviderTier = "flatrate" | "rent" | "buy" | "free" | "ads";

export interface ProviderInfo {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priority: number;
  deep_link: string | null;
}

export interface MovieProviders {
  flatrate?: ProviderInfo[];
  rent?: ProviderInfo[];
  buy?: ProviderInfo[];
  free?: ProviderInfo[];
  ads?: ProviderInfo[];
  tmdb_link: string;
}

export interface RegionProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priorities: Record<string, number>;
}
