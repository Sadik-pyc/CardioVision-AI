export type Sex = 'male' | 'female';

export type ChestPainType = 
  | 'typical_angina' 
  | 'atypical_angina' 
  | 'non_cardiac_pain' 
  | 'asymptomatic';

export type RestingECGPattern = 
  | 'normal' 
  | 'st_t_wave_abnormality' 
  | 'left_ventricular_hypertrophy' 
  | 'bundle_branch_block'
  | 'pathological_q_waves';

export type STElevationDepression = 
  | 'none' 
  | 'st_elevation' 
  | 'st_depression_horizontal_downsloping' 
  | 'st_depression_upsloping';

export type TWaveInversion = 
  | 'none' 
  | 'anterior_leads' 
  | 'inferior_leads' 
  | 'lateral_leads' 
  | 'diffuse';

export type RWMARegion = 
  | 'none' 
  | 'anterior_wall' 
  | 'inferior_wall' 
  | 'lateral_wall' 
  | 'septal_wall' 
  | 'posterior_wall' 
  | 'apical';

export type SmokingStatus = 'never' | 'former' | 'current';

export interface PatientData {
  id: string;
  name?: string;
  recordNumber?: string;
  // Demographics
  age: number;
  sex: Sex;
  bmi: number;
  
  // Hemodynamics / Vitals
  systolicBP: number;
  diastolicBP: number;
  heartRate: number;

  // Lipids & Metabolic Labs
  totalCholesterol: number; // mg/dL
  ldl: number; // mg/dL
  hdl: number; // mg/dL
  triglycerides: number; // mg/dL
  fastingBloodSugar: number; // mg/dL
  hba1c: number; // %

  // ECG & Electrophysiology
  restingECG: RestingECGPattern;
  stElevationDepression: STElevationDepression;
  tWaveInversion: TWaveInversion;
  lvh: boolean; // Left Ventricular Hypertrophy

  // Cardiac Biomarkers & Echocardiography
  troponinI: number; // ng/mL (high sensitivity)
  ckMb: number; // ng/mL
  lvef: number; // Left Ventricular Ejection Fraction %
  rwmaRegion: RWMARegion; // Regional Wall Motion Abnormality

  // Clinical Symptoms & History
  chestPainType: ChestPainType;
  exertionalAngina: boolean;
  dyspnea: boolean;
  hypertension: boolean;
  diabetes: boolean;
  smokingStatus: SmokingStatus;
  familyHistoryCAD: boolean;

  // Extensible container for custom dataset schema columns (e.g. Z-Alizadeh Sani / Cleveland / UCI / Custom CSV)
  additionalFeatures?: Record<string, string | number | boolean>;
}

export interface PatientPreset {
  id: string;
  name: string;
  subtitle: string;
  tag: string;
  data: PatientData;
}
