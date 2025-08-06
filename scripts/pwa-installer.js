/**
 * PWA Installer - Handles Progressive Web App installation
 */

class PWAInstaller {
  constructor() {
    this.deferredPrompt = null;
    this.installButton = null;
    this.isInstalled = false;
    this.init();
  }

  init() {
    // Check if already installed
    this.checkIfInstalled();

    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      
      // Show install promotion after a delay if not dismissed recently
      if (!this.wasRecentlyDismissed()) {
        setTimeout(() => this.showInstallPromotion(), 2000);
      }
      
      // Show install button in UI
      this.showInstallButton();
    });

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      this.hideInstallPromotion();
      this.trackInstallation();
      this.isInstalled = true;
      this.showSuccessMessage();
    });

    // Register service worker
    this.registerServiceWorker();

    // Check for iOS
    this.checkiOS();
  }

  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('Service Worker registered:', registration);

        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60000); // Check every minute

        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.showUpdateNotification();
            }
          });
        });
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  showInstallPromotion() {
    if (this.isInstalled || document.querySelector('.pwa-install-banner')) {
      return;
    }

    // Create install banner
    const banner = document.createElement('div');
    banner.className = 'pwa-install-banner';
    banner.innerHTML = `
      <div class="pwa-install-content">
        <button class="pwa-close-btn" aria-label="Close">×</button>
        <div class="pwa-install-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
        </div>
        <div class="pwa-install-text">
          <h3>Install Which Movie To Watch</h3>
          <p>Install our app for the best experience - works offline too!</p>
        </div>
        <div class="pwa-install-actions">
          <button class="pwa-install-btn" id="installBtn">
            Install App
          </button>
          <button class="pwa-dismiss-btn" id="dismissBtn">
            Maybe Later
          </button>
        </div>
      </div>
    `;

    // Add styles
    this.addInstallStyles();

    // Add to page
    document.body.appendChild(banner);

    // Animate in
    setTimeout(() => {
      banner.classList.add('show');
    }, 100);

    // Add event listeners
    document.getElementById('installBtn').addEventListener('click', () => {
      this.installApp();
    });

    document.getElementById('dismissBtn').addEventListener('click', () => {
      this.hideInstallPromotion();
      this.setDismissed();
    });

    document.querySelector('.pwa-close-btn').addEventListener('click', () => {
      this.hideInstallPromotion();
      this.setDismissed();
    });
  }

  showInstallButton() {
    // Add install button after trending movies section
    const trendingSection = document.getElementById('trendingMovies');
    if (trendingSection && !document.querySelector('.pwa-install-section')) {
      const installSection = document.createElement('div');
      installSection.className = 'pwa-install-section';
      installSection.innerHTML = `
        <button class="pwa-main-install-btn" id="mainInstallBtn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          <span>Install App for Offline Access</span>
        </button>
        <p class="pwa-install-text">Works offline and provides a better experience!</p>
      `;
      
      // Insert after trending movies section
      trendingSection.insertAdjacentElement('afterend', installSection);
      
      // Add event listener
      document.getElementById('mainInstallBtn').addEventListener('click', () => this.installApp());
    }
  }

  async installApp() {
    if (!this.deferredPrompt) {
      console.log('Install prompt not available');
      return;
    }

    // Hide the banner first
    this.hideInstallPromotion();

    // Show the prompt
    this.deferredPrompt.prompt();

    // Wait for the user to respond
    const { outcome } = await this.deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted installation');
      this.trackEvent('install_accepted');
    } else {
      console.log('User dismissed installation');
      this.trackEvent('install_dismissed');
    }

    // Clear the deferred prompt
    this.deferredPrompt = null;
  }

  hideInstallPromotion() {
    const banner = document.querySelector('.pwa-install-banner');
    if (banner) {
      banner.classList.remove('show');
      setTimeout(() => banner.remove(), 300);
    }
  }

  checkIfInstalled() {
    // Check if running in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
      console.log('App is installed');
      return true;
    }

    // Check for iOS
    if (window.navigator.standalone === true) {
      this.isInstalled = true;
      console.log('App is installed (iOS)');
      return true;
    }

    return false;
  }

  checkiOS() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    if (isIOS && !this.isInstalled && !this.wasRecentlyDismissed()) {
      // Show iOS-specific install instructions
      setTimeout(() => this.showiOSInstallPrompt(), 5000);
    }
  }

  showiOSInstallPrompt() {
    if (document.querySelector('.ios-install-prompt')) {
      return;
    }

    const prompt = document.createElement('div');
    prompt.className = 'ios-install-prompt';
    prompt.innerHTML = `
      <div class="ios-install-content">
        <button class="ios-close-btn" aria-label="Close">×</button>
        <h3>Install Which Movie To Watch</h3>
        <p>To install this app on your iPhone:</p>
        <ol>
          <li>Tap the <span class="ios-share-icon">⎙</span> Share button</li>
          <li>Scroll down and tap "Add to Home Screen"</li>
          <li>Tap "Add" to confirm</li>
        </ol>
      </div>
    `;

    document.body.appendChild(prompt);

    setTimeout(() => {
      prompt.classList.add('show');
    }, 100);

    document.querySelector('.ios-close-btn').addEventListener('click', () => {
      prompt.classList.remove('show');
      setTimeout(() => prompt.remove(), 300);
      this.setDismissed();
    });
  }

  showUpdateNotification() {
    const notification = document.createElement('div');
    notification.className = 'pwa-update-notification';
    notification.innerHTML = `
      <div class="pwa-update-content">
        <p>A new version is available!</p>
        <button class="pwa-update-btn" onclick="location.reload()">
          Update Now
        </button>
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 100);

    // Auto-hide after 10 seconds
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 10000);
  }

  showSuccessMessage() {
    const message = document.createElement('div');
    message.className = 'pwa-success-message';
    message.innerHTML = `
      <div class="pwa-success-content">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <span>App installed successfully!</span>
      </div>
    `;

    document.body.appendChild(message);

    setTimeout(() => {
      message.classList.add('show');
    }, 100);

    // Remove after 3 seconds
    setTimeout(() => {
      message.classList.remove('show');
      setTimeout(() => message.remove(), 300);
    }, 3000);
  }

  trackInstallation() {
    this.trackEvent('app_installed');
    
    // Store installation date
    localStorage.setItem('pwa-installed', Date.now());
  }

  trackEvent(eventName, data = {}) {
    // Google Analytics
    if (window.gtag) {
      gtag('event', eventName, {
        event_category: 'PWA',
        ...data
      });
    }

    // Custom analytics
    if (window.analytics) {
      window.analytics.track(eventName, data);
    }

    console.log('PWA Event:', eventName, data);
  }

  setDismissed() {
    localStorage.setItem('pwa-install-dismissed', Date.now());
  }

  wasRecentlyDismissed() {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (!dismissed) return false;

    const daysSinceDismissed = (Date.now() - parseInt(dismissed)) / (1000 * 60 * 60 * 24);
    return daysSinceDismissed < 7; // Don't show again for 7 days
  }

  addInstallStyles() {
    if (document.querySelector('#pwa-installer-styles')) {
      return;
    }

    const styles = document.createElement('style');
    styles.id = 'pwa-installer-styles';
    styles.textContent = `
      .pwa-install-banner {
        position: fixed;
        bottom: -100%;
        left: 0;
        right: 0;
        background: linear-gradient(135deg, #1a1a2e 0%, #0E0E12 100%);
        border-top: 2px solid rgba(255, 69, 69, 0.3);
        box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.5);
        z-index: 10000;
        transition: bottom 0.3s ease-out;
      }

      .pwa-install-banner.show {
        bottom: 0;
      }

      .pwa-install-content {
        position: relative;
        padding: 1.5rem;
        max-width: 600px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        gap: 1.5rem;
      }

      .pwa-close-btn {
        position: absolute;
        top: 10px;
        right: 10px;
        background: none;
        border: none;
        color: #F4F4F5;
        font-size: 24px;
        cursor: pointer;
        opacity: 0.6;
        transition: opacity 0.2s;
      }

      .pwa-close-btn:hover {
        opacity: 1;
      }

      .pwa-install-icon {
        flex-shrink: 0;
        color: #FF4545;
      }

      .pwa-install-text {
        flex: 1;
      }

      .pwa-install-text h3 {
        color: #F4F4F5;
        margin: 0 0 0.5rem 0;
        font-size: 1.25rem;
      }

      .pwa-install-text p {
        color: rgba(244, 244, 245, 0.8);
        margin: 0;
        font-size: 0.95rem;
      }

      .pwa-install-actions {
        display: flex;
        gap: 0.75rem;
      }

      .pwa-install-btn,
      .pwa-dismiss-btn {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        white-space: nowrap;
      }

      .pwa-install-btn {
        background: linear-gradient(135deg, #FF4545, #FF8A45);
        color: white;
      }

      .pwa-install-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(255, 69, 69, 0.3);
      }

      .pwa-dismiss-btn {
        background: rgba(255, 255, 255, 0.1);
        color: #F4F4F5;
      }

      .pwa-dismiss-btn:hover {
        background: rgba(255, 255, 255, 0.15);
      }

      .header-install-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background: linear-gradient(135deg, #FF4545, #FF8A45);
        color: white;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }

      .header-install-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(255, 69, 69, 0.3);
      }

      .ios-install-prompt {
        position: fixed;
        bottom: -100%;
        left: 50%;
        transform: translateX(-50%);
        background: #1a1a2e;
        border-radius: 16px 16px 0 0;
        box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        transition: bottom 0.3s ease-out;
        max-width: 90%;
        width: 400px;
      }

      .ios-install-prompt.show {
        bottom: 0;
      }

      .ios-install-content {
        position: relative;
        padding: 2rem;
        color: #F4F4F5;
      }

      .ios-close-btn {
        position: absolute;
        top: 10px;
        right: 10px;
        background: none;
        border: none;
        color: #F4F4F5;
        font-size: 24px;
        cursor: pointer;
        opacity: 0.6;
      }

      .ios-install-content h3 {
        margin: 0 0 1rem 0;
        color: #FF4545;
      }

      .ios-install-content ol {
        margin: 1rem 0;
        padding-left: 1.5rem;
      }

      .ios-install-content li {
        margin: 0.5rem 0;
      }

      .ios-share-icon {
        display: inline-block;
        padding: 2px 6px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
      }

      .pwa-update-notification,
      .pwa-success-message {
        position: fixed;
        top: -100px;
        left: 50%;
        transform: translateX(-50%);
        background: #1a1a2e;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        z-index: 10001;
        transition: top 0.3s ease-out;
      }

      .pwa-update-notification.show,
      .pwa-success-message.show {
        top: 20px;
      }

      .pwa-update-content,
      .pwa-success-content {
        padding: 1rem 1.5rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        color: #F4F4F5;
      }

      .pwa-update-btn {
        padding: 0.5rem 1rem;
        background: #FF4545;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
      }

      .pwa-success-content svg {
        color: #4CAF50;
      }

      /* Centered Install Section After Trending Movies */
      .pwa-install-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 3rem 1.5rem;
        margin: 3rem auto;
        max-width: 700px;
        background: linear-gradient(135deg, rgba(255, 69, 69, 0.05) 0%, rgba(255, 138, 69, 0.05) 100%);
        border-radius: 20px;
        border: 2px solid rgba(255, 69, 69, 0.1);
        animation: fadeIn 0.6s ease-out;
        position: relative;
        overflow: hidden;
      }

      .pwa-install-section::before {
        content: '';
        position: absolute;
        top: -50%;
        right: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle, rgba(255, 69, 69, 0.1) 0%, transparent 70%);
        animation: rotate 20s linear infinite;
      }

      @keyframes rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      .pwa-main-install-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.875rem;
        padding: 1.125rem 2.75rem;
        background: linear-gradient(135deg, #FF4545 0%, #FF8A45 100%);
        color: white;
        border: none;
        border-radius: 50px;
        font-size: 1.125rem;
        font-weight: 700;
        letter-spacing: 0.3px;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 
          0 4px 6px rgba(255, 69, 69, 0.1),
          0 8px 20px rgba(255, 69, 69, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.2);
        position: relative;
        z-index: 1;
        text-transform: none;
        white-space: nowrap;
        outline: none;
        -webkit-tap-highlight-color: transparent;
      }

      .pwa-main-install-btn::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, #FF5555 0%, #FF9A55 100%);
        border-radius: 50px;
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: -1;
      }

      .pwa-main-install-btn:hover {
        transform: translateY(-3px) scale(1.02);
        box-shadow: 
          0 6px 8px rgba(255, 69, 69, 0.15),
          0 12px 28px rgba(255, 69, 69, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.3);
      }

      .pwa-main-install-btn:hover::before {
        opacity: 1;
      }

      .pwa-main-install-btn:active {
        transform: translateY(-1px) scale(1.01);
        box-shadow: 
          0 2px 4px rgba(255, 69, 69, 0.1),
          0 4px 12px rgba(255, 69, 69, 0.2);
      }

      .pwa-main-install-btn:focus-visible {
        outline: 3px solid rgba(255, 69, 69, 0.5);
        outline-offset: 3px;
      }

      .pwa-main-install-btn svg {
        width: 24px;
        height: 24px;
        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
      }

      .pwa-main-install-btn span {
        display: inline-block;
        line-height: 1;
      }

      .pwa-install-section .pwa-install-text {
        margin-top: 1.25rem;
        color: #9CA3AF;
        font-size: 0.975rem;
        font-weight: 500;
        line-height: 1.5;
        max-width: 400px;
        position: relative;
        z-index: 1;
      }

      /* Dark mode specific styles */
      [data-theme="dark"] .pwa-install-section {
        background: linear-gradient(135deg, rgba(255, 69, 69, 0.08) 0%, rgba(255, 138, 69, 0.08) 100%);
        border-color: rgba(255, 69, 69, 0.2);
      }

      [data-theme="dark"] .pwa-install-section .pwa-install-text {
        color: rgba(244, 244, 245, 0.7);
      }

      /* Light mode specific styles */
      [data-theme="light"] .pwa-install-section {
        background: linear-gradient(135deg, #ffffff 0%, #fef5f5 100%);
        border: 2px solid rgba(102, 126, 234, 0.15);
        box-shadow: 0 4px 20px rgba(102, 126, 234, 0.08);
      }

      [data-theme="light"] .pwa-install-section::before {
        background: radial-gradient(circle, rgba(102, 126, 234, 0.08) 0%, transparent 70%);
      }

      [data-theme="light"] .pwa-main-install-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        box-shadow: 
          0 4px 6px rgba(102, 126, 234, 0.1),
          0 8px 20px rgba(102, 126, 234, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.2);
      }

      [data-theme="light"] .pwa-main-install-btn::before {
        background: linear-gradient(135deg, #7c8ff0 0%, #8a5db6 100%);
      }

      [data-theme="light"] .pwa-main-install-btn:hover {
        box-shadow: 
          0 6px 8px rgba(102, 126, 234, 0.15),
          0 12px 28px rgba(102, 126, 234, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.3);
      }

      [data-theme="light"] .pwa-install-section .pwa-install-text {
        color: #6b7280;
        font-weight: 500;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* Responsive adjustments */
      @media (max-width: 768px) {
        .pwa-install-section {
          padding: 2rem 1rem;
          margin: 2rem 1rem;
        }

        .pwa-main-install-btn {
          padding: 1rem 2rem;
          font-size: 1rem;
          width: 100%;
          max-width: 320px;
        }

        .pwa-main-install-btn svg {
          width: 20px;
          height: 20px;
        }

        .pwa-install-section .pwa-install-text {
          font-size: 0.875rem;
        }
      }

      @media (max-width: 600px) {
        .pwa-install-content {
          flex-direction: column;
          text-align: center;
        }

        .pwa-install-actions {
          width: 100%;
          justify-content: center;
        }

        .pwa-install-btn,
        .pwa-dismiss-btn {
          flex: 1;
        }
      }
    `;

    document.head.appendChild(styles);
  }
}

// Initialize PWA installer when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.pwaInstaller = new PWAInstaller();
  });
} else {
  window.pwaInstaller = new PWAInstaller();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PWAInstaller;
}
