from pathlib import Path
import joblib
import numpy as np
import pandas as pd

from sklearn.ensemble import IsolationForest
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler


# =========================================================
# PATHS
# =========================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

INPUT_FILE = (
    PROJECT_ROOT
    / "dataset"
    / "processed"
    / "skyguard_features.csv"
)

MODEL_DIR = PROJECT_ROOT / "ml-model" / "model"
MODEL_FILE = MODEL_DIR / "skyguard_model.joblib"


# =========================================================
# FEATURES
# =========================================================

FEATURES = [
    # Actual weather observations
    "temperature",
    "pressure",
    "humidity",

    # Station characteristics
    "latitude",
    "longitude",
    "elevation",

    # Time / season
    "hour_sin",
    "hour_cos",
    "day_sin",
    "day_cos",

    # Sudden changes
    "temperature_diff",
    "temperature_diff_abs",
    "pressure_diff",
    "pressure_diff_abs",
    "humidity_diff",
    "humidity_diff_abs",

    # Recent behaviour
    "temperature_rolling_mean",
    "temperature_rolling_std",
    "pressure_rolling_mean",
    "pressure_rolling_std",
    "humidity_rolling_mean",
    "humidity_rolling_std",

    # Deviation from recent behaviour
    "temperature_deviation",
    "temperature_zscore",
    "pressure_deviation",
    "pressure_zscore",
    "humidity_deviation",
    "humidity_zscore",

    # Multivariate relationships
    "temperature_humidity_interaction",
    "temperature_pressure_interaction",
    "humidity_pressure_interaction",
]


# =========================================================
# LOAD
# =========================================================

print("=" * 70)
print("SKYGUARD AI - V2 GLOBAL ANOMALY MODEL")
print("=" * 70)

df = pd.read_csv(INPUT_FILE)

print(f"\nTotal observations: {len(df):,}")


# =========================================================
# STATION BALANCING
# =========================================================
#
# Tuni has ~17,000 observations.
# Tirupati has only ~267.
#
# We don't want Tuni to dominate training.
#
# We sample the same maximum number from every station.
#
# IMPORTANT:
# This does NOT create another model.
# It is still ONE global model.
# =========================================================

print("\nOriginal station distribution:")

print(
    df["station_name"].value_counts()
)


MAX_PER_STATION = 1500

balanced_parts = []

for station, station_df in df.groupby("station_id"):

    if len(station_df) > MAX_PER_STATION:

        station_df = station_df.sample(
            n=MAX_PER_STATION,
            random_state=42
        )

    balanced_parts.append(station_df)


train_df = pd.concat(
    balanced_parts,
    ignore_index=True
)


print("\nTraining station distribution:")

print(
    train_df["station_name"].value_counts()
)

print(
    f"\nTraining observations: "
    f"{len(train_df):,}"
)


# =========================================================
# FEATURES
# =========================================================

missing_features = [
    feature
    for feature in FEATURES
    if feature not in train_df.columns
]

if missing_features:

    print("\nERROR - Missing features:")

    for feature in missing_features:
        print(feature)

    raise SystemExit(1)


X = train_df[FEATURES].copy()

X = X.replace(
    [np.inf, -np.inf],
    np.nan
)


# =========================================================
# MISSING DATA INDICATORS
# =========================================================
#
# VERY IMPORTANT:
#
# Missing pressure should not simply look like a normal
# pressure value.
#
# These flags tell the model whether the sensor actually
# supplied the measurement.
# =========================================================

X["pressure_missing"] = (
    X["pressure"].isna().astype(int)
)

X["humidity_missing"] = (
    X["humidity"].isna().astype(int)
)

X["temperature_missing"] = (
    X["temperature"].isna().astype(int)
)


# =========================================================
# REMOVE FEATURES THAT ARE COMPLETELY EMPTY
# =========================================================

empty_features = [
    column
    for column in X.columns
    if X[column].isna().all()
]

if empty_features:

    print("\nRemoving completely empty features:")

    for feature in empty_features:
        print(f"  {feature}")

    X = X.drop(
        columns=empty_features
    )


# =========================================================
# PIPELINE
# =========================================================

pipeline = Pipeline(
    steps=[

        (
            "imputer",
            SimpleImputer(
                strategy="median"
            )
        ),

        (
            "scaler",
            StandardScaler()
        ),

        (
            "model",
            IsolationForest(
                n_estimators=400,
                contamination=0.02,
                max_samples="auto",
                max_features=0.8,
                bootstrap=False,
                random_state=42,
                n_jobs=-1
            )
        )
    ]
)


# =========================================================
# TRAIN
# =========================================================

print("\nTraining ONE global model...")

pipeline.fit(X)

print("Training complete.")


# =========================================================
# EVALUATION ON TRAINING DATA
# =========================================================

print("\nGenerating anomaly scores...")

predictions = pipeline.predict(X)

scores = pipeline.decision_function(X)

train_df["anomaly"] = (
    predictions == -1
)

train_df["anomaly_score"] = scores


# =========================================================
# RESULTS
# =========================================================

anomaly_count = int(
    train_df["anomaly"].sum()
)

anomaly_rate = (
    anomaly_count
    / len(train_df)
    * 100
)

print("\n" + "=" * 70)
print("MODEL RESULTS")
print("=" * 70)

print(
    f"\nTraining rows: {len(train_df):,}"
)

print(
    f"Anomalies: {anomaly_count:,}"
)

print(
    f"Anomaly rate: {anomaly_rate:.2f}%"
)


# =========================================================
# STATION RESULTS
# =========================================================

print("\nAnomalies by station:")

station_results = (
    train_df
    .groupby("station_name")
    .agg(
        observations=("anomaly", "size"),
        anomalies=("anomaly", "sum")
    )
)

station_results["anomaly_rate"] = (
    station_results["anomalies"]
    /
    station_results["observations"]
    * 100
)

print(
    station_results
    .sort_values(
        "anomaly_rate",
        ascending=False
    )
)


# =========================================================
# SCORE DISTRIBUTION
# =========================================================

print("\nAnomaly score statistics:")

print(
    train_df["anomaly_score"]
    .describe()
)


# =========================================================
# SAVE MODEL
# =========================================================

MODEL_DIR.mkdir(
    parents=True,
    exist_ok=True
)

model_package = {

    "model": pipeline,

    "features": list(X.columns),

    "algorithm": "Isolation Forest",

    "version": "2.0",

    "random_state": 42,

    "contamination": 0.02,

    "max_per_station": MAX_PER_STATION,

    "stations": sorted(
        train_df["station_id"]
        .unique()
        .tolist()
    )
}


joblib.dump(
    model_package,
    MODEL_FILE
)


# =========================================================
# SAVE TRAINING RESULTS
# =========================================================

RESULT_FILE = (
    PROJECT_ROOT
    / "dataset"
    / "processed"
    / "v2_training_results.csv"
)

train_df.to_csv(
    RESULT_FILE,
    index=False
)


# =========================================================
# FINAL
# =========================================================

print("\n" + "=" * 70)
print("V2 MODEL SAVED")
print("=" * 70)

print(
    f"\nModel:"
)

print(MODEL_FILE)

print(
    f"\nResults:"
)

print(RESULT_FILE)

print("\nModel contains:")

print("  ONE global Isolation Forest")

print("  Station-aware training")

print("  Location information")

print("  Elevation information")

print("  Seasonal information")

print("  Temporal information")

print("  Sensor missing-value indicators")

print("  Weather relationships")

print("\nNext step:")
print("Validate V2 against the seven stations.")
