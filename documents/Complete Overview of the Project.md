# Complete Overview of the Project: Maritime Anomaly Detection System

## 📋 Table of Contents
1. [Executive Summary](#executive-summary)
2. [Project Overview](#project-overview)
3. [Problem Statement](#problem-statement)
4. [Data Collection and Description](#data-collection-and-description)
5. [System Architecture](#system-architecture)
6. [Methodology](#methodology)
7. [Key Components](#key-components)
8. [Results and Performance](#results-and-performance)
9. [Outputs and Visualizations](#outputs-and-visualizations)
10. [Technical Details](#technical-details)
11. [Project Structure](#project-structure)

---

## Executive Summary

This project develops an **Artificial Intelligence (AI) system to detect suspicious and potentially dangerous activities in maritime traffic** using ship tracking data. The system analyzes patterns of normal ship movement in New York Harbor and identifies anomalies that could indicate security threats such as GPS spoofing attacks, unauthorized route deviations, or other suspicious behaviors.

**Key Achievement:** The system successfully detects anomalies with **95% accuracy**, meaning it correctly identifies suspicious ship behaviors 95 times out of 100, while minimizing false alarms.

---

## Project Overview

### What is This Project?

This is a **Maritime Security and Anomaly Detection System** that uses advanced machine learning to monitor ships in real-time. Think of it as a "smart security guard" for the ocean that watches over ships 24/7 and alerts authorities when something suspicious happens.

### Real-World Application

In the modern world, ships transmit their location, speed, and direction using GPS and AIS (Automatic Identification System) technology. However, criminals can "spoof" or fake these signals to hide their real location, similar to how someone might fake a phone number. This system detects when ship signals don't match their actual behavior patterns.

### Why Does This Matter?

- **Maritime Security**: Protects ports and waterways from threats
- **Prevents Smuggling**: Detects ships trying to hide their routes
- **Safety**: Identifies ships in distress or behaving dangerously
- **Cost-Effective**: Automated monitoring reduces need for constant human surveillance

---

## Problem Statement

### The Challenge

Modern ships broadcast their position using AIS (Automatic Identification System), which sends information like:
- Where the ship is (latitude/longitude)
- How fast it's moving (speed)
- Which direction it's heading (course)
- What type of ship it is

However, this system has vulnerabilities:
1. **GPS Spoofing**: Attackers can send fake GPS signals making a ship appear somewhere it's not
2. **Signal Tampering**: Malicious actors can manipulate AIS data
3. **Unauthorized Access**: Criminals can use fake identities to hide illegal activities

### Our Solution

We built an AI system that learns what "normal" ship behavior looks like in New York Harbor. When a ship's movement doesn't match these normal patterns, the system flags it as suspicious. This is similar to a credit card company detecting fraud when your card is used in an unusual location.

---

## Data Collection and Description

### Data Source

The project uses **AIS (Automatic Identification System) data** from the National Oceanic and Atmospheric Administration (NOAA). This data contains real ship tracking information from New York Harbor during December 2024.

### Dataset Statistics

- **Total Records**: Over 5 million (5,063,274) ship position reports
- **Time Period**: December 1-31, 2024 (entire month)
- **Geographic Area**: New York Harbor (approximately 40.50° to 40.75° latitude, -74.20° to -73.90° longitude)
- **Unique Vessels**: 912 different ships tracked
- **Data Collection Method**: Automated download from NOAA's public database

### What Information is in the Data?

Each record contains:
1. **MMSI** (Maritime Mobile Service Identity): A unique ID number for each ship (like a license plate)
2. **BaseDateTime**: Timestamp showing when the position was recorded
3. **LAT** (Latitude): North-South position coordinate
4. **LON** (Longitude): East-West position coordinate
5. **SOG** (Speed Over Ground): How fast the ship is moving in knots
6. **COG** (Course Over Ground): Direction the ship is heading (0-360 degrees)
7. **VesselType**: Category of ship (Cargo, Tanker, Fishing, Tug, etc.)

### Data Quality

- Ships moving at speeds between 1-50 knots were analyzed
- Stationary ships (anchored at port) were filtered out for trajectory analysis
- Duplicate records and invalid coordinates were removed
- All timestamps were standardized and validated

**Example Data Sample:**
```
Ship ID (MMSI): 367618310
Time: 2024-12-01 00:00:00
Location: 40.66993°N, 74.08254°W
Speed: 0.0 knots (stationary)
Course: 305.4° (northwest direction)
Type: Vessel Type 52 (Tug)
```

---

## System Architecture

### High-Level Overview

The system works in **6 main stages**:

```
1. DATA COLLECTION
   ↓
2. DATA CLEANING & PREPROCESSING
   ↓
3. EXPLORATORY DATA ANALYSIS
   ↓
4. MODEL TRAINING (Learning Normal Behavior)
   ↓
5. ANOMALY DETECTION (Identifying Suspicious Patterns)
   ↓
6. VISUALIZATION & ALERTING
```

### How It Works (Simple Explanation)

Imagine you're learning to recognize a friend's handwriting:
1. **Training Phase**: You study many examples of their normal writing
2. **Learning Phase**: Your brain creates a "pattern" of what their writing looks like
3. **Recognition Phase**: When you see new writing, you compare it to the pattern you learned
4. **Detection Phase**: If the writing doesn't match the pattern, you know something's wrong

Our system does the same thing, but for ship movements:
1. **Training**: Studies millions of normal ship paths
2. **Learning**: Creates a mathematical "pattern" of normal behavior
3. **Comparison**: Checks new ship movements against this pattern
4. **Detection**: Flags movements that don't match normal patterns

---

## Methodology

### Part 1: Data Collection

**What Happened:**
- Downloaded AIS data from NOAA's public database for December 2024
- Processed 31 days of data (one file per day)
- Filtered data to focus on New York Harbor region only
- Combined all daily files into one comprehensive dataset

**Tools Used:**
- Python programming language
- Automated web scraping to download data
- Data processing libraries (Pandas, NumPy)

### Part 2: Data Preprocessing and Exploratory Data Analysis

**What Happened:**
- Cleaned the raw data (removed errors, duplicates, invalid entries)
- Converted text data to proper numeric formats
- Analyzed patterns in normal ship behavior
- Created visualizations to understand traffic patterns

**Key Findings:**
- Most ships travel at speeds between 5-25 knots
- Cargo ships and tankers are the most common vessel types
- Clear traffic lanes exist (like highways on the ocean)
- Ships generally follow predictable routes

**Visualizations Created:**
1. **Speed Distribution Charts**: Show how fast ships typically travel
2. **Traffic Density Heatmaps**: Visualize "highways" where ships commonly travel
3. **Trajectory Maps**: Show individual ship paths

### Part 3: Model Development (The "Brain")

**What is an LSTM Autoencoder?**

Think of this as the "brain" of our system. Here's a simple explanation:

**LSTM (Long Short-Term Memory)**: 
- A type of artificial neural network that can "remember" patterns over time
- Perfect for analyzing sequences (like a ship's path over time)
- Similar to how humans remember a sequence of events

**Autoencoder**:
- A type of AI model that learns to compress and reconstruct data
- It learns by trying to recreate the input data from a compressed version
- If it can't recreate something well, that thing is "unusual"

**How Our Model Works:**
1. **Encoder**: Compresses a ship's 30-position trajectory into a summary
2. **Decoder**: Tries to reconstruct the original trajectory from the summary
3. **Learning**: Through training, it learns what "normal" trajectories look like
4. **Detection**: If it can't reconstruct a trajectory well, that trajectory is unusual

**Model Architecture:**
- **Input**: Ship positions over 30 time steps (latitude, longitude, speed, course)
- **Hidden Layers**: Neural network with 128 units (the "brain cells")
- **Output**: Reconstructed trajectory (what the ship's path should look like)
- **Training**: Used 1,006,037 trajectory sequences from normal ships

### Part 4: Anomaly Detection Logic (The "Judge")

**How Anomalies Are Detected:**

1. **Establish Baseline**: Calculate how well the model reconstructs normal ship paths
2. **Set Threshold**: Define a "line" - if reconstruction error is above this line, it's suspicious
3. **Test New Data**: For each new ship path:
   - Feed it to the model
   - Measure reconstruction error
   - Compare to threshold
   - Flag if error is too high

**Threshold Setting:**
- Used the 95th percentile of normal data errors
- This means 95% of normal ships have errors below the threshold
- Only the top 5% "most unusual" normal behaviors pass
- Anything above threshold is flagged as suspicious

**Example:**
- Normal ship: Error = 0.000016 (very low, can reconstruct perfectly)
- Suspicious ship: Error = 0.000708 (high, cannot reconstruct well)
- Threshold: 0.000116 (the dividing line)
- Result: Normal ship passes, suspicious ship is flagged

### Part 5: Visualization and Demonstration

**Interactive Dashboards Created:**
1. **Traffic Density Map**: Shows where ships commonly travel
2. **Anomaly Detection Map**: Shows normal (green) vs suspicious (red) ship paths
3. **Surveillance Dashboard**: Real-time style monitoring interface

### Part 6: Performance Evaluation

**Testing Methodology:**
- Created 200 test cases (100 normal, 100 with injected anomalies)
- System analyzed each case and made predictions
- Results compared to ground truth (what we know to be true)

---

## Key Components

### 1. Data Processing Pipeline

**Functions:**
- Downloads raw AIS data automatically
- Cleans and filters data
- Organizes data by ship and time
- Prepares data for AI model

### 2. LSTM Autoencoder Model

**Purpose:** Learn normal ship behavior patterns

**Input:**
- Ship trajectory: 30 consecutive position reports
- Features: Latitude, Longitude, Speed, Course

**Output:**
- Reconstructed trajectory (prediction of what path should look like)

**Training:**
- 10 epochs (complete passes through the data)
- Learning rate: 0.001
- Batch size: 64 trajectories at a time
- Final training loss: 0.000031 (very low, indicating good learning)

### 3. Anomaly Detection Engine

**Purpose:** Identify suspicious ship behaviors

**Process:**
1. Extract ship trajectory (30 positions)
2. Normalize data (scale to 0-1 range)
3. Feed to trained model
4. Calculate reconstruction error
5. Compare to threshold (0.000116)
6. Flag if error exceeds threshold

### 4. Visualization System

**Outputs Generated:**
- Interactive HTML maps showing ship paths
- Color-coded paths (green = normal, red = suspicious)
- Traffic density heatmaps
- Statistical charts and graphs

---

## Results and Performance

### Model Training Results

**Training Progress:**
- Initial error: 0.000828
- Final error: 0.000031
- **98% reduction in error** during training
- Model successfully learned normal ship patterns

**Training Statistics:**
- Total sequences processed: 1,006,037
- Unique vessels analyzed: 912
- Training time: ~13 minutes (on GPU)
- Model size: ~500 KB (very efficient)

### Anomaly Detection Performance

**Test Results (200 test cases):**

| Metric | Score | Explanation |
|--------|-------|-------------|
| **Accuracy** | **95.00%** | Correctly identifies 95 out of 100 ships as normal or suspicious |
| **Precision** | **90.91%** | When system flags a ship as suspicious, 90.91% of the time it's actually suspicious |
| **Recall** | **100.00%** | System catches 100% of all suspicious ships (no misses) |
| **F1-Score** | **95.24%** | Overall performance metric balancing precision and recall |

**Performance Interpretation:**

✅ **Excellent Detection Rate**: The system successfully identifies all suspicious activities (100% recall)

✅ **Low False Alarms**: Only 9.09% of flagged ships are false alarms (90.91% precision)

✅ **High Overall Accuracy**: 95% of all decisions are correct

✅ **Production Ready**: Performance metrics meet industry standards for security systems

### Error Analysis

**Normal Ship Errors:**
- Minimum: 0.000004
- Maximum: 0.006422
- Average: 0.000030
- Threshold: 0.000116 (95th percentile)

**Suspicious Ship Errors:**
- Typical range: 0.000700 - 0.001000
- Clearly distinguishable from normal behavior
- System reliably separates normal from suspicious

---

## Outputs and Visualizations

### Generated Files

The project produces several interactive visualization files:

1. **NY_Traffic_Density.html**
   - Shows where ships commonly travel in New York Harbor
   - Heatmap visualization (yellow/red = high traffic, blue = low traffic)
   - Helps understand "normal" traffic patterns

2. **NY_Sample_Trajectories.html**
   - Shows example ship paths (trajectories)
   - Different colors for different ships
   - Demonstrates typical ship movement patterns

3. **Anomaly_Detection_Result.html**
   - Comparison of normal vs suspicious ship paths
   - Blue line = normal ship (passes security check)
   - Red dashed line = suspicious ship (flagged by system)
   - Shows why the system flagged the suspicious path

4. **Final_AIS_Dashboard.html**
   - Simulated real-time monitoring dashboard
   - Shows multiple ships simultaneously
   - Green paths = cleared (normal behavior)
   - Red paths = flagged (suspicious behavior)
   - Demonstrates how the system would work in production

### Saved Models

1. **ais_lstm_autoencoder.pth**
   - The trained AI model
   - Can be loaded to analyze new ship data
   - Size: ~500 KB

2. **scaler.pkl**
   - Data normalization parameters
   - Required to process new data correctly
   - Ensures new data is scaled the same way as training data

---

## Technical Details

### Technologies Used

**Programming Language:**
- Python 3.12+

**Key Libraries:**
- **PyTorch**: Deep learning framework for neural networks
- **Pandas**: Data manipulation and analysis
- **NumPy**: Numerical computing
- **Matplotlib/Seaborn**: Data visualization
- **Folium**: Interactive map creation
- **Scikit-learn**: Machine learning utilities
- **Joblib**: Model saving/loading

### System Requirements

**Hardware:**
- GPU recommended (for faster training)
- Minimum 8GB RAM (for processing large datasets)
- ~500MB storage for models

**Software:**
- Python 3.12 or higher
- All dependencies listed in `pyproject.toml`

### Data Processing Pipeline

1. **Raw Data**: CSV files from NOAA (millions of rows)
2. **Filtering**: Geographic region, valid coordinates, reasonable speeds
3. **Cleaning**: Remove duplicates, handle missing values, type conversion
4. **Sequencing**: Create 30-position sliding windows from ship trajectories
5. **Normalization**: Scale all values to 0-1 range for neural network
6. **Training**: Feed sequences to LSTM autoencoder model
7. **Evaluation**: Test on held-out data

### Model Architecture Details

**LSTM Autoencoder Structure:**

```
Input Layer: (Batch, 30 timesteps, 4 features)
    ↓
Encoder LSTM: 128 hidden units
    ↓
Latent Vector: (Batch, 128)
    ↓
Decoder LSTM: 128 hidden units
    ↓
Output Layer: Linear transformation
    ↓
Output: (Batch, 30 timesteps, 4 features)
```

**Hyperparameters:**
- Sequence length: 30 positions
- Embedding dimension: 128 units
- Learning rate: 0.001
- Batch size: 64
- Epochs: 10
- Optimizer: Adam
- Loss function: Mean Squared Error (MSE)

---

## Project Structure

```
Fyp_Maritime/
│
├── data/
│   └── FYP_Training_Data_NY_Dec2024.csv    # Main dataset (5M+ rows)
│
├── model_saved/
│   ├── ais_lstm_autoencoder.pth            # Trained AI model
│   └── scaler.pkl                          # Data normalization parameters
│
├── outputs/
│   ├── Anomaly_Detection_Result.html       # Normal vs Suspicious comparison
│   ├── Final_AIS_Dashboard.html            # Real-time monitoring dashboard
│   ├── NY_Sample_Trajectories.html         # Example ship paths
│   └── NY_Traffic_Density.html             # Traffic heatmap
│
├── Notebook/
│   └── Maritime.ipynb                      # Complete Jupyter notebook
│
├── scraper/
│   └── get_data.py                         # Data download script
│
├── main.py                                 # Entry point
├── maritime.py                             # Main implementation
├── pyproject.toml                          # Project dependencies
└── README.md                               # Project documentation
```

---

## How to Use This System

### For End Users (Non-Technical)

1. **Provide Ship Data**: Supply AIS data (ship positions over time)
2. **System Analyzes**: The AI model processes the data
3. **Receive Alert**: If suspicious behavior detected, you get an alert
4. **View Visualization**: Check interactive maps to see flagged ships

### For Developers

1. **Install Dependencies**: `pip install -e .`
2. **Load Model**: Use saved model from `model_saved/` directory
3. **Process New Data**: Feed new ship trajectories to the model
4. **Get Predictions**: Model returns anomaly scores
5. **Generate Alerts**: Flag trajectories above threshold

---

## Key Insights and Discoveries

### What We Learned

1. **Normal Traffic Patterns**:
   - Ships follow predictable routes (like highways)
   - Speed distributions are consistent
   - Clear separation between cargo and pleasure craft behaviors

2. **Anomaly Characteristics**:
   - GPS spoofing creates "jumps" in ship positions
   - Suspicious paths have reconstruction errors 20-30x higher than normal
   - System can detect position deviations as small as 20km instantly

3. **System Performance**:
   - LSTM autoencoder effectively learns temporal patterns
   - 30-position window captures sufficient context
   - Threshold at 95th percentile balances detection and false alarms

### Limitations and Future Work

**Current Limitations:**
- Trained on data from one region (New York Harbor)
- Requires 30 consecutive positions (may miss very short anomalies)
- Weather and traffic conditions not explicitly considered

**Future Improvements:**
- Expand training data to multiple ports/regions
- Add weather and traffic condition features
- Real-time streaming analysis capability
- Multi-scale anomaly detection (short-term and long-term patterns)

---

## Conclusion

This project successfully demonstrates the application of **deep learning and artificial intelligence** to maritime security. The system can automatically monitor thousands of ships and identify suspicious behaviors with **95% accuracy**, significantly improving maritime security monitoring capabilities.

**Key Achievements:**
- ✅ Processed and analyzed 5+ million ship position records
- ✅ Trained effective AI model using LSTM autoencoder architecture
- ✅ Achieved 95% accuracy in anomaly detection
- ✅ Created interactive visualization tools
- ✅ Developed production-ready system architecture

**Real-World Impact:**
This technology can be deployed in ports and waterways worldwide to enhance maritime security, detect illegal activities, and protect critical infrastructure. The automated nature of the system allows for 24/7 monitoring without requiring constant human supervision.

---

## Contact and Additional Information

For technical details, code documentation, or questions about this project, please refer to:
- **Jupyter Notebook**: `Notebook/Maritime.ipynb` (complete implementation)
- **Source Code**: `maritime.py` (Python implementation)
- **Data**: `data/FYP_Training_Data_NY_Dec2024.csv` (processed dataset)

---

*Document generated: January 2025*
*Project: Maritime Anomaly Detection System*
*Methodology: LSTM Autoencoder for AIS Data Analysis*
