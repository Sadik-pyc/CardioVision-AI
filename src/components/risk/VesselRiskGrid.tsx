import React from 'react';
import { VesselId, VesselPrediction } from '../../types/prediction';
import { getRiskCategory, RISK_MAPPING } from '../visualization/riskUtils';
import { StenosisGauge } from './StenosisGauge';
import { Crosshair, ArrowRight, Activity, MapPin } from 'lucide-react';

interface VesselRiskGridProps {
  vessels: {
    LAD: VesselPrediction;
    LCX: VesselPrediction;
    RCA: VesselPrediction;
  };
  selectedVessel: VesselId | null;
  onSelectVessel: (vesselId: VesselId) => void;
}

export const VesselRiskGrid: React.FC<VesselRiskGridProps> = ({
  vessels,
  selectedVessel,
  onSelectVessel,
}) => {
  const vesselList: VesselPrediction[] = [vessels.LAD, vessels.LCX, vessels.RCA];

  const getBorderAccent = (vesselId: VesselId, isSelected: boolean) => {
    if (isSelected) return 'border-cyan-400 ring-2 ring-cyan-500/30 bg-slate-900';
    return 'border-slate-800 hover:border-slate-700 bg-slate-900/80';
  };

  const getStatusBadge = (level: 'low' | 'moderate' | 'high') => {
    switch (level) {
      case 'high':
        return 'text-rose-400 bg-rose-950/50 border-rose-800/60';
      case 'moderate':
        return 'text-amber-400 bg-amber-950/50 border-amber-800/60';
      case 'low':
      default:
        return 'text-emerald-400 bg-emerald-950/50 border-emerald-800/60';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
            Coronary Vessel Stenosis Predictions
          </h3>
        </div>
        <span className="text-[11px] text-slate-400">
          Target vessels: LAD · LCX · RCA
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {vesselList.map((vessel) => {
          const isSelected = selectedVessel === vessel.vesselId;
          const probPercent = Math.round(vessel.stenosisProbability * 100);
          const category = getRiskCategory(vessel.stenosisProbability);
          const riskInfo = RISK_MAPPING[category];

          return (
            <div
              key={vessel.vesselId}
              onClick={() => onSelectVessel(vessel.vesselId)}
              className={`rounded-xl border p-4.5 cursor-pointer transition-all duration-200 flex flex-col justify-between shadow-lg relative group ${getBorderAccent(
                vessel.vesselId,
                isSelected
              )}`}
            >
              {/* Header */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black font-mono tracking-tight text-slate-100">
                        {vessel.vesselId}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${riskInfo.badgeCss}`}>
                        {category}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 block mt-0.5">
                      {vessel.fullVesselName}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectVessel(vessel.vesselId);
                    }}
                    title="Focus in 3D Anatomy"
                    className={`p-1.5 rounded-lg border transition-colors ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                        : 'bg-slate-800/60 text-slate-400 border-slate-700 group-hover:text-cyan-400'
                    }`}
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Gauge and Perfusion Info */}
                <div className="my-3 flex items-center justify-between gap-4 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider block">
                      Stenosis Likelihood
                    </span>
                    <div className="text-2xl font-bold font-mono text-slate-100">
                      {probPercent}%
                    </div>
                    <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          vessel.riskLevel === 'high'
                            ? 'bg-rose-500'
                            : vessel.riskLevel === 'moderate'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${probPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="shrink-0">
                    <StenosisGauge
                      probability={vessel.stenosisProbability}
                      riskLevel={vessel.riskLevel}
                      size={68}
                      strokeWidth={6}
                    />
                  </div>
                </div>

                {/* Perfusion Territory */}
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span className="font-medium text-[11px]">Territory:</span>
                  </div>
                  <p className="text-slate-300 text-[11px] pl-4 font-normal leading-snug">
                    {vessel.anatomicalTerritory}
                  </p>
                </div>

                {/* Key Risk Drivers */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px]">
                  <span className="text-slate-500 block mb-1">Key Correlated Drivers:</span>
                  <div className="flex flex-wrap gap-1">
                    {vessel.keyRiskDrivers.map((driver, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded text-[10px] border border-slate-700/60"
                      >
                        {driver}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom prompt */}
              <div className="mt-4 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-cyan-400 font-medium group-hover:underline flex items-center gap-1">
                  {isSelected ? 'Focused in 3D viewport' : 'Inspect 3D projection & Attributions'}
                  <ArrowRight className="w-3 h-3" />
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {vessel.perfusionSegments.length} Segments
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
