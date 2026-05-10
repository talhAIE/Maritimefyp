"""FastAPI application: AIS analytics and anomaly scores from CSV + optional LSTM."""

from __future__ import annotations

import asyncio
import math
import os
from typing import Any

import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from backend.maritime_state import VESSEL_TYPE_NAMES, state


def _cors_origins() -> list[str]:
    raw = os.environ.get("AIS_CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
    return [o.strip() for o in raw.split(",") if o.strip()]


app = FastAPI(title="AIS Watch API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _require_ready() -> None:
    if not state.ready:
        raise HTTPException(status_code=503, detail=state.message or "Service unavailable")


@app.on_event("startup")
async def _startup_load() -> None:
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, state.load)


def _inference_health_block() -> dict[str, Any]:
    """Expose whether the LSTM path actually ran and scored vessels."""
    errs = state.errors_by_mmsi
    thresh = state.threshold
    values = list(errs.values())
    flagged = (
        sum(1 for e in values if thresh is not None and e > thresh)
        if thresh is not None
        else 0
    )
    median_mse = float(np.median(values)) if values else None
    return {
        "inference_active": state.model is not None and len(errs) > 0 and thresh is not None,
        "vessels_scored": len(errs),
        "anomalies_flagged": flagged,
        "mse_median": round(median_mse, 12) if median_mse is not None else None,
        "inference_device": str(state.device) if state.model is not None else None,
        "expected_model_weights": str(state.model_path),
        "expected_scaler": str(state.scaler_path),
        "weights_file_present": state.model_path.is_file(),
        "scaler_file_present": state.scaler_path.is_file(),
    }


@app.get("/health")
def health() -> dict[str, Any]:
    base: dict[str, Any] = {
        "message": "Maritime Anomaly Detection API",
        "status": "running" if state.ready else "degraded",
        "data_loaded": state.df is not None,
        "csv_path_configured": str(state.csv_path),
        "csv_path_used": str(state.active_csv_path) if state.active_csv_path else None,
        "model_loaded": state.model is not None,
        "scaler_loaded": state.scaler is not None,
        "threshold": state.threshold,
        "detail": state.message,
    }
    base.update(_inference_health_block())
    return base


@app.get("/api/statistics")
def api_statistics() -> dict[str, Any]:
    _require_ready()
    assert state.df is not None
    return state.statistics()


@app.get("/api/vessels")
def api_vessels(limit: int = 200) -> list[dict[str, Any]]:
    _require_ready()
    assert state.df is not None
    df = state.df.sort_values(["MMSI", "BaseDateTime"])
    tail = df.groupby("MMSI", sort=False).tail(1).head(max(1, min(limit, 5000)))
    out: list[dict[str, Any]] = []
    for row in tail.itertuples(index=False):
        mmsi = int(row.MMSI)
        err = state.errors_by_mmsi.get(mmsi)
        anomaly = bool(state.threshold is not None and err is not None and err > state.threshold)
        vt = getattr(row, "VesselType", 0)
        try:
            vessel_type_int = int(vt)
        except (TypeError, ValueError):
            vessel_type_int = 0
        if isinstance(vt, float) and math.isnan(vt):
            vessel_type_int = 0

        item: dict[str, Any] = {
            "mmsi": mmsi,
            "latitude": float(row.LAT),
            "longitude": float(row.LON),
            "speed": float(row.SOG),
            "course": float(row.COG),
            "vesselType": vessel_type_int,
            "timestamp": row.BaseDateTime.isoformat(),
            "status": "anomaly" if anomaly else "normal",
        }
        if err is not None:
            item["error"] = err
        out.append(item)
    return out


def _mse_severity(err: float, th: float) -> str:
    if err <= th:
        return "none"
    if err > th * 6:
        return "high"
    if err > th * 3:
        return "medium"
    return "low"


@app.get("/api/model/vessel-scores")
def api_vessel_scores(limit: int = 200) -> dict[str, Any]:
    """Ranked reconstruction MSE per MMSI — primary output of the trained LSTM autoencoder for this AIS load."""
    _require_ready()
    assert state.df is not None
    limit = max(1, min(limit, 1500))
    errs = state.errors_by_mmsi
    th = state.threshold
    inference_on = bool(state.model is not None and errs and th is not None)

    if not errs:
        return {
            "threshold": th,
            "scored_count": 0,
            "inference_active": inference_on,
            "vessels": [],
        }

    ranked = sorted(errs.items(), key=lambda x: -x[1])[:limit]
    vessels_out: list[dict[str, Any]] = []
    for mmsi, mse in ranked:
        flagged = th is not None and mse > th
        if th is None or not flagged:
            sev = "none"
        else:
            sev = _mse_severity(mse, th)
        row: dict[str, Any] = {
            "mmsi": mmsi,
            "mse": float(mse),
            "flagged": flagged,
            "severity": sev,
        }
        if th is not None and th > 0:
            row["ratio_to_threshold"] = float(mse / th)
        vessels_out.append(row)

    return {
        "threshold": float(th) if th is not None else None,
        "scored_count": len(errs),
        "inference_active": inference_on,
        "vessels": vessels_out,
    }


@app.get("/api/alerts")
def api_alerts() -> list[dict[str, Any]]:
    _require_ready()
    assert state.df is not None
    if state.threshold is None:
        return []

    flagged = [(mmsi, err) for mmsi, err in state.errors_by_mmsi.items() if err > state.threshold]
    flagged.sort(key=lambda x: -x[1])

    alerts: list[dict[str, Any]] = []
    df = state.df
    assert state.threshold is not None
    th = state.threshold
    for mmsi, err in flagged:
        g = df[df["MMSI"] == mmsi].sort_values("BaseDateTime").iloc[-1]
        severity = _mse_severity(err, th)

        alerts.append(
            {
                "id": f"alert-{mmsi}",
                "mmsi": mmsi,
                "timestamp": g["BaseDateTime"].isoformat(),
                "error": err,
                "severity": severity,
                "status": "new",
                "location": {"latitude": float(g["LAT"]), "longitude": float(g["LON"])},
            }
        )
    return alerts


def _ranked_mmsis(limit: int) -> list[int]:
    assert state.df is not None
    sizes = state.df.groupby("MMSI", sort=False).size().sort_values(ascending=False)
    return list(sizes.head(max(1, min(limit, 500))).index)


@app.get("/api/trajectories")
def api_trajectories(limit: int = 50) -> list[dict[str, Any]]:
    _require_ready()
    assert state.df is not None
    out: list[dict[str, Any]] = []
    for mmsi in _ranked_mmsis(limit):
        pts, err = state.vessel_snippet(mmsi)
        if len(pts) < 2:
            continue
        anomaly = bool(state.threshold is not None and err is not None and err > state.threshold)
        traj: dict[str, Any] = {
            "mmsi": mmsi,
            "positions": pts,
            "status": "anomaly" if anomaly else "normal",
        }
        if err is not None:
            traj["error"] = err
        out.append(traj)
    return out


@app.get("/api/maps/traffic-density")
def api_traffic_density(limit: int = 8000) -> list[list[float]]:
    _require_ready()
    assert state.df is not None
    n = min(limit, len(state.df))
    sample = state.df.sample(n=n, random_state=42)
    out: list[list[float]] = []
    for row in sample.itertuples(index=False):
        intensity = float(min(1.0, max(0.0, row.SOG / 35.0)))
        out.append([float(row.LAT), float(row.LON), intensity])
    return out


@app.get("/api/maps/anomaly-pair")
def api_anomaly_pair() -> dict[str, Any]:
    _require_ready()
    assert state.df is not None
    if state.threshold is None or not state.errors_by_mmsi:
        trajs = api_trajectories(limit=10)
        if len(trajs) < 2:
            raise HTTPException(
                status_code=503,
                detail="Need model + scaler + AIS CSV to compute anomaly comparison pairs.",
            )
        normal_t = next((t for t in trajs if t.get("status") == "normal"), trajs[0])
        anom_t = next((t for t in trajs if t.get("status") == "anomaly"), trajs[-1])
        return {"normalTrajectory": normal_t, "anomalousTrajectory": anom_t}

    below = [(m, e) for m, e in state.errors_by_mmsi.items() if e <= state.threshold]
    above = [(m, e) for m, e in state.errors_by_mmsi.items() if e > state.threshold]
    if not below or not above:
        errs = sorted(state.errors_by_mmsi.items(), key=lambda x: x[1])
        min_mmsi, _ = errs[0]
        max_mmsi, _ = errs[-1]
    else:
        min_mmsi = min(below, key=lambda x: x[1])[0]
        max_mmsi = max(above, key=lambda x: x[1])[0]
    pts_n, err_n = state.vessel_snippet(min_mmsi)
    pts_a, err_a = state.vessel_snippet(max_mmsi)
    normal_trajectory = {
        "mmsi": min_mmsi,
        "positions": pts_n,
        "status": "normal",
        **({"error": err_n} if err_n is not None else {}),
    }
    anomalous_trajectory = {
        "mmsi": max_mmsi,
        "positions": pts_a,
        "status": "anomaly",
        **({"error": err_a} if err_a is not None else {}),
    }
    return {"normalTrajectory": normal_trajectory, "anomalousTrajectory": anomalous_trajectory}


@app.get("/api/analytics/speed-distribution")
def api_speed_distribution() -> list[dict[str, Any]]:
    _require_ready()
    assert state.df is not None
    df = state.df
    bucket = (np.clip(df["SOG"].values, 0, 50) / 2).astype(int) * 2
    counts = pd.Series(bucket).value_counts().sort_index()
    bins = range(0, 52, 2)
    return [{"speed": s, "count": int(counts.get(s, 0))} for s in bins]


@app.get("/api/analytics/course-distribution")
def api_course_distribution() -> list[dict[str, Any]]:
    _require_ready()
    assert state.df is not None
    cog = pd.to_numeric(state.df["COG"], errors="coerce").dropna().values
    cog = cog % 360
    bins = np.floor(cog / 15.0) * 15.0
    counts = pd.Series(bins).astype(int).value_counts()
    return [{"course": c, "count": int(counts.get(c, 0))} for c in range(0, 360, 15)]


@app.get("/api/analytics/vessel-types")
def api_vessel_types() -> list[dict[str, Any]]:
    _require_ready()
    assert state.df is not None
    vc = state.df.groupby("VesselType", observed=False).size()
    total = int(vc.sum()) or 1
    rows: list[dict[str, Any]] = []
    for vtype, count in vc.sort_values(ascending=False).items():
        try:
            t = int(vtype)
        except (TypeError, ValueError):
            t = 0
        rows.append(
            {
                "type": t,
                "typeName": VESSEL_TYPE_NAMES.get(t, f"Type {t}"),
                "count": int(count),
                "percentage": round(100.0 * float(count) / total, 4),
            }
        )
    return rows


@app.get("/api/analytics/timeline")
def api_timeline() -> list[dict[str, Any]]:
    _require_ready()
    assert state.df is not None
    df = state.df.copy()
    df["_day"] = df["BaseDateTime"].dt.normalize()
    flagged_mmsi = {
        m
        for m, e in state.errors_by_mmsi.items()
        if state.threshold is not None and e > state.threshold
    }
    df["_flagged"] = df["MMSI"].isin(flagged_mmsi)

    totals = df.groupby("_day", sort=True).agg(total=("MMSI", "count"), anomaly=("_flagged", "sum"))
    totals["normal"] = totals["total"] - totals["anomaly"]
    out: list[dict[str, Any]] = []
    for day_idx, row in totals.iterrows():
        d = pd.Timestamp(day_idx).date().isoformat()
        out.append(
            {
                "date": d,
                "normal": int(row["normal"]),
                "anomaly": int(row["anomaly"]),
                "total": int(row["total"]),
            }
        )
    return out
