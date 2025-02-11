// Main Application Class
class MovieApp {
   constructor() {
      // Cache frequently used elements
      this.movieCard = document.getElementById('movieCard');
      this.recommendationsSection = document.getElementById('recommendationsSection');
      this.dinnerTimeModal = document.getElementById('dinnerTimeModal');

      // Initialize application state
      this.state = {
         isLoading: false,
         currentMovie: null,
         lastUpdate: new Date(),
         moviesCache: null
      };

      // Bind class methods to maintain context
      this.initialize = this.initialize.bind(this);
      this.handleFreeMovieFlow = this.handleFreeMovieFlow.bind(this);
      this.handleDinnerTimeFlow = this.handleDinnerTimeFlow.bind(this);
      this.handleError = this.handleError.bind(this);
   }

   // Application initialization
   async initialize() {
      try {
         console.log('Initializing Movie Application...');

         // Initialize UI components
         ui.initializeUI();

         // Detect user's country for regional content
         await detectCountry();

         // Set up event listeners
         this.setupEventListeners();

         // Validate API and fetch initial movie
         await this.validateAndFetch();

         console.log('Application initialized successfully');
      } catch (error) {
         console.error('Failed to initialize application:', error);
         this.handleError('Application initialization failed. Please try again later.');
      }
   }

   // Event listener setup
   setupEventListeners() {
      // Preference modal event listeners
      document.getElementById('streamingProvider').addEventListener('change', validatePreferences);
      document.getElementById('movieGenre').addEventListener('change', validatePreferences);
      document.getElementById('startExploring').addEventListener('click', savePreferences);
      document.getElementById('skipPreferences').addEventListener('click', skipPreferences);

      // Modal close handlers
      window.addEventListener('click', (event) => {
         if (event.target === this.dinnerTimeModal) {
            closeDinnerTimeModal();
         }
      });

      // Keyboard shortcuts
      document.addEventListener('keydown', (event) => {
         if (event.key === 'Escape') {
            closeDinnerTimeModal();
            hidePreferenceModal();
         }
      });

      // Handle browser back button
      window.addEventListener('popstate', () => {
         closeDinnerTimeModal();
         hidePreferenceModal();
      });
   }

   // API validation and initial fetch
   async validateAndFetch() {
      try {
         const testResponse = await fetch(
            `${BASE_URL}/configuration?api_key=${API_KEY}`
         );

         if (!testResponse.ok) {
            throw new Error('Invalid API key or service unavailable');
         }

         await fetchRandomMovie();
      } catch (error) {
         console.error('API validation failed:', error);
         this.handleError('Service temporarily unavailable. Please try again in a few moments.');
         setTimeout(() => this.validateAndFetch(), 2000);
      }
   }

   // Dinner time movie flow
   async handleDinnerTimeFlow() {
      try {
         this.state.isLoading = true;
         ui.displayDinnerTimeLoading();

         const movie = await fetchDinnerTimeMovie();
         if (!movie) {
            throw new Error('No suitable movie found');
         }

         await ui.displayDinnerTimeMovie(movie);
      } catch (error) {
         console.error('Dinner time flow error:', error);
         displayDinnerTimeError(3);
      } finally {
         this.state.isLoading = false;
      }
   }

   // Free movie flow
   async handleFreeMovieFlow() {
      try {
         this.state.isLoading = true;
         ui.displayDinnerTimeLoading('Loading free movies...');

         const movies = await loadFreeMovies();
         if (!movies || movies.length === 0) {
            throw new Error('No free movies available');
         }

         const randomMovie = movies[Math.floor(Math.random() * movies.length)];
         const tmdbDetails = await fetchFreeMovieDetails(randomMovie.title);
         await ui.displayFreeMovie(randomMovie, tmdbDetails);
      } catch (error) {
         console.error('Free movie flow error:', error);
         this.handleError('Unable to load free movies. Please try again later.');
      } finally {
         this.state.isLoading = false;
      }
   }

   // Movie recommendation handling
   async handleRecommendations(movieId, type = 'similar') {
      try {
         const response = await fetch(
            `${BASE_URL}/movie/${movieId}/${type}?api_key=${API_KEY}`
         );
         const data = await response.json();

         if (!data.results || data.results.length === 0) {
            throw new Error('No recommendations found');
         }

         const filteredMovies = data.results
            .filter(movie => !hasMovieBeenShown(movie.id))
            .slice(0, 5);

         if (filteredMovies.length === 0) {
            showToast('No new recommendations available at the moment');
            return;
         }

         const title = type === 'similar' ?
            '❤️ Because you loved this movie' :
            '🎯 Based on your preferences';

         ui.displayRecommendations(filteredMovies, title);
         ui.addFadeInAnimation(this.recommendationsSection);
      } catch (error) {
         console.error('Error fetching recommendations:', error);
         showToast('Failed to load recommendations');
      }
   }

   // Error handling
   handleError(message, retryFunction = null) {
      const errorMessage = `
            <div class="error">
                <i class="fas fa-exclamation-circle"></i>
                <p>${message}</p>
                ${retryFunction ? `
                    <button class="btn btn-next" onclick="${retryFunction}">
                        <i class="fas fa-redo"></i>
                        Try Again
                    </button>
                ` : ''}
            </div>
        `;

      if (this.state.isLoading) {
         document.querySelector('.dinner-time-modal-content').innerHTML = errorMessage;
      } else {
         this.movieCard.innerHTML = errorMessage;
      }
   }

   // Movie interaction handlers
   async handleLove(movieId) {
      try {
         if (!preferences.lovedMovies.includes(movieId)) {
            preferences.lovedMovies.push(movieId);
            localStorage.setItem('lovedMovies', JSON.stringify(preferences.lovedMovies));
         }

         // Update genre preferences
         await updateGenrePreferences(movieId);

         // Fetch and display similar movies
         await this.handleRecommendations(movieId, 'similar');
         showToast('Great choice! Here are similar movies you might love');
      } catch (error) {
         console.error('Error handling love:', error);
         showToast('Failed to update preferences');
      }
   }

   // Periodic maintenance
   performMaintenance() {
      // Clean up old movie history periodically
      const now = new Date();
      const daysSinceLastUpdate = (now - new Date(preferences.lastUpdate)) / (1000 * 60 * 60 * 24);

      if (daysSinceLastUpdate > 7) {
         clearOldMovieHistory();
      }

      // Clear cache if it's grown too large
      if (this.state.moviesCache && Object.keys(this.state.moviesCache).length > 1000) {
         this.state.moviesCache = null;
      }
   }

   // Application state management
   updateState(newState) {
      this.state = {
         ...this.state,
         ...newState
      };
      this.performMaintenance();
   }
}

// Create and initialize application instance
const app = new MovieApp();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
   app.initialize().catch(error => {
      console.error('Failed to start application:', error);
      app.handleError('Failed to start application. Please refresh the page.');
   });
});

// Export all necessary functions globally for HTML onclick handlers
window.openFreeMovieModal = async function () {
   document.getElementById('dinnerTimeModal').style.display = 'flex';
   const modalContent = document.querySelector('.dinner-time-modal-content');

   modalContent.innerHTML = `
        <div class="dinner-time-loading">
            <i class="fas fa-film fa-spin"></i>
            <p>Loading your free movie...</p>
        </div>
    `;

   try {
      const movies = await loadFreeMovies();
      if (!movies || movies.length === 0) {
         throw new Error('No movies available');
      }

      const randomMovie = movies[Math.floor(Math.random() * movies.length)];
      console.log('Selected movie:', randomMovie); // Debug log

      if (!randomMovie || !randomMovie.title) {
         throw new Error('Invalid movie data');
      }

      const tmdbDetails = await fetchFreeMovieDetails(randomMovie.title);
      await displayFreeMovie(randomMovie, tmdbDetails);
   } catch (error) {
      console.error('Error loading free movie:', error);
      modalContent.innerHTML = `
            <div class="dinner-time-error">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error loading free movie. Please try again!</p>
                <p class="error-details" style="font-size: 0.8em; color: #666;">${error.message}</p>
                <button onclick="openFreeMovieModal()" class="dinner-time-retry">
                    Try Again
                </button>
            </div>
        `;
   }
};

window.getNextFreeMovie = async function () {
   const loadingAnimation = `
        <div class="dinner-time-loading">
            <i class="fas fa-film fa-spin"></i>
            <p>Finding another free movie...</p>
        </div>
    `;
   document.querySelector('.dinner-time-modal-content').innerHTML = loadingAnimation;

   try {
      const movies = await loadFreeMovies();
      const randomMovie = movies[Math.floor(Math.random() * movies.length)];
      const tmdbDetails = await fetchFreeMovieDetails(randomMovie.title);
      await displayFreeMovie(randomMovie, tmdbDetails);
   } catch (error) {
      console.error('Error loading next free movie:', error);
      document.querySelector('.dinner-time-modal-content').innerHTML = `
            <div class="dinner-time-error">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error loading next movie. Please try again!</p>
                <button onclick="getNextFreeMovie()" class="dinner-time-retry">
                    Try Again
                </button>
            </div>
        `;
   }
};

// Export other necessary functions and handlers for global access
window.app = {
   handleDinnerTimeFlow: () => app.handleDinnerTimeFlow(),
   handleLove: (movieId) => app.handleLove(movieId),
   handleRecommendations: (movieId, type) => app.handleRecommendations(movieId, type)
};