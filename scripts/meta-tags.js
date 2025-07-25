/**
 * Dynamic Meta Tags Management System
 * Handles updating meta tags for social sharing and SEO
 */

class MetaTagsManager {
    constructor() {
        this.defaultMeta = {
            title: "Which Movie To Watch - Find Your Next Movie",
            description: "Discover your next favorite movie! Get personalized movie recommendations based on your streaming services and preferences.",
            image: "https://www.whichmovieto.watch/assets/images/preview.png",
            url: "https://www.whichmovieto.watch"
        };
        
        this.initializeMetaTags();
    }

    /**
     * Initialize meta tags on page load
     */
    initializeMetaTags() {
        // Ensure all necessary meta tags exist
        this.ensureMetaTag('property', 'og:title');
        this.ensureMetaTag('property', 'og:description');
        this.ensureMetaTag('property', 'og:image');
        this.ensureMetaTag('property', 'og:url');
        this.ensureMetaTag('property', 'og:type');
        this.ensureMetaTag('name', 'twitter:card');
        this.ensureMetaTag('name', 'twitter:title');
        this.ensureMetaTag('name', 'twitter:description');
        this.ensureMetaTag('name', 'twitter:image');
        this.ensureMetaTag('name', 'description');
        this.ensureMetaTag('itemprop', 'name');
        this.ensureMetaTag('itemprop', 'description');
        this.ensureMetaTag('itemprop', 'image');
    }

    /**
     * Ensure a meta tag exists, create if not
     */
    ensureMetaTag(attribute, value) {
        let meta = document.querySelector(`meta[${attribute}="${value}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute(attribute, value);
            document.head.appendChild(meta);
        }
        return meta;
    }

    /**
     * Update meta tags for a specific movie
     */
    async updateMovieMeta(movie, externalRatings = null) {
        try {
            const movieData = this.prepareMovieData(movie, externalRatings);
            
            // Update all meta tags
            this.updateBasicMeta(movieData);
            this.updateOpenGraphMeta(movieData);
            this.updateTwitterMeta(movieData);
            this.updateStructuredData(movieData);
            
            // Update browser title
            document.title = movieData.title;
            
            // Update URL if supported
            if (window.history && window.history.replaceState) {
                const movieUrl = `${this.defaultMeta.url}?movie=${movie.id}`;
                window.history.replaceState({ movieId: movie.id }, movieData.title, movieUrl);
            }
            
            console.log('Meta tags updated for:', movie.title);
        } catch (error) {
            console.error('Error updating meta tags:', error);
        }
    }

    /**
     * Prepare movie data for meta tags
     */
    prepareMovieData(movie, externalRatings) {
        const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
        const tmdbRating = movie.vote_average ? (movie.vote_average * 10).toFixed(1) : 'N/A';
        const imdbRating = externalRatings?.imdb || 'N/A';
        const rtRating = externalRatings?.rottenTomatoes || 'N/A';
        
        // Build comprehensive description
        let description = `${movie.title} (${releaseYear})`;
        
        if (imdbRating !== 'N/A') {
            description += ` - IMDb: ${imdbRating}`;
        }
        if (rtRating !== 'N/A') {
            description += ` | Rotten Tomatoes: ${rtRating}`;
        }
        if (tmdbRating !== 'N/A') {
            description += ` | TMDB: ${tmdbRating}%`;
        }
        
        description += `. ${movie.overview ? movie.overview.substring(0, 150) + '...' : 'Watch this amazing movie!'}`;
        
        // Get genres
        const genres = movie.genres ? movie.genres.map(g => g.name).join(', ') : '';
        
        return {
            title: `${movie.title} - Which Movie To Watch`,
            description: description,
            shortDescription: `${movie.title} (${releaseYear}) - ${genres}`,
            image: movie.poster_path ? `https://image.tmdb.org/t/p/w1200${movie.poster_path}` : this.defaultMeta.image,
            url: `${this.defaultMeta.url}?movie=${movie.id}`,
            movieTitle: movie.title,
            releaseYear: releaseYear,
            genres: genres,
            runtime: movie.runtime || 'N/A',
            tmdbRating: tmdbRating,
            imdbRating: imdbRating,
            rtRating: rtRating,
            movieId: movie.id
        };
    }

    /**
     * Update basic meta tags
     */
    updateBasicMeta(data) {
        // Update standard meta tags
        this.updateMetaTag('name', 'description', data.description);
        this.updateMetaTag('name', 'title', data.title);
        
        // Update Schema.org microdata
        this.updateMetaTag('itemprop', 'name', data.title);
        this.updateMetaTag('itemprop', 'description', data.description);
        this.updateMetaTag('itemprop', 'image', data.image);
        
        // Update canonical URL
        let canonical = document.querySelector('link[rel="canonical"]');
        if (canonical) {
            canonical.href = data.url;
        }
    }

    /**
     * Update Open Graph meta tags
     */
    updateOpenGraphMeta(data) {
        this.updateMetaTag('property', 'og:title', data.title);
        this.updateMetaTag('property', 'og:description', data.description);
        this.updateMetaTag('property', 'og:image', data.image);
        this.updateMetaTag('property', 'og:url', data.url);
        this.updateMetaTag('property', 'og:type', 'video.movie');
        
        // Additional Open Graph tags for movies
        this.ensureAndUpdateMetaTag('property', 'video:release_date', data.releaseYear);
        this.ensureAndUpdateMetaTag('property', 'video:tag', data.genres);
        
        // Add structured Open Graph data
        if (data.runtime !== 'N/A') {
            this.ensureAndUpdateMetaTag('property', 'video:duration', data.runtime * 60); // Convert to seconds
        }
    }

    /**
     * Update Twitter Card meta tags
     */
    updateTwitterMeta(data) {
        this.updateMetaTag('name', 'twitter:card', 'summary_large_image');
        this.updateMetaTag('name', 'twitter:title', data.title);
        this.updateMetaTag('name', 'twitter:description', data.description);
        this.updateMetaTag('name', 'twitter:image', data.image);
        this.updateMetaTag('name', 'twitter:image:alt', `${data.movieTitle} poster`);
        
        // Add Twitter-specific labels
        this.ensureAndUpdateMetaTag('name', 'twitter:label1', 'Rating');
        this.ensureAndUpdateMetaTag('name', 'twitter:data1', 
            data.imdbRating !== 'N/A' ? `IMDb: ${data.imdbRating}` : `TMDB: ${data.tmdbRating}%`
        );
        
        this.ensureAndUpdateMetaTag('name', 'twitter:label2', 'Year');
        this.ensureAndUpdateMetaTag('name', 'twitter:data2', data.releaseYear);
    }

    /**
     * Update structured data for the current movie
     */
    updateStructuredData(data) {
        // Find or create the movie structured data script
        let structuredScript = document.querySelector('#movie-structured-data');
        if (!structuredScript) {
            structuredScript = document.createElement('script');
            structuredScript.type = 'application/ld+json';
            structuredScript.id = 'movie-structured-data';
            document.head.appendChild(structuredScript);
        }

        const structuredData = {
            "@context": "https://schema.org",
            "@type": "Movie",
            "name": data.movieTitle,
            "url": data.url,
            "image": data.image,
            "dateCreated": data.releaseYear,
            "description": data.description,
            "genre": data.genres.split(', '),
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": parseFloat(data.tmdbRating) / 20, // Convert to 5-star scale
                "bestRating": "5",
                "worstRating": "1",
                "ratingCount": "1000" // You could make this dynamic
            }
        };

        // Add IMDb rating if available
        if (data.imdbRating !== 'N/A') {
            structuredData.aggregateRating.alternateName = "IMDb";
            structuredData.aggregateRating.ratingValue = parseFloat(data.imdbRating.split('/')[0]);
        }

        structuredScript.textContent = JSON.stringify(structuredData, null, 2);
    }

    /**
     * Helper to update a meta tag
     */
    updateMetaTag(attribute, value, content) {
        const meta = document.querySelector(`meta[${attribute}="${value}"]`);
        if (meta) {
            meta.content = content;
        }
    }

    /**
     * Helper to ensure and update a meta tag
     */
    ensureAndUpdateMetaTag(attribute, value, content) {
        let meta = document.querySelector(`meta[${attribute}="${value}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute(attribute, value);
            document.head.appendChild(meta);
        }
        meta.content = content;
    }

    /**
     * Reset meta tags to defaults
     */
    resetToDefaults() {
        this.updateBasicMeta(this.defaultMeta);
        this.updateOpenGraphMeta(this.defaultMeta);
        this.updateTwitterMeta(this.defaultMeta);
        
        // Remove movie-specific structured data
        const movieStructuredData = document.querySelector('#movie-structured-data');
        if (movieStructuredData) {
            movieStructuredData.remove();
        }
        
        // Reset title
        document.title = this.defaultMeta.title;
        
        // Reset URL
        if (window.history && window.history.replaceState) {
            window.history.replaceState({}, this.defaultMeta.title, this.defaultMeta.url);
        }
    }

    /**
     * Generate share URLs for social platforms
     */
    generateShareUrls(movie) {
        const movieData = this.prepareMovieData(movie);
        const encodedUrl = encodeURIComponent(movieData.url);
        const encodedTitle = encodeURIComponent(movieData.title);
        const encodedDescription = encodeURIComponent(movieData.shortDescription);
        
        return {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedDescription}`,
            instagram: `instagram://user?username=_u`, // Instagram doesn't support direct web sharing with pre-filled content
            whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
            telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
            reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
            pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodeURIComponent(movieData.image)}&description=${encodedDescription}`,
            email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%20${encodedUrl}`
        };
    }

    /**
     * Handle SPA navigation
     */
    handleNavigation() {
        // Listen for popstate events (browser back/forward)
        window.addEventListener('popstate', (event) => {
            if (event.state && event.state.movieId) {
                // Fetch and display the movie from the state
                // This would need to be integrated with your existing movie display logic
                console.log('Navigate to movie:', event.state.movieId);
            } else {
                // Return to default state
                this.resetToDefaults();
            }
        });
    }

    /**
     * Preview meta tags (for debugging)
     */
    previewMetaTags() {
        const preview = {
            title: document.title,
            description: document.querySelector('meta[name="description"]')?.content,
            ogTitle: document.querySelector('meta[property="og:title"]')?.content,
            ogDescription: document.querySelector('meta[property="og:description"]')?.content,
            ogImage: document.querySelector('meta[property="og:image"]')?.content,
            twitterTitle: document.querySelector('meta[name="twitter:title"]')?.content,
            twitterDescription: document.querySelector('meta[name="twitter:description"]')?.content,
            twitterImage: document.querySelector('meta[name="twitter:image"]')?.content
        };
        
        console.table(preview);
        return preview;
    }
}

// Create global instance
const metaTagsManager = new MetaTagsManager();

// Export for use in other modules
window.metaTagsManager = metaTagsManager;

// Example integration with existing movie display function
// This would be added to your existing displayMovie function
function updateMetaForMovie(movie, externalRatings) {
    metaTagsManager.updateMovieMeta(movie, externalRatings);
}

// Share button implementation
function createShareButtons(movie) {
    const shareUrls = metaTagsManager.generateShareUrls(movie);
    const movieTitle = movie.title || 'this movie';
    
    // Function to handle Instagram share with story card
    const handleInstagramShare = async () => {
        showToast('Creating your Instagram story...', 'info');

        try {
            // Fetch and generate the story card
            const storyCard = await window.storyCardGenerator.generateStoryCard(movie, {
                theme: document.body.classList.contains('light-mode') ? 'light' : 'dark',
                includePoster: true,  // Added support for poster
                includeRating: true,
                includeGenres: true
            });

            if (storyCard) {
                await window.storyCardGenerator.downloadCard(storyCard, `${movie.title.replace(/[^a-z0-9]/gi, '_')}_instagram.png`);
                showToast('Story card created and downloaded for Instagram.', 'success');
            }

            // Copy the link text for easy sharing
            const movieLink = `${window.location.origin}?movie=${movie.id}`;
            const shareText = `Check out ${movieTitle} on Which Movie To Watch!\n${movieLink}`;

            // Try to copy text after a delay
            setTimeout(() => {
                navigator.clipboard.writeText(shareText).then(() => {
                    showToast('Link copied! Paste in Instagram.', 'success');
                }).catch((err) => {
                    console.log('Could not copy link text:', err);
                });
            }, 1000);
        } catch (error) {
            console.error('Error creating Instagram story card:', error);
            showToast('Error creating Instagram story. Please try again.', 'error');
        }
    };
    
    // Function to handle Facebook share with story card
    const handleFacebookShare = async () => {
        showToast('Creating your share card...', 'info');
        
        try {
            const squareCard = await window.storyCardGenerator.generateSquareCard(movie, {
                theme: document.body.classList.contains('light-mode') ? 'light' : 'dark',
                includeRating: true
            });
            
            // Download the card for Facebook upload
            window.storyCardGenerator.downloadCard(squareCard, `${movie.title.replace(/[^a-z0-9]/gi, '_')}_facebook.png`);
            showToast('Card downloaded! You can upload it to Facebook.', 'success');
            
            // Also open Facebook share dialog
            setTimeout(() => {
                window.open(shareUrls.facebook, '_blank');
            }, 1000);
        } catch (error) {
            console.error('Error creating Facebook card:', error);
            window.open(shareUrls.facebook, '_blank');
        }
    };
    
    // Function to handle WhatsApp share with story card
    const handleWhatsAppShare = async () => {
        showToast('Creating your share card...', 'info');
        
        try {
            const storyCard = await window.storyCardGenerator.generateStoryCard(movie, {
                theme: document.body.classList.contains('light-mode') ? 'light' : 'dark',
                includeRating: true,
                includeGenres: true
            });
            
            // Copy to clipboard for WhatsApp
            await window.storyCardGenerator.copyCardToClipboard(storyCard);
            
            // Open WhatsApp share
            setTimeout(() => {
                window.open(shareUrls.whatsapp, '_blank');
            }, 1000);
        } catch (error) {
            console.error('Error creating WhatsApp card:', error);
            window.open(shareUrls.whatsapp, '_blank');
        }
    };
    
    // Attach handlers to window for onclick
    window.handleInstagramShare = handleInstagramShare;
    window.handleFacebookShare = handleFacebookShare;
    window.handleWhatsAppShare = handleWhatsAppShare;
    
    return `
        <div class="share-container-minimal">
            <div class="share-label">Share:</div>
            <div class="share-buttons-minimal">
                <button onclick="handleFacebookShare()" class="share-btn-minimal facebook" title="Share on Facebook" aria-label="Share on Facebook">
                    <i class="fab fa-facebook-f"></i>
                </button>
                <a href="${shareUrls.twitter}" target="_blank" rel="noopener" class="share-btn-minimal twitter" title="Share on X (Twitter)" aria-label="Share on X">
                    <i class="fab fa-twitter"></i>
                </a>
                <button onclick="handleInstagramShare()" class="share-btn-minimal instagram" title="Share on Instagram" aria-label="Share on Instagram">
                    <i class="fab fa-instagram"></i>
                </button>
                <button onclick="handleWhatsAppShare()" class="share-btn-minimal whatsapp" title="Share on WhatsApp" aria-label="Share on WhatsApp">
                    <i class="fab fa-whatsapp"></i>
                </button>
                <a href="${shareUrls.reddit}" target="_blank" rel="noopener" class="share-btn-minimal reddit" title="Share on Reddit" aria-label="Share on Reddit">
                    <i class="fab fa-reddit-alien"></i>
                </a>
                <button onclick="navigator.clipboard.writeText('${window.location.origin}?movie=${movie.id}').then(() => showToast('Link copied!', 'success')).catch(() => showToast('Failed to copy', 'error'))" class="share-btn-minimal link" title="Copy Link" aria-label="Copy Link">
                    <i class="fas fa-link"></i>
                </button>
            </div>
        </div>
    `;
}

// Export createShareButtons globally
window.createShareButtons = createShareButtons;
