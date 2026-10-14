/**
 * Risk classification and visual palette utilities.
 * Consistent Phase 3 mapping:
 * - LOW: 0% - 33%
 * - MODERATE: 34% - 66%
 * - HIGH: 67% - 100%
 */

export type RiskCategory = 'low' | 'moderate' | 'high';

export interface RiskThresholdInfo {
  category: RiskCategory;
  label: string;
  rangeLabel: string;
  minProb: number;
  maxProb: number;
  hexColor: number;
  cssColor: string;
  bgCss: string;
  borderCss: string;
  textCss: string;
  badgeCss: string;
  symbol: string;
  description: string;
}

export function getRiskCategory(prob: number): RiskCategory {
  if (prob >= 0.67) return 'high';
  if (prob >= 0.34) return 'moderate';
  return 'low';
}

export const RISK_MAPPING: Record<RiskCategory, RiskThresholdInfo> = {
  low: {
    category: 'low',
    label: 'Low Risk Tier',
    rangeLabel: '0% – 33%',
    minProb: 0.0,
    maxProb: 0.33,
    hexColor: 0x10b981, // Emerald Green
    cssColor: '#10b981',
    bgCss: 'bg-emerald-950/40',
    borderCss: 'border-emerald-800/60',
    textCss: 'text-emerald-400',
    badgeCss: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80',
    symbol: '●',
    description: 'Application visualization tier: 0%–33% predicted probability.',
  },
  moderate: {
    category: 'moderate',
    label: 'Moderate Risk Tier',
    rangeLabel: '34% – 66%',
    minProb: 0.34,
    maxProb: 0.66,
    hexColor: 0xf59e0b, // Amber / Warm Yellow
    cssColor: '#f59e0b',
    bgCss: 'bg-amber-950/40',
    borderCss: 'border-amber-800/60',
    textCss: 'text-amber-400',
    badgeCss: 'bg-amber-950/80 text-amber-300 border-amber-700/80',
    symbol: '▲',
    description: 'Application visualization tier: 34%–66% predicted probability.',
  },
  high: {
    category: 'high',
    label: 'High Risk Tier',
    rangeLabel: '67% – 100%',
    minProb: 0.67,
    maxProb: 1.0,
    hexColor: 0xef4444, // Crimson Red
    cssColor: '#ef4444',
    bgCss: 'bg-rose-950/40',
    borderCss: 'border-rose-800/60',
    textCss: 'text-rose-400',
    badgeCss: 'bg-rose-950/80 text-rose-300 border-rose-700/80',
    symbol: '■',
    description: 'Application visualization tier: 67%–100% predicted probability.',
  },
};

export function getVesselColor(
  prob: number,
  isSelected: boolean,
  isHovered: boolean
): number {
  if (isSelected) return 0x38bdf8; // Vivid Sky Blue for active selected vessel focus
  if (isHovered) return 0xfacc15; // Canary Yellow for raycast hover focus

  const category = getRiskCategory(prob);
  return RISK_MAPPING[category].hexColor;
}
