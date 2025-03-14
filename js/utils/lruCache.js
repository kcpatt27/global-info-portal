// LRU Cache implementation for efficient memory management
export class LRUCache {
  constructor(capacity = 100) {
    this.capacity = capacity;
    this.cache = new Map();
    this.usage = [];
  }

  get(key) {
    if (!this.cache.has(key)) return null;
    
    // Update usage (move to most recently used)
    this.updateUsage(key);
    return this.cache.get(key);
  }

  set(key, value) {
    // If key exists, update value and move to most recently used
    if (this.cache.has(key)) {
      this.cache.set(key, value);
      this.updateUsage(key);
      return;
    }
    
    // Check if cache is at capacity
    if (this.usage.length >= this.capacity) {
      // Remove least recently used item
      const leastUsedKey = this.usage.shift();
      this.cache.delete(leastUsedKey);
    }
    
    // Add new item
    this.cache.set(key, value);
    this.usage.push(key);
  }

  has(key) {
    return this.cache.has(key);
  }

  delete(key) {
    if (!this.cache.has(key)) return false;
    
    this.cache.delete(key);
    const index = this.usage.indexOf(key);
    if (index > -1) this.usage.splice(index, 1);
    return true;
  }

  clear() {
    this.cache.clear();
    this.usage = [];
  }
  
  updateUsage(key) {
    const index = this.usage.indexOf(key);
    if (index > -1) {
      this.usage.splice(index, 1);
    }
    this.usage.push(key);
  }
  
  getStats() {
    return {
      size: this.cache.size,
      capacity: this.capacity,
      utilization: this.cache.size / this.capacity,
      mostRecent: this.usage[this.usage.length - 1] || null,
      leastRecent: this.usage[0] || null
    };
  }
} 