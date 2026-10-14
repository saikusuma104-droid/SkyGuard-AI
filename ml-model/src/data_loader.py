from pathlib import Path
import pandas as pd
import numpy as np


def find_column(df, possible_names):

    lower_map = {
        str(col).strip().lower(): col
        for col in df.columns
    }

    for name in possible_names:
        if name.lower() in lower_map:
            return lower_map[name.lower()]

    return None


def load_psv_file(file_path):

    print(f"Loading: {file_path.name}")

    try:
        df = pd.read_csv(
            file_path,
            sep="|",
            low_memory=False
        )
    except Exception as e:
        print(f"Could not read {file_path}: {e}")
        return None

    # Normalize column names
    df.columns = [
        str(c).strip().lower()
        for c in df.columns
    ]

    return df


def identify_columns(df):

    temperature = find_column(
        df,
        [
            "dry bulb temperature",
            "temperature",
            "air_temperature",
            "temp"
        ]
    )

    pressure = find_column(
        df,
        [
            "station_level_pressure",
            "station level pressure",
            "sea_level_pressure",
            "sea level pressure",
            "pressure"
        ]
    )

    humidity = find_column(
        df,
        [
            "relative_humidity",
            "relative humidity",
            "humidity"
        ]
    )

    return temperature, pressure, humidity


def load_all_stations(raw_dir):

    files = sorted(Path(raw_dir).glob("*.psv"))

    if not files:
        raise FileNotFoundError(
            f"No PSV files found in {raw_dir}"
        )

    all_data = []

    for index, file_path in enumerate(files, start=1):

        df = load_psv_file(file_path)

        if df is None:
            continue

        temp_col, pressure_col, humidity_col = identify_columns(df)

        print(
            f"Temperature: {temp_col} | "
            f"Pressure: {pressure_col} | "
            f"Humidity: {humidity_col}"
        )

        if not temp_col or not pressure_col or not humidity_col:
            print(
                f"Skipping {file_path.name}: "
                "required columns not found"
            )
            continue

        station_id = f"station_{index:02d}"

        result = pd.DataFrame()

        result["station_id"] = station_id

        result["temperature"] = pd.to_numeric(
            df[temp_col],
            errors="coerce"
        )

        result["pressure"] = pd.to_numeric(
            df[pressure_col],
            errors="coerce"
        )

        result["humidity"] = pd.to_numeric(
            df[humidity_col],
            errors="coerce"
        )

        # Try to find date/time
        date_col = find_column(
            df,
            [
                "date",
                "datetime",
                "timestamp",
                "time"
            ]
        )

        if date_col:

            result["timestamp"] = pd.to_datetime(
                df[date_col],
                errors="coerce"
            )

        else:

            result["timestamp"] = pd.NaT

        all_data.append(result)

    if not all_data:
        raise RuntimeError(
            "No usable station data found."
        )

    combined = pd.concat(
        all_data,
        ignore_index=True
    )

    return combined
