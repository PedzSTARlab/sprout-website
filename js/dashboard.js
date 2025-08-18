// SPROUT Dashboard JavaScript - Now using Real Research Data
console.log('Dashboard JavaScript loaded successfully');

// Northwestern University brand colors
const NU_COLORS = {
  purple: '#4E2A84',
  lightPurple: '#836EAA',
  gold: '#FFD100',
  darkPurple: '#401F68',
  gray: '#716C6B',
  lightGray: '#D8D6D0',
  white: '#FFFFFF',
  black: '#000000'
};

// Enhanced color palette for charts
const chartColors = [
    NU_COLORS.purple,
    NU_COLORS.gold,
    NU_COLORS.lightPurple,
    NU_COLORS.darkPurple,
    NU_COLORS.gray,
    '#9B4F96', // Additional purple shade
    '#F7931E', // Additional gold shade
    '#5A4FCF', // Additional blue-purple
    '#C5B358', // Muted gold
    '#8B7355'  // Brown accent
];

let dashboardData = null;
let dataProcessor = null;

// Load dashboard data from real research files
async function loadDashboardData() {
  try {
    console.log('Loading dashboard data from real research files...');
    
    // Wait for DOM elements to be ready
    if (!document.getElementById('total-participants')) {
      console.log('Dashboard elements not ready, retrying in 500ms...');
      setTimeout(loadDashboardData, 500);
      return;
    }
    
    // Initialize data processor if not already done
    if (!dataProcessor) {
      dataProcessor = new DataProcessor();
    }
    
    // Generate dashboard data from TSV/Excel files
    dashboardData = await dataProcessor.generateDashboardData();
    console.log('Dashboard data loaded successfully from research files:', dashboardData);
    
    // Update metrics
    updateMetrics(dashboardData.overview);
    
    // Create comprehensive charts matching Python version
    createUSMap(dashboardData.geographic);
    createCityTable(dashboardData.cityTable);
    createAgeScatterChart(dashboardData.ageData);
    createIncomeGroupsChart(dashboardData.demographics.incomeGroups);
    createChildRaceChart(dashboardData.demographics.raceEthnicity);
    createHispanicChart(dashboardData.demographics.hispanicCounts);
    createQualityControlChart(dashboardData.qualityControl);
    
    console.log('Dashboard initialized successfully with real research data');
    
  } catch (error) {
    console.error('Error loading dashboard data from research files:', error);
    showErrorMessage();
  }
}

// Update metric cards to match Python version
function updateMetrics(overview) {
  const elements = {
    'total-participants': overview.totalParticipants?.toLocaleString() || 'N/A',
    'active-cities': overview.activeCities || 'N/A',
    'avg-age': overview.avgAge || 'N/A',
    'age-range': overview.ageRange || 'N/A'
  };

  Object.entries(elements).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  });
}

// Create US Map with Census Regions (matching Python version)
function createUSMap(cityData) {
  const element = document.getElementById('us-map');
  if (!element || !cityData) {
    console.warn('US Map element not found or no data available');
    return;
  }

  // US Census regions and colors (matching Python version)
  const regionColors = {
    'West': '#FFA500',       // Orange
    'Midwest': '#228B22',    // Green
    'South': '#1E90FF',      // Blue
    'Northeast': '#FF0000'   // Red
  };

  const stateRegionMap = {
    // WEST
    'WA': 'West', 'OR': 'West', 'CA': 'West', 'NV': 'West', 'ID': 'West', 
    'MT': 'West', 'WY': 'West', 'UT': 'West', 'CO': 'West', 'AK': 'West', 'HI': 'West',
    // MIDWEST  
    'ND': 'Midwest', 'SD': 'Midwest', 'NE': 'Midwest', 'KS': 'Midwest',
    'MN': 'Midwest', 'IA': 'Midwest', 'MO': 'Midwest',
    'WI': 'Midwest', 'IL': 'Midwest', 'IN': 'Midwest', 'OH': 'Midwest', 'MI': 'Midwest',
    // SOUTH
    'DE': 'South', 'MD': 'South', 'VA': 'South', 'WV': 'South', 'NC': 'South', 'SC': 'South',
    'GA': 'South', 'FL': 'South', 'KY': 'South', 'TN': 'South', 'MS': 'South', 'AL': 'South',
    'OK': 'South', 'TX': 'South', 'AR': 'South', 'LA': 'South',
    // NORTHEAST
    'ME': 'Northeast', 'NH': 'Northeast', 'VT': 'Northeast', 'MA': 'Northeast', 'RI': 'Northeast',
    'CT': 'Northeast', 'NY': 'Northeast', 'PA': 'Northeast', 'NJ': 'Northeast'
  };

  // Create choropleth base map
  const states = Object.keys(stateRegionMap);
  const regions = states.map(state => stateRegionMap[state]);
  const regionCodes = regions.map(region => Object.keys(regionColors).indexOf(region));

  const choroplethTrace = {
    type: 'choropleth',
    locations: states,
    locationmode: 'USA-states',
    z: regionCodes,
    text: regions,
    colorscale: [
      [0, '#FFA500'], [0.33, '#1E90FF'], [0.66, '#228B22'], [1, '#FF0000']
    ],
    showscale: false,
    marker: {
      line: {
        color: 'white',
        width: 1
      }
    },
    hovertemplate: '%{text}<extra></extra>'
  };

  // Add city markers
  const cityTrace = {
    type: 'scattergeo',
    lon: cityData.map(d => d.lon),
    lat: cityData.map(d => d.lat),
    mode: 'markers+text',
    marker: {
      size: 20,
      color: 'rgba(0,0,0,0)',
      line: {
        width: 3,
        color: 'black'
      }
    },
    text: cityData.map(d => `${d.city}<br>${d.participants} participants`),
    textposition: 'bottom center',
    textfont: {
      size: 12,
      color: 'black',
      family: 'Arial Black'
    },
    hovertemplate: '%{text}<extra></extra>'
  };

  const layout = {
    geo: {
      scope: 'usa',
      projection: {
        type: 'albers usa'
      },
      showland: true,
      landcolor: 'rgb(243, 243, 243)',
      lakecolor: 'rgb(255, 255, 255)',
      bgcolor: 'rgba(0,0,0,0)'
    },
    title: {
      text: 'Expanding the SEED - US Census Regions',
      x: 0.5,
      font: {
        size: 20,
        color: NU_COLORS.purple
      }
    },
    margin: { l: 0, r: 0, t: 50, b: 0 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    height: 600
  };

  const config = {
    displayModeBar: false,
    responsive: true
  };

  Plotly.newPlot('us-map', [choroplethTrace, cityTrace], layout, config);
}

// Create city table (matching Python version)
function createCityTable(cityData) {
  const element = document.getElementById('city-table');
  if (!element || !cityData) {
    console.warn('City table element not found or no data available');
    return;
  }

  const sortedData = [...cityData].sort((a, b) => b.participants - a.participants);
  
  let tableHTML = `
    <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif;">
      <thead>
        <tr style="background-color: ${NU_COLORS.purple}; color: white;">
          <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">City</th>
          <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Number of Participants</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  sortedData.forEach((city, index) => {
    const bgColor = index % 2 === 0 ? 'white' : '#f9f9f9';
    tableHTML += `
      <tr style="background-color: ${bgColor};">
        <td style="padding: 8px; border: 1px solid #ddd;">${city.city}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${city.participants.toLocaleString()}</td>
      </tr>
    `;
  });
  
  tableHTML += '</tbody></table>';
  element.innerHTML = tableHTML;
}

// Create age histogram (converted from scatter plot to histogram)
function createAgeScatterChart(ageData) {
  const element = document.getElementById('age-chart');
  if (!element || !ageData) {
    console.warn('Age chart element not found or no data available');
    return;
  }

  // Calculate the range of ages to set appropriate bins
  const minAge = Math.floor(Math.min(...ageData.ages));
  const maxAge = Math.ceil(Math.max(...ageData.ages));
  
  // Calculate statistical measures
  const sortedAges = [...ageData.ages].sort((a, b) => a - b);
  const mean = sortedAges.reduce((sum, age) => sum + age, 0) / sortedAges.length;
  const median = sortedAges.length % 2 === 0 
    ? (sortedAges[sortedAges.length / 2 - 1] + sortedAges[sortedAges.length / 2]) / 2
    : sortedAges[Math.floor(sortedAges.length / 2)];
  const min = Math.min(...sortedAges);
  const max = Math.max(...sortedAges);
  
  // Create histogram trace
  const histogramTrace = {
    x: ageData.ages,
    type: 'histogram',
    name: 'Age Distribution',
    marker: {
      color: NU_COLORS.purple,
      opacity: 0.7,
      line: {
        color: NU_COLORS.darkPurple,
        width: 1
      }
    },
    xbins: {
      start: minAge - 0.5,
      end: maxAge + 0.5,
      size: 1  // 1 month bins
    },
    hovertemplate: 'Age: %{x} months<br>Count: %{y}<extra></extra>'
  };

  // Create trend line (polynomial fit)
  const xValues = [];
  const yValues = [];
  for (let i = minAge; i <= maxAge; i++) {
    const count = ageData.ages.filter(age => Math.floor(age + 0.5) === i).length;
    xValues.push(i);
    yValues.push(count);
  }
  
  const trendTrace = {
    x: xValues,
    y: yValues,
    type: 'scatter',
    mode: 'lines',
    name: 'Trend Line',
    line: {
      color: NU_COLORS.gold,
      width: 3,
      smoothing: 1.3
    },
    hovertemplate: 'Trend at %{x} months: %{y}<extra></extra>'
  };

  // Statistical indicator lines
  const maxY = Math.max(...yValues) * 1.1; // Get max height for vertical lines
  
  const meanLine = {
    x: [mean, mean],
    y: [0, maxY],
    type: 'scatter',
    mode: 'lines',
    name: `Mean (${mean.toFixed(1)} months)`,
    line: {
      color: '#FF6B6B',
      width: 2,
      dash: 'dash'
    },
    hovertemplate: `Mean: ${mean.toFixed(1)} months<extra></extra>`
  };

  const medianLine = {
    x: [median, median],
    y: [0, maxY],
    type: 'scatter',
    mode: 'lines',
    name: `Median (${median.toFixed(1)} months)`,
    line: {
      color: '#4ECDC4',
      width: 2,
      dash: 'dot'
    },
    hovertemplate: `Median: ${median.toFixed(1)} months<extra></extra>`
  };

  const layout = {
    title: {
      text: 'Child Age Distribution with Statistical Indicators',
      font: {
        size: 18,
        color: NU_COLORS.purple,
        family: 'Arial'
      }
    },
    xaxis: {
      title: 'Age (Months)',
      titlefont: { color: NU_COLORS.purple },
      tickfont: { color: NU_COLORS.purple },
      tick0: minAge,
      dtick: 1, // Show tick every 1 month
      range: [minAge - 0.5, maxAge + 0.5]
    },
    yaxis: {
      title: 'Number of Participants',
      titlefont: { color: NU_COLORS.purple },
      tickfont: { color: NU_COLORS.purple }
    },
    plot_bgcolor: 'rgba(0,0,0,0)',
    paper_bgcolor: 'rgba(0,0,0,0)',
    font: { color: NU_COLORS.purple },
    height: 500, // Increased height to accommodate legend
    showlegend: true,
    legend: {
      orientation: 'v',
      x: 1.02,
      xanchor: 'left',
      y: 1,
      yanchor: 'top',
      bgcolor: 'rgba(255,255,255,0.8)',
      bordercolor: NU_COLORS.purple,
      borderwidth: 1
    },
    bargap: 0.1,
    margin: { t: 80, b: 50, l: 60, r: 150 }, // Increased top margin for annotations
    annotations: [
      {
        x: mean,
        y: maxY * 0.7, // Moved down to avoid cutoff
        text: `μ = ${mean.toFixed(1)}`,
        showarrow: true,
        arrowhead: 2,
        arrowcolor: '#FF6B6B',
        font: { color: '#FF6B6B', size: 12 },
        bgcolor: 'rgba(255,255,255,0.8)',
        bordercolor: '#FF6B6B',
        borderwidth: 1
      },
      {
        x: median,
        y: maxY * 0.6, // Moved down to avoid cutoff and overlap
        text: `M = ${median.toFixed(1)}`,
        showarrow: true,
        arrowhead: 2,
        arrowcolor: '#4ECDC4',
        font: { color: '#4ECDC4', size: 12 },
        bgcolor: 'rgba(255,255,255,0.8)',
        bordercolor: '#4ECDC4',
        borderwidth: 1
      }
    ]
  };

  const config = {
    displayModeBar: false,
    responsive: true
  };

  // Combine all traces
  const traces = [histogramTrace, trendTrace, meanLine, medianLine];
  
  Plotly.newPlot('age-chart', traces, layout, config);
}

// Create Income Groups Chart (using pie chart as requested)
function createIncomeGroupsChart(incomeData) {
  const element = document.getElementById('income-groups-chart');
  if (!element || !incomeData) {
    console.warn('Income groups chart element not found or no data available');
    return;
  }

  const data = [{
    labels: incomeData.map(item => item.label),
    values: incomeData.map(item => item.value),
    type: 'pie',
    marker: {
      colors: [NU_COLORS.purple, NU_COLORS.lightPurple, NU_COLORS.gold, '#8B5A96', '#A67CAD']
    },
    textinfo: 'label+percent',
    textposition: 'auto',
    hovertemplate: '<b>%{label}</b><br>Count: %{value}<br>Percentage: %{percent}<extra></extra>',
    hole: 0.3  // Creates a donut chart for better visual appeal
  }];

  const layout = {
    title: {
      text: 'Participants by Demographic Group',
      font: { size: 18, color: NU_COLORS.purple, family: 'Arial' }
    },
    plot_bgcolor: 'rgba(0,0,0,0)',
    paper_bgcolor: 'rgba(0,0,0,0)',
    font: { color: NU_COLORS.purple },
    showlegend: true,
    legend: {
      orientation: 'v',
      x: 1,
      xanchor: 'left',
      y: 1,
      yanchor: 'top'
    },
    height: 450
  };

  const config = {
    displayModeBar: false,
    responsive: true
  };

  Plotly.newPlot('income-groups-chart', data, layout, config);
}

// Create Child Race Chart (using pie chart as requested)
function createChildRaceChart(raceData) {
  const element = document.getElementById('child-race-chart');
  if (!element || !raceData) {
    console.warn('Child race chart element not found or no data available');
    return;
  }

  // Convert array format to labels and values for Plotly
  let labels, values;
  if (Array.isArray(raceData)) {
    // Data is already in array format from data processor
    labels = raceData.map(item => item.label);
    values = raceData.map(item => item.value);
  } else {
    // Data is in object format - convert it
    labels = Object.keys(raceData);
    values = Object.values(raceData);
  }

  if (labels.length === 0 || values.length === 0) {
    console.warn('No race data to display');
    return;
  }

  const data = [{
    labels: labels,
    values: values,
    type: 'pie',
    marker: {
      colors: [NU_COLORS.purple, NU_COLORS.lightPurple, NU_COLORS.gold, '#8B5A96', '#A67CAD', '#C8A2C8', '#9370DB']
    },
    textinfo: 'label+percent',
    textposition: 'auto',
    hovertemplate: '<b>%{label}</b><br>Count: %{value}<br>Percentage: %{percent}<extra></extra>',
    hole: 0.3  // Creates a donut chart for better visual appeal
  }];

  const layout = {
    title: {
      text: 'Participants by Reported Child Race',
      font: { size: 18, color: NU_COLORS.purple, family: 'Arial' }
    },
    plot_bgcolor: 'rgba(0,0,0,0)',
    paper_bgcolor: 'rgba(0,0,0,0)',
    font: { color: NU_COLORS.purple },
    showlegend: true,
    legend: {
      orientation: 'v',
      x: 1,
      xanchor: 'left',
      y: 1,
      yanchor: 'top'
    },
    height: 450
  };

  const config = {
    displayModeBar: false,
    responsive: true
  };

  Plotly.newPlot('child-race-chart', data, layout, config);
}

// Create Hispanic Chart (using pie chart as requested)
function createHispanicChart(hispanicData) {
  const element = document.getElementById('hispanic-chart');
  if (!element || !hispanicData) {
    console.warn('Hispanic chart element not found or no data available');
    return;
  }

  // Convert array format to labels and values for Plotly
  let labels, values;
  if (Array.isArray(hispanicData)) {
    // Data is already in array format from data processor
    labels = hispanicData.map(item => item.label);
    values = hispanicData.map(item => item.value);
  } else {
    // Data is in object format - convert it
    labels = Object.keys(hispanicData);
    values = Object.values(hispanicData);
  }

  if (labels.length === 0 || values.length === 0) {
    console.warn('No Hispanic data to display');
    return;
  }

  const data = [{
    labels: labels,
    values: values,
    type: 'pie',
    marker: {
      colors: [NU_COLORS.purple, NU_COLORS.lightPurple, NU_COLORS.gold]
    },
    textinfo: 'label+percent',
    textposition: 'auto',
    hovertemplate: '<b>%{label}</b><br>Count: %{value}<br>Percentage: %{percent}<extra></extra>',
    hole: 0.3  // Creates a donut chart for better visual appeal
  }];

  const layout = {
    title: {
      text: 'Participants by Hispanic / Latine Identification',
      font: { size: 18, color: NU_COLORS.purple, family: 'Arial' }
    },
    plot_bgcolor: 'rgba(0,0,0,0)',
    paper_bgcolor: 'rgba(0,0,0,0)',
    font: { color: NU_COLORS.purple },
    showlegend: true,
    legend: {
      orientation: 'v',
      x: 1,
      xanchor: 'left',
      y: 1,
      yanchor: 'top'
    },
    height: 450
  };

  const config = {
    displayModeBar: false,
    responsive: true
  };

  Plotly.newPlot('hispanic-chart', data, layout, config);
}

// Create Quality Control Chart (matching Python version)
function createQualityControlChart(qcData) {
  const element = document.getElementById('qc-chart');
  if (!element || !qcData) {
    console.warn('QC chart element not found or no data available');
    return;
  }

  const data = [{
    values: [qcData.eligibleSegments, qcData.notEligibleSegments],
    labels: [`Eligible (${qcData.passRate}%)`, 'Not Eligible'],
    type: 'pie',
    hole: 0.3,
    marker: {
      colors: ['#2E8B57', '#DC143C'] // Green for eligible, red for not eligible
    },
    textposition: 'inside',
    textinfo: 'label+percent',
    textfont: {
      size: 12,
      color: 'white',
      family: 'Arial, sans-serif'
    },
    hovertemplate: '<b>%{label}</b><br>Count: %{value}<br>Percentage: %{percent}<extra></extra>'
  }];

  const layout = {
    title: {
      text: 'Overall Eligibility Analysis',
      font: { size: 18, color: NU_COLORS.purple, family: 'Arial' }
    },
    showlegend: true,
    legend: {
      orientation: 'v',
      x: 1,
      xanchor: 'left',
      y: 1,
      yanchor: 'top',
      font: { size: 12 }
    },
    margin: { t: 50, b: 20, l: 20, r: 120 },
    paper_bgcolor: 'white',
    plot_bgcolor: 'white',
    height: 400
  };

  const config = {
    displayModeBar: false,
    responsive: true
  };

  Plotly.newPlot('qc-chart', data, layout, config);
}

// Show error message if data loading fails
function showErrorMessage() {
  const errorHtml = `
    <div style="text-align: center; padding: 40px; color: ${NU_COLORS.gray};">
      <h3>Unable to Load Dashboard Data</h3>
      <p>There was an error loading data from research files. Please check:</p>
      <ul style="text-align: left; display: inline-block;">
        <li>data/participants.tsv is accessible</li>
        <li>data/Post_qc_summary.xlsx is accessible</li>
        <li>JavaScript console for detailed error messages</li>
      </ul>
      <p><strong>Using fallback data for demonstration.</strong></p>
    </div>
  `;
  
  // Show error in main chart containers
  const chartContainers = [
    'income-groups-chart',
    'child-race-chart'
  ];
  
  chartContainers.forEach(containerId => {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = errorHtml;
    }
  });
}

// Manual function to test data loading (for debugging)
window.testDataLoading = async function() {
  console.log('=== Manual Data Loading Test ===');
  try {
    await loadDashboardData();
    console.log('✅ Data loading test completed successfully');
  } catch (error) {
    console.error('❌ Data loading test failed:', error);
  }
};

// Debug function to check all dashboard elements
window.debugDashboard = function() {
  console.log('=== Dashboard Debug Information ===');
  
  const requiredElements = [
    'total-participants', 'avg-age', 'completion-rate', 'data-quality', 'active-studies',
    'total-segments', 'eligibility-rate',
    'income-groups-chart', 'child-race-chart', 'hispanic-chart', 'us-map', 'age-chart', 'qc-chart', 'city-table'
  ];
  
  console.log('Checking required elements:');
  requiredElements.forEach(id => {
    const element = document.getElementById(id);
    console.log(`  ${id}: ${element ? '✅ Found' : '❌ Missing'}`);
  });
  
  console.log('Current dashboard data:', dashboardData);
  console.log('Data processor:', dataProcessor);
  
  if (typeof DataProcessor !== 'undefined') {
    console.log('✅ DataProcessor class is available');
  } else {
    console.log('❌ DataProcessor class is not available');
  }
  
  if (typeof Plotly !== 'undefined') {
    console.log('✅ Plotly is available');
  } else {
    console.log('❌ Plotly is not available');
  }
};

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing dashboard...');
  setTimeout(loadDashboardData, 100);
});

// Fallback initialization if DOMContentLoaded already fired
if (document.readyState === 'loading') {
  console.log('Document still loading, waiting for DOMContentLoaded');
} else {
  console.log('Document already loaded, initializing dashboard immediately');
  setTimeout(loadDashboardData, 100);
}
