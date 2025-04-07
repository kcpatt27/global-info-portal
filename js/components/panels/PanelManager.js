/**
 * PanelManager.js
 * 
 * Provides centralized management of all panel components:
 * - Panel registration and lifecycle management
 * - Tab navigation and panel transitions
 * - Shared state and resources
 * - Performance optimization
 */

import { Panel, createPanel } from './Panel.js';
import { StatsPanel, createStatsPanel } from './StatsPanel.js';
import { RankingsPanel, createRankingsPanel } from './RankingsPanel.js';

/**
 * PanelManager class for managing all panel components
 */
export class PanelManager {
  /**
   * Create a new PanelManager instance
   * @param {Object} config - Configuration options
   */
  constructor(config = {}) {
    // Store configuration
    this.config = {
      tabSelector: config.tabSelector || '.tab[data-panel]',
      defaultPanel: config.defaultPanel || null,
      mobileBreakpoint: config.mobileBreakpoint || 768,
      animationsEnabled: config.animationsEnabled ?? true,
      ...config
    };
    
    // Panel registry
    this.panels = new Map();
    this.activePanel = null;
    
    // Tab elements
    this.tabs = [];
    
    // Mobile state
    this.isMobile = window.innerWidth <= this.config.mobileBreakpoint;
    this.mobileManager = null;
    
    // Performance monitoring
    this.performanceMetrics = {
      panelLoadTimes: {},
      lastUpdateTime: 0
    };
    
    // Event callbacks
    this.eventCallbacks = {
      onPanelChange: [],
      onDataUpdate: [],
      onError: []
    };
    
    // Bind methods
    this._bindMethods();
  }
  
  /**
   * Bind class methods to this instance
   * @private
   */
  _bindMethods() {
    this.init = this.init.bind(this);
    this.registerPanel = this.registerPanel.bind(this);
    this.getPanel = this.getPanel.bind(this);
    this.activatePanel = this.activatePanel.bind(this);
    this.handleTabClick = this.handleTabClick.bind(this);
    this.updatePanels = this.updatePanels.bind(this);
    this.on = this.on.bind(this);
    this.off = this.off.bind(this);
    this._handleResize = this._handleResize.bind(this);
  }
  
  /**
   * Initialize the panel manager
   * @returns {PanelManager} The panel manager instance
   */
  init() {
    console.info('Initializing Panel Manager');
    
    // Find all tab elements
    this.tabs = Array.from(document.querySelectorAll(this.config.tabSelector));
    
    // Add click event listeners to tabs
    this.tabs.forEach(tab => {
      tab.addEventListener('click', this.handleTabClick);
    });
    
    // Add resize event listener for mobile detection
    window.addEventListener('resize', this._debounce(this._handleResize, 250));
    
    // Initial mobile check
    this._handleResize();
    
    // Activate default panel if specified
    if (this.config.defaultPanel) {
      // Find the tab for the default panel
      const defaultTab = this.tabs.find(tab => 
        tab.dataset.panel === this.config.defaultPanel
      );
      
      if (defaultTab) {
        this.handleTabClick({ currentTarget: defaultTab });
      } else if (this.tabs.length > 0) {
        // Fallback to first tab
        this.handleTabClick({ currentTarget: this.tabs[0] });
      }
    } else if (this.tabs.length > 0) {
      // No default specified, activate first tab
      this.handleTabClick({ currentTarget: this.tabs[0] });
    }
    
    return this;
  }
  
  /**
   * Handle window resize events
   * @private
   */
  _handleResize() {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth <= this.config.mobileBreakpoint;
    
    // If mobile state changed, handle the transition
    if (wasMobile !== this.isMobile) {
      this._handleMobileTransition();
    }
  }
  
  /**
   * Handle transition between mobile and desktop modes
   * @private
   */
  _handleMobileTransition() {
    // If switching to mobile
    if (this.isMobile) {
      this._initializeMobileMode();
    } else {
      // If switching to desktop
      this._initializeDesktopMode();
    }
    
    // Refresh active panel if any
    if (this.activePanel) {
      const panel = this.getPanel(this.activePanel);
      if (panel) {
        panel.refresh();
      }
    }
  }
  
  /**
   * Initialize mobile-specific optimizations
   * @private
   */
  _initializeMobileMode() {
    console.info('Switching to mobile mode');
    
    // Load mobile panel manager if needed
    if (!this.mobileManager && typeof window !== 'undefined') {
      import('./PanelMobileManager.js')
        .then(module => {
          this.mobileManager = new module.default(this);
          this.mobileManager.init();
        })
        .catch(error => {
          console.error('Error loading mobile panel manager:', error);
        });
    } else if (this.mobileManager) {
      this.mobileManager.init();
    }
  }
  
  /**
   * Initialize desktop-specific optimizations
   * @private
   */
  _initializeDesktopMode() {
    console.info('Switching to desktop mode');
    
    // Clean up mobile optimizations
    if (this.mobileManager) {
      this.mobileManager.cleanup();
    }
  }
  
  /**
   * Register a panel with the manager
   * @param {string} id - Panel identifier
   * @param {Panel|Object} panel - Panel instance or configuration
   * @returns {Panel} The registered panel
   */
  registerPanel(id, panel) {
    if (!id) {
      throw new Error('Panel ID is required');
    }
    
    // If panel is already registered, return it
    if (this.panels.has(id)) {
      return this.getPanel(id);
    }
    
    let panelInstance;
    
    // If it's a panel instance, use it directly
    if (panel instanceof Panel) {
      panelInstance = panel;
    } else {
      // Check if it's a known panel type
      const panelConfig = { ...panel, id };
      
      switch (panel.type) {
        case 'stats':
          panelInstance = createStatsPanel(panelConfig);
          break;
        case 'rankings':
          panelInstance = createRankingsPanel(panelConfig);
          break;
        default:
          // Default to base panel
          panelInstance = createPanel(panelConfig);
      }
    }
    
    // Store in registry
    this.panels.set(id, panelInstance);
    
    console.info(`Registered panel: ${id}`);
    
    return panelInstance;
  }
  
  /**
   * Get a panel by ID
   * @param {string} id - Panel identifier
   * @returns {Panel|null} The panel instance or null if not found
   */
  getPanel(id) {
    return this.panels.get(id) || null;
  }
  
  /**
   * Activate a panel
   * @param {string} id - Panel identifier
   * @returns {Panel|null} The activated panel or null if not found
   */
  activatePanel(id) {
    // If same panel is already active, do nothing
    if (this.activePanel === id) {
      return this.getPanel(id);
    }
    
    const startTime = performance.now();
    
    // Get the requested panel
    const panel = this.getPanel(id);
    if (!panel) {
      console.warn(`Cannot activate panel: ${id} (not found)`);
      return null;
    }
    
    // Deactivate current panel if any
    if (this.activePanel) {
      const currentPanel = this.getPanel(this.activePanel);
      if (currentPanel) {
        currentPanel.hide();
      }
      
      // Update tab state
      const currentTab = this.tabs.find(tab => tab.dataset.panel === this.activePanel);
      if (currentTab) {
        currentTab.classList.remove('active');
        currentTab.setAttribute('aria-selected', 'false');
      }
    }
    
    // Update active panel reference
    this.activePanel = id;
    
    // Show the new panel
    panel.show();
    
    // Update tab state
    const newTab = this.tabs.find(tab => tab.dataset.panel === id);
    if (newTab) {
      newTab.classList.add('active');
      newTab.setAttribute('aria-selected', 'true');
    }
    
    // Record performance metrics
    const activationTime = performance.now() - startTime;
    this.performanceMetrics.panelLoadTimes[id] = activationTime;
    console.info(`Panel activation time for ${id}: ${activationTime.toFixed(2)}ms`);
    
    // Trigger panel change event
    this._triggerEvent('onPanelChange', {
      panelId: id,
      panel: panel,
      previousPanelId: this.activePanel
    });
    
    return panel;
  }
  
  /**
   * Handle tab click events
   * @param {Event} event - Click event
   */
  handleTabClick(event) {
    const tab = event.currentTarget;
    const panelId = tab.dataset.panel;
    
    if (!panelId) {
      console.warn('Tab clicked with no panel ID');
      return;
    }
    
    // Check if panel is registered
    if (!this.panels.has(panelId)) {
      console.warn(`Tab references unregistered panel: ${panelId}`);
      return;
    }
    
    // Activate the panel
    this.activatePanel(panelId);
  }
  
  /**
   * Update all panels with new data
   * @param {Object} data - The data to update panels with
   */
  updatePanels(data) {
    if (!data) {
      console.warn('No data provided for panel update');
      return;
    }
    
    const startTime = performance.now();
    
    try {
      // Update each panel with relevant data
      for (const [id, panel] of this.panels.entries()) {
        // Check if there's panel-specific data
        const panelData = data[id] || data;
        
        // Update the panel
        panel.update(panelData);
      }
      
      // Record performance metric
      this.performanceMetrics.lastUpdateTime = performance.now() - startTime;
      
      // Trigger data update event
      this._triggerEvent('onDataUpdate', { data });
      
    } catch (error) {
      console.error('Error updating panels:', error);
      
      // Trigger error event
      this._triggerEvent('onError', { 
        error, 
        source: 'updatePanels' 
      });
    }
  }
  
  /**
   * Reset all panels
   */
  resetPanels() {
    for (const panel of this.panels.values()) {
      panel.reset();
    }
  }
  
  /**
   * Destroy all panels and clean up
   */
  destroy() {
    // Destroy all panels
    for (const panel of this.panels.values()) {
      panel.destroy();
    }
    
    // Clear panel registry
    this.panels.clear();
    
    // Remove tab event listeners
    this.tabs.forEach(tab => {
      tab.removeEventListener('click', this.handleTabClick);
    });
    
    // Remove resize listener
    window.removeEventListener('resize', this._handleResize);
    
    // Clean up mobile manager if exists
    if (this.mobileManager) {
      this.mobileManager.cleanup();
    }
    
    // Clear references
    this.tabs = [];
    this.activePanel = null;
    this.mobileManager = null;
    
    // Clear event callbacks
    for (const eventType in this.eventCallbacks) {
      this.eventCallbacks[eventType] = [];
    }
  }
  
  /**
   * Register an event callback
   * @param {string} eventType - Event type to listen for
   * @param {Function} callback - Callback function
   * @returns {PanelManager} The panel manager instance
   */
  on(eventType, callback) {
    if (this.eventCallbacks[eventType] && typeof callback === 'function') {
      this.eventCallbacks[eventType].push(callback);
    }
    return this;
  }
  
  /**
   * Remove an event callback
   * @param {string} eventType - Event type
   * @param {Function} callback - Callback function to remove
   * @returns {PanelManager} The panel manager instance
   */
  off(eventType, callback) {
    if (this.eventCallbacks[eventType] && typeof callback === 'function') {
      this.eventCallbacks[eventType] = this.eventCallbacks[eventType]
        .filter(cb => cb !== callback);
    }
    return this;
  }
  
  /**
   * Trigger an event
   * @param {string} eventType - Event type to trigger
   * @param {Object} data - Event data
   * @private
   */
  _triggerEvent(eventType, data) {
    if (this.eventCallbacks[eventType]) {
      this.eventCallbacks[eventType].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${eventType} callback:`, error);
        }
      });
    }
  }
  
  /**
   * Get all registered panel IDs
   * @returns {Array<string>} Array of panel IDs
   */
  getPanelIds() {
    return Array.from(this.panels.keys());
  }
  
  /**
   * Get performance metrics for all panels
   * @returns {Object} Performance metrics
   */
  getPerformanceMetrics() {
    const panelMetrics = {};
    
    // Collect metrics from each panel
    for (const [id, panel] of this.panels.entries()) {
      panelMetrics[id] = panel.getPerformanceMetrics();
    }
    
    return {
      panels: panelMetrics,
      panelLoadTimes: this.performanceMetrics.panelLoadTimes,
      lastUpdateTime: this.performanceMetrics.lastUpdateTime
    };
  }
  
  /**
   * Create a debounced function
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   * @private
   */
  _debounce(func, wait) {
    let timeout;
    
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        func(...args);
      };
      
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

/**
 * Create and initialize a panel manager
 * @param {Object} config - Configuration options
 * @returns {PanelManager} Initialized panel manager
 */
export function createPanelManager(config) {
  const manager = new PanelManager(config);
  return manager.init();
}

export default PanelManager; 