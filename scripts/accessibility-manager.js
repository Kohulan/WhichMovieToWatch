/**
 * Accessibility Manager - WCAG 2.1 AA Compliance
 * Handles keyboard navigation, screen reader support, high contrast mode, and more
 */

class AccessibilityManager {
  constructor() {
    this.settings = {};
    this.focusTrap = null;
    this.announcer = null;
    this.focusableElements = null;
    this.firstFocusableElement = null;
    this.lastFocusableElement = null;
    this.init();
  }

  init() {
    // Create screen reader announcer
    this.createAnnouncer();
    
    // Setup keyboard navigation
    this.setupKeyboardNavigation();
    
    // Add skip links
    this.addSkipLinks();
    
    // Setup focus management
    this.setupFocusManagement();
    
    // Initialize ARIA live regions
    this.setupLiveRegions();
    
    // Setup high contrast mode
    this.setupHighContrastMode();
    
    // Add accessibility toolbar
    this.createAccessibilityToolbar();
    
    // Enhance existing elements
    this.enhanceAccessibility();
    
    // Load saved settings
    this.loadSettings();
  }

  createAnnouncer() {
    // Create a screen reader announcer for dynamic content
    this.announcer = document.createElement('div');
    this.announcer.className = 'sr-announcer';
    this.announcer.setAttribute('aria-live', 'polite');
    this.announcer.setAttribute('aria-atomic', 'true');
    this.announcer.setAttribute('role', 'status');
    this.announcer.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
    document.body.appendChild(this.announcer);
  }

  announce(message, priority = 'polite') {
    if (!this.announcer) return;
    
    // Clear previous announcement
    this.announcer.textContent = '';
    
    // Set priority
    this.announcer.setAttribute('aria-live', priority);
    
    // Announce after a brief delay to ensure screen readers catch it
    setTimeout(() => {
      this.announcer.textContent = message;
    }, 100);
    
    // Clear after announcement
    setTimeout(() => {
      this.announcer.textContent = '';
    }, 3000);
  }

  setupKeyboardNavigation() {
    // Global keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Skip to main content (Alt + 1)
      if (e.altKey && e.key === '1') {
        e.preventDefault();
        this.skipToMain();
      }
      
      // Skip to search (Alt + 2)
      if (e.altKey && e.key === '2') {
        e.preventDefault();
        this.skipToSearch();
      }
      
      // Open accessibility settings (Alt + A)
      if (e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        this.openAccessibilitySettings();
      }
      
      // Escape key handling
      if (e.key === 'Escape') {
        this.handleEscape();
      }
      
      // Tab trap for modals
      if (e.key === 'Tab' && this.focusTrap) {
        this.handleTabTrap(e);
      }
    });

    // Roving tabindex for button groups
    this.setupRovingTabindex();
  }

  setupRovingTabindex() {
    // Implement roving tabindex for button groups
    const buttonGroups = document.querySelectorAll('.dinner-time-container, .movie-actions');
    
    buttonGroups.forEach(group => {
      const buttons = group.querySelectorAll('button');
      if (buttons.length === 0) return;
      
      // Set initial tabindex
      buttons[0].setAttribute('tabindex', '0');
      for (let i = 1; i < buttons.length; i++) {
        buttons[i].setAttribute('tabindex', '-1');
      }
      
      // Handle arrow key navigation
      group.addEventListener('keydown', (e) => {
        const currentButton = document.activeElement;
        if (!buttons || !Array.from(buttons).includes(currentButton)) return;
        
        let newIndex = Array.from(buttons).indexOf(currentButton);
        
        switch(e.key) {
          case 'ArrowRight':
          case 'ArrowDown':
            e.preventDefault();
            newIndex = (newIndex + 1) % buttons.length;
            break;
          case 'ArrowLeft':
          case 'ArrowUp':
            e.preventDefault();
            newIndex = (newIndex - 1 + buttons.length) % buttons.length;
            break;
          case 'Home':
            e.preventDefault();
            newIndex = 0;
            break;
          case 'End':
            e.preventDefault();
            newIndex = buttons.length - 1;
            break;
          default:
            return;
        }
        
        // Update tabindex and focus
        buttons.forEach((btn, idx) => {
          btn.setAttribute('tabindex', idx === newIndex ? '0' : '-1');
        });
        buttons[newIndex].focus();
      });
    });
  }

  addSkipLinks() {
    const skipNav = document.createElement('nav');
    skipNav.className = 'skip-links';
    skipNav.setAttribute('aria-label', 'Skip navigation');
    skipNav.innerHTML = `
      <a href="#main-content" class="skip-link">Skip to main content</a>
      <a href="#search" class="skip-link">Skip to search</a>
      <a href="#movieCard" class="skip-link">Skip to movie</a>
      <a href="#footer" class="skip-link">Skip to footer</a>
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .skip-links {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 10000;
      }
      
      .skip-link {
        position: absolute;
        left: -10000px;
        top: auto;
        width: 1px;
        height: 1px;
        overflow: hidden;
        padding: 0.5rem 1rem;
        background: var(--accent, #FF4545);
        color: white;
        text-decoration: none;
        border-radius: 4px;
        font-weight: 600;
      }
      
      .skip-link:focus {
        position: static;
        left: 10px;
        top: 10px;
        width: auto;
        height: auto;
        overflow: auto;
        z-index: 10001;
        margin: 10px;
      }

      /* Screen reader only content */
      .sr-only {
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
      }
    `;
    document.head.appendChild(style);
    
    // Insert at beginning of body
    document.body.insertBefore(skipNav, document.body.firstChild);
    
    // Add IDs to main sections if missing
    const mainContent = document.querySelector('.container');
    if (mainContent && !mainContent.id) mainContent.id = 'main-content';
    
    const footer = document.querySelector('.footer');
    if (footer && !footer.id) footer.id = 'footer';
  }

  setupFocusManagement() {
    // Enhanced focus indicators
    const style = document.createElement('style');
    style.textContent = `
      *:focus {
        outline: 3px solid var(--accent, #FF4545) !important;
        outline-offset: 2px !important;
      }
      
      *:focus:not(:focus-visible) {
        outline: none !important;
      }
      
      *:focus-visible {
        outline: 3px solid var(--accent, #FF4545) !important;
        outline-offset: 2px !important;
        box-shadow: 0 0 0 3px rgba(255, 69, 69, 0.25);
      }
      
      button:focus-visible,
      a:focus-visible,
      input:focus-visible,
      select:focus-visible,
      textarea:focus-visible {
        outline: 3px solid var(--accent, #FF4545) !important;
        outline-offset: 2px !important;
        box-shadow: 0 0 0 3px rgba(255, 69, 69, 0.25);
      }
      
      /* High contrast mode focus */
      @media (prefers-contrast: high) {
        *:focus-visible {
          outline: 4px solid currentColor !important;
          outline-offset: 4px !important;
        }
      }
    `;
    document.head.appendChild(style);
    
    // Focus restoration for modals
    this.setupModalFocusManagement();
  }

  setupModalFocusManagement() {
    // Track last focused element before modal opens
    let lastFocusedElement = null;
    
    // Watch for modal visibility changes
    const checkModals = () => {
      const modals = document.querySelectorAll(
        '#preferenceModal, #dinnerTimeModal, #searchModal, #availabilityModal, #netflixModal'
      );
      
      modals.forEach(modal => {
        if (this.isModalVisible(modal) && !this.focusTrap) {
          // Store last focused element
          lastFocusedElement = document.activeElement;
          
          // Set up focus trap
          this.createFocusTrap(modal);
          
          // Focus first focusable element
          setTimeout(() => this.focusFirstElement(modal), 100);
          
          // Announce modal opening
          const modalTitle = modal.querySelector('h2, h3, [role="heading"]');
          if (modalTitle) {
            this.announce(`${modalTitle.textContent} dialog opened`);
          }
        } else if (!this.isModalVisible(modal) && this.focusTrap === modal) {
          // Release focus trap
          this.focusTrap = null;
          
          // Restore focus
          if (lastFocusedElement) {
            lastFocusedElement.focus();
            lastFocusedElement = null;
          }
          
          // Announce modal closing
          this.announce('Dialog closed');
        }
      });
    };
    
    // Check periodically for modal changes
    setInterval(checkModals, 500);
  }

  isModalVisible(modal) {
    if (!modal) return false;
    const style = window.getComputedStyle(modal);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0';
  }

  createFocusTrap(container) {
    this.focusTrap = container;
    
    // Get all focusable elements
    const focusableElements = container.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), ' +
      'input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;
    
    this.focusableElements = Array.from(focusableElements);
    this.firstFocusableElement = this.focusableElements[0];
    this.lastFocusableElement = this.focusableElements[this.focusableElements.length - 1];
  }

  handleTabTrap(e) {
    if (!this.focusTrap || !this.focusableElements) return;
    
    const isTabPressed = e.key === 'Tab';
    if (!isTabPressed) return;
    
    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === this.firstFocusableElement) {
        this.lastFocusableElement.focus();
        e.preventDefault();
      }
    } else {
      // Tab
      if (document.activeElement === this.lastFocusableElement) {
        this.firstFocusableElement.focus();
        e.preventDefault();
      }
    }
  }

  focusFirstElement(container) {
    const focusable = container.querySelector(
      'h2, h3, [role="heading"], ' +
      'button:not([disabled]), input:not([disabled]), ' +
      'a[href], select:not([disabled]), textarea:not([disabled])'
    );
    
    if (focusable) {
      focusable.focus();
    }
  }

  setupLiveRegions() {
    // Add ARIA live regions for dynamic content
    const dynamicAreas = [
      { selector: '#movieCard', role: 'region', label: 'Movie recommendation', live: 'polite' },
      { selector: '#searchResults', role: 'region', label: 'Search results', live: 'polite' },
      { selector: '#toast', role: 'alert', label: 'Notifications', live: 'assertive' },
      { selector: '.loading', role: 'status', label: 'Loading', live: 'polite' }
    ];
    
    dynamicAreas.forEach(area => {
      const element = document.querySelector(area.selector);
      if (element) {
        element.setAttribute('role', area.role);
        element.setAttribute('aria-label', area.label);
        element.setAttribute('aria-live', area.live);
        element.setAttribute('aria-atomic', 'true');
      }
    });
  }

  setupHighContrastMode() {
    // Check for user preference
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    const savedPreference = localStorage.getItem('highContrast');
    
    if (prefersHighContrast || savedPreference === 'true') {
      this.enableHighContrast();
    }
    
    // Listen for changes
    window.matchMedia('(prefers-contrast: high)').addEventListener('change', (e) => {
      if (e.matches) {
        this.enableHighContrast();
      } else if (!localStorage.getItem('highContrast')) {
        this.disableHighContrast();
      }
    });
  }

  enableHighContrast() {
    document.body.classList.add('high-contrast');
    
    // Add high contrast styles
    if (!document.querySelector('#high-contrast-styles')) {
      const style = document.createElement('style');
      style.id = 'high-contrast-styles';
      style.textContent = `
        .high-contrast {
          --background: #000000;
          --text: #FFFFFF;
          --accent: #FFFF00;
          --card-bg: #1a1a1a;
          --border: #FFFFFF;
        }
        
        .high-contrast * {
          border-color: var(--border) !important;
        }
        
        .high-contrast button,
        .high-contrast .movie-card,
        .high-contrast .modal-content {
          border: 2px solid var(--border);
        }
        
        .high-contrast a {
          color: #00FFFF;
          text-decoration: underline;
        }
        
        .high-contrast button:hover,
        .high-contrast a:hover {
          background: var(--accent);
          color: var(--background);
        }
        
        .high-contrast img {
          opacity: 0.9;
        }
        
        .high-contrast .rating {
          font-weight: bold;
          border: 2px solid var(--accent);
        }
      `;
      document.head.appendChild(style);
    }
    
    localStorage.setItem('highContrast', 'true');
    this.announce('High contrast mode enabled');
  }

  disableHighContrast() {
    document.body.classList.remove('high-contrast');
    localStorage.setItem('highContrast', 'false');
    this.announce('High contrast mode disabled');
  }

  createAccessibilityToolbar() {
    const toolbar = document.createElement('div');
    toolbar.className = 'accessibility-toolbar';
    toolbar.setAttribute('role', 'toolbar');
    toolbar.setAttribute('aria-label', 'Accessibility tools');
    toolbar.innerHTML = `
      <button 
        class="a11y-toggle-btn" 
        aria-label="Toggle accessibility toolbar"
        aria-expanded="false"
        title="Accessibility Settings (Alt+A)"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M12 1v6m0 6v6m4.22-13.22l4.24 4.24M1.54 12h6m6 6h6"></path>
        </svg>
      </button>
      <div class="a11y-panel" role="region" aria-label="Accessibility settings" hidden>
        <h3>Accessibility Settings</h3>
        <div class="a11y-controls">
          <div class="a11y-control">
            <label for="fontSize">Text Size</label>
            <div class="control-group">
              <button onclick="accessibilityManager.decreaseTextSize()" aria-label="Decrease text size">A-</button>
              <span id="fontSizeValue" aria-live="polite">100%</span>
              <button onclick="accessibilityManager.increaseTextSize()" aria-label="Increase text size">A+</button>
            </div>
          </div>
          
          <div class="a11y-control">
            <label for="highContrast">
              <input type="checkbox" id="highContrast" onchange="accessibilityManager.toggleHighContrast()">
              High Contrast Mode
            </label>
          </div>
          
          <div class="a11y-control">
            <label for="reduceMotion">
              <input type="checkbox" id="reduceMotion" onchange="accessibilityManager.toggleReducedMotion()">
              Reduce Motion
            </label>
          </div>
          
          <div class="a11y-control">
            <label for="screenReader">
              <input type="checkbox" id="screenReader" onchange="accessibilityManager.toggleScreenReaderMode()">
              Screen Reader Optimizations
            </label>
          </div>
          
          <div class="a11y-control">
            <label for="largeClickTargets">
              <input type="checkbox" id="largeClickTargets" onchange="accessibilityManager.toggleLargeClickTargets()">
              Large Click Targets
            </label>
          </div>
          
          <div class="a11y-control">
            <button onclick="accessibilityManager.resetSettings()" class="reset-btn">
              Reset to Defaults
            </button>
          </div>
        </div>
      </div>
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .accessibility-toolbar {
        position: fixed;
        top: 60px;
        right: 20px;
        z-index: 9999;
      }
      
      .a11y-toggle-btn {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: var(--accent, #FF4545);
        color: white;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        transition: all 0.3s ease;
        min-width: 48px;
        min-height: 48px;
      }
      
      .a11y-toggle-btn:hover {
        transform: scale(1.1);
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      }
      
      .a11y-panel {
        position: absolute;
        top: 60px;
        right: 0;
        background: var(--card-bg, rgba(17, 24, 39, 0.95));
        border: 2px solid var(--accent, #FF4545);
        border-radius: 12px;
        padding: 1.5rem;
        min-width: 300px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        backdrop-filter: blur(10px);
      }
      
      .a11y-panel[hidden] {
        display: none;
      }
      
      .a11y-panel h3 {
        margin: 0 0 1rem 0;
        color: var(--accent, #FF4545);
        font-size: 1.25rem;
      }
      
      .a11y-controls {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      
      .a11y-control {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      
      .a11y-control label {
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
      }
      
      .control-group {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      
      .control-group button {
        padding: 0.5rem 1rem;
        background: var(--accent, #FF4545);
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        min-width: 44px;
        min-height: 44px;
      }
      
      .control-group button:hover {
        opacity: 0.9;
      }
      
      #fontSizeValue {
        min-width: 60px;
        text-align: center;
        font-weight: 600;
      }
      
      .reset-btn {
        width: 100%;
        padding: 0.75rem;
        background: transparent;
        color: var(--accent, #FF4545);
        border: 2px solid var(--accent, #FF4545);
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.3s ease;
        min-height: 44px;
      }
      
      .reset-btn:hover {
        background: var(--accent, #FF4545);
        color: white;
      }
      
      input[type="checkbox"] {
        width: 20px;
        height: 20px;
        cursor: pointer;
      }
      
      /* Large click targets mode */
      .large-click-targets button,
      .large-click-targets a,
      .large-click-targets input,
      .large-click-targets select {
        min-width: 48px !important;
        min-height: 48px !important;
        padding: 12px !important;
      }
      
      @media (max-width: 480px) {
        .a11y-panel {
          right: -20px;
          left: 20px;
          min-width: auto;
        }
      }
    `;
    document.head.appendChild(style);
    
    // Add to body
    document.body.appendChild(toolbar);
    
    // Setup toggle functionality
    const toggleBtn = toolbar.querySelector('.a11y-toggle-btn');
    const panel = toolbar.querySelector('.a11y-panel');
    
    toggleBtn.addEventListener('click', () => {
      const isOpen = panel.hidden;
      panel.hidden = !isOpen;
      toggleBtn.setAttribute('aria-expanded', isOpen);
      
      if (isOpen) {
        this.announce('Accessibility settings opened');
        const firstInput = panel.querySelector('input, button');
        if (firstInput) firstInput.focus();
      } else {
        this.announce('Accessibility settings closed');
      }
    });
    
    // Close on escape
    panel.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        panel.hidden = true;
        toggleBtn.setAttribute('aria-expanded', 'false');
        toggleBtn.focus();
      }
    });
  }

  // Text size controls
  increaseTextSize() {
    const currentSize = parseInt(localStorage.getItem('fontSize') || '100');
    const newSize = Math.min(currentSize + 10, 150);
    this.setTextSize(newSize);
  }

  decreaseTextSize() {
    const currentSize = parseInt(localStorage.getItem('fontSize') || '100');
    const newSize = Math.max(currentSize - 10, 80);
    this.setTextSize(newSize);
  }

  setTextSize(size) {
    document.documentElement.style.fontSize = `${size}%`;
    localStorage.setItem('fontSize', size);
    const sizeValue = document.getElementById('fontSizeValue');
    if (sizeValue) sizeValue.textContent = `${size}%`;
    this.announce(`Text size set to ${size}%`);
  }

  // Toggle functions
  toggleHighContrast() {
    const isEnabled = document.body.classList.contains('high-contrast');
    if (isEnabled) {
      this.disableHighContrast();
    } else {
      this.enableHighContrast();
    }
    const checkbox = document.getElementById('highContrast');
    if (checkbox) checkbox.checked = !isEnabled;
  }

  toggleReducedMotion() {
    const isEnabled = document.body.classList.contains('reduced-motion');
    document.body.classList.toggle('reduced-motion');
    localStorage.setItem('reducedMotion', !isEnabled);
    
    if (!isEnabled) {
      // Add reduced motion styles
      if (!document.querySelector('#reduced-motion-styles')) {
        const style = document.createElement('style');
        style.id = 'reduced-motion-styles';
        style.textContent = `
          .reduced-motion * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        `;
        document.head.appendChild(style);
      }
      this.announce('Reduced motion enabled');
    } else {
      this.announce('Reduced motion disabled');
    }
  }

  toggleScreenReaderMode() {
    const isEnabled = document.body.classList.contains('screen-reader-mode');
    document.body.classList.toggle('screen-reader-mode');
    localStorage.setItem('screenReaderMode', !isEnabled);
    
    if (!isEnabled) {
      // Add screen reader optimizations
      this.addScreenReaderOptimizations();
      this.announce('Screen reader optimizations enabled');
    } else {
      this.removeScreenReaderOptimizations();
      this.announce('Screen reader optimizations disabled');
    }
  }

  toggleLargeClickTargets() {
    const isEnabled = document.body.classList.contains('large-click-targets');
    document.body.classList.toggle('large-click-targets');
    localStorage.setItem('largeClickTargets', !isEnabled);
    
    if (!isEnabled) {
      this.announce('Large click targets enabled');
    } else {
      this.announce('Large click targets disabled');
    }
  }

  addScreenReaderOptimizations() {
    // Add descriptive text to icons
    document.querySelectorAll('i[class*="fa-"]').forEach(icon => {
      if (!icon.getAttribute('aria-label')) {
        const label = this.getIconLabel(icon.className);
        if (label) {
          icon.setAttribute('aria-label', label);
          icon.setAttribute('role', 'img');
        }
      }
    });
    
    // Ensure all form inputs have labels
    document.querySelectorAll('input, select, textarea').forEach(input => {
      if (!input.id) {
        input.id = `input-${Math.random().toString(36).substr(2, 9)}`;
      }
      
      if (!input.getAttribute('aria-label') && !document.querySelector(`label[for="${input.id}"]`)) {
        const label = input.placeholder || input.name || 'Input field';
        input.setAttribute('aria-label', label);
      }
    });

    // Add landmarks
    const header = document.querySelector('.header');
    if (header && !header.hasAttribute('role')) {
      header.setAttribute('role', 'banner');
    }

    const main = document.querySelector('.container');
    if (main && !main.hasAttribute('role')) {
      main.setAttribute('role', 'main');
    }

    const footer = document.querySelector('.footer');
    if (footer && !footer.hasAttribute('role')) {
      footer.setAttribute('role', 'contentinfo');
    }
  }

  removeScreenReaderOptimizations() {
    // Remove added optimizations if needed
    document.body.classList.remove('screen-reader-mode');
  }

  getIconLabel(className) {
    const iconMap = {
      'fa-film': 'Movie',
      'fa-search': 'Search',
      'fa-star': 'Rating',
      'fa-heart': 'Like',
      'fa-times': 'Close',
      'fa-play': 'Play',
      'fa-pause': 'Pause',
      'fa-volume': 'Volume',
      'fa-cog': 'Settings',
      'fa-user': 'User',
      'fa-download': 'Download',
      'fa-share': 'Share',
      'fa-info': 'Information',
      'fa-warning': 'Warning',
      'fa-check': 'Success',
      'fa-utensils': 'Dinner time',
      'fa-netflix': 'Netflix',
      'fa-moon': 'Dark mode',
      'fa-sun': 'Light mode',
      'fa-fire': 'Trending',
      'fa-mug-hot': 'Coffee',
      'fa-github': 'GitHub',
      'fa-microphone': 'Voice search'
    };
    
    for (const [iconClass, label] of Object.entries(iconMap)) {
      if (className.includes(iconClass)) {
        return label;
      }
    }
    
    return null;
  }

  enhanceAccessibility() {
    // Add alt text to images
    document.querySelectorAll('img').forEach(img => {
      if (!img.hasAttribute('alt')) {
        // Try to derive alt text from context
        const parent = img.closest('[data-movie-title]');
        if (parent) {
          img.setAttribute('alt', `Movie poster for ${parent.dataset.movieTitle}`);
        } else if (img.src.includes('placeholder')) {
          img.setAttribute('alt', 'Movie placeholder image');
        } else {
          img.setAttribute('alt', '');
        }
      }
    });

    // Enhance buttons
    document.querySelectorAll('button').forEach(button => {
      // Ensure minimum size
      const rect = button.getBoundingClientRect();
      if (rect.width < 44 || rect.height < 44) {
        button.style.minWidth = '44px';
        button.style.minHeight = '44px';
      }

      // Add aria-label if only has icon
      if (!button.textContent.trim() && !button.getAttribute('aria-label')) {
        const icon = button.querySelector('i');
        if (icon) {
          const label = this.getIconLabel(icon.className);
          if (label) button.setAttribute('aria-label', label);
        }
      }
    });

    // Add heading hierarchy
    const h1 = document.querySelector('h1');
    if (h1 && !h1.hasAttribute('role')) {
      h1.setAttribute('role', 'heading');
      h1.setAttribute('aria-level', '1');
    }

    // Enhance links
    document.querySelectorAll('a').forEach(link => {
      // External links
      if (link.hostname !== window.location.hostname) {
        if (!link.getAttribute('aria-label')) {
          link.setAttribute('aria-label', `${link.textContent} (opens in new window)`);
        }
      }
    });
  }

  resetSettings() {
    // Reset all accessibility settings
    localStorage.removeItem('fontSize');
    localStorage.removeItem('highContrast');
    localStorage.removeItem('reducedMotion');
    localStorage.removeItem('screenReaderMode');
    localStorage.removeItem('largeClickTargets');
    
    // Reset UI
    document.documentElement.style.fontSize = '';
    document.body.classList.remove('high-contrast', 'reduced-motion', 'screen-reader-mode', 'large-click-targets');
    
    // Reset checkboxes
    ['highContrast', 'reduceMotion', 'screenReader', 'largeClickTargets'].forEach(id => {
      const checkbox = document.getElementById(id);
      if (checkbox) checkbox.checked = false;
    });
    
    const sizeValue = document.getElementById('fontSizeValue');
    if (sizeValue) sizeValue.textContent = '100%';
    
    this.announce('All accessibility settings reset to defaults');
  }

  loadSettings() {
    // Load saved accessibility settings
    const fontSize = localStorage.getItem('fontSize');
    if (fontSize) {
      this.setTextSize(parseInt(fontSize));
    }
    
    const highContrast = localStorage.getItem('highContrast');
    if (highContrast === 'true') {
      this.enableHighContrast();
      const checkbox = document.getElementById('highContrast');
      if (checkbox) checkbox.checked = true;
    }
    
    const reducedMotion = localStorage.getItem('reducedMotion');
    if (reducedMotion === 'true') {
      this.toggleReducedMotion();
      const checkbox = document.getElementById('reduceMotion');
      if (checkbox) checkbox.checked = true;
    }
    
    const screenReaderMode = localStorage.getItem('screenReaderMode');
    if (screenReaderMode === 'true') {
      this.toggleScreenReaderMode();
      const checkbox = document.getElementById('screenReader');
      if (checkbox) checkbox.checked = true;
    }

    const largeClickTargets = localStorage.getItem('largeClickTargets');
    if (largeClickTargets === 'true') {
      this.toggleLargeClickTargets();
      const checkbox = document.getElementById('largeClickTargets');
      if (checkbox) checkbox.checked = true;
    }
  }

  // Helper methods
  skipToMain() {
    const main = document.querySelector('#main-content, main, .container');
    if (main) {
      main.scrollIntoView();
      main.setAttribute('tabindex', '-1');
      main.focus();
      this.announce('Skipped to main content');
    }
  }

  skipToSearch() {
    const searchButton = document.querySelector('.search-movie-trigger');
    if (searchButton) {
      searchButton.click();
      setTimeout(() => {
        const searchInput = document.querySelector('#movieSearch');
        if (searchInput) {
          searchInput.focus();
          this.announce('Skipped to search');
        }
      }, 300);
    }
  }

  openAccessibilitySettings() {
    const panel = document.querySelector('.a11y-panel');
    const toggleBtn = document.querySelector('.a11y-toggle-btn');
    
    if (panel && panel.hidden) {
      panel.hidden = false;
      toggleBtn.setAttribute('aria-expanded', 'true');
      const firstInput = panel.querySelector('input, button');
      if (firstInput) firstInput.focus();
    }
  }

  handleEscape() {
    // Close any open modals or panels
    const openModal = document.querySelector('.modal.active, .modal:not([hidden])');
    if (openModal) {
      const closeBtn = openModal.querySelector('.close-btn, [aria-label*="Close"]');
      if (closeBtn) closeBtn.click();
    }
    
    const panel = document.querySelector('.a11y-panel:not([hidden])');
    if (panel) {
      panel.hidden = true;
      const toggleBtn = document.querySelector('.a11y-toggle-btn');
      if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
    }
  }
}

// Initialize accessibility manager when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.accessibilityManager = new AccessibilityManager();
  });
} else {
  window.accessibilityManager = new AccessibilityManager();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AccessibilityManager;
}
