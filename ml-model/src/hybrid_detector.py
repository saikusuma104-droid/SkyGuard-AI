import sys
from pathlib import Path
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional

# Ensure src is in sys.path
SRC_DIR = Path(__file__).resolve().parent
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

from config import STATIONS, MODEL_PATH, ML_THRESHOLDS
from data_validation import validate_reading
from baseline import StationBaselineManager
from temporal_detector import evaluate_temporal_rules
from spatial_detector import evaluate_spatial_rules
from explainability import generate_explanation

# Instantiate global station history baseline manager
BASELINE_MANAGER = StationBaselineManager(max_history_per_station=100)

# Load global Isolation Forest model package
if not MODEL_PATH.exists():
    raise FileNotFoundError(f"SkyGuard global ML model file not found at: {MODEL_PATH}")

PACKAGE = joblib.load(MODEL_PATH)
GLOBAL_MODEL = PACKAGE["model"]
MODEL_FEATURES = PACKAGE["features"]


def build_ml_feature_vector(
    val_data: Dict[str, Any],
    baseline_stats: Dict[str, Any],
    temporal_flags: Dict[str, Any]
) -> pd.DataFrame:
    """
    Constructs the exact 34-feature DataFrame expected by skyguard_model.joblib.
    """
    timestamp = pd.to_datetime(val_data["timestamp"], utc=True)

    hour = timestamp.hour
    day_of_year = timestamp.dayofyear

    temp = val_data["temperature"] if val_data["temperature"] is not None and not np.isnan(val_data["temperature"]) else 0.0
    press = val_data["pressure"] if val_data["pressure"] is not None and not np.isnan(val_data["pressure"]) else 0.0
    hum = val_data["humidity"] if val_data["humidity"] is not None and not np.isnan(val_data["humidity"]) else 0.0

    t_diff = temporal_flags.get("temperature_change_1h", 0.0)
    p_diff = temporal_flags.get("pressure_change_1h", 0.0)
    h_diff = temporal_flags.get("humidity_change_1h", 0.0)

    row = {
        "temperature": temp,
        "pressure": press,
        "humidity": hum,
        "latitude": val_data["latitude"],
        "longitude": val_data["longitude"],
        "elevation": val_data["elevation"],

        "hour_sin": np.sin(2 * np.pi * hour / 24.0),
        "hour_cos": np.cos(2 * np.pi * hour / 24.0),
        "day_sin": np.sin(2 * np.pi * day_of_year / 365.0),
        "day_cos": np.cos(2 * np.pi * day_of_year / 365.0),

        "temperature_diff": t_diff,
        "temperature_diff_abs": abs(t_diff),
        "pressure_diff": p_diff,
        "pressure_diff_abs": abs(p_diff),
        "humidity_diff": h_diff,
        "humidity_diff_abs": abs(h_diff),

        "temperature_rolling_mean": baseline_stats.get("temperature_rolling_mean", temp),
        "temperature_rolling_std": baseline_stats.get("temperature_rolling_std", 0.0),
        "pressure_rolling_mean": baseline_stats.get("pressure_rolling_mean", press),
        "pressure_rolling_std": baseline_stats.get("pressure_rolling_std", 0.0),
        "humidity_rolling_mean": baseline_stats.get("humidity_rolling_mean", hum),
        "humidity_rolling_std": baseline_stats.get("humidity_rolling_std", 0.0),

        "temperature_deviation": baseline_stats.get("temperature_deviation", 0.0),
        "temperature_zscore": baseline_stats.get("temperature_zscore", 0.0),
        "pressure_deviation": baseline_stats.get("pressure_deviation", 0.0),
        "pressure_zscore": baseline_stats.get("pressure_zscore", 0.0),
        "humidity_deviation": baseline_stats.get("humidity_deviation", 0.0),
        "humidity_zscore": baseline_stats.get("humidity_zscore", 0.0),

        "temperature_humidity_interaction": temp * hum,
        "temperature_pressure_interaction": temp * press,
        "humidity_pressure_interaction": hum * press,

        "pressure_missing": val_data["pressure_missing"],
        "humidity_missing": val_data["humidity_missing"],
        "temperature_missing": val_data["temperature_missing"]
    }

    df = pd.DataFrame([row])
    # Reorder to match model feature expectation
    X = df[MODEL_FEATURES].fillna(0.0)
    return X


def calculate_decision_fusion(
    val_flags: Dict[str, Any],
    temporal_flags: Dict[str, Any],
    spatial_flags: Dict[str, Any],
    ml_anomaly: bool,
    ml_score: float
) -> Tuple[bool, str, float, Dict[str, Any]]:
    """
    Implements evidence-based decision fusion combining physical rules, temporal rate, freeze,
    spatial agreement, and global ML model predictions.
    
    Returns:
        final_anomaly (bool)
        severity ("HIGH" | "MEDIUM" | "LOW" | "NORMAL")
        confidence_score (float 0.0 to 1.0)
        rules_summary (dict)
    """
    # Count rule evidence
    range_violation = val_flags["range_temp_impossible"] or val_flags["range_hum_impossible"] or val_flags["range_press_impossible"]
    suspicious_range = val_flags["range_temp_suspicious"] or val_flags["range_press_suspicious"]
    
    temporal_violation = temporal_flags["temporal_anomaly_detected"]
    freeze_violation = temporal_flags["freeze_detected"]
    spatial_violation = spatial_flags["spatial_disagreement"]
    spatial_agreement = spatial_flags["spatial_agreement"]

    rule_evidence_count = sum([
        1 if range_violation else 0,
        1 if temporal_violation else 0,
        1 if freeze_violation else 0,
        1 if spatial_violation else 0
    ])

    # Rule flags summary
    rules_summary = {
        "range": bool(range_violation or suspicious_range),
        "temporal": bool(temporal_violation),
        "freeze": bool(freeze_violation),
        "physical": bool(range_violation),
        "spatial": "NOT_AVAILABLE" if spatial_flags["spatial_check"] == "NOT_AVAILABLE" else bool(spatial_violation)
    }

    # ------------------------------------------------------------
    # SEVERITY DECISION MATRIX
    # ------------------------------------------------------------
    # 1. HIGH Anomaly:
    #    - Physical impossibility (e.g. humidity > 100%)
    #    - Multiple strong independent rule violations (e.g. sudden spike + freeze or spatial mismatch)
    #    - Strong rule violation + supporting ML anomaly
    if range_violation:
        severity = "HIGH"
        final_anomaly = True
    elif (temporal_violation or freeze_violation or spatial_violation) and ml_anomaly:
        severity = "HIGH"
        final_anomaly = True
    elif rule_evidence_count >= 2:
        severity = "HIGH"
        final_anomaly = True

    # 2. MEDIUM / REVIEW:
    #    - Single strong rule violation without ML confirmation
    #    - ML anomaly with NO strong physical/rule violations (unusual weather observation)
    elif (temporal_violation or freeze_violation or spatial_violation):
        if spatial_agreement:
            # Nearby stations show similar conditions -> likely regional weather event
            severity = "MEDIUM"
            final_anomaly = False
        else:
            severity = "MEDIUM"
            final_anomaly = True
    elif ml_anomaly:
        # ML anomaly alone without rule violations -> REVIEW/MEDIUM, NOT automatic sensor fault
        if spatial_agreement:
            severity = "NORMAL"
            final_anomaly = False
        else:
            severity = "MEDIUM"
            final_anomaly = True

    # 3. LOW Severity:
    #    - Suspicious operational range without temporal or ML confirmation
    elif suspicious_range:
        severity = "LOW"
        final_anomaly = False

    # 4. NORMAL:
    else:
        severity = "NORMAL"
        final_anomaly = False

    # ------------------------------------------------------------
    # CONFIDENCE CALCULATION (0.0 to 1.0)
    # ------------------------------------------------------------
    base_confidence = 0.85

    if range_violation:
        confidence = 0.98
    elif rule_evidence_count >= 2 and ml_anomaly:
        confidence = 0.95
    elif rule_evidence_count == 1 and ml_anomaly:
        confidence = 0.88
    elif ml_anomaly and not rule_evidence_count:
        confidence = 0.65  # Moderate evidence for ML-only anomaly
    elif spatial_agreement:
        confidence = 0.90  # Strong confidence in spatial confirmation
    else:
        confidence = base_confidence

    # Reduce confidence if pressure sensor is missing
    if val_flags["missing_press"]:
        confidence = max(0.40, confidence - 0.15)

    confidence_score = round(float(confidence), 2)
    return final_anomaly, severity, confidence_score, rules_summary


def detect_anomaly(
    data: Dict[str, Any],
    station_history: Optional[List[Dict[str, Any]]] = None,
    all_current_readings: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    """
    Main Hybrid Anomaly Detection Pipeline.
    """
    # 1. Data Validation Layer
    val_data, val_flags = validate_reading(data)
    station_id = val_data["station_id"]

    # Retrieve history
    if station_history is None:
        station_history = BASELINE_MANAGER.get_history(station_id)

    # 2. Station-Aware Baseline Statistics
    baseline_stats = BASELINE_MANAGER.compute_baseline_stats(station_id, val_data, external_history=station_history)

    # 3. Temporal Rate of Change & Freeze Rules
    temporal_flags, temp_reasons = evaluate_temporal_rules(val_data, station_history)

    # 4. Spatial Neighbor Check
    spatial_flags, spat_reasons = evaluate_spatial_rules(val_data, all_current_readings)

    # 5. Global ML Model Inference
    X = build_ml_feature_vector(val_data, baseline_stats, temporal_flags)
    ml_pred = GLOBAL_MODEL.predict(X)[0]
    ml_score = float(GLOBAL_MODEL.decision_function(X)[0])
    ml_anomaly = bool(ml_pred == -1)

    # 6. Decision Fusion Engine
    final_anomaly, severity, confidence, rules_summary = calculate_decision_fusion(
        val_flags, temporal_flags, spatial_flags, ml_anomaly, ml_score
    )

    # 7. Explainable AI Reasons Generator
    ml_flags = {"anomaly": ml_anomaly, "score": ml_score}
    reasons = generate_explanation(val_flags, temporal_flags, spatial_flags, ml_flags, baseline_stats)

    # Update in-memory station history after validation
    BASELINE_MANAGER.add_reading(station_id, val_data)

    # Build final response payload
    response = {
        "station_id": station_id,
        "station_name": val_data["station_name"],
        "timestamp": val_data["timestamp"],
        "temperature": val_data["temperature"],
        "pressure": val_data["pressure"],
        "humidity": val_data["humidity"],

        "anomaly": final_anomaly,
        "severity": severity,
        "confidence": confidence,

        "ml": {
            "anomaly": ml_anomaly,
            "score": round(ml_score, 6)
        },

        "rules": rules_summary,
        "reasons": reasons
    }

    return response
