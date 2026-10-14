import { FeatureContribution, ShapSummary } from './shap';

export type RiskLevel = 'low' | 'moderate' | 'high';

export type VesselId = 'LAD' | 'LCX' | 'RCA';

export interface VesselPrediction {
  vesselId: VesselId;
  vesselName: string; // "LAD"
  fullVesselName: string; // "Left Anterior Descending"
  stenosisProbability: number; // 0.0 - 1.0 (e.g., 0.78 for 78%)
  riskLevel: RiskLevel;
  anatomicalTerritory: string; // e.g. "Anterior Wall & Interventricular Septum"
  perfusionSegments: string[];
  keyRiskDrivers: string[];
  clinicalSignificance: string;
}

export interface TargetPrediction {
  probability: number;
  class: string; // 'CAD' | 'Normal' or 'Stenotic' | 'Normal'
  riskLevel: RiskLevel;
}

export interface MultiTargetPredictionResponse {
  cad: TargetPrediction;
  lad: TargetPrediction;
  lcx: TargetPrediction;
  rca: TargetPrediction;
  explanations?: {
    overall?: FeatureContribution[];
    cad?: FeatureContribution[];
    lad?: FeatureContribution[];
    lcx?: FeatureContribution[];
    rca?: FeatureContribution[];
  };
  modelMetadata?: {
    dataset: string;
    modelType: string;
    metrics: Record<string, any>;
    leakagePreventionVerified: boolean;
  };
}

export interface PredictionResult {
  id: string;
  timestamp: string;
  overallCadProbability: number; // 0.0 - 1.0
  overallRiskLevel: RiskLevel;
  vessels: {
    LAD: VesselPrediction;
    LCX: VesselPrediction;
    RCA: VesselPrediction;
  };
  overallShap: ShapSummary;
  vesselShap: {
    LAD: ShapSummary;
    LCX: ShapSummary;
    RCA: ShapSummary;
  };
  isMockData: boolean; // Explicitly marked as prototype mock data
  backendSource: 'local_prototype_service' | 'python_fastapi_endpoint';
  executionTimeMs: number;
  dataNotice: string;
}
