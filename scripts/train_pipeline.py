"""
CardioVision AI - Phase 2 Authoritative Machine Learning Pipeline
Dataset: Extension of Z-Alizadeh Sani Dataset (UCI Repository ID: 411)
Patients: 303, Features: 59 total (55 input features, 4 target/leakage columns)
"""

import os
import json
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_validate
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score

DATASET_PATH = "dataset/extention of Z-Alizadeh sani dataset.xlsx"
ARTIFACTS_DIR = "src/data"
os.makedirs(ARTIFACTS_DIR, exist_ok=True)

print("="*70)
print("1. LOADING AUTHORITATIVE DATASET")
print("="*70)

df = pd.read_excel(DATASET_PATH)
print(f"Loaded dataset from: {DATASET_PATH}")
print(f"Total Rows: {df.shape[0]}, Total Columns: {df.shape[1]}")

# 2. TARGET AND LEAKAGE AUDIT
TARGET_COLS = {
    "cad": "Cath",
    "lad": "LAD",
    "lcx": "LCX",
    "rca": "RCA"
}
LEAKAGE_COLUMNS = ["Cath", "LAD", "LCX", "RCA"]

print("\n" + "="*70)
print("2. TARGET VARIABLES & LEAKAGE PREVENTION AUDIT")
print("="*70)
print(f"CRITICAL RULE: The following columns are strictly excluded from input features X: {LEAKAGE_COLUMNS}")

target_distributions = {}
for target_key, col_name in TARGET_COLS.items():
    counts = df[col_name].value_counts().to_dict()
    target_distributions[target_key] = {
        "column": col_name,
        "raw_counts": counts,
        "positive_label": "CAD" if target_key == "cad" else "Stenotic",
        "negative_label": "Normal"
    }
    print(f"Target '{target_key}' ({col_name}): {counts}")

# 3. FEATURE IDENTIFICATION & PREPROCESSING SETUP
feature_cols = [c for c in df.columns if c not in LEAKAGE_COLUMNS]
print(f"\nTotal Input Features: {len(feature_cols)}")

# Inspect missing values
missing_counts = df[feature_cols].isnull().sum().to_dict()
has_missing = any(v > 0 for v in missing_counts.values())
print(f"Missing Values across features: {'None (0 across all features)' if not has_missing else missing_counts}")

categorical_cols = [c for c in feature_cols if df[c].dtype == 'object']
numerical_cols = [c for c in feature_cols if df[c].dtype != 'object']
print(f"Categorical Features ({len(categorical_cols)}): {categorical_cols}")
print(f"Numerical Features ({len(numerical_cols)}): {numerical_cols}")

# Standardize string categories (strip whitespace, lowercase/uppercase consistency)
df_clean = df.copy()
for col in categorical_cols:
    df_clean[col] = df_clean[col].astype(str).str.strip()

# Target encoding: 1 = Disease (CAD / Stenotic), 0 = Normal
y_targets = {}
for target_key, col_name in TARGET_COLS.items():
    pos_label = target_distributions[target_key]["positive_label"]
    y_targets[target_key] = (df_clean[col_name] == pos_label).astype(int).values

# Binary and multi-category mappings
cat_mappings = {}
for col in categorical_cols:
    uniques = sorted(df_clean[col].unique().tolist())
    cat_mappings[col] = uniques

# One-hot encoding / dummy variables for categorical features
X_df = pd.get_dummies(df_clean[feature_cols], columns=categorical_cols, drop_first=True)
feature_names = X_df.columns.tolist()
print(f"\nEngineered One-Hot Encoded Feature Matrix Shape: {X_df.shape} ({len(feature_names)} features)")

X_all = X_df.values.astype(np.float64)

# 4. MODEL BENCHMARKING & MULTI-TARGET TRAINING
results_by_target = {}
trained_models = {}

skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

for target_key, col_name in TARGET_COLS.items():
    print("\n" + "="*70)
    print(f"TRAINING TARGET: {target_key.upper()} (Column: {col_name})")
    print("="*70)
    
    y = y_targets[target_key]
    
    # 80/20 Stratified Train-Test Split
    X_train, X_test, y_train, y_test = train_test_split(
        X_all, y, test_size=0.20, random_state=42, stratify=y
    )
    
    print(f"Train split size: {len(y_train)} (pos: {sum(y_train)}, neg: {len(y_train)-sum(y_train)})")
    print(f"Test split size:  {len(y_test)} (pos: {sum(y_test)}, neg: {len(y_test)-sum(y_test)})")
    
    # Feature Scaling (Fit on Train, transform Test)
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    candidate_models = {
        "logistic_regression": {
            "name": "Logistic Regression (L2 Regularized)",
            "model": LogisticRegression(max_iter=1000, random_state=42, C=0.5, class_weight='balanced'),
            "use_scaled": True
        },
        "random_forest": {
            "name": "Random Forest Classifier (n=120, max_depth=6)",
            "model": RandomForestClassifier(n_estimators=120, max_depth=6, random_state=42, class_weight='balanced'),
            "use_scaled": False
        },
        "gradient_boosting": {
            "name": "Gradient Boosting Classifier (n=80, lr=0.08)",
            "model": GradientBoostingClassifier(n_estimators=80, learning_rate=0.08, max_depth=3, random_state=42),
            "use_scaled": False
        }
    }
    
    cv_scores = {}
    
    for m_key, m_info in candidate_models.items():
        clf = m_info["model"]
        X_tr = X_train_scaled if m_info["use_scaled"] else X_train
        
        # 5-fold cross validation on training set
        cv_res = cross_validate(
            clf, X_tr, y_train, cv=skf,
            scoring=['accuracy', 'precision', 'recall', 'f1', 'roc_auc'],
            return_train_score=False
        )
        
        mean_metrics = {
            "cv_accuracy": float(np.mean(cv_res['test_accuracy'])),
            "cv_precision": float(np.mean(cv_res['test_precision'])),
            "cv_recall": float(np.mean(cv_res['test_recall'])),
            "cv_f1": float(np.mean(cv_res['test_f1'])),
            "cv_roc_auc": float(np.mean(cv_res['test_roc_auc'])),
            "std_roc_auc": float(np.std(cv_res['test_roc_auc']))
        }
        cv_scores[m_key] = mean_metrics
        print(f"  [{m_key:20s}] CV Acc: {mean_metrics['cv_accuracy']:.3f} | F1: {mean_metrics['cv_f1']:.3f} | ROC-AUC: {mean_metrics['cv_roc_auc']:.3f}")
    
    # Select best model based on CV ROC-AUC & F1
    best_m_key = max(cv_scores.keys(), key=lambda k: cv_scores[k]["cv_roc_auc"] + cv_scores[k]["cv_f1"])
    best_info = candidate_models[best_m_key]
    best_clf = best_info["model"]
    print(f"\n=> Best Model Selected: '{best_info['name']}'")
    
    # Train best model on full training set
    X_tr_final = X_train_scaled if best_info["use_scaled"] else X_train
    best_clf.fit(X_tr_final, y_train)
    
    # Evaluate on held-out test set
    X_te_final = X_test_scaled if best_info["use_scaled"] else X_test
    y_pred = best_clf.predict(X_te_final)
    y_prob = best_clf.predict_proba(X_te_final)[:, 1]
    
    test_metrics = {
        "test_accuracy": float(accuracy_score(y_test, y_pred)),
        "test_precision": float(precision_score(y_test, y_pred, zero_division=0)),
        "test_recall": float(recall_score(y_test, y_pred, zero_division=0)),
        "test_f1": float(f1_score(y_test, y_pred, zero_division=0)),
        "test_roc_auc": float(roc_auc_score(y_test, y_prob))
    }
    
    print(f"Test Set Evaluation: Acc: {test_metrics['test_accuracy']:.3f} | Precision: {test_metrics['test_precision']:.3f} | Recall: {test_metrics['test_recall']:.3f} | F1: {test_metrics['test_f1']:.3f} | ROC-AUC: {test_metrics['test_roc_auc']:.3f}")
    
    # Extract feature importance / coefficients for Explainable AI
    feature_importances = []
    if hasattr(best_clf, 'feature_importances_'):
        imp = best_clf.feature_importances_
        for f_name, f_imp in zip(feature_names, imp):
            feature_importances.append({
                "feature": f_name,
                "importance": float(f_imp),
                "direction": "positive" # Tree importance magnitude
            })
    elif hasattr(best_clf, 'coef_'):
        coefs = best_clf.coef_[0]
        for f_name, f_coef in zip(feature_names, coefs):
            feature_importances.append({
                "feature": f_name,
                "importance": float(abs(f_coef)),
                "coefficient": float(f_coef),
                "direction": "increases_risk" if f_coef > 0 else "decreases_risk"
            })
            
    feature_importances.sort(key=lambda x: x["importance"], reverse=True)
    
    # Save model artifact to models/
    os.makedirs("models", exist_ok=True)
    import joblib
    joblib.dump(best_clf, f"models/{target_key}_model.pkl")
    
    results_by_target[target_key] = {
        "target_column": col_name,
        "selected_model": best_m_key,
        "model_name": best_info["name"],
        "use_scaled": best_info["use_scaled"],
        "cv_metrics": cv_scores,
        "test_metrics": test_metrics,
        "top_features": feature_importances[:15],
        # Serialized weights for transparent, deterministic client/server runtime execution
        "intercept": float(best_clf.intercept_[0]) if hasattr(best_clf, 'intercept_') else 0.0,
        "coefficients": [float(c) for c in best_clf.coef_[0]] if hasattr(best_clf, 'coef_') else []
    }
    trained_models[target_key] = {
        "clf": best_clf,
        "use_scaled": best_info["use_scaled"]
    }

# Compute Global Reference Baseline (Means and Stds for scaling)
means = scaler.mean_.tolist()
scales = scaler.scale_.tolist()
joblib.dump(scaler, "models/scaler.pkl")

artifacts = {
    "metadata": {
        "dataset_name": "Extension of Z-Alizadeh Sani Cardiovascular Dataset",
        "source": "UCI Machine Learning Repository (ID 411)",
        "total_instances": int(df.shape[0]),
        "total_features": int(len(feature_cols)),
        "encoded_features_count": int(len(feature_names)),
        "train_instances": 242,
        "test_instances": 61,
        "leakage_columns_excluded": LEAKAGE_COLUMNS,
        "validation_strategy": "Stratified 5-Fold Cross Validation + Held-Out 20% Test Set"
    },
    "feature_names": feature_names,
    "raw_feature_cols": feature_cols,
    "numerical_cols": numerical_cols,
    "categorical_cols": categorical_cols,
    "categorical_mappings": cat_mappings,
    "target_distributions": target_distributions,
    "scaler": {
        "means": means,
        "scales": scales
    },
    "targets": results_by_target
}

output_path = os.path.join(ARTIFACTS_DIR, "trained_model_artifacts.json")
with open(output_path, "w") as f:
    json.dump(artifacts, f, indent=2)

print("\n" + "="*70)
print(f"SUCCESS: Model artifacts saved to: {output_path}")
print("="*70)
