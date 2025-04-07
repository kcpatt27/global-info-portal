/**
 * Panel Gesture Handling Module
 * Adds touch and gesture support for info panels, sidebar, and data panels
 */

import { 
  initializeGestures,
  addSwipeHandler,
  addTapHandler,
  addLongPressHandler,
  addPassiveTouchActions,
  GestureType
} from '../../utils/gestures.js';

/**
 * Initialize gesture handling for panels
 * @param {Object} options - Configuration options
 */
export function initPanelGestures(options = {}) {
  console.log('Initializing panel gestures');
  
  // Initialize gesture system
  const gestureManager = initializeGestures();
  
  // Get panel elements
  const infoContainer = document.querySelector('.info-container');
  const dataPanels = document.querySelectorAll('.data-panel');
  const dataTabs = document.querySelector('.data-tabs');
  const sidebarButtons = document.querySelector('.sidebar-buttons');
  const quickStatsItems = document.querySelectorAll('.stat-item-interactive');
  
  // Make sure panels use passive touch events for better scrolling
  if (infoContainer) {
    addPassiveTouchActions(infoContainer);
  }
  
  dataPanels.forEach(panel => {
    addPassiveTouchActions(panel);
  });
  
  // Toggle sidebar with swipe
  if (infoContainer) {
    // Swipe left to collapse sidebar
    addSwipeHandler(infoContainer, (event) => {
      if (event.direction === 'left') {
        const closeSidebarBtn = document.getElementById('close-sidebar');
        if (closeSidebarBtn && !infoContainer.classList.contains('collapsed')) {
          closeSidebarBtn.click();
        }
      }
    }, { preventDefault: false });
  }
  
  // Swipe right on main container to open sidebar
  const mapContainer = document.querySelector('.map-container');
  if (mapContainer) {
    addSwipeHandler(mapContainer, (event) => {
      if (event.direction === 'right') {
        const openSidebarBtn = document.getElementById('open-sidebar');
        const navSidebar = document.getElementById('nav-sidebar');
        
        if (openSidebarBtn && navSidebar && navSidebar.classList.contains('visible')) {
          openSidebarBtn.click();
        }
      }
    }, { preventDefault: false });
  }
  
  // Handle tab swiping for data tabs
  if (dataTabs) {
    addSwipeHandler(dataTabs.parentElement, (event) => {
      const activeTabs = dataTabs.querySelectorAll('.data-tab');
      const activeIndex = Array.from(activeTabs).findIndex(tab => tab.classList.contains('active'));
      
      if (activeIndex >= 0) {
        if (event.direction === 'left' && activeIndex < activeTabs.length - 1) {
          // Swipe left to go to next tab
          activeTabs[activeIndex + 1].click();
        } else if (event.direction === 'right' && activeIndex > 0) {
          // Swipe right to go to previous tab
          activeTabs[activeIndex - 1].click();
        }
      }
    });
  }
  
  // Handle tap on sidebar buttons with active state visual feedback
  if (sidebarButtons) {
    const buttons = sidebarButtons.querySelectorAll('.sidebar-button');
    
    buttons.forEach(button => {
      button.addEventListener('touchstart', () => {
        button.classList.add('touch-active');
      });
      
      button.addEventListener('touchend', () => {
        button.classList.remove('touch-active');
        setTimeout(() => button.blur(), 100);
      });
      
      button.addEventListener('touchcancel', () => {
        button.classList.remove('touch-active');
      });
    });
  }
  
  // Handle long press on stat items for detailed info
  quickStatsItems.forEach(statItem => {
    addLongPressHandler(statItem, (event) => {
      showDetailedStatInfo(statItem);
    });
    
    // Tap on cycle indicator to cycle through stats
    const cycleIndicator = statItem.querySelector('.stat-cycle-indicator');
    if (cycleIndicator) {
      addTapHandler(cycleIndicator, (event) => {
        cycleStat(statItem);
      });
    }
  });
  
  // Implement vertical swipe for panels when appropriate
  const dataPanel = document.querySelector('.data-panels');
  if (dataPanel) {
    // Swipe up/down between info and data panels
    addSwipeHandler(dataPanel, (event) => {
      if (event.direction === 'up') {
        expandPanel(dataPanel);
      } else if (event.direction === 'down') {
        collapsePanel(dataPanel);
      }
    });
  }
  
  /**
   * Show detailed information for a stat item
   * @param {HTMLElement} statItem - The stat item element
   */
  function showDetailedStatInfo(statItem) {
    const statLabel = statItem.querySelector('.stat-label');
    const statValue = statItem.querySelector('.stat-value');
    
    if (!statLabel || !statValue) return;
    
    // Create a modal or popover with detailed information
    const detailsModal = document.createElement('div');
    detailsModal.className = 'stat-details-modal';
    detailsModal.innerHTML = `
      <div class="stat-details-content">
        <h3>${statLabel.textContent}</h3>
        <p class="stat-value-large">${statValue.textContent}</p>
        <div class="stat-details-info">
          <p>Additional information about this statistic...</p>
          <p>Tap anywhere to close.</p>
        </div>
      </div>
    `;
    
    // Style the modal
    Object.assign(detailsModal.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      background: 'rgba(0, 0, 0, 0.8)',
      zIndex: '1000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: '0',
      transition: 'opacity 0.3s ease'
    });
    
    // Add styles to content
    const content = detailsModal.querySelector('.stat-details-content');
    Object.assign(content.style, {
      background: '#1c1c1c',
      borderRadius: '10px',
      padding: '20px',
      width: '80%',
      maxWidth: '400px',
      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
      transform: 'translateY(20px)',
      transition: 'transform 0.3s ease'
    });
    
    // Style the large value
    const largeValue = detailsModal.querySelector('.stat-value-large');
    Object.assign(largeValue.style, {
      fontSize: '32px',
      fontWeight: 'bold',
      margin: '15px 0',
      color: '#90ee90'
    });
    
    // Add to document
    document.body.appendChild(detailsModal);
    
    // Animate in
    setTimeout(() => {
      detailsModal.style.opacity = '1';
      content.style.transform = 'translateY(0)';
    }, 10);
    
    // Close on tap
    detailsModal.addEventListener('click', () => {
      detailsModal.style.opacity = '0';
      content.style.transform = 'translateY(20px)';
      setTimeout(() => {
        document.body.removeChild(detailsModal);
      }, 300);
    });
  }
  
  /**
   * Cycle through different stats for a stat item
   * @param {HTMLElement} statItem - The stat item element
   */
  function cycleStat(statItem) {
    // Get the cycle indicator and make it rotate
    const cycleIndicator = statItem.querySelector('.stat-cycle-indicator i');
    if (cycleIndicator) {
      cycleIndicator.style.transition = 'transform 0.5s ease';
      cycleIndicator.style.transform = 'rotate(360deg)';
      
      // Reset the rotation after animation completes
      setTimeout(() => {
        cycleIndicator.style.transition = 'none';
        cycleIndicator.style.transform = 'rotate(0)';
      }, 500);
    }
    
    // Trigger the existing cycle functionality if available
    if (window.handleStatCycle) {
      window.handleStatCycle(statItem);
    }
  }
  
  /**
   * Expand a panel to full screen on mobile
   * @param {HTMLElement} panel - The panel to expand
   */
  function expandPanel(panel) {
    if (window.innerWidth <= 768) {  // Only on mobile
      const infoContainer = document.querySelector('.info-container');
      if (infoContainer) {
        infoContainer.classList.add('panel-expanded');
        panel.classList.add('expanded');
      }
    }
  }
  
  /**
   * Collapse a panel back to normal size
   * @param {HTMLElement} panel - The panel to collapse
   */
  function collapsePanel(panel) {
    const infoContainer = document.querySelector('.info-container');
    if (infoContainer) {
      infoContainer.classList.remove('panel-expanded');
      panel.classList.remove('expanded');
    }
  }
  
  // Return public API
  return {
    showDetailedStatInfo,
    cycleStat,
    expandPanel,
    collapsePanel
  };
} 