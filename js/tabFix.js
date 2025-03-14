/**
 * tabFix.js - Alternative implementation for data tabs
 * This file can be loaded separately to debug tab issues
 */

// This function will be called when the page loads
(function() {
    console.log("TabFix: Loading emergency tab handler");
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTabFix);
    } else {
        initTabFix();
    }
    
    // Main initialization
    function initTabFix() {
        console.log("TabFix: Initializing emergency tab handler");
        
        // Try both immediately and with a delay to ensure DOM is ready
        setupTabs();
        setTimeout(setupTabs, 500);
        
        // Also make it available globally for manual triggering
        window.fixDataTabs = setupTabs;
    }
    
    // Setup tab functionality
    function setupTabs() {
        console.log("TabFix: Setting up tabs");
        
        // Find all tab elements
        const tabs = document.querySelectorAll('.data-tab');
        const panels = document.querySelectorAll('.data-panels .data-panel');
        
        console.log(`TabFix: Found ${tabs.length} tabs and ${panels.length} panels`);
        
        // Log tabs and panels for debugging
        tabs.forEach((tab, i) => {
            console.log(`TabFix: Tab ${i}: ${tab.textContent.trim()}, data-tab=${tab.getAttribute('data-tab')}`);
        });
        
        panels.forEach((panel, i) => {
            console.log(`TabFix: Panel ${i}: data-panel=${panel.getAttribute('data-panel')}`);
        });
        
        // Add direct click handlers to each tab
        tabs.forEach(tab => {
            // Remove existing handlers by cloning
            const clone = tab.cloneNode(true);
            tab.parentNode.replaceChild(clone, tab);
            
            // Add new handler
            clone.addEventListener('click', function(e) {
                // Stop event propagation
                e.preventDefault();
                e.stopPropagation();
                
                const tabId = this.getAttribute('data-tab');
                console.log(`TabFix: Tab clicked: ${this.textContent.trim()}, data-tab=${tabId}`);
                
                // Remove active classes and hide all panels
                tabs.forEach(t => t.classList.remove('active'));
                panels.forEach(p => {
                    p.classList.remove('active');
                    p.style.display = 'none';
                });
                
                // Activate clicked tab
                this.classList.add('active');
                
                // Find and show the corresponding panel
                const panel = document.querySelector(`.data-panels .data-panel[data-panel="${tabId}"]`);
                if (panel) {
                    panel.classList.add('active');
                    panel.style.display = 'block';
                    console.log(`TabFix: Activated panel ${tabId}`);
                } else {
                    console.error(`TabFix: No panel found with data-panel=${tabId}`);
                }
                
                return false;
            });
        });
        
        // Ensure at least one tab is active
        const activeTab = document.querySelector('.data-tab.active');
        if (!activeTab && tabs.length > 0) {
            tabs[0].classList.add('active');
            console.log("TabFix: No active tab found, activated first tab");
            
            // Also activate corresponding panel
            if (panels.length > 0) {
                const firstPanelId = tabs[0].getAttribute('data-tab');
                const firstPanel = document.querySelector(`.data-panels .data-panel[data-panel="${firstPanelId}"]`);
                if (firstPanel) {
                    firstPanel.classList.add('active');
                    firstPanel.style.display = 'block';
                    console.log(`TabFix: Activated first panel (${firstPanelId})`);
                }
            }
        } else if (activeTab) {
            // Make sure the corresponding panel is visible
            const activeTabId = activeTab.getAttribute('data-tab');
            const activePanel = document.querySelector(`.data-panels .data-panel[data-panel="${activeTabId}"]`);
            if (activePanel) {
                activePanel.classList.add('active');
                activePanel.style.display = 'block';
                console.log(`TabFix: Ensured active panel (${activeTabId}) is visible`);
            }
        }
        
        return "TabFix: Setup complete";
    }
})(); 