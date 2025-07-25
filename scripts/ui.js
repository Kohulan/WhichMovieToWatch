// Add country display to header
function displayCountry(countryCode) {
    try {
       const countryName = getCountryName(countryCode);
       const headerElement = document.querySelector('.header');
 
       // Remove existing country info if present
       const existingCountryInfo = headerElement.querySelector('.country-info');
       if (existingCountryInfo) {
          existingCountryInfo.remove();
       }
 
       // Create new country display
       const countryDisplay = document.createElement('div');
       countryDisplay.className = 'country-info';
       countryDisplay.innerHTML = `<i class="fas fa-globe"></i> Browsing from ${countryName}`;
       headerElement.appendChild(countryDisplay);
    } catch (error) {
       console.error('Error displaying country:', error);
    }
 }
 
// Main movie display function
async function displayMovie(movie) {
   if (!movie) {
      displayError('No movie data available');
      return;
   }

   try {
      // Fetch trailer and ratings in parallel for better performance
      const [trailer, externalRatings] = await Promise.all([
         fetchMovieTrailer(movie.id),
         fetchExternalRatings(movie.id)
      ]);

      // Update meta tags for the current movie
      if (window.metaTagsManager) {
         await window.metaTagsManager.updateMovieMeta(movie, externalRatings);
      }
 
       const movieCard = document.getElementById('movieCard');
       const releaseYear = new Date(movie.release_date).getFullYear();
       const rating = (movie.vote_average * 10).toFixed(1);
 
       // Get streaming providers for the detected country
       const providers = movie['watch/providers']?.results?.[userCountry] || {};
       const streamingProviders = providers.flatrate || [];
       const rentProviders = providers.rent || [];
       const buyProviders = providers.buy || [];
 
       // Create streaming sections HTML
       const streamingHTML = streamingProviders.length > 0 ? `
              <div class="streaming-section">
                  <h3><i class="fas fa-play-circle"></i> Stream on:</h3>
                  <div class="provider-list">
                      ${streamingProviders.map(provider => createProviderLink(provider)).join('')}
                  </div>
              </div>
          ` : '';
 
       const rentHTML = rentProviders.length > 0 ? `
              <div class="streaming-section">
                  <h3><i class="fas fa-ticket-alt"></i> Rent on:</h3>
                  <div class="provider-list">
                      ${rentProviders.map(provider => createProviderLink(provider)).join('')}
                  </div>
              </div>
          ` : '';
 
       const buyHTML = buyProviders.length > 0 ? `
              <div class="streaming-section">
                  <h3><i class="fas fa-shopping-cart"></i> Buy on:</h3>
                  <div class="provider-list">
                      ${buyProviders.map(provider => createProviderLink(provider)).join('')}
                  </div>
              </div>
          ` : '';
 
       const availabilityMessage = !streamingProviders.length && !rentProviders.length && !buyProviders.length ?
          `<p class="no-streaming"><i class="fas fa-info-circle"></i> No streaming information available in ${userCountry}</p>` :
          '';
 
       // Create ratings HTML
       const ratingsHTML = externalRatings ? `
              <div class="ratings-container">
                  <div class="rating-item imdb">
                      <i class="fab fa-imdb"></i>
                      <div class="rating-value">${externalRatings.imdb}</div>
                      <div class="rating-label">IMDb Rating</div>
                  </div>
                  <div class="rating-item rotten-tomatoes">
                      <i>🍅</i>
                      <div class="rating-value">${externalRatings.rottenTomatoes}</div>
                      <div class="rating-label">Rotten Tomatoes</div>
                  </div>
                  <div class="rating-item tmdb">
                      <i class="fas fa-film"></i>
                      <div class="rating-value">${rating}%</div>
                      <div class="rating-label">TMDB Rating</div>
                  </div>
              </div>
          ` : '';
 
       // Create trailer HTML
       const trailerHTML = trailer ? `
              <div class="trailer-container">
                  <a href="https://www.youtube.com/watch?v=${trailer.key}" 
                     target="_blank" 
                     rel="noopener noreferrer" 
                     class="trailer-link">
                      <i class="fab fa-youtube"></i>
                      Watch Trailer
                  </a>
              </div>
          ` : '';
 
       // Assemble the complete movie card HTML
       movieCard.innerHTML = `
              <div class="movie-content">
                  <div class="poster-container">
                      <div class="poster">
                          <img data-src="${IMAGE_BASE_URL}${movie.poster_path}" 
                              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='350' height='525'%3E%3Crect width='100%25' height='100%25' fill='%23333'/%3E%3C/svg%3E"
                              loading="lazy"
                              decoding="async"
                              alt="${movie.title}"
                              class="lazy-image"
                              onerror="this.src='https://via.placeholder.com/350x525?text=No+Poster'" />
                      </div>
                      ${trailerHTML}
                  </div>
  
                  <div class="movie-info">
                      <h2>${movie.title}</h2>
                      
                      <div class="action-buttons">
                          <button class="btn btn-next" onclick="fetchRandomMovie()">
                              <i class="fas fa-random"></i>
                              Next Movie
                          </button>
                          <button class="btn btn-not-interested" onclick="handleNotInterested(${movie.id})">
                              <i class="fas fa-thumbs-down"></i>
                              Not Interested
                          </button>
                          <button class="btn btn-love" onclick="handleLove(${movie.id})">
                              <i class="fas fa-heart"></i>
                              Love it!
                          </button>
                          <button class="btn btn-watched" onclick="handleWatched(${movie.id})">
                              <i class="fas fa-check"></i>
                              Watched
                          </button>
                      </div>
  
                      <div class="movie-meta">
                          <div class="meta-item">
                              <i class="fas fa-calendar"></i>
                              ${releaseYear}
                          </div>
                          <div class="meta-item">
                              <i class="fas fa-clock"></i>
                              ${movie.runtime || 'N/A'} min
                          </div>
                          <div class="meta-item rating">
                              <i class="fas fa-star"></i>
                              ${rating}%
                          </div>
                      </div>
                      ${ratingsHTML}
                      <div class="genres">
                          ${movie.genres ? movie.genres.map(genre => `
                              <span class="genre">${genre.name}</span>
                          `).join('') : ''}
                      </div>
                     <p class="overview">${movie.overview || 'No overview available.'}</p>
                     
                     ${window.createShareButtons ? window.createShareButtons(movie) : ''}
                     
                     <div class="streaming-info">
                         ${streamingHTML}
                         ${rentHTML}
                         ${buyHTML}
                         ${availabilityMessage}
                     </div>
                  </div>
              </div>
          `;
    } catch (error) {
       console.error('Error displaying movie:', error);
       displayError('Error displaying movie details');
    }
 }
 
 // Dinner time movie display
 async function displayDinnerTimeMovie(movie, providers, service) {
    const modalContent = document.querySelector('.dinner-time-modal-content');
    const releaseYear = new Date(movie.release_date).getFullYear();
    const rating = (movie.vote_average * 10).toFixed(1);
 
    // Create search URL based on service
    let searchUrl = '';
    let buttonClass = '';
    let buttonIcon = '';
    let serviceName = '';
 
    switch (service.id) {
       case 8: // Netflix
          searchUrl = `https://www.netflix.com/search?q=${encodeURIComponent(movie.title)}`;
          buttonClass = 'background: linear-gradient(135deg, #E50914, #B20710)';
          buttonIcon = 'fab fa-netflix';
          serviceName = 'Netflix';
          break;
       case 9: // Prime Video
          searchUrl = `https://www.primevideo.com/search?k=${encodeURIComponent(movie.title)}`;
          buttonClass = 'background: linear-gradient(135deg, #00A8E1, #0066B2)';
          buttonIcon = 'fab fa-amazon';
          serviceName = 'Prime Video';
          break;
       case 337: // Disney+
          searchUrl = `https://www.disneyplus.com/search?q=${encodeURIComponent(movie.title)}`;
          buttonClass = 'background: linear-gradient(135deg, #113CCF, #0E3AAA)';
          buttonIcon = 'fab fa-disney';
          serviceName = 'Disney+';
          break;
    }
 
    modalContent.innerHTML = `
          <div class="dinner-time-movie">
              <div class="dinner-time-poster">
                  <img src="${IMAGE_BASE_URL}${movie.poster_path}" 
                       alt="${movie.title}"
                       loading="lazy"
                       onerror="this.src='https://via.placeholder.com/500x750?text=No+Poster'" />
                  <div class="service-disclaimer">
                      <i class="fas fa-info-circle"></i>
                      Found this movie on ${serviceName}! 
                      Not sponsored by any streaming service.
                  </div>
              </div>
              <div class="dinner-time-info">
                  <h2>${movie.title}</h2>
                  <div class="dinner-time-meta">
                      <span><i class="fas fa-calendar"></i> ${releaseYear}</span>
                      <span><i class="fas fa-star"></i> ${rating}%</span>
                      <span><i class="fas fa-clock"></i> ${movie.runtime} min</span>
                  </div>
                  <p class="dinner-time-overview">${movie.overview}</p>
                  <div class="dinner-time-streaming">
                      <a href="${searchUrl}" 
                         target="_blank" 
                         rel="noopener noreferrer" 
                         class="netflix-button" 
                         style="${buttonClass}">
                          <i class="${buttonIcon}"></i>
                          Watch on ${serviceName}
                      </a>
                      <p class="netflix-note">The link will take you to ${serviceName} search results for "${movie.title}"</p>
                  </div>
                  <div class="dinner-time-actions">
                      <button onclick="handleDinnerTimePreference(${movie.id}, true)" 
                              class="dinner-time-btn like">
                          <i class="fas fa-thumbs-up"></i> Love it!
                      </button>
                      <button onclick="handleDinnerTimePreference(${movie.id}, false)" 
                              class="dinner-time-btn dislike">
                          <i class="fas fa-thumbs-down"></i> Not my taste
                      </button>
                  </div>
              </div>
          </div>
      `;
 }
 
 // Free movie display
 async function displayFreeMovie(movie, tmdbDetails) {
    if (!movie || !movie.youtubeId || !movie.title) {
       throw new Error('Invalid movie data');
    }
 
    // Fetch external ratings if TMDB details are available
    let externalRatings = null;
    if (tmdbDetails && tmdbDetails.id) {
       externalRatings = await fetchExternalRatings(tmdbDetails.id);
    }
 
    const modalContent = document.querySelector('.dinner-time-modal-content');
    const youtubeUrl = `https://www.youtube.com/watch?v=${movie.youtubeId}`;
    const posterPath = tmdbDetails?.poster_path ?
       `${IMAGE_BASE_URL}${tmdbDetails.poster_path}` :
       'https://via.placeholder.com/500x750?text=Free+Movie';
    const releaseYear = tmdbDetails?.release_date ?
       new Date(tmdbDetails.release_date).getFullYear() :
       'N/A';
    const rating = tmdbDetails?.vote_average ?
       (tmdbDetails.vote_average * 10).toFixed(1) :
       'N/A';
    const runtime = tmdbDetails?.runtime || 'N/A';
    const overview = tmdbDetails?.overview || 'Watch this free movie on YouTube!';
 
    // Create ratings HTML
    const ratingsHTML = `
          <div class="ratings-container">
              <div class="rating-item imdb">
                  <i class="fab fa-imdb"></i>
                  <div class="rating-value">${externalRatings?.imdb || 'N/A'}</div>
                  <div class="rating-label">IMDb Rating</div>
              </div>
              <div class="rating-item rotten-tomatoes">
                  <i>🍅</i>
                  <div class="rating-value">${externalRatings?.rottenTomatoes || 'N/A'}</div>
                  <div class="rating-label">Rotten Tomatoes</div>
              </div>
              <div class="rating-item tmdb">
                  <i class="fas fa-film"></i>
                  <div class="rating-value">${rating}%</div>
                  <div class="rating-label">TMDB Rating</div>
              </div>
          </div>
      `;
 
    modalContent.innerHTML = `
          <div class="dinner-time-movie">
              <div class="dinner-time-poster">
                  <img src="${posterPath}" 
                       alt="${movie.title}"
                       loading="lazy"
                       onerror="this.src='https://via.placeholder.com/500x750?text=Free+Movie'" />
                  <div class="disclaimer-text">
                      Note: Video availability may vary by region due to geographic restrictions. 
                      Content access is subject to your local laws and platform terms of service.
                  </div>
              </div>
              <div class="dinner-time-info">
                  <h2>${movie.title}</h2>
                  <div class="dinner-time-meta">
                      <span><i class="fas fa-calendar"></i> ${releaseYear}</span>
                      <span><i class="fas fa-star"></i> ${rating}%</span>
                      <span><i class="fas fa-clock"></i> ${runtime} min</span>
                  </div>
                  ${ratingsHTML}
                  <p class="dinner-time-overview">${overview}</p>
                  <div class="dinner-time-streaming">
                      <div class="dinner-time-buttons">
                          <a href="${youtubeUrl}" 
                             target="_blank" 
                             rel="noopener noreferrer" 
                             class="netflix-button" 
                             style="background: linear-gradient(135deg, #FF0000, #CC0000);">
                              <i class="fab fa-youtube"></i>
                              Watch on YouTube
                          </a>
                          <button onclick="getNextFreeMovie()" 
                                  class="netflix-button" 
                                  style="background: linear-gradient(135deg, #4CAF50, #2E7D32);">
                              <i class="fas fa-forward"></i>
                              Next Suggestion
                          </button>
                      </div>
                      <p class="netflix-note">Click to watch "${movie.title}" on YouTube</p>
                  </div>
              </div>
          </div>
      `;
 }
 
 // Loading state displays
 function displayLoadingState(element, message) {
    element.innerHTML = `
          <div class="loading">
              <i class="fas fa-film"></i>
              <p>${message || 'Loading...'}</p>
          </div>
      `;
 }
 
 function displayDinnerTimeLoading(message) {
    document.querySelector('.dinner-time-modal-content').innerHTML = `
          <div class="dinner-time-loading">
              <i class="fas fa-utensils fa-spin"></i>
              <p>${message || 'Finding the perfect movie for dinner...'}</p>
          </div>
      `;
 }
 
 // Error state displays
 function displayErrorState(element, error, retryFunction) {
    element.innerHTML = `
          <div class="error">
              <i class="fas fa-exclamation-circle"></i>
              <p>${error}</p>
              ${retryFunction ? `
                  <button class="btn btn-next" onclick="${retryFunction}">
                      <i class="fas fa-redo"></i>
                      Try Again
                  </button>
              ` : ''}
          </div>
      `;
 }
 
 // Modal management
 function initializeModals() {
    // Close modals when clicking outside
    window.addEventListener('click', (event) => {
       const dinnerTimeModal = document.getElementById('dinnerTimeModal');
       const preferenceModal = document.getElementById('preferenceModal');
 
       if (event.target === dinnerTimeModal) {
          closeDinnerTimeModal();
       }
       if (event.target === preferenceModal) {
          hidePreferenceModal();
       }
    });
 
    // Initialize preference modal if needed
    const preferredProvider = localStorage.getItem('preferredProvider');
    const preferredGenre = localStorage.getItem('preferredGenre');
 
    if (!preferredProvider || !preferredGenre) {
       showPreferenceModal();
    }
 }
 
 // Genre badge creation
 function createGenreBadges(genres) {
    if (!genres || genres.length === 0) return '';
    return genres.map(genre => `
          <span class="genre" data-genre-id="${genre.id}">
              ${genre.name}
          </span>
      `).join('');
 }
 
 // Meta information display
 function createMetaInfo(movie) {
    const releaseYear = new Date(movie.release_date).getFullYear();
    const rating = (movie.vote_average * 10).toFixed(1);
 
    return `
          <div class="movie-meta">
              <div class="meta-item">
                  <i class="fas fa-calendar"></i>
                  ${releaseYear}
              </div>
              <div class="meta-item">
                  <i class="fas fa-clock"></i>
                  ${movie.runtime || 'N/A'} min
              </div>
              <div class="meta-item rating">
                  <i class="fas fa-star"></i>
                  ${rating}%
              </div>
          </div>
      `;
 }
 
 // Action buttons creation
 function createActionButtons(movieId) {
    return `
          <div class="action-buttons">
              <button class="btn btn-next" onclick="fetchRandomMovie()">
                  <i class="fas fa-random"></i>
                  Next Movie
              </button>
              <button class="btn btn-not-interested" onclick="handleNotInterested(${movie.id})">
              <i class="fas fa-times"></i>
              Not Interested
          </button>
              <button class="btn btn-love" onclick="handleLove(${movieId})">
                  <i class="fas fa-heart"></i>
                  Love it!
              </button>
              <button class="btn btn-watched" onclick="handleWatched(${movieId})">
                  <i class="fas fa-check"></i>
                  Watched
              </button>
          </div>
      `;
 }
 
 // Streaming provider display
 function createStreamingSection(providers) {
    if (!providers || !Object.keys(providers).length) {
       return `
              <p class="no-streaming">
                  <i class="fas fa-info-circle"></i> 
                  No streaming information available in your region
              </p>
          `;
    }
 
    const sections = [];
 
    if (providers.flatrate?.length) {
       sections.push(`
              <div class="streaming-section">
                  <h3><i class="fas fa-play-circle"></i> Stream on:</h3>
                  <div class="provider-list">
                      ${providers.flatrate.map(provider => createProviderLink(provider)).join('')}
                  </div>
              </div>
          `);
    }
 
    if (providers.rent?.length) {
       sections.push(`
              <div class="streaming-section">
                  <h3><i class="fas fa-ticket-alt"></i> Rent on:</h3>
                  <div class="provider-list">
                      ${providers.rent.map(provider => createProviderLink(provider)).join('')}
                  </div>
              </div>
          `);
    }
 
    if (providers.buy?.length) {
       sections.push(`
              <div class="streaming-section">
                  <h3><i class="fas fa-shopping-cart"></i> Buy on:</h3>
                  <div class="provider-list">
                      ${providers.buy.map(provider => createProviderLink(provider)).join('')}
                  </div>
              </div>
          `);
    }
 
    return sections.join('') || `
          <p class="no-streaming">
              <i class="fas fa-info-circle"></i> 
              No streaming options found
          </p>
      `;
 }
 
 // UI Animation handlers
 function addFadeInAnimation(element) {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
 
    // Trigger reflow
    element.offsetHeight;
 
    element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    element.style.opacity = '1';
    element.style.transform = 'translateY(0)';
 }
 
 function addPulseAnimation(element) {
    element.classList.add('pulse');
    element.addEventListener('animationend', () => {
       element.classList.remove('pulse');
    });
 }
 
 // Responsive UI handlers
 function handleResponsiveLayout() {
    const movieContent = document.querySelector('.movie-content');
    if (!movieContent) return;
 
    const updateLayout = () => {
       if (window.innerWidth <= 768) {
          movieContent.classList.add('mobile-layout');
       } else {
          movieContent.classList.remove('mobile-layout');
       }
    };
 
    updateLayout();
    window.addEventListener('resize', updateLayout);
 }
 
 // Initialize UI
 function initializeUI() {
    initializeModals();
    handleResponsiveLayout();
 
    // Add global event listeners
    document.addEventListener('keydown', (event) => {
       if (event.key === 'Escape') {
          closeDinnerTimeModal();
          hidePreferenceModal();
       }
    });
 }
 
 // Export UI functions
 window.ui = {
    displayMovie,
    displayDinnerTimeMovie,
    displayFreeMovie,
    displayLoadingState,
    displayDinnerTimeLoading,
    displayErrorState,
    createGenreBadges,
    createMetaInfo,
    createActionButtons,
    createStreamingSection,
    addFadeInAnimation,
    addPulseAnimation,
    handleResponsiveLayout,
    initializeUI
 };