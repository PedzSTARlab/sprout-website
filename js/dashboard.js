// SPROUT Dashboard JavaScript - Real Research Data Processing

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
    '#F7931E', // Orange accent
    '#5A4FCF', // Additional blue-purple
    '#C5B358', // Muted gold
    '#8B7355'  // Brown accent
];

let dashboardData = null;
let dataProcessor = null;

// Load dashboard data from real research files
async function loadDashboardData() {
  try {
    // Wait for DOM elements to be ready
    if (!document.getElementById('total-participants')) {
      setTimeout(loadDashboardData, 500);
      return;
    }
    
    // Initialize data processor if not already done
    if (!dataProcessor) {
      dataProcessor = new DataProcessor();
    }
    
    // Generate dashboard data from TSV/Excel files
    dashboardData = await dataProcessor.generateDashboardData();
    
    // Update metrics
    updateMetrics(dashboardData.overview);
    updateEligibilityMetrics(dashboardData.eligibilityData);
    
    // Create comprehensive charts matching Python version
    createUSMap(dashboardData.geographic);
    createCityTable(dashboardData.cityTable);
    createAgeScatterChart(dashboardData.ageData);
    createIncomeGroupsChart(dashboardData.demographics.incomeGroups);
    createChildRaceChart(dashboardData.demographics.raceEthnicity);
    createHispanicChart(dashboardData.demographics.hispanicCounts);
    createQualityControlChart(dashboardData.qualityControl);
    createEligibilityChart(dashboardData.eligibilityData);
    createCityEligibilityChart(dashboardData.eligibilityData);
    
    // Create feature charts
    createFeatureCharts(dashboardData.featureData);
    
    // Create additional Python-style analysis charts
    createFeatureViolationSummary(dashboardData.featureData);
    
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

// Update eligibility metric cards
function updateEligibilityMetrics(eligibilityData) {
  if (!eligibilityData || !eligibilityData.overall) {
    console.warn('No eligibility data available for metrics update');
    return;
  }

  const eligible = eligibilityData.overall['Eligible'] || 0;
  const notEligible = eligibilityData.overall['Not Eligible'] || 0;
  const total = eligible + notEligible;
  const rate = total > 0 ? ((eligible / total) * 100) : 0;

  const elements = {
    'eligible-samples': eligible.toLocaleString(),
    'not-eligible-samples': notEligible.toLocaleString(),
    'total-samples': total.toLocaleString(),
    'eligibility-rate': `${rate.toFixed(1)}%`
  };

  Object.entries(elements).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    } else {
      console.warn(`Element with id '${id}' not found`);
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
    insidetextorientation: 'radial',
    textfont: {
      size: 11,
      color: 'white',
      family: 'Arial, sans-serif',
      weight: 'bold'
    },
    outsidetextfont: {
      size: 11,
      color: '#4E2A84', // Explicit purple color instead of NU_COLORS.purple
      family: 'Arial, sans-serif',
      weight: 'bold'
    },
    hovertemplate: '<b>%{label}</b><br>Count: %{value}<br>Percentage: %{percent}<extra></extra>',
    hole: 0.3,  // Creates a donut chart for better visual appeal
    pull: [0, 0, 0, 0, 0], // No slice separation for cleaner look
    showlegend: true
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
      x: 0.75,
      xanchor: 'left',
      y: 0.85,
      yanchor: 'top',
      bgcolor: 'rgba(255,255,255,0.9)',
      bordercolor: NU_COLORS.purple,
      borderwidth: 1
    },
    height: 400,
    margin: { l: 40, r: 120, t: 60, b: 60 }
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

  // Create custom textposition array to force "Black or African American" inside
  const textpositions = labels.map(label => 
    label === 'Black or African American' ? 'inside' : 'auto'
  );

  const data = [{
    labels: labels,
    values: values,
    type: 'pie',
    marker: {
      colors: [NU_COLORS.purple, NU_COLORS.lightPurple, NU_COLORS.gold, '#8B5A96', '#A67CAD', '#C8A2C8', '#9370DB']
    },
    textinfo: 'label+percent',
    textposition: textpositions,
    insidetextorientation: 'radial',
    textfont: {
      size: 9,
      color: 'white',
      family: 'Arial, sans-serif',
      weight: 'bold'
    },
    outsidetextfont: {
      size: 9,
      color: '#4E2A84', // Explicit purple color instead of NU_COLORS.purple
      family: 'Arial, sans-serif',
      weight: 'bold'
    },
    hovertemplate: '<b>%{label}</b><br>Count: %{value}<br>Percentage: %{percent}<extra></extra>',
    hole: 0.3,  // Creates a donut chart for better visual appeal
    pull: [0, 0, 0, 0, 0, 0, 0], // No slice separation for cleaner look
    showlegend: true
  }];

  const layout = {
    title: {
      text: 'Participants by Reported Child Race',
      font: { size: 15, color: NU_COLORS.purple, family: 'Arial' }
    },
    plot_bgcolor: 'rgba(0,0,0,0)',
    paper_bgcolor: 'rgba(0,0,0,0)',
    font: { color: NU_COLORS.purple },
    showlegend: true,
    legend: {
      orientation: 'v',
      x: 0.05,
      xanchor: 'left',
      y: 0.92,
      yanchor: 'top',
      bgcolor: 'rgba(255,255,255,0.9)',
      bordercolor: NU_COLORS.purple,
      borderwidth: 1,
      font: { size: 9 }
    },
    height: 380,
    margin: { l: 30, r: 100, t: 45, b: 50 }
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
    insidetextorientation: 'radial',
    textfont: {
      size: 12,
      color: 'white',
      family: 'Arial, sans-serif',
      weight: 'bold'
    },
    outsidetextfont: {
      size: 12,
      color: '#4E2A84', // Explicit purple color instead of NU_COLORS.purple
      family: 'Arial, sans-serif',
      weight: 'bold'
    },
    hovertemplate: '<b>%{label}</b><br>Count: %{value}<br>Percentage: %{percent}<extra></extra>',
    hole: 0.3,  // Creates a donut chart for better visual appeal
    pull: [0, 0, 0], // No slice separation for cleaner look
    showlegend: true
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
      x: 0.75,
      xanchor: 'left',
      y: 0.85,
      yanchor: 'top',
      bgcolor: 'rgba(255,255,255,0.9)',
      bordercolor: NU_COLORS.purple,
      borderwidth: 1
    },
    height: 400,
    margin: { l: 40, r: 120, t: 60, b: 60 }
  };

  const config = {
    displayModeBar: false,
    responsive: true
  };

  Plotly.newPlot('hispanic-chart', data, layout, config);
}

// Create Quality Control Chart (matching Python version with summary table)
function createQualityControlChart(qcData) {
  const element = document.getElementById('qc-chart');
  if (!element || !qcData) {
    console.warn('QC chart element not found or no data available');
    return;
  }

  // Check if we have summary data (from actual Excel processing)
  if (qcData.summaryData && qcData.summaryData.length > 0) {
    // Create a detailed table like the Python version
    let tableHTML = `
      <div style="font-family: Arial, sans-serif;">
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <thead>
            <tr style="background-color: ${NU_COLORS.purple}; color: white;">
              <th style="padding: 15px 12px; text-align: left; border: 1px solid ${NU_COLORS.darkPurple}; font-weight: 600; font-size: 14px;">Feature</th>
              <th style="padding: 15px 12px; text-align: center; border: 1px solid ${NU_COLORS.darkPurple}; font-weight: 600; font-size: 14px;">Total Samples</th>
              <th style="padding: 15px 12px; text-align: center; border: 1px solid ${NU_COLORS.darkPurple}; font-weight: 600; font-size: 14px;">Within Range</th>
              <th style="padding: 15px 12px; text-align: center; border: 1px solid ${NU_COLORS.darkPurple}; font-weight: 600; font-size: 14px;">Below Threshold</th>
              <th style="padding: 15px 12px; text-align: center; border: 1px solid ${NU_COLORS.darkPurple}; font-weight: 600; font-size: 14px;">Above Threshold</th>
              <th style="padding: 15px 12px; text-align: center; border: 1px solid ${NU_COLORS.darkPurple}; font-weight: 600; font-size: 14px;">Violation Rate</th>
              <th style="padding: 15px 12px; text-align: center; border: 1px solid ${NU_COLORS.darkPurple}; font-weight: 600; font-size: 14px;">Status</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    qcData.summaryData.forEach((row, index) => {
      const bgColor = index % 2 === 0 ? '#FFFFFF' : '#F8F9FA';
      const statusColor = row.status === 'Excellent' ? '#28A745' : 
                         row.status === 'Good' ? '#17A2B8' :
                         row.status === 'Moderate' ? '#FD7E14' : '#DC3545';
      
      tableHTML += `
        <tr style="background-color: ${bgColor};">
          <td style="padding: 10px; border: 1px solid #DEE2E6; font-weight: 600; color: #212529;">${row.feature}</td>
          <td style="padding: 10px; border: 1px solid #DEE2E6; text-align: center; color: #495057;">${row.totalSamples.toLocaleString()}</td>
          <td style="padding: 10px; border: 1px solid #DEE2E6; text-align: center; color: #495057;">${row.withinRange.toLocaleString()}</td>
          <td style="padding: 10px; border: 1px solid #DEE2E6; text-align: center; color: #495057;">${row.belowThreshold.toLocaleString()}</td>
          <td style="padding: 10px; border: 1px solid #DEE2E6; text-align: center; color: #495057;">${row.aboveThreshold.toLocaleString()}</td>
          <td style="padding: 10px; border: 1px solid #DEE2E6; text-align: center; color: #495057; font-weight: 600;">${row.violationRate.toFixed(1)}%</td>
          <td style="padding: 10px; border: 1px solid #DEE2E6; text-align: center; color: ${statusColor}; font-weight: 700; font-size: 14px;">${row.status}</td>
        </tr>
      `;
    });
    
    // Calculate overall metrics from actual data
    const totalSamples = qcData.totalSegments || 0;
    const notEligibleSegments = qcData.notEligibleSegments || 0;
    const eligibleSegments = qcData.eligibleSegments || 0;
    const passRate = qcData.passRate || '0.0';
    
    element.innerHTML = tableHTML;
  } else {
    // Fallback: Create simple pie chart for basic metrics
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
}

// Create Overall Eligibility Analysis Chart (Scatter Plot like Python version)
function createEligibilityChart(eligibilityData) {
  const element = document.getElementById('eligibility-chart');
  if (!element) {
    console.warn('Eligibility chart element not found');
    return;
  }

  if (!eligibilityData || !eligibilityData.overall || Object.keys(eligibilityData.overall).length === 0) {
    console.warn('No eligibility data available for chart creation');
    element.innerHTML = `
      <div style="text-align: center; padding: 40px; color: ${NU_COLORS.gray};">
        <h3>No Eligibility Data Available</h3>
        <p>Unable to load eligibility data from Excel file.</p>
        <p>Please check if the Excel file contains eligibility columns.</p>
      </div>
    `;
    return;
  }

  // Get eligibility data with feature information from data processor
  if (!dataProcessor || !dataProcessor.qualityData) {
    console.warn('No quality data available for scatter plot, creating summary chart instead');
    
    // Create a simple bar chart showing eligibility counts
    const labels = Object.keys(eligibilityData.overall);
    const values = Object.values(eligibilityData.overall);
    
    const data = [{
      x: labels,
      y: values,
      type: 'bar',
      marker: {
        color: labels.map(label => label === 'Eligible' ? '#2E8B57' : '#DC143C')
      },
      text: values.map(v => v.toLocaleString()),
      textposition: 'auto'
    }];

    const layout = {
      title: {
        text: 'Overall Eligibility Analysis',
        font: { size: 18, color: NU_COLORS.purple, family: 'Arial' }
      },
      xaxis: { title: 'Eligibility Status', color: NU_COLORS.purple },
      yaxis: { title: 'Number of Samples', color: NU_COLORS.purple },
      plot_bgcolor: 'rgba(0,0,0,0)',
      paper_bgcolor: 'rgba(0,0,0,0)',
      font: { color: NU_COLORS.purple },
      height: 400
    };

    const config = { displayModeBar: false, responsive: true };
    Plotly.newPlot('eligibility-chart', data, layout, config);
    return;
  }

  // Create eligibility scatter plot like Python version
  const eligibilityColors = {
    'Eligible': '#2E8B57',
    'Not Eligible': '#DC143C',
    'Pass': '#2E8B57',
    'Fail': '#DC143C',
    'Yes': '#2E8B57',
    'No': '#DC143C',
    'True': '#2E8B57',
    'False': '#DC143C',
    '1': '#2E8B57',
    '0': '#DC143C',
    'Pending': '#FF8C00',
    'Under Review': NU_COLORS.lightPurple
  };

  // Process eligibility data with feature values (matching Python approach)
  const scatterData = [];
  const featureForPlot = 'Spectral Bandwidth (Hz)'; // Same as Python version
  
  dataProcessor.qualityData.forEach((row, index) => {
    const eligibilityValue = row['Eligible for Research'];
    const featureValue = parseFloat(row[featureForPlot]);
    
    if (eligibilityValue && !isNaN(featureValue)) {
      // Map eligibility value to standard format
      let eligibilityStatus = eligibilityValue === 'Yes' ? 'Eligible' : 
                             eligibilityValue === 'No' ? 'Not Eligible' : eligibilityValue;
      
      scatterData.push({
        x: index,
        y: featureValue,
        eligibilityStatus: eligibilityStatus,
        fileName: row.FileName || 'Unknown',
        city: row.City || 'Unknown'
      });
    }
  });

  // Group data by eligibility status for different traces
  const eligibleData = scatterData.filter(d => d.eligibilityStatus === 'Eligible');
  const notEligibleData = scatterData.filter(d => d.eligibilityStatus === 'Not Eligible');

  const data = [
    {
      x: eligibleData.map(d => d.x),
      y: eligibleData.map(d => d.y),
      mode: 'markers',
      type: 'scatter',
      name: 'Eligible',
      marker: {
        color: eligibilityColors['Eligible'],
        size: 8,
        opacity: 0.7,
        line: { width: 1, color: 'white' }
      },
      text: eligibleData.map(d => d.city),
      hovertemplate: '<b>%{text}</b><br>Sample Index: %{x}<br>Spectral Bandwidth: %{y:.1f} Hz<br>Status: Eligible<extra></extra>'
    },
    {
      x: notEligibleData.map(d => d.x),
      y: notEligibleData.map(d => d.y),
      mode: 'markers',
      type: 'scatter',
      name: 'Not Eligible',
      marker: {
        color: eligibilityColors['Not Eligible'],
        size: 8,
        opacity: 0.7,
        line: { width: 1, color: 'white' }
      },
      text: notEligibleData.map(d => d.city),
      hovertemplate: '<b>%{text}</b><br>Sample Index: %{x}<br>Spectral Bandwidth: %{y:.1f} Hz<br>Status: Not Eligible<extra></extra>'
    }
  ];

  const layout = {
    title: {
      text: 'Overall Eligibility Status by All Features',
      font: { size: 18, color: NU_COLORS.purple, family: 'Arial' }
    },
    xaxis: {
      title: 'Sample Index',
      color: NU_COLORS.purple
    },
    yaxis: {
      title: 'All Features',
      color: NU_COLORS.purple
    },
    plot_bgcolor: 'rgba(0,0,0,0)',
    paper_bgcolor: 'rgba(0,0,0,0)',
    font: { color: NU_COLORS.purple },
    height: 450,
    margin: {
      l: 60,
      r: 60,
      b: 80,
      t: 60,
      pad: 4
    },
    showlegend: true,
    legend: {
      orientation: 'h',
      yanchor: 'bottom',
      y: -0.25,
      xanchor: 'center',
      x: 0.5
    }
  };

  const config = {
    displayModeBar: false,
    responsive: true
  };

  Plotly.newPlot('eligibility-chart', data, layout, config);
}

// Create City-specific Eligibility Chart
function createCityEligibilityChart(eligibilityData) {
  const element = document.getElementById('city-eligibility-chart');
  if (!element) {
    console.warn('City eligibility chart element not found');
    return;
  }

  if (!eligibilityData || !eligibilityData.byCity || Object.keys(eligibilityData.byCity).length === 0) {
    console.warn('No city eligibility data available');
    element.innerHTML = `
      <div style="text-align: center; padding: 40px; color: ${NU_COLORS.gray};">
        <h3>No City Eligibility Data Available</h3>
        <p>Unable to load city-specific eligibility data from Excel file.</p>
      </div>
    `;
    return;
  }

  const eligibilityColors = {
    'Eligible': '#2E8B57',
    'Not Eligible': '#DC143C',
    'Pass': '#2E8B57',
    'Fail': '#DC143C',
    'Yes': '#2E8B57',
    'No': '#DC143C',
    'True': '#2E8B57',
    'False': '#DC143C',
    '1': '#2E8B57',
    '0': '#DC143C'
  };

  // Create abbreviated city names for better chart display
  const cityAbbreviations = {
    'Atlanta, GA': 'ATL',
    'Baltimore, MD': 'BAL', 
    'Chicago, IL': 'CHI',
    'Dallas, TX': 'DAL',
    'Iselin, NJ': 'ISL',
    'Los Angeles, CA': 'LAX',
    'Orlando, FL': 'ORL',
    'St. Louis, MO': 'STL'
  };

  const cities = Object.keys(eligibilityData.byCity);
  const abbreviatedCities = cities.map(city => cityAbbreviations[city] || city);
  const eligibilityStatuses = [...new Set(
    Object.values(eligibilityData.byCity).flatMap(cityData => Object.keys(cityData))
  )];

  const data = eligibilityStatuses.map(status => ({
    x: abbreviatedCities,
    y: cities.map(city => eligibilityData.byCity[city][status] || 0),
    name: status,
    type: 'bar',
    marker: { color: eligibilityColors[status] || NU_COLORS.gray },
    customdata: cities,
    hovertemplate: '<b>%{fullData.name}</b><br>%{customdata}: %{y}<extra></extra>'
  }));

  const layout = {
    title: {
      text: 'Eligibility Status Distribution by City',
      font: { size: 16, color: NU_COLORS.purple, family: 'Arial' }
    },
    xaxis: {
      title: 'City',
      tickangle: 0,
      tickfont: { size: 14 },
      automargin: true,
      categoryorder: 'total descending',
      tickmode: 'linear',
      dtick: 1
    },
    yaxis: {
      title: 'Number of Samples'
    },
    barmode: 'stack',
    plot_bgcolor: 'rgba(0,0,0,0)',
    paper_bgcolor: 'rgba(0,0,0,0)',
    font: { color: NU_COLORS.purple },
    height: 450,
    width: 900,
    margin: {
      l: 80,
      r: 50,
      b: 100,
      t: 80,
      pad: 10
    },
    showlegend: true,
    legend: {
      orientation: 'h',
      x: 0.5,
      xanchor: 'center',
      y: -0.2
    },
    bargap: 0.5
  };

  const config = {
    displayModeBar: false,
    responsive: true
  };

  Plotly.newPlot('city-eligibility-chart', data, layout, config);
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

// Debug function to check all dashboard elements (for development only)
window.debugDashboard = function() {
  const requiredElements = [
    'total-participants', 'avg-age', 'completion-rate', 'data-quality', 'active-studies',
    'total-segments', 'eligibility-rate',
    'income-groups-chart', 'child-race-chart', 'hispanic-chart', 'us-map', 'age-chart', 'qc-chart', 'city-table'
  ];
  
  requiredElements.forEach(id => {
    const element = document.getElementById(id);
    console.log(`${id}: ${element ? '✅ Found' : '❌ Missing'}`);
  });
  
  if (dashboardData) console.log('Dashboard data loaded successfully');
  if (dataProcessor) console.log('Data processor initialized');
  
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

// Create individual feature charts
function createFeatureCharts(featureData) {
  if (!featureData) {
    console.warn('No feature data available for charts');
    return;
  }

  const featureChartMappings = {
    'LUFS': 'lufs-chart',
    'RMS Energy': 'rms-chart', 
    'Relative Amplitude': 'amplitude-chart',
    'Spectral Centroid (Hz)': 'centroid-chart',
    'Spectral Bandwidth (Hz)': 'bandwidth-chart',
    'Pitch Mean (Hz)': 'pitch-chart',
    'MFCC Mean': 'mfcc-mean-chart',
    'MFCC Std Dev': 'mfcc-std-chart'
  };

  Object.entries(featureChartMappings).forEach(([featureName, chartId]) => {
    const data = featureData[featureName];
    if (data && data.values && data.values.length > 0) {
      createFeatureDistributionChart(chartId, featureName, data);
    } else {
      console.warn(`No data available for feature: ${featureName}`);
    }
  });
}

// Create individual feature distribution chart (matching Python scatter plots)
function createFeatureDistributionChart(containerId, featureName, data) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`Container ${containerId} not found for feature ${featureName}`);
    return;
  }

  // Clear container and create wrapper for chart and stats
  container.innerHTML = '';
  const chartDiv = document.createElement('div');
  chartDiv.id = `${containerId}-plot`;
  chartDiv.style.width = '100%';
  chartDiv.style.height = '400px';
  container.appendChild(chartDiv);

  // Create scatter plot data like Python version
  const withinRangeData = [];
  const belowThresholdData = [];
  const aboveThresholdData = [];
  
  data.values.forEach((value, index) => {
    const point = {
      x: index,
      y: value,
      text: `Sample ${index + 1}<br>Value: ${value.toFixed(3)}<br>Feature: ${featureName}`,
      hovertemplate: '%{text}<extra></extra>'
    };
    
    if (value < data.lowThreshold) {
      belowThresholdData.push(point);
    } else if (value > data.highThreshold) {
      aboveThresholdData.push(point);
    } else {
      // value >= lowThreshold && value <= highThreshold
      withinRangeData.push(point);
    }
  });

  // Create traces like Python version (color-coded by threshold status)
  const traces = [
    {
      x: withinRangeData.map(p => p.x),
      y: withinRangeData.map(p => p.y),
      type: 'scatter',
      mode: 'markers',
      name: 'Within Range',
      marker: {
        color: '#4CAF50', // Green - within thresholds
        size: 4,
        opacity: 0.7
      },
      text: withinRangeData.map(p => p.text),
      hovertemplate: '%{text}<extra></extra>'
    },
    {
      x: belowThresholdData.map(p => p.x),
      y: belowThresholdData.map(p => p.y),
      type: 'scatter',
      mode: 'markers', 
      name: 'Below Threshold',
      marker: {
        color: '#F44336', // Red - below threshold
        size: 4,
        opacity: 0.7
      },
      text: belowThresholdData.map(p => p.text),
      hovertemplate: '%{text}<extra></extra>'
    },
    {
      x: aboveThresholdData.map(p => p.x),
      y: aboveThresholdData.map(p => p.y),
      type: 'scatter',
      mode: 'markers',
      name: 'Above Threshold', 
      marker: {
        color: '#FF9800', // Orange - above threshold
        size: 4,
        opacity: 0.7
      },
      text: aboveThresholdData.map(p => p.text),
      hovertemplate: '%{text}<extra></extra>'
    }
  ];

  // Add threshold lines (matching Python version)
  const shapes = [
    // Low threshold line
    {
      type: 'line',
      x0: 0,
      x1: data.values.length - 1,
      y0: data.lowThreshold,
      y1: data.lowThreshold,
      line: {
        color: 'red',
        width: 2,
        dash: 'dash'
      }
    },
    // High threshold line
    {
      type: 'line',
      x0: 0,
      x1: data.values.length - 1,
      y0: data.highThreshold,
      y1: data.highThreshold,
      line: {
        color: 'red',
        width: 2,
        dash: 'dash'
      }
    }
  ];

  const layout = {
    title: {
      text: `${featureName} Quality Control Analysis`,
      font: { 
        family: 'Montserrat, sans-serif',
        size: 14,
        color: NU_COLORS.darkPurple
      }
    },
    xaxis: {
      title: 'Sample Index',
      font: { family: 'Lato, sans-serif', size: 11 },
      gridcolor: NU_COLORS.lightGray
    },
    yaxis: {
      title: featureName,
      font: { family: 'Lato, sans-serif', size: 11 },
      gridcolor: NU_COLORS.lightGray
    },
    shapes: shapes,
    plot_bgcolor: 'white',
    paper_bgcolor: 'white',
    margin: { t: 50, r: 20, b: 60, l: 60 },
    showlegend: true,
    legend: {
      x: 1,
      xanchor: 'right',
      y: 1,
      font: { size: 10 }
    },
    annotations: [
      {
        x: data.values.length * 0.02,
        y: data.lowThreshold,
        text: `Low Threshold: ${data.lowThreshold}`,
        showarrow: false,
        xanchor: 'left',
        yanchor: 'bottom',
        font: { size: 9, color: 'red' },
        bgcolor: 'white',
        bordercolor: 'red',
        borderwidth: 1
      },
      {
        x: data.values.length * 0.02,
        y: data.highThreshold,
        text: `High Threshold: ${data.highThreshold}`,
        showarrow: false,
        xanchor: 'left',
        yanchor: 'top',
        font: { size: 9, color: 'red' },
        bgcolor: 'white',
        bordercolor: 'red',
        borderwidth: 1
      }
    ]
  };

  const config = {
    responsive: true,
    displayModeBar: false
  };

  Plotly.newPlot(chartDiv, traces, layout, config);

  // Add statistics text below the chart (matching Python version)
  const violationRate = ((data.belowThreshold + data.aboveThreshold) / data.total * 100).toFixed(1);
  let status = 'Needs Attention';
  if (violationRate < 5) status = 'Excellent';
  else if (violationRate < 15) status = 'Good';
  else if (violationRate < 30) status = 'Moderate';
  
  const statsHtml = `
    <div style="margin-top: 15px; padding: 12px; background: #f8f9fa; border-radius: 6px; font-size: 13px; border-left: 4px solid ${NU_COLORS.purple};">
      <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 15px;">
        <div><strong>Total Samples:</strong> ${data.total}</div>
        <div><strong>Within Range:</strong> <span style="color: #4CAF50;">${data.withinRange}</span></div>
        <div><strong>Below Threshold:</strong> <span style="color: #F44336;">${data.belowThreshold}</span></div>
        <div><strong>Above Threshold:</strong> <span style="color: #FF9800;">${data.aboveThreshold}</span></div>
      </div>
      <div style="margin-top: 8px; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 15px;">
        <div><strong>Pass Rate:</strong> ${((data.withinRange/data.total)*100).toFixed(1)}%</div>
        <div><strong>Violation Rate:</strong> ${violationRate}%</div>
        <div><strong>Status:</strong> <span style="font-weight: bold; color: ${violationRate < 15 ? '#4CAF50' : violationRate < 30 ? '#FF9800' : '#F44336'};">${status}</span></div>
      </div>
    </div>
  `;
  
  // Add stats below the chart within the same container
  const statsDiv = document.createElement('div');
  statsDiv.innerHTML = statsHtml;
  container.appendChild(statsDiv);
}

// Create feature violation summary chart (matching Python summary analysis)
function createFeatureViolationSummary(featureData) {
  const containerId = 'feature-violation-summary';
  const container = document.getElementById(containerId);
  if (!container || !featureData) return;

  const features = Object.keys(featureData);
  const violationRates = features.map(feature => {
    const data = featureData[feature];
    return ((data.belowThreshold + data.aboveThreshold) / data.total * 100).toFixed(1);
  });

  const trace = {
    x: features,
    y: violationRates,
    type: 'bar',
    name: 'Violation Rate (%)',
    marker: {
      color: violationRates.map(rate => {
        if (rate < 5) return '#4CAF50'; // Green - Excellent
        if (rate < 15) return '#FFC107'; // Yellow - Good  
        if (rate < 30) return '#FF9800'; // Orange - Moderate
        return '#F44336'; // Red - Needs Attention
      }),
      opacity: 0.8
    },
    text: violationRates.map(rate => `${rate}%`),
    textposition: 'auto'
  };

  const layout = {
    title: {
      text: 'Feature Violation Rate Summary',
      font: { 
        family: 'Montserrat, sans-serif',
        size: 16,
        color: NU_COLORS.darkPurple
      }
    },
    xaxis: {
      title: 'Acoustic Features',
      font: { family: 'Lato, sans-serif', size: 10 },
      tickangle: -45,
      tickmode: 'array',
      tickvals: features,
      ticktext: features.map(feature => {
        // Shorten long feature names for better display
        const shortNames = {
          'LUFS': 'LUFS',
          'RMS Energy': 'RMS Energy',
          'Relative Amplitude': 'Rel. Amplitude',
          'Spectral Centroid (Hz)': 'Spectral Centroid',
          'Spectral Bandwidth (Hz)': 'Spectral Bandwidth',
          'Pitch Mean (Hz)': 'Pitch Mean',
          'MFCC Mean': 'MFCC Mean',
          'MFCC Std Dev': 'MFCC Std Dev'
        };
        return shortNames[feature] || feature;
      }),
      automargin: true
    },
    yaxis: {
      title: 'Violation Rate (%)',
      font: { family: 'Lato, sans-serif', size: 11 }
    },
    plot_bgcolor: 'white',
    paper_bgcolor: 'white',
    margin: { t: 50, r: 20, b: 140, l: 60 }
  };

  const config = {
    responsive: true,
    displayModeBar: false
  };

  Plotly.newPlot(containerId, [trace], layout, config);
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(loadDashboardData, 100);
});

// Fallback initialization if DOMContentLoaded already fired
if (document.readyState === 'loading') {
  // Document still loading, event listener will handle it
} else {
  // Document already loaded, initialize immediately
  setTimeout(loadDashboardData, 100);
}
