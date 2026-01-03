/**
 * leaderboardMetrics.js
 * Defines all metrics used for the Global Superpower Leaderboard
 * Organized into three categories: People, Money, Reach
 */

/**
 * Metric definitions for the Global Superpower Leaderboard
 * Each metric includes:
 * - id: unique identifier
 * - label: display name
 * - dataPath: array of keys to navigate to the data in country JSON
 * - category: 'people', 'money', or 'reach'
 * - rankingType: 'higher', 'lower', or 'optimal'
 * - optimalValue: for optimal range metrics (optional)
 * - optimalRange: [min, max] for optimal range (optional)
 */
export const LEADERBOARD_METRICS = {
  // Category 1: People (8 metrics)
  people: [
    {
      id: 'people_population',
      label: 'Population',
      dataPath: ['People and Society', 'Population', 'total', 'text'],
      category: 'people',
      rankingType: 'higher'
    },
    {
      id: 'people_population_growth',
      label: 'Population Growth',
      dataPath: ['People and Society', 'Population growth rate', 'text'],
      category: 'people',
      rankingType: 'optimal',
      optimalValue: 1.5,
      optimalRange: [1.0, 2.0] // 1-2% is optimal
    },
    {
      id: 'people_median_age',
      label: 'Median Age',
      dataPath: ['People and Society', 'Median age', 'total', 'text'],
      category: 'people',
      rankingType: 'optimal',
      optimalValue: 35,
      optimalRange: [30, 40] // 30-40 years is optimal
    },
    {
      id: 'people_labor_force',
      label: 'Labor Force',
      dataPath: ['Economy', 'Labor force', 'Labor force - by occupation', 'text'],
      category: 'people',
      rankingType: 'higher',
      fallbackPaths: [
        ['Economy', 'Labor force', 'text'],
        ['People and Society', 'Labor force', 'text']
      ]
    },
    {
      id: 'people_dependency_ratio',
      label: 'Dependency Ratio',
      dataPath: ['People and Society', 'Dependency ratios', 'total dependency ratio', 'text'],
      category: 'people',
      rankingType: 'lower' // Lower is better
    },
    {
      id: 'people_sex_ratio',
      label: 'Sex Ratio',
      dataPath: ['People and Society', 'Sex ratio', 'total population', 'text'],
      category: 'people',
      rankingType: 'optimal',
      optimalValue: 1.0,
      optimalRange: [0.95, 1.05] // 0.95-1.05 males per female is optimal
    },
    {
      id: 'people_urban_population',
      label: 'Urban Population',
      dataPath: ['People and Society', 'Urbanization', 'urban population', 'text'],
      category: 'people',
      rankingType: 'higher'
    },
    {
      id: 'people_poverty_line',
      label: 'Population Below Poverty Line',
      dataPath: ['People and Society', 'Population below poverty line', 'text'],
      category: 'people',
      rankingType: 'lower' // Lower is better
    }
  ],

  // Category 2: Money (7 metrics)
  money: [
    {
      id: 'money_real_gdp_ppp',
      label: 'Real GDP (PPP)',
      dataPath: ['Economy', 'GDP (purchasing power parity)', 'text'],
      category: 'money',
      rankingType: 'higher',
      fallbackPaths: [
        ['Economy', 'GDP - purchasing power parity', 'text']
      ]
    },
    {
      id: 'money_gdp_per_capita',
      label: 'GDP per Capita',
      dataPath: ['Economy', 'Real GDP per capita', 'Real GDP per capita 2023', 'text'],
      category: 'money',
      rankingType: 'higher',
      fallbackPaths: [
        ['Economy', 'Real GDP per capita', 'text'],
        ['Economy', 'GDP - per capita (PPP)', 'text']
      ]
    },
    {
      id: 'money_gdp_growth',
      label: 'GDP Growth',
      dataPath: ['Economy', 'Real GDP growth rate', 'Real GDP growth rate 2023', 'text'],
      category: 'money',
      rankingType: 'higher',
      fallbackPaths: [
        ['Economy', 'Real GDP growth rate', 'text'],
        ['Economy', 'GDP - real growth rate', 'text']
      ]
    },
    {
      id: 'money_unemployment',
      label: 'Unemployment Rate',
      dataPath: ['Economy', 'Unemployment rate', 'Unemployment rate 2023', 'text'],
      category: 'money',
      rankingType: 'lower', // Lower is better
      fallbackPaths: [
        ['Economy', 'Unemployment rate', 'text']
      ]
    },
    {
      id: 'money_inflation',
      label: 'Inflation Rate',
      dataPath: ['Economy', 'Inflation rate (consumer prices)', 'Inflation rate (consumer prices) 2023', 'text'],
      category: 'money',
      rankingType: 'optimal',
      optimalValue: 2.0,
      optimalRange: [1.5, 2.5] // ~2% is optimal
    },
    {
      id: 'money_public_debt',
      label: 'Public Debt',
      dataPath: ['Economy', 'Public debt', 'text'],
      category: 'money',
      rankingType: 'lower', // Lower is better
      fallbackPaths: [
        ['Economy', 'Debt - external', 'text'] // Fallback if public debt not available
      ]
    },
    {
      id: 'money_external_debt',
      label: 'External Debt',
      dataPath: ['Economy', 'Debt - external', 'text'],
      category: 'money',
      rankingType: 'lower' // Lower is better
    }
  ],

  // Category 3: Reach (8 metrics)
  reach: [
    {
      id: 'reach_area',
      label: 'Area',
      dataPath: ['Geography', 'Area', 'total', 'text'],
      category: 'reach',
      rankingType: 'higher',
      tiebreakers: [
        { id: 'reach_land_area', dataPath: ['Geography', 'Area', 'land', 'text'] },
        { id: 'reach_water_area', dataPath: ['Geography', 'Area', 'water', 'text'] },
        { id: 'reach_coastline', dataPath: ['Geography', 'Coastline', 'text'] }
      ]
    },
    {
      id: 'reach_electricity_consumption',
      label: 'Electricity Consumption',
      dataPath: ['Energy', 'Electricity', 'consumption', 'text'],
      category: 'reach',
      rankingType: 'higher'
    },
    {
      id: 'reach_electricity_capacity',
      label: 'Electricity Generation Capacity',
      dataPath: ['Energy', 'Electricity', 'installed generating capacity', 'text'],
      category: 'reach',
      rankingType: 'higher'
    },
    {
      id: 'reach_nuclear_capacity',
      label: 'Nuclear Energy Capacity',
      dataPath: ['Energy', 'Nuclear energy', 'Net capacity of operational nuclear reactors', 'text'],
      category: 'reach',
      rankingType: 'higher',
      optional: true // Not all countries have nuclear
    },
    {
      id: 'reach_internet_users',
      label: 'Internet Users',
      dataPath: ['Communications', 'Internet users', 'percent of population', 'text'],
      category: 'reach',
      rankingType: 'higher'
    },
    {
      id: 'reach_military_expenditures',
      label: 'Military Expenditures',
      dataPath: ['Military and Security', 'Military expenditures', 'Military Expenditures 2024', 'text'],
      category: 'reach',
      rankingType: 'optimal',
      optimalValue: 2.5,
      optimalRange: [2.0, 3.0], // 2-3% of GDP is optimal
      fallbackPaths: [
        ['Military and Security', 'Military expenditures', 'Military Expenditures 2023', 'text'],
        ['Military and Security', 'Military expenditures', 'text']
      ]
    },
    {
      id: 'reach_airports',
      label: 'Airports',
      dataPath: ['Transportation', 'Airports', 'text'],
      category: 'reach',
      rankingType: 'higher'
    },
    {
      id: 'reach_ports',
      label: 'Ports',
      dataPath: ['Transportation', 'Ports', 'total ports', 'text'],
      category: 'reach',
      rankingType: 'higher'
    },
    {
      id: 'reach_land_boundaries',
      label: 'Land Boundaries',
      dataPath: ['Geography', 'Land boundaries', 'total', 'text'],
      category: 'reach',
      rankingType: 'higher',
      optional: true // Not part of core 23, but used for stats tab ranking
    }
  ]
};

/**
 * Get all metrics as a flat array
 */
export function getAllMetrics() {
  return [
    ...LEADERBOARD_METRICS.people,
    ...LEADERBOARD_METRICS.money,
    ...LEADERBOARD_METRICS.reach
  ];
}

/**
 * Get metrics by category
 */
export function getMetricsByCategory(category) {
  return LEADERBOARD_METRICS[category] || [];
}

/**
 * Get a specific metric by ID
 */
export function getMetricById(metricId) {
  const allMetrics = getAllMetrics();
  return allMetrics.find(m => m.id === metricId);
}
