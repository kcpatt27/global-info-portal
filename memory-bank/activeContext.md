# Active Context

## Current Work Focus
- **Major Feature Completion:** Rankings and Statistics tabs fully implemented with comprehensive data visualization and global rankings functionality.
- **Mobile Experience Finalization:** Complete mobile optimization with unified D3 zoom/pan, responsive navigation, and touch interactions.
- **Architecture Consolidation:** Core functionality stabilized, duplicate file structures maintained for stability until full refactor phase.

## Recent Changes (Major Milestone - Jan 2026)
- **Complete Rankings Tab Implementation:**
  - Global Superpower Leaderboard displays by default with no country selected
  - Interactive "Metric Insights" charts (Bar/Pie) with metric switching and chart type toggling
  - Top 10 countries visualization plus currently selected country
  - Clean UI with "All Metrics" section removed for better layout

- **Statistics Tab Overhaul:**
  - Dynamic loading of ALL available data categories from Factbook JSON
  - Global rankings displayed for all numeric statistics (minimum 5 countries threshold)
  - Robust numeric extraction handling million/billion/trillion suffixes

- **Mobile Experience Complete:**
  - Unified D3 zoom/pan for mouse and touch with double-tap focus functionality
  - Mobile navigation bar visibility properly managed via JavaScript
  - Full-width tabs with no cut-off, proper active layering, and desktop-like borders
  - Panel styling refinements and layout optimizations

- **JavaScript Architecture Enhancements:**
  - State management fixes (tab persistence, ranking filters, map navigation reset)
  - Country selection and data display functionality improvements
  - Comprehensive FIPS→ISO country code mapping for accurate flag display
  - Sidebar button functionality and data panel modularization

- **CSS and Build Optimizations:**
  - Component-specific styling updates for rankings and statistics panels
  - Build system optimizations with compressed/minified assets
  - Cross-platform line ending handling (LF→CRLF warnings resolved)

## Next Steps
- **Stability Testing:** Verify all features work correctly across desktop and mobile devices.
- **Performance Optimization:** Review and optimize data loading, caching, and rendering performance.
- **Code Consolidation:** Address duplicate JS file structures once stability is confirmed.
- **Documentation Review:** Ensure all documentation accurately reflects current implementation.

## Known Issues / Bugs
- **CSS Overflow Conflict (Documented):** Potential conflict between `overflow: visible` in `css-styles/layout/sidebar.css` (line 161) and `overflow-y: auto` in `css-styles/layout/containers.css` (line 43) for `.background-info`. The shorthand `overflow: visible` can theoretically override `overflow-y: auto` in some browsers, though currently not causing visible text cutoff issues. Should be resolved by removing `overflow: visible` from `sidebar.css` or ensuring `overflow-y: auto` takes precedence.
- **Duplicate JS entry files (Documentation):** Duplicate implementations of core UI functions exist in both `js/main.js` and `js/index.js` (for example: `handleCountrySelect`, `handleCountryDeselect`, `openSidebar`, and `setupUIEventHandlers`). `package.json` and webpack use `js/index.js` as the build entry while `index.html` currently loads `js/main.js` directly. This mismatch can cause inconsistent behavior between development (direct load) and production (bundled) builds. Recommendation: consolidate to a single canonical entry (prefer `js/index.js`) and remove/centralize duplicated functions.
- **Mobile CSS loaded unconditionally (Documentation):** Mobile-specific stylesheets (`css-styles/mobile.css` and `css-styles/layout/mobile-layout.css`) are linked from `index.html` without conditional loading. These stylesheets contain global rules (e.g., fixed `height` and `overflow: hidden` on `.info-container`) which may affect desktop layouts unexpectedly. Although the background-info clipping was fixed, the unconditional loading remains a risk. Recommendation: scope mobile rules with `@media` or conditionally load mobile CSS at runtime.

## Active Decisions & Considerations
- Core functionality now stable with major features implemented and tested.
- Duplicate file structures maintained for stability until comprehensive testing completes.
- Focus shifting from feature development to optimization and consolidation.
- Educational transparency maintained - full country names displayed without truncation. 