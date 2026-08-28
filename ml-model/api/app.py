from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from datetime import datetime

from typing import Optional, Union, Dict, Any

from src.anomaly_model_service import anomaly_service
from src.live_imd_service import get_live_trained_stations, TRAINED_STATIONS_CONFIG


# ============================================================
# SKYGUARD ML API
# ============================================================

app = FastAPI(
    title="SkyGuard ML API",
    description="Weather anomaly detection service",
    version="1.0.0"
)


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():

    return {
        "status": "UP",
        "service": "SkyGuard ML API"
    }


# ============================================================
# PREDICTION
# ============================================================

@app.post("/predict")
def prediction(payload: Dict[str, Any]):

    try:
        result = anomaly_service.predict(payload)
        return result

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )



# ============================================================
# LIVE AWS STATIONS & ANOMALY PREDICTIONS
# ============================================================

@app.get("/live-aws")
def live_aws():
    try:
        return get_live_trained_stations()
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ============================================================
# STATIONS
# ============================================================

@app.get("/stations")
def get_stations():

    return {
        "stations": [
            {
                "station_id": cfg["model_id"],
                "aws_id": cfg["id"],
                "name": cfg["name"],
                "location": cfg["location"],
                "state": cfg["state"],
                "lat": cfg["lat"],
                "lng": cfg["lng"]
            }
            for cfg in TRAINED_STATIONS_CONFIG
        ]
    }

