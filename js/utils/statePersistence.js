// Save specific parts of state to localStorage
export function persistState() {
  const stateToSave = {
    ui: {
      sidebarExpanded: appState.ui.sidebarExpanded,
      activeDataTab: appState.ui.activeDataTab
    },
    visualization: {
      rankings: {
        sortOrder: appState.visualization.rankings.sortOrder,
        filterRegion: appState.visualization.rankings.filterRegion
      }
    }
  };
  
  localStorage.setItem('appState', JSON.stringify(stateToSave));
}

// Load persisted state
export function loadPersistedState() {
  try {
    const savedState = JSON.parse(localStorage.getItem('appState'));
    if (savedState) {
      // Apply saved state to current state
      if (savedState.ui) {
        if (savedState.ui.sidebarExpanded !== undefined) 
          appState.ui.sidebarExpanded = savedState.ui.sidebarExpanded;
        if (savedState.ui.activeDataTab !== undefined)
          appState.ui.activeDataTab = savedState.ui.activeDataTab;
      }
      
      if (savedState.visualization?.rankings) {
        if (savedState.visualization.rankings.sortOrder)
          appState.visualization.rankings.sortOrder = savedState.visualization.rankings.sortOrder;
        if (savedState.visualization.rankings.filterRegion)
          appState.visualization.rankings.filterRegion = savedState.visualization.rankings.filterRegion;
      }
    }
  } catch (error) {
    console.error('Error loading persisted state:', error);
  }
} 