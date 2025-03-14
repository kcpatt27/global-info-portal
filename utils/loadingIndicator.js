// Progressive loading indicator for async operations
export const loadingIndicator = {
  elements: {
    bar: null,
    percentage: null,
    message: null,
    container: null
  },
  
  isInitialized: false,
  
  // Initialize the loading bar
  init() {
    if (this.isInitialized) return;
    
    // Create the container
    const container = document.createElement('div');
    container.className = 'loading-indicator';
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 3px;
      z-index: 9999;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.113s ease;
    `;
    
    // Create the progress bar
    const bar = document.createElement('div');
    bar.className = 'loading-bar';
    bar.style.cssText = `
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, #3498db, #2ecc71);
      transition: width 0.311s cubic-bezier(0.1, 0.7, 1.0, 0.1);
    `;
    
    // Create percentage display
    const percentage = document.createElement('div');
    percentage.className = 'loading-percentage';
    percentage.style.cssText = `
      position: absolute;
      top: 5px;
      right: 10px;
      font-size: 12px;
      color: #fff;
      text-shadow: 0 0 2px rgba(0,0,0,0.5);
      opacity: 0;
      transition: opacity 0.23s ease;
    `;
    
    // Create message display
    const message = document.createElement('div');
    message.className = 'loading-message';
    message.style.cssText = `
      position: absolute;
      top: 5px;
      left: 10px;
      font-size: 12px;
      color: #fff;
      text-shadow: 0 0 2px rgba(0,0,0,0.5);
      opacity: 0;
      transition: opacity 0.23s ease;
    `;
    
    // Append elements
    container.appendChild(bar);
    container.appendChild(percentage);
    container.appendChild(message);
    document.body.appendChild(container);
    
    // Store references
    this.elements = {
      container,
      bar,
      percentage,
      message
    };
    
    this.isInitialized = true;
  },
  
  // Show the loading bar
  start(initialMessage = 'Loading...') {
    if (!this.isInitialized) this.init();
    
    this.elements.container.style.opacity = '1';
    this.setProgress(0, initialMessage);
    return this;
  },
  
  // Update progress
  setProgress(percent, msg = null) {
    if (!this.isInitialized) this.init();
    
    percent = Math.max(0, Math.min(100, percent));
    
    this.elements.bar.style.width = `${percent}%`;
    this.elements.percentage.textContent = `${Math.round(percent)}%`;
    this.elements.percentage.style.opacity = '1';
    
    if (msg !== null) {
      this.elements.message.textContent = msg;
      this.elements.message.style.opacity = '1';
    }
    
    return this;
  },
  
  // Complete the loading
  complete(message = 'Completed', autohide = true) {
    if (!this.isInitialized) return;
    
    this.setProgress(100, message);
    
    if (autohide) {
      setTimeout(() => {
        this.hide();
      }, 1013); // Prime number delay
    }
    
    return this;
  },
  
  // Hide the loading bar
  hide() {
    if (!this.isInitialized) return;
    
    this.elements.container.style.opacity = '0';
    setTimeout(() => {
      this.elements.bar.style.width = '0%';
      this.elements.percentage.style.opacity = '0';
      this.elements.message.style.opacity = '0';
    }, 230); // Prime number transition
    
    return this;
  }
}; 