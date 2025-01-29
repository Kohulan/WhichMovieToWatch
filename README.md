# 🎬 Which Movie To Watch

A sleek, modern web application that helps users discover high-quality movies available on major streaming platforms. The app focuses on recommending movies from Netflix, Amazon Prime Video, and Disney+ while ensuring high quality through various filters and metrics.

<p align="center">
  <img src="https://github.com/Kohulan/WhichMovieToWatch/blob/main/website.png?raw=true" alt="Demo" width="600">
</p>

## ✨ Features

- **Smart Streaming Platform Integration**
  - Focuses on movies available on major platforms:
    - Netflix
    - Amazon Prime Video
    - Disney+
  - Shows direct links to where you can watch the movie

- **Quality-Focused Recommendations**
  - Minimum rating of 6.5/10
  - At least 1,000 user votes
  - Quality filters for production value
  - Excludes B-grade movies through budget checks
  - Focus on movies from 1990 onwards

- **Rich Movie Information**
  - High-quality movie posters
  - Detailed movie information
  - Genre classification
  - User ratings and release year
  - Runtime and other metadata

- **Interactive Features**
  - "Love" movies to get similar recommendations
  - "Like" to improve genre preferences
  - Mark movies as "Watched"
  - Skip to the next recommendation

- **Personalization**
  - Remembers your watched movies
  - Learn from your genre preferences
  - Stores loved movies for better recommendations
  - Country-specific streaming availability

## 🚀 Getting Started

### Prerequisites

- A modern web browser
- TMDB API key (get it from [TMDB website](https://www.themoviedb.org/documentation/api))

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/which-movie-to-watch.git
```

2. Navigate to the project directory
```bash
cd which-movie-to-watch
```

3. Open `index.html` in your text editor and replace the API key
```javascript
const API_KEY = 'your_api_key_here';
```

4. Serve the files using a local server
   - You can use Python's built-in server:
     ```bash
     python -m http.server 8000
     ```
   - Or use any other local server solution

5. Open your browser and navigate to `http://localhost:8000`

## 🛠️ Tech Stack

- HTML5
- CSS3 with modern features
- Vanilla JavaScript
- [TMDB API](https://www.themoviedb.org/documentation/api) for movie data
- Font Awesome for icons
- Google Fonts for typography

## 📝 Configuration

### Customizing Streaming Services

You can modify the `MAJOR_STREAMING_SERVICES` array in the JavaScript code to change which streaming services to prioritize:

```javascript
const MAJOR_STREAMING_SERVICES = [
    'Netflix',
    'Amazon Prime Video',
    'Disney Plus'
];
```

### Adjusting Quality Filters

Movie quality filters can be adjusted in the `fetchRandomMovie` function:

```javascript
const hasGoodRating = movieData.vote_average >= 6.5;
const hasEnoughVotes = movieData.vote_count >= 1000;
const hasGoodBudget = movieData.budget > 5000000;
const isRecentEnough = new Date(movieData.release_date).getFullYear() >= 1990;
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## 👏 Acknowledgments

- [TMDB](https://www.themoviedb.org/) for their comprehensive movie database
- Font Awesome for the beautiful icons
- Google Fonts for the typography
- All contributors and users of the app

## 🔮 Future Improvements

- [ ] Add more streaming service providers
- [ ] Implement advanced filtering options
- [ ] Add user accounts and preferences
- [ ] Create a mobile app version
- [ ] Add more personalization features
- [ ] Implement social sharing features

## 📞 Contact

Your Name - [@Kohulan](https://kohulanr.com)

---

⭐️ If you like this project, please give it a star on GitHub!
