function enhanceStatsTab() {
  // Get container
  const statsContainer = document.querySelector('.stats-container');

  
  // Add the tabs to the container
  statsContainer.prepend(viewTabs);
  
  // Add event listeners for tabs
  viewTabs.querySelectorAll('.stats-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      // Update active state
      viewTabs.querySelectorAll('.stats-tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      
      // Update view based on selection
      const view = this.dataset.view;
      updateStatsView(view);
    });
  });
  
  // Import visualization components from Trends
  importTrendsVisualizations();
}

function updateStatsView(view) {
  const container = document.querySelector('.stats-content');
  
  if (view === 'current') {
    // Show current stats (existing functionality)
    container.innerHTML = createCurrentStatsHTML();
    initCurrentStatsView();
  } else {
    // Show historical trends (from Trends tab)
    container.innerHTML = createHistoricalTrendsHTML();
    initHistoricalTrendsCharts();
    
    // Fix the connecting points issue
    fixTrendsChartConnectingPoints();
  }
}