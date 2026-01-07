# 🌍 Global Information Portal

**An interactive world map that displays comprehensive country data from the CIA World Factbook, making geopolitical information accessible and engaging for students, educators, travelers, and curious minds.**

---

## Table of Contents

- [Overview/Motivation](#overviewmotivation)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage/Getting Started](#usagegetting-started)
- [Architecture Overview](#architecture-overview)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [License](#license)
- [FAQ](#faq)

---

## Overview/Motivation

The Global Information Portal was created as a more complex project for a certification, designed to be easy, fun, and educational. It provides easy access and comparison of data for approximately 240 global territories and countries, all sourced from the United States Central Intelligence Agency's World Factbook.

**Who is it for?**
- **Students** exploring geography, economics, and geopolitics
- **Educators** teaching global studies and comparative analysis
- **Travelers** researching destinations and cultural contexts
- **Digital nomads** understanding the countries they work in
- **Anyone** interested in the geopolitical data points of countries

**What problem does it solve?**
Traditional country data sources are often fragmented, hard to navigate, or require multiple tools to compare information. This portal consolidates comprehensive country statistics into a single, interactive interface where you can explore, compare, and visualize data with just a few clicks.

---

## Key Features

- **Interactive World Map**: Click any country on the map to instantly view detailed information
- **Comprehensive Country Data**: Access statistics across 7+ categories: Geography, People & Society, Economy, Energy, Military, Transportation, and Communications
- **Global & Regional Rankings**: Compare countries based on various metrics with customizable filters and sorting
- **Data Visualization**: Charts and visualizations help you interpret complex data at a glance
- **Search Functionality**: Quickly filter through thousands of statistics to find specific information
- **Historical Trends**: View time-series data for countries where available, showing changes over time
- **Responsive Design**: Seamless experience across desktop, tablet, and mobile devices with optimized touch interactions
- **Quick Stats Display**: Cycling display of key statistics (Population, GDP, Area, Land Boundaries) for rapid insights

---

## Tech Stack

### Frontend
- **HTML5**: Semantic markup with accessibility considerations
- **CSS3**: Modular CSS architecture with mobile-first responsive design
- **JavaScript (ES6+)**: Vanilla JavaScript with ES modules for maintainability

### Visualization & Libraries
- **D3.js v5.6.0**: Interactive map rendering and data visualization
- **TopoJSON v3.0.2**: Geospatial data format for world map rendering
- **Font Awesome 5.15.4**: Icon library for UI elements
- **Flag Icon CSS 3.12.0**: Country flag display

### Build Tools
- **Webpack 5**: Module bundling and asset optimization
- **Babel**: JavaScript transpilation for browser compatibility
- **PostCSS & Autoprefixer**: CSS processing and vendor prefixing

### Data Sources
- **CIA World Factbook JSON API**: Primary data source via GitHub repository (`factbook/factbook.json`)
- **World Atlas Geospatial Data**: TopoJSON files for country boundaries and mapping

### Development Environment
- **Node.js**: Runtime environment
- **npm**: Package management
- **Webpack Dev Server**: Development server with hot reloading

---

## Installation

### Prerequisites

- **Node.js**: Version 14.x or higher
- **npm**: Version 6.x or higher (comes with Node.js)
- A modern web browser (Chrome, Firefox, Safari, Edge)

### Quick Start (For Users)

The simplest way to use the Global Information Portal is to visit the live site on GitHub Pages. No installation required!

If you want to run it locally:

1. **Download or clone the repository**
   ```bash
   git clone https://github.com/kcpatt27/global-information-portal.git
   cd global-information-portal
   ```

2. **Open the HTML file**
   - Simply open `index.html` in your web browser
   - Or use a local server (see Development Setup below)

### Development Setup

For developers who want to modify or contribute to the project:

1. **Clone the repository**
   ```bash
   git clone https://github.com/kcpatt27/global-information-portal.git
   cd global-information-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```
   This will start Webpack Dev Server at `http://localhost:8080`

4. **Build for production**
   ```bash
   npm run build
   ```
   This creates optimized files in the `dist/` directory

### Environment Setup

No environment variables or API keys are required. The application uses publicly available data.

---

## Usage/Getting Started

### Basic Usage

1. **Select a Country**: Click on any country in the interactive world map
2. **View Quick Info**: The sidebar displays the country flag, name, and quick statistics (Population, GDP, Area, Land Boundaries)
3. **Explore Data**: Toggle between "Info" and "Data" panels using the buttons in the sidebar
4. **Browse Statistics**: In the Data panel, use the Statistics tab to explore comprehensive country data
5. **Compare Rankings**: Switch to the Rankings tab to see how the country compares globally or regionally
6. **Search**: Use the search box in the Statistics tab to filter through thousands of data points
7. **View Historical Data**: Click on statistics with time-series data to see trends over time

### Example Workflow

**Scenario**: You want to compare the GDP of G20 countries.

1. Click on any G20 country (e.g., United States)
2. Navigate to the Data panel
3. Switch to the Rankings tab
4. Select "GDP" from the metrics dropdown
5. View the global rankings to see where all countries stand
6. Use the region filter to focus on specific areas

### Mobile Usage

On mobile devices:
- **Swipe down** on the info panel header to collapse it and view the full map
- **Swipe up** or tap the info icon to expand the panel
- **Tap** countries on the map to select them
- All features are fully functional with touch-optimized interactions

### Screenshots

*Note: Screenshots will be added here. Please provide:*
- Main map view with a selected country
- Statistics panel showing data
- Rankings panel with comparisons
- Mobile view showing responsive design

---

## Architecture Overview

The Global Information Portal follows a modular, client-side architecture with clear separation of concerns.

### Main Components

**Frontend (Client-Side)**
- **Map Visualization** (`js/map.js`): Handles D3.js map rendering, country selection, and geospatial interactions
- **Data Management** (`js/utils/dataFetcher.js`): Fetches and processes country data from the Factbook API
- **State Management** (`js/state.js`): Maintains application state across country changes
- **UI Panels** (`js/panels/`): Modular panel system for Info, Statistics, and Rankings displays
- **Event Handling** (`js/events.js`): Centralized event management
- **Charts & Visualizations** (`js/charts.js`): D3.js-based data visualization components

**Data Flow**

```
User Interaction (Map Click)
    ↓
Country Selection Event
    ↓
Data Fetcher → Factbook API (GitHub)
    ↓
Data Processing & Caching
    ↓
State Update
    ↓
UI Panel Updates (Info/Statistics/Rankings)
    ↓
Visualization Rendering (Charts/Map Highlights)
```

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  World Map   │  │  Info Panel  │  │  Data Panel  │ │
│  │  (D3.js)     │  │              │  │              │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
└─────────┼──────────────────┼─────────────────┼─────────┘
          │                  │                 │
          └──────────────────┼─────────────────┘
                             │
                    ┌────────▼────────┐
                    │  Event Handler   │
                    │   (events.js)    │
                    └────────┬────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
    ┌─────▼─────┐    ┌──────▼──────┐   ┌──────▼──────┐
    │   State   │    │ Data Fetcher │   │   Charts    │
    │ (state.js)│    │(dataFetcher)│   │ (charts.js) │
    └─────┬─────┘    └──────┬──────┘   └─────────────┘
          │                  │
          │         ┌────────▼────────┐
          │         │  Factbook API   │
          │         │   (GitHub CDN)   │
          │         └─────────────────┘
          │
    ┌─────▼─────┐
    │ UI Panels  │
    │ (panels/)  │
    └────────────┘
```

### Key Design Decisions

- **Vanilla JavaScript**: No framework dependencies for maximum performance and simplicity
- **ES Modules**: Modern JavaScript module system for better code organization
- **Modular CSS**: Component-based styling for maintainability
- **Client-Side Only**: No backend required, reducing complexity and hosting costs
- **API Caching**: Prevents duplicate requests and improves performance
- **Progressive Enhancement**: Core functionality works without JavaScript, enhanced with it

---

## API Documentation

The Global Information Portal uses the following external APIs:

### CIA World Factbook JSON API

**Base URL**: `https://raw.githubusercontent.com/factbook/factbook.json/master/`

**Endpoint Structure**:
```
/{region}/{country-code}.json
```

**Example**:
```
https://raw.githubusercontent.com/factbook/factbook.json/master/east-n-southeast-asia/us.json
```

**Response Format**: JSON object containing comprehensive country data organized by categories:
- Geography
- People and Society
- Economy
- Energy
- Communications
- Transportation
- Military
- And more...

**Data Organization**:
- Countries are organized by geographical regions (e.g., `east-n-southeast-asia`, `europe`, `africa`)
- Each country file uses ISO 3166-1 alpha-2 country codes (e.g., `us`, `ca`, `gb`)
- Data is updated automatically from the CIA World Factbook website

**Rate Limits**: None (GitHub CDN)

**Error Handling**: The application includes fallback URL patterns and timeout handling for robust data fetching.

### Geospatial Data

**TopoJSON World Map**: Used for rendering country boundaries
- Source: Standard TopoJSON world atlas files
- Format: TopoJSON (compressed GeoJSON)
- Used with D3.js for SVG rendering

**Country Code Mapping**: TSV/JSON files mapping country codes to map features
- Links ISO country codes to TopoJSON features
- Enables country selection and highlighting

---

## Contributing

Contributions are welcome! This project was built as a learning exercise and certification project, and I'm happy to see it grow.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** following the existing code style
4. **Test your changes** locally
5. **Commit your changes** (`git commit -m 'Added some amazing, super-awesome feature'`)
6. **Push to the branch** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request**

### Code Style Guidelines

- Use ES6+ JavaScript features
- Follow existing modular CSS structure
- Maintain mobile-first responsive design
- Add comments for complex logic
- Keep functions focused and single-purpose

### Areas for Contribution

- Bug fixes and error handling improvements
- Additional data visualizations
- Performance optimizations
- Accessibility enhancements
- Mobile UX improvements
- Documentation updates
- Translation/localization support

---

## Roadmap

For detailed roadmap information, see [ROADMAP.md](docs/ROADMAP.md).

### Current Status: 90% Complete

**Now (Next 4 weeks)**
- Final bug fixes and polish
- Mobile experience refinements
- Additional visualization types
- Performance optimizations

**Next (Months 2-3)**
- Advanced filtering and comparison tools
- Offline access
- Export functionality (PDF, CSV)
- User accounts and saved searches
- User preferences and saved comparisons

**Later (Exploratory)**
- 3D globe visualization (Three.js exploration, would love to do the solar system with NASA data on all the planets and the formations on them)
- API for programmatic access
- Real-time data updates
- Mobile app version

### Success Metrics

- Feature adoption rate
- Performance improvements (load time, interaction responsiveness)
- User retention and engagement
- Cross-browser compatibility

---

## License

This project is currently unlicensed. All rights reserved.

**Data Sources**:
- CIA World Factbook data is in the public domain (U.S. Government work)
- Geospatial data sources may have their own licensing terms

**Third-Party Libraries**:
- D3.js: BSD 3-Clause License
- TopoJSON: BSD 3-Clause License
- Font Awesome: Font Awesome Free License (Icons: CC BY 4.0, Fonts: SIL OFL 1.1)
- Flag Icon CSS: MIT License

---

## FAQ

### General Questions

**Q: Do I need an API key to use this?**  
A: No! The application uses publicly available data. No authentication or API keys required.

**Q: How often is the data updated?**  
A: Updates typically follow the CIA's publication schedule. The CIA World Factbook data is updated automatically by the factbook repository maintainers, you can see when and what was last updated in [the commit history](https://github.com/factbook/factbook.json/commits/master/) or the [repo's main page, across from the folder names]((https://github.com/factbook/factbook.json)). 

**Q: Can I use this offline?**  
A: Currently, no. The application fetches data from GitHub CDN. Future versions will include offline support with service workers.

**Q: Which browsers are supported?**  
A: Modern browsers including Chrome, Firefox, Safari, and Edge. Internet Explorer 11 is not supported.

### Technical Questions

**Q: Why does it take time to load country data?**  
A: Country data files are large (several KB each) and are fetched on-demand. The application includes caching to prevent duplicate requests.

**Q: Can I host this on my own server?**  
A: Yes! Simply build the project (`npm run build`) and serve the `dist/` directory. No backend is required.

**Q: How do I add more countries or data sources?**  
A: The data structure is modular. You can extend `dataFetcher.js` to support additional APIs or data sources.

**Q: Why are some countries missing data?**  
A: Some territories or disputed regions may not have complete data in the Factbook. The application handles missing data gracefully.

### Usage Questions

**Q: How do I compare multiple countries?**  
A: Currently, you can view one country at a time. Use the Rankings tab to see how countries compare on specific metrics. Multi-country comparison is planned for a future release.

**Q: Can I export the data?**  
A: Export functionality is planned for a future release. For now, you can use browser developer tools to access the raw data.

**Q: Are there keyboard shortcuts?**  
A: Keyboard navigation is partially implemented. Full keyboard accessibility is an ongoing improvement.

**Q: Does this work on tablets?**  
A: Yes! The application is fully responsive and optimized for tablets with touch interactions.

---

## Acknowledgments

- **CIA World Factbook**: For comprehensive country data
- **factbook/factbook.json**: For maintaining the JSON API
- **D3.js Community**: For excellent visualization tools
- **FreeCodeCamp**: For the certification project inspiration

---

**Built with**: Cursor AI, Webpack, and a lot of curiosity about the world.
