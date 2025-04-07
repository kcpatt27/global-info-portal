/**
 * formatters.js
 * 
 * Utility functions for formatting different data types:
 * - Number formatting with locale support
 * - Date and time formatting
 * - Percentage formatting
 * - Currency formatting
 * - Size formatting (bytes, KB, MB, etc.)
 */

/**
 * Format a number with thousands separators
 * @param {number} value - The number to format
 * @param {Object} options - Formatting options
 * @param {string} options.locale - The locale to use for formatting
 * @param {number} options.decimals - Number of decimal places
 * @param {boolean} options.compact - Whether to use compact notation (10K, 10M, etc.)
 * @returns {string} Formatted number
 */
export function formatNumber(value, options = {}) {
  // Default options
  const {
    locale = 'en-US',
    decimals = 0,
    compact = false
  } = options;
  
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }
  
  try {
    // Create formatter options
    const formatterOptions = {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    };
    
    // Add compact notation if requested
    if (compact) {
      formatterOptions.notation = 'compact';
      formatterOptions.compactDisplay = 'short';
    }
    
    // Create formatter and format the number
    const formatter = new Intl.NumberFormat(locale, formatterOptions);
    return formatter.format(value);
  } catch (error) {
    console.error('Error formatting number:', error);
    return String(value);
  }
}

/**
 * Format a date
 * @param {Date|string|number} date - The date to format
 * @param {Object} options - Formatting options
 * @param {string} options.format - Format type ('short', 'medium', 'long', 'full', 'custom')
 * @param {string} options.locale - The locale to use for formatting
 * @param {string} options.customFormat - Custom date format pattern
 * @returns {string} Formatted date
 */
export function formatDate(date, options = {}) {
  // Default options
  const {
    format = 'medium',
    locale = 'en-US',
    customFormat = null
  } = options;
  
  if (!date) return 'N/A';
  
  try {
    // Convert to Date object if not already
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    
    // If custom format is provided, use it
    if (format === 'custom' && customFormat) {
      return formatDateCustom(dateObj, customFormat);
    }
    
    // Set formatter options based on format
    let formatterOptions = {};
    
    switch (format) {
      case 'short':
        formatterOptions = { 
          year: 'numeric', 
          month: 'numeric', 
          day: 'numeric' 
        };
        break;
      case 'medium':
        formatterOptions = { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        };
        break;
      case 'long':
        formatterOptions = { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric', 
          weekday: 'long' 
        };
        break;
      case 'full':
        formatterOptions = { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric', 
          weekday: 'long',
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short'
        };
        break;
      case 'time':
        formatterOptions = { 
          hour: '2-digit',
          minute: '2-digit'
        };
        break;
      case 'datetime':
        formatterOptions = { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        };
        break;
      default:
        formatterOptions = { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        };
    }
    
    // Create formatter and format the date
    const formatter = new Intl.DateTimeFormat(locale, formatterOptions);
    return formatter.format(dateObj);
  } catch (error) {
    console.error('Error formatting date:', error);
    return String(date);
  }
}

/**
 * Format a date using a custom format string
 * @param {Date} date - The date to format
 * @param {string} formatStr - Format string
 * @returns {string} Formatted date
 * @private
 */
function formatDateCustom(date, formatStr) {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const monthShortNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  const dayNames = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 
    'Thursday', 'Friday', 'Saturday'
  ];
  
  const dayShortNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const tokens = {
    'yyyy': date.getFullYear(),
    'yy': date.getFullYear().toString().slice(2),
    'MMMM': monthNames[date.getMonth()],
    'MMM': monthShortNames[date.getMonth()],
    'MM': (date.getMonth() + 1).toString().padStart(2, '0'),
    'M': date.getMonth() + 1,
    'dddd': dayNames[date.getDay()],
    'ddd': dayShortNames[date.getDay()],
    'dd': date.getDate().toString().padStart(2, '0'),
    'd': date.getDate(),
    'HH': date.getHours().toString().padStart(2, '0'),
    'H': date.getHours(),
    'hh': ((date.getHours() % 12) || 12).toString().padStart(2, '0'),
    'h': (date.getHours() % 12) || 12,
    'mm': date.getMinutes().toString().padStart(2, '0'),
    'm': date.getMinutes(),
    'ss': date.getSeconds().toString().padStart(2, '0'),
    's': date.getSeconds(),
    'a': date.getHours() < 12 ? 'am' : 'pm',
    'A': date.getHours() < 12 ? 'AM' : 'PM'
  };
  
  // Replace tokens in the format string
  let result = formatStr;
  for (const [token, value] of Object.entries(tokens)) {
    result = result.replace(new RegExp(token, 'g'), value);
  }
  
  return result;
}

/**
 * Format a percentage
 * @param {number} value - The value to format as percentage
 * @param {Object} options - Formatting options
 * @param {string} options.locale - The locale to use for formatting
 * @param {number} options.decimals - Number of decimal places
 * @param {boolean} options.includeSymbol - Whether to include the % symbol
 * @returns {string} Formatted percentage
 */
export function formatPercentage(value, options = {}) {
  // Default options
  const {
    locale = 'en-US',
    decimals = 2,
    includeSymbol = true
  } = options;
  
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }
  
  try {
    if (includeSymbol) {
      // Use percentage style formatter
      const formatter = new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });
      
      // Convert to percentage (if not already)
      const percentValue = value > 1 ? value / 100 : value;
      return formatter.format(percentValue);
    } else {
      // Format as regular number
      return formatNumber(value * 100, { 
        locale,
        decimals
      });
    }
  } catch (error) {
    console.error('Error formatting percentage:', error);
    return String(value);
  }
}

/**
 * Format a currency value
 * @param {number} value - The value to format as currency
 * @param {Object} options - Formatting options
 * @param {string} options.locale - The locale to use for formatting
 * @param {string} options.currency - Currency code (USD, EUR, etc.)
 * @param {number} options.decimals - Number of decimal places
 * @returns {string} Formatted currency
 */
export function formatCurrency(value, options = {}) {
  // Default options
  const {
    locale = 'en-US',
    currency = 'USD',
    decimals = 2
  } = options;
  
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }
  
  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
    
    return formatter.format(value);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return String(value);
  }
}

/**
 * Format file size
 * @param {number} bytes - Size in bytes
 * @param {Object} options - Formatting options
 * @param {number} options.decimals - Number of decimal places
 * @param {boolean} options.binary - Use binary (1024) instead of decimal (1000)
 * @returns {string} Formatted size
 */
export function formatFileSize(bytes, options = {}) {
  // Default options
  const {
    decimals = 2,
    binary = true
  } = options;
  
  if (bytes === null || bytes === undefined || isNaN(bytes)) {
    return 'N/A';
  }
  
  // Use binary or decimal base
  const base = binary ? 1024 : 1000;
  
  // Size units
  const units = binary ? 
    ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'] :
    ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  // Handle 0 bytes
  if (bytes === 0) return '0 Bytes';
  
  // Calculate the appropriate unit
  const i = Math.floor(Math.log(bytes) / Math.log(base));
  
  // Format the number with the unit
  const size = parseFloat((bytes / Math.pow(base, i)).toFixed(decimals));
  
  return `${size} ${units[i]}`;
}

/**
 * Format a duration in milliseconds to a human-readable string
 * @param {number} ms - Duration in milliseconds
 * @param {Object} options - Formatting options
 * @param {boolean} options.compact - Use compact format (1h 30m vs 1 hour 30 minutes)
 * @param {boolean} options.showMilliseconds - Whether to show milliseconds for small durations
 * @returns {string} Formatted duration
 */
export function formatDuration(ms, options = {}) {
  // Default options
  const {
    compact = false,
    showMilliseconds = false
  } = options;
  
  if (ms === null || ms === undefined || isNaN(ms)) {
    return 'N/A';
  }
  
  // Convert negative values to positive
  const duration = Math.abs(ms);
  
  // Handle zero duration
  if (duration === 0) return '0 seconds';
  
  // Calculate time components
  const seconds = Math.floor((duration / 1000) % 60);
  const minutes = Math.floor((duration / (1000 * 60)) % 60);
  const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  const days = Math.floor(duration / (1000 * 60 * 60 * 24));
  
  // Determine if we should show milliseconds
  const milliseconds = showMilliseconds ? duration % 1000 : 0;
  
  // Format components based on compact setting
  const formatComponent = (value, singular, plural) => {
    if (value === 0) return '';
    
    if (compact) {
      const unit = singular.charAt(0);
      return `${value}${unit} `;
    } else {
      const unit = value === 1 ? singular : plural;
      return `${value} ${unit} `;
    }
  };
  
  // Build formatted string
  let result = '';
  
  if (days > 0) {
    result += formatComponent(days, 'day', 'days');
  }
  
  if (hours > 0) {
    result += formatComponent(hours, 'hour', 'hours');
  }
  
  if (minutes > 0) {
    result += formatComponent(minutes, 'minute', 'minutes');
  }
  
  if (seconds > 0 || (!result && !milliseconds)) {
    result += formatComponent(seconds, 'second', 'seconds');
  }
  
  if (showMilliseconds && milliseconds > 0 && !days && !hours && !minutes) {
    result += formatComponent(milliseconds, 'millisecond', 'milliseconds');
  }
  
  return result.trim();
}

/**
 * Format a range of values
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {Object} options - Formatting options
 * @param {Function} options.formatter - Formatter function for individual values
 * @param {string} options.separator - Separator between min and max
 * @returns {string} Formatted range
 */
export function formatRange(min, max, options = {}) {
  // Default options
  const {
    formatter = formatNumber,
    separator = ' - '
  } = options;
  
  // Handle invalid values
  if (min === null || min === undefined || isNaN(min)) {
    min = 'N/A';
  } else {
    min = formatter(min, options);
  }
  
  if (max === null || max === undefined || isNaN(max)) {
    max = 'N/A';
  } else {
    max = formatter(max, options);
  }
  
  // Format range
  return `${min}${separator}${max}`;
}

/**
 * Create a custom formatter function
 * @param {Function} formatter - Base formatter function 
 * @param {Object} defaultOptions - Default options for the formatter
 * @returns {Function} Custom formatter function
 */
export function createFormatter(formatter, defaultOptions = {}) {
  return (value, customOptions = {}) => {
    // Merge default options with custom options
    const options = { ...defaultOptions, ...customOptions };
    return formatter(value, options);
  };
}

// Export default formatting functions
export default {
  formatNumber,
  formatDate,
  formatPercentage,
  formatCurrency,
  formatFileSize,
  formatDuration,
  formatRange,
  createFormatter
}; 