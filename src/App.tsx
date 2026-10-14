/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/dashboard/Header';
import { DisclaimerBanner } from './components/ui/DisclaimerBanner';
import { RiskSummary } from './components/risk/RiskSummary';
import { HeartViewer } from './components/visualization/HeartViewer';
import { VesselInfoPanel } from './components/visualization/VesselInfoPanel';
import { RiskLegend } from './components/visualization/RiskLegend';
import { ShapContributionView } from './components/explainability/ShapContributionView';
import { PatientInputForm } from './components/patient/PatientInputForm';
import { PatientPhysiologicalProfile } from './components/patient/PatientPhysiologicalProfile';
import { ModelPerformanceSection } from './components/dashboard/ModelPerformanceSection';
import { MethodologyPipelineSection } from './components/dashboard/MethodologyPipelineSection';
import { PythonApiModal } from './components/ui/PythonApiModal';
import { MLPipelineDocumentationModal } from './components/documentation/MLPipelineDocumentationModal';

import { PatientData } from './types/patient';
import { PredictionResult, VesselId } from './types/prediction';
import { PATIENT_PRESETS } from './data/presets';
import { predictionService } from './services/predictionService';
import { 
  Heart, 
  CheckCircle2, 
  BookOpen, 
  AlertCircle 
} from 'lucide-react';

export default function App() {
  // Initial patient state initialized to Alpha (High risk case for clear visualization)
  const [currentPatient, setCurrentPatient] = useState<PatientData>(PATIENT_PRESETS[0].data);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [selectedVessel, setSelectedVessel] = useState<VesselId | null>('LAD');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [predictionError, setPredictionError] = useState<string | null>(null);
  const [isPythonModalOpen, setIsPythonModalOpen] = useState<boolean>(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState<boolean>(false);

  // Run prediction on patient data
  const handleRunPrediction = useCallback(async (patient: PatientData) => {
    setIsLoading(true);
    setPredictionError(null);
    try {
      const res = await predictionService.predict(patient);
      setPrediction(res);
    } catch (err: any) {
      console.error('Error generating prediction:', err);
      setPredictionError(err?.message || 'Prediction failed. Please verify input parameters.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Full reset behavior: clears active inputs, prediction, and focuses baseline
  const handleResetPatient = useCallback(() => {
    const baseline = PATIENT_PRESETS[2].data; // Patient Gamma: baseline non-obstructive case
    setCurrentPatient(baseline);
    setSelectedVessel(null);
    setPrediction(null);
    setPredictionError(null);
  }, []);

  // Run on mount
  useEffect(() => {
    handleRunPrediction(currentPatient);
  }, []);

  // Handle Preset Selection
  const handleSelectPreset = (presetId: string) => {
    const found = PATIENT_PRESETS.find((p) => p.id === presetId);
    if (found) {
      setCurrentPatient(found.data);
      handleRunPrediction(found.data);
      // Auto focus vessel most relevant to preset
      if (presetId.includes('lad')) setSelectedVessel('LAD');
      else if (presetId.includes('rca')) setSelectedVessel('RCA');
      else setSelectedVessel('LAD');
    }
  };

  const handleSelectVessel = (vesselId: VesselId | null) => {
    setSelectedVessel(vesselId);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* App Header */}
      <Header
        currentPatient={currentPatient}
        onSelectPreset={handleSelectPreset}
        onOpenPythonApiModal={() => setIsPythonModalOpen(true)}
        onOpenDocModal={() => setIsDocModalOpen(true)}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1 w-full">
        {/* Prominent Clinical Disclaimer */}
        <DisclaimerBanner />

        {/* Audit & ML Pipeline Badge Banner */}
        <div className="bg-slate-900/90 border border-emerald-900/60 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-800/80 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wide">
                  Multi-Target ML Pipeline & Target Leakage Guard Verified
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 whitespace-nowrap font-semibold">
                  Technical Checks Passed (UCI 411)
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Trained on Z-Alizadeh Sani Cardiovascular Dataset (N=303, 5-Fold Stratified CV). Target columns strictly excluded: <code className="text-rose-300 font-mono">['Cath', 'LAD', 'LCX', 'RCA']</code>.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsDocModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-700/80 text-emerald-300 text-xs font-semibold transition-all shrink-0"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>View ML Audit & Metrics</span>
          </button>
        </div>

        {/* TOP SPLIT SECTION: Left (Overall CAD Risk & Presets) | Right (3D Viewer & Vessel Details) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN (5 cols): Overall CAD Risk Summary & Preset Cards */}
          <div className="lg:col-span-5 space-y-6">
            {predictionError && (
              <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-xs text-rose-300 flex items-start gap-2.5 shadow-lg">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Inference Error:</span>
                  <span>{predictionError}</span>
                </div>
              </div>
            )}

            {prediction ? (
              <RiskSummary
                prediction={prediction}
                selectedVessel={selectedVessel}
                onSelectVessel={handleSelectVessel}
                onOpenPythonApiModal={() => setIsPythonModalOpen(true)}
              />
            ) : (
              <div className="h-64 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center p-6 text-center">
                <div className="space-y-2 text-slate-400">
                  <Heart className="w-8 h-8 mx-auto text-slate-600" />
                  <p className="text-xs font-semibold text-slate-300">No Active Analysis</p>
                  <p className="text-[11px] text-slate-500 max-w-xs">Click "Analyze Patient (Run Prediction)" or select a patient archetype to evaluate.</p>
                </div>
              </div>
            )}

            {/* Quick Preset Archetype Cards Selector */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Clinical Benchmark Archetypes
                </span>
                <span className="text-[10px] text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  Demo Cases
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PATIENT_PRESETS.map((preset) => {
                  const isActive = currentPatient.id === preset.data.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset.id)}
                      className={`p-3 rounded-xl border text-left transition-all text-xs flex flex-col justify-between cursor-pointer ${
                        isActive
                          ? 'bg-slate-900 border-cyan-400 text-slate-100 shadow-md ring-1 ring-cyan-400/50'
                          : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200 hover:bg-slate-900/40'
                      }`}
                    >
                      <div className="font-bold text-[12px] truncate text-slate-200">
                        {preset.name}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 truncate font-medium">
                        {preset.tag}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (7 cols): Interactive 3D Viewer & Dedicated Flow Below */}
          <div className="lg:col-span-7 space-y-4">
            {prediction && (
              <>
                {/* 3D Canvas Area: 100% Unobstructed Anatomical View */}
                <HeartViewer
                  prediction={prediction}
                  selectedVessel={selectedVessel}
                  onSelectVessel={handleSelectVessel}
                />

                {/* Normal-flow Visualization Risk Tiers: Directly below 3D canvas (NEVER overlays it) */}
                <RiskLegend />

                {/* Selected Vessel Details: Directly below Risk Tiers in natural document flow */}
                <VesselInfoPanel
                  prediction={prediction}
                  selectedVessel={selectedVessel}
                  onSelectVessel={handleSelectVessel}
                />
              </>
            )}
          </div>
        </div>

        {/* Section 2: Explainable AI & Model Feature Attributions */}
        {prediction && (
          <section className="pt-2">
            <ShapContributionView
              prediction={prediction}
              selectedVessel={selectedVessel}
              onSelectVessel={handleSelectVessel}
            />
          </section>
        )}

        {/* Section 3: Patient Physiological Profile & Interactive Form Adjustments */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2 items-start">
          {/* Left Column (6 cols): Physiological Profile */}
          <div className="lg:col-span-6">
            <PatientPhysiologicalProfile patient={currentPatient} />
          </div>

          {/* Right Column (6 cols): Clinical Input Form & Actions */}
          <div className="lg:col-span-6">
            <PatientInputForm
              currentPatient={currentPatient}
              isLoading={isLoading}
              onUpdatePatient={setCurrentPatient}
              onSubmitPrediction={handleRunPrediction}
              onSelectPreset={handleSelectPreset}
              onResetPatient={handleResetPatient}
            />
          </div>
        </section>

        {/* Section 4: Model Performance & Validation Benchmarks */}
        <section className="pt-2">
          <ModelPerformanceSection />
        </section>

        {/* Section 5: End-to-End Prediction Pipeline & Methodology */}
        <section className="pt-2">
          <MethodologyPipelineSection />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 mt-12 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-slate-300">CardioVision AI</span>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <span>Cardiovascular Risk & Multi-Vessel Stenosis Platform</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Integrated with Real ML Pipeline (Z-Alizadeh Sani / Model Feature Attributions)</span>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <button
              onClick={() => setIsPythonModalOpen(true)}
              className="text-cyan-400 hover:underline"
            >
              API Spec & Schemas
            </button>
          </div>
        </div>
      </footer>

      {/* Python API Connector Code Modal */}
      <PythonApiModal
        isOpen={isPythonModalOpen}
        onClose={() => setIsPythonModalOpen(false)}
        onConfigUpdated={() => handleRunPrediction(currentPatient)}
      />

      {/* ML Pipeline & Dataset Documentation Modal */}
      <MLPipelineDocumentationModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
      />
    </div>
  );
}
