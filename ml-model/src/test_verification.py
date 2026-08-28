import sys
import os

SRC_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(SRC_DIR))

from src.anomaly_model_service import anomaly_service
from src.live_imd_service import TRAINED_STATIONS_CONFIG

def test_nominal_stations():
    print("=" * 65)
    print("TEST 1: EVALUATING NOMINAL WEATHER DATA FOR ALL 7 STATIONS")
    print("=" * 65)
    
    all_nominal_passed = True
    
    for cfg in TRAINED_STATIONS_CONFIG:
        sample = {
            "station_id": cfg["model_id"],
            "temperature": cfg["expectedReadings"]["temperature"],
            "dew_point_temperature": round(cfg["expectedReadings"]["temperature"] - 5.0, 1),
            "station_level_pressure": cfg["expectedReadings"]["pressure"],
            "sea_level_pressure": round(cfg["expectedReadings"]["pressure"] + (1.5 if cfg["expectedReadings"]["pressure"] > 950 else 180.0), 1),
            "relative_humidity": cfg["expectedReadings"]["humidity"],
            "wind_speed": 3.0,
            "visibility": 7.0
        }
        
        res = anomaly_service.predict(sample)
        status = res.get("status")
        anomaly = res.get("anomaly")
        score = res.get("anomaly_score")
        
        is_pass = (not anomaly) and (status == "NORMAL")
        if not is_pass:
            all_nominal_passed = False
            
        badge = "✅ PASSED (HEALTHY/NORMAL)" if is_pass else "❌ FAILED (FALSE POSITIVE ANOMALY)"
        print(f"{cfg['id']} - {cfg['name']:35s} | status={status:7s} | score={score:7.4f} | {badge}")
        
    print("\n" + "=" * 65)
    print(f"NOMINAL VERIFICATION RESULT: {'ALL 7 STATIONS HEALTHY ✅' if all_nominal_passed else 'FALSE POSITIVES DETECTED ❌'}")
    print("=" * 65)
    return all_nominal_passed

def test_injected_anomalies():
    print("\n" + "=" * 65)
    print("TEST 2: EVALUATING INJECTED ANOMALOUS WEATHER TELEMETRY")
    print("=" * 65)
    
    anomaly_samples = [
        {
            "name": "Extreme Heatwave Spike (Tirupati 48.5°C)",
            "data": {
                "station_id": "station_02",
                "temperature": 48.5,
                "dew_point_temperature": 28.0,
                "station_level_pressure": 1008.0,
                "sea_level_pressure": 1009.5,
                "relative_humidity": 18.0,
                "wind_speed": 12.0,
                "visibility": 2.0
            }
        },
        {
            "name": "Severe Pressure Drop (Thiruvananthapuram 938 hPa)",
            "data": {
                "station_id": "station_01",
                "temperature": 28.5,
                "dew_point_temperature": 26.0,
                "station_level_pressure": 938.0,
                "sea_level_pressure": 939.5,
                "relative_humidity": 95.0,
                "wind_speed": 22.0,
                "visibility": 1.0
            }
        }
    ]
    
    for item in anomaly_samples:
        res = anomaly_service.predict(item["data"])
        status = res.get("status")
        anomaly = res.get("anomaly")
        score = res.get("anomaly_score")
        reason = res.get("reason")
        
        print(f"Scenario: {item['name']}")
        print(f"  Result: status={status}, anomaly={anomaly}, score={score:.4f}")
        print(f"  Reason: {reason}\n")

if __name__ == "__main__":
    test_nominal_stations()
    test_injected_anomalies()
