import React from 'react';
import { 
  GitBranch, 
  Database, 
  ShieldAlert, 
  Cpu, 
  BarChart3, 
  Eye, 
  ArrowRight,
  CheckCircle2,
  Lock
} from 'lucide-react';

interface MethodologyPipelineSectionProps {
  className?: string;
}

export const MethodologyPipelineSection: React.FC<MethodologyPipelineSectionProps> = ({
  className = '',
}) => {
  const steps = [
    {
      num: '01',
      title: 'Clinical Patient Data',
      subtitle: '55 Raw Biomarkers',
      desc: 'Demographics, vitals, 12-lead ECG, laboratory panels, and echocardiographic parameters.',
      icon: Database,
      accent: 'text-cyan-400 border-cyan-800/80 bg-cyan-950/40',
    },
    {
      num: '02',
      title: 'Preprocessing & Encoding',
      subtitle: '57 Feature Matrix',
      desc: 'One-hot encoding for 21 categorical variables and Z-score standardization on numerical features.',
      icon: GitBranch,
      accent: 'text-sky-400 border-sky-800/80 bg-sky-950/40',
    },
    {
      num: '03',
      title: 'Leakage-Safe Selection',
      subtitle: 'Strict Exclusion of Targets',
      desc: "Columns ['Cath', 'LAD', 'LCX', 'RCA'] are completely blocked from input features X to prevent artificial accuracy.",
      icon: Lock,
      accent: 'text-rose-400 border-rose-800/80 bg-rose-950/40',
      badge: 'Target Leakage Guard',
    },
    {
      num: '04',
      title: 'ML Multi-Target Classifiers',
      subtitle: 'RF & Regularized Logistic',
      desc: 'Dedicated classifiers trained per anatomical vessel branch on 5-fold stratified cross-validation.',
      icon: Cpu,
      accent: 'text-indigo-400 border-indigo-800/80 bg-indigo-950/40',
    },
    {
      num: '05',
      title: 'Probability & Model Feature Attributions',
      subtitle: 'True Model Attributions',
      desc: 'Calibrated stenosis probabilities (0–100%) and feature attributions quantifying each physiological driver.',
      icon: BarChart3,
      accent: 'text-amber-400 border-amber-800/80 bg-amber-950/40',
    },
    {
      num: '06',
      title: 'Interactive 3D Visualization',
      subtitle: 'Synchronized WebGL Viewer',
      desc: 'Real-time coronary tree coloring (0–33% Low, 34–66% Moderate, 67–100% High) mapped to arterial branches.',
      icon: Eye,
      accent: 'text-emerald-400 border-emerald-800/80 bg-emerald-950/40',
    },
  ];

  return (
    <div
      className={`bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl ${className}`}
      role="region"
      aria-label="Dataset and ML Methodology Pipeline Section"
    >
      {/* Header */}
      <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-sky-950/80 border border-sky-800/80 text-sky-400">
            <GitBranch className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-100 tracking-wide">
                End-to-End Prediction & Explainability Pipeline
              </h3>
              <span className="text-[10px] font-mono bg-sky-950 text-sky-300 border border-sky-800 px-2 py-0.5 rounded">
                Leakage-Safe Architecture
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Reproducible clinical decision-support pipeline from patient profile to 3D coronary mapping
            </p>
          </div>
        </div>
      </div>

      {/* Steps Flow Grid */}
      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border ${step.accent} relative flex flex-col justify-between space-y-2`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[10px] font-bold text-slate-400 uppercase">
                      Stage {step.num}
                    </span>
                    {step.badge && (
                      <span className="text-[9px] font-mono bg-rose-950 text-rose-300 border border-rose-800 px-1.5 py-0.5 rounded font-bold">
                        {step.badge}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4 shrink-0" />
                    <h4 className="font-bold text-xs text-slate-100 leading-tight">
                      {step.title}
                    </h4>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 block mb-1">
                    {step.subtitle}
                  </span>

                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Target Leakage Rule Footnote */}
      <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 text-rose-300">
          <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
          <span>
            Target Leakage Guarantee: Under no circumstances are Catheterization or vessel outcomes permitted in input feature vectors.
          </span>
        </div>
        <span className="font-mono text-[10px] text-slate-500">
          UCI Repository ID: 411 · Strict Compliance
        </span>
      </div>
    </div>
  );
};
