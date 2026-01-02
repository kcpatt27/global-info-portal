# System Patterns

## Overall Architecture
- Single Page Application (SPA) structure centered around an interactive map (`index.html`).
- Map interaction drives data display in side panels.
- Data fetched asynchronously from an external source.
- Modular code structure for CSS and JavaScript.

## Key Technical Decisions & Patterns

### CSS
- **Modular Structure:** CSS organized into `core`, `layout`, `components`, `devices`, `interaction`, `navigation`, `typography` folders.
- **CSS Variables:** Extensive use of variables (`css-styles/core/variables.css`) for theming and consistency.
- **Responsive Design:** Primarily handled through media queries (`css-styles/layout/responsive.css`) and dedicated mobile stylesheets (`mobile.css`, potentially others in `devices/` or component-specific mobile files).
- **BEM-like Naming:** Likely uses a BEM-inspired convention for CSS class names (observe in HTML/CSS).

### JavaScript
- **Vanilla JS:** No reliance on major frontend frameworks.
- **D3.js Dominance:** Heavy use of D3.js for map rendering, interactions (zoom/pan), and potentially data visualizations (charts).
- **Modularity:** Code organized into modules (utilities, components, panels, core logic). Aiming for standardized ES Modules (`js-refactor-implementation.md`).
- **Component Structure:** UI elements like panels, tabs, charts are likely implemented as distinct JS modules/components.
- **State Management:** Centralized state management likely handled in `js/state.js` (as per `js-refactor-implementation.md`), possibly using a simple pub/sub pattern.
- **Event Handling:** Centralized event listeners (`js/events.js`) and component-specific listeners. Ongoing optimization planned (`js-refactor-implementation.md`).
- **Asynchronous Operations:** Data fetching (`js/utils/dataFetcher.js`) and potentially other operations handled using Promises or async/await.
- **Refactoring Goals (from `js-refactor-implementation.md`):** Focus on standardizing module structure, improving code quality (smaller functions, error handling, types), optimizing performance (lazy loading, DOM batching, memoization), and modernizing syntax/patterns.

### Data Handling
- **Data Fetcher:** Dedicated module (`js/utils/dataFetcher.js`) likely handles API calls.
- **Data Panels:** Standardized 2-tab system (Statistics, Rankings) for displaying country data.
- **Caching:** Basic caching might exist; enhanced caching (IndexedDB) is planned (`mobile-css-implementation.md`, Section 2).
- **Country Code Mapping:** Comprehensive FIPS 10-4 (CIA) to ISO 3166-1 alpha-2 mapping (`js/utils/countryCodeMap.js`) ensures correct flag display. Used in `normalizeIsoA2` function in `main.js`.
- **Flag Display:** Multi-source flag loading (FlagCDN primary, RestCountries fallback) with URL caching. Flag size: 32x22px in header.

## Component Relationships
- `main.js`: Entry point, initializes core components. Handles country selection, flag display, and country name formatting (with special cases for Bosnia, DR Congo).
- `map.js`: Handles map rendering and interaction.
- `events.js`: Manages global event listeners (clicks, map interactions).
- `state.js`: Holds and manages application state (selected country, panel visibility, etc.).
- `statCycling.js`: Manages quick stats display and cycling functionality. Handles population/GDP/area/region formatting with year estimates.
- `infoTextCycling.js`: Manages background info text cycling with pagination.
- `utils/countryCodeMap.js`: FIPS to ISO country code mapping for flag display.
- Panel Components (`js/panels/`, `js/components/panels/`): Manage the display and interaction within the info/data panels. Note: Duplicate structures exist, intentionally preserved until refactor.
- Tab Components (`js/statsTab.js`, `js/rankingsTab.js`): Handle logic within specific data tabs.
- `charts.js`/`components/charts/`: Responsible for generating data visualizations. 