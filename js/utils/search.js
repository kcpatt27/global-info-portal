/**
 * search.js
 * 
 * Utilities for creating and managing search inputs:
 * - Debounced search inputs
 * - Search history management
 * - Search suggestions
 */

/**
 * Create a search input with debouncing
 * @param {Object} config - Configuration options
 * @param {string} config.placeholder - Placeholder text
 * @param {Function} config.callback - Callback function when search input changes
 * @param {number} config.debounceTime - Debounce time in milliseconds
 * @param {string} config.className - Additional class names
 * @param {boolean} config.autofocus - Whether to auto-focus the input
 * @param {boolean} config.clearButton - Whether to show a clear button
 * @returns {HTMLElement} Search input container element
 */
export function createSearchInput(config = {}) {
  // Default configuration
  const {
    placeholder = 'Search...',
    callback = () => {},
    debounceTime = 300,
    className = '',
    autofocus = false,
    clearButton = true
  } = config;
  
  // Create container element
  const container = document.createElement('div');
  container.className = `search-container ${className}`.trim();
  
  // Create search icon
  const searchIcon = document.createElement('div');
  searchIcon.className = 'search-icon';
  searchIcon.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
      <path fill="currentColor" d="M9.5,3A6.5,6.5,0,0,1,16,9.5a6.45,6.45,0,0,1-1.49,4.13l5.92,5.92a1,1,0,0,1-1.42,1.42l-5.92-5.92A6.5,6.5,0,1,1,9.5,3Zm0,2A4.5,4.5,0,1,0,14,9.5,4.51,4.51,0,0,0,9.5,5Z"/>
    </svg>
  `;
  
  // Create input element
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'search-input';
  input.placeholder = placeholder;
  
  if (autofocus) {
    input.autofocus = true;
    // Trigger focus after a short delay
    setTimeout(() => input.focus(), 100);
  }
  
  // Create clear button if enabled
  let clearBtn = null;
  if (clearButton) {
    clearBtn = document.createElement('button');
    clearBtn.className = 'search-clear-btn';
    clearBtn.setAttribute('aria-label', 'Clear search');
    clearBtn.innerHTML = '×';
    clearBtn.style.display = 'none';
    
    // Add event listener to clear button
    clearBtn.addEventListener('click', (e) => {
      e.preventDefault();
      input.value = '';
      clearBtn.style.display = 'none';
      input.focus();
      
      // Call callback with empty string
      callback('');
    });
  }
  
  // Set up debouncing
  let debounceTimeout;
  
  // Add event listener to input
  input.addEventListener('input', () => {
    const searchValue = input.value.trim();
    
    // Show/hide clear button
    if (clearBtn) {
      clearBtn.style.display = searchValue ? 'block' : 'none';
    }
    
    // Clear previous timeout
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    
    // Set new timeout
    debounceTimeout = setTimeout(() => {
      // Call callback with current value
      callback(searchValue);
    }, debounceTime);
  });
  
  // Add keydown event for special key handling
  input.addEventListener('keydown', (e) => {
    // Handle escape key to clear input
    if (e.key === 'Escape') {
      input.value = '';
      if (clearBtn) {
        clearBtn.style.display = 'none';
      }
      
      // Clear previous timeout
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
      
      // Call callback with empty string
      callback('');
      
      // Prevent default behavior
      e.preventDefault();
    }
    // Handle Enter key to trigger search immediately
    else if (e.key === 'Enter') {
      e.preventDefault();
      const searchValue = input.value.trim();
      
      // Clear any pending debounced callback
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
      
      // Trigger callback immediately
      callback(searchValue);
    }
  });
  
  // Assemble container
  container.appendChild(searchIcon);
  container.appendChild(input);
  if (clearBtn) {
    container.appendChild(clearBtn);
  }
  
  // Expose methods on container element
  container.getValue = () => input.value.trim();
  container.setValue = (value) => {
    input.value = value;
    if (clearBtn) {
      clearBtn.style.display = value ? 'block' : 'none';
    }
  };
  container.focus = () => input.focus();
  container.clear = () => {
    input.value = '';
    if (clearBtn) {
      clearBtn.style.display = 'none';
    }
    callback('');
  };
  
  return container;
}

/**
 * Create a search history manager
 * @param {Object} config - Configuration options
 * @param {string} config.storageKey - Local storage key
 * @param {number} config.maxItems - Maximum number of history items
 * @returns {Object} Search history manager
 */
export function createSearchHistory(config = {}) {
  // Default configuration
  const {
    storageKey = 'search_history',
    maxItems = 10
  } = config;
  
  // Load history from storage
  const loadHistory = () => {
    try {
      const savedHistory = localStorage.getItem(storageKey);
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch (error) {
      console.error('Error loading search history:', error);
      return [];
    }
  };
  
  // Save history to storage
  const saveHistory = (history) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  };
  
  // Initialize history
  let history = loadHistory();
  
  return {
    /**
     * Add an item to the search history
     * @param {string} query - Search query to add
     */
    addItem(query) {
      // Normalize query
      const trimmedQuery = query.trim();
      if (!trimmedQuery) return;
      
      // Remove if already exists
      history = history.filter(item => item.toLowerCase() !== trimmedQuery.toLowerCase());
      
      // Add to beginning of array
      history.unshift(trimmedQuery);
      
      // Limit to max items
      if (history.length > maxItems) {
        history = history.slice(0, maxItems);
      }
      
      // Save to storage
      saveHistory(history);
    },
    
    /**
     * Get all history items
     * @returns {Array} Array of history items
     */
    getItems() {
      return [...history];
    },
    
    /**
     * Clear all history items
     */
    clear() {
      history = [];
      saveHistory(history);
    },
    
    /**
     * Remove a specific item from history
     * @param {string} query - Item to remove
     */
    removeItem(query) {
      const trimmedQuery = query.trim();
      history = history.filter(item => item.toLowerCase() !== trimmedQuery.toLowerCase());
      saveHistory(history);
    }
  };
}

/**
 * Simple search function for filtering arrays
 * @param {Array} items - Array of items to search
 * @param {string} query - Search query
 * @param {Function|Array} extractors - Function(s) to extract searchable text from items
 * @returns {Array} Filtered items
 */
export function searchItems(items, query, extractors) {
  if (!query || !items || !items.length) {
    return items;
  }
  
  // Normalize query
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return items;
  }
  
  // Ensure extractors is an array
  const extractorFunctions = Array.isArray(extractors) ? extractors : [extractors];
  
  // Filter items
  return items.filter(item => {
    // If no extractors provided, use item as-is
    if (!extractorFunctions.length) {
      if (typeof item === 'string') {
        return item.toLowerCase().includes(normalizedQuery);
      }
      return false;
    }
    
    // Check each extractor
    return extractorFunctions.some(extractor => {
      if (typeof extractor !== 'function') {
        return false;
      }
      
      const extracted = extractor(item);
      
      if (!extracted) {
        return false;
      }
      
      if (typeof extracted === 'string') {
        return extracted.toLowerCase().includes(normalizedQuery);
      }
      
      if (Array.isArray(extracted)) {
        return extracted.some(
          text => text && typeof text === 'string' && text.toLowerCase().includes(normalizedQuery)
        );
      }
      
      return false;
    });
  });
}

/**
 * Create a debounced function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Debounce time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default {
  createSearchInput,
  createSearchHistory,
  searchItems,
  debounce
}; 