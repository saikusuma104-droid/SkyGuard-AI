import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple
from config import STATIONS, RANGE_THRESHOLDS


def safe_float(val: Any) -> float:
    """Safely convert input value to float or return np.nan if invalid/missing."""
    if val is None:
        return np.nan
    if isinstance(val, (int, float)):
        if np.isnan(val) or np.isinf(val):
            return np.nan
        return float(val)
    try:
        f = float(str(val).strip())
        if np.isnan(f) or np.isinf(f):
            return np.nan
        return f
    except (ValueError, TypeError):
        return np.nan


def validate_reading(data: Dict[str, Any]) -> Tuple[Dict[str, Any], Dict[str, Any]]:
    """
    Validates sensor reading fields and checks physical range constraints.
    Returns:
        validated_data: Processed data dictionary with clean Python floats/None and missing indicators.
        validation_flags: Dict containing validation findings and range violation flags.
    """
    station_id = data.get("station_id") or data.get("stationId")
    if not station_id or station_id not in STATIONS:
        station_id = "station_01"  # Default fallback

    station = STATIONS[station_id]
    timestamp = data.get("timestamp") or pd.Timestamp.now(tz="UTC").isoformat()

    temp_raw = safe_float(data.get("temperature"))
    press_raw = safe_float(data.get("pressure") if data.get("pressure") is not None else data.get("station_level_pressure"))
    hum_raw = safe_float(data.get("humidity") if data.get("humidity") is not None else data.get("relative_humidity"))

    temp_missing = np.isnan(temp_raw)
    press_missing = np.isnan(press_raw)
    hum_missing = np.isnan(hum_raw)

    temp_val = None if temp_missing else float(temp_raw)
    press_val = None if press_missing else float(press_raw)
    hum_val = None if hum_missing else float(hum_raw)

    flags = {
        "missing_temp": temp_missing,
        "missing_press": press_missing,
        "missing_hum": hum_missing,
        "range_temp_impossible": False,
        "range_hum_impossible": False,
        "range_press_impossible": False,
        "range_temp_suspicious": False,
        "range_press_suspicious": False,
        "reasons": []
    }

    # Range validation - Temperature
    if not temp_missing:
        t_cfg = RANGE_THRESHOLDS["temperature"]
        if temp_val < t_cfg["min_valid"] or temp_val > t_cfg["max_valid"]:
            flags["range_temp_impossible"] = True
            flags["reasons"].append(f"Temperature sensor value ({temp_val}°C) is outside physical bounds ({t_cfg['min_valid']}°C to {t_cfg['max_valid']}°C)")
        elif temp_val < t_cfg["min_suspicious"] or temp_val > t_cfg["max_suspicious"]:
            flags["range_temp_suspicious"] = True
            flags["reasons"].append(f"Temperature ({temp_val}°C) is unusually high/low for operational bounds")

    # Range validation - Humidity
    if not hum_missing:
        h_cfg = RANGE_THRESHOLDS["humidity"]
        if hum_val < h_cfg["min_valid"] or hum_val > h_cfg["max_valid"]:
            flags["range_hum_impossible"] = True
            flags["reasons"].append(f"Relative humidity ({hum_val}%) is outside valid 0–100% range")

    # Range validation - Atmospheric Pressure (Elevation-Aware)
    if not press_missing:
        p_cfg = RANGE_THRESHOLDS["pressure"]
        elevation = station.get("elevation", 0)
        
        if elevation >= p_cfg["high_altitude_elevation_cutoff"]:
            min_p = p_cfg["high_altitude_min"]
            max_p = p_cfg["high_altitude_max"]
        else:
            min_p = p_cfg["lowland_min"]
            max_p = p_cfg["lowland_max"]

        if press_val < min_p or press_val > max_p:
            # Extreme out-of-bounds pressure for elevation considered impossible physical reading
            flags["range_press_impossible"] = True
            flags["reasons"].append(f"Atmospheric pressure ({press_val} hPa) is outside physical limits ({min_p}–{max_p} hPa) for station elevation ({elevation}m)")
    else:
        flags["reasons"].append("Pressure sensor value is missing; pressure-based validation was reduced")

    validated_data = {
        "station_id": station_id,
        "station_name": station["name"],
        "latitude": station["latitude"],
        "longitude": station["longitude"],
        "elevation": station["elevation"],
        "timestamp": timestamp,
        "temperature": temp_val,
        "pressure": press_val,
        "humidity": hum_val,
        "temperature_missing": int(temp_missing),
        "pressure_missing": int(press_missing),
        "humidity_missing": int(hum_missing)
    }

    return validated_data, flags
