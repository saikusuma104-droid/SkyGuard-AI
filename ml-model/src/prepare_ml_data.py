import os
import numpy as np
import pandas as pd


# ============================================================
# SKYGUARD - PREPARE ML DATA
# ============================================================

print("=" * 60)
print("SKYGUARD ML DATA PREPARATION")
print("=" * 60)


# ============================================================
# PATHS
# ============================================================

SRC_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

ML_MODEL_DIR = os.path.dirname(SRC_DIR)

SKYGUARD_AI_DIR = os.path.dirname(
    ML_MODEL_DIR
)

SIH_DIR = os.path.dirname(
    SKYGUARD_AI_DIR
)

DATA_DIR = os.path.join(
    SIH_DIR,
    "SkyGuard-Data"
)

INPUT_FILE = os.path.join(
    DATA_DIR,
    "processed",
    "skyguard_weather.csv"
)

OUTPUT_DIR = os.path.join(
    DATA_DIR,
    "processed",
    "ml_ready"
)


os.makedirs(
    OUTPUT_DIR,
    exist_ok=True
)


# ============================================================
# FEATURES
# ============================================================

NUMERIC_FEATURES = [

    "temperature",

    "dew_point_temperature",

    "wind_speed",

    "relative_humidity",

    "visibility"
]


TIME_FEATURES = [

    "hour_sin",

    "hour_cos",

    "month_sin",

    "month_cos"
]


FINAL_FEATURES = [

    "temperature",

    "dew_point_temperature",

    "wind_direction_sin",

    "wind_direction_cos",

    "wind_speed",

    "relative_humidity",

    "visibility",

    "hour_sin",

    "hour_cos",

    "month_sin",

    "month_cos"
]


# ============================================================
# LOAD DATA
# ============================================================

print("\nLoading dataset...")

df = pd.read_csv(
    INPUT_FILE
)

print(
    "Loaded rows:",
    len(df)
)

print(
    "Stations:",
    df["station_id"].nunique()
)


# ============================================================
# TIMESTAMP
# ============================================================

df["timestamp"] = pd.to_datetime(
    df["timestamp"],
    errors="coerce"
)


df = df.dropna(
    subset=["timestamp"]
)


# ============================================================
# WIND DIRECTION
# ============================================================

print(
    "\nConverting wind direction..."
)


# Convert degrees to radians

wind_radians = np.deg2rad(
    df["wind_direction"]
)


df["wind_direction_sin"] = np.sin(
    wind_radians
)


df["wind_direction_cos"] = np.cos(
    wind_radians
)


# ============================================================
# SELECT COLUMNS
# ============================================================

columns = [

    "timestamp",

    "station_id"

] + FINAL_FEATURES


df = df[columns]


# ============================================================
# MISSING VALUES
# ============================================================

print(
    "\nHandling missing values..."
)


# These are small missing-value columns.
# Interpolate within each station based on time.

df = df.sort_values(
    [
        "station_id",
        "timestamp"
    ]
)


for feature in FINAL_FEATURES:

    df[feature] = (
        df
        .groupby("station_id")[feature]
        .transform(
            lambda x:
            x.interpolate(
                method="linear",
                limit_direction="both"
            )
        )
    )


# ============================================================
# REMAINING MISSING VALUES
# ============================================================

print(
    "\nRemaining missing values:"
)

print(
    df[FINAL_FEATURES]
    .isna()
    .sum()
    .to_string()
)


# ============================================================
# DROP ROWS STILL MISSING
# ============================================================

before = len(df)


df = df.dropna(
    subset=FINAL_FEATURES
)


removed = before - len(df)


print(
    "\nRows removed:",
    removed
)


# ============================================================
# PROCESS EACH STATION
# ============================================================

stations = sorted(
    df["station_id"]
    .unique()
)


print(
    "\nProcessing stations..."
)


for station in stations:

    station_df = df[
        df["station_id"] == station
    ].copy()


    station_df = station_df.sort_values(
        "timestamp"
    )


    output_file = os.path.join(
        OUTPUT_DIR,
        f"{station}.csv"
    )


    station_df.to_csv(
        output_file,
        index=False
    )


    print(
        f"{station}: "
        f"{len(station_df)} rows"
    )


# ============================================================
# COMBINED ML DATA
# ============================================================

combined_file = os.path.join(
    OUTPUT_DIR,
    "all_stations.csv"
)


df.to_csv(
    combined_file,
    index=False
)


# ============================================================
# SUMMARY
# ============================================================

print(
    "\n" + "=" * 60
)

print(
    "ML DATA PREPARATION COMPLETE"
)

print(
    "=" * 60
)

print(
    "\nOutput directory:"
)

print(
    OUTPUT_DIR
)

print(
    "\nFeatures:"
)

for feature in FINAL_FEATURES:

    print(
        "  -",
        feature
    )


print(
    "\nTotal rows:",
    len(df)
)

print(
    "Total stations:",
    len(stations)
)

print(
    "\nFiles created:"
)

for station in stations:

    print(
        f"  {station}.csv"
    )

print(
    "  all_stations.csv"
)
