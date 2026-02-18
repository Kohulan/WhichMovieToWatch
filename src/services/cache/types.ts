// Cache entry types for IndexedDB storage

export interface CacheEntry<T = unknown> {
  key: string;
  value: T;
  cachedAt: number;
  ttl: number;
}
