// Initialize preferences with localStorage
const preferences = {
   watchedMovies: JSON.parse(localStorage.getItem('watchedMovies')) || [],
   likedGenres: JSON.parse(localStorage.getItem('likedGenres')) || {},
   lovedMovies: JSON.parse(localStorage.getItem('lovedMovies')) || [],
   notInterestedMovies: JSON.parse(localStorage.getItem('notInterestedMovies')) || [],
   shownMovies: JSON.parse(localStorage.getItem('shownMovies')) || [],
   dinnerTimeLikes: JSON.parse(localStorage.getItem('dinnerTimeLikes')) || [],
   dinnerTimeDislikes: JSON.parse(localStorage.getItem('dinnerTimeDislikes')) || [],
   lastUpdate: localStorage.getItem('lastUpdate') || new Date().toISOString()
};

// Movie history tracking functions
function hasMovieBeenShown(movieId) {
   return preferences.shownMovies.includes(movieId) ||
      preferences.watchedMovies.includes(movieId) ||
      preferences.notInterestedMovies.includes(movieId);
}

function trackShownMovie(movieId) {
   if (!preferences.shownMovies.includes(movieId)) {
      preferences.shownMovies.push(movieId);
      // Keep only last 1000 shown movies to prevent localStorage from getting too large
      if (preferences.shownMovies.length > 1000) {
         preferences.shownMovies = preferences.shownMovies.slice(-1000);
      }
      localStorage.setItem('shownMovies', JSON.stringify(preferences.shownMovies));
   }
}

function clearOldMovieHistory() {
   const recentCount = 1000;
   preferences.shownMovies = preferences.shownMovies.slice(-recentCount);
   preferences.notInterestedMovies = preferences.notInterestedMovies.slice(-recentCount);

   localStorage.setItem('shownMovies', JSON.stringify(preferences.shownMovies));
   localStorage.setItem('notInterestedMovies', JSON.stringify(preferences.notInterestedMovies));

   preferences.lastUpdate = new Date().toISOString();
   localStorage.setItem('lastUpdate', preferences.lastUpdate);
}

// Preference modal functions
function showPreferenceModal() {
   const modal = document.getElementById('preferenceModal');
   modal.style.display = 'block';
   
   // Load saved preferences
   const savedProvider = localStorage.getItem('preferredProvider');
   const savedGenre = localStorage.getItem('preferredGenre');
   
   if (savedProvider) {
      document.getElementById('streamingProvider').value = savedProvider;
   }
   
   if (savedGenre) {
      document.getElementById('movieGenre').value = savedGenre;
   }
   
   // Validate to enable/disable the start button
   validatePreferences();
}

function hidePreferenceModal() {
   const modal = document.getElementById('preferenceModal');
   modal.style.display = 'none';
}

function validatePreferences() {
   const provider = document.getElementById('streamingProvider').value;
   const genre = document.getElementById('movieGenre').value;
   const startButton = document.getElementById('startExploring');
   startButton.disabled = !provider || !genre;
}

function savePreferences() {
   const provider = document.getElementById('streamingProvider').value;
   const genre = document.getElementById('movieGenre').value;

   // Log the preferences being saved
   console.log('Saving preferences:', {
      provider: provider,
      genre: genre,
      timestamp: new Date().toISOString()
   });

   localStorage.setItem('preferredProvider', provider);
   localStorage.setItem('preferredGenre', genre);
   localStorage.setItem('preferencesLastUpdated', new Date().toISOString());

   hidePreferenceModal();
   
   // Close any open modals
   const advancedSearchModal = document.getElementById('advancedSearchModal');
   if (advancedSearchModal) {
      advancedSearchModal.style.display = 'none';
   }
   
   // Clear any search results
   const searchResults = document.getElementById('advancedSearchResults');
   if (searchResults) {
      searchResults.innerHTML = '';
   }
   
   // Close the filter panel if it's open
   if (window.filterPanel && window.filterPanel.isOpen) {
      window.filterPanel.togglePanel();
   }
   
   // Get provider and genre names for the toast message
   const providerSelect = document.getElementById('streamingProvider');
   const genreSelect = document.getElementById('movieGenre');
   const providerName = providerSelect.options[providerSelect.selectedIndex].text;
   const genreName = genreSelect.options[genreSelect.selectedIndex].text;
   
   // Show toast notification
   showToast(`Preferences updated! Looking for ${genreName} movies on ${providerName}...`);
   
   // Clear recommendations section if it exists
   const recommendationsSection = document.getElementById('recommendationsSection');
   if (recommendationsSection) {
      recommendationsSection.innerHTML = '';
   }
   
   // Fetch a new movie with the updated preferences
   fetchRandomMovie();
}

function skipPreferences() {
   hidePreferenceModal();
   validateAndFetch();
}

// Movie interaction handlers
function handleDinnerTimePreference(movieId, liked) {
   if (liked) {
      preferences.dinnerTimeLikes.push(movieId);
      localStorage.setItem('dinnerTimeLikes', JSON.stringify(preferences.dinnerTimeLikes));
      showToast('Great choice! We\'ll recommend similar movies next time');
   } else {
      preferences.dinnerTimeDislikes.push(movieId);
      localStorage.setItem('dinnerTimeDislikes', JSON.stringify(preferences.dinnerTimeDislikes));
      showToast('Noted! We won\'t recommend similar movies next time');
   }
   closeDinnerTimeModal();
}

async function handleLove(movieId) {
   try {
      if (!preferences.lovedMovies.includes(movieId)) {
         preferences.lovedMovies.push(movieId);
         localStorage.setItem('lovedMovies', JSON.stringify(preferences.lovedMovies));
      }
      
      // Update genre preferences
      await updateGenrePreferences(movieId);
      
      // Show toast and fetch recommendations
      showToast('Great choice! Here are similar movies you might love');
      
      // Fetch similar movies
      const response = await fetch(
         `${BASE_URL}/movie/${movieId}/similar?api_key=${API_KEY}`
      );
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
         const filteredMovies = data.results
            .filter(movie => !hasMovieBeenShown(movie.id))
            .slice(0, 5);
         
         if (filteredMovies.length > 0) {
            // Display recommendations
            const recommendationsSection = document.getElementById('recommendationsSection');
            if (recommendationsSection && window.displayRecommendations) {
               window.displayRecommendations(filteredMovies, '❤️ Because you loved this movie');
            }
         }
      }
   } catch (error) {
      console.error('Error handling love:', error);
      showToast('Failed to update preferences');
   }
}

function handleWatched(movieId) {
   if (!preferences.watchedMovies.includes(movieId)) {
      preferences.watchedMovies.push(movieId);
      localStorage.setItem('watchedMovies', JSON.stringify(preferences.watchedMovies));
   }
   showToast('Noted! We won\'t show this movie again');
   fetchRandomMovie();
}

function handleNotInterested(movieId) {
   if (!preferences.notInterestedMovies.includes(movieId)) {
      preferences.notInterestedMovies.push(movieId);
      localStorage.setItem('notInterestedMovies', JSON.stringify(preferences.notInterestedMovies));
   }
   showToast('Got it! We won\'t recommend similar movies');
   fetchRandomMovie();
}

// Make handler functions globally accessible for HTML onclick handlers
window.handleNotInterested = handleNotInterested;
window.handleLove = handleLove;
window.handleWatched = handleWatched;
window.handleDinnerTimePreference = handleDinnerTimePreference;

// Genre preference handling
function updateGenrePreferences(movieId) {
   fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`)
      .then(response => response.json())
      .then(movie => {
         movie.genres.forEach(genre => {
            preferences.likedGenres[genre.id] = (preferences.likedGenres[genre.id] || 0) + 1;
         });
         localStorage.setItem('likedGenres', JSON.stringify(preferences.likedGenres));
      })
      .catch(error => console.error('Error updating genre preferences:', error));
}

// Provider mapping
function getProviderId(providerName) {
   const providerMap = {
      'netflix': 8,
      'disneyplus': 337,
      'amazon': 9,
      'hulu': 15,
      'hbomax': 384,
      'appletv': 350,
      'paramountplus': 531,
      'peacock': 386
   };
   return providerMap[providerName] || null;
}

// Initialize preference event listeners
document.addEventListener('DOMContentLoaded', () => {
   const preferredProvider = localStorage.getItem('preferredProvider');
   const preferredGenre = localStorage.getItem('preferredGenre');

   if (!preferredProvider || !preferredGenre) {
      showPreferenceModal();
   }

   // Add event listeners
   document.getElementById('streamingProvider').addEventListener('change', validatePreferences);
   document.getElementById('movieGenre').addEventListener('change', validatePreferences);
   document.getElementById('startExploring').addEventListener('click', savePreferences);
   document.getElementById('skipPreferences').addEventListener('click', skipPreferences);
});