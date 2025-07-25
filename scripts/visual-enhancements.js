// Visual Enhancement Module for WhichMovieToWatch
// Adds advanced animations and interactions without framework dependencies

class VisualEnhancements {
    constructor() {
        this.particles = [];
        this.mousePosition = { x: 0, y: 0 };
        this.init();
    }

    init() {
        this.initParallax();
        this.initMagneticButtons();
        this.initColorExtraction();
        this.initSmoothScrolling();
        this.initCardAnimations();
    }

    // Parallax effect for movie posters
    initParallax() {
        document.addEventListener('mousemove', (e) => {
            this.mousePosition.x = e.clientX;
            this.mousePosition.y = e.clientY;
            
            const cards = document.querySelectorAll('.movie-card');
            cards.forEach(card => {
                const rect = card.getBoundingClientRect();
                const cardCenterX = rect.left + rect.width / 2;
                const cardCenterY = rect.top + rect.height / 2;
                
                const angleX = (this.mousePosition.y - cardCenterY) * 0.01;
                const angleY = (this.mousePosition.x - cardCenterX) * -0.01;
                
                card.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg)`;
            });
        });
    }

    // Magnetic button effect
    initMagneticButtons() {
        const buttons = document.querySelectorAll('.btn');
        
        buttons.forEach(button => {
            button.addEventListener('mousemove', (e) => {
                const rect = button.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                button.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.transform = 'translate(0, 0)';
            });
        });
    }

    // Extract dominant colors from movie posters
    async initColorExtraction() {
        const extractColors = (img) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            
            ctx.drawImage(img, 0, 0);
            
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            // Simple dominant color extraction
            let r = 0, g = 0, b = 0;
            let count = 0;
            
            for (let i = 0; i < data.length; i += 4) {
                r += data[i];
                g += data[i + 1];
                b += data[i + 2];
                count++;
            }
            
            r = Math.floor(r / count);
            g = Math.floor(g / count);
            b = Math.floor(b / count);
            
            return { r, g, b };
        };

        // Apply to movie posters
        const posters = document.querySelectorAll('.poster img');
        posters.forEach(async (img) => {
            if (img.complete) {
                try {
                    const color = extractColors(img);
                    const card = img.closest('.movie-card');
                    if (card) {
                        card.style.setProperty('--accent-color', `rgb(${color.r}, ${color.g}, ${color.b})`);
                        card.style.boxShadow = `0 20px 40px rgba(${color.r}, ${color.g}, ${color.b}, 0.3)`;
                    }
                } catch (e) {
                    console.log('Color extraction failed:', e);
                }
            }
        });
    }

    // Smooth scrolling with easing
    initSmoothScrolling() {
        const smoothScroll = (target, duration = 1000) => {
            const targetPosition = target.getBoundingClientRect().top;
            const startPosition = window.pageYOffset;
            let startTime = null;

            const animation = (currentTime) => {
                if (startTime === null) startTime = currentTime;
                const timeElapsed = currentTime - startTime;
                const run = this.easeInOutCubic(timeElapsed, startPosition, targetPosition, duration);
                window.scrollTo(0, run);
                if (timeElapsed < duration) requestAnimationFrame(animation);
            };

            requestAnimationFrame(animation);
        };

        // Add to all internal links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) smoothScroll(target);
            });
        });
    }

    // Enhanced card entrance animations
    initCardAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('animate-in');
                        this.createParticles(entry.target);
                    }, index * 100);
                }
            });
        }, observerOptions);

        // Observe all movie cards
        document.querySelectorAll('.movie-card').forEach(card => {
            observer.observe(card);
        });
    }

    // Particle effects on interactions
    createParticles(element) {
        const rect = element.getBoundingClientRect();
        const particleCount = 15;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: fixed;
                width: 4px;
                height: 4px;
                background: var(--accent, #ff4545);
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                left: ${rect.left + rect.width / 2}px;
                top: ${rect.top + rect.height / 2}px;
            `;

            document.body.appendChild(particle);

            const angle = (Math.PI * 2 * i) / particleCount;
            const velocity = 2 + Math.random() * 2;
            const lifetime = 1000 + Math.random() * 1000;

            this.animateParticle(particle, angle, velocity, lifetime);
        }
    }

    animateParticle(particle, angle, velocity, lifetime) {
        let x = 0;
        let y = 0;
        let opacity = 1;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / lifetime;

            if (progress >= 1) {
                particle.remove();
                return;
            }

            x += Math.cos(angle) * velocity;
            y += Math.sin(angle) * velocity;
            opacity = 1 - progress;

            particle.style.transform = `translate(${x}px, ${y}px)`;
            particle.style.opacity = opacity;

            requestAnimationFrame(animate);
        };

        animate();
    }

    // Easing function for smooth animations
    easeInOutCubic(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t * t + b;
        t -= 2;
        return c / 2 * (t * t * t + 2) + b;
    }

    // Add ripple effect to buttons
    addRippleEffect(button) {
        button.addEventListener('click', (e) => {
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.5);
                transform: scale(0);
                animation: ripple-animation 0.6s ease-out;
                left: ${x}px;
                top: ${y}px;
                pointer-events: none;
            `;
            
            button.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    }

    // Cinematic fade transitions
    cinematicTransition(element, duration = 800) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            element.style.transition = `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 100);
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    window.visualEnhancements = new VisualEnhancements();
});

// Export for use in other modules
window.VisualEnhancements = VisualEnhancements;
