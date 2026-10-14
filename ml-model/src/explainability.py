from typing import List, Dict, Any


def generate_explanation(
    validation_flags: Dict[str, Any],
    temporal_flags: Dict[str, Any],
    spatial_flags: Dict[str, Any],
    ml_flags: Dict[str, Any],
    baseline_stats: Dict[str, Any]
) -> List[str]:
    """
    Generates clear, human-readable explainable AI (XAI) reasons by combining
    validation rules, temporal rate-of-change, stuck sensor alerts, spatial checks, and ML scores.
    """
    reasons = []

    # 1. Validation / Physical Range Reasons
    for r in validation_flags.get("reasons", []):
        if r not in reasons:
            reasons.append(r)

    # 2. Temporal Change & Freeze Reasons
    for r in temporal_flags.get("reasons", []):
        if r not in reasons:
            reasons.append(r)

    # 3. Spatial Neighbor Comparison Reasons
    for r in spatial_flags.get("reasons", []):
        if r not in reasons:
            reasons.append(r)

    # 4. Baseline Deviation Reasons
    temp_z = abs(baseline_stats.get("temperature_zscore", 0.0))
    press_z = abs(baseline_stats.get("pressure_zscore", 0.0))
    hum_z = abs(baseline_stats.get("humidity_zscore", 0.0))

    if temp_z > 3.0 and not validation_flags.get("missing_temp"):
        r_str = f"Temperature observation deviates significantly from station baseline (robust z-score: {baseline_stats.get('temperature_zscore', 0):+.2f})"
        if r_str not in reasons:
            reasons.append(r_str)

    if press_z > 3.0 and not validation_flags.get("missing_press"):
        r_str = f"Atmospheric pressure deviates significantly from station baseline (robust z-score: {baseline_stats.get('pressure_zscore', 0):+.2f})"
        if r_str not in reasons:
            reasons.append(r_str)

    if hum_z > 3.0 and not validation_flags.get("missing_hum"):
        r_str = f"Relative humidity deviates significantly from station baseline (robust z-score: {baseline_stats.get('humidity_zscore', 0):+.2f})"
        if r_str not in reasons:
            reasons.append(r_str)

    # 5. Machine Learning Insights
    ml_score = ml_flags.get("score", 0.0)
    ml_anomaly = ml_flags.get("anomaly", False)

    if ml_anomaly:
        ml_reason = f"The global ML model identified the observation as statistically unusual (score: {ml_score:.4f})"
        if ml_reason not in reasons:
            reasons.append(ml_reason)

    # 6. Fallback explanation for normal / consistent observations
    if not reasons:
        reasons.append("Observation is consistent with recent station behavior and learned normal weather patterns")

    return reasons
