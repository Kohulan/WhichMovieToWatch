// Debounce function to limit API calls
function debounce(func, wait) {
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

// Search movies function
async function searchMovies(query) {
    if (!query.trim()) {
        document.getElementById('searchResults').innerHTML = '';
        return;
    }

    try {
        const response = await fetch(
            `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=1`
        );

        if (!response.ok) throw new Error('Search failed');

        const data = await response.json();
        const results = data.results.slice(0, 10); // Get top 10 results

        const searchResults = document.getElementById('searchResults');
        searchResults.innerHTML = results.map(movie => `
            <div class="search-result-card" onclick="handleSearchResultClick(${movie.id})">
                <img 
                    src="${movie.poster_path 
                        ? IMAGE_BASE_URL + movie.poster_path 
                        : 'https://via.placeholder.com/300x450?text=No+Poster'}"
                    alt="${movie.title}"
                    class="search-result-poster"
                    loading="lazy"
                />
                <div class="search-result-info">
                    <div class="search-result-title">${movie.title}</div>
                    <div class="search-result-year">${movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}</div>
                    <div class="search-result-rating">
                        <i class="fas fa-star"></i>
                        ${(movie.vote_average * 10).toFixed(1)}%
                    </div>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Search error:', error);
        document.getElementById('searchResults').innerHTML = `
            <div class="search-error">
                <i class="fas fa-exclamation-circle"></i>
                <p>Sorry, something went wrong with the search. Please try again.</p>
            </div>
        `;
    }
}

function setupVoiceSearch() {
    const voiceButton = document.querySelector('.voice-icon');
    
    // Check if browser supports speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        // Add click handler for voice button
        voiceButton.addEventListener('click', () => {
            // Add pulse animation to voice icon
            voiceButton.classList.add('pulse');
            
            // Start listening
            recognition.start();
            
            // Show listening indication
            showToast('Listening...');
        });

        // Handle speech recognition results
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            document.getElementById('movieSearch').value = transcript;
            searchMovies(transcript);
            voiceButton.classList.remove('pulse');
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            showToast('Voice search failed. Please try again.');
            voiceButton.classList.remove('pulse');
        };

        recognition.onend = () => {
            voiceButton.classList.remove('pulse');
        };

    } else {
        // Hide voice button if speech recognition is not supported
        voiceButton.style.display = 'none';
    }
}

// Add CSS animation for voice button
const style = document.createElement('style');
style.textContent = `
@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.2); color: #f44336; }
    100% { transform: scale(1); }
}

.pulse {
    animation: pulse 1.0s infinite;
}
`;
document.head.appendChild(style);

// Make handleSearchResultClick available globally
window.handleSearchResultClick = async function(movieId) {
    // Close the search modal
    document.getElementById('searchModal').style.display = 'none';
    
    // Clear the search input
    document.getElementById('movieSearch').value = '';
    
    // Clear search results
    document.getElementById('searchResults').innerHTML = '';
    
    // Fetch and display the selected movie
    try {
        const response = await fetch(
            `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&append_to_response=watch/providers`
        );
        
        if (!response.ok) throw new Error('Failed to fetch movie details');
        
        const movieData = await response.json();
        trackShownMovie(movieData.id); // Add this to track shown movies
        await displayMovie(movieData);
        
    } catch (error) {
        console.error('Error fetching movie details:', error);
        showToast('Error loading movie details. Please try again.');
    }
}

// Setup search input with debounce
function setupSearch() {
    const searchInput = document.getElementById('movieSearch');
    const debouncedSearch = debounce(searchMovies, 300);

    searchInput.addEventListener('input', (e) => {
        debouncedSearch(e.target.value);
    });
}

// Initialize search functionality
document.addEventListener('DOMContentLoaded', () => {
    setupSearch();
    setupVoiceSearch();
});

// Search modal functions
window.openSearchModal = function() {
    document.getElementById('searchModal').style.display = 'flex';
    document.getElementById('movieSearch').focus();
    document.getElementById('searchResults').innerHTML = ''; // Clear previous results
}

// Add search modal close handler
window.addEventListener('click', (event) => {
    const searchModal = document.getElementById('searchModal');
    if (event.target === searchModal) {
        searchModal.style.display = 'none';
    }
});