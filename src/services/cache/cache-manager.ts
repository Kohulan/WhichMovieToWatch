// TTL-based cache manager with stale-while-revalidate support

import { getDB } from "./db";
import type { CacheEntry } from "./types";

export const TTL = {
  TRENDING: 30 * 60 * 1000,
  MOVIE_DETAILS: 24 * 60 * 60 * 1000,
  SEARCH_RESULTS: 60 * 60 * 1000,
  PROVIDER_LIST: 24 * 60 * 60 * 1000,
  OMDB_RATINGS: 24 * 60 * 60 * 1000,
} as const;

export async function getCached<T>(
  key: string,
): Promise<{ value: T | null; isStale: boolean }> {
  const db = await getDB();
  const entry = await db.get("api-cache", key);

  if (!entry) {
    return { value: null, isStale: true };
  }

  const age = Date.now() - entry.cachedAt;
  const isStale = age > entry.ttl;

  return { value: entry.value as T, isStale };
}

export async function setCache<T>(
  key: string,
  value: T,
  ttlMs: number,
): Promise<void> {
  const db = await getDB();
  await db.put("api-cache", {
    key,
    value,
    cachedAt: Date.now(),
    ttl: ttlMs,
  } as CacheEntry);
}

export async function invalidateByPrefix(prefix: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction("api-cache", "readwrite");
  const store = tx.objectStore("api-cache");
  let cursor = await store.openCursor();

  while (cursor) {
    if (cursor.key.startsWith(prefix)) {
      await cursor.delete();
    }
    cursor = await cursor.continue();
  }

  await tx.done;
}

export async function evictExpired(): Promise<number> {
  const db = await getDB();
  const tx = db.transaction("api-cache", "readwrite");
  const store = tx.objectStore("api-cache");
  let cursor = await store.openCursor();
  let evictedCount = 0;
  const now = Date.now();

  while (cursor) {
    const entry = cursor.value;
    if (now - entry.cachedAt > entry.ttl) {
      await cursor.delete();
      evictedCount++;
    }
    cursor = await cursor.continue();
  }

  await tx.done;
  return evictedCount;
}
