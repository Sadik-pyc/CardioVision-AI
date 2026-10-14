export type FeatureCategory = 
  | 'clinical' 
  | 'ecg' 
  | 'imaging' 
  | 'biomarker' 
  | 'metabolic' 
  | 'demographic';

export interface FeatureContribution {
  featureKey: string;
  featureName: string;
  category: FeatureCategory;
  patientValue: string | number;
  unit?: string;
  baselineValue?: string | number;
  shapValue: number; // e.g. +0.14 or -0.08
  absoluteImportance: number; // |shapValue|
  direction: 'increases_risk' | 'decreases_risk';
  clinicalRationale?: string;
}

export interface ShapSummary {
  baseValue: number; // Baseline log-odds or expected prevalence (e.g. 0.32)
  outputValue: number; // Final model predicted probability
  features: FeatureContribution[];
}
