// Main application entry point
import { inject } from '@vercel/analytics';

// Initialize Vercel Web Analytics
inject();

// Import existing script functionality
// Note: The existing script.js contains the application logic
// This file initializes analytics before the app logic runs

// Re-export or include existing functionality
window.addEventListener('DOMContentLoaded', () => {
  console.log('Vercel Web Analytics initialized');
});
