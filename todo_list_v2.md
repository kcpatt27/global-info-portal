# Global Information Portal Todo List

## Data Visualization and Charts

- [ ] **Chart and Panel Container Refactoring**
  - [ ] Refactor the charts and charts tabs containers to have their own panel/container viewable via sidebar button
  - [ ] Collect all numeric data from country info and put it in a separate panel for charts
    - [ ] Create GDP chart for all countries
      - [ ] Map colors should change when chart is in view (red to blue gradient based on values)
    - [ ] Create Revenue chart for all countries
      - [ ] Map colors should change when chart is in view (red/orange/yellow/green gradient)
    - [ ] Create Population chart for all countries
      - [ ] Map colors should change when chart is in view (green/yellow/orange/red gradient)
  - [x] Provide tabular view of all time-series data points
  - [ ] Fix critical bug where the Trends tab isn't showing any data
  - [ ] Fix Trends chart bug where the points don't connect and the chart looks like a mess

- [ ] **Rankings Tab Enhancement**
  - [ ] Create paginated Rankings tab with two pages
    - [ ] Add regional rankings page
    - [ ] Add global rankings page
    - [ ] Display selected country's name, position in rank, and neighboring countries
    - [ ] Show results for every possible numeric metric
    - [ ] Organize in grid pattern with 2 metrics per line using clean, modern styling
  - [ ] Fix value display in rankings
    - [ ] Make the white number with blue background include correct signifiers (billion, money sign)
    - [ ] Remove the first layer folder name from rankings tab when showing a result
  - [ ] Fix bug where the rankings tab doesn't show tabs for Overview and Details when a country is selected
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
    - [ ] Use animations but keep them tight and sleek
    - [ ] Use 0.113s for speed and prime numbers between 0.1-0.5s for slow transitions
  - [ ] Fix bug with the Global Context tab showing "Global data unavailable" despite country selection
  - [ ] Fix issue where rankings tab doesn't pull selected country name (shows "Unknown Country")
  - [ ] Make it pull directly connected neighbors' data to enhance rankings tab
  - [ ] Fix bug where the trends tab doesn't show the same panel when a country is selected

- [ ] **Tab Structure and Navigation Improvements**
  - [ ] Make Rankings tab first instead of Stats for more intuitive user flow
  - [ ] Replace Global Context and Trends tabs with more meaningful options
    - [ ] Consider adding news feed tab
    - [ ] Consider adding external sources tab
  - [ ] Ensure the active tab is slightly taller than inactive ones (no clipping through container)
  - [ ] Ensure active tab left and right borders match length of inactive tabs
  - [ ] Remove bottom border of active tab
  - [ ] Ensure left/right borders of all tabs connect with bottom border

- [ ] **Information Display Improvements**
  - [ ] Make country-info header auto-wrap for better handling of longer country names
  - [ ] Implement interactive stats functionality
    - [ ] Allow cycling through relevant metrics by clicking on stat boxes in the quick-stats-grid

- [ ] **Data Loading Optimization**
  - [ ] Modify Rankings tab to load data independently of country selection
  - [ ] Implement right-click event enhancement
    - [ ] Clear country selection and data tabs but keep country data cached

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
  - [ ] Make it look flat
  - [ ] Make it look like a sidebar from a modern and futuristic website
  - [ ] Use animations
    - [ ] Map should move to take up empty space when sidebar is collapsed
    - [ ] Sidebar closing animation should be smooth and elegant
    - [ ] Sidebar opening animation should be smooth and elegant
    - [ ] Sidebar should have a close button styled like the rest of the sidebar
- [ ] Edit the styling of the buttons in the information sidebar menu/page

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

## Code and Project Structure Refactoring

- [ ] **Modularize the Codebase**
  - [ ] Remove any obsolete code (e.g., unused 3D globe functionality, commented zoom behavior)
- [ ] **Improve Error Handling**
  - [ ] Enhance error logging and display user notifications when data fails to load or render
  - [ ] Integrate robust error handling for fetching and processing data
- [ ] **Follow DRY Principles**
  - [ ] Consolidate duplicate code across different map and chart implementations