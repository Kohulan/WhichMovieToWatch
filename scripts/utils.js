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

// Modal handling utilities
function openDinnerTimeModal() {
   document.getElementById('dinnerTimeModal').style.display = 'flex';
   fetchDinnerTimeMovie();
}

function closeDinnerTimeModal() {
   document.getElementById('dinnerTimeModal').style.display = 'none';
}

// Window click handler for modals
window.onclick = function (event) {
   const modal = document.getElementById('dinnerTimeModal');
   if (event.target === modal) {
      closeDinnerTimeModal();
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
   debugLog
};