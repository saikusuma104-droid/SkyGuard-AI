import sys
import unittest
import numpy as np
from pathlib import Path

# Add src to Python path
SRC_DIR = Path(__file__).resolve().parents[1] / "src"
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

from hybrid_detector import detect_anomaly, BASELINE_MANAGER
from data_validation import validate_reading
from spatial_detector import evaluate_spatial_rules


class TestHybridAnomalyDetector(unittest.TestCase):

    def setUp(self):
        # Reset history manager before each test
        BASELINE_MANAGER.history.clear()

    def test_01_normal_reading(self):
        """TEST 1: Normal reading expected to be NORMAL with anomaly=False."""
        reading = {
            "station_id": "station_01",
            "temperature": 32.5,
            "pressure": 1008.2,
            "humidity": 65.0,
            "timestamp": "2026-09-02T10:00:00Z"
        }
        res = detect_anomaly(reading)
        self.assertFalse(res["anomaly"])
        self.assertEqual(res["severity"], "NORMAL")
        self.assertGreaterEqual(res["confidence"], 0.70)
        self.assertTrue(any("consistent" in r.lower() for r in res["reasons"]))

    def test_02_temperature_sudden_spike(self):
        """TEST 2: Temperature sudden spike triggers temporal rule."""
        history = [
            {"station_id": "station_01", "temperature": 20.0, "pressure": 1010.0, "humidity": 60.0, "timestamp": "2026-09-02T06:00:00Z"},
            {"station_id": "station_01", "temperature": 21.0, "pressure": 1010.0, "humidity": 60.0, "timestamp": "2026-09-02T07:00:00Z"},
            {"station_id": "station_01", "temperature": 20.8, "pressure": 1010.0, "humidity": 60.0, "timestamp": "2026-09-02T08:00:00Z"},
            {"station_id": "station_01", "temperature": 21.2, "pressure": 1010.0, "humidity": 60.0, "timestamp": "2026-09-02T09:00:00Z"},
        ]
        cur_reading = {
            "station_id": "station_01",
            "temperature": 39.0,  # Sudden spike of ~17.8°C in 1 hour
            "pressure": 1010.0,
            "humidity": 60.0,
            "timestamp": "2026-09-02T10:00:00Z"
        }
        res = detect_anomaly(cur_reading, station_history=history)
        self.assertTrue(res["rules"]["temporal"])
        self.assertTrue(any("increased sharply" in r for r in res["reasons"]))

    def test_03_temperature_sudden_drop(self):
        """TEST 3: Temperature sudden drop triggers temporal rule."""
        history = [
            {"station_id": "station_01", "temperature": 32.0, "pressure": 1010.0, "humidity": 50.0, "timestamp": "2026-09-02T09:00:00Z"}
        ]
        cur_reading = {
            "station_id": "station_01",
            "temperature": 15.0,  # Drop of 17°C in 1 hour
            "pressure": 1010.0,
            "humidity": 50.0,
            "timestamp": "2026-09-02T10:00:00Z"
        }
        res = detect_anomaly(cur_reading, station_history=history)
        self.assertTrue(res["rules"]["temporal"])
        self.assertTrue(any("dropped sharply" in r for r in res["reasons"]))

    def test_04_humidity_sudden_change(self):
        """TEST 4: Humidity sudden drop triggers temporal rule."""
        history = [
            {"station_id": "station_01", "temperature": 28.0, "pressure": 1010.0, "humidity": 80.0, "timestamp": "2026-09-02T09:00:00Z"}
        ]
        cur_reading = {
            "station_id": "station_01",
            "temperature": 28.0,
            "pressure": 1010.0,
            "humidity": 25.0,  # Drop of 55% in 1 hour
            "timestamp": "2026-09-02T10:00:00Z"
        }
        res = detect_anomaly(cur_reading, station_history=history)
        self.assertTrue(res["rules"]["temporal"])
        self.assertTrue(any("Humidity dropped sharply" in r for r in res["reasons"]))

    def test_05_pressure_sudden_change(self):
        """TEST 5: Sudden pressure drop triggers pressure temporal rule."""
        history = [
            {"station_id": "station_01", "temperature": 28.0, "pressure": 1012.0, "humidity": 60.0, "timestamp": "2026-09-02T09:00:00Z"}
        ]
        cur_reading = {
            "station_id": "station_01",
            "temperature": 28.0,
            "pressure": 998.0,  # Drop of 14 hPa in 1 hour
            "humidity": 60.0,
            "timestamp": "2026-09-02T10:00:00Z"
        }
        res = detect_anomaly(cur_reading, station_history=history)
        self.assertTrue(res["rules"]["temporal"])
        self.assertTrue(any("Pressure dropped sharply" in r for r in res["reasons"]))

    def test_06_frozen_temperature_sensor(self):
        """TEST 6: 5 consecutive identical temperature readings trigger freeze rule."""
        history = [
            {"station_id": "station_01", "temperature": 28.4, "pressure": 1010.0, "humidity": 60.0, "timestamp": "2026-09-02T06:00:00Z"},
            {"station_id": "station_01", "temperature": 28.4, "pressure": 1010.0, "humidity": 60.0, "timestamp": "2026-09-02T07:00:00Z"},
            {"station_id": "station_01", "temperature": 28.4, "pressure": 1010.0, "humidity": 60.0, "timestamp": "2026-09-02T08:00:00Z"},
            {"station_id": "station_01", "temperature": 28.4, "pressure": 1010.0, "humidity": 60.0, "timestamp": "2026-09-02T09:00:00Z"},
        ]
        cur_reading = {
            "station_id": "station_01",
            "temperature": 28.4,
            "pressure": 1010.0,
            "humidity": 60.0,
            "timestamp": "2026-09-02T10:00:00Z"
        }
        res = detect_anomaly(cur_reading, station_history=history)
        self.assertTrue(res["rules"]["freeze"])
        self.assertTrue(any("stuck at nearly the same value" in r for r in res["reasons"]))

    def test_07_missing_pressure(self):
        """TEST 7: Missing pressure preserves missingness flag without inventing fake data."""
        reading = {
            "station_id": "station_01",
            "temperature": 30.0,
            "pressure": None,
            "humidity": 60.0,
            "timestamp": "2026-09-02T10:00:00Z"
        }
        res = detect_anomaly(reading)
        self.assertIsNone(res["pressure"])
        self.assertTrue(any("Pressure sensor value is missing" in r for r in res["reasons"]))
        # Confidence reduced due to missing sensor
        self.assertLess(res["confidence"], 0.85)

    def test_08_physically_impossible_humidity(self):
        """TEST 8: Humidity > 100% triggers physical range violation and HIGH severity."""
        reading = {
            "station_id": "station_01",
            "temperature": 30.0,
            "pressure": 1010.0,
            "humidity": 120.0,  # Impossible humidity
            "timestamp": "2026-09-02T10:00:00Z"
        }
        res = detect_anomaly(reading)
        self.assertTrue(res["anomaly"])
        self.assertEqual(res["severity"], "HIGH")
        self.assertTrue(res["rules"]["range"])
        self.assertTrue(any("outside valid 0–100% range" in r for r in res["reasons"]))

    def test_09_ml_anomaly_rules_normal(self):
        """TEST 9: ML anomaly alone without rule violations results in MEDIUM/REVIEW, not automatic HIGH."""
        reading = {
            "station_id": "station_01",
            "temperature": 38.0,
            "pressure": 1002.0,
            "humidity": 35.0,
            "timestamp": "2026-09-02T10:00:00Z"
        }
        res = detect_anomaly(reading)
        # If ML flags anomaly but rules are clean
        if res["ml"]["anomaly"]:
            self.assertIn(res["severity"], ["MEDIUM", "LOW", "NORMAL"])

    def test_10_ml_anomaly_plus_temporal_rule(self):
        """TEST 10: ML anomaly combined with strong temporal rule yields HIGH severity."""
        history = [
            {"station_id": "station_01", "temperature": 22.0, "pressure": 1010.0, "humidity": 70.0, "timestamp": "2026-09-02T09:00:00Z"}
        ]
        cur_reading = {
            "station_id": "station_01",
            "temperature": 44.0,  # Spike + ML unusual
            "pressure": 1010.0,
            "humidity": 20.0,
            "timestamp": "2026-09-02T10:00:00Z"
        }
        res = detect_anomaly(cur_reading, station_history=history)
        self.assertTrue(res["anomaly"])
        self.assertEqual(res["severity"], "HIGH")

    def test_11_unusual_weather_with_spatial_neighbor_agreement(self):
        """TEST 11: Regional weather event confirmed by nearby stations reduces sensor fault classification."""
        target = {
            "station_id": "station_01",  # Tuni
            "temperature": 43.0,
            "pressure": 1008.0,
            "humidity": 25.0,
            "timestamp": "2026-09-02T10:00:00Z"
        }
        all_readings = [
            target,
            {"station_id": "station_07", "temperature": 42.5, "pressure": 1007.5, "humidity": 26.0, "timestamp": "2026-09-02T10:00:00Z"}, # Bhadrachalam nearby
            {"station_id": "station_03", "temperature": 42.0, "pressure": 1008.0, "humidity": 27.0, "timestamp": "2026-09-02T10:00:00Z"}  # Tirupati
        ]
        res = detect_anomaly(target, all_current_readings=all_readings)
        self.assertTrue(any("Nearby stations show similar" in r for r in res["reasons"]))
        self.assertIn(res["severity"], ["MEDIUM", "NORMAL", "LOW"])

    def test_12_coonoor_high_elevation_pressure(self):
        """TEST 12: Coonoor station (1850m elevation) pressure ~815 hPa is handled dynamically without false positives."""
        coonoor_reading = {
            "station_id": "station_05",  # Coonoor
            "temperature": 18.5,
            "pressure": 815.0,  # Standard atmospheric pressure at 1850m elevation
            "humidity": 75.0,
            "timestamp": "2026-09-02T10:00:00Z"
        }
        res = detect_anomaly(coonoor_reading)
        self.assertFalse(res["rules"]["range"])
        self.assertFalse(res["anomaly"])
        self.assertEqual(res["severity"], "NORMAL")

    def test_13_obvious_extreme_input(self):
        """TEST 13: Obvious extreme input evaluated by rule engine independently yielding HIGH severity."""
        extreme_reading = {
            "station_id": "station_01",
            "temperature": 58.0,  # Extreme temp near 60°C bound
            "pressure": 800.0,   # Lowland extreme low pressure
            "humidity": 95.0,
            "timestamp": "2026-09-02T10:00:00Z"
        }
        res = detect_anomaly(extreme_reading)
        self.assertTrue(res["anomaly"])
        self.assertEqual(res["severity"], "HIGH")
        self.assertTrue(res["rules"]["range"])


if __name__ == "__main__":
    unittest.main()
