// Keyboard shortcuts and navigation manager
export const keyboardManager = {
  shortcuts: {},
  enabled: true,
  
  // Initialize with shortcut map
  init: (shortcutMap = {}) => {
    keyboardManager.shortcuts = shortcutMap;
    
    // Set up global listener
    document.addEventListener('keydown', keyboardManager.handleKeyDown);
    
    // Also return control functions for more granular control
    return {
      registerShortcut: keyboardManager.registerShortcut,
      unregisterShortcut: keyboardManager.unregisterShortcut,
      enable: () => { keyboardManager.enabled = true; },
      disable: () => { keyboardManager.enabled = false; }
    };
  },
  
  // Register a new shortcut
  registerShortcut: (key, callback, description = '', requiresCtrl = false, requiresShift = false, requiresAlt = false) => {
    const shortcut = {
      key: key.toLowerCase(),
      callback,
      description,
      requiresCtrl,
      requiresShift,
      requiresAlt
    };
    
    const shortcutId = keyboardManager.getShortcutId(shortcut);
    keyboardManager.shortcuts[shortcutId] = shortcut;
    
    return () => keyboardManager.unregisterShortcut(shortcutId);
  },
  
  // Unregister a shortcut
  unregisterShortcut: (shortcutId) => {
    if (keyboardManager.shortcuts[shortcutId]) {
      delete keyboardManager.shortcuts[shortcutId];
      return true;
    }
    return false;
  },
  
  // Generate a unique ID for a shortcut configuration
  getShortcutId: (shortcut) => {
    return `${shortcut.requiresCtrl ? 'c+' : ''}${shortcut.requiresShift ? 's+' : ''}${shortcut.requiresAlt ? 'a+' : ''}${shortcut.key}`;
  },
  
  // Handle keydown events
  handleKeyDown: (event) => {
    if (!keyboardManager.enabled) return;
    
    // Skip if in input, textarea, or select element
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)) {
      return;
    }
    
    const key = event.key.toLowerCase();
    const shortcutId = `${event.ctrlKey ? 'c+' : ''}${event.shiftKey ? 's+' : ''}${event.altKey ? 'a+' : ''}${key}`;
    
    if (keyboardManager.shortcuts[shortcutId]) {
      keyboardManager.shortcuts[shortcutId].callback(event);
      event.preventDefault();
    }
  },
  
  // Get help text for all registered shortcuts
  getShortcutsHelp: () => {
    return Object.values(keyboardManager.shortcuts)
      .map(shortcut => {
        const keyCombo = [
          shortcut.requiresCtrl ? 'Ctrl' : '',
          shortcut.requiresShift ? 'Shift' : '',
          shortcut.requiresAlt ? 'Alt' : '',
          shortcut.key.toUpperCase()
        ].filter(Boolean).join(' + ');
        
        return {
          keyCombo,
          description: shortcut.description
        };
      });
  }
}; 