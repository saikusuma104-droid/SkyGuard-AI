import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional


class StationBaselineManager:
    """
    Manages per-station historical observations and computes robust station-aware statistics.
    Uses median and Median Absolute Deviation (MAD) for robust z-scores:
        MAD = median(|x - median(x)|)
        robust_z = 0.6745 * (x - median) / MAD
    """
    def __init__(self, max_history_per_station: int = 100):
        self.max_history = max_history_per_station
        self.history: Dict[str, List[Dict[str, Any]]] = {}

    def add_reading(self, station_id: str, reading: Dict[str, Any]):
        """Append a validated reading to station history."""
        if station_id not in self.history:
            self.history[station_id] = []
        
        self.history[station_id].append(reading)
        # Keep sliding window
        if len(self.history[station_id]) > self.max_history:
            self.history[station_id] = self.history[station_id][-self.max_history:]

    def get_history(self, station_id: str) -> List[Dict[str, Any]]:
        """Retrieve recent history list for a station."""
        return self.history.get(station_id, [])

    def compute_baseline_stats(self, station_id: str, current_reading: Dict[str, Any], external_history: Optional[List[Dict[str, Any]]] = None) -> Dict[str, float]:
        """
        Computes baseline rolling statistics for current_reading against historical readings.
        """
        station_readings = external_history if external_history is not None else self.get_history(station_id)
        
        # Extract series
        temps = [r["temperature"] for r in station_readings if r.get("temperature") is not None and not np.isnan(r.get("temperature"))]
        presses = [r["pressure"] for r in station_readings if r.get("pressure") is not None and not np.isnan(r.get("pressure"))]
        hums = [r["humidity"] for r in station_readings if r.get("humidity") is not None and not np.isnan(r.get("humidity"))]

        stats = {
            "temperature_rolling_mean": current_reading.get("temperature") if current_reading.get("temperature") is not None else 0.0,
            "temperature_rolling_std": 0.0,
            "temperature_rolling_median": current_reading.get("temperature") if current_reading.get("temperature") is not None else 0.0,
            "temperature_mad": 0.0,
            "temperature_zscore": 0.0,
            "temperature_deviation": 0.0,

            "pressure_rolling_mean": current_reading.get("pressure") if current_reading.get("pressure") is not None else 0.0,
            "pressure_rolling_std": 0.0,
            "pressure_rolling_median": current_reading.get("pressure") if current_reading.get("pressure") is not None else 0.0,
            "pressure_mad": 0.0,
            "pressure_zscore": 0.0,
            "pressure_deviation": 0.0,

            "humidity_rolling_mean": current_reading.get("humidity") if current_reading.get("humidity") is not None else 0.0,
            "humidity_rolling_std": 0.0,
            "humidity_rolling_median": current_reading.get("humidity") if current_reading.get("humidity") is not None else 0.0,
            "humidity_mad": 0.0,
            "humidity_zscore": 0.0,
            "humidity_deviation": 0.0,
        }

        # Temperature stats
        if len(temps) >= 2 and current_reading.get("temperature") is not None and not np.isnan(current_reading["temperature"]):
            arr = np.array(temps)
            mean_val = float(np.mean(arr))
            std_val = float(np.std(arr))
            med_val = float(np.median(arr))
            mad_val = float(np.median(np.abs(arr - med_val)))
            cur_t = float(current_reading["temperature"])

            stats["temperature_rolling_mean"] = mean_val
            stats["temperature_rolling_std"] = std_val
            stats["temperature_rolling_median"] = med_val
            stats["temperature_mad"] = mad_val
            stats["temperature_deviation"] = cur_t - med_val

            if mad_val > 1e-4:
                stats["temperature_zscore"] = 0.6745 * (cur_t - med_val) / mad_val
            elif std_val > 1e-4:
                stats["temperature_zscore"] = (cur_t - mean_val) / std_val

        # Pressure stats
        if len(presses) >= 2 and current_reading.get("pressure") is not None and not np.isnan(current_reading["pressure"]):
            arr = np.array(presses)
            mean_val = float(np.mean(arr))
            std_val = float(np.std(arr))
            med_val = float(np.median(arr))
            mad_val = float(np.median(np.abs(arr - med_val)))
            cur_p = float(current_reading["pressure"])

            stats["pressure_rolling_mean"] = mean_val
            stats["pressure_rolling_std"] = std_val
            stats["pressure_rolling_median"] = med_val
            stats["pressure_mad"] = mad_val
            stats["pressure_deviation"] = cur_p - med_val

            if mad_val > 1e-4:
                stats["pressure_zscore"] = 0.6745 * (cur_p - med_val) / mad_val
            elif std_val > 1e-4:
                stats["pressure_zscore"] = (cur_p - mean_val) / std_val

        # Humidity stats
        if len(hums) >= 2 and current_reading.get("humidity") is not None and not np.isnan(current_reading["humidity"]):
            arr = np.array(hums)
            mean_val = float(np.mean(arr))
            std_val = float(np.std(arr))
            med_val = float(np.median(arr))
            mad_val = float(np.median(np.abs(arr - med_val)))
            cur_h = float(current_reading["humidity"])

            stats["humidity_rolling_mean"] = mean_val
            stats["humidity_rolling_std"] = std_val
            stats["humidity_rolling_median"] = med_val
            stats["humidity_mad"] = mad_val
            stats["humidity_deviation"] = cur_h - med_val

            if mad_val > 1e-4:
                stats["humidity_zscore"] = 0.6745 * (cur_h - med_val) / mad_val
            elif std_val > 1e-4:
                stats["humidity_zscore"] = (cur_h - mean_val) / std_val

        # Ensure no NaNs or Inf values exist in output dictionary
        for k, v in stats.items():
            if np.isnan(v) or np.isinf(v):
                stats[k] = 0.0

        return stats
