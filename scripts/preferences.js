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

   localStorage.setItem('preferredProvider', provider);
   localStorage.setItem('preferredGenre', genre);
   localStorage.setItem('preferencesLastUpdated', new Date().toISOString());

   hidePreferenceModal();
   window.location.reload();
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

function handleLove(movieId) {
   if (!preferences.lovedMovies.includes(movieId)) {
      preferences.lovedMovies.push(movieId);
      localStorage.setItem('lovedMovies', JSON.stringify(preferences.lovedMovies));
   }
   // Fetch and display similar movies will be handled by the calling function
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

window.handleNotInterested = handleNotInterested;

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