"""Load AIS CSV, optional model artifacts, and build API-ready caches."""

from __future__ import annotations

import json
import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
import torch
from sklearn.preprocessing import MinMaxScaler

from backend.model_torch import LSTMAutoencoder

FEATURE_COLS = ["LAT", "LON", "SOG", "COG"]
SEQ_LEN = 30
STRIDE_TRAIN = 5
BATCH = 512

VESSEL_TYPE_NAMES: dict[int, str] = {
    30: "Fishing",
    52: "Tug",
    60: "Passenger",
    70: "Cargo",
    79: "Cargo",
    80: "Tanker",
    89: "Tanker",
    36: "Pleasure Craft",
    37: "Pleasure Craft",
}


def _project_root() -> Path:
    return Path(__file__).resolve().parent.parent


def _csv_candidates_in_dir(data_dir: Path) -> list[Path]:
    return sorted((p for p in data_dir.glob("*.csv") if p.is_file()), key=lambda p: p.stat().st_size, reverse=True)


def _resolve_data_csv(configured: Path) -> Path | None:
    """Prefer the configured file; otherwise any .csv in its parent (or in `configured` if it is a directory)."""
    if configured.is_file():
        return configured
    if configured.is_dir():
        cand = _csv_candidates_in_dir(configured)
        return cand[0] if cand else None
    data_dir = configured.parent
    if not data_dir.is_dir():
        return None
    cand = _csv_candidates_in_dir(data_dir)
    if not cand:
        return None
    want = configured.name.lower()
    for c in cand:
        if c.name.lower() == want:
            return c
    return cand[0]


def _read_json(path: Path) -> dict[str, Any]:
    if not path.is_file():
        return {}
    with path.open(encoding="utf-8") as f:
        return json.load(f)


def count_training_sequences(df: pd.DataFrame, seq_len: int = SEQ_LEN, stride: int = STRIDE_TRAIN) -> int:
    total = 0
    for _, g in df.groupby("MMSI", sort=False):
        n = len(g)
        if n < seq_len:
            continue
        total += len(range(0, n - seq_len, stride))
    return total


def _mse_per_sequence(model: torch.nn.Module, batch: torch.Tensor) -> np.ndarray:
    with torch.no_grad():
        recon = model(batch)
        return ((batch - recon) ** 2).mean(dim=(1, 2)).cpu().numpy()


def load_lstm_from_checkpoint(model_path: Path, device: torch.device) -> LSTMAutoencoder:
    """Load `ais_lstm_autoencoder.pth` (state_dict or wrapped dict) into `LSTMAutoencoder`."""
    ckpt = torch.load(model_path, map_location=device)
    seq_len = SEQ_LEN
    n_features = 4
    emb = 128
    if not isinstance(ckpt, dict):
        raise ValueError("Expected a state_dict map in .pth file")

    if any(str(k).startswith("encoder_lstm") for k in ckpt):
        sd = ckpt
    else:
        inner = ckpt.get("state_dict") or ckpt.get("model_state_dict")
        if not isinstance(inner, dict) or not any(str(k).startswith("encoder_lstm") for k in inner):
            raise ValueError("Checkpoint must contain encoder_lstm weights")
        sd = inner
        seq_len = int(ckpt.get("seq_len", SEQ_LEN))
        n_features = int(ckpt.get("n_features", 4))
        emb = int(ckpt.get("embedding_dim", 128))

    net = LSTMAutoencoder(seq_len=seq_len, n_features=n_features, embedding_dim=emb).to(device)
    net.load_state_dict(sd, strict=True)
    return net.eval()


def compute_last_window_errors(
    df: pd.DataFrame,
    scaler: MinMaxScaler,
    model: torch.nn.Module,
    device: torch.device,
) -> dict[int, float]:
    """One reconstruction error per vessel (last 30 pings)."""
    errors: dict[int, float] = {}
    batch_x: list[np.ndarray] = []
    batch_mmsi: list[int] = []

    def flush() -> None:
        nonlocal batch_x, batch_mmsi
        if not batch_x:
            return
        x = torch.tensor(np.stack(batch_x), dtype=torch.float32, device=device)
        for mmsi, err in zip(batch_mmsi, _mse_per_sequence(model, x)):
            errors[mmsi] = float(err)
        batch_x = []
        batch_mmsi = []

    for mmsi, g in df.groupby("MMSI", sort=False):
        g = g.sort_values("BaseDateTime")
        raw = g[FEATURE_COLS].values.astype(np.float64)
        if len(raw) < SEQ_LEN:
            continue
        scaled = scaler.transform(raw).astype(np.float32)
        win = scaled[-SEQ_LEN:]
        batch_x.append(win)
        batch_mmsi.append(int(mmsi))
        if len(batch_x) >= BATCH:
            flush()
    flush()
    return errors


@dataclass
class MaritimeState:
    ready: bool = False
    message: str = ""
    csv_path: Path = field(default_factory=lambda: _project_root() / "data" / "FYP_Training_Data_NY_Dec2024.csv")
    """Path from config/env; file may or may not exist."""
    active_csv_path: Path | None = None
    """Actual file read (after resolving any .csv in data/)."""
    model_path: Path = field(default_factory=lambda: _project_root() / "model_saved" / "ais_lstm_autoencoder.pth")
    scaler_path: Path = field(default_factory=lambda: _project_root() / "model_saved" / "scaler.pkl")
    threshold_path: Path = field(default_factory=lambda: _project_root() / "model_saved" / "threshold.json")
    metrics_path: Path = field(default_factory=lambda: _project_root() / "model_saved" / "evaluation_metrics.json")

    df: pd.DataFrame | None = None
    device: torch.device = field(default_factory=lambda: torch.device("cpu"))
    model: LSTMAutoencoder | None = None
    scaler: MinMaxScaler | None = None
    threshold: float | None = None
    errors_by_mmsi: dict[int, float] = field(default_factory=dict)
    evaluation_metrics: dict[str, float] = field(default_factory=dict)

    def reload_from_env(self) -> None:
        root = _project_root()
        if p := os.environ.get("AIS_DATA_PATH"):
            self.csv_path = Path(p)
        if p := os.environ.get("AIS_MODEL_PATH"):
            self.model_path = Path(p)
        if p := os.environ.get("AIS_SCALER_PATH"):
            self.scaler_path = Path(p)
        if p := os.environ.get("AIS_THRESHOLD_PATH"):
            self.threshold_path = Path(p)
        if p := os.environ.get("AIS_EVAL_METRICS_PATH"):
            self.metrics_path = Path(p)

    def load(self) -> None:
        self.reload_from_env()
        self.ready = False
        self.df = None
        self.active_csv_path = None
        self.model = None
        self.scaler = None
        self.threshold = None
        self.errors_by_mmsi = {}
        self.evaluation_metrics = {}

        resolved = _resolve_data_csv(self.csv_path)
        if resolved is None:
            hint_dir = self.csv_path if self.csv_path.is_dir() else self.csv_path.parent
            names = ", ".join(p.name for p in sorted(hint_dir.glob("*.csv"))) if hint_dir.is_dir() else ""
            self.message = (
                f"No AIS CSV found. Config path: {self.csv_path}. "
                f"Put a .csv with columns MMSI, BaseDateTime, LAT, LON, SOG, COG, VesselType under {hint_dir}. "
                f"{'Files seen: ' + names if names else 'No .csv files found there.'}"
            )
            return

        self.active_csv_path = resolved

        try:
            df = pd.read_csv(
                resolved,
                usecols=["MMSI", "BaseDateTime", *FEATURE_COLS, "VesselType"],
            )
        except ValueError:
            df = pd.read_csv(resolved)
            for c in ["MMSI", "BaseDateTime", *FEATURE_COLS, "VesselType"]:
                if c not in df.columns:
                    self.message = f"CSV missing required column: {c}"
                    return

        df["BaseDateTime"] = pd.to_datetime(df["BaseDateTime"], errors="coerce")
        df = df.dropna(subset=["BaseDateTime", "MMSI", *FEATURE_COLS])
        df["VesselType"] = pd.to_numeric(df["VesselType"], errors="coerce").fillna(0).astype("int64")
        df = df.sort_values(["MMSI", "BaseDateTime"]).reset_index(drop=True)

        self.df = df
        self.evaluation_metrics = _read_json(self.metrics_path)

        model_loaded = False
        model_warning: str | None = None
        if self.model_path.is_file() and self.scaler_path.is_file():
            try:
                self.scaler = joblib.load(self.scaler_path)
                self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
                self.model = load_lstm_from_checkpoint(self.model_path, self.device)
                model_loaded = True
            except Exception as e:  # noqa: BLE001
                model_warning = f"Model load failed ({e}). AIS analytics work; anomalies require a matching model + scaler."
                self.scaler = None
                self.model = None

        if model_loaded and self.df is not None and self.scaler is not None and self.model is not None:
            self.errors_by_mmsi = compute_last_window_errors(self.df, self.scaler, self.model, self.device)
            thresh_data = _read_json(self.threshold_path)
            if isinstance(thresh_data, dict) and "mse_threshold" in thresh_data:
                self.threshold = float(thresh_data["mse_threshold"])
            elif self.errors_by_mmsi:
                self.threshold = float(np.percentile(list(self.errors_by_mmsi.values()), 95))

        self.ready = True

        # User-facing readiness: distinguish CSV-only vs full anomaly pipeline
        if model_warning:
            self.message = model_warning
        elif self.df is not None and self.model is None:
            missing: list[str] = []
            if not self.model_path.is_file():
                missing.append(self.model_path.name)
            if not self.scaler_path.is_file():
                missing.append(self.scaler_path.name)
            if missing:
                self.message = (
                    f"OK — AIS data served; anomaly model inactive (missing {', '.join(missing)} under model_saved/). "
                    "See model_saved/README.md or run: python scripts/verify_model.py"
                )
            else:
                self.message = "OK"
        else:
            self.message = "OK"

    # --- serialization helpers -------------------------------------------------

    def is_anomaly(self, mmsi: int) -> bool:
        if self.threshold is None or mmsi not in self.errors_by_mmsi:
            return False
        return self.errors_by_mmsi[mmsi] > self.threshold

    def statistics(self) -> dict[str, Any]:
        df = self.df
        assert df is not None
        mmsi_n = df["MMSI"].nunique()
        max_t = df["BaseDateTime"].max()
        active = df[df["BaseDateTime"] >= (max_t - pd.Timedelta(hours=24))]["MMSI"].nunique()

        anomalies = 0
        if self.threshold is not None:
            anomalies = sum(1 for m, e in self.errors_by_mmsi.items() if e > self.threshold)

        metrics = self.evaluation_metrics or {
            "accuracy": 0.0,
            "precision": 0.0,
            "recall": 0.0,
            "f1Score": 0.0,
        }

        seq_count = count_training_sequences(df)

        return {
            "totalVessels": int(mmsi_n),
            "activeVessels": int(active),
            "anomaliesDetected": int(anomalies),
            "accuracy": float(metrics.get("accuracy", 0.0)),
            "precision": float(metrics.get("precision", 0.0)),
            "recall": float(metrics.get("recall", 0.0)),
            "f1Score": float(metrics.get("f1Score", metrics.get("f1_score", 0.0))),
            "totalRecords": int(len(df)),
            "trainingSequences": int(seq_count),
        }

    def vessel_snippet(self, mmsi: int) -> tuple[list[dict[str, Any]], float | None]:
        """Last SEQ_LEN positions for trajectory; error if model ran."""
        assert self.df is not None
        g = self.df[self.df["MMSI"] == mmsi].sort_values("BaseDateTime").iloc[-SEQ_LEN:]
        err = self.errors_by_mmsi.get(mmsi)
        pts = [
            {
                "latitude": float(row["LAT"]),
                "longitude": float(row["LON"]),
                "timestamp": row["BaseDateTime"].isoformat(),
            }
            for _, row in g.iterrows()
        ]
        return pts, err


state = MaritimeState()
