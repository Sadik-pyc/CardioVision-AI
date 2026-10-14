import React, { useState, useEffect } from 'react';
import { PredictionResult, VesselId } from '../../types/prediction';
import { FeatureCategory, FeatureContribution, ShapSummary } from '../../types/shap';
import { TopFactorsTable } from './TopFactorsTable';
import { getRiskCategory, RISK_MAPPING } from '../visualization/riskUtils';
import { 
  BarChart3, 
  HelpCircle, 
  ArrowUpRight, 
  ArrowDownRight, 
  Layers, 
  Info, 
  Filter,
  TrendingUp,
  TrendingDown,
  Table,
  BarChart2
} from 'lucide-react';

interface ShapContributionViewProps {
  prediction: PredictionResult;
  selectedVessel: VesselId | null;
  onSelectVessel: (vesselId: VesselId | null) => void;
  className?: string;
}

export const ShapContributionView: React.FC<ShapContributionViewProps> = ({
  prediction,
  selectedVessel,
  onSelectVessel,
  className = '',
}) => {
  const [activeTarget, setActiveTarget] = useState<'overall' | VesselId>(
    selectedVessel || 'overall'
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'bars_and_table' | 'bars_only' | 'table_only'>('bars_and_table');
  const [showRationals, setShowRationals] = useState(true);

  // Synchronize with external selected vessel
  useEffect(() => {
    if (selectedVessel) {
      setActiveTarget(selectedVessel);
    } else {
      setActiveTarget('overall');
    }
  }, [selectedVessel]);

  const currentSummary: ShapSummary =
    activeTarget === 'overall'
      ? prediction.overallShap
      : prediction.vesselShap[activeTarget];

  const currentVesselPrediction =
    activeTarget !== 'overall' ? prediction.vessels[activeTarget] : null;

  // Filter features by category
  const filteredFeatures = currentSummary.features.filter((f) => {
    if (selectedCategory === 'all') return true;
    return f.category === selectedCategory;
  });

  // Sort features by absolute SHAP contribution (Top 8-10)
  const topFeatures = [...filteredFeatures]
    .sort((a, b) => Math.abs(b.shapValue) - Math.abs(a.shapValue))
    .slice(0, 10);

  // Calculate max absolute shap value for scaling
  const maxAbsShap = Math.max(
    0.15,
    ...topFeatures.map((f) => Math.abs(f.shapValue))
  );

  const targetTitle =
    activeTarget === 'overall'
      ? 'Overall CAD Risk (Cath Ground Truth)'
      : `${activeTarget} Artery (${currentVesselPrediction?.fullVesselName || activeTarget})`;

  const vesselCategory = currentVesselPrediction
    ? getRiskCategory(currentVesselPrediction.stenosisProbability)
    : getRiskCategory(prediction.overallCadProbability);
  const vesselRiskInfo = RISK_MAPPING[vesselCategory];

  return (
    <div className={`bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl space-y-0 ${className}`}>
      {/* Header */}
      <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-950/70 border border-indigo-800/60 text-indigo-400">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-100 tracking-wide">
                Explainable AI: Model Feature Attributions
              </h3>
              <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-1.5 py-0.5 rounded">
                Model Feature Attributions
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Empirical attributions quantifying each biomarker's directional impact on predicted risk (Tree Importance & L2 Coefficients)
            </p>
          </div>
        </div>

        {/* Target Prediction Switcher (Synchronized with 3D Viewer) */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs">
          <button
            onClick={() => {
              setActiveTarget('overall');
              onSelectVessel(null);
            }}
            className={`px-3 py-1 rounded font-medium transition-all ${
              activeTarget === 'overall'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Overall CAD
          </button>
          <button
            onClick={() => {
              setActiveTarget('LAD');
              onSelectVessel('LAD');
            }}
            className={`px-3 py-1 rounded font-medium transition-all ${
              activeTarget === 'LAD'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            LAD (Anterior)
          </button>
          <button
            onClick={() => {
              setActiveTarget('LCX');
              onSelectVessel('LCX');
            }}
            className={`px-3 py-1 rounded font-medium transition-all ${
              activeTarget === 'LCX'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            LCX (Circumflex)
          </button>
          <button
            onClick={() => {
              setActiveTarget('RCA');
              onSelectVessel('RCA');
            }}
            className={`px-3 py-1 rounded font-medium transition-all ${
              activeTarget === 'RCA'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            RCA (Right Artery)
          </button>
        </div>
      </div>

      {/* Selected Vessel / Target Info Summary Strip */}
      <div className="px-5 py-3 bg-slate-950/40 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-mono">
              Target Scope
            </span>
            <span className="font-semibold text-slate-100 text-xs">
              {targetTitle}
            </span>
          </div>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-mono">
              Expected Base Value E[f(x)]
            </span>
            <span className="font-mono font-bold text-slate-300">
              {(currentSummary.baseValue * 100).toFixed(1)}%
            </span>
          </div>
          <span className="text-slate-700 text-lg">→</span>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-mono">
              Patient Probability f(x)
            </span>
            <span
              className={`font-mono font-bold text-sm ${
                currentSummary.outputValue >= 0.67
                  ? 'text-rose-400'
                  : currentSummary.outputValue >= 0.34
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {(currentSummary.outputValue * 100).toFixed(1)}%
            </span>
          </div>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase border ${vesselRiskInfo.badgeCss}`}>
            {vesselCategory} Risk
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
            <span className="text-slate-300">+ Risk (Increases Stenosis)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
            <span className="text-slate-300">- Risk (Protective / Low)</span>
          </div>
        </div>
      </div>

      {/* Filter Chips & View Mode Selector */}
      <div className="px-5 py-2.5 border-b border-slate-800 bg-slate-900/50 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <Filter className="w-3.5 h-3.5 text-slate-500 mr-1 shrink-0" />
          {[
            { id: 'all', label: 'All Factors' },
            { id: 'imaging', label: 'Imaging & RWMA' },
            { id: 'ecg', label: 'ECG Findings' },
            { id: 'biomarker', label: 'Biomarkers' },
            { id: 'metabolic', label: 'Lipids & Metabolism' },
            { id: 'clinical', label: 'Clinical History' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded text-xs transition-colors whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-slate-800 text-slate-100 font-medium border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-950 border border-slate-800 p-0.5 rounded-lg text-[11px]">
            <button
              onClick={() => setViewMode('bars_and_table')}
              className={`px-2 py-0.5 rounded transition-colors ${
                viewMode === 'bars_and_table'
                  ? 'bg-slate-800 text-slate-100'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Combined View
            </button>
            <button
              onClick={() => setViewMode('bars_only')}
              className={`px-2 py-0.5 rounded transition-colors ${
                viewMode === 'bars_only'
                  ? 'bg-slate-800 text-slate-100'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Bar Chart
            </button>
            <button
              onClick={() => setViewMode('table_only')}
              className={`px-2 py-0.5 rounded transition-colors ${
                viewMode === 'table_only'
                  ? 'bg-slate-800 text-slate-100'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Table View
            </button>
          </div>
        </div>
      </div>

      {/* Main Explainability Visualization Body */}
      <div className="p-5 space-y-6">
        {/* Horizontal Diverging Bar Chart */}
        {(viewMode === 'bars_and_table' || viewMode === 'bars_only') && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300">
                Top 8–10 Influential Features (Horizontal Diverging Attribution Bar Chart)
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                Centered on Zero Shift (0.0)
              </span>
            </div>

            <div className="space-y-2.5">
              {topFeatures.length > 0 ? (
                topFeatures.map((feat, idx) => {
                  const isPositive = feat.shapValue >= 0;
                  const barWidthPercent = Math.min(
                    100,
                    Math.round((Math.abs(feat.shapValue) / maxAbsShap) * 100)
                  );
                  const itemKey = `${activeTarget}-${feat.featureKey || feat.featureName || 'feat'}-${idx}`;

                  return (
                    <div
                      key={itemKey}
                      className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
                    >
                      {/* Feature Name & Contribution Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500 font-mono font-bold w-4 text-center">
                            #{idx + 1}
                          </span>
                          <span className="font-semibold text-xs text-slate-200">
                            {feat.featureName}
                          </span>
                          <span className="text-[10px] text-slate-400 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded font-mono">
                            Patient Value: {String(feat.patientValue ?? 'Measured')}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 font-mono text-xs">
                          <span
                            className={`font-bold flex items-center gap-0.5 ${
                              isPositive ? 'text-rose-400' : 'text-emerald-400'
                            }`}
                          >
                            {isPositive ? (
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            ) : (
                              <ArrowDownRight className="w-3.5 h-3.5" />
                            )}
                            {isPositive ? '+' : ''}
                            {(feat.shapValue * 100).toFixed(1)}%
                          </span>
                          <span className="text-[10px] text-slate-500 uppercase">
                            | {isPositive ? 'Higher Risk' : 'Protective'}
                          </span>
                        </div>
                      </div>

                      {/* Diverging Bar Chart Bar */}
                      <div className="relative w-full h-3 bg-slate-900 rounded-sm overflow-hidden flex">
                        {/* Negative / Protective side (Left) */}
                        <div className="w-1/2 flex justify-end pr-0.5">
                          {!isPositive && (
                            <div
                              className="h-full bg-emerald-500 rounded-l-sm transition-all duration-500"
                              style={{ width: `${barWidthPercent}%` }}
                            />
                          )}
                        </div>

                        {/* Zero Line Divider */}
                        <div className="w-0.5 h-full bg-slate-600 z-10" />

                        {/* Positive / Risk side (Right) */}
                        <div className="w-1/2 flex justify-start pl-0.5">
                          {isPositive && (
                            <div
                              className="h-full bg-rose-500 rounded-r-sm transition-all duration-500"
                              style={{ width: `${barWidthPercent}%` }}
                            />
                          )}
                        </div>
                      </div>

                      {/* Clinical Rationale Note */}
                      {showRationals && feat.clinicalRationale && (
                        <p className="mt-1.5 text-[10px] text-slate-400 leading-relaxed pl-1 border-l-2 border-slate-800">
                          {feat.clinicalRationale}
                        </p>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="py-6 text-center text-slate-500 text-xs">
                  No feature contributions matching selected filter.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Feature -> Risk Connection Table */}
        {(viewMode === 'bars_and_table' || viewMode === 'table_only') && (
          <TopFactorsTable
            features={currentSummary.features}
            targetName={targetTitle}
            selectedVessel={activeTarget !== 'overall' ? activeTarget : null}
          />
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between flex-wrap gap-2">
        <span>
          CAD & LAD: Random Forest feature importances scaled by standard deviations. LCX & RCA: L2 Logistic Regression normalized coefficients. Feature attributions indicate model behavior and are not causal clinical effects.
        </span>
        <span className="font-mono text-[10px] text-slate-400">
          Deterministic Empirical Computation
        </span>
      </div>
    </div>
  );
};
