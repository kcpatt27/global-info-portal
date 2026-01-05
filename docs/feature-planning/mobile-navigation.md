# Mobile Navigation Patterns

This document describes the mobile navigation patterns implemented in the 2D Global Info Portal, including the bottom navigation bar and hamburger menu.

## Overview

The mobile navigation system provides two primary navigation patterns:

1. **Bottom Navigation Bar**: A fixed navigation bar at the bottom of the screen with quick access to common actions
2. **Hamburger Menu**: An expandable menu with more detailed navigation options

These patterns are implemented using a combination of JavaScript and CSS, and are only activated on mobile devices or when the viewport width is less than 768px.

## Implementation Details

### Files Structure

- `js/components/navigation/MobileNav.js`: Main JavaScript component that handles mobile navigation logic
- `css-styles/navigation/mobile.css`: Styles for mobile navigation elements
- `js/utils/touch.js`: Utility functions for touch detection and handling

### Features

- **Responsive Design**: Navigation only appears on mobile devices or small viewports
- **Bottom Navigation Bar**:
  - Fixed position at the bottom of the screen
  - Contains quick access icons for common actions
  - Automatically hides when scrolling down (to maximize screen space)
  - Reappears when scrolling up
- **Hamburger Menu**:
  - Accessible via the "More" button in the bottom navigation
  - Full-screen overlay menu with extended navigation options
  - Organized into sections for better usability
  - Includes dividers for visual separation
- **Touch Optimized**:
  - Large tap targets for better usability on touch devices
  - Smooth animations for feedback
  - Supports passive event listeners for better performance

## Usage

### Basic Initialization

The mobile navigation is automatically initialized on mobile devices through the main.js file. No additional steps are required for basic usage.

### Custom Configuration

To customize the mobile navigation, you can pass configuration options when initializing:

```javascript
import { initMobileNav } from './components/navigation/MobileNav.js';

const mobileNav = initMobileNav({
  // Selectors
  containerSelector: '.custom-nav-container',
  
  // Options
  hideOnScroll: true,
  threshold: 30, // Scroll threshold to hide navigation
  
  // Callbacks
  onNavItemClick: (navId, element) => {
    // Custom navigation handling
    console.log(`Nav item clicked: ${navId}`);
  },
  onHamburgerOpen: () => {
    // Custom handler when hamburger menu opens
  },
  onHamburgerClose: () => {
    // Custom handler when hamburger menu closes
  }
});
```

### Available Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `containerSelector` | string | '.mobile-nav-container' | Selector for the container element |
| `bottomNavSelector` | string | '.mobile-nav-bar' | Selector for the bottom navigation bar |
| `navItemSelector` | string | '.mobile-nav-item' | Selector for navigation items |
| `hamburgerToggleSelector` | string | '.hamburger-menu-toggle' | Selector for hamburger toggle button |
| `hamburgerPanelSelector` | string | '.hamburger-menu-panel' | Selector for hamburger panel |
| `hamburgerOverlaySelector` | string | '.hamburger-menu-overlay' | Selector for hamburger overlay |
| `hamburgerItemSelector` | string | '.hamburger-menu-link' | Selector for hamburger menu items |
| `threshold` | number | 20 | Scroll threshold to hide/show navigation |
| `hideOnScroll` | boolean | true | Whether to auto-hide on scroll down |
| `navActiveClass` | string | 'active' | Class to add to active navigation elements |
| `navHiddenClass` | string | 'hidden' | Class to add when navigation is hidden |
| `onNavItemClick` | function | null | Callback when a navigation item is clicked |
| `onHamburgerOpen` | function | null | Callback when hamburger menu is opened |
| `onHamburgerClose` | function | null | Callback when hamburger menu is closed |

## Manually Controlling the Navigation

The MobileNav class provides various methods for programmatically controlling the navigation:

```javascript
// Get the instance (if it was created in main.js)
const mobileNav = window.mobileNavInstance;

// Open hamburger menu
mobileNav.openHamburgerMenu();

// Close hamburger menu
mobileNav.closeHamburgerMenu();

// Show navigation bar (if it was hidden)
mobileNav.showNavigation();

// Hide navigation bar
mobileNav.hideNavigation();

// Navigate to a specific section
mobileNav.navigateTo('data');
```

## HTML Structure

The MobileNav component will create the necessary HTML structure if it doesn't already exist. The generated structure looks like this:

```html
<!-- Bottom Navigation Bar -->
<div class="mobile-nav-container">
  <div class="mobile-nav-bar">
    <a href="#home" class="mobile-nav-item" data-nav-id="home">
      <i class="nav-icon fas fa-home"></i>
      <span class="nav-text">Home</span>
    </a>
    <!-- More navigation items -->
  </div>
</div>

<!-- Hamburger Menu -->
<button class="hamburger-menu-toggle" aria-label="Toggle menu">
  <div class="hamburger-icon">
    <span></span>
    <span></span>
    <span></span>
    <span></span>
  </div>
</button>

<div class="hamburger-menu-panel">
  <ul class="hamburger-menu-items">
    <li class="hamburger-menu-section">Navigation</li>
    <li class="hamburger-menu-item">
      <a href="#map" class="hamburger-menu-link" data-nav-id="map">
        <i class="fas fa-map"></i>
        World Map
      </a>
    </li>
    <!-- More menu items -->
  </ul>
</div>

<div class="hamburger-menu-overlay"></div>
```

## Accessibility Considerations

- The navigation components include proper ARIA attributes for screen readers
- Touch targets meet minimum size requirements (48px)
- Color contrast is maintained for text readability
- Navigation elements have appropriate focus states
- The hamburger menu can be closed by clicking the overlay (for easy dismissal)

## Browser Compatibility

The mobile navigation patterns are compatible with:

- Chrome (latest)
- Safari (latest)
- Firefox (latest)
- Edge (latest)
- iOS Safari (latest)
- Chrome for Android (latest)

## Performance Considerations

- Passive event listeners are used for scroll handling to prevent jank
- CSS animations are used instead of JavaScript where possible
- The navigation component is only loaded and initialized on mobile devices
- Transforms and opacity are used for animations to leverage GPU acceleration 