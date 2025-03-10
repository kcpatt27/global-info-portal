// statCycling.js - Add cycling functionality to quick stat items

// Define sets of related statistics for each quick stat category
const relatedStats = {
    // Population related stats
    population: [
      { label: "Population", value: "143.4 million", icon: "fas fa-users" },
      { label: "Urban Population", value: "74.9%", icon: "fas fa-city" },
      { label: "Population Growth", value: "0.03%", icon: "fas fa-chart-line" },
      { label: "Median Age", value: "40.3 years", icon: "fas fa-user-clock" }
    ],
    // GDP related stats
    gdp: [
      { label: "GDP", value: "$4.2 trillion", icon: "fas fa-dollar-sign" },
      { label: "GDP per capita", value: "$29,485", icon: "fas fa-money-bill-wave" },
      { label: "GDP Growth", value: "1.8%", icon: "fas fa-chart-line" },
      { label: "Unemployment", value: "4.5%", icon: "fas fa-briefcase" }
    ],
    // Area related stats
    area: [
      { label: "Area", value: "17.1 million km²", icon: "fas fa-map" },
      { label: "Land Area", value: "16.4 million km²", icon: "fas fa-mountain" },
      { label: "Water Area", value: "720,500 km²", icon: "fas fa-water" },
      { label: "Coastline", value: "37,653 km", icon: "fas fa-water" }
    ],
    // Region related stats
    region: [
      { label: "Region", value: "Eastern Europe", icon: "fas fa-globe" },
      { label: "Continent", value: "Asia/Europe", icon: "fas fa-globe-europe" },
      { label: "Neighbors", value: "14 countries", icon: "fas fa-border-all" },
      { label: "Time Zones", value: "11 zones", icon: "fas fa-clock" }
    ]
  };
  
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
      valueElement.textContent = nextStat.value;
      
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
  
  // Initialize when DOM is loaded
  document.addEventListener('DOMContentLoaded', initStatCycling);
  
  // For dynamically loaded content, export the init function
  export { initStatCycling };