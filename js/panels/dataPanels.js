/**
 * dataPanels.js - Re-exports from modular panel components
 * This file is maintained for backward compatibility with existing code
 * New code should import directly from the panels/index.js module
 * 
 * @deprecated Use direct imports from panels/index.js instead
 */

// Re-export functionality from our new modular components
export { 
    // Stats Panel functionality
    createStatsPanel,
    enhanceStatsTab
} from './statsPanel.js';

export {
    // Rankings Panel functionality 
    createRankingsPanel,
    enhanceRankingsTab,
    initRankingsPanel
} from './rankingsPanel.js';

export {
    // Common panel utilities
    clearDataPanels,
    showDataError,
    updateDataPanels,
    initPanels
} from './index.js';

/**
 * Original function names maintained for backward compatibility
 */
export function updateDataPanels(data) {
    // Import dynamically and call the imported function
    import('./index.js')
        .then(module => module.updateDataPanels(data))
        .catch(err => console.error('Error updating data panels:', err));
}

export function createComparisonsPanel(data) {
    console.warn('createComparisonsPanel is deprecated. This functionality has been consolidated into the Rankings panel.');
    // This function is now a no-op as its functionality has been moved to the Rankings panel
}

export function createTrendsPanel(data) {
    console.warn('createTrendsPanel is deprecated. This functionality has been consolidated into the Stats panel.');
    // This function is now a no-op as its functionality has been moved to the Stats panel
}

export function clearDataPanels() {
    // Import dynamically and call the imported function
    import('./index.js')
        .then(module => module.clearDataPanels())
        .catch(err => console.error('Error clearing data panels:', err));
}

export function showDataError(message) {
    // Import dynamically and call the imported function
    import('./index.js')
        .then(module => module.showDataError(message))
        .catch(err => console.error('Error showing data error:', err));
} 