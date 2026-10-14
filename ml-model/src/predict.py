import sys
import json
from pathlib import Path
import pandas as pd
from typing import Dict, Any

# Ensure src is in Python path
SRC_DIR = Path(__file__).resolve().parent
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

from config import STATIONS, MODEL_PATH
from hybrid_detector import detect_anomaly


def predict(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Primary prediction entry point wrapper delegating to the Hybrid Anomaly Detector.
    """
    result = detect_anomaly(data)
    
    # Add backwards-compatible top-level keys expected by existing Java/Python consumers
    result["anomaly_score"] = result["ml"]["score"]
    result["reason"] = result["reasons"][0] if result.get("reasons") else "Observation analyzed by SkyGuard Hybrid Detector"
    
    return result


if __name__ == "__main__":
    try:
        if len(sys.argv) > 1:
            input_data = json.loads(sys.argv[1])
        else:
            # Default demo reading for CLI testing
            input_data = {
                "station_id": "station_01",
                "temperature": 32.5,
                "pressure": 1008.2,
                "humidity": 65.0
            }

        res = predict(input_data)
        print(json.dumps(res, indent=2))

    except Exception as e:
        err = {"error": str(e)}
        print(json.dumps(err, indent=2))
        sys.exit(1)
