# Data Documentation: AIS Maritime Tracking Data

## 📋 Table of Contents
1. [Overview](#overview)
2. [Data Source](#data-source)
3. [Dataset Characteristics](#dataset-characteristics)
4. [Feature Descriptions](#feature-descriptions)
5. [Data Usage in Project](#data-usage-in-project)
6. [Data Processing Steps](#data-processing-steps)
7. [Data Statistics](#data-statistics)
8. [Data Quality and Validation](#data-quality-and-validation)

---

## Overview

### What is This Data?

This dataset contains **AIS (Automatic Identification System) data** - real-time ship tracking information collected from vessels in New York Harbor during December 2024. AIS is an international system that ships use to broadcast their position, speed, course, and identification information.

**Think of AIS as:** Similar to how your phone broadcasts your location when using GPS navigation apps, ships continuously transmit their location and movement data via AIS transponders.

### Data Format

- **File Type:** CSV (Comma-Separated Values)
- **File Location:** `data/FYP_Training_Data_NY_Dec2024.csv`
- **Total Records:** 5,063,274 rows (over 5 million position reports)
- **Time Period:** December 1-31, 2024 (31 days)
- **Geographic Coverage:** New York Harbor region
- **File Size:** Approximately 500-600 MB (depending on compression)

---

## Data Source

### Original Source

**NOAA (National Oceanic and Atmospheric Administration)**
- **Database:** CMSP AIS Data Handler
- **URL:** `https://coast.noaa.gov/htdata/CMSP/AISDataHandler/2024/`
- **Format:** Daily ZIP files containing CSV data
- **Collection Method:** Automated download and processing
- **License:** Public domain (government data)

### Collection Process

1. **Download:** Automated script downloads daily AIS data files (31 files for December 2024)
2. **Extraction:** ZIP files are extracted to access CSV data
3. **Filtering:** Data is filtered to focus on New York Harbor region:
   - **Latitude Range:** 40.50°N to 40.75°N
   - **Longitude Range:** 74.20°W to 73.90°W
4. **Combination:** All daily files are merged into one comprehensive dataset
5. **Cleaning:** Invalid entries, duplicates, and corrupted data are removed

---

## Dataset Characteristics

### Geographic Coverage

**New York Harbor, USA**
- One of the busiest ports in the world
- High shipping traffic volume
- Mix of commercial and recreational vessels
- Well-defined shipping lanes and routes

**Coordinate Boundaries:**
- **North:** 40.75° latitude
- **South:** 40.50° latitude
- **East:** 73.90° longitude
- **West:** 74.20° longitude

### Temporal Coverage

- **Start Date:** December 1, 2024, 00:00:00
- **End Date:** December 31, 2024, 23:59:59
- **Duration:** 31 full days
- **Update Frequency:** Variable (depends on ship transmission rate, typically every few seconds to minutes)

### Vessel Diversity

- **Total Unique Vessels:** 912 different ships tracked
- **Vessel Types:** Cargo ships, tankers, tugs, fishing boats, pleasure craft, etc.
- **Traffic Patterns:** Both stationary (anchored) and moving vessels

---

## Feature Descriptions

The dataset contains **7 columns** (features), each providing essential information about ship positions and movements:

### 1. MMSI (Maritime Mobile Service Identity)

**What it is:**
- A unique 9-digit identification number assigned to each ship
- Similar to a vehicle license plate or phone number
- Assigned by international maritime authorities

**Data Type:** Integer (int64)

**Example Values:**
- `367618310`
- `368129810`
- `367022550`

**Why it's important:**
- **Ship Identification:** Uniquely identifies each vessel
- **Trajectory Tracking:** Groups position reports by the same ship
- **Data Organization:** Allows us to track individual ship paths over time
- **Anomaly Detection:** Helps identify if a ship is behaving differently from its normal patterns

**How it's used in the project:**
- **Primary Grouping Key:** Used to group all position reports from the same ship
- **Trajectory Creation:** All positions for the same MMSI are combined to create ship paths
- **Sequence Generation:** LSTM model processes trajectories grouped by MMSI
- **Not used in ML model:** MMSI is not a feature for training (it's only for grouping data)

**Data Quality:**
- Must be a 9-digit number (typically starts with 2-9)
- Cannot be null or missing (required for tracking)
- Each ship has one consistent MMSI throughout the dataset

---

### 2. BaseDateTime (Timestamp)

**What it is:**
- Date and time when the ship position was recorded
- Precise timestamp showing when the AIS signal was transmitted

**Data Type:** DateTime (converted from string format)

**Format:** ISO 8601 standard (`YYYY-MM-DDTHH:MM:SS`)
- Example: `2024-12-01T00:00:00` (December 1, 2024, midnight)

**Why it's important:**
- **Temporal Ordering:** Determines the sequence of ship positions
- **Time Analysis:** Allows analysis of ship movements over time
- **Trajectory Construction:** Essential for creating accurate ship paths
- **Pattern Recognition:** Enables detection of timing-based anomalies

**How it's used in the project:**
- **Sorting:** Data is sorted by MMSI and BaseDateTime to create chronological paths
- **Sequence Order:** Ensures LSTM model receives positions in correct temporal order
- **Time-based Filtering:** Can filter data by specific time periods
- **Not directly in ML model:** Time is implicit in the sequence order, not an explicit feature

**Data Quality:**
- Must be valid datetime format
- Should be in chronological order for each ship
- Cannot be null (required for temporal analysis)

---

### 3. LAT (Latitude)

**What it is:**
- Geographic coordinate representing north-south position on Earth
- Measures distance from the equator (0°) toward the poles (±90°)
- Positive values = Northern Hemisphere, Negative values = Southern Hemisphere

**Data Type:** Float (decimal number)

**Unit:** Degrees decimal (not degrees/minutes/seconds)

**Range:** -90.0 to +90.0 degrees
- **This dataset:** Approximately 40.50° to 40.75° (New York Harbor region)

**Example Values:**
- `40.66993` (40.66993° North)
- `40.70323`
- `40.63663`

**Why it's important:**
- **Spatial Position:** Primary coordinate for determining ship location
- **Trajectory Visualization:** Essential for plotting ship paths on maps
- **Route Analysis:** Helps identify shipping lanes and common routes
- **Anomaly Detection:** Sudden changes in latitude indicate suspicious movements

**How it's used in the project:**
- **ML Feature:** One of 4 features used to train the LSTM model
- **Trajectory Construction:** Combined with longitude to create 2D paths
- **Visualization:** Used to plot ship positions on interactive maps
- **Normalization:** Scaled to 0-1 range before model training
- **Anomaly Detection:** Model detects when latitude changes don't match normal patterns

**Data Quality:**
- Must be between -90.0 and +90.0 degrees
- Invalid coordinates (outside range) are filtered out
- Precision: Typically 5-6 decimal places (meter-level accuracy)

---

### 4. LON (Longitude)

**What it is:**
- Geographic coordinate representing east-west position on Earth
- Measures distance from the Prime Meridian (0° at Greenwich, UK)
- Values range from -180° (west) to +180° (east)

**Data Type:** Float (decimal number)

**Unit:** Degrees decimal

**Range:** -180.0 to +180.0 degrees
- **This dataset:** Approximately -74.20° to -73.90° (New York Harbor, USA is in Western Hemisphere, so negative values)

**Example Values:**
- `-74.08254` (74.08254° West)
- `-73.97655`
- `-74.07198`

**Why it's important:**
- **Spatial Position:** Combined with latitude to pinpoint exact location
- **Trajectory Visualization:** Creates 2D coordinate system for mapping
- **Route Analysis:** Essential for identifying shipping lanes
- **Anomaly Detection:** Detects unexpected longitude changes (GPS spoofing)

**How it's used in the project:**
- **ML Feature:** One of 4 features used to train the LSTM model
- **Trajectory Construction:** Combined with latitude to create ship paths
- **Visualization:** Used with latitude to plot positions on maps
- **Normalization:** Scaled to 0-1 range before model training
- **Anomaly Detection:** Model detects unusual longitude patterns

**Data Quality:**
- Must be between -180.0 and +180.0 degrees
- Invalid coordinates are filtered out
- Precision: Typically 5-6 decimal places (meter-level accuracy)

---

### 5. SOG (Speed Over Ground)

**What it is:**
- The actual speed at which the ship is moving over the Earth's surface
- Measured in knots (nautical miles per hour)
- 1 knot = 1.852 kilometers per hour = 1.151 miles per hour

**Data Type:** Float (decimal number)

**Unit:** Knots (nautical miles per hour)

**Range:** 0.0 to typically 50+ knots
- **Typical Values:**
  - **0.0-1.0 knots:** Stationary or anchored
  - **1.0-5.0 knots:** Slow movement (docking, maneuvering)
  - **5.0-15.0 knots:** Moderate speed (harbor traffic)
  - **15.0-25.0 knots:** Normal cruising speed (cargo ships)
  - **25.0-50.0 knots:** High speed (fast ferries, some ships)
  - **50+ knots:** Very rare (speedboats, potential errors)

**Example Values:**
- `0.0` (stationary)
- `8.9` (slow movement)
- `30.7` (moving vessel)

**Why it's important:**
- **Movement Detection:** Distinguishes moving ships from stationary ones
- **Behavior Analysis:** Different speeds indicate different activities (docking, cruising, etc.)
- **Anomaly Detection:** Sudden speed changes or impossible speeds indicate suspicious behavior
- **Trajectory Quality:** Moving ships (SOG > 1.0) provide better trajectory data for analysis

**How it's used in the project:**
- **ML Feature:** One of 4 features used to train the LSTM model
- **Data Filtering:** Ships with SOG > 50 knots are filtered (likely errors or irrelevant vessels)
- **Trajectory Analysis:** Only moving ships (SOG > 1.0) are used for trajectory learning
- **Normalization:** Scaled to 0-1 range before model training
- **Anomaly Detection:** Model learns normal speed patterns; detects unusual speed changes

**Data Quality:**
- Values ≥ 0.0 (cannot be negative)
- Values > 50 knots are filtered (likely GPS errors or speedboats)
- Missing values (NaN) are removed

---

### 6. COG (Course Over Ground)

**What it is:**
- The direction in which the ship is heading/moving
- Measured as a compass bearing (angle from North)
- Expressed in degrees from 0° to 360°

**Data Type:** Float (decimal number)

**Unit:** Degrees (compass bearing)

**Range:** 0.0 to 360.0 degrees
- **0°/360°:** North
- **90°:** East
- **180°:** South
- **270°:** West
- **45°:** Northeast, **135°:** Southeast, **225°:** Southwest, **315°:** Northwest

**Example Values:**
- `305.4` (Northwest direction)
- `87.9` (East direction)
- `347.3` (North-Northwest)

**Why it's important:**
- **Direction Analysis:** Shows which way ships are heading
- **Route Patterns:** Identifies common shipping lanes and directions
- **Behavior Analysis:** Course changes indicate maneuvers, turns, docking
- **Anomaly Detection:** Erratic course changes or impossible course-speed combinations indicate problems

**How it's used in the project:**
- **ML Feature:** One of 4 features used to train the LSTM model
- **Trajectory Analysis:** Combined with speed and position to understand ship movement
- **Pattern Recognition:** Model learns normal course patterns for different vessel types
- **Normalization:** Scaled to 0-1 range before model training
- **Anomaly Detection:** Detects unusual course changes that don't match normal patterns

**Data Quality:**
- Should be between 0.0 and 360.0 degrees
- Values outside this range are invalid
- Can be null for stationary ships (when SOG = 0, course may be undefined)

---

### 7. VesselType (Vessel Type Code)

**What it is:**
- A numeric code classifying the type/category of vessel
- Based on international maritime classification standards
- Each number represents a different vessel category

**Data Type:** Integer (converted from float)

**Unit:** Category code (numeric)

**Common Values:**
- **30:** Fishing vessels
- **31-37:** Pleasure craft (recreational boats)
- **50-59:** Special craft (pilots, research, etc.)
- **52:** Tugs
- **55-59:** Other special vessels
- **60-69:** Passenger ships
- **70-79:** Cargo ships
- **80-89:** Tankers

**Example Values:**
- `52` (Tug)
- `60` (Passenger ship)
- `31` (Pleasure craft)

**Why it's important:**
- **Behavior Context:** Different vessel types behave differently (cargo ships vs. pleasure craft)
- **Pattern Recognition:** Helps understand expected behavior patterns
- **Analysis Filtering:** Can filter analysis by vessel type
- **Not used in anomaly detection:** Vessel type is not a feature in our ML model (we focus on movement patterns regardless of type)

**How it's used in the project:**
- **EDA (Exploratory Data Analysis):** Used to understand data composition and vessel distribution
- **Visualization:** Helps categorize and color-code vessels in visualizations
- **Not in ML Model:** VesselType is NOT used as a feature for training the LSTM model
- **Filtering:** Can be used to filter data for specific analyses
- **Statistical Analysis:** Used to understand which vessel types are most common in the dataset

**Data Quality:**
- Should be a positive integer (typically 0-99 range)
- Missing values are filled with 0 (unknown type)
- Invalid values are coerced to 0

---

## Data Usage in Project

### Features Used in Machine Learning Model

The LSTM autoencoder model uses **4 features** for training:

1. **LAT** (Latitude)
2. **LON** (Longitude)
3. **SOG** (Speed Over Ground)
4. **COG** (Course Over Ground)

**Why these 4 features?**
- These represent the complete **kinematic state** of a ship at any moment
- Together, they fully describe a ship's position and movement
- Sufficient to detect anomalies in ship behavior patterns

### Features NOT Used in ML Model

1. **MMSI:** Used only for grouping data by ship (not a feature)
2. **BaseDateTime:** Used only for sorting data chronologically (not a feature)
3. **VesselType:** Used only for analysis and visualization (not a feature)

**Why exclude these?**
- **MMSI:** Not a feature, just an identifier (each ship has one value)
- **BaseDateTime:** Temporal order is captured in sequence ordering, not needed as a feature
- **VesselType:** We want to detect anomalies regardless of vessel type (more general model)

### Data Processing Pipeline

1. **Raw Data Import:**
   ```
   CSV File → Pandas DataFrame → 5M+ rows, 7 columns
   ```

2. **Data Cleaning:**
   - Convert BaseDateTime to datetime format
   - Convert numeric columns to proper types
   - Remove rows with missing essential data
   - Filter invalid coordinates and speeds

3. **Data Filtering:**
   - Remove duplicates
   - Filter speeds > 50 knots (errors or irrelevant vessels)
   - Separate moving vs. stationary ships

4. **Feature Selection:**
   ```
   Original 7 columns → Extract 4 features (LAT, LON, SOG, COG)
   ```

5. **Data Normalization:**
   ```
   Raw values → Scale to 0-1 range using MinMaxScaler
   ```

6. **Sequence Generation:**
   ```
   Individual positions → Group by MMSI → Create 30-position sequences
   ```

7. **Model Input:**
   ```
   Sequences → LSTM Autoencoder → Anomaly Detection
   ```

---

## Data Processing Steps

### Step 1: Data Import and Initial Cleaning

**Operations:**
- Load CSV file into pandas DataFrame
- Convert BaseDateTime from string to datetime format
- Convert numeric columns (LAT, LON, SOG, COG, MMSI, VesselType) to proper numeric types
- Handle errors gracefully (convert invalid values to NaN)

**Code Example:**
```python
df = pd.read_csv('data/FYP_Training_Data_NY_Dec2024.csv')
df['BaseDateTime'] = pd.to_datetime(df['BaseDateTime'])
df['LAT'] = pd.to_numeric(df['LAT'], errors='coerce')
df['LON'] = pd.to_numeric(df['LON'], errors='coerce')
# ... etc
```

### Step 2: Data Validation and Filtering

**Operations:**
- Remove rows with missing essential data (LAT, LON, SOG, MMSI, BaseDateTime)
- Filter invalid coordinates (LAT must be -90 to 90, LON must be -180 to 180)
- Remove duplicate records
- Filter impossible speeds (SOG > 50 knots)

**Result:**
- Clean dataset ready for analysis
- Reduced from 5M+ to ~5M valid records

### Step 3: Feature Selection

**Operations:**
- Select 4 features for ML model: LAT, LON, SOG, COG
- Keep MMSI for grouping (not a feature)
- Keep BaseDateTime for sorting (not a feature)
- VesselType used only for analysis, not ML model

### Step 4: Data Normalization

**Operations:**
- Use MinMaxScaler to scale all features to 0-1 range
- Formula: `scaled_value = (value - min) / (max - min)`
- Fit scaler on training data
- Transform all data using fitted scaler
- Save scaler for later use (inference on new data)

**Why Normalize?**
- Neural networks work better with normalized data
- Prevents any single feature from dominating
- Speeds up training convergence

### Step 5: Sequence Generation

**Operations:**
- Group data by MMSI (ship ID)
- Sort each group by BaseDateTime (chronological order)
- Create sliding windows of 30 consecutive positions
- Overlap windows (stride = 5) to create more training data

**Result:**
- ~1,006,037 sequences of 30 positions each
- Each sequence: (30 timesteps, 4 features)
- Shape: (1,006,037, 30, 4)

---

## Data Statistics

### Overall Dataset Statistics

| Metric | Value |
|--------|-------|
| **Total Records** | 5,063,274 |
| **Unique Vessels (MMSI)** | 912 |
| **Date Range** | Dec 1-31, 2024 (31 days) |
| **Geographic Area** | New York Harbor (40.50°-40.75°N, 74.20°-73.90°W) |
| **File Size** | ~500-600 MB (uncompressed) |

### Feature Statistics (Sample - First 1000 rows)

**Latitude (LAT):**
- Mean: 40.67°
- Range: 40.53° to 40.75°
- Standard Deviation: 0.044°

**Longitude (LON):**
- Mean: -74.07°
- Range: -74.19° to -73.94°
- Standard Deviation: 0.062°

**Speed Over Ground (SOG):**
- Mean: 3.80 knots
- Range: 0.0 to 102.3 knots
- Median: 0.0 knots (many stationary ships)
- Most ships: 0-25 knots

**Course Over Ground (COG):**
- Mean: 190.13°
- Range: 0° to 360°
- Standard Deviation: 116.98°

**Vessel Type:**
- Most Common: 52 (Tugs), 60 (Passenger ships)
- Range: 30-80 (various types)

### Moving Vessels Only (SOG > 1.0 knots)

- **Total Moving Records:** ~1,279,041 (about 25% of total)
- **Unique Moving Vessels:** 912
- **Average Speed:** Higher than overall average
- **Better for Trajectory Analysis:** More meaningful movement data

---

## Data Quality and Validation

### Data Quality Checks

**1. Completeness:**
- ✅ All essential fields present (MMSI, BaseDateTime, LAT, LON, SOG)
- ✅ Missing values handled appropriately
- ⚠️ Some records may have missing COG or VesselType (acceptable)

**2. Validity:**
- ✅ Coordinates within valid ranges
- ✅ Speeds filtered (removed > 50 knots)
- ✅ Duplicate records removed
- ✅ Date/timestamp format validated

**3. Consistency:**
- ✅ Each MMSI has consistent identification
- ✅ Temporal ordering maintained within ship groups
- ✅ Coordinates form logical trajectories

### Common Data Issues and Handling

**Issue 1: Missing Values**
- **Handling:** Remove rows with missing essential data (LAT, LON, SOG, MMSI, BaseDateTime)
- **Impact:** Minimal (most records are complete)

**Issue 2: Invalid Coordinates**
- **Handling:** Filter coordinates outside valid ranges (LAT: -90 to 90, LON: -180 to 180)
- **Impact:** Very few records affected

**Issue 3: Impossible Speeds**
- **Handling:** Filter speeds > 50 knots (GPS errors or irrelevant speedboats)
- **Impact:** Removes outliers that don't represent normal ship behavior

**Issue 4: Duplicate Records**
- **Handling:** Remove exact duplicate rows
- **Impact:** Small reduction in dataset size

**Issue 5: Stationary Ships**
- **Handling:** Separate moving (SOG > 1.0) from stationary ships
- **Impact:** Moving ships used for trajectory analysis; stationary ships excluded

### Data Validation Rules

1. **MMSI:**
   - Must be 9-digit integer
   - Cannot be null
   - Must be consistent for same ship

2. **BaseDateTime:**
   - Must be valid datetime format
   - Should be in chronological order for each ship

3. **LAT:**
   - Must be between -90.0 and 90.0
   - Should be in New York Harbor range (40.50-40.75)

4. **LON:**
   - Must be between -180.0 and 180.0
   - Should be in New York Harbor range (-74.20 to -73.90)

5. **SOG:**
   - Must be ≥ 0.0
   - Filtered if > 50.0 (errors/irrelevant)

6. **COG:**
   - Should be between 0.0 and 360.0
   - Can be null for stationary ships

7. **VesselType:**
   - Should be positive integer (typically 0-99)
   - Missing values filled with 0

---

## Additional Resources

### Understanding AIS Data

- **AIS Basics:** Automatic Identification System is an international standard for ship tracking
- **Transmission:** Ships broadcast AIS signals automatically via VHF radio
- **Update Rate:** Varies by ship speed and activity (faster-moving ships transmit more frequently)
- **Coverage:** AIS receivers on land and satellites collect this data worldwide

### Data Access

- **Source:** NOAA CMSP AIS Data Handler
- **Format:** Daily ZIP files containing CSV data
- **License:** Public domain (government data)
- **Update Frequency:** Daily releases

### Related Documentation

- See `Complete Overview of the Project.md` for overall project understanding
- See `Notebook/Maritime.ipynb` for complete data processing code
- See `scraper/get_data.py` for data download script

---

*Document last updated: January 2025*
*Data period: December 2024*
*Project: Maritime Anomaly Detection System*
