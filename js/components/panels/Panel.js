/**
 * Panel.js - Base class for all panel components
 * 
 * Provides a standardized interface and lifecycle for panel components:
 * - Consistent initialization and destruction
 * - Standardized data update mechanism
 * - Content virtualization for large datasets
 * - Performance optimizations
 */

/**
 * Base Panel class that all specific panel implementations should extend
 */
export class Panel {
  /**
   * Create a new Panel instance
   * @param {Object} config - Panel configuration options
   * @param {string} config.id - Unique identifier for the panel
   * @param {string} config.selector - CSS selector for the panel container
   * @param {string} config.title - Panel title
   * @param {Object} config.options - Additional panel options
   */
  constructor(config = {}) {
    // Required panel properties
    this.id = config.id || `panel-${Date.now()}`;
    this.selector = config.selector || '.data-panel';
    this.title = config.title || 'Panel';
    
    // Panel state
    this.initialized = false;
    this.active = false;
    this.visible = false;
    this.loading = false;
    this.error = null;
    this.data = null;
    
    // Content virtualization state
    this.virtualScrollEnabled = config.options?.virtualScroll ?? false;
    this.virtualItems = [];
    this.visibleItems = [];
    this.virtualScrollState = {
      itemHeight: config.options?.itemHeight || 50,
      bufferSize: config.options?.bufferSize || 5,
      totalItems: 0,
      visibleStart: 0,
      visibleEnd: 0,
      scrollTop: 0,
      containerHeight: 0
    };
    
    // Performance metrics
    this._renderTime = 0;
    this._lastRenderTime = 0;
    
    // DOM elements
    this.element = null;
    this.contentContainer = null;
    this.loadingIndicator = null;
    this.errorContainer = null;
    
    // Store configuration
    this.config = config;
    
    // Bind methods to this instance
    this._bindMethods();
  }
  
  /**
   * Bind class methods to this instance
   * @private
   */
  _bindMethods() {
    this.init = this.init.bind(this);
    this.update = this.update.bind(this);
    this.destroy = this.destroy.bind(this);
    this.render = this.render.bind(this);
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this.setLoading = this.setLoading.bind(this);
    this.setError = this.setError.bind(this);
    this.clearError = this.clearError.bind(this);
    
    // Virtual scrolling methods
    this._handleScroll = this._handleScroll.bind(this);
    this._updateVisibleItems = this._updateVisibleItems.bind(this);
    this._renderVirtualItems = this._renderVirtualItems.bind(this);
  }
  
  /**
   * Initialize the panel and render it
   * @returns {Panel} The panel instance
   */
  init() {
    if (this.initialized) {
      console.warn(`Panel ${this.id} already initialized.`);
      return this;
    }
    
    console.info(`Initializing panel: ${this.id}`);
    
    // Get panel element
    this.element = document.querySelector(this.selector);
    if (!this.element) {
      console.error(`Panel element not found: ${this.selector}`);
      return this;
    }
    
    // Add necessary attributes and classes
    this.element.setAttribute('data-panel-id', this.id);
    this.element.classList.add('panel');
    
    // Create panel structure
    this._createPanelStructure();
    
    // Set up event listeners
    this._setupEventListeners();
    
    // Set initialized flag
    this.initialized = true;
    
    return this;
  }
  
  /**
   * Create the basic panel structure
   * @private
   */
  _createPanelStructure() {
    // Create panel header
    const header = document.createElement('div');
    header.className = 'panel-header';
    header.innerHTML = `<h2 class="panel-title">${this.title}</h2>`;
    
    // Create content container
    this.contentContainer = document.createElement('div');
    this.contentContainer.className = 'panel-content';
    
    // Create loading indicator
    this.loadingIndicator = document.createElement('div');
    this.loadingIndicator.className = 'panel-loading';
    this.loadingIndicator.innerHTML = '<div class="spinner"></div><span>Loading...</span>';
    this.loadingIndicator.style.display = 'none';
    
    // Create error container
    this.errorContainer = document.createElement('div');
    this.errorContainer.className = 'panel-error';
    this.errorContainer.style.display = 'none';
    
    // Append all elements
    this.element.appendChild(header);
    this.element.appendChild(this.contentContainer);
    this.element.appendChild(this.loadingIndicator);
    this.element.appendChild(this.errorContainer);
    
    // Setup virtual scroll container if enabled
    if (this.virtualScrollEnabled) {
      this._setupVirtualScroll();
    }
  }
  
  /**
   * Setup virtual scrolling
   * @private
   */
  _setupVirtualScroll() {
    // Create virtual scroll container
    this.virtualContainer = document.createElement('div');
    this.virtualContainer.className = 'virtual-scroll-container';
    
    // Create virtual scroll content with spacer to represent full height
    this.virtualContent = document.createElement('div');
    this.virtualContent.className = 'virtual-scroll-content';
    
    // Create spacer to represent full height of virtual content
    this.virtualSpacer = document.createElement('div');
    this.virtualSpacer.className = 'virtual-scroll-spacer';
    
    // Append elements
    this.virtualContainer.appendChild(this.virtualContent);
    this.virtualContainer.appendChild(this.virtualSpacer);
    this.contentContainer.appendChild(this.virtualContainer);
    
    // Setup event listeners for virtual scrolling
    this.virtualContainer.addEventListener('scroll', this._handleScroll);
    
    // Set initial state
    this.virtualScrollState.containerHeight = this.virtualContainer.clientHeight;
  }
  
  /**
   * Set up event listeners
   * @private
   */
  _setupEventListeners() {
    // Add resize observer to update virtual scroll on resize
    if (this.virtualScrollEnabled && window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          if (entry.target === this.virtualContainer) {
            this.virtualScrollState.containerHeight = entry.contentRect.height;
            this._updateVisibleItems();
          }
        }
      });
      
      this.resizeObserver.observe(this.virtualContainer);
    }
    
    // Add mutation observer to track content changes
    if (window.MutationObserver) {
      this.mutationObserver = new MutationObserver(mutations => {
        // Detect relevant mutations and trigger updates if needed
        const contentChanged = mutations.some(mutation => 
          mutation.type === 'childList' && 
          (mutation.target === this.contentContainer || 
           this.contentContainer.contains(mutation.target))
        );
        
        if (contentChanged && this.virtualScrollEnabled) {
          this._updateVisibleItems();
        }
      });
      
      this.mutationObserver.observe(this.element, {
        childList: true,
        subtree: true
      });
    }
  }
  
  /**
   * Handle scroll events for virtual scrolling
   * @param {Event} event - Scroll event
   * @private
   */
  _handleScroll(event) {
    if (!this.virtualScrollEnabled) return;
    
    // Get new scroll position
    const scrollTop = event.target.scrollTop;
    
    // Don't update if scroll position hasn't changed significantly
    if (Math.abs(scrollTop - this.virtualScrollState.scrollTop) < (this.virtualScrollState.itemHeight / 2)) {
      return;
    }
    
    this.virtualScrollState.scrollTop = scrollTop;
    
    // Throttle updates for better performance
    if (this._scrollTimeout) {
      window.cancelAnimationFrame(this._scrollTimeout);
    }
    
    this._scrollTimeout = window.requestAnimationFrame(() => {
      this._updateVisibleItems();
    });
  }
  
  /**
   * Update which items are visible in the virtual scroll
   * @private
   */
  _updateVisibleItems() {
    if (!this.virtualScrollEnabled || !this.virtualItems.length) return;
    
    const { itemHeight, bufferSize, scrollTop, containerHeight } = this.virtualScrollState;
    
    // Calculate visible range with buffer
    const visibleStart = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize);
    const visibleEnd = Math.min(
      this.virtualItems.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + bufferSize
    );
    
    // Check if visible range has changed
    if (visibleStart !== this.virtualScrollState.visibleStart || 
        visibleEnd !== this.virtualScrollState.visibleEnd) {
      
      this.virtualScrollState.visibleStart = visibleStart;
      this.virtualScrollState.visibleEnd = visibleEnd;
      
      // Update visible items
      this.visibleItems = this.virtualItems.slice(visibleStart, visibleEnd + 1);
      
      // Render visible items
      this._renderVirtualItems();
    }
  }
  
  /**
   * Render the currently visible virtual items
   * @private
   */
  _renderVirtualItems() {
    if (!this.virtualScrollEnabled || !this.virtualContent) return;
    
    // Clear existing content
    this.virtualContent.innerHTML = '';
    
    // Update spacer height to represent total content height
    this.virtualSpacer.style.height = `${this.virtualItems.length * this.virtualScrollState.itemHeight}px`;
    
    // Calculate offset for current scroll position
    const offsetY = this.virtualScrollState.visibleStart * this.virtualScrollState.itemHeight;
    this.virtualContent.style.transform = `translateY(${offsetY}px)`;
    
    // Render each visible item
    this.visibleItems.forEach((item, index) => {
      const itemElement = this.renderItem ? this.renderItem(item) : this._defaultRenderItem(item);
      if (itemElement) {
        // Set height and data attributes
        itemElement.style.height = `${this.virtualScrollState.itemHeight}px`;
        itemElement.setAttribute('data-virtual-index', this.virtualScrollState.visibleStart + index);
        
        // Add to the container
        this.virtualContent.appendChild(itemElement);
      }
    });
  }
  
  /**
   * Default item renderer if no custom renderer is provided
   * @param {Object} item - The item to render
   * @returns {HTMLElement} The item element
   * @private
   */
  _defaultRenderItem(item) {
    const element = document.createElement('div');
    element.className = 'virtual-item';
    
    if (typeof item === 'string') {
      element.textContent = item;
    } else if (typeof item === 'object') {
      element.textContent = item.text || JSON.stringify(item);
    }
    
    return element;
  }
  
  /**
   * Update the panel with new data
   * @param {Object} data - New data to update the panel with
   * @returns {Panel} The panel instance
   */
  update(data) {
    console.info(`Updating panel: ${this.id}`);
    
    const startTime = performance.now();
    
    // Store data
    this.data = data;
    
    // Clear any existing errors
    this.clearError();
    
    // Show loading state
    this.setLoading(true);
    
    try {
      // Call render method
      this.render(data);
      
      // Set loading state to false
      this.setLoading(false);
    } catch (error) {
      console.error(`Error updating panel ${this.id}:`, error);
      this.setError(error.message || 'Error updating panel');
      this.setLoading(false);
    }
    
    // Calculate render time
    this._lastRenderTime = this._renderTime;
    this._renderTime = performance.now() - startTime;
    
    // Log performance information if significant change
    if (Math.abs(this._renderTime - this._lastRenderTime) > 100) {
      console.info(`Panel ${this.id} render time: ${this._renderTime.toFixed(2)}ms`);
    }
    
    return this;
  }
  
  /**
   * Render the panel with the given data
   * This method should be overridden by subclasses
   * @param {Object} data - Data to render
   */
  render(data) {
    // Implement in subclass
    console.warn(`Render method not implemented for panel ${this.id}`);
    
    // Default implementation
    if (this.contentContainer) {
      this.contentContainer.innerHTML = `<div class="panel-default-content">
        <h3>Panel: ${this.title}</h3>
        <pre>${JSON.stringify(data, null, 2)}</pre>
      </div>`;
    }
  }
  
  /**
   * Set the panel's loading state
   * @param {boolean} isLoading - Whether the panel is loading
   * @returns {Panel} The panel instance
   */
  setLoading(isLoading) {
    this.loading = isLoading;
    
    if (this.loadingIndicator) {
      this.loadingIndicator.style.display = isLoading ? 'flex' : 'none';
    }
    
    return this;
  }
  
  /**
   * Set an error message on the panel
   * @param {string} message - Error message to display
   * @returns {Panel} The panel instance
   */
  setError(message) {
    this.error = message;
    
    if (this.errorContainer) {
      this.errorContainer.innerHTML = `<div class="error-icon">⚠️</div>
                                     <div class="error-message">${message}</div>`;
      this.errorContainer.style.display = 'block';
    }
    
    return this;
  }
  
  /**
   * Clear any error message
   * @returns {Panel} The panel instance
   */
  clearError() {
    this.error = null;
    
    if (this.errorContainer) {
      this.errorContainer.style.display = 'none';
      this.errorContainer.innerHTML = '';
    }
    
    return this;
  }
  
  /**
   * Show the panel
   * @returns {Panel} The panel instance
   */
  show() {
    this.visible = true;
    this.active = true;
    
    if (this.element) {
      this.element.classList.add('active');
      this.element.style.display = '';
      
      // Trigger any necessary updates when panel becomes visible
      if (this.virtualScrollEnabled) {
        // Update after a short delay to ensure container size is correct
        setTimeout(() => {
          this.virtualScrollState.containerHeight = this.virtualContainer.clientHeight;
          this._updateVisibleItems();
        }, 50);
      }
    }
    
    return this;
  }
  
  /**
   * Hide the panel
   * @returns {Panel} The panel instance
   */
  hide() {
    this.visible = false;
    this.active = false;
    
    if (this.element) {
      this.element.classList.remove('active');
      this.element.style.display = 'none';
    }
    
    return this;
  }
  
  /**
   * Set the virtual items for the panel
   * @param {Array} items - Array of items to display
   * @param {Object} options - Additional options for virtual scrolling
   * @returns {Panel} The panel instance
   */
  setVirtualItems(items, options = {}) {
    if (!this.virtualScrollEnabled) {
      console.warn(`Panel ${this.id} does not have virtual scrolling enabled`);
      return this;
    }
    
    // Store items
    this.virtualItems = Array.isArray(items) ? items : [];
    
    // Update options if provided
    if (options.itemHeight) {
      this.virtualScrollState.itemHeight = options.itemHeight;
    }
    
    if (options.bufferSize) {
      this.virtualScrollState.bufferSize = options.bufferSize;
    }
    
    // Update state
    this.virtualScrollState.totalItems = this.virtualItems.length;
    
    // Reset visible range
    this.virtualScrollState.visibleStart = 0;
    this.virtualScrollState.visibleEnd = Math.min(
      this.virtualItems.length - 1,
      Math.ceil(this.virtualScrollState.containerHeight / this.virtualScrollState.itemHeight) + this.virtualScrollState.bufferSize
    );
    
    // Update visible items
    this.visibleItems = this.virtualItems.slice(
      this.virtualScrollState.visibleStart,
      this.virtualScrollState.visibleEnd + 1
    );
    
    // Render visible items
    this._renderVirtualItems();
    
    return this;
  }
  
  /**
   * Clean up the panel, remove event listeners and observers
   * @returns {Panel} The panel instance
   */
  destroy() {
    console.info(`Destroying panel: ${this.id}`);
    
    // Clear data
    this.data = null;
    
    // Remove event listeners
    if (this.virtualScrollEnabled && this.virtualContainer) {
      this.virtualContainer.removeEventListener('scroll', this._handleScroll);
    }
    
    // Disconnect observers
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
    
    // Clear any timeouts
    if (this._scrollTimeout) {
      window.cancelAnimationFrame(this._scrollTimeout);
      this._scrollTimeout = null;
    }
    
    // Reset flags
    this.initialized = false;
    this.active = false;
    this.visible = false;
    
    return this;
  }
  
  /**
   * Reset the panel to its initial state
   * @returns {Panel} The panel instance
   */
  reset() {
    // Clear content container
    if (this.contentContainer) {
      this.contentContainer.innerHTML = '';
    }
    
    // Clear virtual items if enabled
    if (this.virtualScrollEnabled) {
      this.virtualItems = [];
      this.visibleItems = [];
      this._renderVirtualItems();
    }
    
    // Clear error state
    this.clearError();
    
    // Reset loading state
    this.setLoading(false);
    
    return this;
  }
  
  /**
   * Refresh the panel (re-render with current data)
   * @returns {Panel} The panel instance
   */
  refresh() {
    if (this.data) {
      this.render(this.data);
    }
    
    return this;
  }
  
  /**
   * Get panel performance metrics
   * @returns {Object} Performance metrics
   */
  getPerformanceMetrics() {
    return {
      renderTime: this._renderTime,
      lastRenderTime: this._lastRenderTime,
      virtualItemCount: this.virtualItems.length,
      visibleItemCount: this.visibleItems.length
    };
  }
}

/**
 * Helper function to create and initialize a panel
 * @param {Object} config - Panel configuration
 * @returns {Panel} The initialized panel
 */
export function createPanel(config) {
  const panel = new Panel(config);
  return panel.init();
}

export default Panel; 