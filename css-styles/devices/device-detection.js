/**
 * Device Detection Utility
 * Detects specific devices and adds appropriate classes to the HTML/body elements
 * This enhances our CSS targeting capabilities beyond feature detection
 */

(function() {
  // Wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', function() {
    const html = document.documentElement;
    const body = document.body;
    
    // Detect iOS devices
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    // Detect Android devices
    const isAndroid = /Android/.test(navigator.userAgent);
    
    // Detect specific iOS versions
    const iOSVersion = (function() {
      if (/iP(hone|od|ad)/.test(navigator.userAgent)) {
        const v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
        return [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || 0, 10)];
      }
      return null;
    })();
    
    // Detect specific Android versions
    const androidVersion = (function() {
      const match = navigator.userAgent.toLowerCase().match(/android\s([0-9.]*)/);
      return match ? parseFloat(match[1]) : null;
    })();
    
    // Apply device-specific classes
    if (isIOS) {
      html.classList.add('ios-device');
      body.classList.add('ios-device');
      
      // Add specific iOS version classes
      if (iOSVersion) {
        html.classList.add(`ios-${iOSVersion[0]}`);
        
        // Detect notched devices (iPhone X and newer)
        const isNotchedIphone = 
          // iPhone X detection via aspect ratio
          (window.innerWidth / window.innerHeight).toFixed(2) === '0.46' || 
          // Alternative detection - check for iOS 11+ with proper aspect ratio
          (iOSVersion[0] >= 11 && window.innerWidth === 375 && (window.innerHeight === 812 || window.innerHeight === 896));
          
        if (isNotchedIphone) {
          html.classList.add('ios-notch');
          body.classList.add('has-notch');
        }
      }
      
      // Handle iOS keyboard events
      document.addEventListener('focusin', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
          body.classList.add('keyboard-active');
        }
      });
      
      document.addEventListener('focusout', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
          body.classList.remove('keyboard-active');
        }
      });
    }
    
    if (isAndroid) {
      html.classList.add('android-device');
      body.classList.add('android-device');
      
      // Add specific Android version classes
      if (androidVersion) {
        const majorVersion = Math.floor(androidVersion);
        html.classList.add(`android-${majorVersion}`);
        
        // Handle Android 8.0+ (API level 26+) specific features
        if (androidVersion >= 8) {
          html.classList.add('android-oreo-plus');
        }
        
        // Handle older Android versions that may have more quirks
        if (androidVersion < 5) {
          html.classList.add('android-legacy');
        }
      }
      
      // Detect if device likely has a navigation bar
      if (window.innerHeight / window.innerWidth < 1.8) {
        body.classList.add('has-android-navigation-bar');
      }
      
      // Handle Android keyboard events
      const originalHeight = window.innerHeight;
      window.addEventListener('resize', function() {
        if (window.innerHeight < originalHeight * 0.8) {
          body.classList.add('keyboard-open');
        } else {
          body.classList.remove('keyboard-open');
        }
      });
    }
    
    // Detect tablets
    const isTablet = (function() {
      return /iPad/.test(navigator.userAgent) || 
        (isAndroid && !/Mobile/.test(navigator.userAgent)) ||
        window.innerWidth >= 768;
    })();
    
    if (isTablet) {
      html.classList.add('tablet-device');
      body.classList.add('tablet-device');
    } else {
      html.classList.add('phone-device');
      body.classList.add('phone-device');
    }
    
    // Handle orientation changes
    const updateOrientation = function() {
      if (window.innerHeight > window.innerWidth) {
        html.classList.remove('landscape');
        html.classList.add('portrait');
      } else {
        html.classList.remove('portrait');
        html.classList.add('landscape');
      }
    };
    
    // Initial orientation detection
    updateOrientation();
    
    // Listen for orientation changes
    window.addEventListener('orientationchange', updateOrientation);
    window.addEventListener('resize', updateOrientation);
    
    // Detect high-DPI displays
    if (window.devicePixelRatio >= 2) {
      html.classList.add('high-dpi');
    }
    
    // Fix viewport issues for both iOS and Android
    if (isIOS || isAndroid) {
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover');
      }
      
      // Add a class when content is scrollable
      const detectScrollable = function() {
        if (document.body.scrollHeight > window.innerHeight) {
          body.classList.add('content-scrollable');
        } else {
          body.classList.remove('content-scrollable');
        }
      };
      
      // Run on load and resize
      detectScrollable();
      window.addEventListener('resize', detectScrollable);
    }
  });
})(); 