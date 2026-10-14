import numpy as np
from typing import Dict, Any, List, Tuple, Optional
from config import STATIONS, SPATIAL_THRESHOLDS


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great circle distance between two points on the earth in kilometers."""
    R = 6371.0  # Earth radius in kilometers
    dlat = np.radians(lat2 - lat1)
    dlon = np.radians(lon2 - lon1)
    a = (np.sin(dlat / 2.0) ** 2 +
         np.cos(np.radians(lat1)) * np.cos(np.radians(lat2)) * np.sin(dlon / 2.0) ** 2)
    c = 2.0 * np.arctan2(np.sqrt(a), np.sqrt(1.0 - a))
    return float(R * c)


def evaluate_spatial_rules(
    current_reading: Dict[str, Any],
    all_current_readings: Optional[List[Dict[str, Any]]] = None
) -> Tuple[Dict[str, Any], List[str]]:
    """
    Compares the current station reading against concurrent observations from nearby stations.
    Returns:
        spatial_flags: Dict containing status, spatial agreement flags, and deviations.
        reasons: List of human-readable spatial explanations.
    """
    spatial_flags = {
        "spatial_check": "NOT_AVAILABLE",
        "spatial_disagreement": False,
        "spatial_agreement": False,
        "neighbor_count": 0,
        "avg_neighbor_temp": None,
        "avg_neighbor_press": None,
        "avg_neighbor_hum": None,
        "temp_spatial_dev": 0.0,
        "press_spatial_dev": 0.0,
        "hum_spatial_dev": 0.0,
        "reasons": []
    }
    reasons = []

    if not all_current_readings or len(all_current_readings) <= 1:
        spatial_flags["reasons"] = reasons
        return spatial_flags, reasons

    target_sid = current_reading.get("station_id")
    target_meta = STATIONS.get(target_sid)
    if not target_meta:
        spatial_flags["reasons"] = reasons
        return spatial_flags, reasons

    target_lat = target_meta["latitude"]
    target_lng = target_meta["longitude"]

    target_t = current_reading.get("temperature")
    target_p = current_reading.get("pressure")
    target_h = current_reading.get("humidity")

    # Filter nearby stations
    neighbors = []
    for other_r in all_current_readings:
        o_sid = other_r.get("station_id")
        if not o_sid or o_sid == target_sid:
            continue
        
        o_meta = STATIONS.get(o_sid)
        if not o_meta:
            continue

        dist_km = haversine_distance(target_lat, target_lng, o_meta["latitude"], o_meta["longitude"])
        if dist_km <= SPATIAL_THRESHOLDS["max_distance_km"]:
            neighbors.append((dist_km, other_r))

    if len(neighbors) < SPATIAL_THRESHOLDS["min_neighbors"]:
        spatial_flags["reasons"] = reasons
        return spatial_flags, reasons

    spatial_flags["spatial_check"] = "COMPLETED"
    spatial_flags["neighbor_count"] = len(neighbors)

    n_temps = [r.get("temperature") for _, r in neighbors if r.get("temperature") is not None and not np.isnan(r.get("temperature"))]
    n_presses = [r.get("pressure") for _, r in neighbors if r.get("pressure") is not None and not np.isnan(r.get("pressure"))]
    n_hums = [r.get("humidity") for _, r in neighbors if r.get("humidity") is not None and not np.isnan(r.get("humidity"))]

    disagreements = []
    agreements = []

    # Temperature Spatial Check
    if target_t is not None and not np.isnan(target_t) and n_temps:
        avg_nt = float(np.mean(n_temps))
        spatial_flags["avg_neighbor_temp"] = avg_nt
        dev_t = abs(target_t - avg_nt)
        spatial_flags["temp_spatial_dev"] = dev_t

        if dev_t >= SPATIAL_THRESHOLDS["temp_deviation_max"]:
            disagreements.append("temperature")
            reasons.append(f"Temperature ({target_t:.1f}°C) differs significantly from nearby stations (avg {avg_nt:.1f}°C, dev {dev_t:.1f}°C)")
        else:
            agreements.append("temperature")

    # Pressure Spatial Check
    if target_p is not None and not np.isnan(target_p) and n_presses:
        elev_compat_n_presses = []
        for _, r in neighbors:
            o_meta = STATIONS.get(r.get("station_id"), {})
            if abs(o_meta.get("elevation", 0) - target_meta.get("elevation", 0)) < 500:
                p_val = r.get("pressure")
                if p_val is not None and not np.isnan(p_val):
                    elev_compat_n_presses.append(p_val)

        if elev_compat_n_presses:
            avg_compat_p = float(np.mean(elev_compat_n_presses))
            dev_p_compat = abs(target_p - avg_compat_p)
            if dev_p_compat >= SPATIAL_THRESHOLDS["press_deviation_max"]:
                disagreements.append("pressure")
                reasons.append(f"Pressure ({target_p:.1f} hPa) differs significantly from similar elevation nearby stations (avg {avg_compat_p:.1f} hPa)")
            else:
                agreements.append("pressure")

    # Humidity Spatial Check
    if target_h is not None and not np.isnan(target_h) and n_hums:
        avg_nh = float(np.mean(n_hums))
        spatial_flags["avg_neighbor_hum"] = avg_nh
        dev_h = abs(target_h - avg_nh)
        spatial_flags["hum_spatial_dev"] = dev_h

        if dev_h >= SPATIAL_THRESHOLDS["hum_deviation_max"]:
            disagreements.append("humidity")
            reasons.append(f"Humidity ({target_h:.1f}%) differs significantly from nearby stations (avg {avg_nh:.1f}%)")
        else:
            agreements.append("humidity")

    if disagreements:
        spatial_flags["spatial_disagreement"] = True
    elif len(agreements) >= 1:
        spatial_flags["spatial_agreement"] = True
        reasons.append("Nearby stations show similar weather conditions, reducing likelihood of a sensor fault")

    spatial_flags["reasons"] = reasons
    return spatial_flags, reasons
