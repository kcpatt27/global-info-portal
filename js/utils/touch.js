/**
 * Touch interaction utilities for mobile experience
 * Provides gesture detection, touch-friendly event handlers, and mobile optimization
 */

// State to track touch interactions
const touchState = {
  startX: 0,
  startY: 0,
  startTime: 0,
  isScrolling: null,
  activeElement: null,
  touchActive: false,
  lastTap: 0,
  tapCount: 0,
  longPressTimer: null,
  thresholds: {
    tap: 10,           // Maximum distance for a tap (px)
    swipe: 50,         // Minimum distance for a swipe (px)
    longPress: 500,    // Duration for long press (ms)
    doubleTap: 300     // Maximum time between taps for double-tap (ms)
  }
};

/**
 * Initialize touch interactions for the application
 * @param {Object} options - Configuration options
 */
export const initializeTouchInteractions = (options = {}) => {
  console.log('Initializing touch interactions');
  
  // Merge custom options with defaults
  const config = {
    enableSwipe: true,
    enableDoubleTap: true,
    enableLongPress: true,
    disableContextMenuOnLongPress: true,
    preventDefaultForTouchEvents: false,
    ...options
  };
  
  // Set up core touch event listeners
  document.addEventListener('touchstart', handleTouchStart, { passive: !config.preventDefaultForTouchEvents });
  document.addEventListener('touchmove', handleTouchMove, { passive: true });
  document.addEventListener('touchend', handleTouchEnd, { passive: true });
  
  if (config.disableContextMenuOnLongPress) {
    // Prevent context menu on long press
    document.addEventListener('contextmenu', (e) => {
      if (touchState.touchActive) {
        e.preventDefault();
        return false;
      }
    });
  }
  
  // Enhance interactive elements for touch
  enhanceInteractiveElements();
  
  // Set up map-specific touch enhancements
  enhanceMapTouchInteractions();
  
  // Set up panel-specific touch enhancements
  enhancePanelTouchInteractions();
  
  return {
    // Public API for custom touch handling
    addSwipeHandler,
    addTapHandler,
    addLongPressHandler
  };
};

/**
 * Handle touch start events
 * @param {TouchEvent} e - The touch event
 */
const handleTouchStart = (e) => {
  if (e.touches.length !== 1) return; // Only handle single touches
  
  const touch = e.touches[0];
  touchState.startX = touch.clientX;
  touchState.startY = touch.clientY;
  touchState.startTime = Date.now();
  touchState.isScrolling = null;
  touchState.activeElement = e.target;
  touchState.touchActive = true;
  
  // Start long press timer
  touchState.longPressTimer = setTimeout(() => {
    if (touchState.touchActive) {
      triggerLongPress(e.target, touch.clientX, touch.clientY);
    }
  }, touchState.thresholds.longPress);
};

/**
 * Handle touch move events
 * @param {TouchEvent} e - The touch event
 */
const handleTouchMove = (e) => {
  if (!touchState.touchActive || e.touches.length !== 1) return;
  
  const touch = e.touches[0];
  const deltaX = touch.clientX - touchState.startX;
  const deltaY = touch.clientY - touchState.startY;
  
  // Determine if user is scrolling or swiping horizontally
  if (touchState.isScrolling === null) {
    touchState.isScrolling = Math.abs(deltaY) > Math.abs(deltaX);
  }
  
  // If moving too far, cancel long press
  if (Math.abs(deltaX) > touchState.thresholds.tap || Math.abs(deltaY) > touchState.thresholds.tap) {
    clearTimeout(touchState.longPressTimer);
  }
};

/**
 * Handle touch end events
 * @param {TouchEvent} e - The touch event
 */
const handleTouchEnd = (e) => {
  if (!touchState.touchActive) return;
  
  clearTimeout(touchState.longPressTimer);
  
  const touch = e.changedTouches[0];
  const deltaX = touch.clientX - touchState.startX;
  const deltaY = touch.clientY - touchState.startY;
  const elapsedTime = Date.now() - touchState.startTime;
  
  // Check if this was a tap
  if (Math.abs(deltaX) < touchState.thresholds.tap && 
      Math.abs(deltaY) < touchState.thresholds.tap &&
      elapsedTime < 300) {
    
    // Handle double tap
    const currentTime = Date.now();
    if (currentTime - touchState.lastTap < touchState.thresholds.doubleTap) {
      triggerDoubleTap(e.target, touch.clientX, touch.clientY);
      touchState.tapCount = 0;
    } else {
      touchState.tapCount = 1;
      // Delay single tap to detect potential double taps
      setTimeout(() => {
        if (touchState.tapCount === 1) {
          triggerTap(e.target, touch.clientX, touch.clientY);
        }
      }, touchState.thresholds.doubleTap);
    }
    
    touchState.lastTap = currentTime;
  } 
  // Check if this was a swipe
  else if (Math.abs(deltaX) > touchState.thresholds.swipe || 
           Math.abs(deltaY) > touchState.thresholds.swipe) {
    
    // Determine swipe direction
    let direction;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      direction = deltaX > 0 ? 'right' : 'left';
    } else {
      direction = deltaY > 0 ? 'down' : 'up';
    }
    
    triggerSwipe(e.target, direction, deltaX, deltaY);
  }
  
  touchState.touchActive = false;
};

/**
 * Trigger a tap event
 * @param {Element} element - The element being tapped
 * @param {number} x - The x coordinate
 * @param {number} y - The y coordinate
 */
const triggerTap = (element, x, y) => {
  const event = new CustomEvent('tap', {
    bubbles: true,
    cancelable: true,
    detail: { x, y }
  });
  
  element.dispatchEvent(event);
};

/**
 * Trigger a double tap event
 * @param {Element} element - The element being double-tapped
 * @param {number} x - The x coordinate
 * @param {number} y - The y coordinate
 */
const triggerDoubleTap = (element, x, y) => {
  const event = new CustomEvent('doubletap', {
    bubbles: true,
    cancelable: true,
    detail: { x, y }
  });
  
  element.dispatchEvent(event);
};

/**
 * Trigger a long press event
 * @param {Element} element - The element being long-pressed
 * @param {number} x - The x coordinate
 * @param {number} y - The y coordinate
 */
const triggerLongPress = (element, x, y) => {
  const event = new CustomEvent('longpress', {
    bubbles: true,
    cancelable: true,
    detail: { x, y }
  });
  
  element.dispatchEvent(event);
};

/**
 * Trigger a swipe event
 * @param {Element} element - The element being swiped
 * @param {string} direction - The swipe direction
 * @param {number} deltaX - The x distance
 * @param {number} deltaY - The y distance
 */
const triggerSwipe = (element, direction, deltaX, deltaY) => {
  const event = new CustomEvent('swipe', {
    bubbles: true,
    cancelable: true,
    detail: { direction, deltaX, deltaY }
  });
  
  element.dispatchEvent(event);
};

/**
 * Add a swipe handler to an element
 * @param {Element|string} target - Element or CSS selector
 * @param {Function} callback - The handler function
 */
export const addSwipeHandler = (target, callback) => {
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  if (!element) return;
  
  element.addEventListener('swipe', (e) => callback(e.detail, e));
};

/**
 * Add a tap handler to an element
 * @param {Element|string} target - Element or CSS selector
 * @param {Function} callback - The handler function
 */
export const addTapHandler = (target, callback) => {
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  if (!element) return;
  
  element.addEventListener('tap', (e) => callback(e.detail, e));
};

/**
 * Add a long press handler to an element
 * @param {Element|string} target - Element or CSS selector
 * @param {Function} callback - The handler function
 */
export const addLongPressHandler = (target, callback) => {
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  if (!element) return;
  
  element.addEventListener('longpress', (e) => callback(e.detail, e));
};

/**
 * Enhance interactive elements with touch-friendly behavior
 */
const enhanceInteractiveElements = () => {
  // Add active state to buttons on touch
  const buttons = document.querySelectorAll('button, .button, [role="button"]');
  buttons.forEach(button => {
    button.addEventListener('touchstart', () => {
      button.classList.add('touch-active');
    }, { passive: true });
    
    button.addEventListener('touchend', () => {
      button.classList.remove('touch-active');
    }, { passive: true });
    
    button.addEventListener('touchcancel', () => {
      button.classList.remove('touch-active');
    }, { passive: true });
  });
  
  // Enhance data tabs with swipe navigation
  const dataTabs = document.querySelector('.data-tabs');
  if (dataTabs) {
    addSwipeHandler(dataTabs, (swipeDetail) => {
      const tabs = Array.from(document.querySelectorAll('.data-tab'));
      const activeTab = document.querySelector('.data-tab.active');
      const activeIndex = tabs.indexOf(activeTab);
      
      if (swipeDetail.direction === 'left' && activeIndex < tabs.length - 1) {
        // Swipe left to go to next tab
        tabs[activeIndex + 1].click();
      } else if (swipeDetail.direction === 'right' && activeIndex > 0) {
        // Swipe right to go to previous tab
        tabs[activeIndex - 1].click();
      }
    });
  }
};

/**
 * Enhance map touch interactions
 */
const enhanceMapTouchInteractions = () => {
  const mapElement = document.querySelector('svg');
  if (!mapElement) return;
  
  // Double tap to zoom in
  addDoubleTapHandler(mapElement, (detail) => {
    const mapInstance = window.mapInstance;
    if (mapInstance && typeof window.resetZoom === 'function') {
      window.resetZoom();
    } else if (mapInstance && typeof mapInstance.resetZoom === 'function') {
      mapInstance.resetZoom();
    }
  });
};

/**
 * Enhance panel touch interactions
 */
const enhancePanelTouchInteractions = () => {
  const panels = document.querySelectorAll('.data-panel');
  
  panels.forEach(panel => {
    // Add momentum scrolling to panels
    panel.style.overscrollBehavior = 'contain';
    panel.style.webkitOverflowScrolling = 'touch';
  });
};

/**
 * Add a double tap handler to an element
 * @param {Element|string} target - Element or CSS selector
 * @param {Function} callback - The handler function
 */
const addDoubleTapHandler = (target, callback) => {
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  if (!element) return;
  
  element.addEventListener('doubletap', (e) => callback(e.detail, e));
};

/**
 * Detect if the current device is a touch device
 * @returns {boolean} True if the device supports touch events
 */
export function isTouchDevice() {
  return (
    ('ontouchstart' in window) ||
    (navigator.maxTouchPoints > 0) ||
    (navigator.msMaxTouchPoints > 0)
  );
}

/**
 * Get the touch or mouse position from an event
 * @param {Event} event - The touch or mouse event
 * @returns {Object} Object with x and y coordinates
 */
export function getTouchPosition(event) {
  // For touch events
  if (event.touches && event.touches.length) {
    return {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY
    };
  }
  
  // For mouse events
  return {
    x: event.clientX,
    y: event.clientY
  };
}

/**
 * Setup passive touch listeners for better performance
 * @param {Element} element - The DOM element to attach listeners to
 * @param {string} eventType - The event type ('touchstart', 'touchmove', etc.)
 * @param {Function} handler - The event handler function
 * @param {boolean} [passive=true] - Whether the listener should be passive
 */
export function addPassiveEventListener(element, eventType, handler, passive = true) {
  element.addEventListener(
    eventType,
    handler,
    passive ? { passive: true } : false
  );
}

/**
 * Remove passive touch listeners
 * @param {Element} element - The DOM element to remove listeners from
 * @param {string} eventType - The event type ('touchstart', 'touchmove', etc.)
 * @param {Function} handler - The event handler function
 * @param {boolean} [passive=true] - Whether the listener was passive
 */
export function removePassiveEventListener(element, eventType, handler, passive = true) {
  element.removeEventListener(
    eventType,
    handler,
    passive ? { passive: true } : false
  );
}

/**
 * Detect swipe gestures
 * @param {Object} startTouch - The starting touch position { x, y }
 * @param {Object} endTouch - The ending touch position { x, y }
 * @param {Object} [options] - Options for detection sensitivity
 * @returns {Object} Swipe detection results
 */
export function detectSwipe(startTouch, endTouch, options = {}) {
  const {
    minDistance = 50,
    maxTime = 300,
    threshold = 0.3
  } = options;
  
  // Calculate distances and directions
  const dx = endTouch.x - startTouch.x;
  const dy = endTouch.y - startTouch.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Determine horizontal vs vertical
  const isHorizontal = Math.abs(dx) > Math.abs(dy);
  
  // Determine direction
  let direction = null;
  
  if (isHorizontal) {
    direction = dx > 0 ? 'right' : 'left';
  } else {
    direction = dy > 0 ? 'down' : 'up';
  }
  
  return {
    distance,
    direction,
    isHorizontal,
    dx,
    dy,
    valid: distance >= minDistance
  };
}

/**
 * Add touch swipe detection to an element
 * @param {Element} element - The element to add swipe detection to
 * @param {Function} callback - The callback to call when a swipe is detected
 * @param {Object} [options] - Options for detection sensitivity
 * @returns {Object} Object with methods to remove listeners
 */
export function addSwipeDetection(element, callback, options = {}) {
  let startTouch = null;
  let startTime = 0;
  
  function handleTouchStart(event) {
    startTouch = getTouchPosition(event);
    startTime = Date.now();
  }
  
  function handleTouchEnd(event) {
    if (!startTouch) return;
    
    const endTouch = getTouchPosition(event);
    const endTime = Date.now();
    const timeElapsed = endTime - startTime;
    
    // Only consider as swipe if completed within max time
    if (timeElapsed <= (options.maxTime || 300)) {
      const swipeData = detectSwipe(startTouch, endTouch, options);
      
      // Add timing info
      swipeData.timeElapsed = timeElapsed;
      
      if (swipeData.valid) {
        callback(swipeData);
      }
    }
    
    // Reset
    startTouch = null;
  }
  
  function handleTouchCancel() {
    startTouch = null;
  }
  
  // Add event listeners
  addPassiveEventListener(element, 'touchstart', handleTouchStart);
  addPassiveEventListener(element, 'touchend', handleTouchEnd);
  addPassiveEventListener(element, 'touchcancel', handleTouchCancel);
  
  // Return object with cleanup method
  return {
    remove: () => {
      removePassiveEventListener(element, 'touchstart', handleTouchStart);
      removePassiveEventListener(element, 'touchend', handleTouchEnd);
      removePassiveEventListener(element, 'touchcancel', handleTouchCancel);
    }
  };
}

/**
 * Prevent page scrolling when interacting with an element
 * Useful for custom touch interactions where you don't want the page to scroll
 * @param {Element} element - The element to prevent scrolling on
 * @returns {Object} Object with methods to remove listeners
 */
export function preventScrollOnElement(element) {
  function handleTouchMove(event) {
    event.preventDefault();
  }
  
  // Add passive: false to ensure preventDefault works
  element.addEventListener('touchmove', handleTouchMove, { passive: false });
  
  return {
    remove: () => {
      element.removeEventListener('touchmove', handleTouchMove, { passive: false });
    }
  };
} 