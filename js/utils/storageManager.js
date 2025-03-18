// Storage manager with expiration and fallbacks
export const storageManager = {
  // Check if storage type is available
  isAvailable(type = 'localStorage') {
    try {
      const storage = window[type];
      const testKey = '__storage_test__';
      storage.setItem(testKey, testKey);
      storage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  },
  
  // Memory fallback when local/session storage unavailable
  memoryStorage: new Map(),
  
  // Set an item with optional expiration
  setItem(key, value, options = {}) {
    const {
      expiresIn = null, // Time in milliseconds
      storage = 'localStorage'
    } = options;
    
    // Prepare the value with metadata
    const data = {
      value,
      timestamp: Date.now(),
      expires: expiresIn ? Date.now() + expiresIn : null
    };
    
    // Stringify the data
    const serialized = JSON.stringify(data);
    
    // Try to use the specified storage
    if (this.isAvailable(storage)) {
      window[storage].setItem(key, serialized);
    } else {
      // Fall back to memory storage
      this.memoryStorage.set(key, serialized);
    }
    
    return value;
  },
  
  // Get an item, respecting expiration
  getItem(key, options = {}) {
    const {
      defaultValue = null,
      storage = 'localStorage'
    } = options;
    
    let serialized;
    
    // Try to get from specified storage
    if (this.isAvailable(storage)) {
      serialized = window[storage].getItem(key);
    } else {
      // Fall back to memory storage
      serialized = this.memoryStorage.get(key);
    }
    
    if (!serialized) return defaultValue;
    
    try {
      const data = JSON.parse(serialized);
      
      // Check if expired
      if (data.expires && Date.now() > data.expires) {
        this.removeItem(key, { storage });
        return defaultValue;
      }
      
      return data.value;
    } catch (e) {
      // If parsing fails, return the raw value
      return serialized;
    }
  },
  
  // Remove an item
  removeItem(key, options = {}) {
    const { storage = 'localStorage' } = options;
    
    if (this.isAvailable(storage)) {
      window[storage].removeItem(key);
    } else {
      this.memoryStorage.delete(key);
    }
  },
  
  // Clear all items
  clear(options = {}) {
    const { storage = 'localStorage' } = options;
    
    if (this.isAvailable(storage)) {
      window[storage].clear();
    } else {
      this.memoryStorage.clear();
    }
  },
  
  // List all keys
  keys(options = {}) {
    const { storage = 'localStorage' } = options;
    
    if (this.isAvailable(storage)) {
      return Object.keys(window[storage]);
    } else {
      return Array.from(this.memoryStorage.keys());
    }
  }
}; 