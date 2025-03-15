# Global Information Portal - Comprehensive Todo List

The following document outlines all tasks needed to address issues, implement new features, enhance documentation, and prepare for deployment.

---

## Implementation Priority

1. Fix immediate integration issues (Phase 1 State Management)
2. Enhance error handling (Phase 5 State Management)
3. Standardize state access patterns (Phase 4 State Management)
4. Expand state persistence (Phase 2 State Management)
5. Implement proper cache management (Phase 3 State Management)
6. Add debugging tools (Phase 6 State Management)
7. Complete testing and documentation (Phase 7 State Management)

---

## Data Visualization and Charts

- [ ] **Fix Critical Bugs**
  - [x] Fix Trends chart bug where points don't connect properly
    - [x] Check D3.js line generator configuration
    - [x] Ensure data points have consistent format and structure
    - [x] Verify time scale configuration on x-axis
  - [x] Fix bug where Rankings tab doesn't show tabs for Overview and Details
    - [x] Inspect tab initialization in events.js
    - [x] Check CSS classes and visibility conditions
  - [ ] Fix bug where Rankings tab creates a new spider chart every time page is changed
    - [ ] Implement chart instance caching
    - [ ] Clear and reuse existing SVG elements instead of creating new ones

- [ ] **Chart and Panel Container Refactoring**
  - [x] Add a button in the sidebar to pull up charts in the information container
  - [x] Put text based data in the current chart tabs/charts containers and rename them to a relevant name
  - [ ] Refactor the charts and charts tabs containers to have their own panel/container viewable via sidebar button
  - [ ] Collect all numeric data from country info and put it in a separate panel for charts
    - [ ] Create GDP chart for all countries
      - [ ] Map colors should change when chart is in view (red to blue gradient based on values)
    - [ ] Create Revenue chart for all countries
      - [ ] Map colors should change when chart is in view (red/orange/yellow/green gradient)
    - [ ] Create Population chart for all countries
      - [ ] Map colors should change when chart is in view (green/yellow/orange/red gradient)
  - [x] Provide tabular view of all time-series data points
  - [x] Fix critical bug where the Trends tab isn't showing any data
  - [x] Fix Trends chart bug where the points don't connect and the chart looks like a mess

- [x] **Rankings Tab Enhancement**
  - [x] Create Rankings tab with selector for different rankings metrics
  - [x] Maintain selection of ranking metric across different country selections
  - [x] Implement thorough data fetching mechanism to obtain data for all countries
  - [x] Optimize loading and caching strategy to handle larger data volume efficiently
  - [x] Show rankings data for ALL countries globally (from cached country data)
  - [x] Provide full tabular view option to see complete rankings for all countries
  - [x] Improve visual representation of where selected country stands globally
  - [x] Add ability to filter rankings by continent/region
  - [x] Add sorting options (highest to lowest and lowest to highest)
  - [x] Fix UI layout issues - streamline Sort and Region filters to be on the same line
  - [x] Remove export button as it's not needed
  - [x] Fix background container expansion issue to properly fit content
  - [x] Create paginated Rankings tab with two pages
    - [x] Add regional rankings page
    - [x] Add global rankings page
    - [x] Display selected country's name, position in rank, and neighboring countries
    - [x] Show results for every possible numeric metric
    - [x] Organize in grid pattern with 2 metrics per line using clean, modern styling
  - [ ] Fix value display in rankings
    - [x] Make the stats value in the quick stats grid include correct signifiers (billion, money sign)
    - [ ] Remove the first layer folder name from rankings tab when showing a result (??? why?))
  - [x] Fix bug where the rankings tab doesn't show tabs for Overview and Details when a country is selected
  - [ ] Fix bug where the rankings tab creates a new spider chart every time the page is changed from Details to Overview

- [ ] **Visualization Improvements**
  - [ ] Add radar/spider chart on info panel below .background-info
    - [ ] Include key metrics: GDP, Net Income, Population, Land data
  - [ ] Display key rankings below the radar/spider chart
    - [ ] Implement grid pattern with 2-3 metrics per line
    - [ ] Use concise, clean and modern styling

## Layout and User Interface Enhancements

- [ ] **Redesign Layout for Better Usability**
  - [ ] Make all transitions smooth and elegant
    - [ ] Use precisely timed animations with specific values:
      - [ ] Use 0.113s for quick transitions (button hover, icon fades)
      - [ ] Use 0.23s for medium transitions (panel slides, tab changes)
      - [ ] Use 0.311s, 0.32s or other prime number values for staggered animations
    - [ ] Implement transition CSS from utils.css:
      ```css
      .stat-transition-out {
        animation: fadeOut 0.3s ease forwards;
      }
      .stat-transition-in {
        animation: fadeIn 0.3s ease forwards;
      }
      ```
    - [ ] Use animations but keep them tight and sleek
  - [x] Fix bug with the Global Context tab showing "Global data unavailable" despite country selection
  - [x] Fix issue where rankings tab doesn't pull selected country name (shows "Unknown Country")
  - [ ] Make it pull directly connected neighbors' data to enhance rankings tab
  - [x] Fix bug where the trends tab doesn't show the same panel when a country is selected

- [ ] **Tab Structure and Navigation Improvements**
  - [x] Make Rankings tab first instead of Stats for more intuitive user flow
  - [x] Replace Global Context and Trends tabs with more meaningful options
    - [x] **Tab Consolidation Plan** (prioritized approach)
      - [x] Move Global Context functionality into Rankings tab
        - [x] Create "Compare with World" section for global rankings
        - [x] Create "Compare with Region" section for regional rankings
        - [x] Implement toggle between these views
        - [x] Transfer comparison visualizations to Rankings panel
      - [x] Move Trends functionality into Stats tab
        - [x] Add historical data section to Stats tab
        - [x] Create tabbed interface within Stats for "Current" and "Historical" views
        - [x] Transfer time-series visualizations to Stats panel
        - [x] Fix the connecting points rendering issue while implementing
      - [x] Update UI to reflect simplified tab structure
      - [x] Modify state management to consolidate state from 4 tabs to 2
      - [x] Update all references to tabs throughout the codebase
    - [ ] Consider adding news feed tab (lower priority)
    - [ ] Consider adding external sources tab (lower priority)
  - [x] Ensure the active tab is slightly taller than inactive ones (no clipping through container)
  - [x] Ensure active tab left and right borders match length of inactive tabs
  - [x] Remove bottom border of active tab
  - [x] Ensure left/right borders of all tabs connect with bottom border

- [ ] **Information Display Improvements**
  - [ ] Make country-info header auto-wrap for better handling of longer country names
  - [x] Implement interactive stats functionality
    - [x] Allow cycling through relevant metrics by clicking on stat boxes in the quick-stats-grid
    - [x] Implement based on existing statCycling.js structure:
      - [x] Display cycling indicator on hover (.stat-cycle-indicator)
      - [x] Create transition animations for smooth metric changes
      - [x] Define related stat sets for each category (population, GDP, area, region)
      - [x] Use icons from Font Awesome with consistent styling

- [ ] **Data Loading Optimization**
  - [ ] Modify Rankings tab to load data independently of country selection
  - [ ] Implement right-click event enhancement (??? what does this mean?)
    - [ ] When a country is cleared, clear country selection and data tabs but keep country the data cached

## Search Functionality

- [ ] **Add a Search Bar**
  - [ ] Typing should focus the search bar if nothing else is focused
  - [ ] Create a search input at the top of the screen, with a button to focus it in the navigation sidebar
    - [ ] Make the search bar look modern and futuristic
    - [ ] Style it like a search bubble from a modern/futuristic website
    - [ ] Use tight and sleek animations that enhance user experience
  - [ ] Implement auto-complete/typeahead suggestions using the country data set
  - [ ] On country selection:
    - [ ] Highlight the selected country on the map
    - [ ] Zoom in on the selected country with a smooth transition
    - [ ] Center the view with a smooth transition
    - [ ] Automatically load and display the relevant country information
  - [ ] Make the search bar work with the navigation sidebar
  - [ ] Fix search bar positioning to stay at the top of the Stats tab for better usability

## Sidebar and Navigation

- [ ] **Finish Styling the Sidebar**
  - [ ] Make it look modern and futuristic
  - [ ] Make it look clickable and interactive but also sleek, modern and futuristic
  - [ ] Make it look like a sidebar from a modern and futuristic website
  - [ ] Use animations
    - [ ] Map should move to take up empty space when sidebar is collapsed
    - [ ] Sidebar closing animation should be smooth and elegant
    - [ ] Sidebar opening animation should be smooth and elegant
    - [ ] Sidebar should have a close button styled like the rest of the sidebar
- [ ] Edit the styling of the buttons in the information sidebar menu/page

## Style Integration

- [ ] **CSS File Integration (Total: 2,229 LOC)**
  - [ ] Core CSS Files
    - [ ] Integrate main.css (29 lines) - Main CSS import structure
    - [ ] Implement reset/base CSS (included in layout.css, 118 lines)
    - [ ] Set up utils.css (212 lines) - Utility classes and animations
  - [ ] Layout CSS Files
    - [ ] Incorporate layout.css (118 lines) - Core layout structure
    - [ ] Add responsive.css (228 lines) - Media queries for responsiveness
    - [ ] Include sidebar.css (203 lines) - Navigation and sidebar components
  - [ ] Component CSS Files
    - [ ] Add map.css (77 lines) - Map visualization styles
    - [ ] Add mapComponents.css (69 lines) - Additional map elements
    - [ ] Include dataTabs.css (103 lines) - Tab navigation components
    - [ ] Add dataPanel.css (84 lines) - Data panel containers
    - [ ] Integrate rankings.css (412 lines) - Rankings-specific components
    - [ ] Add trends.css (171 lines) - Trends visualization components
    - [ ] Include globalContext.css (220 lines) - Comparison components
    - [ ] Add stats.css (160 lines) - Statistics display components
    - [ ] Include charts.css (143 lines) - Chart and data visualizations
  
- [ ] **Apply Consistent Design**
  - [ ] Implement simple and elegant design principles throughout
  - [ ] Maintain consistent styling between all components
  - [ ] Ensure design is clean, modern, and concise

## CSS Architecture and Optimization

- [ ] **Implement Modular CSS Architecture**
  - [ ] Audit existing styles and identify redundancies
  - [ ] Create a style guide for consistent application design patterns
  - [ ] Implement naming conventions for CSS classes (BEM or equivalent)
  - [ ] Set up variables for colors, font sizes, spacing for consistency
  - [ ] Create a component-based architecture that aligns with UI components

- [ ] **Establish Animation Timing Consistency**
  - [ ] Create variables or custom properties for standard animation durations:
    - [ ] `--animation-speed-fast: 0.113s;` - For micro-interactions (icon changes, hover states)
    - [ ] `--animation-speed-medium: 0.23s;` - For UI element transitions (panels, tabs)
    - [ ] `--animation-speed-slow: 0.311s;` - For major layout changes
  - [ ] Audit existing animation timings and replace with standardized values
    - [ ] Quick state changes: 0.113s (fast)
    - [ ] Hover transitions: 0.23s (medium)
    - [ ] Panel slides: 0.311s or 0.317s (slow)
  - [ ] Use prime number values between 0.1-0.5s for staggered animations
  - [ ] Implement consistent easing functions:
    - [ ] `ease` for natural movement
    - [ ] `ease-in-out` for smooth transitions
    - [ ] `cubic-bezier(0.34, 1.56, 0.64, 1)` for bouncy effects
  - [ ] Document animation timing standards in project style guide

- [ ] **Optimize CSS Performance**
  - [ ] Minimize CSS files using appropriate tooling
  - [ ] Implement critical CSS loading for faster initial rendering
  - [ ] Reduce redundant styles using mixins or utility classes
  - [ ] Add appropriate vendor prefixes for cross-browser compatibility
  - [ ] Implement responsive breakpoints for different device sizes

## Code and Project Structure Refactoring

- [x] **Modularize the Codebase**
  - [x] Remove any obsolete code (e.g., unused 3D globe functionality, commented zoom behavior)
  - [x] Separate concerns into logical modules (data fetching, UI, state management)
  - [x] Implement proper import/export pattern for all modules
  - [x] Create clear interfaces between modules to reduce tight coupling

- [ ] **Improve Error Handling**
  - [x] Enhance error logging and display user notifications when data fails to load or render
  - [ ] Integrate robust error handling for fetching and processing data
  - [ ] Implement fallback mechanisms for missing or incomplete data
  - [ ] Add retry logic for network failures

- [ ] **Follow DRY Principles**
  - [x] Consolidate duplicate code across different map and chart implementations
  - [ ] Create reusable utility functions for common operations
  - [ ] Extract repeated patterns into shared components or mixins

## Migration Plans

- [ ] **Chart Component Migration (from charts.js to modular components)**
  - [x] Phase 1: Create dedicated modules for each visualization type
    - [x] Extract statsPanel.js from charts.js/dataPanels.js
    - [x] Extract rankingsPanel.js from charts.js/dataPanels.js
    - [x] ~~Extract trendsPanel.js from charts.js/dataPanels.js~~ // consolidated into statsPanel.js
    - [x] ~~Extract globalContextPanel.js from charts.js/dataPanels.js~~ // consolidated into rankingsPanel.js
  - [ ] Phase 2: Create core visualization utilities
    - [ ] Create dataProcessor.js for data extraction and formatting
    - [ ] Create visualizer.js for chart rendering engine
    - [ ] Create interactions.js for user interactions and events
  - [ ] Phase 3: Create utility modules
    - [ ] Create formatters.js for value/label formatting
    - [ ] Create metrics.js for metric extraction
    - [ ] Create animations.js for chart animations

- [ ] **CSS Architecture Migration**
  - [ ] Reference existing CSS files at `D:\projects\personal-projects\2D Global Info Portal\css` for structure:
    - [ ] Adapt layout.css for base layout structure (container, grid, flexbox)
    - [ ] Update sidebar.css for navigation components (nav-sidebar, nav-button)
    - [ ] Integrate utils.css for animations and utility classes (especially transitions)
    - [ ] Implement consistent stat-item cycling styles from quick-stats.css

## State Management Integration Plan

- [x] **Phase 1: Fix Immediate State Integration Issues**
  - [x] Address data sharing issues between components
  - [x] Fix tab selection state persistence
  - [x] Ensure ranking filters persist across state changes
  - [x] Implement proper state reset on map navigation events
  - [x] Fix event handler conflicts between map and sidebar components
  - [x] Ensure focused country state is properly synchronized across all components

- [ ] **Phase 2: Enhance State Persistence**
  - [ ] Implement localStorage for user preferences
  - [ ] Save map position and zoom level
  - [ ] Remember selected rankings metrics
  - [ ] Store recent country selections
  - [ ] Add option for users to reset their saved state

- [ ] **Phase 3: State Cache Management**
  - [ ] Implement proper caching strategy for country data
  - [ ] Add configurable TTL (Time To Live) for cached country data
  - [ ] Add manual cache invalidation triggers
  - [ ] Implement cache size limitations to prevent excessive memory usage
  - [ ] Add cache statistics tracking (hits/misses/evictions)
  - [ ] Optimize metrics indexing process for better performance
  - [ ] Add LRU (Least Recently Used) eviction policy for country data cache
  - [ ] Create utility functions for batch loading and caching of country data

- [ ] **Phase 4: Standardize State Access Patterns**
  - [ ] Create standardized selectors for accessing state
  - [ ] Use these selectors throughout the codebase for consistent state access
  - [ ] Implement computed properties for derived state
  - [ ] Add state validation to prevent invalid state updates

- [ ] **Phase 5: Enhanced Error Handling**
  - [ ] Create consistent error handling strategy for state operations
  - [ ] Add state change audit logging (development mode)
  - [ ] Implement better error recovery mechanisms
  - [ ] Create UI components for displaying state-related errors

- [ ] **Phase 6: State Debugging Tools**
  - [ ] Create a dev mode state inspector
  - [ ] Add time-travel debugging capability for development
  - [ ] Implement state diff visualization for debugging
  - [ ] Add performance monitoring for state changes

- [ ] **Phase 7: Testing and Documentation**
  - [ ] Write unit tests for all state management functions
  - [ ] Create documentation showing state flow diagrams
  - [ ] Document all state object properties and their purpose
  - [ ] Create state management patterns guide for contributors

## Documentation and Project Updates

- [ ] **Create Comprehensive Documentation**
  - [ ] Update README with project overview, setup instructions and basic usage
  - [ ] Document file structure and organization
  - [ ] Add inline code comments for complex logic
  - [ ] Create a changelog to track version updates
  - [ ] Add contribution guidelines for future developers

- [ ] **User Documentation**
  - [ ] Create user guide with feature explanations and screenshots
  - [ ] Document keyboard shortcuts and navigation tips
  - [ ] Add FAQs based on anticipated user questions
  - [ ] Create video walkthrough of main features

## Testing and Deployment

- [ ] **Implement Testing Strategy**
  - [ ] Write unit tests for core functionality
  - [ ] Create integration tests for component interactions
  - [ ] Develop manual test plan for UI interactions
  - [ ] Set up automated testing workflow

- [ ] **Optimize for Deployment**
  - [ ] Ensure responsive design for all device sizes
  - [ ] Test and fix cross-browser compatibility issues
  - [ ] Optimize assets for fast loading (image compression, code minification)
  - [ ] Implement proper caching headers for static assets
  - [ ] Set up CI/CD pipeline for automated deployments

## Data Panel Modules Implementation 

- [x] **Modularize Data Panels**
  - [x] Create dedicated `statsPanel.js` module
  - [x] Create dedicated `rankingsPanel.js` module
  - [x] Create `panels/index.js` for centralized panel management
  - [x] Update module imports in main.js
  - [x] Maintain backward compatibility with dataPanels.js

- [ ] **Complete Panel Architecture**
  - [x] Add comprehensive README documentation for panel modules
  - [ ] Create standard interface for panel initialization and updates
  - [ ] Implement consistent error handling across all panel modules
  - [ ] Add event dispatching system for cross-panel communication
  - [ ] Create unit tests for panel modules

- [x] **Finalize Tab Consolidation**
  - [x] Verify that Stats panel properly displays both current and historical data
  - [x] Verify that Rankings panel properly displays both global and regional comparisons
  - [x] Remove any remaining references to Global Context and Trends tabs
  - [x] Clean up CSS class names to align with new structure
  - [x] Update navigation logic to handle new tab structure

## User Stories

### Map Visualization and Navigation User Stories

- [x] **As a user, I want an interactive map with clear visual feedback.**
  - [x] When I hover over or click on a country, I should see distinct visual effects.
  - [x] When I select a country, the transition should be smooth and visually pleasing.
  - [x] The map should properly integrate with other UI elements without z-index issues.

- [x] **As a user, I want intuitive map navigation controls.**
  - [x] I should be able to zoom in and out of the map.
  - [x] When I zoom out to the default level, the transition should be smooth.
  - [x] I should not be able to zoom out beyond the default view.
  - [x] I should be able to pan the map by clicking and holding the mouse wheel.
  - [x] I should be able to reset the zoom level to default by clicking the right mouse button.

### Teacher Perspective
- [ ] As an elementary school teacher, I want simplified visualizations with vibrant colors and basic facts, so I can make geography engaging for young students.
- [ ] As a high school geography teacher, I want to create custom comparison sets between countries, so I can design interactive classroom activities.
- [ ] As a history teacher, I want to access historical country data with timeline visualizations, so I can illustrate how nations have evolved.

### Student Perspective
- [ ] As a political science student, I want detailed governance information with historical context, so I can analyze political systems.
- [ ] As an economics student, I want to generate custom charts comparing multiple economic indicators across countries, so I can identify patterns for research.
- [ ] As a sociology student, I want demographic data visualizations that go beyond basic population statistics, so I can examine social structures.

### Researcher Perspective
- [ ] As a data scientist, I want access to raw datasets behind the visualizations, so I can perform custom analyses.
- [ ] As a policy researcher, I want to track changes in key indicators over time with customizable date ranges, so I can evaluate policy impacts.
- [ ] As an academic researcher, I want clear data source citations and methodology notes, so I can properly attribute information.

### International User Perspective
- [ ] As a non-English speaker, I want full functionality in my native language, so I don't miss information due to language barriers.
- [ ] As a user in a region with slow internet, I want a lightweight version of the application, so I can access information without long loading times.
- [ ] As a user from a small or less-documented country, I want comprehensive information about my nation, so I can see accurate representation.

### Casual User Perspective
- [ ] As someone planning international travel, I want quick access to practical country information (currency, language, time zone).
- [ ] As a news reader, I want contextual information about countries in current headlines, so I can better understand global events.
- [ ] As a curious individual, I want an engaging "explore" feature that suggests interesting countries or facts.

---