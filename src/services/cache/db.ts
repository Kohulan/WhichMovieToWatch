// IndexedDB schema and connection via idb (singleton)

import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { CacheEntry } from "./types";

export interface MovieCacheDB extends DBSchema {
  "api-cache": {
    key: string;
    value: CacheEntry;
    indexes: {
      "by-cached-at": number;
    };
  };
}

const DB_NAME = "wmtw-cache";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<MovieCacheDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<MovieCacheDB>> {
  if (!dbPromise) {
    dbPromise = openDB<MovieCacheDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore("api-cache", { keyPath: "key" });
        store.createIndex("by-cached-at", "cachedAt");
      },
    }).catch((err) => {
      // A rejected promise is cached forever by the `!dbPromise` guard above
      // (a rejected promise is still truthy) — one failed open would poison
      // every future cache call for the rest of the session. Clear it so the
      // next getDB() call gets a fresh attempt.
      dbPromise = null;
      throw err;
    });
  }
  return dbPromise;
}
