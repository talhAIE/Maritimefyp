# AIS Watch

AIS Watch is a maritime anomaly-detection proof of concept that uses an LSTM autoencoder to identify unusual vessel movement patterns in AIS data.

## Overview

The project analyses Automatic Identification System (AIS) data from New York Harbor for December 2024. It learns normal vessel trajectories from latitude, longitude, speed over ground, and course over ground. A sequence with a high reconstruction error is flagged as potentially anomalous, such as a simulated GPS-spoofing position jump.

The repository includes the full machine-learning notebook, trained model artifacts, interactive map outputs, a data-collection script, and a React dashboard demo. The dashboard currently uses mock data and is ready for future backend integration.

## Features

- AIS data collection and regional filtering for New York Harbor
- Data cleaning, exploratory analysis, and vessel-trajectory visualizations
- LSTM autoencoder trained on 30-point vessel movement sequences
- Reconstruction-error anomaly scoring with a configurable threshold
- Synthetic GPS-spoofing demonstration and interactive Folium maps
- React dashboard with maps, alerts, vessel tables, and analytics charts

## Technologies

- **Machine learning:** Python, PyTorch, scikit-learn, Pandas, NumPy
- **Visualization:** Folium, Matplotlib, Seaborn
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, React Leaflet, Recharts
- **Data source:** NOAA AIS Data Handler

## Installation

### Dashboard

```bash
git clone https://github.com/talhAIE/Maritimefyp.git
cd Maritimefyp/frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

### Machine-learning workflow

Python 3.12+ is required. Install the project dependencies, then open and run [`Notebook/Maritime.ipynb`](Notebook/Maritime.ipynb) to reproduce the preprocessing, training, detection, and evaluation workflow.

```bash
cd Maritimefyp
uv sync
```

The source dataset is not committed because of its size. Use [`scraper/get_data.py`](scraper/get_data.py) to download and filter the December 2024 AIS files when needed.

## Results

- **Dataset:** 5,063,274 AIS records from 912 vessels in New York Harbor
- **Training data:** 1,006,037 sequences of 30 AIS messages
- **Model:** LSTM autoencoder using LAT, LON, SOG, and COG
- **Detection threshold:** `0.000116` reconstruction MSE (95th percentile of normal training errors)
- **Synthetic evaluation:** 95.00% accuracy, 90.91% precision, 100.00% recall, and 95.24% F1-score

These metrics measure detection of synthetic position-jump attacks on training-derived sequences. They demonstrate the proof of concept and should not be interpreted as production performance on real-world attacks.

## Future improvements

- Add a FastAPI backend to load the model and score incoming AIS trajectories
- Connect the dashboard to real inference, alerts, and persistent data
- Evaluate on held-out vessels and time periods, plus real or more diverse attack scenarios
- Add time-gap segmentation, rate of turn, acceleration, vessel-type context, and AIS signal-gap features
- Remove the duplicate frontend source tree and add automated tests and deployment configuration
