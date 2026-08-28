"""
Model Calibration and Auto-tuning Script for SkyGuard ML

This script analyzes decision scores and automatically calibrates thresholds
for better anomaly detection performance.
"""

import os
import json
import numpy as np
import pandas as pd
from datetime import datetime
from anomaly_model_service import anomaly_service

# ============================================================
# CALIBRATION DATA GENERATION
# ============================================================

def generate_calibration_samples():
    """Generate a comprehensive set of test samples for calibration."""
    
    # Reference station baseline values
    baselines = {
        "station_01": {"temp": 29.5, "humidity": 82, "pressure": 1011.2},
        "station_02": {"temp": 32.0, "humidity": 65, "pressure": 1008.5},
        "station_03": {"temp": 33.5, "humidity": 30, "pressure": 1004.0},
        "station_04": {"temp": 33.2, "humidity": 55, "pressure": 1006.0},
        "station_05": {"temp": 31.0, "humidity": 78, "pressure": 1010.0},
        "station_06": {"temp": 33.8, "humidity": 50, "pressure": 1003.5},
        "station_07": {"temp": 19.5, "humidity": 70, "pressure": 825.0},
    }
    
    samples = {"normal": [], "mild_anomaly": [], "moderate_anomaly": [], "severe_anomaly": []}
    
    for station_id, baseline in baselines.items():
        # Normal conditions - slight variations
        for variation in [-1, 0, 1]:
            samples["normal"].append({
                "station_id": station_id,
                "temperature": baseline["temp"] + variation * 0.5,
                "dew_point_temperature": baseline["temp"] - 5,
                "station_level_pressure": baseline["pressure"],
                "sea_level_pressure": baseline["pressure"] + 1.5,
                "relative_humidity": baseline["humidity"],
                "wind_speed": 3.0 + variation * 0.5,
                "visibility": 8.0,
                "category": "normal"
            })
        
        # Mild anomalies (5-10% deviation)
        samples["mild_anomaly"].append({
            "station_id": station_id,
            "temperature": baseline["temp"] + 3,
            "dew_point_temperature": baseline["temp"] - 2,
            "station_level_pressure": baseline["pressure"] - 3,
            "sea_level_pressure": baseline["pressure"] - 1,
            "relative_humidity": baseline["humidity"] + 15,
            "wind_speed": 8.0,
            "visibility": 6.0,
            "category": "mild_anomaly"
        })
        
        # Moderate anomalies (10-20% deviation)
        samples["moderate_anomaly"].append({
            "station_id": station_id,
            "temperature": baseline["temp"] + 8,
            "dew_point_temperature": baseline["temp"] + 3,
            "station_level_pressure": baseline["pressure"] - 8,
            "sea_level_pressure": baseline["pressure"] - 5,
            "relative_humidity": baseline["humidity"] + 25,
            "wind_speed": 15.0,
            "visibility": 3.0,
            "category": "moderate_anomaly"
        })
        
        # Severe anomalies (>20% deviation)
        samples["severe_anomaly"].append({
            "station_id": station_id,
            "temperature": baseline["temp"] + 15,
            "dew_point_temperature": baseline["temp"] + 10,
            "station_level_pressure": baseline["pressure"] - 20,
            "sea_level_pressure": baseline["pressure"] - 15,
            "relative_humidity": min(baseline["humidity"] + 40, 100),
            "wind_speed": 25.0,
            "visibility": 1.0,
            "category": "severe_anomaly"
        })
    
    return samples


def run_calibration():
    """Run calibration analysis on generated samples."""
    
    print("=" * 70)
    print("SKYGUARD ML MODEL CALIBRATION")
    print("=" * 70)
    
    samples = generate_calibration_samples()
    results = {cat: [] for cat in samples.keys()}
    
    total_samples = sum(len(v) for v in samples.values())
    
    print(f"\nGenerating {total_samples} calibration samples...")
    print(f"  - Normal: {len(samples['normal'])}")
    print(f"  - Mild Anomalies: {len(samples['mild_anomaly'])}")
    print(f"  - Moderate Anomalies: {len(samples['moderate_anomaly'])}")
    print(f"  - Severe Anomalies: {len(samples['severe_anomaly'])}\n")
    
    for category, sample_list in samples.items():
        print(f"Evaluating {category}...")
        scores = []
        
        for sample in sample_list:
            try:
                result = anomaly_service.predict(sample)
                score = result.get("anomaly_score", 0.0)
                scores.append(score)
                results[category].append(result)
            except Exception as e:
                print(f"  Error processing sample: {e}")
        
        if scores:
            print(f"  Mean score: {np.mean(scores):.4f}")
            print(f"  Std dev: {np.std(scores):.4f}")
            print(f"  Min: {np.min(scores):.4f}, Max: {np.max(scores):.4f}")
            print()
    
    # Generate calibration report
    print("\n" + "=" * 70)
    print("CALIBRATION ANALYSIS & RECOMMENDATIONS")
    print("=" * 70)
    
    all_scores = {}
    for cat, res_list in results.items():
        scores = [r.get("anomaly_score", 0.0) for r in res_list]
        if scores:
            all_scores[cat] = {
                "mean": np.mean(scores),
                "std": np.std(scores),
                "min": np.min(scores),
                "max": np.max(scores),
                "q25": np.percentile(scores, 25),
                "q50": np.percentile(scores, 50),
                "q75": np.percentile(scores, 75),
            }
    
    print("\nScore Distributions by Category:")
    for cat, stats in all_scores.items():
        print(f"\n{cat.upper():20s} - Mean: {stats['mean']:7.4f}, "
              f"Std: {stats['std']:.4f}, Range: [{stats['min']:.4f}, {stats['max']:.4f}]")
    
    # Compute recommended thresholds
    if all_scores:
        normal_max = all_scores.get("normal", {}).get("max", -0.1)
        mild_min = all_scores.get("mild_anomaly", {}).get("min", -0.2)
        moderate_min = all_scores.get("moderate_anomaly", {}).get("min", -0.3)
        severe_min = all_scores.get("severe_anomaly", {}).get("min", -0.5)
        
        print("\n" + "-" * 70)
        print("RECOMMENDED DECISION THRESHOLDS (for anomaly_model_service.py):")
        print("-" * 70)
        print(f"DECISION_THRESHOLDS = {{")
        print(f'    "anomaly_critical": {min(severe_min, -0.50):.2f},  # Clear anomaly')
        print(f'    "anomaly_high": {min(moderate_min, -0.30):.2f},    # High confidence')
        print(f'    "anomaly_moderate": {min(mild_min, -0.15):.2f},    # Moderate concern')
        print(f'    "warning": {normal_max + 0.01:.2f},              # Borderline threshold')
        print(f'    "normal": 0.10                   # Normal operation')
        print(f"}}")
        print("-" * 70)
    
    # Save calibration results
    calibration_file = "/home/lokesh-goparaju/Documents/SIH/SkyGuard-AI/ml-model/models/calibration_results.json"
    with open(calibration_file, 'w') as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "score_distributions": {k: v for k, v in all_scores.items()},
            "total_samples_tested": total_samples,
        }, f, indent=2)
    
    print(f"\n✅ Calibration results saved to: {calibration_file}")
    print("=" * 70)


if __name__ == "__main__":
    run_calibration()
