/**
 * FilterPanel - Advanced Filter UI Management
 * Handles all filter UI components and interactions
 */

class FilterPanel {
    constructor() {
        this.activeFilters = new Set();
        this.isOpen = false;
        this.isMobile = window.innerWidth < 768;
        
        // Debounce timers
        this.debounceTimers = {};
        
        // Initialize on DOM ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.isMobile = window.innerWidth < 768;
            this.adjustLayout();
        });
    }
    
    init() {
        this.createFilterPanel();
        this.attachEventListeners();
        this.loadSavedState();
    }
    
    createFilterPanel() {
        // Check if panel already exists
        if (document.getElementById('filterPanel')) return;
        
        const panelHTML = `
            <div id="filterPanel" class="filter-panel ${this.isMobile ? 'mobile' : 'desktop'}">
                <div class="filter-panel-header">
                    <h3>Filters</h3>
                    <button class="filter-close-btn" onclick="filterPanel.togglePanel()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="filter-panel-body">
                    <!-- Quick Presets -->
                    <div class="filter-section">
                        <h4>Quick Filters</h4>
                        <div class="preset-buttons">
                            <button class="preset-btn" onclick="searchManager.applyPreset('trending')">
                                <i class="fas fa-fire"></i> Trending
                            </button>
                            <button class="preset-btn" onclick="searchManager.applyPreset('90s-classics')">
                                <i class="fas fa-compact-disc"></i> 90s Classics
                            </button>
                            <button class="preset-btn" onclick="searchManager.applyPreset('short-films')">
                                <i class="fas fa-clock"></i> Short Films
                            </button>
                            <button class="preset-btn" onclick="searchManager.applyPreset('award-winners')">
                                <i class="fas fa-trophy"></i> Award Winners
                            </button>
                            <button class="preset-btn" onclick="searchManager.applyPreset('family-friendly')">
                                <i class="fas fa-child"></i> Family
                            </button>
                            <button class="preset-btn" onclick="searchManager.applyPreset('action-packed')">
                                <i class="fas fa-rocket"></i> Action
                            </button>
                        </div>
                    </div>
                    
                    <!-- Search Bar -->
                    <div class="filter-section">
                        <h4>Search</h4>
                        <div class="search-input-wrapper">
                            <input type="text" 
                                   id="advancedSearchInput" 
                                   class="filter-search-input" 
                                   placeholder="Search movies, actors, directors..."
                                   autocomplete="off">
                            <div id="searchSuggestions" class="search-suggestions"></div>
                        </div>
                        <div id="searchHistoryWrapper" class="search-history-wrapper">
                            <h5>Recent Searches</h5>
                            <div id="searchHistory" class="search-history"></div>
                        </div>
                    </div>
                    
                    <!-- Genre Filter -->
                    <div class="filter-section">
                        <h4>Genres</h4>
                        <div id="genreFilter" class="genre-filter">
                            ${Object.entries(searchManager.genres).map(([id, name]) => `
                                <label class="genre-checkbox">
                                    <input type="checkbox" value="${id}" onchange="filterPanel.updateGenres(this)">
                                    <span>${name}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- Year Range -->
                    <div class="filter-section">
                        <h4>Release Year</h4>
                        <div class="range-slider-container">
                            <div class="range-values">
                                <span id="yearMin">1900</span> - <span id="yearMax">${new Date().getFullYear()}</span>
                            </div>
                            <div class="dual-range-slider">
                                <input type="range" 
                                       id="yearRangeMin" 
                                       min="1900" 
                                       max="${new Date().getFullYear()}" 
                                       value="1900" 
                                       class="range-slider"
                                       oninput="filterPanel.updateYearRange()">
                                <input type="range" 
                                       id="yearRangeMax" 
                                       min="1900" 
                                       max="${new Date().getFullYear()}" 
                                       value="${new Date().getFullYear()}" 
                                       class="range-slider"
                                       oninput="filterPanel.updateYearRange()">
                            </div>
                        </div>
                    </div>
                    
                    <!-- Rating Range -->
                    <div class="filter-section">
                        <h4>Rating</h4>
                        <div class="range-slider-container">
                            <div class="range-values">
                                <span id="ratingMin">0</span> - <span id="ratingMax">10</span>
                            </div>
                            <div class="dual-range-slider">
                                <input type="range" 
                                       id="ratingRangeMin" 
                                       min="0" 
                                       max="10" 
                                       value="0" 
                                       step="0.5"
                                       class="range-slider"
                                       oninput="filterPanel.updateRatingRange()">
                                <input type="range" 
                                       id="ratingRangeMax" 
                                       min="0" 
                                       max="10" 
                                       value="10" 
                                       step="0.5"
                                       class="range-slider"
                                       oninput="filterPanel.updateRatingRange()">
                            </div>
                        </div>
                    </div>
                    
                    <!-- Runtime Range -->
                    <div class="filter-section">
                        <h4>Runtime (minutes)</h4>
                        <div class="range-slider-container">
                            <div class="range-values">
                                <span id="runtimeMin">0</span> - <span id="runtimeMax">300</span>
                            </div>
                            <div class="dual-range-slider">
                                <input type="range" 
                                       id="runtimeRangeMin" 
                                       min="0" 
                                       max="300" 
                                       value="0" 
                                       step="10"
                                       class="range-slider"
                                       oninput="filterPanel.updateRuntimeRange()">
                                <input type="range" 
                                       id="runtimeRangeMax" 
                                       min="0" 
                                       max="300" 
                                       value="300" 
                                       step="10"
                                       class="range-slider"
                                       oninput="filterPanel.updateRuntimeRange()">
                            </div>
                        </div>
                    </div>
                    
                    <!-- Language Filter -->
                    <div class="filter-section">
                        <h4>Language</h4>
                        <select id="languageFilter" class="filter-select" onchange="filterPanel.updateLanguage()">
                            <option value="">Any Language</option>
                            ${Object.entries(searchManager.languages).map(([code, name]) => `
                                <option value="${code}">${name}</option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <!-- Streaming Services -->
                    <div class="filter-section">
                        <h4>Streaming Services</h4>
                        <div id="streamingFilter" class="streaming-filter">
                            ${Object.entries(searchManager.streamingProviders).map(([id, name]) => `
                                <label class="streaming-checkbox">
                                    <input type="checkbox" value="${id}" onchange="filterPanel.updateStreaming(this)">
                                    <span>${name}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- Sort Options -->
                    <div class="filter-section">
                        <h4>Sort By</h4>
                        <div class="sort-controls">
                            <select id="sortBy" class="filter-select" onchange="filterPanel.updateSort()">
                                ${Object.entries(searchManager.sortOptions).map(([value, label]) => `
                                    <option value="${value}">${label}</option>
                                `).join('')}
                            </select>
                            <div class="sort-order-buttons">
                                <button id="sortAsc" class="sort-order-btn" onclick="filterPanel.setSortOrder('asc')">
                                    <i class="fas fa-sort-amount-up"></i>
                                </button>
                                <button id="sortDesc" class="sort-order-btn active" onclick="filterPanel.setSortOrder('desc')">
                                    <i class="fas fa-sort-amount-down"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Saved Searches -->
                    <div class="filter-section">
                        <h4>Saved Searches</h4>
                        <div class="saved-search-controls">
                            <button class="btn-small btn-primary" onclick="filterPanel.saveCurrentSearch()">
                                <i class="fas fa-save"></i> Save Current
                            </button>
                            <button class="btn-small" onclick="filterPanel.showImportExport()">
                                <i class="fas fa-file-import"></i> Import/Export
                            </button>
                        </div>
                        <div id="savedSearchesList" class="saved-searches-list"></div>
                    </div>
                </div>
                
                <div class="filter-panel-footer">
                    <button class="btn btn-secondary" onclick="searchManager.clearFilters()">
                        <i class="fas fa-times"></i> Clear All
                    </button>
                    <button class="btn btn-primary" onclick="searchManager.applyFilters()">
                        <i class="fas fa-search"></i> Apply Filters
                    </button>
                </div>
            </div>
            
            <!-- Active Filters Display -->
            <div id="activeFiltersBar" class="active-filters-bar">
                <div class="active-filters-container">
                    <span class="active-filters-label">Active Filters:</span>
                    <div id="activeFilterChips" class="filter-chips"></div>
                    <button class="clear-filters-btn" onclick="searchManager.clearFilters()">
                        Clear All
                    </button>
                </div>
            </div>
            
            <!-- Mobile Filter Toggle Button -->
            <button id="mobileFilterToggle" class="mobile-filter-toggle" onclick="filterPanel.togglePanel()">
                <i class="fas fa-filter"></i>
                <span class="filter-count" id="filterCount"></span>
            </button>
        `;
        
        // Insert panel into page
        const container = document.createElement('div');
        container.innerHTML = panelHTML;
        document.body.appendChild(container.firstElementChild);
        
        // Add other UI elements
        if (document.getElementById('activeFiltersBar')) {
            document.body.appendChild(container.children[0]);
        }
        if (document.getElementById('mobileFilterToggle')) {
            document.body.appendChild(container.children[0]);
        }
    }
    
    attachEventListeners() {
        // Search input with debounce
        const searchInput = document.getElementById('advancedSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce((e) => {
                searchManager.filters.query = e.target.value;
                this.showSearchSuggestions(e.target.value);
            }, 300));
            
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    searchManager.applyFilters();
                }
            });
        }
        
        // Close panel on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.togglePanel();
            }
        });
        
        // Update search history display
        this.updateSearchHistory();
        
        // Update saved searches display
        searchManager.updateSavedSearchesUI();
    }
    
    togglePanel() {
        const panel = document.getElementById('filterPanel');
        if (!panel) return;
        
        this.isOpen = !this.isOpen;
        
        if (this.isOpen) {
            panel.classList.add('open');
            if (this.isMobile) {
                document.body.style.overflow = 'hidden';
            }
        } else {
            panel.classList.remove('open');
            if (this.isMobile) {
                document.body.style.overflow = '';
            }
        }
    }
    
    updateGenres(checkbox) {
        if (checkbox.checked) {
            searchManager.filters.genres.push(checkbox.value);
        } else {
            searchManager.filters.genres = searchManager.filters.genres.filter(g => g !== checkbox.value);
        }
        this.updateActiveFilters();
    }
    
    updateYearRange() {
        const minInput = document.getElementById('yearRangeMin');
        const maxInput = document.getElementById('yearRangeMax');
        
        let min = parseInt(minInput.value);
        let max = parseInt(maxInput.value);
        
        // Prevent overlap
        if (min > max) {
            [min, max] = [max, min];
            minInput.value = min;
            maxInput.value = max;
        }
        
        searchManager.filters.yearRange = { min, max };
        
        document.getElementById('yearMin').textContent = min;
        document.getElementById('yearMax').textContent = max;
        
        this.updateActiveFilters();
    }
    
    updateRatingRange() {
        const minInput = document.getElementById('ratingRangeMin');
        const maxInput = document.getElementById('ratingRangeMax');
        
        let min = parseFloat(minInput.value);
        let max = parseFloat(maxInput.value);
        
        // Prevent overlap
        if (min > max) {
            [min, max] = [max, min];
            minInput.value = min;
            maxInput.value = max;
        }
        
        searchManager.filters.ratingRange = { min, max };
        
        document.getElementById('ratingMin').textContent = min;
        document.getElementById('ratingMax').textContent = max;
        
        this.updateActiveFilters();
    }
    
    updateRuntimeRange() {
        const minInput = document.getElementById('runtimeRangeMin');
        const maxInput = document.getElementById('runtimeRangeMax');
        
        let min = parseInt(minInput.value);
        let max = parseInt(maxInput.value);
        
        // Prevent overlap
        if (min > max) {
            [min, max] = [max, min];
            minInput.value = min;
            maxInput.value = max;
        }
        
        searchManager.filters.runtime = { min, max };
        
        document.getElementById('runtimeMin').textContent = min;
        document.getElementById('runtimeMax').textContent = max;
        
        this.updateActiveFilters();
    }
    
    updateLanguage() {
        const select = document.getElementById('languageFilter');
        searchManager.filters.language = select.value;
        this.updateActiveFilters();
    }
    
    updateStreaming(checkbox) {
        if (checkbox.checked) {
            searchManager.filters.streamingServices.push(checkbox.value);
        } else {
            searchManager.filters.streamingServices = searchManager.filters.streamingServices.filter(
                s => s !== checkbox.value
            );
        }
        this.updateActiveFilters();
    }
    
    updateSort() {
        const select = document.getElementById('sortBy');
        searchManager.filters.sortBy = select.value;
    }
    
    setSortOrder(order) {
        searchManager.filters.sortOrder = order;
        
        document.getElementById('sortAsc').classList.toggle('active', order === 'asc');
        document.getElementById('sortDesc').classList.toggle('active', order === 'desc');
    }
    
    updateActiveFilters() {
        const chipsContainer = document.getElementById('activeFilterChips');
        const filterCount = document.getElementById('filterCount');
        const activeBar = document.getElementById('activeFiltersBar');
        
        if (!chipsContainer) return;
        
        const chips = [];
        
        // Query
        if (searchManager.filters.query) {
            chips.push({
                label: `Search: "${searchManager.filters.query}"`,
                remove: () => {
                    searchManager.filters.query = '';
                    document.getElementById('advancedSearchInput').value = '';
                }
            });
        }
        
        // Genres
        searchManager.filters.genres.forEach(genreId => {
            chips.push({
                label: searchManager.genres[genreId],
                remove: () => {
                    searchManager.filters.genres = searchManager.filters.genres.filter(g => g !== genreId);
                    const checkbox = document.querySelector(`#genreFilter input[value="${genreId}"]`);
                    if (checkbox) checkbox.checked = false;
                }
            });
        });
        
        // Year range (if not default)
        if (searchManager.filters.yearRange.min !== 1900 || 
            searchManager.filters.yearRange.max !== new Date().getFullYear()) {
            chips.push({
                label: `Year: ${searchManager.filters.yearRange.min}-${searchManager.filters.yearRange.max}`,
                remove: () => {
                    searchManager.filters.yearRange = { min: 1900, max: new Date().getFullYear() };
                    document.getElementById('yearRangeMin').value = 1900;
                    document.getElementById('yearRangeMax').value = new Date().getFullYear();
                    this.updateYearRange();
                }
            });
        }
        
        // Rating range (if not default)
        if (searchManager.filters.ratingRange.min !== 0 || searchManager.filters.ratingRange.max !== 10) {
            chips.push({
                label: `Rating: ${searchManager.filters.ratingRange.min}-${searchManager.filters.ratingRange.max}`,
                remove: () => {
                    searchManager.filters.ratingRange = { min: 0, max: 10 };
                    document.getElementById('ratingRangeMin').value = 0;
                    document.getElementById('ratingRangeMax').value = 10;
                    this.updateRatingRange();
                }
            });
        }
        
        // Runtime (if not default)
        if (searchManager.filters.runtime.min !== 0 || searchManager.filters.runtime.max !== 300) {
            chips.push({
                label: `Runtime: ${searchManager.filters.runtime.min}-${searchManager.filters.runtime.max} min`,
                remove: () => {
                    searchManager.filters.runtime = { min: 0, max: 300 };
                    document.getElementById('runtimeRangeMin').value = 0;
                    document.getElementById('runtimeRangeMax').value = 300;
                    this.updateRuntimeRange();
                }
            });
        }
        
        // Language
        if (searchManager.filters.language) {
            chips.push({
                label: `Language: ${searchManager.languages[searchManager.filters.language]}`,
                remove: () => {
                    searchManager.filters.language = '';
                    document.getElementById('languageFilter').value = '';
                }
            });
        }
        
        // Streaming services
        searchManager.filters.streamingServices.forEach(serviceId => {
            chips.push({
                label: searchManager.streamingProviders[serviceId],
                remove: () => {
                    searchManager.filters.streamingServices = searchManager.filters.streamingServices.filter(
                        s => s !== serviceId
                    );
                    const checkbox = document.querySelector(`#streamingFilter input[value="${serviceId}"]`);
                    if (checkbox) checkbox.checked = false;
                }
            });
        });
        
        // Render chips
        chipsContainer.innerHTML = chips.map(chip => `
            <div class="filter-chip">
                <span>${chip.label}</span>
                <button class="chip-remove" onclick="(${chip.remove})(); filterPanel.updateActiveFilters(); searchManager.applyFilters();">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
        
        // Update filter count
        if (filterCount) {
            filterCount.textContent = chips.length > 0 ? chips.length : '';
            filterCount.style.display = chips.length > 0 ? 'inline-block' : 'none';
        }
        
        // Show/hide active filters bar
        if (activeBar) {
            activeBar.style.display = chips.length > 0 ? 'block' : 'none';
        }
    }
    
    async showSearchSuggestions(query) {
        const suggestionsContainer = document.getElementById('searchSuggestions');
        if (!suggestionsContainer) return;
        
        if (!query || query.length < 2) {
            suggestionsContainer.innerHTML = '';
            suggestionsContainer.style.display = 'none';
            return;
        }
        
        const suggestions = await searchManager.getSearchSuggestions(query);
        
        if (suggestions.length > 0) {
            suggestionsContainer.innerHTML = suggestions.map(movie => `
                <div class="search-suggestion" onclick="filterPanel.selectSuggestion('${movie.title.replace(/'/g, "\\'")}')">
                    <i class="fas fa-film"></i>
                    <span>${movie.title} ${movie.year ? `(${movie.year})` : ''}</span>
                </div>
            `).join('');
            suggestionsContainer.style.display = 'block';
        } else {
            suggestionsContainer.style.display = 'none';
        }
    }
    
    selectSuggestion(title) {
        document.getElementById('advancedSearchInput').value = title;
        searchManager.filters.query = title;
        document.getElementById('searchSuggestions').style.display = 'none';
        searchManager.applyFilters();
    }
    
    updateSearchHistory() {
        const historyContainer = document.getElementById('searchHistory');
        if (!historyContainer) return;
        
        const history = searchManager.searchHistory;
        
        if (history.length > 0) {
            historyContainer.innerHTML = history.map(item => `
                <div class="search-history-item" onclick="filterPanel.selectSuggestion('${item.query.replace(/'/g, "\\'")}')">
                    <i class="fas fa-history"></i>
                    <span>${item.query}</span>
                </div>
            `).join('');
            document.getElementById('searchHistoryWrapper').style.display = 'block';
        } else {
            document.getElementById('searchHistoryWrapper').style.display = 'none';
        }
    }
    
    saveCurrentSearch() {
        const name = prompt('Enter a name for this search:');
        if (name) {
            searchManager.saveSearch(name);
            searchManager.updateSavedSearchesUI();
        }
    }
    
    showImportExport() {
        const modal = document.createElement('div');
        modal.className = 'import-export-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Import/Export Searches</h3>
                <div class="modal-buttons">
                    <button class="btn btn-primary" onclick="searchManager.exportSearches()">
                        <i class="fas fa-download"></i> Export Searches
                    </button>
                    <label class="btn btn-secondary">
                        <i class="fas fa-upload"></i> Import Searches
                        <input type="file" accept=".json" style="display:none" onchange="filterPanel.handleImport(this.files[0])">
                    </label>
                </div>
                <button class="modal-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    handleImport(file) {
        if (file) {
            searchManager.importSearches(file);
            document.querySelector('.import-export-modal')?.remove();
        }
    }
    
    updateUI(filters) {
        // Update all UI elements to match current filters
        
        // Search input
        const searchInput = document.getElementById('advancedSearchInput');
        if (searchInput) searchInput.value = filters.query || '';
        
        // Genres
        document.querySelectorAll('#genreFilter input').forEach(checkbox => {
            checkbox.checked = filters.genres.includes(checkbox.value);
        });
        
        // Year range
        document.getElementById('yearRangeMin').value = filters.yearRange.min;
        document.getElementById('yearRangeMax').value = filters.yearRange.max;
        document.getElementById('yearMin').textContent = filters.yearRange.min;
        document.getElementById('yearMax').textContent = filters.yearRange.max;
        
        // Rating range
        document.getElementById('ratingRangeMin').value = filters.ratingRange.min;
        document.getElementById('ratingRangeMax').value = filters.ratingRange.max;
        document.getElementById('ratingMin').textContent = filters.ratingRange.min;
        document.getElementById('ratingMax').textContent = filters.ratingRange.max;
        
        // Runtime range
        document.getElementById('runtimeRangeMin').value = filters.runtime.min;
        document.getElementById('runtimeRangeMax').value = filters.runtime.max;
        document.getElementById('runtimeMin').textContent = filters.runtime.min;
        document.getElementById('runtimeMax').textContent = filters.runtime.max;
        
        // Language
        document.getElementById('languageFilter').value = filters.language || '';
        
        // Streaming services
        document.querySelectorAll('#streamingFilter input').forEach(checkbox => {
            checkbox.checked = filters.streamingServices.includes(checkbox.value);
        });
        
        // Sort
        document.getElementById('sortBy').value = filters.sortBy;
        document.getElementById('sortAsc').classList.toggle('active', filters.sortOrder === 'asc');
        document.getElementById('sortDesc').classList.toggle('active', filters.sortOrder === 'desc');
        
        // Update active filters display
        this.updateActiveFilters();
    }
    
    adjustLayout() {
        const panel = document.getElementById('filterPanel');
        if (!panel) return;
        
        if (this.isMobile) {
            panel.classList.add('mobile');
            panel.classList.remove('desktop');
        } else {
            panel.classList.add('desktop');
            panel.classList.remove('mobile');
        }
    }
    
    loadSavedState() {
        // Load view mode
        const viewMode = localStorage.getItem('searchViewMode');
        if (viewMode) {
            searchManager.setViewMode(viewMode);
        }
        
        // Check for URL parameters
        searchManager.loadFromUrl();
    }
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Initialize FilterPanel globally
window.filterPanel = new FilterPanel();
