// statCycling.js - Add cycling functionality to quick stat items

// Define sets of related statistics for each quick stat category with data paths for extraction
const relatedStats = {
    // Population related stats
    population: [
      { label: "Population", dataPath: "People and Society.Population.text", icon: "fas fa-users" },
      { label: "Urban Population", dataPath: "People and Society.Urbanization.urban population.text", icon: "fas fa-city" },
      { label: "Population Growth", dataPath: "People and Society.Population growth rate.text", icon: "fas fa-chart-line" },
      { label: "Median Age", dataPath: "People and Society.Median age.total.text", icon: "fas fa-user-clock" }
    ],
    // GDP related stats
    gdp: [
      { label: "GDP", dataPath: "Economy.GDP (purchasing power parity).text", icon: "fas fa-dollar-sign" },
      { label: "GDP per capita", dataPath: "Economy.GDP - per capita (PPP).text", icon: "fas fa-money-bill-wave" },
      { label: "GDP Growth", dataPath: "Economy.Real GDP growth rate.text", icon: "fas fa-chart-line" },
      { label: "Unemployment", dataPath: "Economy.Unemployment rate.text", icon: "fas fa-briefcase" }
    ],
    // Area related stats
    area: [
      { label: "Area", dataPath: "Geography.Area.total.text", icon: "fas fa-map" },
      { label: "Land Area", dataPath: "Geography.Area.land.text", icon: "fas fa-mountain" },
      { label: "Water Area", dataPath: "Geography.Area.water.text", icon: "fas fa-water" },
      { label: "Coastline", dataPath: "Geography.Coastline.text", icon: "fas fa-water" }
    ],
    // Region related stats
    region: [
      { label: "Region", dataPath: "Geography.Map references.text", icon: "fas fa-globe" },
      { label: "Location", dataPath: "Geography.Location.text", icon: "fas fa-globe-europe" },
      { label: "Land Boundaries", dataPath: "Geography.Land boundaries.total.text", icon: "fas fa-border-all" },
      { label: "Time Zones", dataPath: "Geography.Time difference.text", icon: "fas fa-clock" }
    ]
  };

// Cache for current country data
let currentCountryData = null;
  
// Function to initialize stat cycling
function initStatCycling() {
  const statItems = document.querySelectorAll('.quick-stats-grid .stat-item');
  
  statItems.forEach((item, index) => {
    // Determine which stat category this item represents based on index or content
    const statLabel = item.querySelector('.stat-label').textContent.trim().toLowerCase();
    let category;
    
    if (statLabel.includes('population')) category = 'population';
    else if (statLabel.includes('gdp')) category = 'gdp';
    else if (statLabel.includes('area')) category = 'area';
    else if (statLabel.includes('region')) category = 'region';
    else return; // Skip if we can't identify the category
    
    // Add click event listener
    item.addEventListener('click', () => cycleStatData(item, category));
    
    // Add indicator that the item is clickable
    item.classList.add('stat-item-interactive');
    
    // Add a small indicator to show it's clickable
    const indicator = document.createElement('div');
    indicator.className = 'stat-cycle-indicator';
    indicator.innerHTML = '<i class="fas fa-sync-alt"></i>';
    item.appendChild(indicator);
  });
}
  
// Function to cycle through related stat data
function cycleStatData(statItem, category) {
  // Get current elements
  const iconElement = statItem.querySelector('.stat-icon');
  const labelElement = statItem.querySelector('.stat-label');
  const valueElement = statItem.querySelector('.stat-value');
  
  // Get the current label to determine which stat we're showing
  const currentLabel = labelElement.textContent.trim();
  
  // Find the index of the current stat in the related stats array
  const stats = relatedStats[category];
  let currentIndex = stats.findIndex(stat => stat.label === currentLabel);
  
  // If not found, try a case-insensitive search
  if (currentIndex === -1) {
    currentIndex = stats.findIndex(stat => 
      stat.label.toLowerCase() === currentLabel.toLowerCase()
    );
  }
  
  // If still not found, just start at the beginning
  if (currentIndex === -1) {
    currentIndex = 0;
  }
  
  // Get the next stat in the cycle (or go back to the first)
  currentIndex = (currentIndex + 1) % stats.length;
  const nextStat = stats[currentIndex];
  
  // Add transition-out class for animation
  iconElement.classList.add('stat-transition-out');
  labelElement.classList.add('stat-transition-out');
  valueElement.classList.add('stat-transition-out');
  
  // After a short delay, change the content and animate in
  setTimeout(() => {
    // Update the icon if it exists
    if (iconElement) {
      iconElement.innerHTML = `<i class="${nextStat.icon}"></i>`;
    }
    
    // Update label and value
    labelElement.textContent = nextStat.label;
    
    // Get value from current country data if available, otherwise use default
    let value = "Data unavailable";
    if (currentCountryData) {
      // Try to get the value using the path
      value = extractValueFromPath(currentCountryData, nextStat.dataPath);
      
      // If we got an object with a text property, use that
      if (value && typeof value === 'object' && value.text) {
        value = value.text;
      }
      
      // If we still don't have a valid value, use the default
      if (!value) {
        value = "Data unavailable";
      }
    }
    valueElement.textContent = value;
    
    // Remove transition-out and add transition-in classes
    iconElement.classList.remove('stat-transition-out');
    labelElement.classList.remove('stat-transition-out');
    valueElement.classList.remove('stat-transition-out');
    
    iconElement.classList.add('stat-transition-in');
    labelElement.classList.add('stat-transition-in');
    valueElement.classList.add('stat-transition-in');
    
    // Remove the transition-in class after animation completes
    setTimeout(() => {
      iconElement.classList.remove('stat-transition-in');
      labelElement.classList.remove('stat-transition-in');
      valueElement.classList.remove('stat-transition-in');
    }, 300);
  }, 300);
}

/**
 * Updates the quick stats with data from the selected country
 * @param {Object} countryData - The fetched country data
 */
function updateQuickStats(countryData) {
  if (!countryData) {
    console.error('updateQuickStats called with no data');
    return;
  }
  
  console.log('Updating quick stats with country data:', countryData);
  
  // Store the country data for use in cycling
  currentCountryData = countryData;
  
  // Define the stats we want to display and their data paths in the API response
  const statsToDisplay = [
    { 
      label: 'Population', 
      dataPath: 'People and Society.Population.text',
      icon: 'fas fa-users'
    },
    { 
      label: 'Capital', 
      dataPath: 'Government.Capital.name.text',
      icon: 'fas fa-landmark'
    },
    { 
      label: 'Area', 
      dataPath: 'Geography.Area.total.text',
      icon: 'fas fa-map'
    },
    { 
      label: 'Region', 
      dataPath: 'Geography.Location.text',
      icon: 'fas fa-globe'
    }
  ];
  
  // Update each stat item with the corresponding data
  statsToDisplay.forEach((stat, index) => {
    // Find the stat item elements by index or try to match by label
    const statItems = document.querySelectorAll('.quick-stats-grid .stat-item');
    const statItem = statItems[index] || 
                    Array.from(statItems).find(item => 
                      item.querySelector('.stat-label').textContent.trim() === stat.label);
    
    if (statItem) {
      // Find the visible stat value element and hidden content value element
      const valueElement = statItem.querySelector('.stat-value:not(.stat-content .stat-value)');
      const contentValueElement = statItem.querySelector('.stat-content .stat-value');
      
      // Get the value from the country data using the data path
      const value = extractValueFromPath(countryData, stat.dataPath);
      
      if (value) {
        // Format numbers when needed (e.g., add commas to large numbers)
        const formattedValue = value;
        valueElement.textContent = formattedValue;
        if (contentValueElement) contentValueElement.textContent = formattedValue;
      } else {
        console.warn(`No value found for ${stat.label} with path ${stat.dataPath}`);
        valueElement.textContent = 'Data unavailable';
        if (contentValueElement) contentValueElement.textContent = 'Data unavailable';
      }
    } else {
      console.warn(`Could not find stat item for ${stat.label}`);
    }
  });
  
  console.log('Quick stats update completed');
}

/**
 * Extracts a value from a nested object using a dot-notation path
 * @param {Object} obj - The object to extract from
 * @param {string} path - Dot notation path (e.g., "Geography.Area.total.text")
 * @returns {string|null} - The extracted value or null if not found
 */
function extractValueFromPath(obj, path) {
  if (!obj || !path) return null;
  
  console.log(`Extracting path: ${path}`);
  
  try {
    const keys = path.split('.');
    let current = obj;
    
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const remainingPath = keys.slice(i).join('.');
      
      console.log(`Looking for key: "${key}" in remaining path: "${remainingPath}"`);
      
      if (current && typeof current === 'object') {
        // Log available keys at this level for debugging
        console.log(`Available keys at this level: ${Object.keys(current).join(', ')}`);
        
        // Try exact match first
        if (key in current) {
          console.log(`Found exact match for: ${key}`);
          current = current[key];
          continue;
        }
        
        // Try case-insensitive match
        const matchingKey = Object.keys(current).find(k => 
          k.toLowerCase() === key.toLowerCase()
        );
        
        if (matchingKey) {
          console.log(`Found case-insensitive match: ${matchingKey} for: ${key}`);
          current = current[matchingKey];
        } else {
          // Try to find a partial match (for categories with variations)
          const partialMatchKey = Object.keys(current).find(k => 
            k.toLowerCase().includes(key.toLowerCase()) || 
            key.toLowerCase().includes(k.toLowerCase())
          );
          
          if (partialMatchKey) {
            console.log(`Found partial match: ${partialMatchKey} for: ${key}`);
            current = current[partialMatchKey];
          } else {
            console.log(`No match found for: ${key} in path: ${path}`);
            return null;
          }
        }
      } else {
        console.log(`Current value is not an object for key: ${key}`);
        return null;
      }
    }
    
    // If we got an object with a text property, return that text
    if (current && typeof current === 'object' && current.text) {
      console.log(`Found text property in result: ${current.text}`);
      return current.text;
    }
    
    console.log(`Final extracted value: ${current}`);
    return current;
  } catch (error) {
    console.error('Error extracting value:', error);
    return null;
  }
}  
// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initStatCycling);
  
// Make functions available in the global window scope
// This ensures they're accessible both via imports and direct window calls
window.initStatCycling = initStatCycling;
window.updateQuickStats = updateQuickStats;
  
// For dynamically loaded content, export the init function
export { initStatCycling, updateQuickStats };
