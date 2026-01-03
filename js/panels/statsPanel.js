/**
 * statsPanel.js - Module for creating and managing the Stats panel
 * Handles displaying statistical data in an organized, searchable interface
 * Also incorporates historical data visualization (originally from Trends tab)
 */

import { addStatSection, extractStats, highlightText, extractNumber, formatLabel, formatValue } from '../utils.js';
import { detectTimeSeriesData, processText } from '../utils/dataFetcher.js';
import { appState, globalDataIndex } from '../state.js';

// Function to add a stat section with rankings
function addStatSectionWithRankings(container, title, stats, countryCode) {
  if (!stats || stats.length === 0) return;

  // Add rankings to stats
  const statsWithRankings = stats.map(stat => {
    if (stat.numericValue !== null && stat.numericValue !== undefined) {
      // Create a metric ID for this stat
      const metricId = `${title.toLowerCase()}_${stat.label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}`;

      // Get ranking from global data index
      const ranking = globalDataIndex.getRanking(metricId, countryCode, stat.numericValue);

      return {
        ...stat,
        ranking: ranking && ranking.rank > 0 ? ranking.rank : null
      };
    }
    return stat;
  });

  // Use the existing addStatSection function with enhanced stats
  addStatSection(container, title, statsWithRankings);
}

// Main export - creates/updates the Stats panel with country data
export function createStatsPanel(data) {
  const panelElement = document.querySelector('.data-panel[data-panel="0"]');
  if (!panelElement) return;

  if (!data) {
    panelElement.innerHTML = '<div class="data-error">No country data available</div>';
    return;
  }

  // Get country code for rankings
  const countryCode = data.Government?.['Country name']?.['Country name code']?.text ||
                      data.Communications?.['Internet country code']?.text || '';

  // Create the basic panel structure
  panelElement.innerHTML = `
    <div class="stats-search-container">
      <input type="text" class="stats-search" placeholder="Search statistics..." />
      <button class="stats-search-clear" title="Clear search">×</button>
    </div>
    <div class="stats-container"></div>
    <div class="stats-no-results" style="display: none;">No statistics found matching your search</div>
  `;

  const statsContainer = panelElement.querySelector('.stats-container');
  const searchInput = panelElement.querySelector('.stats-search');
  const clearButton = panelElement.querySelector('.stats-search-clear');
  const noResults = panelElement.querySelector('.stats-no-results');

  // Add stats sections with rankings
  addStatSectionWithRankings(statsContainer, 'People', extractStats(data['People and Society']), countryCode);
  addStatSectionWithRankings(statsContainer, 'Transportation', extractStats(data.Transportation), countryCode);
  addStatSectionWithRankings(statsContainer, 'Communications', extractStats(data.Communications), countryCode);
  addStatSectionWithRankings(statsContainer, 'Economy', extractStats(data.Economy), countryCode);
  addStatSectionWithRankings(statsContainer, 'Energy', extractStats(data.Energy), countryCode);
  addStatSectionWithRankings(statsContainer, 'Environment', extractStats(data.Environment), countryCode);
  addStatSectionWithRankings(statsContainer, 'Government', extractStats(data.Government), countryCode);
  addStatSectionWithRankings(statsContainer, 'Space', extractStats(data.Space), countryCode);
  addStatSectionWithRankings(statsContainer, 'Geography', extractStats(data.Geography), countryCode);
  addStatSectionWithRankings(statsContainer, 'Military and Security', extractStats(data['Military and Security']), countryCode);
  addStatSectionWithRankings(statsContainer, 'Terrorism', extractStats(data.Terrorism), countryCode);
  addStatSectionWithRankings(statsContainer, 'Transnational Issues', extractStats(data['Transnational Issues']), countryCode);

  // Set up search functionality
  setupSearchFunctionality(searchInput, clearButton, noResults, statsContainer);

  // Check if the Stats tab has been enhanced
  if (appState.statsTabEnhanced) {
    enhanceWithHistoricalView(statsContainer, data);
  }
}

// Set up search functionality within the Stats panel
function setupSearchFunctionality(searchInput, clearButton, noResults, statsContainer) {
  const searchContainer = searchInput.closest('.stats-search-container');
  
  searchInput.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase().trim();
    filterStats(searchTerm, statsContainer, noResults);
  });

  clearButton.addEventListener('click', function() {
    searchInput.value = '';
    filterStats('', statsContainer, noResults);
    searchInput.focus();
  });
  
  // when scrolling, remove the parent's top padding so the sticky search bar touches the top
  const panelElement = searchContainer.closest('.data-panel');
  if (panelElement) {
    panelElement.addEventListener('scroll', function() {
      if (this.scrollTop > 10) {
        searchContainer.classList.add('scrolled');
        this.classList.add('scrolled');
      } else {
        searchContainer.classList.remove('scrolled');
        this.classList.remove('scrolled');
      }
    });
  }
}

// Filter statistics based on search term
function filterStats(searchTerm, statsContainer, noResults) {
  let visibleItems = 0;
  const sections = statsContainer.querySelectorAll('.stat-section');

  sections.forEach(section => {
    let sectionHasVisibleItems = false;
    const items = section.querySelectorAll('.stat-item');

    items.forEach(item => {
    const labelElement = item.querySelector('.stat-title-text') || item.querySelector('.stat-label');
    const valueElement = item.querySelector('.stat-data') || item.querySelector('.stat-value');
    const rankingElement = item.querySelector('.stat-ranking');

      if (!labelElement || !valueElement) return;

      const label = labelElement.textContent.toLowerCase();
      const value = valueElement.textContent.toLowerCase();
      const ranking = rankingElement ? rankingElement.textContent.toLowerCase() : '';

      if (searchTerm === '' || label.includes(searchTerm) || value.includes(searchTerm) || ranking.includes(searchTerm)) {
        item.style.display = '';
        sectionHasVisibleItems = true;
        visibleItems++;

        if (searchTerm !== '') {
          highlightText(labelElement, searchTerm);
          highlightText(valueElement, searchTerm);
          if (rankingElement) highlightText(rankingElement, searchTerm);
        } else {
          labelElement.innerHTML = labelElement.textContent;
          valueElement.innerHTML = valueElement.originalHTML || valueElement.innerHTML;
          if (rankingElement) rankingElement.innerHTML = rankingElement.textContent;
        }
      } else {
        item.style.display = 'none';
        labelElement.innerHTML = labelElement.textContent;
        valueElement.innerHTML = valueElement.originalHTML || valueElement.innerHTML;
        if (rankingElement) rankingElement.innerHTML = rankingElement.textContent;
      }
    });

    section.style.display = sectionHasVisibleItems ? '' : 'none';
  });

  noResults.style.display = visibleItems === 0 ? 'block' : 'none';
}

// Enhance Stats Panel with Current/Historical views
export function enhanceStatsTab(container, countryData) {
  // Mark the Stats tab as enhanced
  appState.statsTabEnhanced = true;
  
  // Get container
  const statsContainer = container || document.querySelector('.stats-container');
  if (!statsContainer) return;
  
  // Create tabs for Current and Historical views
  const viewTabs = document.createElement('div');

  // Add the tabs to the container
  statsContainer.prepend(viewTabs);
  
  // Wrap existing content in a div for toggling
  const existingContent = Array.from(statsContainer.children)
    .filter(el => !el.classList.contains('stats-view-tabs'));
  
  const currentViewContent = document.createElement('div');
  currentViewContent.className = 'stats-view current-view active';
  
  // Move existing content into the current view
  existingContent.forEach(el => currentViewContent.appendChild(el));
  
  // Create historical view content
  const historicalViewContent = document.createElement('div');
  historicalViewContent.className = 'stats-view historical-view';
  historicalViewContent.innerHTML = '<div class="loading-indicator">Loading historical data...</div>';
  
  // Add both views to the container
  statsContainer.appendChild(currentViewContent);
  statsContainer.appendChild(historicalViewContent);
  
  // Add event listeners for tabs
  viewTabs.querySelectorAll('.stats-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      // Update active state
      viewTabs.querySelectorAll('.stats-tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      
      // Update view based on selection
      const view = this.dataset.view;
      updateStatsView(view, statsContainer, countryData);
    });
  });
  
  // Initialize historical view if country data is available
  if (countryData) {
    populateHistoricalView(historicalViewContent, countryData);
  }
}

// Update the active view in Stats panel
function updateStatsView(view, container, countryData) {
  const currentView = container.querySelector('.current-view');
  const historicalView = container.querySelector('.historical-view');
  
  if (view === 'current') {
    currentView.classList.add('active');
    historicalView.classList.remove('active');
  } else {
    currentView.classList.remove('active');
    historicalView.classList.add('active');
    
    // Ensure historical data is populated
    if (historicalView.querySelector('.loading-indicator') && countryData) {
      populateHistoricalView(historicalView, countryData);
    }
  }
}

// Enhance the Stats panel with historical view
function enhanceWithHistoricalView(statsContainer, countryData) {
  // Check if tabs already exist
  if (statsContainer.querySelector('.stats-view-tabs')) {
    // Just update the historical view
    const historicalView = statsContainer.querySelector('.historical-view');
    if (historicalView) {
      populateHistoricalView(historicalView, countryData);
    }
  } else {
    // Initial setup
    enhanceStatsTab(statsContainer, countryData);
  }
}

// Populate the historical view with time-series data
function populateHistoricalView(container, countryData) {
  // Detect time-series data
  const timeSeriesData = detectTimeSeriesData(countryData);
  
  if (!timeSeriesData || timeSeriesData.length === 0) {
    container.innerHTML = `
      <div class="no-historical-data">
        <p>No historical data is available for this country.</p>
        <p>Historical data requires time-series information which may not be present in the current dataset.</p>
      </div>
    `;
    return;
  }
  
  // Sort time series by name
  timeSeriesData.sort((a, b) => a.name.localeCompare(b.name));
  
  // Create content for historical view
  container.innerHTML = `
    <div class="historical-data-selector">
      <label for="historical-metric-selector">Select historical metric: </label>
      <select id="historical-metric-selector">
        <option value="">Choose a metric...</option>
        ${timeSeriesData.map(series => 
          `<option value="${series.path}">${formatLabel(series.name)}</option>`
        ).join('')}
      </select>
    </div>
    <div class="historical-visualization-container">
      <div class="select-prompt">Please select a metric to view historical trends</div>
    </div>
  `;
  
  // Add event listener to selector
  const selector = container.querySelector('#historical-metric-selector');
  selector.addEventListener('change', function() {
    const selectedPath = this.value;
    if (!selectedPath) {
      container.querySelector('.historical-visualization-container').innerHTML = 
        '<div class="select-prompt">Please select a metric to view historical trends</div>';
      return;
    }
    
    // Find selected time series
    const selectedSeries = timeSeriesData.find(series => series.path === selectedPath);
    if (selectedSeries) {
      displayHistoricalVisualization(
        container.querySelector('.historical-visualization-container'), 
        selectedSeries
      );
    }
  });
}

// Display a visualization for historical data
function displayHistoricalVisualization(container, seriesData) {
  // Extract years and values
  const years = Object.keys(seriesData.years).sort();
  const values = years.map(year => {
    const rawValue = seriesData.years[year];
    return {
      year,
      rawValue,
      value: extractNumber(rawValue)
    };
  }).filter(item => !isNaN(item.value));
  
  if (values.length < 2) {
    container.innerHTML = `
      <div class="visualization-error">
        Insufficient data points to generate a visualization.
      </div>
    `;
    return;
  }
  
  // Calculate trend
  const firstValue = values[0].value;
  const lastValue = values[values.length - 1].value;
  const changePct = ((lastValue - firstValue) / Math.abs(firstValue)) * 100;
  const trend = changePct > 0 ? 'increasing' : changePct < 0 ? 'decreasing' : 'stable';
  const trendClass = trend === 'increasing' ? 'trend-up' : trend === 'decreasing' ? 'trend-down' : 'trend-stable';
  
  // Create HTML for visualization
  container.innerHTML = `
    <div class="historical-visualization">
      <div class="trend-summary ${trendClass}">
        <span class="trend-label">Trend:</span>
        <span class="trend-value">${trend}</span>
        <span class="trend-percentage">${Math.abs(changePct).toFixed(1)}%</span>
        <span class="trend-direction">${changePct >= 0 ? '↑' : '↓'}</span>
      </div>
      <div class="trend-chart">
        <svg class="line-chart" width="100%" height="200"></svg>
      </div>
      <div class="trend-data-table">
        <table>
          <thead>
            <tr>
              <th>Year</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            ${values.map(item => `
              <tr>
                <td>${item.year}</td>
                <td>${item.rawValue}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
  
  // Create D3 line chart
  createLineChart(
    container.querySelector('.line-chart'),
    values.map(v => ({ year: v.year, value: v.value })),
    trendClass
  );
}

// Create a line chart using D3
function createLineChart(svgElement, data, trendClass) {
  // Check for D3
  if (!window.d3) {
    console.error('D3.js is required for charts');
    return;
  }
  
  const d3 = window.d3;
  const svg = d3.select(svgElement);
  const width = parseInt(svg.style('width')) || 400;
  const height = parseInt(svg.style('height')) || 200;
  const margin = { top: 20, right: 20, bottom: 30, left: 50 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  
  // Clear any existing content
  svg.selectAll('*').remove();
  
  // Create chart group
  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);
  
  // Create scales
  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => +d.year))
    .range([0, chartWidth]);
  
  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value) * 1.1])
    .range([chartHeight, 0]);
  
  // Create line generator
  const line = d3.line()
    .x(d => x(+d.year))
    .y(d => y(d.value))
    .curve(d3.curveMonotoneX); // This helps create a smoother line
  
  // Add X axis
  g.append('g')
    .attr('transform', `translate(0,${chartHeight})`)
    .call(d3.axisBottom(x).tickFormat(d3.format('d')).ticks(data.length));
  
  // Add Y axis
  g.append('g')
    .call(d3.axisLeft(y));
  
  // Add grid lines
  g.append('g')
    .attr('class', 'grid')
    .call(d3.axisLeft(y)
      .tickSize(-chartWidth)
      .tickFormat('')
    );
  
  // Add the line path
  g.append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', trendClass === 'trend-up' ? '#28a745' : trendClass === 'trend-down' ? '#dc3545' : '#6c757d')
    .attr('stroke-width', 2)
    .attr('d', line);
  
  // Add data points
  g.selectAll('.data-point')
    .data(data)
    .enter()
    .append('circle')
    .attr('class', 'data-point')
    .attr('cx', d => x(+d.year))
    .attr('cy', d => y(d.value))
    .attr('r', 4)
    .attr('fill', '#fff')
    .attr('stroke', trendClass === 'trend-up' ? '#28a745' : trendClass === 'trend-down' ? '#dc3545' : '#6c757d')
    .attr('stroke-width', 2);
} 