import os
import joblib
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import IsolationForest
from sklearn.pipeline import Pipeline

FEATURES = [
    "temperature",
    "dew_point_temperature",
    "station_level_pressure",
    "sea_level_pressure",
    "relative_humidity",
    "wind_speed",
    "visibility"
]

np.random.seed(42)
n_per_station = 1000

station_configs = [
    # station_01: Thiruvananthapuram
    {"temp": (24, 34), "dew": (20, 25), "slp": (1008, 1014), "seap": (1010, 1016), "rh": (65, 95), "ws": (1, 6), "vis": (4, 10)},
    # station_02: Tirupati
    {"temp": (24, 38), "dew": (18, 24), "slp": (1004, 1012), "seap": (1006, 1014), "rh": (45, 85), "ws": (1, 6), "vis": (4, 10)},
    # station_03: Bhadrachalam
    {"temp": (25, 42), "dew": (15, 22), "slp": (998, 1010), "seap": (1002, 1012), "rh": (30, 75), "ws": (1, 5), "vis": (4, 10)},
    # station_04: Nalgonda
    {"temp": (24, 40), "dew": (16, 23), "slp": (1000, 1010), "seap": (1004, 1014), "rh": (35, 80), "ws": (1, 5), "vis": (4, 10)},
    # station_05: Tuni
    {"temp": (24, 36), "dew": (20, 25), "slp": (1006, 1014), "seap": (1008, 1016), "rh": (60, 90), "ws": (1, 6), "vis": (4, 10)},
    # station_06: Kurnool
    {"temp": (24, 40), "dew": (16, 23), "slp": (998, 1008), "seap": (1002, 1012), "rh": (30, 75), "ws": (1, 5), "vis": (4, 10)},
    # station_07: Coonoor (High Altitude)
    {"temp": (12, 26), "dew": (10, 18), "slp": (815, 845), "seap": (1008, 1018), "rh": (50, 95), "ws": (1, 5), "vis": (4, 10)},
]

samples = []
for cfg in station_configs:
    t = np.random.uniform(cfg["temp"][0], cfg["temp"][1], n_per_station)
    d = np.random.uniform(cfg["dew"][0], cfg["dew"][1], n_per_station)
    slp = np.random.uniform(cfg["slp"][0], cfg["slp"][1], n_per_station)
    seap = np.random.uniform(cfg["seap"][0], cfg["seap"][1], n_per_station)
    rh = np.random.uniform(cfg["rh"][0], cfg["rh"][1], n_per_station)
    ws = np.random.uniform(cfg["ws"][0], cfg["ws"][1], n_per_station)
    vis = np.random.uniform(cfg["vis"][0], cfg["vis"][1], n_per_station)

    for i in range(n_per_station):
        samples.append({
            "temperature": round(t[i], 1),
            "dew_point_temperature": round(d[i], 1),
            "station_level_pressure": round(slp[i], 1),
            "sea_level_pressure": round(seap[i], 1),
            "relative_humidity": round(rh[i], 1),
            "wind_speed": round(ws[i], 1),
            "visibility": round(vis[i], 1)
        })

df = pd.DataFrame(samples)

scaler = StandardScaler()
model = IsolationForest(contamination=0.02, n_estimators=200, random_state=42)

pipeline = Pipeline([
    ("scaler", scaler),
    ("model", model)
])

pipeline.fit(df[FEATURES])

out_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models")
os.makedirs(out_dir, exist_ok=True)
model_path = os.path.join(out_dir, "isolation_forest.joblib")

payload = {
    "model": pipeline,
    "features": FEATURES,
    "medians": {
        "temperature": 28.0,
        "dew_point_temperature": 20.0,
        "station_level_pressure": 1008.5,
        "sea_level_pressure": 1010.0,
        "relative_humidity": 70.0,
        "wind_speed": 2.5,
        "visibility": 8.0
    }
}

joblib.dump(payload, model_path)
print(f"Model successfully saved to {model_path}")
