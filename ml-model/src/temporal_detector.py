import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple
from config import TEMPORAL_THRESHOLDS, FREEZE_THRESHOLDS


def parse_timestamp(ts_val: Any) -> pd.Timestamp:
    """Parse string or datetime into UTC pandas Timestamp."""
    try:
        return pd.to_datetime(ts_val, utc=True)
    except Exception:
        return pd.Timestamp.now(tz="UTC")


def evaluate_temporal_rules(
    current_reading: Dict[str, Any],
    station_history: List[Dict[str, Any]]
) -> Tuple[Dict[str, Any], List[str]]:
    """
    Evaluates temporal change rates (1h and 3h) and freeze/stuck sensor conditions against station history.
    """
    temporal_flags = {
        "temp_spike_1h": False,
        "temp_drop_1h": False,
        "press_jump_1h": False,
        "press_drop_1h": False,
        "hum_jump_1h": False,
        "hum_drop_1h": False,
        "temp_frozen": False,
        "press_frozen": False,
        "hum_frozen": False,
        "temporal_anomaly_detected": False,
        "freeze_detected": False,
        "temperature_change_1h": 0.0,
        "pressure_change_1h": 0.0,
        "humidity_change_1h": 0.0,
        "temperature_change_3h": 0.0,
        "pressure_change_3h": 0.0,
        "humidity_change_3h": 0.0,
        "reasons": []
    }
    reasons = []

    if not station_history:
        temporal_flags["reasons"] = reasons
        return temporal_flags, reasons

    cur_time = parse_timestamp(current_reading.get("timestamp"))
    cur_t = current_reading.get("temperature")
    cur_p = current_reading.get("pressure")
    cur_h = current_reading.get("humidity")

    # Sort history descending by timestamp
    valid_history = []
    for r in station_history:
        ts = parse_timestamp(r.get("timestamp"))
        if ts < cur_time:
            valid_history.append((ts, r))
    
    valid_history.sort(key=lambda x: x[0], reverse=True)

    if not valid_history:
        temporal_flags["reasons"] = reasons
        return temporal_flags, reasons

    # ------------------------------------------------------------
    # 1. Calculate 1-Hour and 3-Hour Rates of Change
    # ------------------------------------------------------------
    r_1h = None
    r_3h = None

    for ts, r in valid_history:
        hours_diff = (cur_time - ts).total_seconds() / 3600.0
        if hours_diff <= 0:
            continue
        if r_1h is None and 0.25 <= hours_diff <= 1.75:
            r_1h = (hours_diff, r)
        if r_3h is None and 2.0 <= hours_diff <= 4.0:
            r_3h = (hours_diff, r)

    # Fallback to most recent observation if 1h window not strictly found
    if r_1h is None and valid_history:
        ts_last, r_last = valid_history[0]
        h_diff = max(0.1, (cur_time - ts_last).total_seconds() / 3600.0)
        r_1h = (h_diff, r_last)

    # Calculate 1h changes
    if r_1h is not None:
        h_diff, prev_r = r_1h
        prev_t = prev_r.get("temperature")
        prev_p = prev_r.get("pressure")
        prev_h = prev_r.get("humidity")

        # Temperature 1h change
        if cur_t is not None and prev_t is not None and not np.isnan(cur_t) and not np.isnan(prev_t):
            raw_diff = cur_t - prev_t
            rate_1h = raw_diff / max(0.25, min(h_diff, 3.0))
            temporal_flags["temperature_change_1h"] = rate_1h
            
            t_cfg = TEMPORAL_THRESHOLDS["temperature_change_1h"]
            if rate_1h >= t_cfg["anomaly"]:
                temporal_flags["temp_spike_1h"] = True
                temporal_flags["temporal_anomaly_detected"] = True
                reasons.append(f"Temperature increased sharply ({rate_1h:+.1f}°C/h) compared with previous observations")
            elif rate_1h <= -t_cfg["anomaly"]:
                temporal_flags["temp_drop_1h"] = True
                temporal_flags["temporal_anomaly_detected"] = True
                reasons.append(f"Temperature dropped sharply ({rate_1h:+.1f}°C/h) compared with previous observations")
            elif abs(rate_1h) >= t_cfg["warning"]:
                reasons.append(f"Moderate temperature change detected ({rate_1h:+.1f}°C/h)")

        # Pressure 1h change
        if cur_p is not None and prev_p is not None and not np.isnan(cur_p) and not np.isnan(prev_p):
            raw_diff = cur_p - prev_p
            rate_1h = raw_diff / max(0.25, min(h_diff, 3.0))
            temporal_flags["pressure_change_1h"] = rate_1h

            p_cfg = TEMPORAL_THRESHOLDS["pressure_change_1h"]
            if rate_1h >= p_cfg["anomaly"]:
                temporal_flags["press_jump_1h"] = True
                temporal_flags["temporal_anomaly_detected"] = True
                reasons.append(f"Pressure jumped sharply ({rate_1h:+.1f} hPa/h) compared with previous observations")
            elif rate_1h <= -p_cfg["anomaly"]:
                temporal_flags["press_drop_1h"] = True
                temporal_flags["temporal_anomaly_detected"] = True
                reasons.append(f"Pressure dropped sharply ({rate_1h:+.1f} hPa/h) compared with previous observations")

        # Humidity 1h change
        if cur_h is not None and prev_h is not None and not np.isnan(cur_h) and not np.isnan(prev_h):
            raw_diff = cur_h - prev_h
            rate_1h = raw_diff / max(0.25, min(h_diff, 3.0))
            temporal_flags["humidity_change_1h"] = rate_1h

            h_cfg = TEMPORAL_THRESHOLDS["humidity_change_1h"]
            if rate_1h >= h_cfg["anomaly"]:
                temporal_flags["hum_jump_1h"] = True
                temporal_flags["temporal_anomaly_detected"] = True
                reasons.append(f"Humidity jumped sharply ({rate_1h:+.1f}%/h) compared with previous observations")
            elif rate_1h <= -h_cfg["anomaly"]:
                temporal_flags["hum_drop_1h"] = True
                temporal_flags["temporal_anomaly_detected"] = True
                reasons.append(f"Humidity dropped sharply ({rate_1h:+.1f}%/h) compared with previous observations")

    # Calculate 3h changes if r_3h exists
    if r_3h is not None:
        h_diff, prev_r = r_3h
        prev_t = prev_r.get("temperature")
        prev_p = prev_r.get("pressure")
        prev_h = prev_r.get("humidity")

        if cur_t is not None and prev_t is not None and not np.isnan(cur_t) and not np.isnan(prev_t):
            temporal_flags["temperature_change_3h"] = (cur_t - prev_t) / (h_diff / 3.0)
        if cur_p is not None and prev_p is not None and not np.isnan(cur_p) and not np.isnan(prev_p):
            temporal_flags["pressure_change_3h"] = (cur_p - prev_p) / (h_diff / 3.0)
        if cur_h is not None and prev_h is not None and not np.isnan(cur_h) and not np.isnan(prev_h):
            temporal_flags["humidity_change_3h"] = (cur_h - prev_h) / (h_diff / 3.0)

    # ------------------------------------------------------------
    # 2. Freeze / Stuck Sensor Detection
    # ------------------------------------------------------------
    win_size = FREEZE_THRESHOLDS["window_size"]
    recent_readings = [current_reading] + [r for _, r in valid_history[:win_size - 1]]

    if len(recent_readings) >= win_size:
        t_vals = [r.get("temperature") for r in recent_readings if r.get("temperature") is not None and not np.isnan(r.get("temperature"))]
        if len(t_vals) >= win_size:
            max_dev = max(t_vals) - min(t_vals)
            if max_dev <= FREEZE_THRESHOLDS["tolerance_temp"]:
                temporal_flags["temp_frozen"] = True
                temporal_flags["freeze_detected"] = True
                reasons.append(f"Temperature sensor appears to be stuck at nearly the same value ({t_vals[0]}°C across {win_size} consecutive readings)")

        p_vals = [r.get("pressure") for r in recent_readings if r.get("pressure") is not None and not np.isnan(r.get("pressure"))]
        if len(p_vals) >= win_size:
            max_dev = max(p_vals) - min(p_vals)
            if max_dev <= FREEZE_THRESHOLDS["tolerance_press"]:
                temporal_flags["press_frozen"] = True
                temporal_flags["freeze_detected"] = True
                reasons.append(f"Pressure sensor appears to be stuck at nearly the same value ({p_vals[0]} hPa across {win_size} consecutive readings)")

        h_vals = [r.get("humidity") for r in recent_readings if r.get("humidity") is not None and not np.isnan(r.get("humidity"))]
        if len(h_vals) >= win_size:
            max_dev = max(h_vals) - min(h_vals)
            if max_dev <= FREEZE_THRESHOLDS["tolerance_hum"]:
                temporal_flags["hum_frozen"] = True
                temporal_flags["freeze_detected"] = True
                reasons.append(f"Humidity sensor appears to be stuck at nearly the same value ({h_vals[0]}% across {win_size} consecutive readings)")

    temporal_flags["reasons"] = reasons
    return temporal_flags, reasons
