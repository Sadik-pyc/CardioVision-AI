import React, { useState } from 'react';
import { 
  PatientData, 
  Sex, 
  ChestPainType, 
  RestingECGPattern, 
  STElevationDepression, 
  TWaveInversion, 
  RWMARegion, 
  SmokingStatus 
} from '../../types/patient';
import { PATIENT_PRESETS } from '../../data/presets';
import { 
  User, 
  Heart, 
  Activity, 
  FlaskConical, 
  Stethoscope, 
  RotateCcw, 
  Sparkles, 
  FileText,
  ChevronRight,
  Sliders
} from 'lucide-react';

interface PatientInputFormProps {
  currentPatient: PatientData;
  isLoading: boolean;
  onUpdatePatient: (updated: PatientData) => void;
  onSubmitPrediction: (patient: PatientData) => void;
  onSelectPreset: (presetId: string) => void;
  onResetPatient?: () => void;
}

type TabKey = 'vitals' | 'labs' | 'ecg_biomarkers' | 'history';

export const PatientInputForm: React.FC<PatientInputFormProps> = ({
  currentPatient,
  isLoading,
  onUpdatePatient,
  onSubmitPrediction,
  onSelectPreset,
  onResetPatient,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('vitals');

  const handleChange = <K extends keyof PatientData>(field: K, value: PatientData[K]) => {
    onUpdatePatient({
      ...currentPatient,
      [field]: value,
    });
  };

  const handleNumberChange = (field: keyof PatientData, valueStr: string) => {
    const val = parseFloat(valueStr);
    handleChange(field, isNaN(val) ? 0 : val as any);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col">
      {/* Panel Header */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-950/50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-800/60 text-cyan-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-100 tracking-wide">
                Patient Clinical Profile & Physiological Inputs
              </h3>
              <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-1.5 py-0.5 rounded">
                Schema v1.2
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Coronary artery disease multi-vessel risk factors
            </p>
          </div>
        </div>

        {/* Preset Archetype Quick Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-400 font-medium mr-1 hidden sm:inline">
            Load Archetype:
          </span>
          <select
            onChange={(e) => onSelectPreset(e.target.value)}
            className="bg-slate-900 border border-slate-700 hover:border-cyan-500 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 outline-none focus:border-cyan-400 transition-colors"
            defaultValue=""
          >
            <option value="" disabled>Select Clinical Case Preset...</option>
            {PATIENT_PRESETS.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center border-b border-slate-800 bg-slate-950/40 px-3 pt-2 gap-1 overflow-x-auto text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('vitals')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-semibold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'vitals'
              ? 'border-cyan-400 text-cyan-300 bg-slate-900/70'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Demographics & Vitals</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('labs')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-semibold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'labs'
              ? 'border-cyan-400 text-cyan-300 bg-slate-900/70'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FlaskConical className="w-3.5 h-3.5" />
          <span>Lipids & Metabolic Labs</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('ecg_biomarkers')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-semibold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'ecg_biomarkers'
              ? 'border-cyan-400 text-cyan-300 bg-slate-900/70'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>ECG & Echocardiography</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-semibold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'history'
              ? 'border-cyan-400 text-cyan-300 bg-slate-900/70'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5" />
          <span>Symptoms & History</span>
        </button>
      </div>

      {/* Form Content Area */}
      <div className="p-4 space-y-4 flex-1">
        {activeTab === 'vitals' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Age (years)
              </label>
              <input
                type="number"
                min="18"
                max="100"
                value={currentPatient.age}
                onChange={(e) => handleNumberChange('age', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              />
              <span className="text-[10px] text-slate-500">Standard range: 18 - 95</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Biological Sex
              </label>
              <select
                value={currentPatient.sex}
                onChange={(e) => handleChange('sex', e.target.value as Sex)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 outline-none"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              <span className="text-[10px] text-slate-500">Baseline epidemiological risk factor</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Body Mass Index (BMI kg/m²)
              </label>
              <input
                type="number"
                step="0.1"
                value={currentPatient.bmi}
                onChange={(e) => handleNumberChange('bmi', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 outline-none"
              />
              <span className="text-[10px] text-slate-500">Normal: 18.5 - 24.9</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Systolic Blood Pressure (mmHg)
              </label>
              <input
                type="number"
                value={currentPatient.systolicBP}
                onChange={(e) => handleNumberChange('systolicBP', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 outline-none"
              />
              <span className="text-[10px] text-slate-500">Optimal: &lt; 120 mmHg</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Diastolic Blood Pressure (mmHg)
              </label>
              <input
                type="number"
                value={currentPatient.diastolicBP}
                onChange={(e) => handleNumberChange('diastolicBP', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 outline-none"
              />
              <span className="text-[10px] text-slate-500">Optimal: &lt; 80 mmHg</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Resting Heart Rate (bpm)
              </label>
              <input
                type="number"
                value={currentPatient.heartRate}
                onChange={(e) => handleNumberChange('heartRate', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 outline-none"
              />
              <span className="text-[10px] text-slate-500">Resting pulse rate</span>
            </div>
          </div>
        )}

        {activeTab === 'labs' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Total Cholesterol (mg/dL)
              </label>
              <input
                type="number"
                value={currentPatient.totalCholesterol}
                onChange={(e) => handleNumberChange('totalCholesterol', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 outline-none"
              />
              <span className="text-[10px] text-slate-500">Desirable: &lt; 200 mg/dL</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                LDL Cholesterol (mg/dL)
              </label>
              <input
                type="number"
                value={currentPatient.ldl}
                onChange={(e) => handleNumberChange('ldl', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 outline-none"
              />
              <span className="text-[10px] text-slate-500">Atherogenic lipid fraction</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                HDL Cholesterol (mg/dL)
              </label>
              <input
                type="number"
                value={currentPatient.hdl}
                onChange={(e) => handleNumberChange('hdl', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 outline-none"
              />
              <span className="text-[10px] text-slate-500">Protective: &gt; 50 mg/dL</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Triglycerides (mg/dL)
              </label>
              <input
                type="number"
                value={currentPatient.triglycerides}
                onChange={(e) => handleNumberChange('triglycerides', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 outline-none"
              />
              <span className="text-[10px] text-slate-500">Normal: &lt; 150 mg/dL</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Fasting Blood Glucose (mg/dL)
              </label>
              <input
                type="number"
                value={currentPatient.fastingBloodSugar}
                onChange={(e) => handleNumberChange('fastingBloodSugar', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 outline-none"
              />
              <span className="text-[10px] text-slate-500">Fasting sugar (dataset supported)</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Glycated Hemoglobin (HbA1c %)
              </label>
              <input
                type="number"
                step="0.1"
                value={currentPatient.hba1c}
                onChange={(e) => handleNumberChange('hba1c', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 outline-none"
              />
              <span className="text-[10px] text-slate-500">Diabetic threshold: &ge; 6.5%</span>
            </div>
          </div>
        )}

        {activeTab === 'ecg_biomarkers' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Resting ECG Pattern
              </label>
              <select
                value={currentPatient.restingECG}
                onChange={(e) => handleChange('restingECG', e.target.value as RestingECGPattern)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-cyan-500 outline-none"
              >
                <option value="normal">Normal Baseline</option>
                <option value="st_t_wave_abnormality">ST-T Wave Abnormality</option>
                <option value="left_ventricular_hypertrophy">Left Ventricular Hypertrophy (LVH)</option>
                <option value="bundle_branch_block">Bundle Branch Block</option>
                <option value="pathological_q_waves">Pathological Q Waves</option>
              </select>
              <span className="text-[10px] text-slate-500">Resting 12-lead tracing</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                ST Elevation / Depression
              </label>
              <select
                value={currentPatient.stElevationDepression}
                onChange={(e) => handleChange('stElevationDepression', e.target.value as STElevationDepression)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-cyan-500 outline-none"
              >
                <option value="none">None / Isoelectric</option>
                <option value="st_depression_horizontal_downsloping">ST Depression (Horiz / Downsloping)</option>
                <option value="st_depression_upsloping">ST Depression (Upsloping)</option>
                <option value="st_elevation">ST Elevation (Territorial)</option>
              </select>
              <span className="text-[10px] text-slate-500">Ischemia-specific repolarization</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                T-Wave Inversion
              </label>
              <select
                value={currentPatient.tWaveInversion}
                onChange={(e) => handleChange('tWaveInversion', e.target.value as TWaveInversion)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-cyan-500 outline-none"
              >
                <option value="none">None / Upright</option>
                <option value="anterior_leads">Anterior Leads (V1 - V4) → LAD</option>
                <option value="inferior_leads">Inferior Leads (II, III, aVF) → RCA</option>
                <option value="lateral_leads">Lateral Leads (I, aVL, V5-V6) → LCX</option>
                <option value="diffuse">Diffuse Inversions</option>
              </select>
              <span className="text-[10px] text-slate-500">Correlates with vessel territory</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Region with RWMA (Echocardiogram)
              </label>
              <select
                value={currentPatient.rwmaRegion}
                onChange={(e) => handleChange('rwmaRegion', e.target.value as RWMARegion)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-cyan-500 outline-none"
              >
                <option value="none">None (Normokinetic)</option>
                <option value="anterior_wall">Anterior Wall (LAD territory)</option>
                <option value="inferior_wall">Inferior Wall (RCA territory)</option>
                <option value="lateral_wall">Lateral Wall (LCX territory)</option>
                <option value="septal_wall">Septal Wall (LAD territory)</option>
                <option value="posterior_wall">Posterior Wall (LCX/RCA)</option>
                <option value="apical">Apical (LAD terminal)</option>
              </select>
              <span className="text-[10px] text-slate-500">Wall motion hypokinesis</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Cardiac Troponin I (hs-cTnI ng/mL)
              </label>
              <input
                type="number"
                step="0.01"
                value={currentPatient.troponinI}
                onChange={(e) => handleNumberChange('troponinI', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 outline-none"
              />
              <span className="text-[10px] text-slate-500">Auxiliary marker (display & triage context)</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                LV Ejection Fraction (LVEF %)
              </label>
              <input
                type="number"
                value={currentPatient.lvef}
                onChange={(e) => handleNumberChange('lvef', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 outline-none"
              />
              <span className="text-[10px] text-slate-500">Normal systolic function: &gt; 50%</span>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Chest Pain Characterization
              </label>
              <select
                value={currentPatient.chestPainType}
                onChange={(e) => handleChange('chestPainType', e.target.value as ChestPainType)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-cyan-500 outline-none"
              >
                <option value="typical_angina">Typical Angina Pectoris</option>
                <option value="atypical_angina">Atypical Angina</option>
                <option value="non_cardiac_pain">Non-Cardiac Chest Pain</option>
                <option value="asymptomatic">Asymptomatic</option>
              </select>
              <span className="text-[10px] text-slate-500">Diamond-Forrester criteria</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Smoking History
              </label>
              <select
                value={currentPatient.smokingStatus}
                onChange={(e) => handleChange('smokingStatus', e.target.value as SmokingStatus)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-cyan-500 outline-none"
              >
                <option value="never">Never Smoker</option>
                <option value="former">Former Smoker</option>
                <option value="current">Current Smoker</option>
              </select>
              <span className="text-[10px] text-slate-500">Endothelial injury risk</span>
            </div>

            <div className="space-y-2 pt-1">
              <span className="block text-xs font-medium text-slate-300">
                Binary Clinical Flags
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentPatient.exertionalAngina}
                    onChange={(e) => handleChange('exertionalAngina', e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0"
                  />
                  <span>Exertional Angina (Context)</span>
                </label>
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentPatient.dyspnea}
                    onChange={(e) => handleChange('dyspnea', e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0"
                  />
                  <span>Dyspnea on Exertion</span>
                </label>
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentPatient.hypertension}
                    onChange={(e) => handleChange('hypertension', e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0"
                  />
                  <span>Hypertension Hx</span>
                </label>
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentPatient.diabetes}
                    onChange={(e) => handleChange('diabetes', e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0"
                  />
                  <span>Diabetes Mellitus</span>
                </label>
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentPatient.familyHistoryCAD}
                    onChange={(e) => handleChange('familyHistoryCAD', e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0"
                  />
                  <span>Family CAD Hx</span>
                </label>
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentPatient.lvh}
                    onChange={(e) => handleChange('lvh', e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0"
                  />
                  <span>LVH on Tracing</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Form Action Footer */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (onResetPatient) {
                onResetPatient();
              } else {
                onSelectPreset('preset-low-risk');
              }
            }}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-900 transition-colors"
            title="Reset form fields to non-obstructive baseline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Patient</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectPreset('preset-high-lad')}
            className="text-xs text-cyan-300 hover:text-cyan-200 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-800/80 bg-cyan-950/60 hover:bg-cyan-900/60 transition-colors font-medium"
            title="Load verified demonstration case for hackathon evaluation"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>Load Demo Patient</span>
          </button>
        </div>

        <button
          type="button"
          disabled={isLoading}
          onClick={() => onSubmitPrediction(currentPatient)}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold tracking-wide transition-all shadow-lg ${
            isLoading
              ? 'bg-cyan-900/60 text-cyan-300 cursor-not-allowed'
              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20 active:scale-98'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Analyzing Patient Data...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Analyze Patient (Run Prediction)</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
