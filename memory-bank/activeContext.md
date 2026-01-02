# Active Context

## Current Work Focus
- **UI Polish & Bug Fixes:** Completed comprehensive header, flag, and info section refinements. Fixed population formatting, country name display, and layout spacing issues.
- **Data Display Improvements:** Fixed background info text visibility, pagination indicators, and quick stats layout issues.
- **Code Quality:** Maintained duplicate file structure for now (pending refactor) to preserve working foundation.

## Recent Changes (Summarized)
- **Flag Display System:**
  - Created comprehensive FIPS to ISO country code mapping (`js/utils/countryCodeMap.js`) to fix flag mismatches (e.g., China CH→CN).
  - Integrated mapping into `normalizeIsoA2` function in `js/main.js`.
  - Fixed flag display for all countries with CIA/FIPS vs ISO code discrepancies.
- **Header & Country Name Display:**
  - Removed country code and continent from header (now shows only country name for cleaner display).
  - Implemented name expansion logic to show full names (e.g., "Bosnia and Herzegovina" instead of "Bosnia and Herz.").
  - Special handling for "Dem. Rep. of Congo" display format.
  - Balanced header spacing: matched flag container width (44px) with close button for visual centering.
  - Increased flag size (32x22px) and header font size to better match close button.
  - Added responsive font sizing with special case for Bosnia and Herzegovina (smaller font to fit full name).
  - Removed ellipsis truncation - all country names display fully for educational transparency.
- **Info Section Improvements:**
  - Fixed text cutoff issue in background-info section (changed `align-items: center` to `flex-start`).
  - Removed duplicate page indicator (kept only top indicator between navigation arrows).
  - Reduced pagination arrow and indicator size by 20-30% for better UX.
  - Fixed CSS height issues (changed `height: 100%` to `height: auto; min-height: 100%`).
- **Quick Stats Fixes:**
  - Fixed population formatting bug (was showing "billion" instead of "million" for US).
  - Restored year/estimate text in population stats (e.g., "(2024 est.)").
  - Fixed stat box layout - removed forced height matching so boxes size to their own content.
  - Added word-wrap handling for long values to prevent layout breaking.
- **Tab Order:**
  - Set Rankings tab as default (first tab, active by default).
  - Reordered DOM so Rankings appears before Statistics in the tab list.
- **Mobile Navigation:**
  - Fixed mobile nav bar visibility bug (removed conflicting CSS, now handled solely by JavaScript).

## Next Steps
- **Cleanup:** Address duplicate/refactored JS files (`js/panels/` vs `js/components/panels/`) - currently deferred until all bugs are handled.
- **Continue Polish:** Any remaining UI/UX refinements based on user testing.
- **Future Refactor:** Once foundation is solid, proceed with planned JavaScript refactoring.

## Known Issues / Bugs
- **CSS Overflow Conflict (Documented):** Potential conflict between `overflow: visible` in `css-styles/layout/sidebar.css` (line 161) and `overflow-y: auto` in `css-styles/layout/containers.css` (line 43) for `.background-info`. The shorthand `overflow: visible` can theoretically override `overflow-y: auto` in some browsers, though currently not causing visible text cutoff issues. Should be resolved by removing `overflow: visible` from `sidebar.css` or ensuring `overflow-y: auto` takes precedence.
 - **Duplicate JS entry files (Documentation):** Duplicate implementations of core UI functions exist in both `js/main.js` and `js/index.js` (for example: `handleCountrySelect`, `handleCountryDeselect`, `openSidebar`, and `setupUIEventHandlers`). `package.json` and webpack use `js/index.js` as the build entry while `index.html` currently loads `js/main.js` directly. This mismatch can cause inconsistent behavior between development (direct load) and production (bundled) builds. Recommendation: consolidate to a single canonical entry (prefer `js/index.js`) and remove/centralize duplicated functions.
 - **Mobile CSS loaded unconditionally (Documentation):** Mobile-specific stylesheets (`css-styles/mobile.css` and `css-styles/layout/mobile-layout.css`) are linked from `index.html` without conditional loading. These stylesheets contain global rules (e.g., fixed `height` and `overflow: hidden` on `.info-container`) which may affect desktop layouts unexpectedly. Although the background-info clipping was fixed, the unconditional loading remains a risk. Recommendation: scope mobile rules with `@media` or conditionally load mobile CSS at runtime.

## Active Decisions & Considerations
- Keeping duplicate file structures intact until all bugs are resolved to maintain working foundation.
- Prioritizing bug fixes and polish over architectural refactoring.
- Maintaining educational transparency - no abbreviations or truncation of country names. 