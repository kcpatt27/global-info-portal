/**
 * SpiderChart.js
 *
 * D3.js spider/radar chart component for visualizing multi-dimensional data
 * Used for displaying country influence scores and other comparative metrics
 */

// D3 will be available globally from the HTML script tag

/**
 * SpiderChart class for creating radar/spider charts
 */
export class SpiderChart {
  /**
   * Create a new SpiderChart instance
   * @param {Object} config - Chart configuration
   * @param {string} config.container - CSS selector for container element
   * @param {number} config.width - Chart width
   * @param {number} config.height - Chart height
   * @param {Array} config.data - Data points for the chart
   * @param {Array} config.axes - Axis labels
   * @param {Object} config.options - Additional options
   */
  constructor(config = {}) {
    // Check if D3 is available
    if (!window.d3) {
      console.error('D3.js is not loaded. Spider chart cannot be created.');
      return;
    }

    this.d3 = window.d3;
    this.container = config.container || '#spider-chart';
    this.width = config.width || 400;
    this.height = config.height || 400;
    this.data = (config.data || []).map(d => Number(d) || 0);
    this.axes = config.axes || [];
    this.options = {
      margin: { top: 50, right: 50, bottom: 50, left: 50 },
      maxValue: config.options?.maxValue || 100,
      levels: config.options?.levels || 5,
      color: config.options?.color || '#4CAF50',
      backgroundColor: config.options?.backgroundColor || 'rgba(76, 175, 80, 0.1)',
      strokeWidth: config.options?.strokeWidth || 2,
      dotRadius: config.options?.dotRadius || 4,
      ...config.options
    };
    // Per-axis colors (accept array in options.colors)
    this.colors = config.options?.colors || [
      '#4A90E2', // People
      '#F5A623', // Money
      '#7ED321', // Reach
      '#9B59B6', // Resources
      '#E74C3C'  // Quality
    ];
    this.colorScale = this.d3.scaleOrdinal().range(this.colors);

    this.svg = null;
    this.tooltip = null;

    this.init();
  }

  /**
   * Initialize the chart
   */
  init() {
    this.setupSVG();
    this.setupTooltip();
    this.render();
  }

  /**
   * Set up the SVG element
   */
  setupSVG() {
    const container = this.d3.select(this.container);
    container.selectAll('*').remove(); // Clear existing content

    this.svg = container.append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('viewBox', `0 0 ${this.width} ${this.height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Create main group with margins
    this.chartGroup = this.svg.append('g')
      .attr('transform', `translate(${this.options.margin.left}, ${this.options.margin.top})`);

    const chartWidth = this.width - this.options.margin.left - this.options.margin.right;
    const chartHeight = this.height - this.options.margin.top - this.options.margin.bottom;

    this.radius = Math.min(chartWidth, chartHeight) / 2;
    this.centerX = chartWidth / 2;
    this.centerY = chartHeight / 2;
  }

  /**
   * Set up tooltip
   */
  setupTooltip() {
    // Remove existing tooltip
    this.d3.select('.spider-tooltip').remove();

    this.tooltip = this.d3.select('body').append('div')
      .attr('class', 'spider-tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('padding', '8px 12px')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('z-index', '1000');
  }

  /**
   * Render the spider chart
   */
  render() {
    if (!this.data.length || !this.axes.length) {
      this.renderEmptyState();
      return;
    }

    this.drawLevels();
    this.drawAxes();
    this.drawAxesLabels();
    this.drawDataPolygon();
    this.drawDataPoints();
  }

  /**
   * Render empty state when no data
   */
  renderEmptyState() {
    this.chartGroup.append('text')
      .attr('x', this.centerX)
      .attr('y', this.centerY)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .style('fill', '#999')
      .style('font-size', '14px')
      .text('No data available');
  }

  /**
   * Draw concentric level circles
   */
  drawLevels() {
    const levels = this.options.levels;
    const levelRadius = this.radius / levels;

    for (let i = 1; i <= levels; i++) {
      const r = levelRadius * i;
      this.chartGroup.append('circle')
        .attr('cx', this.centerX)
        .attr('cy', this.centerY)
        .attr('r', r)
        .style('fill', 'none')
        .style('stroke', '#ddd')
        .style('stroke-width', '1px')
        .style('stroke-dasharray', i === levels ? 'none' : '2,2');
    }
  }

  /**
   * Draw axis lines
   */
  drawAxes() {
    const angleStep = (Math.PI * 2) / this.axes.length;

    this.axes.forEach((axis, i) => {
      const angle = angleStep * i - Math.PI / 2; // Start from top
      const x = this.centerX + Math.cos(angle) * this.radius;
      const y = this.centerY + Math.sin(angle) * this.radius;

      this.chartGroup.append('line')
        .attr('x1', this.centerX)
        .attr('y1', this.centerY)
        .attr('x2', x)
        .attr('y2', y)
        .style('stroke', '#ccc')
        .style('stroke-width', '1px');
    });
  }

  /**
   * Draw axis labels
   */
  drawAxesLabels() {
    const angleStep = (Math.PI * 2) / this.axes.length;

    this.axes.forEach((axis, i) => {
      const angle = angleStep * i - Math.PI / 2;
      const x = this.centerX + Math.cos(angle) * (this.radius + 20);
      const y = this.centerY + Math.sin(angle) * (this.radius + 20);

      this.chartGroup.append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('text-anchor', this.getTextAnchor(angle))
        .attr('dominant-baseline', this.getDominantBaseline(angle))
        .style('font-size', '12px')
        .style('fill', () => this.colorScale(i))
        .style('font-weight', '600')
        .text(axis);
    });
  }

  /**
   * Get text anchor based on angle
   */
  getTextAnchor(angle) {
    const normalizedAngle = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

    if (normalizedAngle > Math.PI * 0.25 && normalizedAngle < Math.PI * 0.75) return 'start';
    if (normalizedAngle > Math.PI * 1.25 && normalizedAngle < Math.PI * 1.75) return 'end';
    return 'middle';
  }

  /**
   * Get dominant baseline based on angle
   */
  getDominantBaseline(angle) {
    const normalizedAngle = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

    if (normalizedAngle > Math.PI * 0.5 && normalizedAngle < Math.PI * 1.5) return 'text-before-edge';
    if (normalizedAngle < Math.PI * 0.5 || normalizedAngle > Math.PI * 1.5) return 'text-after-edge';
    return 'middle';
  }

  /**
   * Draw the data polygon
   */
  drawDataPolygon() {
    const angleStep = (Math.PI * 2) / this.axes.length;
    const points = this.data.map((value, i) => {
      const angle = angleStep * i - Math.PI / 2;
      const normalizedValue = Math.max(0, Math.min(1, value / this.options.maxValue));
      const r = normalizedValue * this.radius;
      const x = this.centerX + Math.cos(angle) * r;
      const y = this.centerY + Math.sin(angle) * r;
      return `${x},${y}`;
    }).join(' ');

    // Draw background fill
    // background fill (use neutral translucent fill)
    this.chartGroup.append('polygon')
      .attr('points', points)
      .style('fill', this.options.backgroundColor)
      .style('stroke', 'none')
      .style('opacity', 0.9);

    // Draw border (use a darker neutral stroke)
    this.chartGroup.append('polygon')
      .attr('points', points)
      .style('fill', 'none')
      .style('stroke', '#333')
      .style('stroke-width', this.options.strokeWidth);

    // Optionally draw small colored markers along polygon connecting segments
    // (we already color individual data points; polygon remains neutral)
  }

  /**
   * Draw data points
   */
  drawDataPoints() {
    const angleStep = (Math.PI * 2) / this.axes.length;

    this.data.forEach((value, i) => {
      const angle = angleStep * i - Math.PI / 2;
      const normalizedValue = Math.max(0, Math.min(1, value / this.options.maxValue));
      const r = normalizedValue * this.radius;
      const x = this.centerX + Math.cos(angle) * r;
      const y = this.centerY + Math.sin(angle) * r;

      const point = this.chartGroup.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', this.options.dotRadius)
        .style('fill', () => this.colorScale(i))
        .style('stroke', '#0f0f0f')
        .style('stroke-width', '2px')
        .style('cursor', 'pointer');

      // Add tooltip
      point.on('mouseover', () => {
        const axisLabel = this.axes[i];
        this.tooltip.style('visibility', 'visible')
          .html(`<strong>${axisLabel}</strong><br/>Value: ${value}`)
          .style('left', (this.d3.event.pageX + 10) + 'px')
          .style('top', (this.d3.event.pageY - 10) + 'px');
      })
      .on('mousemove', () => {
        this.tooltip.style('left', (this.d3.event.pageX + 10) + 'px')
          .style('top', (this.d3.event.pageY - 10) + 'px');
      })
      .on('mouseout', () => {
        this.tooltip.style('visibility', 'hidden');
      });
    });
  }

  /**
   * Update chart data
   * @param {Array} newData - New data points
   * @param {Array} newAxes - New axis labels
   */
  updateData(newData, newAxes = null) {
    this.data = newData || [];
    if (newAxes) {
      this.axes = newAxes;
    }
    this.render();
  }

  /**
   * Resize the chart
   * @param {number} newWidth - New width
   * @param {number} newHeight - New height
   */
  resize(newWidth, newHeight) {
    this.width = newWidth;
    this.height = newHeight;
    this.init();
  }

  /**
   * Destroy the chart and clean up
   */
  destroy() {
    if (this.svg) {
      this.svg.remove();
    }
    if (this.tooltip) {
      this.tooltip.remove();
    }
  }
}

/**
 * Create a spider chart for influence scores
 * @param {string} container - Container selector
 * @param {Object} influenceData - Influence score data
 * @returns {SpiderChart} Spider chart instance
 */
export function createInfluenceSpiderChart(container, influenceData) {
  // Check if D3 is available
  if (!window.d3) {
    console.error('D3.js not available for spider chart');
    return null;
  }

  // Extract influence metrics and values
  const axes = Object.keys(influenceData);
  const values = Object.values(influenceData);

  console.log('Creating spider chart with data:', { axes, values });

  return new SpiderChart({
    container,
    width: 250,
    height: 250,
    data: values,
    axes: axes,
    options: {
      maxValue: 100,
      levels: 5,
      color: '#69b3a2',
      backgroundColor: 'rgba(105, 179, 162, 0.25)',
      strokeWidth: 2,
      dotRadius: 4,
      margin: { top: 40, right: 40, bottom: 40, left: 40 }
    }
  });
}

export default SpiderChart;