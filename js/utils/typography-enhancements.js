/**
 * typography-enhancements.js
 * Provides utilities for enhanced typography management on mobile devices
 * Implements support for mobile typography classes and dynamic text adjustments
 */

/**
 * Initialize mobile typography enhancements
 * @param {Object} options - Configuration options
 */
export function initMobileTypography(options = {}) {
  // Only apply on mobile devices
  if (!isMobileDevice()) {
    return;
  }
  
  console.info('Initializing mobile typography enhancements');
  
  // Apply text truncation to long content elements
  applyTextTruncation();
  
  // Setup reading mode toggle if specified
  if (options.enableReadingMode !== false) {
    setupReadingModeToggle();
  }
  
  // Optimize line lengths for readable text
  optimizeLineLength();
  
  // Add text-fade effect to overflow containers
  addTextFadeEffects();
  
  // Initialize any custom features
  if (options.customInit && typeof options.customInit === 'function') {
    options.customInit();
  }
  
  // Listen for container resize/rotation to reapply optimizations
  setupResizeHandler();
}

/**
 * Check if the current device is mobile
 * @returns {boolean} Whether the device is mobile
 */
function isMobileDevice() {
  return window.innerWidth <= 768 || 
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Apply text truncation to elements that need it
 */
function applyTextTruncation() {
  // Find potential elements that might need truncation
  const longTextElements = document.querySelectorAll('.info-text p, .background-info p, .detail-text p, .data-description');
  
  longTextElements.forEach(element => {
    // Skip elements already processed
    if (element.classList.contains('truncate-2-lines') || 
        element.classList.contains('truncate-3-lines') ||
        element.classList.contains('text-fade-container')) {
      return;
    }
    
    // For very long content, add text fade container
    if (element.textContent.length > 300) {
      element.classList.add('text-fade-container');
      
      // Add expand/collapse functionality
      addExpandCollapse(element);
    } 
    // For medium content, truncate to 3 lines
    else if (element.textContent.length > 150) {
      element.classList.add('truncate-3-lines');
      
      // Add expand/collapse functionality
      addExpandCollapse(element);
    }
  });
  
  // Handle title and heading truncation
  const headings = document.querySelectorAll('.panel-title, .data-title, h3:not(.no-truncate)');
  
  headings.forEach(heading => {
    if (heading.textContent.length > 60 && !heading.classList.contains('truncate-2-lines')) {
      heading.classList.add('truncate-2-lines');
      heading.setAttribute('title', heading.textContent); // Add tooltip with full text
    }
  });
}

/**
 * Add expand/collapse functionality to truncated elements
 * @param {HTMLElement} element - The truncated element
 */
function addExpandCollapse(element) {
  // Skip if element already has expand/collapse
  if (element.querySelector('.expand-collapse-btn')) {
    return;
  }
  
  // Create expand/collapse button
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'expand-collapse-btn';
  toggleBtn.setAttribute('aria-expanded', 'false');
  toggleBtn.textContent = 'Read more';
  
  // Add click handler
  toggleBtn.addEventListener('click', function() {
    const isExpanded = this.getAttribute('aria-expanded') === 'true';
    
    if (isExpanded) {
      // Collapse
      element.classList.add('text-fade-container');
      element.classList.add('truncate-3-lines');
      this.textContent = 'Read more';
      this.setAttribute('aria-expanded', 'false');
    } else {
      // Expand
      element.classList.remove('text-fade-container');
      element.classList.remove('truncate-3-lines');
      this.textContent = 'Show less';
      this.setAttribute('aria-expanded', 'true');
    }
  });
  
  // Add button after element
  element.parentNode.insertBefore(toggleBtn, element.nextSibling);
}

/**
 * Setup reading mode toggle
 */
function setupReadingModeToggle() {
  // Create reading mode toggle button if it doesn't exist
  if (!document.querySelector('#reading-mode-toggle')) {
    // Create label for the toggle
    const label = document.createElement('label');
    label.className = 'settings-option-label';
    label.textContent = 'Reading Mode';
    label.setAttribute('for', 'reading-mode-toggle');
    
    // Create the toggle button
    const button = document.createElement('button');
    button.id = 'reading-mode-toggle';
    button.className = 'reading-mode-toggle';
    button.innerHTML = '<i class="fas fa-book-reader"></i>';
    button.setAttribute('aria-label', 'Toggle reading mode');
    button.setAttribute('title', 'Toggle reading mode');
    
    // Create container for the toggle and label
    const toggleContainer = document.createElement('div');
    toggleContainer.className = 'settings-toggle-container';
    toggleContainer.appendChild(label);
    toggleContainer.appendChild(button);
    
    // Find the container in the settings panel
    const container = document.querySelector('#reading-mode-container');
    
    // If the container exists, append the toggle
    if (container) {
      container.appendChild(toggleContainer);
      
      // Add click handler
      button.addEventListener('click', toggleReadingMode);
    } else {
      // Fallback to the old method if the container doesn't exist yet
      const infoContainer = document.querySelector('.info-container');
      if (infoContainer) {
        infoContainer.appendChild(button);
        button.addEventListener('click', toggleReadingMode);
      }
    }
  }
}

/**
 * Toggle reading mode on/off
 */
function toggleReadingMode() {
  const container = document.querySelector('.info-container');
  const button = document.querySelector('#reading-mode-toggle');
  
  if (container) {
    container.classList.toggle('reading-mode');
    
    // Update button state
    if (container.classList.contains('reading-mode')) {
      button.classList.add('active');
      button.setAttribute('aria-pressed', 'true');
      
      // Apply reading mode optimizations
      document.querySelectorAll('.truncate-2-lines, .truncate-3-lines, .text-fade-container').forEach(el => {
        el.classList.remove('truncate-2-lines', 'truncate-3-lines', 'text-fade-container');
      });
    } else {
      button.classList.remove('active');
      button.setAttribute('aria-pressed', 'false');
      
      // Reapply truncation
      applyTextTruncation();
    }
  }
}

/**
 * Optimize line length for readable text
 */
function optimizeLineLength() {
  // Find text containers to optimize
  const textContainers = document.querySelectorAll('.info-text, .detail-text, .background-info, [class*="content-"]');
  
  textContainers.forEach(container => {
    // Skip containers already optimized
    if (container.hasAttribute('data-line-optimized')) {
      return;
    }
    
    // Add wrapper if needed for line length control
    const paragraphs = container.querySelectorAll('p:not(.line-optimized)');
    
    paragraphs.forEach(p => {
      p.classList.add('line-optimized');
      
      // Only wrap if not already wrapped
      if (!p.parentElement.classList.contains('text-container')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'text-container';
        p.parentNode.insertBefore(wrapper, p);
        wrapper.appendChild(p);
      }
    });
    
    container.setAttribute('data-line-optimized', 'true');
  });
}

/**
 * Add text fade effects to overflow containers
 */
function addTextFadeEffects() {
  // Find potential containers that need fade effects
  const overflowContainers = document.querySelectorAll('.overflow-container, .scroll-container, [class*="panel"]:not(.data-panel)');
  
  overflowContainers.forEach(container => {
    // Skip containers already processed
    if (container.querySelector('.fade-top') || container.querySelector('.fade-bottom')) {
      return;
    }
    
    // Check if container has overflow content
    if (container.scrollHeight > container.clientHeight) {
      // Add fade indicators
      const fadeTop = document.createElement('div');
      fadeTop.className = 'fade-top';
      
      const fadeBottom = document.createElement('div');
      fadeBottom.className = 'fade-bottom';
      
      container.appendChild(fadeTop);
      container.appendChild(fadeBottom);
      
      // Set up scroll event to show/hide indicators
      container.addEventListener('scroll', function() {
        const scrollTop = this.scrollTop;
        const maxScroll = this.scrollHeight - this.clientHeight;
        
        // Show/hide top fade based on scroll position
        if (scrollTop > 10) {
          fadeTop.classList.add('visible');
        } else {
          fadeTop.classList.remove('visible');
        }
        
        // Show/hide bottom fade based on scroll position
        if (scrollTop < maxScroll - 10) {
          fadeBottom.classList.add('visible');
        } else {
          fadeBottom.classList.remove('visible');
        }
      });
      
      // Trigger initial scroll event
      container.dispatchEvent(new Event('scroll'));
    }
  });
}

/**
 * Set up resize handler to re-apply optimizations
 */
function setupResizeHandler() {
  let resizeTimeout;
  
  window.addEventListener('resize', () => {
    // Debounce resize events
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // Only run on mobile
      if (isMobileDevice()) {
        // Reapply optimizations
        applyTextTruncation();
        optimizeLineLength();
        addTextFadeEffects();
      }
    }, 250);
  });
  
  // Also handle orientation change
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      if (isMobileDevice()) {
        // Reapply optimizations
        applyTextTruncation();
        optimizeLineLength();
        addTextFadeEffects();
      }
    }, 300);
  });
}

/**
 * Apply optimized font size for a specific element
 * @param {HTMLElement} element - Element to optimize
 * @param {Object} options - Configuration options
 */
export function optimizeFontSize(element, options = {}) {
  const defaults = {
    minSize: 12,
    maxSize: 18,
    preferredSize: 16,
    lineHeight: 1.5
  };
  
  const config = { ...defaults, ...options };
  
  // Only run on mobile
  if (!isMobileDevice()) {
    return;
  }
  
  // Calculate ideal font size based on container width
  const containerWidth = element.clientWidth;
  const idealCharactersPerLine = 45; // Typographic best practice
  const idealFontSize = containerWidth / idealCharactersPerLine * 2; // Approximate conversion
  
  // Constrain to min/max range
  let fontSize = Math.min(Math.max(idealFontSize, config.minSize), config.maxSize);
  
  // Prefer preferred size if it's within 1px of calculated size
  if (Math.abs(fontSize - config.preferredSize) <= 1) {
    fontSize = config.preferredSize;
  }
  
  // Apply font size and line height
  element.style.fontSize = `${fontSize}px`;
  element.style.lineHeight = config.lineHeight;
}

// Export additional utility functions
export default {
  initMobileTypography,
  optimizeFontSize
}; 