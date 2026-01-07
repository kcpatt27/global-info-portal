/**
 * leaderboardScoring.js
 * Handles scoring calculations for the Global Superpower Leaderboard
 * Uses FIXED reference scales to ensure scores are stable regardless of which countries are loaded
 */

import { extractNumber } from '../utils.js';
import { getAllMetrics, getMetricById, getMetricsByCategory } from './leaderboardMetrics.js';
import { globalDataIndex } from '../state.js';

/**
 * FIXED REFERENCE SCALES for scoring
 * These define the min/max values for normalization, ensuring consistent scores
 * regardless of which countries are currently loaded
 */
const REFERENCE_SCALES = {
  // People metrics - MUST match IDs in leaderboardMetrics.js
  people_population: { min: 100000, max: 1500000000, type: 'log' },
  people_population_growth: { min: -2, max: 4, type: 'optimal', optimal: 1.5, range: [1, 2.5] },
  people_median_age: { min: 15, max: 50, type: 'optimal', optimal: 32, range: [28, 38] },
  people_labor_force: { min: 10000, max: 800000000, type: 'log' },
  people_dependency_ratio: { min: 20, max: 100, type: 'optimal', optimal: 50, range: [40, 60] },
  people_sex_ratio: { min: 0.9, max: 1.1, type: 'optimal', optimal: 1.0, range: [0.95, 1.05] },
  people_urban_population: { min: 10, max: 100, type: 'higher' },
  people_poverty_line: { min: 0, max: 80, type: 'lower' },
  people_net_migration: { min: -20, max: 20, type: 'higher' },
  people_urbanization_rate: { min: -2, max: 5, type: 'optimal', optimal: 1.5, range: [0.5, 2.5] },
  people_youth_dependency: { min: 15, max: 100, type: 'optimal', optimal: 35, range: [25, 50] },
  people_elderly_dependency: { min: 5, max: 50, type: 'optimal', optimal: 20, range: [10, 30] },
  
  // Money metrics
  money_real_gdp_ppp: { min: 1000000000, max: 35000000000000, type: 'log' }, // $1B to $35T
  money_gdp_per_capita: { min: 500, max: 150000, type: 'log' },
  money_gdp_growth: { min: -10, max: 15, type: 'optimal', optimal: 3, range: [2, 6] },
  money_unemployment: { min: 0, max: 30, type: 'lower' },
  money_inflation: { min: -5, max: 50, type: 'optimal', optimal: 2, range: [1, 4] },
  money_public_debt: { min: 0, max: 300, type: 'lower' },
  money_external_debt: { min: 0, max: 35000000000000, type: 'log' }, // Actually higher can mean more credit access
  money_agriculture_gdp: { min: 0, max: 50, type: 'linear' },
  money_industry_gdp: { min: 5, max: 60, type: 'linear' },
  money_services_gdp: { min: 20, max: 90, type: 'linear' },
  money_exports: { min: 100000000, max: 4000000000000, type: 'log' },
  money_imports: { min: 100000000, max: 4000000000000, type: 'log' },
  money_current_account: { min: -500000000000, max: 500000000000, type: 'higher' },
  money_reserves: { min: 100000000, max: 4000000000000, type: 'log' },
  money_budget_surplus: { min: -20, max: 10, type: 'higher' },
  
  // Reach metrics
  reach_area: { min: 1000, max: 20000000, type: 'log' },
  reach_land_area: { min: 1000, max: 18000000, type: 'log' },
  reach_water_area: { min: 0, max: 1000000, type: 'log' },
  reach_coastline: { min: 0, max: 55000, type: 'log' },
  reach_internet_users: { min: 10, max: 100, type: 'higher' },
  reach_military_expenditures: { min: 0.5, max: 15, type: 'linear' },
  reach_airports: { min: 1, max: 15000, type: 'log' },
  reach_ports: { min: 0, max: 500, type: 'log' },
  reach_military_personnel: { min: 0, max: 4000000, type: 'log' },
  reach_military_deployments: { min: 0, max: 200000, type: 'log' },
  reach_land_boundaries: { min: 0, max: 25000, type: 'log' },
  
  // Resources metrics
  resources_coal_reserves: { min: 0, max: 500000000000, type: 'log' },
  resources_petroleum_reserves: { min: 0, max: 300000000000, type: 'log' },
  resources_natural_gas_reserves: { min: 0, max: 50000000000000, type: 'log' },
  resources_coal_production: { min: 0, max: 5000000000, type: 'log' },
  resources_petroleum_production: { min: 0, max: 15000000, type: 'log' },
  resources_natural_gas_production: { min: 0, max: 1000000000000, type: 'log' },
  resources_coal_consumption: { min: 0, max: 5500000000, type: 'log' },
  resources_petroleum_consumption: { min: 0, max: 20000000, type: 'log' },
  resources_natural_gas_consumption: { min: 0, max: 900000000000, type: 'log' },
  resources_electricity_capacity: { min: 0, max: 2500000000, type: 'log' }, // kW
  resources_electricity_consumption: { min: 0, max: 8000000000000, type: 'log' },
  resources_energy_consumption: { min: 0, max: 1000000000, type: 'log' },
  resources_nuclear_capacity: { min: 0, max: 120000, type: 'log' },
  resources_nuclear_reactors: { min: 0, max: 100, type: 'log' },
  resources_nuclear_percent: { min: 0, max: 80, type: 'higher' },
  resources_solar_capacity: { min: 0, max: 50, type: 'higher' },
  resources_wind_capacity: { min: 0, max: 50, type: 'higher' },
  resources_hydro_capacity: { min: 0, max: 70, type: 'higher' },
  resources_geothermal_capacity: { min: 0, max: 20, type: 'higher' },
  resources_biomass_capacity: { min: 0, max: 30, type: 'higher' },
  resources_arable_land: { min: 0, max: 60, type: 'higher' },
  resources_agricultural_land: { min: 0, max: 90, type: 'linear' },
  resources_forest: { min: 0, max: 75, type: 'higher' },
  resources_permanent_crops: { min: 0, max: 30, type: 'linear' },
  resources_permanent_pasture: { min: 0, max: 80, type: 'linear' },
  resources_renewable_water: { min: 0, max: 10000, type: 'log' },
  resources_irrigated_land: { min: 0, max: 800000, type: 'log' },
  
  // Quality metrics
  quality_life_expectancy: { min: 50, max: 90, type: 'higher' },
  quality_infant_mortality: { min: 1, max: 100, type: 'lower' },
  quality_death_rate: { min: 3, max: 20, type: 'lower' },
  quality_birth_rate: { min: 5, max: 45, type: 'optimal', optimal: 15, range: [12, 18] },
  quality_fertility_rate: { min: 0.8, max: 7, type: 'optimal', optimal: 2.1, range: [1.8, 2.5] },
  quality_physicians: { min: 0.01, max: 10, type: 'higher' },
  quality_hospital_beds: { min: 0.1, max: 15, type: 'higher' },
  quality_obesity: { min: 1, max: 50, type: 'lower' },
  quality_drinking_water: { min: 30, max: 100, type: 'higher' },
  quality_sanitation: { min: 10, max: 100, type: 'higher' },
  quality_education_expenditure: { min: 1, max: 12, type: 'higher' },
  quality_literacy: { min: 30, max: 100, type: 'higher' },
  quality_school_life: { min: 5, max: 22, type: 'higher' },
  quality_co2_emissions: { min: 0, max: 15000000000, type: 'lower' },
  quality_particulate_matter: { min: 5, max: 150, type: 'lower' },
  quality_methane_emissions: { min: 0, max: 1000000000, type: 'lower' },
  quality_waste_recycled: { min: 0, max: 70, type: 'higher' }
};

// Default scale for metrics without explicit definition
const DEFAULT_SCALE = { min: 0, max: 100, type: 'linear' };

/**
 * Extract a metric value from country data using the metric definition
 */
export function extractMetricValue(countryData, metric) {
  if (!countryData || !metric || !metric.dataPath) return null;

  let value = extractValueByPath(countryData, metric.dataPath);
  
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
    
    if (key in current) {
      current = current[key];
      continue;
    }
    
    const trimmedKey = key.trim();
    const matchingKey = Object.keys(current).find(k => k.trim() === trimmedKey);
    
    if (matchingKey) {
      current = current[matchingKey];
      continue;
    }
    
    const lowerKey = key.toLowerCase();
    const caseInsensitiveKey = Object.keys(current).find(k => 
      k.toLowerCase() === lowerKey || k.trim().toLowerCase() === lowerKey
    );
    
    if (caseInsensitiveKey) {
      current = current[caseInsensitiveKey];
      continue;
    }
    
    return null;
  }

  if (current && typeof current === 'object' && current.text) {
    current = current.text;
  }

  if (current && typeof current === 'string') {
    if (current.includes('male(s)/female')) {
      const match = current.match(/(\d+\.?\d*)\s*male\(s\)\/female/);
      if (match) return parseFloat(match[1]);
    }
    
    if (current.includes('%')) {
      const match = current.match(/(-?\d+\.?\d*)%/);
      if (match) return parseFloat(match[1]);
    }
    
    const lowerText = current.toLowerCase();
    if (lowerText.includes('trillion') || lowerText.includes('billion') || lowerText.includes('million')) {
      const numMatch = current.match(/[\$]?\s*(-?\d+(?:,\d{3})*(?:\.\d+)?)/);
      if (numMatch) {
        let num = parseFloat(numMatch[1].replace(/,/g, ''));
        if (lowerText.includes('trillion')) {
          num *= 1000000000000;
        } else if (lowerText.includes('billion')) {
          num *= 1000000000;
        } else if (lowerText.includes('million')) {
          num *= 1000000;
        }
        return num;
      }
    }
    
    return extractNumber(current);
  }

  return null;
}

/**
 * Calculate score for a metric value using FIXED reference scales
 * Returns a value between 0-1 (1 being best)
 * @param {string} metricId - The metric ID
 * @param {number} value - The raw metric value
 * @returns {number} - Score between 0 and 1
 */
export function calculateMetricScoreFixed(metricId, value) {
  if (value === null || value === undefined || isNaN(value)) return 0;
  
  const scale = REFERENCE_SCALES[metricId] || DEFAULT_SCALE;
  const { min, max, type, optimal, range } = scale;
  
  // Clamp value to scale bounds
  const clampedValue = Math.max(min, Math.min(max, value));
  
  if (type === 'log') {
    // Logarithmic scale for values spanning many orders of magnitude
    // Handles values like population (millions to billions) or GDP ($billions to $trillions)
    const logMin = min > 0 ? Math.log10(min) : 0;
    const logMax = max > 0 ? Math.log10(max) : 1;
    const logValue = clampedValue > 0 ? Math.log10(clampedValue) : logMin;
    return Math.max(0, Math.min(1, (logValue - logMin) / (logMax - logMin)));
  } else if (type === 'lower') {
    // Lower is better (e.g., unemployment, infant mortality)
    return Math.max(0, Math.min(1, 1 - (clampedValue - min) / (max - min)));
  } else if (type === 'optimal') {
    // Distance from optimal value
    // Score is 1 at optimal, decreases as distance increases
    const distance = Math.abs(clampedValue - optimal);
    const maxDistance = Math.max(optimal - min, max - optimal);
    return Math.max(0, Math.min(1, 1 - (distance / maxDistance)));
  } else {
    // Linear: higher is better (default)
    return Math.max(0, Math.min(1, (clampedValue - min) / (max - min)));
  }
}

/**
 * Calculate optimal range score (for backwards compatibility)
 */
export function calculateOptimalRangeDistance(value, optimalValue) {
  if (value === null || value === undefined || isNaN(value)) return Infinity;
  return Math.abs(value - optimalValue);
}

/**
 * Get ranking for a metric (for display purposes only, not for scoring)
 */
export function getMetricRanking(metricId, countryCode, value = null) {
  const metric = getMetricById(metricId);
  if (!metric) return null;

  const allCountries = globalDataIndex.getCountriesWithMetric(metricId);
  
  if (value !== null) {
    const exists = allCountries.find(c => c.code === countryCode);
    if (!exists) {
      allCountries.push({ code: countryCode, value: value });
    }
  }

  if (allCountries.length === 0) return null;

  if (metric.rankingType === 'lower') {
    allCountries.sort((a, b) => a.value - b.value);
  } else if (metric.rankingType === 'optimal') {
    allCountries.forEach(country => {
      country.distance = calculateOptimalRangeDistance(country.value, metric.optimalValue);
    });
    allCountries.sort((a, b) => a.distance - b.distance);
  } else {
    allCountries.sort((a, b) => b.value - a.value);
  }

  const rank = allCountries.findIndex(c => c.code === countryCode) + 1;

  return {
    rank: rank || 0,
    total: allCountries.length,
    value: value || allCountries.find(c => c.code === countryCode)?.value,
    minValue: allCountries[allCountries.length - 1]?.value,
    maxValue: allCountries[0]?.value
  };
}

/**
 * Calculate category score using FIXED reference scales
 * Score is based on raw data values, NOT ranks
 * @param {string} category - Category name
 * @param {string} countryCode - Country code
 * @param {Object} countryData - Optional country data for extraction
 * @returns {Object} - Category score object
 */
export function calculateCategoryScore(category, countryCode, countryData = null) {
  const metrics = getMetricsByCategory(category);
  
  let totalScore = 0;
  let metricsCounted = 0;
  const metricScores = {};

  metrics.forEach(metric => {
    let value = null;
    if (countryData) {
      value = extractMetricValue(countryData, metric);
    } else {
      const country = globalDataIndex.countries[countryCode];
      value = country?.metrics?.[metric.id];
    }

    if (value === null || value === undefined || isNaN(value)) {
      if (metric.optional) return;
      return;
    }

    // Use FIXED reference scale scoring instead of dynamic min/max
    const normalizedScore = calculateMetricScoreFixed(metric.id, value);
    
    totalScore += normalizedScore;
    metricsCounted++;

    // Get ranking for display purposes only
    const ranking = getMetricRanking(metric.id, countryCode, value);
    
    metricScores[metric.id] = {
      score: normalizedScore,
      rank: ranking?.rank || null,
      total: ranking?.total || null,
      value: value,
      label: metric.label
    };
  });

  // Average rank for display only
  let totalRank = 0;
  let ranksCounted = 0;
  Object.values(metricScores).forEach(ms => {
    if (ms.rank !== null) {
      totalRank += ms.rank;
      ranksCounted++;
    }
  });

  return {
    totalScore: totalScore,
    metricsCounted: metricsCounted,
    averageScore: metricsCounted > 0 ? totalScore / metricsCounted : null,
    averageRank: ranksCounted > 0 ? totalRank / ranksCounted : null,
    totalRank: totalRank,
    metricScores: metricScores
  };
}

/**
 * Calculate Influence Scale using FIXED reference scales
 * Scores are stable regardless of which countries are loaded
 */
export function calculateInfluenceScale(countryCode, countryData = null) {
  const peopleScore = calculateCategoryScore('people', countryCode, countryData);
  const moneyScore = calculateCategoryScore('money', countryCode, countryData);
  const reachScore = calculateCategoryScore('reach', countryCode, countryData);
  const resourcesScore = calculateCategoryScore('resources', countryCode, countryData);
  const qualityScore = calculateCategoryScore('quality', countryCode, countryData);

  const influenceScale = (peopleScore.totalScore || 0) + 
                         (moneyScore.totalScore || 0) + 
                         (reachScore.totalScore || 0) + 
                         (resourcesScore.totalScore || 0) +
                         (qualityScore.totalScore || 0);

  return {
    influenceScale: influenceScale,
    people: peopleScore,
    money: moneyScore,
    reach: reachScore,
    resources: resourcesScore,
    quality: qualityScore,
    breakdown: {
      peopleRank: peopleScore.averageRank,
      moneyRank: moneyScore.averageRank,
      reachRank: reachScore.averageRank,
      resourcesRank: resourcesScore.averageRank,
      qualityRank: qualityScore.averageRank
    }
  };
}

/**
 * Process all leaderboard metrics for a country and add to global index
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

  const landBoundariesMetric = getMetricById('reach_land_boundaries');
  if (landBoundariesMetric) {
    const value = extractMetricValue(countryData, landBoundariesMetric);
    if (value !== null && value !== undefined && !isNaN(value)) {
      metrics[landBoundariesMetric.id] = value;
    }
  }

  if (Object.keys(metrics).length > 0) {
    globalDataIndex.addCountryData(countryName, countryCode, metrics);
  }

  return metrics;
}
