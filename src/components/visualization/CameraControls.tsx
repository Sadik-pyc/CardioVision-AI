import React from 'react';
import { 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2, 
  Play, 
  Pause, 
  Compass, 
  Eye
} from 'lucide-react';

export type AnatomicalView = 'anterior' | 'lateral_left' | 'posterior' | 'superior';

interface CameraControlsProps {
  onResetCamera: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onSetView: (view: AnatomicalView) => void;
  activeView?: AnatomicalView;
  isAutoRotating: boolean;
  onToggleAutoRotate: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  className?: string;
}

export const CameraControls: React.FC<CameraControlsProps> = ({
  onResetCamera,
  onZoomIn,
  onZoomOut,
  onSetView,
  activeView = 'anterior',
  isAutoRotating,
  onToggleAutoRotate,
  isFullscreen,
  onToggleFullscreen,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-xl shadow-lg text-xs ${className}`}
      role="toolbar"
      aria-label="3D Heart Camera Controls"
    >
      {/* Anatomical Perspective Preset Buttons */}
      <div className="flex items-center gap-1 bg-slate-900 border border-slate-800/80 p-0.5 rounded-lg">
        <button
          onClick={() => onSetView('anterior')}
          className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
            activeView === 'anterior'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Anterior (Frontal AP view, focuses on LAD)"
          aria-label="Set Anterior Camera View"
        >
          Anterior (LAD)
        </button>
        <button
          onClick={() => onSetView('lateral_left')}
          className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
            activeView === 'lateral_left'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Left Lateral (LAO view, focuses on LCX)"
          aria-label="Set Left Lateral Camera View"
        >
          Lateral (LCX)
        </button>
        <button
          onClick={() => onSetView('posterior')}
          className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
            activeView === 'posterior'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Posterior / Right (RAO view, focuses on RCA / Crux)"
          aria-label="Set Posterior Camera View"
        >
          Posterior (RCA)
        </button>
      </div>

      <div className="w-px h-5 bg-slate-800 mx-0.5" aria-hidden="true" />

      {/* Zoom In & Out */}
      <div className="flex items-center gap-1">
        <button
          onClick={onZoomIn}
          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-300 transition-colors"
          title="Zoom In"
          aria-label="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onZoomOut}
          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-300 transition-colors"
          title="Zoom Out"
          aria-label="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Auto-Rotation Toggle */}
      <button
        onClick={onToggleAutoRotate}
        className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
          isAutoRotating
            ? 'bg-cyan-950 border-cyan-700 text-cyan-300'
            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
        }`}
        title={isAutoRotating ? 'Pause Auto-Rotation' : 'Start Auto-Rotation'}
        aria-label={isAutoRotating ? 'Pause Auto-Rotation' : 'Start Auto-Rotation'}
      >
        {isAutoRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        <span className="hidden sm:inline text-[10px]">Rotate</span>
      </button>

      {/* Reset Camera */}
      <button
        onClick={onResetCamera}
        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1"
        title="Reset Camera Orientation & Zoom"
        aria-label="Reset Camera Position"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span className="hidden sm:inline text-[10px]">Reset</span>
      </button>

      {/* Fullscreen Toggle */}
      <button
        onClick={onToggleFullscreen}
        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
        title={isFullscreen ? 'Exit Fullscreen' : 'Expand to Fullscreen'}
        aria-label={isFullscreen ? 'Exit Fullscreen' : 'Expand to Fullscreen'}
      >
        {isFullscreen ? (
          <Minimize2 className="w-3.5 h-3.5 text-cyan-400" />
        ) : (
          <Maximize2 className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );
};
