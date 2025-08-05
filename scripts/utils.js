// Provider URL mapping and utilities
function getProviderURL(providerName) {
   // Normalize provider name for matching
   const normalizedName = providerName.toLowerCase().replace(/\s+/g, '');

   const providers = {
      // Subscription-Based Streaming Services
      'netflix': 'https://www.netflix.com',
      'amazonprimevideo': 'https://www.primevideo.com',
      'prime': 'https://www.primevideo.com',
      'disneyplus': 'https://www.disneyplus.com',
      'disney+': 'https://www.disneyplus.com',
      'hulu': 'https://www.hulu.com',
      'hbomax': 'https://www.max.com',
      'max': 'https://www.max.com',
      'appletv': 'https://tv.apple.com',
      'appletv+': 'https://tv.apple.com',
      'appletvplus': 'https://tv.apple.com',
      'paramountplus': 'https://www.paramountplus.com',
      'paramount+': 'https://www.paramountplus.com',
      'peacock': 'https://www.peacocktv.com',
      'peacockpremium': 'https://www.peacocktv.com',
      'crunchyroll': 'https://www.crunchyroll.com',
      'amc+': 'https://www.amcplus.com',
      'amcplus': 'https://www.amcplus.com',
      'showtime': 'https://www.showtime.com',
      'starz': 'https://www.starz.com',
      'discovery+': 'https://www.discoveryplus.com',
      'discoveryplus': 'https://www.discoveryplus.com',
      'mubi': 'https://mubi.com',
      'britbox': 'https://www.britbox.com',
      'shudder': 'https://www.shudder.com',
      'funimation': 'https://www.funimation.com',
      'tubi': 'https://tubitv.com',
      'plutotv': 'https://pluto.tv',
      'wow': 'https://www.wowtv.de',
      'wowpresentsplus': 'https://www.wowpresentsplus.com',
      'skyshowtime': 'https://www.skyshowtime.com',
      'rtlplus': 'https://www.rtlplus.de',
      'joyn': 'https://www.joyn.de',
      'magenta': 'https://www.magentatv.de',
      'dazn': 'https://www.dazn.com',
      'rakutentv': 'https://rakuten.tv',
      'maxdome': 'https://www.maxdome.de',
      'arte': 'https://www.arte.tv',
      'ard': 'https://www.ardmediathek.de',
      'zdf': 'https://www.zdf.de',
      '3sat': 'https://www.3sat.de',

      // Digital Purchase/Rental Services
      'googleplay': 'https://play.google.com/store/movies',
      'googletv': 'https://play.google.com/store/movies',
      'vudu': 'https://www.vudu.com',
      'microsoftstore': 'https://www.microsoft.com/en-us/store/movies-and-tv',
      'itunes': 'https://www.apple.com/itunes',
      'youtube': 'https://www.youtube.com/movies',
      'amazonvideo': 'https://www.amazon.com/video',
      'skystore': 'https://store.sky.com',
      'rakutentv': 'https://rakuten.tv',
      'chili': 'https://www.chili.com',
      'cineplexstore': 'https://store.cineplex.com',
      'pantaflix': 'https://www.pantaflix.com',
      'videobuster': 'https://www.videobuster.de',
      'maxdome': 'https://www.maxdome.de'
   };


   // Try to match the normalized provider name
   const providerKey = Object.keys(providers).find(key =>
      normalizedName.includes(key.toLowerCase())
   );

   return providerKey ? providers[providerKey] : '#';
}

// Provider link creation
function createProviderLink(provider) {
   const providerUrl = getProviderURL(provider.provider_name);
   return `
        <a href="${providerUrl}" 
           class="provider" 
           title="${provider.provider_name}"
           target="_blank"
           rel="noopener noreferrer">
            <img src="https://image.tmdb.org/t/p/original${provider.logo_path}" 
                 alt="${provider.provider_name}" 
                 loading="lazy" />
        </a>
    `;
}

// Function to search movie availability in other regions and platforms
async function findMovieInOtherRegions(title, movieId) {
    try {
        showToast('Searching for availability in other regions...');
        
        // Get the movie details with watch providers for all regions
        const detailsResponse = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&append_to_response=watch/providers`);
        const movieData = await detailsResponse.json();
        const providers = movieData['watch/providers']?.results;
        
        if (!providers || Object.keys(providers).length === 0) {
            showToast('No streaming information found for this movie worldwide.');
            return;
        }
        
        // Define major streaming services in priority order
        const majorServices = [
            { name: 'Netflix', id: 8 },
            { name: 'Disney Plus', id: 337 },
            { name: 'Amazon Prime Video', id: 9 },
            { name: 'HBO Max', id: 384 },
            { name: 'Apple TV Plus', id: 350 },
            { name: 'Paramount Plus', id: 531 },
            { name: 'Hulu', id: 15 }
        ];
        
        let foundResults = [];
        
        // Search through all regions for major streaming services
        for (const [countryCode, countryProviders] of Object.entries(providers)) {
            const streamingProviders = countryProviders.flatrate || [];
            
            // Check if any major streaming service has this movie
            for (const service of majorServices) {
                const foundProvider = streamingProviders.find(p => 
                    p.provider_id === service.id || 
                    p.provider_name.toLowerCase().includes(service.name.toLowerCase())
                );
                
                if (foundProvider) {
                    foundResults.push({
                        country: getCountryName(countryCode),
                        countryCode: countryCode,
                        service: foundProvider.provider_name,
                        serviceId: foundProvider.provider_id
                    });
                }
            }
        }
        
if (foundResults.length === 0) {
            // Check all streaming services if not available on major platforms
            for (const [countryCode, countryProviders] of Object.entries(providers)) {
                const streamingProviders = countryProviders.flatrate || [];
                for (const provider of streamingProviders) {
                    foundResults.push({
                        country: getCountryName(countryCode),
                        countryCode: countryCode,
                        service: provider.provider_name,
                        serviceId: provider.provider_id
                    });
                }
            }
            
            if (foundResults.length === 0) {
                showToast('No streaming information found for this movie worldwide.');
                return;
            }
        }
        
        // Group results by service
        const groupedResults = {};
        foundResults.forEach(result => {
            if (!groupedResults[result.service]) {
                groupedResults[result.service] = [];
            }
            groupedResults[result.service].push(result.country);
        });
        
        // Display results in a modal
        displayMovieAvailabilityModal(title, groupedResults);
        
    } catch (error) {
        console.error('Error searching for movie in other regions:', error);
        showToast('An error occurred while searching. Please try again.');
    }
}

// Display modal showing movie availability in different regions
function displayMovieAvailabilityModal(movieTitle, availabilityData) {
    const modal = document.getElementById('availabilityModal');
    const modalContent = document.querySelector('.availability-modal-content');
    
    // Define major streaming services for categorization
    const majorServices = ['Netflix', 'Disney Plus', 'Amazon Prime Video', 'HBO Max', 'Apple TV Plus', 'Paramount Plus', 'Hulu'];
    
    // Separate major and other services
    const majorPlatforms = {};
    const otherPlatforms = {};
    
    for (const [service, countries] of Object.entries(availabilityData)) {
        const isMajor = majorServices.some(major => service.toLowerCase().includes(major.toLowerCase()));
        if (isMajor) {
            majorPlatforms[service] = countries;
        } else {
            otherPlatforms[service] = countries;
        }
    }
    
    // Create HTML for major platforms
    let majorHTML = '';
    if (Object.keys(majorPlatforms).length > 0) {
        majorHTML = `
            <div class="availability-category">
                <h4 class="category-title"><i class="fas fa-star"></i> Major Streaming Platforms</h4>
                <div class="category-results">
        `;
        for (const [service, countries] of Object.entries(majorPlatforms)) {
            const countryList = countries.slice(0, 6).join(', ') + (countries.length > 6 ? ` and ${countries.length - 6} more` : '');
            majorHTML += `
                <div class="availability-result major-platform">
                    <div class="service-name">
                        <i class="fas fa-tv"></i>
                        ${service}
                    </div>
                    <div class="countries-list">
                        <i class="fas fa-globe"></i>
                        Available in: ${countryList}
                    </div>
                </div>
            `;
        }
        majorHTML += '</div></div>';
    }
    
    // Create HTML for other platforms
    let otherHTML = '';
    if (Object.keys(otherPlatforms).length > 0) {
        otherHTML = `
            <div class="availability-category">
                <h4 class="category-title"><i class="fas fa-broadcast-tower"></i> Other Streaming Services</h4>
                <div class="category-results">
        `;
        
        // Sort other platforms by number of countries (most available first)
        const sortedOther = Object.entries(otherPlatforms).sort((a, b) => b[1].length - a[1].length);
        
        for (const [service, countries] of sortedOther.slice(0, 15)) { // Limit to 15 other services
            const countryList = countries.slice(0, 4).join(', ') + (countries.length > 4 ? ` and ${countries.length - 4} more` : '');
            otherHTML += `
                <div class="availability-result other-platform">
                    <div class="service-name">
                        <i class="fas fa-play-circle"></i>
                        ${service}
                    </div>
                    <div class="countries-list">
                        <i class="fas fa-globe"></i>
                        Available in: ${countryList}
                    </div>
                </div>
            `;
        }
        
        if (sortedOther.length > 15) {
            otherHTML += `
                <div class="more-services-note">
                    <i class="fas fa-info-circle"></i>
                    And ${sortedOther.length - 15} more streaming services worldwide...
                </div>
            `;
        }
        
        otherHTML += '</div></div>';
    }
    
    const resultsHTML = majorHTML + otherHTML;
    
    modalContent.innerHTML = `
        <div class="availability-modal">
            <div class="availability-header">
                <h2><i class="fas fa-search-location"></i> "${movieTitle}" Availability</h2>
                <button class="close-btn" onclick="closeAvailabilityModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="availability-content">
                <p class="availability-intro">
                    <i class="fas fa-info-circle"></i>
                    This movie is available on the following streaming platforms in other regions:
                </p>
                <div class="availability-results">
                    ${resultsHTML}
                </div>
                <div class="availability-note">
                    <i class="fas fa-exclamation-triangle"></i>
                    <strong>Note:</strong> Streaming availability varies by region due to licensing agreements. 
                    Consider using a VPN service or checking local streaming platforms.
                </div>
                <div class="availability-actions">
                    <button onclick="closeAvailabilityModal()" class="btn-close-availability">
                        <i class="fas fa-check"></i> Got it!
                    </button>
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
}

// Toast notification system
function showToast(message) {
   const toast = document.getElementById('toast');
   toast.textContent = message;
   toast.classList.add('visible');
   setTimeout(() => {
      toast.classList.remove('visible');
   }, 3000);
}

// Error display utilities
function displayError(message = 'Something went wrong') {
   const movieCard = document.getElementById('movieCard');
   movieCard.innerHTML = `
        <div class="error">
            <i class="fas fa-exclamation-circle"></i>
            <p>Error: ${message}</p>
            <button class="btn btn-next" onclick="fetchRandomMovie()">
                <i class="fas fa-redo"></i>
                Try Again
            </button>
        </div>
    `;
}

// Dinner time error display
function displayDinnerTimeError(maxRetries) {
   document.querySelector('.dinner-time-modal-content').innerHTML = `
        <div class="dinner-time-error">
            <i class="fas fa-utensils"></i>
            <p>We're having trouble finding movies on streaming services right now. 
               How about trying one of these options:</p>
            <div style="display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem;">
                <button onclick="openFreeMovieModal()" class="dinner-time-retry">
                    <i class="fas fa-film"></i> Try a Free Movie Instead
                </button>
                <button onclick="fetchRandomMovie()" class="dinner-time-retry">
                    <i class="fas fa-random"></i> Find Any Movie
                </button>
                <button onclick="fetchDinnerTimeMovie(0, ${maxRetries})" class="dinner-time-retry">
                    <i class="fas fa-redo"></i> Try Again
                </button>
            </div>
        </div>
    `;
}

// Netflix Search modal handling utility
function openNetflixSearchModal() {
    document.getElementById('netflixModal').style.display = 'flex';
    // Keep the disclaimer visible initially
    const resultsContainer = document.getElementById('netflixResults');
    resultsContainer.innerHTML = `
        <div class="disclaimer">
            <i class="fas fa-info-circle"></i>
            <p><strong>Disclaimer:</strong> We are not sponsored by or affiliated with Netflix. This search is provided for your convenience to find regional availability.</p>
        </div>
    `;
}

function closeNetflixModal() {
    document.getElementById('netflixModal').style.display = 'none';
}

async function searchNetflixAvailability() {
    const searchInput = document.getElementById('netflixMovieSearch').value.trim();
    if (!searchInput) {
        showToast('Please enter a movie title');
        return;
    }
    
    const resultsContainer = document.getElementById('netflixResults');
    const loadingMessage = `
        <div class="disclaimer">
            <i class="fas fa-info-circle"></i>
            <p><strong>Disclaimer:</strong> We are not sponsored by or affiliated with Netflix. This search is provided for your convenience to find regional availability.</p>
        </div>
        <div class="loading-netflix">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Looking up Netflix availability...</p>
        </div>
    `;
    resultsContainer.innerHTML = loadingMessage;

    try {
        // First search for the movie using TMDB
        const searchResponse = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(searchInput)}`);
        const searchData = await searchResponse.json();
        
        if (!searchData.results || searchData.results.length === 0) {
            throw new Error('Movie not found');
        }
        
        // Get the first result and check Netflix availability
        const movie = searchData.results[0];
        const detailsResponse = await fetch(`${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}&append_to_response=watch/providers`);
        const movieData = await detailsResponse.json();
        
        const providers = movieData['watch/providers']?.results;
        if (!providers) {
            throw new Error('No streaming data available');
        }
        
        // Find Netflix availability across all regions
        const netflixCountries = [];
        const netflixId = 8; // Netflix provider ID
        
        for (const [countryCode, countryProviders] of Object.entries(providers)) {
            const streamingProviders = countryProviders.flatrate || [];
            const hasNetflix = streamingProviders.some(provider => 
                provider.provider_id === netflixId || 
                provider.provider_name.toLowerCase().includes('netflix')
            );
            
            if (hasNetflix) {
                netflixCountries.push({
                    code: countryCode,
                    name: getCountryName(countryCode)
                });
            }
        }
        
        if (netflixCountries.length === 0) {
            throw new Error('Not available on Netflix');
        }
        
        // Display results
        const disclaimer = `
            <div class="disclaimer">
                <i class="fas fa-info-circle"></i>
                <p><strong>Disclaimer:</strong> We are not sponsored by or affiliated with Netflix. This search is provided for your convenience to find regional availability.</p>
            </div>
        `;
        
        const results = netflixCountries.map(country => `
            <div class="country-result">
                <div class="country-name">
                    <i class="fas fa-flag"></i>
                    ${country.name}
                </div>
                <a href="https://www.netflix.com/search?q=${encodeURIComponent(movie.title)}" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   class="netflix-link">
                    <i class="fab fa-netflix"></i>
                    Search on Netflix
                </a>
            </div>
        `).join('');
        
        resultsContainer.innerHTML = disclaimer + `
            <div class="netflix-results-section">
                <h3>"${movie.title}" is available on Netflix in:</h3>
                ${results}
                <div class="availability-note">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p><strong>Note:</strong> Streaming availability varies by region due to licensing agreements. You may need to use a VPN service to access content in different regions.</p>
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('Netflix search error:', error);
        const disclaimer = `
            <div class="disclaimer">
                <i class="fas fa-info-circle"></i>
                <p><strong>Disclaimer:</strong> We are not sponsored by or affiliated with Netflix. This search is provided for your convenience to find regional availability.</p>
            </div>
        `;
        
        let errorMessage = 'Unable to retrieve Netflix availability.';
        if (error.message === 'Movie not found') {
            errorMessage = 'Movie not found. Please check the spelling and try again.';
        } else if (error.message === 'Not available on Netflix') {
            errorMessage = 'This movie is not currently available on Netflix in any region.';
        }
        
        resultsContainer.innerHTML = disclaimer + `
            <div class="error-netflix">
                <i class="fas fa-times-circle"></i>
                <p>${errorMessage}</p>
                <p>Please try again later or search for a different movie.</p>
            </div>
        `;
    }
}
function openDinnerTimeModal() {
   document.getElementById('dinnerTimeModal').style.display = 'flex';
   fetchDinnerTimeMovie();
}

function closeDinnerTimeModal() {
   document.getElementById('dinnerTimeModal').style.display = 'none';
}

function closeAvailabilityModal() {
   document.getElementById('availabilityModal').style.display = 'none';
}

// Window click handler for modals
window.onclick = function (event) {
   const dinnerModal = document.getElementById('dinnerTimeModal');
   const availabilityModal = document.getElementById('availabilityModal');
   
   if (event.target === dinnerModal) {
      closeDinnerTimeModal();
   } else if (event.target === availabilityModal) {
      closeAvailabilityModal();
   }
};

// Recommendations display utility
function displayRecommendations(movies, title) {
   const recommendationsSection = document.getElementById('recommendationsSection');
   if (!movies || movies.length === 0) {
      recommendationsSection.innerHTML = `
            <h3 style="grid-column: 1/-1; margin-bottom: 1rem;">No recommendations found</h3>
        `;
      return;
   }

   recommendationsSection.innerHTML = `
        <h3 style="grid-column: 1/-1; margin-bottom: 1rem; font-size: 1.5rem; color: var(--text);">
            ${title}
        </h3>
        ${movies.map(movie => `
            <div class="recommended-movie">
                <img src="${IMAGE_BASE_URL}${movie.poster_path}" 
                     alt="${movie.title}"
                     loading="lazy"
                     onerror="this.src='https://via.placeholder.com/300x450?text=No+Poster'" />
                <div class="recommended-movie-info">
                    <div class="recommended-movie-title">${movie.title}</div>
                    <div class="recommended-movie-meta">
                        ${new Date(movie.release_date).getFullYear()} • 
                        ${(movie.vote_average * 10).toFixed(1)}%
                    </div>
                </div>
            </div>
        `).join('')}
    `;
   recommendationsSection.classList.add('visible');
}

// Data formatting utilities
function formatRuntime(minutes) {
   if (!minutes) return 'N/A';
   const hours = Math.floor(minutes / 60);
   const remainingMinutes = minutes % 60;
   return hours > 0 ?
      `${hours}h ${remainingMinutes}m` :
      `${remainingMinutes}m`;
}

function formatDate(dateString) {
   if (!dateString) return 'N/A';
   const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
   };
   return new Date(dateString).toLocaleDateString(undefined, options);
}

function formatRating(rating) {
   if (!rating) return 'N/A';
   return `${(rating * 10).toFixed(1)}%`;
}

// Loading animation utilities
function showLoadingAnimation(element, message) {
   element.innerHTML = `
        <div class="loading">
            <i class="fas fa-film fa-spin"></i>
            <p>${message || 'Loading...'}</p>
        </div>
    `;
}

function showDinnerTimeLoading(message) {
   document.querySelector('.dinner-time-modal-content').innerHTML = `
        <div class="dinner-time-loading">
            <i class="fas fa-utensils fa-spin"></i>
            <p>${message || 'Finding the perfect movie for dinner...'}</p>
        </div>
    `;
}

// URL manipulation utilities
function createSearchUrl(title, service) {
   const encodedTitle = encodeURIComponent(title);
   switch (service.toLowerCase()) {
      case 'netflix':
         return `https://www.netflix.com/search?q=${encodedTitle}`;
      case 'prime video':
         return `https://www.primevideo.com/search?k=${encodedTitle}`;
      case 'disney+':
         return `https://www.disneyplus.com/search?q=${encodedTitle}`;
      default:
         return `https://www.google.com/search?q=${encodedTitle}+movie+watch+online`;
   }
}

// String manipulation utilities
function truncateText(text, maxLength) {
   if (!text || text.length <= maxLength) return text;
   return text.substr(0, maxLength) + '...';
}

function sanitizeString(str) {
   return str.replace(/[^\w\s-]/g, '').trim();
}

// Validation utilities
function isValidUrl(string) {
   try {
      new URL(string);
      return true;
   } catch (_) {
      return false;
   }
}

function isValidImageUrl(url) {
   return url && url.match(/\.(jpeg|jpg|gif|png)$/i);
}

// Local storage utilities
function safelyParseJSON(json, fallback = null) {
   try {
      return JSON.parse(json);
   } catch (e) {
      console.error('Error parsing JSON:', e);
      return fallback;
   }
}

function safelyStringifyJSON(obj) {
   try {
      return JSON.stringify(obj);
   } catch (e) {
      console.error('Error stringifying object:', e);
      return '{}';
   }
}

// Debug utilities
function debugLog(message, data = null) {
   if (process.env.NODE_ENV === 'development') {
      console.log(`[Debug] ${message}`, data);
   }
}

// Country code mapping
const countryNames = {
   'AF': 'Afghanistan',
   'AX': 'Åland Islands',
   'AL': 'Albania',
   'DZ': 'Algeria',
   'AS': 'American Samoa',
   'AD': 'Andorra',
   'AO': 'Angola',
   'AI': 'Anguilla',
   'AQ': 'Antarctica',
   'AG': 'Antigua and Barbuda',
   'AR': 'Argentina',
   'AM': 'Armenia',
   'AW': 'Aruba',
   'AU': 'Australia',
   'AT': 'Austria',
   'AZ': 'Azerbaijan',
   'BS': 'Bahamas',
   'BH': 'Bahrain',
   'BD': 'Bangladesh',
   'BB': 'Barbados',
   'BY': 'Belarus',
   'BE': 'Belgium',
   'BZ': 'Belize',
   'BJ': 'Benin',
   'BM': 'Bermuda',
   'BT': 'Bhutan',
   'BO': 'Bolivia',
   'BA': 'Bosnia and Herzegovina',
   'BW': 'Botswana',
   'BV': 'Bouvet Island',
   'BR': 'Brazil',
   'IO': 'British Indian Ocean Territory',
   'BN': 'Brunei Darussalam',
   'BG': 'Bulgaria',
   'BF': 'Burkina Faso',
   'BI': 'Burundi',
   'KH': 'Cambodia',
   'CM': 'Cameroon',
   'CA': 'Canada',
   'CV': 'Cape Verde',
   'KY': 'Cayman Islands',
   'CF': 'Central African Republic',
   'TD': 'Chad',
   'CL': 'Chile',
   'CN': 'China',
   'CX': 'Christmas Island',
   'CC': 'Cocos (Keeling) Islands',
   'CO': 'Colombia',
   'KM': 'Comoros',
   'CG': 'Congo',
   'CD': 'Congo, Democratic Republic',
   'CK': 'Cook Islands',
   'CR': 'Costa Rica',
   'CI': 'Côte d\'Ivoire',
   'HR': 'Croatia',
   'CU': 'Cuba',
   'CY': 'Cyprus',
   'CZ': 'Czech Republic',
   'DK': 'Denmark',
   'DJ': 'Djibouti',
   'DM': 'Dominica',
   'DO': 'Dominican Republic',
   'EC': 'Ecuador',
   'EG': 'Egypt',
   'SV': 'El Salvador',
   'GQ': 'Equatorial Guinea',
   'ER': 'Eritrea',
   'EE': 'Estonia',
   'ET': 'Ethiopia',
   'FK': 'Falkland Islands (Malvinas)',
   'FO': 'Faroe Islands',
   'FJ': 'Fiji',
   'FI': 'Finland',
   'FR': 'France',
   'GF': 'French Guiana',
   'PF': 'French Polynesia',
   'TF': 'French Southern Territories',
   'GA': 'Gabon',
   'GM': 'Gambia',
   'GE': 'Georgia',
   'DE': 'Germany',
   'GH': 'Ghana',
   'GI': 'Gibraltar',
   'GR': 'Greece',
   'GL': 'Greenland',
   'GD': 'Grenada',
   'GP': 'Guadeloupe',
   'GU': 'Guam',
   'GT': 'Guatemala',
   'GG': 'Guernsey',
   'GN': 'Guinea',
   'GW': 'Guinea-Bissau',
   'GY': 'Guyana',
   'HT': 'Haiti',
   'HM': 'Heard Island and McDonald Islands',
   'VA': 'Holy See (Vatican City State)',
   'HN': 'Honduras',
   'HK': 'Hong Kong',
   'HU': 'Hungary',
   'IS': 'Iceland',
   'IN': 'India',
   'ID': 'Indonesia',
   'IR': 'Iran',
   'IQ': 'Iraq',
   'IE': 'Ireland',
   'IM': 'Isle of Man',
   'IL': 'Israel',
   'IT': 'Italy',
   'JM': 'Jamaica',
   'JP': 'Japan',
   'JE': 'Jersey',
   'JO': 'Jordan',
   'KZ': 'Kazakhstan',
   'KE': 'Kenya',
   'KI': 'Kiribati',
   'KP': 'North Korea',
   'KR': 'South Korea',
   'KW': 'Kuwait',
   'KG': 'Kyrgyzstan',
   'LA': 'Laos',
   'LV': 'Latvia',
   'LB': 'Lebanon',
   'LS': 'Lesotho',
   'LR': 'Liberia',
   'LY': 'Libya',
   'LI': 'Liechtenstein',
   'LT': 'Lithuania',
   'LU': 'Luxembourg',
   'MO': 'Macao',
   'MK': 'North Macedonia',
   'MG': 'Madagascar',
   'MW': 'Malawi',
   'MY': 'Malaysia',
   'MV': 'Maldives',
   'ML': 'Mali',
   'MT': 'Malta',
   'MH': 'Marshall Islands',
   'MQ': 'Martinique',
   'MR': 'Mauritania',
   'MU': 'Mauritius',
   'YT': 'Mayotte',
   'MX': 'Mexico',
   'FM': 'Micronesia',
   'MD': 'Moldova',
   'MC': 'Monaco',
   'MN': 'Mongolia',
   'ME': 'Montenegro',
   'MS': 'Montserrat',
   'MA': 'Morocco',
   'MZ': 'Mozambique',
   'MM': 'Myanmar',
   'NA': 'Namibia',
   'NR': 'Nauru',
   'NP': 'Nepal',
   'NL': 'Netherlands',
   'NC': 'New Caledonia',
   'NZ': 'New Zealand',
   'NI': 'Nicaragua',
   'NE': 'Niger',
   'NG': 'Nigeria',
   'NU': 'Niue',
   'NF': 'Norfolk Island',
   'MP': 'Northern Mariana Islands',
   'NO': 'Norway',
   'OM': 'Oman',
   'PK': 'Pakistan',
   'PW': 'Palau',
   'PS': 'Palestine',
   'PA': 'Panama',
   'PG': 'Papua New Guinea',
   'PY': 'Paraguay',
   'PE': 'Peru',
   'PH': 'Philippines',
   'PN': 'Pitcairn',
   'PL': 'Poland',
   'PT': 'Portugal',
   'PR': 'Puerto Rico',
   'QA': 'Qatar',
   'RE': 'Réunion',
   'RO': 'Romania',
   'RU': 'Russia',
   'RW': 'Rwanda',
   'BL': 'Saint Barthélemy',
   'SH': 'Saint Helena',
   'KN': 'Saint Kitts and Nevis',
   'LC': 'Saint Lucia',
   'MF': 'Saint Martin',
   'PM': 'Saint Pierre and Miquelon',
   'VC': 'Saint Vincent and the Grenadines',
   'WS': 'Samoa',
   'SM': 'San Marino',
   'ST': 'Sao Tome and Principe',
   'SA': 'Saudi Arabia',
   'SN': 'Senegal',
   'RS': 'Serbia',
   'SC': 'Seychelles',
   'SL': 'Sierra Leone',
   'SG': 'Singapore',
   'SK': 'Slovakia',
   'SI': 'Slovenia',
   'SB': 'Solomon Islands',
   'SO': 'Somalia',
   'ZA': 'South Africa',
   'GS': 'South Georgia and South Sandwich Islands',
   'SS': 'South Sudan',
   'ES': 'Spain',
   'LK': 'Sri Lanka',
   'SD': 'Sudan',
   'SR': 'Suriname',
   'SJ': 'Svalbard and Jan Mayen',
   'SZ': 'Eswatini',
   'SE': 'Sweden',
   'CH': 'Switzerland',
   'SY': 'Syria',
   'TW': 'Taiwan',
   'TJ': 'Tajikistan',
   'TZ': 'Tanzania',
   'TH': 'Thailand',
   'TL': 'Timor-Leste',
   'TG': 'Togo',
   'TK': 'Tokelau',
   'TO': 'Tonga',
   'TT': 'Trinidad and Tobago',
   'TN': 'Tunisia',
   'TR': 'Turkey',
   'TM': 'Turkmenistan',
   'TC': 'Turks and Caicos Islands',
   'TV': 'Tuvalu',
   'UG': 'Uganda',
   'UA': 'Ukraine',
   'AE': 'United Arab Emirates',
   'GB': 'United Kingdom',
   'US': 'United States',
   'UM': 'United States Minor Outlying Islands',
   'UY': 'Uruguay',
   'UZ': 'Uzbekistan',
   'VU': 'Vanuatu',
   'VE': 'Venezuela',
   'VN': 'Vietnam',
   'VG': 'Virgin Islands, British',
   'VI': 'Virgin Islands, U.S.',
   'WF': 'Wallis and Futuna',
   'EH': 'Western Sahara',
   'YE': 'Yemen',
   'ZM': 'Zambia',
   'ZW': 'Zimbabwe'
};

function getCountryName(countryCode) {
   return countryNames[countryCode] || countryCode;
}

// Make displayRecommendations globally accessible for other scripts
window.displayRecommendations = displayRecommendations;

// Make functions globally available
window.findMovieInOtherRegions = findMovieInOtherRegions;
window.closeAvailabilityModal = closeAvailabilityModal;
window.openNetflixSearchModal = openNetflixSearchModal;
window.closeNetflixModal = closeNetflixModal;
window.searchNetflixAvailability = searchNetflixAvailability;

// Export all utilities
window.utils = {
   getProviderURL,
   createProviderLink,
   showToast,
   displayError,
   displayDinnerTimeError,
   openDinnerTimeModal,
   closeDinnerTimeModal,
   displayRecommendations,
   formatRuntime,
   formatDate,
   formatRating,
   showLoadingAnimation,
   showDinnerTimeLoading,
   createSearchUrl,
   truncateText,
   sanitizeString,
   isValidUrl,
   isValidImageUrl,
   safelyParseJSON,
   safelyStringifyJSON,
   debugLog,
   findMovieInOtherRegions
};
