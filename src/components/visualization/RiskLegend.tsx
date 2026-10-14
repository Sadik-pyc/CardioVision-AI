import React from 'react';
import { RISK_MAPPING, RiskCategory } from './riskUtils';
import { Info, ShieldCheck, AlertTriangle, AlertCircle } from 'lucide-react';

interface RiskLegendProps {
  className?: string;
  compact?: boolean;
}

export const RiskLegend: React.FC<RiskLegendProps> = ({
  className = '',
  compact = false,
}) => {
  const categories: RiskCategory[] = ['low', 'moderate', 'high'];

  const getIcon = (cat: RiskCategory) => {
    switch (cat) {
      case 'low':
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
      case 'moderate':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
      case 'high':
        return <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />;
    }
  };

  return (
    <div
      className={`bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-lg ${className}`}
      role="region"
      aria-label="Coronary Stenosis Risk Scale Legend"
    >
      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-800/80">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <span>Visualization Risk Tiers</span>
        </span>
        <span className="text-[9px] font-mono text-slate-500">Stenosis Thresholds</span>
      </div>

      <div className={`grid ${compact ? 'grid-cols-3' : 'grid-cols-1 sm:grid-cols-3'} gap-2.5 text-xs`}>
        {categories.map((cat) => {
          const item = RISK_MAPPING[cat];
          return (
            <div
              key={cat}
              className={`p-2.5 rounded-lg ${item.bgCss} border ${item.borderCss} flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block shadow-sm"
                    style={{ backgroundColor: item.cssColor }}
                    aria-hidden="true"
                  />
                  <span className="font-bold text-slate-100 text-[11px] capitalize">
                    {cat}
                  </span>
                </div>
                {getIcon(cat)}
              </div>

              <div className="flex items-center justify-between font-mono text-[10px] text-slate-300 font-semibold">
                <span className="font-bold">{item.rangeLabel}</span>
                <span className="text-slate-400" title="Non-color accessible indicator">
                  {item.symbol}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center gap-1.5 text-[10px] text-slate-400">
        <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        <span>Application visualization tiers (0–33%, 34–66%, 67–100%). Not clinically validated diagnostic cutoffs.</span>
      </div>
    </div>
  );
};
