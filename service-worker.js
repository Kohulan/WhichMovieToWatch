const CACHE_NAME = 'moviewatch-v1.0.0';
const RUNTIME_CACHE = 'runtime-cache-v1';
const MOVIE_CACHE = 'movie-data-v1';
const IMAGE_CACHE = 'movie-images-v1';

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/css/professional-animations.css',
  '/css/visual-enhancements.css',
  '/scripts/app.js',
  '/scripts/api.js',
  '/scripts/ui.js',
  '/scripts/utils.js',
  '/scripts/preferences.js',
  '/scripts/theme.js',
  '/scripts/search.js',
  '/scripts/trending.js',
  '/scripts/professional-animations.js',
  '/scripts/visual-enhancements.js',
  '/scripts/advanced-animations.js',
  '/offline.html',
  '/site.webmanifest'
];

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch(err => console.error('Service Worker: Cache install failed:', err))
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME && 
                         name !== MOVIE_CACHE && 
                         name !== IMAGE_CACHE &&
                         name !== RUNTIME_CACHE)
          .map(name => {
            console.log('Service Worker: Removing old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-HTTP(S) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // TMDB API calls - Network First with Cache Fallback
  if (url.hostname === 'api.themoviedb.org' || url.pathname.includes('/api/')) {
    event.respondWith(networkFirst(request, MOVIE_CACHE));
    return;
  }

  // Images from TMDB - Cache First with Network Fallback
  if (url.hostname === 'image.tmdb.org' || request.destination === 'image') {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
    return;
  }

  // Static assets - Cache First
  if (STATIC_ASSETS.some(asset => url.pathname.includes(asset))) {
    event.respondWith(cacheFirst(request, CACHE_NAME));
    return;
  }

  // Default - Network First
  event.respondWith(networkFirst(request, RUNTIME_CACHE));
});

// Cache strategies
async function cacheFirst(request, cacheName = CACHE_NAME) {
  try {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    
    if (cached) {
      // Return cached response and update cache in background
      fetch(request).then(response => {
        if (response && response.status === 200) {
          cache.put(request, response.clone());
        }
      }).catch(() => {});
      return cached;
    }
    
    const response = await fetch(request);
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('Cache First strategy failed:', error);
    // Try to return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request, cacheName = RUNTIME_CACHE) {
  try {
    const cache = await caches.open(cacheName);
    const response = await fetch(request);
    
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Network failed, try cache
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    
    // No cache available
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    
    // Return error response for API calls
    if (request.url.includes('/api/') || request.url.includes('themoviedb.org')) {
      return new Response(
        JSON.stringify({ 
          error: 'Offline', 
          message: 'No cached data available',
          cached: false 
        }),
        { 
          status: 503,
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }
    
    return new Response('Offline', { status: 503 });
  }
}

// Background sync for queued actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Sync event', event.tag);
  if (event.tag === 'sync-preferences') {
    event.waitUntil(syncPreferences());
  } else if (event.tag === 'sync-watchlist') {
    event.waitUntil(syncWatchlist());
  }
});

async function syncPreferences() {
  try {
    // Get stored preferences from IndexedDB or localStorage
    const preferences = await getStoredPreferences();
    if (preferences) {
      // Sync with server when online
      const response = await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
      });
      if (response.ok) {
        console.log('Preferences synced successfully');
      }
    }
  } catch (error) {
    console.error('Failed to sync preferences:', error);
  }
}

async function syncWatchlist() {
  try {
    // Implement watchlist sync logic
    console.log('Syncing watchlist...');
  } catch (error) {
    console.error('Failed to sync watchlist:', error);
  }
}

async function getStoredPreferences() {
  // This would typically interact with IndexedDB
  // For now, return null as placeholder
  return null;
}

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: 'New movie recommendations available!',
    icon: '/assets/favicon_io/android-chrome-192x192.png',
    badge: '/assets/favicon_io/favicon-32x32.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore Movies'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };

  if (event.data) {
    const data = event.data.json();
    options.body = data.body || options.body;
    options.data.url = data.url || '/';
  }

  event.waitUntil(
    self.registration.showNotification('Which Movie To Watch', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handler for skip waiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
