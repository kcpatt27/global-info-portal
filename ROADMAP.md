# Global Information Portal Roadmap

## Vision
"Interactive world map displaying comprehensive CIA World Factbook data for 240+ countries and territories, with advanced visualizations, comparative rankings, and geopolitical insights accessible to students, educators, travelers, and researchers worldwide."

## Current Phase: 90% Complete (Pre-release)

**Now (Next 2-4 weeks)** 
- Resource efficiency metrics implementation
- Enhanced chart visualizations (bar, pie, choropleth, heat maps)
- Mobile CSS refinements and touch interaction improvements

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
 
- [ ] **Fix chart bugs** — Resolve rendering and interaction issues in charts
  - Identify and fix data binding and redraw problems in spider, bar, and color-bar visualizations
  - Priority: High (affects data interpretation)
  - Effort: ~2-4 days

- [ ] **Fix mobile info panel disappearing** — Prevent info panel from being dismissed when scrolled to bottom on mobile
  - Investigate touch/pointer handlers and panel height calculations; preserve header visibility when collapsing
  - Priority: High (blocks mobile usability)
  - Effort: ~2-3 days

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
  - [X] Search by name
  - Search by code, region, rank in stat
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

- **Dependency:** CIA Factbook GitHub repository availability and data freshness
- **Risk:** FIPS to ISO code mismatches causing countries to fail loading (mitigation: comprehensive code mapping, ongoing fixes)
- **Risk:** Large data payloads on mobile devices (mitigation: progressive loading, aggressive caching, background fetching)
- **Risk:** GitHub raw URL changes or rate limiting (mitigation: fallback URL patterns, localStorage caching)
- **Dependency:** D3.js and TopoJSON CDN availability (mitigation: could bundle libraries in future)

## Development Process

**Built with:** Cursor AI (Claude 3.5 backend) + Webpack

**AI-assisted elements:**
- Initial HTML/CSS scaffolding and boilerplate structure
- Documentation generation (README, ROADMAP, ARCHITECTURE)
- Code refactoring suggestions and optimization proposals

**Manual/human elements:**
- Core application logic (map interactions, data fetching, state management)
- Leaderboard scoring algorithms and influence calculations
- All UI/UX design decisions and mobile optimizations
- Performance optimizations and caching strategies
- Testing and quality assurance
- Architecture decisions and technical trade-offs

**Why transparency?** Using AI strategically demonstrates tool fluency and judgment about what to automate vs. what requires human expertise. This transparency is especially important for technical writing and DevOps advocate roles.

## How This Roadmap Gets Updated

- Reviewed weekly during development sessions
- Updated based on user feedback and bug reports
- Priorities adjusted based on technical learnings

---

## Project Links

- **Live Site:** https://kcpatt27.github.io/global-information-portal/
- **GitHub Repo:** https://github.com/kcpatt27/global-information-portal
- **Data Source:** https://github.com/factbook/factbook.json
- **Documentation:** README.md, ARCHITECTURE.md, PROJECT_SPECS.md

---

*Last updated: January 9, 2025 — Documentation comprehensive update for portfolio presentation*
