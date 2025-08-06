/**
 * Image Optimizer - Handles lazy loading, progressive loading, and network-aware optimization
 */

class ImageOptimizer {
  constructor() {
    this.imageCache = new Map();
    this.observer = null;
    this.pauseLoading = false;
    this.queuedImages = [];
    this.init();
  }

  init() {
    // Initialize Intersection Observer for lazy loading
    this.setupLazyLoading();
    
    // Setup progressive image loading
    this.setupProgressiveLoading();
    
    // Monitor network conditions
    this.monitorNetwork();
    
    // Setup image error handling
    this.setupErrorHandling();
  }

  setupLazyLoading() {
    const options = {
      root: null,
      rootMargin: '50px',
      threshold: 0.01
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.pauseLoading) {
          this.loadImage(entry.target);
        } else if (entry.isIntersecting && this.pauseLoading) {
          this.queuedImages.push(entry.target);
        }
      });
    }, options);

    // Observe all images with data-src
    this.observeImages();
  }

  observeImages() {
    document.querySelectorAll('img[data-src]').forEach(img => {
      // Add loading class
      img.classList.add('img-loading');
      
      // Set aspect ratio to prevent layout shift
      if (img.dataset.width && img.dataset.height) {
        const aspectRatio = img.dataset.height / img.dataset.width;
        img.style.aspectRatio = `${img.dataset.width} / ${img.dataset.height}`;
      }
      
      this.observer.observe(img);
    });
  }

  loadImage(img) {
    const src = img.dataset.src;
    const srcset = img.dataset.srcset;
    
    // Check cache first
    if (this.imageCache.has(src)) {
      this.applyImage(img, this.imageCache.get(src));
      return;
    }

    // Load appropriate image based on network
    const imageUrl = this.getOptimalImageUrl(src);
    
    // Create a new image element for preloading
    const tempImg = new Image();
    
    tempImg.onload = () => {
      this.imageCache.set(src, {
        src: imageUrl,
        srcset: srcset
      });
      this.applyImage(img, { src: imageUrl, srcset });
      this.observer.unobserve(img);
    };

    tempImg.onerror = () => {
      this.handleImageError(img, src);
    };

    tempImg.src = imageUrl;
    if (srcset) {
      tempImg.srcset = srcset;
    }
  }

  applyImage(img, imageData) {
    // Add fade-in animation
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.3s ease-in-out';
    
    img.src = imageData.src;
    if (imageData.srcset) {
      img.srcset = imageData.srcset;
    }
    
    // Remove loading class and fade in
    img.classList.remove('img-loading');
    img.classList.add('img-loaded');
    
    // Remove blur effect if present
    const wrapper = img.closest('.progressive-image-wrapper');
    if (wrapper) {
      const placeholder = wrapper.querySelector('.progressive-image-placeholder');
      if (placeholder) {
        placeholder.style.opacity = '0';
        setTimeout(() => placeholder.remove(), 300);
      }
    }
    
    requestAnimationFrame(() => {
      img.style.opacity = '1';
    });
  }

  getOptimalImageUrl(originalUrl) {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (!connection) return originalUrl;
    
    // Determine quality based on connection
    const effectiveType = connection.effectiveType;
    const saveData = connection.saveData;
    
    if (saveData || effectiveType === 'slow-2g' || effectiveType === '2g') {
      return this.getImageVariant(originalUrl, 'low');
    } else if (effectiveType === '3g') {
      return this.getImageVariant(originalUrl, 'medium');
    }
    
    return this.getImageVariant(originalUrl, 'high');
  }

  getImageVariant(url, quality) {
    // TMDB image URL manipulation
    if (url && url.includes('image.tmdb.org')) {
      const qualityMap = {
        'low': 'w185',
        'medium': 'w342',
        'high': 'w500',
        'original': 'original'
      };
      
      // Extract current size and replace
      const sizePattern = /\/w\d+\//;
      if (sizePattern.test(url)) {
        return url.replace(sizePattern, `/${qualityMap[quality]}/`);
      }
    }
    
    return url;
  }

  setupProgressiveLoading() {
    // Add blur placeholder for images
    document.querySelectorAll('img[data-src]').forEach(img => {
      // Skip if already wrapped
      if (img.closest('.progressive-image-wrapper')) return;
      
      // Create low quality placeholder
      const wrapper = document.createElement('div');
      wrapper.className = 'progressive-image-wrapper';
      
      // Only add placeholder for TMDB images
      if (img.dataset.src && img.dataset.src.includes('tmdb.org')) {
        const placeholder = document.createElement('div');
        placeholder.className = 'progressive-image-placeholder';
        
        // Use a very low quality version as background
        const lqipUrl = this.getLQIPUrl(img.dataset.src);
        placeholder.style.backgroundImage = `url(${lqipUrl})`;
        
        img.parentNode.insertBefore(wrapper, img);
        wrapper.appendChild(placeholder);
        wrapper.appendChild(img);
      } else {
        img.parentNode.insertBefore(wrapper, img);
        wrapper.appendChild(img);
      }
      
      img.classList.add('progressive-image-main');
    });
  }

  getLQIPUrl(url) {
    // Generate Low Quality Image Placeholder URL
    if (url && url.includes('image.tmdb.org')) {
      // Use w92 for tiny placeholder
      const sizePattern = /\/w\d+\//;
      if (sizePattern.test(url)) {
        return url.replace(sizePattern, '/w92/');
      }
    }
    return url;
  }

  monitorNetwork() {
    if ('connection' in navigator) {
      navigator.connection.addEventListener('change', () => {
        this.handleNetworkChange();
      });
    }
  }

  handleNetworkChange() {
    // Adjust image loading strategy based on new network conditions
    const connection = navigator.connection;
    
    if (connection.saveData || connection.effectiveType === 'slow-2g') {
      // Pause non-critical image loading
      this.pauseLoading = true;
      console.log('Image loading paused due to slow connection');
    } else {
      this.pauseLoading = false;
      // Resume loading queued images
      this.resumeLoading();
    }
  }

  resumeLoading() {
    if (this.queuedImages.length > 0) {
      console.log(`Resuming loading of ${this.queuedImages.length} queued images`);
      this.queuedImages.forEach(img => {
        this.loadImage(img);
      });
      this.queuedImages = [];
    }
  }

  setupErrorHandling() {
    // Global error handler for images
    document.addEventListener('error', (e) => {
      if (e.target.tagName === 'IMG') {
        this.handleImageError(e.target, e.target.src);
      }
    }, true);
  }

  handleImageError(img, originalSrc) {
    // Don't retry if already retried
    if (img.dataset.retried === 'true') {
      img.src = '/assets/images/placeholder-movie.png';
      img.classList.remove('img-loading');
      img.classList.add('img-error');
      return;
    }

    // Try a different quality
    const currentQuality = this.getCurrentQuality(originalSrc);
    const fallbackQuality = this.getFallbackQuality(currentQuality);
    
    if (fallbackQuality && originalSrc.includes('tmdb.org')) {
      img.dataset.retried = 'true';
      const fallbackUrl = this.getImageVariant(originalSrc, fallbackQuality);
      img.src = fallbackUrl;
    } else {
      // Use placeholder
      img.src = '/assets/images/placeholder-movie.png';
      img.classList.remove('img-loading');
      img.classList.add('img-error');
    }
  }

  getCurrentQuality(url) {
    if (!url || !url.includes('tmdb.org')) return null;
    
    const sizeMatch = url.match(/\/w(\d+)\//);
    if (!sizeMatch) return null;
    
    const size = parseInt(sizeMatch[1]);
    if (size <= 185) return 'low';
    if (size <= 342) return 'medium';
    return 'high';
  }

  getFallbackQuality(currentQuality) {
    const fallbackMap = {
      'high': 'medium',
      'medium': 'low',
      'low': null
    };
    return fallbackMap[currentQuality];
  }

  // Public API for manual image optimization
  optimizeImage(img) {
    if (img.dataset.src) {
      this.loadImage(img);
    }
  }

  // Clear cache if needed
  clearCache() {
    this.imageCache.clear();
    console.log('Image cache cleared');
  }

  // Get cache statistics
  getCacheStats() {
    return {
      size: this.imageCache.size,
      entries: Array.from(this.imageCache.keys())
    };
  }
}

// Add CSS for progressive image loading
const styles = `
  .progressive-image-wrapper {
    position: relative;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.03);
    border-radius: inherit;
  }

  .progressive-image-placeholder {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    filter: blur(20px);
    transform: scale(1.1);
    transition: opacity 0.3s ease-in-out;
    z-index: 1;
  }

  .progressive-image-main {
    position: relative;
    z-index: 2;
    display: block;
    width: 100%;
    height: auto;
  }

  .img-loading {
    background: linear-gradient(90deg, 
      rgba(255, 255, 255, 0.05) 25%, 
      rgba(255, 255, 255, 0.1) 50%, 
      rgba(255, 255, 255, 0.05) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }

  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  .img-loaded {
    animation: fadeIn 0.3s ease-in-out;
  }

  .img-error {
    opacity: 0.5;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

// Inject styles
if (!document.querySelector('#image-optimizer-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'image-optimizer-styles';
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.imageOptimizer = new ImageOptimizer();
  });
} else {
  window.imageOptimizer = new ImageOptimizer();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ImageOptimizer;
}
