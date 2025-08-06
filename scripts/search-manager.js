/**
 * SearchManager - Advanced Search & Filtering System
 * Implements PRD-003 requirements for comprehensive movie search
 */

class SearchManager {
    constructor() {
        this.filters = {
            query: '',
            genres: [],
            yearRange: { min: 1900, max: new Date().getFullYear() },
            ratingRange: { min: 0, max: 10 },
            runtime: { min: 0, max: 300 },
            language: '',
            country: '',
            streamingServices: [],
            certification: '',
            keywords: [],
            sortBy: 'popularity',
            sortOrder: 'desc'
        };
        
        this.searchHistory = this.loadSearchHistory();
        this.savedSearches = this.loadSavedSearches();
        this.searchCache = new Map();
        this.debounceTimer = null;
        this.currentPage = 1;
        this.totalPages = 1;
        this.totalResults = 0;
        
        // Genre mapping
        this.genres = {
            '28': 'Action',
            '12': 'Adventure',
            '16': 'Animation',
            '35': 'Comedy',
            '80': 'Crime',
            '99': 'Documentary',
            '18': 'Drama',
            '10751': 'Family',
            '14': 'Fantasy',
            '36': 'History',
            '27': 'Horror',
            '10402': 'Music',
            '9648': 'Mystery',
            '10749': 'Romance',
            '878': 'Science Fiction',
            '10770': 'TV Movie',
            '53': 'Thriller',
            '10752': 'War',
            '37': 'Western'
        };
        
        // Language mapping (most common)
        this.languages = {
            'en': 'English',
            'es': 'Spanish',
            'fr': 'French',
            'de': 'German',
            'it': 'Italian',
            'ja': 'Japanese',
            'ko': 'Korean',
            'zh': 'Chinese',
            'hi': 'Hindi',
            'pt': 'Portuguese',
            'ru': 'Russian',
            'ar': 'Arabic'
        };
        
        // Streaming service IDs
        this.streamingProviders = {
            '8': 'Netflix',
            '9': 'Amazon Prime Video',
            '337': 'Disney Plus',
            '384': 'HBO Max',
            '387': 'Peacock',
            '350': 'Apple TV Plus',
            '531': 'Paramount Plus',
            '15': 'Hulu'
        };
        
        // Sort options
        this.sortOptions = {
            'popularity': 'Popularity',
            'vote_average': 'Rating',
            'primary_release_date': 'Release Date',
            'original_title': 'Title',
            'revenue': 'Box Office'
        };
        
        // Quick filter presets
        this.filterPresets = {
            'trending': {
                name: 'Trending Now',
                filters: {
                    sortBy: 'popularity',
                    yearRange: { min: new Date().getFullYear() - 2, max: new Date().getFullYear() }
                }
            },
            '90s-classics': {
                name: '90s Classics',
                filters: {
                    yearRange: { min: 1990, max: 1999 },
                    ratingRange: { min: 7, max: 10 }
                }
            },
            'short-films': {
                name: 'Short Films',
                filters: {
                    runtime: { min: 0, max: 90 }
                }
            },
            'award-winners': {
                name: 'Award Winners',
                filters: {
                    ratingRange: { min: 8, max: 10 },
                    sortBy: 'vote_average'
                }
            },
            'family-friendly': {
                name: 'Family Friendly',
                filters: {
                    genres: ['10751', '16'],
                    certification: 'G,PG'
                }
            },
            'action-packed': {
                name: 'Action Packed',
                filters: {
                    genres: ['28', '12', '878'],
                    runtime: { min: 90, max: 180 }
                }
            }
        };
    }
    
    /**
     * Apply filters and execute search
     */
    async applyFilters(page = 1) {
        console.log('Applying filters:', this.filters);
        this.currentPage = page;
        
        // Open the Advanced Search modal to show results
        const searchModal = document.getElementById('advancedSearchModal');
        if (searchModal) {
            searchModal.style.display = 'flex';
            console.log('Advanced search modal opened');
        } else {
            console.error('Advanced search modal not found');
        }
        
        // Create cache key
        const cacheKey = JSON.stringify({ ...this.filters, page });
        
        // Check cache
        if (this.searchCache.has(cacheKey)) {
            const cachedResult = this.searchCache.get(cacheKey);
            this.displayResults(cachedResult);
            return cachedResult;
        }
        
        try {
            // Show loading state
            this.showLoading();
            
            // Build API URL
            let apiUrl = `${BASE_URL}/discover/movie?api_key=${API_KEY}`;
            apiUrl += `&page=${page}`;
            apiUrl += `&sort_by=${this.filters.sortBy}.${this.filters.sortOrder}`;
            apiUrl += `&vote_count.gte=10`; // Minimum votes for reliability
            
            // Add query search if present
            if (this.filters.query) {
                apiUrl = `${BASE_URL}/search/movie?api_key=${API_KEY}`;
                apiUrl += `&query=${encodeURIComponent(this.filters.query)}`;
                apiUrl += `&page=${page}`;
            } else {
                // Add filters only for discover endpoint
                if (this.filters.genres.length > 0) {
                    apiUrl += `&with_genres=${this.filters.genres.join(',')}`;
                }
                
                if (this.filters.yearRange) {
                    apiUrl += `&primary_release_date.gte=${this.filters.yearRange.min}-01-01`;
                    apiUrl += `&primary_release_date.lte=${this.filters.yearRange.max}-12-31`;
                }
                
                if (this.filters.ratingRange) {
                    apiUrl += `&vote_average.gte=${this.filters.ratingRange.min}`;
                    apiUrl += `&vote_average.lte=${this.filters.ratingRange.max}`;
                }
                
                if (this.filters.runtime) {
                    apiUrl += `&with_runtime.gte=${this.filters.runtime.min}`;
                    apiUrl += `&with_runtime.lte=${this.filters.runtime.max}`;
                }
                
                if (this.filters.language) {
                    apiUrl += `&with_original_language=${this.filters.language}`;
                }
                
                if (this.filters.keywords.length > 0) {
                    apiUrl += `&with_keywords=${this.filters.keywords.join(',')}`;
                }
                
                if (this.filters.certification) {
                    apiUrl += `&certification_country=US&certification=${this.filters.certification}`;
                }
            }
            
            // Fetch results
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error('Search failed');
            
            const data = await response.json();
            
            // Filter by streaming services if specified
            let results = data.results;
            if (this.filters.streamingServices.length > 0) {
                results = await this.filterByStreamingServices(results);
            }
            
            // Update pagination info
            this.totalPages = data.total_pages;
            this.totalResults = data.total_results;
            
            // Cache results
            const searchResult = {
                results,
                page: data.page,
                totalPages: data.total_pages,
                totalResults: data.total_results
            };
            
            this.searchCache.set(cacheKey, searchResult);
            
            // Add to search history
            if (this.filters.query) {
                this.addToSearchHistory(this.filters.query);
            }
            
            // Display results
            this.displayResults(searchResult);
            
            return searchResult;
            
        } catch (error) {
            console.error('Search error:', error);
            this.showError('Search failed. Please try again.');
            return null;
        }
    }
    
    /**
     * Filter results by streaming service availability
     */
    async filterByStreamingServices(movies) {
        const filteredMovies = [];
        
        for (const movie of movies) {
            try {
                const response = await fetch(
                    `${BASE_URL}/movie/${movie.id}/watch/providers?api_key=${API_KEY}`
                );
                
                if (!response.ok) continue;
                
                const data = await response.json();
                const providers = data.results?.[userCountry]?.flatrate || [];
                
                const hasService = providers.some(provider => 
                    this.filters.streamingServices.includes(provider.provider_id.toString())
                );
                
                if (hasService) {
                    movie.availableOn = providers
                        .filter(p => this.filters.streamingServices.includes(p.provider_id.toString()))
                        .map(p => p.provider_name);
                    filteredMovies.push(movie);
                }
            } catch (error) {
                console.error(`Error checking providers for movie ${movie.id}:`, error);
            }
        }
        
        return filteredMovies;
    }
    
    /**
     * Save current search configuration
     */
    saveSearch(name) {
        const searchConfig = {
            id: Date.now(),
            name,
            filters: { ...this.filters },
            createdAt: new Date().toISOString()
        };
        
        this.savedSearches.push(searchConfig);
        localStorage.setItem('savedSearches', JSON.stringify(this.savedSearches));
        
        this.showToast(`Search "${name}" saved successfully!`);
        return searchConfig;
    }
    
    /**
     * Load a saved search configuration
     */
    loadSearch(searchId) {
        const savedSearch = this.savedSearches.find(s => s.id === searchId);
        
        if (savedSearch) {
            this.filters = { ...savedSearch.filters };
            this.applyFilters();
            this.updateFilterUI();
            this.showToast(`Loaded search: ${savedSearch.name}`);
            return true;
        }
        
        return false;
    }
    
    /**
     * Delete a saved search
     */
    deleteSavedSearch(searchId) {
        this.savedSearches = this.savedSearches.filter(s => s.id !== searchId);
        localStorage.setItem('savedSearches', JSON.stringify(this.savedSearches));
        this.showToast('Search deleted');
    }
    
    /**
     * Clear all active filters
     */
    clearFilters() {
        this.filters = {
            query: '',
            genres: [],
            yearRange: { min: 1900, max: new Date().getFullYear() },
            ratingRange: { min: 0, max: 10 },
            runtime: { min: 0, max: 300 },
            language: '',
            country: '',
            streamingServices: [],
            certification: '',
            keywords: [],
            sortBy: 'popularity',
            sortOrder: 'desc'
        };
        
        this.currentPage = 1;
        this.updateFilterUI();
        this.applyFilters();
    }
    
    /**
     * Apply a filter preset
     */
    applyPreset(presetKey) {
        const preset = this.filterPresets[presetKey];
        
        if (preset) {
            // Clear existing filters
            this.clearFilters();
            
            // Apply preset filters
            Object.keys(preset.filters).forEach(key => {
                this.filters[key] = preset.filters[key];
            });
            
            this.updateFilterUI();
            this.applyFilters();
            this.showToast(`Applied filter: ${preset.name}`);
        }
    }
    
    /**
     * Get shareable URL for current search
     */
    getShareableUrl() {
        const params = new URLSearchParams();
        
        // Add non-default filter values to URL
        if (this.filters.query) params.set('q', this.filters.query);
        if (this.filters.genres.length) params.set('g', this.filters.genres.join(','));
        if (this.filters.yearRange.min !== 1900) params.set('ymin', this.filters.yearRange.min);
        if (this.filters.yearRange.max !== new Date().getFullYear()) params.set('ymax', this.filters.yearRange.max);
        if (this.filters.ratingRange.min !== 0) params.set('rmin', this.filters.ratingRange.min);
        if (this.filters.ratingRange.max !== 10) params.set('rmax', this.filters.ratingRange.max);
        if (this.filters.runtime.min !== 0) params.set('rtmin', this.filters.runtime.min);
        if (this.filters.runtime.max !== 300) params.set('rtmax', this.filters.runtime.max);
        if (this.filters.language) params.set('lang', this.filters.language);
        if (this.filters.streamingServices.length) params.set('stream', this.filters.streamingServices.join(','));
        if (this.filters.sortBy !== 'popularity') params.set('sort', this.filters.sortBy);
        if (this.filters.sortOrder !== 'desc') params.set('order', this.filters.sortOrder);
        
        return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    }
    
    /**
     * Load filters from URL parameters
     */
    loadFromUrl() {
        const params = new URLSearchParams(window.location.search);
        
        if (params.has('q')) this.filters.query = params.get('q');
        if (params.has('g')) this.filters.genres = params.get('g').split(',');
        if (params.has('ymin')) this.filters.yearRange.min = parseInt(params.get('ymin'));
        if (params.has('ymax')) this.filters.yearRange.max = parseInt(params.get('ymax'));
        if (params.has('rmin')) this.filters.ratingRange.min = parseFloat(params.get('rmin'));
        if (params.has('rmax')) this.filters.ratingRange.max = parseFloat(params.get('rmax'));
        if (params.has('rtmin')) this.filters.runtime.min = parseInt(params.get('rtmin'));
        if (params.has('rtmax')) this.filters.runtime.max = parseInt(params.get('rtmax'));
        if (params.has('lang')) this.filters.language = params.get('lang');
        if (params.has('stream')) this.filters.streamingServices = params.get('stream').split(',');
        if (params.has('sort')) this.filters.sortBy = params.get('sort');
        if (params.has('order')) this.filters.sortOrder = params.get('order');
        
        if (params.toString()) {
            this.updateFilterUI();
            this.applyFilters();
        }
    }
    
    /**
     * Add to search history
     */
    addToSearchHistory(query) {
        // Remove if already exists
        this.searchHistory = this.searchHistory.filter(item => item.query !== query);
        
        // Add to beginning
        this.searchHistory.unshift({
            query,
            timestamp: Date.now()
        });
        
        // Keep only last 10
        this.searchHistory = this.searchHistory.slice(0, 10);
        
        localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
    }
    
    /**
     * Load search history from localStorage
     */
    loadSearchHistory() {
        try {
            return JSON.parse(localStorage.getItem('searchHistory') || '[]');
        } catch {
            return [];
        }
    }
    
    /**
     * Load saved searches from localStorage
     */
    loadSavedSearches() {
        try {
            return JSON.parse(localStorage.getItem('savedSearches') || '[]');
        } catch {
            return [];
        }
    }
    
    /**
     * Get search suggestions
     */
    async getSearchSuggestions(query) {
        if (!query || query.length < 2) return [];
        
        try {
            const response = await fetch(
                `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=1`
            );
            
            if (!response.ok) return [];
            
            const data = await response.json();
            return data.results.slice(0, 5).map(movie => ({
                id: movie.id,
                title: movie.title,
                year: movie.release_date ? new Date(movie.release_date).getFullYear() : '',
                poster: movie.poster_path
            }));
            
        } catch (error) {
            console.error('Error getting suggestions:', error);
            return [];
        }
    }
    
    /**
     * Export search configuration
     */
    exportSearches() {
        const data = {
            savedSearches: this.savedSearches,
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `movie-searches-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    /**
     * Import search configuration
     */
    importSearches(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.savedSearches && Array.isArray(data.savedSearches)) {
                    // Merge with existing searches
                    data.savedSearches.forEach(search => {
                        // Assign new ID to avoid conflicts
                        search.id = Date.now() + Math.random();
                        this.savedSearches.push(search);
                    });
                    
                    localStorage.setItem('savedSearches', JSON.stringify(this.savedSearches));
                    this.showToast(`Imported ${data.savedSearches.length} searches`);
                    this.updateSavedSearchesUI();
                }
            } catch (error) {
                console.error('Import error:', error);
                this.showToast('Failed to import searches');
            }
        };
        
        reader.readAsText(file);
    }
    
    // UI Helper Methods
    
    showLoading() {
        const resultsContainer = document.getElementById('advancedSearchResults');
        if (resultsContainer) {
            resultsContainer.innerHTML = `
                <div class="search-loading">
                    <div class="spinner"></div>
                    <p>Searching movies...</p>
                </div>
            `;
        }
    }
    
    showError(message) {
        const resultsContainer = document.getElementById('advancedSearchResults');
        if (resultsContainer) {
            resultsContainer.innerHTML = `
                <div class="search-error">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>${message}</p>
                </div>
            `;
        }
    }
    
    showToast(message) {
        // Use existing toast function if available
        if (typeof window.showToast === 'function') {
            window.showToast(message);
        } else {
            console.log(message);
        }
    }
    
    displayResults(searchResult) {
        const resultsContainer = document.getElementById('advancedSearchResults');
        if (!resultsContainer) {
            console.error('Advanced search results container not found');
            return;
        }
        
        if (!searchResult.results || searchResult.results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-film"></i>
                    <h3>No movies found</h3>
                    <p>Try adjusting your filters or search terms</p>
                    <button class="btn btn-primary" onclick="searchManager.clearFilters()">
                        Clear Filters
                    </button>
                </div>
            `;
            return;
        }
        
        // Results header
        const resultsHTML = `
            <div class="results-header">
                <p class="results-count">
                    Found ${searchResult.totalResults} movies
                    ${this.filters.query ? `for "${this.filters.query}"` : ''}
                </p>
                <div class="view-controls">
                    <button class="view-btn grid-view active" onclick="searchManager.setViewMode('grid')">
                        <i class="fas fa-th"></i>
                    </button>
                    <button class="view-btn list-view" onclick="searchManager.setViewMode('list')">
                        <i class="fas fa-list"></i>
                    </button>
                </div>
            </div>
            
            <div class="search-results-grid">
                ${searchResult.results.map(movie => this.createMovieCard(movie)).join('')}
            </div>
            
            ${this.createPagination(searchResult)}
        `;
        
        resultsContainer.innerHTML = resultsHTML;
    }
    
    createMovieCard(movie) {
        const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
        const rating = movie.vote_average ? (movie.vote_average * 10).toFixed(0) : 'N/A';
        const poster = movie.poster_path 
            ? `${IMAGE_BASE_URL}${movie.poster_path}`
            : 'https://via.placeholder.com/300x450?text=No+Poster';
        
        return `
            <div class="movie-card" onclick="searchManager.selectMovie(${movie.id})">
                <div class="movie-poster">
                    <img src="${poster}" alt="${movie.title}" loading="lazy">
                    ${movie.availableOn ? `
                        <div class="streaming-badges">
                            ${movie.availableOn.map(service => 
                                `<span class="streaming-badge">${service}</span>`
                            ).join('')}
                        </div>
                    ` : ''}
                </div>
                <div class="movie-info">
                    <h3 class="movie-title">${movie.title}</h3>
                    <div class="movie-meta">
                        <span class="movie-year">${year}</span>
                        <span class="movie-rating">
                            <i class="fas fa-star"></i> ${rating}%
                        </span>
                    </div>
                </div>
            </div>
        `;
    }
    
    createPagination(searchResult) {
        if (searchResult.totalPages <= 1) return '';
        
        const currentPage = searchResult.page;
        const totalPages = Math.min(searchResult.totalPages, 500); // TMDB limits to 500 pages
        
        let paginationHTML = '<div class="pagination">';
        
        // Previous button
        if (currentPage > 1) {
            paginationHTML += `
                <button class="pagination-btn" onclick="searchManager.applyFilters(${currentPage - 1})">
                    <i class="fas fa-chevron-left"></i> Previous
                </button>
            `;
        }
        
        // Page numbers
        paginationHTML += '<div class="page-numbers">';
        
        // Calculate page range to show
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, currentPage + 2);
        
        if (startPage > 1) {
            paginationHTML += `
                <button class="page-number" onclick="searchManager.applyFilters(1)">1</button>
                ${startPage > 2 ? '<span class="page-ellipsis">...</span>' : ''}
            `;
        }
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="page-number ${i === currentPage ? 'active' : ''}" 
                        onclick="searchManager.applyFilters(${i})">${i}</button>
            `;
        }
        
        if (endPage < totalPages) {
            paginationHTML += `
                ${endPage < totalPages - 1 ? '<span class="page-ellipsis">...</span>' : ''}
                <button class="page-number" onclick="searchManager.applyFilters(${totalPages})">${totalPages}</button>
            `;
        }
        
        paginationHTML += '</div>';
        
        // Next button
        if (currentPage < totalPages) {
            paginationHTML += `
                <button class="pagination-btn" onclick="searchManager.applyFilters(${currentPage + 1})">
                    Next <i class="fas fa-chevron-right"></i>
                </button>
            `;
        }
        
        paginationHTML += '</div>';
        
        return paginationHTML;
    }
    
    setViewMode(mode) {
        const resultsGrid = document.querySelector('.search-results-grid');
        const gridBtn = document.querySelector('.grid-view');
        const listBtn = document.querySelector('.list-view');
        
        if (mode === 'list') {
            resultsGrid?.classList.add('list-mode');
            gridBtn?.classList.remove('active');
            listBtn?.classList.add('active');
        } else {
            resultsGrid?.classList.remove('list-mode');
            gridBtn?.classList.add('active');
            listBtn?.classList.remove('active');
        }
        
        localStorage.setItem('searchViewMode', mode);
    }
    
    async selectMovie(movieId) {
        try {
            const response = await fetch(
                `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&append_to_response=watch/providers`
            );
            
            if (!response.ok) throw new Error('Failed to fetch movie details');
            
            const movieData = await response.json();
            
            // Close search modal if open
            const searchModal = document.getElementById('advancedSearchModal');
            if (searchModal) {
                searchModal.style.display = 'none';
            }
            
            // Display the movie using existing display function
            if (typeof window.displayMovie === 'function') {
                await window.displayMovie(movieData);
            }
            
            // Track shown movie
            if (typeof window.trackShownMovie === 'function') {
                window.trackShownMovie(movieData.id);
            }
            
        } catch (error) {
            console.error('Error selecting movie:', error);
            this.showToast('Error loading movie details');
        }
    }
    
    updateFilterUI() {
        // This will be implemented in the FilterPanel class
        if (window.filterPanel) {
            window.filterPanel.updateUI(this.filters);
        }
    }
    
    updateSavedSearchesUI() {
        // This will be implemented in the UI
        const savedSearchesList = document.getElementById('savedSearchesList');
        if (savedSearchesList) {
            savedSearchesList.innerHTML = this.savedSearches.map(search => `
                <div class="saved-search-item">
                    <span class="search-name">${search.name}</span>
                    <span class="search-date">${new Date(search.createdAt).toLocaleDateString()}</span>
                    <button onclick="searchManager.loadSearch(${search.id})" class="btn-small">
                        <i class="fas fa-folder-open"></i>
                    </button>
                    <button onclick="searchManager.deleteSavedSearch(${search.id})" class="btn-small btn-danger">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `).join('');
        }
    }
}

// Initialize SearchManager globally
window.searchManager = new SearchManager();
