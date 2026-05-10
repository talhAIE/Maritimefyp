# AIS Watch — Maritime Anomaly Detection System

An AI-powered system for detecting suspicious maritime activity from AIS (Automatic Identification System) data using an LSTM Autoencoder. Ships are scored in real time and visualised in a React dashboard backed by a FastAPI service.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Project Structure](#project-structure)
4. [Prerequisites](#prerequisites)
5. [Installation](#installation)
6. [Data and Model Artifacts](#data-and-model-artifacts)
7. [Running the App](#running-the-app)
8. [Verification](#verification)
9. [Environment Variables](#environment-variables)
10. [API Reference](#api-reference)
11. [Model Performance](#model-performance)
12. [Tech Stack](#tech-stack)
13. [Troubleshooting](#troubleshooting)
14. [Documentation](#documentation)

---

## Overview

AIS Watch monitors maritime traffic and flags anomalies such as:

- GPS spoofing
- Unauthorised route deviations
- Position teleportation
- Unusual vessel behaviour

The trained model achieves **95% accuracy with 100% recall** on the New York Harbor evaluation set, prioritising zero missed anomalies.

---

## Architecture

The system has two services that run side by side:

| Service | Port | Description |
|---------|------|-------------|
| **Backend** (`backend/`) | `8000` | FastAPI app. Loads the AIS CSV, optionally runs the LSTM Autoencoder, and exposes JSON endpoints. |
| **Frontend** (`frontend/`) | `5173` | React + TypeScript dashboard. Fetches from the backend through a Vite dev-server proxy (`/api`, `/health`). |

Inference activates only when **both** `model_saved/ais_lstm_autoencoder.pth` and `model_saved/scaler.pkl` are present and load cleanly. Without them the API still serves CSV-derived analytics, just no anomaly scores.

---

## Project Structure

```
Maritimefyp/
├── backend/                   # FastAPI service
│   ├── __main__.py            # `python -m backend` entry point
│   ├── main.py                # FastAPI routes
│   ├── maritime_state.py      # CSV + model loading and caches
│   └── model_torch.py         # LSTM Autoencoder definition
│
├── frontend/                  # React + TypeScript dashboard (Vite)
│   ├── src/
│   │   ├── api/client.ts      # Typed fetch wrapper for backend
│   │   ├── components/        # Charts, dashboards, maps, tables
│   │   └── types/             # Shared TypeScript types
│   ├── .env.example
│   ├── package.json
│   └── vite.config.ts         # Dev proxy to http://127.0.0.1:8000
│
├── data/                      # Place AIS CSV here (gitignored content)
│   └── .gitkeep
│
├── model_saved/               # Trained-model artifacts
│   ├── ais_lstm_autoencoder.pth   # LSTM weights (state_dict)
│   ├── scaler.pkl                 # Fitted MinMaxScaler
│   ├── threshold.json             # MSE cutoff for alerts
│   ├── evaluation_metrics.json    # Dashboard KPI labels
│   └── README.md                  # Artifact details
│
├── Notebook/
│   └── Maritime.ipynb         # 6-part training and evaluation workflow
│
├── outputs/                   # Generated HTML visualisations
├── scraper/get_data.py        # NOAA AIS downloader
├── scripts/verify_model.py    # Sanity-check model artifacts
├── documents/                 # Project write-up and chapters
│
├── main.py                    # Shim: `python main.py` -> `python -m backend`
├── pyproject.toml             # Python dependencies (Python >= 3.12)
└── QUICK_START.md             # Abridged setup guide
```

---

## Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Python      | 3.12+   | See `.python-version`. |
| Node.js     | 18+     | Ships with `npm`. |
| Package manager (Python) | `uv` (recommended) or `pip` | `uv` is faster and uses `uv.lock`. |
| Git         | any     | For cloning. |

GPU is optional. The backend will use CUDA automatically if available, otherwise it falls back to CPU.

---

## Installation

### 1. Clone

```bash
git clone https://github.com/talhAIE/Maritimefyp.git
cd Maritimefyp
```

### 2. Backend (Python)

Using **uv** (recommended):

```bash
uv sync
```

Or with **pip** in a virtual environment:

```bash
# Windows (PowerShell)
python -m venv venv
venv\Scripts\Activate.ps1
pip install -e .

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
pip install -e .
```

### 3. Frontend (Node.js)

```bash
cd frontend
npm install
cd ..
```

Optionally copy the env template (only needed when pointing to a non-local API):

```bash
# Windows
Copy-Item frontend\.env.example frontend\.env

# macOS / Linux
cp frontend/.env.example frontend/.env
```

Leave `VITE_API_BASE_URL` empty for local development; the Vite dev server proxies `/api` and `/health` to `http://127.0.0.1:8000`.

---

## Data and Model Artifacts

The repository ships **without** the large AIS CSV. You need to provide it yourself.

### AIS CSV

Place a NOAA AIS CSV at:

```
data/FYP_Training_Data_NY_Dec2024.csv
```

To download a fresh sample:

```bash
python scraper/get_data.py
```

Move the resulting CSV into `data/` if it lands elsewhere. The backend resolves the configured path, then falls back to the largest `.csv` in `data/` if the exact filename is missing.

### Model Artifacts (optional, but enables anomaly detection)

| File | Purpose |
|------|---------|
| `model_saved/ais_lstm_autoencoder.pth` | LSTM Autoencoder weights (`state_dict`). |
| `model_saved/scaler.pkl` | `MinMaxScaler` fitted on `LAT, LON, SOG, COG`. |
| `model_saved/threshold.json` | `{"mse_threshold": ...}` — cutoff for alerts. |
| `model_saved/evaluation_metrics.json` | Optional KPI labels (`accuracy`, `precision`, `recall`, `f1Score`). |

Generate the weights and scaler from `Notebook/Maritime.ipynb` (Part 3):

```python
torch.save(model.state_dict(), "model_saved/ais_lstm_autoencoder.pth")
joblib.dump(scaler, "model_saved/scaler.pkl")
```

See `model_saved/README.md` for full provenance details.

---

## Running the App

The backend and frontend run in **two separate terminals**.

### Terminal 1 — Backend

```bash
# From repo root
uv run python -m backend
# or, if using pip + venv:
python -m backend
```

You should see Uvicorn listening on `http://0.0.0.0:8000`. Health check:

```
http://127.0.0.1:8000/health
```

The response includes `data_loaded`, `model_loaded`, `inference_active`, and `vessels_scored` so you can confirm both the CSV and the model are wired up.

### Terminal 2 — Frontend

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173`.

### Production build (frontend)

```bash
cd frontend
npm run build      # outputs to frontend/dist/
npm run preview    # serves the build locally
```

For a production frontend talking to a remote backend, set `VITE_API_BASE_URL` in `frontend/.env` before building.

---

## Verification

After placing model artifacts, sanity-check them:

```bash
python scripts/verify_model.py
```

Exit code `0` means the weights and scaler load and a probe forward pass succeeds. Restart the backend after replacing artifacts.

---

## Environment Variables

### Backend (`backend/main.py`, `backend/maritime_state.py`)

| Variable | Default | Purpose |
|----------|---------|---------|
| `AIS_DATA_PATH` | `data/FYP_Training_Data_NY_Dec2024.csv` | Override AIS CSV path or directory. |
| `AIS_MODEL_PATH` | `model_saved/ais_lstm_autoencoder.pth` | Override LSTM weights path. |
| `AIS_SCALER_PATH` | `model_saved/scaler.pkl` | Override scaler path. |
| `AIS_THRESHOLD_PATH` | `model_saved/threshold.json` | Override threshold file. |
| `AIS_EVAL_METRICS_PATH` | `model_saved/evaluation_metrics.json` | Override KPI labels file. |
| `AIS_CORS_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173` | Comma-separated list of allowed browser origins. |

### Frontend (`frontend/.env`)

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_API_BASE_URL` | empty (uses Vite proxy) | Set when serving a built frontend against a remote API, e.g. `http://127.0.0.1:8000`. |

---

## API Reference

All endpoints return JSON. Examples assume the backend is at `http://127.0.0.1:8000`.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Service status, data/model load state, inference summary. |
| GET | `/api/statistics` | Aggregate KPIs for the dashboard cards. |
| GET | `/api/vessels?limit=200` | Latest position per MMSI with anomaly flag. |
| GET | `/api/model/vessel-scores?limit=200` | Per-vessel reconstruction MSE, ranked. |
| GET | `/api/alerts` | Vessels above the MSE threshold, sorted by severity. |
| GET | `/api/trajectories?limit=50` | Trajectory snippets for top-N MMSI by sample count. |
| GET | `/api/maps/traffic-density?limit=8000` | `[lat, lon, intensity]` triples for heatmap. |
| GET | `/api/maps/anomaly-pair` | Normal-vs-anomalous trajectory comparison pair. |
| GET | `/api/analytics/speed-distribution` | SOG histogram (2-knot bins). |
| GET | `/api/analytics/course-distribution` | COG histogram (15-degree bins). |
| GET | `/api/analytics/vessel-types` | Vessel type counts and percentages. |
| GET | `/api/analytics/timeline` | Daily totals split into normal vs anomaly. |

Endpoints that require the CSV return **HTTP 503** with a descriptive `detail` if the data is missing; check `/health` first when debugging.

---

## Model Performance

| Metric    | Score   |
|-----------|---------|
| Accuracy  | 95.00%  |
| Precision | 90.91%  |
| Recall    | 100.00% |
| F1-Score  | 95.24%  |

- **Architecture:** LSTM Autoencoder
- **Input sequence:** 30 timesteps × `[LAT, LON, SOG, COG]`
- **Training data:** 1,006,037 sequences from 912 vessels (5M+ raw AIS records, NY Harbor, Dec 2024)
- **Threshold:** MSE = 0.000116 (95th percentile of training reconstruction error)

100% recall is intentional: the cost of a missed anomaly outweighs the cost of a false alarm in this domain.

---

## Tech Stack

### Backend
- **Python 3.12+**
- **FastAPI** + **Uvicorn** — async API server
- **PyTorch** — LSTM Autoencoder
- **scikit-learn** + **joblib** — feature scaling and serialisation
- **pandas** + **NumPy** — AIS preprocessing

### Frontend
- **React 18** + **TypeScript 5**
- **Vite 5** — dev server and bundler
- **Tailwind CSS** — styling
- **React-Leaflet** + **Leaflet** — interactive maps
- **Recharts** — charts
- **date-fns** — date formatting
- **Lucide React** — icons

### Notebook / ML workflow
- **Jupyter** — `Notebook/Maritime.ipynb` (6-part workflow: ingestion → EDA → model → detection → visualisation → evaluation)
- **Folium** — HTML map outputs in `outputs/`

---

## Troubleshooting

### Backend

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `503` on `/api/...` | CSV missing or unreadable | Place CSV in `data/`, then check `/health` `detail`. |
| `model_loaded: false` | Weights or scaler missing | Run `python scripts/verify_model.py` for a precise diagnosis. |
| `inference_active: false` but model loaded | Threshold missing or every vessel below it | Add `model_saved/threshold.json` or lower the threshold. |
| `ImportError` for `backend.*` | Package not installed | Run `uv sync` or `pip install -e .` from the repo root. |
| sklearn pickle warning when loading scaler | Scikit-learn version drift | Re-save `scaler.pkl` with the same sklearn version used at training. |

### Frontend

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Port `5173` in use | Stale Vite process | PowerShell: `Get-NetTCPConnection -LocalPort 5173 \| Select-Object -ExpandProperty OwningProcess \| ForEach-Object { Stop-Process -Id $_ -Force }` |
| `Network error` in dashboard | Backend not running on `:8000` | Start Terminal 1 first; verify `http://127.0.0.1:8000/health`. |
| Maps blank | OpenStreetMap tiles blocked | Check internet access and browser console (F12). |
| `npm install` fails | Stale cache | `npm cache clean --force`, delete `node_modules` and `package-lock.json`, retry. |
| Build talks to wrong API | `VITE_API_BASE_URL` baked in | Update `frontend/.env` and rebuild. |

---

## Documentation

The `documents/` folder contains the full project write-up:

- `Complete Overview of the Project.md` — executive summary
- `Part2_Data_Preprocessing_EDA.md` — cleaning and EDA
- `Part3_LSTM_Model_Development.md` — model architecture and training
- `Part4_Anomaly_Detection_Logic.md` — detection algorithm
- `Parts5-6_Visualization_Evaluation.md` — visualisation and evaluation

For an abridged setup guide, see [`QUICK_START.md`](QUICK_START.md).

---

## License

This project is part of a Final Year Project (FYP). See repository for license details.

---

## Quick Start (TL;DR)

```bash
# 1. Clone and install
git clone https://github.com/talhAIE/Maritimefyp.git
cd Maritimefyp
uv sync                              # backend deps
cd frontend && npm install && cd ..  # frontend deps

# 2. Drop your AIS CSV at data/FYP_Training_Data_NY_Dec2024.csv
#    (and model artifacts in model_saved/ for anomaly scoring)

# 3. Terminal 1: backend
uv run python -m backend             # http://127.0.0.1:8000

# 4. Terminal 2: frontend
cd frontend && npm run dev           # http://localhost:5173
```
