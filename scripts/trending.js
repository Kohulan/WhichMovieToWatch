// Trending Movies Functionality

// Get user's region based on their timezone or language
function getUserRegion() {
    // Try to get region from browser's language setting
    const language = navigator.language || navigator.userLanguage;
    const region = language.split('-')[1] || 'US'; // Default to US if not available
    
    // Map common regions to their TMDB region codes
    const regionMap = {
        'US': 'US',
        'GB': 'GB',
        'CA': 'CA',
        'AU': 'AU',
        'IN': 'IN',
        'DE': 'DE',
        'FR': 'FR',
        'ES': 'ES',
        'IT': 'IT',
        'JP': 'JP',
        'KR': 'KR',
        'BR': 'BR',
        'MX': 'MX',
        'RU': 'RU',
        'CN': 'CN'
    };
    
    return regionMap[region] || 'US';
}

// Fetch trending movies from TMDB API
async function fetchTrendingMovies() {
    const region = getUserRegion();
    // Use the global API_KEY from api.js (will be replaced during deployment)
    const apiKey = API_KEY;
    
    try {
        // Fetch movies currently in theaters for the user's region
        const response = await fetch(
            `https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}&region=${region}&language=en-US&page=1`
        );
        
        if (!response.ok) {
            throw new Error('Failed to fetch trending movies');
        }
        
        const data = await response.json();
        
        // Get top 10 movies
        return data.results.slice(0, 10);
    } catch (error) {
        console.error('Error fetching trending movies:', error);
        
        // Fallback to popular movies if now_playing fails
        try {
            const fallbackResponse = await fetch(
                `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=1`
            );
            const fallbackData = await fallbackResponse.json();
            return fallbackData.results.slice(0, 10);
        } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError);
            return [];
        }
    }
}

// Display trending movies in the UI
function displayTrendingMovies(movies) {
    const trendingSection = document.getElementById('trendingMovies');
    const trendingList = document.getElementById('trendingMoviesList');
    
    if (!trendingSection || !trendingList) {
        console.error('Trending movies elements not found');
        return;
    }
    
    // Clear existing content
    trendingList.innerHTML = '';
    
    if (movies.length === 0) {
        trendingSection.style.display = 'none';
        return;
    }
    
    // Show the section
    trendingSection.style.display = 'block';
    
    // Create list items for each movie
    movies.forEach((movie, index) => {
        const listItem = document.createElement('li');
        listItem.className = 'trending-movie-item';
        
        // Create Google search URL
        const searchQuery = encodeURIComponent(`${movie.title} ${new Date(movie.release_date).getFullYear()} movie`);
        const googleSearchUrl = `https://www.google.com/search?q=${searchQuery}`;
        
        // Create the movie element
        const movieLink = document.createElement('a');
        movieLink.href = googleSearchUrl;
        movieLink.target = '_blank';
        movieLink.rel = 'noopener noreferrer';
        movieLink.className = 'trending-movie-link';
        
        // Add poster if available
        const posterUrl = movie.poster_path 
            ? `https://image.tmdb.org/t/p/w92${movie.poster_path}`
            : 'https://via.placeholder.com/92x138/1a1a1a/666666?text=No+Poster';
        
        movieLink.innerHTML = `
            <img src="${posterUrl}" alt="${movie.title}" class="trending-poster" loading="lazy">
            <div class="trending-info">
                <span class="trending-title">${movie.title}</span>
                <span class="trending-rating">
                    <i class="fas fa-star"></i> ${movie.vote_average.toFixed(1)}
                </span>
            </div>
        `;
        
        listItem.appendChild(movieLink);
        trendingList.appendChild(listItem);
        
        // Add animation delay for staggered appearance
        listItem.style.animationDelay = `${index * 0.1}s`;
    });
}

// Initialize trending movies when the page loads
async function initializeTrendingMovies() {
    try {
        const movies = await fetchTrendingMovies();
        displayTrendingMovies(movies);
    } catch (error) {
        console.error('Failed to initialize trending movies:', error);
        // Hide the section if there's an error
        const trendingSection = document.getElementById('trendingMovies');
        if (trendingSection) {
            trendingSection.style.display = 'none';
        }
    }
}

// Refresh trending movies periodically (every 30 minutes)
function startTrendingMoviesRefresh() {
    setInterval(async () => {
        await initializeTrendingMovies();
    }, 30 * 60 * 1000); // 30 minutes
}

// Export functions if using modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        fetchTrendingMovies,
        displayTrendingMovies,
        initializeTrendingMovies,
        getUserRegion
    };
}
