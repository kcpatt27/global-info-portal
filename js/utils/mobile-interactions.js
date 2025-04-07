/**
 * mobile-interactions.js
 * Implements enhanced mobile touch interactions and animations
 * 
 * - Add subtle animation and transition effects for mobile interactions
 * - Implement proper feedback for touch interactions
 * - Create smooth transitions between application states
 * - Ensure all interactions feel native and responsive on mobile
 */

// Store state and references
const state = {
  ripples: [],
  gestures: {},
  touchStartTime: 0,
  scrollContainers: new Set(),
  swipeableElements: new Set(),
  animationFrameId: null,
  isInitialized: false
};

// Default configuration
const DEFAULT_CONFIG = {
  // Enable swipe gestures
  enableSwipeGestures: true,
  // Enable drag handles
  enableDragHandles: true,
  // Enable touch feedback
  enableTouchFeedback: true,
  // Custom initialization function
  customInit: null
};

/**
 * Check if the current device is mobile
 * @returns {boolean} Whether the device is mobile
 */
function isMobileDevice() {
  return window.innerWidth <= 768 || 
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Load mobile interaction CSS
 */
function loadInteractionStyles() {
  if (document.querySelector('link[href*="mobile-touch.css"]')) {
    return; // Already loaded
  }
  
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'css-styles/interaction/mobile-touch.css';
  document.head.appendChild(link);
}

/**
 * Set up swipe gesture detection and handling
 */
function setupSwipeGestures() {
  // Get containers that should support swipe
  const swipeableContainers = document.querySelectorAll('.swipeable-container');
  
  if (swipeableContainers.length === 0) {
    console.info('No swipeable containers found');
    return;
  }
  
  console.info('Setting up swipe gestures for ' + swipeableContainers.length + ' containers');
  
  swipeableContainers.forEach(container => {
    // Skip already initialized containers
    if (container.hasAttribute('data-swipe-initialized')) {
      return;
    }
    
    let startX = 0;
    let currentX = 0;
    let startY = 0;
    let currentY = 0;
    let startTime = 0;
    let isHorizontalSwipe = false;
    const content = container.querySelector('.swipeable-content');
    
    if (!content) {
      console.warn('No swipeable content found in container:', container);
      return;
    }
    
    // Store initial position
    let currentPosition = 0;
    
    // Get all panels
    const panels = Array.from(content.children);
    const panelCount = panels.length;
    let activeIndex = 0;
    
    // Touch start handler
    container.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startTime = Date.now();
      isHorizontalSwipe = false;
      
      // Remove transition during touch
      content.style.transition = 'none';
    }, { passive: true });
    
    // Touch move handler
    container.addEventListener('touchmove', e => {
      currentX = e.touches[0].clientX;
      currentY = e.touches[0].clientY;
      
      const diffX = currentX - startX;
      const diffY = currentY - startY;
      
      // Determine if this is primarily a horizontal swipe (for horizontal swipe containers)
      if (!isHorizontalSwipe && Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
        isHorizontalSwipe = true;
      }
      
      // Only apply horizontal movement if this is determined to be a horizontal swipe
      if (isHorizontalSwipe) {
        // Calculate new position with resistance at edges
        let newPosition = currentPosition + diffX;
        
        // Add resistance at the edges
        if (newPosition > 0) {
          newPosition = newPosition * 0.3;
        } else if (newPosition < -((panelCount - 1) * 100)) {
          const overScroll = newPosition + ((panelCount - 1) * 100);
          newPosition = -((panelCount - 1) * 100) + (overScroll * 0.3);
        }
        
        // Apply the transform
        content.style.transform = `translateX(${newPosition}%)`;
        
        // Prevent page scrolling when swiping horizontally
        e.preventDefault();
      }
    }, { passive: false }); // Changed to non-passive to allow preventDefault
    
    // Touch end handler
    container.addEventListener('touchend', () => {
      const diffX = currentX - startX;
      const duration = Date.now() - startTime;
      
      // Re-enable transition
      content.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      
      if (isHorizontalSwipe) {
        // Check if the swipe was fast enough to trigger a page change regardless of distance
        const isFastSwipe = duration < 300 && Math.abs(diffX) > 30;
        
        // Check if the swipe was long enough to trigger a page change
        const isLongSwipe = Math.abs(diffX) > container.offsetWidth * 0.3;
        
        if ((isFastSwipe || isLongSwipe) && diffX !== 0) {
          if (diffX > 0 && activeIndex > 0) {
            // Swipe right, go to previous
            activeIndex--;
          } else if (diffX < 0 && activeIndex < panelCount - 1) {
            // Swipe left, go to next
            activeIndex++;
          }
        }
        
        // Set new position
        currentPosition = -(activeIndex * 100);
        content.style.transform = `translateX(${currentPosition}%)`;
        
        // Update active classes
        updateActivePanel(panels, activeIndex);
      }
    });
    
    // Initialize active panel
    updateActivePanel(panels, activeIndex);
    
    // Mark as initialized
    container.setAttribute('data-swipe-initialized', 'true');
  });
}

/**
 * Set up drag handles for expandable containers
 */
function setupDragHandles() {
  console.info('Setting up drag handles for expandable containers');
  
  // Find info container which has a drag handle
  const infoContainer = document.querySelector('.info-container');
  
  if (!infoContainer) {
    console.info('No info container found for drag handles');
    return;
  }
  
  // Skip if already set up
  if (infoContainer.hasAttribute('data-drag-setup')) {
    return;
  }
  
  // Reset any existing expanded state on page load
  infoContainer.classList.remove('expanded');
  
  let startY = 0;
  let currentY = 0;
  let startHeight = 0;
  
  // Handle touch on the container or pull handle
  infoContainer.addEventListener('touchstart', e => {
    // Only trigger for touches near the top handle
    const touchTarget = e.target;
    const isTopArea = touchTarget === infoContainer || 
                     touchTarget.closest('.info-header') || 
                     e.touches[0].clientY < (infoContainer.getBoundingClientRect().top + 40);
    
    if (isTopArea) {
      startY = e.touches[0].clientY;
      startHeight = infoContainer.offsetHeight;
      infoContainer.style.transition = 'none';
      e.preventDefault(); // Prevent other touch events
    }
  }, { passive: false }); // Changed to non-passive to allow preventDefault
  
  // Handle drag
  infoContainer.addEventListener('touchmove', e => {
    if (startY > 0) {
      currentY = e.touches[0].clientY;
      const diffY = startY - currentY;
      
      // If swiping up significantly, expand the panel
      if (diffY > 50 && !infoContainer.classList.contains('expanded')) {
        infoContainer.classList.add('expanded');
        infoContainer.style.transition = '';
        startY = 0; // Reset to prevent further handling
      } 
      // If swiping down significantly and expanded, collapse
      else if (diffY < -50 && infoContainer.classList.contains('expanded')) {
        infoContainer.classList.remove('expanded');
        infoContainer.style.transition = '';
        startY = 0; // Reset to prevent further handling
      }
    }
  }, { passive: true });
  
  // Clean up after touch
  infoContainer.addEventListener('touchend', () => {
    if (startY > 0) {
      infoContainer.style.transition = '';
      startY = 0;
    }
  });
  
  // Double tap handler for quick expansion
  let lastTap = 0;
  infoContainer.addEventListener('touchend', e => {
    const now = Date.now();
    const DOUBLE_TAP_THRESHOLD = 300;
    
    // Check if the touch is in the header area
    const touchTarget = e.target;
    const isHeaderArea = touchTarget.closest('.info-header');
    
    if (isHeaderArea && now - lastTap < DOUBLE_TAP_THRESHOLD) {
      // Double tap detected in header
      infoContainer.classList.toggle('expanded');
      e.preventDefault();
    }
    
    lastTap = now;
  });
  
  // Mark as set up
  infoContainer.setAttribute('data-drag-setup', 'true');
  console.info('Drag handle setup completed successfully');
}

/**
 * Set up touch feedback effects for interactive elements
 */
function setupTouchFeedback() {
  // Add touch ripple effect to elements with .touch-ripple class
  const touchRippleElements = document.querySelectorAll('.touch-ripple');
  
  touchRippleElements.forEach(element => {
    element.addEventListener('touchstart', e => {
      const rect = element.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      const y = e.touches[0].clientY - rect.top;
      
      // Create ripple element
      const ripple = document.createElement('span');
      ripple.className = 'ripple-effect';
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      
      // Add to element
      element.appendChild(ripple);
      
      // Remove after animation completes
      setTimeout(() => {
        ripple.remove();
      }, 600);
    }, { passive: true });
  });
  
  // Add active state to elements with .touch-active class
  const touchActiveElements = document.querySelectorAll('.touch-active');
  
  touchActiveElements.forEach(element => {
    element.addEventListener('touchstart', () => {
      element.classList.add('active');
    }, { passive: true });
    
    ['touchend', 'touchcancel'].forEach(event => {
      element.addEventListener(event, () => {
        element.classList.remove('active');
      }, { passive: true });
    });
  });
  
  // Ensure mobile navigation is properly visible
  const mobileNavContainer = document.querySelector('.mobile-nav-container');
  if (mobileNavContainer) {
    mobileNavContainer.classList.remove('hidden');
  }
  
  // Initialize additional touch feedback for buttons and interactive elements
  document.querySelectorAll('button, .btn, [role="button"], .touch-highlight').forEach(element => {
    element.classList.add('touch-feedback-enabled');
    
    element.addEventListener('touchstart', () => {
      element.classList.add('touch-active');
    }, { passive: true });
    
    ['touchend', 'touchcancel'].forEach(event => {
      element.addEventListener(event, () => {
        element.classList.remove('touch-active');
        
        // Add and remove a class to show the "activated" state briefly
        element.classList.add('touch-activated');
        setTimeout(() => {
          element.classList.remove('touch-activated');
        }, 200);
      }, { passive: true });
    });
  });
}

/**
 * Initialize mobile interactions
 * @param {Object} config - Configuration options
 */
export function initMobileInteractions(config = {}) {
  // Merge with default config
  const options = { ...DEFAULT_CONFIG, ...config };
  
  // Only initialize on mobile devices
  if (!isMobileDevice()) {
    console.info('Mobile interactions not initialized (desktop device detected)');
    return;
  }
  
  console.info('Initializing enhanced mobile interactions');
  
  // Prevent duplicate initialization
  if (state.isInitialized) {
    console.info('Mobile interactions already initialized');
    return;
  }
  
  // Add mobile-specific interaction classes
  document.body.classList.add('mobile-interactions-enabled');
  
  // Load mobile interaction styles
  loadInteractionStyles();
  
  // Set up various interaction enhancements
  if (options.enableSwipeGestures) {
    setupSwipeGestures();
    initSwipeActions();
  }
  
  if (options.enableDragHandles) {
    setupDragHandles();
    initDragHandles();
  }
  
  if (options.enableTouchFeedback) {
    setupTouchFeedback();
    initTouchFeedback();
  }
  
  // Initialize scroll optimizations
  initScrollOptimizations();
  
  // Initialize gesture hints
  initGestureHints();
  
  // Initialize staggered animations
  initStaggeredAnimations();
  
  // Add visible class to mobile navigation items with a staggered delay
  setTimeout(() => {
    const navItems = document.querySelectorAll('.mobile-nav-item');
    navItems.forEach((item, index) => {
      setTimeout(() => {
        item.classList.add('visible');
      }, index * 50);
    });
  }, 300);
  
  // Initialize custom functionality if provided
  if (typeof options.customInit === 'function') {
    options.customInit();
  }
  
  // Mark as initialized
  state.isInitialized = true;
}

/**
 * Initialize touch feedback effects
 */
function initTouchFeedback() {
  console.info('Initializing touch feedback effects');
  
  // Add touch ripple container class to interactive elements
  const interactiveElements = document.querySelectorAll(
    'button, [role="button"], .interactive-element, .sidebar-button, .data-tab, .nav-button, .stat-item, .list-item-interactive'
  );
  
  if (interactiveElements.length === 0) {
    console.info('No interactive elements found for touch feedback');
  } else {
    console.info(`Setting up touch feedback for ${interactiveElements.length} elements`);
  }
  
  interactiveElements.forEach(element => {
    // Skip elements already set up
    if (element.classList.contains('touch-ripple-container')) {
      return;
    }
    
    element.classList.add('touch-ripple-container');
    
    // Add touch event listeners
    element.addEventListener('touchstart', createRippleEffect, { passive: true });
    element.addEventListener('touchend', cleanupRipple, { passive: true });
  });
  
  // Cleanup any existing ripples on page interactions
  document.addEventListener('touchmove', throttle(() => {
    cleanupAllRipples();
  }, 100), { passive: true });
  
  // Add touch feedback to additional elements
  document.querySelectorAll('button, .btn, [role="button"], .touch-highlight').forEach(element => {
    if (!element.classList.contains('touch-feedback-enabled')) {
      element.classList.add('touch-feedback-enabled');
      
      element.addEventListener('touchstart', () => {
        element.classList.add('touch-active');
      }, { passive: true });
      
      ['touchend', 'touchcancel'].forEach(event => {
        element.addEventListener(event, () => {
          element.classList.remove('touch-active');
          
          // Add and remove a class to show the "activated" state briefly
          element.classList.add('touch-activated');
          setTimeout(() => {
            element.classList.remove('touch-activated');
          }, 200);
        }, { passive: true });
      });
    }
  });
  
  // Ensure mobile navigation is properly visible
  const mobileNavContainer = document.querySelector('.mobile-nav-container');
  if (mobileNavContainer) {
    mobileNavContainer.classList.remove('hidden');
  }
}

/**
 * Create ripple effect on element touch
 * @param {TouchEvent} event - The touch event
 */
function createRippleEffect(event) {
  const element = event.currentTarget;
  const rect = element.getBoundingClientRect();
  
  const touch = event.touches[0];
  const touchX = touch.clientX - rect.left;
  const touchY = touch.clientY - rect.top;
  
  // Create ripple element
  const ripple = document.createElement('span');
  ripple.classList.add('touch-ripple');
  
  // Position ripple at touch point
  ripple.style.top = `${touchY}px`;
  ripple.style.left = `${touchX}px`;
  
  // Set size based on element dimensions (to ensure it covers the whole element)
  const size = Math.max(rect.width, rect.height) * 2;
  ripple.style.width = `${size}px`;
  ripple.style.height = `${size}px`;
  
  // Add ripple to element
  element.appendChild(ripple);
  
  // Track this ripple
  state.ripples.push({ element, ripple });
  
  // Remove ripple after animation completes
  setTimeout(() => {
    if (ripple.parentElement === element) {
      element.removeChild(ripple);
    }
    
    // Remove from tracking array
    state.ripples = state.ripples.filter(r => r.ripple !== ripple);
  }, 600); // Match animation duration
}

/**
 * Clean up ripple effect after touch
 * @param {TouchEvent} event - The touch event
 */
function cleanupRipple(event) {
  const element = event.currentTarget;
  const ripplesForElement = state.ripples.filter(r => r.element === element);
  
  // Remove ripples with a slight delay to allow animation to be visible
  ripplesForElement.forEach(({ ripple }) => {
    setTimeout(() => {
      if (ripple.parentElement) {
        ripple.parentElement.removeChild(ripple);
      }
    }, 100);
  });
  
  // Remove from tracking array
  state.ripples = state.ripples.filter(r => r.element !== element);
}

/**
 * Clean up all ripple effects
 */
function cleanupAllRipples() {
  state.ripples.forEach(({ element, ripple }) => {
    if (ripple.parentElement === element) {
      element.removeChild(ripple);
    }
  });
  
  state.ripples = [];
}

/**
 * Initialize scroll optimizations
 */
function initScrollOptimizations() {
  console.info('Initializing scroll optimizations');
  
  // Find all scrollable containers
  const scrollContainers = document.querySelectorAll('.info-container, .data-panels, .panel-scroll-container, [class*="scroll"]');
  
  if (scrollContainers.length === 0) {
    console.info('No scroll containers found for optimization');
    return;
  }
  
  console.info(`Optimizing ${scrollContainers.length} scroll containers`);
  
  scrollContainers.forEach(container => {
    // Skip already optimized containers
    if (container.hasAttribute('data-scroll-optimized')) {
      return;
    }
    
    // Add scroll optimization classes
    container.classList.add('scroll-container');
    
    // Enable custom scrollbar styling
    if (!container.classList.contains('hidden-scrollbar')) {
      container.classList.add('custom-scrollbar');
    }
    
    // Set up scroll momentum restoration
    setupMomentumScrolling(container);
    
    // Mark as optimized
    container.setAttribute('data-scroll-optimized', 'true');
    state.scrollContainers.add(container);
  });
  
  // Find and optimize snap scroll containers
  const snapContainers = document.querySelectorAll('.horizontal-scroll, .carousel, [data-scroll="snap"]');
  
  if (snapContainers.length > 0) {
    console.info(`Optimizing ${snapContainers.length} snap scroll containers`);
    
    snapContainers.forEach(container => {
      if (container.hasAttribute('data-snap-optimized')) {
        return;
      }
      
      container.classList.add('snap-scroll-container');
      
      // Add snap points to children
      Array.from(container.children).forEach(child => {
        child.classList.add('snap-scroll-item');
      });
      
      container.setAttribute('data-snap-optimized', 'true');
    });
  }
}

/**
 * Set up momentum scrolling 
 * @param {HTMLElement} container - The scroll container
 */
function setupMomentumScrolling(container) {
  let lastScrollTop = 0;
  let scrollVelocity = 0;
  let lastScrollTime = 0;
  
  // Track scroll position and velocity
  container.addEventListener('scroll', () => {
    const now = Date.now();
    const dt = now - lastScrollTime;
    
    if (dt > 0) {
      const currentScrollTop = container.scrollTop;
      const delta = currentScrollTop - lastScrollTop;
      scrollVelocity = delta / dt;
      
      lastScrollTop = currentScrollTop;
      lastScrollTime = now;
    }
  }, { passive: true });
  
  // Handle scroll events ending (for momentum)
  container.addEventListener('touchend', () => {
    if (Math.abs(scrollVelocity) > 0.5) {
      // Apply momentum effect
      applyScrollMomentum(container, scrollVelocity);
    }
    
    // Reset velocity
    scrollVelocity = 0;
  }, { passive: true });
}

/**
 * Apply scroll momentum effect
 * @param {HTMLElement} container - The scroll container
 * @param {number} initialVelocity - Initial scroll velocity
 */
function applyScrollMomentum(container, initialVelocity) {
  let velocity = initialVelocity;
  const deceleration = 0.95; // Deceleration factor
  let lastTime = Date.now();
  
  const momentumScroll = () => {
    const now = Date.now();
    const dt = now - lastTime;
    lastTime = now;
    
    // Apply velocity to scroll position
    container.scrollTop += velocity * dt;
    
    // Decelerate
    velocity *= deceleration;
    
    // Continue animation if velocity is still significant
    if (Math.abs(velocity) > 0.05) {
      requestAnimationFrame(momentumScroll);
    }
  };
  
  // Start momentum scroll animation
  requestAnimationFrame(momentumScroll);
}

/**
 * Initialize gesture hints for new users
 */
function initGestureHints() {
  // Find all elements that should have gesture hints
  const gestureElements = document.querySelectorAll('[data-gesture-hint]');
  
  gestureElements.forEach(element => {
    const hintText = element.getAttribute('data-gesture-hint');
    if (!hintText) return;
    
    // Create hint element if it doesn't exist
    if (!element.querySelector('.gesture-hint')) {
      const hint = document.createElement('div');
      hint.className = 'gesture-hint';
      hint.textContent = hintText;
      element.appendChild(hint);
      
      // Position hint
      const hintPosition = element.getAttribute('data-hint-position') || 'bottom';
      hint.style[hintPosition] = '16px';
      
      // Show hint on first interaction
      showGestureHintOnce(element, hint);
    }
  });
}

/**
 * Show gesture hint once for element
 * @param {HTMLElement} element - The interactive element
 * @param {HTMLElement} hint - The hint element
 */
function showGestureHintOnce(element, hint) {
  // Check if this hint has been shown before
  const hintId = element.getAttribute('data-hint-id') || `hint-${Math.random().toString(36).substring(2, 9)}`;
  element.setAttribute('data-hint-id', hintId);
  
  const hintShown = localStorage.getItem(`gesture-hint-${hintId}`);
  if (hintShown) return;
  
  // Show hint on first touch
  const touchHandler = () => {
    hint.classList.add('visible');
    
    // Hide after delay
    setTimeout(() => {
      hint.classList.remove('visible');
      
      // Mark as shown
      localStorage.setItem(`gesture-hint-${hintId}`, 'true');
      
      // Remove event listener
      element.removeEventListener('touchstart', touchHandler);
    }, 3000);
  };
  
  element.addEventListener('touchstart', touchHandler, { passive: true, once: true });
}

/**
 * Initialize swipe actions
 */
function initSwipeActions() {
  // Find all elements with swipe actions
  const swipeElements = document.querySelectorAll('[data-swipe-action]');
  
  swipeElements.forEach(element => {
    // Skip already set up elements
    if (element.classList.contains('swipe-action-container')) {
      return;
    }
    
    element.classList.add('swipe-action-container');
    
    // Create item container if not already nested
    let itemElement;
    if (!element.querySelector('.swipe-action-item')) {
      // Create wrapper for content
      itemElement = document.createElement('div');
      itemElement.className = 'swipe-action-item';
      
      // Move all child nodes into this wrapper
      while (element.firstChild) {
        itemElement.appendChild(element.firstChild);
      }
      
      element.appendChild(itemElement);
    } else {
      itemElement = element.querySelector('.swipe-action-item');
    }
    
    // Add left action if specified
    const leftAction = element.getAttribute('data-swipe-left');
    if (leftAction) {
      const leftActionEl = document.createElement('div');
      leftActionEl.className = 'swipe-action swipe-action-left';
      leftActionEl.innerHTML = `<i class="fas ${element.getAttribute('data-left-icon') || 'fa-check'}"></i>`;
      element.appendChild(leftActionEl);
    }
    
    // Add right action if specified
    const rightAction = element.getAttribute('data-swipe-right');
    if (rightAction) {
      const rightActionEl = document.createElement('div');
      rightActionEl.className = 'swipe-action swipe-action-right';
      rightActionEl.innerHTML = `<i class="fas ${element.getAttribute('data-right-icon') || 'fa-times'}"></i>`;
      element.appendChild(rightActionEl);
    }
    
    // Set up swipe gesture tracking
    setupSwipeGesture(element, itemElement, leftAction, rightAction);
    
    // Track this swipeable element
    state.swipeableElements.add(element);
  });
}

/**
 * Set up swipe gesture tracking
 * @param {HTMLElement} container - The swipe container
 * @param {HTMLElement} item - The swipeable item element
 * @param {string} leftAction - Left swipe action name
 * @param {string} rightAction - Right swipe action name
 */
function setupSwipeGesture(container, item, leftAction, rightAction) {
  let startX = 0;
  let currentX = 0;
  let offsetX = 0;
  const threshold = 80; // Pixels needed to trigger action
  
  // Touch start - begin swipe tracking
  container.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    item.style.transition = 'none';
  }, { passive: true });
  
  // Touch move - update position
  container.addEventListener('touchmove', (e) => {
    currentX = e.touches[0].clientX;
    offsetX = currentX - startX;
    
    // Limit swiping based on available actions
    if ((!leftAction && offsetX > 0) || (!rightAction && offsetX < 0)) {
      offsetX = offsetX * 0.2; // Add resistance
    }
    
    // Apply transform
    item.style.transform = `translateX(${offsetX}px)`;
  }, { passive: true });
  
  // Touch end - complete gesture or reset
  container.addEventListener('touchend', () => {
    item.style.transition = 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)';
    
    // Check if threshold was exceeded and trigger action
    if (offsetX > threshold && leftAction) {
      triggerSwipeAction(container, 'left', leftAction);
    } else if (offsetX < -threshold && rightAction) {
      triggerSwipeAction(container, 'right', rightAction);
    } else {
      // Reset position
      item.style.transform = 'translateX(0)';
    }
    
    // Reset tracking
    startX = 0;
    currentX = 0;
    offsetX = 0;
  }, { passive: true });
}

/**
 * Trigger swipe action
 * @param {HTMLElement} container - The swipe container
 * @param {string} direction - Swipe direction ('left' or 'right')
 * @param {string} action - Action name to trigger
 */
function triggerSwipeAction(container, direction, action) {
  const item = container.querySelector('.swipe-action-item');
  
  // Animate item off screen
  const screenWidth = window.innerWidth;
  item.style.transform = `translateX(${direction === 'left' ? screenWidth : -screenWidth}px)`;
  
  // Emit custom event
  const event = new CustomEvent('swipe-action', {
    detail: {
      direction,
      action,
      container
    }
  });
  container.dispatchEvent(event);
  
  // Check for callback function
  const callbackName = container.getAttribute(`data-${direction}-callback`);
  if (callbackName && window[callbackName] && typeof window[callbackName] === 'function') {
    window[callbackName](container, action);
  }
  
  // Reset after animation
  setTimeout(() => {
    item.style.transition = 'none';
    item.style.transform = 'translateX(0)';
    
    // Re-enable transitions after reset
    setTimeout(() => {
      item.style.transition = 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)';
    }, 50);
  }, 300);
}

/**
 * Initialize drag handles
 */
function initDragHandles() {
  console.info('Initializing drag handles');
  
  // Find all drag handles
  const dragHandles = document.querySelectorAll('.draggable');
  
  if (dragHandles.length === 0) {
    console.info('No drag handles found');
    return;
  }
  
  console.info(`Setting up ${dragHandles.length} drag handles`);
  
  let setupCount = 0;
  
  dragHandles.forEach(handle => {
    const container = handle.closest('.info-container, .panel-container, [data-draggable="true"]');
    if (!container) {
      console.warn('No draggable container found for handle:', handle);
      return;
    }
    
    // Skip if already set up
    if (handle.hasAttribute('data-drag-initialized')) {
      return;
    }
    
    setupDragGesture(handle, container);
    handle.setAttribute('data-drag-initialized', 'true');
    setupCount++;
  });
  
  console.info(`Successfully set up ${setupCount} drag handles`);
}

/**
 * Set up drag gesture
 * @param {HTMLElement} handle - The drag handle element
 * @param {HTMLElement} container - The container to be dragged
 */
function setupDragGesture(handle, container) {
  let startY = 0;
  let currentY = 0;
  let initialHeight = 0;
  let initialTop = 0;
  let isDragging = false;
  
  // Touch start - begin drag
  handle.addEventListener('touchstart', (e) => {
    startY = e.touches[0].clientY;
    initialHeight = container.offsetHeight;
    initialTop = container.getBoundingClientRect().top;
    isDragging = true;
    
    // Add dragging class
    container.classList.add('is-dragging');
    container.style.transition = 'none';
    
    // Prevent other touch events during drag
    e.stopPropagation();
  }, { passive: false });
  
  // Touch move - update position
  document.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    
    currentY = e.touches[0].clientY;
    const diffY = currentY - startY;
    
    // Update container position/size based on orientation
    const isBottom = window.getComputedStyle(container).bottom !== 'auto';
    
    if (isBottom) {
      // Container is at the bottom, adjust height
      const newHeight = initialHeight - diffY;
      if (newHeight > 60 && newHeight < window.innerHeight * 0.9) {
        container.style.height = `${newHeight}px`;
      }
    } else {
      // Container is positioned from the top, adjust top position
      const newTop = initialTop + diffY;
      if (newTop > 0 && newTop < window.innerHeight * 0.7) {
        container.style.top = `${newTop}px`;
      }
    }
    
    // Emit drag event
    const event = new CustomEvent('drag-move', {
      detail: {
        diffY,
        handle,
        container
      }
    });
    container.dispatchEvent(event);
  }, { passive: true });
  
  // Touch end - finalize drag
  document.addEventListener('touchend', () => {
    if (!isDragging) return;
    
    // Remove dragging class
    container.classList.remove('is-dragging');
    container.style.transition = '';
    
    // Calculate final state based on velocity and position
    const diffY = currentY - startY;
    const dragPercentage = Math.abs(diffY) / initialHeight;
    
    // Emit drag end event
    const event = new CustomEvent('drag-end', {
      detail: {
        diffY,
        dragPercentage,
        handle,
        container
      }
    });
    container.dispatchEvent(event);
    
    // Reset tracking
    isDragging = false;
    startY = 0;
    currentY = 0;
  }, { passive: true });
}

/**
 * Initialize staggered animations
 */
function initStaggeredAnimations() {
  console.info('Initializing staggered animations');
  
  // Find all stagger containers
  const staggerContainers = document.querySelectorAll('.stagger-container');
  
  if (staggerContainers.length === 0) {
    console.info('No stagger containers found');
    return;
  }
  
  console.info(`Setting up ${staggerContainers.length} staggered animation containers`);
  
  // Check if Intersection Observer is supported
  if (!('IntersectionObserver' in window)) {
    console.warn('IntersectionObserver not supported, staggered animations will not work');
    
    // Fallback - just show all items
    staggerContainers.forEach(container => {
      container.classList.add('animate');
    });
    return;
  }
  
  staggerContainers.forEach(container => {
    // Get children to animate
    const items = container.querySelectorAll('.stagger-item');
    if (items.length === 0) {
      console.warn('No stagger items found in container:', container);
      return;
    }
    
    // Skip if already set up
    if (container.hasAttribute('data-stagger-initialized')) {
      return;
    }
    
    // Set up intersection observer to trigger animation
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Start animation
          container.classList.add('animate');
          observer.disconnect();
        }
      });
    }, { threshold: 0.1 });
    
    // Observe container
    observer.observe(container);
    
    // Mark as initialized
    container.setAttribute('data-stagger-initialized', 'true');
  });
}

/**
 * Throttle function to limit execution frequency
 * @param {Function} fn - Function to throttle
 * @param {number} wait - Throttle wait time in ms
 * @returns {Function} Throttled function
 */
function throttle(fn, wait) {
  let lastCall = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastCall < wait) return;
    lastCall = now;
    return fn.apply(this, args);
  };
}

/**
 * Apply state transition animation
 * @param {HTMLElement} element - Element to animate
 * @param {string} type - Transition type: 'fade', 'slide-up', 'scale'
 * @param {string} direction - 'enter' or 'exit'
 * @param {Function} callback - Optional callback after animation completes
 */
export function applyTransition(element, type, direction, callback) {
  // Add initial class
  element.classList.add(`${type}-${direction}`);
  
  // Force reflow
  void element.offsetWidth;
  
  // Add active class
  element.classList.add(`${type}-${direction}-active`);
  
  // Remove classes and call callback after transition
  setTimeout(() => {
    element.classList.remove(`${type}-${direction}`);
    element.classList.remove(`${type}-${direction}-active`);
    
    if (typeof callback === 'function') {
      callback();
    }
  }, 300); // Match transition duration
}

/**
 * Create loading placeholder for content
 * @param {HTMLElement} container - Container to add placeholder to
 * @param {Object} options - Configuration options
 */
export function createLoadingPlaceholder(container, options = {}) {
  const defaults = {
    rows: 3,
    rowHeight: 20,
    rowSpacing: 10,
    animated: true
  };
  
  const config = { ...defaults, ...options };
  const fragment = document.createDocumentFragment();
  
  // Clear container if needed
  if (options.clear) {
    container.innerHTML = '';
  }
  
  // Create placeholder rows
  for (let i = 0; i < config.rows; i++) {
    const row = document.createElement('div');
    row.className = config.animated ? 'loading-placeholder' : '';
    row.style.height = `${config.rowHeight}px`;
    row.style.marginBottom = `${config.rowSpacing}px`;
    
    // Vary width to look more natural
    const width = i === config.rows - 1 ? '70%' : '100%';
    row.style.width = width;
    
    fragment.appendChild(row);
  }
  
  container.appendChild(fragment);
  
  // Return cleanup function
  return () => {
    const placeholders = container.querySelectorAll('.loading-placeholder');
    placeholders.forEach(el => {
      if (el.parentElement === container) {
        container.removeChild(el);
      }
    });
  };
}

/**
 * Update active panel visual state
 * @param {Array} panels - Array of panel elements
 * @param {number} activeIndex - Index of the active panel
 */
function updateActivePanel(panels, activeIndex) {
  panels.forEach((panel, index) => {
    if (index === activeIndex) {
      panel.classList.add('active');
      
      // Find and update any associated tab indicators
      const tabId = panel.getAttribute('data-panel-id');
      if (tabId) {
        const associatedTab = document.querySelector(`[data-tab-id="${tabId}"]`);
        if (associatedTab) {
          // Remove active class from all tabs
          document.querySelectorAll('[data-tab-id]').forEach(tab => {
            tab.classList.remove('active');
          });
          // Add active class to the associated tab
          associatedTab.classList.add('active');
        }
      }
    } else {
      panel.classList.remove('active');
    }
  });
}

// Export API
export default {
  initMobileInteractions,
  applyTransition,
  createLoadingPlaceholder
}; 