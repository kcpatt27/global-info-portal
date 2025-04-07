/**
 * StatsPanel.js
 * 
 * Standardized Stats Panel implementation that extends the base Panel class.
 * Displays statistical data with search functionality and historical data visualization.
 */

import { Panel } from './Panel.js';
import { formatNumber, formatDate, formatPercentage } from '../../utils/formatters.js';
import { createSearchInput } from '../../utils/search.js';
import { createChart } from '../../utils/charts.js';

/**
 * StatsPanel class for displaying statistical data
 * @extends Panel
 */
export class StatsPanel extends Panel {
  /**
   * Create a new StatsPanel instance
   * @param {Object} config - Panel configuration
   */
  constructor(config = {}) {
    // Set default configuration for stats panel
    const statsConfig = {
      id: config.id || 'stats-panel',
      title: config.title || 'Statistics',
      selector: config.selector || '#stats-panel-container',
      options: {
        ...config.options,
        virtualScroll: config.options?.virtualScroll ?? true,
        itemHeight: config.options?.itemHeight || 60,
        bufferSize: config.options?.bufferSize || 10
      }
    };
    
    super(statsConfig);
    
    // Stats panel specific properties
    this.searchQuery = '';
    this.filterOptions = config.filterOptions || {};
    this.currentCategory = config.defaultCategory || 'all';
    this.categories = [];
    this.stats = [];
    this.filteredStats = [];
    this.searchInput = null;
    this.filterContainer = null;
    this.categoryContainer = null;
    this.historicalData = {};
    this.currentHistoricalView = null;
    
    // Bind additional methods
    this._bindStatsMethods();
  }
  
  /**
   * Bind stats panel specific methods
   * @private
   */
  _bindStatsMethods() {
    this._handleSearch = this._handleSearch.bind(this);
    this._handleCategoryChange = this._handleCategoryChange.bind(this);
    this._handleHistoricalViewToggle = this._handleHistoricalViewToggle.bind(this);
    this._renderStatsItem = this._renderStatsItem.bind(this);
  }
  
  /**
   * Create panel structure with stats-specific elements
   * @override
   * @private
   */
  _createPanelStructure() {
    // Call parent method to create base structure
    super._createPanelStructure();
    
    // Create search and filter container
    this.controlsContainer = document.createElement('div');
    this.controlsContainer.className = 'panel-controls-container';
    
    // Create search input
    this.searchInput = createSearchInput({
      placeholder: 'Search statistics...',
      callback: this._handleSearch,
      debounceTime: 300
    });
    
    // Create filter container
    this.filterContainer = document.createElement('div');
    this.filterContainer.className = 'stats-filters';
    
    // Create category container
    this.categoryContainer = document.createElement('div');
    this.categoryContainer.className = 'stats-categories';
    
    // Append controls to header
    this.controlsContainer.appendChild(this.searchInput);
    this.controlsContainer.appendChild(this.filterContainer);
    this.controlsContainer.appendChild(this.categoryContainer);
    
    // Insert after the panel header
    this.element.insertBefore(this.controlsContainer, this.contentContainer);
    
    // Create historical view container
    this.historicalContainer = document.createElement('div');
    this.historicalContainer.className = 'historical-view-container';
    this.historicalContainer.style.display = 'none';
    this.contentContainer.appendChild(this.historicalContainer);
  }
  
  /**
   * Handle search input changes
   * @param {string} query - The search query
   * @private
   */
  _handleSearch(query) {
    this.searchQuery = query.trim().toLowerCase();
    this._filterAndRenderStats();
  }
  
  /**
   * Handle category selection changes
   * @param {string} category - The selected category
   * @private
   */
  _handleCategoryChange(category) {
    this.currentCategory = category;
    
    // Update active category styling
    const categoryButtons = this.categoryContainer.querySelectorAll('.category-btn');
    categoryButtons.forEach(btn => {
      if (btn.dataset.category === category) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    
    this._filterAndRenderStats();
  }
  
  /**
   * Toggle historical view for a statistic
   * @param {string} statId - The ID of the statistic to show historical data for
   * @private
   */
  _handleHistoricalViewToggle(statId) {
    // If already viewing this stat, close the view
    if (this.currentHistoricalView === statId) {
      this.historicalContainer.style.display = 'none';
      this.currentHistoricalView = null;
      return;
    }
    
    // Set current historical view and display container
    this.currentHistoricalView = statId;
    this.historicalContainer.style.display = 'block';
    
    // Find the stat data
    const stat = this.stats.find(s => s.id === statId);
    
    // Get historical data for this stat
    const historicalData = this.historicalData[statId] || [];
    
    // Render historical view
    this._renderHistoricalView(stat, historicalData);
  }
  
  /**
   * Render historical view for a statistic
   * @param {Object} stat - The statistic object
   * @param {Array} historicalData - Historical data points
   * @private
   */
  _renderHistoricalView(stat, historicalData) {
    if (!stat || !historicalData || historicalData.length === 0) {
      this.historicalContainer.innerHTML = `
        <div class="panel-empty-state">
          <div class="icon">📈</div>
          <div class="message">No historical data available</div>
          <div class="sub-message">Historical data for ${stat ? stat.label : 'this statistic'} is not available.</div>
        </div>
      `;
      return;
    }
    
    // Clear container
    this.historicalContainer.innerHTML = '';
    
    // Create header
    const header = document.createElement('div');
    header.className = 'historical-header';
    header.innerHTML = `
      <h3>${stat.label} - Historical Data</h3>
      <button class="close-btn" aria-label="Close historical view">×</button>
    `;
    
    // Add event listener to close button
    header.querySelector('.close-btn').addEventListener('click', () => {
      this.historicalContainer.style.display = 'none';
      this.currentHistoricalView = null;
    });
    
    // Create chart container
    const chartContainer = document.createElement('div');
    chartContainer.className = 'chart-container';
    
    // Append elements
    this.historicalContainer.appendChild(header);
    this.historicalContainer.appendChild(chartContainer);
    
    // Prepare data for chart
    const chartData = {
      labels: historicalData.map(d => formatDate(d.date)),
      datasets: [{
        label: stat.label,
        data: historicalData.map(d => d.value),
        backgroundColor: 'rgba(52, 152, 219, 0.2)',
        borderColor: 'rgba(52, 152, 219, 1)',
        borderWidth: 2,
        pointRadius: 3,
        tension: 0.4
      }]
    };
    
    // Create chart
    createChart(chartContainer, {
      type: 'line',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              callback: value => stat.format ? stat.format(value) : formatNumber(value)
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: context => {
                const value = context.raw;
                return stat.format ? stat.format(value) : formatNumber(value);
              }
            }
          }
        }
      }
    });
  }
  
  /**
   * Filter stats based on search query and category, then render
   * @private
   */
  _filterAndRenderStats() {
    // Apply filters
    this.filteredStats = this.stats.filter(stat => {
      // Apply category filter
      if (this.currentCategory !== 'all' && stat.category !== this.currentCategory) {
        return false;
      }
      
      // Apply search filter
      if (this.searchQuery) {
        const searchText = (stat.label + ' ' + stat.description).toLowerCase();
        return searchText.includes(this.searchQuery);
      }
      
      return true;
    });
    
    // Set virtual items and render
    this.setVirtualItems(this.filteredStats);
    
    // Update empty state if no results
    if (this.filteredStats.length === 0) {
      const emptyStateEl = document.createElement('div');
      emptyStateEl.className = 'panel-empty-state';
      emptyStateEl.innerHTML = `
        <div class="icon">🔍</div>
        <div class="message">No statistics found</div>
        <div class="sub-message">Try adjusting your search or filter criteria.</div>
      `;
      
      this.contentContainer.appendChild(emptyStateEl);
    }
  }
  
  /**
   * Render a stats item for virtual scrolling
   * @param {Object} stat - The statistic to render
   * @returns {HTMLElement} The rendered item element
   * @override
   */
  renderItem(stat) {
    return this._renderStatsItem(stat);
  }
  
  /**
   * Render a single stats item
   * @param {Object} stat - The statistic to render
   * @returns {HTMLElement} The rendered item element
   * @private
   */
  _renderStatsItem(stat) {
    const itemEl = document.createElement('div');
    itemEl.className = 'stats-item';
    itemEl.dataset.statId = stat.id;
    
    // Format value based on stat type
    let formattedValue = 'N/A';
    if (stat.value !== undefined && stat.value !== null) {
      formattedValue = stat.format ? stat.format(stat.value) : formatNumber(stat.value);
    }
    
    // Create trend indicator if available
    let trendHtml = '';
    if (stat.trend) {
      const trendClass = stat.trend > 0 ? 'trend-up' : (stat.trend < 0 ? 'trend-down' : 'trend-neutral');
      const trendIcon = stat.trend > 0 ? '↑' : (stat.trend < 0 ? '↓' : '→');
      const trendPercentage = formatPercentage(Math.abs(stat.trend));
      
      trendHtml = `
        <div class="trend ${trendClass}">
          <span class="trend-icon">${trendIcon}</span>
          <span class="trend-value">${trendPercentage}</span>
        </div>
      `;
    }
    
    // Determine if historical data is available
    const hasHistorical = this.historicalData[stat.id] && this.historicalData[stat.id].length > 0;
    
    // Create item content
    itemEl.innerHTML = `
      <div class="stats-item-content">
        <div class="stats-item-main">
          <div class="stats-item-info">
            <div class="stats-label">${stat.label}</div>
            <div class="stats-description">${stat.description || ''}</div>
          </div>
          <div class="stats-value-container">
            <div class="stats-value">${formattedValue}</div>
            ${trendHtml}
          </div>
        </div>
        <div class="stats-item-actions">
          ${hasHistorical ? '<button class="history-btn" aria-label="View historical data">📈</button>' : ''}
        </div>
      </div>
    `;
    
    // Add event listener for historical data button
    if (hasHistorical) {
      itemEl.querySelector('.history-btn').addEventListener('click', () => {
        this._handleHistoricalViewToggle(stat.id);
      });
    }
    
    return itemEl;
  }
  
  /**
   * Update the category filter UI
   * @private
   */
  _updateCategoryUI() {
    if (!this.categoryContainer) return;
    
    // Clear container
    this.categoryContainer.innerHTML = '';
    
    // Create "All" category button
    const allBtn = document.createElement('button');
    allBtn.className = 'category-btn' + (this.currentCategory === 'all' ? ' active' : '');
    allBtn.textContent = 'All';
    allBtn.dataset.category = 'all';
    allBtn.addEventListener('click', () => this._handleCategoryChange('all'));
    this.categoryContainer.appendChild(allBtn);
    
    // Create a button for each category
    this.categories.forEach(category => {
      const btn = document.createElement('button');
      btn.className = 'category-btn' + (this.currentCategory === category.id ? ' active' : '');
      btn.textContent = category.label;
      btn.dataset.category = category.id;
      btn.addEventListener('click', () => this._handleCategoryChange(category.id));
      this.categoryContainer.appendChild(btn);
    });
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
      this.stats = Array.isArray(data.stats) ? data.stats : [];
      this.categories = Array.isArray(data.categories) ? data.categories : [];
      this.historicalData = data.historicalData || {};
      
      // Clear historical view if active
      if (this.currentHistoricalView) {
        this.historicalContainer.style.display = 'none';
        this.currentHistoricalView = null;
      }
      
      // Update category UI
      this._updateCategoryUI();
      
      // Filter and render stats
      this._filterAndRenderStats();
      
    } catch (error) {
      console.error('Error rendering stats panel:', error);
      this.setError('Error rendering statistics: ' + error.message);
    }
  }
  
  /**
   * Reset the panel to its initial state
   * @override
   * @returns {StatsPanel} The panel instance
   */
  reset() {
    super.reset();
    
    // Reset stats panel specific state
    this.searchQuery = '';
    this.currentCategory = 'all';
    this.stats = [];
    this.filteredStats = [];
    this.historicalData = {};
    this.currentHistoricalView = null;
    
    // Reset search input
    if (this.searchInput && this.searchInput.querySelector('input')) {
      this.searchInput.querySelector('input').value = '';
    }
    
    // Hide historical container
    if (this.historicalContainer) {
      this.historicalContainer.style.display = 'none';
    }
    
    return this;
  }
}

/**
 * Helper function to create and initialize a stats panel
 * @param {Object} config - Panel configuration
 * @returns {StatsPanel} The initialized stats panel
 */
export function createStatsPanel(config) {
  const panel = new StatsPanel(config);
  return panel.init();
}

export default StatsPanel; 