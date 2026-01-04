# 🌍 Global Information Portal

## Overview

The Global Information Portal is an interactive web application that provides comprehensive information about countries around the world. It features an interactive map interface with detailed country statistics, rankings, and historical data visualizations.

## ✨ Features

- **Interactive World Map**: Select countries to view detailed information
- **Comprehensive Country Data**: Access statistics across multiple categories:
  - Geography
  - People & Society
  - Economy
  - Energy
  - Military
  - Transportation
  - Communications
- **Data Visualization**: Charts and visualizations for easy data interpretation
- **Global Rankings**: Compare countries based on various metrics
- **Regional Comparisons**: See how countries compare within their regions
- **Historical Trends**: View time-series data for countries where available
- **Search Functionality**: Filter statistics to find specific information
- **Responsive Design**: Works across different device sizes

## 🚀 Technologies

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Visualization**: D3.js, TopoJSON
- **Icons**: Font Awesome
- **Data Source**: World Factbook JSON API

## 📁 Project Structure 
├── css-styles/
│   ├── main.css
│   ├── utils.css
│   └── components/
│   │   ├── map.css
│   │   ├── navigation.css
│   │   ├── tabs.css
│   │   ├── panels.css
│   │   ├── charts.css
│   │   ├── rankings.css
│   │   ├── stats.css
│   │   └── quickstats.css
│   └── core/
│   │   ├── base.css
│   │   └── variables.css
│   └── layout/
│       ├── layout.css
│       ├── responsive.css
│       ├── scrollbars.css
│       └── sidebar.css
├── js/
│   ├── main.js
│   ├── map.js
│   ├── charts.js
│   ├── state.js
│   ├── statCycling.js
│   ├── events.js
│   ├── statsTab.js
│   ├── rankingsTab.js
│   ├── utils.js
│   ├── panels/
│   │   ├── index.js
│   │   ├── dataPanels.js
│   │   ├── rankingsPanel.js
│   │   └── statsPanel.js
│   └── utils/
│       └── dataFetcher.js
├── debugging/
│   └── sample-data-files/
└── index.html

## 🔄 Data Panel Architecture

The application uses a streamlined 2-tab approach for displaying country data:

1. **Statistics Panel**
   - Current view: Shows all current stats for the selected country
   - Historical view: Shows time-series data and trends

2. **Rankings Panel**
   - Global view: Shows where the country ranks globally
   - Regional view: Shows regional comparisons

## 💾 Data Sources

The application fetches country data from:
- GitHub repository: `factbook/factbook.json`
- Data is organized by geographical regions
- World atlas geospatial data for rendering the interactive map

## 🔧 Installation & Setup

### Development
1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm start`
4. Open `http://localhost:8080` in your browser

### Production Build
1. Build the project: `npm run build`
2. The built files will be in the `dist/` directory
3. Open `index.html` in a web browser or serve using a local server

### GitHub Pages Deployment
1. Build the project: `npm run build`
2. Commit and push the `dist/` directory to your GitHub repository
3. Enable GitHub Pages in your repository settings, pointing to the main branch
4. Your site will be available at `https://yourusername.github.io/repository-name/`

## 🖥️ Usage

1. Click on any country in the world map to select it
2. View basic information in the sidebar
3. Toggle between "Info" and "Data" panels
4. In the Data panel:
   - Browse the Statistics tab to see current country stats
   - Use the search box to filter statistics
   - View historical data for time-series metrics
   - Check the Rankings tab to see how the country compares globally
   - Filter rankings by region or sort by value

## 🔄 State Management

The application maintains state for user selections across country changes:

- **Statistics Panel**
  - Search filters
  - Selected historical metrics
  - Time range for historical data

- **Rankings Panel**
  - Selected ranking metrics
  - Sort order
  - Region filters
  - Current view (global/region)

## 🧩 Key Components

### Map Visualization
Interactive world map built with D3.js and TopoJSON with zoom capabilities and country selection.

### Data Fetcher
Handles API requests to retrieve country data, with error handling and request caching.

### Stats Panel
Displays organized statistics with search functionality and historical visualizations.

### Rankings Panel
Shows where countries rank globally with customizable metrics and filters.

### Quick Stats
Provides cycling display of key statistics for selected countries.

## 🙏 Prayer for continued development 💛 ✨