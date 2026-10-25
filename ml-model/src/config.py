from pathlib import Path

# Project root
PROJECT_ROOT = Path(__file__).resolve().parents[2]

# Dataset location
DATASET_DIR = PROJECT_ROOT / "dataset"
RAW_DIR = DATASET_DIR / "raw"
PROCESSED_DIR = DATASET_DIR / "processed"

# Global Model Location (ONE model for all stations)
MODEL_DIR = PROJECT_ROOT / "ml-model" / "model"
MODEL_PATH = MODEL_DIR / "skyguard_model.joblib"

# Station Metadata (7 Official Stations)
STATIONS = {
    "station_01": {
        "name": "Tuni",
        "latitude": 17.3591,
        "longitude": 82.5461,
        "elevation": 16
    },
    "station_02": {
        "name": "Thiruvananthapuram",
        "latitude": 8.5241,
        "longitude": 76.9366,
        "elevation": 10
    },
    "station_03": {
        "name": "Tirupati",
        "latitude": 13.6288,
        "longitude": 79.4192,
        "elevation": 150
    },
    "station_04": {
        "name": "Nalgonda",
        "latitude": 17.0575,
        "longitude": 79.2684,
        "elevation": 420
    },
    "station_05": {
        "name": "Coonoor",
        "latitude": 11.3530,
        "longitude": 76.7959,
        "elevation": 1850  # High altitude station
    },
    "station_06": {
        "name": "Kurnool",
        "latitude": 15.8281,
        "longitude": 78.0373,
        "elevation": 274
    },
    "station_07": {
        "name": "Bhadrachalam",
        "latitude": 17.6688,
        "longitude": 80.8936,
        "elevation": 55
    }
}

# ------------------------------------------------------------
# 1. Operational Range Thresholds (Data Validation)
# ------------------------------------------------------------
RANGE_THRESHOLDS = {
    "temperature": {
        "min_valid": -50.0,
        "max_valid": 60.0,
        "min_suspicious": -20.0,
        "max_suspicious": 52.0
    },
    "humidity": {
        "min_valid": 0.0,
        "max_valid": 100.0
    },
    "pressure": {
        # Standard lowland operational range (hPa)
        "lowland_min": 850.0,
        "lowland_max": 1100.0,
        # High altitude (>1000m e.g. Coonoor) operational range (hPa)
        "high_altitude_min": 700.0,
        "high_altitude_max": 950.0,
        "high_altitude_elevation_cutoff": 1000.0
    }
}

# ------------------------------------------------------------
# 2. Temporal Change Thresholds (Hourly Rates)
# ------------------------------------------------------------
TEMPORAL_THRESHOLDS = {
    "temperature_change_1h": {
        "warning": 5.0,   # °C per hour
        "anomaly": 8.0    # °C per hour
    },
    "temperature_change_3h": {
        "warning": 8.0,
        "anomaly": 12.0
    },
    "pressure_change_1h": {
        "warning": 4.0,   # hPa per hour
        "anomaly": 6.0    # hPa per hour
    },
    "pressure_change_3h": {
        "warning": 6.0,
        "anomaly": 10.0
    },
    "humidity_change_1h": {
        "warning": 25.0,  # % per hour
        "anomaly": 35.0   # % per hour
    },
    "humidity_change_3h": {
        "warning": 35.0,
        "anomaly": 50.0
    }
}

# ------------------------------------------------------------
# 3. Sensor Freeze Thresholds
# ------------------------------------------------------------
FREEZE_THRESHOLDS = {
    "window_size": 5,        # Minimum consecutive readings to evaluate freeze
    "tolerance_temp": 0.01,  # Max variation (°C) considered identical
    "tolerance_press": 0.01, # Max variation (hPa) considered identical
    "tolerance_hum": 0.01    # Max variation (%) considered identical
}

# ------------------------------------------------------------
# 4. Spatial (Neighbor) Check Thresholds
# ------------------------------------------------------------
SPATIAL_THRESHOLDS = {
    "max_distance_km": 300.0,   # Radius to search for neighboring stations
    "min_neighbors": 1,         # Minimum neighbors required for spatial check
    "temp_deviation_max": 6.0,  # °C difference from neighbors to trigger spatial alert
    "press_deviation_max": 8.0, # hPa difference from neighbors to trigger spatial alert
    "hum_deviation_max": 30.0   # % difference from neighbors to trigger spatial alert
}

# ------------------------------------------------------------
# 5. Isolation Forest Score Thresholds
# ------------------------------------------------------------
ML_THRESHOLDS = {
    "anomaly_score_cutoff": 0.0,    # Score < 0 indicates ML anomaly
    "critical_score_cutoff": -0.05  # Score < -0.05 indicates strong ML anomaly
}
