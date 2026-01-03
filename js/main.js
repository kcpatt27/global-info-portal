// main.js - Main application entry point
// Initializes all required modules and sets up event handlers

import { initMap, clearSelection } from './map.js';
import { fetchCountryData, processText } from './utils/dataFetcher.js';
import { updateDataPanels, clearDataPanels, showDataError, initPanels } from './panels/index.js';
import { initDataTabs } from './events.js';
import { initStatCycling, updateQuickStats } from './statCycling.js';
import { countryDataCache, globalDataIndex, countriesList, appState } from './state.js';
import { processLeaderboardMetrics } from './utils/leaderboardScoring.js';
import { setupBackgroundInfoCycling } from './infoTextCycling.js';
import { preCacheG20Countries } from './utils/g20PreCache.js';
import { initializeTouchInteractions, isTouchDevice } from './utils/touch.js';
// import { initInteractiveComponents } from './components/interactive/index.js';
import { initMobileNav } from './components/navigation/MobileNav.js';
import { initMobilePanels } from './components/panels/PanelMobileManager.js';
import { initMobileInteractions } from './utils/mobile-interactions.js';
import { initMobileTypography } from './utils/typography-enhancements.js';

// Cache for resolved flag URLs by ISO A2 code
const flagUrlCache = {};

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
    
    // Pre-cache G20 countries in the background (non-blocking)
    preCacheG20Countries((progress) => {
      if (progress.cached) {
        console.log(`G20 cache loaded: ${progress.total} countries`);
      } else {
        console.log(`G20 pre-caching: ${progress.processed}/${progress.total} - ${progress.current}`);
      }
    }).catch(error => {
      console.warn('G20 pre-caching failed:', error);
      // Don't block the app if pre-caching fails
    });
    
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

import { fipsToIso } from './utils/countryCodeMap.js';

/**
 * Normalize ISO A2 code and fix common anomalies
 * @param {string} a2Code
 * @param {string} countryName
 * @returns {string|null}
 */
function normalizeIsoA2(a2Code, countryName) {
    const raw = (a2Code || '').toLowerCase();
    
    // Check our comprehensive FIPS -> ISO map first
    if (fipsToIso[raw]) {
        return fipsToIso[raw];
    }

    if (raw && /^[a-z]{2}$/.test(raw)) {
        // Map known anomalies (Legacy / Fallbacks)
        const map = {
            'uk': 'gb', // UK -> GB
            'el': 'gr', // Greece alternative
            'tp': 'tl', // East Timor old -> Timor-Leste
            'bu': 'mm', // Burma -> Myanmar
            'zr': 'cd', // Zaire -> DR Congo
            'fx': 'fr', // Metropolitan France -> France
            'cs': 'rs', // Serbia and Montenegro -> Serbia
        };
        return map[raw] || raw;
    }

    // Try a few name-based fallbacks for common tricky cases
    const name = (countryName || '').toLowerCase();
    if (!name) return null;
    const nameMap = [
        { match: ['democratic republic of the congo', 'congo (kinshasa)'], code: 'cd' },
        { match: ['republic of the congo', 'congo (brazzaville)'], code: 'cg' },
        { match: ['ivory coast', "côte d'ivoire", 'cote d’ivoire', 'cote d ivoire'], code: 'ci' },
        { match: ['cape verde', 'cabo verde'], code: 'cv' },
        { match: ['south korea', 'korea, south', 'republic of korea'], code: 'kr' },
        { match: ['north korea', 'korea, north', "democratic people's republic of korea"], code: 'kp' },
        { match: ['eswatini', 'swaziland'], code: 'sz' },
        { match: ['burma', 'myanmar'], code: 'mm' },
        { match: ['laos', "lao people's"], code: 'la' },
        { match: ['russia', 'russian federation'], code: 'ru' },
        { match: ['syria', 'syrian arab republic'], code: 'sy' },
        { match: ['moldova'], code: 'md' },
        { match: ['tanzania'], code: 'tz' },
        { match: ['taiwan'], code: 'tw' },
        { match: ['palestine'], code: 'ps' },
        { match: ['kosovo'], code: 'xk' },
    ];
    for (const entry of nameMap) {
        if (entry.match.some(m => name.includes(m))) return entry.code;
    }
    return null;
}

/**
 * Load and render a country's flag into the header flag container using external APIs
 * Prefers FlagCDN (SVG->PNG), then RestCountries by code, then by name.
 * @param {string} a2Code - ISO 3166-1 alpha-2 code
 * @param {string} countryName - Country display name for accessibility
 */
async function setCountryFlag(a2Code, countryName) {
    const flagContainer = document.querySelector('.flag');
    if (!flagContainer) return;
    if (!a2Code && !countryName) {
        flagContainer.textContent = 'FLAG';
        return;
    }

    const normalized = normalizeIsoA2(a2Code, countryName);
    const code = (normalized || '').toLowerCase();

    // Use cache if available
    if (code && flagUrlCache[code]) {
        renderFlag(flagContainer, flagUrlCache[code], countryName);
        return;
    }

    // 1) Try FlagCDN (SVG -> PNG)
    if (code) {
        const cdnSvg = `https://flagcdn.com/${code}.svg`;
        const cdnPng = `https://flagcdn.com/w40/${code}.png`;
        const success = await tryLoadImage(flagContainer, cdnSvg, cdnPng, countryName, (finalUrl) => {
            flagUrlCache[code] = finalUrl;
        });
        if (success) return;
    }

    // 2) RestCountries by code
    if (code) {
        try {
            const resp = await fetch(`https://restcountries.com/v3.1/alpha/${code}`);
            if (resp.ok) {
                const json = await resp.json();
                const url = json?.[0]?.flags?.svg || json?.[0]?.flags?.png;
                if (url) {
                    flagUrlCache[code] = url;
                    renderFlag(flagContainer, url, countryName);
                    return;
                }
            }
        } catch (e) {}
    }

    // 3) RestCountries by name (fullText first, then fallback)
    if (countryName) {
        try {
            let url = null;
            for (const q of [
                `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fullText=true`,
                `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}`
            ]) {
                const r = await fetch(q);
                if (r.ok) {
                    const j = await r.json();
                    const f = j?.[0]?.flags?.svg || j?.[0]?.flags?.png;
                    if (f) { url = f; break; }
                }
            }
            if (url) {
                renderFlag(flagContainer, url, countryName);
                return;
            }
        } catch (e) {}
    }

    // Final fallback
    flagContainer.textContent = 'FLAG';
}

/**
 * Helper to render a flag image element in the container
 */
function renderFlag(container, url, countryName) {
    const img = new Image();
    img.className = 'country-flag';
    img.alt = `Flag of ${countryName}`;
    img.width = 24;
    img.height = 18;
    img.referrerPolicy = 'no-referrer';
    img.src = url;
    container.innerHTML = '';
    container.appendChild(img);
}

/**
 * Try to load an image from primary URL, fall back to secondary on error
 * @returns {Promise<boolean>} true if loaded successfully
 */
function tryLoadImage(container, primaryUrl, fallbackUrl, countryName, onSuccess) {
    return new Promise((resolve) => {
        const img = new Image();
        img.className = 'country-flag';
        img.alt = `Flag of ${countryName}`;
        img.width = 24;
        img.height = 18;
        img.referrerPolicy = 'no-referrer';
        img.onerror = () => {
            if (!fallbackUrl) { resolve(false); return; }
            img.onerror = () => resolve(false);
            img.onload = () => {
                onSuccess && onSuccess(img.src);
                container.innerHTML = '';
                container.appendChild(img);
                resolve(true);
            };
            img.src = fallbackUrl;
        };
        img.onload = () => {
            onSuccess && onSuccess(img.src);
            container.innerHTML = '';
            container.appendChild(img);
            resolve(true);
        };
        img.src = primaryUrl;
    });
}

/**
 * Handle country selection
 * @param {Object} country - The selected country data
 */
async function handleCountrySelect(country) {
    if (!country) return;
    
    // Update the UI
    setCountryFlag(country.a2Code, country.name);
    const headerEl = document.querySelector(".country-info");
    if (headerEl) {
        // Preserve original but expand common abbreviations where the source is truncated.
        let displayName = String(country.name || '');

        // Common manual expansions to ensure educational clarity (no silent truncation)
        // Bosnia abbreviated as "Bosnia and Herz." -> expand to full "Bosnia and Herzegovina"
        displayName = displayName.replace(/\bHerz\.\s*$/i, 'Herzegovina');

        // For DR Congo, display the concise educational form requested: "Dem. Rep. of Congo"
        if ((/\bDem\.?\s*Rep\.?/i.test(displayName) || /\bdemocratic republic\b/i.test(displayName)) && /congo/i.test(displayName)) {
            displayName = 'Dem. Rep. of Congo';
        }

        headerEl.textContent = displayName;

        // Allow wrapping only for very long official names (exceptions),
        // otherwise keep a single-line display using available header space.
        if (displayName && displayName.length > 32) {
            headerEl.classList.add('allow-wrap');
        } else {
            headerEl.classList.remove('allow-wrap');
        }
        // Specific size tweak for Bosnia and Herzegovina to avoid overflow
        if (/bosnia and herzegovina/i.test(displayName)) {
            headerEl.classList.add('bosnia-small');
        } else {
            headerEl.classList.remove('bosnia-small');
        }
    }
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
        
        // Process leaderboard metrics and add to global index
        const countryName = data.Government?.['Country name']?.conventional_short_form?.text || 
                           data.Government?.['Country name']?.text || 
                           country.name || 
                           'Unknown';
        processLeaderboardMetrics(countryCode, data, countryName);
        
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
    const flagContainer = document.querySelector('.flag');
    if (flagContainer) flagContainer.textContent = 'FLAG';
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