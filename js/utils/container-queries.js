/**
 * Container Queries Polyfill
 * 
 * This module provides fallback support for container queries in browsers that don't support them natively.
 * It works by:
 * 1. Detecting container query support
 * 2. If not supported, adding a class to the body
 * 3. Setting up resize observers to monitor container dimensions
 * 4. Applying appropriate classes based on container dimensions
 */

// Container query configuration - matches the breakpoints in containers.css
const CONTAINER_BREAKPOINTS = {
  info: [
    { minWidth: 400, class: 'info-container-md' },
    { minWidth: 600, class: 'info-container-lg' },
    { maxWidth: 400, class: 'info-container-sm' }
  ],
  stats: [
    { maxWidth: 350, class: 'stats-container-sm' }
  ],
  data: [
    { maxWidth: 450, class: 'data-container-sm' }
  ]
};

/**
 * Check if container queries are supported by the browser
 * @returns {boolean} True if supported, false otherwise
 */
function supportsContainerQueries() {
  return (
    typeof window !== 'undefined' &&
    window.CSS &&
    CSS.supports &&
    CSS.supports('container-type', 'inline-size')
  );
}

/**
 * Initialize container query polyfill
 */
function initContainerQueries() {
  // Check if container queries are supported
  const supported = supportsContainerQueries();
  
  // If supported, no need for polyfill
  if (supported) {
    console.log('Container queries are supported natively ✓');
    return;
  }
  
  console.log('Container queries not supported, using polyfill');
  
  // Add class to body to indicate container queries are not supported
  document.body.classList.add('no-container-queries');
  
  // Set up ResizeObserver for containers
  if (typeof ResizeObserver !== 'undefined') {
    setupContainerObservers();
  } else {
    // Fallback for browsers without ResizeObserver
    window.addEventListener('resize', handleWindowResize);
    // Initial check
    handleWindowResize();
  }
  
  // For dynamic content (like when country selection changes),
  // we should re-check container classes after DOM updates
  setupMutationObserver();
}

/**
 * Set up ResizeObserver for each container
 */
function setupContainerObservers() {
  const observer = new ResizeObserver(entries => {
    for (const entry of entries) {
      const container = entry.target;
      const containerName = getContainerName(container);
      
      if (containerName && CONTAINER_BREAKPOINTS[containerName]) {
        updateContainerClasses(container, containerName, entry.contentRect.width);
      }
    }
  });
  
  // Observe all containers
  observeContainers(observer);
}

/**
 * Watch for DOM changes that might add new containers
 */
function setupMutationObserver() {
  if (typeof MutationObserver === 'undefined') return;
  
  const observer = new MutationObserver((mutations) => {
    // When background-info content changes, make sure it expands properly
    mutations.forEach(mutation => {
      if (mutation.type === 'childList' && 
          (mutation.target.classList.contains('background-info') || 
           mutation.target.classList.contains('info-container'))) {
        
        // Re-apply styles to ensure proper expansion
        const backgroundInfo = document.querySelector('.background-info');
        if (backgroundInfo) {
          // Set explicit full height to make sure it expands
          backgroundInfo.style.flex = '1';
          backgroundInfo.style.display = 'flex';
          backgroundInfo.style.flexDirection = 'column';
          backgroundInfo.style.maxHeight = 'none';
        }
      }
    });
    
    // Check if any new containers were added
    if (mutations.some(m => m.addedNodes.length > 0)) {
      // Re-observe containers if new ones were added
      observeContainers(new ResizeObserver(entries => {
        for (const entry of entries) {
          const container = entry.target;
          const containerName = getContainerName(container);
          
          if (containerName && CONTAINER_BREAKPOINTS[containerName]) {
            updateContainerClasses(container, containerName, entry.contentRect.width);
          }
        }
      }));
    }
  });
  
  // Start observing the document with the configured parameters
  observer.observe(document.body, { 
    childList: true, 
    subtree: true 
  });
}

/**
 * Get the container name from element
 * @param {HTMLElement} element The container element
 * @returns {string|null} The container name or null
 */
function getContainerName(element) {
  // Match container names based on class names
  if (element.classList.contains('info-container')) return 'info';
  if (element.classList.contains('quick-stats-container')) return 'stats';
  if (element.classList.contains('data-panels')) return 'data';
  if (element.classList.contains('map-container')) return 'map';
  
  return null;
}

/**
 * Observe all containers specified in CONTAINER_BREAKPOINTS
 * @param {ResizeObserver} observer The ResizeObserver instance
 */
function observeContainers(observer) {
  // Info container
  const infoContainers = document.querySelectorAll('.info-container');
  infoContainers.forEach(container => observer.observe(container));
  
  // Stats container
  const statsContainers = document.querySelectorAll('.quick-stats-container');
  statsContainers.forEach(container => observer.observe(container));
  
  // Data container
  const dataContainers = document.querySelectorAll('.data-panels');
  dataContainers.forEach(container => observer.observe(container));
  
  // Map container
  const mapContainers = document.querySelectorAll('.map-container');
  mapContainers.forEach(container => observer.observe(container));
}

/**
 * Update container classes based on width
 * @param {HTMLElement} container The container element
 * @param {string} containerName The container name
 * @param {number} width The container width
 */
function updateContainerClasses(container, containerName, width) {
  const breakpoints = CONTAINER_BREAKPOINTS[containerName];
  
  // Remove all breakpoint classes first
  breakpoints.forEach(bp => {
    container.classList.remove(bp.class);
  });
  
  // Add relevant classes
  breakpoints.forEach(bp => {
    if ((bp.minWidth && width >= bp.minWidth) || 
        (bp.maxWidth && width <= bp.maxWidth)) {
      container.classList.add(bp.class);
    }
  });
}

/**
 * Handle window resize for browsers without ResizeObserver
 */
function handleWindowResize() {
  Object.keys(CONTAINER_BREAKPOINTS).forEach(containerName => {
    const selector = getContainerSelector(containerName);
    const containers = document.querySelectorAll(selector);
    
    containers.forEach(container => {
      const width = container.offsetWidth;
      updateContainerClasses(container, containerName, width);
    });
  });
  
  // Also ensure background-info expands properly
  const backgroundInfo = document.querySelector('.background-info');
  if (backgroundInfo) {
    backgroundInfo.style.maxHeight = 'none';
    backgroundInfo.style.flex = '1';
  }
}

/**
 * Get container selector from container name
 * @param {string} containerName The container name
 * @returns {string} The CSS selector
 */
function getContainerSelector(containerName) {
  switch(containerName) {
    case 'info': return '.info-container';
    case 'stats': return '.quick-stats-container';
    case 'data': return '.data-panels';
    case 'map': return '.map-container';
    default: return '';
  }
}

// Initialize the container query polyfill when the document is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initContainerQueries);
} else {
  initContainerQueries();
}

// Export for use in other modules
export { 
  initContainerQueries, 
  supportsContainerQueries 
}; 