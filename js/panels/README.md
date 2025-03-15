# Data Panel Modules Documentation

## Overview

This directory contains the modular data panel components for the Global Information Portal application. The architecture has been consolidated from a 4-tab structure to a more streamlined 2-tab approach to improve usability and code maintainability.

## Module Structure

- **panels/index.js** - Central access point that re-exports all panel functionality
- **statsPanel.js** - Handles the Statistics panel with both current and historical data views
- **rankingsPanel.js** - Handles the Rankings panel with both global and regional comparison views

## Tab Consolidation

The previous 4-tab structure consisted of:
1. Stats
2. Rankings
3. Global Context
4. Trends

This has been consolidated into a more intuitive 2-tab structure:
1. **Statistics** - Combines Stats and Trends functionality
   - Current view: Shows all current stats for the selected country
   - Historical view: Shows time-series data (formerly in the Trends tab)
   
2. **Rankings** - Combines Rankings and Global Context functionality
   - Global view: Shows where the country ranks globally (the original Rankings tab)
   - Regional view: Shows regional comparisons (formerly in the Global Context tab)

## How to Use

### Import and Basic Usage

```javascript
// Import all panel functionality
import { 
  createStatsPanel, 
  enhanceStatsTab,
  createRankingsPanel, 
  enhanceRankingsTab,
  clearDataPanels,
  showDataError,
  updateDataPanels
} from './panels/index.js';

// Update all panels with country data
await updateDataPanels(countryData);

// Create just the stats panel
createStatsPanel(countryData);

// Create just the rankings panel
createRankingsPanel(countryData);

// Clear all panels
clearDataPanels();

// Show an error message in the panels
showDataError('Unable to load data');
```

### Panel Initialization

The application's entry point should initialize the panels during startup:

```javascript
import { initPanels } from './panels/index.js';

// Initialize all panel components
document.addEventListener('DOMContentLoaded', () => {
  initPanels();
});
```

### Panel Enhancement

Both panels support enhanced functionality that must be initialized:

```javascript
import { enhanceStatsTab, enhanceRankingsTab } from './panels/index.js';

// Enable the tabbed interface within Statistics panel (Current/Historical)
enhanceStatsTab();

// Enable the tabbed interface within Rankings panel (Global/Regional)
enhanceRankingsTab();
```

The main application already handles this via the `initEnhancedTabs()` function in main.js.

## State Management

The panels use the central application state from `state.js` to maintain selections across country changes:

- **Statistics Panel**
  - `appState.visualization.stats.searchTerm` - Current search filter
  - `appState.visualization.stats.selectedHistoricalMetric` - Selected metric for historical view
  - `appState.visualization.stats.timeRange` - Time range for historical data

- **Rankings Panel**
  - `appState.selectedRankingMetric` - Currently selected ranking metric
  - `appState.rankingSortOrder` - Sort order (desc/asc)
  - `appState.rankingFilterRegion` - Region filter
  - `appState.visualization.rankings.view` - Current view (global/region)

## CSS Structure

Each panel has dedicated CSS files:
- `stats.css` - Styles for the Statistics panel
- `rankings.css` - Styles for the Rankings panel
- `tabs.css` - Shared tab navigation styling

## Error Handling

Each panel implements proper error handling to display user-friendly messages:

```javascript
try {
  // Panel operations
} catch (error) {
  console.error('Error in panel operation:', error);
  panelElement.innerHTML = `<div class="data-error">${error.message}</div>`;
}
```

## Backward Compatibility

For backward compatibility, `dataPanels.js` re-exports all panel functionality. This allows existing code to continue working while migrating to the new module structure. However, new code should import directly from the `panels/index.js` module. 