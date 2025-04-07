# Device-Specific Optimizations

This directory contains CSS files and utilities for handling device-specific quirks and optimizations.

## Overview

Mobile devices (iOS and Android) have unique behaviors, bugs, and requirements that need specific handling. The files in this directory provide targeted solutions for:

1. iOS-specific issues (notches, safe areas, momentum scrolling)
2. Android fragmentation challenges (different behaviors across versions)
3. Platform-specific UI patterns and interactions

## Files

- **ios.css**: CSS optimizations specific to iOS devices
- **android.css**: CSS optimizations specific to Android devices
- **device-detection.js**: JavaScript utility to detect devices and add helper classes

## Implementation Details

### iOS Optimizations

The `ios.css` file handles:

- Safe area insets for notched iPhones
- Momentum scrolling fixes
- Fixed element positioning during keyboard appearance
- iOS-specific input and form styling
- Viewport height calculations (addressing the 100vh issue)
- Orientation changes

### Android Optimizations

The `android.css` file addresses:

- Android fragmentation across versions
- Material Design touch feedback (ripple effect)
- Android Chrome/WebView specific issues
- Screen size variability
- Android keyboard behavior
- Navigation bar considerations

### JavaScript Detection

The `device-detection.js` utility enhances CSS-based feature detection by:

1. Adding device-specific classes to the HTML/body elements
2. Detecting specific OS versions
3. Handling orientation changes
4. Managing keyboard appearance events
5. Providing hardware-specific optimizations

## Usage Guidelines

### CSS Feature Detection

Both CSS files use feature detection at their root level:

```css
/* iOS detection */
@supports (-webkit-touch-callout: none) {
  /* iOS-specific styles */
}

/* Android detection */
@supports (-webkit-overflow-scrolling: touch) and (not (-webkit-touch-callout: none)) {
  /* Android-specific styles */
}
```

This approach ensures styles only apply to the intended platforms.

### JavaScript Class Hooks

The JavaScript utility adds classes that can be targeted in CSS:

- `.ios-device` - Any iOS device
- `.android-device` - Any Android device
- `.ios-notch` - Notched iPhones
- `.has-android-navigation-bar` - Android with navigation bar
- `.tablet-device` / `.phone-device` - Device type
- `.portrait` / `.landscape` - Current orientation
- `.keyboard-active` / `.keyboard-open` - When keyboard is visible

### Integration

These files are automatically loaded through the main CSS, but the feature detection ensures they only apply to relevant devices.

The JavaScript file should be included in the main HTML, preferably in the head with defer attribute:

```html
<script src="css-styles/devices/device-detection.js" defer></script>
```

## Testing Recommendations

When testing these optimizations:

1. Use actual devices when possible, not just emulators
2. Test on multiple iOS versions (11+, 12+, 13+, 14+)
3. Test on various Android devices (Samsung, Google, etc.)
4. Verify behavior in different orientations
5. Test interactions with the on-screen keyboard
6. Check behavior with notched devices 