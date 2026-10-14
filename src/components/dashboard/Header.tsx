import React from 'react';
import { HeartPulse, Terminal, BookOpen, Database } from 'lucide-react';
import { PatientData } from '../../types/patient';

interface HeaderProps {
  currentPatient: PatientData;
  onSelectPreset: (presetId: string) => void;
  onOpenPythonApiModal: () => void;
  onOpenDocModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPatient,
  onSelectPreset,
  onOpenPythonApiModal,
  onOpenDocModal,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-cyan-500 to-rose-500 p-0.5 shadow-lg shadow-cyan-950/50 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <HeartPulse className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-slate-100 tracking-tight">
                CardioVision AI
              </h1>
              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded font-semibold whitespace-nowrap">
                Technical Checks Passed
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
              <span>Z-Alizadeh Sani Cohort (UCI 411)</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>Multi-Vessel CAD Decision Support</span>
            </div>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {/* Patient Quick Selector */}
          <div className="hidden md:flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
            <span className="text-amber-400 font-mono text-[10px] bg-amber-950/70 border border-amber-800/80 px-1.5 py-0.5 rounded font-semibold">Demo Input</span>
            <span className="text-slate-400 font-medium">Record:</span>
            <span className="text-slate-200 font-mono font-semibold">
              {currentPatient.recordNumber || currentPatient.id}
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">
              {currentPatient.age}y {currentPatient.sex === 'male' ? 'M' : 'F'}
            </span>
          </div>

          {/* Model & Dataset Documentation button */}
          <button
            onClick={onOpenDocModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/80 hover:border-cyan-400 text-cyan-300 text-xs font-semibold transition-all shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>ML Pipeline Docs</span>
          </button>

          {/* Python API Connector button */}
          <button
            onClick={onOpenPythonApiModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500 text-slate-200 hover:text-cyan-300 text-xs font-medium transition-all shadow-sm"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>Python ML Connector</span>
          </button>
        </div>
      </div>
    </header>
  );
};
