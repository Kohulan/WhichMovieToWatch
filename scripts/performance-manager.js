/**
 * Performance Manager - Optimizes loading, monitors metrics, and manages resources
 */

class PerformanceManager {
  constructor() {
    this.metrics = {};
    this.init();
  }

  init() {
    // Inject critical CSS first
    this.injectCriticalCSS();
    
    // Add resource hints
    this.addResourceHints();
    
    // Setup performance monitoring
    this.setupPerformanceMonitoring();
    
    // Defer non-critical resources
    this.deferNonCriticalResources();
    
    // Optimize animations
    this.optimizeAnimations();
    
    // Setup memory management
    this.setupMemoryManagement();
  }

  injectCriticalCSS() {
    // Critical CSS for above-the-fold content
    const criticalCSS = `
      :root {
        --background: #0E0E12;
        --text: #F4F4F5;
        --accent: #FF4545;
        --card-bg: rgba(17, 24, 39, 0.8);
      }
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        margin: 0;
        background: var(--background);
        color: var(--text);
        font-family: 'Space Grotesk', -apple-system, sans-serif;
        min-height: 100vh;
      }
      
      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 1rem;
      }
      
      .loading {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 300px;
        flex-direction: column;
        gap: 1rem;
      }
      
      .loading i {
        font-size: 3rem;
        color: var(--accent);
        animation: pulse 1.5s ease-in-out infinite;
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 0.5; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.1); }
      }
      
      .movie-card {
        background: var(--card-bg);
        border-radius: 20px;
        overflow: hidden;
        backdrop-filter: blur(10px);
        transition: transform 0.3s ease;
      }
      
      .header {
        text-align: center;
        padding: 2rem 0;
      }
      
      h1 {
        font-size: clamp(1.5rem, 5vw, 3rem);
        background: linear-gradient(135deg, #FF4545, #FF8A45);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      button {
        cursor: pointer;
        transition: all 0.3s ease;
      }
      
      button:hover {
        transform: translateY(-2px);
      }
      
      @media (prefers-reduced-motion: reduce) {
        * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
    `;

    const style = document.createElement('style');
    style.id = 'critical-css';
    style.textContent = criticalCSS;
    document.head.insertBefore(style, document.head.firstChild);
  }

  addResourceHints() {
    const hints = [
      // DNS Prefetch for third-party domains
      { rel: 'dns-prefetch', href: 'https://api.themoviedb.org' },
      { rel: 'dns-prefetch', href: 'https://image.tmdb.org' },
      { rel: 'dns-prefetch', href: 'https://www.omdbapi.com' },
      { rel: 'dns-prefetch', href: 'https://cdnjs.cloudflare.com' },
      { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' },
      { rel: 'dns-prefetch', href: 'https://fonts.gstatic.com' },
      
      // Preconnect for critical domains
      { rel: 'preconnect', href: 'https://api.themoviedb.org', crossorigin: 'anonymous' },
      { rel: 'preconnect', href: 'https://image.tmdb.org', crossorigin: 'anonymous' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
      
      // Preload critical fonts
      { rel: 'preload', href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&display=swap', as: 'style' }
    ];

    hints.forEach(hint => {
      // Check if hint already exists
      const selector = `link[rel="${hint.rel}"][href="${hint.href}"]`;
      if (!document.querySelector(selector)) {
        const link = document.createElement('link');
        Object.assign(link, hint);
        document.head.appendChild(link);
      }
    });
  }

  setupPerformanceMonitoring() {
    // Monitor page load metrics
    if (window.performance && performance.timing) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const timing = performance.timing;
          const metrics = {
            domContentLoaded: timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart,
            loadComplete: timing.loadEventEnd - timing.loadEventStart,
            domInteractive: timing.domInteractive - timing.navigationStart,
            pageLoadTime: timing.loadEventEnd - timing.navigationStart,
            dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
            tcpConnect: timing.connectEnd - timing.connectStart,
            request: timing.responseStart - timing.requestStart,
            response: timing.responseEnd - timing.responseStart,
            domProcessing: timing.domComplete - timing.domLoading
          };
          
          this.metrics.loadMetrics = metrics;
          console.log('Page Load Metrics:', metrics);
          this.reportMetrics('page_load', metrics);
        }, 0);
      });
    }

    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      try {
        // Long task observer
        const longTaskObserver = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              console.warn('Long task detected:', {
                duration: entry.duration,
                startTime: entry.startTime,
                name: entry.name
              });
              this.reportMetrics('long_task', {
                duration: entry.duration,
                startTime: entry.startTime
              });
            }
          }
        });
        
        // Only observe if supported
        if (PerformanceObserver.supportedEntryTypes?.includes('longtask')) {
          longTaskObserver.observe({ entryTypes: ['longtask'] });
        }

        // Layout shift observer
        const clsObserver = new PerformanceObserver(list => {
          let cls = 0;
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              cls += entry.value;
            }
          }
          this.metrics.cls = cls;
        });
        
        if (PerformanceObserver.supportedEntryTypes?.includes('layout-shift')) {
          clsObserver.observe({ entryTypes: ['layout-shift'] });
        }

        // Largest contentful paint observer
        const lcpObserver = new PerformanceObserver(list => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
          console.log('LCP:', this.metrics.lcp);
        });
        
        if (PerformanceObserver.supportedEntryTypes?.includes('largest-contentful-paint')) {
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        }

        // First input delay
        const fidObserver = new PerformanceObserver(list => {
          const entries = list.getEntries();
          if (entries.length > 0) {
            const firstInput = entries[0];
            this.metrics.fid = firstInput.processingStart - firstInput.startTime;
            console.log('FID:', this.metrics.fid);
            fidObserver.disconnect();
          }
        });
        
        if (PerformanceObserver.supportedEntryTypes?.includes('first-input')) {
          fidObserver.observe({ entryTypes: ['first-input'] });
        }
      } catch (e) {
        console.log('Performance monitoring not fully supported');
      }
    }

    // Report metrics after page load
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.reportAllMetrics();
      }, 5000);
    });
  }

  deferNonCriticalResources() {
    // Defer non-critical CSS
    const deferredStyles = [
      '/css/professional-animations.css',
      '/css/visual-enhancements.css'
    ];

    deferredStyles.forEach(href => {
      const existingLink = document.querySelector(`link[href="${href}"]`);
      if (existingLink && !existingLink.dataset.deferred) {
        // Mark as deferred to avoid reprocessing
        existingLink.dataset.deferred = 'true';
        
        // Create a new link with media="print" to defer loading
        const deferredLink = document.createElement('link');
        deferredLink.rel = 'stylesheet';
        deferredLink.href = href;
        deferredLink.media = 'print';
        deferredLink.onload = function() { 
          this.media = 'all';
          existingLink.remove();
        };
        
        // Replace existing link
        existingLink.parentNode.insertBefore(deferredLink, existingLink);
      }
    });

    // Lazy load heavy scripts
    this.setupLazyScriptLoading();
  }

  setupLazyScriptLoading() {
    // Define scripts that should be lazy loaded
    const lazyScripts = [
      {
        trigger: () => document.querySelector('#searchModal'),
        scripts: ['/scripts/search.js'],
        event: 'click'
      },
      {
        trigger: () => document.querySelector('#trendingMovies'),
        scripts: ['/scripts/trending.js'],
        event: 'scroll',
        threshold: 0.5
      }
    ];

    lazyScripts.forEach(config => {
      const element = config.trigger();
      if (!element) return;

      if (config.event === 'scroll') {
        const observer = new IntersectionObserver(entries => {
          if (entries[0].isIntersecting) {
            this.loadScripts(config.scripts);
            observer.disconnect();
          }
        }, { threshold: config.threshold || 0.1 });
        observer.observe(element);
      } else {
        element.addEventListener(config.event, () => {
          this.loadScripts(config.scripts);
        }, { once: true });
      }
    });
  }

  loadScripts(scripts) {
    scripts.forEach(src => {
      if (!document.querySelector(`script[src="${src}"]`)) {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        document.body.appendChild(script);
      }
    });
  }

  optimizeAnimations() {
    // Reduce animation complexity on low-end devices
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (reducedMotion) {
      document.body.classList.add('reduced-motion');
      return;
    }

    // Check device capabilities
    const memory = navigator.deviceMemory;
    const cores = navigator.hardwareConcurrency;
    
    if ((memory && memory <= 4) || (cores && cores <= 2)) {
      document.body.classList.add('low-performance-device');
      
      // Reduce animation complexity
      const style = document.createElement('style');
      style.textContent = `
        .low-performance-device * {
          animation-duration: 0.2s !important;
          transition-duration: 0.2s !important;
        }
        .low-performance-device .particle,
        .low-performance-device .complex-animation {
          display: none !important;
        }
      `;
      document.head.appendChild(style);
    }
  }

  setupMemoryManagement() {
    // Monitor memory usage if available
    if (performance.memory) {
      setInterval(() => {
        const memoryInfo = {
          usedJSHeapSize: Math.round(performance.memory.usedJSHeapSize / 1048576),
          totalJSHeapSize: Math.round(performance.memory.totalJSHeapSize / 1048576),
          jsHeapSizeLimit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
        };
        
        const usagePercent = (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100;
        
        if (usagePercent > 80) {
          console.warn('High memory usage detected:', memoryInfo);
          this.performMemoryCleanup();
        }
      }, 30000); // Check every 30 seconds
    }
  }

  performMemoryCleanup() {
    // Clear image cache if available
    if (window.imageOptimizer) {
      window.imageOptimizer.clearCache();
    }
    
    // Clear old API cache entries
    if (window.apiCache) {
      window.apiCache.cleanup();
    }
    
    // Force garbage collection if available (usually only in dev tools)
    if (window.gc) {
      window.gc();
    }
  }

  reportMetrics(category, data) {
    // Report to analytics if available
    if (window.gtag) {
      gtag('event', 'performance', {
        event_category: category,
        event_label: JSON.stringify(data),
        value: Math.round(data.duration || data.value || 0)
      });
    }
    
    // Store locally for debugging
    this.metrics[category] = data;
  }

  reportAllMetrics() {
    console.log('All Performance Metrics:', this.metrics);
    
    // Send comprehensive report
    if (window.analytics) {
      window.analytics.track('performance_report', this.metrics);
    }
  }

  // Public API
  getMetrics() {
    return this.metrics;
  }

  prefetchResources(urls) {
    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      document.head.appendChild(link);
    });
  }
}

// Initialize performance manager early
if (document.readyState === 'loading') {
  // Initialize critical performance optimizations immediately
  const manager = new PerformanceManager();
  window.performanceManager = manager;
} else {
  window.performanceManager = new PerformanceManager();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PerformanceManager;
}
