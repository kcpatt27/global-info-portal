/**
 * Interactive Components Main Module
 * Initializes all touch and gesture-based interactive components
 */

import { initializeGestures } from '../../utils/gestures.js';
import { initMapGestures } from './mapGestures.js';
import { initPanelGestures } from './panelGestures.js';

/**
 * Initialize all interactive components
 * @param {Object} options - Configuration options
 */
export function initInteractiveComponents(options = {}) {
  console.log('Initializing interactive components');
  
  // Check if we're on a touch device
  const isTouchDevice = 'ontouchstart' in window || 
    navigator.maxTouchPoints > 0 || 
    navigator.msMaxTouchPoints > 0;
  
  // Only initialize gesture handlers on touch devices
  if (!isTouchDevice && !options.forceInitialize) {
    console.log('Not a touch device, skipping gesture initialization');
    return;
  }
  
  // Add a class to the body for touch-specific CSS
  document.body.classList.add('touch-device');
  
  // Initialize the base gesture system
  const gestureManager = initializeGestures();
  
  // Initialize map gestures with the map instance
  const mapInstance = window.mapInstance || {};
  initMapGestures(mapInstance);
  
  // Initialize panel gestures
  initPanelGestures();
  
  // Implement any document-level gestures needed
  setupGlobalGestures();
  
  console.log('Interactive components initialization complete');
  
  return {
    gestureManager,
    isTouchDevice
  };
}

/**
 * Set up global gestures that apply to the entire document
 */
function setupGlobalGestures() {
  // Add touch active state styling to all interactive elements
  document.addEventListener('touchstart', (e) => {
    const target = e.target;
    
    // Only add active state to interactive elements
    if (target.tagName === 'BUTTON' || 
        target.tagName === 'A' ||
        target.classList.contains('interactive') ||
        target.getAttribute('role') === 'button') {
      
      target.classList.add('touch-active');
    }
  }, { passive: true });
  
  // Remove touch active state
  document.addEventListener('touchend', (e) => {
    const activeElements = document.querySelectorAll('.touch-active');
    activeElements.forEach(el => {
      el.classList.remove('touch-active');
      // Remove focus after a slight delay to prevent stuck focus states
      setTimeout(() => el.blur(), 100);
    });
  }, { passive: true });
  
  document.addEventListener('touchcancel', (e) => {
    const activeElements = document.querySelectorAll('.touch-active');
    activeElements.forEach(el => el.classList.remove('touch-active'));
  }, { passive: true });
  
  // Prevent double-tap zoom on interactive elements
  const interactiveElements = document.querySelectorAll(
    'button, [role="button"], .interactive, a, input, select, .data-tab, .sidebar-button'
  );
  
  interactiveElements.forEach(el => {
    el.addEventListener('touchend', (e) => {
      // Prevent default only on elements that shouldn't trigger zoom
      if (!el.classList.contains('allow-zoom') && !el.closest('.map-container')) {
        e.preventDefault();
      }
    }, { passive: false });
  });
}

// Initialize on load if appropriate
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Delay initialization to ensure all elements are loaded
    setTimeout(() => {
      initInteractiveComponents();
    }, 100);
  });
} else {
  // Delay initialization to ensure all elements are loaded
  setTimeout(() => {
    initInteractiveComponents();
  }, 100);
} 