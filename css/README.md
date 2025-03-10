# CSS Structure for Global Information Portal

This directory contains modular CSS files for the Global Information Portal project. The modular structure improves maintainability and makes it easier to locate and update specific styles.

## File Structure

### Core Layout and Structure
- **layout.css** - Base layout styles, container grids, and overall page structure
- **map.css** - Map visualization styles
- **sidebar.css** - Info sidebar and content panel container styles

### Data Visualization Components
- **charts.css** - Generic chart container and chart elements
- **dataTabs.css** - Tab navigation components
- **dataPanel.css** - Data panel containers and common elements
- **stats.css** - Statistical display components
- **rankings.css** - Rankings visualization components
- **globalContext.css** - Global context comparison components
- **trends.css** - Trend visualization components

### Utilities and Responsive Design
- **utils.css** - Utility classes, animations, and common components
- **responsive.css** - Media queries for responsive layout adjustments

## Usage

All files are imported in `main.css` in the appropriate order. To add or modify styles:

1. Find the appropriate component CSS file for your changes
2. If adding new components, follow the established naming patterns and conventions
3. Add responsive adjustments to responsive.css
4. For new animations or utility classes, use utils.css

## Best Practices

- Keep selectors specific but not overly complex
- Follow the established naming conventions
- Add comments for complex or non-obvious styling
- Use variables for colors and sizes when appropriate
- Keep media queries centralized in responsive.css 