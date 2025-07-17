// Advanced Movie Card Component JavaScript

class AdvancedMovieCard {
    constructor(cardElement) {
        this.card = cardElement;
        this.isFlipped = false;
        this.initializeCard();
    }

    initializeCard() {
        this.setupRatingProgress();
        this.setupMagneticButtons();
        this.setupParticleEffect();
        this.setupHolographicEffect();
        this.setupFlipAnimation();
    }

    // Progress ring for ratings
    setupRatingProgress() {
        const circle = this.card.querySelector('.progress-ring__circle');
        const radius = circle.r.baseVal.value;
        const circumference = radius * 2 * Math.PI;
        
        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = circumference;
        
        const rating = parseFloat(this.card.querySelector('.rating-text').textContent);
        const offset = circumference - (rating / 10) * circumference;
        
        setTimeout(() => {
            circle.style.strokeDashoffset = offset;
        }, 100);
    }

    // Magnetic effect for buttons
    setupMagneticButtons() {
        const magneticButtons = this.card.querySelectorAll('[data-magnetic]');
        
        magneticButtons.forEach(button => {
            button.addEventListener('mousemove', (e) => {
                const rect = button.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                button.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
                button.querySelector('.btn-bg').style.transform = 
                    `translate(-50%, -50%) translate(${x * 0.2}px, ${y * 0.2}px) scale(1)`;
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.transform = 'translate(0, 0)';
                button.querySelector('.btn-bg').style.transform = 
                    'translate(-50%, -50%) scale(0)';
            });
        });
    }

    // Particle explosion effect
    setupParticleEffect() {
        const loveButton = this.card.querySelector('.btn-love');
        const canvas = loveButton.querySelector('.particle-canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size
        canvas.width = loveButton.offsetWidth;
        canvas.height = loveButton.offsetHeight;
        
        loveButton.addEventListener('click', (e) => {
            this.createParticleExplosion(ctx, canvas.width / 2, canvas.height / 2);
        });
    }

    createParticleExplosion(ctx, x, y) {
        const particles = [];
        const particleCount = 30;
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b'];
        
        // Create particles
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                size: Math.random() * 4 + 2,
                color: colors[Math.floor(Math.random() * colors.length)],
                life: 1
            });
        }
        
        // Animate particles
        const animate = () => {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            
            particles.forEach((particle, index) => {
                if (particle.life <= 0) {
                    particles.splice(index, 1);
                    return;
                }
                
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.life -= 0.02;
                particle.size *= 0.98;
                
                ctx.globalAlpha = particle.life;
                ctx.fillStyle = particle.color;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
            });
            
            if (particles.length > 0) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }

    // Holographic effect on hover
    setupHolographicEffect() {
        const holographicLayer = this.card.querySelector('.holographic-layer');
        
        this.card.addEventListener('mousemove', (e) => {
            const rect = this.card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            
            const gradientX = x * 100;
            const gradientY = y * 100;
            
            holographicLayer.style.background = `
                radial-gradient(
                    circle at ${gradientX}% ${gradientY}%, 
                    rgba(255, 255, 255, 0.3) 0%, 
                    rgba(255, 255, 255, 0.1) 20%, 
                    transparent 50%
                )
            `;
        });
        
        this.card.addEventListener('mouseleave', () => {
            holographicLayer.style.background = 
                'linear-gradient(45deg, rgba(255,255,255,0.1), transparent)';
        });
    }

    // 3D flip animation
    setupFlipAnimation() {
        // Card flips on hover by default (CSS)
        // Additional control for click-based flipping
        this.card.addEventListener('click', (e) => {
            // Don't flip if clicking on buttons
            if (e.target.closest('button')) return;
            
            this.isFlipped = !this.isFlipped;
            this.card.style.transform = this.isFlipped ? 'rotateY(180deg)' : 'rotateY(0)';
        });
    }

    // Show skeleton loading state
    static showSkeleton() {
        const skeleton = document.querySelector('.movie-card-skeleton');
        const card = document.querySelector('.movie-card-container');
        
        skeleton.style.display = 'flex';
        card.style.display = 'none';
        
        // Simulate loading
        setTimeout(() => {
            skeleton.style.display = 'none';
            card.style.display = 'block';
        }, 2000);
    }

    // Create card from movie data
    static createCard(movieData) {
        const template = `
            <div class="movie-card" data-movie-id="${movieData.id}">
                <div class="card-face card-front">
                    <div class="holographic-layer"></div>
                    <div class="movie-poster">
                        <img src="${movieData.poster}" alt="${movieData.title}" />
                        <div class="rating-ring">
                            <svg class="progress-ring" width="80" height="80">
                                <circle class="progress-ring__circle" stroke="url(#gradient-${movieData.id})" 
                                        stroke-width="6" fill="transparent" r="35" cx="40" cy="40"/>
                                <defs>
                                    <linearGradient id="gradient-${movieData.id}" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" style="stop-color:#ff6b6b;stop-opacity:1" />
                                        <stop offset="100%" style="stop-color:#4ecdc4;stop-opacity:1" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div class="rating-text">${movieData.rating}</div>
                        </div>
                    </div>
                    <div class="movie-info">
                        <h3 class="movie-title">${movieData.title}</h3>
                        <p class="movie-year">${movieData.year}</p>
                        <div class="movie-genres">
                            ${movieData.genres.map(genre => `<span class="genre-tag">${genre}</span>`).join('')}
                        </div>
                    </div>
                </div>
                <div class="card-face card-back">
                    <div class="back-content">
                        <h3 class="movie-title-back">${movieData.title}</h3>
                        <p class="movie-description">${movieData.description}</p>
                        <div class="movie-details">
                            <div class="detail-item">
                                <span class="detail-label">Director:</span>
                                <span class="detail-value">${movieData.director}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Runtime:</span>
                                <span class="detail-value">${movieData.runtime} min</span>
                            </div>
                        </div>
                        <div class="action-buttons">
                            <button class="btn-magnetic btn-watch" data-magnetic>
                                <span class="btn-text">Watch Now</span>
                                <div class="btn-bg"></div>
                            </button>
                            <button class="btn-magnetic btn-love" data-magnetic>
                                <span class="btn-text">Love It</span>
                                <div class="btn-bg"></div>
                                <canvas class="particle-canvas"></canvas>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const container = document.createElement('div');
        container.className = 'movie-card-container';
        container.innerHTML = template;
        
        return container;
    }
}

// Initialize cards when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize existing cards
    const movieCards = document.querySelectorAll('.movie-card');
    movieCards.forEach(card => {
        new AdvancedMovieCard(card);
    });
    
    // Example: Show skeleton loading initially
    // AdvancedMovieCard.showSkeleton();
    
    // Example: Create a new card dynamically
    const exampleMovieData = {
        id: 2,
        title: "The Matrix",
        year: 1999,
        poster: "https://via.placeholder.com/300x450",
        rating: 8.7,
        genres: ["Action", "Sci-Fi"],
        description: "A computer hacker learns about the true nature of reality.",
        director: "The Wachowskis",
        runtime: 136
    };
    
    // Uncomment to add a new card dynamically
    // const newCard = AdvancedMovieCard.createCard(exampleMovieData);
    // document.body.appendChild(newCard);
    // new AdvancedMovieCard(newCard.querySelector('.movie-card'));
});

// Export for use in other modules
window.AdvancedMovieCard = AdvancedMovieCard;
