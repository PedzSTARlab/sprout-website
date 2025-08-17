// SPROUT Dashboard JavaScript
console.log('Dashboard JavaScript loaded successfully');

// Northwestern University brand colors
const NU_COLORS = {
  purple: '#4E2A84',
  lightPurple: '#836EAA',
  gray: '#716C6B',
  lightGray: '#D8D6D0',
  white: '#FFFFFF'
};

// Load dashboard data and initialize charts
async function loadDashboardData() {
  try {
    console.log('Loading dashboard data...');
    
    // Try multiple possible paths for the data file
    const possiblePaths = ['../js/dashboard-data.json', 'js/dashboard-data.json', './js/dashboard-data.json'];
    let response;
    let dataPath;
    
    for (const path of possiblePaths) {
      try {
        console.log(`Trying path: ${path}`);
        response = await fetch(path);
        if (response.ok) {
          dataPath = path;
          console.log(`Success with path: ${path}`);
          break;
        }
      } catch (e) {
        console.log(`Failed path: ${path}`);
      }
    }
    
    if (!response || !response.ok) {
      throw new Error(`Could not load data from any path. Last status: ${response?.status}`);
    }
    
    console.log('Response status:', response.status);
    console.log('Data path used:', dataPath);
    
    const data = await response.json();
    console.log('Data loaded successfully:', data.summary_stats);
    
    // Update metrics
    updateMetrics(data.summary_stats);
    
    // Create charts
    createUSMap(data.city_counts);
    createCityTable(data.city_counts);
    createAgeChart(data.age_data);
    createRaceChart(data.race_counts);
    createHispanicChart(data.hispanic_counts);
    createDemoChart(data.demo_counts);
    
    // Create feature analysis charts if data is available
    if (data.feature_analysis && Object.keys(data.feature_analysis).length > 0) {
      createFeatureCharts(data.feature_analysis);
    }
    
    // Create QC summary if data is available
    if (data.qc_summary && Object.keys(data.qc_summary).length > 0) {
      createEligibilityChart(data.qc_summary);
      createQCSummaryTable(data.feature_analysis);
    }
    
    console.log('Dashboard initialized successfully');
    
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    showErrorMessage();
  }
}

// Update metric cards
function updateMetrics(stats) {
  document.getElementById('total-participants').textContent = stats.total_participants.toLocaleString();
  document.getElementById('active-cities').textContent = stats.active_cities;
  document.getElementById('avg-age').textContent = stats.avg_age.toFixed(1) + ' years';
  document.getElementById('age-range').textContent = stats.age_range.toFixed(1) + ' years';
}

// Create US Map
function createUSMap(cityData) {
  // Define US Census regions and colors
  const regionColors = {
    'West': '#FFA500',
    'Midwest': '#228B22', 
    'South': '#1E90FF',
    'Northeast': '#FF0000'
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
    text: cityData.map(d => `${d.City}<br>${d.Participant_Count} participants`),
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

  Plotly.newPlot('us-map', [choroplethTrace, cityTrace], layout, {responsive: true});
}

// Create city table
function createCityTable(cityData) {
  const sortedData = cityData.sort((a, b) => b.Participant_Count - a.Participant_Count);
  
  let tableHTML = `
    <table>
      <thead>
        <tr>
          <th>City</th>
          <th>Number of Participants</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  sortedData.forEach(city => {
    tableHTML += `
      <tr>
        <td>${city.City}</td>
        <td>${city.Participant_Count.toLocaleString()}</td>
      </tr>
    `;
  });
  
  tableHTML += '</tbody></table>';
  document.getElementById('city-table').innerHTML = tableHTML;
}

// Create age distribution chart
function createAgeChart(ageData) {
  const ages = ageData.map(d => d.age);
  const participantIds = ageData.map(d => d.participant_id);
  const ageLabels = ageData.map(d => d.ss_child_chronological_age);
  
  const trace = {
    x: ages.map((_, i) => i),
    y: ages,
    mode: 'markers',
    type: 'scatter',
    marker: {
      color: NU_COLORS.purple,
      size: 8,
      opacity: 0.7
    },
    text: participantIds,
    customdata: ageLabels,
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
      color: NU_COLORS.purple
    },
    yaxis: {
      title: 'Age (Years)',
      color: NU_COLORS.purple
    },
    plot_bgcolor: 'rgba(0,0,0,0)',
    paper_bgcolor: 'rgba(0,0,0,0)',
    font: { color: NU_COLORS.purple },
    height: 400,
    showlegend: false
  };

  Plotly.newPlot('age-chart', [trace], layout, {responsive: true});
}

// Create race distribution chart
function createRaceChart(raceData) {
  const races = Object.keys(raceData);
  const counts = Object.values(raceData);

  const trace = {
    x: races,
    y: counts,
    type: 'bar',
    marker: {
      color: counts,
      colorscale: [[0, NU_COLORS.lightPurple], [1, NU_COLORS.purple]],
      opacity: 0.8
    },
    hovertemplate: '%{x}<br>Count: %{y}<extra></extra>'
  };

  const layout = {
    title: {
      text: 'Participants by Reported Child Race',
      font: {
        size: 16,
        color: NU_COLORS.purple,
        family: 'Arial'
      }
    },
    xaxis: {
      title: 'Race',
      tickangle: -45,
      color: NU_COLORS.purple
    },
    yaxis: {
      title: 'Number of Participants',
      color: NU_COLORS.purple
    },
    plot_bgcolor: 'rgba(0,0,0,0)',
    paper_bgcolor: 'rgba(0,0,0,0)',
    font: { color: NU_COLORS.purple },
    margin: { l: 60, r: 20, t: 60, b: 100 },
    showlegend: false
  };

  Plotly.newPlot('race-chart', [trace], layout, {responsive: true});
}

// Create Hispanic chart
function createHispanicChart(hispanicData) {
  const ethnicities = Object.keys(hispanicData);
  const counts = Object.values(hispanicData);

  const trace = {
    x: ethnicities,
    y: counts,
    type: 'bar',
    marker: {
      color: counts,
      colorscale: [[0, NU_COLORS.lightPurple], [1, NU_COLORS.purple]],
      opacity: 0.8
    },
    hovertemplate: '%{x}<br>Count: %{y}<extra></extra>'
  };

  const layout = {
    title: {
      text: 'Participants by Hispanic / Latine Identification',
      font: {
        size: 16,
        color: NU_COLORS.purple,
        family: 'Arial'
      }
    },
    xaxis: {
      title: 'Ethnicity',
      tickangle: -30,
      color: NU_COLORS.purple
    },
    yaxis: {
      title: 'Number of Participants',
      color: NU_COLORS.purple
    },
    plot_bgcolor: 'rgba(0,0,0,0)',
    paper_bgcolor: 'rgba(0,0,0,0)',
    font: { color: NU_COLORS.purple },
    margin: { l: 60, r: 20, t: 60, b: 100 },
    showlegend: false
  };

  Plotly.newPlot('hispanic-chart', [trace], layout, {responsive: true});
}

// Create demographic groups chart
function createDemoChart(demoData) {
  const groups = Object.keys(demoData);
  const counts = Object.values(demoData);

  const trace = {
    x: groups,
    y: counts,
    type: 'bar',
    marker: {
      color: counts,
      colorscale: [[0, NU_COLORS.lightPurple], [1, NU_COLORS.purple]],
      opacity: 0.8
    },
    hovertemplate: '%{x}<br>Count: %{y}<extra></extra>'
  };

  const layout = {
    title: {
      text: 'Participants by Demographic Group',
      font: {
        size: 18,
        color: NU_COLORS.purple,
        family: 'Arial'
      }
    },
    xaxis: {
      title: 'Demographic Group',
      color: NU_COLORS.purple
    },
    yaxis: {
      title: 'Number of Participants',
      color: NU_COLORS.purple
    },
    plot_bgcolor: 'rgba(0,0,0,0)',
    paper_bgcolor: 'rgba(0,0,0,0)',
    font: { color: NU_COLORS.purple },
    showlegend: false
  };

  Plotly.newPlot('demo-chart', [trace], layout, {responsive: true});
}

// Create feature analysis charts
function createFeatureCharts(featureData) {
  const features = Object.keys(featureData);
  
  features.forEach((feature, index) => {
    const data = featureData[feature];
    if (!data || !data.values) return;
    
    // Get container ID based on feature name
    const containerId = getFeatureContainerId(feature);
    
    // Create threshold status for each data point
    const thresholdStatus = data.values.map(value => {
      if (value < data.low_threshold) return 'Below Threshold';
      if (value > data.high_threshold) return 'Above Threshold';
      return 'Within Range';
    });
    
    const trace = {
      x: data.values.map((_, i) => i),
      y: data.values,
      mode: 'markers',
      type: 'scatter',
      marker: {
        color: thresholdStatus.map(status => {
          switch(status) {
            case 'Within Range': return '#2E8B57';
            case 'Below Threshold': return '#DC143C';
            case 'Above Threshold': return '#FF8C00';
            default: return NU_COLORS.gray;
          }
        }),
        size: 8,
        opacity: 0.7,
        line: { width: 1, color: 'white' }
      },
      text: data.filenames,
      customdata: data.cities,
      hovertemplate: 'File: %{text}<br>City: %{customdata}<br>Value: %{y}<br>Status: ' + 
                     thresholdStatus.map(s => s).join('<br>Status: ') + '<extra></extra>'
    };

    const layout = {
      title: {
        text: `${feature} Quality Control Analysis`,
        font: { size: 14, color: NU_COLORS.purple, family: 'Arial' }
      },
      xaxis: {
        title: 'Sample Index',
        color: NU_COLORS.purple
      },
      yaxis: {
        title: feature,
        color: NU_COLORS.purple
      },
      plot_bgcolor: 'rgba(0,0,0,0)',
      paper_bgcolor: 'rgba(0,0,0,0)',
      font: { color: NU_COLORS.purple, size: 10 },
      height: 400,
      margin: { l: 50, r: 50, t: 50, b: 50 },
      shapes: [
        // Lower threshold line
        {
          type: 'line',
          x0: 0,
          x1: data.values.length,
          y0: data.low_threshold,
          y1: data.low_threshold,
          line: {
            color: '#DC143C',
            width: 2,
            dash: 'dash'
          }
        },
        // Upper threshold line
        {
          type: 'line',
          x0: 0,
          x1: data.values.length,
          y0: data.high_threshold,
          y1: data.high_threshold,
          line: {
            color: '#DC143C',
            width: 2,
            dash: 'dash'
          }
        }
      ],
      annotations: [
        {
          x: data.values.length * 0.1,
          y: data.low_threshold,
          text: `Lower Threshold: ${data.low_threshold}`,
          showarrow: false,
          font: { color: '#DC143C', size: 10 }
        },
        {
          x: data.values.length * 0.1,
          y: data.high_threshold,
          text: `Upper Threshold: ${data.high_threshold}`,
          showarrow: false,
          font: { color: '#DC143C', size: 10 }
        }
      ]
    };

    Plotly.newPlot(containerId, [trace], layout, {responsive: true});
  });
}

// Get container ID for feature charts
function getFeatureContainerId(feature) {
  const idMap = {
    'LUFS': 'lufs-chart',
    'RMS Energy': 'rms-chart',
    'Relative Amplitude': 'amplitude-chart',
    'Spectral Centroid (Hz)': 'centroid-chart',
    'Spectral Bandwidth (Hz)': 'bandwidth-chart',
    'Pitch Mean (Hz)': 'pitch-chart',
    'MFCC Mean': 'mfcc-mean-chart',
    'MFCC Std Dev': 'mfcc-std-chart'
  };
  return idMap[feature] || 'feature-chart';
}

// Create eligibility analysis chart
function createEligibilityChart(qcData) {
  if (!qcData.eligibility_by_city) return;
  
  const cityEligibilityData = qcData.eligibility_by_city;
  
  // Prepare data for grouped bar chart
  const cities = [...new Set(cityEligibilityData.map(d => d.City))];
  const eligibleData = cities.map(city => {
    const record = cityEligibilityData.find(d => d.City === city && (d['1'] || d['Eligible'] || d['Pass']));
    return record ? record.Count : 0;
  });
  const notEligibleData = cities.map(city => {
    const record = cityEligibilityData.find(d => d.City === city && (d['0'] || d['Not Eligible'] || d['Fail']));
    return record ? record.Count : 0;
  });

  const trace1 = {
    x: cities,
    y: eligibleData,
    name: 'Eligible',
    type: 'bar',
    marker: { color: '#2E8B57' }
  };

  const trace2 = {
    x: cities,
    y: notEligibleData,
    name: 'Not Eligible', 
    type: 'bar',
    marker: { color: '#DC143C' }
  };

  const layout = {
    title: {
      text: 'Eligibility Status Distribution by City',
      font: { size: 16, color: NU_COLORS.purple, family: 'Arial' }
    },
    xaxis: {
      title: 'City',
      tickangle: -45,
      color: NU_COLORS.purple
    },
    yaxis: {
      title: 'Number of Samples',
      color: NU_COLORS.purple
    },
    plot_bgcolor: 'rgba(0,0,0,0)',
    paper_bgcolor: 'rgba(0,0,0,0)',
    font: { color: NU_COLORS.purple },
    height: 400,
    barmode: 'group'
  };

  Plotly.newPlot('city-eligibility-chart', [trace1, trace2], layout, {responsive: true});
}

// Create QC summary table
function createQCSummaryTable(featureData) {
  if (!featureData || Object.keys(featureData).length === 0) return;
  
  const features = Object.keys(featureData);
  
  let tableHTML = `
    <table>
      <thead>
        <tr>
          <th>Feature</th>
          <th>Total Samples</th>
          <th>Within Range</th>
          <th>Below Threshold</th>
          <th>Above Threshold</th>
          <th>Violation Rate (%)</th>
          <th>QC Status</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  features.forEach(feature => {
    const data = featureData[feature];
    const violationRate = data.violation_rate.toFixed(1);
    
    let status = 'Excellent';
    if (data.violation_rate >= 30) status = 'Needs Attention';
    else if (data.violation_rate >= 15) status = 'Moderate';
    else if (data.violation_rate >= 5) status = 'Good';
    
    const statusEmoji = {
      'Excellent': '✅',
      'Good': '👍', 
      'Moderate': '⚠️',
      'Needs Attention': '🔴'
    }[status];
    
    tableHTML += `
      <tr>
        <td>${feature}</td>
        <td>${data.total_samples.toLocaleString()}</td>
        <td>${data.within_range.toLocaleString()}</td>
        <td>${data.below_threshold.toLocaleString()}</td>
        <td>${data.above_threshold.toLocaleString()}</td>
        <td>${violationRate}%</td>
        <td>${statusEmoji} ${status}</td>
      </tr>
    `;
  });
  
  tableHTML += '</tbody></table>';
  document.getElementById('qc-summary-table').innerHTML = tableHTML;
}

// Make loadDashboardData globally available for debugging
window.loadDashboardData = loadDashboardData;

// Show error message if data fails to load
function showErrorMessage() {
  const errorMsg = `
    <div style="text-align: center; padding: 2rem; color: #dc3545;">
      <h3>⚠️ Unable to load dashboard data</h3>
      <p>Please check the data files and try refreshing the page.</p>
      <p>In the meantime, you can view the <a href="https://pedzstar-sprout.streamlit.app/" target="_blank">live dashboard</a>.</p>
    </div>
  `;
  
  document.querySelectorAll('.chart-container').forEach(container => {
    container.innerHTML = errorMsg;
  });
}

// Handle window resize for responsive charts
window.addEventListener('resize', function() {
  // Main charts
  Plotly.Plots.resize('us-map');
  Plotly.Plots.resize('age-chart');
  Plotly.Plots.resize('race-chart');
  Plotly.Plots.resize('hispanic-chart');
  Plotly.Plots.resize('demo-chart');
  
  // Feature charts
  const featureCharts = [
    'lufs-chart', 'rms-chart', 'amplitude-chart', 'centroid-chart',
    'bandwidth-chart', 'pitch-chart', 'mfcc-mean-chart', 'mfcc-std-chart'
  ];
  
  featureCharts.forEach(chartId => {
    const element = document.getElementById(chartId);
    if (element && element.data) {
      Plotly.Plots.resize(chartId);
    }
  });
  
  // QC charts
  if (document.getElementById('eligibility-chart')) {
    Plotly.Plots.resize('eligibility-chart');
  }
  if (document.getElementById('city-eligibility-chart')) {
    Plotly.Plots.resize('city-eligibility-chart');
  }
});
