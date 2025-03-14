import { appState, dataStore, stateActions, subscribeToState } from '../state.js';
import { loadPersistedState, persistState } from './statePersistence.js';
import { initDataTabs } from '../events.js';
import { updateDataPanels } from '../dataPanels.js';

// On application initialization
document.addEventListener('DOMContentLoaded', () => {
  // Load persisted state
  loadPersistedState();
  
  // Initialize UI components
  initDataTabs();
  
  // Set up state change subscribers
  subscribeToState('map.selectedCountry', async (selectedCountry) => {
    // When country selection changes
    stateActions.ui.setLoading(true, `Loading data for ${selectedCountry}...`);
    
    try {
      // Check cache first
      if (dataStore.countryCache[selectedCountry] && 
          dataStore.countryCache[selectedCountry].expiresAt > Date.now()) {
        // Use cached data
        updateDataPanels(dataStore.countryCache[selectedCountry].data);
      } else {
        // Fetch fresh data
        const countryData = await fetchCountryData(selectedCountry);
        stateActions.dataStore.cacheCountryData(selectedCountry, countryData);
        updateDataPanels(countryData);
      }
    } catch (error) {
      stateActions.ui.setError(`Failed to load data for ${selectedCountry}: ${error.message}`);
      showDataError(`Failed to load data: ${error.message}`);
    } finally {
      stateActions.ui.setLoading(false);
    }
  });
  
  // Other subscribers...
  
  // Save state on page unload
  window.addEventListener('beforeunload', persistState);
}); 