"""
Check that anomaly inference artifacts exist, load cleanly, and the LSTM forward pass runs.

Run from repository root:

    python scripts/verify_model.py
"""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import torch
import joblib  # noqa: E402 — after sys.path

from backend.maritime_state import load_lstm_from_checkpoint  # noqa: E402


def main() -> int:
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    mp = ROOT / "model_saved" / "ais_lstm_autoencoder.pth"
    sp = ROOT / "model_saved" / "scaler.pkl"
    failures = []
    if not mp.is_file():
        failures.append(f"Missing weights: {mp}")
    if not sp.is_file():
        failures.append(f"Missing scaler: {sp}")
    if failures:
        print("Issues:\n  " + "\n  ".join(failures))
        print("\nAfter training (Notebook/Maritime.ipynb Part 3):")
        print("  torch.save(model.state_dict(), 'model_saved/ais_lstm_autoencoder.pth')")
        print("  joblib.dump(scaler, 'model_saved/scaler.pkl')")
        print("Restart the API: python -m backend")
        return 1

    try:
        obj = joblib.load(sp)
        if not hasattr(obj, "transform"):
            print("[X] scaler.pkl must be a fitted sklearn scaler (e.g. MinMaxScaler)")
            return 1
    except Exception as e:
        print(f"[X] Could not load scaler.pkl: {e}")
        return 1

    try:
        net = load_lstm_from_checkpoint(mp, device)
    except Exception as e:
        print(f"[X] Could not load LSTM weights: {e}")
        return 1

    seq = int(getattr(net, "seq_len", 30))
    with torch.no_grad():
        probe = torch.rand(8, seq, int(getattr(net, "n_features", 4)), device=device)
        out = net(probe)
        if out.shape != probe.shape:
            print(f"[X] Bad output shape {out.shape} expected {probe.shape}")
            return 1

    print(f"[OK] LSTM + scaler verified on device={device}")
    print(f"     seq_len={seq}, batch probe loss sanity: {torch.nn.functional.mse_loss(out, probe).item():.6f}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
