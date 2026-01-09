/**
 * panels/index.js - Re-exports all panel-related functionality
 * Serves as a central access point for all data panel modules
 */

// Export Stats Panel functionality
export { 
  createStatsPanel, 
  enhanceStatsTab 
} from './statsPanel.js';

// Export Rankings Panel functionality
export { 
  createRankingsPanel, 
  enhanceRankingsTab, 
  initRankingsPanel 
} from './rankingsPanel.js';

// Import mobile-specific functionality
// Will be dynamically imported in initPanels if on mobile

// Common panel utility functions
export function clearDataPanels() {
  const panelElements = document.querySelectorAll('.data-panels .data-panel');
  panelElements.forEach(panelElement => {
    while (panelElement.firstChild) {
      panelElement.removeChild(panelElement.firstChild);
    }
  });
}

export function showDataError(message) {
  const panelElements = document.querySelectorAll('.data-panels .data-panel');
  panelElements.forEach(panelElement => {
    panelElement.innerHTML = `<div class="data-error">${message}</div>`;
  });
}

export async function updateDataPanels(data) {
  console.log('Updating data panels with data:', data);
  clearDataPanels();
  
  try {
    // Import functions dynamically
    const statsModule = await import('./statsPanel.js');
    const rankingsModule = await import('./rankingsPanel.js');
    
    // Call panel creation functions with error handling
    try {
      statsModule.createStatsPanel(data);
    } catch (error) {
      console.error('Error creating stats panel:', error);
      showDataError('Error creating statistics panel: ' + error.message);
    }
    
    try {
      rankingsModule.createRankingsPanel(data);
    } catch (error) {
      console.error('Error creating rankings panel:', error);
      showDataError('Error creating rankings panel: ' + error.message);
    }

    // If there's an active country, try to refresh panels
    const countryCode = data?.countryCode;
    if (countryCode) {
      try {
        // Try to import mobile panel manager
        const { refreshPanel } = await import('../components/panels/PanelMobileManager.js');
        // Refresh stats panel
        refreshPanel('stats');
        // Refresh rankings panel
        refreshPanel('rankings');
      } catch (err) {
        // Mobile panel manager likely not available or needed (on desktop)
        console.debug('Mobile panel refresh not available', err);
      }
    }
  } catch (error) {
    console.error('Error updating data panels:', error);
    showDataError('Error processing country data: ' + error.message);
  }
}

/**
 * Detect if the current device is mobile
 * @returns {boolean} True if the device is mobile
 */
function isMobileDevice() {
  return window.innerWidth <= 768 || 
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Initializes all data panels
 * This should be called once on application startup
 */
export function initPanels() {
  // Ensure correct panel state
  const activeTab = document.querySelector('.data-tab.active');
  const activePanel = document.querySelector('.data-panel.active');
  
  if (!activeTab) {
    document.querySelector('.data-tab').classList.add('active');
  }
  
  if (!activePanel) {
    document.querySelector('.data-panel').classList.add('active');
  }

  // Initialize default Rankings content (Global Superpower Leaderboard) even before a country is selected
  import('./rankingsPanel.js')
    .then(({ initRankingsPanel }) => initRankingsPanel())
    .catch(() => {});

  // Set up refresh callbacks for mobile
  if (isMobileDevice()) {
    // Dynamically import mobile panel manager to avoid errors on desktop
    import('../components/panels/PanelMobileManager.js')
      .then(({ registerPanelRefreshCallback }) => {
        // Register refresh callback for stats panel
        registerPanelRefreshCallback('stats', async () => {
          console.log('Refreshing stats panel');
          const activeCountry = document.querySelector('.country.active');
          if (activeCountry) {
            const countryCode = activeCountry.getAttribute('id');
            if (countryCode && window.countryDataCache && window.countryDataCache[countryCode]) {
              // Re-use cached data to refresh panel
              const data = window.countryDataCache[countryCode];
              const statsModule = await import('./statsPanel.js');
              statsModule.createStatsPanel(data);
              return Promise.resolve();
            }
          }
          return Promise.resolve();
        });

        // Register refresh callback for rankings panel
        registerPanelRefreshCallback('rankings', async () => {
          console.log('Refreshing rankings panel');
          const activeCountry = document.querySelector('.country.active');
          if (activeCountry) {
            const countryCode = activeCountry.getAttribute('id');
            if (countryCode && window.countryDataCache && window.countryDataCache[countryCode]) {
              // Re-use cached data to refresh panel
              const data = window.countryDataCache[countryCode];
              const rankingsModule = await import('./rankingsPanel.js');
              rankingsModule.createRankingsPanel(data);
              return Promise.resolve();
            }
          }
          return Promise.resolve();
        });
      })
      .catch(err => {
        console.warn('Mobile panel manager could not be loaded:', err);
      });
  }
} 