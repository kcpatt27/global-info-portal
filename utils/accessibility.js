// utils/accessibility.js
export const a11y = {
    ensureAriaLabels: () => {
      // Add aria labels to interactive elements that lack them
      document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])').forEach(btn => {
        const text = btn.textContent?.trim();
        if (text) btn.setAttribute('aria-label', text);
      });
      
      // Add roles to custom interactive elements
      document.querySelectorAll('.tab-button').forEach(tab => {
        if (!tab.getAttribute('role')) tab.setAttribute('role', 'tab');
      });
    },
    
    enableReducedMotion: () => {
      // Check user preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      if (prefersReducedMotion) {
        document.documentElement.classList.add('reduced-motion');
      }
      
      // Listener for preference changes
      window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', e => {
        if (e.matches) {
          document.documentElement.classList.add('reduced-motion');
        } else {
          document.documentElement.classList.remove('reduced-motion');
        }
      });
    }
  };