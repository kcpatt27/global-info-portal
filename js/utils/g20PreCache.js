/**
 * g20PreCache.js
 * Handles pre-caching G20 countries on page load
 * Extracts only leaderboard metrics, discards full data
 * Implements storage with periodic updates
 */

import { fetchCountryData } from './dataFetcher.js';
import { processLeaderboardMetrics } from './leaderboardScoring.js';
import { getAllMetrics } from './leaderboardMetrics.js';
import { globalDataIndex } from '../state.js';
import { countriesList } from '../state.js';

// G20 countries list (20 countries + EU)
const G20_COUNTRIES = [
  { code: 'us', name: 'United States', folder: 'north-america' },
  { code: 'ca', name: 'Canada', folder: 'north-america' },
  { code: 'mx', name: 'Mexico', folder: 'north-america' },
  { code: 'br', name: 'Brazil', folder: 'south-america' },
  { code: 'ar', name: 'Argentina', folder: 'south-america' },
  { code: 'gb', name: 'United Kingdom', folder: 'europe' },
  { code: 'fr', name: 'France', folder: 'europe' },
  { code: 'de', name: 'Germany', folder: 'europe' },
  { code: 'it', name: 'Italy', folder: 'europe' },
  { code: 'ru', name: 'Russia', folder: 'central-asia' },
  { code: 'cn', name: 'China', folder: 'east-n-southeast-asia' },
  { code: 'jp', name: 'Japan', folder: 'east-n-southeast-asia' },
  { code: 'in', name: 'India', folder: 'south-asia' },
  { code: 'kr', name: 'South Korea', folder: 'east-n-southeast-asia' },
  { code: 'id', name: 'Indonesia', folder: 'east-n-southeast-asia' },
  { code: 'au', name: 'Australia', folder: 'australia-oceania' },
  { code: 'sa', name: 'Saudi Arabia', folder: 'middle-east' },
  { code: 'tr', name: 'Turkey', folder: 'middle-east' },
  { code: 'za', name: 'South Africa', folder: 'africa' }
  // Note: EU is in G20 but not a country, skipping for now
];

// Storage keys
const STORAGE_KEY = 'g20_leaderboard_cache';
const STORAGE_TIMESTAMP_KEY = 'g20_cache_timestamp';
const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * Import extractMetricValue from leaderboardScoring
 */
import { extractMetricValue } from './leaderboardScoring.js';
import { getMetricById } from './leaderboardMetrics.js';

/**
 * Extract only the metrics we need from full country data
 * @param {Object} countryData - Full country data object
 * @returns {Object} - Extracted metrics only
 */
function extractMetricsOnly(countryData) {
  const allMetrics = getAllMetrics();
  const extracted = {};
  
  allMetrics.forEach(metric => {
    const value = extractMetricValue(countryData, metric);
    if (value !== null && value !== undefined && !isNaN(value)) {
      extracted[metric.id] = value;
    }
  });
  
  // Also extract Land Boundaries for stats tab
  const landBoundariesMetric = getMetricById('reach_land_boundaries');
  if (landBoundariesMetric) {
    const value = extractMetricValue(countryData, landBoundariesMetric);
    if (value !== null && value !== undefined && !isNaN(value)) {
      extracted['reach_land_boundaries'] = value;
    }
  }
  
  return extracted;
}

/**
 * Save G20 metrics to localStorage
 * @param {Object} metricsData - Object mapping country codes to their metrics
 */
function saveToStorage(metricsData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(metricsData));
    localStorage.setItem(STORAGE_TIMESTAMP_KEY, Date.now().toString());
    console.log('G20 metrics saved to storage');
  } catch (error) {
    console.warn('Failed to save G20 metrics to storage:', error);
  }
}

/**
 * Load G20 metrics from localStorage
 * @returns {Object|null} - Cached metrics data or null if expired/not found
 */
function loadFromStorage() {
  try {
    const timestamp = localStorage.getItem(STORAGE_TIMESTAMP_KEY);
    if (!timestamp) return null;
    
    const age = Date.now() - parseInt(timestamp, 10);
    if (age > CACHE_DURATION_MS) {
      console.log('G20 cache expired, will refresh');
      return null; // Cache expired
    }
    
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      const data = JSON.parse(cached);
      console.log('G20 metrics loaded from storage');
      return data;
    }
  } catch (error) {
    console.warn('Failed to load G20 metrics from storage:', error);
  }
  
  return null;
}

/**
 * Load metrics into global index from cached data
 * @param {Object} cachedData - Cached metrics data
 */
function loadMetricsIntoIndex(cachedData) {
  Object.keys(cachedData).forEach(countryCode => {
    const countryMetrics = cachedData[countryCode];
    const country = G20_COUNTRIES.find(c => c.code === countryCode) || 
                   countriesList.find(c => c.code === countryCode);
    
    if (country && countryMetrics) {
      globalDataIndex.addCountryData(country.name, countryCode, countryMetrics);
    }
  });
  
  console.log(`Loaded ${Object.keys(cachedData).length} G20 countries into global index`);
}

/**
 * Pre-cache G20 countries on page load
 * Fetches data, extracts only metrics, stores in localStorage and global index
 * @param {Function} onProgress - Optional callback for progress updates
 * @returns {Promise} - Resolves when all countries are cached
 */
export async function preCacheG20Countries(onProgress = null) {
  console.log('Starting G20 pre-caching...');
  
  // Check if we have valid cached data
  const cached = loadFromStorage();
  if (cached) {
    console.log('Using cached G20 data');
    loadMetricsIntoIndex(cached);
    if (onProgress) onProgress({ cached: true, total: Object.keys(cached).length });
    return cached;
  }
  
  // Fetch fresh data
  const metricsData = {};
  const total = G20_COUNTRIES.length;
  let processed = 0;
  let errors = 0;
  
  // Fetch countries with rate limiting (stagger requests)
  for (let i = 0; i < G20_COUNTRIES.length; i++) {
    const country = G20_COUNTRIES[i];
    
    try {
      // Small fixed delay between requests to avoid bursts
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Build minimal country object expected by fetchCountryData
      const fetchCountry = {
        a2Code: country.code,
        name: country.name,
        folder: country.folder
      };
      
      // Fetch full country data
      const fullData = await fetchCountryData(fetchCountry);
      
      if (fullData) {
        // Extract only the metrics we need
        const metrics = extractMetricsOnly(fullData);
        
        if (Object.keys(metrics).length > 0) {
          metricsData[country.code] = metrics;
          
          // Also add to global index immediately
          globalDataIndex.addCountryData(country.name, country.code, metrics);
        }
      }
      
      processed++;
      
      // Report progress
      if (onProgress) {
        onProgress({ 
          processed, 
          total, 
          current: country.name,
          cached: false 
        });
      }
      
    } catch (error) {
      console.warn(`Failed to pre-cache ${country.name} (${country.code}):`, error);
      errors++;
      processed++;
    }
  }
  
  // Save to storage
  if (Object.keys(metricsData).length > 0) {
    saveToStorage(metricsData);
  }
  
  console.log(`G20 pre-caching complete: ${processed} countries, ${errors} errors`);
  return metricsData;
}

/**
 * Check if cache needs refresh (called on page load)
 * Returns true if cache is expired or missing
 */
export function shouldRefreshCache() {
  const timestamp = localStorage.getItem(STORAGE_TIMESTAMP_KEY);
  if (!timestamp) return true;
  
  const age = Date.now() - parseInt(timestamp, 10);
  return age > CACHE_DURATION_MS;
}

/**
 * Get cache age in days
 */
export function getCacheAge() {
  const timestamp = localStorage.getItem(STORAGE_TIMESTAMP_KEY);
  if (!timestamp) return null;
  
  const age = Date.now() - parseInt(timestamp, 10);
  return Math.floor(age / (24 * 60 * 60 * 1000)); // Days
}
