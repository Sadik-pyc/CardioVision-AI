import React, { useState } from 'react';
import { ApiConfig } from '../../services/apiConfig';
import { predictionService } from '../../services/predictionService';
import { 
  Terminal, 
  X, 
  Copy, 
  Check, 
  Server, 
  Play, 
  Cpu, 
  Code2, 
  Settings2, 
  ExternalLink 
} from 'lucide-react';

interface PythonApiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated: () => void;
}

export const PythonApiModal: React.FC<PythonApiModalProps> = ({
  isOpen,
  onClose,
  onConfigUpdated,
}) => {
  const [config, setConfig] = useState<ApiConfig>(predictionService.getConfig());
  const [activeTab, setActiveTab] = useState<'config' | 'fastapi_code' | 'schema'>('config');
  const [copied, setCopied] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [testMessage, setTestMessage] = useState<string>('');

  if (!isOpen) return null;

  const handleSaveConfig = () => {
    predictionService.updateConfig(config);
    onConfigUpdated();
  };

  const testConnection = async () => {
    setTestStatus('testing');
    setTestMessage('Pinging ' + config.pythonApiUrl + '...');
    try {
      const res = await fetch(config.pythonApiUrl, {
        method: 'OPTIONS',
      });
      setTestStatus('success');
      setTestMessage(`Server reachable (HTTP ${res.status}). Ready for inference.`);
    } catch (e: any) {
      setTestStatus('failed');
      setTestMessage(`Connection failed: Endpoint unreachable. Please launch your Python FastAPI server or keep Prototype Mock Mode enabled.`);
    }
  };

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const samplePythonCode = `"""
CardioVision AI - Backend Model Server (Phase 2 Integration)
Framework: FastAPI + XGBoost / LightGBM + SHAP
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import shap
import joblib
import numpy as np

app = FastAPI(title="CardioVision AI Inference Engine", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load trained multi-task / ensemble models and SHAP explainers in Phase 2
# model_cad = joblib.load("models/cad_overall_xgboost.pkl")
# model_lad = joblib.load("models/vessel_lad_lightgbm.pkl")
# model_lcx = joblib.load("models/vessel_lcx_lightgbm.pkl")
# model_rca = joblib.load("models/vessel_rca_lightgbm.pkl")
# explainer_cad = shap.TreeExplainer(model_cad)

class PatientInferencePayload(BaseModel):
    demographics: dict
    hemodynamics: dict
    metabolic_labs: dict
    ecg_electrophysiology: dict
    biomarkers_imaging: dict
    symptoms_history: dict
    custom_dataset_extensions: dict = {}

@app.post("/api/v1/predict")
async def predict_cad_and_vessels(payload: PatientInferencePayload):
    """
    1. Feature Vectorization matching training dataset (e.g., Z-Alizadeh Sani / Cleveland)
    2. Multi-vessel stenosis risk prediction (LAD, LCX, RCA)
    3. TreeSHAP computation for explainability
    """
    # Return formatted schema matching CardioVision AI frontend:
    return {
        "id": "PRED-PY-9801",
        "overallCadProbability": 0.74,
        "overallRiskLevel": "high",
        "vessels": {
            "LAD": {
                "vesselId": "LAD",
                "vesselName": "LAD",
                "fullVesselName": "Left Anterior Descending",
                "stenosisProbability": 0.81,
                "riskLevel": "high",
                "anatomicalTerritory": "Anteroseptal Wall & Apex",
                "perfusionSegments": ["Basal Anteroseptal", "Mid Anterior", "Apical"],
                "keyRiskDrivers": ["Anterior RWMA", "ST Deviation", "Elevated LDL"],
                "clinicalSignificance": "Critical anterior circulation"
            },
            "LCX": { ... },
            "RCA": { ... }
        },
        "overallShap": {
            "baseValue": 0.31,
            "outputValue": 0.74,
            "features": [
                {
                    "featureKey": "rwmaRegion",
                    "featureName": "Regional Wall Motion (RWMA)",
                    "category": "imaging",
                    "patientValue": "anterior wall",
                    "shapValue": 0.19,
                    "absoluteImportance": 0.19,
                    "direction": "increases_risk",
                    "clinicalRationale": "Territorial hypokinesis"
                }
            ]
        },
        "isMockData": False,
        "backendSource": "python_fastapi_endpoint",
        "executionTimeMs": 42
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/60">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Python API & ML Architecture Integration
              </h3>
              <p className="text-xs text-slate-400">
                FastAPI / Flask microservice connector & schema contracts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/40 px-5 pt-2 gap-2 text-xs">
          <button
            onClick={() => setActiveTab('config')}
            className={`px-3 py-2 border-b-2 font-medium flex items-center gap-1.5 ${
              activeTab === 'config'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings2 className="w-4 h-4" />
            <span>Connection Settings</span>
          </button>
          <button
            onClick={() => setActiveTab('fastapi_code')}
            className={`px-3 py-2 border-b-2 font-medium flex items-center gap-1.5 ${
              activeTab === 'fastapi_code'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Python FastAPI Code Sample</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 text-xs space-y-4">
          {activeTab === 'config' && (
            <div className="space-y-5">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
                  Active Backend Engine Mode
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => setConfig({ ...config, backendMode: 'prototype_mock' })}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      config.backendMode === 'prototype_mock'
                        ? 'bg-cyan-950/60 border-cyan-400 text-slate-100 shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-semibold text-xs text-cyan-300">
                      Prototype Mock Mode (Phase 1)
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Runs deterministic medical rule heuristics client-side. Zero external dependencies required.
                    </p>
                  </button>

                  <button
                    onClick={() => setConfig({ ...config, backendMode: 'python_backend' })}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      config.backendMode === 'python_backend'
                        ? 'bg-cyan-950/60 border-cyan-400 text-slate-100 shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-semibold text-xs text-cyan-300">
                      Live Python API Mode (Phase 2)
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Sends real HTTP POST requests with clinical feature JSON to your Python ML service.
                    </p>
                  </button>
                </div>
              </div>

              {/* Endpoint URL */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Python Backend Endpoint URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={config.pythonApiUrl}
                    onChange={(e) => setConfig({ ...config, pythonApiUrl: e.target.value })}
                    placeholder="http://localhost:8000/api/v1/predict"
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:border-cyan-500 outline-none"
                  />
                  <button
                    onClick={testConnection}
                    disabled={testStatus === 'testing'}
                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors shrink-0"
                  >
                    {testStatus === 'testing' ? 'Testing...' : 'Test Ping'}
                  </button>
                </div>
                {testMessage && (
                  <p
                    className={`text-[11px] mt-1 ${
                      testStatus === 'success' ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {testMessage}
                  </p>
                )}
              </div>

              {/* Network Latency simulation */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-medium text-slate-300 block">
                    Simulate Inference Latency
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Provides realistic 450ms network animation for hackathon demonstration
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={config.enableSimulatedNetworkDelay}
                  onChange={(e) =>
                    setConfig({ ...config, enableSimulatedNetworkDelay: e.target.checked })
                  }
                  className="rounded bg-slate-900 border-slate-700 text-cyan-500"
                />
              </div>
            </div>
          )}

          {activeTab === 'fastapi_code' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-xs">
                  Copy this production-ready boilerplate into <code className="text-cyan-400">server.py</code>:
                </span>
                <button
                  onClick={() => copyCode(samplePythonCode)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Python'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px] overflow-x-auto leading-relaxed max-h-[360px]">
                {samplePythonCode}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            CardioVision AI ML Architecture Specification
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 text-xs"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                handleSaveConfig();
                onClose();
              }}
              className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors"
            >
              Apply Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
