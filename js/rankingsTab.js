// Add these functions to enhance the Rankings tab

function enhanceRankingsTab() {
  // Get container
  const rankingsContainer = document.querySelector('.rankings-container');
  
  // Create toggle for view modes
  const viewToggle = document.createElement('div');
  viewToggle.className = 'view-toggle';
  viewToggle.innerHTML = `
    <button class="toggle-btn active" data-view="global">Compare with World</button>
    <button class="toggle-btn" data-view="region">Compare with Region</button>
  `;
  
  // Add the toggle to the container
  rankingsContainer.prepend(viewToggle);
  
  // Add event listeners for toggle
  viewToggle.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      // Update active state
      viewToggle.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      
      // Update view based on selection
      const view = this.dataset.view;
      updateRankingsView(view);
    });
  });
  
  // Import visualization components from Global Context
  importGlobalContextVisualizations();
}

function updateRankingsView(view) {
  const container = document.querySelector('.rankings-content');
  
  if (view === 'global') {
    // Show global rankings with worldwide comparison (from Global Context)
    container.innerHTML = createGlobalComparisonHTML();
    initGlobalComparisonCharts();
  } else {
    // Show regional rankings
    container.innerHTML = createRegionalComparisonHTML();
    initRegionalComparisonCharts();
  }
} 