// statCycling.js - Add cycling functionality to quick stat items

// Define sets of related statistics for each quick stat category with data paths for extraction
const relatedStats = {
    // Population related stats
    population: [
      { label: "Population", dataPath: "People and Society.Population.total.text", icon: "fas fa-users" },
      { label: "Population Growth", dataPath: "People and Society.Population growth rate.text", icon: "fas fa-chart-line" },
      { label: "Urban Population", dataPath: "People and Society.Urbanization.urban population.text", icon: "fas fa-city" },
      // { label: "Internet Users", dataPath: "Communications.Internet users.percent of population.text", icon: "fas fa-chart-pie" },
      { label: "Median Age", dataPath: "People and Society.Median age.total.text", icon: "fas fa-user-clock" }
    ],
    // Economy related stats
    gdp: [
      { label: "GDP", dataPath: "Economy.GDP (official exchange rate).text", icon: "fas fa-dollar-sign" },
      { label: "GDP Growth", dataPath: "Economy.Real GDP growth rate.Real GDP growth rate 2023.text", icon: "fas fa-chart-line" },
      { label: "GDP Per Capita", dataPath: "Economy.Real GDP per capita.Real GDP per capita 2023.text", icon: "fas fa-money-bill-wave" },
      { label: "Unemployment", dataPath: "Economy.Unemployment rate.Unemployment rate 2023.text", icon: "fas fa-briefcase" }
    ],
    // Area related stats
    area: [
      { label: "Area", dataPath: "Geography.Area.total.text", icon: "fas fa-map" },
      { label: "Land Area", dataPath: "Geography.Area.land.text", icon: "fas fa-mountain" },
      { label: "Water Area", dataPath: "Geography.Area.water.text", icon: "fas fa-water" },
      { label: "Coastline", dataPath: "Geography.Coastline.text", icon: "fas fa-water" }
    ],
    // Geography related stats
    region: [
      { label: "Region", dataPath: "Geography.Map references.text", icon: "fas fa-globe-europe" },
      { label: "Coordinates", dataPath: "Geography.Geographic coordinates.text", icon: "fas fa-globe" },
      { label: "Time Zone", dataPath: "Government.Capital.time difference.text", icon: "fas fa-clock" },
      { label: "Land Boundaries", dataPath: "Geography.Land boundaries.total.text", icon: "fas fa-border-all" }
    ]
  };

// Fallback data for economy types - can be expanded with data from World Atlas TSV
const economyTypes = {
  us: "Mixed, free-market economy",
  gb: "Mixed economy, highly developed",
  ca: "Market-oriented economy",
  fr: "Mixed capitalist economy",
  de: "Social market economy",
  cn: "Socialist market economy",
  ru: "Mixed economy with state ownership",
  jp: "Market economy with strong cooperation between government and business",
  in: "Developing mixed economy",
  br: "Free-market economy with extensive government intervention"
};

// Cache for current country data
let currentCountryData = null;
let currentCountryCode = null;
  
// Function to initialize stat cycling
function initStatCycling() {
  console.log('Initializing stat cycling functionality');
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
    
    // Remove existing click event listeners to prevent duplicates
    const oldItem = item.cloneNode(true);
    item.parentNode.replaceChild(oldItem, item);
    item = oldItem;
    
    // Add click event listener
    item.addEventListener('click', () => {
      console.log(`Stat item clicked: ${category}`);
      cycleStatData(item, category);
    });
    
    // Make sure the item has the interactive class
    if (!item.classList.contains('stat-item-interactive')) {
      item.classList.add('stat-item-interactive');
    }
    
    // Make sure the item has a cycle indicator
    let indicator = item.querySelector('.stat-cycle-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.className = 'stat-cycle-indicator';
      indicator.innerHTML = '<i class="fas fa-sync-alt"></i>';
      item.appendChild(indicator);
    }
    
    // Store the category as a data attribute for easier access
    item.dataset.statCategory = category;
    
    // Add cursor pointer style to emphasize it's clickable
    item.style.cursor = 'pointer';
  });
  
  console.log('Stat cycling initialization complete');
}
  
// Function to cycle through related stat data
function cycleStatData(statItem, category) {
  console.log(`Cycling stat data for category: ${category}`);
  
  // Get current elements
  const iconElement = statItem.querySelector('.stat-icon i');
  const labelElement = statItem.querySelector('.stat-label');
  const valueElement = statItem.querySelector('.stat-value');
  
  if (!iconElement || !labelElement || !valueElement) {
    console.error('Required elements not found in stat item', statItem);
    return;
  }
  
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
  
  console.log(`Cycling from "${currentLabel}" to "${nextStat.label}"`);
  
  // Add transition-out class for animation
  statItem.classList.add('stat-transition-out');
  
  // After a short delay, change the content and animate in
  setTimeout(() => {
    // Update the icon
    iconElement.className = nextStat.icon;
    
    // Update label and value
    labelElement.textContent = nextStat.label;
    
    // Get value from current country data if available, otherwise use default
    let value = "Data unavailable";
    if (currentCountryData) {
      // Try to get the value using the primary path
      value = extractValueFromPath(currentCountryData, nextStat.dataPath);
      
      // Try alternate paths if primary path fails
      if (!value) {
        // For GDP-related stats
        if (nextStat.label.toLowerCase().includes('gdp')) {
          const altPaths = [
            'Economy.GDP (official exchange rate).text',
            'Economy.GDP - purchasing power parity.text',
            'Economy.GDP.text',
            'Introduction.Background.text' // Extract from background text as last resort
          ];
          
          for (const altPath of altPaths) {
            const altValue = extractValueFromPath(currentCountryData, altPath);
            if (altValue) {
              // If found in background text, try to extract GDP figure
              if (altPath.includes('Background')) {
                const gdpRegex = /GDP(?:\D+)(\$[0-9,.]+(?:\s*million|\s*billion|\s*trillion)?)/i;
                const match = altValue.match(gdpRegex);
                if (match && match[1]) {
                  value = match[1];
                }
              } else {
                value = altValue;
              }
              if (value) break;
            }
          }
        }
        // For Population-related stats
        else if (nextStat.label.toLowerCase().includes('population')) {
          const altPaths = [
            'People and Society.Population.text',
            'Demographics.Population.text',
            'People and Society.population.text',
            'Introduction.Background.text' // Extract from background text as last resort
          ];
          
          for (const altPath of altPaths) {
            const altValue = extractValueFromPath(currentCountryData, altPath);
            if (altValue) {
              // If found in background text, try to extract population figure
              if (altPath.includes('Background')) {
                const popRegex = /population(?:\D+)([0-9,]+(?:\.\d+)?(?:\s*million|\s*billion)?)/i;
                const match = altValue.match(popRegex);
                if (match && match[1]) {
                  value = match[1];
                }
              } else {
                value = altValue;
              }
              if (value) break;
            }
          }
        }
      }
      
      // If we got an object with a text property, use that
      if (value && typeof value === 'object' && value.text) {
        value = value.text;
      }
      
      // If we still don't have a valid value, use the default
      if (!value) {
        value = "Data unavailable";
      } else {
        // Format the value appropriately
        value = formatStatValue(value, nextStat.label);
      }
    }
    valueElement.textContent = value;
    
    // Remove transition-out and add transition-in classes
    statItem.classList.remove('stat-transition-out');
    statItem.classList.add('stat-transition-in');
    
    // Remove the transition-in class after animation completes
    setTimeout(() => {
      statItem.classList.remove('stat-transition-in');
    }, 300);
    
    console.log(`Cycled to "${nextStat.label}" with value "${value}"`);
  }, 300);
}

/**
 * Updates the quick stats with data from the selected country
 * @param {Object} countryData - The fetched country data
 * @param {string} countryCode - The two-letter country code
 */
function updateQuickStats(countryData, countryCode) {
  if (!countryData) {
    console.error('updateQuickStats called with no data');
    return;
  }
  
  console.log('Updating quick stats with country data:', countryData);
  
  // Store the country data for use in cycling
  currentCountryData = countryData;
  currentCountryCode = countryCode?.toLowerCase() || '';
  
  // Get the stat items
  const statItems = document.querySelectorAll('.quick-stats-grid .stat-item');
  
  // For each stat item
  statItems.forEach((statItem, index) => {
    const labelElement = statItem.querySelector('.stat-label');
    const valueElement = statItem.querySelector('.stat-value');
    const iconElement = statItem.querySelector('.stat-icon i');
    
    if (!labelElement || !valueElement) {
      console.warn('Could not find label or value element');
      return;
    }
    
    // Get the current label
    const currentLabel = labelElement.textContent.trim();
    
    // Determine which category this item belongs to
    let category;
    if (currentLabel.toLowerCase().includes('population') || 
        currentLabel.toLowerCase().includes('urban') || 
        currentLabel.toLowerCase().includes('median age')) {
      category = 'population';
    } else if (currentLabel.toLowerCase().includes('gdp') || 
               currentLabel.toLowerCase().includes('unemployment')) {
      category = 'gdp';
    } else if (currentLabel.toLowerCase().includes('area') || 
               currentLabel.toLowerCase().includes('coastline') || 
               currentLabel.toLowerCase().includes('water')) {
      category = 'area';
    } else if (currentLabel.toLowerCase().includes('region') || 
               currentLabel.toLowerCase().includes('coordinates') || 
               currentLabel.toLowerCase().includes('time zone') || 
               currentLabel.toLowerCase().includes('land boundaries')) {
      category = 'region';
    } else {
      // Default mappings based on index
      const categories = ['population', 'gdp', 'area', 'region'];
      category = categories[index] || 'region';
    }
    
    // Find the matching stat in relatedStats
    const matchingStat = relatedStats[category].find(stat => 
      stat.label.toLowerCase() === currentLabel.toLowerCase()
    );
    
    if (matchingStat) {
      // Use the data path from the matching stat
      let value = extractValueFromPath(countryData, matchingStat.dataPath);
      
      // Try alternate paths if primary path fails for specific categories
      if (!value) {
        if (category === 'population') {
          value = tryPopulationAlternatePaths(countryData, currentLabel);
        } else if (category === 'gdp') {
          value = tryGDPAlternatePaths(countryData, currentLabel);
        }
      }
      
      if (value) {
        // Format the value appropriately
        const formattedValue = formatStatValue(value, currentLabel);
        valueElement.textContent = formattedValue;
      } else {
        console.warn(`No value found for ${currentLabel}`);
        valueElement.textContent = 'Data unavailable';
      }
      
      // Make sure the icon is correct
      if (iconElement) {
        iconElement.className = matchingStat.icon;
      }
    } else {
      console.warn(`Could not find matching stat for ${currentLabel} in ${category}`);
      valueElement.textContent = 'Data unavailable';
    }
  });
  
  console.log('Quick stats update completed');
}

/**
 * Try alternate paths for population data
 * @param {Object} countryData - The country data object
 * @param {string} statLabel - The stat label
 * @returns {string|null} - The value if found, null otherwise
 */
function tryPopulationAlternatePaths(countryData, statLabel) {
  const altPaths = [
    'People and Society.Population.text',
    'Demographics.Population.text',
    'People and Society.population.text',
    'Introduction.Background.text' // Extract from background text as last resort
  ];
  
  for (const altPath of altPaths) {
    const value = extractValueFromPath(countryData, altPath);
    if (value) {
      // If found in background text, try to extract population figure
      if (altPath.includes('Background')) {
        const popRegex = /population(?:\D+)([0-9,]+(?:\.\d+)?(?:\s*million|\s*billion)?)/i;
        const match = value.match(popRegex);
        if (match && match[1]) {
          return match[1];
        }
      } else {
        return value;
      }
    }
  }
  
  return null;
}

/**
 * Try alternate paths for GDP data
 * @param {Object} countryData - The country data object
 * @param {string} statLabel - The stat label
 * @returns {string|null} - The value if found, null otherwise
 */
function tryGDPAlternatePaths(countryData, statLabel) {
  // Only use the most relevant alternate paths
  const altPaths = [
    'Economy.GDP (official exchange rate).text',
    'Economy.GDP - purchasing power parity.text',
    'Economy.GDP.text',
    'Introduction.Background.text' // Extract from background text as last resort
  ];
  
  for (const altPath of altPaths) {
    const value = extractValueFromPath(countryData, altPath);
    if (value) {
      // If found in background text, try to extract GDP figure
      if (altPath.includes('Background')) {
        const gdpRegex = /GDP(?:\D+)(\$[0-9,.]+(?:\s*million|\s*billion|\s*trillion)?)/i;
        const match = value.match(gdpRegex);
        if (match && match[1]) {
          return match[1];
        }
      } else {
        return value;
      }
    }
  }
  
  return null;
}

/**
 * Format stat values for display
 * @param {string} value - The raw value from the data
 * @param {string} statType - The type of stat (Population, GDP, etc.)
 * @returns {string} - Formatted value
 */
function formatStatValue(value, statType) {
  if (!value) return 'Data unavailable';
  
  try {
    // Clean up any string values by removing newlines and extra spaces
    if (typeof value === 'string') {
      value = value.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    }
    
    // If value is a string with already formatted values, generally preserve it
    if (typeof value === 'string') {
      // Handle special cases where we want to keep formatting as is
      if (value.includes('$') || 
          value.includes('%') || 
          value.includes('km') || 
          value.includes('°')) {
        return value;
      }
      
      // For percentage values, ensure there's a space before '%'
      if (/\d%/.test(value)) {
        return value.replace(/(\d)%/g, '$1 %');
      }
      
      // For coordinates, ensure proper formatting
      if (statType.toLowerCase().includes('coordinates')) {
        return value;
      }
      
      // For time zone data, extract just the time zone part
      if (statType.toLowerCase().includes('time zone')) {
        // Extract the UTC offset pattern (UTC+X, UTC-X, etc.)
        const utcMatch = value.match(/UTC[+-]\d+(?::\d+)?/i);
        if (utcMatch) {
          return utcMatch[0];
        }
        
        // Or just return the first part up to a semicolon or comma if exists
        if (value.includes(';')) {
          return value.split(';')[0].trim();
        }
        if (value.includes(',')) {
          return value.split(',')[0].trim();
        }
        
        // Otherwise return as is but truncate if too long
        if (value.length > 20) {
          return value.substring(0, 17) + '...';
        }
        
        return value;
      }
      
      // For economy type, extract a concise description
      if (statType.toLowerCase().includes('economy type')) {
        return extractEconomyType(value);
      }
    }
    
    // For specific stat types, apply specialized formatting
    const lcStatType = statType.toLowerCase();
    
    if (lcStatType.includes('population')) {
      // Robust population parsing:
      // - Preserve explicit units already present (million/billion/trillion)
      // - Extract year/estimate parentheses and append them
      // - Parse raw numbers with commas and format to million/billion
      const raw = String(value || '');
      const yearMatch = raw.match(/\(\s*(\d{4}[^)]*)\)/);
      const yearStr = yearMatch ? ' (' + yearMatch[1].trim() + ')' : '';

      // If the source already uses words like 'million'/'billion', keep and normalize
      const explicitUnit = raw.match(/([0-9.,]+)\s*(million|billion|trillion)/i);
      if (explicitUnit) {
        const numStr = explicitUnit[1].replace(/,/g, '');
        const num = parseFloat(numStr);
        const unit = explicitUnit[2].toLowerCase();
        if (!isNaN(num)) {
          return num.toFixed(2) + ' ' + unit + yearStr;
        }
      }

      // Otherwise extract the first numeric token (handles comma thousands)
      const numToken = raw.match(/([0-9]{1,3}(?:[.,][0-9]{3})*(?:\.[0-9]+)?|[0-9]+(?:\.[0-9]+)?)/);
      if (numToken) {
        let numStr = numToken[1];
        // Prefer removing commas (US-style thousands). If dots appear as thousands separators,
        // fall back to interpreting dots as decimal if no commas present.
        if (/,/.test(numStr)) {
          numStr = numStr.replace(/,/g, '');
        } else if (/\./g.test(numStr) && (numStr.match(/\./g) || []).length > 1) {
          // multiple dots -> likely thousand separators -> remove them
          numStr = numStr.replace(/\./g, '');
        }
        const numValue = parseFloat(numStr);
        if (!isNaN(numValue)) {
          if (numValue >= 1000000000) {
            return (numValue / 1000000000).toFixed(2) + ' billion' + yearStr;
          } else if (numValue >= 1000000) {
            return (numValue / 1000000).toFixed(2) + ' million' + yearStr;
          } else {
            return numValue.toLocaleString() + yearStr;
          }
        }
      }
    } else if (lcStatType.includes('gdp')) {
      // First check if the value already has proper currency formatting
      if (typeof value === 'string' && value.includes('$')) {
        return value; // Return as-is if it already has currency formatting
      }

      // Try to extract numeric value
      const numMatch = String(value).match(/([0-9,.]+)(?:\s*)(billion|million|trillion)?/i);
      if (numMatch) {
        const numStr = numMatch[1];
        const unitStr = numMatch[2]?.toLowerCase() || '';
        
        // Parse the numeric value, removing commas
        const numValue = parseFloat(numStr.replace(/,/g, ''));
        
        if (!isNaN(numValue)) {
          // Apply the unit multiplier if present
          let finalValue = numValue;
          if (unitStr.includes('trillion')) {
            finalValue = numValue * 1000000000000;
          } else if (unitStr.includes('billion')) {
            finalValue = numValue * 1000000000;
          } else if (unitStr.includes('million')) {
            finalValue = numValue * 1000000;
          }
          
          // Format the final value
          if (finalValue >= 1000000000000) {
            return '$' + (finalValue / 1000000000000).toFixed(2) + ' trillion';
          } else if (finalValue >= 1000000000) {
            return '$' + (finalValue / 1000000000).toFixed(2) + ' billion';
          } else if (finalValue >= 1000000) {
            return '$' + (finalValue / 1000000).toFixed(2) + ' million';
          } else {
            return '$' + numValue.toLocaleString();
          }
        }
      }
      
      // Fallback to basic numeric parsing if the above didn't work
      const numValue = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
      if (!isNaN(numValue)) {
        if (value.includes('trillion') || numValue >= 1000000000000) {
          return '$' + (numValue / 1000000000000).toFixed(2) + ' trillion';
        } else if (value.includes('billion') || numValue >= 1000000000) {
          return '$' + (numValue / 1000000000).toFixed(2) + ' billion';
        } else if (value.includes('million') || numValue >= 1000000) {
          return '$' + (numValue / 1000000).toFixed(2) + ' million';
        } else {
          return '$' + numValue.toLocaleString();
        }
      }
    } else if (lcStatType.includes('growth') || lcStatType.includes('unemployment')) {
      // Format as percentage
      const numValue = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
      if (!isNaN(numValue)) {
        return numValue.toFixed(1) + '%';
      }
    } else if (lcStatType.includes('area')) {
      // Format area with km² notation
      const numValue = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
      if (!isNaN(numValue)) {
        if (numValue >= 1000000) {
          return (numValue / 1000000).toFixed(2) + ' million km²';
        } else {
          return numValue.toLocaleString() + ' km²';
        }
      }
    }
    
    // Default: return the original value
    return value;
  } catch (error) {
    console.error('Error formatting stat value:', error);
    return value;
  }
}

/**
 * Extracts and formats economy type information from a longer text
 * @param {string} text - The raw economy overview text
 * @returns {string} - Formatted economy type description
 */
function extractEconomyType(text) {
  if (!text) return 'Data unavailable';
  
  // If we have a predefined economy type for this country, use that
  if (currentCountryCode && economyTypes[currentCountryCode]) {
    return economyTypes[currentCountryCode];
  }
  
  // These are key phrases that indicate economy type
  const economyTypePatterns = [
    /\b(free market|mixed|socialist|state-controlled|command|capitalist|developing|market-oriented|export-oriented)\s+economy\b/i,
    /\beconomy\s+is\s+(free market|mixed|socialist|state-controlled|command|capitalist|developing|market-oriented|export-oriented)\b/i,
    /\b(private|public|state)-led\s+economy\b/i,
    /\b(capitalism|socialism|communism|free enterprise)\b/i
  ];
  
  // Try to extract economy type from the text
  for (const pattern of economyTypePatterns) {
    const match = text.match(pattern);
    if (match) {
      // Format the match - capitalize first letter of each word
      const rawMatch = match[0];
      return rawMatch.replace(/\b\w/g, l => l.toUpperCase());
    }
  }
  
  // If we can't identify a specific economy type, extract the first sentence
  const firstSentence = text.match(/^[^.!?]+[.!?]/);
  if (firstSentence) {
    // If the first sentence is very long, truncate it
    const sentence = firstSentence[0];
    if (sentence.length > 80) {
      return sentence.substring(0, 77) + '...';
    }
    return sentence;
  }
  
  // If all else fails, return a shortened version of the text
  if (text.length > 80) {
    return text.substring(0, 77) + '...';
  }
  
  return text;
}

/**
 * Extracts a value from a nested object using a dot-notation path
 * @param {Object} obj - The object to extract from
 * @param {string} path - Dot notation path (e.g., "Geography.Area.total.text")
 * @returns {string|null} - The extracted value or null if not found
 */
function extractValueFromPath(obj, path) {
  if (!obj || !path) return null;
  
  try {
    const keys = path.split('.');
    let current = obj;
    
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      
      if (current && typeof current === 'object') {
        // Try exact match first
        if (key in current) {
          current = current[key];
          continue;
        }
        
        // Try case-insensitive match
        const matchingKey = Object.keys(current).find(k => 
          k.toLowerCase() === key.toLowerCase()
        );
        
        if (matchingKey) {
          current = current[matchingKey];
        } else {
          // Try to find a partial match (for categories with variations)
          const partialMatchKey = Object.keys(current).find(k => 
            k.toLowerCase().includes(key.toLowerCase()) || 
            key.toLowerCase().includes(k.toLowerCase())
          );
          
          if (partialMatchKey) {
            current = current[partialMatchKey];
          } else {
            return null;
          }
        }
      } else {
        return null;
      }
    }
    
    // Special handling for Economy Type data which might be a long overview
    if (path.includes('Economy - overview') && current) {
      // Extract just the economy type information
      if (typeof current === 'string') {
        return extractEconomyType(current);
      }
    }
    
    // If we got an object with a text property, return that text
    if (current && typeof current === 'object' && current.text) {
      return current.text;
    }
    
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
