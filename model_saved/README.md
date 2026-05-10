# `model_saved/` — anomaly inference artifacts

The FastAPI backend **runs the trained LSTM autoencoder** against your loaded AIS CSV when these files exist.

## Full folder (runtime-ready)

A complete setup has **all** of the following next to this README (paths are relative to the repo root):

| File | Role |
|------|------|
| `ais_lstm_autoencoder.pth` | LSTM autoencoder weights (`state_dict` or wrapped checkpoint). |
| `scaler.pkl` | `MinMaxScaler` fitted on LAT, LON, SOG, COG — must match training. |
| `threshold.json` | `{"mse_threshold": ...}` — MSE cutoff for alerts and maps. |
| `evaluation_metrics.json` | Optional KPIs (`accuracy`, `precision`, `recall`, `f1Score`) for dashboard cards. |
| `README.md` | This file. |

`.gitignore` does **not** ignore `*.pth` / `*.pkl` (those lines are commented), so you can commit small checkpoints if you want the repo to ship a full `model_saved/` tree.

## Training provenance

- **Weights:** `torch.save(model.state_dict(), ...)` from `Notebook/Maritime.ipynb` (Part 3).
- **Scaler:** `joblib.dump(scaler, ...)` — the **same** `MinMaxScaler` used when training (`fit_transform` on LAT, LON, SOG, COG). If sklearn warns about pickle version mismatches when loading `scaler.pkl`, align sklearn with the training environment or re-save the scaler.

Without **`threshold.json`**, the API may fall back to a data-derived percentile threshold; with it, alerting uses **`mse_threshold`** explicitly.

## Verify locally

From the repo root:

```bash
python scripts/verify_model.py
```

Exit code **0** means weights + scaler load and a probe forward pass succeeds. **Restart** `python -m backend` after adding or replacing files.

## API / UI checklist

Open `GET http://127.0.0.1:8000/health`:

- **`model_loaded`: `true`** and **`inference_active`: `true`** → vessels were scored (`vessels_scored` > 0, threshold set).
- **`weights_file_present` / `scaler_file_present`** → confirms files on disk regardless of CSV.

If **`anomalies_flagged`** is zero, either traffic is uniformly “normal”, or thresholds are conservative — tuning `threshold.json` is expected.
