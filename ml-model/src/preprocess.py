"""
SkyGuard AI - Dataset Preprocessing

Input:
    dataset/raw/*.psv

Output:
    dataset/processed/skyguard_training.csv

Uses only:
    - Temperature
    - Atmospheric Pressure
    - Relative Humidity

Also adds:
    - station_id
    - station_name
    - latitude
    - longitude
    - elevation
    - timestamp
"""

from pathlib import Path
import sys
import pandas as pd
import numpy as np

# ---------------------------------------------------------
# PROJECT PATHS
# ---------------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[2]

RAW_DIR = PROJECT_ROOT / "dataset" / "raw"
PROCESSED_DIR = PROJECT_ROOT / "dataset" / "processed"

OUTPUT_FILE = PROCESSED_DIR / "skyguard_training.csv"

# ---------------------------------------------------------
# STATION METADATA
# ---------------------------------------------------------

STATIONS = {
    "station_01": {
        "name": "Tuni",
        "latitude": 17.3591,
        "longitude": 82.5461,
        "elevation": 16
    },

    "station_02": {
        "name": "Thiruvananthapuram",
        "latitude": 8.5241,
        "longitude": 76.9366,
        "elevation": 10
    },

    "station_03": {
        "name": "Tirupati",
        "latitude": 13.6288,
        "longitude": 79.4192,
        "elevation": 152
    },

    "station_04": {
        "name": "Nalgonda",
        "latitude": 17.0575,
        "longitude": 79.2684,
        "elevation": 226
    },

    "station_05": {
        "name": "Coonoor",
        "latitude": 11.3530,
        "longitude": 76.7959,
        "elevation": 1850
    },

    "station_06": {
        "name": "Kurnool",
        "latitude": 15.8281,
        "longitude": 78.0373,
        "elevation": 274
    },

    "station_07": {
        "name": "Bhadrachalam",
        "latitude": 17.6688,
        "longitude": 80.8936,
        "elevation": 55
    }
}


# ---------------------------------------------------------
# COLUMN DETECTION
# ---------------------------------------------------------

def normalize_column_name(column):
    """
    Converts column names into a comparable format.
    """

    return (
        str(column)
        .strip()
        .lower()
        .replace(" ", "")
        .replace("_", "")
        .replace("-", "")
    )


def find_column(columns, possible_names):
    """
    Find a column using several possible names.
    """

    normalized = {
        normalize_column_name(col): col
        for col in columns
    }

    for name in possible_names:

        key = normalize_column_name(name)

        if key in normalized:
            return normalized[key]

    return None


# ---------------------------------------------------------
# FIND REQUIRED COLUMNS
# ---------------------------------------------------------

def identify_columns(df):

    columns = list(df.columns)

    # Timestamp
    timestamp_col = find_column(
        columns,
        [
            "datetime",
            "date_time",
            "timestamp",
            "date",
            "time",
            "dateTime"
        ]
    )

    # Temperature
    temperature_col = find_column(
        columns,
        [
            "temperature",
            "air_temperature",
            "temp",
            "temperature_c",
            "airtemp"
        ]
    )

    # Relative humidity
    humidity_col = find_column(
        columns,
        [
            "relative_humidity",
            "relativehumidity",
            "humidity",
            "rh"
        ]
    )

    # Atmospheric pressure
    pressure_col = find_column(
        columns,
        [
            "station_level_pressure",
            "stationlevelpressure",
            "atmospheric_pressure",
            "atmosphericpressure",
            "air_pressure",
            "airpressure",
            "pressure",
            "sea_level_pressure",
            "sealevelpressure"
        ]
    )

    return {
        "timestamp": timestamp_col,
        "temperature": temperature_col,
        "humidity": humidity_col,
        "pressure": pressure_col
    }


# ---------------------------------------------------------
# STATION IDENTIFICATION
# ---------------------------------------------------------

def identify_station(file_path, file_index):

    filename = file_path.name.lower()

    station_keywords = {
        "tuni": "station_01",
        "thiruvananthapuram": "station_02",
        "tirupati": "station_03",
        "nalgonda": "station_04",
        "coonoor": "station_05",
        "kurnool": "station_06",
        "bhadra": "station_07",
        "bhadrachalam": "station_07"
    }

    for keyword, station_id in station_keywords.items():

        if keyword in filename:
            return station_id

    # Fallback:
    # Assign based on file order ONLY if filenames don't contain names.
    station_ids = list(STATIONS.keys())

    if file_index < len(station_ids):
        return station_ids[file_index]

    return None


# ---------------------------------------------------------
# READ PSV
# ---------------------------------------------------------

def read_psv(file_path):

    print(f"\nReading: {file_path.name}")

    try:

        df = pd.read_csv(
            file_path,
            sep="|",
            low_memory=False
        )

    except Exception as error:

        print(f"ERROR reading {file_path.name}: {error}")

        return None

    if df.empty:

        print("WARNING: File is empty.")

        return None

    print(f"Rows: {len(df):,}")
    print(f"Columns: {len(df.columns)}")

    mapping = identify_columns(df)

    print("\nDetected columns:")

    for key, value in mapping.items():

        print(f"  {key:12} -> {value}")

    missing = [
        key
        for key, value in mapping.items()
        if value is None
    ]

    if missing:

        print("\nWARNING: Required columns not found:")
        print(missing)

        print("\nAvailable columns:")
        print(list(df.columns))

        return None

    # -----------------------------------------------------
    # SELECT ONLY REQUIRED DATA
    # -----------------------------------------------------

    result = pd.DataFrame()

    result["timestamp"] = df[mapping["timestamp"]]

    result["temperature"] = df[mapping["temperature"]]

    result["pressure"] = df[mapping["pressure"]]

    result["humidity"] = df[mapping["humidity"]]

    return result


# ---------------------------------------------------------
# CLEAN VALUES
# ---------------------------------------------------------

def clean_data(df):

    print("\nCleaning data...")

    # Convert numeric columns
    numeric_columns = [
        "temperature",
        "pressure",
        "humidity"
    ]

    for column in numeric_columns:

        df[column] = pd.to_numeric(
            df[column],
            errors="coerce"
        )

    # Convert timestamp
    df["timestamp"] = pd.to_datetime(
        df["timestamp"],
        errors="coerce",
        utc=True
    )

    # Replace obvious missing representations
    df.replace(
        [
            "",
            "NA",
            "NaN",
            "nan",
            "null",
            "NULL"
        ],
        np.nan,
        inplace=True
    )

    # Remove invalid timestamps
    df = df.dropna(
        subset=["timestamp"]
    )

    # -----------------------------------------------------
    # PHYSICAL SANITY FILTER
    # -----------------------------------------------------
    #
    # These are deliberately broad limits.
    # We DO NOT use them as the ML anomaly detector.
    #
    # Their purpose is only to remove impossible/corrupt
    # values before training.
    # -----------------------------------------------------

    df.loc[
        (df["temperature"] < -90) |
        (df["temperature"] > 65),
        "temperature"
    ] = np.nan

    df.loc[
        (df["pressure"] < 800) |
        (df["pressure"] > 1100),
        "pressure"
    ] = np.nan

    df.loc[
        (df["humidity"] < 0) |
        (df["humidity"] > 100),
        "humidity"
    ] = np.nan

    # Remove rows where all three weather parameters
    # are missing.

    df = df.dropna(
        subset=[
            "temperature",
            "pressure",
            "humidity"
        ],
        how="all"
    )

    # Sort chronologically
    df = df.sort_values("timestamp")

    # Remove exact duplicates
    df = df.drop_duplicates()

    return df


# ---------------------------------------------------------
# ADD STATION INFORMATION
# ---------------------------------------------------------

def add_station_metadata(
    df,
    station_id
):

    metadata = STATIONS[station_id]

    df["station_id"] = station_id

    df["station_name"] = metadata["name"]

    df["latitude"] = metadata["latitude"]

    df["longitude"] = metadata["longitude"]

    df["elevation"] = metadata["elevation"]

    return df


# ---------------------------------------------------------
# MAIN PROCESS
# ---------------------------------------------------------

def main():

    print("=" * 70)
    print("SKYGUARD AI - DATASET PREPROCESSING")
    print("=" * 70)

    if not RAW_DIR.exists():

        print(f"\nERROR: Raw dataset folder not found:")
        print(RAW_DIR)

        sys.exit(1)

    files = sorted(
        RAW_DIR.glob("*.psv")
    )

    if not files:

        print("\nERROR: No .psv files found.")

        print(f"Expected location:")
        print(RAW_DIR)

        sys.exit(1)

    print(f"\nRaw directory:")
    print(RAW_DIR)

    print(f"\nPSV files found: {len(files)}")

    if len(files) != 7:

        print(
            f"\nWARNING: Expected 7 station files, "
            f"but found {len(files)}."
        )

    all_data = []

    # -----------------------------------------------------
    # PROCESS EACH FILE
    # -----------------------------------------------------

    for index, file_path in enumerate(files):

        station_id = identify_station(
            file_path,
            index
        )

        if station_id is None:

            print(
                f"\nWARNING: Could not identify station "
                f"for {file_path.name}"
            )

            continue

        print("\n" + "-" * 70)

        print(
            f"Station: "
            f"{STATIONS[station_id]['name']}"
        )

        data = read_psv(file_path)

        if data is None:
            continue

        data = clean_data(data)

        data = add_station_metadata(
            data,
            station_id
        )

        print(
            f"Clean rows: {len(data):,}"
        )

        all_data.append(data)

    # -----------------------------------------------------
    # COMBINE
    # -----------------------------------------------------

    if not all_data:

        print(
            "\nERROR: No usable data was produced."
        )

        sys.exit(1)

    combined = pd.concat(
        all_data,
        ignore_index=True
    )

    # Sort by station and time
    combined = combined.sort_values(
        [
            "station_id",
            "timestamp"
        ]
    )

    # -----------------------------------------------------
    # FINAL COLUMN ORDER
    # -----------------------------------------------------

    columns = [
        "timestamp",
        "station_id",
        "station_name",
        "latitude",
        "longitude",
        "elevation",
        "temperature",
        "pressure",
        "humidity"
    ]

    combined = combined[columns]

    # -----------------------------------------------------
    # SAVE
    # -----------------------------------------------------

    PROCESSED_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    combined.to_csv(
        OUTPUT_FILE,
        index=False
    )

    # -----------------------------------------------------
    # SUMMARY
    # -----------------------------------------------------

    print("\n")
    print("=" * 70)
    print("PREPROCESSING COMPLETE")
    print("=" * 70)

    print(
        f"\nOutput:"
    )

    print(OUTPUT_FILE)

    print(
        f"\nTotal rows: "
        f"{len(combined):,}"
    )

    print(
        f"Total stations: "
        f"{combined['station_id'].nunique()}"
    )

    print(
        f"\nDate range:"
    )

    print(
        f"{combined['timestamp'].min()}"
        f" → "
        f"{combined['timestamp'].max()}"
    )

    print("\nStation distribution:")

    print(
        combined[
            "station_name"
        ].value_counts()
    )

    print("\nMissing values:")

    print(
        combined[
            [
                "temperature",
                "pressure",
                "humidity"
            ]
        ].isna().sum()
    )

    print("\nFinal columns:")

    for column in combined.columns:

        print(f"  - {column}")

    print("\n" + "=" * 70)
    print("READY FOR FEATURE ENGINEERING")
    print("=" * 70)


if __name__ == "__main__":
    main()
