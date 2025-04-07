/**
 * Mobile Navigation Component
 * Handles mobile-specific navigation patterns and interactions
 */

// Import necessary utilities
import { isTouchDevice } from '../../utils/touch.js';

// Configuration options with defaults
const DEFAULT_CONFIG = {
  // Selectors
  containerSelector: '.mobile-nav-container',
  bottomNavSelector: '.mobile-nav-bar',
  navItemSelector: '.mobile-nav-item',
  hamburgerToggleSelector: '.hamburger-menu-toggle',
  hamburgerPanelSelector: '.hamburger-menu-panel',
  hamburgerOverlaySelector: '.hamburger-menu-overlay',
  hamburgerItemSelector: '.hamburger-menu-link',
  
  // Options
  threshold: 20, // Scroll threshold to hide/show navigation
  hideOnScroll: true, // Auto-hide on scroll down
  navActiveClass: 'active',
  navHiddenClass: 'hidden',
  
  // Event callbacks
  onNavItemClick: null,
  onHamburgerOpen: null,
  onHamburgerClose: null
};

/**
 * MobileNav class to handle all mobile navigation functionality
 */
class MobileNav {
  /**
   * Constructor sets up the mobile navigation
   * @param {Object} config - Configuration options
   */
  constructor(config = {}) {
    // Merge default config with provided config
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // References to DOM elements
    this.container = null;
    this.bottomNav = null;
    this.navItems = [];
    this.hamburgerToggle = null;
    this.hamburgerPanel = null;
    this.hamburgerOverlay = null;
    this.hamburgerItems = [];
    
    // State management
    this.lastScrollY = 0;
    this.scrollDirection = 'up';
    this.isHamburgerOpen = false;
    this.activeNavItem = null;
    
    // Initialize component
    this.init();
  }
  
  /**
   * Initialize the mobile navigation
   */
  init() {
    // Check if we're on a mobile device
    if (!this.shouldInitialize()) {
      console.info('Mobile navigation not initialized (desktop device detected)');
      return;
    }
    
    // Get DOM elements
    this.container = document.querySelector(this.config.containerSelector);
    this.bottomNav = document.querySelector(this.config.bottomNavSelector);
    this.navItems = Array.from(document.querySelectorAll(this.config.navItemSelector));
    this.hamburgerToggle = document.querySelector(this.config.hamburgerToggleSelector);
    this.hamburgerPanel = document.querySelector(this.config.hamburgerPanelSelector);
    this.hamburgerOverlay = document.querySelector(this.config.hamburgerOverlaySelector);
    this.hamburgerItems = Array.from(document.querySelectorAll(this.config.hamburgerItemSelector));
    
    // Check if required elements exist
    if (!this.container || !this.bottomNav) {
      this.createNavElements();
    }
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Initialize state based on current URL
    this.updateActiveNavItem();
    
    console.info('Mobile navigation initialized successfully');
  }
  
  /**
   * Check if we should initialize the component
   * @returns {boolean} Whether we should initialize
   */
  shouldInitialize() {
    // Only initialize on mobile/touch devices or when debugging
    return isTouchDevice() || window.innerWidth <= 768 || window.location.search.includes('debug=mobile');
  }
  
  /**
   * Create navigation elements if they don't exist
   */
  createNavElements() {
    // If navigation elements don't exist yet, create them
    if (!this.container) {
      // Create bottom navigation
      this.container = document.createElement('div');
      this.container.className = 'mobile-nav-container';
      
      this.bottomNav = document.createElement('div');
      this.bottomNav.className = 'mobile-nav-bar';
      
      // Create navigation items
      this.createNavItems();
      
      // Append to container
      this.container.appendChild(this.bottomNav);
      document.body.appendChild(this.container);
    }
    
    // Create hamburger menu if it doesn't exist
    if (!this.hamburgerToggle) {
      this.createHamburgerMenu();
    }
  }
  
  /**
   * Create the bottom navigation items
   * Updated to mirror desktop navigation options
   */
  createNavItems() {
    // Define navigation items to match desktop options
    const navItemsData = [
      { id: 'map', icon: 'fas fa-globe', text: 'Map', tooltip: 'View World Map' },
      { id: 'info', icon: 'fas fa-info-circle', text: 'Info', tooltip: 'Country Info' },
      { id: 'data', icon: 'fas fa-chart-bar', text: 'Data', tooltip: 'View Data' },
      { id: 'search', icon: 'fas fa-search', text: 'Search', tooltip: 'Search Countries' },
      { id: 'settings', icon: 'fas fa-ellipsis-h', text: 'More', tooltip: 'More Options' }
    ];
    
    // Create navigation items
    this.navItems = navItemsData.map(item => {
      const navItem = document.createElement('a');
      navItem.className = 'mobile-nav-item';
      navItem.href = '#' + item.id;
      navItem.setAttribute('data-nav-id', item.id);
      navItem.setAttribute('aria-label', item.tooltip);
      
      // Create ripple effect element for touch feedback
      const ripple = document.createElement('span');
      ripple.className = 'nav-ripple';
      
      // Create icon
      const icon = document.createElement('i');
      icon.className = `nav-icon ${item.icon}`;
      
      // Create text
      const text = document.createElement('span');
      text.className = 'nav-text';
      text.textContent = item.text;
      
      // Create notification badge (initially hidden)
      const badge = document.createElement('span');
      badge.className = 'nav-badge';
      badge.style.display = 'none';
      
      // Append elements
      navItem.appendChild(ripple);
      navItem.appendChild(icon);
      navItem.appendChild(text);
      navItem.appendChild(badge);
      this.bottomNav.appendChild(navItem);
      
      return navItem;
    });
  }
  
  /**
   * Create the hamburger menu elements
   */
  createHamburgerMenu() {
    // Create hamburger toggle button
    this.hamburgerToggle = document.createElement('button');
    this.hamburgerToggle.className = 'hamburger-menu-toggle';
    this.hamburgerToggle.setAttribute('aria-label', 'Toggle menu');
    
    // Create hamburger icon
    const hamburgerIcon = document.createElement('div');
    hamburgerIcon.className = 'hamburger-icon';
    
    // Create the hamburger icon lines
    for (let i = 0; i < 4; i++) {
      const span = document.createElement('span');
      hamburgerIcon.appendChild(span);
    }
    
    this.hamburgerToggle.appendChild(hamburgerIcon);
    
    // Create hamburger menu panel
    this.hamburgerPanel = document.createElement('div');
    this.hamburgerPanel.className = 'hamburger-menu-panel';
    
    // Create hamburger menu items list
    const menuList = document.createElement('ul');
    menuList.className = 'hamburger-menu-items';
    
    // Define menu items with sections
    const menuItems = [
      { type: 'section', text: 'Navigation' },
      { id: 'map', icon: 'fas fa-map', text: 'World Map' },
      { id: 'data', icon: 'fas fa-database', text: 'Data Explorer' },
      { id: 'rankings', icon: 'fas fa-list-ol', text: 'Rankings' },
      { id: 'divider' },
      { type: 'section', text: 'Tools' },
      { id: 'search', icon: 'fas fa-search', text: 'Search' },
      { id: 'compare', icon: 'fas fa-balance-scale', text: 'Compare Countries' },
      { id: 'favorites', icon: 'fas fa-star', text: 'Favorites' },
      { id: 'divider' },
      { type: 'section', text: 'Settings' },
      { id: 'settings', icon: 'fas fa-cog', text: 'Settings' },
      { id: 'help', icon: 'fas fa-question-circle', text: 'Help' },
      { id: 'about', icon: 'fas fa-info-circle', text: 'About' }
    ];
    
    // Create menu items
    this.hamburgerItems = menuItems.map(item => {
      if (item.id === 'divider') {
        const divider = document.createElement('li');
        divider.className = 'hamburger-menu-divider';
        menuList.appendChild(divider);
        return divider;
      }
      
      if (item.type === 'section') {
        const section = document.createElement('li');
        section.className = 'hamburger-menu-section';
        section.textContent = item.text;
        menuList.appendChild(section);
        return section;
      }
      
      const menuItem = document.createElement('li');
      menuItem.className = 'hamburger-menu-item';
      
      const link = document.createElement('a');
      link.className = 'hamburger-menu-link';
      link.href = '#' + item.id;
      link.setAttribute('data-nav-id', item.id);
      
      // Create icon
      const icon = document.createElement('i');
      icon.className = `${item.icon}`;
      
      // Add text
      const text = document.createTextNode(item.text);
      
      // Append elements
      link.appendChild(icon);
      link.appendChild(text);
      menuItem.appendChild(link);
      menuList.appendChild(menuItem);
      
      return link;
    });
    
    this.hamburgerPanel.appendChild(menuList);
    
    // Create overlay
    this.hamburgerOverlay = document.createElement('div');
    this.hamburgerOverlay.className = 'hamburger-menu-overlay';
    
    // Append elements to the document
    document.body.appendChild(this.hamburgerToggle);
    document.body.appendChild(this.hamburgerPanel);
    document.body.appendChild(this.hamburgerOverlay);
  }
  
  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Handle bottom navigation item clicks
    this.navItems.forEach(item => {
      item.addEventListener('click', this.handleNavItemClick.bind(this));
      
      // Add ripple effect for touch feedback
      item.addEventListener('touchstart', this.addRippleEffect.bind(this), { passive: true });
    });
    
    // Handle hamburger menu toggle
    if (this.hamburgerToggle) {
      this.hamburgerToggle.addEventListener('click', this.toggleHamburgerMenu.bind(this));
    }
    
    // Handle hamburger overlay clicks (close menu)
    if (this.hamburgerOverlay) {
      this.hamburgerOverlay.addEventListener('click', this.closeHamburgerMenu.bind(this));
    }
    
    // Handle hamburger menu item clicks
    this.hamburgerItems.forEach(item => {
      // Skip sections and dividers
      if (item.classList.contains('hamburger-menu-section') || 
          item.classList.contains('hamburger-menu-divider')) {
        return;
      }
      
      item.addEventListener('click', this.handleHamburgerItemClick.bind(this));
      
      // Add ripple effect for touch feedback
      if (!item.classList.contains('hamburger-menu-section') && 
          !item.classList.contains('hamburger-menu-divider')) {
        item.addEventListener('touchstart', this.addRippleEffect.bind(this), { passive: true });
      }
    });
    
    // Handle scroll behavior for auto-hiding navigation
    if (this.config.hideOnScroll) {
      window.addEventListener('scroll', this.handleScroll.bind(this));
    }
    
    // Handle history changes
    window.addEventListener('popstate', this.updateActiveNavItem.bind(this));
    
    // Handle device orientation changes
    window.addEventListener('orientationchange', this.handleOrientationChange.bind(this));
  }
  
  /**
   * Add ripple effect for touch feedback
   * @param {Event} event - The touch event
   */
  addRippleEffect(event) {
    const target = event.currentTarget;
    const ripple = target.querySelector('.nav-ripple');
    
    if (!ripple) return;
    
    // Reset any existing animation
    ripple.style.animation = 'none';
    
    // Get position relative to the element
    const rect = target.getBoundingClientRect();
    const x = event.touches[0].clientX - rect.left;
    const y = event.touches[0].clientY - rect.top;
    
    // Set ripple position and start animation
    ripple.style.top = `${y}px`;
    ripple.style.left = `${x}px`;
    ripple.style.animation = 'nav-ripple 0.6s ease-out';
  }
  
  /**
   * Handle orientation change
   */
  handleOrientationChange() {
    // Adjust navigation based on orientation
    const isLandscape = window.innerWidth > window.innerHeight;
    
    if (isLandscape) {
      // For landscape, ensure the navigation is visible
      this.showNavigation();
    } else {
      // For portrait, follow normal scroll behavior
      this.handleScroll();
    }
    
    // Close hamburger menu if open
    if (this.isHamburgerOpen) {
      this.closeHamburgerMenu();
    }
  }
  
  /**
   * Handle navigation item click
   * @param {Event} event - The click event
   */
  handleNavItemClick(event) {
    event.preventDefault();
    
    const navItem = event.currentTarget;
    const navId = navItem.getAttribute('data-nav-id');
    
    // Invoke callback if provided
    if (this.config.onNavItemClick) {
      this.config.onNavItemClick(navId, navItem);
    }
    
    // Special case for settings button (toggle hamburger menu)
    if (navId === 'settings') {
      this.toggleHamburgerMenu();
      return;
    }
    
    // Set as active item
    this.setActiveNavItem(navItem);
    
    // Store active nav item in persistent storage
    localStorage.setItem('activeNavItem', navId);
    
    // Update URL if not settings
    this.updateURL(navId);
    
    // Navigate to appropriate section
    this.navigateTo(navId);
  }
  
  /**
   * Handle hamburger menu item clicks
   * @param {Event} event - Click event
   */
  handleHamburgerItemClick(event) {
    event.preventDefault();
    
    const clickedItem = event.currentTarget;
    const navId = clickedItem.getAttribute('data-nav-id');
    
    // Close the hamburger menu
    this.closeHamburgerMenu();
    
    // Update active items
    this.setActiveHamburgerItem(clickedItem);
    
    // Navigate to the selected section
    this.navigateTo(navId);
  }
  
  /**
   * Navigate to a specific section
   * @param {string} navId - Navigation ID to navigate to
   */
  navigateTo(navId) {
    switch (navId) {
      case 'home':
        // Navigate to the home/main view
        this.showMainView();
        break;
      case 'map':
        // Focus on the map
        this.focusMap();
        break;
      case 'data':
        // Show data panel
        this.showDataPanel();
        break;
      case 'info':
        // Show info panel
        this.showInfoPanel();
        break;
      case 'search':
        // Open search dialog
        this.openSearch();
        break;
      case 'settings':
        // Open settings 
        this.openSettings();
        break;
      case 'help':
        // Show help information
        this.showHelp();
        break;
      default:
        // If not recognized, just use the hash navigation
        window.location.hash = navId;
    }
    
    // Update the URL to reflect the current state
    this.updateURL(navId);
  }
  
  /**
   * Show the main view
   */
  showMainView() {
    // Reset any collapsed states
    document.querySelector(".info-container")?.classList.remove("collapsed");
    document.querySelector("#nav-sidebar")?.classList.remove("visible");
    
    // Reset any selected country on the map
    if (typeof window.clearSelection === 'function') {
      window.clearSelection();
    }
  }
  
  /**
   * Focus on the map
   */
  focusMap() {
    // Collapse the info container to focus on map
    document.querySelector(".info-container")?.classList.add("collapsed");
    document.querySelector("#nav-sidebar")?.classList.add("visible");
    
    // Expand the map
    document.querySelector(".container")?.classList.add("sidebar-collapsed");
    document.querySelector(".map-container")?.classList.add("expanded");
  }
  
  /**
   * Show the data panel
   */
  showDataPanel() {
    // Ensure sidebar is visible
    document.querySelector(".info-container")?.classList.remove("collapsed");
    document.querySelector("#nav-sidebar")?.classList.remove("visible");
    
    // Contract the map
    document.querySelector(".container")?.classList.remove("sidebar-collapsed");
    document.querySelector(".map-container")?.classList.remove("expanded");
    
    // Activate data panel
    document.querySelectorAll('.sidebar-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.content-panel').forEach(panel => panel.classList.remove('active'));
    document.querySelector('.sidebar-button[data-panel="data"]')?.classList.add('active');
    document.getElementById('data-panel')?.classList.add('active');
  }
  
  /**
   * Show the info panel
   */
  showInfoPanel() {
    // Ensure sidebar is visible
    document.querySelector(".info-container")?.classList.remove("collapsed");
    document.querySelector("#nav-sidebar")?.classList.remove("visible");
    
    // Contract the map
    document.querySelector(".container")?.classList.remove("sidebar-collapsed");
    document.querySelector(".map-container")?.classList.remove("expanded");
    
    // Activate info panel
    document.querySelectorAll('.sidebar-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.content-panel').forEach(panel => panel.classList.remove('active'));
    document.querySelector('.sidebar-button[data-panel="info"]')?.classList.add('active');
    document.getElementById('info-panel')?.classList.add('active');
  }
  
  /**
   * Open the search functionality
   */
  openSearch() {
    // This would open a search dialog/interface
    console.log('Search functionality would open here');
    // In a real implementation, this would trigger a search UI component
  }
  
  /**
   * Open settings
   */
  openSettings() {
    console.log('Settings would open here');
    // In a real implementation, this would open a settings panel
  }
  
  /**
   * Show help information
   */
  showHelp() {
    console.log('Help would show here');
    // In a real implementation, this would show help/tutorial
  }
  
  /**
   * Update the URL to reflect the current navigation state
   * @param {string} navId - Navigation ID
   */
  updateURL(navId) {
    // Update URL without full page reload
    history.pushState({navId}, '', `#${navId}`);
  }
  
  /**
   * Toggle the hamburger menu
   */
  toggleHamburgerMenu() {
    if (this.isHamburgerOpen) {
      this.closeHamburgerMenu();
    } else {
      this.openHamburgerMenu();
    }
  }
  
  /**
   * Open the hamburger menu
   */
  openHamburgerMenu() {
    if (!this.hamburgerToggle || !this.hamburgerPanel || !this.hamburgerOverlay) return;
    
    this.hamburgerToggle.classList.add(this.config.navActiveClass);
    this.hamburgerPanel.classList.add(this.config.navActiveClass);
    this.hamburgerOverlay.classList.add(this.config.navActiveClass);
    this.isHamburgerOpen = true;
    
    // Call the callback if provided
    if (typeof this.config.onHamburgerOpen === 'function') {
      this.config.onHamburgerOpen();
    }
    
    // Prevent body scrolling when menu is open
    document.body.style.overflow = 'hidden';
  }
  
  /**
   * Close the hamburger menu
   */
  closeHamburgerMenu() {
    if (!this.hamburgerToggle || !this.hamburgerPanel || !this.hamburgerOverlay) return;
    
    this.hamburgerToggle.classList.remove(this.config.navActiveClass);
    this.hamburgerPanel.classList.remove(this.config.navActiveClass);
    this.hamburgerOverlay.classList.remove(this.config.navActiveClass);
    this.isHamburgerOpen = false;
    
    // Call the callback if provided
    if (typeof this.config.onHamburgerClose === 'function') {
      this.config.onHamburgerClose();
    }
    
    // Restore body scrolling
    document.body.style.overflow = '';
  }
  
  /**
   * Handle scroll events to hide/show the bottom navigation
   */
  handleScroll() {
    // Skip if we're in the hamburger menu
    if (this.isHamburgerOpen) return;
    
    const currentScrollY = window.scrollY;
    
    // Determine scroll direction
    this.scrollDirection = currentScrollY > this.lastScrollY ? 'down' : 'up';
    
    // Show/hide based on direction and threshold
    if (this.scrollDirection === 'down' && currentScrollY > this.config.threshold) {
      this.hideNavigation();
    } else if (this.scrollDirection === 'up') {
      this.showNavigation();
    }
    
    // Update last scroll position
    this.lastScrollY = currentScrollY;
  }
  
  /**
   * Hide the bottom navigation
   */
  hideNavigation() {
    if (this.container) {
      this.container.classList.add(this.config.navHiddenClass);
    }
  }
  
  /**
   * Show the bottom navigation
   */
  showNavigation() {
    if (this.container) {
      this.container.classList.remove(this.config.navHiddenClass);
    }
  }
  
  /**
   * Update active nav item based on current URL/state
   */
  updateActiveNavItem() {
    // Get current hash without the # symbol
    const currentHash = window.location.hash.substring(1) || 'home';
    
    // Find matching nav items
    const bottomNavItem = this.navItems.find(item => 
      item.getAttribute('data-nav-id') === currentHash
    );
    
    const hamburgerItem = this.hamburgerItems.find(item => 
      item.getAttribute && item.getAttribute('data-nav-id') === currentHash
    );
    
    // Update active states
    if (bottomNavItem) {
      this.setActiveNavItem(bottomNavItem);
    }
    
    if (hamburgerItem) {
      this.setActiveHamburgerItem(hamburgerItem);
    }
  }
  
  /**
   * Set the active bottom navigation item
   * @param {Element} item - The nav item to set as active
   */
  setActiveNavItem(item) {
    // Remove active class from all items
    this.navItems.forEach(navItem => {
      navItem.classList.remove(this.config.navActiveClass);
    });
    
    // Add active class to the selected item
    item.classList.add(this.config.navActiveClass);
    this.activeNavItem = item;
  }
  
  /**
   * Set the active hamburger menu item
   * @param {Element} item - The hamburger item to set as active
   */
  setActiveHamburgerItem(item) {
    // Only proceed if it's a valid item
    if (!item || !item.classList) return;
    
    // Remove active class from all items
    this.hamburgerItems.forEach(menuItem => {
      if (menuItem.classList) {
        menuItem.classList.remove(this.config.navActiveClass);
      }
    });
    
    // Add active class to the selected item
    item.classList.add(this.config.navActiveClass);
  }
}

/**
 * Initialize the mobile navigation
 * @param {Object} config - Configuration options
 * @returns {MobileNav} The mobile navigation instance
 */
export function initMobileNav(config = {}) {
  return new MobileNav(config);
}

// Export the class for direct use
export default MobileNav; 