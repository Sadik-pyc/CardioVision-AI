#!/usr/bin/env python3
"""
CardioVision AI - Machine Learning Pipeline & Artifacts Audit Test
Tests:
- Serialized model artifacts existence (models/*.pkl)
- JSON artifacts schema and metadata verification
- Zero target leakage in feature names
- Scaling parameters validity (means, scales count matching features)
- Direct model predict_proba output range
"""

import os
import sys
import json
import joblib
import numpy as np

MODELS_DIR = "models"
ARTIFACTS_PATH = "src/data/trained_model_artifacts.json"

def run_ml_tests():
    print("=" * 60)
    print("CARDIOVISION AI - ML PIPELINE & ARTIFACTS AUDIT TESTS")
    print("=" * 60)
    passed = 0
    total = 0

    # Test 1: Check artifacts JSON
    total += 1
    try:
        assert os.path.exists(ARTIFACTS_PATH), f"Artifacts JSON not found at {ARTIFACTS_PATH}"
        with open(ARTIFACTS_PATH) as f:
            art = json.load(f)
            
        assert "metadata" in art, "Missing metadata in artifacts JSON"
        assert "targets" in art, "Missing targets in artifacts JSON"
        assert "feature_names" in art, "Missing feature_names in artifacts JSON"
        assert "scaler" in art, "Missing scaler in artifacts JSON"
        
        feature_count = len(art["feature_names"])
        assert feature_count == 57, f"Expected 57 engineered features, got {feature_count}"
        print(f"[PASS] Test 1: Artifacts JSON valid ({feature_count} features, {len(art['targets'])} targets).")
        passed += 1
    except Exception as e:
        print(f"[FAIL] Test 1: {e}")

    # Test 2: Target Leakage Feature Names Check
    total += 1
    try:
        with open(ARTIFACTS_PATH) as f:
            art = json.load(f)
            
        feature_names = art["feature_names"]
        leakage_cols = ["Cath", "LAD", "LCX", "RCA"]
        leaks = [col for col in leakage_cols if col in feature_names]
        assert len(leaks) == 0, f"Target leakage detected in feature vector: {leaks}"
        print(f"[PASS] Test 2: Target leakage check passed (0 target columns in input space).")
        passed += 1
    except Exception as e:
        print(f"[FAIL] Test 2: {e}")

    # Test 3: Model Files & Scaler Existence
    total += 1
    try:
        required_models = ["cad_model.pkl", "lad_model.pkl", "lcx_model.pkl", "rca_model.pkl", "scaler.pkl"]
        for m_file in required_models:
            full_path = os.path.join(MODELS_DIR, m_file)
            assert os.path.exists(full_path), f"Missing model artifact: {full_path}"
            
        scaler = joblib.load(os.path.join(MODELS_DIR, "scaler.pkl"))
        assert len(scaler.mean_) == 57, f"Scaler means dimension ({len(scaler.mean_)}) != 57"
        print(f"[PASS] Test 3: All 4 target models and StandardScaler successfully loaded from {MODELS_DIR}/.")
        passed += 1
    except Exception as e:
        print(f"[FAIL] Test 3: {e}")

    # Test 4: Direct Inference Probability Range
    total += 1
    try:
        dummy_input = np.zeros((1, 57))
        for target in ["cad", "lad", "lcx", "rca"]:
            clf = joblib.load(os.path.join(MODELS_DIR, f"{target}_model.pkl"))
            proba = clf.predict_proba(dummy_input)[0, 1]
            assert 0.0 <= proba <= 1.0, f"Target {target} probability out of bounds: {proba}"
        print(f"[PASS] Test 4: Direct Scikit-Learn inference confirmed within valid probability bounds.")
        passed += 1
    except Exception as e:
        print(f"[FAIL] Test 4: {e}")

    print("=" * 60)
    print(f"RESULTS: {passed}/{total} ML TESTS PASSED")
    print("=" * 60)
    return passed == total

if __name__ == "__main__":
    success = run_ml_tests()
    sys.exit(0 if success else 1)
