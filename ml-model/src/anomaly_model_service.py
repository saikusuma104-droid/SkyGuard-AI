import os
import logging
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import LocalOutlierFactor

# ============================================================
# SKYGUARD ANOMALY MODEL SERVICE - ENHANCED VERSION
# ============================================================

# Setup logging
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

# Improved decision thresholds (calibrated from training data)
# Based on comprehensive calibration analysis:
# - Normal: -0.1725 to -0.1301
# - Severe anomalies can go as low as -0.9900
# - Most anomalies still in -0.15 to -0.20 range
DECISION_THRESHOLDS = {
    "anomaly_critical": -0.50,      # Very clear anomaly (extreme)
    "anomaly_high": -0.30,           # High confidence anomaly
    "anomaly_moderate": -0.17,       # Moderate concern (below normal range)
    "warning": -0.12,                # Borderline (upper normal limit)
    "normal": 0.10                   # Normal operation
}


class AnomalyModelService:
    def __init__(self, model_file=None):
        self.model_file = model_file or DEFAULT_MODEL_FILE
        self.model = None
        self.ensemble_model = None  # Local Outlier Factor for ensemble
        self.features = FEATURES
        self.medians = DEFAULT_MEDIANS
        self.scaler = StandardScaler()  # For feature normalization
        self.is_calibrated = False
        self.load_model()
        self._initialize_ensemble()

    def _initialize_ensemble(self):
        """Initialize ensemble method (LOF) for better anomaly detection."""
        try:
            self.ensemble_model = LocalOutlierFactor(n_neighbors=20, novelty=True, contamination=0.05)
            logger.info("Ensemble model (LOF) initialized successfully")
        except Exception as e:
            logger.warning(f"Failed to initialize ensemble model: {e}")
            self.ensemble_model = None

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
                self.is_calibrated = True
            except Exception as e:
                logger.error(f"Error loading model: {e}")
                self.model = None
        else:
            logger.warning(f"Model file {self.model_file} not found.")

    def physical_validation(self, data: dict):
        reasons = []

        try:
            temp = float(data.get("temperature", 25.0))
            dew = float(data.get("dew_point_temperature", data.get("dewPointTemperature", 18.0)))
            slp = float(data.get("station_level_pressure", data.get("stationLevelPressure", data.get("pressure", 1008.5))))
            seap = float(data.get("sea_level_pressure", data.get("seaLevelPressure", 1010.0)))
            rh = float(data.get("relative_humidity", data.get("relativeHumidity", 70.0)))
            ws = float(data.get("wind_speed", data.get("windSpeed", 2.0)))
            vis = float(data.get("visibility", 6.0))

            # Handle visibility unit (convert meters to km if necessary)
            if vis > 100.0:
                vis = vis / 1000.0

            if temp < -50.0 or temp > 60.0:
                reasons.append(f"Temperature {temp}°C out of physical range (-50°C to 60°C)")

            if dew < -60.0 or dew > 50.0:
                reasons.append(f"Dew point {dew}°C out of physical range (-60°C to 50°C)")

            if slp < 800.0 or slp > 1100.0:
                reasons.append(f"Station pressure {slp} hPa out of physical range (800 to 1100 hPa)")

            if seap < 800.0 or seap > 1100.0:
                reasons.append(f"Sea level pressure {seap} hPa out of physical range (800 to 1100 hPa)")

            if rh < 0.0 or rh > 100.0:
                reasons.append(f"Relative humidity {rh}% out of physical range (0% to 100%)")

            if ws < 0.0 or ws > 100.0:
                reasons.append(f"Wind speed {ws} m/s out of physical range (0 to 100 m/s)")

            if vis < 0.0 or vis > 100.0:
                reasons.append(f"Visibility {vis} km out of physical range (0 to 100 km)")

        except Exception as e:
            reasons.append(f"Invalid input data format: {e}")

        is_valid = len(reasons) == 0
        reason_str = "Physical bounds check passed" if is_valid else " | ".join(reasons)
        return is_valid, reason_str

    def prepare_feature_vector(self, data: dict) -> pd.DataFrame:
        raw_feat = {}
        
        raw_feat["temperature"] = data.get("temperature")
        raw_feat["dew_point_temperature"] = data.get("dew_point_temperature", data.get("dewPointTemperature"))
        raw_feat["station_level_pressure"] = data.get("station_level_pressure", data.get("stationLevelPressure", data.get("pressure")))
        raw_feat["sea_level_pressure"] = data.get("sea_level_pressure", data.get("seaLevelPressure"))
        raw_feat["relative_humidity"] = data.get("relative_humidity", data.get("relativeHumidity"))
        raw_feat["wind_speed"] = data.get("wind_speed", data.get("windSpeed"))
        
        vis = data.get("visibility")
        if vis is not None:
            vis = float(vis)
            if vis > 100.0:
                vis = vis / 1000.0
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

    def _statistical_anomaly_check(self, data: dict) -> float:
        """
        Perform statistical anomaly detection based on deviation from expected values.
        Returns a score indicating statistical anomalousness (higher = more anomalous).
        """
        try:
            station_id = self.normalize_station_id(data.get("station_id", "station_01"))
            
            # Expected ranges for each station (conservative estimates)
            # These are based on historical climate patterns
            ranges = {
                "station_01": {"temp": (22, 36), "humidity": (60, 100), "pressure": (1008, 1014)},
                "station_02": {"temp": (24, 40), "humidity": (40, 80), "pressure": (1005, 1012)},
                "station_03": {"temp": (26, 40), "humidity": (15, 45), "pressure": (1000, 1010)},
                "station_04": {"temp": (25, 40), "humidity": (35, 75), "pressure": (1003, 1010)},
                "station_05": {"temp": (24, 38), "humidity": (60, 95), "pressure": (1008, 1015)},
                "station_06": {"temp": (25, 40), "humidity": (30, 70), "pressure": (1000, 1010)},
                "station_07": {"temp": (10, 28), "humidity": (50, 90), "pressure": (800, 850)},
            }
            
            stat_score = 0.0
            max_deviations = 0
            
            if station_id in ranges:
                r = ranges[station_id]
                
                # Temperature deviation
                temp = float(data.get("temperature", self.medians["temperature"]))
                temp_min, temp_max = r["temp"]
                if temp < temp_min:
                    stat_score += max(0, (temp_min - temp) / (temp_max - temp_min)) * 0.3
                elif temp > temp_max:
                    stat_score += max(0, (temp - temp_max) / (temp_max - temp_min)) * 0.3
                
                # Humidity deviation
                humidity = float(data.get("relative_humidity", self.medians["relative_humidity"]))
                humid_min, humid_max = r["humidity"]
                if humidity < humid_min:
                    stat_score += max(0, (humid_min - humidity) / (humid_max - humid_min)) * 0.3
                elif humidity > humid_max:
                    stat_score += max(0, (humidity - humid_max) / (humid_max - humid_min)) * 0.3
                
                # Pressure deviation
                pressure = float(data.get("station_level_pressure", self.medians["station_level_pressure"]))
                press_min, press_max = r["pressure"]
                if pressure < press_min:
                    stat_score += max(0, (press_min - pressure) / (press_max - press_min)) * 0.4
                elif pressure > press_max:
                    stat_score += max(0, (pressure - press_max) / (press_max - press_min)) * 0.4
            
            return min(stat_score, 1.0)
        except Exception as e:
            logger.debug(f"Statistical check error: {e}")
            return None

    def predict(self, raw_data: dict) -> dict:
        station_id = self.normalize_station_id(raw_data.get("station_id", raw_data.get("stationId", "station_01")))
        ts = raw_data.get("timestamp", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
        if hasattr(ts, "strftime"):
            ts = ts.strftime("%Y-%m-%d %H:%M:%S")

        # 1. Physical Validation Safety Check (Lightweight layer)
        is_physical_valid, physical_reason = self.physical_validation(raw_data)

        if not is_physical_valid:
            return {
                "station_id": station_id,
                "timestamp": str(ts),
                "status": "ANOMALY",
                "anomaly": True,
                "anomaly_score": -0.99,
                "confidence": 0.99,
                "severity": "CRITICAL",
                "physical_validation": {
                    "valid": False,
                    "reason": physical_reason
                },
                "ml": {
                    "anomaly": True,
                    "score": -0.99,
                    "reason": "Bypassed due to physical validation failure"
                },
                "reason": f"Physical validation failure: {physical_reason}"
            }

        # 2. Prepare ML Feature Vector (7 exact features)
        X = self.prepare_feature_vector(raw_data)

        # 3. ML Model Inference with Ensemble
        if self.model is None:
            # Fallback if model not found
            return {
                "station_id": station_id,
                "timestamp": str(ts),
                "status": "NORMAL",
                "anomaly": False,
                "anomaly_score": 0.0,
                "confidence": 0.5,
                "severity": "NORMAL",
                "physical_validation": {"valid": True, "reason": physical_reason},
                "ml": {"anomaly": False, "score": 0.0, "reason": "Model offline"},
                "reason": "Normal (Model offline)"
            }

        try:
            # Get Isolation Forest prediction
            pred = self.model.predict(X)[0]
            if_score = float(self.model.decision_function(X)[0])

            # Get ensemble prediction (Local Outlier Factor)
            lof_score = None
            lof_pred = None
            if self.ensemble_model is not None:
                try:
                    lof_pred = self.ensemble_model.predict(X)[0]
                    lof_score = float(self.ensemble_model.score_samples(X)[0])
                except:
                    pass

            # Statistical anomaly detection (bonus check)
            stat_anomaly_score = self._statistical_anomaly_check(raw_data)

            # Decision Logic with Improved Thresholds
            # Primary: Use Isolation Forest with calibrated thresholds
            status, severity, is_anomaly, ml_reason = self._make_decision(
                if_score, pred, lof_score, lof_pred, stat_anomaly_score
            )

            # Calculate confidence score
            confidence = self._calculate_confidence(if_score, lof_score, lof_pred, pred)

            return {
                "station_id": station_id,
                "timestamp": str(ts),
                "status": status,
                "anomaly": is_anomaly,
                "anomaly_score": round(if_score, 4),
                "confidence": round(confidence, 4),
                "severity": severity,
                "physical_validation": {
                    "valid": True,
                    "reason": physical_reason
                },
                "ml": {
                    "anomaly": is_anomaly,
                    "score": round(if_score, 4),
                    "ensemble_score": round(lof_score, 4) if lof_score is not None else None,
                    "reason": ml_reason
                },
                "reason": ml_reason
            }
        except Exception as e:
            logger.error(f"Inference error: {e}")
            return {
                "station_id": station_id,
                "timestamp": str(ts),
                "status": "NORMAL",
                "anomaly": False,
                "anomaly_score": 0.0,
                "confidence": 0.5,
                "severity": "NORMAL",
                "physical_validation": {"valid": True, "reason": physical_reason},
                "ml": {"anomaly": False, "score": 0.0, "reason": f"Inference error: {e}"},
                "reason": f"Inference error: {e}"
            }

    def _make_decision(self, if_score: float, pred: int, lof_score: float = None, lof_pred: int = None, stat_score: float = None) -> tuple:
        """Make anomaly decision based on improved thresholds and ensemble agreement."""
        # Isolation Forest prediction: pred == -1 means anomaly, pred == 1 means normal
        
        # Enhanced decision logic with better calibration
        # Combine ML and statistical signals
        
        # Boost if statistical check also flags anomaly
        combined_score = if_score
        if stat_score is not None and stat_score > 0.3:
            # Statistical anomaly detected - boost the ML score negatively
            combined_score = min(if_score, -0.2 - (stat_score * 0.3))
        
        if combined_score < DECISION_THRESHOLDS["anomaly_critical"]:
            # Extreme anomaly - clearly outside normal operation
            status = "ANOMALY"
            severity = "CRITICAL"
            is_anomaly = True
            reason = f"Critical anomaly detected (score: {if_score:.4f})"
            
        elif combined_score < DECISION_THRESHOLDS["anomaly_high"]:
            # High confidence anomaly
            status = "ANOMALY"
            severity = "HIGH"
            is_anomaly = True
            reason = f"High confidence anomaly (score: {if_score:.4f})"
            
        elif combined_score < DECISION_THRESHOLDS["anomaly_moderate"]:
            # Moderate anomaly - concerning but verify with ensemble/statistical
            ensemble_agrees = lof_pred == -1
            stat_agrees = stat_score is not None and stat_score > 0.4
            
            if ensemble_agrees or stat_agrees:
                status = "ANOMALY"
                severity = "MEDIUM"
                is_anomaly = True
                details = []
                if ensemble_agrees:
                    details.append(f"LOF: {lof_score:.4f}")
                if stat_agrees:
                    details.append(f"Statistical: {stat_score:.4f}")
                reason = f"Anomaly confirmed by {'ensemble' if ensemble_agrees else 'statistical'} check (IF: {if_score:.4f}, {', '.join(details)})"
            else:
                status = "WARNING"
                severity = "MEDIUM"
                is_anomaly = False
                reason = f"Moderate variance detected (score: {if_score:.4f}) - monitoring"
                
        elif combined_score < DECISION_THRESHOLDS["warning"]:
            # Borderline - normal data often scores here, verify with statistical
            if stat_score is not None and stat_score > 0.5:
                status = "ANOMALY"
                severity = "LOW"
                is_anomaly = True
                reason = f"Statistical anomaly detected (Statistical: {stat_score:.4f}, IF: {if_score:.4f})"
            else:
                status = "NORMAL"
                severity = "LOW"
                is_anomaly = False
                reason = f"Nominal telemetry (score: {if_score:.4f})"
        else:
            # Clearly normal operation
            status = "NORMAL"
            severity = "NORMAL"
            is_anomaly = False
            reason = f"Telemetry nominal within trained baseline (score: {if_score:.4f})"

        return status, severity, is_anomaly, reason

    def _calculate_confidence(self, if_score: float, lof_score: float = None, 
                             lof_pred: int = None, if_pred: int = None) -> float:
        """Calculate confidence score based on ensemble agreement and margin."""
        # Base confidence from margin to decision boundary
        if_conf = min(max(abs(if_score) / 0.5, 0.0), 1.0)  # Normalize to [0, 1]
        
        if lof_score is not None and lof_pred is not None:
            lof_conf = min(max(abs(lof_score) / 1.0, 0.0), 1.0)
            # Check agreement between models
            if (if_pred == -1 and lof_pred == -1) or (if_pred == 1 and lof_pred == 1):
                # Models agree - increase confidence
                final_conf = (if_conf + lof_conf) / 2 * 1.1
            else:
                # Models disagree - reduce confidence
                final_conf = (if_conf + lof_conf) / 2 * 0.8
        else:
            final_conf = if_conf
        
        return min(final_conf, 1.0)


# Singleton instance
anomaly_service = AnomalyModelService()
