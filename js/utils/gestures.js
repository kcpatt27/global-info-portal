/**
 * Gesture Handling and Normalization Layer
 * Provides a unified API for gesture detection across different devices and browsers
 * Extends the basic touch interactions from touch.js
 */

import { isTouchDevice, addTapHandler, addSwipeHandler, addLongPressHandler } from './touch.js';

/**
 * Available gesture types that can be detected
 * @enum {string}
 */
export const GestureType = {
  SWIPE: 'swipe',
  SWIPE_UP: 'swipe-up',
  SWIPE_DOWN: 'swipe-down',
  SWIPE_LEFT: 'swipe-left',
  SWIPE_RIGHT: 'swipe-right',
  PINCH: 'pinch',
  PINCH_IN: 'pinch-in',
  PINCH_OUT: 'pinch-out',
  ROTATE: 'rotate',
  TAP: 'tap',
  DOUBLE_TAP: 'double-tap',
  LONG_PRESS: 'long-press',
  PAN: 'pan'
};

/**
 * Gesture manager to handle registration and tracking of gesture handlers
 */
class GestureManager {
  constructor() {
    this.handlers = new Map();
    this.activeGestures = new Set();
    this.touchPoints = [];
    this.initialDistance = 0;
    this.initialAngle = 0;
    this.isGestureActive = false;
    this.isTouchDevice = isTouchDevice();
    
    // Config for gesture detection
    this.config = {
      pinchThreshold: 10,      // Minimum distance change for pinch (px)
      rotateThreshold: 15,     // Minimum angle change for rotate (degrees)
      panThreshold: 10,        // Minimum distance for pan (px)
      preventDefaultEvents: ['pinch', 'rotate'], // Gestures that should prevent default browser actions
      passiveEvents: ['pan', 'swipe']  // Gestures that can be passive (don't prevent default)
    };
  }
  
  /**
   * Initialize the gesture manager
   * @param {Object} options - Configuration options to override defaults
   */
  initialize(options = {}) {
    this.config = { ...this.config, ...options };
    
    if (this.isTouchDevice) {
      // Set up touch event listeners
      document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
      document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
      document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
      document.addEventListener('touchcancel', this.handleTouchEnd.bind(this), { passive: false });
    }
    
    // Set up mouse event listeners for non-touch devices
    document.addEventListener('mousedown', this.handleMouseDown.bind(this));
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    
    console.log('Gesture manager initialized');
  }
  
  /**
   * Register a handler for a specific gesture on a target element
   * @param {HTMLElement} target - The target element to attach the gesture to
   * @param {GestureType} gestureType - The type of gesture to detect
   * @param {Function} handler - The callback function when gesture is detected
   * @param {Object} options - Additional options for the gesture
   * @returns {Function} A function to remove the gesture handler
   */
  addGestureHandler(target, gestureType, handler, options = {}) {
    if (!target || !gestureType || !handler) {
      console.error('Missing required parameters for addGestureHandler');
      return () => {};
    }
    
    const id = this.generateHandlerId(target, gestureType);
    
    // Store the handler with its options
    this.handlers.set(id, {
      target,
      type: gestureType,
      handler,
      options: {
        ...options,
        preventDefault: options.preventDefault ?? this.config.preventDefaultEvents.includes(gestureType)
      }
    });
    
    // For certain basic gestures, use the existing touch.js handlers
    switch (gestureType) {
      case GestureType.TAP:
        addTapHandler(target, (e) => this.executeHandler(id, e));
        break;
        
      case GestureType.SWIPE:
      case GestureType.SWIPE_UP:
      case GestureType.SWIPE_DOWN:
      case GestureType.SWIPE_LEFT:
      case GestureType.SWIPE_RIGHT:
        addSwipeHandler(target, (e) => {
          // Only trigger if it matches the specific swipe direction
          if (gestureType === GestureType.SWIPE || 
             (gestureType === GestureType.SWIPE_UP && e.direction === 'up') ||
             (gestureType === GestureType.SWIPE_DOWN && e.direction === 'down') ||
             (gestureType === GestureType.SWIPE_LEFT && e.direction === 'left') ||
             (gestureType === GestureType.SWIPE_RIGHT && e.direction === 'right')) {
            this.executeHandler(id, e);
          }
        });
        break;
        
      case GestureType.LONG_PRESS:
        addLongPressHandler(target, (e) => this.executeHandler(id, e));
        break;
        
      // Other gestures are handled by our custom detection in touch/mouse events
    }
    
    // Return a function to remove this handler
    return () => this.removeGestureHandler(id);
  }
  
  /**
   * Remove a specific gesture handler
   * @param {string} id - The handler ID to remove
   */
  removeGestureHandler(id) {
    this.handlers.delete(id);
  }
  
  /**
   * Generate a unique ID for a handler
   * @param {HTMLElement} target - The target element
   * @param {GestureType} type - The gesture type
   * @returns {string} A unique ID
   */
  generateHandlerId(target, type) {
    return `${target.id || Math.random().toString(36).substring(2)}_${type}_${Date.now()}`;
  }
  
  /**
   * Execute a handler with the gesture data
   * @param {string} id - The handler ID
   * @param {Object} data - The gesture event data
   */
  executeHandler(id, data) {
    const handlerInfo = this.handlers.get(id);
    if (handlerInfo) {
      // Create a normalized gesture event
      const gestureEvent = this.createGestureEvent(handlerInfo.type, data);
      
      // Execute the handler with the event
      handlerInfo.handler(gestureEvent);
      
      // Prevent default if configured
      if (handlerInfo.options.preventDefault && data.originalEvent) {
        data.originalEvent.preventDefault();
      }
    }
  }
  
  /**
   * Create a normalized gesture event object
   * @param {GestureType} type - The gesture type
   * @param {Object} data - The original event data
   * @returns {Object} A normalized gesture event
   */
  createGestureEvent(type, data) {
    return {
      type,
      target: data.target || null,
      originalEvent: data.originalEvent || null,
      center: data.center || { x: 0, y: 0 },
      deltaX: data.deltaX || 0,
      deltaY: data.deltaY || 0,
      velocity: data.velocity || 0,
      direction: data.direction || null,
      scale: data.scale || 1,
      rotation: data.rotation || 0,
      pointerType: this.isTouchDevice ? 'touch' : 'mouse',
      isFirst: data.isFirst || false,
      isFinal: data.isFinal || false,
      timestamp: Date.now()
    };
  }
  
  /**
   * Handle touch start events
   * @param {TouchEvent} e - The touch event
   */
  handleTouchStart(e) {
    this.touchPoints = Array.from(e.touches).map(touch => ({
      id: touch.identifier,
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now()
    }));
    
    if (this.touchPoints.length === 2) {
      // Store initial distance and angle for pinch/rotate detection
      this.initialDistance = this.getDistance(this.touchPoints[0], this.touchPoints[1]);
      this.initialAngle = this.getAngle(this.touchPoints[0], this.touchPoints[1]);
    }
    
    // Find the correct target element and handlers
    const element = e.target;
    
    // Check for relevant handlers on this element or its ancestors
    for (const [id, handlerInfo] of this.handlers.entries()) {
      if (element === handlerInfo.target || element.closest(`#${handlerInfo.target.id}`)) {
        if ([GestureType.PINCH, GestureType.ROTATE, GestureType.PAN].includes(handlerInfo.type)) {
          this.activeGestures.add(id);
        }
      }
    }
  }
  
  /**
   * Handle touch move events
   * @param {TouchEvent} e - The touch event
   */
  handleTouchMove(e) {
    if (this.touchPoints.length === 0) return;
    
    // Update touch points
    const currentTouchPoints = Array.from(e.touches).map(touch => ({
      id: touch.identifier,
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now()
    }));
    
    // Calculate deltas and detect gestures
    if (currentTouchPoints.length === 2 && this.touchPoints.length === 2) {
      const currentDistance = this.getDistance(currentTouchPoints[0], currentTouchPoints[1]);
      const currentAngle = this.getAngle(currentTouchPoints[0], currentTouchPoints[1]);
      
      const deltaDistance = currentDistance - this.initialDistance;
      const deltaAngle = currentAngle - this.initialAngle;
      
      // Detect pinch gesture
      if (Math.abs(deltaDistance) > this.config.pinchThreshold) {
        const pinchType = deltaDistance > 0 ? GestureType.PINCH_OUT : GestureType.PINCH_IN;
        
        // Find and execute pinch handlers
        for (const id of this.activeGestures) {
          const handlerInfo = this.handlers.get(id);
          if (handlerInfo && (handlerInfo.type === GestureType.PINCH || handlerInfo.type === pinchType)) {
            this.executeHandler(id, {
              originalEvent: e,
              target: e.target,
              scale: currentDistance / this.initialDistance,
              center: {
                x: (currentTouchPoints[0].x + currentTouchPoints[1].x) / 2,
                y: (currentTouchPoints[0].y + currentTouchPoints[1].y) / 2
              }
            });
            
            // Prevent default on pinch to avoid browser zoom
            if (handlerInfo.options.preventDefault) {
              e.preventDefault();
            }
          }
        }
      }
      
      // Detect rotate gesture
      if (Math.abs(deltaAngle) > this.config.rotateThreshold) {
        // Find and execute rotate handlers
        for (const id of this.activeGestures) {
          const handlerInfo = this.handlers.get(id);
          if (handlerInfo && handlerInfo.type === GestureType.ROTATE) {
            this.executeHandler(id, {
              originalEvent: e,
              target: e.target,
              rotation: deltaAngle,
              center: {
                x: (currentTouchPoints[0].x + currentTouchPoints[1].x) / 2,
                y: (currentTouchPoints[0].y + currentTouchPoints[1].y) / 2
              }
            });
            
            // Prevent default on rotate
            if (handlerInfo.options.preventDefault) {
              e.preventDefault();
            }
          }
        }
      }
    }
    
    // Detect pan gesture with single touch
    if (currentTouchPoints.length === 1 && this.touchPoints.length === 1) {
      const deltaX = currentTouchPoints[0].x - this.touchPoints[0].x;
      const deltaY = currentTouchPoints[0].y - this.touchPoints[0].y;
      
      if (Math.abs(deltaX) > this.config.panThreshold || Math.abs(deltaY) > this.config.panThreshold) {
        // Find and execute pan handlers
        for (const id of this.activeGestures) {
          const handlerInfo = this.handlers.get(id);
          if (handlerInfo && handlerInfo.type === GestureType.PAN) {
            this.executeHandler(id, {
              originalEvent: e,
              target: e.target,
              deltaX,
              deltaY,
              center: {
                x: currentTouchPoints[0].x,
                y: currentTouchPoints[0].y
              }
            });
          }
        }
      }
    }
    
    // Update touch points for next move event
    this.touchPoints = currentTouchPoints;
  }
  
  /**
   * Handle touch end events
   * @param {TouchEvent} e - The touch event
   */
  handleTouchEnd(e) {
    // Clear touch tracking
    this.touchPoints = [];
    this.activeGestures.clear();
    this.isGestureActive = false;
  }
  
  /**
   * Handle mouse down events
   * @param {MouseEvent} e - The mouse event
   */
  handleMouseDown(e) {
    // Store mouse start position
    this.touchPoints = [{
      id: 'mouse',
      x: e.clientX,
      y: e.clientY,
      timestamp: Date.now()
    }];
    
    // Similar logic to touchstart for finding handlers
    const element = e.target;
    
    // Check for relevant handlers on this element or its ancestors
    for (const [id, handlerInfo] of this.handlers.entries()) {
      if (element === handlerInfo.target || element.closest(`#${handlerInfo.target.id}`)) {
        if (handlerInfo.type === GestureType.PAN) {
          this.activeGestures.add(id);
        }
      }
    }
  }
  
  /**
   * Handle mouse move events
   * @param {MouseEvent} e - The mouse event
   */
  handleMouseMove(e) {
    if (this.touchPoints.length === 0) return;
    
    const deltaX = e.clientX - this.touchPoints[0].x;
    const deltaY = e.clientY - this.touchPoints[0].y;
    
    // Detect pan gesture
    if (Math.abs(deltaX) > this.config.panThreshold || Math.abs(deltaY) > this.config.panThreshold) {
      // Find and execute pan handlers
      for (const id of this.activeGestures) {
        const handlerInfo = this.handlers.get(id);
        if (handlerInfo && handlerInfo.type === GestureType.PAN) {
          this.executeHandler(id, {
            originalEvent: e,
            target: e.target,
            deltaX,
            deltaY,
            center: {
              x: e.clientX,
              y: e.clientY
            }
          });
        }
      }
    }
  }
  
  /**
   * Handle mouse up events
   * @param {MouseEvent} e - The mouse event
   */
  handleMouseUp(e) {
    // Clear mouse tracking
    this.touchPoints = [];
    this.activeGestures.clear();
    this.isGestureActive = false;
  }
  
  /**
   * Calculate distance between two points
   * @param {Object} p1 - First point with x, y coordinates
   * @param {Object} p2 - Second point with x, y coordinates
   * @returns {number} The distance between the points
   */
  getDistance(p1, p2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  /**
   * Calculate angle between two points in degrees
   * @param {Object} p1 - First point with x, y coordinates
   * @param {Object} p2 - Second point with x, y coordinates
   * @returns {number} The angle in degrees
   */
  getAngle(p1, p2) {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
  }
}

// Create and export the gesture manager singleton
export const gestureManager = new GestureManager();

// Convenience functions for adding gesture handlers
export const addPinchHandler = (target, handler, options) => {
  return gestureManager.addGestureHandler(target, GestureType.PINCH, handler, options);
};

export const addPinchInHandler = (target, handler, options) => {
  return gestureManager.addGestureHandler(target, GestureType.PINCH_IN, handler, options);
};

export const addPinchOutHandler = (target, handler, options) => {
  return gestureManager.addGestureHandler(target, GestureType.PINCH_OUT, handler, options);
};

export const addRotateHandler = (target, handler, options) => {
  return gestureManager.addGestureHandler(target, GestureType.ROTATE, handler, options);
};

export const addPanHandler = (target, handler, options) => {
  return gestureManager.addGestureHandler(target, GestureType.PAN, handler, options);
};

// Re-export the touch.js handlers for convenience
export { 
  addTapHandler, 
  addSwipeHandler, 
  addLongPressHandler 
} from './touch.js';

/**
 * Helper to prevent default on touch actions for an element
 * @param {HTMLElement} element - The element to prevent default touch actions
 */
export const preventDefaultTouchActions = (element) => {
  if (!element) return;
  
  // Prevent default touch actions like pinch zoom
  element.style.touchAction = 'none';
  // Add listener to prevent default on touch events
  element.addEventListener('touchstart', e => e.preventDefault(), { passive: false });
  element.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
};

/**
 * Helper to add passive touch actions for an element (for better scrolling)
 * @param {HTMLElement} element - The element to allow passive touch actions
 */
export const addPassiveTouchActions = (element) => {
  if (!element) return;
  
  // Allow pan-y for vertical scrolling
  element.style.touchAction = 'pan-y';
  // Add passive listeners for better scroll performance
  element.addEventListener('touchstart', () => {}, { passive: true });
  element.addEventListener('touchmove', () => {}, { passive: true });
};

/**
 * Initialize the gesture system
 * @param {Object} options - Configuration options
 */
export const initializeGestures = (options = {}) => {
  gestureManager.initialize(options);
  return gestureManager;
}; 