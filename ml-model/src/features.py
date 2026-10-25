"""
SkyGuard AI - Feature Engineering

Input:
    dataset/processed/skyguard_training.csv

Output:
    dataset/processed/skyguard_features.csv

Creates:
    - temporal features
    - seasonal features
    - location/elevation features
    - rate-of-change features
    - rolling statistics
    - deviation features
"""

from pathlib import Path
import pandas as pd
import numpy as np


# ---------------------------------------------------------
# PATHS
# ---------------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[2]

INPUT_FILE = (
    PROJECT_ROOT
    / "dataset"
    / "processed"
    / "skyguard_training.csv"
)

OUTPUT_FILE = (
    PROJECT_ROOT
    / "dataset"
    / "processed"
    / "skyguard_features.csv"
)


# ---------------------------------------------------------
# LOAD DATA
# ---------------------------------------------------------

print("=" * 70)
print("SKYGUARD AI - FEATURE ENGINEERING")
print("=" * 70)

print("\nLoading dataset...")

df = pd.read_csv(INPUT_FILE)

df["timestamp"] = pd.to_datetime(
    df["timestamp"],
    utc=True
)

df = df.sort_values(
    ["station_id", "timestamp"]
).reset_index(drop=True)

print(f"Rows loaded: {len(df):,}")


# ---------------------------------------------------------
# TEMPORAL FEATURES
# ---------------------------------------------------------

print("\nCreating temporal features...")

df["hour"] = df["timestamp"].dt.hour

df["day_of_week"] = df["timestamp"].dt.dayofweek

df["day_of_year"] = df["timestamp"].dt.dayofyear

df["month"] = df["timestamp"].dt.month

df["year"] = df["timestamp"].dt.year


# ---------------------------------------------------------
# CYCLIC TIME FEATURES
# ---------------------------------------------------------
#
# 23:00 and 00:00 should be close to each other.
# Normal numerical encoding does not represent that well.
#
# ---------------------------------------------------------

df["hour_sin"] = np.sin(
    2 * np.pi * df["hour"] / 24
)

df["hour_cos"] = np.cos(
    2 * np.pi * df["hour"] / 24
)

df["day_sin"] = np.sin(
    2 * np.pi * df["day_of_year"] / 365.25
)

df["day_cos"] = np.cos(
    2 * np.pi * df["day_of_year"] / 365.25
)


# ---------------------------------------------------------
# STATION-BASED FEATURES
# ---------------------------------------------------------

print("Using station metadata...")

# Keep these numeric physical characteristics.
df["latitude"] = pd.to_numeric(
    df["latitude"],
    errors="coerce"
)

df["longitude"] = pd.to_numeric(
    df["longitude"],
    errors="coerce"
)

df["elevation"] = pd.to_numeric(
    df["elevation"],
    errors="coerce"
)


# ---------------------------------------------------------
# WEATHER CHANGE FEATURES
# ---------------------------------------------------------
#
# Detect sudden spikes.
#
# Example:
#
# 30 → 31 → 30 → 58 → 31
#
# The absolute value 58 may not be enough by itself.
# The sudden change is also informative.
#
# ---------------------------------------------------------

print("Creating rate-of-change features...")

weather_columns = [
    "temperature",
    "pressure",
    "humidity"
]

for column in weather_columns:

    df[f"{column}_diff"] = (
        df.groupby("station_id")[column]
        .diff()
    )

    df[f"{column}_diff_abs"] = (
        df[f"{column}_diff"]
        .abs()
    )


# ---------------------------------------------------------
# ROLLING STATISTICS
# ---------------------------------------------------------
#
# We calculate statistics separately for each station.
#
# This prevents Coonoor's climate from being mixed directly
# with Tuni's climate.
#
# ---------------------------------------------------------

print("Creating rolling statistics...")

for column in weather_columns:

    grouped = df.groupby("station_id")[column]

    df[f"{column}_rolling_mean"] = (
        grouped
        .transform(
            lambda x:
            x.rolling(
                window=12,
                min_periods=3
            ).mean()
        )
    )

    df[f"{column}_rolling_std"] = (
        grouped
        .transform(
            lambda x:
            x.rolling(
                window=12,
                min_periods=3
            ).std()
        )
    )


# ---------------------------------------------------------
# DEVIATION FROM RECENT NORMAL
# ---------------------------------------------------------

print("Creating deviation features...")

for column in weather_columns:

    rolling_mean = df[
        f"{column}_rolling_mean"
    ]

    rolling_std = df[
        f"{column}_rolling_std"
    ]

    df[f"{column}_deviation"] = (
        df[column] - rolling_mean
    )

    # Avoid division by zero.
    safe_std = rolling_std.replace(
        0,
        np.nan
    )

    df[f"{column}_zscore"] = (
        (df[column] - rolling_mean)
        / safe_std
    )


# ---------------------------------------------------------
# MULTIVARIATE FEATURES
# ---------------------------------------------------------

print("Creating multivariate features...")

# Temperature / humidity relationship
df["temperature_humidity_interaction"] = (
    df["temperature"] *
    df["humidity"]
)

# Temperature / pressure relationship
df["temperature_pressure_interaction"] = (
    df["temperature"] *
    df["pressure"]
)

# Humidity / pressure relationship
df["humidity_pressure_interaction"] = (
    df["humidity"] *
    df["pressure"]
)


# ---------------------------------------------------------
# REMOVE EXTREME NUMERICAL VALUES
# ---------------------------------------------------------

df = df.replace(
    [np.inf, -np.inf],
    np.nan
)


# ---------------------------------------------------------
# SAVE
# ---------------------------------------------------------

OUTPUT_FILE.parent.mkdir(
    parents=True,
    exist_ok=True
)

df.to_csv(
    OUTPUT_FILE,
    index=False
)


# ---------------------------------------------------------
# SUMMARY
# ---------------------------------------------------------

print("\n" + "=" * 70)
print("FEATURE ENGINEERING COMPLETE")
print("=" * 70)

print(f"\nOutput:")
print(OUTPUT_FILE)

print(f"\nRows:")
print(f"{len(df):,}")

print(f"\nFeatures:")
print(f"{len(df.columns)}")

print("\nFeature list:")

for column in df.columns:
    print(f"  - {column}")

print("\n" + "=" * 70)
print("READY FOR MODEL TRAINING")
print("=" * 70)
