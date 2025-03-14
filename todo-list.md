# TODO List

This list outlines all tasks needed to address current issues, update the project, and enhance documentation.

---

## Map Visualization Enhancements
- [x] **Refine Map Styling and Interactions**
  - [x] Updated country fill, hover, and click selection effects for better visual feedback.
  - [x] Add smooth transitions when selecting a country (e.g., using D3 transitions).
    *Recommendation: Utilize d3.transition() to add fade-in/out effects on selection/deselection.*
  - [x] Verify the z-index stacking order so that the map integrates properly with overlays.
- [x] **Improve Navigation**
  - [x] Implemented zoom & pan functionality.
  - [x] Further refine zoom/pan behavior as needed.
    - [x] Zooming out to default should be a smooth transition and should reset the map position to the default.
    - [x] Users should not be able to zoom out past the default zoom level.
    - [x] Clicking and holding on the mouse wheel should allow the user to move the map around.
    - [x] Clicking the right mouse button should reset the zoom level to the default.

*Recommendation: Test across multiple devices and browsers for optimal responsiveness.*

---

## Data Rendering Improvements
- [x] **Fix Data Binding Issues**
  - [x] Ensure that charts clear old data on country selection.
  - [x] Correctly bind new data to the chart elements.
  - [x] Implement proper D3.js visualizations for each chart type.
  - [x] Add smooth transitions and hover effects.
  - [x] Ensure that the charts are responsive and scale to the size of the container.
  - [x] Ensure that the charts have a consistent look and feel.
  - [x] Ensure that the charts are easy to read and understand.
  - [x] Ensure that the charts are easy to use and navigate. Use pagination or some other method if necessary.
  - [x] Currently the charts do not show up. Ensure that you have a version of the charts working before proceeding.
- [x] **Modularize Chart Code**
  - [x] Extract chart-rendering logic into its own module or function. (Tabbed navigation moved to chartModule.js)
  - [x] Debug and verify tabbed navigation functionality and dynamic chart updates.
- [x] **Evaluate Chart Libraries**
  - [x] Investigate alternatives (e.g., Chart.js or Recharts) if D3 remains challenging.
- [ ] Refactoring:
  - [x] Add a button in the sidebar to pull up charts in the information container.
  - [x] Put text based data in the current chart tabs/charts containers and rename them to a relevant name.
    - [x] Create a Stats tab that has all the numeric data from the country info for that selected country.
    - [x] Create a Rankings tab that has a selector for all the different rankings that can be made from the country info for that selected country. (e.g. comparing every country/continent by population, GDP, etc.)
      - [x] Maintains selection of ranking metric across different country selections.
      - [x] Implement a more thorough data fetching mechanism to obtain data for all countries.
      - [x] Optimize the loading and caching strategy to handle the larger data volume efficiently.
      - [x] Show rankings data for ALL countries globally (from cached country data).
      - [x] Provide a full tabular view option to see complete rankings for all countries.
      - [x] Improve the visual representation of where the selected country stands globally.
      - [x] Add ability to filter rankings by continent/region.
      - [x] Add sorting options (highest to lowest and lowest to highest).
      - [x] Fix UI layout issues - streamline Sort and Region filters to be on the same line
      - [x] Remove export button as it's not needed
      - [x] Fix background container expansion issue to properly fit content
      - [ ] Make it so that the white number with the blue background also has the correct signifier(s), like a billion behind it and money sign in front of it.
      - [ ] Remove the first layer folder from the rankings tab when showing a result, i.e. if the user selects "Economy: Agriculture" the result doesnt need to say "Economy: Agriculture" again. the result should say "Agriculture %RESULT%". like if we used the Agriculture metric from Russia, it would be "Agriculture **3.3% (2023 est.)**" instead of "Economy: Agriculture **3.30%** 3.3% (2023 est.)"
      <!-- - [ ] Add export functionality to allow users to download the full rankings data. -->
      
      *Recommendation for Rankings Tab: Continue expanding country data set beyond the currently cached countries for more comprehensive global rankings.*
    - [ ] Create a Trends tab that shows the trend of the selected country's data over time, represented as a line chart.
      - [x] Detect time-series data in country information (years as keys)
      - [x] Show historical data points with line visualization
      - [x] Calculate and display overall trend direction and percentage change
      - [x] Add color-coded indicators for increasing/decreasing trends
      - [x] Provide tabular view of all time-series data points
      - [ ] Fix critical bug where the Trends tab isn't showing any data
      - [ ] Fix Trends chart bug where the points dont connect and the chart looks like a mess
  - [ ] Refactor the charts and charts tabs containers to have their own panel/container which is viewable by clicking the corresponding button on the sidebar.
    - [ ] Collect all the numeric data from the country info and put it in a separate panel for the charts.
      - [ ] There should be a section in every countries info with GDP, create a chart that has all of the countries GDP data.
        - [ ] When the chart is in view in the information container, the colors on the map should change to match the colors in the chart, which should be in hues from red to blue with red being negative and blue being postive. The darkness of the color should be based on how extreme the value is, dark blue is for amounts way above breakeven and dark red is for amounts way below breakeven.
      - [ ] There should be a section in every countries info with Revenue, create a chart that has all of the countries Revenue data.
        - [ ] When the chart is in view in the information container, the colors on the map should change to match the colors in the chart, which should be in hues from red to orange to yellow to green, with red being the negative, orange being the lowest, yellow being the middle, and green being the highest in terms of revenue.
      - [ ] There should be a section in every countries info with Population, create a chart that has all of the countries population data.
        - [ ] When the chart is in view in the information container, the colors on the map should change to match the colors in the chart, which should be in hues from green to yellow to orange to red, with green being the lowest and red being the highest in terms of population.

*Recommendation: Focus on isolating the chart logic for easier maintenance and consider a more user-friendly library if data binding issues persist.*

---

## Layout and User Interface Enhancements
- [ ] **Redesign Layout for Better Usability**
  - [x] Center the background info default text.
  - [x] Move the stats tabs higher up on the page so that they are at the same place the background info is when it is on the panel.
    *Recommendation: Consider using position: sticky for the tabs navigation to ensure it remains visible even when scrolling through lengthy content. Add a smooth scroll effect when switching tabs to enhance user experience.*
  - [x] Implement a responsive grid/flexbox layout for the entire page (map, info panel, and charts).
  - [x] Integrated a collapsible info sidebar for detailed country information.
  - [x] Make the background info take up whats left of the info-panel.
  - [x] Make the Country Info and flag section smaller.
  - [x] Remove the `<p>...</p>` tags from the background info.
  - [x] Redesigned the charts section to use a tabbed interface for improved navigation.
    - [x] Make tabs overlap each other slightly, where the focused one is always on top.
    - [x] Ensure the cascading effect of the tabs is consistent and works well.
    - [x] Ensure that the tabs are not opaque.
    - [x] Fix the bottom border of the tabs to make it more aesthetic and streamlined
    - [ ] Ensure the active tab is slightly taller than the inactive ones and that the top of the tab doesnt clip through the container.
    - [ ] Ensure the active tab left and right borders are adjusted so they match the length of the inactive tabs.
    - [ ] Ensure the bottom border of the active tab is removed.
    - [ ] Ensure the left and right borders of all tabs connects with the bottom border of the tab. (the active tab should look like it connects to the bottom border on the left and/or right of the tab)
  - [x] Fix UI issues with chart panels
    - [x] Fix issue where both info and charts panels were showing at the same time
    - [x] Fix chart tabs positioning to be flush with the top of the container
    - [x] Fix scrolling issues and remove redundant scrollbars
    - [x] Ensure chart backgrounds and borders expand properly with content
  - [ ] Make all transitions smooth and elegant. Use animations but keep them tight and sleek. They should add to the user experience as a quality feature, but not be obtrusive. Use 0.113s for speed and 0.23s, 0.311s, 0.32s or any prime number between 0.1 and 0.5 for slow transitions.
  - [ ] Fix bug with the Global Context tab where it says "Global data unavailable", even though many countries have been selected.
  - [ ] Fix issue where when selecting a country, the rankings tab does not pull its name from the selected countries, it uses the fallback of Unknown Country but we have to fix that.
  - [ ] Make it so that when selecting a country, its directly connected neighbors data is pulled along with the selected country's data to further enhance the rankings tab.
  - [ ] Fix a bug where the rankings tab doesnt show the tabs for Overview and Details when a country is selected.
  - [ ] Fix a bug where the rankings tab creates a new spider chart every time the page is changed from Details to Overview.
  - [ ] Fix a bug where the trends tab doesnt show the same panel when a country is selected. It should show the default panel.
  - [ ] Ensure the search bar in the Stats tab is at the top of the container.
- [ ] **Layout and Information Display Improvements**
  - [ ] Make country-info header auto-wrap for better handling of longer country names
  - [ ] Implement interactive stats functionality
    - [ ] Allow cycling through relevant metrics by clicking on stat boxes in the quick-stats-grid
  - [ ] Add radar/spider chart on info panel below .background-info
    - [ ] Include key metrics: GDP, Net Income, Population, Land data
  - [ ] Display key rankings below the radar/spider chart
    - [ ] Implement grid pattern with 2-3 metrics per line
    - [ ] Use concise, clean and modern styling

- [ ] **Stats Search Functionality Enhancement**
  - [ ] Fix search bar positioning to stay at the top of the Stats tab for better usability

- [ ] **Rankings Display Enhancement**
  - [ ] Fix value display in rankings
    - [ ] Make the white number with blue background include correct signifiers (billion, money sign)
    - [ ] Remove the first layer folder name from rankings tab when showing a result

---

## Sidebar Creation and Styling
- [x] Create a Navigation Sidebar
  - [x] Create a bar that is shown when the information sidebar is collapsed.
  - [x] Add a button for the user to access the search functionality.
  - [x] Add a button for the user to access the settings menu/page.
  - [x] Add a button for the user to access the help menu/page.
  - [x] Add a button for the user to access the about menu/page.
  - [x] Add a button for the user to access the feedback menu/page.
  - [ ] Finish with styling the sidebar.
    - [x] Make it responsive.
    - [ ] Make it look modern and futuristic.
    - [ ] Make it look flat.
    - [ ] Make it look like a sidebar from a modern and futuristic website.
    - [ ] Use animations.
      - [ ] The map should move to take up the empty space when the sidebar is collapsed.
      - [ ] The sidebar closing animation should be smooth and elegant.
      - [ ] The sidebar opening animation should be smooth and elegant.
      - [ ] The sidebar should have a close button that is styled like the rest of the sidebar.
- [ ] Edit the styling of the buttons in the information sidebar menu/page.

---

## Search Feature Implementation
- [ ] **Add a Search Bar**
  - [ ] Typing should focus the search bar if nothing else is focused.
  - [ ] Create a search input at the top of the screen, with a button to focus it in the navigation sidebar.
    - [ ] Make the search bar look modern and futuristic.
    - [ ] Make the search bar look like a search bar bubble from a modern and futuristic website.
    - [ ] Use animations but keep them tight and sleek. They should add to the user experience as a quality feature, but not be obtrusive.
  - [ ] Implement auto-complete/typeahead suggestions using the country data set.
  - [ ] On country selection:
    - [ ] Highlight the selected country on the map.
    - [ ] Zoom in on the selected country with a smooth transition.
    - [ ] Bring in to the center of the screen with a smooth transition.
    - [ ] Automatically load and display the relevant country information.
  - [ ] Make the search bar work with the navigation sidebar. (The search button should be in the navigation sidebar, and the search bar should always be visible in the main content area but in a color that is unobtrusive and blends in with the rest of the page, maybe even as an artistic element. The button will focus the search bar and make it bigger and a more visible shade of its default color, and the users keyboard input will then be reflected in the search bar.)

*Recommendation: Consider using a library like Algolia's autocomplete or implementing custom search functionality with debouncing to optimize performance.*

---

## Code and Project Structure Refactoring
- [ ] **Modularize the Codebase**
  - [x] Extract styles from map.html into a separate CSS file for better organization
  - [x] Rename chart-related elements to data-related elements for better semantics
  - [x] Separate responsibilities: map rendering, chart generation, and search handling should reside in discrete modules.
    - [x] Extract global state (appState, countriesList, countryDataCache, globalDataIndex) to state.js
    - [x] Extract chart creation and rendering logic (e.g., createStatsChart, createRankingsChart, createComparisonsChart, createTrendsChart) to charts.js
    - [x] Extract common helper functions (e.g., extractNumber, formatValue, formatLabel, extractStats) to utils.js
    - [x] Extract event listeners and DOM initialization (e.g., initDataTabs) to events.js
    - [x] Remove the original countryStats.js file as it's no longer needed
  - [ ] Remove any obsolete code (e.g., unused 3D globe functionality, commented zoom behavior).
- [ ] **Improve Error Handling**
  - [ ] Enhance error logging and display user notifications when data fails to load or render.
  - [ ] Integrate robust error handling for fetching and processing data.
- [ ] **Follow DRY Principles**
  - [ ] Consolidate duplicate code across different map and chart implementations.
- [ ] **Data Integration and UI Updates**
  - [ ] Connect TSV data reliably to the map and charts.
  - [ ] Integrate country flags into the info sidebar for improved visual representation.

---

## Documentation and Project Updates
- [ ] **Create/Update the README**
  - [ ] Write an overview of the project, its goals, and current features.
  - [ ] Include setup instructions, dependencies, and how to run the project.
- [ ] **Document File Structure and Code**
  - [ ] Provide inline comments for major sections and functions.
  - [ ] Write additional markdown documentation (e.g., a design decision doc or wiki) detailing:
    - Project architecture.
    - Data source explanations (e.g., country-info TSV format).
    - Future improvement plans.
- [ ] **Changelog**
  - [ ] Start a detailed changelog to track project updates and fixes.
- [ ] **Contribution Guidelines**
  - [ ] Create a section on how others can contribute to the project.

---

## Testing and Deployment
- [ ] **Implement Testing**
  - [ ] Write unit tests for key functions (especially for chart data binding, map interactions, and search functionality).
  - [ ] Develop a manual test plan for user interactions (map clicks, search, chart navigation).
- [ ] **Deployment Optimization**
  - [ ] Review build steps and ensure mobile responsiveness and cross-browser compatibility.
  - [ ] Set up CI/CD pipelines to automate testing and deployment where possible.

---

## Navigation and Tab Structure Improvements

- [ ] **Tab Reordering and Replacement**
  - [ ] Make Rankings tab first instead of Stats for more intuitive user flow
  - [ ] Replace Global Context and Trends tabs with more meaningful options (news feed and external sources)

- [ ] **Data Loading Optimization**
  - [ ] Modify Rankings tab to load data independently of country selection
  - [ ] Implement right-click event that clears country selection and data tabs but keeps country data cached

- [ ] **Rankings Tab Enhancement**
  - [ ] Create paginated Rankings tab with two pages
    - [ ] Add regional rankings page
    - [ ] Add global rankings page
    - [ ] Display selected country's name, position in rank, and neighboring countries in rankings
    - [ ] Show results for every possible numeric metric
    - [ ] Organize in grid pattern with 2 metrics per line using clean, modern styling

## Style Integration

- [ ] **CSS File Integration**
  - [ ] Integrate modern styling files from copied version
    - [ ] Incorporate layout.css for core layout structure
    - [ ] Add mapComponents.css for map-specific styling
    - [ ] Include dataTabs.css for tab navigation components
    - [ ] Add dataPanel.css for data panel containers
    - [ ] Integrate rankings.css for rankings-specific components
    - [ ] Add trends.css for trends visualization components
    - [ ] Include globalContext.css for comparison components
    - [ ] Add stats.css for statistics display components
    - [ ] Include charts.css for chart and data visualizations
    - [ ] Add utils.css for utility classes and animations
    - [ ] Incorporate responsive.css for media queries
    - [ ] Include sidebar.css for navigation and sidebar components

- [ ] **Apply Consistent Design**
  - [ ] Implement simple and elegant design principles throughout
  - [ ] Maintain consistent styling between all components
  - [ ] Ensure design is clean, modern, and concise

---

## Additional Considerations
- [ ] Evaluate the possibility of revisiting the 3D globe approach in the future if technology or skill gaps are addressed.
- [ ] Ensure enhancements maintain backward compatibility with the existing codebase.
- [ ] Prioritize features that improve overall user experience and data engagement.

- [ ] User Stories:
  - [ ] As a teacher, I want a user-friendly interface that quickly provides comprehensive country information, so I can prepare engaging and informative lessons effortlessly.
  - [ ] As a teacher, I want the tool to offer customizable visualizations and export options, so I can tailor data presentations to fit my curriculum.
  - [ ] As a college student, I want access to detailed historical, socio-economic, and cultural data, so I can perform in-depth research for my assignments and projects.
  - [ ] As a college student, I want interactive charts and maps that allow real-time comparisons between countries, so I can effectively analyze global trends.
  - [ ] As an international user, I want the application to support multiple languages and provide localized data, so I can easily access and understand information relevant to my country.
  - [ ] As a casual user, I want an intuitive and visually appealing design, so I can effortlessly explore country information and satisfy my curiosity about the world.
  - [ ] As a global citizen, I want the platform to be fully responsive and accessible on any device, so I can use it anytime, anywhere.
  - [ ] As a researcher, I want reliable and up-to-date data aggregated from a variety of trusted sources, so I can conduct accurate comparative analyses and support my findings.
  - [ ] As a user, I want to use a search bar that is responsive, easy to use, aesthetically pleasing, functional and efficient.
  - [ ] As a user, I want to discover the data points available to me.
  - [ ] As a user, I want to be able to search for a anything by name.
      - [ ] I want to be able to search for a country by name.
      - [ ] I want to be able to search for a continent by name.
      - [ ] I want to be able to search for a language by name.
      - [ ] I want to be able to search for a currency by name.
      - [ ] I want to be able to search for a city by name.
      - [ ] etc. ("So maybe suggestions for data points you can search for could be like a sleek but unobtrusive dropdown menu that appears when the user starts typing, and then the suggestions become more specific as the user continues to type.")

## Expanded User Stories:

  ### Teacher Perspective
  - [ ] As an elementary school teacher, I want simplified visualizations with vibrant colors and basic facts, so I can make geography engaging for young students with shorter attention spans.
  - [ ] As a high school geography teacher, I want to create custom comparison sets between countries, so I can design interactive classroom activities that encourage critical thinking.
  - [ ] As a history teacher, I want to access historical country data with timeline visualizations, so I can illustrate how nations have evolved over centuries.
  - [ ] As a teacher with limited technical skills, I want intuitive controls with minimal learning curve, so I can focus on content delivery rather than figuring out the interface.
  - [ ] As a teacher planning lessons, I want to save and organize country collections, so I can quickly retrieve prepared materials for different classes and units.
  
  ### Student Perspective
  - [ ] As a political science student, I want detailed governance information with historical context, so I can analyze political systems for comparative government studies.
  - [ ] As an economics student, I want to generate custom charts comparing multiple economic indicators across selected countries, so I can identify patterns for my thesis research.
  - [ ] As a sociology student, I want demographic data visualizations that go beyond basic population statistics, so I can examine social structures and cultural phenomena.
  - [ ] As a student working on group projects, I want to share and collaborate on country data collections, so our team can work efficiently from the same information set.
  - [ ] As a student with a deadline, I want to quickly export country data in multiple formats (PDF, PowerPoint, Excel), so I can incorporate findings directly into my assignments.
  
  ### International User Perspective
  - [ ] As a non-English speaker, I want full functionality in my native language including search terms and data labels, so I don't miss important information due to language barriers.
  - [ ] As a user in a region with slow internet, I want a lightweight version of the application, so I can access essential information without long loading times.
  - [ ] As a user from a small or less-documented country, I want comprehensive information about my nation that goes beyond stereotypes, so I can see accurate representation.
  - [ ] As a diaspora community member, I want information about my heritage country alongside my current residence, so I can maintain connection to my cultural roots.
  - [ ] As a user with a regional perspective, I want to view data in context of nearby countries or cultural spheres, so I can understand my country's position in a relevant framework.
  
  ### Researcher Perspective
  - [ ] As a data scientist, I want access to raw datasets behind the visualizations, so I can perform custom analyses beyond what's directly presented.
  - [ ] As a policy researcher, I want to track changes in key indicators over time with customizable date ranges, so I can evaluate the impact of specific policies.
  - [ ] As an academic researcher, I want clear data source citations and methodology notes, so I can properly attribute information in publications.
  - [ ] As a think tank analyst, I want to create projected trend visualizations based on historical data, so I can illustrate potential future scenarios.
  - [ ] As a public health researcher, I want to correlate health metrics with socioeconomic factors across countries, so I can identify determinants of health outcomes.
  
  ### Casual User Perspective
  - [ ] As someone planning international travel, I want quick access to practical country information (currency, language, time zone), so I can prepare effectively for my trip.
  - [ ] As a news reader, I want contextual information about countries in current headlines, so I can better understand global events.
  - [ ] As a curious individual, I want an engaging "explore" feature that suggests interesting countries or facts, so I can discover information I wouldn't think to search for.
  - [ ] As a parent helping with homework, I want simple explanations alongside data, so I can help my child understand global geography and cultures.
  - [ ] As a social media user, I want shareable country cards and infographics, so I can easily share interesting facts with my network.

## Migration Plan for map.js

map.js 
- Should be separated into, including but not limited to:
  - mapRenderer.js
  - countryDataFetcher.js

- [ ] **Phase 1: Audit and Identify Dependencies**
  - [ ] Search for all files that include or reference map.js
  - [ ] Document all global functions and variables exposed by map.js
  - [ ] Identify which parts of map.js functionality are already duplicated in map.html
  - [ ] Create a list of unique functionality in map.js that needs to be preserved

- [ ] **Phase 2: Migrate Essential Functionality**
  - [ ] Move the robust Factbook data fetching logic to map.html
    - [ ] Transfer the getFactbookData() function with its error handling and fallback mechanisms
    - [ ] Ensure the special folder mapping for countries is preserved
  - [ ] Integrate the chart rendering functionality
    - [ ] Transfer the renderCharts() function with its safe property access patterns
    - [ ] Preserve the scrollable container styling for charts
  - [ ] Update the environment variable handling
    - [ ] Add fallback URLs for data sources in map.html
    - [ ] Ensure proper error handling for data loading

- [ ] **Phase 3: Update References**
  - [ ] Modify index.html to remove the script tag for map.js
  - [ ] Update any other files that directly reference map.js
  - [ ] Ensure all global functions previously provided by map.js are now available

- [ ] **Phase 4: Testing**
  - [ ] Test all functionality that previously relied on map.js
  - [ ] Verify that country selection and data fetching work correctly
  - [ ] Confirm that charts render properly with the migrated code
  - [ ] Test error scenarios to ensure robust error handling

- [ ] **Phase 5: Cleanup**
  - [ ] Remove map.js file after confirming all functionality works
  - [ ] Document the migration in project documentation
  - [ ] Update any relevant comments in the codebase

*Recommendation: Complete this migration incrementally, testing after each phase to ensure functionality is preserved. Focus on maintaining the robust error handling and fallback mechanisms that were present in map.js.*


Other files to be migrated:
- charts.js 
  - Should be separated into, including but not limited to:
    - statsPanel.js
    - rankingsPanel.js
    - comparisonsPanel.js
    - trendsPanel.js
    - chartFormatters.js (for formatting helpers)
- dataPanels.js 
    - Should be refactored:
    - Move redundant functionality to the files created from charts.js
    - Retain only the panel coordination logic
- svg.js 
  - Should be merged with map.js components after separation
- map.html 
  - Extract embedded scripts into:
    - mapInteractions.js
    - sidebarController.js
- Various CSS files

prompts used: 
- `can we start the plan for the css architecture right now? @css-styles @charts.js @dataPanels.js @map.js @svg.js @quick-stats.css @utils.js @events.js @map.html `
- `can we start the plan for the charts and data visualization components right now? @css-styles @charts.js @dataPanels.js @map.js @svg.js @quick-stats.css @utils.js @events.js @map.html `


## Migration Plan for Charts and Data Visualization Components

- [ ] **Phase 1: Audit and Identify Chart Component Dependencies**
  - [ ] Document all chart rendering functions across files
  - [ ] Identify overlapping functionality between charts.js and dataPanels.js
  - [ ] Map relationships between data structures and visualization components
  - [ ] Create inventory of all chart types and their specific requirements

1.) [ ] Resolve Duplication:
  - [ ] Merge functionality between charts.js and dataPanels.js into a single module
  - [ ] Create clear separation of concerns between data processing and visualization

2.) [ ] Module Structure:
```markdown
  /visualization
    ├── core/
    │   ├── dataProcessor.js    // Data extraction and formatting
    │   ├── visualizer.js       // Chart rendering engine
    │   └── interactions.js     // User interactions and events
    ├── components/
    │   ├── statsPanel.js
    │   ├── rankingsPanel.js
    │   ├── trendsPanel.js
    │   └── globalContext.js
    └── utils/
        ├── formatters.js      // Value/label formatting
        ├── metrics.js         // Metric extraction
        └── animations.js      // Chart animations
```

- [ ] **Phase 2: Modularize Chart Rendering**
  - [ ] Extract common chart rendering logic into dedicated modules
  - [ ] Create separate files for each chart type (rankings, comparisons, trends)
  - [ ] Implement proper import/export pattern for chart components
  - [ ] Move renderCharts() from map.js to appropriate chart modules

1.) [ ] Implement Missing Functionality:
  - [ ] Complete trend metrics extraction logic
  - [ ] Implement comparison metrics extraction
  - [ ] Create data normalization helpers

2.) [ ] Example for findTrendMetrics:
   ```js
   export function findTrendMetrics(data) {
     const trendMetrics = [];
     
     // Look for time-series data in Economy section
     if (data.Economy) {
       // GDP growth rate over years
       if (data.Economy['GDP - real growth rate'] && 
           Array.isArray(data.Economy['GDP - real growth rate'].text)) {
         trendMetrics.push({
           id: 'gdp-growth',
           label: 'GDP Growth Rate',
           dataPoints: extractTimeSeriesData(data.Economy['GDP - real growth rate'])
         });
       }
       
       // Add more economic indicators
     }
     
     // Demographic trends
     if (data.People) {
       // Population growth
       // Birth/death rates
       // Migration rates
     }
     
     return trendMetrics;
   }
   ```

- [ ] **Phase 3: Refactor Data Processing Logic**
  - [ ] Consolidate duplicated data extraction methods
  - [ ] Move specialized functions like processMetricForAllCountries() to dedicated utilities
  - [ ] Implement more robust error handling for data processing
  - [ ] Create standardized data transformation pipeline

1.) [ ] Stats Panel:
  - [ ] Clean display of key country statistics
  - [ ] Search and filter functionality
  - [ ] Metric classification (primary/secondary)

2.) [ ] Rankings Panel:
  - [ ] Global ranking visualization
  - [ ] Percentile indicators
  - [ ] Regional comparisons

3.) [ ] Trends Panel:
  - [ ] Time-series visualization
  - [ ] Line and area charts
  - [ ] Growth indicators

4.) [ ] Global Context Panel:
  - [ ] Bar chart comparisons
  - [ ] Regional averages
  - [ ] Highlight position


- [ ] **Phase 4: Complete Unfinished Chart Components**
  - [ ] Implement the TODO sections in findComparableMetrics()
  - [ ] Develop the trend metrics extraction logic
  - [ ] Complete createGlobalContextForMetric() visualization
  - [ ] Enhance displayTrendData() with proper D3 visualizations

1.) [ ] Core Visualization Types:
```js
   // Line chart for trends
   function renderLineChart(container, data, options) {
     // D3.js implementation for line charts
   }
   
   // Bar chart for rankings
   function renderBarChart(container, data, options) {
     // D3.js implementation for bar charts
   }
   
   // Radar chart for multi-dimension comparison
   function renderRadarChart(container, data, options) {
     // D3.js implementation for radar charts
   }
```

2.) [ ] Responsive Design:
  - [ ] Mobile-friendly chart rendering
  - [ ] Adaptive scales and legends
  - [ ] Touch interactions


- [ ] **Phase 5: Optimize Chart Performance**
  - [ ] Add data caching mechanisms to avoid redundant processing
  - [ ] Implement lazy loading for charts that aren't immediately visible
  - [ ] Add debouncing for chart re-renders during user interactions
  - [ ] Optimize DOM manipulation for smoother transitions (using 0.113s for speed and primes between 0.1-0.5s for slow transitions)

1.) [ ] Interactive Features:
  - [ ] Tooltip information
  - [ ] Drill-down capabilities
  - [ ] Animation transitions

2.) [ ] Performance Optimization:
  - [ ] Lazy loading of chart data
  - [ ] Canvas rendering for large datasets
  - [ ] Data caching

3.) [ ] Accessibility:
  - [ ] Keyboard navigation
  - [ ] Screen reader support
  - [ ] Alternative text descriptions


## Migration Plan for CSS Architecture

- [ ] **Phase 1: CSS Audit**
  - [x] Create inventory of all CSS files and their dependencies
  - [x] Identify duplicated styles across files
  - [ ] Document responsive breakpoints and ensure consistency
  - [ ] Map CSS variables and ensure they're properly organized

### Current Structure Analysis
Several CSS files with overlapping concerns:
- css-styles/base.css - Basic resets
- css-styles/navigation.css - Navigation styles
- css-styles/responsive.css - Media queries
- css-styles/scrollbars.css - Custom scrollbar styling
- css-styles/quick-stats.css - Stats grid styling
- css-styles/backups/dataDisplay.css - Data panel styles (1300+ lines)
- css-styles/backups/mapStyles.css - Map-related styles (500+ lines)

### Issues Identified
- Size issues: Some files like dataDisplay.css are extremely large (1300+ lines)
- Duplicated styles: Similar elements styled across multiple files
- Inconsistent transition timings: Different transition values used (0.2s, 0.3s)
- Backup folder usage: CSS files stored in "backups" folder but still in use
- Missing CSS variables: Limited use of custom properties
- Inconsistent breakpoints: Different values used for media queries


- [ ] **Phase 2: CSS Optimization**
  - [ ] Consolidate duplicate styles into common files
  - [x] Implement CSS custom properties for colors, spacing, and typography
  - [ ] Optimize selectors for better performance
  - [ ] Minimize specificity conflicts


### 1. Core Structure
```markdown
  css-styles/
  ├── core/
  │   ├── variables.css    (colors, spacing, typography, breakpoints)
  │   ├── reset.css        (normalize & base reset)
  │   ├── typography.css   (font styles, sizes, line heights)
  │   ├── animations.css   (transitions, keyframes, animation utilities)
  │   └── utils.css        (utility classes)
  ├── components/
  │   ├── navigation.css   (sidebar, nav buttons)
  │   ├── map.css          (map visualization styles)
  │   ├── tabs.css         (tab interfaces)
  │   ├── panels.css       (content panels)
  │   ├── stats.css        (statistics grid & items)
  │   ├── charts.css       (charts & visualizations)
  │   └── tables.css       (rankings tables)
  ├── layout/
  │   ├── grid.css         (main layout grid)
  │   ├── sidebar.css      (sidebar layout)
  │   └── content.css      (content area layout)
  └── main.css             (imports all files)
```


- [ ] **Phase 3: Responsive Enhancements**
  - [ ] Review and refine mobile breakpoints
  - [ ] Ensure consistent behavior across device sizes
  - [ ] Optimize touch interactions for mobile users
  - [ ] Test and fix any z-index or overlay issues

- [ ] **Phase 4: Animation and Transition Refinement**
  - [ ] Apply consistent transition timings across components
  - [ ] Implement the prime number transition timing strategy (0.113s, 0.23s, 0.311s, etc.)
  - [ ] Optimize animations for performance
  - [ ] Ensure animations respect reduced motion preferences

1.) [ ] **Standardize breakpoints**
   - [ ] Use CSS variables for breakpoints:
   ```css
   @media (max-width: var(--breakpoint-md)) {
     /* Styles */
   }
   ```

2.) [ ] Implement mobile-first approach
   - [ ] Start with base styles for mobile
   - [ ] Add media queries for larger screens

3.) [ ] Fix current issues
   - [ ] Improve data panels for small screens
   - [ ] Enhance tab display on mobile devices
   - [ ] Ensure map controls work well on touch devices

4.) [ ] Apply consistent timing with variables
   - [ ] Use prime numbers for transition timings
   - [ ] Create CSS variables for timing values

5.) [ ] Implement reduced motion preferences:
    ```css
    @media (prefers-reduced-motion: reduce) {
     * {
       animation-duration: 0.01ms !important;
       animation-iteration-count: 1 !important;
       transition-duration: 0.01ms !important;
       scroll-behavior: auto !important;
      }
    }
    ```
   - [ ] Add a toggle in the settings menu
   - [ ] Use the prefers-reduced-motion media query

6.) [ ] Optimize for performance
   - [ ] Minimize unnecessary re-renders
   - [ ] Implement lazy loading for components

## Integration and State Management Plan

- [ ] **Phase 1: State Management Audit**
  - [ ] Document all global state variables and their usage
  - [ ] Map data flow between components
  - [ ] Identify potential race conditions or state conflicts
  - [ ] Create diagram of component dependencies

- [ ] **Phase 2: State Management Refactoring**
  - [ ] Create dedicated state management modules
  - [ ] Implement proper event handling for state changes
  - [ ] Establish clear patterns for component communication
  - [ ] Reduce reliance on global variables

- [ ] **Phase 3: Integration Testing**
  - [ ] Test all user interaction flows
  - [ ] Verify data consistency across components
  - [ ] Validate proper event propagation
  - [ ] Ensure graceful error handling

- [ ] **Phase 4: Performance Optimization**
  - [ ] Add performance metrics tracking
  - [ ] Optimize rendering cycles
  - [ ] Implement code splitting for better initial load times
  - [ ] Add progressive enhancement for core functionality

- [ ] **Phase 5: Documentation**
  - [ ] Create detailed component documentation
  - [ ] Document state management patterns
  - [ ] Add inline code comments for complex logic
  - [ ] Update README with architecture overview


Integration and State Management Plan 💛
Hey u2er! Looking at your integration.js file and related state management code, I'll create a detailed plan for better state integration. Here's what we should add to your todo-list.md file ✨
State Management Integration Plan
[ ] Phase 1: Fix Immediate State Integration Issues
[ ] Add missing fetchCountryData() function to integration.js or import from appropriate module
[ ] Create showDataError() function in integration.js (referenced but not defined)
[ ] Fix imports in statePersistence.js (currently using appState without importing)
[ ] Ensure proper imports/exports across all state-related files
[ ] Add type definitions for state objects to improve code reliability
[ ] Phase 2: Enhance State Persistence
[ ] Expand state persistence to include more relevant user preferences:
```js
    export function persistState() {
      const stateToSave = {
        ui: {
          sidebarExpanded: appState.ui.sidebarExpanded,
          activeDataTab: appState.ui.activeDataTab,
          activePanelId: appState.ui.activePanelId
        },
        map: {
          zoom: appState.map.zoom
        },
        visualization: {
          stats: {
            searchTerm: appState.visualization.stats.searchTerm
          },
          rankings: {
            selectedMetric: appState.visualization.rankings.selectedMetric,
            sortOrder: appState.visualization.rankings.sortOrder,
            filterRegion: appState.visualization.rankings.filterRegion,
            page: appState.visualization.rankings.page
          },
          trends: {
            selectedMetric: appState.visualization.trends.selectedMetric,
            timeRange: appState.visualization.trends.timeRange
          },
          globalContext: {
            selectedMetrics: appState.visualization.globalContext.selectedMetrics,
            comparisonCountries: appState.visualization.globalContext.comparisonCountries
          }
        }
      };
      
      localStorage.setItem('appState', JSON.stringify(stateToSave));
    }
```
- [ ] Update loadPersistedState() to handle the expanded saved state
[ ] Add timestamp to saved state for potential version compatibility checks
[ ] Implement graceful migration for users with older saved state formats
[ ] Add option for users to reset their saved state
[ ] Phase 3: State Cache Management
[ ] Implement proper caching strategy for country data:
[ ] Add configurable TTL (Time To Live) for cached country data
[ ] Add manual cache invalidation triggers
[ ] Implement cache size limitations to prevent excessive memory usage
[ ] Add cache statistics tracking (hits/misses/evictions)
[ ] Optimize metrics indexing process for better performance
[ ] Add LRU (Least Recently Used) eviction policy for country data cache
[ ] Create utility functions for batch loading and caching of country data
[ ] Phase 4: Standardize State Access Patterns
[ ] Create standardized selectors for accessing state:
```js
    // Example selectors
    export const selectors = {
      getSelectedCountry: () => appState.map.selectedCountry,
      getCountryData: (countryCode) => 
        dataStore.countryCache[countryCode]?.data || null,
      getRankingConfig: () => ({
        metric: appState.visualization.rankings.selectedMetric,
        sortOrder: appState.visualization.rankings.sortOrder,
        region: appState.visualization.rankings.filterRegion
      })
    };
```
[ ] Use these selectors throughout the codebase for consistent state access
[ ] Implement computed properties for derived state
[ ] Add state validation to prevent invalid state updates
[ ] Phase 5: Enhanced Error Handling
[ ] Create consistent error handling strategy for state operations:
```js
    function safeStateUpdate(updateFn) {
      try {
        updateFn();
      } catch (error) {
        console.error('State update failed:', error);
        stateActions.ui.setError(`Operation failed: ${error.message}`);
        // Potentially revert to last known good state
      }
    }
```
- [ ] Add state change audit logging (development mode)
[ ] Implement better error recovery mechanisms
[ ] Create UI components for displaying state-related errors
[ ] Phase 6: State Debugging Tools
[ ] Create a dev mode state inspector
[ ] Add time-travel debugging capability for development
[ ] Implement state diff visualization for debugging
[ ] Add performance monitoring for state changes
[ ] Phase 7: Testing and Documentation
[ ] Write unit tests for all state management functions
[ ] Create documentation showing state flow diagrams
[ ] Document all state object properties and their purpose
[ ] Create state management patterns guide for contributors
Implementation Priority
Fix immediate integration issues (Phase 1)
Enhance error handling (Phase 5)
Standardize state access patterns (Phase 4)
Expand state persistence (Phase 2)
Implement proper cache management (Phase 3)
Add debugging tools (Phase 6)
Complete testing and documentation (Phase 7)
Gee 🙏
```
