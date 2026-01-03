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
      dataPath: ['Economy', 'Real GDP (purchasing power parity)', 'Real GDP (purchasing power parity) 2023', 'text'],
      category: 'money',
      rankingType: 'higher',
      fallbackPaths: [
        ['Economy', 'Real GDP (purchasing power parity)', 'Real GDP (purchasing power parity) 2022', 'text'],
        ['Economy', 'Real GDP (purchasing power parity)', 'Real GDP (purchasing power parity) 2021', 'text'],
        ['Economy', 'GDP (official exchange rate)', 'text'],
        ['Economy', 'GDP (purchasing power parity)', 'text']
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

  // Category 3: Reach (6 core metrics)
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
    // Military Strength
    {
      id: 'reach_military_personnel',
      label: 'Military Personnel',
      dataPath: ['Military and Security', 'Military and security service personnel strengths', 'text'],
      category: 'reach',
      rankingType: 'higher'
    },
    {
      id: 'reach_military_deployments',
      label: 'Military Deployments',
      dataPath: ['Military and Security', 'Military deployments', 'text'],
      category: 'reach',
      rankingType: 'higher',
      optional: true
    },
    {
      id: 'reach_land_boundaries',
      label: 'Land Boundaries',
      dataPath: ['Geography', 'Land boundaries', 'total', 'text'],
      category: 'reach',
      rankingType: 'higher',
      optional: true // Not part of core 23, but used for stats tab ranking
    },
    {
      id: 'reach_land_area',
      label: 'Land Area',
      dataPath: ['Geography', 'Area', 'land', 'text'],
      category: 'reach',
      rankingType: 'higher',
      optional: true // Used for stats tab ranking
    },
    {
      id: 'reach_water_area',
      label: 'Water Area',
      dataPath: ['Geography', 'Area', 'water', 'text'],
      category: 'reach',
      rankingType: 'higher',
      optional: true // Used for stats tab ranking
    },
    {
      id: 'reach_coastline',
      label: 'Coastline',
      dataPath: ['Geography', 'Coastline', 'text'],
      category: 'reach',
      rankingType: 'higher',
      optional: true // Used for stats tab ranking
    }
  ],

  // Category 4: Resources (natural resources, energy production/reserves, land, water, agriculture)
  resources: [
    // Fossil Fuels - Reserves
    {
      id: 'resources_coal_reserves',
      label: 'Coal Reserves',
      dataPath: ['Energy', 'Coal', 'proven reserves', 'text'],
      category: 'resources',
      rankingType: 'higher',
      optional: true
    },
    {
      id: 'resources_petroleum_reserves',
      label: 'Petroleum Reserves',
      dataPath: ['Energy', 'Petroleum', 'crude oil estimated reserves', 'text'],
      category: 'resources',
      rankingType: 'higher',
      optional: true
    },
    {
      id: 'resources_natural_gas_reserves',
      label: 'Natural Gas Reserves',
      dataPath: ['Energy', 'Natural gas', 'proven reserves', 'text'],
      category: 'resources',
      rankingType: 'higher',
      optional: true
    },
    // Fossil Fuels - Production
    {
      id: 'resources_coal_production',
      label: 'Coal Production',
      dataPath: ['Energy', 'Coal', 'production', 'text'],
      category: 'resources',
      rankingType: 'higher',
      optional: true
    },
    {
      id: 'resources_petroleum_production',
      label: 'Petroleum Production',
      dataPath: ['Energy', 'Petroleum', 'total petroleum production', 'text'],
      category: 'resources',
      rankingType: 'higher',
      optional: true
    },
    {
      id: 'resources_natural_gas_production',
      label: 'Natural Gas Production',
      dataPath: ['Energy', 'Natural gas', 'production', 'text'],
      category: 'resources',
      rankingType: 'higher',
      optional: true
    },
    // Fossil Fuels - Consumption
    {
      id: 'resources_coal_consumption',
      label: 'Coal Consumption',
      dataPath: ['Energy', 'Coal', 'consumption', 'text'],
      category: 'resources',
      rankingType: 'higher',
      optional: true
    },
    {
      id: 'resources_petroleum_consumption',
      label: 'Petroleum Consumption',
      dataPath: ['Energy', 'Petroleum', 'refined petroleum consumption', 'text'],
      category: 'resources',
      rankingType: 'higher',
      optional: true
    },
    {
      id: 'resources_natural_gas_consumption',
      label: 'Natural Gas Consumption',
      dataPath: ['Energy', 'Natural gas', 'consumption', 'text'],
      category: 'resources',
      rankingType: 'higher',
      optional: true
    },
    // Electricity
    {
      id: 'resources_electricity_capacity',
      label: 'Electricity Generation Capacity',
      dataPath: ['Energy', 'Electricity', 'installed generating capacity', 'text'],
      category: 'resources',
      rankingType: 'higher'
    },
    {
      id: 'resources_electricity_consumption',
      label: 'Electricity Consumption',
      dataPath: ['Energy', 'Electricity', 'consumption', 'text'],
      category: 'resources',
      rankingType: 'higher',
      optional: true
    },
    {
      id: 'resources_energy_consumption',
      label: 'Energy Consumption per Capita',
      dataPath: ['Energy', 'Energy consumption per capita', 'Total energy consumption per capita 2022', 'text'],
      category: 'resources',
      rankingType: 'higher',
      optional: true,
      fallbackPaths: [
        ['Energy', 'Energy consumption per capita', 'text']
      ]
    },
    // Nuclear Energy
    {
      id: 'resources_nuclear_capacity',
      label: 'Nuclear Energy Capacity',
      dataPath: ['Energy', 'Nuclear energy', 'Net capacity of operational nuclear reactors', 'text'],
      category: 'resources',
      rankingType: 'higher',
      optional: true
    },
    {
      id: 'resources_nuclear_reactors',
      label: 'Nuclear Reactors',
      dataPath: ['Energy', 'Nuclear energy', 'Number of operational nuclear reactors', 'text'],
      category: 'resources',
      rankingType: 'higher',
      optional: true
    },
    {
      id: 'resources_nuclear_percent',
      label: 'Nuclear % of Electricity',
      dataPath: ['Energy', 'Nuclear energy', 'Percent of total electricity production', 'text'],
      category: 'resources',
      rankingType: 'higher',
      optional: true
    },
    // Renewable Energy Sources
    {
      id: 'resources_solar_capacity',
      label: 'Solar Energy Capacity',
      dataPath: ['Energy', 'Electricity generation sources', 'solar', 'text'],
      category: 'resources',
      rankingType: 'higher',
      optional: true
    },
    {
      id: 'resources_wind_capacity',
      label: 'Wind Energy Capacity',
      dataPath: ['Energy', 'Electricity generation sources', 'wind', 'text'],
      category: 'resources',
      rankingType: 'higher',
      optional: true
    },
    {
      id: 'resources_hydro_capacity',
      label: 'Hydroelectric Capacity',
      dataPath: ['Energy', 'Electricity generation sources', 'hydroelectricity', 'text'],
      category: 'resources',
      rankingType: 'higher',
      optional: true
    },
    {
      id: 'resources_geothermal_capacity',
      label: 'Geothermal Capacity',
      dataPath: ['Energy', 'Electricity generation sources', 'geothermal', 'text'],
      category: 'resources',
      rankingType: 'higher',
      optional: true
    },
    {
      id: 'resources_biomass_capacity',
      label: 'Biomass & Waste Capacity',
      dataPath: ['Energy', 'Electricity generation sources', 'biomass and waste', 'text'],
      category: 'resources',
      rankingType: 'higher',
      optional: true
    },
    // Land Resources
    {
      id: 'resources_arable_land',
      label: 'Arable Land',
      dataPath: ['Geography', 'Land use', 'arable land', 'text'],
      category: 'resources',
      rankingType: 'higher',
      optional: true
    },
    {
      id: 'resources_agricultural_land',
      label: 'Agricultural Land',
      dataPath: ['Geography', 'Land use', 'agricultural land', 'text'],
      category: 'resources',
      rankingType: 'higher',
      optional: true
    },
    {
      id: 'resources_forest',
      label: 'Forest',
      dataPath: ['Geography', 'Land use', 'forest', 'text'],
      category: 'resources',
      rankingType: 'higher',
      optional: true
    },
    {
      id: 'resources_permanent_crops',
      label: 'Permanent Crops',
      dataPath: ['Geography', 'Land use', 'permanent crops', 'text'],
      category: 'resources',
      rankingType: 'higher',
      optional: true
    },
    {
      id: 'resources_permanent_pasture',
      label: 'Permanent Pasture',
      dataPath: ['Geography', 'Land use', 'permanent pasture', 'text'],
      category: 'resources',
      rankingType: 'higher',
      optional: true
    },
    // Water Resources
    {
      id: 'resources_renewable_water',
      label: 'Renewable Water Resources',
      dataPath: ['Geography', 'Total renewable water resources', 'text'],
      category: 'resources',
      rankingType: 'higher',
      optional: true
    },
    {
      id: 'resources_irrigated_land',
      label: 'Irrigated Land',
      dataPath: ['Geography', 'Irrigated land', 'text'],
      category: 'resources',
      rankingType: 'higher',
      optional: true
    },
    // Agriculture & Industry
    {
      id: 'resources_agriculture_gdp',
      label: 'Agriculture % of GDP',
      dataPath: ['Economy', 'GDP - composition, by sector of origin', 'agriculture', 'text'],
      category: 'resources',
      rankingType: 'higher',
      optional: true
    },
    {
      id: 'resources_industry_gdp',
      label: 'Industry % of GDP',
      dataPath: ['Economy', 'GDP - composition, by sector of origin', 'industry', 'text'],
      category: 'resources',
      rankingType: 'higher',
      optional: true
    }
  ],

  // Category 5: Quality (health, education, sustainability)
  quality: [
    // Health - Life & Mortality
    {
      id: 'quality_life_expectancy',
      label: 'Life Expectancy',
      dataPath: ['People and Society', 'Life expectancy at birth', 'total population', 'text'],
      category: 'quality',
      rankingType: 'higher'
    },
    {
      id: 'quality_infant_mortality',
      label: 'Infant Mortality Rate',
      dataPath: ['People and Society', 'Infant mortality rate', 'total', 'text'],
      category: 'quality',
      rankingType: 'lower' // Lower is better
    },
    {
      id: 'quality_death_rate',
      label: 'Death Rate',
      dataPath: ['People and Society', 'Death rate', 'text'],
      category: 'quality',
      rankingType: 'lower' // Lower is better
    },
    {
      id: 'quality_birth_rate',
      label: 'Birth Rate',
      dataPath: ['People and Society', 'Birth rate', 'text'],
      category: 'quality',
      rankingType: 'optimal',
      optimalValue: 15,
      optimalRange: [12, 18] // 12-18 births/1000 is healthy replacement
    },
    {
      id: 'quality_fertility_rate',
      label: 'Fertility Rate',
      dataPath: ['People and Society', 'Total fertility rate', 'text'],
      category: 'quality',
      rankingType: 'optimal',
      optimalValue: 2.1,
      optimalRange: [1.8, 2.5] // Around replacement rate
    },
    // Health - Healthcare Access
    {
      id: 'quality_physicians',
      label: 'Physicians Density',
      dataPath: ['People and Society', 'Physicians density', 'text'],
      category: 'quality',
      rankingType: 'higher'
    },
    {
      id: 'quality_hospital_beds',
      label: 'Hospital Bed Density',
      dataPath: ['People and Society', 'Hospital bed density', 'text'],
      category: 'quality',
      rankingType: 'higher'
    },
    {
      id: 'quality_obesity',
      label: 'Obesity Rate',
      dataPath: ['People and Society', 'Obesity - adult prevalence rate', 'text'],
      category: 'quality',
      rankingType: 'lower' // Lower is better
    },
    // Health - Sanitation & Water
    {
      id: 'quality_drinking_water',
      label: 'Drinking Water Access',
      dataPath: ['People and Society', 'Drinking water source', 'improved: total', 'text'],
      category: 'quality',
      rankingType: 'higher',
      fallbackPaths: [
        ['People and Society', 'Drinking water source', 'improved: urban', 'text']
      ]
    },
    {
      id: 'quality_sanitation',
      label: 'Sanitation Access',
      dataPath: ['People and Society', 'Sanitation facility access', 'improved: total', 'text'],
      category: 'quality',
      rankingType: 'higher',
      fallbackPaths: [
        ['People and Society', 'Sanitation facility access', 'improved: urban', 'text']
      ]
    },
    // Education
    {
      id: 'quality_education_expenditure',
      label: 'Education Expenditure',
      dataPath: ['People and Society', 'Education expenditures', 'text'],
      category: 'quality',
      rankingType: 'higher'
    },
    {
      id: 'quality_literacy',
      label: 'Literacy Rate',
      dataPath: ['People and Society', 'Literacy', 'total population', 'text'],
      category: 'quality',
      rankingType: 'higher'
    },
    {
      id: 'quality_school_life',
      label: 'School Life Expectancy',
      dataPath: ['People and Society', 'School life expectancy (primary to tertiary education)', 'total', 'text'],
      category: 'quality',
      rankingType: 'higher'
    },
    // Sustainability - Emissions
    {
      id: 'quality_co2_emissions',
      label: 'CO2 Emissions',
      dataPath: ['Energy', 'Carbon dioxide emissions', 'total emissions', 'text'],
      category: 'quality',
      rankingType: 'lower', // Lower is better for environment
      optional: true
    },
    {
      id: 'quality_particulate_matter',
      label: 'Particulate Matter',
      dataPath: ['Environment', 'Air pollutants', 'particulate matter emissions', 'text'],
      category: 'quality',
      rankingType: 'lower', // Lower is better
      optional: true
    },
    {
      id: 'quality_methane_emissions',
      label: 'Methane Emissions',
      dataPath: ['Environment', 'Air pollutants', 'methane emissions', 'text'],
      category: 'quality',
      rankingType: 'lower', // Lower is better
      optional: true
    },
    // Sustainability - Waste
    {
      id: 'quality_waste_recycled',
      label: 'Waste Recycled %',
      dataPath: ['Environment', 'Waste and recycling', 'percent of municipal solid waste recycled', 'text'],
      category: 'quality',
      rankingType: 'higher',
      optional: true
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
    ...LEADERBOARD_METRICS.reach,
    ...LEADERBOARD_METRICS.resources,
    ...LEADERBOARD_METRICS.quality
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
