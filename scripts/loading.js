// Production-Ready Loading Animation Manager
(function() {
  'use strict';
  
  class LoadingManager {
    constructor() {
      // DOM Elements
      this.loadingContainer = null;
      this.quoteElement = null;
      this.progressElement = null;
      this.loadingTextElement = null;
      this.popcornFillElement = null;
      
      // State management
      this.isLoading = false;
      this.currentQuoteIndex = 0;
      this.progressInterval = null;
      this.quoteInterval = null;
      this.currentProgress = 0;
      this.loadingTimeout = null;
      this.initialized = false;
      this.activeLoadingType = null;
      
      // Performance optimization
      this.animationFrameId = null;
      this.lastProgressUpdate = 0;
      
      // Callbacks
      this.onLoadingComplete = null;
      this.onLoadingStart = null;
    
    // Expanded movie quotes collection with movie titles
    this.quotes = [
      { text: "Here's looking at you, kid.", movie: "Casablanca" },
      { text: "May the Force be with you.", movie: "Star Wars" },
      { text: "I'll be back.", movie: "The Terminator" },
      { text: "You can't handle the truth!", movie: "A Few Good Men" },
      { text: "To infinity and beyond!", movie: "Toy Story" },
      { text: "I'm going to make him an offer he can't refuse.", movie: "The Godfather" },
      { text: "E.T. phone home.", movie: "E.T." },
      { text: "There's no place like home.", movie: "The Wizard of Oz" },
      { text: "Show me the money!", movie: "Jerry Maguire" },
      { text: "You talking to me?", movie: "Taxi Driver" },
      { text: "I see dead people.", movie: "The Sixth Sense" },
      { text: "Houston, we have a problem.", movie: "Apollo 13" },
      { text: "Keep your friends close, but your enemies closer.", movie: "The Godfather II" },
      { text: "Life is like a box of chocolates.", movie: "Forrest Gump" },
      { text: "Just keep swimming.", movie: "Finding Nemo" },
      { text: "Why so serious?", movie: "The Dark Knight" },
      { text: "The first rule of Fight Club is...", movie: "Fight Club" },
      { text: "I am your father.", movie: "Star Wars: The Empire Strikes Back" },
      { text: "Roads? Where we're going, we don't need roads.", movie: "Back to the Future" },
      { text: "After all, tomorrow is another day!", movie: "Gone with the Wind" },
      { text: "I'm the king of the world!", movie: "Titanic" },
      { text: "Frankly, my dear, I don't give a damn.", movie: "Gone with the Wind" },
      { text: "You're gonna need a bigger boat.", movie: "Jaws" },
      { text: "My precious.", movie: "The Lord of the Rings" },
      { text: "Hasta la vista, baby.", movie: "Terminator 2" }
    ];
    
    // Loading messages based on action type
    this.loadingMessages = {
      search: "Searching through our movie database...",
      random: "Finding the perfect movie for you...",
      dinnerTime: "Looking for dinner-friendly movies...",
      free: "Finding free movies you'll love...",
      similar: "Discovering similar movies...",
      default: "Loading your entertainment..."
    };
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }
  
  init() {
    // Set initial quote
    if (this.quoteElement) {
      this.quoteElement.textContent = `"${this.quotes[0]}"`;
    }
  }
  
  show(type = 'random', duration = 3000) {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.loadingContainer.classList.add('active');
    
    // Set loading type
    if (type === 'search') {
      this.loadingContainer.classList.add('search-loading');
      this.loadingContainer.classList.remove('random-loading');
    } else {
      this.loadingContainer.classList.add('random-loading');
      this.loadingContainer.classList.remove('search-loading');
    }
    
    // Start quote rotation
    this.startQuoteRotation();
    
    // Start progress animation
    this.animateProgress(duration);
    
    // Auto-hide after duration
    setTimeout(() => this.hide(), duration);
  }
  
  hide() {
    this.isLoading = false;
    this.loadingContainer.classList.remove('active');
    
    // Clear intervals
    if (this.quoteInterval) {
      clearInterval(this.quoteInterval);
      this.quoteInterval = null;
    }
    
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
    
    // Reset progress
    this.progressElement.textContent = '0%';
  }
  
  startQuoteRotation() {
    // Change quote immediately
    this.updateQuote();
    
    // Then rotate every 3 seconds
    this.quoteInterval = setInterval(() => {
      this.updateQuote();
    }, 3000);
  }
  
  updateQuote() {
    // Fade out
    this.quoteElement.style.opacity = '0';
    
    setTimeout(() => {
      // Change quote
      this.currentQuoteIndex = (this.currentQuoteIndex + 1) % this.quotes.length;
      this.quoteElement.textContent = `"${this.quotes[this.currentQuoteIndex]}"`;
      
      // Fade in
      this.quoteElement.style.opacity = '1';
    }, 500);
  }
  
  animateProgress(duration) {
    let progress = 0;
    const increment = 100 / (duration / 100); // Update every 100ms
    
    this.progressInterval = setInterval(() => {
      progress += increment;
      
      if (progress >= 100) {
        progress = 100;
        clearInterval(this.progressInterval);
      }
      
      this.progressElement.textContent = `${Math.floor(progress)}%`;
      
      // Also update the popcorn fill width if it exists
      const popcornFill = document.querySelector('.popcorn-fill');
      if (popcornFill) {
        popcornFill.style.width = `${progress}%`;
      }
    }, 100);
  }
}

// Create global loading manager instance
const loadingManager = new LoadingManager();

// Export for use in other scripts
window.MovieLoadingManager = loadingManager;

// Example usage functions for different actions
window.showSearchLoading = () => {
  loadingManager.show('search', 2000);
};

window.showRandomMovieLoading = () => {
  loadingManager.show('random', 3000);
};

window.hideLoading = () => {
  loadingManager.hide();
};
