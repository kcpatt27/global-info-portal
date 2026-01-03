# Global Superpower Leaderboard - Metrics Analysis

## User's Proposed Metrics

### Demographics & Population
- ✅ Population
- ✅ Population growth
- ✅ Median age
- ✅ Urban population

### Economy - Size & Power
- ✅ GDP
- ✅ GDP growth
- ✅ GDP per capita
- ✅ Real GDP (Purchasing Power Parity - PPP)

### Economy - Health & Stability
- ✅ Unemployment rate
- ✅ Inflation rate (Consumer Price Index)
- ✅ Current account balance (2024)
- ✅ Public debt
- ✅ External debt (latest year available)

### Economy - Development & Investment
- ✅ Expenditures
- ✅ Investment in fixed capital
- ✅ Population below poverty line

### Geography
- ✅ Area
- ✅ Land area
- ✅ Water area
- ✅ Coastline

### Trade & Industry
- ⚠️ Export partners
- ⚠️ Exports
- ⚠️ Imports
- ⚠️ Industry

### Labor
- ⚠️ Labor force

---

## Redundancy Analysis

### Redundant Pairs (Pick One)
1. **GDP vs Real GDP (PPP)**
   - **Recommendation:** Use **Real GDP (PPP)** - more accurate for cross-country comparison
   - GDP (official exchange rate) can be misleading due to currency fluctuations
   - PPP adjusts for cost of living differences

2. **Area vs Land Area**
   - **Recommendation:** Use **Area (total)** as primary, with **Land Area → Water Area → Coastline** as tiebreakers
   - Total area is most comprehensive, but tiebreakers provide granularity

3. **Exports vs Export Partners**
   - **Recommendation:** Use **Exports (total value)** - simpler, more comparable
   - Export partners is qualitative/descriptive, harder to rank

4. **Labor Force**
   - **Recommendation:** **Keep** - important distinction between population and active workforce
   - High population but low labor force indicates weakness (dependency ratio issues)

### Related but Distinct (Keep Both)
- **GDP vs GDP per capita** - Different dimensions (total power vs development)
- **GDP vs GDP growth** - Different dimensions (current size vs trajectory)
- **Public debt vs External debt** - Different types of debt (internal vs foreign)
- **Unemployment vs Inflation** - Different aspects of economic health
- **Population vs Population growth** - Different dimensions (size vs trajectory)

---

## Recommended Core Metrics: Three-Category System

**Scoring Method:** Rank-based sum within each category, then combine into unified **Influence Scale**

### Category Structure
1. **People** - All population and demographic metrics
2. **Money** - All GDP, debt, and economic metrics  
3. **Reach** - Geographic, energy, infrastructure, and other influence indicators

**Influence Scale** = People Score + Money Score + Reach Score (lower total = higher influence)

---

### Category 1: People (8 metrics)
**Sum of ranks = People Score (lower is better)**

1. **Population**
   - Data path: `People and Society.Population.total.text`
   - Why: Core indicator of human capital and market size
   - Higher is better (rank 1 = best)

2. **Population Growth**
   - Data path: `People and Society.Population growth rate.text`
   - Why: Demographic trajectory
   - **Optimal range scoring:** ~1-2% is best (penalize extremes)
   - Rank based on distance from optimal (closer to 1.5% = better rank)

3. **Median Age**
   - Data path: `People and Society.Median age.total.text`
   - Why: Demographic structure - too old or too young limits economic capacity
   - **Optimal range scoring:** ~30-40 years is best (penalize extremes)
   - Rank based on distance from optimal (closer to 35 = better rank)

4. **Labor Force**
   - Data path: `Economy.Labor force.Labor force - by occupation.text` or similar
   - Why: Active workforce - high population but low labor force shows weakness
   - Higher is better (rank 1 = best)

5. **Dependency Ratio**
   - Data path: `People and Society.Dependency ratios.total dependency ratio.text`
   - Why: Economic burden - ratio of dependents (0-14, 65+) to working-age (15-64) population
   - Lower is better (inverse ranking: rank 1 = lowest dependency ratio)
   - Lower ratio = more working-age people supporting fewer dependents = economic advantage

6. **Sex Ratio**
   - Data path: `People and Society.Sex ratio.total population.text` (e.g., "1.01 male(s)/female")
   - Why: Demographic balance - significant imbalances can affect labor markets and social stability
   - **Optimal range scoring:** ~0.95-1.05 males per female is best (penalize extremes)
   - Rank based on distance from optimal (closer to 1.0 = better rank)

7. **Urban Population**
   - Data path: `People and Society.Urbanization.urban population.text`
   - Why: Development and infrastructure capacity
   - Higher is better (rank 1 = highest urbanization)

8. **Population Below Poverty Line**
   - Data path: `People and Society.Population below poverty line.text`
   - Why: Social development and stability
   - Lower is better (inverse ranking: rank 1 = lowest poverty)

---

### Category 2: Money (7 metrics)
**Sum of ranks = Money Score (lower is better)**

1. **Real GDP (PPP)**
   - Data path: `Economy.GDP (purchasing power parity).text` or `Economy.GDP - purchasing power parity.text`
   - Why: Most accurate measure of economic size
   - Higher is better (rank 1 = best)

2. **GDP per Capita**
   - Data path: `Economy.Real GDP per capita.Real GDP per capita 2023.text`
   - Why: Development level and quality of economy
   - Higher is better (rank 1 = best)

3. **GDP Growth**
   - Data path: `Economy.Real GDP growth rate.Real GDP growth rate 2023.text`
   - Why: Economic trajectory and momentum
   - Higher is better (rank 1 = best)

4. **Unemployment Rate**
   - Data path: `Economy.Unemployment rate.Unemployment rate 2023.text`
   - Why: Labor market health
   - Lower is better (inverse ranking: rank 1 = lowest unemployment)

5. **Inflation Rate**
   - Data path: `Economy.Inflation rate (consumer prices).Inflation rate (consumer prices) 2023.text`
   - Why: Economic stability
   - **Optimal range scoring:** ~2% is best (penalize deflation and high inflation)
   - Rank based on distance from optimal (closer to 2% = better rank)

6. **Public Debt**
   - Data path: `Economy.Public debt.text` (latest year)
   - Why: Fiscal health
   - Lower is better (inverse ranking: rank 1 = lowest debt)

7. **External Debt**
   - Data path: `Economy.Debt - external.text` (latest year)
   - Why: Financial independence
   - Lower is better (inverse ranking: rank 1 = lowest debt)

---

### Category 3: Reach (8 metrics)
**Sum of ranks = Reach Score (lower is better)**
*Geographic, energy, infrastructure, technology, and other indicators of global influence*

1. **Area** (with tiebreaker hierarchy)
   - Primary: `Geography.Area.total.text`
   - Tiebreaker 1: `Geography.Area.land.text` (Land Area)
   - Tiebreaker 2: `Geography.Area.water.text` (Water Area)
   - Tiebreaker 3: `Geography.Coastline.text` (Coastline)
   - Why: Geographic size and resources
   - Higher is better (rank 1 = best)

2. **Electricity Consumption**
   - Data path: `Energy.Electricity.consumption.text`
   - Why: Industrial capacity and development level
   - Higher is better (rank 1 = best)

3. **Electricity Generation Capacity**
   - Data path: `Energy.Electricity.installed generating capacity.text`
   - Why: Energy infrastructure and production capability
   - Higher is better (rank 1 = best)

4. **Nuclear Energy Capacity** (if available)
   - Data path: `Energy.Nuclear energy.Net capacity of operational nuclear reactors.text`
   - Why: Advanced energy infrastructure and technological capability
   - Higher is better (rank 1 = best)

5. **Internet Users** (percent of population)
   - Data path: `Communications.Internet users.percent of population.text`
   - Why: Digital infrastructure and technological connectivity
   - Higher is better (rank 1 = best)
   - Indicates technological reach and digital economy capacity

6. **Military Expenditures** (% of GDP)
   - Data path: `Military and Security.Military expenditures.Military Expenditures 2024.text` (use latest year)
   - Why: Military influence and global security presence
   - **Optimal range scoring:** Moderate spending is best (too low = weak defense, too high = economic burden)
   - Rank based on distance from optimal (closer to ~2-3% = better rank, but context-dependent)

7. **Airports** (total count)
   - Data path: `Transportation.Airports.text`
   - Why: Transportation infrastructure and global connectivity
   - Higher is better (rank 1 = best)
   - Indicates ability to move people and goods globally

8. **Ports** (total count)
   - Data path: `Transportation.Ports.total ports.text`
   - Why: Maritime infrastructure and trade capacity
   - Higher is better (rank 1 = best)
   - Indicates global trade connectivity and maritime influence

---

## Scoring Algorithm: Three-Category Influence Scale

### Method: Category-Based Rank Sum
**Calculate score for each category, then combine into unified Influence Scale**

```javascript
function calculateInfluenceScale(countryCode) {
  // Category 1: People
  const peopleMetrics = [
    'population',
    'population_growth',  // Optimal range
    'median_age',         // Optimal range
    'labor_force',
    'dependency_ratio',    // Inverse ranking
    'sex_ratio',          // Optimal range
    'urban_population',
    'poverty_line'        // Inverse ranking
  ];
  
  // Category 2: Money
  const moneyMetrics = [
    'real_gdp_ppp',
    'gdp_per_capita',
    'gdp_growth',
    'unemployment',       // Inverse ranking
    'inflation',          // Optimal range
    'public_debt',        // Inverse ranking
    'external_debt'       // Inverse ranking
  ];
  
  // Category 3: Reach
  const reachMetrics = [
    'area',               // With tiebreaker hierarchy
    'electricity_consumption',
    'electricity_capacity',
    'nuclear_capacity',    // Optional
    'internet_users',      // Percent of population
    'military_expenditures', // Optimal range (% of GDP)
    'airports',           // Total count
    'ports'               // Total count
  ];
  
  // Calculate category scores
  const peopleScore = calculateCategoryScore(peopleMetrics, countryCode);
  const moneyScore = calculateCategoryScore(moneyMetrics, countryCode);
  const reachScore = calculateCategoryScore(reachMetrics, countryCode);
  
  // Influence Scale = sum of all three category scores
  const influenceScale = peopleScore.totalRank + moneyScore.totalRank + reachScore.totalRank;
  
  return {
    influenceScale: influenceScale,  // Lower = better (like golf)
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

function calculateCategoryScore(metrics, countryCode) {
  let totalRank = 0;
  let metricsCounted = 0;
  
  metrics.forEach(metricId => {
    const ranking = globalDataIndex.getRanking(metricId, countryCode);
    if (ranking && ranking.rank > 0) {
      totalRank += ranking.rank;
      metricsCounted++;
    }
  });
  
  return {
    totalRank: totalRank,
    metricsCounted: metricsCounted,
    averageRank: metricsCounted > 0 ? totalRank / metricsCounted : null
  };
}
```

### Ranking Logic

**Standard Metrics** (higher value = better rank):
- Population, Real GDP (PPP), GDP per Capita, Area, Labor Force, GDP Growth, Urban Population
- Rank 1 = highest value, Rank N = lowest value

**Inverse Metrics** (lower value = better rank):
- Unemployment, Public Debt, External Debt, Poverty Line
- Rank 1 = lowest value, Rank N = highest value
- Implementation: Sort ascending instead of descending

**Optimal Range Metrics** (closest to optimal = better rank):
- **Median Age**: Optimal ~30-40 years
  - Calculate distance from optimal: `Math.abs(medianAge - 35)`
  - Rank 1 = closest to 35, Rank N = farthest from 35
  
- **Population Growth**: Optimal ~1-2%
  - Calculate distance from optimal: `Math.abs(popGrowth - 1.5)`
  - Rank 1 = closest to 1.5%, Rank N = farthest from 1.5%
  
- **Inflation**: Optimal ~2%
  - Calculate distance from optimal: `Math.abs(inflation - 2)`
  - Rank 1 = closest to 2%, Rank N = farthest from 2%

- **Sex Ratio**: Optimal ~1.0 (1.0 male per female)
  - Calculate distance from optimal: `Math.abs(sexRatio - 1.0)`
  - Rank 1 = closest to 1.0, Rank N = farthest from 1.0
  - Normal range: 0.95-1.05 is considered balanced

- **Military Expenditures**: Optimal range ~2-3% of GDP (context-dependent)
  - Calculate distance from optimal: `Math.abs(militaryExpenditure - 2.5)`
  - Rank 1 = closest to 2.5%, Rank N = farthest from 2.5%
  - Note: Some countries may legitimately need higher spending (security concerns), but very high spending (>5%) can indicate economic burden

### Area Tiebreaker Hierarchy
When countries tie on Area ranking, use this order:
1. **Total Area** (primary)
2. **Land Area** (tiebreaker 1)
3. **Water Area** (tiebreaker 2)
4. **Coastline** (tiebreaker 3)

```javascript
function rankByArea(countries) {
  // Sort by total area first
  countries.sort((a, b) => {
    // Primary: Total Area
    if (a.area !== b.area) return b.area - a.area;
    
    // Tiebreaker 1: Land Area
    if (a.landArea !== b.landArea) return b.landArea - a.landArea;
    
    // Tiebreaker 2: Water Area
    if (a.waterArea !== b.waterArea) return b.waterArea - a.waterArea;
    
    // Tiebreaker 3: Coastline
    return (b.coastline || 0) - (a.coastline || 0);
  });
  
  // Assign ranks
  countries.forEach((country, index) => {
    country.areaRank = index + 1;
  });
}
```

### Tiebreaking Strategy

**Primary Ranking: Influence Scale**
- Sum of all three category scores (People + Money + Reach)
- Lower total = better position (like golf scoring)

**Tiebreaker 1: Category Breakdown**
- If countries have same Influence Scale, compare category scores:
  1. Compare People scores (lower = better)
  2. If tied, compare Money scores (lower = better)
  3. If tied, compare Reach scores (lower = better)

**Tiebreaker 2: Individual Metric Comparison**
- If still tied, compare individual metrics within categories:
  1. Compare highest-ranked metric in People category
  2. Compare highest-ranked metric in Money category
  3. Compare highest-ranked metric in Reach category

**Tiebreaker 3: Weighted Percentage (Final)**
- If still tied, use weighted percentage calculation
- Only used as absolute last resort
- Weights: Real GDP PPP (25%), Population (20%), Area (15%), GDP per Capita (15%), Labor Force (10%), GDP Growth (10%), Electricity Consumption (5%)

### Missing Data Handling

**Per-Category Approach** (Recommended)
- If metric is missing within a category, exclude from that category's calculation
- Calculate category score as: `totalRank / metricsCounted`
- Countries with more complete data in a category have slight advantage (fair)
- If entire category is missing, use worst-case rank for that category (penalty for incomplete data)

**Example:**
- Country A: Has all 6 People metrics → People Score = sum of 6 ranks
- Country B: Has 4 of 6 People metrics → People Score = sum of 4 ranks / 4 (average)
- Country C: Has 0 People metrics → People Score = worst-case rank (penalty)

**Recommendation:** Use per-category exclusion with average calculation. This balances fairness (not penalizing for missing optional metrics) with data quality incentives (penalizing for missing entire categories).

---

## G20 Pre-Caching Strategy

### G20 Countries List
```javascript
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
  { code: 'za', name: 'South Africa', folder: 'africa' },
  { code: 'eu', name: 'European Union', folder: 'europe' } // Special case
];
```

### Implementation
```javascript
// On page load, pre-fetch G20 countries
async function preCacheG20Countries() {
  const g20Codes = G20_COUNTRIES.map(c => c.code);
  
  // Fetch in parallel (with rate limiting)
  const fetchPromises = g20Codes.map(async (code, index) => {
    // Stagger requests slightly to avoid overwhelming API
    await new Promise(resolve => setTimeout(resolve, index * 100));
    
    try {
      const countryData = await fetchCountryData(code);
      // Process and cache metrics for leaderboard
      processCountryMetricsForLeaderboard(countryData, code);
    } catch (error) {
      console.warn(`Failed to pre-cache ${code}:`, error);
    }
  });
  
  await Promise.all(fetchPromises);
  console.log('G20 countries pre-cached for leaderboard');
}
```

### Benefits
- Leaderboard ready immediately on Rankings tab load
- No waiting for user to click countries
- Better UX - instant rankings
- Foundation for future "faction" highlighting

---

## Future: Global "Factions" Feature

### Faction Definitions
```javascript
const GLOBAL_FACTIONS = {
  g20: {
    name: 'G20',
    countries: ['us', 'ca', 'mx', 'br', 'ar', 'gb', 'fr', 'de', 'it', 'ru', 'cn', 'jp', 'in', 'kr', 'id', 'au', 'sa', 'tr', 'za', 'eu'],
    color: '#4A90E2',
    description: 'Group of Twenty major economies'
  },
  fiveEyes: {
    name: 'Five Eyes',
    countries: ['us', 'gb', 'ca', 'au', 'nz'],
    color: '#E24A4A',
    description: 'Intelligence alliance'
  },
  nato: {
    name: 'NATO',
    countries: ['us', 'ca', 'gb', 'fr', 'de', 'it', 'es', 'pt', 'nl', 'be', 'dk', 'no', 'pl', 'cz', 'gr', 'tr', 'hu', 'ro', 'bg', 'sk', 'si', 'ee', 'lv', 'lt', 'hr', 'al', 'me', 'mk', 'fi', 'se'],
    color: '#4AE24A',
    description: 'North Atlantic Treaty Organization'
  },
  brics: {
    name: 'BRICS',
    countries: ['br', 'ru', 'in', 'cn', 'za'],
    color: '#E2B84A',
    description: 'Brazil, Russia, India, China, South Africa'
  },
  eu: {
    name: 'European Union',
    countries: ['at', 'be', 'bg', 'hr', 'cy', 'cz', 'dk', 'ee', 'fi', 'fr', 'de', 'gr', 'hu', 'ie', 'it', 'lv', 'lt', 'lu', 'mt', 'nl', 'pl', 'pt', 'ro', 'sk', 'si', 'es', 'se'],
    color: '#4A4AE2',
    description: 'European Union member states'
  }
};
```

### UI Features
- **Map highlighting:** Highlight all countries in selected faction
- **Leaderboard filter:** Show only countries in selected faction
- **Faction comparison:** Compare average scores across factions
- **Toggle overlay:** Show/hide faction memberships on map

---

## Implementation Recommendations

### Phase 1: Core Metrics (Start Here)
1. Implement Tier A metrics (6 essential power indicators)
2. Build basic scoring algorithm
3. Test with G20 countries

### Phase 2: Add Health Metrics
1. Add Tier B metrics (economic health)
2. Implement inverse scoring for debt/unemployment/inflation
3. Refine weights based on results

### Phase 3: Quality of Life
1. Add Tier C metrics
2. Implement optimal range scoring for median age/pop growth
3. Final weight tuning

### Phase 4: G20 Pre-Caching
1. Implement pre-cache on page load
2. Show loading indicator
3. Display leaderboard immediately when ready

### Phase 5: Factions Feature
1. Define faction data structures
2. Add map highlighting
3. Add leaderboard filtering
4. Add faction comparison views

---

## Questions to Consider

1. **Data Availability:** Do all G20 countries have all metrics? May need fallbacks.
2. **Year Consistency:** Some metrics use 2023, some 2024 - how to handle?
3. **EU Special Case:** EU is in G20 but not a country - how to handle?
4. **Weight Tuning:** Initial weights are estimates - may need adjustment after testing
5. **Missing Data Strategy:** Average score vs exclusion vs interpolation?
