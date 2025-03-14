/* dataPanels.js - Module for creating and updating data panels in country visualizations */

import { addStatSection, extractStats, highlightText, extractNumber, formatLabel, formatValue, isPrimaryStatistic, escapeRegExp } from './utils.js';
import { appState, countryDataCache, globalDataIndex, countriesList, countryFolders } from './state.js';

// Update all data panels with new data
export function updateDataPanels(data) {
  console.log('Updating data panels with data:', data);
  clearDataPanels();
  try {
    createStatsPanel(data);
    createRankingsPanel(data);
    createComparisonsPanel(data);
    createTrendsPanel(data);
  } catch (error) {
    console.error('Error updating data panels:', error);
    showDataError('Error processing country data: ' + error.message);
  }
}

// Clears previous content from data panels
export function clearDataPanels() {
  const panelElements = document.querySelectorAll('.data-panels .data-panel');
  panelElements.forEach(panelElement => {
    while (panelElement.firstChild) {
      panelElement.removeChild(panelElement.firstChild);
    }
  });
}

// Displays an error message in each data panel
export function showDataError(message) {
  const panelElements = document.querySelectorAll('.data-panels .data-panel');
  panelElements.forEach(panelElement => {
    panelElement.innerHTML = `<div class="data-error">${message}</div>`;
  });
}

// Creates the Stats Panel with country key statistics
export function createStatsPanel(data) {
  const panelElement = document.querySelector('.data-panel[data-panel="0"]');
  if (!panelElement) return;
  if (!data) {
    panelElement.innerHTML = '<div class="data-error">No country data available</div>';
    return;
  }
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

  addStatSection(statsContainer, 'Geography', extractStats(data.Geography));
  addStatSection(statsContainer, 'People & Society', extractStats(data['People and Society']));
  addStatSection(statsContainer, 'Economy', extractStats(data.Economy));
  addStatSection(statsContainer, 'Energy', extractStats(data.Energy));
  addStatSection(statsContainer, 'Military', extractStats(data.Military));
  if (data.Transportation) {
    addStatSection(statsContainer, 'Transportation', extractStats(data.Transportation));
  }
  if (data.Communications) {
    addStatSection(statsContainer, 'Communications', extractStats(data.Communications));
  }

  searchInput.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase().trim();
    filterStats(searchTerm);
  });

  clearButton.addEventListener('click', function() {
    searchInput.value = '';
    filterStats('');
    searchInput.focus();
  });

  function filterStats(searchTerm) {
    let visibleItems = 0;
    const sections = statsContainer.querySelectorAll('.stat-section');
    sections.forEach(section => {
      let sectionHasVisibleItems = false;
      const items = section.querySelectorAll('.stat-item');
      items.forEach(item => {
        const labelElement = item.querySelector('.stat-label');
        const valueElement = item.querySelector('.stat-value');
        const label = labelElement.textContent.toLowerCase();
        const value = valueElement.textContent.toLowerCase();
        if (searchTerm === '' || label.includes(searchTerm) || value.includes(searchTerm)) {
          item.style.display = '';
          sectionHasVisibleItems = true;
          visibleItems++;
          if (searchTerm !== '') {
            highlightText(labelElement, searchTerm);
            highlightText(valueElement, searchTerm);
          } else {
            labelElement.innerHTML = labelElement.textContent;
            valueElement.innerHTML = valueElement.originalHTML || valueElement.innerHTML;
          }
        } else {
          item.style.display = 'none';
          labelElement.innerHTML = labelElement.textContent;
          valueElement.innerHTML = valueElement.originalHTML || valueElement.innerHTML;
        }
      });
      section.style.display = sectionHasVisibleItems ? '' : 'none';
    });
    noResults.style.display = visibleItems === 0 ? 'block' : 'none';
  }
}

// Creates the Rankings Panel
export function createRankingsPanel(data) {
  const panelElement = document.querySelector('.data-panel[data-panel="1"]');
  if (!panelElement) return;
  if (!data) {
    panelElement.innerHTML = '<div class="data-error">No country data available</div>';
    return;
  }
  const countryName = data.Government?.['Country name']?.conventional_short_form?.text || 
                      data.Government?.['Country name']?.text ||
                      data.name ||
                      'Unknown Country';
  const countryCode = data.Government?.['Country name']?.['Country name code']?.text ||
                      data.Communications?.['Internet country code']?.text ||
                      '';

  panelElement.innerHTML = `
    <div class="rankings-controls">
      <div class="rankings-control-row">
        <div class="control-group" style="flex: 1;">
          <select class="ranking-selector" id="ranking-selector">
            <option value="">Choose a metric...</option>
          </select>
        </div>
      </div>
      <div class="rankings-control-row">
        <div class="control-group">
          <select class="ranking-sort" id="ranking-sort">
            <option value="desc">High to Low</option>
            <option value="asc">Low to High</option>
          </select>
        </div>
        <div class="control-group">
          <select class="ranking-filter" id="ranking-filter">
            <option value="all">All Regions</option>
            <option value="africa">Africa</option>
            <option value="americas">Americas</option>
            <option value="asia">Asia</option>
            <option value="europe">Europe</option>
            <option value="oceania">Oceania</option>
          </select>
        </div>
      </div>
    </div>
    <div class="rankings-container">
      <div class="rankings-placeholder">Select a metric to view rankings</div>
    </div>
  `;

  // Find all numeric metrics that could be used for ranking
  const rankingMetrics = findRankingMetrics(data);
  
  // Filter out any non-numeric metrics
  const numericMetrics = rankingMetrics.filter(metric => 
    !isNaN(parseFloat(metric.value)) && isFinite(metric.value)
  );
  
  // Sort metrics alphabetically
  numericMetrics.sort((a, b) => a.label.localeCompare(b.label));
  
  // Populate select options
  const metricSelector = panelElement.querySelector('#ranking-selector');
  numericMetrics.forEach(metric => {
    const option = document.createElement('option');
    option.value = metric.id;
    option.textContent = metric.label;
    metricSelector.appendChild(option);
  });
  
  // Rankings container reference
  const rankingsContainer = panelElement.querySelector('.rankings-container');
  
  // Set the previously selected sort order and region filter
  const sortSelector = panelElement.querySelector('#ranking-sort');
  const filterSelector = panelElement.querySelector('#ranking-filter');
  
  // Set values from app state
  if (appState.rankingSortOrder) {
    sortSelector.value = appState.rankingSortOrder;
  }
  
  if (appState.rankingFilterRegion) {
    filterSelector.value = appState.rankingFilterRegion;
  }
  
  // Handle sort order change
  sortSelector.addEventListener('change', function() {
    appState.rankingSortOrder = this.value;
    
    // Re-render the current ranking with the new sort order
    if (appState.selectedRankingMetric) {
      const selectedMetric = numericMetrics.find(m => m.id === appState.selectedRankingMetric);
      if (selectedMetric) {
        processMetricForAllCountries(selectedMetric, countryCode, rankingsContainer, data);
      }
    }
  });
  
  // Handle region filter change
  filterSelector.addEventListener('change', function() {
    appState.rankingFilterRegion = this.value;
    
    // Re-render the current ranking with the new filter
    if (appState.selectedRankingMetric) {
      const selectedMetric = numericMetrics.find(m => m.id === appState.selectedRankingMetric);
      if (selectedMetric) {
        processMetricForAllCountries(selectedMetric, countryCode, rankingsContainer, data);
      }
    }
  });
  
  // Handle metric selection change
  metricSelector.addEventListener('change', function() {
    const selectedMetricId = this.value;
    if (!selectedMetricId) {
      rankingsContainer.innerHTML = `<div class="rankings-placeholder">Select a metric above to see how this country ranks globally</div>`;
      appState.selectedRankingMetric = null;
      return;
    }
    
    // Store selection in app state
    appState.selectedRankingMetric = selectedMetricId;
    
    // Find the selected metric details
    const selectedMetric = numericMetrics.find(m => m.id === selectedMetricId);
    if (!selectedMetric) return;
    
    // Show loading message
    rankingsContainer.innerHTML = `
      <div class="rankings-loading">
        <div class="loading-spinner"></div>
        <div>Analyzing global ranking data...</div>
      </div>
    `;
    
    // First add this country's metric to the index
    const metrics = {};
    metrics[selectedMetric.id] = selectedMetric.value;
    globalDataIndex.addCountryData(countryName, countryCode, metrics);
    
    // Process all cached country data for this metric
    processMetricForAllCountries(selectedMetric, countryCode, rankingsContainer, data);
  });
  
  // If no metrics available, show a message
  if (numericMetrics.length === 0) {
    metricSelector.innerHTML = '<option value="" disabled selected>No ranking metrics available</option>';
    rankingsContainer.innerHTML = `<div class="rankings-placeholder">No numeric data available for rankings</div>`;
    return;
  }
  
  // Set the previously selected metric if available
  if (appState.selectedRankingMetric) {
    // Check if the previously selected metric is available for this country
    const previousMetric = numericMetrics.find(m => m.id === appState.selectedRankingMetric);
    if (previousMetric) {
      metricSelector.value = appState.selectedRankingMetric;
      // Trigger a change event to update the display
      const event = new Event('change');
      metricSelector.dispatchEvent(event);
    } else {
      // Reset if the previously selected metric isn't available
      appState.selectedRankingMetric = null;
    }
  }
}

// Process a specific metric for all cached countries
function processMetricForAllCountries(selectedMetric, currentCountryCode, container, currentCountryData) {
  console.log(`Processing ${selectedMetric.label} for all countries...`);
  
  // Get country name for display
  const countryName = currentCountryData.Government?.['Country name']?.conventional_short_form?.text || 
                      currentCountryData.Government?.['Country name']?.text ||
                      'Unknown Country';
  
  // Display progress indicator
  const updateAnalysisProgress = (processed, total) => {
    const progressPercent = Math.round((processed / total) * 100);
    container.innerHTML = `
      <div class="rankings-loading">
        <div class="loading-progress">
          <div class="progress-bar" style="width: ${progressPercent}%"></div>
        </div>
        <div>Analyzing country data: ${processed}/${total}</div>
      </div>
    `;
  };
  
  // Count total countries and how many we process
  const totalCountries = Object.keys(countryDataCache).length;
  let processed = 0;
  
  // Count how many countries we added data for
  let countriesWithData = 0;
  
  // First update to show 0 progress
  updateAnalysisProgress(processed, totalCountries);
  
  // For each cached country, extract the metric value
  Object.keys(countryDataCache).forEach(code => {
    // Skip current country as we already added it
    if (code === currentCountryCode) {
      processed++;
      updateAnalysisProgress(processed, totalCountries);
      return;
    }
    
    const countryData = countryDataCache[code];
    const country = countriesList.find(c => c.code === code) || { name: code };
    
    // Extract the metric value based on the path
    const metricValue = extractMetricFromCountry(countryData, selectedMetric.path);
    
    if (metricValue !== null) {
      // Add to global index
      const metrics = {};
      metrics[selectedMetric.id] = metricValue;
      globalDataIndex.addCountryData(country.name, code, metrics);
      countriesWithData++;
    }
    
    // Update progress after each country
    processed++;
    if (processed % 2 === 0 || processed === totalCountries) { // Update every 2 countries to avoid too frequent DOM updates
      updateAnalysisProgress(processed, totalCountries);
    }
  });
  
  console.log(`Added data for ${countriesWithData} countries for metric ${selectedMetric.label}`);
  
  // Display ranking with all the data we've gathered
  setTimeout(() => {
    displayRanking(container, selectedMetric, currentCountryData, countryName);
  }, 500); // Small delay for smoother transition
}

// Function to extract a metric value from country data using a path
function extractMetricFromCountry(countryData, metricPath) {
  if (!countryData || !metricPath || metricPath.length === 0) return null;
  
  let current = countryData;
  // Navigate through the path to find the metric
  for (const key of metricPath) {
    if (!current[key]) return null;
    current = current[key];
  }
  
  if (current && current.text) {
    return extractNumber(current.text);
  }
  
  return null;
}

// Find metrics in country data that could be used for rankings
function findRankingMetrics(data) {
  const metrics = [];
  const processedKeys = new Set(); // To avoid duplicates
  
  // Process main sections like Economy, Geography, etc.
  const processSection = (section, sectionName, path = []) => {
    if (!section || typeof section !== 'object') return;
    
    Object.keys(section).forEach(key => {
      // Skip text property
      if (key === 'text') return;
      
      const value = section[key];
      const currentPath = [...path, key];
      const metricId = `${sectionName.toLowerCase()}_${key.toLowerCase().replace(/\s+/g, '_')}`;
      
      // Skip if we've already processed this key
      if (processedKeys.has(metricId)) return;
      
      // If this is a leaf node with text
      if (value && typeof value === 'object' && value.text) {
        const numericValue = extractNumber(value.text);
        if (!isNaN(numericValue)) {
          metrics.push({
            id: metricId,
            label: `${sectionName}: ${formatLabel(key)}`,
            value: numericValue,
            text: value.text,
            path: currentPath
          });
          processedKeys.add(metricId);
        }
      } else if (value && typeof value === 'object') {
        // Continue recursively
        processSection(value, sectionName, currentPath);
      }
    });
  };
  
  // Process main sections that might have numeric data
  if (data.Economy) processSection(data.Economy, 'Economy');
  if (data.Geography) processSection(data.Geography, 'Geography');
  if (data.People) processSection(data.People, 'People');
  if (data['People and Society']) processSection(data['People and Society'], 'People');
  if (data.Demographics) processSection(data.Demographics, 'Demographics');
  if (data.Energy) processSection(data.Energy, 'Energy');
  if (data.Government) processSection(data.Government, 'Government');
  
  // Filter to ensure we only have numeric metrics
  return metrics.filter(metric => !isNaN(metric.value) && metric.value !== null);
}

// Display ranking with collected data
function displayRanking(container, metric, data, countryName) {
  // Use globalDataIndex to get the ranking for this metric
  const countryCode = data.Government?.['Country name']?.['Country name code']?.text ||
                      data.Communications?.['Internet country code']?.text ||
                      '';
  
  // Get all countries with this metric and determine the ranking
  const countries = globalDataIndex.getCountriesWithMetric(metric.id);
  
  if (!countries || countries.length === 0) {
    container.innerHTML = `<div class="rankings-placeholder">No data available for this metric across countries</div>`;
    return;
  }
  
  // Apply the selected sort order
  const sortOrder = appState.rankingSortOrder || 'desc';
  countries.sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.value - b.value;
    } else {
      return b.value - a.value;
    }
  });
  
  // Determine rank
  let rank = 0;
  let total = 0;
  let countriesAfterFilter = countries;
  
  // Apply region filter if specified
  const regionFilter = appState.rankingFilterRegion || 'all';
  if (regionFilter !== 'all') {
    // This is a simplified filter - in a real app, you'd map country codes to regions
    // Here we're just demonstrating the filter UI functionality
    countriesAfterFilter = countries.filter(country => {
      const code = country.code.toLowerCase();
      // This is very simplified region mapping - would need to be much more comprehensive
      if (regionFilter === 'europe' && 'gbdefriteseuptch'.includes(code)) return true;
      if (regionFilter === 'americas' && 'usmxcabr'.includes(code)) return true;
      if (regionFilter === 'asia' && 'injpcnkr'.includes(code)) return true;
      if (regionFilter === 'africa' && 'zangegsn'.includes(code)) return true;
      if (regionFilter === 'oceania' && 'aunz'.includes(code)) return true;
      return false;
    });
  }
  
  total = countriesAfterFilter.length;
  
  // Find the rank of the current country
  rank = countriesAfterFilter.findIndex(c => c.code === countryCode) + 1;
  if (rank === 0) rank = 'N/A';
  
  // Calculate percentile (higher is better)
  const percentile = rank !== 'N/A' ? Math.round(((total - rank + 1) / total) * 100) : 'N/A';
  
  // Get min and max values for the scale
  const minValue = countriesAfterFilter.length > 0 ? countriesAfterFilter[countriesAfterFilter.length - 1].value : 0;
  const maxValue = countriesAfterFilter.length > 0 ? countriesAfterFilter[0].value : 0;
  
  // Determine the scale position for the selected country
  let scalePosition = 50; // Default to middle
  if (rank !== 'N/A' && maxValue > minValue) {
    const countryValue = metric.value;
    // Calculate position on scale (0-100%)
    scalePosition = Math.round(((countryValue - minValue) / (maxValue - minValue)) * 100);
  }
  
  // Format the ranking information
  let rankHTML = '';
  if (rank !== 'N/A') {
    // Adjust wording based on metric
    let rankingWord = 'highest';
    if (appState.rankingSortOrder === 'asc') {
      rankingWord = 'lowest';
    }
    
    rankHTML = `
      <div class="ranking-position">
        <span class="ranking-number">${rank}</span>
        <span class="ranking-total">/ ${total}</span>
      </div>
      <div class="ranking-scale-container">
        <div class="ranking-scale">
          <div class="ranking-scale-marker" style="left: ${scalePosition}%">
            <div class="ranking-marker-label">
              ${countryName}<br>
              <strong>${formatRankingValue(metric.value, metric)}</strong>
            </div>
          </div>
        </div>
        <div class="ranking-scale-labels">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>
      <div class="ranking-summary">
        ${countryName} ranks <strong>${rank}</strong> out of <strong>${total}</strong> countries (${percentile}th percentile) for ${metric.label.toLowerCase()}.
      </div>
    `;
  } else {
    rankHTML = `
      <div class="ranking-summary">
        Ranking data for ${countryName} is not available for this metric.
      </div>
    `;
  }
  
  // Get neighboring countries for context
  const neighborsHTML = getNeighboringCountriesHTML(countriesAfterFilter, countryCode, rank, metric, countryName);
  
  // Show data coverage indicator
  const coveragePercent = Math.round((total / (countriesList.length || 200)) * 100);
  
  // Build the full ranking display
  container.innerHTML = `
    <div class="ranking-header">
      <h3>${metric.label}</h3>
      <div class="ranking-value">${formatRankingValue(metric.value, metric)}</div>
    </div>
    <div class="ranking-description">${metric.text || ''}</div>
    ${rankHTML}
    <div class="data-coverage">
      <div class="coverage-indicator">
        <div class="coverage-bar" style="width: ${coveragePercent}%"></div>
      </div>
      <div class="coverage-label">Data coverage: ${coveragePercent}% of countries</div>
    </div>
    ${neighborsHTML}
    <div class="full-rankings-section">
      <h4 class="full-rankings-title">Full Rankings</h4>
      <div class="rankings-table-container">
        <table class="rankings-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Country</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            ${countriesAfterFilter.map((country, index) => `
              <tr class="${country.code === countryCode ? 'highlighted-country' : ''}">
                <td>${index + 1}</td>
                <td>${country.name}</td>
                <td>${formatRankingValue(country.value, metric)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// Get neighboring countries for context
function getNeighboringCountriesHTML(countries, currentCountryCode, currentRank, metric, currentCountryName) {
  if (typeof currentRank !== 'number' || countries.length < 3) {
    return '';
  }
  
  // Find index of current country
  const currentIndex = countries.findIndex(c => c.code === currentCountryCode);
  if (currentIndex === -1) return '';
  
  // Get up to 2 countries above and 2 below
  const neighborIndices = [];
  for (let i = Math.max(0, currentIndex - 2); i <= Math.min(countries.length - 1, currentIndex + 2); i++) {
    if (i !== currentIndex) {
      neighborIndices.push(i);
    }
  }
  
  if (neighborIndices.length === 0) return '';
  
  // Create neighbor listing
  return `
    <div class="ranking-neighbors">
      <h4>Neighboring Rankings</h4>
      <ul class="neighbors-list">
        ${neighborIndices.map(i => `
          <li>
            <span class="rank-number">${i + 1}.</span>
            <span class="neighbor-name">${countries[i].name}</span>
            <span class="neighbor-value">${formatRankingValue(countries[i].value, metric)}</span>
          </li>
        `).join('')}
      </ul>
    </div>
  `;
}

// Format the ranking value based on the metric type
function formatRankingValue(value, metric) {
  if (value === undefined || value === null) return 'N/A';
  
  // Try to determine the metric type from its label or path
  const metricLabel = metric.label ? metric.label.toLowerCase() : '';
  const metricId = metric.id ? metric.id.toLowerCase() : '';
  
  // Format population numbers
  if (metricLabel.includes('population') || metricId.includes('population')) {
    return formatPopulation(value);
  }
  
  // Format currency values
  if (metricLabel.includes('gdp') || 
      metricLabel.includes('budget') || 
      metricLabel.includes('revenue') || 
      metricLabel.includes('expenditure') ||
      metricLabel.includes('deficit') ||
      metricLabel.includes('debt') ||
      metricId.includes('gdp') || 
      metricId.includes('budget') || 
      metricId.includes('revenue') || 
      metricId.includes('expenditure') ||
      metricId.includes('deficit') ||
      metricId.includes('debt')) {
    return formatCurrency(value);
  }
  
  // Format area
  if (metricLabel.includes('area') || metricId.includes('area')) {
    return formatArea(value);
  }
  
  // Format percentages
  if (metric.text && metric.text.includes('%')) {
    return formatPercentage(value);
  }
  
  // Default formatting with commas
  return value.toLocaleString();
}

// Formatting helper functions
function formatPopulation(value) {
  if (value >= 1000000000) {
    return (value / 1000000000).toFixed(2) + ' billion';
  } else if (value >= 1000000) {
    return (value / 1000000).toFixed(2) + ' million';
  } else if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'K';
  }
  return value.toLocaleString();
}

function formatCurrency(value) {
  if (value >= 1000000000000) {
    return '$' + (value / 1000000000000).toFixed(2) + ' trillion';
  } else if (value >= 1000000000) {
    return '$' + (value / 1000000000).toFixed(2) + ' billion';
  } else if (value >= 1000000) {
    return '$' + (value / 1000000).toFixed(2) + ' million';
  }
  return '$' + value.toLocaleString();
}

function formatArea(value) {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(2) + ' million sq km';
  } else {
    return value.toLocaleString() + ' sq km';
  }
}

function formatPercentage(value) {
  return value.toFixed(2) + '%';
}

// Creates the Global Context (Comparisons) Panel
export function createComparisonsPanel(data) {
  const panelElement = document.querySelector('.data-panel[data-panel="2"]');
  if (!panelElement) return;
  if (!data) {
    panelElement.innerHTML = '<div class="data-error">No country data available</div>';
    return;
  }
  const countryName = data.Government?.['Country name']?.conventional_short_form?.text || 
                      data.Government?.['Country name']?.text ||
                      'This country';
  const countryCode = data.Government?.['Country name']?.['Country name code']?.text || 
                      data.Communications?.['Internet country code']?.text ||
                      'unknown';
  const metricsForComparison = findComparableMetrics(data);
  if (metricsForComparison.length === 0) {
    panelElement.innerHTML = `
      <div class="data-title">Global Context</div>
      <div class="data-info">Not enough data is available for meaningful comparisons.</div>
      <div class="data-info">Try selecting a different country or wait until more data is loaded.</div>
    `;
    return;
  }
  panelElement.innerHTML = `
    <div class="data-title">Global Context</div>
    <div class="comparisons-description">
      Comparing <strong>${countryName}</strong> to global averages and similar countries.
    </div>
    <div class="comparisons-container"></div>
  `;
  const comparisonsContainer = panelElement.querySelector('.comparisons-container');
  metricsForComparison.forEach(metric => {
    const comparisonElement = createGlobalContextForMetric(metric, countryName, countryCode);
    if (comparisonElement) {
      comparisonsContainer.appendChild(comparisonElement);
    }
  });
}

// Creates the Historical Trends Panel
export function createTrendsPanel(data) {
  const panelElement = document.querySelector('.data-panel[data-panel="3"]');
  if (!panelElement) return;
  if (!data) {
    panelElement.innerHTML = '<div class="data-error">No country data available</div>';
    return;
  }
  const countryName = data.Government?.['Country name']?.conventional_short_form?.text || 
                      data.Government?.['Country name']?.text ||
                      'This country';
  const trendsData = findTrendMetrics(data);
  if (trendsData.length === 0) {
    panelElement.innerHTML = `
      <div class="data-title">Historical Trends</div>
      <div class="data-info">No historical trend data is available for ${countryName}.</div>
      <div class="data-info">This feature requires time-series data which may not be present in the current dataset.</div>
    `;
    return;
  }
  panelElement.innerHTML = `
    <div class="data-title">Historical Trends</div>
    <div class="trends-description">
      Historical data trends for <strong>${countryName}</strong>
    </div>
    <div class="trends-selector-container">
      <label for="trend-selector">Select metric: </label>
      <select class="trend-selector" id="trend-selector">
        <option value="">Choose a metric...</option>
      </select>
    </div>
    <div class="trends-container">
      <div class="trends-placeholder">Select a metric to view historical trends</div>
    </div>
  `;
  const trendSelector = panelElement.querySelector('#trend-selector');
  trendsData.sort((a, b) => a.label.localeCompare(b.label));
  trendsData.forEach(trend => {
    const option = document.createElement('option');
    option.value = trend.id;
    option.textContent = trend.label;
    trendSelector.appendChild(option);
  });
  const trendsContainer = panelElement.querySelector('.trends-container');
  trendSelector.addEventListener('change', function() {
    const selectedId = this.value;
    if (!selectedId) {
      trendsContainer.innerHTML = `<div class="trends-placeholder">Select a metric to view historical trends</div>`;
      return;
    }
    const selectedTrend = trendsData.find(trend => trend.id === selectedId);
    if (selectedTrend) {
      displayTrendData(trendsContainer, selectedTrend);
    } else {
      trendsContainer.innerHTML = `<div class="trends-placeholder">Selected metric not found</div>`;
    }
  });
}

// Find metrics that can be compared across countries
export function findComparableMetrics(data) {
  // TODO: Implement comparison metrics extraction logic
  return [];
}

// Find metrics that show trends over time
export function findTrendMetrics(data) {
  // TODO: Implement trend metrics extraction logic
  return [];
}

// Create a global context visualization for a metric
export function createGlobalContextForMetric(metric, countryName, countryCode) {
  const element = document.createElement('div');
  element.className = 'context-item';
  // TODO: Build detailed global context visualization for the metric
  element.innerHTML = `<div class="context-header"><div class="context-metric">${metric.label}</div></div>`;
  return element;
}

// Display a trend visualization for time-series data
export function displayTrendData(container, trendData) {
  if (!trendData || !trendData.dataPoints || trendData.dataPoints.length < 2) {
    container.innerHTML = '<div class="trends-placeholder">No valid trend data available for this metric</div>';
    return;
  }
  // Simplified trend visualization rendering (placeholder)
  container.innerHTML = `<div class="trend-visualization">Trend data for ${trendData.label}</div>`;
} 