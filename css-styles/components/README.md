# Component CSS Files

This directory contains CSS files for individual UI components of the Global Information Portal.

## Tab Structure Changes

The UI has been updated from a 4-tab structure to a more streamlined 2-tab approach:

### Old Structure (4 tabs)
1. Stats 
2. Rankings
3. Global Context
4. Trends

### New Structure (2 tabs)
1. **Statistics** - Contains all statistical data with sub-views:
   - Current view: Shows all current stats for the selected country
   - Historical view: Shows time-series data (formerly in Trends tab)
   
2. **Rankings** - Shows country ranking information with sub-views:
   - Global view: Shows where the country ranks globally
   - Regional view: Shows regional comparisons (formerly in Global Context tab)

## CSS Files

Despite the consolidation, we're maintaining some separate CSS files for organization:

### Tab Navigation
- **tabs.css** - Core tab styling and navigation
- **data-tabs-common.css** - Shared styles for all data tabs

### Panel Components
- **stats.css** - Styles for the Statistics panel
- **rankings.css** - Styles for the Rankings panel
- **panels.css** - Common panel styles and containers

### Data Visualization
- **charts.css** - Base chart styles
- **charts-common.css** - Shared visualization styles

### Quick Stats
- **quick-stats.css** - Styles for the quick stats grid on the info panel

### Legacy Files (Kept for Reference)
The following files are kept for reference but are no longer imported in main.css:
- **global-context.css** - (functionality now in rankings.css)
- **trends.css** - (functionality now in stats.css)

## Styling Guidelines

When modifying these components:

1. Use the CSS variables defined in `core/variables.css`
2. Follow the animation timing constants for consistent transitions
3. Ensure all components have appropriate hover and focus states
4. Maintain responsive behavior using the mixins in `layout/responsive.css` 