/**
 * table.js
 * 
 * Utilities for creating interactive tables:
 * - Sortable columns
 * - Pagination
 * - Responsive design
 * - Zebra striping
 * - Row highlighting
 */

/**
 * Create an interactive table
 * @param {HTMLElement|string} container - Container element or selector
 * @param {Object} data - Table data
 * @param {Array} data.headers - Table headers
 * @param {Array} data.rows - Table rows (array of arrays)
 * @param {Object} options - Table options
 * @returns {Object} Table API
 */
export function createTable(container, data = { headers: [], rows: [] }, options = {}) {
  // Default options
  const {
    sortable = false,
    zebra = false,
    responsive = true,
    pagination = false,
    pageSize = 20,
    highlights = false,
    rowClickCallback = null,
    headerClickCallback = null,
    tableClass = '',
    defaultSort = { column: 0, direction: 'asc' }
  } = options;
  
  // Get container element
  const containerEl = typeof container === 'string' 
    ? document.querySelector(container) 
    : container;
  
  if (!containerEl) {
    console.error('Table container not found');
    return null;
  }
  
  // Set up state
  const state = {
    headers: data.headers || [],
    rows: data.rows || [],
    sortColumn: defaultSort.column,
    sortDirection: defaultSort.direction,
    currentPage: 0,
    pageSize: pageSize,
    highlighted: new Set()
  };
  
  // Create table elements
  const tableEl = document.createElement('table');
  tableEl.className = `data-table ${tableClass} ${responsive ? 'responsive' : ''}`.trim();
  
  const theadEl = document.createElement('thead');
  const tbodyEl = document.createElement('tbody');
  
  // Pagination elements
  let paginationEl = null;
  
  // Render table header
  function renderHeader() {
    theadEl.innerHTML = '';
    
    if (state.headers.length === 0) {
      return;
    }
    
    const headerRow = document.createElement('tr');
    
    state.headers.forEach((header, index) => {
      const th = document.createElement('th');
      
      // Set sortable attributes if enabled
      if (sortable) {
        th.className = 'sortable';
        if (state.sortColumn === index) {
          th.classList.add(state.sortDirection === 'asc' ? 'sort-asc' : 'sort-desc');
        }
        
        th.addEventListener('click', () => {
          handleHeaderClick(index);
        });
      }
      
      // Set header content
      if (typeof header === 'string') {
        th.textContent = header;
      } else {
        th.innerHTML = header;
      }
      
      headerRow.appendChild(th);
    });
    
    theadEl.appendChild(headerRow);
  }
  
  // Render table body
  function renderBody() {
    tbodyEl.innerHTML = '';
    
    if (state.rows.length === 0) {
      const emptyRow = document.createElement('tr');
      const emptyCell = document.createElement('td');
      emptyCell.colSpan = state.headers.length || 1;
      emptyCell.className = 'empty-table';
      emptyCell.textContent = 'No data available';
      
      emptyRow.appendChild(emptyCell);
      tbodyEl.appendChild(emptyRow);
      return;
    }
    
    // Apply sorting if enabled
    let displayRows = [...state.rows];
    if (sortable && state.sortColumn !== null) {
      displayRows.sort((a, b) => {
        const aVal = a[state.sortColumn];
        const bVal = b[state.sortColumn];
        
        // Handle different data types
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return state.sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        } else {
          const aStr = String(aVal || '');
          const bStr = String(bVal || '');
          return state.sortDirection === 'asc' ? 
            aStr.localeCompare(bStr) : 
            bStr.localeCompare(aStr);
        }
      });
    }
    
    // Apply pagination if enabled
    if (pagination) {
      const startIndex = state.currentPage * state.pageSize;
      displayRows = displayRows.slice(startIndex, startIndex + state.pageSize);
    }
    
    // Render rows
    displayRows.forEach((row, rowIndex) => {
      const tr = document.createElement('tr');
      
      // Apply zebra striping if enabled
      if (zebra && rowIndex % 2 === 1) {
        tr.classList.add('zebra');
      }
      
      // Apply highlighting if this row is highlighted
      const rowId = row.id || rowIndex;
      if (highlights && state.highlighted.has(rowId)) {
        tr.classList.add('highlighted');
      }
      
      // Create cells
      row.forEach((cell, cellIndex) => {
        const td = document.createElement('td');
        
        // Set data attribute for responsive tables
        if (responsive && state.headers[cellIndex]) {
          td.dataset.label = state.headers[cellIndex];
        }
        
        // Set cell content
        if (cell === null || cell === undefined) {
          td.innerHTML = '<span class="empty-cell">—</span>';
        } else if (typeof cell === 'string') {
          td.textContent = cell;
        } else {
          td.innerHTML = cell;
        }
        
        tr.appendChild(td);
      });
      
      // Add row click handler if provided
      if (rowClickCallback) {
        tr.addEventListener('click', () => {
          rowClickCallback(row, rowIndex);
        });
        tr.classList.add('clickable');
      }
      
      tbodyEl.appendChild(tr);
    });
  }
  
  // Render pagination controls
  function renderPagination() {
    if (!pagination || !paginationEl) {
      return;
    }
    
    paginationEl.innerHTML = '';
    
    const totalPages = Math.ceil(state.rows.length / state.pageSize);
    
    if (totalPages <= 1) {
      return;
    }
    
    // Create pagination info
    const paginationInfo = document.createElement('div');
    paginationInfo.className = 'pagination-info';
    
    const startItem = state.currentPage * state.pageSize + 1;
    const endItem = Math.min((state.currentPage + 1) * state.pageSize, state.rows.length);
    
    paginationInfo.textContent = `${startItem}-${endItem} of ${state.rows.length}`;
    
    // Create previous button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'pagination-btn prev-btn';
    prevBtn.innerHTML = '&laquo;';
    prevBtn.disabled = state.currentPage === 0;
    prevBtn.addEventListener('click', () => {
      if (state.currentPage > 0) {
        state.currentPage--;
        renderBody();
        renderPagination();
      }
    });
    
    // Create next button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'pagination-btn next-btn';
    nextBtn.innerHTML = '&raquo;';
    nextBtn.disabled = state.currentPage >= totalPages - 1;
    nextBtn.addEventListener('click', () => {
      if (state.currentPage < totalPages - 1) {
        state.currentPage++;
        renderBody();
        renderPagination();
      }
    });
    
    // Create page buttons
    const pageButtons = document.createElement('div');
    pageButtons.className = 'pagination-pages';
    
    // Determine page range to show
    let startPage = Math.max(0, state.currentPage - 2);
    let endPage = Math.min(totalPages - 1, startPage + 4);
    
    // Adjust start if we're at the end
    if (endPage - startPage < 4) {
      startPage = Math.max(0, endPage - 4);
    }
    
    // Add first page button if needed
    if (startPage > 0) {
      const firstPageBtn = document.createElement('button');
      firstPageBtn.className = 'pagination-btn page-btn';
      firstPageBtn.textContent = '1';
      firstPageBtn.addEventListener('click', () => {
        state.currentPage = 0;
        renderBody();
        renderPagination();
      });
      pageButtons.appendChild(firstPageBtn);
      
      if (startPage > 1) {
        const ellipsis = document.createElement('span');
        ellipsis.className = 'pagination-ellipsis';
        ellipsis.textContent = '...';
        pageButtons.appendChild(ellipsis);
      }
    }
    
    // Add page buttons
    for (let i = startPage; i <= endPage; i++) {
      const pageBtn = document.createElement('button');
      pageBtn.className = 'pagination-btn page-btn';
      if (i === state.currentPage) {
        pageBtn.classList.add('active');
      }
      pageBtn.textContent = i + 1;
      pageBtn.addEventListener('click', () => {
        state.currentPage = i;
        renderBody();
        renderPagination();
      });
      pageButtons.appendChild(pageBtn);
    }
    
    // Add last page button if needed
    if (endPage < totalPages - 1) {
      if (endPage < totalPages - 2) {
        const ellipsis = document.createElement('span');
        ellipsis.className = 'pagination-ellipsis';
        ellipsis.textContent = '...';
        pageButtons.appendChild(ellipsis);
      }
      
      const lastPageBtn = document.createElement('button');
      lastPageBtn.className = 'pagination-btn page-btn';
      lastPageBtn.textContent = totalPages;
      lastPageBtn.addEventListener('click', () => {
        state.currentPage = totalPages - 1;
        renderBody();
        renderPagination();
      });
      pageButtons.appendChild(lastPageBtn);
    }
    
    // Assemble pagination container
    paginationEl.appendChild(prevBtn);
    paginationEl.appendChild(pageButtons);
    paginationEl.appendChild(nextBtn);
    paginationEl.appendChild(paginationInfo);
  }
  
  // Handle header click for sorting
  function handleHeaderClick(columnIndex) {
    if (headerClickCallback) {
      headerClickCallback(columnIndex);
    }
    
    if (state.sortColumn === columnIndex) {
      // Toggle sort direction
      state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Set new sort column
      state.sortColumn = columnIndex;
      state.sortDirection = 'asc';
    }
    
    renderHeader();
    renderBody();
  }
  
  // Initialize table
  function initialize() {
    // Clear container
    containerEl.innerHTML = '';
    
    // Create table structure
    tableEl.appendChild(theadEl);
    tableEl.appendChild(tbodyEl);
    containerEl.appendChild(tableEl);
    
    // Create pagination if enabled
    if (pagination) {
      paginationEl = document.createElement('div');
      paginationEl.className = 'table-pagination';
      containerEl.appendChild(paginationEl);
    }
    
    // Initial render
    renderHeader();
    renderBody();
    if (pagination) {
      renderPagination();
    }
  }
  
  // Initialize
  initialize();
  
  // Return public API
  return {
    /**
     * Update table data
     * @param {Object} newData - New table data
     */
    update(newData) {
      if (newData.headers) {
        state.headers = newData.headers;
      }
      
      if (newData.rows) {
        state.rows = newData.rows;
        state.currentPage = 0; // Reset to first page
      }
      
      renderHeader();
      renderBody();
      
      if (pagination) {
        renderPagination();
      }
    },
    
    /**
     * Sort table by column
     * @param {number} columnIndex - Column index to sort by
     * @param {string} direction - Sort direction ('asc' or 'desc')
     */
    sort(columnIndex, direction = 'asc') {
      if (columnIndex < 0 || columnIndex >= state.headers.length) {
        console.warn('Invalid column index for sorting');
        return;
      }
      
      state.sortColumn = columnIndex;
      state.sortDirection = direction === 'asc' ? 'asc' : 'desc';
      
      renderHeader();
      renderBody();
    },
    
    /**
     * Go to a specific page
     * @param {number} pageNumber - Page number (0-based)
     */
    goToPage(pageNumber) {
      if (!pagination) return;
      
      const totalPages = Math.ceil(state.rows.length / state.pageSize);
      state.currentPage = Math.max(0, Math.min(pageNumber, totalPages - 1));
      
      renderBody();
      renderPagination();
    },
    
    /**
     * Set page size
     * @param {number} size - Number of rows per page
     */
    setPageSize(size) {
      if (!pagination || size < 1) return;
      
      state.pageSize = size;
      state.currentPage = 0; // Reset to first page
      
      renderBody();
      renderPagination();
    },
    
    /**
     * Highlight a row
     * @param {string|number} rowId - Row ID or index
     */
    highlightRow(rowId) {
      if (!highlights) return;
      
      state.highlighted.add(rowId);
      renderBody();
    },
    
    /**
     * Remove highlight from a row
     * @param {string|number} rowId - Row ID or index
     */
    unhighlightRow(rowId) {
      if (!highlights) return;
      
      state.highlighted.delete(rowId);
      renderBody();
    },
    
    /**
     * Clear all highlights
     */
    clearHighlights() {
      if (!highlights) return;
      
      state.highlighted.clear();
      renderBody();
    },
    
    /**
     * Get table data
     * @returns {Object} Current table data
     */
    getData() {
      return {
        headers: [...state.headers],
        rows: [...state.rows]
      };
    },
    
    /**
     * Get current state
     * @returns {Object} Current table state
     */
    getState() {
      return { ...state };
    },
    
    /**
     * Refresh table
     */
    refresh() {
      renderHeader();
      renderBody();
      if (pagination) {
        renderPagination();
      }
    },
    
    /**
     * Destroy table and clean up
     */
    destroy() {
      containerEl.innerHTML = '';
    }
  };
}

/**
 * Create a simple data table from an array of objects
 * @param {HTMLElement|string} container - Container element or selector
 * @param {Array} items - Array of objects
 * @param {Array} columns - Column definitions
 * @param {Object} options - Table options
 * @returns {Object} Table API
 */
export function createDataTable(container, items = [], columns = [], options = {}) {
  // Map object data to table format
  const headers = columns.map(col => col.header || col.field);
  
  const rows = items.map(item => {
    return columns.map(col => {
      // Use render function if provided
      if (col.render && typeof col.render === 'function') {
        return col.render(item[col.field], item);
      }
      
      // Otherwise use raw value
      return item[col.field];
    });
  });
  
  return createTable(container, { headers, rows }, options);
}

export default {
  createTable,
  createDataTable
}; 