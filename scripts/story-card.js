/**
 * Story Card Generator for Social Media Sharing
 * Creates Instagram story-like share cards for movies
 */

class StoryCardGenerator {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.cardWidth = 1080; // Instagram story width
        this.cardHeight = 1920; // Instagram story height
    }

    /**
     * Initialize canvas for card generation
     */
    initCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.cardWidth;
        this.canvas.height = this.cardHeight;
        this.ctx = this.canvas.getContext('2d');
    }

    /**
     * Load and draw image with proper scaling
     */
    async loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    /**
     * Draw rounded rectangle
     */
    roundRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
    }

    /**
     * Create gradient background
     */
    createGradientBackground(theme = 'dark') {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.cardHeight);
        
        if (theme === 'dark') {
            gradient.addColorStop(0, '#1a1a2e');
            gradient.addColorStop(0.5, '#16213e');
            gradient.addColorStop(1, '#0f3460');
        } else {
            gradient.addColorStop(0, '#f8b195');
            gradient.addColorStop(0.5, '#f67280');
            gradient.addColorStop(1, '#c06c84');
        }
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.cardWidth, this.cardHeight);
    }

    /**
     * Draw text with word wrap
     */
    wrapText(text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let lines = [];

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = this.ctx.measureText(testLine);
            const testWidth = metrics.width;
            
            if (testWidth > maxWidth && n > 0) {
                lines.push(line);
                line = words[n] + ' ';
            } else {
                line = testLine;
            }
        }
        lines.push(line);

        for (let i = 0; i < lines.length; i++) {
            this.ctx.fillText(lines[i], x, y + (i * lineHeight));
        }

        return lines.length;
    }

    /**
     * Generate story card for a movie
     */
    async generateStoryCard(movie, options = {}) {
        const {
            theme = 'dark',
            includeRating = true,
            includeGenres = true,
            includeOverview = true,
            brandName = 'Which Movie To Watch'
        } = options;

        this.initCanvas();

        // Create gradient background
        this.createGradientBackground(theme);

        // Add subtle pattern overlay
        this.ctx.globalAlpha = 0.1;
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * this.cardWidth;
            const y = Math.random() * this.cardHeight;
            const size = Math.random() * 3 + 1;
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.globalAlpha = 1;

        try {
            // Load and draw movie poster
            const posterUrl = movie.poster_path 
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : '/assets/images/no-poster.png';
            
            const posterImg = await this.loadImage(posterUrl);
            
            // Calculate poster dimensions
            const posterWidth = 800;
            const posterHeight = 1200;
            const posterX = (this.cardWidth - posterWidth) / 2;
            const posterY = 200;
            
            // Draw poster shadow
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            this.ctx.shadowBlur = 30;
            this.ctx.shadowOffsetX = 0;
            this.ctx.shadowOffsetY = 15;
            
            // Draw poster with rounded corners
            this.ctx.save();
            this.roundRect(posterX, posterY, posterWidth, posterHeight, 20);
            this.ctx.clip();
            this.ctx.drawImage(posterImg, posterX, posterY, posterWidth, posterHeight);
            this.ctx.restore();
            
            // Reset shadow
            this.ctx.shadowColor = 'transparent';
            this.ctx.shadowBlur = 0;
            this.ctx.shadowOffsetX = 0;
            this.ctx.shadowOffsetY = 0;

            // Draw content container
            const contentY = posterY + posterHeight + 60;
            const contentPadding = 60;
            const contentWidth = this.cardWidth - (contentPadding * 2);

            // Draw movie title
            this.ctx.font = 'bold 72px Arial';
            this.ctx.fillStyle = '#ffffff';
            this.ctx.textAlign = 'center';
            const titleLines = this.wrapText(
                movie.title || 'Unknown Title',
                this.cardWidth / 2,
                contentY,
                contentWidth,
                85
            );

            // Draw release year and rating
            if (includeRating || movie.release_date) {
                const infoY = contentY + (titleLines * 85) + 40;
                this.ctx.font = '48px Arial';
                this.ctx.fillStyle = '#ffffff99';
                
                let infoText = '';
                if (movie.release_date) {
                    infoText = new Date(movie.release_date).getFullYear().toString();
                }
                if (includeRating && movie.vote_average) {
                    infoText += infoText ? ' • ' : '';
                    infoText += `★ ${movie.vote_average.toFixed(1)}`;
                }
                
                this.ctx.fillText(infoText, this.cardWidth / 2, infoY);
            }

            // Draw genres
            if (includeGenres && movie.genres && movie.genres.length > 0) {
                const genreY = contentY + (titleLines * 85) + 120;
                this.ctx.font = '36px Arial';
                this.ctx.fillStyle = '#ffffffcc';
                const genreText = movie.genres.slice(0, 3).map(g => g.name).join(' • ');
                this.ctx.fillText(genreText, this.cardWidth / 2, genreY);
            }

            // Draw link section
            const linkY = this.cardHeight - 200;
            this.ctx.font = '36px Arial';
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillText('🔗 Visit:', this.cardWidth / 2, linkY);
            
            // Draw the movie link
            const movieLink = `whichmovieto.watch?movie=${movie.id}`;
            this.ctx.font = 'bold 32px Arial';
            this.ctx.fillStyle = '#4ecdc4';
            this.ctx.fillText(movieLink, this.cardWidth / 2, linkY + 45);
            
            // Draw brand footer
            const footerY = this.cardHeight - 100;
            this.ctx.font = 'bold 42px Arial';
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillText(brandName, this.cardWidth / 2, footerY);

            // Add logo or icon
            this.ctx.font = '32px Arial';
            this.ctx.fillStyle = '#ffffff99';
            this.ctx.fillText('Share & Watch Together! 🎬', this.cardWidth / 2, footerY + 40);

        } catch (error) {
            console.error('Error generating story card:', error);
            // Draw error message
            this.ctx.font = '48px Arial';
            this.ctx.fillStyle = '#ffffff';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Failed to load movie poster', this.cardWidth / 2, this.cardHeight / 2);
        }

        return this.canvas;
    }

    /**
     * Generate square card for feed posts
     */
    async generateSquareCard(movie, options = {}) {
        const {
            theme = 'dark',
            size = 1080, // Instagram feed size
            includeRating = true,
            brandName = 'Which Movie To Watch'
        } = options;

        this.canvas = document.createElement('canvas');
        this.canvas.width = size;
        this.canvas.height = size;
        this.ctx = this.canvas.getContext('2d');

        // Create gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, size, size);
        if (theme === 'dark') {
            gradient.addColorStop(0, '#1a1a2e');
            gradient.addColorStop(1, '#0f3460');
        } else {
            gradient.addColorStop(0, '#f8b195');
            gradient.addColorStop(1, '#c06c84');
        }
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, size, size);

        try {
            // Load and draw movie poster
            const posterUrl = movie.poster_path 
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : '/assets/images/no-poster.png';
            
            const posterImg = await this.loadImage(posterUrl);
            
            // Calculate poster dimensions for square layout
            const posterSize = size * 0.6;
            
            // Verify movie.poster_path exists to fetch actual poster
            if (!movie.poster_path) {
                console.error('No poster path available for this movie.');
                showToast('No poster available to generate story.', 'warning');
                return null;
            }
            const posterX = (size - posterSize) / 2;
            const posterY = size * 0.1;
            
            // Draw poster shadow
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            this.ctx.shadowBlur = 20;
            this.ctx.shadowOffsetY = 10;
            
            // Draw poster with rounded corners
            this.ctx.save();
            this.roundRect(posterX, posterY, posterSize, posterSize * 1.5, 15);
            this.ctx.clip();
            this.ctx.drawImage(posterImg, posterX, posterY, posterSize, posterSize * 1.5);
            this.ctx.restore();
            
            // Reset shadow
            this.ctx.shadowColor = 'transparent';

            // Draw movie title
            const titleY = posterY + (posterSize * 1.5) + 60;
            this.ctx.font = `bold ${size * 0.05}px Arial`;
            this.ctx.fillStyle = '#ffffff';
            this.ctx.textAlign = 'center';
            this.wrapText(movie.title, size / 2, titleY, size * 0.8, size * 0.06);

            // Draw rating if included
            if (includeRating && movie.vote_average) {
                this.ctx.font = `${size * 0.04}px Arial`;
                this.ctx.fillStyle = '#ffd700';
                this.ctx.fillText(`★ ${movie.vote_average.toFixed(1)}/10`, size / 2, titleY + size * 0.08);
            }
            
            // Draw link at the bottom
            const linkY = size - 80;
            this.ctx.font = `${size * 0.025}px Arial`;
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillText('whichmovieto.watch?movie=' + movie.id, size / 2, linkY);

            // Draw brand
            this.ctx.font = `${size * 0.025}px Arial`;
            this.ctx.fillStyle = '#ffffff99';
            this.ctx.fillText(brandName, size / 2, size - 30);

        } catch (error) {
            console.error('Error generating square card:', error);
        }

        return this.canvas;
    }

    /**
     * Download canvas as image
     */
    downloadCard(canvas, filename = 'movie-share.png') {
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 'image/png', 1.0);
    }

    /**
     * Share card to clipboard for Instagram
     */
    async copyCardToClipboard(canvas) {
        try {
            canvas.toBlob(async (blob) => {
                const item = new ClipboardItem({ 'image/png': blob });
                await navigator.clipboard.write([item]);
                showToast('Story card copied! You can paste it on Instagram.', 'success');
            }, 'image/png', 1.0);
        } catch (error) {
            console.error('Error copying to clipboard:', error);
            showToast('Please download the image to share on Instagram.', 'info');
            this.downloadCard(canvas, `movie-story-${Date.now()}.png`);
        }
    }
}

// Create global instance
window.storyCardGenerator = new StoryCardGenerator();
