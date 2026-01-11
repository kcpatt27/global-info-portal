# Global Information Portal Specifications

## Project Vision
"Interactive map of the world's countries and territories, featuring detailed CIA World Factbook data with comprehensive visualizations, rankings, and comparison tools."

## Current Status
- **Version:** Pre-release v1.0
- **Completion:** 90% complete
- **Last Updated:** January 9, 2025
- **Availability:** Public (GitHub Pages)

## Technology Stack
- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Visualization:** D3.js v5.6.0, TopoJSON v3.0.2
- **Icons & UI:** Font Awesome 5.15.4, Flag Icon CSS 3.12.0
- **Build Tools:** Webpack 5, Babel, PostCSS, Autoprefixer
- **External APIs:** CIA World Factbook JSON (via GitHub: `factbook/factbook.json`)
- **Hosting:** GitHub Pages
- **AI Tools Used:** Cursor (Claude 3.5) for scaffolding, documentation, and refactoring assistance

## Key Features (Completed)
- [x] **Interactive World Map** — D3.js-powered map with country selection and zoom
- [x] **Comprehensive Country Data** — 7+ categories: Geography, People & Society, Economy, Energy, Military, Transportation, Communications
- [x] **Global Superpower Leaderboard** — Composite influence scoring across 5 categories (Economic, Military, Diplomatic, Resources, Quality)
- [x] **Spider Chart Visualization** — Category performance breakdown for each country
- [x] **Category Color Bars** — Visual representation of influence score contributions
- [x] **Progressive Caching System** — Priority loading (G20, NATO, BRICS) with background loading for secondary countries
- [x] **Search Functionality** — Find countries by name with autocomplete
- [x] **Responsive Design** — Mobile-first CSS with optimized touch interactions
- [x] **Quick Stats Display** — Cycling key metrics (Population, GDP, Area, Land Boundaries)
- [x] **Fixed Reference Scoring** — Stable scores regardless of loaded countries

## Features In Progress
- [ ] **Resource Efficiency Metrics** — Production vs consumption ratios for energy resources (ETA: 1-2 weeks)
- [ ] **Enhanced Chart Visualizations** — Bar charts, pie charts, choropleth maps, heat maps (ETA: 2 weeks)
- [ ] **Mobile CSS Refinements** — Improved touch interactions and panel transitions (ETA: 1 week)

## Planned Features
- [ ] **Regional Comparisons** — Group countries by region with regional rankings and benchmarks
- [ ] **Historical Trends** — Time-series visualization for GDP, population, trade balance over time
- [ ] **Advanced Search & Filters** — Filter by region, search by country code, sort by metrics
- [ ] **Custom Weighting** — User-adjustable category weights for personalized influence scores
- [ ] **Country Comparison Mode** — Side-by-side detailed comparison of 2-3 countries
- [ ] **Data Export** — Download leaderboard data as CSV/JSON
- [ ] **Embeddable Widget** — Allow embedding leaderboard on other websites
- [ ] **Public API Access** — Programmatic access to scores and rankings

## Key Decisions

**Why Vanilla JavaScript?**
No framework overhead means faster load times and simpler architecture. ES modules provide sufficient code organization without React/Vue complexity.

**Why Client-Side Only?**
Eliminates backend hosting costs and complexity. GitHub Pages provides free, reliable static hosting. All data fetched from public GitHub repositories.

**Why Progressive Caching?**
Loads important countries (G20, NATO, BRICS) first for immediate usability, then progressively loads others in background. Balances performance with comprehensive data coverage.

**Why D3.js?**
Industry-standard for interactive visualizations. TopoJSON integration provides efficient geospatial rendering. Extensive ecosystem for charts and data viz.

**Why Fixed Reference Scoring?**
Ensures leaderboard scores remain stable across page refreshes. Countries scored against global maximum values, not relative to currently loaded countries.

## Success Metrics

**Performance:**
- Leaderboard loads priority countries in under 5 seconds
- Map renders in under 2 seconds on modern devices
- All G20, NATO, BRICS nations display correctly
- Scores remain stable across page refreshes

**User Experience:**
- Smooth mobile navigation with responsive touch interactions
- Search returns results instantly
- Spider charts render without lag

**Coverage:**
- 240+ countries/territories with data
- 5 influence categories with 20+ metrics
- Complete FIPS to ISO code mapping

## Known Limitations

- **No Offline Support** — Requires internet connection to fetch data (planned for v2 with service workers)
- **Historical Data Limited** — CIA Factbook has limited time-series data; full historical trends blocked by data availability
- **FIPS Code Gaps** — Some territories have incomplete FIPS to ISO mapping, causing occasional load failures
- **Mobile Performance** — Large data payloads can be slow on older mobile devices (mitigated by progressive loading)
- **No User Accounts** — No personalized features, saved searches, or custom configurations yet

## Important URLs

- **Live Site:** https://kcpatt27.github.io/global-information-portal/
- **GitHub Repo:** https://github.com/kcpatt27/global-information-portal
- **Data Source:** https://github.com/factbook/factbook.json
- **Documentation:** See README.md, ROADMAP.md, ARCHITECTURE.md

## Development Process

This project was built using:
- **Cursor AI** for scaffolding, documentation, and refactoring assistance
- **Manual development** for core logic, algorithms, UI/UX decisions, and testing
- **Webpack** for bundling and optimization
- **Git** for version control with comprehensive commit history

See the Development Process section in README.md for full transparency on AI-assisted vs. manual work.
