/**
 * Map Gesture Handling Module
 * Adds touch and gesture support for the interactive map
 */

import { 
  initializeGestures,
  addPinchHandler,
  addPanHandler,
  addTapHandler,
  addSwipeHandler,
  preventDefaultTouchActions,
  GestureType
} from '../../utils/gestures.js';

import { selectCountryById, resetZoom } from '../../map.js';

/**
 * Initialize gesture handling for the map
 * @param {Object} mapInstance - The map instance from map.js
 * @param {Object} options - Additional options for configuring gestures
 */
export function initMapGestures(mapInstance, options = {}) {
  // Ensure we have a valid map instance
  if (!mapInstance) {
    console.error('Map instance is required for gesture initialization');
    return;
  }
  
  const mapElement = document.querySelector('.map-container');
  const svgElement = mapElement ? mapElement.querySelector('svg') : null;
  
  if (!mapElement || !svgElement) {
    console.error('Map container or SVG element not found');
    return;
  }
  
  console.log('Initializing map gestures');
  
  // Initialize gesture system
  const gestureManager = initializeGestures({
    pinchThreshold: 5,
    panThreshold: 8
  });
  
  // Keep track of the current transform state
  let currentTransform = {
    scale: 1,
    translateX: 0,
    translateY: 0,
    rotation: 0
  };
  
  // Set up touch-friendly attributes on the map
  svgElement.style.touchAction = 'none';  // Disable browser handling of touch gestures
  
  // Add pinch-to-zoom handling
  addPinchHandler(svgElement, (event) => {
    const { scale, center } = event;
    
    // Update scale, respecting the minimum and maximum zoom levels
    const newScale = Math.max(
      mapInstance.mapConfig.zoomMin, 
      Math.min(mapInstance.mapConfig.zoomMax, currentTransform.scale * scale)
    );
    
    // Apply the transformation with the pinch center as the origin
    applyTransform(svgElement, {
      ...currentTransform,
      scale: newScale
    }, center);
    
    // Update current transform
    currentTransform.scale = newScale;
    
    // Prevent default browser pinch zoom
    if (event.originalEvent) {
      event.originalEvent.preventDefault();
    }
  }, { preventDefault: true });
  
  // Add pan handling for dragging the map
  addPanHandler(svgElement, (event) => {
    const { deltaX, deltaY } = event;
    
    // Only handle pan if we've zoomed in
    if (currentTransform.scale > 1) {
      // Calculate new translation
      const newTranslateX = currentTransform.translateX + deltaX;
      const newTranslateY = currentTransform.translateY + deltaY;
      
      // Apply the transformation
      applyTransform(svgElement, {
        ...currentTransform,
        translateX: newTranslateX,
        translateY: newTranslateY
      });
      
      // Update current transform
      currentTransform.translateX = newTranslateX;
      currentTransform.translateY = newTranslateY;
    }
  }, { preventDefault: false });  // Don't prevent default to allow scrolling
  
  // Add double-tap to reset zoom
  let lastTapTime = 0;
  addTapHandler(svgElement, (event) => {
    const now = Date.now();
    const timeDiff = now - lastTapTime;
    
    if (timeDiff < 300) {  // Double-tap detected
      // Reset zoom and transform
      resetMapTransform();
      
      // Call the existing resetZoom function
      if (typeof resetZoom === 'function') {
        resetZoom();
      }
    }
    
    lastTapTime = now;
  });
  
  // Add swipe handling for navigation between countries
  addSwipeHandler(mapElement, (event) => {
    // Only handle left/right swipes when not zoomed in
    if (currentTransform.scale <= 1) {
      if (event.direction === 'left') {
        navigateCountries('next');
      } else if (event.direction === 'right') {
        navigateCountries('prev');
      }
    }
  });
  
  /**
   * Apply transform to SVG element
   * @param {SVGElement} svg - The SVG element to transform
   * @param {Object} transform - The transform parameters 
   * @param {Object} origin - Optional origin point for scaling
   */
  function applyTransform(svg, transform, origin) {
    const { scale, translateX, translateY, rotation } = transform;
    
    // Adjust transform origin based on pinch center if provided
    let originX = svg.width.baseVal.value / 2;
    let originY = svg.height.baseVal.value / 2;
    
    if (origin) {
      originX = origin.x;
      originY = origin.y;
    }
    
    // Apply the transform with proper origin handling
    const transformList = svg.transform.baseVal;
    const transformMatrix = svg.createSVGTransform().matrix;
    transformMatrix.e = translateX;
    transformMatrix.f = translateY;
    
    // Create a new transform with scaling at the origin
    const newTransform = svg.createSVGTransform();
    newTransform.setMatrix(transformMatrix);
    
    // Clear existing transforms and add the new one
    transformList.clear();
    transformList.appendItem(newTransform);
    
    // Apply scaling to the content group if available
    const contentGroup = svg.querySelector('g');
    if (contentGroup) {
      const groupTransform = contentGroup.transform.baseVal;
      const scaleTransform = svg.createSVGTransform();
      
      // Set up transform with proper origin
      scaleTransform.setTranslate(originX, originY);
      const scaleMatrix = svg.createSVGTransform();
      scaleMatrix.setScale(scale, scale);
      
      // Translate back from origin
      const translateBackTransform = svg.createSVGTransform();
      translateBackTransform.setTranslate(-originX, -originY);
      
      // Apply transforms in order
      groupTransform.clear();
      groupTransform.appendItem(scaleTransform);
      groupTransform.appendItem(scaleMatrix);
      groupTransform.appendItem(translateBackTransform);
    }
  }
  
  /**
   * Reset map transform to initial state
   */
  function resetMapTransform() {
    currentTransform = {
      scale: 1,
      translateX: 0,
      translateY: 0,
      rotation: 0
    };
    
    // Apply identity transform to SVG
    const svg = svgElement;
    const transformList = svg.transform.baseVal;
    transformList.clear();
    
    // Reset content group transform
    const contentGroup = svg.querySelector('g');
    if (contentGroup) {
      contentGroup.transform.baseVal.clear();
    }
  }
  
  /**
   * Navigate between countries
   * @param {string} direction - 'next' or 'prev'
   */
  function navigateCountries(direction) {
    const countries = document.querySelectorAll('.country');
    if (!countries.length) return;
    
    const countryArray = Array.from(countries);
    const currentSelected = document.querySelector('.country.selected');
    
    if (!currentSelected) {
      // If no country is selected, select the first one
      if (countryArray.length) {
        const firstCountry = countryArray[0];
        selectCountryById(firstCountry.getAttribute('data-id'));
      }
      return;
    }
    
    // Find the index of the current selected country
    const currentIndex = countryArray.findIndex(country => 
      country.getAttribute('data-id') === currentSelected.getAttribute('data-id')
    );
    
    // Calculate next index based on direction
    let nextIndex;
    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % countryArray.length;
    } else {
      nextIndex = (currentIndex - 1 + countryArray.length) % countryArray.length;
    }
    
    // Select the next country
    const nextCountry = countryArray[nextIndex];
    selectCountryById(nextCountry.getAttribute('data-id'));
  }
  
  // Return public API
  return {
    resetMapTransform,
    navigateCountries
  };
} 