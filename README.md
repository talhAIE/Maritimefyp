# AIS Watch - Maritime Anomaly Detection System

An AI-powered system for detecting suspicious maritime activities using LSTM Autoencoder for real-time anomaly detection in ship tracking data.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [How to Run](#how-to-run)
  - [Frontend Dashboard](#frontend-dashboard)
  - [Python/Backend (Future)](#pythonbackend-future)
- [Usage](#usage)
- [Model Performance](#model-performance)
- [Project Documentation](#project-documentation)
- [Technologies Used](#technologies-used)

---

## Project Overview

AIS Watch is a **Maritime Security and Anomaly Detection System** that uses advanced machine learning (LSTM Autoencoder) to monitor ships in real-time and identify anomalies such as:

- GPS spoofing attacks
- Unauthorized route deviations
- Suspicious behaviors
- Position teleportation

**Key Achievement:** 95% accuracy with 100% recall (catches all anomalies)

---

## Features

- ✅ **Real-time Anomaly Detection** - LSTM Autoencoder model with 95% accuracy
- ✅ **Interactive Dashboard** - React-based frontend with live visualizations
- ✅ **Traffic Analysis** - Heatmaps and trajectory visualization
- ✅ **Alert Management** - Real-time anomaly alerts with severity levels
- ✅ **Data Analytics** - Speed, course, and vessel type distributions
- ✅ **Training Data** - 5+ million AIS records from New York Harbor

---

## Project Structure

```
Fyp_Maritime/
├── frontend/                 # React TypeScript Frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── data/            # Mock data
│   │   └── types/           # TypeScript types
│   ├── package.json
│   └── vite.config.ts
│
├── data/                     # Training Dataset
│   └── FYP_Training_Data_NY_Dec2024.csv
│
├── model_saved/              # Trained Models
│   ├── ais_lstm_autoencoder.pth
│   └── scaler.pkl
│
├── Notebook/                 # Jupyter Notebook
│   └── Maritime.ipynb       # Complete 6-part workflow
│
├── outputs/                  # Generated Visualizations
│   ├── Anomaly_Detection_Result.html
│   ├── Final_AIS_Dashboard.html
│   ├── NY_Sample_Trajectories.html
│   └── NY_Traffic_Density.html
│
├── scraper/                  # Data Collection
│   └── get_data.py
│
├── documents/                # Project Documentation
│   ├── Complete Overview of the Project.md
│   ├── Part2_Data_Preprocessing_EDA.md
│   ├── Part3_LSTM_Model_Development.md
│   └── ...
│
├── pyproject.toml           # Python Dependencies
└── README.md                # This file
```

---

## Prerequisites

### For Frontend:
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)

### For Python/ML:
- **Python** 3.12+ ([Download](https://www.python.org/downloads/))
- **pip** or **uv** (package manager)

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/talhAIE/Maritimefyp.git
cd Maritimefyp
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

This installs all React, TypeScript, and UI dependencies.

### 3. Python Environment Setup (Optional - for ML/Backend)

If you want to run the Python/ML components:

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -e .
```

Or using `uv` (recommended):
```bash
uv sync
```

---

## How to Run

### Frontend Dashboard

The UI expects the **API** on port **8000** (see above). Dev server proxies `/api` and `/health`; no env var needed for local development.

```bash
# Navigate to frontend directory
cd frontend

# Start development server
npm run dev
```

**Open your browser:**
```
http://localhost:5173
```

The dashboard loads:
- Statistics overview
- Interactive maps (Traffic Density, Trajectories, Anomaly Detection, Surveillance)
- Charts and analytics
- Alerts table
- Data tables

**To stop the server:** Press `Ctrl + C` in the terminal

### Build for Production

```bash
cd frontend
npm run build
```

The production build will be in `frontend/dist/` folder.

---

### Python API (FastAPI)

Runs on **port 8000** and serves live statistics, analytics, vessels, alerts, and map payloads from:

- **CSV:** `data/FYP_Training_Data_NY_Dec2024.csv`
- **Model (optional):** `model_saved/ais_lstm_autoencoder.pth`, `model_saved/scaler.pkl`, plus `threshold.json` / `evaluation_metrics.json`

```bash
# From repository root (install deps once: uv sync or pip install -e .)
python -m backend
```

Or:

```bash
python main.py
```

**To run the Jupyter Notebook:**

```bash
# Install Jupyter if needed
pip install jupyter

# Start Jupyter
jupyter notebook

# Open Notebook/Maritime.ipynb
```

**To use the trained model:**

```python
import torch
import joblib
from pathlib import Path

# Load model
model_path = Path("model_saved/ais_lstm_autoencoder.pth")
scaler_path = Path("model_saved/scaler.pkl")

# Load scaler
scaler = joblib.load(scaler_path)

# Load model architecture and weights
# (See Notebook/Maritime.ipynb Part 3 for model definition)
```

---

## Usage

### Frontend Dashboard Sections

1. **Dashboard** - Overview with statistics cards and charts
2. **Maps & Trajectories** - 4 interactive map views:
   - Traffic Density Heatmap
   - Sample Trajectories
   - Anomaly Detection Comparison
   - Live Surveillance Dashboard
3. **Anomaly Alerts** - List of detected anomalies with details
4. **Analytics** - Charts for speed, course, vessel types, timeline
5. **Training Data** - Dataset information and statistics
6. **Settings** - Configuration panel

### Model Information

- **Architecture:** LSTM Autoencoder
- **Input:** 30-position sequences (LAT, LON, SOG, COG)
- **Training Data:** 1,006,037 sequences from 912 vessels
- **Threshold:** 0.000116 (95th percentile)
- **Performance:**
  - Accuracy: 95.00%
  - Precision: 90.91%
  - Recall: 100.00%
  - F1-Score: 95.24%

---

## Model Performance

| Metric | Score |
|--------|-------|
| **Accuracy** | 95.00% |
| **Precision** | 90.91% |
| **Recall** | 100.00% |
| **F1-Score** | 95.24% |

**Key Highlights:**
- ✅ 100% recall - Catches ALL suspicious ships
- ✅ 90.91% precision - Low false alarm rate
- ✅ Trained on 5+ million real AIS records

---

## Project Documentation

Comprehensive documentation is available in the `documents/` folder:

- **Complete Overview of the Project.md** - Full project summary
- **Part2_Data_Preprocessing_EDA.md** - Data cleaning and analysis
- **Part3_LSTM_Model_Development.md** - Model architecture and training
- **Part4_Anomaly_Detection_Logic.md** - Detection algorithm
- **Parts5-6_Visualization_Evaluation.md** - Visualizations and evaluation

---

## Technologies Used

### Frontend
- **React** 18 + **TypeScript**
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React-Leaflet** - Interactive maps
- **Recharts** - Data visualization
- **Lucide React** - Icons

### Backend/ML
- **Python** 3.12+
- **PyTorch** - Deep learning framework
- **Pandas** - Data processing
- **NumPy** - Numerical computing
- **Scikit-learn** - ML utilities
- **Folium** - Map visualization
- **FastAPI** - API framework (for future backend)
- **Uvicorn** - ASGI server

---

## Troubleshooting

### Frontend Issues

**Port 5173 already in use:**
```powershell
# Windows PowerShell
Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }
```

**npm install fails:**
- Clear cache: `npm cache clean --force`
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

**Maps don't load:**
- Check internet connection (maps load from OpenStreetMap)
- Check browser console (F12) for errors

### Python Issues

**Module not found:**
- Ensure virtual environment is activated
- Run `pip install -e .` to install dependencies

**Model loading errors:**
- Ensure `model_saved/` folder contains the model files
- Check Python version (3.12+ required)

---

## License

This project is part of a Final Year Project (FYP).

---

## Contact

For questions or issues, please open an issue on GitHub.

---

## Quick Start Summary

```bash
# 1. Clone repository
git clone https://github.com/talhAIE/Maritimefyp.git
cd Maritimefyp

# 2. Install frontend dependencies
cd frontend
npm install

# 3. Run frontend
npm run dev

# 4. Open browser
# http://localhost:5173
```

**That's it!** Keep the FastAPI server running on port 8000 so the dashboard can load live AIS-derived data through the `/api` proxy.

---

*Last updated: January 2025*