import React from 'react';
import { FeatureContribution } from '../../types/shap';
import { VesselId } from '../../types/prediction';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles, 
  TrendingUp, 
  TrendingDown,
  Info
} from 'lucide-react';

interface TopFactorsTableProps {
  features: FeatureContribution[];
  targetName?: string;
  selectedVessel?: VesselId | null;
  className?: string;
}

export const TopFactorsTable: React.FC<TopFactorsTableProps> = ({
  features,
  targetName = 'Overall CAD',
  selectedVessel = null,
  className = '',
}) => {
  // Take top 8-10 features sorted by absolute importance
  const topFeatures = [...features]
    .sort((a, b) => Math.abs(b.shapValue) - Math.abs(a.shapValue))
    .slice(0, 10);

  return (
    <div
      className={`bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col ${className}`}
      role="region"
      aria-label="Top Factors Influencing this Prediction Table"
    >
      {/* Header */}
      <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-950/80 border border-indigo-800/80 text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wide">
              Top Factors Influencing this Prediction ({selectedVessel || targetName})
            </h4>
            <p className="text-[11px] text-slate-400">
              Clear clinical attribution ranking each physiological factor's impact on model risk
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono bg-slate-900 text-slate-400 border border-slate-800 px-2 py-0.5 rounded">
          Top 10 Influencers
        </span>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 text-[10px] uppercase font-mono text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-4 font-semibold">Rank & Feature</th>
              <th className="py-2.5 px-4 font-semibold">Observed Patient Value</th>
              <th className="py-2.5 px-4 font-semibold text-right">Model Contribution</th>
              <th className="py-2.5 px-4 font-semibold text-right">Direction of Impact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {topFeatures.length > 0 ? (
              topFeatures.map((feat, idx) => {
                const isPositive = feat.shapValue >= 0;
                const formattedPercent = (Math.abs(feat.shapValue) * 100).toFixed(1);
                const rowKey = `${selectedVessel || targetName}-${feat.featureKey || feat.featureName || 'factor'}-${idx}`;

                return (
                  <tr
                    key={rowKey}
                    className="hover:bg-slate-800/30 transition-colors"
                  >
                    {/* Feature Name */}
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 font-bold w-4 text-center">
                          #{idx + 1}
                        </span>
                        <div>
                          <span className="font-semibold text-slate-200 font-sans text-xs block">
                            {feat.featureName}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono uppercase">
                            {feat.category || 'Clinical factor'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Patient Value */}
                    <td className="py-2.5 px-4 text-slate-300">
                      <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-[11px] font-semibold text-slate-200">
                        {feat.patientValue !== undefined ? String(feat.patientValue) : 'Measured'}
                      </span>
                    </td>

                    {/* Model Contribution */}
                    <td className="py-2.5 px-4 text-right">
                      <span
                        className={`font-bold inline-flex items-center gap-1 ${
                          isPositive ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {isPositive ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        )}
                        <span>{isPositive ? '+' : '-'}{formattedPercent}%</span>
                      </span>
                    </td>

                    {/* Direction Tag */}
                    <td className="py-2.5 px-4 text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${
                          isPositive
                            ? 'bg-rose-950/70 border-rose-800/70 text-rose-300'
                            : 'bg-emerald-950/70 border-emerald-800/70 text-emerald-300'
                        }`}
                      >
                        {isPositive ? (
                          <>
                            <TrendingUp className="w-3 h-3" />
                            <span>Increases Risk</span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="w-3 h-3" />
                            <span>Decreases Risk</span>
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="py-6 text-center text-slate-500 font-sans text-xs">
                  No feature contribution records available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer explanation for judges */}
      <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
        <Info className="w-4 h-4 text-cyan-400 shrink-0" />
        <span>
          Positive (+) values push the probability toward stenosis/CAD; negative (-) values push it toward normal.
        </span>
      </div>
    </div>
  );
};
