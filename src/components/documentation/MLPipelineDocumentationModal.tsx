import React, { useState } from 'react';
import { 
  BookOpen, 
  X, 
  Database, 
  ShieldAlert, 
  Cpu, 
  CheckCircle2, 
  BarChart, 
  AlertTriangle,
  GitBranch,
  Layers,
  Table
} from 'lucide-react';
import trainedArtifacts from '../../data/trained_model_artifacts.json';

interface MLPipelineDocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MLPipelineDocumentationModal: React.FC<MLPipelineDocumentationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'leakage' | 'schema' | '3d_architecture' | 'limitations'>('overview');

  if (!isOpen) return null;

  const metadata = (trainedArtifacts as any).metadata;
  const targets = (trainedArtifacts as any).targets;
  const targetDists = (trainedArtifacts as any).target_distributions;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-800/60 text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100">
                  Track A: Authoritative Machine Learning & 3D Documentation
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-semibold">
                  Phase 3 Verified
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Extension of Z-Alizadeh Sani Cardiovascular Dataset (UCI Machine Learning Repository ID: 411)
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

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/50 px-6 pt-2 gap-2 text-xs overflow-x-auto">
          {[
            { id: 'overview', label: 'Dataset & Architecture', icon: Database },
            { id: 'metrics', label: 'Evaluation Metrics & Models', icon: BarChart },
            { id: 'leakage', label: 'Target Leakage Prevention', icon: ShieldAlert },
            { id: 'schema', label: 'Feature Schema & Encodings', icon: Table },
            { id: '3d_architecture', label: '3D Anatomy & Vessel Mapping', icon: Layers },
            { id: 'limitations', label: 'Scientific Limitations', icon: AlertTriangle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-2.5 border-b-2 font-medium flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-cyan-400 text-cyan-300 bg-slate-900/40'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 text-xs space-y-6 leading-relaxed">
          {activeTab === 'overview' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Dataset Size</span>
                  <span className="text-xl font-bold font-mono text-slate-100">{metadata.total_instances} Patients</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">303 Real Clinical Cases</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Input Features</span>
                  <span className="text-xl font-bold font-mono text-slate-100">{metadata.total_features} Features</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">57 Encoded Columns</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Missing Values</span>
                  <span className="text-xl font-bold font-mono text-emerald-400">0 Missing</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">100% Complete Records</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Validation Split</span>
                  <span className="text-xl font-bold font-mono text-cyan-400">80% / 20%</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Stratified 5-Fold CV</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-bold text-slate-200 text-sm">Authoritative Dataset Source</h4>
                <p className="text-slate-300">
                  The dataset employed is the peer-reviewed <strong className="text-cyan-300">Extension of Z-Alizadeh Sani Cardiovascular Dataset</strong>, hosted at the UCI Machine Learning Repository (Identifier: 411).
                  Unlike basic single-target cardiovascular datasets, this extension features ground-truth catheterization angiography classifications for both general CAD and specific arterial coronary branches: <strong>LAD (Left Anterior Descending)</strong>, <strong>LCX (Left Circumflex)</strong>, and <strong>RCA (Right Coronary Artery)</strong>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 text-sm">Ground-Truth Target Distributions (N = 303)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="flex items-center justify-between font-mono font-bold text-slate-200">
                      <span>Target 1: Cath (Overall CAD)</span>
                      <span className="text-rose-400">216 CAD (71.3%)</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">Normal: 87 (28.7%) | Substantial clinical class imbalance.</div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="flex items-center justify-between font-mono font-bold text-slate-200">
                      <span>Target 2: LAD Stenosis</span>
                      <span className="text-rose-400">177 Stenotic (58.4%)</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">Normal: 126 (41.6%) | Most common single-vessel obstruction.</div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="flex items-center justify-between font-mono font-bold text-slate-200">
                      <span>Target 3: LCX Stenosis</span>
                      <span className="text-amber-400">119 Stenotic (39.3%)</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">Normal: 184 (60.7%) | Lower prevalence and less distinct ECG markers.</div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="flex items-center justify-between font-mono font-bold text-slate-200">
                      <span>Target 4: RCA Stenosis</span>
                      <span className="text-amber-400">114 Stenotic (37.6%)</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">Normal: 189 (62.4%) | Evaluated via inferior wall ECG and hemodynamic markers.</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'metrics' && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-800/60 text-slate-300">
                Models were trained across 5-Fold Stratified Cross-Validation on the training partition (N=242) and evaluated strictly on the untouched, held-out test partition (N=61). No test data was ever observed during hyperparameter selection or scaling.
              </div>

              <div className="space-y-4">
                {Object.entries(targets).map(([key, info]: [string, any]) => (
                  <div key={key} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold font-mono uppercase text-slate-100">{key} Model</span>
                        <span className="text-slate-500">·</span>
                        <span className="text-cyan-400 font-semibold">{info.model_name}</span>
                      </div>
                      <span className="text-[10px] font-mono bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800">
                        Target Col: {info.target_column}
                      </span>
                    </div>

                    {/* Held-out Test Metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-center">
                      <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Test Accuracy</span>
                        <span className="font-bold text-slate-200">{(info.test_metrics.test_accuracy * 100).toFixed(1)}%</span>
                      </div>
                      <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Test Precision</span>
                        <span className="font-bold text-slate-200">{(info.test_metrics.test_precision * 100).toFixed(1)}%</span>
                      </div>
                      <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Test Recall</span>
                        <span className="font-bold text-slate-200">{(info.test_metrics.test_recall * 100).toFixed(1)}%</span>
                      </div>
                      <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Test F1-Score</span>
                        <span className="font-bold text-slate-200">{(info.test_metrics.test_f1 * 100).toFixed(1)}%</span>
                      </div>
                      <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Test ROC-AUC</span>
                        <span className="font-bold text-cyan-400">{(info.test_metrics.test_roc_auc * 100).toFixed(1)}%</span>
                      </div>
                    </div>

                    {/* Top Correlated Features */}
                    <div className="text-[11px] pt-1">
                      <span className="text-slate-500 font-semibold block mb-1">Top Driving Features Discovered:</span>
                      <div className="flex flex-wrap gap-1">
                        {info.top_features.slice(0, 6).map((f: any, idx: number) => (
                          <span key={idx} className="bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800 text-[10px] font-mono">
                            {f.feature} ({(f.importance * 100).toFixed(1)}%)
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'leakage' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/60 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                  <ShieldAlert className="w-5 h-5" />
                  <span>Target Leakage Prevention Audit</span>
                </div>
                <p className="text-slate-300">
                  Target leakage occurs when an algorithm is trained on features that directly contain information about the target variable or downstream invasive outcomes (such as catheterization findings).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 text-sm">Strictly Excluded Columns:</h4>
                <div className="space-y-2 font-mono text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-rose-900/60 flex items-center justify-between">
                    <div>
                      <span className="text-rose-400 font-bold">Cath</span>
                      <span className="text-slate-400 ml-2">— Catheterization ground truth overall CAD</span>
                    </div>
                    <span className="text-[10px] bg-rose-950 text-rose-300 px-2 py-0.5 rounded border border-rose-800">EXCLUDED FROM X</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-rose-900/60 flex items-center justify-between">
                    <div>
                      <span className="text-rose-400 font-bold">LAD</span>
                      <span className="text-slate-400 ml-2">— Angiographic stenosis status of Left Anterior Descending</span>
                    </div>
                    <span className="text-[10px] bg-rose-950 text-rose-300 px-2 py-0.5 rounded border border-rose-800">EXCLUDED FROM X</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-rose-900/60 flex items-center justify-between">
                    <div>
                      <span className="text-rose-400 font-bold">LCX</span>
                      <span className="text-slate-400 ml-2">— Angiographic stenosis status of Left Circumflex</span>
                    </div>
                    <span className="text-[10px] bg-rose-950 text-rose-300 px-2 py-0.5 rounded border border-rose-800">EXCLUDED FROM X</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-rose-900/60 flex items-center justify-between">
                    <div>
                      <span className="text-rose-400 font-bold">RCA</span>
                      <span className="text-slate-400 ml-2">— Angiographic stenosis status of Right Coronary Artery</span>
                    </div>
                    <span className="text-[10px] bg-rose-950 text-rose-300 px-2 py-0.5 rounded border border-rose-800">EXCLUDED FROM X</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-emerald-400 font-semibold pt-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Pipeline Audit Verified: Zero target leakage columns are used as input predictors.</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 text-sm">Input Feature Modalities (55 Total Features)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <span className="font-bold text-cyan-400">Demographics & History (17 features)</span>
                    <p className="text-slate-400 text-[11px]">
                      Age, Weight, Length, Sex, BMI, DM, HTN, Current Smoker, EX-Smoker, FH, Obesity, CRF, CVA, Airway disease, Thyroid Disease, CHF, DLP.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <span className="font-bold text-cyan-400">Physical Exam & Symptoms (14 features)</span>
                    <p className="text-slate-400 text-[11px]">
                      BP, PR, Edema, Weak Peripheral Pulse, Lung rales, Systolic Murmur, Diastolic Murmur, Typical Chest Pain, Dyspnea, Function Class, Atypical, Nonanginal, Exertional CP, LowTH Ang.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <span className="font-bold text-cyan-400">ECG Electrophysiology (7 features)</span>
                    <p className="text-slate-400 text-[11px]">
                      Q Wave, St Elevation, St Depression, Tinversion, LVH, Poor R Progression, BBB (Normal, LBBB, RBBB).
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <span className="font-bold text-cyan-400">Laboratory & Echocardiography (17 features)</span>
                    <p className="text-slate-400 text-[11px]">
                      FBS, CR, TG, LDL, HDL, BUN, ESR, HB, K, Na, WBC, Lymph, Neut, PLT, EF-TTE, Region RWMA (0-4), VHD.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === '3d_architecture' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/60 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                  <Layers className="w-5 h-5" />
                  <span>Phase 3 Interactive 3D Cardiovascular Architecture</span>
                </div>
                <p className="text-slate-300">
                  Built on Three.js WebGL with ACES Filmic tone mapping, 60 FPS performance, OrbitControls (free rotation, zooming, panning), and dynamic arterial shader materials.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-bold font-mono text-cyan-400">LAD Artery Branch</span>
                  <p className="text-[11px] text-slate-300">
                    Courses down anterior interventricular sulcus to apex, with Diagonal (D1, D2) and septal perforator branches.
                  </p>
                  <span className="text-[10px] text-slate-500 font-mono block pt-1">
                    Supplies: Anterior myocardium & apex
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-bold font-mono text-cyan-400">LCX Artery Branch</span>
                  <p className="text-[11px] text-slate-300">
                    Travels along left atrioventricular groove, with Obtuse Marginal (OM1, OM2) branches.
                  </p>
                  <span className="text-[10px] text-slate-500 font-mono block pt-1">
                    Supplies: Posterolateral left ventricle
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-bold font-mono text-cyan-400">RCA Artery Branch</span>
                  <p className="text-[11px] text-slate-300">
                    Courses along right coronary sulcus to crux cordis, with Acute Marginal and Posterior Descending (PDA) branches.
                  </p>
                  <span className="text-[10px] text-slate-500 font-mono block pt-1">
                    Supplies: Inferior wall & right ventricle
                  </span>
                </div>
              </div>

              {/* Risk Mapping Thresholds */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-bold text-slate-200 text-sm">Visual Risk Scale Mapping</h4>
                <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs">
                  <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800/80">
                    <span className="font-bold text-emerald-400 block">LOW RISK</span>
                    <span className="text-slate-300 text-[11px]">0% – 33%</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-amber-950/60 border border-amber-800/80">
                    <span className="font-bold text-amber-400 block">MODERATE RISK</span>
                    <span className="text-slate-300 text-[11px]">34% – 66%</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-800/80">
                    <span className="font-bold text-rose-400 block">HIGH RISK</span>
                    <span className="text-slate-300 text-[11px]">67% – 100%</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 pt-1">
                  Blue glow indicates the active user-selected vessel. Yellow glow indicates hover raycast focus.
                </p>
              </div>

              {/* Model Adapter Architecture */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-bold text-slate-200 text-sm">Model Adapter Abstraction (<code className="text-cyan-300">HeartModelAdapter.ts</code>)</h4>
                <p className="text-slate-300 text-[11px]">
                  The 3D viewer is decoupled from geometry generation via the <code className="text-cyan-300">IHeartModelAdapter</code> interface. The current procedural scaffold provides mathematically accurate coronary splines and cardiac chambers without third-party copyright restrictions. An inspection utility (<code className="text-cyan-300">inspectGLTFScene</code>) is pre-wired to load external GLB/GLTF assets and automatically map meshes named <code className="text-cyan-300">LAD</code>, <code className="text-cyan-300">LCX</code>, or <code className="text-cyan-300">RCA</code>.
                </p>
              </div>

              {/* Crucial Medical Accuracy Rule */}
              <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/60 space-y-1.5">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Important Medical Accuracy Boundary</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  The Z-Alizadeh Sani dataset provides tabular catheterization outcomes per vessel, <strong>not voxel or 3D anatomical lesion coordinates</strong>. Therefore, this visualization maps predicted stenosis probabilities across the whole vessel arborization, and does not claim to detect an exact physical millimeter point of plaque rupture or thrombosis.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'limitations' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/60 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Transparent Scientific & Statistical Limitations</span>
                </div>
                <p className="text-slate-300">
                  Per rigorous biomedical engineering standards, machine learning performance metrics must be reported with full fidelity and no exaggerated clinical claims.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
                  <strong className="text-slate-200 block mb-1">1. Sample Cohort Size (N = 303)</strong>
                  <p className="text-slate-400 text-[11px]">
                    While the Z-Alizadeh Sani dataset is one of the most thoroughly labeled public CAD datasets, 303 patients is modest for complex multi-artery deep models. Cross-validation variance and potential cohort selection bias exist.
                  </p>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
                  <strong className="text-slate-200 block mb-1">2. Anatomical Branch Discrepancies (LCX Challenge)</strong>
                  <p className="text-slate-400 text-[11px]">
                    While LAD stenosis models achieved high discriminative capacity (Test ROC-AUC: 84.0%), the LCX stenosis model demonstrated lower test performance (ROC-AUC: 57.2%). In clinical electrophysiology, circumflex lesions are notoriously silent on surface 12-lead ECGs and require high-resolution CTCA or angiography.
                  </p>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
                  <strong className="text-slate-200 block mb-1">3. Clinical Decision Support Boundary</strong>
                  <p className="text-slate-400 text-[11px]">
                    This system is an investigational decision-support prototype. It does not replace clinical judgment, coronary angiograms, fractional flow reserve (FFR), or formal cardiology consultation.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-mono text-[11px]">
            Model Pipeline: Scikit-Learn 1.7.2 · StratifiedKFold 5-Split
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
};
