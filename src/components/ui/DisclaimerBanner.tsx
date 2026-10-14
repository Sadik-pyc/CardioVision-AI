import React from 'react';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  return (
    <div
      className="bg-amber-950/40 border border-amber-600/40 rounded-xl p-3 sm:p-4 text-amber-200 shadow-sm"
      role="alert"
      aria-label="Clinical Decision-Support Disclaimer"
    >
      <div className="flex items-start gap-3">
        <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold uppercase tracking-wider text-[11px] text-amber-300">
              Clinical & Investigational Prototype Notice
            </span>
            <span className="text-[10px] text-amber-400/90 font-mono bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-800/80">
              Phase 5 Audited Build
            </span>
          </div>
          <p className="leading-relaxed text-amber-200/90 text-[11.5px]">
            <strong>AI-generated predictions are for educational and decision-support purposes only. This system is not a substitute for professional medical diagnosis or formal diagnostic imaging.</strong> All predictions reflect vessel-level statistical probabilities derived from the Z-Alizadeh Sani research dataset and do not represent confirmed physical lesion coordinates or autonomous clinical determinations.
          </p>
        </div>
      </div>
    </div>
  );
};
