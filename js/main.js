// main.js - Main application entry point
// Initializes all required modules and sets up event handlers

import { initMap, clearSelection } from './map.js';
import { fetchCountryData, processText } from './utils/dataFetcher.js';
import { updateDataPanels, clearDataPanels, showDataError, initPanels } from './panels/index.js';
import { initDataTabs } from './events.js';
import { initStatCycling, updateQuickStats } from './statCycling.js';
import { countryDataCache, globalDataIndex, countriesList, appState } from './state.js';

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

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the map
    const map = initMap({
        svgSelector: 'svg',
        onCountrySelect: handleCountrySelect,
        onCountryDeselect: handleCountryDeselect
    });
    
    // Set up UI event handlers
    setupUIEventHandlers();
    
    // Initialize other components
    initDataTabs();
    initStatCycling();
    initPanels();
    
    // Initialize enhanced tab functionality
    initEnhancedTabs();
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
        
        // Update the UI with the fetched data
        let backgroundText = data.Introduction?.Background?.text || "No background information available";
        backgroundText = processText(backgroundText);
        document.querySelector(".background-info").innerHTML = backgroundText;
        
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
    
    // Toggle charts panel from navigation sidebar
    document.getElementById("toggle-data").addEventListener("click", () => {
        openSidebar();
        // Activate charts panel
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