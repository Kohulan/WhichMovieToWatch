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
            
            // For TMDB images, we'll use a CORS proxy
            if (src && src.includes('image.tmdb.org')) {
                // Use CORS proxy to load TMDB images
                const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(src)}`;
                
                img.crossOrigin = 'anonymous';
                img.onload = () => {
                    console.log('Successfully loaded movie poster via proxy');
                    resolve(img);
                };
                img.onerror = () => {
                    console.log('Failed to load poster, using stylized placeholder');
                    this.createPlaceholderImage(resolve);
                };
                img.src = proxyUrl;
            } else if (src) {
                // For local images or other sources
                img.crossOrigin = 'anonymous';
                img.onload = () => resolve(img);
                img.onerror = () => this.createPlaceholderImage(resolve);
                img.src = src;
            } else {
                // No source provided
                this.createPlaceholderImage(resolve);
            }
        });
    }

    /**
     * Create a styled placeholder image
     */
    createPlaceholderImage(resolve) {
        const canvas = document.createElement('canvas');
        canvas.width = 500;
        canvas.height = 750;
        const ctx = canvas.getContext('2d');
        
        // Create gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add movie icon
        ctx.fillStyle = '#ffffff';
        ctx.font = '120px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🎬', canvas.width / 2, canvas.height / 2);
        
        // Convert canvas to image
        const placeholderImg = new Image();
        placeholderImg.onload = () => resolve(placeholderImg);
        placeholderImg.src = canvas.toDataURL();
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
     * Draw rounded rectangle with custom context
     */
    drawRoundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    /**
     * Wrap text with custom context
     */
    wrapTextOnCanvas(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let lines = [];

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
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
            ctx.fillText(lines[i], x, y + (i * lineHeight));
        }

        return lines.length;
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

        // Try to load the actual movie poster
        const posterWidth = 800;
        const posterHeight = 1200;
        const posterX = (this.cardWidth - posterWidth) / 2;
        const posterY = 200;
        
        try {
            // Attempt to load the movie poster
            if (movie.poster_path) {
                const posterUrl = `https://image.tmdb.org/t/p/w780${movie.poster_path}`;
                const posterImg = await this.loadImage(posterUrl);
                
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
            } else {
                throw new Error('No poster path available');
            }
        } catch (error) {
            console.log('Failed to load poster, using fallback design');
            
            // Fallback: Draw poster placeholder with gradient
            const posterGradient = this.ctx.createLinearGradient(posterX, posterY, posterX + posterWidth, posterY + posterHeight);
            if (theme === 'dark') {
                posterGradient.addColorStop(0, '#2d3561');
                posterGradient.addColorStop(1, '#0f3460');
            } else {
                posterGradient.addColorStop(0, '#f8b195');
                posterGradient.addColorStop(1, '#c06c84');
            }
            
            // Draw poster shadow
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            this.ctx.shadowBlur = 30;
            this.ctx.shadowOffsetX = 0;
            this.ctx.shadowOffsetY = 15;
            
            // Draw poster background
            this.ctx.save();
            this.roundRect(posterX, posterY, posterWidth, posterHeight, 20);
            this.ctx.fillStyle = posterGradient;
            this.ctx.fill();
            
            // Add movie icon in poster area
            this.ctx.shadowColor = 'transparent';
            this.ctx.fillStyle = '#ffffff20';
            this.ctx.font = '300px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('🎬', this.cardWidth / 2, posterY + posterHeight / 2 + 50);
            
            // Draw movie title in poster area
            this.ctx.font = 'bold 96px Arial';
            this.ctx.fillStyle = '#ffffff';
            const titleInPoster = this.wrapText(
                movie.title || 'Unknown Title',
                this.cardWidth / 2,
                posterY + posterHeight / 2 + 150,
                posterWidth - 100,
                110
            );
            
            this.ctx.restore();
        }
        
        // Reset shadow
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;

        // Draw content container
        const contentY = posterY + posterHeight + 60;
        const contentPadding = 60;
        const contentWidth = this.cardWidth - (contentPadding * 2);

        // Draw release year and rating
        if (includeRating || movie.release_date) {
            const infoY = contentY;
            this.ctx.font = '48px Arial';
            this.ctx.fillStyle = '#ffffff99';
            this.ctx.textAlign = 'center';
            
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
            const genreY = contentY + 80;
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

        console.log('Generating square card for:', movie.title);

        // Create a new canvas for square card
        const squareCanvas = document.createElement('canvas');
        squareCanvas.width = size;
        squareCanvas.height = size;
        const ctx = squareCanvas.getContext('2d');

        // Fill with solid color first to ensure visibility
        ctx.fillStyle = theme === 'dark' ? '#1a1a2e' : '#f8b195';
        ctx.fillRect(0, 0, size, size);

        // Create gradient background overlay
        const gradient = ctx.createLinearGradient(0, 0, size, size);
        if (theme === 'dark') {
            gradient.addColorStop(0, 'rgba(26, 26, 46, 0.8)');
            gradient.addColorStop(1, 'rgba(15, 52, 96, 1)');
        } else {
            gradient.addColorStop(0, 'rgba(248, 177, 149, 0.8)');
            gradient.addColorStop(1, 'rgba(198, 108, 132, 1)');
        }
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        // Try to load actual movie poster for square card
        const posterSize = size * 0.6;
        const posterX = (size - posterSize) / 2;
        const posterY = size * 0.1;
        
        let posterLoaded = false;
        
        // Attempt to load the actual poster
        if (movie.poster_path) {
            try {
                console.log('Attempting to load poster for square card...');
                const posterUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
                const posterImg = await this.loadImage(posterUrl);
                
                // If we got here, the image loaded successfully
                ctx.save();
                this.drawRoundedRect(ctx, posterX, posterY, posterSize, posterSize, 15);
                ctx.clip();
                
                // Draw the poster image
                ctx.drawImage(posterImg, posterX, posterY, posterSize, posterSize);
                ctx.restore();
                
                posterLoaded = true;
                console.log('Poster loaded successfully for square card!');
            } catch (error) {
                console.log('Failed to load poster for square card:', error);
                posterLoaded = false;
            }
        }
        
        // If poster didn't load, create stylized placeholder
        if (!posterLoaded) {
            console.log('Using stylized placeholder for square card');
            // Draw poster placeholder with gradient
            const posterGradient = ctx.createLinearGradient(posterX, posterY, posterX + posterSize, posterY + posterSize);
            if (theme === 'dark') {
                posterGradient.addColorStop(0, '#2d3561');
                posterGradient.addColorStop(1, '#0f3460');
            } else {
                posterGradient.addColorStop(0, '#f8b195');
                posterGradient.addColorStop(1, '#c06c84');
            }
            
            // Draw poster shadow
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 20;
            ctx.shadowOffsetY = 10;
            
            // Draw poster background
            ctx.save();
            this.drawRoundedRect(ctx, posterX, posterY, posterSize, posterSize, 15);
            ctx.fillStyle = posterGradient;
            ctx.fill();
            
            // Add movie icon in poster area
            ctx.shadowColor = 'transparent';
            ctx.fillStyle = '#ffffff20';
            ctx.font = `${size * 0.2}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText('🎬', size / 2, posterY + posterSize / 2);
            
            // Draw movie title in poster area
            ctx.font = `bold ${size * 0.08}px Arial`;
            ctx.fillStyle = '#ffffff';
            this.wrapTextOnCanvas(
                ctx,
                movie.title || 'Unknown Title',
                size / 2,
                posterY + posterSize / 2 + size * 0.1,
                posterSize - 40,
                size * 0.09
            );
            
            ctx.restore();
        }
        
        // Reset shadow
        ctx.shadowColor = 'transparent';

        // Draw rating and info below poster
        const infoY = posterY + posterSize + 40;
        
        if (includeRating && movie.vote_average) {
            ctx.font = `${size * 0.04}px Arial`;
            ctx.fillStyle = '#ffd700';
            ctx.textAlign = 'center';
            ctx.fillText(`★ ${movie.vote_average.toFixed(1)}/10`, size / 2, infoY);
        }
        
        // Draw genres if available
        if (movie.genres && movie.genres.length > 0) {
            ctx.font = `${size * 0.025}px Arial`;
            ctx.fillStyle = '#ffffffcc';
            const genreText = movie.genres.slice(0, 2).map(g => g.name).join(' • ');
            ctx.fillText(genreText, size / 2, infoY + 40);
        }
        
        // Draw link at the bottom
        const linkY = size - 80;
        ctx.font = `${size * 0.025}px Arial`;
        ctx.fillStyle = '#ffffff';
        ctx.fillText('whichmovieto.watch?movie=' + movie.id, size / 2, linkY);

        // Draw brand
        ctx.font = `${size * 0.025}px Arial`;
        ctx.fillStyle = '#ffffff99';
        ctx.fillText(brandName, size / 2, size - 30);

        return squareCanvas;
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
try {
    window.storyCardGenerator = new StoryCardGenerator();
    console.log('Story card generator initialized successfully');
} catch (error) {
    console.error('Failed to initialize story card generator:', error);
}
