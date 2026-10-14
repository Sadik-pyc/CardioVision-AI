import React from 'react';
import { VesselId, VesselPrediction, PredictionResult } from '../../types/prediction';
import { RISK_MAPPING, getRiskCategory } from './riskUtils';
import { 
  Heart, 
  Info, 
  Sparkles,
  Layers,
  Activity
} from 'lucide-react';

interface VesselInfoPanelProps {
  prediction: PredictionResult;
  selectedVessel: VesselId | null;
  onSelectVessel: (vesselId: VesselId | null) => void;
  className?: string;
}

export const VesselInfoPanel: React.FC<VesselInfoPanelProps> = ({
  prediction,
  selectedVessel,
  onSelectVessel,
  className = '',
}) => {
  const currentVesselPrediction: VesselPrediction | null = selectedVessel
    ? prediction.vessels[selectedVessel]
    : null;

  const currentVesselAttribution = selectedVessel
    ? prediction.vesselShap[selectedVessel]
    : prediction.overallShap;

  const vesselCategory = currentVesselPrediction
    ? getRiskCategory(currentVesselPrediction.stenosisProbability)
    : null;
  const vesselRiskInfo = vesselCategory ? RISK_MAPPING[vesselCategory] : null;

  return (
    <div
      className={`bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col gap-3 text-xs ${className}`}
      role="region"
      aria-label="Selected Vessel Anatomical and Prediction Details"
    >
      {/* Panel Section Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h4 className="font-bold text-slate-100 text-xs tracking-wide">
            Selected Vessel Details
          </h4>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">
          3D Synchronized
        </span>
      </div>

      {/* 3-Vessel Quick Selector Tabs */}
      <div className="space-y-1">
        <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 block">
          Target Coronary Vessel Selection
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          {(['LAD', 'LCX', 'RCA'] as const).map((vId) => {
            const vData = prediction.vessels[vId];
            const prob = vData.stenosisProbability;
            const cat = getRiskCategory(prob);
            const isSelected = selectedVessel === vId;
            const riskInfo = RISK_MAPPING[cat];

            return (
              <button
                key={vId}
                onClick={() => onSelectVessel(vId)}
                aria-pressed={isSelected}
                className={`p-2 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'bg-cyan-950/70 border-cyan-400 text-slate-100 ring-1 ring-cyan-400/50 shadow-md'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-bold font-mono text-xs text-slate-100">{vId}</span>
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: riskInfo.cssColor }}
                    aria-hidden="true"
                  />
                </div>
                <div className="font-mono text-[11px] font-bold text-slate-200">
                  {(prob * 100).toFixed(1)}%
                </div>
                <span className="text-[9px] uppercase tracking-wide text-slate-400 block mt-0.5">
                  {cat}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Vessel Inspector Details */}
      {selectedVessel && currentVesselPrediction && vesselRiskInfo ? (
        <div className="space-y-3 flex-1 flex flex-col justify-between">
          <div className="space-y-2.5">
            {/* Title & Badge */}
            <div className="flex items-start justify-between gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/70">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-sm text-cyan-400">
                    {currentVesselPrediction.vesselName}
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-200 font-semibold text-xs truncate max-w-[150px]">
                    {currentVesselPrediction.fullVesselName}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Territory: {currentVesselPrediction.anatomicalTerritory}
                </span>
              </div>

              <span
                className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold uppercase border ${vesselRiskInfo.badgeCss} shrink-0`}
              >
                {vesselCategory} Risk
              </span>
            </div>

            {/* Probability Metric Grid */}
            <div className="grid grid-cols-2 gap-2 text-center font-mono">
              <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
                <span className="text-[9px] text-slate-500 block uppercase font-medium">Stenosis Probability</span>
                <span className="text-base font-bold text-slate-100 mt-0.5 block">
                  {(currentVesselPrediction.stenosisProbability * 100).toFixed(1)}%
                </span>
              </div>
              <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
                <span className="text-[9px] text-slate-500 block uppercase font-medium">Visualization Tier</span>
                <span className="text-xs font-bold text-slate-200 mt-1 block uppercase">
                  {vesselRiskInfo.rangeLabel}
                </span>
              </div>
            </div>

            {/* Myocardial Perfusion Supply Segments */}
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-medium block">
                Myocardial Perfusion Segments:
              </span>
              <div className="flex flex-wrap gap-1">
                {currentVesselPrediction.perfusionSegments.map((seg, i) => (
                  <span
                    key={i}
                    className="bg-slate-950/80 border border-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[10px]"
                  >
                    {seg}
                  </span>
                ))}
              </div>
            </div>

            {/* Top Driving Biomarkers for Selected Vessel */}
            {currentVesselAttribution.features.length > 0 && (
              <div className="space-y-1 pt-1.5 border-t border-slate-800/70">
                <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>Top Driving Biomarkers ({selectedVessel}):</span>
                </span>
                <div className="space-y-1">
                  {currentVesselAttribution.features.slice(0, 3).map((feat, i) => {
                    const isPos = feat.shapValue >= 0;
                    return (
                      <div
                        key={feat.featureKey || i}
                        className="flex items-center justify-between bg-slate-950/70 px-2 py-1 rounded border border-slate-800/60 text-[10px]"
                      >
                        <span className="text-slate-300 truncate max-w-[160px]">{feat.featureName}</span>
                        <span
                          className={`font-mono font-bold ${
                            isPos ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          {isPos ? '+' : ''}
                          {(feat.shapValue * 100).toFixed(1)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Spatial Limitation Clinical Note */}
          <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex items-start gap-1.5 text-[10px] text-slate-400 leading-relaxed">
            <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              <strong>Note:</strong> Coloring represents vessel-specific stenosis probability. The ML model does not produce physical spatial lesion coordinates.
            </span>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-lg bg-slate-950/50 border border-slate-800 text-center text-slate-400 space-y-1.5 flex-1 flex flex-col items-center justify-center">
          <Layers className="w-5 h-5 text-slate-600 mb-0.5" />
          <p className="text-xs font-semibold text-slate-300">Select a Vessel to Inspect</p>
          <p className="text-[10px] text-slate-500 max-w-[190px]">Click LAD, LCX, or RCA directly in the 3D model or above to view anatomical details.</p>
        </div>
      )}
    </div>
  );
};
