

```
// Start of Selection
# CSS Reference Guide

This document contains reference CSS snippets and patterns for consistent implementation across the Global Information Portal project.

## Animation Timing Standards

```css
/* Standard animation timing variables */
:root {
  --animation-speed-fast: 0.113s;
  --animation-speed-medium: 0.23s;
  --animation-speed-slow: 0.311s;
  
  --easing-standard: ease;
  --easing-smooth: ease-in-out;
  --easing-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

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

## Interactive Components

### Stats Grid Item

```css
.stat-item-interactive {
  cursor: pointer;
  position: relative;
}

.stat-item-interactive:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
}

.stat-cycle-indicator {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  opacity: 0;
  transition: opacity var(--animation-speed-fast) var(--easing-standard);
}

.stat-item-interactive:hover .stat-cycle-indicator {
  opacity: 1;
}
```

### Tab Navigation

```css
.data-tab {
  padding: 8px 15px;
  cursor: pointer;
  transition: all var(--animation-speed-fast) var(--easing-standard);
  border: 1px solid #444;
  border-bottom: 3px solid #444;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  margin-right: -5px;
  position: relative;
  background-color: #333;
  flex: 1;
  min-width: 0;
  text-align: center;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transform-origin: bottom center;
  box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.2);
}

.data-tab.active {
  background-color: #444;
  border-color: #888;
  border-bottom: none !important;
  font-weight: bold;
  z-index: 10;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.3);
  transform: translateY(-2px);
  height: 42px;
}
```

## Layout Patterns

### Sidebar Animation

```css
.info-container {
  background-color: rgba(30, 30, 40, 0.95);
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: transform var(--animation-speed-slow) var(--easing-standard), 
             opacity var(--animation-speed-slow) var(--easing-standard);
  box-shadow: -5px 0 15px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 100;
}

.info-container.collapsed {
  transform: translateX(100%);
  opacity: 0;
}

.map-container {
  position: relative;
  height: 100%;
  width: 100%;
  overflow: hidden;
  background-color: #1a1a1a;
  transition: all var(--animation-speed-slow) var(--easing-standard);
}

.map-container.expanded {
  grid-column: 1 / -1;
}
```