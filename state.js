/* state.js - Global state and configuration for country data visualizations */

// Global state to persist selections across country changes
export const appState = {
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