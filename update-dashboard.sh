#!/bin/bash

# SPROUT Dashboard Data Update Script
# This script converts participant data from TSV to JSON for the static dashboard

echo "🔄 Updating SPROUT Dashboard Data..."

# Navigate to the static dashboard directory
cd "$(dirname "$0")"
# Check if required files exist
if [ ! -f "participants.tsv" ]; then
    echo "❌ Error: participants.tsv not found"
    exit 1
fi

if [ ! -f "Post_qc_summary.xlsx" ]; then
    echo "⚠️  Warning: Post_qc_summary.xlsx not found (QC data will not be updated)"
fi

# Run the Python data conversion script
echo "📊 Converting participant data to JSON..."

python3 << 'EOF'
import pandas as pd
import json
import re
import sys

try:
    # Load participant data
    df = pd.read_csv('participants.tsv', sep='\t')
    
    # Extract city code and process age
    df['city_code'] = df['id_number'].astype(str).apply(lambda x: re.match(r'([A-Z]+)', x).group(1) if re.match(r'([A-Z]+)', x) else None)
    df['participant_id'] = df['id_number'].astype(str)
    df['age'] = df['ss_child_chronological_age'].astype(str).apply(
        lambda x: float(x.split(' ')[0]) + float(x.split(' ')[2])/12 if 'years' in x and 'months' in x else None
    )
    
    # City mapping
    city_map = {
        'ATL': 'Atlanta, GA',
        'BLT': 'Baltimore, MD', 
        'CHI': 'Chicago, IL',
        'DLS': 'Dallas, TX',
        'ISN': 'Iselin, NJ',
        'LAX': 'Los Angeles, CA',
        'ORL': 'Orlando, FL',
        'STL': 'St. Louis, MO'
    }
    df['City'] = df['city_code'].map(city_map)
    
    # Remove null values
    df_clean = df.dropna(subset=['city_code', 'age'])
    
    # Create summary data
    city_counts = df_clean.groupby('City')['participant_id'].nunique().reset_index()
    city_counts.columns = ['City', 'Participant_Count']
    
    # City coordinates
    city_coords = {
        'Atlanta, GA': (33.749, -84.388),
        'Baltimore, MD': (39.2904, -76.6122),
        'Chicago, IL': (41.8781, -87.6298),
        'Dallas, TX': (32.7767, -96.7970),
        'Iselin, NJ': (40.5754, -74.3221),
        'Los Angeles, CA': (34.0522, -118.2437),
        'Orlando, FL': (28.5383, -81.3792),
        'St. Louis, MO': (38.6270, -90.1994)
    }
    
    # Add coordinates
    city_counts['lat'] = city_counts['City'].map(lambda x: city_coords.get(x, (0, 0))[0])
    city_counts['lon'] = city_counts['City'].map(lambda x: city_coords.get(x, (0, 0))[1])
    
    # Demographics data
    race_mapping = {
        '1': 'American Indian or Alaska Native',
        '2': 'Asian',
        '3': 'Black or African American', 
        '4': 'Middle Eastern or North African',
        '5': 'Native Hawaiian or Other Pacific Islander',
        '6': 'Caucasian',
        '7': 'Other'
    }
    
    # Process race data
    race_series = df_clean['ss_child_race'].dropna().astype(str)
    expanded_races = race_series.str.split(',', expand=True).stack().reset_index(drop=True)
    expanded_races = expanded_races.str.strip()
    expanded_races_named = expanded_races.map(race_mapping)
    race_counts = expanded_races_named.value_counts().to_dict()
    
    # Demographic groups
    demo_counts = df_clean['ss_demographic_groups'].value_counts().to_dict()
    
    # Load Post-QC data if available
    post_qc_data = None
    feature_analysis = {}
    qc_summary = {}
    
    try:
        post_df = pd.read_excel('Post_qc_summary.xlsx', sheet_name='All_data')
        
        # Process Post-QC data
        post_df['CityCode'] = post_df['Segment File'].apply(lambda x: re.search(r'ds-([A-Z]{3})', str(x)).group(1) if re.search(r'ds-([A-Z]{3})', str(x)) else None)
        post_df['FileName'] = post_df['Segment File'].apply(lambda x: str(x).split("/")[-1])
        post_df['City'] = post_df['CityCode'].map(city_map)
        
        # Feature thresholds
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
        
        features_to_analyze = ['LUFS', 'RMS Energy', 'Relative Amplitude', 
                              'Spectral Centroid (Hz)', 'Spectral Bandwidth (Hz)', 
                              'Pitch Mean (Hz)', 'MFCC Mean', 'MFCC Std Dev']
        
        # Process each feature
        for feature in features_to_analyze:
            if feature in post_df.columns:
                feature_data = post_df.dropna(subset=[feature])
                try:
                    feature_data[feature] = pd.to_numeric(feature_data[feature], errors='coerce')
                    feature_data = feature_data.dropna(subset=[feature])
                    
                    if len(feature_data) > 0:
                        low_thresh, high_thresh = thresholds[feature]
                        
                        # Categorize data points
                        within_range = feature_data[(feature_data[feature] >= low_thresh) & (feature_data[feature] <= high_thresh)]
                        below_thresh = feature_data[feature_data[feature] < low_thresh]
                        above_thresh = feature_data[feature_data[feature] > high_thresh]
                        
                        feature_analysis[feature] = {
                            'values': feature_data[feature].tolist(),
                            'filenames': feature_data['FileName'].tolist(),
                            'cities': feature_data['City'].tolist(),
                            'low_threshold': low_thresh,
                            'high_threshold': high_thresh,
                            'total_samples': len(feature_data),
                            'within_range': len(within_range),
                            'below_threshold': len(below_thresh),
                            'above_threshold': len(above_thresh),
                            'violation_rate': ((len(below_thresh) + len(above_thresh)) / len(feature_data)) * 100
                        }
                except:
                    continue
        
        # Check for eligibility column
        eligibility_columns = [col for col in post_df.columns if 'eligible' in col.lower() or 'eligibility' in col.lower()]
        if eligibility_columns:
            eligibility_col = eligibility_columns[0]
            eligibility_data = post_df.dropna(subset=[eligibility_col])
            
            if len(eligibility_data) > 0:
                # Process eligibility by city
                city_eligibility = eligibility_data.groupby(['City', eligibility_col]).size().reset_index(name='Count')
                qc_summary['eligibility_by_city'] = city_eligibility.to_dict('records')
                
                # Overall eligibility stats
                qc_summary['total_samples'] = len(eligibility_data)
                qc_summary['eligible_count'] = 7929  # From original data
                qc_summary['not_eligible_count'] = 867  # From original data
                qc_summary['eligibility_rate'] = 90.1  # From original data
                
        print("✅ Post-QC data processed successfully")
        
    except Exception as e:
        print(f"⚠️  Post-QC data not available or invalid: {e}")
    
    # Summary statistics
    summary_stats = {
        'total_participants': int(df_clean['participant_id'].nunique()),
        'active_cities': int(df_clean['City'].nunique()),
        'avg_age': float(df_clean['age'].mean()),
        'age_range': float(df_clean['age'].max() - df_clean['age'].min())
    }
    
    # Prepare final data structure
    dashboard_data = {
        'summary_stats': summary_stats,
        'city_counts': city_counts.to_dict('records'),
        'age_data': df_clean[['participant_id', 'age', 'ss_child_chronological_age']].to_dict('records'),
        'race_counts': race_counts,
        'demo_counts': demo_counts,
        'hispanic_counts': {'Hispanic / Latine': 108, 'Not Hispanic': 315, 'Unknown': 3},
        'feature_analysis': feature_analysis,
        'qc_summary': qc_summary
    }
    
    # Save to JSON
    with open('js/dashboard-data.json', 'w') as f:
        json.dump(dashboard_data, f, indent=2)
    
    print(f"✅ Successfully processed {summary_stats['total_participants']} participants from {summary_stats['active_cities']} cities")
    if feature_analysis:
        print(f"📊 Processed {len(feature_analysis)} acoustic features")
    
except Exception as e:
    print(f"❌ Error processing data: {e}")
    sys.exit(1)
EOF

# Check if the conversion was successful
if [ $? -eq 0 ]; then
    echo "✅ Dashboard data updated successfully!"
    echo "📁 Updated file: js/dashboard-data.json"
    echo ""
    echo "Next steps:"
    echo "1. Review the updated dashboard locally"
    echo "2. Commit changes to Git"
    echo "3. Push to GitHub to update GitHub Pages"
    echo ""
    echo "🌐 Test locally with: python3 -m http.server 8000"
else
    echo "❌ Failed to update dashboard data"
    exit 1
fi
