from pathlib import Path
import joblib
import pandas as pd
import numpy as np


# =========================================================
# PATHS
# =========================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

DATA_FILE = (
    PROJECT_ROOT
    / "dataset"
    / "processed"
    / "skyguard_features.csv"
)

MODEL_FILE = (
    PROJECT_ROOT
    / "ml-model"
    / "model"
    / "skyguard_model.joblib"
)

OUTPUT_FILE = (
    PROJECT_ROOT
    / "dataset"
    / "processed"
    / "anomaly_results.csv"
)


# =========================================================
# LOAD
# =========================================================

print("=" * 70)
print("SKYGUARD AI - MODEL EVALUATION")
print("=" * 70)

df = pd.read_csv(DATA_FILE)

package = joblib.load(MODEL_FILE)

model = package["model"]
features = package["features"]

print(f"\nRows: {len(df):,}")
print(f"Features used: {len(features)}")


# =========================================================
# PREPARE FEATURES
# =========================================================

X = df[features].copy()

X = X.replace(
    [np.inf, -np.inf],
    np.nan
)


# =========================================================
# PREDICTION
# =========================================================

print("\nRunning model...")

prediction = model.predict(X)

score = model.decision_function(X)

df["anomaly"] = prediction == -1

df["anomaly_score"] = score


# =========================================================
# SEVERITY
# =========================================================

def severity(score):

    if score < -0.15:
        return "CRITICAL"

    elif score < -0.05:
        return "HIGH"

    elif score < 0:
        return "MEDIUM"

    else:
        return "NORMAL"


df["severity"] = df["anomaly_score"].apply(
    severity
)


# =========================================================
# BASIC RESULTS
# =========================================================

print("\n" + "=" * 70)
print("OVERALL RESULTS")
print("=" * 70)

print(
    f"\nNormal observations: "
    f"{(~df['anomaly']).sum():,}"
)

print(
    f"Anomalies: "
    f"{df['anomaly'].sum():,}"
)

print(
    f"Anomaly rate: "
    f"{df['anomaly'].mean() * 100:.2f}%"
)


# =========================================================
# STATION RESULTS
# =========================================================

print("\n" + "=" * 70)
print("STATION RESULTS")
print("=" * 70)

station_results = (
    df.groupby("station_name")
    .agg(
        total=("anomaly", "size"),
        anomalies=("anomaly", "sum")
    )
)

station_results["anomaly_rate"] = (
    station_results["anomalies"]
    / station_results["total"]
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
# SEVERITY DISTRIBUTION
# =========================================================

print("\n" + "=" * 70)
print("SEVERITY")
print("=" * 70)

print(
    df["severity"]
    .value_counts()
)


# =========================================================
# MOST SUSPICIOUS READINGS
# =========================================================

print("\n" + "=" * 70)
print("TOP 30 MOST SUSPICIOUS READINGS")
print("=" * 70)

suspicious = (
    df[
        [
            "timestamp",
            "station_name",
            "temperature",
            "pressure",
            "humidity",
            "anomaly_score",
            "severity"
        ]
    ]
    .sort_values(
        "anomaly_score"
    )
    .head(30)
)

print(
    suspicious.to_string(
        index=False
    )
)


# =========================================================
# SAVE RESULTS
# =========================================================

df.to_csv(
    OUTPUT_FILE,
    index=False
)

print("\n" + "=" * 70)
print("RESULTS SAVED")
print("=" * 70)

print(
    f"\n{OUTPUT_FILE}"
)
