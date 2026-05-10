import zipfile
from pathlib import Path

import pandas as pd
import requests
from tqdm import tqdm

# CONFIGURATIO
YEAR = "2024"
MONTH = "12"
DAYS = [f"{i:02d}" for i in range(1, 32)]
BASE_URL = f"https://coast.noaa.gov/htdata/CMSP/AISDataHandler/{YEAR}/"

# New York Harbor Coordinates
LAT_MIN, LAT_MAX = 40.50, 40.75
LON_MIN, LON_MAX = -74.20, -73.90

ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = ROOT / "raw_data"
OUTPUT_FILE = ROOT / "data" / "FYP_Training_Data_NY_Dec2024.csv"

RAW_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

processed_data = []

print(f"Starting download and processing for {len(DAYS)} days of December...")

# Loop over days with progress bar
for day in tqdm(DAYS, desc="Processing Days"):
    filename = f"AIS_{YEAR}_{MONTH}_{day}"
    zip_filename = f"{filename}.zip"
    csv_filename = f"{filename}.csv"
    url = f"{BASE_URL}{zip_filename}"

    # DOWNLOAD
    try:
        response = requests.get(url, stream=True)
        if response.status_code != 200:
            continue

        zip_path = RAW_DIR / zip_filename
        with open(zip_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)

    except Exception as e:
        print(f"Download failed for {zip_filename}: {e}")
        continue

    # UNZIP
    try:
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(RAW_DIR)
    except Exception as e:
        print(f"Unzip failed for {zip_filename}: {e}")
        continue

    # FILTER & PROCESS
    csv_path = RAW_DIR / csv_filename

    if csv_path.is_file():
        try:
            df = pd.read_csv(
                csv_path.as_posix(),
                usecols=['MMSI', 'BaseDateTime', 'LAT', 'LON', 'SOG', 'COG', 'VesselType']
            )

            ny_chunk = df[
                (df['LAT'] >= LAT_MIN) & (df['LAT'] <= LAT_MAX) &
                (df['LON'] >= LON_MIN) & (df['LON'] <= LON_MAX)
            ]

            if not ny_chunk.empty:
                processed_data.append(ny_chunk)

            # CLEANUP
            csv_path.unlink()
            zip_path.unlink()

        except Exception as e:
            print(f"CSV processing failed for {csv_filename}: {e}")

# MERGE & SAVE
if processed_data:
    print("Merging and saving final dataset...")
    final_df = pd.concat(processed_data, ignore_index=True)
    final_df.to_csv(OUTPUT_FILE.as_posix(), index=False)
    print(f"Saved {len(final_df)} rows to '{OUTPUT_FILE}'")
else:
    print("No data found for the specified region.")
