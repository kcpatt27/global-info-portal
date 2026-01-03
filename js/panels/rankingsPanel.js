/**
 * rankingsPanel.js - Module for creating and managing the Rankings panel
 * Handles displaying country rankings data with global and regional comparison views
 * Incorporates global context functionality (formerly a separate tab)
 */

import { extractNumber, formatLabel, formatValue, highlightText, escapeRegExp } from '../utils.js';
import { appState, countryDataCache, globalDataIndex, countriesList, countryFolders } from '../state.js';

// Main export - creates/updates the Rankings panel with country data
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

  // Set up basic panel structure
  panelElement.innerHTML = `
    <div class="rankings-controls">
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
    <div class="metrics-grid-container">
      <div class="metrics-grid" id="metrics-grid">
        <!-- Metric cards will be inserted here -->
      </div>
    </div>
    <div class="rankings-container">
      <div class="rankings-placeholder">Select a metric above to view rankings</div>
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
  
  // Create metric cards grid
  const metricsGrid = panelElement.querySelector('#metrics-grid');
  
  // Create cards first with placeholder rankings
  const metricCards = [];
  numericMetrics.forEach(metric => {
    const card = document.createElement('div');
    card.className = 'metric-card';
    card.dataset.metricId = metric.id;
    const rankElement = document.createElement('div');
    rankElement.className = 'metric-card-rank';
    rankElement.textContent = '…'; // Loading indicator
    card.appendChild(rankElement);
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'metric-card-content';
    contentDiv.innerHTML = `
      <div class="metric-card-label">${metric.label.split(':').pop().trim()}</div>
      <div class="metric-card-value">${formatValue(metric.text)}</div>
    `;
    card.appendChild(contentDiv);
    
    const arrowDiv = document.createElement('div');
    arrowDiv.className = 'metric-card-arrow';
    arrowDiv.innerHTML = '<i class="fas fa-chevron-right"></i>';
    card.appendChild(arrowDiv);
    
    metricsGrid.appendChild(card);
    metricCards.push({ card, rankElement, metric });
  });
  
  // Process all cached countries for all metrics to get accurate rankings
  const processAllMetricsForRankings = async () => {
    // First, add current country's metrics to the index
    numericMetrics.forEach(metric => {
      const metrics = {};
      metrics[metric.id] = metric.value;
      globalDataIndex.addCountryData(countryName, countryCode, metrics);
    });
    
    // Get all cached country codes
    const cachedCodes = Object.keys(countryDataCache);
    const totalCountries = cachedCodes.length;
    let processed = 0;
    
    // Process all cached countries for each metric
    for (const code of cachedCodes) {
      if (code === countryCode) {
        processed++;
        continue; // Skip current country (already added)
      }
      
      const countryData = countryDataCache[code];
      if (!countryData) {
        processed++;
        continue;
      }
      
      const country = countriesList.find(c => c.code === code) || { name: code };
      
      // Extract all metrics for this country
      numericMetrics.forEach(metric => {
        const metricValue = extractMetricFromCountry(countryData, metric.path);
        if (metricValue !== null) {
          const metrics = {};
          metrics[metric.id] = metricValue;
          globalDataIndex.addCountryData(country.name, code, metrics);
        }
      });
      
      processed++;
      
      // Update rankings periodically (every 5 countries or at the end)
      if (processed % 5 === 0 || processed === totalCountries) {
        // Update all card rankings
        metricCards.forEach(({ rankElement, metric }) => {
          const ranking = globalDataIndex.getRanking(metric.id, countryCode, metric.value);
          if (ranking && ranking.total > 0 && ranking.rank > 0) {
            rankElement.textContent = `#${ranking.rank}`;
          } else {
            rankElement.textContent = '—';
          }
        });
        
        // Small delay to allow UI to update
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
    
    // Final update of all rankings
    metricCards.forEach(({ rankElement, metric }) => {
      const ranking = globalDataIndex.getRanking(metric.id, countryCode, metric.value);
      if (ranking && ranking.total > 0 && ranking.rank > 0) {
        rankElement.textContent = `#${ranking.rank}`;
      } else {
        rankElement.textContent = '—';
      }
    });
  };
  
  // Process all metrics asynchronously
  processAllMetricsForRankings();
  
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
  
  // Handle metric card clicks
  const allMetricCards = panelElement.querySelectorAll('.metric-card');
  allMetricCards.forEach(card => {
    card.addEventListener('click', function() {
      const selectedMetricId = this.dataset.metricId;
      
      // Update active state
      allMetricCards.forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      
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
  });
  
  // If no metrics available, show a message
  if (numericMetrics.length === 0) {
    metricsGrid.innerHTML = '<div class="rankings-placeholder">No ranking metrics available</div>';
    rankingsContainer.innerHTML = `<div class="rankings-placeholder">No numeric data available for rankings</div>`;
    return;
  }
  
  // Set the previously selected metric if available
  if (appState.selectedRankingMetric) {
    // Check if the previously selected metric is available for this country
    const previousMetric = numericMetrics.find(m => m.id === appState.selectedRankingMetric);
    if (previousMetric) {
      const previousCard = panelElement.querySelector(`.metric-card[data-metric-id="${appState.selectedRankingMetric}"]`);
      if (previousCard) {
        previousCard.classList.add('active');
        // Trigger click to load the ranking
        previousCard.click();
      }
    } else {
      // Reset if the previously selected metric isn't available
      appState.selectedRankingMetric = null;
    }
  }
  
  // Check if the Rankings tab should be enhanced (separate views for global and regional)
  if (appState.rankingsTabEnhanced) {
    enhanceRankingsTab(rankingsContainer, data);
  }
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
        // Only include if it's a valid number AND not just text-only data
        // Filter out things like "Agricultural Products" which are lists of items
        if (!isNaN(numericValue) && numericValue !== null) {
          // Additional check: skip if the text is primarily a list/description
          const textLower = value.text.toLowerCase();
          const keyLower = key.toLowerCase();
          
          // Skip text-only fields
          const isTextOnly = 
            textLower.includes('note:') || 
            textLower.includes('top ten') ||
            textLower.includes('includes') ||
            textLower.includes('the following') ||
            keyLower.includes('products') ||
            keyLower.includes('commodities') ||
            keyLower.includes('partners') ||
            keyLower.includes('exchange rates') || // Exchange rates are descriptive
            (textLower.split(',').length > 5 && !textLower.match(/\d/)) || // Many commas but no numbers = likely a list
            (textLower.length > 200 && !textLower.match(/\d/)); // Very long text without numbers
          
          // Also check if the extracted number is just a year or small number that's likely not the main metric
          // (e.g., "2024 est." would extract 2024, but that's not the metric value)
          const isLikelyYear = numericValue >= 1900 && numericValue <= 2100 && 
                              textLower.match(/\d{4}\s*(est\.?|$)/);
          
          if (!isTextOnly && !isLikelyYear) {
            metrics.push({
              id: metricId,
              label: `${sectionName}: ${formatLabel(key)}`,
              value: numericValue,
              text: value.text,
              path: currentPath
            });
            processedKeys.add(metricId);
          }
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
  
  // Get top 5 countries for quick stats
  const topCountries = countriesAfterFilter.slice(0, 5);
  const quickStatsHTML = topCountries.length > 0 ? `
    <div class="quick-rankings-stats">
      <h4 class="quick-rankings-title">Top ${topCountries.length} Rankings</h4>
      <div class="quick-rankings-grid">
        ${topCountries.map((country, idx) => `
          <div class="quick-ranking-card ${country.code === countryCode ? 'current-country' : ''}">
            <div class="quick-ranking-rank">#${idx + 1}</div>
            <div class="quick-ranking-name">${country.name}</div>
            <div class="quick-ranking-value">${formatRankingValue(country.value, metric)}</div>
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';
  
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
    ${quickStatsHTML}
    <div class="data-coverage">
      <div class="coverage-indicator">
        <div class="coverage-bar" style="width: ${coveragePercent}%"></div>
      </div>
      <div class="coverage-label">Data coverage: ${coveragePercent}% of countries</div>
    </div>
    ${neighborsHTML}
    <div class="full-rankings-section">
      <h4 class="full-rankings-title">Full Rankings</h4>
      <div class="rankings-list-container">
        ${countriesAfterFilter.map((country, index) => {
          const formattedValue = formatRankingValue(country.value, metric);
          // Determine if this is "long text" that should be left-aligned
          const isLongText = formattedValue.length > 15 || formattedValue.includes(' ') || formattedValue.includes(',');
          return `
            <div class="ranking-item ${country.code === countryCode ? 'highlighted-country' : ''}">
              <div class="ranking-item-header">
                <div class="ranking-item-title">${country.name}</div>
                <div class="ranking-item-rank">#${index + 1}</div>
              </div>
              <div class="ranking-item-data" data-long-text="${isLongText}">${formattedValue}</div>
            </div>
          `;
        }).join('')}
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

// Enhance Rankings Panel with Global/Regional views
export function enhanceRankingsTab(container, countryData) {
  // Mark the Rankings tab as enhanced
  appState.rankingsTabEnhanced = true;
  
  // Get container
  const rankingsContainer = container || document.querySelector('.rankings-container');
  if (!rankingsContainer) return;
  
  // Create toggle for view modes
  const viewToggle = document.createElement('div');
  viewToggle.className = 'view-toggle';
  viewToggle.innerHTML = `
    <button class="toggle-btn active" data-view="global">Compare with World</button>
    <button class="toggle-btn" data-view="region">Compare with Region</button>
  `;
  
  // Add the toggle to the container
  rankingsContainer.prepend(viewToggle);
  
  // Wrap existing content in a div for toggling
  const existingContent = Array.from(rankingsContainer.children)
    .filter(el => !el.classList.contains('view-toggle'));
  
  const globalViewContent = document.createElement('div');
  globalViewContent.className = 'rankings-view global-view active';
  
  // Move existing content into the global view
  existingContent.forEach(el => globalViewContent.appendChild(el));
  
  // Create regional view content
  const regionalViewContent = document.createElement('div');
  regionalViewContent.className = 'rankings-view regional-view';
  
  // Initialize with a placeholder
  regionalViewContent.innerHTML = `
    <div class="regional-comparison-placeholder">
      <p>Select a metric above to view regional comparisons</p>
    </div>
  `;
  
  // Add both views to the container
  rankingsContainer.appendChild(globalViewContent);
  rankingsContainer.appendChild(regionalViewContent);
  
  // Add event listeners for toggle
  viewToggle.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      // Update active state
      viewToggle.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      
      // Update view based on selection
      const view = this.dataset.view;
      updateRankingsView(view, rankingsContainer, countryData);
    });
  });
  
  // Initialize regional view if country data and ranking metric are available
  if (countryData && appState.selectedRankingMetric) {
    populateRegionalView(regionalViewContent, countryData);
  }
}

// Update the active view in Rankings panel
function updateRankingsView(view, container, countryData) {
  const globalView = container.querySelector('.global-view');
  const regionalView = container.querySelector('.regional-view');
  
  if (view === 'global') {
    globalView.classList.add('active');
    regionalView.classList.remove('active');
  } else {
    globalView.classList.remove('active');
    regionalView.classList.add('active');
    
    // Ensure regional data is populated
    if (regionalView.querySelector('.regional-comparison-placeholder') && countryData && appState.selectedRankingMetric) {
      populateRegionalView(regionalView, countryData);
    }
  }
}

// Populate the regional view with comparison data
function populateRegionalView(container, countryData) {
  if (!appState.selectedRankingMetric) {
    container.innerHTML = `
      <div class="regional-comparison-placeholder">
        <p>Select a metric above to view regional comparisons</p>
      </div>
    `;
    return;
  }
  
  const countryName = countryData.Government?.['Country name']?.conventional_short_form?.text || 
                      countryData.Government?.['Country name']?.text ||
                      'This country';
                      
  const region = countryData.Geography?.Location?.text || 
                countryData.Geography?.['Map references']?.text ||
                'Unknown region';
                
  // Create regional comparison UI (this is a placeholder - implement actual comparison logic)
  container.innerHTML = `
    <div class="regional-comparison">
      <h3>Regional Comparison: ${region}</h3>
      <p>Comparing ${countryName} with other countries in ${region}.</p>
      <div class="regional-visualization">
        <!-- Insert regional comparison visualization here -->
        <div class="chart-placeholder">Regional comparison chart will appear here</div>
      </div>
      <div class="regional-analysis">
        <h4>Regional Analysis</h4>
        <p>Analysis of how ${countryName} compares to other countries in its region for the selected metric.</p>
        <p>This feature is currently in development. Check back soon for complete regional comparisons!</p>
      </div>
    </div>
  `;
  
  // TODO: Implement actual regional comparison visualization
}

// This function would be called from the main application to enhance the Rankings tab
export function initRankingsPanel() {
  // Initialize the Rankings panel enhancements if needed
  const rankingsContainer = document.querySelector('.rankings-container');
  if (rankingsContainer && !appState.rankingsTabEnhanced) {
    enhanceRankingsTab(rankingsContainer);
  }
} 