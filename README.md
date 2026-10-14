# CardioVision AI

An interpretable cardiovascular risk assessment and 3D coronary artery stenosis visualization platform powered by machine learning on the authoritative Z-Alizadeh Sani clinical dataset (UCI ID 411).

---

## 1. Project Purpose & Overview
CardioVision AI is a non-invasive clinical decision-support and educational prototype for multi-target coronary artery disease (CAD) risk assessment. It evaluates clinical biomarkers, 12-lead ECG findings, and transthoracic echocardiography to predict overall CAD and artery-specific stenosis probability across the three primary coronary branches:
- **LAD**: Left Anterior Descending Artery
- **LCX**: Left Circumflex Artery
- **RCA**: Right Coronary Artery

The platform synchronizes quantitative model predictions with an interactive 3D WebGL cardiac model and empirical Model Feature Attributions.

---

## 2. Technology Stack & Architecture
- **Frontend SPA**: React 19, TypeScript, Tailwind CSS, Vite
- **3D Visualization**: Three.js (WebGL rendering with ACES Filmic Tone Mapping and OrbitControls)
- **Backend Service**: Node.js / Express (Proxying requests on port 3000 to Python runtime)
- **ML Runtime**: Python 3.10, Scikit-Learn, Pandas, NumPy, Joblib

### Architecture Diagram:
```
[ Patient Clinical Inputs / Archetype Presets ]
                       ↓
         [ Frontend Validation Layer ]
                       ↓
      [ Express Backend Proxy (/api/predict) ]
                       ↓
  [ Python Inference Pipeline (scripts/predict.py) ]
    ├── Target Leakage Guard Verification
    ├── StandardScaler Transformation
    ├── Dedicated Multi-Target Estimators
    └── Empirical Model Feature Attributions
                       ↓
      [ Standardized JSON Response (HTTP 200) ]
                       ↓
         [ React Dashboard Synchronization ]
    ├── Overall CAD Risk & Multi-Vessel Breakdown Cards
    ├── Interactive 3D WebGL Coronary Tree (Three.js)
    ├── Model Feature Attributions (Diverging Bar Chart & Table)
    └── Physiological Profile & Validation Benchmarks
```

---

## 3. Dataset & Target Leakage Prevention
- **Dataset**: Extension of Z-Alizadeh Sani Cardiovascular Dataset (UCI Machine Learning Repository ID: 411).
- **Records**: 303 complete patient records (0 missing values across all 59 columns).
- **Target Leakage Guarantee**: Under strict evaluation criteria, outcome columns `['Cath', 'LAD', 'LCX', 'RCA']` are completely excluded from the input feature matrix $X$. The feature space consists exclusively of 55 raw pre-catheterization clinical biomarkers transformed into 57 one-hot encoded variables.

### Target Ground Truth Distribution in Cohort ($N=303$):
- **Cath (Overall CAD)**: 216 CAD (71.3%), 87 Normal (28.7%)
- **LAD**: 177 Stenotic (58.4%), 126 Normal (41.6%)
- **LCX**: 119 Stenotic (39.3%), 184 Normal (60.7%)
- **RCA**: 114 Stenotic (37.6%), 189 Normal (62.4%)

---

## 4. Model Training & Evaluation Methodology
- **Split**: 80/20 Stratified Train/Test Split (242 training instances, 61 held-out test instances).
- **Cross-Validation**: 5-Fold Stratified Cross-Validation on the 80% training split.
- **Model Selection Per Target**:
  - **Overall CAD (`Cath`)**: Random Forest Classifier ($n=120, max\_depth=6$)
  - **LAD Stenosis**: Random Forest Classifier ($n=120, max\_depth=6$)
  - **LCX Stenosis**: L2-Regularized Logistic Regression (`C=1.0, class_weight='balanced'`)
  - **RCA Stenosis**: L2-Regularized Logistic Regression (`C=1.0, class_weight='balanced'`)

---

## 5. Verified Held-Out Test Metrics
All metrics were evaluated on the untouched held-out test split ($N_{test}=61$, random state 42, stratified):

| Target Branch | Classifier Architecture | Test Accuracy | Test Precision | Test Recall (Sensitivity) | Test F1-Score | Test ROC-AUC |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Overall CAD** | Random Forest (120 Trees) | **85.2%** | **87.0%** | **93.0%** | **89.9%** | **88.8%** |
| **LAD** | Random Forest (120 Trees) | **80.3%** | **80.0%** | **88.9%** | **84.2%** | **84.0%** |
| **LCX** | L2 Logistic Regression | **54.1%** | **42.3%** | **45.8%** | **44.0%** | **57.2%** |
| **RCA** | L2 Logistic Regression | **70.5%** | **61.9%** | **56.5%** | **59.1%** | **74.6%** |

*Note on LCX: The Left Circumflex artery has lower test performance across non-invasive surface biomarkers due to cohort class prevalence (19.8% stenosis in training partition) and anatomical territory. This is transparently reported and retained.*

---

## 6. Model Feature Attributions
The application provides transparent model explanations under the terminology **"Model Feature Attributions"**:
- **CAD & LAD (Tree Models)**: Random Forest Gini feature importances scaled by standardized patient feature deviation relative to cohort baseline.
- **LCX & RCA (Linear Models)**: L2 Logistic Regression normalized feature coefficients multiplied by standardized patient standard deviation.
- **Causality Clarification**: *Feature attributions indicate mathematical model behavior and are not causal clinical effects.*

---

## 7. Application Visualization Risk Tiers
Coronary tree coloring and risk badges adhere to unified application-defined thresholds:
- **Low Risk Tier**: `< 34%` (0% – 33%) → Emerald Green
- **Moderate Risk Tier**: `34% – 66%` → Amber / Yellow
- **High Risk Tier**: `≥ 67%` (67% – 100%) → Crimson Red

*Note: These tiers are application-defined visualization tiers for decision support and are not clinically validated diagnostic cutoff thresholds.*

---

## 8. Interactive 3D Cardiovascular Visualization
- Built with Three.js rendering coronary anatomy (Left Main, LAD, LCX, RCA, diagonals, and marginals).
- Fully interactive with mouse/touch OrbitControls (rotate, pan, zoom, preset anatomical angles AP, LAO, RAO, and reset).
- Synchronized with active vessel selection across all cards and attribution views.
- **Limitation**: *Coloring represents vessel-specific stenosis probability. The ML model does not produce physical spatial lesion coordinates.*

---

## 9. Setup & Local Execution

### Prerequisites:
- Node.js >= 18.0.0
- Python >= 3.10
- npm >= 9.0.0

### Installation:
```bash
# 1. Install Node.js frontend & backend dependencies
npm install

# 2. Install Python machine learning dependencies
pip install -r requirements.txt
```

### Running Locally:
```bash
# Start development server (Express backend + Vite frontend on port 3000)
npm run dev

# Or build and start production server
npm run build
npm start
```
Open `http://localhost:3000` in your browser.

### Verifying Tests & Pipeline:
```bash
# Run test suite
npm test

# Run TypeScript compilation check
npx tsc --noEmit

# Run code linter
npm run lint
```

---

## 10. API Specification
### `POST /api/predict`
Executes multi-target prediction and feature attribution for a patient clinical profile.

- **Request Headers**: `Content-Type: application/json`
- **Request Body**: JSON object containing 55 non-leakage clinical fields (e.g. `Age`, `Sex`, `BMI`, `BP`, `FBS`, `LDL`, `HDL`, `EF-TTE`, `Region RWMA`, etc.)
- **Response Format (200 OK)**:
```json
{
  "cad": { "probability": 0.5723, "class": "CAD", "riskLevel": "moderate" },
  "lad": { "probability": 0.3602, "class": "Normal", "riskLevel": "moderate" },
  "lcx": { "probability": 0.2574, "class": "Normal", "riskLevel": "low" },
  "rca": { "probability": 0.3939, "class": "Normal", "riskLevel": "moderate" },
  "explanations": {
    "cad": [ { "featureName": "Typical Chest Pain", "shapValue": 0.1382, "direction": "increases_risk" } ],
    "lad": [...],
    "lcx": [...],
    "rca": [...]
  },
  "modelMetadata": {
    "dataset": "Z-Alizadeh Sani Cardiovascular Dataset (UCI 411)",
    "leakagePreventionVerified": true
  }
}
```

---

## 11. Clinical Safety & Limitations
1. **Educational & Decision-Support Only**: CardioVision AI is a research and decision-support prototype. It does not replace professional clinical evaluation, standard diagnostic imaging, or invasive coronary angiography.
2. **Cohort Scope**: Models were trained on the single-center Z-Alizadeh Sani cohort ($N=303$). Generalization across broader clinical populations requires multi-center validation.
3. **No Anatomical Lesion Pinpointing**: Predictions reflect branch-level stenosis probability. The system does not imply physical spatial lesion coordinates or millimeter lesion lengths.
4. **No Diagnostic Replacement**: The software does not provide diagnostic certainty or prescriptive treatment recommendations.
