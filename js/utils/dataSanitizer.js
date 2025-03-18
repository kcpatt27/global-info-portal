// Sanitizer utility to prevent XSS in dynamic content
export const sanitizer = {
  // Sanitize HTML string
  sanitizeHTML(html) {
    const element = document.createElement('div');
    element.textContent = html;
    return element.innerHTML;
  },
  
  // Sanitize and create DOM elements safely
  createSafeElement(tag, attributes = {}, content = '') {
    const element = document.createElement(tag);
    
    // Set sanitized attributes
    Object.keys(attributes).forEach(attr => {
      if (attr.startsWith('on')) return; // Skip event handlers
      
      const value = attributes[attr];
      if (attr === 'style' && typeof value === 'string') {
        // Sanitize CSS - basic implementation
        const sanitizedStyle = value.replace(/javascript|expression|eval\(|behavior:|url\(/gi, '');
        element.style = sanitizedStyle;
      } else if (typeof value === 'string') {
        element.setAttribute(attr, value);
      }
    });
    
    // Set content
    if (content) {
      element.textContent = content;
    }
    
    return element;
  },
  
  // Safely add HTML content to an element
  safeInnerHTML(element, htmlContent) {
    // Create a document fragment
    const template = document.createElement('template');
    
    // Set content to the template (browser will sanitize)
    template.innerHTML = htmlContent.trim();
    
    // Clear the target element
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
    
    // Append the sanitized content
    element.appendChild(template.content);
  },
  
  // Sanitize user input for search queries
  sanitizeSearchQuery(query) {
    return query.replace(/[<>]/g, '').trim();
  },
  
  // Sanitize values for use in URLs
  sanitizeURLParam(value) {
    return encodeURIComponent(String(value).trim());
  }
}; 