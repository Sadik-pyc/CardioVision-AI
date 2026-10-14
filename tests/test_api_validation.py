#!/usr/bin/env python3
"""
CardioVision AI - API Validation & Response Schema Test Suite
Tests:
- Valid clinical input payload
- Response schema for CAD, LAD, LCX, RCA
- Probability bounds [0.0, 1.0]
- SHAP feature attribution schema
- Missing required fields validation error (HTTP 400)
- Invalid numeric type validation error (HTTP 400)
- Empty payload rejection (HTTP 400)
"""

import sys
import json
import urllib.request
import urllib.error

API_URL = "http://localhost:3000/api/predict"

def get_sample_patient():
    return {
        "Age": 58,
        "Weight": 78,
        "Length": 172,
        "Sex": "Male",
        "BMI": 26.4,
        "DM": 1,
        "HTN": 1,
        "Current Smoker": 1,
        "EX-Smoker": 0,
        "FH": 1,
        "Obesity": "N",
        "CRF": "N",
        "CVA": "N",
        "Airway disease": "N",
        "Thyroid Disease": "N",
        "CHF": "N",
        "DLP": "Y",
        "BP": 140,
        "PR": 78,
        "Edema": 0,
        "Weak Peripheral Pulse": "N",
        "Lung rales": "N",
        "Systolic Murmur": "N",
        "Diastolic Murmur": "N",
        "Typical Chest Pain": 1,
        "Dyspnea": "N",
        "Function Class": 2,
        "Atypical": "N",
        "Nonanginal": "N",
        "Exertional CP": "N",
        "LowTH Ang": "N",
        "Q Wave": 0,
        "St Elevation": 0,
        "St Depression": 1,
        "Tinversion": 1,
        "LVH": "N",
        "Poor R Progression": "N",
        "BBB": "N",
        "FBS": 135,
        "CR": 1.1,
        "TG": 195,
        "LDL": 142,
        "HDL": 38,
        "BUN": 18,
        "ESR": 22,
        "HB": 14.2,
        "K": 4.3,
        "Na": 141,
        "WBC": 7800,
        "Lymph": 30,
        "Neut": 62,
        "PLT": 245,
        "EF-TTE": 45,
        "Region RWMA": 2,
        "VHD": "N"
    }

def send_request(payload):
    data_bytes = json.dumps(payload).encode("utf-8") if payload is not None else b""
    req = urllib.request.Request(
        API_URL,
        data=data_bytes,
        headers={"Content-Type": "application/json"}
    )
    return urllib.request.urlopen(req)

def run_suite():
    print("=" * 60)
    print("CARDIOVISION AI - PREDICTION API INTEGRATION TESTS")
    print("=" * 60)
    passed = 0
    total = 0

    # Test 1: Valid Clinical Record
    total += 1
    try:
        patient = get_sample_patient()
        with send_request(patient) as resp:
            assert resp.status == 200, f"Expected HTTP 200, got {resp.status}"
            body = json.loads(resp.read().decode())
            
            # Verify target responses
            for target in ["cad", "lad", "lcx", "rca"]:
                assert target in body, f"Target '{target}' missing from API response"
                prob = body[target]["probability"]
                assert 0.0 <= prob <= 1.0, f"Probability for {target} ({prob}) outside [0, 1]"
                assert body[target]["class"] in ["CAD", "Stenotic", "Normal"], f"Unexpected class: {body[target]['class']}"
                assert body[target]["riskLevel"] in ["low", "moderate", "high"], f"Unexpected risk level: {body[target]['riskLevel']}"
                
            # Verify SHAP attributions
            assert "explanations" in body, "Missing 'explanations' object in response"
            for target in ["cad", "lad", "lcx", "rca"]:
                exps = body["explanations"].get(target, [])
                assert len(exps) > 0, f"No SHAP feature attributions returned for target {target}"
                for feat in exps:
                    assert "featureName" in feat, "Feature attribution missing featureName"
                    assert "shapValue" in feat, "Feature attribution missing shapValue"
                    assert "direction" in feat, "Feature attribution missing direction"
                    
            print("[PASS] Test 1: Valid clinical input returned valid multi-target probabilities and SHAP attributions.")
            passed += 1
    except Exception as e:
        print(f"[FAIL] Test 1: {e}")

    # Test 2: Missing Required Field Rejection
    total += 1
    try:
        incomplete_patient = {"Age": 55, "Sex": "Male"} # Missing 53 required fields
        try:
            send_request(incomplete_patient)
            print("[FAIL] Test 2: API accepted incomplete payload without returning HTTP 400.")
        except urllib.error.HTTPError as e:
            assert e.code == 400, f"Expected HTTP 400 for missing fields, got {e.code}"
            err_body = e.read().decode()
            assert "Missing required clinical fields" in err_body, f"Unexpected error message: {err_body}"
            print("[PASS] Test 2: Incomplete payload correctly rejected with HTTP 400 and validation message.")
            passed += 1
    except Exception as e:
        print(f"[FAIL] Test 2: {e}")

    # Test 3: Type Mismatch Rejection
    total += 1
    try:
        invalid_patient = get_sample_patient()
        invalid_patient["Age"] = "invalid_string_not_a_number"
        try:
            send_request(invalid_patient)
            print("[FAIL] Test 3: API accepted invalid string value for numerical field.")
        except urllib.error.HTTPError as e:
            assert e.code == 400, f"Expected HTTP 400 for type mismatch, got {e.code}"
            err_body = e.read().decode()
            assert "must be a numerical number" in err_body, f"Unexpected error message: {err_body}"
            print("[PASS] Test 3: Type mismatch correctly rejected with HTTP 400 and validation message.")
            passed += 1
    except Exception as e:
        print(f"[FAIL] Test 3: {e}")

    # Test 4: Empty Payload Rejection
    total += 1
    try:
        try:
            send_request({})
            print("[FAIL] Test 4: API accepted empty JSON object.")
        except urllib.error.HTTPError as e:
            assert e.code == 400, f"Expected HTTP 400 for empty body, got {e.code}"
            print("[PASS] Test 4: Empty JSON payload correctly rejected with HTTP 400.")
            passed += 1
    except Exception as e:
        print(f"[FAIL] Test 4: {e}")

    # Test 5: Target Leakage Input Guard
    total += 1
    try:
        malicious_leakage_payload = get_sample_patient()
        # Attempt to inject target columns directly
        malicious_leakage_payload["Cath"] = "CAD"
        malicious_leakage_payload["LAD"] = "Stenotic"
        with send_request(malicious_leakage_payload) as resp:
            assert resp.status == 200
            body = json.loads(resp.read().decode())
            # Ensure model metadata confirms leakage columns are excluded
            leakage_excluded = body["modelMetadata"]["leakage_columns_excluded"]
            assert "Cath" in leakage_excluded and "LAD" in leakage_excluded
            print("[PASS] Test 5: Injected target columns safely ignored and leakage guards confirmed.")
            passed += 1
    except Exception as e:
        print(f"[FAIL] Test 5: {e}")

    print("=" * 60)
    print(f"RESULTS: {passed}/{total} API TESTS PASSED")
    print("=" * 60)
    return passed == total

if __name__ == "__main__":
    success = run_suite()
    sys.exit(0 if success else 1)
