import os
import json
import math
import urllib.request
import pandas as pd
import numpy as np
from datetime import datetime
from src.predict import predict

# ============================================================
# TRAINED IMD STATIONS CONFIGURATION
# ============================================================

TRAINED_STATIONS_CONFIG = [
    {
        "model_id": "station_01",
        "id": "station_01",
        "name": "Thiruvananthapuram",
        "location": "Thiruvananthapuram",
        "state": "Kerala",
        "lat": 8.5241,
        "lng": 76.9366,
        "elevationM": 60,
        "stationType": "Coastal Observatory",
        "installYear": 2022
    },
    {
        "model_id": "station_02",
        "id": "station_02",
        "name": "Tirupati",
        "location": "Tirupati",
        "state": "Andhra Pradesh",
        "lat": 13.6288,
        "lng": 79.4192,
        "elevationM": 160,
        "stationType": "Primary Synoptic",
        "installYear": 2023
    },
    {
        "model_id": "station_03",
        "id": "station_03",
        "name": "Bhadrachalam",
        "location": "Bhadrachalam",
        "state": "Telangana",
        "lat": 17.6688,
        "lng": 80.8928,
        "elevationM": 50,
        "stationType": "River Basin AWS",
        "installYear": 2020
    },
    {
        "model_id": "station_04",
        "id": "station_04",
        "name": "Nalgonda",
        "location": "Nalgonda",
        "state": "Telangana",
        "lat": 17.0577,
        "lng": 79.2684,
        "elevationM": 230,
        "stationType": "Semi-Arid AWS",
        "installYear": 2023
    },
    {
        "model_id": "station_05",
        "id": "station_05",
        "name": "Tuni",
        "location": "Tuni",
        "state": "Andhra Pradesh",
        "lat": 17.3573,
        "lng": 82.5443,
        "elevationM": 15,
        "stationType": "Coastal AWS",
        "installYear": 2024
    },
    {
        "model_id": "station_06",
        "id": "station_06",
        "name": "Kurnool",
        "location": "Kurnool",
        "state": "Andhra Pradesh",
        "lat": 15.8281,
        "lng": 78.0373,
        "elevationM": 275,
        "stationType": "Rayalaseema AWS",
        "installYear": 2021
    },
    {
        "model_id": "station_07",
        "id": "station_07",
        "name": "Coonoor",
        "location": "Coonoor",
        "state": "Tamil Nadu",
        "lat": 11.3530,
        "lng": 76.7959,
        "elevationM": 1850,
        "stationType": "High-Altitude Hill AWS",
        "installYear": 2022
    }
]

# ============================================================
# FETCH LIVE METEOROLOGICAL TELEMETRY
# ============================================================

def fetch_live_telemetry_for_station(cfg):
    lat = cfg["lat"]
    lng = cfg["lng"]
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    api_url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lng}&current=temperature_2m,relative_humidity_2m,dew_point_2m,surface_pressure,wind_speed_10m,wind_direction_10m,visibility"
    
    try:
        req = urllib.request.Request(api_url, headers={"User-Agent": "SkyGuard-AI/1.0"})
        with urllib.request.urlopen(req, timeout=3) as resp:
            data = json.loads(resp.read().decode())
            current = data.get("current", {})
            
            temp = float(current.get("temperature_2m", cfg["expectedReadings"]["temperature"]))
            dew_point = float(current.get("dew_point_2m", temp - 4.0))
            humidity = float(current.get("relative_humidity_2m", cfg["expectedReadings"]["humidity"]))
            pressure = float(current.get("surface_pressure", cfg["expectedReadings"]["pressure"]))
            wind_speed = float(current.get("wind_speed_10m", 3.0)) / 3.6  # convert km/h to m/s if needed
            wind_dir = float(current.get("wind_direction_10m", 180.0))
            visibility = float(current.get("visibility", 10000)) / 1000.0  # convert m to km
            
            return {
                "timestamp": now_str,
                "temperature": round(temp, 1),
                "dew_point_temperature": round(dew_point, 1),
                "relative_humidity": round(humidity, 1),
                "pressure": round(pressure, 1),
                "wind_speed": round(wind_speed, 1),
                "wind_direction": round(wind_dir, 1),
                "visibility": round(visibility, 1),
                "is_live_feed": True
            }
    except Exception as e:
        # Fallback to trained baseline values
        return {
            "timestamp": now_str,
            "temperature": cfg["expectedReadings"]["temperature"],
            "dew_point_temperature": round(cfg["expectedReadings"]["temperature"] - 4.5, 1),
            "relative_humidity": cfg["expectedReadings"]["humidity"],
            "pressure": cfg["expectedReadings"]["pressure"],
            "wind_speed": 3.2,
            "wind_direction": 180.0,
            "visibility": 10.0,
            "is_live_feed": False
        }

# ============================================================
# GET LIVE TRAINED STATIONS AND ANOMALY PREDICTIONS
# ============================================================

def get_live_trained_stations():
    stations_list = []
    anomalies_list = []
    
    total_stations = len(TRAINED_STATIONS_CONFIG)
    healthy_count = 0
    suspicious_count = 0
    anomaly_count = 0
    offline_count = 0
    
    now_str = datetime.now().strftime("%H:%M:%S")
    
    for cfg in TRAINED_STATIONS_CONFIG:
        telemetry = fetch_live_telemetry_for_station(cfg)
        
        # Prepare vector for trained ML model
        predict_vector = {
            "station_id": cfg["model_id"],
            "timestamp": telemetry["timestamp"],
            "temperature": telemetry["temperature"],
            "dew_point_temperature": telemetry["dew_point_temperature"],
            "wind_direction": telemetry["wind_direction"],
            "wind_speed": telemetry["wind_speed"],
            "relative_humidity": telemetry["relative_humidity"],
            "visibility": telemetry["visibility"]
        }
        
        # Pass vector to trained Isolation Forest model
        try:
            ml_res = predict(predict_vector)
            is_anomaly = ml_res.get("anomaly", False)
            score = ml_res.get("anomaly_score", 0.1)
            severity = ml_res.get("severity", "NORMAL")
        except Exception as e:
            is_anomaly = False
            score = 0.1
            severity = "NORMAL"
            
        status = "healthy"
        if is_anomaly:
            if severity in ["CRITICAL", "HIGH"]:
                status = "anomaly"
                anomaly_count += 1
            else:
                status = "suspicious"
                suspicious_count += 1
        else:
            healthy_count += 1
            
        confidence = int(np.clip(85 + abs(score) * 30, 80, 99))
        trust_score = 15 if status == "anomaly" else (55 if status == "suspicious" else 99)
        

