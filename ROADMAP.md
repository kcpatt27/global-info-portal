# Global Information Portal Roadmap

## Vision
"Interactive map of the countries/territories, featuring detailed data points with various methods of visualizing and comparing them."

## Current Phase
**Now** 
- Global Superpower Leaderboard refinements
- Spider chart and color bar visualization improvements
- Fixed scoring system using raw data values (not ranks)
- Mobile CSS fixes and responsive design

## Completed Recently
- [x] **Global Superpower Leaderboard** — Composite ranking system based on 5 categories
- [x] **Fixed Reference Scale Scoring** — Scores now stable regardless of loaded countries
- [x] **Spider Chart Visualization** — Shows category performance in expanded country view
- [x] **Category Color Bar** — Visual breakdown of influence score contribution
- [x] **Quality Category** — Added Health, Education, and Sustainability metrics
- [x] **Progressive Caching** — Background loading of secondary countries
- [x] **Load All Countries** — Manual trigger to load all available country data

## Roadmap

### Now (Next 2-4 weeks)

- [ ] **Resource Efficiency Metrics** — Show production vs consumption ratios
  - Calculate net energy position (production - consumption) for:
    - Coal (production vs consumption = net surplus/deficit)
    - Natural Gas (production vs consumption)
    - Petroleum (production vs consumption)
    - Electricity (generation vs consumption)
  - Priority: High - enhances Resources category meaningfulness
  - Effort: ~3-5 days
  - Implementation notes:
    - Add computed metrics to leaderboardMetrics.js
    - Modify extractMetricValue to support computed values
    - Add reference scales for efficiency ratios (positive = net exporter, negative = net importer)

- [ ] **Chart Visualizations** — Enhanced data visualization
  - Bar charts for metric comparisons
  - Pie charts for category breakdowns
  - Choropleth maps for global metric distribution
  - Heat maps for regional comparisons
  - Priority: High - core visualization feature
  - Effort: ~2 weeks

- [ ] **Mobile CSS Refinements** — Improve mobile user experience
  - Fix touch interactions on leaderboard
  - Optimize panel transitions
  - Improve responsive breakpoints
  - Priority: Medium
  - Effort: ~1 week

### Next (Months 2-3)

- [ ] **Regional Comparisons** — Compare countries within regions
  - Group countries by continent/region
  - Show regional rankings alongside global
  - Regional average benchmarks
  - Value: More meaningful context for smaller nations

- [ ] **Historical Trends** — Time-series data visualization
  - GDP growth over time
  - Population trends
  - Trade balance evolution
  - Blocked by: Reliable historical data source

- [ ] **Search & Filter** — Find countries quickly
  - Search by name, code, or region
  - Filter leaderboard by category strengths
  - Sort by specific metrics

### Later (Exploratory/Future)

- [ ] **Custom Weighting** — Let users adjust category weights for influence score
- [ ] **Country Comparison Mode** — Side-by-side detailed comparison of 2-3 countries
- [ ] **Data Export** — Download leaderboard data as CSV/JSON
- [ ] **Embedding** — Allow embedding leaderboard widget on other sites
- [ ] **API Access** — Public API for programmatic access to scores

## Technical Debt & Improvements

- [ ] **FIPS to ISO Code Mapping** — Complete mapping for all CIA Factbook codes
- [ ] **Cache Optimization** — Improve localStorage cache efficiency
- [ ] **Error Boundaries** — Better error handling for failed data fetches
- [ ] **Unit Tests** — Add tests for scoring calculations

## Success Metrics

- Leaderboard loads in under 5 seconds for priority countries
- All major nations (G20, NATO, BRICS) display correctly
- Scores remain stable across page refreshes
- Mobile users can navigate leaderboard smoothly

## Risks & Dependencies

- **Dependency:** CIA Factbook API availability and data freshness
- **Risk:** FIPS code mismatches causing countries to not load (mitigation: comprehensive code mapping)
- **Risk:** Large data payloads on mobile (mitigation: progressive loading, caching)

## How This Roadmap Gets Updated

- Reviewed weekly during development sessions
- Updated based on user feedback and bug reports
- Priorities adjusted based on technical learnings

---
*Last updated: Session with resource efficiency metric planning*
