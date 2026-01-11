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
 * Checks whether a text value is ONLY a number (optionally with commas/decimals/sign).
 * This is used to decide whether a stat should receive a global ranking.
 * @param {string} text
 * @returns {boolean}
 */
export function isPureNumberText(text) {
  if (typeof text !== 'string') return false;
  const trimmed = text.trim();
  // Allow: -1,234.56  |  1234  |  0.5
  return /^-?\d{1,3}(,\d{3})*(\.\d+)?$/.test(trimmed) || /^-?\d+(\.\d+)?$/.test(trimmed);
}

/**
 * Extract ALL stats from a Factbook section recursively.
 * Includes non-numeric values; assigns numericValue ONLY when the text is purely numeric.
 * @param {object|Array} section
 * @param {object} [options]
 * @param {number} [options.maxDepth=7]
 * @returns {Array<{label:string,value:string,numericValue:number|null,isPrimary:boolean,rawText:string,path:string[]}>}
 */
export function extractAllStats(section, options = {}) {
  if (!section) return [];

  const maxDepth = typeof options.maxDepth === 'number' ? options.maxDepth : 7;
  const stats = [];
  const visited = typeof WeakSet !== 'undefined' ? new WeakSet() : null;

  const pushStat = (path, rawText) => {
    const labelRaw = path.join(' - ');
    const label = formatLabel(labelRaw);
    const isPrimary = path.some(k => isPrimaryStatistic(String(k)));
    const numericValue = isPureNumberText(rawText) ? extractNumber(rawText) : null;

    stats.push({
      label,
      value: formatValue(rawText),
      numericValue,
      isPrimary,
      rawText,
      path
    });
  };

  const walk = (node, path, depth) => {
    if (node == null) return;
    if (depth > maxDepth) return;

    if (typeof node === 'object') {
      if (visited) {
        if (visited.has(node)) return;
        visited.add(node);
      }

      // If this node has a text leaf, treat it as a stat
      if (typeof node.text === 'string' && node.text.trim() !== '') {
        pushStat(path, node.text);
      }

      if (Array.isArray(node)) {
        node.forEach((child, idx) => walk(child, [...path, String(idx)], depth + 1));
        return;
      }

      Object.keys(node).forEach(key => {
        if (key === 'text') return;
        walk(node[key], [...path, key], depth + 1);
      });
    }
  };

  walk(section, [], 0);

  // Preserve source order by default (CIA/Factbook ordering).
  // If callers want sorting, they can sort the returned array themselves.
  return stats;
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
  
  // Clean the text
  const cleanText = text.replace(/,/g, '').toLowerCase();
  
  // Check for common words like million, billion, trillion
  const multiplierMatch = cleanText.match(/(-?\d+\.?\d*)\s*(trillion|billion|million)/i);
  if (multiplierMatch) {
    let num = parseFloat(multiplierMatch[1]);
    const multiplier = multiplierMatch[2].toLowerCase();
    
    if (multiplier === 'trillion') num *= 1000000000000;
    else if (multiplier === 'billion') num *= 1000000000;
    else if (multiplier === 'million') num *= 1000000;
    
    return num;
  }
  
  // Standard number extraction
  const matches = cleanText.match(/-?\d+\.?\d*/);
  if (matches && matches[0]) {
    return parseFloat(matches[0]);
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
    <button class="stat-section-toggle" type="button" aria-expanded="true">
      <span class="stat-section-title">${title}</span>
      <span class="stat-section-meta">
        <span class="stat-section-count">${stats.length}</span>
        <i class="fas fa-chevron-down stat-section-chevron" aria-hidden="true"></i>
      </span>
    </button>
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

    // Create stat ranking element if ranking data is available
    let rankingHtml = '';
    if (stat.ranking) {
      // Show rank with total for context (e.g., "#5 / 195")
      const totalText = stat.rankTotal ? ` <span class="rank-total">/ ${stat.rankTotal}</span>` : '';
      rankingHtml = `<div class="stat-ranking">#${stat.ranking}${totalText}</div>`;
    }

    // Render header (title + ranking) and data below
    statItem.innerHTML = `
      <div class="stat-header">
        <div class="stat-title">${iconHtml}<span class="stat-title-text stat-label">${stat.label}</span></div>
        ${rankingHtml}
      </div>
      <div class="stat-data">${stat.value}</div>
    `;
    
    statItemsContainer.appendChild(statItem);
  });

  // Collapsible behavior
  const toggleBtn = sectionElement.querySelector('.stat-section-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const isCollapsed = sectionElement.classList.toggle('collapsed');
      toggleBtn.setAttribute('aria-expanded', isCollapsed ? 'false' : 'true');
      const chevron = toggleBtn.querySelector('.stat-section-chevron');
      if (chevron) {
        chevron.className = `fas fa-chevron-${isCollapsed ? 'right' : 'down'} stat-section-chevron`;
      }
    });
  }

  container.appendChild(sectionElement);
}

/**
 * Highlights matching text inside an element based on a search term.
 * @param {HTMLElement} element
 * @param {string} searchTerm
 */
export function highlightText(element, searchTerm) {
  if (!element || !searchTerm) return;
  if (!element.originalHTML) {
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