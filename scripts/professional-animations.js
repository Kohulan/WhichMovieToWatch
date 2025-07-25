// Professional Animations Module for WhichMovieToWatch
// Subtle, performance-optimized animations for a professional look

class ProfessionalAnimations {
    constructor() {
        this.init();
    }

    init() {
        // Only initialize essential animations
        this.initSubtleAnimations();
        this.initSimpleLazyLoading();
        this.initButtonEffects();
    }

    // Subtle entrance animations
    initSubtleAnimations() {
        // Simple fade-in for movie cards
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-active');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observe movie cards and other elements
        document.querySelectorAll('.movie-card, .fade-in').forEach(el => {
            el.classList.add('fade-in-ready');
            observer.observe(el);
        });
    }

    // Simple lazy loading without heavy effects
    initSimpleLazyLoading() {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // Simply load the image
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.classList.add('loaded');
                        observer.unobserve(img);
                    }
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });

        // Observe all lazy images
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });

        // Also handle images without lazy loading
        document.querySelectorAll('.poster img:not([data-src])').forEach(img => {
            if (!img.complete) {
                img.classList.add('loading');
                img.addEventListener('load', () => {
                    img.classList.remove('loading');
                    img.classList.add('loaded');
                });
            } else {
                img.classList.add('loaded');
            }
        });
    }

    // Simple button hover effects
    initButtonEffects() {
        document.querySelectorAll('.btn').forEach(button => {
            // Remove any heavy animations
            const bgAnimations = button.querySelectorAll('.btn-bg-animation');
            bgAnimations.forEach(el => el.remove());

            // Add simple hover scale
            button.addEventListener('mouseenter', () => {
                button.style.transform = 'translateY(-2px)';
            });

            button.addEventListener('mouseleave', () => {
                button.style.transform = 'translateY(0)';
            });

            // Simple click feedback
            button.addEventListener('click', function(e) {
                // Create ripple effect
                const ripple = document.createElement('span');
                ripple.className = 'simple-ripple';
                
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                
                this.appendChild(ripple);
                
                setTimeout(() => ripple.remove(), 600);
            });
        });
    }

    // Remove heavy scroll effects
    disableHeavyScrollEffects() {
        // Disable any parallax or heavy scroll animations
        if (window.ScrollTrigger) {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        }
    }
}

// Initialize professional animations and disable heavy ones
document.addEventListener('DOMContentLoaded', () => {
    // Disable heavy animations
    if (window.advancedAnimations) {
        window.advancedAnimations = null;
    }
    
    // Initialize professional animations
    window.professionalAnimations = new ProfessionalAnimations();
    
    // Disable parallax on movie cards
    document.querySelectorAll('.movie-card').forEach(card => {
        card.style.transform = 'none';
        card.style.willChange = 'auto';
    });
});

// Export for use in other modules
window.ProfessionalAnimations = ProfessionalAnimations;
