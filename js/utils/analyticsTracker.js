// Simple analytics tracker (without external dependencies)
export const analytics = {
  // Configuration
  config: {
    enabled: true,
    trackPageViews: true,
    trackClicks: true,
    trackErrors: true,
    storageKey: 'app_analytics',
    sessionDuration: 1800000, // 30 minutes in milliseconds
    samplingRate: 1.0 // 1.0 = 100% tracking
  },
  
  // Storage for current session
  session: {
    id: null,
    startTime: null,
    lastActivity: null,
    pageViews: 0,
    events: []
  },
  
  // Initialize analytics
  init(customConfig = {}) {
    // Apply custom config
    this.config = { ...this.config, ...customConfig };
    
    // Skip if disabled or fails random sampling
    if (!this.config.enabled || Math.random() > this.config.samplingRate) {
      return false;
    }
    
    // Try to restore or create session
    this.startSession();
    
    // Set up event listeners
    if (this.config.trackPageViews) {
      this.trackPageView();
      
      // Track page views on history changes
      window.addEventListener('popstate', () => this.trackPageView());
    }
    
    if (this.config.trackClicks) {
      document.addEventListener('click', this.handleClick.bind(this));
    }
    
    if (this.config.trackErrors) {
      window.addEventListener('error', this.handleError.bind(this));
      window.addEventListener('unhandledrejection', this.handlePromiseError.bind(this));
    }
    
    // Track session end
    window.addEventListener('beforeunload', () => {
      this.trackEvent('session', 'end');
      this.saveSession();
    });
    
    // Refresh session on activity
    ['click', 'scroll', 'mousemove', 'keydown', 'touchstart'].forEach(event => {
      document.addEventListener(event, this.refreshSession.bind(this), { passive: true });
    });
    
    return true;
  },
  
  // Start or resume a session
  startSession() {
    // Try to load existing session
    try {
      const savedSession = localStorage.getItem(this.config.storageKey);
      if (savedSession) {
        const parsedSession = JSON.parse(savedSession);
        
        // Check if session is still valid (not expired)
        if (parsedSession && 
            parsedSession.lastActivity && 
            (Date.now() - parsedSession.lastActivity < this.config.sessionDuration)) {
          this.session = parsedSession;
          this.refreshSession();
          return;
        }
      }
    } catch (e) {
      // Ignore errors reading from storage
    }
    
    // Create new session if none exists or expired
    this.session = {
      id: this.generateId(),
      startTime: Date.now(),
      lastActivity: Date.now(),
      pageViews: 0,
      events: []
    };
    
    this.trackEvent('session', 'start');
    this.saveSession();
  },
  
  // Refresh session timeout
  refreshSession() {
    this.session.lastActivity = Date.now();
    this.saveSession();
  },
  
  // Save session to storage
  saveSession() {
    try {
      localStorage.setItem(this.config.storageKey, JSON.stringify(this.session));
    } catch (e) {
      // Ignore storage errors
    }
  },
  
  // Track a page view
  trackPageView() {
    this.session.pageViews++;
    
    const pageData = {
      url: window.location.href,
      path: window.location.pathname,
      title: document.title,
      referrer: document.referrer,
      timestamp: Date.now()
    };
    
    this.trackEvent('pageview', pageData.path, pageData);
  },
  
  // Track a custom event
  trackEvent(category, action, data = {}) {
    if (!this.config.enabled) return;
    
    const event = {
      category,
      action,
      data,
      timestamp: Date.now()
    };
    
    // Store locally
    this.session.events.push(event);
    this.saveSession();
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', category, action, data);
    }
    
    // Here you would typically send to a server
    // this.sendToServer(event);
  },
  
  // Handle click tracking
  handleClick(e) {
    // Find closest element with data-track attribute
    let target = e.target;
    while (target && target !== document) {
      if (target.hasAttribute('data-track')) {
        const category = target.getAttribute('data-track-category') || 'element';
        const action = target.getAttribute('data-track-action') || 'click';
        const label = target.getAttribute('data-track-label') || target.innerText.trim();
        
        this.trackEvent(category, action, { label });
        break;
      }
      target = target.parentNode;
    }
  },
  
  // Handle error tracking
  handleError(e) {
    this.trackEvent('error', 'javascript', {
      message: e.message,
      source: e.filename,
      line: e.lineno,
      column: e.colno,
      stack: e.error ? e.error.stack : null
    });
  },
  
  // Handle promise error tracking
  handlePromiseError(e) {
    this.trackEvent('error', 'promise', {
      message: e.reason ? (e.reason.message || String(e.reason)) : 'Unhandled Promise Rejection',
      stack: e.reason && e.reason.stack ? e.reason.stack : null
    });
  },
  
  // Generate random ID for sessions
  generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}; 