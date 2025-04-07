/**
 * RankingsPanel.js
 * 
 * Standardized Rankings Panel implementation that extends the base Panel class.
 * Displays ranking data with filtering, sorting and comparison capabilities.
 */

import { Panel } from './Panel.js';
import { formatNumber, formatDate } from '../../utils/formatters.js';
import { createSearchInput } from '../../utils/search.js';
import { createTable } from '../../utils/table.js';

/**
 * RankingsPanel class for displaying ranking data
 * @extends Panel
 */
export class RankingsPanel extends Panel {
  /**
   * Create a new RankingsPanel instance
   * @param {Object} config - Panel configuration
   */
  constructor(config = {}) {
    // Set default configuration for rankings panel
    const rankingsConfig = {
      id: config.id || 'rankings-panel',
      title: config.title || 'Rankings',
      selector: config.selector || '#rankings-panel-container',
      options: {
        ...config.options,
        virtualScroll: config.options?.virtualScroll ?? true,
        itemHeight: config.options?.itemHeight || 70,
        bufferSize: config.options?.bufferSize || 10
      }
    };
    
    super(rankingsConfig);
    
    // Rankings panel specific properties
    this.searchQuery = '';
    this.metrics = [];
    this.currentMetric = config.defaultMetric || null;
    this.sortOrder = config.defaultSortOrder || 'desc';
    this.rankings = [];
    this.filteredRankings = [];
    this.searchInput = null;
    this.metricsContainer = null;
    this.compareMode = false;
    this.selectedItems = new Set();
    this.tableContainer = null;
    this.tableInstance = null;
    
    // Bind additional methods
    this._bindRankingsMethods();
  }
  
  /**
   * Bind rankings panel specific methods
   * @private
   */
  _bindRankingsMethods() {
    this._handleSearch = this._handleSearch.bind(this);
    this._handleMetricChange = this._handleMetricChange.bind(this);
    this._handleSortOrderChange = this._handleSortOrderChange.bind(this);
    this._handleCompareToggle = this._handleCompareToggle.bind(this);
    this._handleItemSelect = this._handleItemSelect.bind(this);
    this._handleCompareItems = this._handleCompareItems.bind(this);
    this._renderRankingItem = this._renderRankingItem.bind(this);
  }
  
  /**
   * Create panel structure with rankings-specific elements
   * @override
   * @private
   */
  _createPanelStructure() {
    // Call parent method to create base structure
    super._createPanelStructure();
    
    // Create controls container
    this.controlsContainer = document.createElement('div');
    this.controlsContainer.className = 'panel-controls-container';
    
    // Create search input
    this.searchInput = createSearchInput({
      placeholder: 'Search rankings...',
      callback: this._handleSearch,
      debounceTime: 300
    });
    
    // Create metrics container
    this.metricsContainer = document.createElement('div');
    this.metricsContainer.className = 'ranking-metrics';
    
    // Create sort order control
    this.sortOrderControl = document.createElement('div');
    this.sortOrderControl.className = 'sort-order-control';
    this.sortOrderControl.innerHTML = `
      <button class="sort-btn" data-order="desc" aria-label="Sort descending">
        <span class="sort-icon">↓</span> Highest
      </button>
      <button class="sort-btn" data-order="asc" aria-label="Sort ascending">
        <span class="sort-icon">↑</span> Lowest
      </button>
    `;
    
    // Add event listeners for sort buttons
    this.sortOrderControl.querySelectorAll('.sort-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this._handleSortOrderChange(btn.dataset.order);
      });
    });
    
    // Create compare mode toggle
    this.compareToggle = document.createElement('button');
    this.compareToggle.className = 'compare-toggle-btn';
    this.compareToggle.textContent = 'Compare Mode';
    this.compareToggle.addEventListener('click', this._handleCompareToggle);
    
    // Append controls to container
    this.controlsContainer.appendChild(this.searchInput);
    this.controlsContainer.appendChild(this.metricsContainer);
    this.controlsContainer.appendChild(this.sortOrderControl);
    this.controlsContainer.appendChild(this.compareToggle);
    
    // Insert after the panel header
    this.element.insertBefore(this.controlsContainer, this.contentContainer);
    
    // Create comparison container
    this.comparisonContainer = document.createElement('div');
    this.comparisonContainer.className = 'comparison-container';
    this.comparisonContainer.style.display = 'none';
    
    // Create table container
    this.tableContainer = document.createElement('div');
    this.tableContainer.className = 'rankings-table-container';
    this.tableContainer.style.display = 'none';
    
    // Append containers
    this.contentContainer.appendChild(this.comparisonContainer);
    this.contentContainer.appendChild(this.tableContainer);
  }
  
  /**
   * Handle search input changes
   * @param {string} query - The search query
   * @private
   */
  _handleSearch(query) {
    this.searchQuery = query.trim().toLowerCase();
    this._filterAndRenderRankings();
  }
  
  /**
   * Handle metric selection changes
   * @param {string} metricId - The selected metric ID
   * @private
   */
  _handleMetricChange(metricId) {
    this.currentMetric = metricId;
    
    // Update active metric styling
    const metricButtons = this.metricsContainer.querySelectorAll('.metric-btn');
    metricButtons.forEach(btn => {
      if (btn.dataset.metricId === metricId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    
    this._filterAndRenderRankings();
  }
  
  /**
   * Handle sort order changes
   * @param {string} order - The sort order ('asc' or 'desc')
   * @private
   */
  _handleSortOrderChange(order) {
    this.sortOrder = order;
    
    // Update active sort button styling
    const sortButtons = this.sortOrderControl.querySelectorAll('.sort-btn');
    sortButtons.forEach(btn => {
      if (btn.dataset.order === order) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    
    this._filterAndRenderRankings();
  }
  
  /**
   * Toggle comparison mode
   * @private
   */
  _handleCompareToggle() {
    this.compareMode = !this.compareMode;
    
    // Update button text and styling
    if (this.compareMode) {
      this.compareToggle.textContent = 'Exit Compare Mode';
      this.compareToggle.classList.add('active');
      
      // Show comparison action bar
      this._showComparisonActionBar();
    } else {
      this.compareToggle.textContent = 'Compare Mode';
      this.compareToggle.classList.remove('active');
      
      // Hide comparison action bar and clear selections
      this._hideComparisonActionBar();
      this.selectedItems.clear();
      
      // Re-render items to update selection state
      this._filterAndRenderRankings();
    }
  }
  
  /**
   * Show comparison action bar
   * @private
   */
  _showComparisonActionBar() {
    // Create action bar if it doesn't exist
    if (!this.comparisonActionBar) {
      this.comparisonActionBar = document.createElement('div');
      this.comparisonActionBar.className = 'comparison-action-bar';
      
      // Create selection counter
      this.selectionCounter = document.createElement('div');
      this.selectionCounter.className = 'selection-counter';
      this.selectionCounter.textContent = '0 items selected';
      
      // Create compare button
      this.compareButton = document.createElement('button');
      this.compareButton.className = 'compare-btn';
      this.compareButton.textContent = 'Compare Selected';
      this.compareButton.disabled = true;
      this.compareButton.addEventListener('click', this._handleCompareItems);
      
      // Create clear selection button
      this.clearSelectionButton = document.createElement('button');
      this.clearSelectionButton.className = 'clear-selection-btn';
      this.clearSelectionButton.textContent = 'Clear Selection';
      this.clearSelectionButton.disabled = true;
      this.clearSelectionButton.addEventListener('click', () => {
        this.selectedItems.clear();
        this._updateSelectionCounter();
        this._filterAndRenderRankings();
      });
      
      // Append buttons to action bar
      this.comparisonActionBar.appendChild(this.selectionCounter);
      this.comparisonActionBar.appendChild(this.compareButton);
      this.comparisonActionBar.appendChild(this.clearSelectionButton);
      
      // Insert action bar after controls container
      this.element.insertBefore(this.comparisonActionBar, this.contentContainer);
    }
    
    // Show action bar
    this.comparisonActionBar.style.display = 'flex';
    
    // Update selection counter
    this._updateSelectionCounter();
  }
  
  /**
   * Hide comparison action bar
   * @private
   */
  _hideComparisonActionBar() {
    if (this.comparisonActionBar) {
      this.comparisonActionBar.style.display = 'none';
    }
    
    // Hide comparison container
    this.comparisonContainer.style.display = 'none';
  }
  
  /**
   * Update selection counter
   * @private
   */
  _updateSelectionCounter() {
    if (!this.selectionCounter) return;
    
    const count = this.selectedItems.size;
    this.selectionCounter.textContent = `${count} item${count !== 1 ? 's' : ''} selected`;
    
    // Update button states
    if (this.compareButton) {
      this.compareButton.disabled = count < 2;
    }
    
    if (this.clearSelectionButton) {
      this.clearSelectionButton.disabled = count === 0;
    }
  }
  
  /**
   * Handle item selection in compare mode
   * @param {string} itemId - The ID of the selected item
   * @private
   */
  _handleItemSelect(itemId) {
    if (!this.compareMode) return;
    
    if (this.selectedItems.has(itemId)) {
      this.selectedItems.delete(itemId);
    } else {
      this.selectedItems.add(itemId);
    }
    
    // Update selection counter
    this._updateSelectionCounter();
    
    // Update item selection state in UI
    const itemEl = this.element.querySelector(`.ranking-item[data-item-id="${itemId}"]`);
    if (itemEl) {
      if (this.selectedItems.has(itemId)) {
        itemEl.classList.add('selected');
      } else {
        itemEl.classList.remove('selected');
      }
    }
  }
  
  /**
   * Handle comparison of selected items
   * @private
   */
  _handleCompareItems() {
    if (this.selectedItems.size < 2) return;
    
    // Get selected items data
    const selectedItemsData = this.rankings.filter(item => 
      this.selectedItems.has(item.id)
    );
    
    // Hide virtual scroll container
    this.virtualContainer.style.display = 'none';
    
    // Show comparison container
    this.comparisonContainer.style.display = 'block';
    
    // Render comparison view
    this._renderComparisonView(selectedItemsData);
  }
  
  /**
   * Render comparison view for selected items
   * @param {Array} items - The selected items to compare
   * @private
   */
  _renderComparisonView(items) {
    // Clear container
    this.comparisonContainer.innerHTML = '';
    
    // Create header
    const header = document.createElement('div');
    header.className = 'comparison-header';
    header.innerHTML = `
      <h3>Comparison (${items.length} items)</h3>
      <button class="close-btn" aria-label="Close comparison view">×</button>
    `;
    
    // Add event listener to close button
    header.querySelector('.close-btn').addEventListener('click', () => {
      this.comparisonContainer.style.display = 'none';
      this.virtualContainer.style.display = '';
    });
    
    // Append header
    this.comparisonContainer.appendChild(header);
    
    // Create table container
    const tableContainer = document.createElement('div');
    tableContainer.className = 'comparison-table-container';
    this.comparisonContainer.appendChild(tableContainer);
    
    // Prepare table data
    const tableData = {
      headers: ['Metric', ...items.map(item => item.name || `Item ${item.id}`)],
      rows: []
    };
    
    // Get all available metrics from the first item
    const allMetrics = this.metrics.map(metric => ({
      id: metric.id,
      label: metric.label,
      format: metric.format
    }));
    
    // Add row for each metric
    allMetrics.forEach(metric => {
      const row = [metric.label];
      
      // Add value for each item
      items.forEach(item => {
        const metricValue = item.metrics?.[metric.id];
        if (metricValue !== undefined && metricValue !== null) {
          const formatted = metric.format ? 
            metric.format(metricValue) : 
            formatNumber(metricValue);
          row.push(formatted);
        } else {
          row.push('N/A');
        }
      });
      
      tableData.rows.push(row);
    });
    
    // Create table
    createTable(tableContainer, tableData, {
      responsive: true,
      zebra: true,
      highlights: true
    });
  }
  
  /**
   * Filter rankings based on search query and metric, then render
   * @private
   */
  _filterAndRenderRankings() {
    // Make sure we have a current metric
    if (!this.currentMetric && this.metrics.length > 0) {
      this.currentMetric = this.metrics[0].id;
    }
    
    // Apply filters
    this.filteredRankings = this.rankings.filter(item => {
      // Apply search filter
      if (this.searchQuery) {
        const searchText = item.name?.toLowerCase() || '';
        return searchText.includes(this.searchQuery);
      }
      
      return true;
    });
    
    // Sort by current metric if available
    if (this.currentMetric) {
      this.filteredRankings.sort((a, b) => {
        const aValue = a.metrics?.[this.currentMetric] ?? 0;
        const bValue = b.metrics?.[this.currentMetric] ?? 0;
        
        return this.sortOrder === 'desc' ? 
          bValue - aValue : // descending
          aValue - bValue;  // ascending
      });
    }
    
    // Set virtual items and render
    this.setVirtualItems(this.filteredRankings);
    
    // Update empty state if no results
    if (this.filteredRankings.length === 0) {
      const emptyStateEl = document.createElement('div');
      emptyStateEl.className = 'panel-empty-state';
      emptyStateEl.innerHTML = `
        <div class="icon">🔍</div>
        <div class="message">No rankings found</div>
        <div class="sub-message">Try adjusting your search criteria.</div>
      `;
      
      this.contentContainer.appendChild(emptyStateEl);
    }
  }
  
  /**
   * Render a ranking item for virtual scrolling
   * @param {Object} item - The ranking item to render
   * @returns {HTMLElement} The rendered item element
   * @override
   */
  renderItem(item) {
    return this._renderRankingItem(item);
  }
  
  /**
   * Render a single ranking item
   * @param {Object} item - The ranking item to render
   * @returns {HTMLElement} The rendered item element
   * @private
   */
  _renderRankingItem(item) {
    const itemEl = document.createElement('div');
    itemEl.className = 'ranking-item';
    itemEl.dataset.itemId = item.id;
    
    // Add selected class if item is selected in compare mode
    if (this.selectedItems.has(item.id)) {
      itemEl.classList.add('selected');
    }
    
    // Get current metric value
    let metricValue = 'N/A';
    let metricValueRaw = null;
    let formattedValue = 'N/A';
    
    if (this.currentMetric && item.metrics) {
      metricValueRaw = item.metrics[this.currentMetric];
      
      if (metricValueRaw !== undefined && metricValueRaw !== null) {
        // Find metric definition to use its formatter
        const metricDef = this.metrics.find(m => m.id === this.currentMetric);
        formattedValue = metricDef && metricDef.format ? 
          metricDef.format(metricValueRaw) : 
          formatNumber(metricValueRaw);
        
        metricValue = formattedValue;
      }
    }
    
    // Get rank number (index in filtered list + 1)
    const rankIndex = this.filteredRankings.findIndex(r => r.id === item.id);
    const rankNumber = rankIndex !== -1 ? rankIndex + 1 : 'N/A';
    
    // Create item content
    itemEl.innerHTML = `
      <div class="ranking-item-content">
        <div class="ranking-item-rank">${rankNumber}</div>
        <div class="ranking-item-main">
          <div class="ranking-item-info">
            <div class="ranking-name">${item.name || `Item ${item.id}`}</div>
            <div class="ranking-details">${item.details || ''}</div>
          </div>
          <div class="ranking-value-container">
            <div class="ranking-value">${metricValue}</div>
            <div class="ranking-metric-name">${this._getMetricLabel(this.currentMetric)}</div>
          </div>
        </div>
        ${this.compareMode ? '<div class="ranking-item-select"><span class="select-icon"></span></div>' : ''}
      </div>
    `;
    
    // Add event listener for item selection in compare mode
    if (this.compareMode) {
      itemEl.addEventListener('click', () => {
        this._handleItemSelect(item.id);
      });
    }
    
    return itemEl;
  }
  
  /**
   * Get label for a metric ID
   * @param {string} metricId - The metric ID
   * @returns {string} The metric label
   * @private
   */
  _getMetricLabel(metricId) {
    const metric = this.metrics.find(m => m.id === metricId);
    return metric ? metric.label : metricId;
  }
  
  /**
   * Update the metrics UI
   * @private
   */
  _updateMetricsUI() {
    if (!this.metricsContainer) return;
    
    // Clear container
    this.metricsContainer.innerHTML = '';
    
    // Create a button for each metric
    this.metrics.forEach(metric => {
      const btn = document.createElement('button');
      btn.className = 'metric-btn' + (this.currentMetric === metric.id ? ' active' : '');
      btn.textContent = metric.label;
      btn.dataset.metricId = metric.id;
      btn.addEventListener('click', () => this._handleMetricChange(metric.id));
      this.metricsContainer.appendChild(btn);
    });
  }
  
  /**
   * Show rankings as a table
   * @private
   */
  _showAsTable() {
    // Hide virtual scroll container
    this.virtualContainer.style.display = 'none';
    
    // Show table container
    this.tableContainer.style.display = 'block';
    
    // Prepare table data
    const tableData = {
      headers: ['Rank', 'Name', this._getMetricLabel(this.currentMetric)],
      rows: this.filteredRankings.map((item, index) => {
        const metricValue = item.metrics?.[this.currentMetric];
        const metric = this.metrics.find(m => m.id === this.currentMetric);
        const formatted = metricValue !== undefined && metricValue !== null ? 
          (metric && metric.format ? metric.format(metricValue) : formatNumber(metricValue)) : 
          'N/A';
        
        return [
          (index + 1).toString(),
          item.name || `Item ${item.id}`,
          formatted
        ];
      })
    };
    
    // Create table
    if (this.tableInstance) {
      this.tableInstance.update(tableData);
    } else {
      this.tableInstance = createTable(this.tableContainer, tableData, {
        responsive: true,
        zebra: true,
        sortable: true,
        pagination: true,
        pageSize: 25
      });
    }
  }
  
  /**
   * Show rankings as a list (virtual scroll)
   * @private
   */
  _showAsList() {
    // Hide table container
    this.tableContainer.style.display = 'none';
    
    // Show virtual scroll container
    this.virtualContainer.style.display = '';
  }
  
  /**
   * Render the panel with the provided data
   * @override
   * @param {Object} data - The data to render
   */
  render(data) {
    if (!data) {
      this.setError('No data available');
      return;
    }
    
    try {
      // Extract data
      this.rankings = Array.isArray(data.rankings) ? data.rankings : [];
      this.metrics = Array.isArray(data.metrics) ? data.metrics : [];
      
      // Set default metric if not set
      if (!this.currentMetric && this.metrics.length > 0) {
        this.currentMetric = this.metrics[0].id;
      }
      
      // Update metrics UI
      this._updateMetricsUI();
      
      // Update sort order buttons
      const sortButtons = this.sortOrderControl.querySelectorAll('.sort-btn');
      sortButtons.forEach(btn => {
        if (btn.dataset.order === this.sortOrder) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
      
      // Filter and render rankings
      this._filterAndRenderRankings();
      
    } catch (error) {
      console.error('Error rendering rankings panel:', error);
      this.setError('Error rendering rankings: ' + error.message);
    }
  }
  
  /**
   * Reset the panel to its initial state
   * @override
   * @returns {RankingsPanel} The panel instance
   */
  reset() {
    super.reset();
    
    // Reset rankings panel specific state
    this.searchQuery = '';
    this.rankings = [];
    this.filteredRankings = [];
    this.compareMode = false;
    this.selectedItems.clear();
    
    // Reset search input
    if (this.searchInput && this.searchInput.querySelector('input')) {
      this.searchInput.querySelector('input').value = '';
    }
    
    // Hide comparison container
    if (this.comparisonContainer) {
      this.comparisonContainer.style.display = 'none';
    }
    
    // Hide table container
    if (this.tableContainer) {
      this.tableContainer.style.display = 'none';
    }
    
    // Hide comparison action bar
    this._hideComparisonActionBar();
    
    return this;
  }
}

/**
 * Helper function to create and initialize a rankings panel
 * @param {Object} config - Panel configuration
 * @returns {RankingsPanel} The initialized rankings panel
 */
export function createRankingsPanel(config) {
  const panel = new RankingsPanel(config);
  return panel.init();
}

export default RankingsPanel; 