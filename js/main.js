// main.js - Main application entry point
// Initializes all required modules and sets up event handlers

import { initMap, clearSelection } from './map.js';
import { fetchCountryData, processText } from './utils/dataFetcher.js';
import { updateDataPanels, clearDataPanels, showDataError, initPanels } from './panels/index.js';
import { initDataTabs } from './events.js';
import { initStatCycling, updateQuickStats } from './statCycling.js';
import { countryDataCache, globalDataIndex, countriesList, appState } from './state.js';
import { setupBackgroundInfoCycling } from './infoTextCycling.js';
import { initializeTouchInteractions, isTouchDevice } from './utils/touch.js';
// import { initInteractiveComponents } from './components/interactive/index.js';
import { initMobileNav } from './components/navigation/MobileNav.js';
import { initMobilePanels } from './components/panels/PanelMobileManager.js';
import { initMobileInteractions } from './utils/mobile-interactions.js';
import { initMobileTypography } from './utils/typography-enhancements.js';

// Expose key functions to global scope for legacy compatibility
window.initDataTabs = initDataTabs;
window.updateDataPanels = updateDataPanels;
window.clearDataPanels = clearDataPanels;
window.initStatCycling = initStatCycling;
window.updateQuickStats = updateQuickStats;
window.clearSelection = clearSelection;

// Make data structures available to the global scope
window.countryDataCache = countryDataCache;
window.globalDataIndex = globalDataIndex;
window.countriesList = countriesList;

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Main script loaded, initializing application...');
    
    // Initialize the map
    const map = initMap({
        svgSelector: 'svg',
        onCountrySelect: handleCountrySelect,
        onCountryDeselect: handleCountryDeselect
    });
    
    // Make map instance available globally for gesture handling
    window.mapInstance = map;
    
    // Initialize touch interactions
    if (isTouchDevice()) {
        initializeTouchInteractions();
        
        // Initialize advanced gesture-based interactive components
        // initInteractiveComponents();
        
        // Initialize mobile navigation
        const mobileNav = initMobileNav({
            // Custom callbacks
            onNavItemClick: (navId, item) => {
                console.log(`Mobile nav item clicked: ${navId}`);
                // Additional custom handling if needed
            },
            onHamburgerOpen: () => {
                console.log('Hamburger menu opened');
            },
            onHamburgerClose: () => {
                console.log('Hamburger menu closed');
            }
        });
        
        // Initialize mobile panel optimizations
        initMobilePanels();
        
        // Initialize enhanced mobile interactions
        initMobileInteractions({
            customInit: () => {
                console.log('Custom mobile interaction initialization');
                // Add drag handles to expandable containers
                // addDragHandlesToExpandableContainers();
            }
        });
        
        // Initialize enhanced mobile typography
        initMobileTypography({
            enableReadingMode: true,
            customInit: () => {
                console.log('Custom mobile typography initialization');
                // Optimize font sizes for key content areas
                optimizeContentTypography();
            }
        });
        
        // Make mobile nav instance available globally
        window.mobileNavInstance = mobileNav;
    }
    
    // Remove loading indicators
    document.querySelectorAll('.loading-indicator').forEach(el => {
        el.style.display = 'none';
    });
    
    // Set up UI event handlers - core functionality
    setupUIEventHandlers();
    
    // Initialize core components synchronously
    initDataTabs();
    initStatCycling();
    initPanels();
    
    // Load non-critical components asynchronously
    // loadNonCriticalComponents();
});

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
    document.getElementById("close-sidebar").addEventListener("click", () => {
        document.querySelector(".info-container").classList.add("collapsed");
        document.querySelector("#nav-sidebar").classList.add("visible");
        expandMap(); // Expand the map when sidebar closes
    });
    
    // Open sidebar from navigation sidebar
    document.getElementById("open-sidebar").addEventListener("click", () => {
        openSidebar();
    });
    
    // // Toggle info panel from navigation sidebar
    // document.getElementById("toggle-info").addEventListener("click", () => {
    //     openSidebar();
    //     // Activate info panel
    //     document.querySelectorAll('.sidebar-button').forEach(btn => btn.classList.remove('active'));
    //     document.querySelectorAll('.content-panel').forEach(panel => panel.classList.remove('active'));
    //     document.querySelector('.sidebar-button[info-panel="info"]').classList.add('active');
    //     document.getElementById('info-panel').classList.add('active');
    // });

    // Toggle data panel from navigation sidebar
    document.getElementById("toggle-data").addEventListener("click", () => {
        openSidebar();
        // Activate data panel
        document.querySelectorAll('.sidebar-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.content-panel').forEach(panel => panel.classList.remove('active'));
        document.querySelector('.sidebar-button[data-panel="data"]').classList.add('active');
        document.getElementById('data-panel').classList.add('active');
    });
}

/**
 * Open the sidebar if it's collapsed
 */
function openSidebar() {
    document.querySelector(".info-container").classList.remove("collapsed");
    document.querySelector("#nav-sidebar").classList.remove("visible");
    contractMap(); // Contract the map when sidebar closes
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

// Load non-critical components using dynamic imports
// function loadNonCriticalComponents() {
//     // Enhanced visualization components
//     import(/* webpackChunkName: "charts" */ './components/charts/index.js')
//         .then(module => {
//             const { initCharts } = module;
//             initCharts();
//         })
//         .catch(error => {
//             console.warn('Charts module failed to load:', error);
//         });
    
//     // Enhanced tabs
//     import(/* webpackChunkName: "enhanced-tabs" */ './components/tabs/enhanced.js')
//         .then(module => {
//             const { initEnhancedTabs } = module;
//             initEnhancedTabs();
//         })
//         .catch(error => {
//             console.warn('Enhanced tabs module failed to load:', error);
//         });
    
//     // Only load these on desktop or fast connections
//     if (window.innerWidth >= 1024 || navigator.connection?.effectiveType === '4g') {
//         // Advanced map features
//         import(/* webpackChunkName: "map-advanced" */ './map/advanced.js')
//             .then(module => {
//                 const { initAdvancedMapFeatures } = module;
//                 initAdvancedMapFeatures();
//             });
        
//         // Animations and transitions
//         import(/* webpackChunkName: "animations" */ './ui/animations.js')
//             .then(module => {
//                 const { initAnimations } = module;
//                 initAnimations();
//             });
//     }
// }

/**
 * Optimize typography for key content areas
 */
function optimizeContentTypography() {
    // Apply optimized typography to primary content areas
    document.querySelectorAll('.background-info, .info-text, .data-description').forEach(element => {
        // Add typography optimization classes
        element.classList.add('mobile-typography-optimized');
        
        // Find and optimize paragraphs within
        const paragraphs = element.querySelectorAll('p');
        if (paragraphs.length > 0) {
            // Add proper paragraph spacing
            element.classList.add('paragraph-optimized');
        }
    });
    
    // Optimize table text for mobile
    document.querySelectorAll('table').forEach(table => {
        table.classList.add('mobile-table-optimized');
    });
    
    // Optimize list typography
    document.querySelectorAll('ul, ol').forEach(list => {
        list.classList.add('mobile-list-optimized');
    });
    
    // Add fade indicators to scrollable content
    document.querySelectorAll('.scroll-container, .data-panel, .overflow-y').forEach(container => {
        // Only add if container has overflow
        if (container.scrollHeight > container.clientHeight) {
            container.classList.add('scroll-fade-indicators');
        }
    });
}

/**
 * Add drag handles to expandable containers for better mobile interaction
 */
function addDragHandlesToExpandableContainers() {
    // Add drag handle to info container for better mobile usability
    const infoContainer = document.querySelector('.info-container');
    if (infoContainer && !infoContainer.querySelector('.draggable')) {
        const dragHandle = document.createElement('div');
        dragHandle.className = 'draggable';
        // Insert as first child, before any other content
        infoContainer.insertBefore(dragHandle, infoContainer.firstChild);
    }
    
    // Add drag handles to any other expandable panels
    // const expandablePanels = document.querySelectorAll('.panel-container, [data-expandable="true"]');
    // expandablePanels.forEach(panel => {
    //     if (!panel.querySelector('.draggable')) {
    //         const dragHandle = document.createElement('div');
    //         dragHandle.className = 'draggable';
    //         panel.insertBefore(dragHandle, panel.firstChild);
    //     }
    // });
    
    // Add touch-ripple-container class to all interactive elements
    document.querySelectorAll('button, [role="button"], .stat-item, .nav-button, .data-tab')
        .forEach(element => {
            element.classList.add('touch-ripple-container');
        });
    
    // Add staggered animation to list items in panels
    const dataPanels = document.querySelectorAll('.data-panel');
    dataPanels.forEach(panel => {
        const listContainer = panel.querySelector('ul, ol, .list-container');
        if (listContainer) {
            listContainer.classList.add('stagger-container');
            
            // Add stagger-item class to list items
            listContainer.querySelectorAll('li, .list-item').forEach(item => {
                item.classList.add('stagger-item');
            });
        }
    });
} 