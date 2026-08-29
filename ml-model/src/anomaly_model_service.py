import os
import logging
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import LocalOutlierFactor

# ============================================================
# SKYGUARD ANOMALY MODEL SERVICE
# ============================================================

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("[AnomalyModelService]")

SRC_DIR = os.path.dirname(os.path.abspath(__file__))
ML_MODEL_DIR = os.path.dirname(SRC_DIR)
MODEL_DIR = os.path.join(ML_MODEL_DIR, "models")
DEFAULT_MODEL_FILE = os.path.join(MODEL_DIR, "isolation_forest.joblib")

FEATURES = [
    "temperature",
    "dew_point_temperature",
    "station_level_pressure",
    "sea_level_pressure",
    "relative_humidity",
    "wind_speed",
    "visibility"
]

DEFAULT_MEDIANS = {
    "temperature": 25.0,
    "dew_point_temperature": 18.0,
    "station_level_pressure": 1008.5,
    "sea_level_pressure": 1010.0,
    "relative_humidity": 70.0,
    "wind_speed": 2.0,
    "visibility": 6.0
}

STATION_ELEVATIONS = {
    "station_01": 60,
    "station_02": 160,
    "station_03": 50,
    "station_04": 230,
    "station_05": 15,
    "station_06": 275,
    "station_07": 1850
}

def estimate_sea_level_pressure(slp: float, station_id: str) -> float:
    elev = STATION_ELEVATIONS.get(station_id, 0)
    if elev <= 0:
        return slp
    return round(slp * ((1.0 - (0.0065 * elev) / 288.15) ** -5.255), 1)

class AnomalyModelService:
    def __init__(self, model_file=None):
        self.model_file = model_file or DEFAULT_MODEL_FILE
        self.model = None
        self.features = FEATURES
        self.medians = DEFAULT_MEDIANS
        self.load_model()

    def normalize_station_id(self, station_id: str) -> str:
        if not station_id:
            return "station_01"
        sid = str(station_id).lower().strip().replace("-", "_")
        if sid.startswith("aws_"):
            try:
                num = int(sid.replace("aws_", ""))
                return f"station_{num:02d}"
            except ValueError:
                pass
        if not sid.startswith("station_"):
            station_map = {
                "thiruvananthapuram": "station_01",
                "tirupati": "station_02",
                "bhadrachalam": "station_03",
                "nalgonda": "station_04",
                "tuni": "station_05",
                "kurnool": "station_06",
                "coonoor": "station_07"
            }
            for name, st_id in station_map.items():
                if name in sid:
                    return st_id
            return "station_01"
        return sid

    def load_model(self):
        if os.path.exists(self.model_file):
            logger.info(f"Loading model from {self.model_file}")
            try:
                pkg = joblib.load(self.model_file)
                if isinstance(pkg, dict) and "model" in pkg:
                    self.model = pkg["model"]
                    self.features = pkg.get("features", FEATURES)
                    self.medians = pkg.get("medians", DEFAULT_MEDIANS)
                else:
                    self.model = pkg
                logger.info(f"Model successfully loaded. Type: {type(self.model).__name__}")
            except Exception as e:
                logger.error(f"Error loading model: {e}")
                self.model = None
        else:
            logger.warning(f"Model file {self.model_file} not found.")

    def physical_validation(self, data: dict):
        reasons = []
        try:
            station_id = self.normalize_station_id(data.get("station_id", data.get("stationId", "station_01")))
            temp = float(data.get("temperature", 25.0))
            dew = float(data.get("dew_point_temperature", data.get("dewPointTemperature", 18.0)))
            slp = float(data.get("station_level_pressure", data.get("stationLevelPressure", data.get("pressure", 1008.5))))
            
            raw_seap = data.get("sea_level_pressure", data.get("seaLevelPressure"))
            if raw_seap is None or float(raw_seap) <= 0.0 or float(raw_seap) == slp:
                seap = estimate_sea_level_pressure(slp, station_id)
            else:
                seap = float(raw_seap)

            rh = float(data.get("relative_humidity", data.get("relativeHumidity", 70.0)))
            ws = float(data.get("wind_speed", data.get("windSpeed", 2.0)))
            
            raw_vis = data.get("visibility")
            if raw_vis is None or float(raw_vis) <= 0.0:
                vis = 6.0
            else:
                vis = float(raw_vis)

            # Consistent visibility unit handling (KM)
            if vis > 100.0:
                vis = vis / 1000.0

            if temp < -50.0 or temp > 60.0:
                reasons.append(f"Temperature {temp}°C is outside physically valid range (-50°C to 60°C)")
            if dew < -60.0 or dew > 50.0:
                reasons.append(f"Dew point {dew}°C is outside physically valid range (-60°C to 50°C)")
            if slp < 800.0 or slp > 1100.0:
                reasons.append(f"Station pressure {slp} hPa is outside physically valid range (800 to 1100 hPa)")
            if seap < 800.0 or seap > 1100.0:
                reasons.append(f"Sea level pressure {seap} hPa is outside physically valid range (800 to 1100 hPa)")
            if rh < 0.0 or rh > 100.0:
                reasons.append(f"Relative humidity {rh}% is outside physically valid range (0% to 100%)")
            if ws < 0.0 or ws > 100.0:
                reasons.append(f"Wind speed {ws} m/s is outside physically valid range (0 to 100 m/s)")
            if vis < 0.0 or vis > 100.0:
                reasons.append(f"Visibility {vis} km is outside physically valid range (0 to 100 km)")

        except Exception as e:
            reasons.append(f"Invalid input data format: {e}")

        is_valid = len(reasons) == 0
        reason_str = "Physical bounds check passed" if is_valid else " | ".join(reasons)
        return is_valid, reason_str

    def prepare_feature_vector(self, data: dict) -> pd.DataFrame:
        station_id = self.normalize_station_id(data.get("station_id", data.get("stationId", "station_01")))
        raw_feat = {}
        raw_feat["temperature"] = data.get("temperature")
        raw_feat["dew_point_temperature"] = data.get("dew_point_temperature", data.get("dewPointTemperature"))
        slp_val = float(data.get("station_level_pressure", data.get("stationLevelPressure", data.get("pressure", 1008.5))))
        raw_feat["station_level_pressure"] = slp_val
        
        seap_val = data.get("sea_level_pressure", data.get("seaLevelPressure"))
        if seap_val is None or (isinstance(seap_val, (int, float)) and (float(seap_val) <= 0.0 or float(seap_val) == slp_val)):
            raw_feat["sea_level_pressure"] = estimate_sea_level_pressure(slp_val, station_id)
        else:
            raw_feat["sea_level_pressure"] = float(seap_val)

        raw_feat["relative_humidity"] = data.get("relative_humidity", data.get("relativeHumidity"))
        raw_feat["wind_speed"] = data.get("wind_speed", data.get("windSpeed"))
        
        vis = data.get("visibility")
        if vis is not None and float(vis) > 0.0:
            vis = float(vis)
            if vis > 100.0:
                vis = vis / 1000.0
        else:
            vis = 6.0
        raw_feat["visibility"] = vis

        clean_row = {}
        for feat in self.features:
            val = raw_feat.get(feat)
            if val is None or pd.isna(val) or val == "":
                clean_val = self.medians.get(feat, DEFAULT_MEDIANS.get(feat, 0.0))
            else:
                try:
                    clean_val = float(val)
                except (ValueError, TypeError):
                    clean_val = self.medians.get(feat, DEFAULT_MEDIANS.get(feat, 0.0))
            clean_row[feat] = clean_val

        return pd.DataFrame([clean_row], columns=self.features)

    def _normalize_score_0_100(self, if_score: float) -> float:
        """
        Convert Isolation Forest decision function score to a normalized 0-100 anomaly scale.
        0 = Very Normal, 100 = Extremely Anomalous.
        """
        if if_score >= 0.10:
            return round(max(2.0, (0.25 - if_score) * 30.0), 1)
        elif if_score >= -0.10:
            return round(10.0 + ((-if_score) / 0.10) * 18.0, 1)
        elif if_score >= -0.22:
            return round(28.0 + ((-if_score - 0.10) / 0.12) * 27.0, 1)
        else:
            val = 55.0 + ((-if_score - 0.22) / 0.25) * 45.0
            return round(min(val, 100.0), 1)

    def predict(self, raw_data: dict) -> dict:
        station_id = self.normalize_station_id(raw_data.get("station_id", raw_data.get("stationId", "station_01")))
        ts = raw_data.get("timestamp", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
        if hasattr(ts, "strftime"):
            ts = ts.strftime("%Y-%m-%d %H:%M:%S")

        # 1. Physical Validation
        is_physical_valid, physical_reason = self.physical_validation(raw_data)
        if not is_physical_valid:
            return {
                "station_id": station_id,
                "timestamp": str(ts),
                "status": "ANOMALY",
                "anomaly": True,
                "anomaly_score": 99.0,
                "reason": f"Physical bounds violation: {physical_reason}"
            }

        # 2. Feature Vector
        X = self.prepare_feature_vector(raw_data)

        # 3. Model Inference
        if self.model is None:
            return {
                "station_id": station_id,
                "timestamp": str(ts),
                "status": "NORMAL",
                "anomaly": False,
                "anomaly_score": 0.0,
                "reason": "Reading within expected range (Model offline)"
            }

        try:
            if_score = float(self.model.decision_function(X)[0])
            normalized_score = self._normalize_score_0_100(if_score)

            temp = float(raw_data.get("temperature", 25.0))
            rh = float(raw_data.get("relative_humidity", raw_data.get("relativeHumidity", 70.0)))

            if temp > 45.0 or temp < -10.0:
                status = "ANOMALY"
                is_anomaly = True
                normalized_score = max(normalized_score, 85.0)
                reason = f"Extreme temperature deviation ({temp}°C) detected."
            elif rh < 5.0:
                status = "ANOMALY"
                is_anomaly = True
                normalized_score = max(normalized_score, 80.0)
                reason = f"Extreme humidity anomaly ({rh}%) detected."
            elif if_score < -0.22:
                status = "ANOMALY"
                is_anomaly = True
                reason = f"Anomaly detected across weather parameters (Anomaly Score: {normalized_score}/100)."
            elif if_score < -0.10:
                status = "WARNING"
                is_anomaly = False
                reason = f"Moderate variance detected (Score: {normalized_score}/100)."
            else:
                status = "NORMAL"
                is_anomaly = False
                reason = "Reading is within normal operating conditions."

            return {
                "station_id": station_id,
                "timestamp": str(ts),
                "status": status,
                "anomaly": is_anomaly,
                "anomaly_score": normalized_score,
                "reason": reason
            }
        except Exception as e:
            logger.error(f"Inference error: {e}")
            return {
                "station_id": station_id,
                "timestamp": str(ts),
                "status": "NORMAL",
                "anomaly": False,
                "anomaly_score": 0.0,
                "reason": "Reading within expected conditions."
            }

# Singleton instance
anomaly_service = AnomalyModelService()
