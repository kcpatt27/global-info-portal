/**
 * charts.js
 * 
 * Lightweight chart utility that creates and manages data visualizations.
 * Uses a minimal internal implementation with no dependencies.
 */

/**
 * Create a chart in the specified container
 * @param {HTMLElement|string} container - Container element or selector
 * @param {Object} config - Chart configuration
 * @returns {Object} Chart instance
 */
export function createChart(container, config = {}) {
  // Default configuration
  const defaults = {
    type: 'line',
    data: {
      labels: [],
      datasets: []
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2,
      animation: true,
      plugins: {
        tooltip: {
          enabled: true
        },
        legend: {
          display: true,
          position: 'top'
        }
      }
    }
  };
  
  // Merge with provided config
  const chartConfig = {
    ...defaults,
    ...config,
    options: {
      ...defaults.options,
      ...config.options
    }
  };
  
  // Get container element
  const containerEl = typeof container === 'string'
    ? document.querySelector(container)
    : container;
  
  if (!containerEl) {
    console.error('Chart container not found');
    return null;
  }
  
  // Set up the chart canvas
  const canvas = document.createElement('canvas');
  canvas.width = containerEl.clientWidth;
  canvas.height = chartConfig.options.maintainAspectRatio
    ? canvas.width / chartConfig.options.aspectRatio
    : containerEl.clientHeight;
  
  containerEl.innerHTML = '';
  containerEl.appendChild(canvas);
  
  // Create chart instance
  let chart = null;
  
  // Check if Chart.js is available
  if (typeof Chart !== 'undefined') {
    // Use Chart.js if available
    chart = new Chart(canvas.getContext('2d'), chartConfig);
  } else {
    // Fallback to basic rendering
    chart = createFallbackChart(canvas, chartConfig);
  }
  
  // Return public API
  return {
    /**
     * Update chart data
     * @param {Object} data - New chart data
     */
    update(data) {
      if (chart && chart.update) {
        // Using Chart.js
        chart.data = data;
        chart.update();
      } else if (chart && chart.setData) {
        // Using fallback implementation
        chart.setData(data);
      }
    },
    
    /**
     * Resize chart
     */
    resize() {
      if (chart && chart.resize) {
        // Using Chart.js
        chart.resize();
      } else if (chart && chart.render) {
        // Using fallback implementation
        canvas.width = containerEl.clientWidth;
        canvas.height = chartConfig.options.maintainAspectRatio
          ? canvas.width / chartConfig.options.aspectRatio
          : containerEl.clientHeight;
        chart.render();
      }
    },
    
    /**
     * Destroy chart instance
     */
    destroy() {
      if (chart && chart.destroy) {
        // Using Chart.js
        chart.destroy();
      }
      containerEl.innerHTML = '';
    }
  };
}

/**
 * Create a fallback chart when Chart.js is not available
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {Object} config - Chart configuration
 * @returns {Object} Fallback chart instance
 * @private
 */
function createFallbackChart(canvas, config) {
  const ctx = canvas.getContext('2d');
  let chartData = config.data;
  
  // Render function
  const render = () => {
    const { width, height } = canvas;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Check if we have data to render
    if (!chartData || !chartData.datasets || chartData.datasets.length === 0) {
      renderEmptyState();
      return;
    }
    
    // Set chart area with margins
    const margin = {
      top: 40,
      right: 20,
      bottom: 40,
      left: 50
    };
    
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    // Draw based on chart type
    switch (config.type) {
      case 'line':
        renderLineChart(chartData, chartWidth, chartHeight, margin);
        break;
      case 'bar':
        renderBarChart(chartData, chartWidth, chartHeight, margin);
        break;
      default:
        renderEmptyState('Unsupported chart type');
    }
  };
  
  // Render empty state
  const renderEmptyState = (message = 'No data available') => {
    const { width, height } = canvas;
    
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, width, height);
    
    ctx.font = '14px Arial';
    ctx.fillStyle = '#666';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(message, width / 2, height / 2);
    
    if (config.options.plugins.legend.display) {
      ctx.font = '16px Arial';
      ctx.fillStyle = '#333';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('Chart', width / 2, 10);
    }
  };
  
  // Render line chart
  const renderLineChart = (data, chartWidth, chartHeight, margin) => {
    const { labels, datasets } = data;
    const { width, height } = canvas;
    
    if (!labels || !labels.length) return;
    
    // Draw background
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, width, height);
    
    // Draw title
    if (config.options.plugins.legend.display) {
      ctx.font = '16px Arial';
      ctx.fillStyle = '#333';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(config.options.plugins.title?.text || 'Chart', width / 2, 10);
    }
    
    // Find min and max values for y-axis
    let minValue = Number.MAX_VALUE;
    let maxValue = Number.MIN_VALUE;
    
    datasets.forEach(dataset => {
      dataset.data.forEach(value => {
        if (value < minValue) minValue = value;
        if (value > maxValue) maxValue = value;
      });
    });
    
    // Add padding to min/max
    const valueRange = maxValue - minValue;
    minValue = Math.max(0, minValue - valueRange * 0.1);
    maxValue = maxValue + valueRange * 0.1;
    
    // Draw axes
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(margin.left, height - margin.bottom);
    ctx.lineTo(width - margin.right, height - margin.bottom);
    ctx.stroke();
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, height - margin.bottom);
    ctx.stroke();
    
    // Draw x-axis labels
    ctx.font = '12px Arial';
    ctx.fillStyle = '#666';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    const xStep = chartWidth / (labels.length - 1 || 1);
    
    labels.forEach((label, i) => {
      const x = margin.left + i * xStep;
      ctx.fillText(label, x, height - margin.bottom + 10);
    });
    
    // Draw y-axis labels
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    
    const yStep = chartHeight / 4;
    
    for (let i = 0; i <= 4; i++) {
      const y = height - margin.bottom - i * yStep;
      const value = minValue + (i / 4) * (maxValue - minValue);
      ctx.fillText(value.toFixed(1), margin.left - 10, y);
    }
    
    // Draw grid lines
    ctx.strokeStyle = '#eee';
    ctx.lineWidth = 1;
    
    for (let i = 1; i <= 4; i++) {
      const y = height - margin.bottom - i * yStep;
      
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(width - margin.right, y);
      ctx.stroke();
    }
    
    // Draw datasets
    datasets.forEach((dataset, datasetIndex) => {
      const { data, borderColor = '#3498db', backgroundColor = 'rgba(52, 152, 219, 0.2)' } = dataset;
      
      // Set line style
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      
      // Begin path for line
      ctx.beginPath();
      
      data.forEach((value, i) => {
        const x = margin.left + i * xStep;
        const yRatio = (value - minValue) / (maxValue - minValue);
        const y = height - margin.bottom - yRatio * chartHeight;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      // Stroke line
      ctx.stroke();
      
      // Fill area if backgroundColor provided
      if (backgroundColor) {
        ctx.lineTo(margin.left + (data.length - 1) * xStep, height - margin.bottom);
        ctx.lineTo(margin.left, height - margin.bottom);
        ctx.fillStyle = backgroundColor;
        ctx.fill();
      }
      
      // Draw points
      ctx.fillStyle = borderColor;
      
      data.forEach((value, i) => {
        const x = margin.left + i * xStep;
        const yRatio = (value - minValue) / (maxValue - minValue);
        const y = height - margin.bottom - yRatio * chartHeight;
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
    });
    
    // Draw legend
    if (config.options.plugins.legend.display) {
      const legendY = 20;
      let legendX = 20;
      
      datasets.forEach((dataset, i) => {
        const { label, borderColor = '#3498db' } = dataset;
        
        // Draw color box
        ctx.fillStyle = borderColor;
        ctx.fillRect(legendX, legendY, 15, 15);
        
        // Draw label
        ctx.font = '14px Arial';
        ctx.fillStyle = '#333';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(label || `Dataset ${i + 1}`, legendX + 20, legendY + 7);
        
        legendX += ctx.measureText(label || `Dataset ${i + 1}`).width + 40;
      });
    }
  };
  
  // Render bar chart
  const renderBarChart = (data, chartWidth, chartHeight, margin) => {
    const { labels, datasets } = data;
    const { width, height } = canvas;
    
    if (!labels || !labels.length) return;
    
    // Draw background
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, width, height);
    
    // Draw title
    if (config.options.plugins.legend.display) {
      ctx.font = '16px Arial';
      ctx.fillStyle = '#333';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(config.options.plugins.title?.text || 'Chart', width / 2, 10);
    }
    
    // Find max value for y-axis
    let maxValue = 0;
    
    datasets.forEach(dataset => {
      dataset.data.forEach(value => {
        if (value > maxValue) maxValue = value;
      });
    });
    
    // Add padding to max
    maxValue = maxValue * 1.1;
    
    // Draw axes
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(margin.left, height - margin.bottom);
    ctx.lineTo(width - margin.right, height - margin.bottom);
    ctx.stroke();
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, height - margin.bottom);
    ctx.stroke();
    
    // Draw x-axis labels
    ctx.font = '12px Arial';
    ctx.fillStyle = '#666';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    const barWidth = chartWidth / labels.length / datasets.length;
    const groupWidth = barWidth * datasets.length;
    const xStep = chartWidth / labels.length;
    
    labels.forEach((label, i) => {
      const x = margin.left + i * xStep + xStep / 2;
      ctx.fillText(label, x, height - margin.bottom + 10);
    });
    
    // Draw y-axis labels
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    
    const yStep = chartHeight / 4;
    
    for (let i = 0; i <= 4; i++) {
      const y = height - margin.bottom - i * yStep;
      const value = (i / 4) * maxValue;
      ctx.fillText(value.toFixed(1), margin.left - 10, y);
    }
    
    // Draw grid lines
    ctx.strokeStyle = '#eee';
    ctx.lineWidth = 1;
    
    for (let i = 1; i <= 4; i++) {
      const y = height - margin.bottom - i * yStep;
      
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(width - margin.right, y);
      ctx.stroke();
    }
    
    // Draw bars
    datasets.forEach((dataset, datasetIndex) => {
      const { data, backgroundColor = '#3498db', label } = dataset;
      
      ctx.fillStyle = backgroundColor;
      
      data.forEach((value, i) => {
        const x = margin.left + i * xStep + datasetIndex * barWidth;
        const barHeight = (value / maxValue) * chartHeight;
        const y = height - margin.bottom - barHeight;
        
        ctx.fillRect(x, y, barWidth, barHeight);
      });
    });
    
    // Draw legend
    if (config.options.plugins.legend.display) {
      const legendY = 20;
      let legendX = 20;
      
      datasets.forEach((dataset, i) => {
        const { label, backgroundColor = '#3498db' } = dataset;
        
        // Draw color box
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(legendX, legendY, 15, 15);
        
        // Draw label
        ctx.font = '14px Arial';
        ctx.fillStyle = '#333';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(label || `Dataset ${i + 1}`, legendX + 20, legendY + 7);
        
        legendX += ctx.measureText(label || `Dataset ${i + 1}`).width + 40;
      });
    }
  };
  
  // Initial render
  render();
  
  // Add window resize listener
  const resizeListener = () => {
    canvas.width = containerEl.clientWidth;
    canvas.height = config.options.maintainAspectRatio
      ? canvas.width / config.options.aspectRatio
      : containerEl.clientHeight;
    render();
  };
  
  window.addEventListener('resize', resizeListener);
  
  // Return chart instance
  return {
    setData(data) {
      chartData = data;
      render();
    },
    render,
    destroy() {
      window.removeEventListener('resize', resizeListener);
    }
  };
}

/**
 * Create a simple line chart
 * @param {HTMLElement|string} container - Container element or selector
 * @param {Array} labels - X-axis labels
 * @param {Array} data - Y-axis data points
 * @param {Object} options - Chart options
 * @returns {Object} Chart instance
 */
export function createLineChart(container, labels = [], data = [], options = {}) {
  const chartData = {
    labels,
    datasets: [{
      label: options.label || 'Line Chart',
      data,
      borderColor: options.color || '#3498db',
      backgroundColor: options.fill ? 'rgba(52, 152, 219, 0.2)' : undefined,
      tension: options.smooth ? 0.4 : 0
    }]
  };
  
  return createChart(container, {
    type: 'line',
    data: chartData,
    options
  });
}

/**
 * Create a simple bar chart
 * @param {HTMLElement|string} container - Container element or selector
 * @param {Array} labels - X-axis labels
 * @param {Array} data - Y-axis data points
 * @param {Object} options - Chart options
 * @returns {Object} Chart instance
 */
export function createBarChart(container, labels = [], data = [], options = {}) {
  const chartData = {
    labels,
    datasets: [{
      label: options.label || 'Bar Chart',
      data,
      backgroundColor: options.color || '#3498db'
    }]
  };
  
  return createChart(container, {
    type: 'bar',
    data: chartData,
    options
  });
}

export default {
  createChart,
  createLineChart,
  createBarChart
}; 