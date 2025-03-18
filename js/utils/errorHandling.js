export const errorHandler = {
  logError: (context, error) => {
    console.error(`Error in ${context}:`, error);
    return error;
  },
  
  showUserFriendlyError: (container, message, retryFn = null) => {
    if (!container) return;
    
    container.innerHTML = `
      <div class="error-container">
        <div class="error-icon">⚠️</div>
        <div class="error-message">${message}</div>
        ${retryFn ? '<button class="retry-button">Try Again</button>' : ''}
      </div>
    `;
    
    if (retryFn) {
      container.querySelector('.retry-button')?.addEventListener('click', retryFn);
    }
  },
  
  safeOperation: async (operation, fallback = null) => {
    try {
      return await operation();
    } catch (error) {
      errorHandler.logError('safeOperation', error);
      return fallback;
    }
  }
};
