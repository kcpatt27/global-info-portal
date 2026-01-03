/**
 * rankingsPanel.js - Module for creating and managing the Rankings panel
 * Handles displaying country rankings data with global and regional comparison views
 * Incorporates global context functionality (formerly a separate tab)
 */

import { extractNumber, formatLabel, formatValue, highlightText, escapeRegExp } from '../utils.js';
import { appState, countryDataCache, globalDataIndex, countriesList, countryFolders } from '../state.js';
import { fipsToIso } from '../utils/countryCodeMap.js';
import { calculateInfluenceScale, calculateCategoryScore } from '../utils/leaderboardScoring.js';

/**
 * Normalize country code from FIPS to ISO format
 * This ensures rankings lookups work correctly
 * @param {string} code - Country code (may be FIPS or ISO)
 * @param {string} countryName - Country name for fallback matching
 * @returns {string} - Normalized ISO code
 */
function normalizeCountryCode(code, countryName) {
  if (!code) return '';
  const lower = code.toLowerCase();
  
  // Check FIPS to ISO mapping first
  if (fipsToIso[lower]) {
    return fipsToIso[lower];
  }
  
  // Handle known anomalies
  const anomalies = {
    'uk': 'gb',
    'el': 'gr',
    'tp': 'tl',
    'bu': 'mm',
    'zr': 'cd',
    'fx': 'fr',
    'cs': 'rs'
  };
  
  if (anomalies[lower]) {
    return anomalies[lower];
  }
  
  // If it's already a valid 2-letter code, return it
  if (/^[a-z]{2}$/.test(lower)) {
    return lower;
  }
  
  return lower;
}

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
  const rawCountryCode = data.Government?.['Country name']?.['Country name code']?.text ||
                         data.Communications?.['Internet country code']?.text ||
                         '';
  // Normalize country code to ensure it matches the format used in globalDataIndex
  const countryCode = normalizeCountryCode(rawCountryCode, countryName);

  // Set up basic panel structure
  panelElement.innerHTML = `
    <div class="global-leaderboard-container" id="global-leaderboard-container">
      <!-- Global Leaderboard will be inserted here -->
    </div>
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
    <div class="rankings-container" style="display: none;">
      <!-- Ranking display removed per user request -->
    </div>
  `;

  // Create and display Global Leaderboard
  createGlobalLeaderboard(panelElement.querySelector('#global-leaderboard-container'), countryCode);

  // Find all numeric metrics that could be used for ranking
  const rankingMetrics = findRankingMetrics(data);
  
  // Filter out any non-numeric metrics
  const numericMetrics = rankingMetrics.filter(metric => 
    !isNaN(parseFloat(metric.value)) && isFinite(metric.value)
  );
  
  // Separate key metrics from all metrics
  const { keyMetrics, otherMetrics } = separateKeyMetrics(numericMetrics);
  
  // Sort key metrics by priority, other metrics alphabetically
  keyMetrics.sort((a, b) => getKeyMetricPriority(a) - getKeyMetricPriority(b));
  otherMetrics.sort((a, b) => a.label.localeCompare(b.label));
  
  // Create metric cards grid
  const metricsGrid = panelElement.querySelector('#metrics-grid');
  
  // Create section for key metrics
  if (keyMetrics.length > 0) {
    const keyMetricsSection = document.createElement('div');
    keyMetricsSection.className = 'key-metrics-section';
    keyMetricsSection.innerHTML = `
      <h3 class="metrics-section-title">Key Metrics</h3>
      <div class="key-metrics-grid" id="key-metrics-grid"></div>
    `;
    metricsGrid.appendChild(keyMetricsSection);
  }
  
  // Create section for all other metrics (collapsible)
  if (otherMetrics.length > 0) {
    const otherMetricsSection = document.createElement('div');
    otherMetricsSection.className = 'other-metrics-section';
    otherMetricsSection.innerHTML = `
      <div class="metrics-section-header">
        <h3 class="metrics-section-title">All Metrics</h3>
        <button class="toggle-metrics-btn" id="toggle-other-metrics">
          <i class="fas fa-chevron-down"></i>
          <span>Show All</span>
        </button>
      </div>
      <div class="other-metrics-grid collapsed" id="other-metrics-grid"></div>
    `;
    metricsGrid.appendChild(otherMetricsSection);
    
    // Add toggle functionality
    const toggleBtn = otherMetricsSection.querySelector('#toggle-other-metrics');
    const otherMetricsGrid = otherMetricsSection.querySelector('#other-metrics-grid');
    toggleBtn.addEventListener('click', function() {
      otherMetricsGrid.classList.toggle('collapsed');
      const icon = this.querySelector('i');
      const span = this.querySelector('span');
      if (otherMetricsGrid.classList.contains('collapsed')) {
        icon.className = 'fas fa-chevron-down';
        span.textContent = 'Show All';
      } else {
        icon.className = 'fas fa-chevron-up';
        span.textContent = 'Hide';
      }
    });
  }
  
  // Create cards first with placeholder rankings
  const metricCards = [];
  
  // Create cards for key metrics
  const keyMetricsGrid = panelElement.querySelector('#key-metrics-grid');
  if (keyMetricsGrid) {
    keyMetrics.forEach(metric => {
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
    
      keyMetricsGrid.appendChild(card);
      metricCards.push({ card, rankElement, metric });
    });
  }
  
  // Create cards for other metrics
  const otherMetricsGrid = panelElement.querySelector('#other-metrics-grid');
  if (otherMetricsGrid) {
    otherMetrics.forEach(metric => {
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
      
      otherMetricsGrid.appendChild(card);
      metricCards.push({ card, rankElement, metric });
    });
  }
  
  // Process all cached countries for all metrics to get accurate rankings
  const processAllMetricsForRankings = async () => {
    // First, add current country's metrics to the index
    // Normalize country code to ensure consistency
    const normalizedCodeForInit = normalizeCountryCode(countryCode, countryName);
    numericMetrics.forEach(metric => {
      const metrics = {};
      metrics[metric.id] = metric.value;
      globalDataIndex.addCountryData(countryName, normalizedCodeForInit, metrics);
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
      const allMetricsToProcess = [...keyMetrics, ...otherMetrics];
      allMetricsToProcess.forEach(metric => {
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
          // Use normalized country code for ranking lookup
          const normalizedCode = normalizeCountryCode(countryCode, countryName);
          const ranking = globalDataIndex.getRanking(metric.id, normalizedCode, metric.value);
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
    const normalizedCode = normalizeCountryCode(countryCode, countryName);
    metricCards.forEach(({ rankElement, metric }) => {
      const ranking = globalDataIndex.getRanking(metric.id, normalizedCode, metric.value);
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
  
  // Handle sort order change (no longer used since ranking display is removed)
  sortSelector.addEventListener('change', function() {
    appState.rankingSortOrder = this.value;
  });
  
  // Handle region filter change (no longer used since ranking display is removed)
  filterSelector.addEventListener('change', function() {
    appState.rankingFilterRegion = this.value;
  });
  
  // Handle metric card clicks - removed ranking display, just update active state
  const allMetricCards = panelElement.querySelectorAll('.metric-card');
  allMetricCards.forEach(card => {
    card.addEventListener('click', function() {
      const selectedMetricId = this.dataset.metricId;
      
      // Update active state
      allMetricCards.forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      
      // Store selection in app state
      appState.selectedRankingMetric = selectedMetricId;
      
      // Rankings container is hidden, no action needed
    });
  });
  
  // If no metrics available, show a message
  if (keyMetrics.length === 0 && otherMetrics.length === 0) {
    metricsGrid.innerHTML = '<div class="rankings-placeholder">No ranking metrics available</div>';
    return;
  }
  
  // Set the previously selected metric if available (just highlight, don't show ranking)
  if (appState.selectedRankingMetric) {
    // Check if the previously selected metric is available for this country
    const allMetrics = [...keyMetrics, ...otherMetrics];
    const previousMetric = allMetrics.find(m => m.id === appState.selectedRankingMetric);
    if (previousMetric) {
      const previousCard = panelElement.querySelector(`.metric-card[data-metric-id="${appState.selectedRankingMetric}"]`);
      if (previousCard) {
        previousCard.classList.add('active');
        // Don't trigger ranking display, just highlight the card
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

/**
 * Separate key metrics from other metrics
 * Key metrics are: Population, GDP, Area, GDP per Capita, Unemployment Rate
 * For GDP and Unemployment, prefer most recent year versions (2023, 2024)
 * @param {Array} metrics - All metrics array
 * @returns {Object} - Object with keyMetrics and otherMetrics arrays
 */
function separateKeyMetrics(metrics) {
  // Define key metric identifiers (match common patterns)
  const keyMetricPatterns = [
    { pattern: /population/i, preferRecent: false },
    { pattern: /^economy.*gdp.*ppp|^economy.*gdp.*official|^money.*real.*gdp/i, preferRecent: true },
    { pattern: /^geography.*area.*total|^reach.*area/i, preferRecent: false },
    { pattern: /gdp.*per.*capita|gdp.*capita/i, preferRecent: false },
    { pattern: /unemployment/i, preferRecent: true },
    { pattern: /life.*expectancy/i, preferRecent: false }
  ];
  
  const keyMetrics = [];
  const otherMetrics = [];
  const keyMetricCandidates = new Map(); // Track candidates for metrics that prefer recent years
  
  metrics.forEach(metric => {
    const label = metric.label.toLowerCase();
    const id = metric.id.toLowerCase();
    const text = (metric.text || '').toLowerCase();
    
    // Check if this is a key metric
    let matchedPattern = null;
    for (const { pattern, preferRecent } of keyMetricPatterns) {
      if (pattern.test(label) || pattern.test(id)) {
        matchedPattern = { pattern, preferRecent };
        break;
      }
    }
    
    if (matchedPattern) {
      // For metrics that prefer recent years (GDP, Unemployment), check for year in label/path
      if (matchedPattern.preferRecent) {
        // Check if this metric has a recent year (2023, 2024, etc.)
        const hasRecentYear = /\b(202[3-9]|20[3-9]\d)\b/.test(label) || 
                              /\b(202[3-9]|20[3-9]\d)\b/.test(id) ||
                              /\b(202[3-9]|20[3-9]\d)\b/.test(text);
        
        // Extract year if present
        const yearMatch = (label + ' ' + id + ' ' + text).match(/\b(202[3-9]|20[3-9]\d)\b/);
        const year = yearMatch ? parseInt(yearMatch[1]) : 0;
        
        // Create a key for grouping similar metrics (e.g., all GDP metrics)
        const metricKey = matchedPattern.pattern.source;
        
        if (!keyMetricCandidates.has(metricKey)) {
          keyMetricCandidates.set(metricKey, []);
        }
        
        keyMetricCandidates.get(metricKey).push({ metric, year, hasRecentYear });
      } else {
        // For metrics that don't prefer recent years, add directly
        keyMetrics.push(metric);
      }
    } else {
      otherMetrics.push(metric);
    }
  });
  
  // For metrics that prefer recent years, only keep the most recent version
  keyMetricCandidates.forEach((candidates, metricKey) => {
    // Sort by year (most recent first), then by hasRecentYear flag
    candidates.sort((a, b) => {
      if (a.hasRecentYear && !b.hasRecentYear) return -1;
      if (!a.hasRecentYear && b.hasRecentYear) return 1;
      return b.year - a.year; // Higher year first
    });
    
    // Only add the most recent one (or first one if no year found)
    if (candidates.length > 0) {
      keyMetrics.push(candidates[0].metric);
    }
  });
  
  return { keyMetrics, otherMetrics };
}

/**
 * Get priority order for key metrics (lower number = higher priority)
 * @param {Object} metric - Metric object
 * @returns {number} - Priority number
 */
function getKeyMetricPriority(metric) {
  const label = metric.label.toLowerCase();
  const id = metric.id.toLowerCase();
  
  if (/population/i.test(label) || /population/i.test(id)) return 1;
  if (/gdp.*ppp|real.*gdp/i.test(label) || /money.*real.*gdp/i.test(id)) return 2;
  if (/area.*total/i.test(label) || /reach.*area/i.test(id)) return 3;
  if (/gdp.*per.*capita/i.test(label) || /money.*gdp.*per.*capita/i.test(id)) return 4;
  if (/unemployment/i.test(label) || /money.*unemployment/i.test(id)) return 5;
  if (/life.*expectancy/i.test(label) || /people.*life/i.test(id)) return 6;
  
  return 99; // Other key metrics
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
            keyLower.includes('major urban areas') || // Skip major urban areas
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
      // Normalize country code before adding to index to ensure consistency
      const normalizedCode = normalizeCountryCode(code, country.name);
      // Add to global index
      const metrics = {};
      metrics[selectedMetric.id] = metricValue;
      globalDataIndex.addCountryData(country.name, normalizedCode, metrics);
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
  const rawCountryCode = data.Government?.['Country name']?.['Country name code']?.text ||
                         data.Communications?.['Internet country code']?.text ||
                         '';
  // Normalize country code to ensure it matches the format used in globalDataIndex
  const countryCode = normalizeCountryCode(rawCountryCode, countryName);
  
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
    // NOTE: This is a simplified filter implementation
    // BUG: The current implementation only matches a few hardcoded countries
    // TODO: Implement comprehensive region mapping using countriesList.folder or a dedicated region map
    // For now, we'll use a slightly improved version that checks against countriesList
    countriesAfterFilter = countries.filter(country => {
      const code = country.code.toLowerCase();
      const countryInfo = countriesList.find(c => c.code.toLowerCase() === code);
      
      if (!countryInfo) {
        // Fallback to simplified matching for countries not in countriesList
        // This is a known limitation - see RANKINGS_IMPLEMENTATION_ANALYSIS.md
        if (regionFilter === 'europe' && ['gb', 'de', 'fr', 'it', 'es', 'pt', 'ru'].includes(code)) return true;
        if (regionFilter === 'americas' && ['us', 'ca', 'mx', 'br', 'ar'].includes(code)) return true;
        if (regionFilter === 'asia' && ['in', 'jp', 'cn', 'kr'].includes(code)) return true;
        if (regionFilter === 'africa' && ['za', 'ng', 'eg'].includes(code)) return true;
        if (regionFilter === 'oceania' && ['au'].includes(code)) return true;
        return false;
      }
      
      // Use folder mapping from countriesList if available
      const folder = countryInfo.folder?.toLowerCase() || '';
      if (regionFilter === 'europe' && folder.includes('europe')) return true;
      if (regionFilter === 'americas' && (folder.includes('north-america') || folder.includes('south-america'))) return true;
      if (regionFilter === 'asia' && (folder.includes('asia') || folder.includes('south-asia') || folder.includes('middle-east'))) return true;
      if (regionFilter === 'africa' && folder.includes('africa')) return true;
      if (regionFilter === 'oceania' && folder.includes('oceania')) return true;
      
      return false;
    });
  }
  
  total = countriesAfterFilter.length;
  
  // Find the rank of the current country, handling ties properly
  // BUG FIX: Handle countries with identical values (ties) - they should share the same rank
  const countryIndex = countriesAfterFilter.findIndex(c => c.code.toLowerCase() === countryCode.toLowerCase());
  if (countryIndex === -1) {
    rank = 'N/A';
  } else {
    // Find the first country with the same value (for tie handling)
    const countryValue = countriesAfterFilter[countryIndex].value;
    let tieStartIndex = countryIndex;
    while (tieStartIndex > 0 && countriesAfterFilter[tieStartIndex - 1].value === countryValue) {
      tieStartIndex--;
    }
    rank = tieStartIndex + 1; // Rank is 1-based
  }
  
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

/**
 * Create and display the Global Superpower Leaderboard
 * Shows top countries ranked by Influence Scale (People + Money + Reach)
 * @param {HTMLElement} container - Container element for the leaderboard
 * @param {string} currentCountryCode - Currently selected country code (for highlighting)
 */
function createGlobalLeaderboard(container, currentCountryCode) {
  if (!container) return;

  // Get all countries from globalDataIndex
  const allCountryCodes = Object.keys(globalDataIndex.countries);
  
  if (allCountryCodes.length === 0) {
    container.innerHTML = `
      <div class="leaderboard-placeholder">
        <p>Loading leaderboard data...</p>
        <p class="leaderboard-hint">Select countries to build the global rankings</p>
      </div>
    `;
    return;
  }

  // Calculate Influence Scale for all countries
  const leaderboardEntries = [];
  
  allCountryCodes.forEach(code => {
    const country = globalDataIndex.countries[code];
    if (!country) return;
    
    // Calculate Influence Scale
    const influenceScale = calculateInfluenceScale(code);
    
    // Only include countries with valid scores (have at least some metrics)
    if (influenceScale.influenceScale > 0 && 
        (influenceScale.people.metricsCounted > 0 || 
         influenceScale.money.metricsCounted > 0 || 
         influenceScale.reach.metricsCounted > 0)) {
      leaderboardEntries.push({
        code: code,
        name: country.name,
        influenceScale: influenceScale.influenceScale,
        people: influenceScale.people,
        money: influenceScale.money,
        reach: influenceScale.reach,
        breakdown: influenceScale.breakdown
      });
    }
  });

  // Sort by Influence Scale (lower is better, like golf)
  leaderboardEntries.sort((a, b) => a.influenceScale - b.influenceScale);

  // Take top 20
  const topCountries = leaderboardEntries.slice(0, 20);

  if (topCountries.length === 0) {
    container.innerHTML = `
      <div class="leaderboard-placeholder">
        <p>Insufficient data for leaderboard</p>
        <p class="leaderboard-hint">More countries need to be loaded to calculate rankings</p>
      </div>
    `;
    return;
  }

  // Find current country's rank
  const currentCountryIndex = topCountries.findIndex(c => c.code.toLowerCase() === currentCountryCode?.toLowerCase());
  const currentCountryRank = currentCountryIndex >= 0 ? currentCountryIndex + 1 : null;
  const currentCountryEntry = currentCountryIndex >= 0 ? topCountries[currentCountryIndex] : null;

  // Build HTML
  let html = `
    <div class="global-leaderboard">
      <div class="leaderboard-header">
        <h2 class="leaderboard-title">
          <i class="fas fa-globe"></i>
          Global Superpower Leaderboard
        </h2>
        <p class="leaderboard-description">
          Composite ranking based on People, Money, and Reach metrics. Lower score = higher influence.
        </p>
      </div>
      
      ${currentCountryEntry ? `
        <div class="current-country-leaderboard">
          <div class="current-country-rank">#${currentCountryRank}</div>
          <div class="current-country-info">
            <div class="current-country-name">${currentCountryEntry.name}</div>
            <div class="current-country-score">
              <span class="score-label">Influence Scale:</span>
              <span class="score-value">${Math.round(currentCountryEntry.influenceScale)}</span>
            </div>
            <div class="current-country-breakdown">
              <span class="breakdown-item">
                <span class="breakdown-label">People:</span>
                <span class="breakdown-value">${currentCountryEntry.people.averageRank ? Math.round(currentCountryEntry.people.averageRank) : 'N/A'}</span>
              </span>
              <span class="breakdown-item">
                <span class="breakdown-label">Money:</span>
                <span class="breakdown-value">${currentCountryEntry.money.averageRank ? Math.round(currentCountryEntry.money.averageRank) : 'N/A'}</span>
              </span>
              <span class="breakdown-item">
                <span class="breakdown-label">Reach:</span>
                <span class="breakdown-value">${currentCountryEntry.reach.averageRank ? Math.round(currentCountryEntry.reach.averageRank) : 'N/A'}</span>
              </span>
            </div>
          </div>
        </div>
      ` : ''}
      
      <div class="leaderboard-list">
        ${topCountries.map((country, index) => {
          const isCurrent = country.code.toLowerCase() === currentCountryCode?.toLowerCase();
          return `
            <div class="leaderboard-entry ${isCurrent ? 'current-country' : ''}" data-country-code="${country.code}">
              <div class="leaderboard-rank">#${index + 1}</div>
              <div class="leaderboard-country">
                <div class="leaderboard-name">${country.name}</div>
                <div class="leaderboard-score">Influence: ${Math.round(country.influenceScale)}</div>
              </div>
              <div class="leaderboard-breakdown">
                <div class="breakdown-bar">
                  <div class="breakdown-segment people" style="width: ${country.people.averageRank ? (100 - (country.people.averageRank / 200) * 100) : 0}%"></div>
                  <div class="breakdown-segment money" style="width: ${country.money.averageRank ? (100 - (country.money.averageRank / 200) * 100) : 0}%"></div>
                  <div class="breakdown-segment reach" style="width: ${country.reach.averageRank ? (100 - (country.reach.averageRank / 200) * 100) : 0}%"></div>
                </div>
                <div class="breakdown-labels">
                  <span>P: ${country.people.averageRank ? Math.round(country.people.averageRank) : 'N/A'}</span>
                  <span>M: ${country.money.averageRank ? Math.round(country.money.averageRank) : 'N/A'}</span>
                  <span>R: ${country.reach.averageRank ? Math.round(country.reach.averageRank) : 'N/A'}</span>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
      
      <div class="leaderboard-footer">
        <p class="leaderboard-note">
          <i class="fas fa-info-circle"></i>
          Rankings based on ${allCountryCodes.length} countries with available data. 
          Scores combine People, Money, and Reach category rankings.
        </p>
      </div>
    </div>
  `;

  container.innerHTML = html;

  // Add click handlers to leaderboard entries
  container.querySelectorAll('.leaderboard-entry').forEach(entry => {
    entry.addEventListener('click', function() {
      const code = this.dataset.countryCode;
      // Could trigger country selection here if needed
      // For now, just highlight
      container.querySelectorAll('.leaderboard-entry').forEach(e => e.classList.remove('selected'));
      this.classList.add('selected');
    });
  });
} 