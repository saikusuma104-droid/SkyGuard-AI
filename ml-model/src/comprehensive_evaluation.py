"""
Comprehensive ML Model Evaluation Script for SkyGuard

Evaluates model performance on multiple test categories:
1. Normal weather conditions
2. Mild weather variations  
3. Moderate anomalies
4. Severe weather anomalies
5. Physical limit violations
"""

import os
import sys
import json
from datetime import datetime
from anomaly_model_service import anomaly_service

# ============================================================
# TEST CASE DEFINITIONS
# ============================================================

TEST_CASES = {
    "normal_operations": {
        "description": "Normal weather operations within expected ranges",
        "expected_anomaly": False,
        "samples": [
            {
                "name": "Station 01 - Typical day",
                "data": {
                    "station_id": "station_01",
                    "temperature": 30.0,
                    "dew_point_temperature": 24.0,
                    "station_level_pressure": 1011.0,
                    "sea_level_pressure": 1012.5,
                    "relative_humidity": 78,
                    "wind_speed": 3.5,
                    "visibility": 8.0
                }
            },
            {
                "name": "Station 02 - Clear day",
                "data": {
                    "station_id": "station_02",
                    "temperature": 32.5,
                    "dew_point_temperature": 26.0,
                    "station_level_pressure": 1008.2,
                    "sea_level_pressure": 1009.7,
                    "relative_humidity": 65,
                    "wind_speed": 2.8,
                    "visibility": 10.0
                }
            },
            {
                "name": "Station 07 - High altitude normal",
                "data": {
                    "station_id": "station_07",
                    "temperature": 18.5,
                    "dew_point_temperature": 13.0,
                    "station_level_pressure": 826.0,
                    "sea_level_pressure": 1010.5,
                    "relative_humidity": 72,
                    "wind_speed": 4.2,
                    "visibility": 9.5
                }
            }
        ]
    },
    "mild_variations": {
        "description": "Mild weather variations (5-10% deviation)",
        "expected_anomaly": False,
        "samples": [
            {
                "name": "Light rain - humidity spike 15%",
                "data": {
                    "station_id": "station_01",
                    "temperature": 28.5,
                    "dew_point_temperature": 26.0,
                    "station_level_pressure": 1009.5,
                    "sea_level_pressure": 1011.0,
                    "relative_humidity": 93,
                    "wind_speed": 5.0,
                    "visibility": 6.5
                }
            },
            {
                "name": "Gentle pressure drop",
                "data": {
                    "station_id": "station_02",
                    "temperature": 31.0,
                    "dew_point_temperature": 25.0,
                    "station_level_pressure": 1005.5,
                    "sea_level_pressure": 1007.0,
                    "relative_humidity": 70,
                    "wind_speed": 8.0,
                    "visibility": 7.0
                }
            }
        ]
    },
    "moderate_anomalies": {
        "description": "Moderate anomalies (10-20% deviation)",
        "expected_anomaly": True,
        "samples": [
            {
                "name": "Thunderstorm approaching - pressure drop 10 hPa",
                "data": {
                    "station_id": "station_03",
                    "temperature": 31.0,
                    "dew_point_temperature": 28.0,
                    "station_level_pressure": 994.0,
                    "sea_level_pressure": 995.5,
                    "relative_humidity": 95,
                    "wind_speed": 16.0,
                    "visibility": 3.5
                }
            },
            {
                "name": "Sudden temperature drop 8°C",
                "data": {
                    "station_id": "station_04",
                    "temperature": 25.0,
                    "dew_point_temperature": 18.0,
                    "station_level_pressure": 1005.0,
                    "sea_level_pressure": 1006.5,
                    "relative_humidity": 60,
                    "wind_speed": 12.0,
                    "visibility": 5.0
                }
            }
        ]
    },
    "severe_anomalies": {
        "description": "Severe weather anomalies (>20% deviation)",
        "expected_anomaly": True,
        "samples": [
            {
                "name": "Extreme heatwave - 45°C spike",
                "data": {
                    "station_id": "station_02",
                    "temperature": 45.0,
                    "dew_point_temperature": 28.0,
                    "station_level_pressure": 1005.0,
                    "sea_level_pressure": 1006.5,
                    "relative_humidity": 25,
                    "wind_speed": 18.0,
                    "visibility": 2.0
                }
            },
            {
                "name": "Severe pressure drop - storm system",
                "data": {
                    "station_id": "station_01",
                    "temperature": 26.0,
                    "dew_point_temperature": 25.0,
                    "station_level_pressure": 938.0,
                    "sea_level_pressure": 939.5,
                    "relative_humidity": 99,
                    "wind_speed": 28.0,
                    "visibility": 1.0
                }
            },
            {
                "name": "Extreme cold snap - 15°C below normal",
                "data": {
                    "station_id": "station_06",
                    "temperature": 18.0,
                    "dew_point_temperature": 5.0,
                    "station_level_pressure": 1020.0,
                    "sea_level_pressure": 1021.5,
                    "relative_humidity": 35,
                    "wind_speed": 22.0,
                    "visibility": 2.5
                }
            }
        ]
    },
    "physical_violations": {
        "description": "Physical limit violations (impossible conditions)",
        "expected_anomaly": True,
        "samples": [
            {
                "name": "Temperature out of range - 65°C",
                "data": {
                    "station_id": "station_01",
                    "temperature": 65.0,
                    "dew_point_temperature": 30.0,
                    "station_level_pressure": 1010.0,
                    "sea_level_pressure": 1011.5,
                    "relative_humidity": 50,
                    "wind_speed": 5.0,
                    "visibility": 10.0
                }
            },
            {
                "name": "Invalid humidity - 110%",
                "data": {
                    "station_id": "station_02",
                    "temperature": 28.0,
                    "dew_point_temperature": 25.0,
                    "station_level_pressure": 1008.0,
                    "sea_level_pressure": 1009.5,
                    "relative_humidity": 110,
                    "wind_speed": 3.0,
                    "visibility": 8.0
                }
            }
        ]
    }
}

# ============================================================
# EVALUATION FUNCTIONS
# ============================================================

def evaluate_sample(sample_data):
    """Evaluate a single sample and return results."""
    try:
        result = anomaly_service.predict(sample_data)
        return result
    except Exception as e:
        return {
            "error": str(e),
            "anomaly": False,
            "status": "ERROR"
        }


def run_evaluation():
    """Run comprehensive evaluation across all test categories."""
    
    print("\n" + "=" * 80)
    print("SKYGUARD ML MODEL COMPREHENSIVE EVALUATION")
    print("=" * 80)
    
    all_results = {}
    summary_stats = {
        "total_tests": 0,
        "passed": 0,
        "failed": 0,
        "by_category": {}
    }
    
    for category_name, category_data in TEST_CASES.items():
        print(f"\n{'=' * 80}")
        print(f"CATEGORY: {category_name.upper()}")
        print(f"Description: {category_data['description']}")
        print(f"Expected Anomaly: {category_data['expected_anomaly']}")
        print(f"{'=' * 80}\n")
        
        category_results = []
        passed = 0
        failed = 0
        
        for sample in category_data['samples']:
            result = evaluate_sample(sample['data'])
            is_anomaly = result.get('anomaly', False)
            expected = category_data['expected_anomaly']
            
            # Check if prediction matches expectation
            test_passed = (is_anomaly == expected)
            
            if test_passed:
                passed += 1
                status_badge = "✅ PASS"
            else:
                failed += 1
                status_badge = "❌ FAIL"
            
            score = result.get('anomaly_score', 0.0)
            severity = result.get('severity', 'UNKNOWN')
            reason = result.get('reason', 'No reason provided')[:60]
            
            print(f"{status_badge} | {sample['name']:35s}")
            print(f"        Predicted: anomaly={str(is_anomaly):5s}, "
                  f"score={score:7.4f}, severity={severity:7s}")
            print(f"        Reason: {reason}...")
            print()
            
            category_results.append({
                "sample": sample['name'],
                "expected": expected,
                "predicted": is_anomaly,
                "passed": test_passed,
                "details": result
            })
        
        # Category summary
        total = passed + failed
        accuracy = (passed / total * 100) if total > 0 else 0
        print(f"Category Results: {passed}/{total} correct ({accuracy:.1f}% accuracy)\n")
        
        all_results[category_name] = category_results
        summary_stats['by_category'][category_name] = {
            "passed": passed,
            "failed": failed,
            "accuracy": accuracy
        }
        summary_stats['total_tests'] += total
        summary_stats['passed'] += passed
        summary_stats['failed'] += failed
    
    # Overall Summary
    print("\n" + "=" * 80)
    print("OVERALL EVALUATION SUMMARY")
    print("=" * 80)
    
    for category, stats in summary_stats['by_category'].items():
        status = "✅" if stats['accuracy'] >= 80 else ("⚠️ " if stats['accuracy'] >= 50 else "❌")
        print(f"{status} {category:25s}: {stats['accuracy']:6.1f}% "
              f"({stats['passed']}/{stats['passed'] + stats['failed']})")
    
    total = summary_stats['total_tests']
    overall_acc = (summary_stats['passed'] / total * 100) if total > 0 else 0
    
    print(f"\n{'='*80}")
    print(f"OVERALL ACCURACY: {overall_acc:.1f}% ({summary_stats['passed']}/{total} tests passed)")
    print(f"{'='*80}\n")
    
    # Save results
    eval_file = "/home/lokesh-goparaju/Documents/SIH/SkyGuard-AI/ml-model/models/evaluation_results.json"
    with open(eval_file, 'w') as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "summary": summary_stats,
            "detailed_results": all_results
        }, f, indent=2)
    
    print(f"✅ Detailed evaluation results saved to: {eval_file}\n")
    
    # Recommendations
    if overall_acc >= 90:
        print("🎯 Model Performance: EXCELLENT - Ready for production")
    elif overall_acc >= 80:
        print("🎯 Model Performance: GOOD - Minor improvements needed")
    elif overall_acc >= 70:
        print("⚠️  Model Performance: FAIR - Significant improvements needed")
    else:
        print("❌ Model Performance: POOR - Requires retraining or redesign")
    
    print("\nKey Recommendations:")
    print("  1. Continue monitoring model predictions against ground truth")
    print("  2. Regularly update thresholds based on new data patterns")
    print("  3. Consider ensemble methods for improved robustness")
    print("  4. Implement online learning to adapt to changing climate patterns")
    print()


if __name__ == "__main__":
    run_evaluation()
