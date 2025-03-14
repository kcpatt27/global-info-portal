// State history manager for tracking state changes and supporting undo/redo
export class StateHistoryManager {
  constructor(initialState = null, maxHistory = 20) {
    this.history = [];
    this.current = -1;
    this.maxHistory = maxHistory;
    
    if (initialState !== null) {
      this.pushState(initialState);
    }
  }
  
  // Add a new state to history
  pushState(state) {
    // Remove any forward history if we're adding after an undo
    if (this.current < this.history.length - 1) {
      this.history = this.history.slice(0, this.current + 1);
    }
    
    // Clone the state to avoid reference issues
    const clonedState = JSON.parse(JSON.stringify(state));
    
    // Add new state
    this.history.push({
      state: clonedState,
      timestamp: Date.now()
    });
    
    // Update current pointer
    this.current = this.history.length - 1;
    
    // Trim history if needed
    if (this.history.length > this.maxHistory) {
      this.history.shift();
      this.current--;
    }
    
    return this.current;
  }
  
  // Go back in history
  undo() {
    if (this.current <= 0) return null;
    
    this.current--;
    return this.getCurrentState();
  }
  
  // Go forward in history
  redo() {
    if (this.current >= this.history.length - 1) return null;
    
    this.current++;
    return this.getCurrentState();
  }
  
  // Get current state
  getCurrentState() {
    if (this.current < 0 || this.current >= this.history.length) return null;
    
    return JSON.parse(JSON.stringify(this.history[this.current].state));
  }
  
  // Get full history
  getHistory() {
    return this.history.map(item => ({
      timestamp: item.timestamp,
      state: JSON.parse(JSON.stringify(item.state))
    }));
  }
  
  // Clear history
  clear() {
    this.history = [];
    this.current = -1;
  }
  
  // Can we undo?
  canUndo() {
    return this.current > 0;
  }
  
  // Can we redo?
  canRedo() {
    return this.current < this.history.length - 1;
  }
} 