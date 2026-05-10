# Quick Start (Backend + Frontend)

Paths below assume you are at the repository root (`Maritimefyp`).

## 1. Python environment & API

Install dependencies:

```powershell
uv sync
```

(or `pip install -e .` in a Python 3.12+ virtual environment.)

Place AIS training CSV at:

```
data/FYP_Training_Data_NY_Dec2024.csv
```

Use `python scraper/get_data.py` to download it from NOAA into the scraper folder, then move/rename into `data/` if needed.

For anomaly scores and alerts, save the notebook-trained artifacts as:

```
model_saved/ais_lstm_autoencoder.pth   # torch.save(model.state_dict(), ...)
model_saved/scaler.pkl                 # joblib.dump(scaler, ...)
model_saved/threshold.json             # optional; see repo template
model_saved/evaluation_metrics.json    # optional; dashboard metrics labels
```

## 2. Start the backend (terminal 1)

```powershell
cd C:\Users\Talha Abbasi\Desktop\Maritimefyp
uv run python -m backend
```

You should see Uvicorn on `http://0.0.0.0:8000`. Check `http://127.0.0.1:8000/health`.

## 3. Start the frontend (terminal 2)

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The dev server proxies `/api` and `/health` to port `8000`, so leave `VITE_API_BASE_URL` unset unless you ship a standalone build.

## 4. Environment variables (optional)

| Variable | Purpose |
|----------|---------|
| `AIS_DATA_PATH` | Override path to the AIS CSV |
| `AIS_MODEL_PATH` | Override `ais_lstm_autoencoder.pth` |
| `AIS_SCALER_PATH` | Override `scaler.pkl` |
| `AIS_THRESHOLD_PATH` | Override `threshold.json` |
| `AIS_EVAL_METRICS_PATH` | Override `evaluation_metrics.json` |
| `AIS_CORS_ORIGINS` | Comma-separated allowed browser origins |

## Troubleshooting

- **503 on `/api/...`**: CSV missing or unreadable; see `GET /health` `detail`.
- **No alerts**: Model/scaler missing, or every vessel falls below threshold.
- **`python backend\api.py`**: Older docs; use `uv run python -m backend`.
