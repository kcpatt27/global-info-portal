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
- **Known CSS Conflicts:**
  - **`.background-info` Overflow Conflict:** Potential conflict between `overflow: visible` in `css-styles/layout/sidebar.css` (line 161) and `overflow-y: auto` in `css-styles/layout/containers.css` (line 43). The shorthand `overflow: visible` can override `overflow-y: auto` in some browsers. Currently not causing visible issues, but should be resolved by removing `overflow: visible` from `sidebar.css` or ensuring `overflow-y: auto` takes precedence. The min-height values across files (80px, 100px, 150px, 200px, 250px, 50vh) are intentional responsive breakpoints, not conflicts.
  - **Mobile CSS Inclusion Risk:** `mobile.css` and `css-styles/layout/mobile-layout.css` are currently linked directly from `index.html`. These files include global (non-media-wrapped) rules (for example `.info-container { height: 40vh; overflow: hidden; }`) which can affect desktop layouts if loaded unconditionally. Prefer scoping these rules inside `@media (max-width: 768px)` or conditionally loading mobile styles at runtime to avoid unintended layout changes.

### JavaScript
- **Vanilla JS:** No reliance on major frontend frameworks.
- **D3.js Dominance:** Heavy use of D3.js for map rendering, interactions (zoom/pan), and potentially data visualizations (charts).
- **Modularity:** Code organized into modules (utilities, components, panels, core logic). Aiming for standardized ES Modules (`js-refactor-implementation.md`).
- **Component Structure:** UI elements like panels, tabs, charts are likely implemented as distinct JS modules/components.
- **State Management:** Centralized state management likely handled in `js/state.js` (as per `js-refactor-implementation.md`), possibly using a simple pub/sub pattern.
- **Event Handling:** Centralized event listeners (`js/events.js`) and component-specific listeners. Ongoing optimization planned (`js-refactor-implementation.md`).
- **Asynchronous Operations:** Data fetching (`js/utils/dataFetcher.js`) and potentially other operations handled using Promises or async/await.
- **Refactoring Goals (from `js-refactor-implementation.md`):** Focus on standardizing module structure, improving code quality (smaller functions, error handling, types), optimizing performance (lazy loading, DOM batching, memoization), and modernizing syntax/patterns. Major progress made in state management and event handling optimization.
- **Entry Point / Duplication Risk:** There are duplicate implementations of core UI functions across `js/main.js` and `js/index.js` (e.g., `handleCountrySelect`, `openSidebar`, `setupUIEventHandlers`). `package.json` / webpack use `js/index.js` as the canonical build entry, while `index.html` currently loads `js/main.js` directly. This mismatch creates a risk of divergent behavior between direct dev loads and built bundles. Recommend consolidating on a single entry (prefer `js/index.js`) and exporting shared utilities rather than duplicating implementations. Status: Identified but deferred until stability confirmed.

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
- Panel Components (`js/panels/`, `js/components/panels/`): Manage the display and interaction within the info/data panels. Rankings and Statistics panels now fully implemented with dynamic data loading and interactive charts. Note: Duplicate structures exist, intentionally preserved until refactor.
- Rankings Panel (`js/panels/rankingsPanel.js`): Complete implementation with Global Superpower Leaderboard, interactive Metric Insights charts (Bar/Pie), and metric switching functionality.
- Statistics Panel (`js/panels/statsPanel.js`): Complete implementation with dynamic Factbook JSON category loading and global rankings for all numeric data.
- Chart Components (`charts.js`/`components/charts/`): Generate D3.js data visualizations including bar charts, pie charts, and ranking displays.
- Utility Modules: Enhanced `countryCodeMap.js` (FIPS→ISO mapping), `globalPreCache.js` (data preprocessing), and numeric extraction utilities. 