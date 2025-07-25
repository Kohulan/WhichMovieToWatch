// Advanced Animations Module for WhichMovieToWatch
// Leverages GSAP, Lottie, and modern browser APIs for stunning visual effects

class AdvancedAnimations {
    constructor() {
        this.gsapTimelines = {};
        this.lottieAnimations = {};
        this.init();
    }

    init() {
        // Register GSAP plugins
        gsap.registerPlugin(ScrollTrigger, TextPlugin);
        
        // Initialize all animation systems
        this.initGSAPAnimations();
        this.initLottieAnimations();
        this.initLazyLoading();
        this.initAdvancedInteractions();
        this.initDynamicBackgrounds();
    }

    // GSAP-powered animations
    initGSAPAnimations() {
        // Cinematic title animation
        this.animateTitle();
        
        // Scroll-triggered animations
        this.initScrollAnimations();
        
        // Button hover effects with GSAP
        this.enhanceButtons();
        
        // Card entrance animations
        this.animateCards();
    }

    animateTitle() {
        const title = document.querySelector('.title-letter');
        if (!title) return;

        // Split text for character animation
        const text = title.textContent;
        title.innerHTML = text.split('').map(char => 
            `<span class="char">${char}</span>`
        ).join('');

        // Animate each character
        gsap.fromTo('.char', 
            {
                opacity: 0,
                y: 50,
                rotationX: -90,
                transformOrigin: '50% 50%'
            },
            {
                opacity: 1,
                y: 0,
                rotationX: 0,
                duration: 0.8,
                stagger: 0.05,
                ease: 'back.out(1.7)',
                onComplete: () => {
                    // Add floating animation after entrance
                    gsap.to('.title-letter', {
                        y: -10,
                        duration: 2,
                        repeat: -1,
                        yoyo: true,
                        ease: 'power1.inOut'
                    });
                }
            }
        );
    }

    initScrollAnimations() {
        // Parallax scrolling for movie cards
        gsap.utils.toArray('.movie-card').forEach((card, i) => {
            gsap.to(card, {
                y: -50,
                ease: 'none',
                scrollTrigger: {
                    trigger: card,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1
                }
            });
        });

        // Fade in elements on scroll
        gsap.utils.toArray('.fade-in-scroll').forEach(element => {
            gsap.fromTo(element, 
                {
                    opacity: 0,
                    y: 60,
                    scale: 0.9
                },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 1,
                    scrollTrigger: {
                        trigger: element,
                        start: 'top 80%',
                        toggleActions: 'play none none reverse'
                    }
                }
            );
        });
    }

    enhanceButtons() {
        document.querySelectorAll('.btn').forEach(button => {
            const timeline = gsap.timeline({ paused: true });
            
            // Create inner elements for animation
            const span = document.createElement('span');
            span.className = 'btn-bg-animation';
            button.appendChild(span);

            timeline
                .to(span, {
                    scale: 20,
                    opacity: 0.3,
                    duration: 0.4,
                    ease: 'power2.out'
                })
                .to(span, {
                    scale: 0,
                    opacity: 0,
                    duration: 0.1
                }, '-=0.1');

            button.addEventListener('mouseenter', () => {
                timeline.restart();
                gsap.to(button, {
                    scale: 1.05,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });

            button.addEventListener('mouseleave', () => {
                gsap.to(button, {
                    scale: 1,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });
        });
    }

    animateCards() {
        // Staggered card animation with 3D effect
        gsap.set('.movie-card', {
            opacity: 0,
            y: 100,
            rotationY: -15,
            transformPerspective: 1000
        });

        ScrollTrigger.batch('.movie-card', {
            onEnter: batch => gsap.to(batch, {
                opacity: 1,
                y: 0,
                rotationY: 0,
                stagger: 0.15,
                duration: 1.2,
                ease: 'power3.out',
                overwrite: 'auto'
            }),
            onLeave: batch => gsap.to(batch, {
                opacity: 0,
                y: -100,
                stagger: 0.15,
                duration: 0.8,
                overwrite: 'auto'
            }),
            onEnterBack: batch => gsap.to(batch, {
                opacity: 1,
                y: 0,
                stagger: 0.15,
                duration: 0.8,
                overwrite: 'auto'
            }),
            onLeaveBack: batch => gsap.to(batch, {
                opacity: 0,
                y: 100,
                stagger: 0.15,
                duration: 0.8,
                overwrite: 'auto'
            })
        });
    }

    // Lottie animations
    initLottieAnimations() {
        // Replace loading spinner with Lottie animation
        this.createLoadingAnimation();
        
        // Add micro-interactions
        this.addMicroInteractions();
    }

    createLoadingAnimation() {
        const container = document.querySelector('.film-reel-spinner');
        if (!container || !window.lottie) return;

        // Film reel Lottie animation data (simplified version)
        const animationData = {
            v: "5.7.4",
            fr: 60,
            ip: 0,
            op: 120,
            w: 120,
            h: 120,
            nm: "Film Reel",
            ddd: 0,
            assets: [],
            layers: [{
                ddd: 0,
                ind: 1,
                ty: 4,
                nm: "Reel",
                sr: 1,
                ks: {
                    o: { a: 0, k: 100, ix: 11 },
                    r: { 
                        a: 1, 
                        k: [{
                            i: { x: [0.833], y: [0.833] },
                            o: { x: [0.167], y: [0.167] },
                            t: 0,
                            s: [0]
                        }, {
                            t: 120,
                            s: [360]
                        }], 
                        ix: 10 
                    },
                    p: { a: 0, k: [60, 60, 0], ix: 2 },
                    a: { a: 0, k: [0, 0, 0], ix: 1 },
                    s: { a: 0, k: [100, 100, 100], ix: 6 }
                },
                ao: 0,
                shapes: [{
                    ty: "gr",
                    it: [{
                        d: 1,
                        ty: "el",
                        s: { a: 0, k: [100, 100], ix: 2 },
                        p: { a: 0, k: [0, 0], ix: 3 },
                        nm: "Circle"
                    }, {
                        ty: "st",
                        c: { a: 0, k: [1, 0.27, 0.27, 1], ix: 3 },
                        o: { a: 0, k: 100, ix: 4 },
                        w: { a: 0, k: 8, ix: 5 },
                        lc: 2,
                        lj: 2,
                        nm: "Stroke"
                    }, {
                        ty: "tr",
                        p: { a: 0, k: [0, 0], ix: 2 },
                        a: { a: 0, k: [0, 0], ix: 1 },
                        s: { a: 0, k: [100, 100], ix: 3 },
                        r: { a: 0, k: 0, ix: 6 },
                        o: { a: 0, k: 100, ix: 7 },
                        sk: { a: 0, k: 0, ix: 4 },
                        sa: { a: 0, k: 0, ix: 5 },
                        nm: "Transform"
                    }],
                    nm: "Reel"
                }],
                ip: 0,
                op: 120,
                st: 0,
                bm: 0
            }]
        };

        // Create Lottie animation
        this.lottieAnimations.loading = lottie.loadAnimation({
            container: container,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            animationData: animationData
        });
    }

    addMicroInteractions() {
        // Heart animation for "Love it" button
        document.querySelectorAll('.btn-love').forEach(button => {
            button.addEventListener('click', (e) => {
                this.createHeartBurst(e.currentTarget);
            });
        });
    }

    createHeartBurst(element) {
        const rect = element.getBoundingClientRect();
        const hearts = 8;

        for (let i = 0; i < hearts; i++) {
            const heart = document.createElement('div');
            heart.className = 'heart-particle';
            heart.innerHTML = '❤️';
            heart.style.cssText = `
                position: fixed;
                left: ${rect.left + rect.width / 2}px;
                top: ${rect.top + rect.height / 2}px;
                font-size: 20px;
                z-index: 9999;
                pointer-events: none;
            `;
            document.body.appendChild(heart);

            gsap.to(heart, {
                x: (Math.random() - 0.5) * 200,
                y: (Math.random() - 0.5) * 200 - 50,
                opacity: 0,
                scale: Math.random() * 1.5 + 0.5,
                duration: 1.5,
                ease: 'power2.out',
                onComplete: () => heart.remove()
            });
        }
    }

    // Lazy loading implementation
    initLazyLoading() {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // Create loading placeholder
                    const placeholder = document.createElement('div');
                    placeholder.className = 'image-placeholder';
                    img.parentNode.insertBefore(placeholder, img);
                    
                    // Load image
                    const tempImg = new Image();
                    tempImg.onload = () => {
                        // Animate image appearance
                        gsap.fromTo(img, 
                            { 
                                opacity: 0, 
                                scale: 1.1,
                                filter: 'blur(20px)'
                            },
                            { 
                                opacity: 1, 
                                scale: 1,
                                filter: 'blur(0px)',
                                duration: 0.8,
                                ease: 'power2.out',
                                onComplete: () => {
                                    placeholder.remove();
                                }
                            }
                        );
                        img.src = tempImg.src;
                        img.classList.add('loaded');
                    };
                    
                    tempImg.src = img.dataset.src;
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });

        // Observe all images with data-src
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // Advanced interactive features
    initAdvancedInteractions() {
        this.initCursorEffects();
        this.initDynamicGradients();
        this.initTextEffects();
    }

    initCursorEffects() {
        // Removed custom cursor for better usability
        // Keep default cursor visible
    }

    initDynamicGradients() {
        const gradientBg = document.querySelector('.gradient-background');
        if (!gradientBg) return;

        let colorIndex = 0;
        const colors = [
            ['#FF4545', '#FF6B6B'],
            ['#4ECDC4', '#45B7D1'],
            ['#F9CA24', '#F0932B'],
            ['#A55EEA', '#8854D0'],
            ['#FD79A8', '#E84393']
        ];

        // Smooth gradient transition
        setInterval(() => {
            colorIndex = (colorIndex + 1) % colors.length;
            const [color1, color2] = colors[colorIndex];
            
            gsap.to(gradientBg, {
                background: `radial-gradient(circle at 30% 50%, ${color1}33, transparent 70%)`,
                duration: 3,
                ease: 'power2.inOut'
            });
        }, 5000);
    }

    initTextEffects() {
        // Typewriter effect for descriptions
        document.querySelectorAll('.typewriter').forEach(element => {
            const text = element.textContent;
            element.textContent = '';
            
            gsap.to(element, {
                text: text,
                duration: text.length * 0.05,
                ease: 'none',
                scrollTrigger: {
                    trigger: element,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                }
            });
        });
    }

    // Dynamic background effects based on movie poster colors
    initDynamicBackgrounds() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    const posters = document.querySelectorAll('.poster img:not(.color-extracted)');
                    posters.forEach(img => {
                        if (img.complete) {
                            this.extractAndApplyColors(img);
                        } else {
                            img.addEventListener('load', () => this.extractAndApplyColors(img));
                        }
                    });
                }
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    extractAndApplyColors(img) {
        // Use canvas-based color extraction since Vibrant is not included
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set canvas size to a small sample for performance
            canvas.width = 50;
            canvas.height = 50;
            
            // Draw the image
            ctx.drawImage(img, 0, 0, 50, 50);
            
            // Get image data
            const imageData = ctx.getImageData(0, 0, 50, 50);
            const data = imageData.data;
            
            // Simple dominant color extraction
            let r = 0, g = 0, b = 0;
            let count = 0;
            
            for (let i = 0; i < data.length; i += 4) {
                // Skip very dark or very light pixels
                const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
                if (brightness > 20 && brightness < 235) {
                    r += data[i];
                    g += data[i + 1];
                    b += data[i + 2];
                    count++;
                }
            }
            
            if (count > 0) {
                r = Math.floor(r / count);
                g = Math.floor(g / count);
                b = Math.floor(b / count);
                
                const card = img.closest('.movie-card');
                if (card) {
                    // Animated color application
                    gsap.to(card, {
                        '--dynamic-color': `rgb(${r}, ${g}, ${b})`,
                        boxShadow: `0 20px 40px rgba(${r}, ${g}, ${b}, 0.3)`,
                        duration: 1,
                        ease: 'power2.out'
                    });
                    
                    // Create ambient lighting effect
                    this.createAmbientLight(card, [r, g, b]);
                }
            }
            
            img.classList.add('color-extracted');
        } catch (err) {
            console.log('Color extraction failed:', err);
            img.classList.add('color-extracted');
        }
    }

    createAmbientLight(element, rgb) {
        const light = document.createElement('div');
        light.className = 'ambient-light';
        light.style.cssText = `
            position: absolute;
            width: 200%;
            height: 200%;
            top: -50%;
            left: -50%;
            background: radial-gradient(circle, rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.2), transparent 60%);
            pointer-events: none;
            z-index: -1;
        `;
        
        element.style.position = 'relative';
        element.appendChild(light);
        
        // Animate ambient light
        gsap.fromTo(light, 
            { opacity: 0, scale: 0.8 },
            { 
                opacity: 1, 
                scale: 1,
                duration: 1.5,
                ease: 'power2.out'
            }
        );
    }

    // Public method to trigger specific animations
    triggerAnimation(animationName, element) {
        switch(animationName) {
            case 'bounce':
                gsap.to(element, {
                    y: -20,
                    duration: 0.3,
                    ease: 'power2.out',
                    yoyo: true,
                    repeat: 1
                });
                break;
            case 'shake':
                gsap.to(element, {
                    x: [-10, 10, -10, 10, 0],
                    duration: 0.5,
                    ease: 'power2.out'
                });
                break;
            case 'pulse':
                gsap.to(element, {
                    scale: [1, 1.1, 1],
                    duration: 0.6,
                    ease: 'power2.inOut'
                });
                break;
        }
    }
}

// Initialize advanced animations
document.addEventListener('DOMContentLoaded', () => {
    window.advancedAnimations = new AdvancedAnimations();
});

// Export for use in other modules
window.AdvancedAnimations = AdvancedAnimations;
