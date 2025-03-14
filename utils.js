/* utils.js - Utility helper functions for country data visualizations */

/**
 * Extract numeric stats from a data section object.
 * @param {object} section
 * @returns {Array}
 */
export function extractStats(section) {
  if (!section) return [];
  const stats = [];
  Object.keys(section).forEach(key => {
    const item = section[key];
    if (!item || typeof item !== 'object' || !item.text) return;
    const hasNumber = /\d/.test(item.text);
    if (hasNumber) {
      const isPrimary = isPrimaryStatistic(key);
      stats.push({
        label: formatLabel(key),
        value: formatValue(item.text),
        numericValue: extractNumber(item.text),
        isPrimary: isPrimary
      });
    }
    if (typeof item === 'object') {
      Object.keys(item).forEach(subKey => {
        const subItem = item[subKey];
        if (subItem && typeof subItem === 'object' && subItem.text) {
          const hasSubNumber = /\d/.test(subItem.text);
          if (hasSubNumber) {
            const isSubPrimary = isPrimaryStatistic(subKey) || isPrimaryStatistic(key);
            stats.push({
              label: formatLabel(`${key} - ${subKey}`),
              value: formatValue(subItem.text),
              numericValue: extractNumber(subItem.text),
              isPrimary: isSubPrimary
            });
          }
        }
      });
    }
  });
  return stats.sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;
    return a.label.localeCompare(b.label);
  });
}

/**
 * Formats a label to be more readable.
 * @param {string} label
 * @returns {string}
 */
export function formatLabel(label) {
  let formatted = label.replace(/[_-]/g, ' ');
  formatted = formatted.replace(/([A-Z])/g, ' $1');
  formatted = formatted.replace(/\b\w/g, c => c.toUpperCase());
  formatted = formatted.replace(/\bGdp\b/gi, 'GDP');
  formatted = formatted.replace(/\bGnp\b/gi, 'GNP');
  return formatted.trim();
}

/**
 * Formats a value to be more readable by adding commas and highlighting numbers.
 * @param {string} value
 * @returns {string}
 */
export function formatValue(value) {
  if (!value) return '';
  value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
  value = value.replace(/(\$[\d.,]+|\d+\.?\d*%|[\d.,]+ (million|billion|trillion))/g, '<span class="highlight">$1</span>');
  return value;
}

/**
 * Checks if a given key is considered a primary statistic.
 * @param {string} key
 * @returns {boolean}
 */
export function isPrimaryStatistic(key) {
  const primaryKeys = [
    'gdp', 'population', 'area', 'growth', 'rate', 'total',
    'revenue', 'expenditure', 'budget', 'inflation', 'unemployment',
    'debt', 'reserves', 'income', 'exports', 'imports'
  ];
  return primaryKeys.some(pk => key.toLowerCase().includes(pk));
}

/**
 * Extracts a numeric value from a text string.
 * @param {string} text
 * @returns {number|null}
 */
export function extractNumber(text) {
  if (!text) return null;
  const matches = text.match(/(\d+,?)+(\.\d+)?/);
  if (matches && matches[0]) {
    return parseFloat(matches[0].replace(/,/g, ''));
  }
  return null;
}

/**
 * Adds a stat section to a container element.
 * @param {HTMLElement} container
 * @param {string} title
 * @param {Array} stats
 */
export function addStatSection(container, title, stats) {
  if (!stats || stats.length === 0) return;
  const sectionElement = document.createElement('div');
  sectionElement.className = 'stat-section';
  sectionElement.innerHTML = `
    <h3 class="stat-section-title">${title}</h3>
    <div class="stat-items"></div>
  `;
  const statItemsContainer = sectionElement.querySelector('.stat-items');
  stats.forEach(stat => {
    const statItem = document.createElement('div');
    statItem.className = 'stat-item';
    if (stat.isPrimary) {
      statItem.classList.add('primary-stat');
    }
    
    // Create a structure that keeps both the visual layout and maintains compatibility
    let iconHtml = stat.icon ? `<div class="stat-icon"><i class="${stat.icon}"></i></div>` : '';
    
    statItem.innerHTML = `
      <div class="stat-header">
        ${iconHtml}
        <div class="stat-label">${stat.label}</div>
      </div>
      <div class="stat-content" style="display:none">
        <div class="stat-label">${stat.label}</div>
        <div class="stat-value">${stat.value}</div>
      </div>
      <div class="stat-value">${stat.value}</div>
    `;
    
    statItemsContainer.appendChild(statItem);
  });
  container.appendChild(sectionElement);
}

/**
 * Highlights matching text inside an element based on a search term.
 * @param {HTMLElement} element
 * @param {string} searchTerm
 */
export function highlightText(element, searchTerm) {
  if (!element || !searchTerm) return;
  if (element.classList.contains('stat-value') && !element.originalHTML) {
    element.originalHTML = element.innerHTML;
  }
  const text = element.textContent;
  const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
  const newHtml = text.replace(regex, '<mark>$1</mark>');
  element.innerHTML = newHtml;
}

/**
 * Escapes special regex characters in a string.
 * @param {string} string
 * @returns {string}
 */
export function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
} 