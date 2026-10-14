import React, { useState } from 'react';
import { PatientData } from '../../types/patient';
import { 
  User, 
  Activity, 
  FlaskConical, 
  Stethoscope, 
  Heart, 
  ChevronRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

interface PatientPhysiologicalProfileProps {
  patient: PatientData;
  className?: string;
}

type ProfileCategory = 'all' | 'demographics' | 'vitals' | 'laboratory' | 'ecg' | 'echocardiographic';

export const PatientPhysiologicalProfile: React.FC<PatientPhysiologicalProfileProps> = ({
  patient,
  className = '',
}) => {
  const [activeCategory, setActiveCategory] = useState<ProfileCategory>('all');

  const ext = patient.additionalFeatures || {};

  // Formatted data items grouped by dataset modality
  const demographicsItems = [
    { label: 'Age', value: `${patient.age} years`, reference: 'Adult cohort: 30–86', datasetCol: 'Age' },
    { label: 'Sex', value: patient.sex === 'male' ? 'Male' : 'Female', reference: 'Binary category', datasetCol: 'Sex' },
    { label: 'BMI', value: `${patient.bmi.toFixed(1)} kg/m²`, reference: 'Normal: 18.5–24.9', isAbnormal: patient.bmi >= 30, datasetCol: 'BMI' },
    { label: 'Obesity Status', value: patient.bmi >= 30 ? 'Yes (Obese)' : 'No', reference: 'BMI ≥ 30', isAbnormal: patient.bmi >= 30, datasetCol: 'Obesity' },
    { label: 'Current Smoker', value: patient.smokingStatus === 'current' ? 'Yes (Active)' : 'No', reference: 'Binary history', isAbnormal: patient.smokingStatus === 'current', datasetCol: 'Current Smoker' },
    { label: 'Ex-Smoker', value: patient.smokingStatus === 'former' ? 'Yes (Former)' : 'No', reference: 'Past history', datasetCol: 'EX-Smoker' },
    { label: 'Family History CAD', value: patient.familyHistoryCAD ? 'Positive (+)' : 'Negative (-)', reference: 'First-degree relative', isAbnormal: patient.familyHistoryCAD, datasetCol: 'FH' },
    { label: 'Diabetes Mellitus', value: patient.diabetes ? 'Yes (Diabetic)' : 'No', reference: 'Fasting glucose ≥ 126', isAbnormal: patient.diabetes, datasetCol: 'DM' },
    { label: 'Hypertension', value: patient.hypertension ? 'Yes (Hypertensive)' : 'No', reference: 'BP ≥ 140/90 mmHg', isAbnormal: patient.hypertension, datasetCol: 'HTN' },
  ];

  const vitalsItems = [
    { label: 'Systolic Blood Pressure', value: `${patient.systolicBP} mmHg`, reference: '< 120 mmHg', isAbnormal: patient.systolicBP >= 140, datasetCol: 'BP' },
    { label: 'Diastolic Blood Pressure', value: `${patient.diastolicBP} mmHg`, reference: '< 80 mmHg', isAbnormal: patient.diastolicBP >= 90, datasetCol: 'BP' },
    { label: 'Pulse Rate / Heart Rate', value: `${patient.heartRate} bpm`, reference: '60–100 bpm', isAbnormal: patient.heartRate > 100 || patient.heartRate < 55, datasetCol: 'PR' },
    { label: 'Typical Chest Pain', value: patient.chestPainType === 'typical_angina' ? 'Present (Anginal)' : 'Absent', reference: 'Clinical presentation', isAbnormal: patient.chestPainType === 'typical_angina', datasetCol: 'Typical Chest Pain' },
    { label: 'Dyspnea (Shortness of Breath)', value: patient.dyspnea ? 'Present (Exertional)' : 'Absent', reference: 'NYHA assessment', isAbnormal: patient.dyspnea, datasetCol: 'Dyspnea' },
    { label: 'Peripheral Edema', value: ext['Edema'] ? 'Present (Grade 1+)' : 'Absent', reference: 'Bilateral pedal exam', datasetCol: 'Edema' },
  ];

  const laboratoryItems = [
    { label: 'Total Cholesterol', value: `${patient.totalCholesterol} mg/dL`, reference: '< 200 mg/dL', isAbnormal: patient.totalCholesterol >= 200, datasetCol: 'TG / Lipid' },
    { label: 'Low-Density Lipoprotein (LDL)', value: `${patient.ldl} mg/dL`, reference: '< 100 mg/dL', isAbnormal: patient.ldl >= 130, datasetCol: 'LDL' },
    { label: 'High-Density Lipoprotein (HDL)', value: `${patient.hdl} mg/dL`, reference: '> 40 mg/dL (M) / > 50 (F)', isAbnormal: patient.hdl < 40, datasetCol: 'HDL' },
    { label: 'Triglycerides (TG)', value: `${patient.triglycerides} mg/dL`, reference: '< 150 mg/dL', isAbnormal: patient.triglycerides >= 200, datasetCol: 'TG' },
    { label: 'Fasting Blood Sugar (FBS)', value: `${patient.fastingBloodSugar} mg/dL`, reference: '70–99 mg/dL', isAbnormal: patient.fastingBloodSugar >= 126, datasetCol: 'FBS' },
    { label: 'Serum Creatinine (CR)', value: ext['CR'] ? `${ext['CR']} mg/dL` : '1.0 mg/dL', reference: '0.6–1.2 mg/dL', datasetCol: 'CR' },
    { label: 'Blood Urea Nitrogen (BUN)', value: ext['BUN'] ? `${ext['BUN']} mg/dL` : '16 mg/dL', reference: '7–20 mg/dL', datasetCol: 'BUN' },
    { label: 'Erythrocyte Sed. Rate (ESR)', value: ext['ESR'] ? `${ext['ESR']} mm/hr` : '18 mm/hr', reference: '< 20 mm/hr', isAbnormal: Number(ext['ESR'] || 0) > 25, datasetCol: 'ESR' },
    { label: 'Hemoglobin (HB)', value: ext['HB'] ? `${ext['HB']} g/dL` : '13.5 g/dL', reference: '13.5–17.5 g/dL (M)', datasetCol: 'HB' },
    { label: 'Serum Potassium (K)', value: ext['K'] ? `${ext['K']} mEq/L` : '4.2 mEq/L', reference: '3.5–5.0 mEq/L', datasetCol: 'K' },
    { label: 'Serum Sodium (Na)', value: ext['Na'] ? `${ext['Na']} mEq/L` : '140 mEq/L', reference: '135–145 mEq/L', datasetCol: 'Na' },
    { label: 'White Blood Cell Count (WBC)', value: ext['WBC'] ? `${ext['WBC']} /µL` : '7,500 /µL', reference: '4,500–11,000 /µL', datasetCol: 'WBC' },
  ];

  const ecgItems = [
    { label: 'ST Elevation', value: patient.stElevationDepression === 'st_elevation' ? 'Detected (J-Point Shift)' : 'Normal Isoelectric', reference: 'STEMI criteria', isAbnormal: patient.stElevationDepression === 'st_elevation', datasetCol: 'St Elevation' },
    { label: 'ST Depression', value: patient.stElevationDepression === 'st_depression_horizontal_downsloping' ? 'Detected (Horizontal/Downsloping)' : 'Normal Isoelectric', reference: 'Subendocardial ischemia', isAbnormal: patient.stElevationDepression === 'st_depression_horizontal_downsloping', datasetCol: 'St Depression' },
    { label: 'T-Wave Inversion', value: patient.tWaveInversion !== 'none' ? `Present (${patient.tWaveInversion.replace('_', ' ')})` : 'Normal Upright', reference: 'Repolarization shift', isAbnormal: patient.tWaveInversion !== 'none', datasetCol: 'Tinversion' },
    { label: 'Pathological Q Wave', value: patient.restingECG === 'pathological_q_waves' ? 'Present (Transmural scar)' : 'Absent', reference: 'Infarct mark (>0.04s)', isAbnormal: patient.restingECG === 'pathological_q_waves', datasetCol: 'Q Wave' },
    { label: 'Left Ventricular Hypertrophy', value: patient.lvh ? 'Positive (Voltage Criteria)' : 'Negative', reference: 'Sokolow-Lyon index', isAbnormal: patient.lvh, datasetCol: 'LVH' },
    { label: 'Bundle Branch Block (BBB)', value: patient.restingECG === 'bundle_branch_block' ? 'LBBB / RBBB detected' : 'None', reference: 'QRS duration ≥ 120ms', isAbnormal: patient.restingECG === 'bundle_branch_block', datasetCol: 'BBB' },
  ];

  const echoItems = [
    { label: 'Ejection Fraction (EF-TTE)', value: `${patient.lvef}%`, reference: 'Normal ≥ 50–55%', isAbnormal: patient.lvef < 50, datasetCol: 'EF-TTE' },
    { label: 'Regional Wall Motion (RWMA)', value: patient.rwmaRegion !== 'none' ? `Abnormal (${patient.rwmaRegion.replace('_', ' ')})` : 'Normal (No akinesis/hypokinesis)', reference: '17-segment model', isAbnormal: patient.rwmaRegion !== 'none', datasetCol: 'Region RWMA' },
    { label: 'Valvular Heart Disease (VHD)', value: ext['VHD'] ? String(ext['VHD']) : 'Normal / None', reference: 'Aortic/Mitral regurgitation', datasetCol: 'VHD' },
  ];

  const getFilteredItems = () => {
    switch (activeCategory) {
      case 'demographics':
        return [{ title: 'Demographics & Cardiovascular Risk History', icon: User, items: demographicsItems }];
      case 'vitals':
        return [{ title: 'Hemodynamics & Vitals', icon: Activity, items: vitalsItems }];
      case 'laboratory':
        return [{ title: 'Metabolic & Clinical Laboratory Biomarkers', icon: FlaskConical, items: laboratoryItems }];
      case 'ecg':
        return [{ title: '12-Lead Electrocardiographic (ECG) Findings', icon: Stethoscope, items: ecgItems }];
      case 'echocardiographic':
        return [{ title: 'Transthoracic Echocardiography (Echo / TTE)', icon: Heart, items: echoItems }];
      case 'all':
      default:
        return [
          { title: 'Demographics & History', icon: User, items: demographicsItems },
          { title: 'Vitals & Presentation', icon: Activity, items: vitalsItems },
          { title: 'Laboratory Biomarkers', icon: FlaskConical, items: laboratoryItems },
          { title: '12-Lead ECG Findings', icon: Stethoscope, items: ecgItems },
          { title: 'Echocardiography (TTE)', icon: Heart, items: echoItems },
        ];
    }
  };

  const sections = getFilteredItems();

  return (
    <div
      className={`bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl ${className}`}
      role="region"
      aria-label="Patient Physiological Profile"
    >
      {/* Header */}
      <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-800/80 text-cyan-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-100 tracking-wide">
                Patient Physiological Profile
              </h3>
              <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded">
                UCI 411 Demo Schema
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Demonstration clinical parameters submitted to the ML prediction pipeline (synthetic case archetype)
            </p>
          </div>
        </div>

        {/* Filter Navigation */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs overflow-x-auto">
          {[
            { id: 'all', label: 'All Modalities' },
            { id: 'demographics', label: 'Demographics' },
            { id: 'vitals', label: 'Vitals' },
            { id: 'laboratory', label: 'Laboratory' },
            { id: 'ecg', label: 'ECG' },
            { id: 'echocardiographic', label: 'Echo' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as ProfileCategory)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors whitespace-nowrap ${
                activeCategory === tab.id
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Profile Body */}
      <div className="p-5 space-y-5">
        {sections.map((sec, idx) => {
          const Icon = sec.icon;
          return (
            <div key={idx} className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider pb-1 border-b border-slate-800/80">
                <Icon className="w-3.5 h-3.5 text-cyan-400" />
                <span>{sec.title}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {sec.items.map((item, itemIdx) => (
                  <div
                    key={itemIdx}
                    className={`p-2.5 rounded-lg border transition-colors ${
                      item.isAbnormal
                        ? 'bg-rose-950/20 border-rose-900/60'
                        : 'bg-slate-950/60 border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <span className="text-[11px] font-medium text-slate-400 leading-tight">
                        {item.label}
                      </span>
                      <span className="text-[9px] font-mono text-slate-500 bg-slate-900 px-1 rounded border border-slate-800 shrink-0">
                        {item.datasetCol}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between mt-1">
                      <span
                        className={`font-mono text-xs font-bold ${
                          item.isAbnormal ? 'text-rose-300' : 'text-slate-200'
                        }`}
                      >
                        {item.value}
                      </span>
                      {item.isAbnormal && (
                        <span className="text-[9px] font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-0.5">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          <span>Flagged</span>
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] text-slate-500 block mt-1">
                      Ref: {item.reference}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
