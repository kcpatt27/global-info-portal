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
  countriesDataLoading: false,
  loadingProgress: {
    loaded: 0,
    total: 0,
    errors: 0
  }
};

// Countries list for global data loading
// Comprehensive list including G20, NATO, BRICS, and major economies
export const countriesList = [
  // North America
  { code: "us", name: "United States", folder: "north-america" },
  { code: "ca", name: "Canada", folder: "north-america" },
  { code: "mx", name: "Mexico", folder: "north-america" },
  { code: "gl", name: "Greenland", folder: "north-america" },
  { code: "bd", name: "Bermuda", folder: "north-america" },
  
  // South America
  { code: "ar", name: "Argentina", folder: "south-america" },
  { code: "bl", name: "Bolivia", folder: "south-america" },
  { code: "br", name: "Brazil", folder: "south-america" },
  { code: "ci", name: "Chile", folder: "south-america" },
  { code: "co", name: "Colombia", folder: "south-america" },
  { code: "ec", name: "Ecuador", folder: "south-america" },
  { code: "gy", name: "Guyana", folder: "south-america" },
  { code: "ns", name: "Suriname", folder: "south-america" },
  { code: "pa", name: "Paraguay", folder: "south-america" },
  { code: "pe", name: "Peru", folder: "south-america" },
  { code: "uy", name: "Uruguay", folder: "south-america" },
  { code: "ve", name: "Venezuela", folder: "south-america" },
  
  // Western Europe
  { code: "au", name: "Austria", folder: "europe" },
  { code: "be", name: "Belgium", folder: "europe" },
  { code: "da", name: "Denmark", folder: "europe" },
  { code: "fi", name: "Finland", folder: "europe" },
  { code: "fr", name: "France", folder: "europe" },
  { code: "gm", name: "Germany", folder: "europe" },
  { code: "gr", name: "Greece", folder: "europe" },
  { code: "ic", name: "Iceland", folder: "europe" },
  { code: "it", name: "Italy", folder: "europe" },
  { code: "ei", name: "Ireland", folder: "europe" },
  { code: "lu", name: "Luxembourg", folder: "europe" },
  { code: "nl", name: "Netherlands", folder: "europe" },
  { code: "pt", name: "Portugal", folder: "europe" },
  { code: "no", name: "Norway", folder: "europe" },
  { code: "sp", name: "Spain", folder: "europe" },
  { code: "sw", name: "Sweden", folder: "europe" },
  { code: "sz", name: "Switzerland", folder: "europe" },
  { code: "uk", name: "United Kingdom", folder: "europe" },
  
  // Eastern Europe
  { code: "al", name: "Albania", folder: "europe" },
  { code: "bu", name: "Bulgaria", folder: "europe" },
  { code: "bk", name: "Bosnia and Herzegovina", folder: "europe" },
  { code: "ez", name: "Czech Republic", folder: "europe" },
  { code: "en", name: "Estonia", folder: "europe" },
  { code: "hr", name: "Croatia", folder: "europe" },
  { code: "hu", name: "Hungary", folder: "europe" },
  { code: "lo", name: "Slovakia", folder: "europe" },
  { code: "lh", name: "Lithuania", folder: "europe" },
  { code: "lg", name: "Latvia", folder: "europe" },
  { code: "mn", name: "Montenegro", folder: "europe" },
  { code: "mk", name: "North Macedonia", folder: "europe" },
  { code: "pl", name: "Poland", folder: "europe" },
  { code: "ri", name: "Serbia", folder: "europe" },
  { code: "ro", name: "Romania", folder: "europe" },
  { code: "si", name: "Slovenia", folder: "europe" },
  { code: "up", name: "Ukraine", folder: "europe" },
  
  // Russia & Central Asia
  { code: "rs", name: "Russia", folder: "central-asia" },
  { code: "kz", name: "Kazakhstan", folder: "central-asia" },
  { code: "uz", name: "Uzbekistan", folder: "central-asia" },
  { code: "ti", name: "Tajikistan", folder: "central-asia" },
  { code: "kg", name: "Kyrgyzstan", folder: "central-asia" },
  { code: "tx", name: "Turkmenistan", folder: "central-asia" },
  
  // East and Southeast Asia
  { code: "bm", name: "Burma", folder: "east-n-southeast-asia" },
  { code: "bx", name: "Brunei", folder: "east-n-southeast-asia" },
  { code: "cb", name: "Cambodia", folder: "east-n-southeast-asia" },
  { code: "ch", name: "China", folder: "east-n-southeast-asia" },
  { code: "hk", name: "Hong Kong", folder: "east-n-southeast-asia" },
  { code: "id", name: "Indonesia", folder: "east-n-southeast-asia" },
  { code: "ja", name: "Japan", folder: "east-n-southeast-asia" },
  { code: "la", name: "Laos", folder: "east-n-southeast-asia" },
  { code: "kn", name: "North Korea", folder: "east-n-southeast-asia" },
  { code: "ks", name: "South Korea", folder: "east-n-southeast-asia" },
  { code: "mc", name: "Macau", folder: "east-n-southeast-asia" },
  { code: "mg", name: "Mongolia", folder: "east-n-southeast-asia" },
  { code: "my", name: "Malaysia", folder: "east-n-southeast-asia" },
  { code: "pp", name: "Papua New Guinea", folder: "east-n-southeast-asia" },
  { code: "rp", name: "Philippines", folder: "east-n-southeast-asia" },
  { code: "sn", name: "Singapore", folder: "east-n-southeast-asia" },
  { code: "th", name: "Thailand", folder: "east-n-southeast-asia" },
  { code: "tt", name: "Timor-Leste", folder: "east-n-southeast-asia" },
  { code: "tw", name: "Taiwan", folder: "east-n-southeast-asia" },
  { code: "vm", name: "Vietnam", folder: "east-n-southeast-asia" },
  
  // South Asia
  { code: "in", name: "India", folder: "south-asia" },
  { code: "pk", name: "Pakistan", folder: "south-asia" },
  { code: "bg", name: "Bangladesh", folder: "south-asia" },
  { code: "np", name: "Nepal", folder: "south-asia" },
  { code: "ce", name: "Sri Lanka", folder: "south-asia" },
  { code: "bt", name: "Bhutan", folder: "south-asia" },
  { code: "mv", name: "Maldives", folder: "south-asia" },
  
  // Middle East
  { code: "ae", name: "United Arab Emirates", folder: "middle-east" },
  { code: "ba", name: "Bahrain", folder: "middle-east" },
  { code: "is", name: "Israel", folder: "middle-east" },
  { code: "ir", name: "Iran", folder: "middle-east" },
  { code: "iz", name: "Iraq", folder: "middle-east" },
  { code: "jo", name: "Jordan", folder: "middle-east" },
  { code: "ku", name: "Kuwait", folder: "middle-east" },
  { code: "le", name: "Lebanon", folder: "middle-east" },
  { code: "mu", name: "Oman", folder: "middle-east" },
  { code: "qa", name: "Qatar", folder: "middle-east" },
  { code: "sa", name: "Saudi Arabia", folder: "middle-east" },
  { code: "sy", name: "Syria", folder: "middle-east" },
  { code: "tu", name: "Turkey", folder: "middle-east" },
  { code: "we", name: "Palestine", folder: "middle-east" },
  { code: "ym", name: "Yemen", folder: "middle-east" },
  
  // Africa
  { code: "ag", name: "Algeria", folder: "africa" },
  { code: "ao", name: "Angola", folder: "africa" },
  { code: "bc", name: "Botswana", folder: "africa" },
  { code: "bn", name: "Benin", folder: "africa" },
  { code: "by", name: "Burundi", folder: "africa" },
  { code: "cd", name: "Chad", folder: "africa" },
  { code: "cf", name: "Democratic Republic of Congo", folder: "africa" },
  { code: "cm", name: "Cameroon", folder: "africa" },
  { code: "cn", name: "Comoros", folder: "africa" },
  { code: "ct", name: "Central African Republic", folder: "africa" },
  { code: "cv", name: "Cape Verde", folder: "africa" },
  { code: "dj", name: "Djibouti", folder: "africa" },
  { code: "eg", name: "Egypt", folder: "africa" },
  { code: "ek", name: "Equatorial Guinea", folder: "africa" },
  { code: "er", name: "Eritrea", folder: "africa" },
  { code: "et", name: "Ethiopia", folder: "africa" },
  { code: "ga", name: "Gambia", folder: "africa" },
  { code: "gb", name: "Gabon", folder: "africa" },
  { code: "gh", name: "Ghana", folder: "africa" },
  { code: "gv", name: "Guinea", folder: "africa" },
  { code: "iv", name: "Cote d'Ivoire", folder: "africa" },
  { code: "ke", name: "Kenya", folder: "africa" },
  { code: "li", name: "Liberia", folder: "africa" },
  { code: "lt", name: "Lesotho", folder: "africa" },
  { code: "ly", name: "Libya", folder: "africa" },
  { code: "ni", name: "Nigeria", folder: "africa" },
  { code: "ma", name: "Madagascar", folder: "africa" },
  { code: "mi", name: "Malawi", folder: "africa" },
  { code: "ml", name: "Mali", folder: "africa" },
  { code: "mo", name: "Morocco", folder: "africa" },
  { code: "mp", name: "Mauritius", folder: "africa" },
  { code: "mr", name: "Mauritania", folder: "africa" },
  { code: "mz", name: "Mozambique", folder: "africa" },
  { code: "ng", name: "Niger", folder: "africa" },
  { code: "ni", name: "Nigeria", folder: "africa" },
  { code: "od", name: "South Sudan", folder: "africa" },
  { code: "pu", name: "Guinea-Bissau", folder: "africa" },
  { code: "rw", name: "Rwanda", folder: "africa" },
  { code: "se", name: "Seychelles", folder: "africa" },
  { code: "sf", name: "South Africa", folder: "africa" },
  { code: "sg", name: "Senegal", folder: "africa" },
  { code: "sh", name: "Saint Helena", folder: "africa" },
  { code: "sl", name: "Sierra Leone", folder: "africa" },
  { code: "so", name: "Somalia", folder: "africa" },
  { code: "su", name: "Sudan", folder: "africa" },
  { code: "to", name: "Togo", folder: "africa" },
  { code: "tp", name: "Sao Tome and Principe", folder: "africa" },
  { code: "ts", name: "Tunisia", folder: "africa" },
  { code: "tz", name: "Tanzania", folder: "africa" },
  { code: "ug", name: "Uganda", folder: "africa" },
  { code: "uv", name: "Burkina Faso", folder: "africa" },
  { code: "wa", name: "Namibia", folder: "africa" },
  { code: "wi", name: "Western Sahara", folder: "africa" },
  { code: "wz", name: "Swaziland", folder: "africa" },
  { code: "za", name: "Zambia", folder: "africa" },
  { code: "zi", name: "Zimbabwe", folder: "africa" },
  
  // Oceania
  { code: "as", name: "Australia", folder: "australia-oceania" },
  { code: "aq", name: "Tutuila", folder: "australia-oceania" },
  { code: "at", name: "Ashmore and Cartier Islands", folder: "australia-oceania" },
  { code: "ck", name: "Cook Islands", folder: "australia-oceania" },
  { code: "cq", name: "Mariana Islands", folder: "australia-oceania" },
  { code: "fj", name: "Fiji", folder: "australia-oceania" },
  { code: "fm", name: "Micronesia", folder: "australia-oceania" },
  { code: "fp", name: "French Polynesia", folder: "australia-oceania" },
  { code: "gq", name: "Guam", folder: "australia-oceania" },
  { code: "kr", name: "Kiribati", folder: "australia-oceania" },
  { code: "kt", name: "Christmas Island", folder: "australia-oceania" },
  { code: "mh", name: "Marshall Islands", folder: "australia-oceania" },
  { code: "mp", name: "Northern Mariana Islands", folder: "australia-oceania" },
  { code: "nc", name: "New Caledonia", folder: "australia-oceania" },
  { code: "nf", name: "Norfolk Island", folder: "australia-oceania" },
  { code: "pc", name: "Pitcairn Islands", folder: "australia-oceania" },
  { code: "ps", name: "Palau", folder: "australia-oceania" },
  { code: "rm", name: "Marshall Islands", folder: "australia-oceania" },
  { code: "nz", name: "New Zealand", folder: "australia-oceania" },
  { code: "tv", name: "Tuvalu", folder: "australia-oceania" },
  { code: "ws", name: "Samoa", folder: "australia-oceania" },
  
  // Caribbean & Central America
  { code: "aa", name: "Aruba", folder: "central-america-n-caribbean" },
  { code: "ac", name: "Antigua and Barbuda", folder: "central-america-n-caribbean" },
  { code: "av", name: "Anguilla", folder: "central-america-n-caribbean" },
  { code: "bb", name: "Barbados", folder: "central-america-n-caribbean" },
  { code: "bf", name: "Bahamas", folder: "central-america-n-caribbean" },
  { code: "bh", name: "Belize", folder: "central-america-n-caribbean" },
  { code: "bq", name: "Bonaire, Sint Eustatius and Saba", folder: "central-america-n-caribbean" },
  { code: "cs", name: "Costa Rica", folder: "central-america-n-caribbean" },
  { code: "cu", name: "Cuba", folder: "central-america-n-caribbean" },
  { code: "do", name: "Dominica", folder: "central-america-n-caribbean" },
  { code: "dr", name: "Dominican Republic", folder: "central-america-n-caribbean" },
  { code: "es", name: "El Salvador", folder: "central-america-n-caribbean" },
  { code: "gj", name: "Grenada", folder: "central-america-n-caribbean" },
  { code: "gt", name: "Guatemala", folder: "central-america-n-caribbean" },
  { code: "ha", name: "Haiti", folder: "central-america-n-caribbean" },
  { code: "ho", name: "Honduras", folder: "central-america-n-caribbean" },
  { code: "jm", name: "Jamaica", folder: "central-america-n-caribbean" },
  { code: "nn", name: "Sint Maarten", folder: "central-america-n-caribbean" },
  { code: "nu", name: "Nicaragua", folder: "central-america-n-caribbean" },
  { code: "pm", name: "Panama", folder: "central-america-n-caribbean" },
  { code: "rn", name: "Saint Martin", folder: "central-america-n-caribbean" },
  { code: "rq", name: "Puerto Rico", folder: "central-america-n-caribbean" },
  { code: "sc", name: "Saint Kitts and Nevis", folder: "central-america-n-caribbean" },
  { code: "st", name: "Saint Lucia", folder: "central-america-n-caribbean" },
  { code: "tb", name: "Saint Barthelemy", folder: "central-america-n-caribbean" },
  { code: "td", name: "Trinidad and Tobago", folder: "central-america-n-caribbean" },
  { code: "tk", name: "Turks and Caicos Islands", folder: "central-america-n-caribbean" },
  { code: "uc", name: "Curacao", folder: "central-america-n-caribbean" },
  { code: "vc", name: "Saint Vincent and the Grenadines", folder: "central-america-n-caribbean" },
  { code: "vi", name: "British Virgin Islands", folder: "central-america-n-caribbean" },
  { code: "vq", name: "US Virgin Islands", folder: "central-america-n-caribbean" }
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

    // Normalize incoming countryCode to a consistent lowercase ISO-like key.
    // Many callers pass different formats (uppercase, numeric strings, FIPS), so
    // we normalize here to avoid creating duplicate country entries.
    let normalizedCode = String(countryCode || '').toLowerCase();

    // If the incoming code is not a 2-letter ISO, try to resolve it via countriesList by exact name match.
    // This helps map numeric or alternate codes (e.g. '036', '840') to the expected 2-letter key.
    if (!/^[a-z]{2}$/.test(normalizedCode)) {
      const matchByName = countriesList.find(c => c.name.toLowerCase() === (countryName || '').toLowerCase());
      if (matchByName) {
        normalizedCode = matchByName.code.toLowerCase();
      }
    }

    // If an entry for this country already exists under a different key but with the same display name,
    // prefer that existing key to avoid duplicate entries (e.g., 'US' vs 'us' or numeric vs alpha).
    for (const existingKey of Object.keys(this.countries)) {
      const existingName = this.countries[existingKey]?.name;
      if (existingName && existingName.toLowerCase() === (countryName || '').toLowerCase()) {
        normalizedCode = existingKey;
        break;
      }
    }

    // Don't add entries with "Unknown" names or names that look like country codes (2-3 letter strings)
    const looksLikeCode = /^[a-z]{2,3}$/i.test(countryName);
    if (countryName === 'Unknown' || countryName === 'Unknown Country' || looksLikeCode) {
      const countryFromList = countriesList.find(c => c.code.toLowerCase() === normalizedCode.toLowerCase());
      if (countryFromList) {
        countryName = countryFromList.name;
      } else {
        // Skip adding if we can't find a proper name
        console.warn(`Skipping country data for code ${countryCode} - no valid name found (got: ${countryName})`);
        return;
      }
    }

    // Preserve existing name if it's better than the new one
    if (this.countries[normalizedCode] && this.countries[normalizedCode].name &&
        this.countries[normalizedCode].name !== 'Unknown' &&
        this.countries[normalizedCode].name !== 'Unknown Country') {
      countryName = this.countries[normalizedCode].name;
    }

    // Ensure the key used in the index is normalized (lowercase)
    this.countries[normalizedCode] = this.countries[normalizedCode] || { name: countryName, metrics: {} };
    this.countries[normalizedCode].name = countryName; // Always update name to ensure it's correct
    this.countries[normalizedCode].metrics = {
      ...this.countries[normalizedCode].metrics,
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

// Add this function to update the state structure
export function updateStateStructure() {
  // Save old state values we need to migrate
  const oldTrendsState = { ...appState.visualization.trends };
  const oldGlobalContextState = { ...appState.visualization.globalContext };
  
  // Restructure visualization state
  appState.visualization = {
    stats: {
      ...appState.visualization.stats,
      view: 'current', // 'current' or 'historical'
      historicalMetric: oldTrendsState.selectedMetric,
      timeRange: oldTrendsState.timeRange
    },
    rankings: {
      ...appState.visualization.rankings,
      view: 'global', // 'global' or 'region'
      comparisonMetrics: oldGlobalContextState.selectedMetrics,
      comparisonCountries: oldGlobalContextState.comparisonCountries
    }
  };
  
  // Update persistence function
  updatePersistState();
}