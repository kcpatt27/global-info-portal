/* state.js - Global state and configuration for country data visualizations */

// Global state to persist selections across country changes
export const appState = {
  // UI State
  ui: {
    activePanelId: 'info',  // Which panel is active (info/data)
    activeDataTab: 0,       // Which data tab is selected
    sidebarExpanded: true,  // Sidebar visibility
    tooltipContent: null,   // Current tooltip content if any
    modalContent: null,     // Current modal content if any
    loading: {
      isLoading: false,
      message: '',
      progress: {
        loaded: 0,
        total: 0
      }
    },
    error: null             // Global error state
  },
  
  // Map State
  map: {
    selectedCountry: null,  // Currently selected country code
    highlightedCountry: null, // Hovered country code
    zoom: {
      level: 1,
      centerLat: 0,
      centerLng: 0
    }
  },
  
  // Data Visualization State
  visualization: {
    stats: {
      searchTerm: ''        // Current search in stats panel
    },
    rankings: {
      selectedMetric: null,
      sortOrder: 'desc',
      filterRegion: 'all',
      page: 1,
      itemsPerPage: 10
    },
    trends: {
      selectedMetric: null,
      timeRange: 'all'      // 'all', '10y', '5y', '1y'
    },
    globalContext: {
      selectedMetrics: [],  // Array of selected metrics for comparison
      comparisonCountries: []  // Countries to compare against
    }
  },
  selectedRankingMetric: null,
  selectedTrendMetric: null,
  rankingSortOrder: "desc", // Default sort order (highest to lowest)
  rankingFilterRegion: "all", // Default region filter (all regions)
  countriesDataLoading: false,
  loadingProgress: {
    loaded: 0,
    total: 0,
    errors: 0
  }
};

// Countries list for global data loading
export const countriesList = [
  { code: "us", name: "United States", folder: "north-america" },
  { code: "ca", name: "Canada", folder: "north-america" },
  { code: "mx", name: "Mexico", folder: "north-america" },
  { code: "gb", name: "United Kingdom", folder: "europe" },
  { code: "fr", name: "France", folder: "europe" },
  { code: "de", name: "Germany", folder: "europe" },
  { code: "it", name: "Italy", folder: "europe" },
  { code: "es", name: "Spain", folder: "europe" },
  { code: "pt", name: "Portugal", folder: "europe" },
  { code: "ru", name: "Russia", folder: "central-asia" },
  { code: "cn", name: "China", folder: "east-n-southeast-asia" },
  { code: "jp", name: "Japan", folder: "east-n-southeast-asia" },
  { code: "in", name: "India", folder: "south-asia" },
  { code: "au", name: "Australia", folder: "australia-oceania" },
  { code: "br", name: "Brazil", folder: "south-america" },
  { code: "ar", name: "Argentina", folder: "south-america" },
  { code: "za", name: "South Africa", folder: "africa" },
  { code: "ng", name: "Nigeria", folder: "africa" },
  { code: "eg", name: "Egypt", folder: "africa" },
  { code: "sa", name: "Saudi Arabia", folder: "middle-east" }
];

// Map of folders by country code for quick lookup
export const countryFolders = countriesList.reduce((map, country) => {
  map[country.code] = country.folder;
  return map;
}, {});

// Cache of all fetched country data
export const countryDataCache = {};

// Global country data index to store metrics for comparison
export const globalDataIndex = {
  // Statistics will be collected here as countries are viewed
  countries: {},
  
  // Add or update a country's data
  addCountryData: function(countryName, countryCode, metrics) {
    if (!countryName || !metrics) return;
    this.countries[countryCode] = this.countries[countryCode] || { name: countryName, metrics: {} };
    this.countries[countryCode].metrics = {
      ...this.countries[countryCode].metrics,
      ...metrics
    };
  },
  
  // Get ranking for a specific metric
  getRanking: function(metricId, countryCode, value) {
    const values = [];
    if (!this.countries[countryCode]?.metrics?.[metricId]) {
      values.push({ code: countryCode, value: value });
    }
    Object.keys(this.countries).forEach(code => {
      const country = this.countries[code];
      if (country.metrics[metricId] !== undefined) {
        values.push({ code: code, value: country.metrics[metricId] });
      }
    });
    if (values.length === 0) return null;
    values.sort((a, b) => b.value - a.value);
    const rank = values.findIndex(item => item.code === countryCode) + 1;
    return {
      rank: rank,
      total: values.length,
      percentile: ((values.length - rank + 1) / values.length) * 100,
      minValue: values[values.length - 1].value,
      maxValue: values[0].value,
      values: values
    };
  },
  
  // Get all countries that have data for a specific metric
  getCountriesWithMetric: function(metricId) {
    const countries = [];
    Object.keys(this.countries).forEach(code => {
      const country = this.countries[code];
      if (country.metrics[metricId] !== undefined) {
        countries.push({
          code: code,
          name: country.name,
          value: country.metrics[metricId]
        });
      }
    });
    return countries;
  }
};

// Country data cache with TTL for efficient memory management
export const dataStore = {
  // Country data cache
  countryCache: {
    // Structure: { code: { data, lastFetched, expiresAt } }
  },
  
  // Global metrics index for comparisons
  metricsIndex: {
    // Structure: { metricId: { countries: { code: value } } }
  },
  
  // Metadata about available metrics
  metricsMeta: {
    // Structure: { id, label, category, unit, source, isComparable, isTrendable }
  },
  
  // Reference data (static)
  reference: {
    countriesList: [],
    regionMapping: {},
    continentMapping: {}
  }
};

// Action functions that modify the state
export const stateActions = {
  // UI Actions
  ui: {
    setActivePanel: (panelId) => {
      appState.ui.activePanelId = panelId;
      notifyListeners('ui.activePanel');
    },
    setActiveDataTab: (tabIndex) => {
      appState.ui.activeDataTab = tabIndex;
      notifyListeners('ui.activeDataTab');
    },
    toggleSidebar: () => {
      appState.ui.sidebarExpanded = !appState.ui.sidebarExpanded;
      notifyListeners('ui.sidebarExpanded');
    },
    setLoading: (isLoading, message = '') => {
      appState.ui.loading.isLoading = isLoading;
      appState.ui.loading.message = message;
      notifyListeners('ui.loading');
    },
    updateLoadingProgress: (loaded, total) => {
      appState.ui.loading.progress.loaded = loaded;
      appState.ui.loading.progress.total = total;
      notifyListeners('ui.loading.progress');
    },
    setError: (error) => {
      appState.ui.error = error;
      notifyListeners('ui.error');
    }
  },
  
  // Map Actions
  map: {
    selectCountry: (countryCode) => {
      appState.map.selectedCountry = countryCode;
      notifyListeners('map.selectedCountry');
    },
    highlightCountry: (countryCode) => {
      appState.map.highlightedCountry = countryCode;
      notifyListeners('map.highlightedCountry');
    },
    setZoom: (level, centerLat, centerLng) => {
      appState.map.zoom = { level, centerLat, centerLng };
      notifyListeners('map.zoom');
    }
  },
  
  // Visualization Actions
  visualization: {
    // Stats panel
    setStatsSearch: (term) => {
      appState.visualization.stats.searchTerm = term;
      notifyListeners('visualization.stats.searchTerm');
    },
    
    // Rankings panel
    setRankingMetric: (metricId) => {
      appState.visualization.rankings.selectedMetric = metricId;
      notifyListeners('visualization.rankings.selectedMetric');
    },
    setRankingSortOrder: (order) => {
      appState.visualization.rankings.sortOrder = order;
      notifyListeners('visualization.rankings.sortOrder');
    },
    setRankingRegionFilter: (region) => {
      appState.visualization.rankings.filterRegion = region;
      notifyListeners('visualization.rankings.filterRegion');
    },
    
    // Trends panel
    setTrendMetric: (metricId) => {
      appState.visualization.trends.selectedMetric = metricId;
      notifyListeners('visualization.trends.selectedMetric');
    },
    setTrendTimeRange: (range) => {
      appState.visualization.trends.timeRange = range;
      notifyListeners('visualization.trends.timeRange');
    }
  },
  
  // Data Store Actions
  dataStore: {
    // Cache a country's data
    cacheCountryData: (countryCode, data) => {
      const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24h cache
      dataStore.countryCache[countryCode] = {
        data,
        lastFetched: Date.now(),
        expiresAt
      };
      
      // Also extract metrics for the global index
      indexCountryMetrics(countryCode, data);
    },
    
    // Add a metric to the metrics index
    indexMetric: (metricId, countryCode, value, metadata = {}) => {
      if (!dataStore.metricsIndex[metricId]) {
        dataStore.metricsIndex[metricId] = { 
          countries: {},
          ...metadata
        };
      }
      
      dataStore.metricsIndex[metricId].countries[countryCode] = value;
      
      // Also update metadata if provided
      if (metadata && Object.keys(metadata).length > 0) {
        dataStore.metricsMeta[metricId] = {
          ...dataStore.metricsMeta[metricId],
          ...metadata
        };
      }
    }
  }
};

// Set up observers for state changes
const stateObservers = {};

// Subscribe to state changes
export function subscribeToState(path, callback) {
  if (!stateObservers[path]) {
    stateObservers[path] = [];
  }
  stateObservers[path].push(callback);
  
  // Return unsubscribe function
  return () => {
    stateObservers[path] = stateObservers[path].filter(cb => cb !== callback);
  };
}

// Notify observers of state changes
function notifyListeners(path) {
  if (stateObservers[path]) {
    stateObservers[path].forEach(callback => {
      try {
        callback(getStateByPath(path));
      } catch (error) {
        console.error(`Error in state observer for ${path}:`, error);
      }
    });
  }
  
  // Also notify parent paths
  const parentPath = path.split('.').slice(0, -1).join('.');
  if (parentPath) {
    notifyListeners(parentPath);
  }
}

// Helper to get nested state by path
function getStateByPath(path) {
  return path.split('.').reduce((obj, part) => 
    obj && obj[part] !== undefined ? obj[part] : null, 
    { ...appState, ...dataStore }
  );
} 