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
    createRaceEthnicityChart(dashboardData.demographics.raceEthnicity);
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

// Create age scatter plot (matching Python version)
function createAgeScatterChart(ageData) {
  const element = document.getElementById('age-chart');
  if (!element || !ageData) {
    console.warn('Age chart element not found or no data available');
    return;
  }

  const trace = {
    x: ageData.participantIds.map((_, i) => i),
    y: ageData.ages,
    mode: 'markers',
    type: 'scatter',
    marker: {
      color: NU_COLORS.purple,
      size: 8,
      opacity: 0.7
    },
    text: ageData.participantIds,
    customdata: ageData.ageLabels,
    hovertemplate: 'Participant: %{text}<br>Age: %{customdata}<extra></extra>'
  };

  const layout = {
    title: {
      text: 'Child Age Distribution (Hover to See Age Format: e.g., 4 years 2 months)',
      font: {
        size: 18,
        color: NU_COLORS.purple,
        family: 'Arial'
      }
    },
    xaxis: {
      title: 'Participant Index',
      titlefont: { color: NU_COLORS.purple },
      tickfont: { color: NU_COLORS.purple }
    },
    yaxis: {
      title: 'Age (Years)',
      titlefont: { color: NU_COLORS.purple },
      tickfont: { color: NU_COLORS.purple }
    },
    plot_bgcolor: 'rgba(0,0,0,0)',
    paper_bgcolor: 'rgba(0,0,0,0)',
    font: { color: NU_COLORS.purple },
    height: 400,
    showlegend: false
  };

  const config = {
    displayModeBar: false,
    responsive: true
  };

  Plotly.newPlot('age-chart', [trace], layout, config);
}

// Create Income Groups Chart (matching Python version)
function createIncomeGroupsChart(incomeData) {
  const element = document.getElementById('income-groups-chart');
  if (!element || !incomeData) {
    console.warn('Income groups chart element not found or no data available');
    return;
  }

  const data = [{
    x: incomeData.map(item => item.label),
    y: incomeData.map(item => item.value),
    type: 'bar',
    marker: {
      color: incomeData.map(item => item.value),
      colorscale: [[0, NU_COLORS.lightPurple], [1, NU_COLORS.purple]],
      showscale: false
    },
    text: incomeData.map(item => `${item.percentage}%`),
    textposition: 'auto',
    hovertemplate: '<b>%{x}</b><br>Count: %{y}<br>Percentage: %{text}<extra></extra>'
  }];

  const layout = {
    title: {
      text: 'Participants by Income Group',
      font: { size: 18, color: NU_COLORS.purple, family: 'Arial' }
    },
    xaxis: {
      title: 'Income Group',
      titlefont: { color: NU_COLORS.purple },
      tickfont: { color: NU_COLORS.purple }
    },
    yaxis: {
      title: 'Number of Participants',
      titlefont: { color: NU_COLORS.purple },
      tickfont: { color: NU_COLORS.purple }
    },
    plot_bgcolor: 'rgba(0,0,0,0)',
    paper_bgcolor: 'rgba(0,0,0,0)',
    font: { color: NU_COLORS.purple },
    showlegend: false,
    height: 450
  };

  const config = {
    displayModeBar: false,
    responsive: true
  };

  Plotly.newPlot('income-groups-chart', data, layout, config);
}

// Create Race/Ethnicity Chart (matching Python version)
function createRaceEthnicityChart(raceData) {
  const element = document.getElementById('race-ethnicity-chart');
  if (!element || !raceData) {
    console.warn('Race/ethnicity chart element not found or no data available');
    return;
  }

  const data = [{
    x: raceData.map(item => item.label),
    y: raceData.map(item => item.value),
    type: 'bar',
    marker: {
      color: raceData.map(item => item.value),
      colorscale: [[0, NU_COLORS.lightPurple], [1, NU_COLORS.purple]],
      showscale: false
    },
    text: raceData.map(item => `${item.percentage}%`),
    textposition: 'auto',
    hovertemplate: '<b>%{x}</b><br>Count: %{y}<br>Percentage: %{text}<extra></extra>'
  }];

  const layout = {
    title: {
      text: 'Participants by Reported Child Race',
      font: { size: 18, color: NU_COLORS.purple, family: 'Arial' }
    },
    xaxis: {
      title: 'Race',
      titlefont: { color: NU_COLORS.purple },
      tickfont: { color: NU_COLORS.purple },
      tickangle: -45
    },
    yaxis: {
      title: 'Number of Participants',
      titlefont: { color: NU_COLORS.purple },
      tickfont: { color: NU_COLORS.purple }
    },
    plot_bgcolor: 'rgba(0,0,0,0)',
    paper_bgcolor: 'rgba(0,0,0,0)',
    font: { color: NU_COLORS.purple },
    showlegend: false,
    height: 450
  };

  const config = {
    displayModeBar: false,
    responsive: true
  };

  Plotly.newPlot('race-ethnicity-chart', data, layout, config);
}

// Create Hispanic Chart (matching Python version)
function createHispanicChart(hispanicData) {
  const element = document.getElementById('hispanic-chart');
  if (!element || !hispanicData) {
    console.warn('Hispanic chart element not found or no data available');
    return;
  }

  const data = [{
    x: hispanicData.map(item => item.label),
    y: hispanicData.map(item => item.value),
    type: 'bar',
    marker: {
      color: hispanicData.map(item => item.value),
      colorscale: [[0, NU_COLORS.lightPurple], [1, NU_COLORS.purple]],
      showscale: false
    },
    text: hispanicData.map(item => `${item.percentage}%`),
    textposition: 'auto',
    hovertemplate: '<b>%{x}</b><br>Count: %{y}<br>Percentage: %{text}<extra></extra>'
  }];

  const layout = {
    title: {
      text: 'Participants by Hispanic / Latine Identification',
      font: { size: 18, color: NU_COLORS.purple, family: 'Arial' }
    },
    xaxis: {
      title: 'Ethnicity',
      titlefont: { color: NU_COLORS.purple },
      tickfont: { color: NU_COLORS.purple },
      tickangle: -30
    },
    yaxis: {
      title: 'Number of Participants',
      titlefont: { color: NU_COLORS.purple },
      tickfont: { color: NU_COLORS.purple }
    },
    plot_bgcolor: 'rgba(0,0,0,0)',
    paper_bgcolor: 'rgba(0,0,0,0)',
    font: { color: NU_COLORS.purple },
    showlegend: false,
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
      x: 1.02,
      y: 0.5,
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
    'race-ethnicity-chart'
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
    'income-groups-chart', 'race-ethnicity-chart', 'us-map', 'age-chart', 'qc-chart', 'city-table'
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
