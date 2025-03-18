# CSS Reference Guide

This document provides CSS reference snippets and patterns for consistent implementation across the Global Information Portal project. All design tokens are defined in [core/variables.css](../core/variables.css) and are used throughout the project for colors, spacing, typography, transitions, and more.

---

## Core Tokens and Variables

All foundational values such as colors, spacing, typography, transitions, and shadows are defined in the variables file. For example:

```css
:root {
  /* Animation timing */
  --animation-speed-fast: var(--transition-fast);
  --animation-speed-medium: var(--transition-medium);
  --animation-speed-slow: var(--transition-slow);
  
  /* Easing functions */
  --easing-standard: var(--easing-standard);
  --easing-smooth: var(--easing-smooth);
  --easing-bounce: var(--easing-bounce);
}
```

---

## Common Animation Patterns

### Fade Animations

```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeOut {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-10px); }
}

.stat-transition-in {
  animation: fadeIn var(--animation-speed-medium) var(--easing-standard) forwards;
}

.stat-transition-out {
  animation: fadeOut var(--animation-speed-medium) var(--easing-standard) forwards;
}
```

---

## Layout Patterns

### Sidebar Animation

```css
.info-container {
    background-color: var(--color-sidebar-bg);
    padding: 20px;
    overflow-y: auto;
    position: relative;
    transition: transform var(--transition-slow) var(--easing-standard),
                opacity var(--transition-slow) var(--easing-standard),
                width var(--transition-slow) var(--easing-standard);
    box-shadow: -5px 0 15px rgba(0, 0, 0, 0.2);
}

.info-container.collapsed {
    transform: translateX(100%);
    opacity: 0;
}
```

---

## Chart Styles

The chart components leverage tokens for spacing, typography, and transitions to maintain a consistent visual language. For example:

```css
.chart {
  display: none;
  padding: var(--space-md);
  transition: opacity var(--transition-chart) ease;
  background-color: var(--color-chart-bg);
  border: 1px solid var(--color-border);
  border-top: none;
  border-radius: 0 0 var(--radius-small) var(--radius-small);
  opacity: 0;
  width: 100%;
  position: relative;
  top: -1px;
}

.chart.active {
  display: block;
  opacity: 1;
  animation: fadeIn var(--transition-chart) ease-in-out;
}

/* Chart content elements */
.data-title {
  font-size: var(--font-size-chart-title);
  font-weight: bold;
  margin-bottom: var(--space-md);
  text-align: center;
  color: var(--color-text-primary);
}

.data-value {
  font-size: var(--font-size-chart-value);
  font-weight: bold;
  margin: var(--space-md) 0;
  text-align: center;
  color: var(--color-text-primary);
}
```

Responsive adjustments also use our tokens to ensure the charts adapt gracefully on smaller screens.

---

## Map Styles

Map components follow the same token-driven approach. For example, the country shapes in the map are styled as:

```css
.map-container svg {
    width: 100%;
    height: 100%;
    transition: all var(--transition-medium) var(--easing-standard);
    background-color: var(--color-map-background);
}

.country {
    fill: var(--color-map-country);
    stroke: var(--color-map-stroke);
    stroke-width: var(--color-map-stroke-width);
    cursor: pointer;
    transition: fill var(--transition-fast) var(--easing-standard), stroke var(--transition-fast) var(--easing-standard);
}

.country:hover {
    fill: var(--color-map-country-hover);
    stroke-width: var(--color-map-stroke-width-hover);
}

.country.selected {
    fill: var(--color-map-country-selected);
    stroke: var(--color-map-stroke-selected);
}

.country.selected:hover {
    stroke: var(--color-map-stroke-selected-hover);
}
```

---

## Other Components

Components such as **Tabs**, **Stats**, **Panels**, **Navigation**, and **Quick Stats** have been refactored to consistently use our defined tokens. For complete details, refer to their respective CSS files in the [components](../components) directory.

---

*Note:* For a full list of tokens and their values, please review [core/variables.css](../core/variables.css).

Happy styling! 🙏💛✨