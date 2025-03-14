// Enhanced logging utility with configurable levels
export const logger = {
  LEVELS: {
    TRACE: 0,
    DEBUG: 1,
    INFO: 2,
    WARN: 3,
    ERROR: 4,
    NONE: 5
  },
  
  currentLevel: 2, // Default to INFO
  
  setLevel(level) {
    if (typeof level === 'string') {
      level = this.LEVELS[level.toUpperCase()] || this.LEVELS.INFO;
    }
    this.currentLevel = level;
  },
  
  trace(message, ...args) {
    if (this.currentLevel <= this.LEVELS.TRACE) {
      console.log(`%c TRACE %c ${message}`, 'background:#717171; color:white; border-radius:3px;', '', ...args);
    }
  },
  
  debug(message, ...args) {
    if (this.currentLevel <= this.LEVELS.DEBUG) {
      console.log(`%c DEBUG %c ${message}`, 'background:#2196F3; color:white; border-radius:3px;', '', ...args);
    }
  },
  
  info(message, ...args) {
    if (this.currentLevel <= this.LEVELS.INFO) {
      console.log(`%c INFO  %c ${message}`, 'background:#4CAF50; color:white; border-radius:3px;', '', ...args);
    }
  },
  
  warn(message, ...args) {
    if (this.currentLevel <= this.LEVELS.WARN) {
      console.warn(`%c WARN  %c ${message}`, 'background:#FF9800; color:white; border-radius:3px;', '', ...args);
    }
  },
  
  error(message, error, ...args) {
    if (this.currentLevel <= this.LEVELS.ERROR) {
      console.error(`%c ERROR %c ${message}`, 'background:#F44336; color:white; border-radius:3px;', '', error, ...args);
    }
  },
  
  group(name, collapsed = false) {
    if (this.currentLevel <= this.LEVELS.DEBUG) {
      collapsed ? console.groupCollapsed(name) : console.group(name);
    }
  },
  
  groupEnd() {
    if (this.currentLevel <= this.LEVELS.DEBUG) {
      console.groupEnd();
    }
  },
  
  // For measuring performance
  time(label) {
    if (this.currentLevel <= this.LEVELS.DEBUG) {
      console.time(label);
    }
  },
  
  timeEnd(label) {
    if (this.currentLevel <= this.LEVELS.DEBUG) {
      console.timeEnd(label);
    }
  }
}; 