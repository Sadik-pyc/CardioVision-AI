import React from 'react';
import { RiskLevel } from '../../types/prediction';

interface StenosisGaugeProps {
  probability: number; // 0.0 - 1.0
  riskLevel: RiskLevel;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export const StenosisGauge: React.FC<StenosisGaugeProps> = ({
  probability,
  riskLevel,
  size = 110,
  strokeWidth = 9,
  label,
}) => {
  const percentage = Math.round(probability * 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Semi-circle or 260 deg arc
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (arcLength * percentage) / 100;

  const getColor = (level: RiskLevel) => {
    switch (level) {
      case 'high':
        return '#f43f5e'; // Rose / Red
      case 'moderate':
        return '#f59e0b'; // Amber
      case 'low':
      default:
        return '#10b981'; // Emerald
    }
  };

  const color = getColor(riskLevel);

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="rotate-[135deg] transform"
      >
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#1e293b"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
        />
        {/* Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>

      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-xl font-bold font-mono text-slate-100 tracking-tight">
          {percentage}%
        </span>
        {label && (
          <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
            {label}
          </span>
        )}
      </div>
    </div>
  );
};
