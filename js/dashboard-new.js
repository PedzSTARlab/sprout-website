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
    
    // Create charts with real data
    createIncomeGroupsChart(dashboardData.demographics.incomeGroups);
    createRaceEthnicityChart(dashboardData.demographics.raceEthnicity);
    
    console.log('Dashboard initialized successfully with real research data');
    
  } catch (error) {
    console.error('Error loading dashboard data from research files:', error);
    showErrorMessage();
  }
}

// Update metric cards
function updateMetrics(overview) {
  const elements = {
    'total-participants': overview.totalParticipants?.toLocaleString() || 'N/A',
    'avg-age': overview.avgAge || 'N/A',
    'completion-rate': overview.completionRate ? `${overview.completionRate}%` : 'N/A',
    'data-quality': overview.dataQualityScore ? `${overview.dataQualityScore}%` : 'N/A',
    'active-studies': overview.activeStudies || 'N/A'
  };

  Object.entries(elements).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  });
}

// Create Income Groups Pie Chart
function createIncomeGroupsChart(incomeData) {
  const element = document.getElementById('income-groups-chart');
  if (!element || !incomeData) {
    console.warn('Income groups chart element not found or no data available');
    return;
  }

  const values = incomeData.map(item => item.value);
  const labels = incomeData.map(item => `${item.label} (${item.percentage}%)`);

  const data = [{
    values: values,
    labels: labels,
    type: 'pie',
    hole: 0.3,
    marker: {
      colors: chartColors.slice(0, incomeData.length)
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
      text: 'Income Groups Distribution',
      font: { size: 16, color: NU_COLORS.purple, family: 'Arial, sans-serif' }
    },
    showlegend: true,
    legend: {
      orientation: 'v',
      x: 1.02,
      y: 0.5,
      font: { size: 11 }
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

  Plotly.newPlot('income-groups-chart', data, layout, config);
}

// Create Race/Ethnicity Pie Chart  
function createRaceEthnicityChart(raceData) {
  const element = document.getElementById('race-ethnicity-chart');
  if (!element || !raceData) {
    console.warn('Race/ethnicity chart element not found or no data available');
    return;
  }

  const values = raceData.map(item => item.value);
  const labels = raceData.map(item => `${item.label} (${item.percentage}%)`);

  const data = [{
    values: values,
    labels: labels,
    type: 'pie',
    hole: 0.3,
    marker: {
      colors: chartColors.slice(2, 2 + raceData.length) // Use different colors than income chart
    },
    textposition: 'inside',
    textinfo: 'label+percent',
    textfont: {
      size: 11,
      color: 'white',
      family: 'Arial, sans-serif'
    },
    hovertemplate: '<b>%{label}</b><br>Count: %{value}<br>Percentage: %{percent}<extra></extra>'
  }];

  const layout = {
    title: {
      text: 'Race/Ethnicity Distribution',
      font: { size: 16, color: NU_COLORS.purple, family: 'Arial, sans-serif' }
    },
    showlegend: true,
    legend: {
      orientation: 'v',
      x: 1.02,
      y: 0.5,
      font: { size: 10 }
    },
    margin: { t: 50, b: 20, l: 20, r: 140 },
    paper_bgcolor: 'white',
    plot_bgcolor: 'white',
    height: 400
  };

  const config = {
    displayModeBar: false,
    responsive: true
  };

  Plotly.newPlot('race-ethnicity-chart', data, layout, config);
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
