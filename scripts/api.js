// API Configuration and Constants
// For local development: Replace the placeholders below with your actual API keys
// For deployment: These will be automatically replaced by GitHub Actions
const API_KEY = window.TMDB_API_KEY || '381b2cb115fa9f1cdd779d03f7627d1a'; // Replace with your TMDB API key
const OMDB_API_KEY = window.OMDB_API_KEY || '3326e18b'; // Replace with your OMDB API key
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Cache for movies data
let moviesCache = null;
let userCountry = 'DE'; // Default country

// Major streaming services to prioritize
const MAJOR_STREAMING_SERVICES = [
   'Netflix',
   'Amazon Prime Video',
   'Disney Plus'
];

// Main movie fetching function
async function fetchRandomMovie(retryCount = 0, maxRetries = 100, temporaryGenreOverride = null) {
   try {
      const loadingAnimation = `
            <div class="loading">
                <i class="fas fa-film"></i>
                <p>Discovering your next favorite movie...</p>
            </div>
        `;
      document.getElementById('movieCard').innerHTML = loadingAnimation;

      // Get user preferences
      const preferredProvider = localStorage.getItem('preferredProvider');
      const preferredGenre = temporaryGenreOverride || localStorage.getItem('preferredGenre');
      const providerId = getProviderId(preferredProvider);
      
      console.log('Fetching movie with preferences:', {
         provider: preferredProvider,
         providerId: providerId,
         genre: preferredGenre,
         userCountry: userCountry
      });

      // Build the initial API URL with preferences
      let apiUrl = `${BASE_URL}/discover/movie?api_key=${API_KEY}&page=${Math.floor(Math.random() * 50) + 1}&sort_by=popularity.desc&vote_count.gte=500&vote_average.gte=6.0&include_adult=false`;

      // Add genre if specified and not 'any'
      let usingPreferredGenre = false;
      if (preferredGenre && preferredGenre !== 'any') {
         apiUrl += `&with_genres=${preferredGenre}`;
         usingPreferredGenre = true;
      }

      const response = await fetch(apiUrl);
      if (!response.ok) {
         // Try with different parameters if the API call fails
         return await retryWithDifferentParams(retryCount, maxRetries, preferredProvider, preferredGenre);
      }

      const data = await response.json();
      if (!data.results || data.results.length === 0) {
         // If no results found, try with different parameters
         return await retryWithDifferentParams(retryCount, maxRetries, preferredProvider, preferredGenre);
      }

      // Filter out movies that have been shown
      const availableMovies = data.results.filter(movie => !hasMovieBeenShown(movie.id));

      if (availableMovies.length === 0) {
         if (retryCount < maxRetries) {
            return fetchRandomMovie(retryCount + 1, maxRetries, temporaryGenreOverride);
         }
         clearOldMovieHistory();
         return fetchRandomMovie(0, maxRetries, temporaryGenreOverride);
      }

      // Check streaming availability if provider is selected
      if (providerId) {
         // First, try to find movies matching both provider and genre
         for (const movie of availableMovies) {
            const movieDetailsResponse = await fetch(
               `${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}&append_to_response=watch/providers`
            );

            if (!movieDetailsResponse.ok) continue;

            const movieData = await movieDetailsResponse.json();
            const providers = movieData['watch/providers']?.results?.[userCountry] || {};
            const streamingProviders = providers.flatrate || [];

            // Check if movie is available on the selected provider
            if (streamingProviders.some(provider => provider.provider_id === providerId)) {
               console.log(`Found movie on ${preferredProvider}:`, movieData.title);
               trackShownMovie(movieData.id);
               await displayMovie(movieData);
               return;
            }
         }

         // If no movies found with selected provider and genre, try without genre restriction
         if (usingPreferredGenre && !temporaryGenreOverride) {
            console.log('No movies found with genre restriction, trying without genre...');
            const genreName = getGenreName(preferredGenre);
            showToast(`No ${genreName} movies found on ${preferredProvider}. Showing other genres...`);
            
            // Retry without genre restriction (but don't save this preference)
            return fetchRandomMovie(0, maxRetries, 'any');
         }

         // If still no movies found after removing genre restriction
         if (retryCount < maxRetries) {
            return fetchRandomMovie(retryCount + 1, maxRetries, temporaryGenreOverride);
         }

         // Last resort: show any movie from the provider (fetch more pages)
         console.log(`Couldn't find movies on ${preferredProvider}, showing alternative...`);
         showToast(`No movies currently available on ${preferredProvider}. Showing alternatives...`);
         
         // Show any available movie but warn the user
         const randomMovie = availableMovies[Math.floor(Math.random() * availableMovies.length)];
         const movieDetailsResponse = await fetch(
            `${BASE_URL}/movie/${randomMovie.id}?api_key=${API_KEY}&append_to_response=watch/providers`
         );
         const movieData = await movieDetailsResponse.json();
         trackShownMovie(movieData.id);
         await displayMovie(movieData);
         return;
      }

      // If no provider selected, show any available movie
      const randomMovie = availableMovies[Math.floor(Math.random() * availableMovies.length)];
      const movieDetailsResponse = await fetch(
         `${BASE_URL}/movie/${randomMovie.id}?api_key=${API_KEY}&append_to_response=watch/providers`
      );
      const movieData = await movieDetailsResponse.json();
      trackShownMovie(movieData.id);
      await displayMovie(movieData);

   } catch (error) {
      console.error('Error fetching movie:', error);
      // Instead of showing error, retry with different parameters
      return await retryWithDifferentParams(retryCount, maxRetries, preferredProvider, preferredGenre);
   }
}

// Helper function to retry with different parameters
async function retryWithDifferentParams(retryCount, maxRetries, preferredProvider = null, preferredGenre = null) {
   if (retryCount >= maxRetries) {
      displayError("Unable to find movies at the moment. Please try again later.");
      return;
   }

   // Try with more relaxed parameters but still respect provider if possible
   let fallbackUrl = `${BASE_URL}/discover/movie?api_key=${API_KEY}&page=${Math.floor(Math.random() * 100) + 1}&sort_by=popularity.desc&vote_count.gte=100&include_adult=false`;
   
   // Still try to respect genre preference in fallback
   if (preferredGenre && preferredGenre !== 'any') {
      fallbackUrl += `&with_genres=${preferredGenre}`;
   }

   try {
      const response = await fetch(fallbackUrl);
      if (!response.ok) throw new Error('Fallback request failed');

      const data = await response.json();
      if (!data.results || data.results.length === 0) {
         return fetchRandomMovie(retryCount + 1, maxRetries);
      }

      // If provider is specified, try to find a movie from that provider
      const providerId = getProviderId(preferredProvider);
      if (providerId) {
         for (const movie of data.results) {
            if (hasMovieBeenShown(movie.id)) continue;
            
            const movieDetailsResponse = await fetch(
               `${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}&append_to_response=watch/providers`
            );
            
            if (!movieDetailsResponse.ok) continue;
            
            const movieData = await movieDetailsResponse.json();
            const providers = movieData['watch/providers']?.results?.[userCountry] || {};
            const streamingProviders = providers.flatrate || [];
            
            if (streamingProviders.some(provider => provider.provider_id === providerId)) {
               trackShownMovie(movieData.id);
               await displayMovie(movieData);
               return;
            }
         }
      }

      // If no provider match found, show any available movie
      const availableMovies = data.results.filter(movie => !hasMovieBeenShown(movie.id));
      if (availableMovies.length > 0) {
         const randomMovie = availableMovies[Math.floor(Math.random() * availableMovies.length)];
         const movieDetailsResponse = await fetch(
            `${BASE_URL}/movie/${randomMovie.id}?api_key=${API_KEY}&append_to_response=watch/providers`
         );
         const movieData = await movieDetailsResponse.json();
         trackShownMovie(movieData.id);
         await displayMovie(movieData);
      } else {
         return fetchRandomMovie(retryCount + 1, maxRetries);
      }

   } catch (error) {
      console.error('Error in fallback request:', error);
      return fetchRandomMovie(retryCount + 1, maxRetries);
   }
}

// Movie trailer fetching
async function fetchMovieTrailer(movieId) {
   try {
      const response = await fetch(
         `${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}`
      );
      const data = await response.json();

      // Filter for YouTube trailers
      const trailers = data.results.filter(
         video => video.site === 'YouTube' &&
            (video.type === 'Trailer' || video.type === 'Teaser')
      );

      return trailers.length > 0 ? trailers[0] : null;
   } catch (error) {
      console.error('Error fetching trailer:', error);
      return null;
   }
}

// External ratings fetching
async function fetchExternalRatings(movieId) {
   try {
      const response = await fetch(
         `${BASE_URL}/movie/${movieId}/external_ids?api_key=${API_KEY}`
      );
      const data = await response.json();

      if (data.imdb_id) {
         const omdbResponse = await fetch(
            `https://www.omdbapi.com/?i=${data.imdb_id}&apikey=${OMDB_API_KEY}`
         );
         const omdbData = await omdbResponse.json();

         const ratings = {
            imdb: 'N/A',
            rottenTomatoes: 'N/A'
         };

         if (omdbData.Ratings) {
            omdbData.Ratings.forEach(rating => {
               if (rating.Source === 'Internet Movie Database') {
                  ratings.imdb = rating.Value;
               } else if (rating.Source === 'Rotten Tomatoes') {
                  ratings.rottenTomatoes = rating.Value;
               }
            });
         }

         return ratings;
      }
      return null;
   } catch (error) {
      console.error('Error fetching external ratings:', error);
      return null;
   }
}

// Country detection for regional content
async function detectCountry() {
   try {
      const response = await fetch('https://ipinfo.io/json', {
         headers: {
            'Accept': 'application/json'
         }
      });

      if (!response.ok) throw new Error('Primary service failed');

      const data = await response.json();
      userCountry = data.country || data.country_code;

      // Display country using UI function
      displayCountry(userCountry);

   } catch (error) {
      console.warn('Primary country detection failed:', error.message);
      userCountry = (navigator.language.split('-')[1]) || 'US';

      // Display fallback country using UI function
      displayCountry(userCountry);
   }
}

// Free movies functionality
async function loadFreeMovies() {
   if (moviesCache) {
      return moviesCache;
   }

   try {
      const response = await fetch('./data/movies.txt');
      if (!response.ok) {
         throw new Error(`Failed to fetch movies.txt: ${response.statusText}`);
      }

      const text = await response.text();
      const lines = text.split('\n').slice(1); // Skip header

      moviesCache = lines
         .map(line => {
            const [youtubeId, ...titleParts] = line.split('\t');
            return {
               youtubeId: youtubeId.trim(),
               title: titleParts.join(' ').trim()
            };
         })
         .filter(movie => movie.youtubeId && movie.title);

      console.log(`Loaded ${moviesCache.length} movies successfully`);
      return moviesCache;
   } catch (error) {
      console.error('Error loading free movies:', error);
      throw error;
   }
}

async function fetchFreeMovieDetails(movieTitle) {
   try {
      const response = await fetch(
         `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(movieTitle)}&page=1`
      );
      const data = await response.json();
      if (data.results && data.results.length > 0) {
         const movieId = data.results[0].id;
         const detailsResponse = await fetch(
            `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`
         );
         return await detailsResponse.json();
      }
      return null;
   } catch (error) {
      console.error('Error fetching movie details:', error);
      return null;
   }
}

// Dinner time movie fetching
async function fetchDinnerTimeMovie(retryCount = 0, maxRetries = 3) {
   try {
      const loadingAnimation = `
            <div class="dinner-time-loading">
                <i class="fas fa-utensils fa-spin"></i>
                <p>Finding the perfect movie for dinner...</p>
            </div>
        `;
      document.querySelector('.dinner-time-modal-content').innerHTML = loadingAnimation;

      // Define streaming services to try in order
      const streamingServices = [{
         id: 8,
         name: 'Netflix'
      },
      {
         id: 9,
         name: 'Prime Video'
      },
      {
         id: 337,
         name: 'Disney+'
      }
      ];

      // First, get popular movies
      const randomPage = Math.floor(Math.random() * 20) + 1;
      const response = await fetch(
         `${BASE_URL}/discover/movie?api_key=${API_KEY}&page=${randomPage}&sort_by=popularity.desc&vote_count.gte=1000&vote_average.gte=7.0&include_adult=false`
      );

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      if (!data.results || data.results.length === 0) {
         throw new Error('No movies found');
      }

      // Filter out previously shown or disliked movies
      const availableMovies = data.results.filter(movie =>
         !hasMovieBeenShown(movie.id) &&
         !preferences.dinnerTimeDislikes.includes(movie.id)
      );

      // Try each streaming service
      for (const service of streamingServices) {
         document.querySelector('.dinner-time-loading p').textContent =
            `Checking ${service.name} for dinner time movies...`;

         for (const movie of availableMovies) {
            const movieDetailsResponse = await fetch(
               `${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}&append_to_response=watch/providers`
            );

            if (!movieDetailsResponse.ok) continue;

            const movieData = await movieDetailsResponse.json();
            const providers = movieData['watch/providers']?.results?.[userCountry] || {};
            const streamingProviders = providers.flatrate || [];

            if (streamingProviders.some(provider =>
               provider.provider_id === service.id ||
               provider.provider_name.toLowerCase().includes(service.name.toLowerCase())
            )) {
               trackShownMovie(movieData.id);
               await displayDinnerTimeMovie(movieData, movieData['watch/providers'], service);
               return;
            }
         }
      }

      // Handle no movies found case
      if (retryCount < maxRetries) {
         return fetchDinnerTimeMovie(retryCount + 1, maxRetries);
      }

      displayDinnerTimeError(maxRetries);

   } catch (error) {
      console.error('Error fetching dinner time movie:', error);
      displayDinnerTimeError(maxRetries);
   }
}

// Helper function to get genre name
function getGenreName(genreId) {
   const genres = {
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
      '53': 'Thriller',
      '10752': 'War',
      '37': 'Western'
   };
   return genres[genreId] || 'preferred genre';
}

// Validation function for API
async function validateAndFetch() {
   try {
      const testResponse = await fetch(
         `${BASE_URL}/configuration?api_key=${API_KEY}`
      );

      if (!testResponse.ok) {
         throw new Error('Invalid API key');
      }

      await fetchRandomMovie();

   } catch (error) {
      console.error('API validation failed:', error);
      const movieCard = document.getElementById('movieCard');
      movieCard.innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-circle"></i>
                <p>Initializing... Please wait.</p>
                <button class="btn btn-next" onclick="validateAndFetch()">
                    <i class="fas fa-redo"></i>
                    Try Again
                </button>
            </div>
        `;
      setTimeout(validateAndFetch, 2000);
   }
}