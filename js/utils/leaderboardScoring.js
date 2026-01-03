/**
 * leaderboardScoring.js
 * Handles scoring calculations for the Global Superpower Leaderboard
 * Includes optimal range scoring, inverse ranking, and category aggregation
 */

import { extractNumber } from '../utils.js';
import { getAllMetrics, getMetricById, getMetricsByCategory } from './leaderboardMetrics.js';
import { globalDataIndex } from '../state.js';

/**
 * Extract a metric value from country data using the metric definition
 * @param {Object} countryData - The country data object
 * @param {Object} metric - Metric definition from leaderboardMetrics.js
 * @returns {number|null} - The extracted numeric value, or null if not found
 */
export function extractMetricValue(countryData, metric) {
  if (!countryData || !metric || !metric.dataPath) return null;

  // Try primary data path
  let value = extractValueByPath(countryData, metric.dataPath);
  
  // Try fallback paths if primary fails
  if (value === null && metric.fallbackPaths) {
    for (const fallbackPath of metric.fallbackPaths) {
      value = extractValueByPath(countryData, fallbackPath);
      if (value !== null) break;
    }
  }

  return value;
}

/**
 * Extract value from country data using a path array
 */
function extractValueByPath(countryData, path) {
  if (!path || path.length === 0) return null;

  let current = countryData;
  for (const key of path) {
    if (!current || typeof current !== 'object') return null;
    current = current[key];
  }

  if (current && typeof current === 'string') {
    // Handle special cases for optimal range metrics
    if (current.includes('male(s)/female')) {
      // Extract sex ratio: "1.01 male(s)/female" -> 1.01
      const match = current.match(/(\d+\.?\d*)\s*male\(s\)\/female/);
      if (match) return parseFloat(match[1]);
    }
    
    // Extract percentage: "97% (2022 est.)" -> 97
    if (current.includes('%')) {
      const match = current.match(/(\d+\.?\d*)%/);
      if (match) return parseFloat(match[1]);
    }
    
    // Standard number extraction
    return extractNumber(current);
  }

  return null;
}

/**
 * Calculate optimal range score (distance from optimal value)
 * Lower distance = better rank
 * @param {number} value - The actual value
 * @param {number} optimalValue - The optimal value
 * @returns {number} - Distance from optimal (always positive)
 */
export function calculateOptimalRangeDistance(value, optimalValue) {
  if (value === null || value === undefined || isNaN(value)) return Infinity;
  return Math.abs(value - optimalValue);
}

/**
 * Get ranking for a metric, handling different ranking types
 * @param {string} metricId - The metric ID
 * @param {string} countryCode - The country code
 * @param {number} value - The metric value (optional, will be looked up if not provided)
 * @returns {Object|null} - Ranking object with rank, total, etc.
 */
export function getMetricRanking(metricId, countryCode, value = null) {
  const metric = getMetricById(metricId);
  if (!metric) return null;

  // Get all countries with this metric
  const allCountries = globalDataIndex.getCountriesWithMetric(metricId);
  
  // Add current country if not in list
  if (value !== null) {
    const exists = allCountries.find(c => c.code === countryCode);
    if (!exists) {
      allCountries.push({ code: countryCode, value: value });
    }
  }

  if (allCountries.length === 0) return null;

  // Sort based on ranking type
  if (metric.rankingType === 'lower') {
    // Lower is better - sort ascending
    allCountries.sort((a, b) => a.value - b.value);
  } else if (metric.rankingType === 'optimal') {
    // Optimal range - sort by distance from optimal
    allCountries.forEach(country => {
      const distance = calculateOptimalRangeDistance(country.value, metric.optimalValue);
      country.distance = distance;
    });
    allCountries.sort((a, b) => a.distance - b.distance);
  } else {
    // Higher is better - sort descending (default)
    allCountries.sort((a, b) => b.value - a.value);
  }

  // Find rank
  let rank;
  if (metric.rankingType === 'optimal') {
    const country = allCountries.find(c => c.code === countryCode);
    if (!country) return null;
    rank = allCountries.findIndex(c => c.code === countryCode) + 1;
  } else {
    rank = allCountries.findIndex(c => c.code === countryCode) + 1;
  }

  return {
    rank: rank || 0,
    total: allCountries.length,
    value: value || allCountries.find(c => c.code === countryCode)?.value,
    minValue: allCountries[allCountries.length - 1]?.value,
    maxValue: allCountries[0]?.value
  };
}

/**
 * Calculate category score (sum of ranks for all metrics in category)
 * @param {string} category - 'people', 'money', or 'reach'
 * @param {string} countryCode - The country code
 * @param {Object} countryData - The country data (optional, for extracting values)
 * @returns {Object} - Category score with totalRank, metricsCounted, averageRank
 */
export function calculateCategoryScore(category, countryCode, countryData = null) {
  const metrics = getMetricsByCategory(category);
  
  let totalRank = 0;
  let metricsCounted = 0;
  const metricScores = {};

  metrics.forEach(metric => {
    // Skip optional metrics if data not available
    if (metric.optional && !countryData) {
      const value = extractMetricValue(countryData, metric);
      if (value === null) return;
    }

    // Get value from country data or global index
    let value = null;
    if (countryData) {
      value = extractMetricValue(countryData, metric);
    } else {
      const country = globalDataIndex.countries[countryCode];
      value = country?.metrics?.[metric.id];
    }

    if (value === null || value === undefined) return;

    // Get ranking
    const ranking = getMetricRanking(metric.id, countryCode, value);
    if (ranking && ranking.rank > 0) {
      totalRank += ranking.rank;
      metricsCounted++;
      metricScores[metric.id] = {
        rank: ranking.rank,
        value: value,
        label: metric.label
      };
    }
  });

  return {
    totalRank: totalRank,
    metricsCounted: metricsCounted,
    averageRank: metricsCounted > 0 ? totalRank / metricsCounted : null,
    metricScores: metricScores
  };
}

/**
 * Calculate Influence Scale (sum of all three category scores)
 * @param {string} countryCode - The country code
 * @param {Object} countryData - The country data (optional)
 * @returns {Object} - Influence scale with total score and category breakdowns
 */
export function calculateInfluenceScale(countryCode, countryData = null) {
  const peopleScore = calculateCategoryScore('people', countryCode, countryData);
  const moneyScore = calculateCategoryScore('money', countryCode, countryData);
  const reachScore = calculateCategoryScore('reach', countryCode, countryData);

  const influenceScale = peopleScore.totalRank + moneyScore.totalRank + reachScore.totalRank;

  return {
    influenceScale: influenceScale, // Lower = better (like golf)
    people: peopleScore,
    money: moneyScore,
    reach: reachScore,
    breakdown: {
      peopleRank: peopleScore.averageRank,
      moneyRank: moneyScore.averageRank,
      reachRank: reachScore.averageRank
    }
  };
}

/**
 * Process all leaderboard metrics for a country and add to global index
 * Also processes additional metrics like Land Boundaries for stats tab rankings
 * @param {string} countryCode - The country code
 * @param {Object} countryData - The country data
 * @param {string} countryName - The country name
 */
export function processLeaderboardMetrics(countryCode, countryData, countryName) {
  const allMetrics = getAllMetrics();
  const metrics = {};

  allMetrics.forEach(metric => {
    const value = extractMetricValue(countryData, metric);
    if (value !== null && value !== undefined && !isNaN(value)) {
      metrics[metric.id] = value;
    }
  });

  // Also process Land Boundaries for stats tab ranking (even though it's optional)
  const landBoundariesMetric = getMetricById('reach_land_boundaries');
  if (landBoundariesMetric) {
    const value = extractMetricValue(countryData, landBoundariesMetric);
    if (value !== null && value !== undefined && !isNaN(value)) {
      metrics[landBoundariesMetric.id] = value;
    }
  }

  // Add to global index
  if (Object.keys(metrics).length > 0) {
    globalDataIndex.addCountryData(countryName, countryCode, metrics);
  }

  return metrics;
}
