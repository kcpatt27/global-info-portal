/**
 * Core event handlers for critical path
 */

export function setupUIEventHandlers() {
  // Handle mobile navigation toggle
  const navToggle = document.querySelector('.nav-toggle');
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      document.querySelector('.mobile-nav').classList.toggle('open');
    });
  }
  
  // Handle tab switching
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs
      tabs.forEach(t => t.classList.remove('active'));
      
      // Add active class to clicked tab
      tab.classList.add('active');
      
      // Show corresponding panel
      const panelId = tab.getAttribute('data-panel');
      document.querySelectorAll('.panel').forEach(panel => {
        panel.style.display = 'none';
      });
      
      const targetPanel = document.getElementById(panelId);
      if (targetPanel) {
        targetPanel.style.display = 'block';
      }
    });
  });
}

/**
 * Initialize enhanced event handlers for non-critical path
 */
export function initEnhancedEventHandlers() {
  // Add enhanced interaction handlers
  const infoSections = document.querySelectorAll('.info-section');
  
  infoSections.forEach(section => {
    // Add expand/collapse functionality
    const header = section.querySelector('.section-header');
    if (header) {
      header.addEventListener('click', () => {
        section.classList.toggle('expanded');
      });
    }
    
    // Add hover effects for desktop
    section.addEventListener('mouseenter', () => {
      section.classList.add('hover');
    });
    
    section.addEventListener('mouseleave', () => {
      section.classList.remove('hover');
    });
  });
} 