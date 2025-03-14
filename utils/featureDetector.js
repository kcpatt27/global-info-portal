// Browser feature detection utility
export const featureDetector = {
  // Cache for test results
  cache: {},
  
  // Test if a feature is supported
  supports(feature) {
    // Return cached result if available
    if (this.cache[feature] !== undefined) {
      return this.cache[feature];
    }
    
    let supported = false;
    
    switch (feature) {
      case 'localStorage':
      case 'sessionStorage':
        try {
          const storage = window[feature];
          const testKey = '__test__';
          storage.setItem(testKey, '1');
          storage.removeItem(testKey);
          supported = true;
        } catch (e) {
          supported = false;
        }
        break;
        
      case 'geolocation':
        supported = !!navigator.geolocation;
        break;
        
      case 'svg':
        supported = !!document.createElementNS && 
                    !!document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect;
        break;
        
      case 'touch':
        supported = ('ontouchstart' in window) || 
                    (navigator.maxTouchPoints > 0) || 
                    (navigator.msMaxTouchPoints > 0);
        break;
        
      case 'webp':
        // This needs to be async, but we'll return a default for now
        // and update the cache when the test completes
        this.testWebP().then(result => {
          this.cache['webp'] = result;
        });
        supported = false; // Default until async check completes
        break;
        
      case 'webgl':
        try {
          const canvas = document.createElement('canvas');
          supported = !!(window.WebGLRenderingContext && 
                        (canvas.getContext('webgl') || 
                         canvas.getContext('experimental-webgl')));
        } catch (e) {
          supported = false;
        }
        break;
        
      case 'flexbox':
        supported = this.testFlexbox();
        break;
        
      case 'grid':
        supported = this.testCSS('grid-template-rows');
        break;
        
      case 'css-variables':
        supported = this.testCSS('--test-var');
        break;
        
      default:
        supported = false;
    }
    
    // Cache the result
    this.cache[feature] = supported;
    return supported;
  },
  
  // Test if WebP is supported
  async testWebP() {
    return new Promise(resolve => {
      const webPImg = new Image();
      webPImg.onload = function() {
        resolve(webPImg.height === 1);
      };
      webPImg.onerror = function() {
        resolve(false);
      };
      webPImg.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
    });
  },
  
  // Test flexbox support
  testFlexbox() {
    return this.testCSS('flexbox') || 
           this.testCSS('-webkit-flex') || 
           this.testCSS('-moz-flex') || 
           this.testCSS('-ms-flex');
  },
  
  // Test if a CSS property is supported
  testCSS(property) {
    const element = document.createElement('div');
    const ucProp = property.charAt(0).toUpperCase() + property.slice(1);
    const props = ['Webkit', 'Moz', 'O', 'ms'].map(prefix => prefix + ucProp);
    props.unshift(property);
    
    for (const p of props) {
      if (p in element.style) {
        return true;
      }
    }
    
    return false;
  },
  
  // Get browser info
  getBrowserInfo() {
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    let version = 'Unknown';
    
    // Detect browser
    if (ua.indexOf('Firefox') > -1) {
      browser = 'Firefox';
      version = ua.match(/Firefox\/([0-9.]+)/)[1];
    } else if (ua.indexOf('Chrome') > -1) {
      browser = 'Chrome';
      version = ua.match(/Chrome\/([0-9.]+)/)[1];
    } else if (ua.indexOf('Safari') > -1) {
      browser = 'Safari';
      version = ua.match(/Version\/([0-9.]+)/)[1];
    } else if (ua.indexOf('MSIE') > -1 || ua.indexOf('Trident') > -1) {
      browser = 'Internet Explorer';
      version = ua.match(/(?:MSIE |rv:)([0-9.]+)/)[1];
    } else if (ua.indexOf('Edge') > -1) {
      browser = 'Edge';
      version = ua.match(/Edge\/([0-9.]+)/)[1];
    }
    
    return {
      browser,
      version,
      isMobile: /Mobi|Android/i.test(ua),
      isTablet: /Tablet|iPad/i.test(ua)
    };
  }
}; 