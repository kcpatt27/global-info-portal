// Critical path JavaScript - only what's needed for initial rendering
import { renderInitialUI } from './ui/initial.js';
import { setupCoreEventHandlers } from './utils/events.js';
import { initializeCache } from './services/cache.js';

// Initialize critical components
export async function initCritical() {
  // Initialize cache for faster data access
  await initializeCache();
  
  // Render initial UI shell
  renderInitialUI();
  
  // Set up minimal event handlers needed for initial interaction
  setupCoreEventHandlers();
  
  // Register service worker for offline support
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .catch(error => {
          console.error('Service worker registration failed:', error);
        });
    });
  }
}

// Execute critical initialization
initCritical(); 