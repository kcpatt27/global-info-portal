/* events.js - Event handling and DOM initialization for country data visualizations */

export function initDataTabs() {
  console.log("Initializing data tabs");
  const tabs = document.querySelectorAll('.data-tab');
  const dataPanels = document.querySelectorAll('.data-panels .data-panel');

  if (tabs.length === 0 || dataPanels.length === 0) {
    console.error('Data tabs or data panel elements not found');
    return;
  }

  // Avoid duplicate event assignments
  if (window.dataTabsInitialized) {
    console.log('Data tabs already initialized');
    return;
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      console.log("Tab clicked:", this.textContent);
      // Remove active classes from all tabs and panels
      tabs.forEach(t => t.classList.remove('active'));
      dataPanels.forEach(panel => panel.classList.remove('active'));

      // Activate the clicked tab
      this.classList.add('active');

      // Find and activate corresponding panel
      const tabIndex = this.getAttribute('data-tab');
      const targetPanel = document.querySelector(`.data-panels .data-panel[data-panel="${tabIndex}"]`);
      console.log("Activating panel with index:", tabIndex);
      if (targetPanel) {
        targetPanel.classList.add('active');
      } else {
        console.error('No panel found for tab ' + tabIndex);
      }
    });
  });

  // Handle the sidebar Data button
  const dataButton = document.querySelector('.sidebar-button[data-panel="data"]');
  if (dataButton) {
    console.log("Found data panel button");
    dataButton.addEventListener('click', function() {
      console.log("Data sidebar button clicked from events.js");
      const activeTab = document.querySelector('.data-tab.active');
      const activePanel = document.querySelector('.data-panel.active');
      if (!activeTab) {
        console.log("No active tab found, activating first tab");
        document.querySelector('.data-tab').classList.add('active');
      }
      if (!activePanel) {
        console.log("No active panel found, activating first panel");
        document.querySelector('.data-panel').classList.add('active');
      }
    });
  }

  // Mark as initialized to prevent duplicate listeners
  window.dataTabsInitialized = true;
}

// Initialize data tabs on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  initDataTabs();
}); 