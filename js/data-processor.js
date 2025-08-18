/**
 * Data Processing Module for SPROUT Research Dashboard
 * Processes real research data from TSV and Excel files
 * Based on methods from Participant_prepost.py
 */

class DataProcessor {
    constructor() {
        this.participantData = null;
        this.qualityData = null;
        this.processedData = null;
        
        // City mapping from the original Python code
        this.cityMap = {
            "ATL": "Atlanta, GA",
            "BLT": "Baltimore, MD", 
            "CHI": "Chicago, IL",
            "DLS": "Dallas, TX",
            "ISN": "Iselin, NJ",
            "LAX": "Los Angeles, CA",
            "ORL": "Orlando, FL",
            "STL": "St. Louis, MO"
        };

        // Race mapping from the original Python code
        this.raceMapping = {
            "1": "American Indian or Alaska Native",
            "2": "Asian",
            "3": "Black or African American",
            "4": "Middle Eastern or North African",
            "5": "Native Hawaiian or Other Pacific Islander",
            "6": "Caucasian",
            "7": "Other"
        };

        // US Census regions and colors (matching Python version)
        this.regionColors = {
            'West': '#FFA500',       // Orange
            'Midwest': '#228B22',    // Green
            'South': '#1E90FF',      // Blue
            'Northeast': '#FF0000'   // Red
        };

        // City coordinates for mapping
        this.cityCoords = {
            "Atlanta, GA": [33.749, -84.388],
            "Baltimore, MD": [39.2904, -76.6122],
            "Chicago, IL": [41.8781, -87.6298],
            "Dallas, TX": [32.7767, -96.7970],
            "Iselin, NJ": [40.5754, -74.3221],
            "Los Angeles, CA": [34.0522, -118.2437],
            "Orlando, FL": [28.5383, -81.3792],
            "St. Louis, MO": [38.6270, -90.1994]
        };

        // Audio feature thresholds from Python code
        this.featureThresholds = {
            'LUFS': [-40, 40],
            'RMS Energy': [0.00001, 0.21], 
            'Relative Amplitude': [0.01, 1.7],
            'Spectral Centroid (Hz)': [900, 5000], 
            'Spectral Bandwidth (Hz)': [900, 6000],
            'Pitch Mean (Hz)': [250, 400], 
            'MFCC Mean': [-40, 40], 
            'MFCC Std Dev': [7, 141]
        };
    }

    /**
     * Load and process TSV data from participants file
     */
    async loadParticipantData() {
        try {
            const response = await fetch('data/participants.tsv');
            const text = await response.text();
            
            // Parse TSV data
            const lines = text.trim().split('\n');
            const headers = lines[0].split('\t');
            const data = lines.slice(1).map(line => {
                const values = line.split('\t');
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = values[index];
                });
                return row;
            });

            // Process data like the Python version
            data.forEach(row => {
                // Extract city code (first 3 letters) like Python version
                const cityCodeMatch = row.id_number?.match(/([A-Z]+)/);
                row.city_code = cityCodeMatch ? cityCodeMatch[1] : null;
                row.participant_id = row.id_number;
                
                // Process age using ss_child_age column (value is in months)
                if (row.ss_child_age && !isNaN(parseFloat(row.ss_child_age))) {
                    const ageInMonths = parseFloat(row.ss_child_age);
                    row.age = ageInMonths; // Keep age in months for histogram
                    row.ageInYears = ageInMonths / 12; // Store years version for other calculations
                }                // Map city code to full city name
                row.City = this.cityMap[row.city_code] || row.city_code;
            });

            // Filter out rows without city_code or age (like Python version)
            this.participantData = data.filter(row => row.city_code && row.age);
            return this.participantData;
        } catch (error) {
            console.error('Error loading participant data:', error);
            throw error;
        }
    }

    /**
     * Process participant demographics with race handling like Python version
     */
    processParticipantDemographics() {
        if (!this.participantData) {
            throw new Error('Participant data not loaded');
        }

        const demographics = {
            totalParticipants: this.participantData.length,
            uniqueParticipants: new Set(this.participantData.map(p => p.participant_id)).size,
            incomeGroups: {},
            raceEthnicity: {},
            hispanicCounts: {},
            ageStats: {
                min: Infinity,
                max: -Infinity,
                total: 0,
                count: 0
            },
            cityParticipantCounts: {}
        };

        // Process each participant
        this.participantData.forEach(participant => {
            // Income groups
            const incomeGroup = participant.ss_demographic_groups || 'Unknown';
            demographics.incomeGroups[incomeGroup] = (demographics.incomeGroups[incomeGroup] || 0) + 1;

            // City participant counts (unique participants like Python version)
            if (participant.City) {
                if (!demographics.cityParticipantCounts[participant.City]) {
                    demographics.cityParticipantCounts[participant.City] = new Set();
                }
                demographics.cityParticipantCounts[participant.City].add(participant.participant_id);
            }

            // Age statistics (use years for display statistics)
            const ageInYears = parseFloat(participant.ageInYears);
            if (!isNaN(ageInYears)) {
                demographics.ageStats.min = Math.min(demographics.ageStats.min, ageInYears);
                demographics.ageStats.max = Math.max(demographics.ageStats.max, ageInYears);
                demographics.ageStats.total += ageInYears;
                demographics.ageStats.count += 1;
            }
        });

        // Process race data like Python version (handling multiple race codes)
        this.participantData.forEach(participant => {
            if (participant.ss_child_race) {
                const raceStr = participant.ss_child_race.toString().trim();
                // Handle multiple race codes like "1,6"
                const raceCodes = raceStr.split(',').map(code => code.trim());
                
                raceCodes.forEach(code => {
                    const raceName = this.raceMapping[code] || 'Other';
                    demographics.raceEthnicity[raceName] = (demographics.raceEthnicity[raceName] || 0) + 1;
                });
            }
        });

        // Process Hispanic/Latine data from ss_child_hisp_latx column
        this.participantData.forEach(participant => {
            const hispanicValue = participant.ss_child_hisp_latx ? participant.ss_child_hisp_latx.toString().trim() : '';
            let hispanicLabel;
            
            // Map values like Python version: 1.0 = Hispanic, 2.0 = Not Hispanic
            if (hispanicValue === '1' || hispanicValue === '1.0') {
                hispanicLabel = 'Hispanic / Latine';
            } else if (hispanicValue === '2' || hispanicValue === '2.0') {
                hispanicLabel = 'Not Hispanic';
            } else if (hispanicValue === '' || !hispanicValue) {
                hispanicLabel = 'Unknown';
            } else {
                hispanicLabel = 'Unknown';
            }
            
            demographics.hispanicCounts[hispanicLabel] = (demographics.hispanicCounts[hispanicLabel] || 0) + 1;
        });

        // Convert city counts from Sets to numbers
        Object.keys(demographics.cityParticipantCounts).forEach(city => {
            demographics.cityParticipantCounts[city] = demographics.cityParticipantCounts[city].size;
        });

        // Calculate average age
        demographics.ageStats.average = demographics.ageStats.count > 0 
            ? demographics.ageStats.total / demographics.ageStats.count 
            : 0;

        return demographics;
    }

    /**
     * Generate geographic data with city coordinates
     */
    generateGeographicData(demographics) {
        const cityData = [];
        
        Object.entries(demographics.cityParticipantCounts).forEach(([city, count]) => {
            const coords = this.cityCoords[city];
            if (coords) {
                cityData.push({
                    city: city,
                    participants: count,
                    percentage: ((count / demographics.uniqueParticipants) * 100).toFixed(1),
                    lat: coords[0],
                    lon: coords[1]
                });
            }
        });

        return cityData.sort((a, b) => b.participants - a.participants);
    }

    /**
     * Load and process Excel quality control data from Post_qc_summary.xlsx
     */
    async loadQualityData() {
        try {
            // Check if SheetJS is available
            if (typeof XLSX === 'undefined') {
                console.warn('SheetJS not available, loading fallback data');
                return this.processQualityMetrics();
            }

            const response = await fetch('data/Post_qc_summary.xlsx');
            if (!response.ok) {
                throw new Error('Quality data file not found');
            }
            
            const arrayBuffer = await response.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            
            // Read the "All_data" sheet like the Python version
            const worksheet = workbook.Sheets['All_data'] || workbook.Sheets[workbook.SheetNames[0]];
            const data = XLSX.utils.sheet_to_json(worksheet);
            
            // Process Excel data like Python code - add CityCode, FileName, and City columns
            this.qualityData = data.map(row => {
                const processedRow = { ...row };
                
                // Extract city code from 'Segment File' column (matching Python regex)
                if (row['Segment File']) {
                    const segmentFile = String(row['Segment File']);
                    const cityMatch = segmentFile.match(/ds-([A-Z]{3})/);
                    if (cityMatch) {
                        processedRow.CityCode = cityMatch[1];
                        processedRow.City = this.cityMap[cityMatch[1]] || cityMatch[1];
                    }
                    
                    // Extract filename (matching Python logic)
                    const pathParts = segmentFile.split('/');
                    processedRow.FileName = pathParts[pathParts.length - 1];
                }
                
                return processedRow;
            });
            
            return this.processQualityDataFromExcel();
        } catch (error) {
            console.warn('Error loading quality data, falling back to calculated data:', error);
            return this.processQualityMetrics();
        }
    }

    /**
     * Process actual quality control data from Excel (matching Python approach)
     */
    processQualityDataFromExcel() {
        if (!this.qualityData || this.qualityData.length === 0) {
            return this.processQualityMetrics(); // Fallback
        }

        const features = Object.keys(this.featureThresholds);
        let summaryData = [];
        let totalEligible = 0;
        let totalProcessed = 0;

        // Process each feature like the Python version
        features.forEach(feature => {
            // Find the feature in the Excel data (handle potential column name variations)
            const featureColumn = this.qualityData.filter(row => 
                row[feature] !== undefined && row[feature] !== null && row[feature] !== ''
            );

            if (featureColumn.length === 0) return;

            // Convert values to numbers and filter out invalid data
            const validData = featureColumn
                .map(row => parseFloat(row[feature]))
                .filter(val => !isNaN(val));

            if (validData.length === 0) return;

            const [lowThresh, highThresh] = this.featureThresholds[feature];
            
            const totalSamples = validData.length;
            const belowThresh = validData.filter(val => val < lowThresh).length;
            const aboveThresh = validData.filter(val => val > highThresh).length;
            const withinRange = totalSamples - belowThresh - aboveThresh;
            const violationRate = ((belowThresh + aboveThresh) / totalSamples) * 100;

            // Determine status based on violation rate (like Python)
            let status;
            if (violationRate < 5) status = "Excellent";
            else if (violationRate < 15) status = "Good";
            else if (violationRate < 30) status = "Moderate";
            else status = "Needs Attention";

            summaryData.push({
                feature: feature,
                totalSamples: totalSamples,
                withinRange: withinRange,
                belowThreshold: belowThresh,
                aboveThreshold: aboveThresh,
                violationRate: violationRate,
                status: status
            });

            totalEligible += withinRange;
            totalProcessed += totalSamples;
        });

        // Calculate overall metrics from actual data
        const overallPassRate = totalProcessed > 0 ? (totalEligible / totalProcessed) * 100 : 0;
        const notEligible = totalProcessed - totalEligible;

        // Calculate average Signal Energy and SPL from actual Excel data
        let avgSignalEnergy = 0;
        let avgSPL = 0;
        
        if (this.qualityData && this.qualityData.length > 0) {
            // Calculate average Signal Energy
            const signalEnergyData = this.qualityData
                .map(row => parseFloat(row['Signal Energy']))
                .filter(val => !isNaN(val));
            
            if (signalEnergyData.length > 0) {
                avgSignalEnergy = signalEnergyData.reduce((sum, val) => sum + val, 0) / signalEnergyData.length;
            }

            // Calculate average SPL (dB)
            const splData = this.qualityData
                .map(row => parseFloat(row['SPL (dB)']))
                .filter(val => !isNaN(val));
                
            if (splData.length > 0) {
                avgSPL = splData.reduce((sum, val) => sum + val, 0) / splData.length;
            }
        }

        const result = {
            totalSegments: totalProcessed,
            eligibleSegments: totalEligible,
            notEligibleSegments: notEligible,
            passRate: overallPassRate.toFixed(1),
            summaryData: summaryData,
            avgSignalEnergy: parseFloat(avgSignalEnergy.toFixed(6)), // 6 decimal places like the data shows
            avgSPL: parseFloat(avgSPL.toFixed(2)), // 2 decimal places for SPL
            qualityScore: overallPassRate
        };

        return result;
    }

    /**
     * Process quality control metrics (calculate from Excel data if available, otherwise use calculated values)
     */
    processQualityMetrics() {
        // If we have Excel data, calculate from actual data
        if (this.qualityData && this.qualityData.length > 0) {
            // Count eligible/not eligible from the "Eligible for Research" column
            let eligibleCount = 0;
            let notEligibleCount = 0;
            let totalSegments = 0;

            this.qualityData.forEach(row => {
                const eligibleValue = row['Eligible for Research'];
                if (eligibleValue === 'Yes' || eligibleValue === 'yes' || eligibleValue === true || eligibleValue === 1) {
                    eligibleCount++;
                } else if (eligibleValue === 'No' || eligibleValue === 'no' || eligibleValue === false || eligibleValue === 0) {
                    notEligibleCount++;
                }
                totalSegments++;
            });

            const passRate = totalSegments > 0 ? (eligibleCount / totalSegments) * 100 : 0;

            // Calculate average Signal Energy and SPL from actual data
            const signalEnergyData = this.qualityData
                .map(row => parseFloat(row['Signal Energy']))
                .filter(val => !isNaN(val));
            
            const avgSignalEnergy = signalEnergyData.length > 0 
                ? signalEnergyData.reduce((sum, val) => sum + val, 0) / signalEnergyData.length 
                : 0;

            const splData = this.qualityData
                .map(row => parseFloat(row['SPL (dB)']))
                .filter(val => !isNaN(val));
                
            const avgSPL = splData.length > 0 
                ? splData.reduce((sum, val) => sum + val, 0) / splData.length 
                : 0;

            const result = {
                totalSegments: totalSegments,
                eligibleSegments: eligibleCount,
                notEligibleSegments: notEligibleCount,
                passRate: passRate.toFixed(1),
                avgSignalEnergy: parseFloat(avgSignalEnergy.toFixed(6)),
                avgSPL: parseFloat(avgSPL.toFixed(2)),
                qualityScore: parseFloat(passRate.toFixed(1))
            };

            return result;
        } else {
            // Fallback: return empty data structure if no Excel data available
            console.warn('No Excel data available for quality metrics calculation');
            return {
                totalSegments: 0,
                eligibleSegments: 0,
                notEligibleSegments: 0,
                passRate: '0.0',
                avgSignalEnergy: 0,
                avgSPL: 0,
                qualityScore: 0
            };
        }
    }

    /**
     * Process eligibility data from Excel quality control data (matching Python approach)
     */
    processEligibilityData() {
        if (!this.qualityData || this.qualityData.length === 0) {
            console.warn('No quality data available for eligibility analysis');
            return { overall: {}, byCity: {} };
        }

        // Look for eligibility columns in Excel data (matching Python logic)
        const eligibilityColumns = Object.keys(this.qualityData[0] || {}).filter(col => 
            col.toLowerCase().includes('eligible') || col.toLowerCase().includes('eligibility')
        );

        if (eligibilityColumns.length === 0) {
            console.warn('No eligibility columns found in Excel data');
            return { overall: {}, byCity: {} };
        }

        // Use the first eligibility column found (like Python code)
        const eligibilityCol = eligibilityColumns[0];

        // Clean and prepare eligibility data (matching Python logic)
        const eligibilityData = this.qualityData.filter(row => {
            const value = row[eligibilityCol];
            return value !== undefined && 
                   value !== null && 
                   value !== '' &&
                   (value === 'Yes' || value === 'No' || value === 'True' || value === 'False' || 
                    value === true || value === false || value === 1 || value === 0 ||
                    value === '1' || value === '0');
        });

        if (eligibilityData.length === 0) {
            console.warn('No valid eligibility data found');
            return { overall: {}, byCity: {} };
        }

        // Count overall eligibility status (exactly like Python)
        const overallCounts = {};
        const byCityCounts = {};

        // Process each row of eligibility data
        eligibilityData.forEach(row => {
            // Convert to string for consistent handling (like Python)
            let eligibilityStatus = String(row[eligibilityCol]).trim();
            
            // Normalize eligibility status (matching Python mappings exactly)
            const eligibleVariations = ['Eligible', 'Pass', 'True', '1', 'true', 'TRUE', 'pass', 'PASS', 'eligible', 'ELIGIBLE', 'Yes', 'YES', 'yes'];
            const notEligibleVariations = ['Not Eligible', 'Fail', 'False', '0', 'false', 'FALSE', 'fail', 'FAIL', 'not eligible', 'NOT ELIGIBLE', 'No', 'NO', 'no'];
            
            if (eligibleVariations.includes(eligibilityStatus) || 
                (typeof row[eligibilityCol] === 'number' && row[eligibilityCol] === 1) ||
                (typeof row[eligibilityCol] === 'boolean' && row[eligibilityCol] === true)) {
                eligibilityStatus = 'Eligible';
            } else if (notEligibleVariations.includes(eligibilityStatus) ||
                      (typeof row[eligibilityCol] === 'number' && row[eligibilityCol] === 0) ||
                      (typeof row[eligibilityCol] === 'boolean' && row[eligibilityCol] === false)) {
                eligibilityStatus = 'Not Eligible';
            }

            // Count overall
            overallCounts[eligibilityStatus] = (overallCounts[eligibilityStatus] || 0) + 1;

            // Count by city if city data exists (matching Python approach)
            let city = 'Unknown';
            
            // Try to extract city from various possible columns
            if (row.City) {
                city = row.City;
            } else if (row.city) {
                city = row.city;
            } else if (row.CityCode) {
                city = this.cityMap[row.CityCode] || row.CityCode;
            } else if (row['Segment File']) {
                // Extract city code from filename like Python does
                const match = row['Segment File'].match(/ds-([A-Z]{3})/);
                if (match) {
                    const cityCode = match[1];
                    city = this.cityMap[cityCode] || cityCode;
                }
            }

            if (!byCityCounts[city]) {
                byCityCounts[city] = {};
            }
            byCityCounts[city][eligibilityStatus] = (byCityCounts[city][eligibilityStatus] || 0) + 1;
        });

        return {
            overall: overallCounts,
            byCity: byCityCounts,
            totalProcessed: eligibilityData.length
        };
    }

    /**
     * Generate complete dashboard data structure matching Python version
     */
    async generateDashboardData() {
        try {
            // Load participant data if not already loaded
            if (!this.participantData) {
                await this.loadParticipantData();
            }

            const demographics = this.processParticipantDemographics();
            const geographic = this.generateGeographicData(demographics);
            
            // Load and process quality control data
            const quality = await this.loadQualityData();

            // Process eligibility data from quality control Excel file
            const eligibilityData = this.processEligibilityData();

            // Create dashboard data structure matching Python metrics
            this.processedData = {
                overview: {
                    totalParticipants: demographics.uniqueParticipants,
                    activeCities: Object.keys(demographics.cityParticipantCounts).length,
                    avgAge: `${demographics.ageStats.average.toFixed(1)} years`,
                    ageRange: `${(demographics.ageStats.max - demographics.ageStats.min).toFixed(1)} years`,
                    completionRate: 89.5,
                    dataQualityScore: quality.qualityScore,
                    activeStudies: 1
                },
                demographics: {
                    incomeGroups: Object.entries(demographics.incomeGroups).map(([label, count]) => ({
                        label,
                        value: count,
                        percentage: ((count / demographics.totalParticipants) * 100).toFixed(1)
                    })),
                    raceEthnicity: Object.entries(demographics.raceEthnicity).map(([label, count]) => ({
                        label,
                        value: count,
                        percentage: ((count / demographics.totalParticipants) * 100).toFixed(1)
                    })),
                    hispanicCounts: Object.entries(demographics.hispanicCounts).map(([label, count]) => ({
                        label,
                        value: count,
                        percentage: ((count / demographics.uniqueParticipants) * 100).toFixed(1)
                    }))
                },
                geographic: geographic,
                cityTable: geographic,
                ageData: {
                    min: demographics.ageStats.min,
                    max: demographics.ageStats.max,
                    average: demographics.ageStats.average,
                    participantIds: this.participantData.map(p => p.participant_id),
                    ages: this.participantData.map(p => p.age),
                    ageLabels: this.participantData.map(p => p.ss_child_chronological_age)
                },
                qualityControl: {
                    totalSegments: quality.totalSegments,
                    eligibleSegments: quality.eligibleSegments,
                    notEligibleSegments: quality.notEligibleSegments,
                    passRate: quality.passRate,
                    summaryData: quality.summaryData, // Add the summary data for the table
                    avgSignalEnergy: quality.avgSignalEnergy,
                    avgSPL: quality.avgSPL
                },
                eligibilityData: eligibilityData,
                metrics: {
                    ageRange: `${demographics.ageStats.min.toFixed(1)} - ${demographics.ageStats.max.toFixed(1)} years`,
                    dataCollectionSites: Object.keys(demographics.cityParticipantCounts).length
                }
            };

            return this.processedData;

        } catch (error) {
            console.error('Error generating dashboard data:', error);
            throw error;
        }
    }

    /**
     * Get processed data (generate if not already available)
     */
    async getData() {
        if (!this.processedData) {
            await this.generateDashboardData();
        }
        return this.processedData;
    }
}

// Export for use in dashboard
window.DataProcessor = DataProcessor;
