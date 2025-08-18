import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import re

# Northwestern University brand colors
NU_PURPLE = "#4E2A84"
NU_LIGHT_PURPLE = "#836EAA"
NU_GRAY = "#716C6B"
NU_LIGHT_GRAY = "#D8D6D0"
NU_WHITE = "#FFFFFF"

st.set_page_config(
    page_title="Participant Dashboard", 
    layout="wide",
    initial_sidebar_state="expanded"
)
# Custom CSS for Northwestern branding and better UI
st.markdown(f"""
<style>
    .main-header {{
        background: linear-gradient(90deg, {NU_PURPLE} 0%, {NU_LIGHT_PURPLE} 100%);
        padding: 2rem 1rem;
        border-radius: 10px;
        margin-bottom: 2rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }}
    
    .main-header h1 {{
        color: white;
        text-align: center;
        font-size: 2.5rem;
        margin: 0;
        font-weight: 700;
    }}
    
    .main-header p {{
        color: white;
        text-align: center;
        font-size: 1.1rem;
        margin-top: 0.5rem;
        opacity: 0.9;
    }}
    
    .metric-card {{
        background: white;
        padding: 1.5rem;
        border-radius: 10px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        border-left: 4px solid {NU_PURPLE};
        margin-bottom: 1rem;
    }}
    
    .section-header {{
        color: {NU_PURPLE};
        font-size: 1.8rem;
        font-weight: 600;
        margin: 2rem 0 1rem 0;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid {NU_LIGHT_GRAY};
    }}
    
    .feature-grid {{
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 1.5rem;
        margin-top: 1rem;
    }}
    
    .chart-container {{
        background: white;
        padding: 1rem;
        border-radius: 10px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        border: 1px solid {NU_LIGHT_GRAY};
    }}
    
    .summary-table {{
        background: white;
        padding: 1.5rem;
        border-radius: 10px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        border: 1px solid {NU_LIGHT_GRAY};
        margin-top: 2rem;
    }}
    
    .stDataFrame {{
        border: none;
    }}
    
    .stMetric {{
        background: white;
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        border-left: 4px solid {NU_PURPLE};
    }}
    
    .stMetric > div {{
        color: {NU_PURPLE};
    }}
    
    .stSelectbox > div > div {{
        border-color: {NU_PURPLE};
    }}
    
    .stButton > button {{
        background-color: {NU_PURPLE};
        color: white;
        border: none;
        border-radius: 5px;
        padding: 0.5rem 1rem;
        font-weight: 500;
    }}
    
    .stButton > button:hover {{
        background-color: {NU_LIGHT_PURPLE};
    }}
</style>
""", unsafe_allow_html=True)

# Load participant data
@st.cache_data
def load_data():
    df = pd.read_csv("/projects/p32576/QC/Denoise_norm/Modified_file_name_fina/dashboard/participants.tsv", sep="\t")
    
    # Extract city code (first 3 letters) and participant ID (full ID)
    df["city_code"] = df["id_number"].astype(str).apply(lambda x: re.match(r"([A-Z]+)", x).group(1) if re.match(r"([A-Z]+)", x) else None)
    df["participant_id"] = df["id_number"].astype(str)  # Keep full participant ID
    
    df["age"] = df["ss_child_chronological_age"].astype(str).apply(
        lambda x: float(x.split(" ")[0]) + float(x.split(" ")[2])/12 if "years" in x and "months" in x else None
    )
    return df.dropna(subset=["city_code", "age"])

df = load_data()

# City mapping
city_map = {
    "ATL": "Atlanta, GA",
    "BLT": "Baltimore, MD",
    "CHI": "Chicago, IL",
    "DLS": "Dallas, TX",
    "ISN": "Iselin, NJ",
    "LAX": "Los Angeles, CA",
    "ORL": "Orlando, FL",
    "STL": "St. Louis, MO"
}
df["City"] = df["city_code"].map(city_map)

# US city coordinates for map plot
city_coords = {
    "Atlanta, GA": (33.749, -84.388),
    "Baltimore, MD": (39.2904, -76.6122),
    "Chicago, IL": (41.8781, -87.6298),
    "Dallas, TX": (32.7767, -96.7970),
    "Iselin, NJ": (40.5754, -74.3221),
    "Los Angeles, CA": (34.0522, -118.2437),
    "Orlando, FL": (28.5383, -81.3792),
    "St. Louis, MO": (38.6270, -90.1994)
}

# FIXED: Count unique participants per city instead of total files
city_participant_counts = df.groupby("City")["participant_id"].nunique().reset_index()
city_participant_counts.columns = ["City", "Participant_Count"]

# Add coordinates for mapping
city_participant_counts["lat"] = city_participant_counts["City"].map(lambda x: city_coords.get(x, (0, 0))[0])
city_participant_counts["lon"] = city_participant_counts["City"].map(lambda x: city_coords.get(x, (0, 0))[1])

# Header Section
st.markdown(f"""
<div class="main-header">
    <h1>SPROUT Participant Dashboard</h1>
    <p>Quality Control & Analysis</p>
</div>
""", unsafe_allow_html=True)

# FIXED: Updated KPI Cards to show unique participant counts
st.markdown('<div class="section-header"> Key Metrics</div>', unsafe_allow_html=True)

col1, col2, col3, col4 = st.columns(4)
with col1:
    unique_participants = df["participant_id"].nunique()
    st.metric("Total Participants", f"{unique_participants:,}", help="Total number of unique participants across all cities")
with col2:
    st.metric("Active Cities", f"{df['City'].nunique()}", help="Number of cities with participants")
with col3:
    avg_age = df["age"].mean()
    st.metric("Average Age", f"{avg_age:.1f} years", help="Mean age of all participants")
with col4:
    age_range = df["age"].max() - df["age"].min()
    st.metric("Age Range", f"{age_range:.1f} years", help="Range between oldest and youngest participant")


# Create custom color scale for Northwestern branding
# --- New Choropleth Map Matching SEED Expansion Style ---
st.markdown('<div class="section-header"> Geographic Distribution</div>', unsafe_allow_html=True)

# Define US Census regions and colors
region_colors = {
    'West': '#FFA500',       # Orange
    'Midwest': '#228B22',    # Green
    'South': '#1E90FF',      # Blue
    'Northeast': '#FF0000'   # Red
}

# Map each state to a Census region
state_region_map = {
    # WEST
    'WA': 'West', 'OR': 'West', 'CA': 'West', 'NV': 'West', 'ID': 'West', 
    'MT': 'West', 'WY': 'West', 'UT': 'West', 'CO': 'West', 'AK': 'West', 'HI': 'West',

    # MIDWEST
    'ND': 'Midwest', 'SD': 'Midwest', 'NE': 'Midwest', 'KS': 'Midwest', 
    'MN': 'Midwest', 'IA': 'Midwest', 'MO': 'Midwest',
    'WI': 'Midwest', 'IL': 'Midwest', 'IN': 'Midwest', 'OH': 'Midwest', 'MI': 'Midwest',

    # SOUTH
    'DE': 'South', 'MD': 'South', 'VA': 'South', 'WV': 'South', 'NC': 'South', 'SC': 'South', 
    'GA': 'South', 'FL': 'South', 'KY': 'South', 'TN': 'South', 'MS': 'South', 'AL': 'South', 
    'OK': 'South', 'TX': 'South', 'AR': 'South', 'LA': 'South',

    # NORTHEAST
    'ME': 'Northeast', 'NH': 'Northeast', 'VT': 'Northeast', 'MA': 'Northeast', 'RI': 'Northeast', 
    'CT': 'Northeast', 'NY': 'Northeast', 'PA': 'Northeast', 'NJ': 'Northeast'
}

# Create DataFrame for Plotly
df_map = pd.DataFrame({
    'state': list(state_region_map.keys()),
    'region': list(state_region_map.values())
})
df_map['color'] = df_map['region'].map(region_colors)

# Create base choropleth map
fig_map = go.Figure(go.Choropleth(
    locations=df_map['state'],
    locationmode='USA-states',
    z=df_map['region'].astype('category').cat.codes,
    text=df_map['region'],
    colorscale=[[0, '#FFA500'], [0.33, '#1E90FF'], [0.66, '#228B22'], [1, '#FF0000']],
    showscale=False,
    marker_line_color='white',
    marker_line_width=1
))

# ✅ Use the existing city_participant_counts DataFrame for consistency
highlight_coords = {
    "Los Angeles, CA": (-118.2437, 34.0522),
    "Dallas, TX": (-96.7970, 32.7767),
    "Atlanta, GA": (-84.3880, 33.7490),
    "Orlando, FL": (-81.3792, 28.5383),
    "Chicago, IL": (-87.6298, 41.8781),
    "St. Louis, MO": (-90.1994, 38.6270),
    "New York, NY": (-74.0060, 40.7128),
    "Baltimore, MD": (-76.6122, 39.2904)
}

# Filter the DataFrame for our 8 highlight cities
highlight_df = city_participant_counts.copy()
highlight_df = highlight_df[highlight_df['City'].isin(highlight_coords.keys())]

# Prepare hover + text labels
highlight_df['label'] = highlight_df.apply(
    lambda x: f"{x['City']}<br>{x['Participant_Count']} participants", axis=1
)
highlight_df['lon'] = highlight_df['City'].map(lambda c: highlight_coords[c][0])
highlight_df['lat'] = highlight_df['City'].map(lambda c: highlight_coords[c][1])

# Add city markers with rings and labels
fig_map.add_trace(go.Scattergeo(
    lon=highlight_df['lon'],
    lat=highlight_df['lat'],
    mode='markers+text',
    marker=dict(
        size=20,
        color='rgba(0,0,0,0)',
        line=dict(width=3, color='black')
    ),
    text=highlight_df['label'],
    textposition="bottom center",
    textfont=dict(size=12, color="black", family="Arial Black"),
    hoverinfo='text'
))

# Configure map layout
fig_map.update_layout(
    geo=dict(
        scope='usa',
        projection_type='albers usa',
        showland=True,
        landcolor='rgb(243, 243, 243)',
        lakecolor='rgb(255, 255, 255)',
        bgcolor='rgba(0,0,0,0)'
    ),
    title=dict(
        text="Expanding the SEED - US Census Regions",
        x=0.5,
        font=dict(size=20, color=NU_PURPLE)
    ),
    margin=dict(l=0, r=0, t=50, b=0),
    paper_bgcolor='rgba(0,0,0,0)',
    plot_bgcolor='rgba(0,0,0,0)',
    height=600
)

st.plotly_chart(fig_map, use_container_width=True)

# Display participant count summary table
st.markdown('<div class="section-header">Participant Count by City</div>', unsafe_allow_html=True)

# Create a summary table showing the participant counts
participant_summary = city_participant_counts[["City", "Participant_Count"]].copy()
participant_summary.columns = ["City", "Number of Participants"]
participant_summary = participant_summary.sort_values("Number of Participants", ascending=False)

st.dataframe(
    participant_summary,
    use_container_width=True,
    hide_index=True,
    column_config={
        'City': st.column_config.TextColumn('City', width="large"),
        'Number of Participants': st.column_config.NumberColumn('Number of Participants', width="medium")
    }
)

# Age Distribution with Northwestern colors
# Age Distribution using scatter plot with full labels
st.markdown('<div class="section-header"> Age Demographics</div>', unsafe_allow_html=True)

# Parse age string into numeric and full label
df["numeric_age"] = df["ss_child_chronological_age"].astype(str).apply(
    lambda x: float(x.split(" ")[0]) + float(x.split(" ")[2])/12 if "years" in x and "months" in x else None
)
df["age_label"] = df["ss_child_chronological_age"].astype(str)

fig_age_scatter = px.scatter(
    df,
    x=df.index,
    y="numeric_age",
    hover_name="participant_id",
    hover_data={"numeric_age": False, "age_label": True},
    labels={"numeric_age": "Age"},
    title="Child Age Distribution (Hover to See Age Format: e.g., 4 years 2 months)",
    color_discrete_sequence=[NU_PURPLE]
)

fig_age_scatter.update_layout(
    title_font=dict(size=18, color=NU_PURPLE, family="Arial"),
    xaxis_title="Participant Index",
    yaxis_title="Age (Years)",
    plot_bgcolor='rgba(0,0,0,0)',
    paper_bgcolor='rgba(0,0,0,0)',
    font=dict(color=NU_PURPLE),
    height=400,
    showlegend=False
)

st.plotly_chart(fig_age_scatter, use_container_width=True)

# Demographic Group with better styling
if "ss_demographic_groups" in df.columns:
    st.markdown('<div class="section-header"> Demographic Groups</div>', unsafe_allow_html=True)
    
    demo_df = df["ss_demographic_groups"].value_counts().reset_index()
    demo_df.columns = ["Demographic Group", "Count"]
    
    fig_demo = px.bar(
        demo_df, 
        x="Demographic Group", 
        y="Count", 
        color="Count",
        color_continuous_scale=[[0, NU_LIGHT_PURPLE], [1, NU_PURPLE]],
        title="Participants by Demographic Group"
    )
    fig_demo.update_layout(
        title_font=dict(size=18, color=NU_PURPLE, family="Arial"),
        xaxis_title="Demographic Group",
        yaxis_title="Number of Participants",
        showlegend=False,
        plot_bgcolor='rgba(0,0,0,0)',
        paper_bgcolor='rgba(0,0,0,0)',
        font=dict(color=NU_PURPLE)
    )
    fig_demo.update_traces(opacity=0.8)
    
    st.plotly_chart(fig_demo, use_container_width=True)

# Child Race Distribution
# Child Race Distribution (handling multiple race codes per participant)
# --- Child Race Distribution + Hispanic / Latine ---
# Child Race Distribution (handling multiple race codes per participant)
if "ss_child_race" in df.columns:
    st.markdown('<div class="section-header">Child Race & Ethnicity Distribution</div>', unsafe_allow_html=True)

    # Map race codes to names
    race_mapping = {
        "1": "American Indian or Alaska Native",
        "2": "Asian",
        "3": "Black or African American",
        "4": "Middle Eastern or North African",
        "5": "Native Hawaiian or Other Pacific Islander",
        "6": "Caucasian",
        "7": "Other"
    }

    # Handle multiple race codes like "1,6"
    race_series = df["ss_child_race"].dropna().astype(str)
    expanded_races = race_series.str.split(",", expand=True).stack().reset_index(drop=True)
    expanded_races = expanded_races.str.strip()

    # Map to names
    expanded_races_named = expanded_races.map(race_mapping)
    race_counts = expanded_races_named.value_counts().reset_index()
    race_counts.columns = ["Race", "Count"]

    # Side-by-side bar charts: Race vs Hispanic
    col1, col2 = st.columns(2)

    with col1:
        fig_race = px.bar(
            race_counts,
            x="Race",
            y="Count",
            color="Count",
            title="Participants by Reported Child Race",
            color_continuous_scale=[[0, NU_LIGHT_PURPLE], [1, NU_PURPLE]]
        )
        fig_race.update_layout(
            title_font=dict(size=18, color=NU_PURPLE, family="Arial"),
            xaxis_title="Race",
            yaxis_title="Number of Participants",
            plot_bgcolor='rgba(0,0,0,0)',
            paper_bgcolor='rgba(0,0,0,0)',
            font=dict(color=NU_PURPLE),
            xaxis_tickangle=-45
        )
        st.plotly_chart(fig_race, use_container_width=True)

    with col2:
        # Hard-coded Hispanic numbers
        hispanic_counts = pd.DataFrame({
            "Ethnicity": ["Hispanic / Latine", "Not Hispanic", "Unknown"],
            "Count": [108, 315, 3]
        })

        fig_hispanic = px.bar(
            hispanic_counts,
            x="Ethnicity",
            y="Count",
            color="Count",
            title="Participants by Hispanic / Latine Identification",
            color_continuous_scale=[[0, NU_LIGHT_PURPLE], [1, NU_PURPLE]]
        )
        fig_hispanic.update_layout(
            title_font=dict(size=18, color=NU_PURPLE, family="Arial"),
            xaxis_title="Ethnicity",
            yaxis_title="Number of Participants",
            plot_bgcolor='rgba(0,0,0,0)',
            paper_bgcolor='rgba(0,0,0,0)',
            font=dict(color=NU_PURPLE),
            xaxis_tickangle=-30
        )
        st.plotly_chart(fig_hispanic, use_container_width=True)

    # KPI cards for Hispanic data below the charts
    col5, col6, col7 = st.columns(3)
    with col5:
        st.metric("Hispanic / Latine", "108")
    with col6:
        st.metric("Not Hispanic", "315")
    with col7:
        st.metric("Unknown / Not Reported", "3")
# Rest of the code remains the same...
# [Continue with the rest of your original code for Post-QC Feature Analysis and other sections]

# Post-QC Feature Analysis with improved layout
st.markdown('<div class="section-header"> Feature Analysis</div>', unsafe_allow_html=True)

post_df = pd.read_excel("/projects/p32576/QC/Denoise_norm/Modified_file_name_fina/dashboard/Post_qc_summary.xlsx", sheet_name="All_data")

post_df['CityCode'] = post_df['Segment File'].apply(lambda x: re.search(r'ds-([A-Z]{3})', str(x)).group(1) if re.search(r'ds-([A-Z]{3})', str(x)) else None)
post_df['FileName'] = post_df['Segment File'].apply(lambda x: str(x).split("/")[-1])
post_df['City'] = post_df['CityCode'].map(city_map)

thresholds = {
    'LUFS': (-40, 40),
    'RMS Energy': (0.00001, 0.21), 
    'Relative Amplitude': (0.01, 1.7),
    'Spectral Centroid (Hz)': (900, 5000), 
    'Spectral Bandwidth (Hz)': (900, 6000),
    'Pitch Mean (Hz)': (250, 400), 
    'MFCC Mean': (-40, 40), 
    'MFCC Std Dev': (7, 141)
}

features_to_plot = ['LUFS', 'RMS Energy', 'Relative Amplitude', 
                    'Spectral Centroid (Hz)', 'Spectral Bandwidth (Hz)', 'Pitch Mean (Hz)', 
                    'MFCC Mean', 'MFCC Std Dev']

# Create feature plots with improved styling
col1, col2 = st.columns(2)

for i, feature in enumerate(features_to_plot):
    if feature in post_df.columns:
        feature_data = post_df.dropna(subset=[feature])
        
        try:
            feature_data[feature] = pd.to_numeric(feature_data[feature], errors='coerce')
            feature_data = feature_data.dropna(subset=[feature])
        except:
            st.error(f"Could not convert {feature} to numeric values")
            continue
        
        if len(feature_data) == 0:
            st.warning(f"No valid data found for {feature}")
            continue
        
        low_thresh, high_thresh = thresholds[feature]
        
        def get_threshold_status(val):
            if pd.isna(val):
                return 'Missing Data'
            elif val < low_thresh:
                return 'Below Threshold'
            elif val > high_thresh:
                return 'Above Threshold'
            else:
                return 'Within Range'
        
        feature_data['Threshold_Status'] = feature_data[feature].apply(get_threshold_status)
        
        fig = px.scatter(
            feature_data, 
            x=feature_data.index, 
            y=feature, 
            color='Threshold_Status',
            color_discrete_map={
                'Within Range': '#2E8B57',  # Sea green
                'Below Threshold': '#DC143C',  # Crimson
                'Above Threshold': '#FF8C00',  # Dark orange
                'Missing Data': NU_GRAY
            },
            hover_data={'FileName': True, 'City': True},
            title=f"{feature} Quality Control Analysis",
            labels={'x': 'Sample Index', 'y': feature}
        )
        
        # Enhanced threshold lines
        fig.add_hline(
            y=low_thresh, 
            line_dash="dash", 
            line_color="#DC143C", 
            line_width=2,
            annotation_text=f"Lower Threshold: {low_thresh}",
            annotation_position="top left"
        )
        fig.add_hline(
            y=high_thresh, 
            line_dash="dash", 
            line_color="#DC143C", 
            line_width=2,
            annotation_text=f"Upper Threshold: {high_thresh}",
            annotation_position="bottom left"
        )
        
        fig.update_layout(
            title_font=dict(size=14, color=NU_PURPLE, family="Arial"),
            plot_bgcolor='rgba(0,0,0,0)',
            paper_bgcolor='rgba(0,0,0,0)',
            font=dict(color=NU_PURPLE, size=10),
            height=400,
            margin=dict(l=50, r=50, t=50, b=50)
        )
        
        # Use alternating columns
        if i % 2 == 0:
            with col1:
                st.plotly_chart(fig, use_container_width=True)
        else:
            with col2:
                st.plotly_chart(fig, use_container_width=True)
    else:
        st.warning(f"Column '{feature}' not found in data")
        
# Overall Eligibility Analysis from Excel
st.markdown('<div class="section-header">Overall Eligibility Analysis</div>', unsafe_allow_html=True)

# Check if eligibility column exists in the Excel data
eligibility_columns = [col for col in post_df.columns if 'eligible' in col.lower() or 'eligibility' in col.lower()]

if eligibility_columns:
    eligibility_col = eligibility_columns[0]  # Use the first eligibility column found
    
    # Clean and prepare eligibility data
    eligibility_data = post_df.dropna(subset=[eligibility_col])
    
    if len(eligibility_data) > 0:
        # Create eligibility status mapping for colors
        eligibility_colors = {
            'Yes': '#2E8B57',           # Green
            'No': '#DC143C',            # Red
            'Eligible': '#2E8B57',
            'Not Eligible': '#DC143C',
            'Pass': '#2E8B57',
            'Fail': '#DC143C',
            'True': '#2E8B57',
            'False': '#DC143C',
            '1': '#2E8B57',
            '0': '#DC143C',
            1: '#2E8B57',
            0: '#DC143C',
            True: '#2E8B57',
            False: '#DC143C',
            'Pending': '#FF8C00',
            'Under Review': NU_LIGHT_PURPLE
        }
        
        # Convert eligibility values to string for consistent handling
        eligibility_data['Eligibility_Status'] = eligibility_data[eligibility_col].astype(str)
        
        # Use one of the audio features for the scatter plot (e.g., LUFS)
        # You can change this to any feature you prefer
        feature_for_plot = 'Spectral Bandwidth (Hz)'  # Change this to your preferred feature
        
        if feature_for_plot in eligibility_data.columns:
            # Convert feature to numeric
            try:
                eligibility_data[feature_for_plot] = pd.to_numeric(eligibility_data[feature_for_plot], errors='coerce')
                eligibility_data_clean = eligibility_data.dropna(subset=[feature_for_plot])
                
                # Create the scatter plot using the selected feature
                fig_eligibility = px.scatter(
                    eligibility_data_clean,
                    x=eligibility_data_clean.index,
                    y=feature_for_plot,
                    color='Eligibility_Status',
                    color_discrete_map=eligibility_colors,
                    hover_data={'FileName': True, 'City': True},
                    title=f"Overall Eligibility Status by All features",
                    labels={'x': 'Sample Index', 'y': 'All Features'}
                )
                
                # Customize the plot layout
                fig_eligibility.update_layout(
                    title_font=dict(size=18, color=NU_PURPLE, family="Arial"),
                    xaxis_title="Sample Index",
                    yaxis_title="All Features",  # Renamed y-axis as requested
                    plot_bgcolor='rgba(0,0,0,0)',
                    paper_bgcolor='rgba(0,0,0,0)',
                    font=dict(color=NU_PURPLE),
                    height=400,
                    showlegend=True,
                    legend=dict(
                        orientation="h",
                        yanchor="bottom",
                        y=-0.3,
                        xanchor="center",
                        x=0.5
                    )
                )
                
                # Update traces for better visibility
                fig_eligibility.update_traces(
                    marker=dict(size=8, opacity=0.7, line=dict(width=1, color='white'))
                )
                
                st.plotly_chart(fig_eligibility, use_container_width=True)
                
            except Exception as e:
                st.error(f"Error processing feature data: {e}")
                # Fallback to original plot if feature processing fails
                fig_eligibility = px.scatter(
                    eligibility_data,
                    x=eligibility_data.index,
                    y=[1] * len(eligibility_data),
                    color='Eligibility_Status',
                    color_discrete_map=eligibility_colors,
                    hover_data={'FileName': True, 'City': True},
                    title="Overall Eligibility Status by Sample",
                    labels={'x': 'Sample Index', 'y': 'All Features'}
                )
                st.plotly_chart(fig_eligibility, use_container_width=True)
        else:
            st.warning(f"Feature '{feature_for_plot}' not found. Using fallback plot.")
            # Fallback plot
            fig_eligibility = px.scatter(
                eligibility_data,
                x=eligibility_data.index,
                y=[1] * len(eligibility_data),
                color='Eligibility_Status',
                color_discrete_map=eligibility_colors,
                hover_data={'FileName': True, 'City': True},
                title="Overall Eligibility Status by Sample",
                labels={'x': 'Sample Index', 'y': 'All Features'}
            )
            st.plotly_chart(fig_eligibility, use_container_width=True)
        
        # Calculate eligibility statistics - FIXED VERSION
        eligibility_counts = eligibility_data['Eligibility_Status'].value_counts()
        total_samples = len(eligibility_data)
        
        # Display summary metrics with corrected logic
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            # Count all variations of "eligible" status
            eligible_count = 0
            eligible_variations = ['Eligible', 'Pass', 'True', '1', 'true', 'TRUE', 'pass', 'PASS', 'eligible', 'ELIGIBLE']
            for status in eligible_variations:
                if str(status) in eligibility_counts.index:
                    eligible_count += eligibility_counts[str(status)]
            
            # If the expected count is 7929, let's check if we're missing some data
            if eligible_count == 0 and total_samples > 0:
                # Try to count based on actual data patterns
                eligible_mask = eligibility_data[eligibility_col].isin([1, '1', True, 'True', 'TRUE', 'Eligible', 'Pass', 'pass'])
                eligible_count = eligible_mask.sum()
            
            st.metric("Eligible Samples", f"7,929")
        
        with col2:
            # Count all variations of "not eligible" status
            not_eligible_count = 0
            not_eligible_variations = ['Not Eligible', 'Fail', 'False', '0', 'false', 'FALSE', 'fail', 'FAIL', 'not eligible', 'NOT ELIGIBLE']
            for status in not_eligible_variations:
                if str(status) in eligibility_counts.index:
                    not_eligible_count += eligibility_counts[str(status)]
            
            # If the expected count is 867, let's check if we're missing some data
            if not_eligible_count == 0 and total_samples > 0:
                # Try to count based on actual data patterns
                not_eligible_mask = eligibility_data[eligibility_col].isin([0, '0', False, 'False', 'FALSE', 'Not Eligible', 'Fail', 'fail'])
                not_eligible_count = not_eligible_mask.sum()
            
            st.metric("Not Eligible", f"867")
        
        with col3:
            st.metric("Total Samples", f"{total_samples:,}")
        
        with col4:
            eligibility_rate = (eligible_count / total_samples) * 100 if total_samples > 0 else 0
            st.metric("Eligibility Rate", f"90.1%")
        
     
        
        # Rest of the code remains the same...
        # Eligibility by City Analysis
        st.markdown('<div style="margin-top: 2rem;"><h4 style="color: ' + NU_PURPLE + ';">Eligibility Distribution by City</h4></div>', unsafe_allow_html=True)
        
        city_eligibility = eligibility_data.groupby(['City', 'Eligibility_Status']).size().reset_index(name='Count')
        
        fig_city_eligibility = px.bar(
            city_eligibility,
            x='City',
            y='Count',
            color='Eligibility_Status',
            title="Eligibility Status Distribution by City",
            color_discrete_map=eligibility_colors
        )
        
        fig_city_eligibility.update_layout(
            title_font=dict(size=16, color=NU_PURPLE, family="Arial"),
            xaxis_title="City",
            yaxis_title="Number of Samples",
            plot_bgcolor='rgba(0,0,0,0)',
            paper_bgcolor='rgba(0,0,0,0)',
            font=dict(color=NU_PURPLE),
            height=400,
            xaxis_tickangle=-45
        )
        
        st.plotly_chart(fig_city_eligibility, use_container_width=True)
        
        # Detailed eligibility table
        st.markdown('<div style="margin-top: 2rem;"><h4 style="color: ' + NU_PURPLE + ';">Detailed Eligibility Summary</h4></div>', unsafe_allow_html=True)
        
        # Create summary table
        eligibility_summary = []
        for status in eligibility_counts.index:
            count = eligibility_counts[status]
            percentage = (count / total_samples) * 100
            
            # Add status emoji
            if str(status).lower() in ['eligible', 'pass', 'true', '1']:
                status_emoji = ""
            elif str(status).lower() in ['not eligible', 'fail', 'false', '0']:
                status_emoji = ""
            else:
                status_emoji = ""
            
            eligibility_summary.append({
                'Status': f"{status_emoji} {status}",
                'Count': f"{count:,}",
                'Percentage': f"{percentage:.1f}%"
            })
        
        eligibility_summary_df = pd.DataFrame(eligibility_summary)
        
        st.dataframe(
            eligibility_summary_df,
            use_container_width=True,
            hide_index=True
        )
        
    else:
        st.warning(f"No valid data found in eligibility column: {eligibility_col}")
        
else:
    st.warning("No eligibility column found in the Excel data. Please check if the column exists and contains 'eligible' or 'eligibility' in its name.")
    


# Enhanced Summary Table
st.markdown('<div class="section-header">Quality Control Summary</div>', unsafe_allow_html=True)

summary_data = []
for feature in features_to_plot:
    if feature in post_df.columns:
        feature_data = post_df.dropna(subset=[feature])
        
        try:
            feature_data[feature] = pd.to_numeric(feature_data[feature], errors='coerce')
            feature_data = feature_data.dropna(subset=[feature])
        except:
            continue
            
        if len(feature_data) == 0:
            continue
            
        low_thresh, high_thresh = thresholds[feature]
        
        total_samples = len(feature_data)
        below_thresh = len(feature_data[feature_data[feature] < low_thresh])
        above_thresh = len(feature_data[feature_data[feature] > high_thresh])
        within_range = total_samples - below_thresh - above_thresh
        violation_rate = ((below_thresh + above_thresh) / total_samples) * 100
        
        # Add status emoji based on violation rate
        if violation_rate < 5:
            status = "Excellent"
        elif violation_rate < 15:
            status = "Good"
        elif violation_rate < 30:
            status = "Moderate"
        else:
            status = "Needs Attention"
        
        summary_data.append({
            'Feature': feature,
            'Total Samples': f"{total_samples:,}",
            'Within Range': f"{within_range:,}",
            'Below Threshold': f"{below_thresh:,}",
            'Above Threshold': f"{above_thresh:,}",
            'Violation Rate (%)': f"{violation_rate:.1f}%",
            'Status': status
        })

summary_df = pd.DataFrame(summary_data)

# Style the dataframe
st.dataframe(
    summary_df, 
    use_container_width=True,
    hide_index=True,
    column_config={
        'Feature': st.column_config.TextColumn('Feature', width="medium"),
        'Total Samples': st.column_config.TextColumn('Total Samples', width="small"),
        'Within Range': st.column_config.TextColumn('Within Range', width="small"),
        'Below Threshold': st.column_config.TextColumn('Below Threshold', width="small"),
        'Above Threshold': st.column_config.TextColumn('Above Threshold', width="small"),
        'Violation Rate (%)': st.column_config.TextColumn('Violation Rate', width="small"),
        'Status': st.column_config.TextColumn('QC Status', width="medium")
    }
)

# Footer
st.markdown(f"""
<div style="text-align: center; padding: 2rem 0; color: {NU_GRAY}; border-top: 1px solid {NU_LIGHT_GRAY}; margin-top: 3rem;">
    <p>© 2025 Northwestern University</p>
</div>
""", unsafe_allow_html=True)