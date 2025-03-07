# TODO List

This list outlines all tasks needed to address current issues, update the project, and enhance documentation.

---

## Map Visualization Enhancements
- [x] **Refine Map Styling and Interactions**
  - [x] Updated country fill, hover, and click selection effects for better visual feedback.
  - [ ] Add smooth transitions when selecting a country (e.g., using D3 transitions).  
    *Recommendation: Utilize d3.transition() to add fade-in/out effects on selection/deselection.*
  - [ ] Verify the z-index stacking order so that the map integrates properly with overlays.
- [x] **Improve Navigation**
  - [x] Implemented zoom & pan functionality.
  - [ ] Further refine zoom/pan behavior as needed.
    - [ ] Zooming out to default should be a smooth transition and should reset the map position to the default.
    - [ ] Clicking and holding on the mouse wheel should allow the user to move the map around.
    - [ ] Double clicking the mouse wheel or the right mouse button should reset the zoom level to the default.

*Recommendation: Test across multiple devices and browsers for optimal responsiveness.*

---

## Chart Rendering Improvements
- [ ] **Fix Data Binding Issues**
  - [ ] Ensure that charts clear old data on country selection.
  - [ ] Correctly bind new data to the chart elements.
- [ ] **Modularize Chart Code**
  - [ ] Extract chart-rendering logic into its own module or function.
  - [ ] Debug and verify tabbed navigation functionality and dynamic chart updates.
- [ ] **Evaluate Chart Libraries**
  - [ ] Investigate alternatives (e.g., Chart.js or Recharts) if D3 remains challenging.

*Recommendation: Focus on isolating the chart logic for easier maintenance and consider a more user-friendly library if data binding issues persist.*

---

## Layout and User Interface Enhancements
- [ ] **Redesign Layout for Better Usability**
  - [ ] Implemented a responsive grid/flexbox layout for the entire page (map, info panel, and charts).
  - [ ] Integrated a collapsible info sidebar for detailed country information.
  - [ ] Make both the background info and charts section have a consistent look and feel, the background info should take up 2/3 of the height of the info container and the charts section should take up 1/3 of the height of the info container.
  - [ ] Make the Country Info and flag section smaller.
  - [ ] Redesigned the charts section to use a tabbed interface for improved navigation.
    - [x] Make tabs overlap each other slightly, where the focused one is always on top.
    - [ ] Hide the bottom of the tabs with an aesthetic looking bar.
    - [ ] Make the "GDP" tab align with the .charts container when active
    - [ ] Make the "Other" tab align with the .charts container when active

---

## Sidebar Creation and Styling
- [ ] Create a Navigation Sidebar
  - [ ] Create a bar that is shown when the information sidebar is collapsed.
  - [ ] Add a button for the user to access the search functionality.
  - [ ] Add a button for the user to access the settings menu/page.
  - [ ] Add a button for the user to access the help menu/page.
  - [ ] Add a button for the user to access the about menu/page.
  - [ ] Add a button for the user to access the feedback menu/page.
  - [ ] Finish with styling the sidebar.
    - [ ] Make it responsive.
    - [ ] Make it look modern and futuristic.
    - [ ] Make it look flat.
    - [ ] Make it look like a sidebar from a modern and futuristic website.
    - [ ] Use animations.
- [ ] Edit the styling of the buttons in the information sidebar menu/page.

---

## Search Feature Implementation
- [ ] **Add a Search Bar**
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
  - [ ] Separate responsibilities: map rendering, chart generation, and search handling should reside in discrete modules.
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

*Recommendation: Regularly update documentation to reflect new features and refactoring efforts.*

---

## Testing and Deployment
- [ ] **Implement Testing**
  - [ ] Write unit tests for key functions (especially for chart data binding, map interactions, and search functionality).
  - [ ] Develop a manual test plan for user interactions (map clicks, search, chart navigation).
- [ ] **Deployment Optimization**
  - [ ] Review build steps and ensure mobile responsiveness and cross-browser compatibility.
  - [ ] Set up CI/CD pipelines to automate testing and deployment where possible.

*Recommendation: Consider using Jest and React Testing Library for tests and integrate automated pipelines via GitHub Actions or similar services.*

---

## Additional Considerations
- [ ] Evaluate the possibility of revisiting the 3D globe approach in the future if technology or skill gaps are addressed.
- [ ] Ensure enhancements maintain backward compatibility with the existing codebase.
- [ ] Prioritize features that improve overall user experience and data engagement.

*General Recommendations:*
- Establish a clear roadmap for feature implementation and refactoring.
- Schedule periodic reviews to address technical debt.
- Always focus on enhancing user experience while integrating new functionalities.

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

- [ ] Expanded User Stories:

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
