/**
 * Theme Management for WhichMovieToWatch
 * Handles the switching between dark and light modes
 */

// Get DOM elements
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('i');

// Check for saved theme preference in localStorage, default to dark mode
let currentTheme = localStorage.getItem('theme') || 'dark';

// Apply the saved theme or default when page loads
function applyTheme() {
    if (currentTheme === 'light') {
        document.body.classList.add('light-mode');
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
        themeIcon.style.color = '#f59e0b';
    } else {
        document.body.classList.remove('light-mode');
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
        themeIcon.style.color = '';
    }
}

// Toggle between dark and light themes
function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Save the new theme preference
    localStorage.setItem('theme', currentTheme);
    
    // Apply the new theme
    applyTheme();
    
    // Show toast message
    showToast(`Switched to ${currentTheme} mode`);
}

// Event listener for theme toggle button
themeToggle.addEventListener('click', toggleTheme);

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', () => {
    applyTheme();
}); 