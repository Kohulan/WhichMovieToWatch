// Function to set the theme
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  updateThemeImages(theme);
}

// Function to update images based on theme
function updateThemeImages(theme) {
  const themeImages = document.querySelectorAll('[data-theme-image]');
  themeImages.forEach(img => {
    const themeSrc = img.getAttribute(`data-${theme}-src`);
    if (themeSrc) {
      img.setAttribute('src', themeSrc);
    }
  });
}

// Function to toggle theme
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
}

// Function to initialize theme on page load
function initTheme() {
  // Retrieve stored theme or default to light
  const storedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  setTheme(storedTheme);
  
  // Optional: Time-based theme switching
  const hour = new Date().getHours();
  if (hour >= 18 || hour < 6) {
    setTheme('dark');
  } else {
    setTheme('light');
  }
}

// Initialize the theme
initTheme();

// Accessibility considerations
window.matchMedia('(prefers-reduced-motion: reduce)').matches ? document.documentElement.style.transition = 'none' : null;

// Theme toggle button
document.getElementById('themeToggleButton').addEventListener('click', toggleTheme);
