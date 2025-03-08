/* chartModule.js */

function initChartTabs() {
  const tabs = document.querySelectorAll('.chart-tab');
  const charts = document.querySelectorAll('.charts .chart');

  if (tabs.length === 0 || charts.length === 0) {
    console.error('Chart tabs or charts elements not found');
    return;
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      // Remove active class from all tabs and charts
      tabs.forEach(t => t.classList.remove('active'));
      charts.forEach(chart => chart.classList.remove('active'));

      // Add active class to the clicked tab
      this.classList.add('active');

      // Get the tab index and find corresponding chart element
      const tabIndex = this.getAttribute('data-tab');
      const targetChart = document.querySelector(`.charts .chart[data-chart="${tabIndex}"]`);

      if (targetChart) {
        targetChart.classList.add('active');
      } else {
        console.error('No chart found for tab ' + tabIndex);
      }
    });
  });
}

// Initialize chart tabs on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
  initChartTabs();
});

// Expose initChartTabs globally so map.html can call it if needed
window.initChartTabs = initChartTabs; 