/**
 * globalPreCache.js
 * Handles pre-caching country data for the leaderboard
 * 
 * Features:
 * - Fast initial load with top 50 priority countries
 * - Progressive background caching for secondary countries
 * - "Load All Countries" manual trigger
 * - Parallel batch fetching for speed
 */

import { fetchCountryData } from './dataFetcher.js';
import { getAllMetrics } from './leaderboardMetrics.js';
import { globalDataIndex } from '../state.js';
import { countriesList } from '../state.js';
import { extractMetricValue } from './leaderboardScoring.js';
import { getMetricById } from './leaderboardMetrics.js';

// ============================================================================
// COUNTRY LISTS
// ============================================================================

// TOP 50 Priority Countries - loaded immediately on page load
// These are the most significant countries for the leaderboard
const PRIORITY_COUNTRIES = [
  // Major Powers (5)
  { code: 'us', name: 'United States', folder: 'north-america' },
  { code: 'cn', name: 'China', folder: 'east-n-southeast-asia' },
  { code: 'ru', name: 'Russia', folder: 'central-asia' },
  { code: 'gb', name: 'United Kingdom', folder: 'europe' },
  { code: 'fr', name: 'France', folder: 'europe' },
  
  // G20 Economies (14 more)
  { code: 'de', name: 'Germany', folder: 'europe' },
  { code: 'jp', name: 'Japan', folder: 'east-n-southeast-asia' },
  { code: 'in', name: 'India', folder: 'south-asia' },
  { code: 'br', name: 'Brazil', folder: 'south-america' },
  { code: 'it', name: 'Italy', folder: 'europe' },
  { code: 'ca', name: 'Canada', folder: 'north-america' },
  { code: 'kr', name: 'South Korea', folder: 'east-n-southeast-asia' },
  { code: 'au', name: 'Australia', folder: 'australia-oceania' },
  { code: 'mx', name: 'Mexico', folder: 'north-america' },
  { code: 'id', name: 'Indonesia', folder: 'east-n-southeast-asia' },
  { code: 'tr', name: 'Turkey', folder: 'middle-east' },
  { code: 'sa', name: 'Saudi Arabia', folder: 'middle-east' },
  { code: 'ar', name: 'Argentina', folder: 'south-america' },
  { code: 'za', name: 'South Africa', folder: 'africa' },
  
  // Key NATO & EU (12)
  { code: 'es', name: 'Spain', folder: 'europe' },
  { code: 'pl', name: 'Poland', folder: 'europe' },
  { code: 'nl', name: 'Netherlands', folder: 'europe' },
  { code: 'ch', name: 'Switzerland', folder: 'europe' },
  { code: 'se', name: 'Sweden', folder: 'europe' },
  { code: 'no', name: 'Norway', folder: 'europe' },
  { code: 'be', name: 'Belgium', folder: 'europe' },
  { code: 'at', name: 'Austria', folder: 'europe' },
  { code: 'dk', name: 'Denmark', folder: 'europe' },
  { code: 'fi', name: 'Finland', folder: 'europe' },
  { code: 'gr', name: 'Greece', folder: 'europe' },
  { code: 'pt', name: 'Portugal', folder: 'europe' },
  
  // Key Middle East (6)
  { code: 'il', name: 'Israel', folder: 'middle-east' },
  { code: 'ae', name: 'United Arab Emirates', folder: 'middle-east' },
  { code: 'ir', name: 'Iran', folder: 'middle-east' },
  { code: 'iq', name: 'Iraq', folder: 'middle-east' },
  { code: 'qa', name: 'Qatar', folder: 'middle-east' },
  { code: 'kw', name: 'Kuwait', folder: 'middle-east' },
  
  // Key Asia-Pacific (7)
  { code: 'tw', name: 'Taiwan', folder: 'east-n-southeast-asia' },
  { code: 'sg', name: 'Singapore', folder: 'east-n-southeast-asia' },
  { code: 'th', name: 'Thailand', folder: 'east-n-southeast-asia' },
  { code: 'vn', name: 'Vietnam', folder: 'east-n-southeast-asia' },
  { code: 'my', name: 'Malaysia', folder: 'east-n-southeast-asia' },
  { code: 'ph', name: 'Philippines', folder: 'east-n-southeast-asia' },
  { code: 'pk', name: 'Pakistan', folder: 'south-asia' },
  
  // Key Others (6)
  { code: 'eg', name: 'Egypt', folder: 'africa' },
  { code: 'ng', name: 'Nigeria', folder: 'africa' },
  { code: 'ua', name: 'Ukraine', folder: 'europe' },
  { code: 've', name: 'Venezuela', folder: 'south-america' },
  { code: 'co', name: 'Colombia', folder: 'south-america' },
  { code: 'nz', name: 'New Zealand', folder: 'australia-oceania' }
];

// Secondary countries - loaded progressively in background after initial load
const SECONDARY_COUNTRIES = [
  // More Europe
  { code: 'ie', name: 'Ireland', folder: 'europe' },
  { code: 'cz', name: 'Czech Republic', folder: 'europe' },
  { code: 'ro', name: 'Romania', folder: 'europe' },
  { code: 'hu', name: 'Hungary', folder: 'europe' },
  { code: 'sk', name: 'Slovakia', folder: 'europe' },
  { code: 'bg', name: 'Bulgaria', folder: 'europe' },
  { code: 'hr', name: 'Croatia', folder: 'europe' },
  { code: 'si', name: 'Slovenia', folder: 'europe' },
  { code: 'lt', name: 'Lithuania', folder: 'europe' },
  { code: 'lv', name: 'Latvia', folder: 'europe' },
  { code: 'ee', name: 'Estonia', folder: 'europe' },
  { code: 'rs', name: 'Serbia', folder: 'europe' },
  { code: 'lu', name: 'Luxembourg', folder: 'europe' },
  { code: 'is', name: 'Iceland', folder: 'europe' },
  
  // More Middle East
  { code: 'om', name: 'Oman', folder: 'middle-east' },
  { code: 'jo', name: 'Jordan', folder: 'middle-east' },
  { code: 'lb', name: 'Lebanon', folder: 'middle-east' },
  { code: 'bh', name: 'Bahrain', folder: 'middle-east' },
  
  // More Africa
  { code: 'ma', name: 'Morocco', folder: 'africa' },
  { code: 'dz', name: 'Algeria', folder: 'africa' },
  { code: 'ke', name: 'Kenya', folder: 'africa' },
  { code: 'et', name: 'Ethiopia', folder: 'africa' },
  { code: 'gh', name: 'Ghana', folder: 'africa' },
  { code: 'tz', name: 'Tanzania', folder: 'africa' },
  
  // More Asia
  { code: 'bd', name: 'Bangladesh', folder: 'south-asia' },
  { code: 'hk', name: 'Hong Kong', folder: 'east-n-southeast-asia' },
  { code: 'kz', name: 'Kazakhstan', folder: 'central-asia' },
  
  // More Americas
  { code: 'cl', name: 'Chile', folder: 'south-america' },
  { code: 'pe', name: 'Peru', folder: 'south-america' }
];

// ============================================================================
// STORAGE CONFIGURATION
// ============================================================================

const STORAGE_KEY = 'global_leaderboard_cache';
const STORAGE_TIMESTAMP_KEY = 'global_cache_timestamp';
const STORAGE_VERSION_KEY = 'global_cache_version';
const CACHE_VERSION = 8; // Bump when extraction logic changes
const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Batch size for parallel fetching (balance between speed and API load)
const BATCH_SIZE = 5;
const BATCH_DELAY_MS = 100; // Delay between batches

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Extract only the metrics we need from full country data
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
 * Save metrics to localStorage
 */
function saveToStorage(metricsData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(metricsData));
    localStorage.setItem(STORAGE_TIMESTAMP_KEY, Date.now().toString());
    localStorage.setItem(STORAGE_VERSION_KEY, CACHE_VERSION.toString());
    console.log(`💾 Saved ${Object.keys(metricsData).length} countries to cache`);
  } catch (error) {
    console.warn('Failed to save metrics to storage:', error);
  }
}

/**
 * Load metrics from localStorage
 */
function loadFromStorage() {
  try {
    const storedVersion = localStorage.getItem(STORAGE_VERSION_KEY);
    if (!storedVersion || parseInt(storedVersion, 10) !== CACHE_VERSION) {
      console.log('🔄 Cache version mismatch, will refresh');
      return null;
    }
    
    const timestamp = localStorage.getItem(STORAGE_TIMESTAMP_KEY);
    if (!timestamp) return null;
    
    const age = Date.now() - parseInt(timestamp, 10);
    if (age > CACHE_DURATION_MS) {
      console.log('⏰ Cache expired, will refresh');
      return null;
    }
    
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      const data = JSON.parse(cached);
      console.log(`📦 Loaded ${Object.keys(data).length} countries from cache`);
      return data;
    }
  } catch (error) {
    console.warn('Failed to load from storage:', error);
  }
  
  return null;
}

/**
 * Load cached data into global index
 */
function loadMetricsIntoIndex(cachedData) {
  let loaded = 0;
  Object.keys(cachedData).forEach(countryCode => {
    const countryMetrics = cachedData[countryCode];
    const country = PRIORITY_COUNTRIES.find(c => c.code === countryCode) || 
                   SECONDARY_COUNTRIES.find(c => c.code === countryCode) ||
                   countriesList.find(c => c.code === countryCode);
    
    if (country && countryMetrics) {
      globalDataIndex.addCountryData(country.name, countryCode, countryMetrics);
      loaded++;
    }
  });
  
  console.log(`📊 Loaded ${loaded} countries into leaderboard index`);
}

/**
 * Fetch a single country's data
 */
async function fetchCountry(country) {
  try {
    const fetchCountry = {
      a2Code: country.code,
      name: country.name,
      folder: country.folder
    };
    
    const fullData = await fetchCountryData(fetchCountry);
    
    if (fullData) {
      const metrics = extractMetricsOnly(fullData);
      if (Object.keys(metrics).length > 0) {
        return { code: country.code, name: country.name, metrics };
      }
    }
  } catch (error) {
    console.warn(`Failed to fetch ${country.name}:`, error.message);
  }
  return null;
}

/**
 * Fetch countries in parallel batches
 */
async function fetchBatch(countries, metricsData, onProgress, startIndex, totalCountries) {
  const results = await Promise.all(countries.map(fetchCountry));
  
  results.forEach((result, idx) => {
    if (result) {
      metricsData[result.code] = result.metrics;
      globalDataIndex.addCountryData(result.name, result.code, result.metrics);
    }
    
    if (onProgress) {
      onProgress({
        processed: startIndex + idx + 1,
        total: totalCountries,
        current: countries[idx].name,
        cached: false
      });
    }
  });
  
  return results.filter(Boolean).length;
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Pre-cache priority countries on page load
 * Uses parallel batch fetching for faster loading
 * ~50 countries in ~5 seconds instead of ~10 seconds
 */
export async function preCacheG20Countries(onProgress = null) {
  console.log(`🚀 Starting priority cache (${PRIORITY_COUNTRIES.length} countries)...`);
  
  // Check for cached data first
  const cached = loadFromStorage();
  if (cached) {
    loadMetricsIntoIndex(cached);
    if (onProgress) onProgress({ cached: true, total: Object.keys(cached).length });
    
    // Start progressive caching in background if we don't have all secondary countries
    const hasSome = SECONDARY_COUNTRIES.some(c => cached[c.code]);
    if (!hasSome) {
      setTimeout(() => progressiveCacheSecondary(), 2000);
    }
    
    return cached;
  }
  
  // Fetch fresh data in parallel batches
  const metricsData = {};
  const total = PRIORITY_COUNTRIES.length;
  let processed = 0;
  let successful = 0;
  
  // Process in batches of BATCH_SIZE
  for (let i = 0; i < PRIORITY_COUNTRIES.length; i += BATCH_SIZE) {
    const batch = PRIORITY_COUNTRIES.slice(i, i + BATCH_SIZE);
    
    if (i > 0) {
      await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS));
    }
    
    const batchSuccesses = await fetchBatch(batch, metricsData, onProgress, processed, total);
    successful += batchSuccesses;
    processed += batch.length;
  }
  
  // Save to storage
  if (Object.keys(metricsData).length > 0) {
    saveToStorage(metricsData);
  }
  
  console.log(`✅ Priority cache complete: ${successful}/${PRIORITY_COUNTRIES.length} countries`);
  
  // Start progressive caching in background
  setTimeout(() => progressiveCacheSecondary(), 2000);
  
  return metricsData;
}

/**
 * Progressive caching - loads secondary countries in background
 * Called automatically after priority cache completes
 */
export async function progressiveCacheSecondary(onProgress = null) {
  console.log(`🔄 Starting progressive cache (${SECONDARY_COUNTRIES.length} secondary countries)...`);
  
  // Load existing cache
  const cached = loadFromStorage() || {};
  
  // Filter out already cached countries
  const toFetch = SECONDARY_COUNTRIES.filter(c => !cached[c.code]);
  
  if (toFetch.length === 0) {
    console.log('📦 All secondary countries already cached');
    return cached;
  }
  
  console.log(`📥 Fetching ${toFetch.length} additional countries...`);
  
  let successful = 0;
  
  // Fetch in batches with longer delays (background operation)
  for (let i = 0; i < toFetch.length; i += BATCH_SIZE) {
    const batch = toFetch.slice(i, i + BATCH_SIZE);
    
    if (i > 0) {
      await new Promise(resolve => setTimeout(resolve, 200)); // Longer delay for background
    }
    
    const batchSuccesses = await fetchBatch(batch, cached, onProgress, i, toFetch.length);
    successful += batchSuccesses;
  }
  
  // Update storage with new data
  if (successful > 0) {
    saveToStorage(cached);
  }
  
  console.log(`✅ Progressive cache complete: ${successful} additional countries`);
  
  return cached;
}

/**
 * Load ALL countries from countriesList
 * Triggered by "Load All Countries" button
 */
export async function loadAllCountries(onProgress = null) {
  console.log(`🌍 Loading ALL countries (${countriesList.length})...`);
  
  const cached = loadFromStorage() || {};
  
  // Filter out already cached
  const toFetch = countriesList.filter(c => !cached[c.code]);
  
  if (toFetch.length === 0) {
    console.log('📦 All countries already cached!');
    if (onProgress) onProgress({ complete: true, total: Object.keys(cached).length });
    return cached;
  }
  
  console.log(`📥 Fetching ${toFetch.length} remaining countries...`);
  
  let successful = 0;
  
  for (let i = 0; i < toFetch.length; i += BATCH_SIZE) {
    const batch = toFetch.slice(i, i + BATCH_SIZE);
    
    if (i > 0) {
      await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS));
    }
    
    const batchSuccesses = await fetchBatch(batch, cached, onProgress, i, toFetch.length);
    successful += batchSuccesses;
  }
  
  if (successful > 0) {
    saveToStorage(cached);
  }
  
  console.log(`🎉 All countries loaded: ${Object.keys(cached).length} total`);
  
  if (onProgress) onProgress({ complete: true, total: Object.keys(cached).length });
  
  return cached;
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  const cached = loadFromStorage();
  const timestamp = localStorage.getItem(STORAGE_TIMESTAMP_KEY);
  
  return {
    countriesCached: cached ? Object.keys(cached).length : 0,
    priorityTotal: PRIORITY_COUNTRIES.length,
    secondaryTotal: SECONDARY_COUNTRIES.length,
    allCountriesTotal: countriesList.length,
    cacheAge: timestamp ? Math.floor((Date.now() - parseInt(timestamp, 10)) / (24 * 60 * 60 * 1000)) : null,
    isComplete: cached ? Object.keys(cached).length >= countriesList.length : false
  };
}

/**
 * Check if cache needs refresh
 */
export function shouldRefreshCache() {
  const timestamp = localStorage.getItem(STORAGE_TIMESTAMP_KEY);
  if (!timestamp) return true;
  
  const age = Date.now() - parseInt(timestamp, 10);
  return age > CACHE_DURATION_MS;
}

/**
 * Clear cache (for debugging/reset)
 */
export function clearCache() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_TIMESTAMP_KEY);
  localStorage.removeItem(STORAGE_VERSION_KEY);
  console.log('🗑️ Cache cleared');
}
