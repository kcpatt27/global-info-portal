/**
 * Main entry point for the Global Information Portal application
 * This file centralizes imports and enables tree shaking
 */

// Import core functionality needed for initial rendering
import { initCore } from './core/init.js';
import { setupEventListeners } from './utils/events.js';
import { initializeState } from './state.js';
import { initMap, clearSelection } from './map.js';
import { fetchCountryData, processText } from './utils/dataFetcher.js';
import { updateDataPanels, clearDataPanels, showDataError, initPanels } from './panels/index.js';
import { initDataTabs } from './events.js';
import { initStatCycling, updateQuickStats } from './statCycling.js';
import { countryDataCache, globalDataIndex, countriesList, appState } from './state.js';
import { setupBackgroundInfoCycling } from './infoTextCycling.js';
import { initContainerQueries } from './utils/container-queries.js';

// Public API exports
export { 
  loadCountryData,
  updateUI,
  refreshStats,
} from './utils/api.js'; 

// Expose key functions to global scope for legacy compatibility
window.initDataTabs = initDataTabs;
window.updateDataPanels = updateDataPanels;
window.clearDataPanels = clearDataPanels;
window.initStatCycling = initStatCycling;
window.updateQuickStats = updateQuickStats;

// Make data structures available to the global scope
window.countryDataCache = countryDataCache;
window.globalDataIndex = globalDataIndex;
window.countriesList = countriesList;

/**
 * Initialize the application
 * This is structured to allow tree shaking to eliminate unused code
 */
const initApp = async () => {
  console.log('Initializing application...');
  
  // Initialize state management
  initializeState();
  
  // Initialize container queries polyfill
  initContainerQueries();
  
  // Initialize core components needed for initial render
  await initCore();
  
  // Initialize the map
  const map = initMap({
    svgSelector: 'svg',
    onCountrySelect: handleCountrySelect,
    onCountryDeselect: handleCountryDeselect
  });
  
  // Remove loading indicators
  document.querySelectorAll('.loading-indicator').forEach(el => {
    el.style.display = 'none';
  });
  
  // Set up event listeners for core functionality
  setupEventListeners();
  setupUIEventHandlers();
  
  // Initialize core components synchronously
  initDataTabs();
  initStatCycling();
  initPanels();
  
  // Load non-critical components dynamically
  loadDynamicComponents();
};

/**
 * Initialize enhanced tab functionality
 */
function initEnhancedTabs() {
  // Set flags to enhance tabs on first data load
  appState.statsTabEnhanced = true;
  appState.rankingsTabEnhanced = true;
}

/**
 * Handle country selection
 * @param {Object} country - The selected country data
 */
async function handleCountrySelect(country) {
  if (!country) return;
  
  // Update the UI
  document.querySelector(".country-info").textContent =
    country.name + " (" + country.a2Code + ") - " + country.continent;
  document.querySelector(".background-info").textContent =
    "Loading information about " + country.name + "...";
  
  // Ensure the sidebar is visible
  openSidebar();
  
  try {
    // Fetch country data
    const data = await fetchCountryData(country);
    
    // Remove any existing centered-text wrapper if it exists
    if (document.querySelector(".background-info .centered-text")) {
      document.querySelector(".background-info").innerHTML = "";
    }
    
    // Set up the cycling feature with all text data
    setupBackgroundInfoCycling(data);

    // Cache the country data
    const countryCode = country.a2Code.toLowerCase();
    if (window.countryDataCache) {
      window.countryDataCache[countryCode] = data;
      console.log(`Cached data for ${country.name} (${countryCode})`);
    }
    
    // Update quick stats and data panels
    updateQuickStats(data, countryCode);
    await updateDataPanels(data);
    
  } catch (error) {
    console.error("Error fetching country data:", error);
    document.querySelector(".background-info").textContent = 
      "Unable to load data for " + country.name;
  }
}

/**
 * Handle country deselection
 */
function handleCountryDeselect() {
  // Reset UI elements
  document.querySelector('.country-info').textContent = 'COUNTRY INFO';
  // Reset background-info with centered placeholder text
  document.querySelector('.background-info').innerHTML = '<div class="centered-text">INTRODUCTION / BACKGROUND</div>';
  
  // Reset the quick stats to default placeholder
  document.querySelectorAll('.quick-stats-grid .stat-item .stat-value').forEach(valueElement => {
    valueElement.textContent = '--';
  });
  
  // Clear data panels
  clearDataPanels();
}

/**
 * Set up event handlers for UI elements
 */
function setupUIEventHandlers() {
  // Toggle between content panels (info and charts)
  document.querySelectorAll('.sidebar-button').forEach(button => {
    button.addEventListener('click', function() {
      // Remove active class from all buttons and panels
      document.querySelectorAll('.sidebar-button').forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.content-panel').forEach(panel => panel.classList.remove('active'));
      
      // Add active class to clicked button
      this.classList.add('active');
      
      // Show corresponding panel
      const panelId = this.getAttribute('data-panel') + '-panel';
      document.getElementById(panelId).classList.add('active');
    });
  });

  // Sidebar toggle
  const closeSidebar = document.getElementById("close-sidebar");
  if (closeSidebar) {
    closeSidebar.addEventListener("click", () => {
      document.querySelector(".info-container").classList.add("collapsed");
      document.querySelector("#nav-sidebar").classList.add("visible");
      expandMap(); // Expand the map when sidebar closes
    });
  }
  
  // Open sidebar from navigation sidebar
  const openSidebarBtn = document.getElementById("open-sidebar");
  if (openSidebarBtn) {
    openSidebarBtn.addEventListener("click", () => {
      openSidebar();
    });
  }

  // Toggle data panel from navigation sidebar
  const toggleData = document.getElementById("toggle-data");
  if (toggleData) {
    toggleData.addEventListener("click", () => {
      openSidebar();
      // Activate data panel
      document.querySelectorAll('.sidebar-button').forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.content-panel').forEach(panel => panel.classList.remove('active'));
      document.querySelector('.sidebar-button[data-panel="data"]').classList.add('active');
      document.getElementById('data-panel').classList.add('active');
    });
  }
  
  // Toggle search functionality
  const toggleSearch = document.getElementById("toggle-search");
  if (toggleSearch) {
    toggleSearch.addEventListener("click", () => {
      openSidebar();
      // Open search dialog or activate search panel if it exists
      const searchInput = document.querySelector('.search-input');
      if (searchInput) {
        searchInput.focus();
      }
    });
  }
  
  // Toggle settings panel
  const toggleSettings = document.getElementById("toggle-settings");
  if (toggleSettings) {
    toggleSettings.addEventListener("click", () => {
      openSidebar();
      // Implement settings panel functionality
      // For now, this just opens the sidebar
      console.log("Settings button clicked");
    });
  }
  
  // Toggle help panel
  const toggleHelp = document.getElementById("toggle-help");
  if (toggleHelp) {
    toggleHelp.addEventListener("click", () => {
      openSidebar();
      // Implement help panel functionality
      // For now, this just opens the sidebar
      console.log("Help button clicked");
    });
  }
}

/**
 * Open the sidebar if it's collapsed
 */
function openSidebar() {
  document.querySelector(".info-container").classList.remove("collapsed");
  document.querySelector("#nav-sidebar").classList.remove("visible");
  contractMap(); // Contract the map when sidebar opens
}

/**
 * Function to expand the map container when sidebar is collapsed
 */
function expandMap() {
  document.querySelector(".container").classList.add("sidebar-collapsed");
  document.querySelector(".map-container").classList.add("expanded");
}

/**
 * Function to contract the map container when sidebar is opened
 */
function contractMap() {
  document.querySelector(".container").classList.remove("sidebar-collapsed");
  document.querySelector(".map-container").classList.remove("expanded");
}

/**
 * Load non-critical components dynamically
 * This approach enables better code splitting and tree shaking
 */
const loadDynamicComponents = () => {
  // Feature detection for modern browsers
  const supportsIntersectionObserver = 'IntersectionObserver' in window;
  
  // Load advanced event handlers
  import(/* webpackChunkName: "events" */ './utils/events.js')
    .then(module => {
      if (module.setupAdvancedEventHandlers) {
        module.setupAdvancedEventHandlers();
      }
    })
    .catch(error => {
      console.error('Failed to load advanced event handlers:', error);
    });
  
  // Initialize offline support if service worker is supported
  if ('serviceWorker' in navigator) {
    import(/* webpackChunkName: "offline" */ './services/offline.js')
      .then(module => {
        if (module.initializeOfflineSupport) {
          module.initializeOfflineSupport();
        }
      })
      .catch(error => {
        console.error('Failed to initialize offline support:', error);
      });
  }
  
  // Enhanced visualization components
  import(/* webpackChunkName: "charts" */ './components/charts/index.js')
    .then(module => {
      const { initCharts } = module;
      initCharts();
    })
    .catch(error => {
      console.warn('Charts module failed to load:', error);
    });
  
  // Enhanced tabs
  import(/* webpackChunkName: "enhanced-tabs" */ './components/tabs/enhanced.js')
    .then(module => {
      const { initEnhancedTabs } = module;
      initEnhancedTabs();
    })
    .catch(error => {
      console.warn('Enhanced tabs module failed to load:', error);
    });
  
  // Determine if we should preload map data and load advanced features
  const isDesktop = window.innerWidth >= 1024;
  const hasFastConnection = navigator.connection?.effectiveType === '4g';
  const shouldLoadAdvanced = isDesktop || hasFastConnection;
  
  // Only load these on desktop or fast connections
  if (shouldLoadAdvanced) {
    // Advanced map features
    import(/* webpackChunkName: "map-advanced" */ './map/advanced.js')
      .then(module => {
        const { initAdvancedMapFeatures } = module;
        initAdvancedMapFeatures();
      })
      .catch(error => {
        console.warn('Advanced map features failed to load:', error);
      });
    
    // Animations and transitions
    import(/* webpackChunkName: "animations" */ './ui/animations.js')
      .then(module => {
        const { initAnimations } = module;
        initAnimations();
      })
      .catch(error => {
        console.warn('Animations module failed to load:', error);
      });
    
    // Preload map data
    import(/* webpackChunkName: "maps" */ './map.js')
      .then(module => {
        const { prefetchMapData } = module;
        if (typeof prefetchMapData === 'function') {
          prefetchMapData();
        }
      })
      .catch(error => {
        console.error('Failed to preload map data:', error);
      });
  }
  
  // Set up lazy loading for components using Intersection Observer
  if (supportsIntersectionObserver) {
    // Observe chart containers
    const chartContainers = document.querySelectorAll('.chart-container');
    
    if (chartContainers.length > 0) {
      const chartsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            import(/* webpackChunkName: "charts" */ './charts.js')
              .then(module => {
                const { initCharts } = module;
                if (typeof initCharts === 'function') {
                  initCharts();
                }
                // Unobserve after loading
                chartsObserver.unobserve(entry.target);
              })
              .catch(error => {
                console.warn('Lazy-loaded charts module failed to load:', error);
              });
          }
        });
      }, { rootMargin: '100px' });
      
      chartContainers.forEach(container => chartsObserver.observe(container));
    }
    
    // Observe stat containers
    const statContainers = document.querySelectorAll('.stats-container');
    if (statContainers.length > 0) {
      const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            import(/* webpackChunkName: "stats" */ './components/stats/index.js')
              .then(module => {
                if (module.initializeStats) {
                  module.initializeStats(entry.target);
                }
                // Unobserve after loading
                statsObserver.unobserve(entry.target);
              })
              .catch(error => {
                console.warn('Lazy-loaded stats module failed to load:', error);
              });
          }
        });
      }, { rootMargin: '100px' });
      
      statContainers.forEach(container => statsObserver.observe(container));
    }
    
    // Observe all panels that aren't already initialized
    const uninitializedPanels = document.querySelectorAll('.data-panel:not(.initialized)');
    if (uninitializedPanels.length > 0) {
      const panelsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const panel = entry.target;
            const panelType = panel.dataset.type;
            
            let modulePath;
            switch (panelType) {
              case 'chart':
                modulePath = './components/charts/ChartFactory.js';
                break;
              case 'stats':
                modulePath = './components/stats/StatsRenderer.js';
                break;
              default:
                return;
            }
            
            import(/* webpackChunkName: "[request]" */ `${modulePath}`)
              .then(module => {
                // Initialize the appropriate component
                if (module.initialize) {
                  module.initialize(panel);
                }
                panel.classList.add('initialized');
                panelsObserver.unobserve(panel);
              })
              .catch(error => {
                console.warn(`Failed to load ${panelType} component:`, error);
              });
          }
        });
      }, { rootMargin: '100px' });
      
      uninitializedPanels.forEach(panel => panelsObserver.observe(panel));
    }
  } else {
    // Fallback for browsers without Intersection Observer
    // Load all components immediately but still in a non-blocking way
    
    // Load charts
    setTimeout(() => {
      import(/* webpackChunkName: "charts" */ './charts.js')
        .then(module => {
          if (module.initCharts) {
            module.initCharts();
          }
        })
        .catch(error => {
          console.warn('Fallback charts module failed to load:', error);
        });
    }, 100);
    
    // Load stats
    setTimeout(() => {
      import(/* webpackChunkName: "stats" */ './components/stats/index.js')
        .then(module => {
          if (module.initializeStats) {
            module.initializeStats();
          }
        })
        .catch(error => {
          console.warn('Fallback stats module failed to load:', error);
        });
    }, 200);
  }
};

// Initialize the application when the DOM is fully loaded
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initApp);
} 