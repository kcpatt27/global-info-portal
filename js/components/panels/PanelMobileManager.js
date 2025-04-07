/**
 * PanelMobileManager.js
 * 
 * Handles mobile-specific panel management and interactions
 * - Implements proper scrolling behavior for long content
 * - Creates smooth transitions between panels
 * - Manages panel dimensions and spacing for mobile viewports
 * - Controls navigation bar visibility and positioning
 */

// Track active panels and transitions
const state = {
  activePanel: null,
  leavingPanel: null,
  isTransitioning: false,
  lastScrollY: 0,
  scrollDirection: 'up',
  panelScrollContainers: new Map(),
  refreshCallbacks: new Map()
};

/**
 * Initialize mobile panel optimizations
 */
export function initMobilePanels() {
  // Only run on mobile devices
  if (!isMobileDevice()) {
    console.info('Mobile panel optimizations not initialized (desktop device detected)');
    return;
  }

  console.info('Initializing mobile panel optimizations');
  
  // Set up panel structure
  setupPanelStructure();
  
  // Set up event listeners
  setupTabListeners();
  setupScrollListeners();
  setupSidebarListeners();
  
  // Initial state
  updateActivePanel();
  
  // Import mobile-specific CSS
  importMobileCSS();
}

/**
 * Check if the device is mobile
 * @returns {boolean} Whether the device is mobile
 */
function isMobileDevice() {
  return window.innerWidth <= 768 || 
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Dynamically import mobile-specific CSS
 */
function importMobileCSS() {
  if (document.querySelector('link[href*="panels-mobile.css"]')) {
    return; // Already loaded
  }
  
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'css-styles/components/panels-mobile.css';
  document.head.appendChild(link);
}

/**
 * Set up the panel structure for mobile optimization
 */
function setupPanelStructure() {
  // Get all panels
  const panels = document.querySelectorAll('.data-panels .data-panel');
  
  // Process each panel
  panels.forEach(panel => {
    // Only process panels that haven't been set up yet
    if (panel.querySelector('.panel-scroll-container')) {
      return;
    }
    
    // Create scroll container for panel content
    const scrollContainer = document.createElement('div');
    scrollContainer.className = 'panel-scroll-container';
    
    // Move panel contents to scroll container
    while (panel.firstChild) {
      scrollContainer.appendChild(panel.firstChild);
    }
    
    // Add pull-to-refresh indicator
    const refreshIndicator = document.createElement('div');
    refreshIndicator.className = 'panel-refresh-indicator';
    refreshIndicator.innerHTML = '<div class="spinner"></div><span>Pull to refresh</span>';
    scrollContainer.prepend(refreshIndicator);
    
    // Add scroll indicator
    const scrollIndicator = document.createElement('div');
    scrollIndicator.className = 'panel-scroll-indicator';
    
    // Add elements to panel
    panel.appendChild(scrollContainer);
    panel.appendChild(scrollIndicator);
    
    // Store reference to scroll container
    state.panelScrollContainers.set(panel, scrollContainer);
  });
}

/**
 * Set up tab event listeners for smooth transitions
 */
function setupTabListeners() {
  const tabs = document.querySelectorAll('.data-tab');
  
  tabs.forEach(tab => {
    // Skip if already set up
    if (tab.getAttribute('data-mobile-setup') === 'true') {
      return;
    }
    
    tab.addEventListener('click', event => {
      if (state.isTransitioning) {
        event.preventDefault();
        return; // Prevent rapid tab switching
      }
      
      const tabIndex = tab.getAttribute('data-tab');
      const targetPanel = document.querySelector(`.data-panel[data-panel="${tabIndex}"]`);
      
      if (!targetPanel || tab.classList.contains('active')) {
        return; // Already active or panel not found
      }
      
      // Handle transition
      handlePanelTransition(targetPanel);
      
      // Update active tab
      document.querySelectorAll('.data-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
    
    // Mark as set up
    tab.setAttribute('data-mobile-setup', 'true');
  });
}

/**
 * Handle panel transition with proper animation
 * @param {Element} targetPanel - The panel to transition to
 */
function handlePanelTransition(targetPanel) {
  // Get current active panel
  const currentActivePanel = document.querySelector('.data-panel.active');
  
  if (!currentActivePanel || currentActivePanel === targetPanel) {
    return;
  }
  
  // Set transition state
  state.isTransitioning = true;
  state.leavingPanel = currentActivePanel;
  state.activePanel = targetPanel;
  
  // Add leaving class to current panel
  currentActivePanel.classList.add('leaving');
  currentActivePanel.classList.remove('active');
  
  // Show the new panel
  targetPanel.classList.add('active');
  
  // Reset scroll position for the new panel
  const scrollContainer = targetPanel.querySelector('.panel-scroll-container');
  if (scrollContainer) {
    scrollContainer.scrollTop = 0;
  }
  
  // Clean up after transition completes
  setTimeout(() => {
    currentActivePanel.classList.remove('leaving');
    state.isTransitioning = false;
    state.leavingPanel = null;
  }, 300); // Match the CSS transition duration
}

/**
 * Set up scroll listeners for scroll indicators and pull-to-refresh
 */
function setupScrollListeners() {
  // Process each panel
  state.panelScrollContainers.forEach((scrollContainer, panel) => {
    // Skip if already set up
    if (scrollContainer.getAttribute('data-scroll-setup') === 'true') {
      return;
    }
    
    const scrollIndicator = panel.querySelector('.panel-scroll-indicator');
    const refreshIndicator = scrollContainer.querySelector('.panel-refresh-indicator');
    
    // Variables for pull-to-refresh
    let startY = 0;
    let currentY = 0;
    let refreshThreshold = 60;
    let isRefreshing = false;
    
    // Show/hide scroll indicator based on content
    const updateScrollIndicator = () => {
      const hasOverflow = scrollContainer.scrollHeight > scrollContainer.clientHeight;
      
      if (hasOverflow) {
        scrollIndicator.classList.add('visible');
        
        // Calculate thumb position based on scroll position
        const containerHeight = scrollContainer.clientHeight;
        const contentHeight = scrollContainer.scrollHeight;
        const scrollPercentage = scrollContainer.scrollTop / (contentHeight - containerHeight);
        
        // Update indicator position
        const thumbHeight = (containerHeight / contentHeight) * scrollIndicator.offsetHeight;
        const thumbOffset = scrollPercentage * (scrollIndicator.offsetHeight - thumbHeight);
        
        scrollIndicator.style.setProperty('--thumb-offset', `${thumbOffset}px`);
        scrollIndicator.style.setProperty('--thumb-height', `${thumbHeight}px`);
      } else {
        scrollIndicator.classList.remove('visible');
      }
    };
    
    // Handle scroll events
    scrollContainer.addEventListener('scroll', () => {
      updateScrollIndicator();
      
      // Hide indicator after a delay
      clearTimeout(scrollContainer.scrollTimeout);
      scrollContainer.scrollTimeout = setTimeout(() => {
        scrollIndicator.classList.remove('visible');
      }, 1000);
    });
    
    // Pull-to-refresh touch start
    scrollContainer.addEventListener('touchstart', (e) => {
      if (scrollContainer.scrollTop === 0) {
        startY = e.touches[0].clientY;
      }
    }, { passive: true });
    
    // Pull-to-refresh touch move
    scrollContainer.addEventListener('touchmove', (e) => {
      if (startY > 0 && !isRefreshing) {
        currentY = e.touches[0].clientY;
        const diff = currentY - startY;
        
        if (diff > 0 && scrollContainer.scrollTop === 0) {
          // Show refresh indicator
          const pullProgress = Math.min(diff / refreshThreshold, 1);
          refreshIndicator.style.transform = `translateY(${pullProgress * 100 - 100}%)`;
          
          // Prevent native scroll
          if (diff > 5) {
            e.preventDefault();
          }
          
          // Update text based on progress
          if (pullProgress >= 1) {
            refreshIndicator.querySelector('span').textContent = 'Release to refresh';
          } else {
            refreshIndicator.querySelector('span').textContent = 'Pull to refresh';
          }
        }
      }
    }, { passive: false });
    
    // Pull-to-refresh touch end
    scrollContainer.addEventListener('touchend', () => {
      if (startY > 0 && !isRefreshing) {
        const diff = currentY - startY;
        
        if (diff > refreshThreshold) {
          // Trigger refresh
          refreshIndicator.classList.add('visible');
          refreshIndicator.querySelector('span').textContent = 'Refreshing...';
          isRefreshing = true;
          
          // Call refresh callback if registered
          const panelId = panel.getAttribute('data-panel');
          const refreshCallback = state.refreshCallbacks.get(panelId);
          
          if (typeof refreshCallback === 'function') {
            refreshCallback().then(() => {
              // Complete refresh
              completeRefresh();
            }).catch(() => {
              // Error handling
              refreshIndicator.querySelector('span').textContent = 'Failed to refresh';
              setTimeout(completeRefresh, 1000);
            });
          } else {
            // No callback, just simulate refresh
            setTimeout(completeRefresh, 1000);
          }
        } else {
          // Reset without refresh
          refreshIndicator.style.transform = 'translateY(-100%)';
        }
        
        startY = 0;
        currentY = 0;
      }
    });
    
    function completeRefresh() {
      refreshIndicator.querySelector('span').textContent = 'Complete';
      setTimeout(() => {
        refreshIndicator.style.transform = 'translateY(-100%)';
        isRefreshing = false;
      }, 500);
    }
    
    // Initial indicator update
    updateScrollIndicator();
    
    // Mark as set up
    scrollContainer.setAttribute('data-scroll-setup', 'true');
  });
}

/**
 * Set up listeners for the sidebar to control navigation bar visibility
 */
function setupSidebarListeners() {
  const infoContainer = document.querySelector('.info-container');
  const navSidebar = document.querySelector('.nav-sidebar');
  const closeButton = document.querySelector('#close-sidebar');
  
  if (!infoContainer || !navSidebar || !closeButton) {
    return;
  }
  
  // Handle sidebar collapse
  closeButton.addEventListener('click', () => {
    // Show navigation bar when sidebar is collapsed
    navSidebar.classList.add('visible');
  });
  
  // Handle navigation buttons
  const navButtons = document.querySelectorAll('.nav-button');
  navButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Hide navigation bar when sidebar is expanded
      navSidebar.classList.remove('visible');
    });
  });
}

/**
 * Update the active panel state based on current DOM
 */
function updateActivePanel() {
  const activePanel = document.querySelector('.data-panel.active');
  if (activePanel) {
    state.activePanel = activePanel;
  }
}

/**
 * Register a callback for pull-to-refresh functionality
 * @param {string} panelId - The panel ID
 * @param {Function} callback - The refresh callback function that returns a Promise
 */
export function registerPanelRefreshCallback(panelId, callback) {
  if (typeof callback === 'function') {
    state.refreshCallbacks.set(panelId, callback);
  }
}

/**
 * Refresh panel content programmatically
 * @param {string} panelId - The panel ID to refresh
 * @returns {Promise} A promise that resolves when refresh is complete
 */
export function refreshPanel(panelId) {
  const panel = document.querySelector(`.data-panel[data-panel="${panelId}"]`);
  const callback = state.refreshCallbacks.get(panelId);
  
  if (panel && typeof callback === 'function') {
    const refreshIndicator = panel.querySelector('.panel-refresh-indicator');
    
    if (refreshIndicator) {
      refreshIndicator.classList.add('visible');
      refreshIndicator.querySelector('span').textContent = 'Refreshing...';
    }
    
    return callback().then(() => {
      if (refreshIndicator) {
        refreshIndicator.querySelector('span').textContent = 'Complete';
        setTimeout(() => {
          refreshIndicator.classList.remove('visible');
        }, 500);
      }
    }).catch(error => {
      if (refreshIndicator) {
        refreshIndicator.querySelector('span').textContent = 'Failed to refresh';
        setTimeout(() => {
          refreshIndicator.classList.remove('visible');
        }, 1000);
      }
      
      throw error;
    });
  }
  
  return Promise.resolve();
}

// Export the API
export default {
  initMobilePanels,
  registerPanelRefreshCallback,
  refreshPanel
}; 