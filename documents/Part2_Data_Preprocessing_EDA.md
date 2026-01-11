# Part 2: Data Preprocessing & Exploratory Data Analysis (EDA)

## 📋 Table of Contents
1. [Overview](#overview)
2. [Objectives](#objectives)
3. [Step 1: Data Cleaning & Type Conversion](#step-1-data-cleaning--type-conversion)
4. [Step 2: Advanced Filtering](#step-2-advanced-filtering)
5. [Step 3: Statistical Analysis (EDA)](#step-3-statistical-analysis-eda)
6. [Step 4: Visualizations](#step-4-visualizations)
7. [Key Findings](#key-findings)
8. [What We Get From This Part](#what-we-get-from-this-part)

---

## Overview

**Part 2** is all about **preparing and understanding our data** before we train the AI model. Think of it like preparing ingredients before cooking - we need to clean, organize, and understand what we're working with.

**Simple Explanation:**
- We have 5+ million raw data points (ship positions)
- We need to clean them (remove errors, duplicates)
- We need to understand patterns (what does "normal" ship behavior look like?)
- We create visualizations to "see" the data

---

## Objectives

**What We Want to Achieve:**

1. **Clean the Data:** 
   - Convert text strings to proper numbers and dates
   - Remove corrupted or invalid entries
   - Make sure all data is in the correct format

2. **Filter Noise:**
   - Remove duplicate signals (same data sent twice)
   - Filter invalid coordinates (impossible locations)
   - Remove unrealistic speeds (GPS errors or irrelevant speedboats)

3. **Visualize Normal Behavior:**
   - Understand what "normal" ship traffic looks like
   - Identify common speeds, directions, and routes
   - Create maps showing where ships typically travel

**Why This Matters:**
- Clean data = Better AI model
- Understanding normal behavior = We know what to detect as "unusual"
- Visualizations = We can verify our data makes sense

---

## Step 1: Data Cleaning & Type Conversion

### What is Data Cleaning?

**Simple Explanation:**
Imagine you have a messy spreadsheet with mixed-up data types. Some numbers are written as text ("30.5" instead of 30.5), some dates are strings, etc. Data cleaning converts everything to the correct format.

### What We Do:

**1. Convert Timestamp (BaseDateTime)**
- **From:** String format like "2024-12-01T00:00:00"
- **To:** Proper datetime object (Python can understand it as a date/time)
- **Why:** We need dates to sort data chronologically

**2. Convert Numeric Columns**
- **Columns:** LAT, LON, SOG, COG, MMSI, VesselType
- **From:** Sometimes stored as text strings (e.g., "40.5" instead of 40.5)
- **To:** Proper numbers (float for decimals, int for whole numbers)
- **Why:** Calculations and comparisons require numeric types

**3. Handle Errors Gracefully**
- **What:** If a value can't be converted (e.g., "N/A" or empty), convert it to NaN (Not a Number)
- **Why:** We don't want to crash the program on bad data

**4. Remove Corrupted Rows**
- **What:** Remove rows where essential data is missing (LAT, LON, SOG, MMSI, BaseDateTime)
- **Why:** We can't use incomplete data for training

**5. Clean VesselType**
- **What:** Convert VesselType to integer, fill missing values with 0 (unknown type)
- **Why:** For cleaner categorization

### Code Example (Simplified):

```python
# Convert timestamp
df['BaseDateTime'] = pd.to_datetime(df['BaseDateTime'])

# Convert numbers (handle errors)
df['LAT'] = pd.to_numeric(df['LAT'], errors='coerce')  # errors='coerce' means convert invalid to NaN
df['LON'] = pd.to_numeric(df['LON'], errors='coerce')
# ... etc

# Remove rows with missing essential data
df.dropna(subset=['LAT', 'LON', 'SOG', 'MMSI', 'BaseDateTime'], inplace=True)
```

### Results:

- **Before:** 5,063,274 rows (some may be corrupted)
- **After:** ~5,055,956 rows (clean data)
- **Removed:** Invalid or corrupted entries

---

## Step 2: Advanced Filtering

### What is Filtering?

**Simple Explanation:**
Filtering is like removing unwanted items. We want to keep only high-quality data that represents normal ship behavior. We remove things that don't make sense (like ships traveling at 100 knots or ships in impossible locations).

### What We Filter Out:

**1. Duplicate Records**
- **What:** Sometimes ships send the same signal twice
- **Action:** Remove exact duplicates
- **Why:** We don't want to count the same position twice

**2. Invalid Coordinates**
- **What:** Coordinates outside valid ranges
- **Latitude:** Must be between -90° and +90° (poles)
- **Longitude:** Must be between -180° and +180° (opposite sides of Earth)
- **Why:** Impossible locations indicate GPS errors

**3. Impossible Speeds**
- **What:** Speeds greater than 50 knots
- **Why:** 
  - Most cargo/tanker ships max out at 25-30 knots
  - Speeds > 50 knots are likely GPS errors or small speedboats (not relevant for cargo security)
  - We focus on commercial shipping, not recreational boats

**4. Separate Moving vs. Stationary Ships**
- **What:** Split ships into "moving" (SOG > 1.0 knots) and "stationary" (SOG ≤ 1.0 knots)
- **Why:** 
  - Stationary ships (anchored) don't create trajectories
  - For trajectory learning, we only care about moving ships
  - Moving ships provide meaningful movement patterns

### Code Example (Simplified):

```python
# Remove duplicates
df.drop_duplicates(inplace=True)

# Filter invalid coordinates
df = df[(df['LAT'].between(-90, 90)) & (df['LON'].between(-180, 180))]

# Filter impossible speeds
df = df[df['SOG'] <= 50]

# Separate moving ships
moving_df = df[df['SOG'] > 1.0].copy()  # Ships moving faster than 1 knot
```

### Results:

- **Total Records:** ~5,055,956 (after cleaning)
- **Moving Records:** ~1,279,041 (ships moving > 1 knot)
- **Unique Moving Vessels:** 912 different ships

---

## Step 3: Statistical Analysis (EDA)

### What is EDA (Exploratory Data Analysis)?

**Simple Explanation:**
EDA is like "getting to know" your data. We calculate statistics (averages, ranges, distributions) to understand what normal behavior looks like.

### What We Analyze:

**1. Speed Statistics (SOG)**
- **What:** How fast do ships typically travel?
- **Metrics:** Mean (average), min, max, median, standard deviation
- **Purpose:** Understand normal speed ranges

**2. Course Statistics (COG)**
- **What:** What directions do ships typically travel?
- **Metrics:** Distribution of course angles (0-360°)
- **Purpose:** Understand common shipping directions

**3. Vessel Type Distribution**
- **What:** What types of ships are most common?
- **Method:** Count occurrences of each vessel type code
- **Purpose:** Understand the makeup of traffic (cargo ships, tankers, tugs, etc.)

**4. Count Unique Vessels**
- **What:** How many different ships are in the dataset?
- **Method:** Count unique MMSI values
- **Result:** 912 unique moving vessels

### Key Statistics:

**Speed Distribution:**
- Most ships travel between 0-25 knots
- Average speed varies by vessel type
- Distribution shows typical harbor speeds (slower in harbor)

**Course Distribution:**
- Shows common directions (north, south, east, west, etc.)
- Certain angles are more common (main shipping lanes)

**Vessel Types:**
- Most common: Tugs (52), Passenger ships (60), Cargo ships (70-79)
- Mix of commercial and support vessels

---

## Step 4: Visualizations

### What is Visualization?

**Simple Explanation:**
Visualizations are like creating pictures or maps of our data. Instead of looking at millions of numbers, we create charts and maps that help us "see" patterns.

### Visualizations We Create:

**1. Speed and Course Distribution (Histograms)**

**What:**
- Two charts showing distributions
- **Chart 1:** Speed distribution (how many ships travel at each speed)
- **Chart 2:** Course distribution (how many ships travel in each direction)

**Purpose:**
- Understand the "physics" of the harbor
- See most common speeds and directions
- Identify typical behavior patterns

**What We Learn:**
- Most ships travel at slow to moderate speeds (0-25 knots)
- Certain directions are more common (main shipping lanes)
- Speed and course follow predictable distributions

**2. Traffic Density Heatmap**

**What:**
- Interactive map showing where ships travel most frequently
- **Colors:**
  - Yellow/Red = High traffic areas (ships travel here often)
  - Blue/Empty = Low traffic areas (ships rarely go here)

**Purpose:**
- Visualize "highways" of the sea (common shipping lanes)
- Identify safe/normal zones (high traffic = normal routes)
- Identify restricted/dangerous zones (low traffic = may be shallow water or restricted areas)

**What We Learn:**
- Clear shipping lanes exist (like highways on the ocean)
- High traffic areas = normal, safe routes
- Empty areas = may be dangerous or restricted (anomalous if a big ship goes there)

**3. Vessel Trajectory Plot ("Spaghetti Plot")**

**What:**
- Map showing individual ship paths (trajectories)
- We plot 5 random vessels with different colors
- Each line represents one ship's path over time
- Green marker = Start point
- Red marker = End point

**Purpose:**
- See how continuous ship tracks are
- Verify data quality (continuous lines = good, broken dots = needs fixing)
- Understand trajectory characteristics

**What We Learn:**
- Most ship tracks are continuous (good data quality)
- Ships follow logical paths
- Confirms that trajectory segmentation (Part 3) will work well

**4. Vessel Type Bar Chart**

**What:**
- Bar chart showing the 10 most common vessel types
- X-axis: Vessel type codes
- Y-axis: Number of signals/records

**Purpose:**
- Understand traffic composition
- See which vessel types dominate

**What We Learn:**
- Cargo ships, tankers, tugs, and passenger ships are most common
- Mix of commercial and support vessels

---

## Key Findings

### What We Discovered:

**1. Normal Speed Patterns:**
- Most ships travel at 0-25 knots in the harbor
- Higher speeds (25-50 knots) are rare
- Speeds > 50 knots are unrealistic for commercial ships

**2. Common Shipping Lanes:**
- Clear "highways" exist where ships commonly travel
- These are the normal routes (safe zones)
- Deviations from these lanes may be suspicious

**3. Vessel Types:**
- Mix of cargo ships, tankers, tugs, passenger ships
- Commercial traffic dominates
- 912 unique moving vessels tracked

**4. Data Quality:**
- Most ship trajectories are continuous (good quality)
- Data is clean and ready for model training
- Moving ships provide meaningful patterns

**5. Traffic Patterns:**
- Ships follow predictable routes
- Speeds and directions have clear distributions
- Clear separation between normal and unusual behaviors

---

## What We Get From This Part

### Deliverables:

**1. Clean Dataset:**
- ✅ 5+ million rows of clean, validated data
- ✅ All data types correct
- ✅ Invalid entries removed
- ✅ Ready for model training

**2. Processed Data:**
- ✅ Moving ships separated (~1.3 million records)
- ✅ 912 unique vessels identified
- ✅ Data sorted and organized by ship and time

**3. Visualizations:**
- ✅ Speed and course distribution charts
- ✅ Traffic density heatmap (`NY_Traffic_Density.html`)
- ✅ Sample trajectory map (`NY_Sample_Trajectories.html`)
- ✅ Vessel type distribution chart

**4. Understanding:**
- ✅ We know what "normal" ship behavior looks like
- ✅ We understand typical speeds, directions, and routes
- ✅ We can identify when behavior deviates from normal

**5. Insights:**
- ✅ Clear shipping lanes exist (normal zones)
- ✅ Speeds follow predictable patterns
- ✅ Most ships follow logical paths

### Why This Matters for the Next Steps:

**For Part 3 (Model Training):**
- Clean data ensures the AI model learns correctly
- Understanding normal behavior helps us evaluate if the model learned well
- Statistical insights help us set reasonable expectations

**For Part 4 (Anomaly Detection):**
- We know what "normal" looks like, so we can detect "unusual"
- Traffic patterns help us understand why certain paths are flagged
- Visualizations help us explain the system's decisions

---

## Summary

**Part 2 is about Preparation and Understanding:**

1. **Clean:** We remove errors, duplicates, and invalid data
2. **Filter:** We keep only high-quality, relevant data
3. **Analyze:** We calculate statistics to understand patterns
4. **Visualize:** We create charts and maps to see the data
5. **Understand:** We learn what "normal" ship behavior looks like

**Key Takeaway:**
We transform raw, messy data into clean, organized data that we understand. This prepares us to train an AI model that can learn normal patterns and detect anomalies.

**Next Step:**
In Part 3, we'll use this clean data to train an LSTM autoencoder model that learns what normal ship behavior looks like.

---

*Document created: January 2025*
*Part: 2 of 6*
*Topic: Data Preprocessing & Exploratory Data Analysis*
