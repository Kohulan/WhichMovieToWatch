# Architecture Patterns

**Domain:** Movie Discovery PWA with 3D/Animation Features
**Researched:** 2026-02-15
**Confidence:** HIGH

## Recommended Architecture

### High-Level System Structure

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface Layer                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Pages   │  │  Layouts │  │ Features │  │   UI     │   │
│  │Components│  │Components│  │Components│  │Components│   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
└───────┼────────────┼─────────────┼─────────────┼───────────┘
        │            │             │             │
┌───────┼────────────┼─────────────┼─────────────┼───────────┐
│       │   Animation & Visual Layer              │           │
│  ┌────▼────────┐  ┌──────────────┐  ┌─────────▼────────┐  │
│  │   Framer    │  │ React Three  │  │  Claymorphism    │  │
│  │   Motion    │  │    Fiber     │  │  Theme System    │  │
│  │ (2D/Page)   │  │  (3D/Full)   │  │  (CSS Vars)      │  │
│  └─────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                   State Management Layer                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Zustand    │  │   Context    │  │    Local     │     │
│  │ (App State)  │  │  (Theme/UI)  │  │ (useState)   │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
┌─────────▼──────────────────▼──────────────────▼─────────────┐
│                     Services Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  API Client  │  │   PWA/SW     │  │   Storage    │     │
│  │   (TMDB,     │  │  (Workbox)   │  │ (IndexedDB/  │     │
│  │ OMDB, IPInfo)│  │              │  │ localStorage)│     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **Page Components** | Route-level containers, data fetching orchestration | Feature components, API services, Zustand store |
| **Feature Components** | Business logic modules (Search, MovieCard, Trending, DinnerTime) | UI components, Zustand store, API services |
| **Layout Components** | Bento grid containers, page structure, responsive wrappers | Feature components, theme context |
| **UI Components** | Reusable primitives (Button, Card, Modal) with claymorphism styling | Theme context only |
| **Motion Components** | Framer Motion wrappers for page transitions, scroll animations, micro-interactions | Any component that needs animation |
| **3D Components** | React Three Fiber canvas, 3D scenes, models | Separate from DOM tree, event bus for coordination |
| **Theme Provider** | CSS custom properties, dark/light modes, color presets, animated transitions | All UI components via Context API |
| **API Service** | HTTP client, request/response transformations, error handling | Zustand store, local storage for caching |
| **PWA Manager** | Service worker registration, offline detection, update prompts | Root App component, storage service |
| **Storage Service** | IndexedDB for offline data, localStorage for preferences | API service, Zustand store |

### Data Flow

#### Forward Data Flow (Top-Down)

```
User Interaction
    ↓
Page Component (route handler)
    ↓
Feature Component (business logic)
    ├→ Zustand Action (global state update)
    ├→ API Service Call (data fetch)
    └→ UI Component (presentation)
        ↓
    Theme Context (styling)
        ↓
    Rendered Output
```

#### API Data Flow

```
Feature Component initiates request
    ↓
API Service Layer
    ├→ Check IndexedDB cache (offline-first)
    ├→ Network request (if online)
    │   ├→ TMDB API
    │   ├→ OMDB API
    │   └→ IPInfo.io API
    ├→ Transform response
    └→ Update cache
    ↓
Zustand Store updated
    ↓
Subscribers re-render
    ↓
Framer Motion transitions applied
```

#### 3D/2D Coordination Flow

```
DOM Component (user scroll/interaction)
    ↓
Event Bus / Shared Zustand State
    ↓
React Three Fiber Canvas
    ↓
useFrame hook updates 3D objects
    ↓
Render loop (60fps, isolated from React)
```

### Integration Points

#### Framer Motion + React Integration

- **Page-level**: AnimatePresence wraps route components for page transitions
- **Scroll-based**: useScroll hook drives scroll-triggered animations
- **Micro-interactions**: motion.div for hover states, button presses
- **Layout animations**: Use layout prop for automatic position/size transitions
- **Performance**: Uses CSS transforms (GPU-accelerated) by default

```tsx
// Pattern: Page transitions
<AnimatePresence mode="wait">
  <motion.div
    key={location.pathname}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
</AnimatePresence>
```

#### React Three Fiber + React Integration

- **Isolation**: Canvas runs in separate render loop, doesn't trigger React re-renders
- **Performance**: Use `invalidateFrameloop` for render-on-demand when not animating
- **DOM sync**: Use `useFrame` for animations, not React state
- **Portals**: Use `<Html>` component from @react-three/drei for DOM overlays in 3D space
- **Event coordination**: Custom event emitter or Zustand store for DOM ↔ 3D communication

```tsx
// Pattern: 3D scene with DOM coordination
<Canvas frameloop="demand" dpr={[1, 2]}>
  <Suspense fallback={<Loader />}>
    <Scene scrollProgress={scrollProgress} />
  </Suspense>
</Canvas>
```

#### Claymorphism + Theme System

- **CSS Variables**: Define theme colors, shadows, border-radius as CSS custom properties
- **Context Provider**: ThemeContext wraps app, provides theme switching function
- **Persistence**: Save theme preference to localStorage
- **Transitions**: Animate theme changes using view-transition API or Framer Motion
- **Component styling**: Styled-components or CSS modules consume CSS variables

```tsx
// Pattern: Theme switching with animation
const switchTheme = (newTheme: ThemePreset) => {
  document.startViewTransition(() => {
    setTheme(newTheme);
    updateCSSVariables(newTheme);
  });
};
```

#### Bento Grid + Responsive Layout

- **Grid system**: CSS Grid with named areas for complex layouts
- **Responsive**: react-grid-layout for dynamic resizing/reordering
- **Content modules**: Each grid item is a feature component
- **Motion**: Framer Motion layout animations for grid reflows

```tsx
// Pattern: Bento grid with motion
<motion.div layout className="bento-grid">
  {items.map(item => (
    <motion.div
      key={item.id}
      layout
      className="bento-item"
    >
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

## Patterns to Follow

### Pattern 1: Feature-Based Organization
**What:** Organize code by feature/domain, not by technical role.

**When:** For any feature that has multiple related components, hooks, types.

**Structure:**
```
src/
  features/
    search/
      components/
        SearchBar.tsx
        SearchResults.tsx
      hooks/
        useMovieSearch.ts
      types/
        search.types.ts
      SearchFeature.tsx
      index.ts
    trending/
      components/
      hooks/
      TrendingFeature.tsx
    dinner-time/
      components/
      hooks/
      DinnerTimeFeature.tsx
  shared/
    components/
      ui/          # Reusable UI primitives
      motion/      # Framer Motion wrappers
      three/       # R3F components
    hooks/         # Shared hooks
    utils/         # Helper functions
  services/
    api/
      tmdb.service.ts
      omdb.service.ts
      ipinfo.service.ts
      client.ts
    storage/
      indexeddb.service.ts
      storage.service.ts
    pwa/
      service-worker.ts
  store/
    slices/        # Zustand slices
      movies.slice.ts
      preferences.slice.ts
    index.ts
  theme/
    ThemeProvider.tsx
    themes/
      claymorphism.theme.ts
    styles/
      global.css
      variables.css
```

**Why:** Reduces cognitive load, makes features self-contained, easier to refactor or remove.

### Pattern 2: API Service Layer with Offline-First
**What:** Centralized API client with caching and offline support.

**When:** All external API calls.

**Example:**
```typescript
// services/api/client.ts
class ApiClient {
  private async fetchWithCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions
  ): Promise<T> {
    // 1. Check IndexedDB cache
    const cached = await storage.get(key);
    if (cached && !isStale(cached, options.ttl)) {
      return cached.data;
    }

    // 2. Check online status
    if (!navigator.onLine && cached) {
      return cached.data; // Return stale data offline
    }

    // 3. Fetch from network
    try {
      const data = await fetcher();
      await storage.set(key, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      if (cached) return cached.data; // Fallback to cache
      throw error;
    }
  }
}

// services/api/tmdb.service.ts
export const tmdbService = {
  async getMovie(id: number): Promise<Movie> {
    return apiClient.fetchWithCache(
      `movie:${id}`,
      () => tmdbClient.get(`/movie/${id}`),
      { ttl: 3600000 } // 1 hour
    );
  }
};
```

**Why:** Consistent error handling, reduces boilerplate, enables offline functionality, improves performance.

### Pattern 3: Zustand for Global State + Context for UI State
**What:** Zustand for app data (movies, search, preferences), Context for UI concerns (theme, modals).

**When:**
- Zustand: Cross-route state, async data, performance-critical updates
- Context: Stable UI config that doesn't change frequently

**Example:**
```typescript
// store/slices/movies.slice.ts
interface MoviesState {
  movies: Movie[];
  loading: boolean;
  error: string | null;
  fetchMovies: (filters: Filters) => Promise<void>;
}

export const useMoviesStore = create<MoviesState>((set) => ({
  movies: [],
  loading: false,
  error: null,
  fetchMovies: async (filters) => {
    set({ loading: true });
    try {
      const movies = await tmdbService.search(filters);
      set({ movies, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  }
}));

// theme/ThemeProvider.tsx
interface ThemeContextValue {
  theme: ThemePreset;
  setTheme: (theme: ThemePreset) => void;
  isDark: boolean;
}

export const ThemeContext = createContext<ThemeContextValue>(null!);
```

**Why:** Avoids Context re-render performance issues for frequently changing data, keeps theme/UI state simple and declarative.

### Pattern 4: Compound Components for Complex UI
**What:** Components that work together, share implicit state.

**When:** Building reusable UI with multiple parts (Modal, Dropdown, Card).

**Example:**
```typescript
// shared/components/ui/Card/Card.tsx
interface CardContextValue {
  isExpanded: boolean;
  toggle: () => void;
}

const CardContext = createContext<CardContextValue>(null!);

export const Card = ({ children }: { children: ReactNode }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const toggle = () => setIsExpanded(prev => !prev);

  return (
    <CardContext.Provider value={{ isExpanded, toggle }}>
      <motion.div layout className="card-claymorphic">
        {children}
      </motion.div>
    </CardContext.Provider>
  );
};

Card.Header = ({ children }: { children: ReactNode }) => {
  const { toggle } = useContext(CardContext);
  return <div onClick={toggle}>{children}</div>;
};

Card.Content = ({ children }: { children: ReactNode }) => {
  const { isExpanded } = useContext(CardContext);
  return isExpanded ? <motion.div>{children}</motion.div> : null;
};
```

**Why:** Flexible composition, encapsulated state, clear component relationships.

### Pattern 5: Custom Hooks for Reusable Logic
**What:** Extract component logic into hooks for reuse.

**When:** Logic used in multiple components (data fetching, animations, local state).

**Example:**
```typescript
// shared/hooks/useIntersectionAnimation.ts
export function useIntersectionAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const inView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (inView) {
      controls.start({ opacity: 1, y: 0 });
    }
  }, [inView, controls]);

  return {
    ref,
    animate: controls,
    initial: { opacity: 0, y: 50 }
  };
}

// Usage
function FeatureSection() {
  const animation = useIntersectionAnimation();
  return <motion.div {...animation}>Content</motion.div>;
}
```

**Why:** DRY principle, testable logic, easier to maintain.

### Pattern 6: Error Boundaries for Resilience
**What:** Catch rendering errors, show fallback UI.

**When:** Wrap route components, 3D canvas, async boundaries.

**Example:**
```typescript
// shared/components/ErrorBoundary.tsx
export class ErrorBoundary extends Component<Props, State> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logger.error('Component error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <Suspense fallback={<Loading />}>
    <Canvas>
      <Scene />
    </Canvas>
  </Suspense>
</ErrorBoundary>
```

**Why:** Prevents full app crashes, better UX, easier debugging.

### Pattern 7: Lazy Loading + Code Splitting
**What:** Dynamic imports for routes and heavy components.

**When:** 3D components, routes, large feature modules.

**Example:**
```typescript
// App.tsx
const SearchPage = lazy(() => import('./pages/SearchPage'));
const TrendingPage = lazy(() => import('./pages/TrendingPage'));
const ThreeExperience = lazy(() => import('./features/three-experience/ThreeExperience'));

// Routes
<Suspense fallback={<PageLoader />}>
  <Routes>
    <Route path="/search" element={<SearchPage />} />
    <Route path="/trending" element={<TrendingPage />} />
    <Route path="/3d" element={<ThreeExperience />} />
  </Routes>
</Suspense>
```

**Why:** Faster initial load, better performance, pay-as-you-go bundle size.

### Pattern 8: Progressive Enhancement for 3D
**What:** Detect device capabilities, gracefully degrade.

**When:** React Three Fiber features, complex animations.

**Example:**
```typescript
// shared/hooks/useDeviceCapabilities.ts
export function useDeviceCapabilities() {
  const [capabilities, setCapabilities] = useState({
    webgl: false,
    gpu: 'low' as 'low' | 'medium' | 'high',
    reducedMotion: false
  });

  useEffect(() => {
    const canvas = document.createElement('canvas');
    const webgl = !!canvas.getContext('webgl2');
    const gpu = detectGPUTier();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    setCapabilities({ webgl, gpu, reducedMotion });
  }, []);

  return capabilities;
}

// Usage
function App() {
  const { webgl, gpu } = useDeviceCapabilities();

  return (
    <>
      {webgl && gpu !== 'low' ? (
        <ThreeExperience quality={gpu} />
      ) : (
        <FallbackExperience />
      )}
    </>
  );
}
```

**Why:** Better accessibility, works on low-end devices, respects user preferences.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Creating Objects in Render/Frame Loops
**What goes wrong:** New Vector3, Color, or Material objects created every frame causes garbage collection pauses, frame drops.

**Why it happens:** Coming from React mindset, not understanding Three.js performance.

**Consequences:** Poor 3D performance, janky animations, high memory usage.

**Prevention:**
```typescript
// BAD
function Mesh() {
  useFrame(() => {
    mesh.current.position.copy(new THREE.Vector3(0, Math.sin(time), 0));
  });
}

// GOOD
function Mesh() {
  const tempVec = useMemo(() => new THREE.Vector3(), []);
  useFrame((state) => {
    tempVec.set(0, Math.sin(state.clock.elapsedTime), 0);
    mesh.current.position.copy(tempVec);
  });
}
```

**Detection:** Use React DevTools Profiler, check frame rate drops in Chrome DevTools Performance.

### Anti-Pattern 2: Storing Everything in Zustand
**What goes wrong:** Putting transient UI state (hover, focus, form input) in global store causes unnecessary re-renders.

**Why it happens:** Overuse of global state, not understanding when to use local state.

**Consequences:** Performance issues, harder debugging, state logic spread across files.

**Prevention:**
```typescript
// BAD
const useStore = create((set) => ({
  isHovered: false,
  setHovered: (value) => set({ isHovered: value })
}));

// GOOD
function Component() {
  const [isHovered, setHovered] = useState(false);
  return <div onMouseEnter={() => setHovered(true)} />;
}
```

**Detection:** Check if state is used by multiple distant components. If not, keep it local.

### Anti-Pattern 3: Heavy Context Values Without Memoization
**What goes wrong:** Context provider re-renders all consumers on every value change, even if individual consumer doesn't use changed value.

**Why it happens:** Not memoizing context value, putting too much in one context.

**Consequences:** Severe performance issues, unnecessary re-renders across app.

**Prevention:**
```typescript
// BAD
<ThemeContext.Provider value={{ theme, setTheme, isDark: theme === 'dark' }}>

// GOOD
const value = useMemo(
  () => ({ theme, setTheme, isDark: theme === 'dark' }),
  [theme]
);
<ThemeContext.Provider value={value}>
```

**Detection:** Use React DevTools Profiler, look for cascading re-renders.

### Anti-Pattern 4: Blocking Main Thread with Synchronous Operations
**What goes wrong:** Large data transformations, image processing, complex calculations on main thread freeze UI.

**Why it happens:** Not leveraging Web Workers, doing too much in render.

**Consequences:** Janky scrolling, delayed interactions, poor UX.

**Prevention:**
```typescript
// BAD
const processedMovies = movies.map(movie => {
  return complexTransformation(movie); // Blocks for 200ms
});

// GOOD
const [processedMovies, setProcessedMovies] = useState([]);
useEffect(() => {
  const worker = new Worker(new URL('./processor.worker.ts', import.meta.url));
  worker.postMessage(movies);
  worker.onmessage = (e) => setProcessedMovies(e.data);
  return () => worker.terminate();
}, [movies]);
```

**Detection:** Chrome DevTools Performance tab, look for long tasks (>50ms).

### Anti-Pattern 5: Not Handling Service Worker Updates
**What goes wrong:** Users stuck on old version, cache conflicts, stale content.

**Why it happens:** Default Workbox config, not implementing update flow.

**Consequences:** Users see outdated UI, bugs from version mismatch.

**Prevention:**
```typescript
// services/pwa/update-manager.ts
export function usePWAUpdate() {
  const [needRefresh, setNeedRefresh] = useState(false);

  useEffect(() => {
    const updateSW = registerSW({
      onNeedRefresh() {
        setNeedRefresh(true);
      },
      onOfflineReady() {
        console.log('App ready to work offline');
      }
    });

    if (needRefresh) {
      // Show update prompt
      updateSW(true); // Force update
    }
  }, [needRefresh]);
}
```

**Detection:** Test by deploying new version, check if update prompt appears.

### Anti-Pattern 6: Mixing Imperative and Declarative Styles
**What goes wrong:** Using refs to manipulate DOM directly instead of state, bypassing React's reconciliation.

**Why it happens:** Coming from vanilla JS background, not understanding React paradigm.

**Consequences:** Bugs from out-of-sync state, harder to debug, breaks React DevTools.

**Prevention:**
```typescript
// BAD
const divRef = useRef<HTMLDivElement>(null);
const show = () => divRef.current!.style.display = 'block';

// GOOD
const [isVisible, setVisible] = useState(false);
return <div style={{ display: isVisible ? 'block' : 'none' }} />;
```

**Detection:** Search codebase for `.style.`, `.classList.`, `.innerHTML`.

### Anti-Pattern 7: Over-Animating
**What goes wrong:** Too many simultaneous animations, animating on scroll every frame, animating expensive properties (width, height).

**Why it happens:** Excitement about Framer Motion, not understanding performance costs.

**Consequences:** Janky animations, high CPU usage, poor mobile performance.

**Prevention:**
```typescript
// BAD
<motion.div animate={{ width: '100%', height: '500px' }} />

// GOOD (use transforms)
<motion.div animate={{ scale: 1.2, x: 100 }} />

// BAD (animating every scroll frame)
useScroll({
  onChange: ({ scrollY }) => setPosition(scrollY * 0.5) // Re-renders every scroll frame
});

// GOOD (use transform directly)
const { scrollYProgress } = useScroll();
const y = useTransform(scrollYProgress, [0, 1], [0, -500]);
<motion.div style={{ y }} />
```

**Detection:** Check for layout thrashing in Chrome DevTools Performance, look for forced reflows.

### Anti-Pattern 8: Not Optimizing API Calls
**What goes wrong:** Duplicate requests, no debouncing on search, fetching on every render.

**Why it happens:** Not understanding React's lifecycle, missing useMemo/useCallback.

**Consequences:** High API costs, rate limiting, slow UX, wasted bandwidth.

**Prevention:**
```typescript
// BAD
function SearchResults({ query }) {
  const results = tmdbService.search(query); // Fetches every render
}

// GOOD
function SearchResults({ query }) {
  const debouncedQuery = useDebounce(query, 500);
  const { data } = useQuery(['search', debouncedQuery], () =>
    tmdbService.search(debouncedQuery),
    { enabled: debouncedQuery.length > 2 }
  );
}
```

**Detection:** Network tab shows duplicate requests, rate limit errors.

## Scalability Considerations

| Concern | At 100 users | At 10K users | At 1M users |
|---------|--------------|--------------|-------------|
| **Bundle Size** | Single bundle OK (~500KB) | Code splitting by route (~200KB initial) | Aggressive splitting, route-based + component-based (~150KB initial) |
| **API Caching** | LocalStorage sufficient | IndexedDB with TTL strategy | IndexedDB + Service Worker cache, stale-while-revalidate |
| **State Management** | Zustand only | Zustand + React Query for server state | Add Zustand slices pattern, consider persistence middleware |
| **3D Assets** | Inline GLB files | CDN hosting, lazy load on route | CDN + progressive loading, LOD, compressed textures (Draco, KTX2) |
| **Image Optimization** | Vite's built-in optimization | Responsive images, AVIF/WebP | CDN with automatic format detection, lazy loading, blur-up placeholders |
| **Analytics** | Basic client-side tracking | Add performance monitoring (Web Vitals) | Full observability: RUM, error tracking, performance budgets |
| **Service Worker** | Precache shell only | Precache + runtime caching strategies | Precache + runtime + background sync + push notifications |
| **Error Handling** | Console logs | Error boundaries + local logging | Sentry/Rollbar integration, user-facing error recovery UI |

## Build Order Implications

### Phase 1: Foundation (No External Dependencies)
**What to build:**
1. Vite + React + TypeScript setup
2. Project structure (folders, aliases)
3. Theme system (CSS variables, ThemeProvider, basic claymorphism styles)
4. Basic UI components (Button, Card, Modal)
5. Routing setup (React Router)

**Why first:** Establishes conventions, provides building blocks for all features.

**Blockers:** None - can start immediately.

**Estimated complexity:** Low

---

### Phase 2: Core Data Layer (Foundation + Storage)
**What to build:**
1. API service layer (client.ts, error handling)
2. TMDB service (search, details, trending)
3. OMDB service (additional metadata)
4. Storage service (IndexedDB setup)
5. Zustand store structure (slices pattern)
6. Basic error boundaries

**Why second:** Features need data layer, but data layer doesn't need UI polish.

**Depends on:** Phase 1 (project structure, types)

**Estimated complexity:** Medium

---

### Phase 3: Core Features - No Animation (Foundation + Data)
**What to build:**
1. Search feature (SearchBar, SearchResults, filters)
2. Movie detail view
3. Trending section
4. Random discovery
5. Dinner Time mode
6. Free YouTube movies section

**Why third:** Validates data layer, provides testable features before adding visual complexity.

**Depends on:** Phase 1 (UI components), Phase 2 (API services, state)

**Estimated complexity:** Medium-High

---

### Phase 4: PWA Infrastructure (Core Features + Storage)
**What to build:**
1. Vite PWA plugin configuration
2. Service worker setup (Workbox)
3. Offline detection
4. Update notification UI
5. Manifest configuration
6. IndexedDB caching strategy
7. Background sync (optional)

**Why fourth:** Features exist and work, now make them work offline.

**Depends on:** Phase 2 (storage service), Phase 3 (features to cache)

**Estimated complexity:** Medium

---

### Phase 5: Animation Layer - 2D (Core Features + Theme)
**What to build:**
1. Framer Motion setup
2. Page transitions (AnimatePresence)
3. Scroll-triggered animations (fade-in, parallax)
4. Micro-interactions (hover, click, focus states)
5. Layout animations (grid reflows, list reordering)
6. Loading skeletons with motion

**Why fifth:** Features exist and work, animations enhance but don't block core functionality.

**Depends on:** Phase 1 (theme system), Phase 3 (features to animate)

**Estimated complexity:** Medium

---

### Phase 6: Bento Grid Layout (Core Features + Animation)
**What to build:**
1. Bento grid component
2. react-grid-layout integration
3. Responsive breakpoints
4. Grid item components
5. Drag-and-drop (optional)
6. Layout persistence

**Why sixth:** Requires understanding of feature components, benefits from Framer Motion layout animations.

**Depends on:** Phase 3 (features to display in grid), Phase 5 (layout animations)

**Estimated complexity:** Medium

---

### Phase 7: 3D Experience (All Above + Performance)
**What to build:**
1. React Three Fiber setup
2. 3D scene components
3. Models, materials, lighting
4. Camera controls
5. DOM ↔ 3D coordination
6. Performance optimizations (LOD, instancing, on-demand rendering)
7. Device capability detection
8. Fallback experience

**Why seventh:** Most complex, most performance-intensive, should be additive to working app.

**Depends on:** Phase 1 (structure), Phase 5 (coordination with 2D animations), Phase 6 (integration points)

**Estimated complexity:** High

---

### Phase 8: Polish & Optimization (All Above)
**What to build:**
1. Animated theme switching (view-transition API)
2. Performance optimizations (code splitting, tree shaking)
3. Accessibility improvements (ARIA, keyboard nav, screen reader)
4. SEO optimizations (meta tags, OG images, sitemap)
5. Analytics integration
6. Error monitoring (Sentry)
7. Web Vitals tracking
8. Production build optimization
9. GitHub Pages deployment

**Why last:** Requires complete feature set to optimize, polish makes sense when core is solid.

**Depends on:** All previous phases

**Estimated complexity:** Medium

---

### Dependency Graph

```
Phase 1 (Foundation)
    ↓
Phase 2 (Data Layer)
    ↓
Phase 3 (Core Features)
    ↓
  ├─→ Phase 4 (PWA)
  │       ↓
  └─→ Phase 5 (2D Animation)
          ↓
      Phase 6 (Bento Grid)
          ↓
      Phase 7 (3D Experience)
          ↓
      Phase 8 (Polish)
```

### Parallel Work Opportunities

- **Phase 4 (PWA) and Phase 5 (Animation)** can be done in parallel by different developers
- **Phase 6 (Bento) and Phase 7 (3D)** can start in parallel if Phase 5 is complete
- **UI components** in Phase 1 can be built progressively as needed by features

### Critical Path

The longest dependency chain is:
1. Foundation → 2. Data Layer → 3. Core Features → 5. Animation → 6. Bento Grid → 7. 3D → 8. Polish

Phases 4 (PWA) and 5 (Animation) are the main branching point where work can be parallelized.

## Technology Integration Notes

### Vite + React + TypeScript
- **Why this stack:** Vite provides fastest HMR for development, native ESM, optimized production builds
- **Path aliases:** Configure `@/` prefix for cleaner imports
- **Environment variables:** Use `.env.local` for API keys, `import.meta.env.VITE_*` for access
- **Build output:** Static files deploy directly to GitHub Pages

### React Three Fiber Performance
- **Frame loop:** Use `frameloop="demand"` for static scenes, default for animated scenes
- **Instancing:** Use `<Instances>` from drei for repeated geometry (stars, particles)
- **LOD:** Use `<Detailed>` component for complex models, swap high/low poly based on distance
- **Suspend:** Wrap assets in `<Suspense>` with fallback loaders
- **Portals:** Use `createPortal` to render 3D scenes in multiple DOM locations

### Framer Motion Best Practices
- **Variants:** Define animation states as objects, reuse across components
- **Layout animations:** Use `layout` prop for automatic FLIP animations
- **Shared layout:** Use `layoutId` for morphing between components
- **Scroll:** Use `useScroll` + `useTransform` for parallax without re-renders
- **Gesture:** Use `whileHover`, `whileTap` for micro-interactions

### Claymorphism Implementation
- **Shadows:** Use multiple box-shadows (outer + inner) for depth
- **Border radius:** Generous (16-32px) for organic feel
- **Colors:** Pastel backgrounds with enough contrast for accessibility
- **Borders:** Thick (2-4px) semi-transparent borders
- **Gradients:** Subtle background gradients for dimension

### State Management Strategy
- **Zustand for:**
  - Movies data (search results, trending, details)
  - User preferences (theme, filters, favorites)
  - App state (loading, error, online status)
- **Context for:**
  - Theme (stable, infrequent changes)
  - Modals (UI state)
- **Local state for:**
  - Form inputs
  - Hover/focus states
  - Temporary UI flags

### PWA Configuration
- **Workbox strategies:**
  - `NetworkFirst`: API requests
  - `CacheFirst`: Images, fonts, static assets
  - `StaleWhileRevalidate`: JSON data
- **Update flow:** Prompt user with "New version available" banner
- **Offline detection:** Use `navigator.onLine` + service worker events
- **Manifest:** 512x512 icon, start_url, display: standalone

## Sources

### React Three Fiber Architecture
- [React Three Fiber Documentation](https://r3f.docs.pmnd.rs/)
- [React Three Fiber Scaling Performance](https://r3f.docs.pmnd.rs/advanced/scaling-performance)
- [100 Three.js Tips That Actually Improve Performance (2026)](https://www.utsubo.com/blog/threejs-best-practices-100-tips)
- [React Three Fiber vs. Three.js in 2026](https://graffersid.com/react-three-fiber-vs-three-js/)
- [React Three Fiber Canvas Integration](https://gracious-keller-98ef35.netlify.app/docs/api/canvas/)

### Framer Motion Integration
- [Motion — JavaScript & React animation library](https://motion.dev/)
- [Motion for React Three Fiber](https://motion.dev/docs/react-three-fiber)
- [Framer Motion React Animations | Refine](https://refine.dev/blog/framer-motion/)
- [Beyond Eye Candy: Top 7 React Animation Libraries for Real-World Apps in 2026](https://www.syncfusion.com/blogs/post/top-react-animation-libraries)

### React PWA Architecture
- [Making a Progressive Web App | Create React App](https://create-react-app.dev/docs/making-a-progressive-web-app/)
- [Building a Progressive Web App with React](https://codewave.com/insights/react-progressive-web-app-building/)
- [Vite PWA Plugin - GitHub](https://github.com/vite-pwa/vite-plugin-pwa)
- [Workbox | Vite PWA](https://vite-pwa-org.netlify.app/workbox/)
- [React PWA Examples | Vite PWA](https://vite-pwa-org.netlify.app/examples/react/)

### Component Architecture Patterns
- [React Stack Patterns](https://www.patterns.dev/react/react-2026/)
- [React Architecture Patterns and Best Practices for 2026](https://www.bacancytechnology.com/blog/react-architecture-patterns-and-best-practices)
- [React & TypeScript: 10 patterns for writing better code](https://blog.logrocket.com/react-typescript-10-patterns-writing-better-code/)
- [Thinking in React – React](https://react.dev/learn/thinking-in-react)

### Bento Grid Implementation
- [Bento Grid | React Components & Templates](https://magicui.design/docs/components/bento-grid)
- [React Bento - GitHub](https://github.com/anbrela/react-bento)
- [Bento Grid | Aceternity UI Components](https://ui.aceternity.com/components/bento-grid)

### Claymorphism Design
- [React Claymorphism Component - GitHub](https://github.com/okanselami/react-claymorphism)
- [Claymorphism Component For React.js](https://reactjsexample.com/claymorphism-component-for-react-js/)
- [Claymorphism | Design Style Bringing UI into the 3D World](https://medium.com/@pann.tech/claymorphism-design-style-bringing-ui-into-the-3d-world-c6f8471853e5)

### Theme System Architecture
- [Dark Mode in React: A Scalable Theme System with Tailwind](https://medium.com/@roman_fedyskyi/dark-mode-in-react-a-scalable-theme-system-with-tailwind-d14e9c1afd1a)
- [Easy Dark Mode (and Multiple Color Themes!) in React](https://css-tricks.com/easy-dark-mode-and-multiple-color-themes-in-react/)
- [Build a Persistent Light / Dark Theme in React](https://medium.com/javarevisited/build-a-persistent-light-dark-theme-in-react-a10e1c8b220f)

### Vite + TypeScript Best Practices
- [Complete Guide to Setting Up React with TypeScript and Vite (2026)](https://medium.com/@robinviktorsson/complete-guide-to-setting-up-react-with-typescript-and-vite-2025-468f6556aaf2)
- [How to Set Up a Production-Ready React Project with TypeScript and Vite](https://oneuptime.com/blog/post/2026-01-08-react-typescript-vite-production-setup/view)
- [Best Practices for React.js with Vite and TypeScript](https://medium.com/@taedmonds/best-practices-for-react-js-with-vite-and-typescript-what-i-use-and-why-f4482558ed89)

### API Client Architecture
- [Path To A Clean(er) React Architecture - API Layer](https://profy.dev/article/react-architecture-api-layer-and-fetch-functions)
- [Why You Need an API Layer and How To Build It in React](https://www.angularminds.com/blog/why-you-need-an-api-layer-and-how-to-build-it-in-react)
- [bulletproof-react API Layer](https://github.com/alan2207/bulletproof-react/blob/master/docs/api-layer.md)

### State Management (Zustand vs Context)
- [Redux vs Zustand vs Context API in 2026](https://medium.com/@sparklewebhelp/redux-vs-zustand-vs-context-api-in-2026-7f90a2dc3439)
- [How to Choose Between Context API, Redux, and Zustand for Your React App](https://oneuptime.com/blog/post/2026-01-15-choose-react-state-management-context-redux-zustand/view)
- [React State Management: Why Context API Might Be Causing Performance Issues](https://medium.com/@bloodturtle/react-state-management-why-context-api-might-be-causing-performance-issues-and-how-zustand-can-ec7718103a71)

### Component Composition & Data Flow
- [React Design Patterns for 2026 Projects](https://www.sayonetech.com/blog/react-design-patterns/)
- [Composition vs Props in React: A Detailed Guide](https://medium.com/@ignatovich.dm/composition-vs-props-in-react-a-detailed-guide-f9034394cc7a)
- [Essential React Design Patterns: Guide for 2026](https://trio.dev/essential-react-design-patterns/)

### Movie App Architecture
- [How to Build a Scalable Movie Browser App using React and Redux](https://medium.com/@levifuller/how-to-build-a-scalable-movie-browser-app-using-react-and-redux-in-visual-studio-code-dea8bfb3eabe)
- [How to Structure and Organize a React Application](https://www.taniarascia.com/react-architecture-directory-structure/)
- [React Folder Structure in 5 Steps](https://www.robinwieruch.de/react-folder-structure/)
