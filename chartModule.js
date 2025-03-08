/* chartModule.js */

function initChartTabs() {
  const tabs = document.querySelectorAll('.chart-tab');
  const charts = document.querySelectorAll('.charts .chart');

  if (tabs.length === 0 || charts.length === 0) {
    console.error('Chart tabs or charts elements not found');
    return;
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      // Remove active class from all tabs and charts
      tabs.forEach(t => t.classList.remove('active'));
      charts.forEach(chart => chart.classList.remove('active'));

      // Add active class to the clicked tab
      this.classList.add('active');

      // Get the tab index and find corresponding chart element
      const tabIndex = this.getAttribute('data-tab');
      const targetChart = document.querySelector(`.charts .chart[data-chart="${tabIndex}"]`);

      if (targetChart) {
        targetChart.classList.add('active');
      } else {
        console.error('No chart found for tab ' + tabIndex);
      }
    });
  });
}

// Function to create and update charts with country data
function updateCharts(data) {
  console.log('Updating charts with data:', data);
  
  // Clear previous chart content
  clearCharts();
  
  try {
    // Create GDP chart (Bar chart)
    createGDPChart(data);
    
    // Create Revenue chart (Line chart)
    createRevenueChart(data);
    
    // Create Population chart (Pie chart)
    createPopulationChart(data);
    
    // Create Other chart (Mixed visualization)
    createOtherChart(data);
  } catch (error) {
    console.error('Error creating charts:', error);
    showChartError('Failed to create charts. Please try again.');
  }
}

// Clear all charts
function clearCharts() {
  const chartElements = document.querySelectorAll('.charts .chart');
  chartElements.forEach(chartElement => {
    // Remove all child elements except for titles/labels
    while (chartElement.firstChild) {
      chartElement.removeChild(chartElement.firstChild);
    }
  });
}

// Display error message in charts
function showChartError(message) {
  const chartElements = document.querySelectorAll('.charts .chart');
  chartElements.forEach(chartElement => {
    chartElement.innerHTML = `<div class="chart-error">${message}</div>`;
  });
}

// Create GDP Bar Chart
function createGDPChart(data) {
  const chartElement = document.querySelector('.chart[data-chart="0"]');
  if (!chartElement) return;
  
  // Get GDP data if available
  const gdpValue = data?.Economy?.GDP?.['purchasing power parity']?.text || 
                  data?.Economy?.GDP?.text || 
                  null;
  
  if (!gdpValue) {
    chartElement.innerHTML = '<div class="chart-info">No GDP data available</div>';
    return;
  }
  
  // Extract numeric value from text (e.g., "$1.774 trillion (2017 est.)" -> 1.774)
  const gdpNumeric = parseFloat(gdpValue.replace(/[^0-9.-]+/g, ''));
  
  if (isNaN(gdpNumeric)) {
    chartElement.innerHTML = `<div class="chart-info">GDP: ${gdpValue}</div>`;
    return;
  }
  
  // Create a simple bar chart
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };
  const width = chartElement.clientWidth - margin.left - margin.right;
  const height = chartElement.clientHeight - margin.top - margin.bottom;
  
  // Create SVG
  const svg = d3.select(chartElement)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);
  
  // Create scales
  const x = d3.scaleBand()
    .range([0, width])
    .padding(0.1)
    .domain(['GDP']);
  
  const y = d3.scaleLinear()
    .range([height, 0])
    .domain([0, gdpNumeric * 1.2]); // Add 20% padding
  
  // Add axes
  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x));
  
  svg.append('g')
    .call(d3.axisLeft(y).ticks(5));
  
  // Add bar
  svg.selectAll('.bar')
    .data([gdpNumeric])
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', x('GDP'))
    .attr('width', x.bandwidth())
    .attr('y', d => y(d))
    .attr('height', d => height - y(d))
    .attr('fill', '#69b3a2')
    .transition()
    .duration(750)
    .attr('y', d => y(d))
    .attr('height', d => height - y(d));
  
  // Add title
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', 0 - (margin.top / 2))
    .attr('text-anchor', 'middle')
    .style('font-size', '14px')
    .text('GDP (in trillions)');
    
  // Add data text
  chartElement.innerHTML += `<div class="chart-info">GDP: ${gdpValue}</div>`;
}

// Create Revenue Line Chart
function createRevenueChart(data) {
  const chartElement = document.querySelector('.chart[data-chart="1"]');
  if (!chartElement) return;
  
  // Get Budget revenue data if available
  const revenueValue = data?.Economy?.Budget?.revenues?.text || 
                      null;
  
  if (!revenueValue) {
    chartElement.innerHTML = '<div class="chart-info">No revenue data available</div>';
    return;
  }
  
  // For demonstration, since we only have a single data point
  // we'll show a simple visualization
  chartElement.innerHTML = `
    <div class="chart-title">Revenue</div>
    <div class="chart-value">${revenueValue}</div>
    <div class="chart-info">Note: Historical data not available</div>
  `;
}

// Create Population Pie Chart
function createPopulationChart(data) {
  const chartElement = document.querySelector('.chart[data-chart="2"]');
  if (!chartElement) return;
  
  // Get population data
  const populationValue = data?.['People and Society']?.Population?.text || null;
  
  if (!populationValue) {
    chartElement.innerHTML = '<div class="chart-info">No population data available</div>';
    return;
  }
  
  // Extract age structure if available
  const ageStructure = data?.['People and Society']?.['Age structure'] || null;
  
  if (!ageStructure) {
    chartElement.innerHTML = `<div class="chart-info">Population: ${populationValue}</div>`;
    return;
  }
  
  // Try to extract age groups
  const ageGroups = [];
  for (const key in ageStructure) {
    if (key.includes('years') && ageStructure[key]?.text) {
      const match = ageStructure[key].text.match(/(\d+(\.\d+)?)%/);
      if (match) {
        ageGroups.push({
          age: key,
          value: parseFloat(match[1])
        });
      }
    }
  }
  
  if (ageGroups.length === 0) {
    chartElement.innerHTML = `<div class="chart-info">Population: ${populationValue}</div>`;
    return;
  }
  
  // Create pie chart
  const width = chartElement.clientWidth;
  const height = chartElement.clientHeight;
  const radius = Math.min(width, height) / 2 - 20;
  
  const svg = d3.select(chartElement)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', `translate(${width/2},${height/2})`);
  
  // Color scale
  const color = d3.scaleOrdinal()
    .domain(ageGroups.map(d => d.age))
    .range(d3.schemeCategory10);
  
  // Pie generator
  const pie = d3.pie()
    .value(d => d.value)
    .sort(null);
  
  // Arc generator
  const arc = d3.arc()
    .innerRadius(0)
    .outerRadius(radius);
  
  // Create pie slices
  const slices = svg.selectAll('path')
    .data(pie(ageGroups))
    .enter()
    .append('path')
    .attr('d', arc)
    .attr('fill', d => color(d.data.age))
    .attr('stroke', 'white')
    .style('stroke-width', '2px')
    .style('opacity', 0.7);
  
  // Add title
  svg.append('text')
    .attr('x', 0)
    .attr('y', -height/2 + 20)
    .attr('text-anchor', 'middle')
    .style('font-size', '14px')
    .text('Population by Age Group');
  
  // Add legend
  const legend = svg.selectAll('.legend')
    .data(ageGroups)
    .enter()
    .append('g')
    .attr('class', 'legend')
    .attr('transform', (d, i) => `translate(-${width/3}, ${i * 20 - height/4})`);
  
  legend.append('rect')
    .attr('width', 10)
    .attr('height', 10)
    .attr('fill', d => color(d.age));
  
  legend.append('text')
    .attr('x', 15)
    .attr('y', 10)
    .text(d => `${d.age} (${d.value}%)`);
    
  // Add total population
  chartElement.innerHTML += `<div class="chart-info">Total Population: ${populationValue}</div>`;
}

// Create Other Chart (mixed visualization)
function createOtherChart(data) {
  const chartElement = document.querySelector('.chart[data-chart="3"]');
  if (!chartElement) return;
  
  // Get some interesting data points
  const areaValue = data?.Geography?.Area?.total?.text || null;
  const climateValue = data?.Geography?.Climate?.text || null;
  const governmentType = data?.Government?.['Government type']?.text || null;
  
  // Create a simple info card
  chartElement.innerHTML = `
    <div class="chart-title">Key Information</div>
    ${areaValue ? `<div class="chart-info"><strong>Area:</strong> ${areaValue}</div>` : ''}
    ${climateValue ? `<div class="chart-info"><strong>Climate:</strong> ${climateValue}</div>` : ''}
    ${governmentType ? `<div class="chart-info"><strong>Government Type:</strong> ${governmentType}</div>` : ''}
  `;
}

// Initialize chart tabs on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
  initChartTabs();
});

// Expose functions globally
window.initChartTabs = initChartTabs;
window.updateCharts = updateCharts; 