import os
from src.anomaly_model_service import anomaly_service

# ============================================================
# SKYGUARD PREDICTION SERVICE ENTRYPOINT
# ============================================================

def predict(data: dict) -> dict:
    """
    Main prediction entrypoint for SkyGuard ML API.
    Delegates to AnomalyModelService.
    """
    return anomaly_service.predict(data)


if __name__ == "__main__":
    sample = {
        "station_id": "station_01",
        "timestamp": "2026-08-27 12:00:00",
        "temperature": 34.0,
        "dew_point_temperature": 18.0,
        "station_level_pressure": 1008.5,
        "sea_level_pressure": 1010.0,
        "relative_humidity": 45.0,
        "wind_speed": 3.2,
        "visibility": 6.0
    }
    res = predict(sample)
    print("\nSkyGuard Prediction Result:")
    print(res)
