// utils/cacheManager.js
export const cacheManager = {
    // Simple TTL-based cache
    create: (defaultTTL = 3600000) => { // 1 hour in milliseconds
      const cache = new Map();
      
      return {
        set: (key, value, ttl = defaultTTL) => {
          const expiresAt = Date.now() + ttl;
          cache.set(key, { value, expiresAt });
          return value;
        },
        
        get: (key) => {
          const item = cache.get(key);
          if (!item) return null;
          
          if (Date.now() > item.expiresAt) {
            cache.delete(key);
            return null;
          }
          
          return item.value;
        },
        
        has: (key) => {
          const item = cache.get(key);
          if (!item) return false;
          
          if (Date.now() > item.expiresAt) {
            cache.delete(key);
            return false;
          }
          
          return true;
        },
        
        delete: (key) => cache.delete(key),
        clear: () => cache.clear(),
        size: () => cache.size,
        stats: () => ({
          size: cache.size,
          keys: Array.from(cache.keys())
        })
      };
    }
  };