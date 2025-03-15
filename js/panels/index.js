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
    
    // Call panel creation functions
    statsModule.createStatsPanel(data);
    rankingsModule.createRankingsPanel(data);
  } catch (error) {
    console.error('Error updating data panels:', error);
    showDataError('Error processing country data: ' + error.message);
  }
}

/**
 * Initializes all data panels
 * This should be called once on application startup
 */
export function initPanels() {
  // This function can be expanded later to include additional initialization
  // Currently just ensures correct panel state
  const activeTab = document.querySelector('.data-tab.active');
  const activePanel = document.querySelector('.data-panel.active');
  
  if (!activeTab) {
    document.querySelector('.data-tab').classList.add('active');
  }
  
  if (!activePanel) {
    document.querySelector('.data-panel').classList.add('active');
  }
} 