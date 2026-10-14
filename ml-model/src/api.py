import sys
from pathlib import Path
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Ensure src directory is in Python path
SRC_DIR = Path(__file__).resolve().parent
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

from config import STATIONS, MODEL_PATH
from hybrid_detector import detect_anomaly

app = FastAPI(
    title="SkyGuard AI Hybrid Anomaly Detection API",
    description="Multi-Layer Meteorological Anomaly Detection Engine (Rules + Baseline + Temporal + Spatial + Global ML)",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class WeatherInput(BaseModel):
    station_id: Optional[str] = None
    stationId: Optional[str] = None
    timestamp: Optional[str] = None
    temperature: Optional[float] = None
    pressure: Optional[float] = None
    station_level_pressure: Optional[float] = None
    sea_level_pressure: Optional[float] = None
    humidity: Optional[float] = None
    relative_humidity: Optional[float] = None
    dew_point_temperature: Optional[float] = None
    wind_direction: Optional[float] = None
    wind_speed: Optional[float] = None
    visibility: Optional[float] = None
    data_source: Optional[str] = None
    station_history: Optional[List[Dict[str, Any]]] = None
    all_current_readings: Optional[List[Dict[str, Any]]] = None


@app.get("/health")
def health_check():
    return {
        "status": "UP",
        "service": "SkyGuard AI Hybrid Anomaly Engine",
        "model_loaded": MODEL_PATH.exists(),
        "model_path": str(MODEL_PATH),
        "total_stations": len(STATIONS)
    }


@app.post("/predict")
def predict_endpoint(payload: WeatherInput):
    station_id = payload.station_id or payload.stationId
    if not station_id:
        raise HTTPException(status_code=400, detail="station_id is required")

    temp = payload.temperature
    press = payload.pressure if payload.pressure is not None else payload.station_level_pressure
    if press is None and payload.sea_level_pressure is not None:
        press = payload.sea_level_pressure

    hum = payload.humidity if payload.humidity is not None else payload.relative_humidity

    data_dict = {
        "station_id": station_id,
        "timestamp": payload.timestamp,
        "temperature": temp,
        "pressure": press,
        "humidity": hum,
        "dew_point_temperature": payload.dew_point_temperature,
        "wind_direction": payload.wind_direction,
        "wind_speed": payload.wind_speed,
        "visibility": payload.visibility,
    }

    try:
        result = detect_anomaly(
            data=data_dict,
            station_history=payload.station_history,
            all_current_readings=payload.all_current_readings
        )
        # Add backwards compatibility fields for top-level access
        result["anomaly_score"] = result["ml"]["score"]
        result["reason"] = result["reasons"][0] if result.get("reasons") else "Analyzed by SkyGuard Hybrid Detector"
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/live-aws")
def live_aws_endpoint():
    stations_list = []
    for sid, meta in STATIONS.items():
        stations_list.append({
            "stationId": sid,
            "stationName": meta["name"],
            "latitude": meta["latitude"],
            "longitude": meta["longitude"],
            "elevation": meta["elevation"],
            "status": "HEALTHY"
        })
    return {
        "stations": stations_list,
        "anomalies": [],
        "stats": {
            "totalStations": len(stations_list),
            "healthyCount": len(stations_list),
            "anomalyCount": 0
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
