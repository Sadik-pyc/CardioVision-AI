import React from 'react';
import { PredictionResult, RiskLevel, VesselId } from '../../types/prediction';
import { StenosisGauge } from './StenosisGauge';
import { 
  ShieldCheck, 
  AlertCircle, 
  AlertTriangle, 
  Cpu, 
  Clock, 
  Terminal, 
  Layers
} from 'lucide-react';
import { RISK_MAPPING, getRiskCategory } from '../visualization/riskUtils';

interface RiskSummaryProps {
  prediction: PredictionResult;
  selectedVessel?: VesselId | null;
  onSelectVessel?: (vesselId: VesselId | null) => void;
  onOpenPythonApiModal: () => void;
}

export const RiskSummary: React.FC<RiskSummaryProps> = ({
  prediction,
  selectedVessel = null,
  onSelectVessel,
  onOpenPythonApiModal,
}) => {
  const getBadgeStyle = (level: RiskLevel) => {
    switch (level) {
      case 'high':
        return 'bg-rose-950/60 text-rose-400 border-rose-500/40';
      case 'moderate':
        return 'bg-amber-950/60 text-amber-400 border-amber-500/40';
      case 'low':
      default:
        return 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40';
    }
  };

  const getRiskIcon = (level: RiskLevel) => {
    switch (level) {
      case 'high':
        return <AlertCircle className="w-5 h-5 text-rose-400" />;
      case 'moderate':
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'low':
      default:
        return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
    }
  };

  const overallPercent = (prediction.overallCadProbability * 100).toFixed(1);
  const overallCategory = getRiskCategory(prediction.overallCadProbability);
  const predictedClass = prediction.overallCadProbability >= 0.5 ? 'CAD Positive' : 'Normal / Low Risk';

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden space-y-5">
      {/* Background glow accent */}
      <div
        className={`absolute -right-20 -top-20 w-52 h-52 rounded-full blur-3xl pointer-events-none opacity-15 ${
          overallCategory === 'high'
            ? 'bg-rose-500'
            : overallCategory === 'moderate'
            ? 'bg-amber-500'
            : 'bg-emerald-500'
        }`}
      />

      {/* TOP: Overall CAD Risk Card */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
        {/* Left: Overall Risk Details */}
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-mono tracking-wider uppercase text-cyan-400 font-bold">
              Primary CAD Risk Assessment
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-[11px] text-slate-400 font-mono">
              Inference ID: {prediction.id.slice(0, 10)}
            </span>
            <span className="text-[10px] text-emerald-300 bg-emerald-950/70 border border-emerald-800/80 px-2 py-0.5 rounded font-mono flex items-center gap-1.5 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Z-Alizadeh Sani Pipeline (UCI 411)
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {getRiskIcon(overallCategory)}
            <div className="flex items-baseline gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight">
                Overall CAD Risk:
              </h2>
              <span className={`text-xl sm:text-2xl font-extrabold ${
                overallCategory === 'high' ? 'text-rose-400' : overallCategory === 'moderate' ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {overallCategory.toUpperCase()}
              </span>
              <span className="text-base sm:text-lg font-mono font-bold text-slate-300">
                ({overallPercent}%)
              </span>
            </div>
          </div>

          {/* Predicted Class Tag & Description */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-slate-400">Classification:</span>
            <span className="font-mono text-xs font-bold text-slate-100 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              {predictedClass}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">Visualization Tier:</span>
            <span className={`font-mono text-[10px] px-2 py-0.5 rounded border uppercase font-bold ${getBadgeStyle(overallCategory)}`}>
              {overallCategory}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
            {overallCategory === 'high'
              ? 'Multi-parametric assessment indicates elevated probability of flow-limiting coronary atherosclerosis (>50% stenosis). Recommended for cardiology referral, functional stress testing, or CT coronary angiography.'
              : overallCategory === 'moderate'
              ? 'Intermediate probability profile with borderline clinical or biomarker indicators. Lifestyle modification, aggressive lipid optimization, and serial evaluation advised.'
              : 'Low probability of obstructive coronary artery disease under resting evaluation. Maintain primary cardiovascular prevention guidelines.'}
          </p>

          {/* Statistical Metrics row */}
          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-400">
            <div>
              <span className="text-slate-500">Predicted Probability:</span>{' '}
              <span className="font-mono text-slate-200 font-bold">
                {overallPercent}%
              </span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Inference:</span>{' '}
              <span className="font-mono text-slate-200">{prediction.executionTimeMs} ms</span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-slate-500" />
              <span>Pipeline:</span>{' '}
              <button
                onClick={onOpenPythonApiModal}
                className="text-cyan-400 hover:text-cyan-300 underline font-mono flex items-center gap-1"
              >
                <span>Live Python API (UCI 411)</span>
                <Terminal className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Radial Stenosis Gauge */}
        <div className="flex flex-col items-center justify-center p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 shrink-0 self-center md:self-auto">
          <StenosisGauge
            probability={prediction.overallCadProbability}
            riskLevel={prediction.overallRiskLevel}
            size={110}
            strokeWidth={9}
            label="CAD Risk"
          />
          <div className="text-[10px] text-slate-400 font-mono mt-1 text-center">
            Catheterization Model
          </div>
        </div>
      </div>

      {/* BOTTOM: Integrated Vessel Breakdown Cards (LAD, LCX, RCA) */}
      <div className="pt-2 border-t border-slate-800/80 relative z-10">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Vessel-Specific Stenosis Predictions (Click to focus in 3D & Attributions)</span>
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Synchronized with 3D Viewer</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(['LAD', 'LCX', 'RCA'] as const).map((vId) => {
            const vData = prediction.vessels[vId];
            const prob = vData.stenosisProbability;
            const percentStr = (prob * 100).toFixed(1);
            const category = getRiskCategory(prob);
            const riskInfo = RISK_MAPPING[category];
            const classification = prob >= 0.5 ? 'Stenotic' : 'Normal';
            const isSelected = selectedVessel === vId;

            return (
              <button
                key={vId}
                onClick={() => onSelectVessel && onSelectVessel(vId)}
                aria-pressed={isSelected}
                className={`p-3.5 rounded-xl border text-left transition-all relative cursor-pointer min-w-0 ${
                  isSelected
                    ? 'bg-slate-900 border-cyan-400 ring-2 ring-cyan-400/50 shadow-lg shadow-cyan-950/40'
                    : 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between gap-1.5 mb-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-mono font-extrabold text-sm text-slate-100 shrink-0">
                      {vId}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate">
                      {vData.fullVesselName.split(' ')[0]}
                    </span>
                  </div>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold uppercase border ${riskInfo.badgeCss} shrink-0`}
                  >
                    {category}
                  </span>
                </div>

                <div className="flex items-baseline justify-between gap-2 mt-1.5">
                  <span className="text-xl sm:text-2xl font-mono font-black text-slate-100 tracking-tight shrink-0">
                    {percentStr}%
                  </span>
                  <span className={`font-mono text-[11px] font-semibold px-2 py-0.5 rounded border shrink-0 ${
                    prob >= 0.5 
                      ? 'bg-rose-950/60 text-rose-300 border-rose-800/60' 
                      : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                  }`}>
                    {classification}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800/80 rounded-full h-1.5 mt-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percentStr}%`,
                      backgroundColor: riskInfo.cssColor,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-medium">
                  <span className="shrink-0 mr-1">Territory:</span>
                  <span className="text-slate-300 font-mono truncate text-right">
                    {vData.anatomicalTerritory.split(',')[0]}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
