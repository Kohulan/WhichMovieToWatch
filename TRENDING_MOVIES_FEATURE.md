# Trending Movies Feature

## Overview
The trending movies feature displays the current movies playing in cinemas based on the user's region. Each movie is clickable and opens a Google search for more information about that movie.

## Features

### 1. **Automatic Region Detection**
- Detects user's region from browser language settings
- Defaults to US if region cannot be determined
- Supports major regions: US, GB, CA, AU, IN, DE, FR, ES, IT, JP, KR, BR, MX, RU, CN

### 2. **Movie Display**
- Shows top 5 currently playing movies in theaters
- Falls back to popular movies if theater data unavailable
- Displays movie poster, title, and rating
- Responsive design that adapts to different screen sizes

### 3. **Interactive Elements**
- Each movie card is clickable
- Opens Google search with movie title and year
- Smooth hover animations and transitions

### 4. **Auto-refresh**
- Automatically refreshes trending movies every 30 minutes
- Ensures users see up-to-date information

## Implementation Details

### Files Modified/Created:
1. **scripts/trending.js** - Core functionality for fetching and displaying trending movies
2. **index.html** - Added trending movies section above footer
3. **css/styles.css** - Added styling for trending movies section
4. **scripts/app.js** - Integrated trending movies initialization

### Key Functions:
- `getUserRegion()` - Detects user's region from browser settings
- `fetchTrendingMovies()` - Fetches movies from TMDB API
- `displayTrendingMovies()` - Renders movies in the UI
- `initializeTrendingMovies()` - Initializes the feature on page load
- `startTrendingMoviesRefresh()` - Sets up auto-refresh interval

### API Integration:
- Uses TMDB API for movie data
- Endpoint: `/movie/now_playing` with region parameter
- Fallback: `/movie/popular` if regional data unavailable

## Styling

### Dark Theme:
- Background with blur effect
- Subtle borders and shadows
- Accent color for ratings

### Light Theme:
- Clean white background
- Softer shadows
- Adjusted contrast for readability

### Responsive Breakpoints:
- Desktop: 5 movies per row
- Tablet (< 1200px): 4 movies per row
- Mobile (< 768px): 3 movies per row
- Small Mobile (< 480px): 2 movies per row

## Testing

To test the feature:
1. Open `test-trending.html` in your browser
2. Check that your region is correctly detected
3. Verify that 5 trending movies are displayed
4. Click on a movie to ensure Google search opens correctly
5. Test on different screen sizes for responsive behavior

## Future Enhancements

Potential improvements for the future:
1. Add more detailed region detection using geolocation API
2. Include local showtimes with theater integration
3. Add quick preview modal with more movie details
4. Support for more regions and languages
5. Integration with ticket booking services
6. Cache results to reduce API calls
7. Add filters for genre or rating

## Troubleshooting

Common issues and solutions:
1. **No movies displayed**: Check browser console for API errors
2. **Wrong region detected**: Browser language settings may need adjustment
3. **Styling issues**: Clear browser cache and reload
4. **Click not working**: Ensure popup blockers aren't preventing Google search

## Usage

The feature automatically loads when users visit the main page. No user interaction is required for initialization. Users can:
1. View trending movies in their region
2. Click any movie to search for more information
3. See updated movies every 30 minutes while the page is open
