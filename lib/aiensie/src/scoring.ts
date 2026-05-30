import type { TradeMetrics, DetectedPattern, AiensieScores } from "./types.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Map `value` to a 0–100 score.
 *
 * Convention:
 *   higherIsBetter=true  → lo maps to 0, hi maps to 100
 *   higherIsBetter=false → lo maps to 100 (best case), hi maps to 0 (worst case)
 *
 * Always pass lo=best_value, hi=worst_value when higherIsBetter=false.
 */
function linearScore(value: number, lo: number, hi: number, higherIsBetter = true): number {
  const raw = (value - lo) / (hi - lo);
  const normalized = higherIsBetter ? raw : 1 - raw;
  return clamp(normalized * 100);
}

// Penalty per detected pattern scaled by severity.
function patternPenalty(patterns: DetectedPattern[], name: string): number {
  const p = patterns.find((d) => d.name === name);
  if (!p) return 0;
  const map: Record<string, number> = { low: 5, medium: 12, high: 20 };
  return map[p.severity] ?? 0;
}

// ── Dimension scores ──────────────────────────────────────────────────────────

function disciplineScore(m: TradeMetrics, patterns: DetectedPattern[]): number {
  // Lower CV = better position discipline; lo=0.08 (tight), hi=1.2 (chaotic)
  const sizeStability = linearScore(m.positionSizeVariability, 0.08, 1.2, false);

  // Fewer trades per active day = better; lo=2 (focused), hi=12 (overtrading)
  const freqControl = linearScore(m.tradesPerActiveDay, 2, 12, false);

  // Fewer max consecutive losses = better; lo=1 (resilient), hi=8 (streak-prone)
  const streakControl = linearScore(m.maxConsecutiveLosses, 1, 8, false);

  const raw = sizeStability * 0.35 + freqControl * 0.30 + streakControl * 0.35;

  const penalty =
    patternPenalty(patterns, "Overtrading") +
    patternPenalty(patterns, "Position Size Instability");

  return clamp(raw - penalty);
}

function riskControlScore(m: TradeMetrics, patterns: DetectedPattern[]): number {
  // Higher payoff ratio = better; 0.5 (bad) → 2.5 (excellent)
  const payoff = linearScore(Math.min(m.payoffRatio, 4), 0.5, 2.5);

  // Higher profit factor = better
  const pfScore = linearScore(Math.min(m.profitFactor, 4), 0.5, 2.5);

  // Lower top-symbol concentration = better; lo=0.20 (diversified), hi=0.80 (concentrated)
  const exposure = linearScore(m.topSymbolExposure, 0.20, 0.80, false);

  const raw = payoff * 0.35 + pfScore * 0.40 + exposure * 0.25;

  const penalty =
    patternPenalty(patterns, "Loss Holding Bias") +
    patternPenalty(patterns, "Position Size Instability") * 0.5;

  return clamp(raw - penalty);
}

function consistencyScore(m: TradeMetrics, patterns: DetectedPattern[]): number {
  // Win rate: 40–60% is ideal, penalise extremes
  const idealWinRate = 1 - Math.abs(m.winRate - 0.50) / 0.50;
  const winRateScore = clamp(idealWinRate * 100);

  // Lower CV = better; lo=0.08, hi=1.2
  const sizeConsistency = linearScore(m.positionSizeVariability, 0.08, 1.2, false);

  // Lower profit dependency on top trades = better; lo=0.25, hi=0.90
  const dependency = linearScore(m.profitDependencyTop10Percent, 0.25, 0.90, false);

  const raw = winRateScore * 0.30 + sizeConsistency * 0.40 + dependency * 0.30;

  const penalty = patternPenalty(patterns, "Profit Dependency");

  return clamp(raw - penalty);
}

function emotionalStabilityScore(m: TradeMetrics, patterns: DetectedPattern[]): number {
  // Baseline of 76 represents a disciplined but human trader with no detected patterns.
  // This aligns the expected range of emotionalStability with other linear-mapped dimensions.
  const base = 76;

  const penalty =
    patternPenalty(patterns, "Revenge Trading Risk")      * 1.5 +
    patternPenalty(patterns, "Overconfidence After Wins") * 1.2 +
    patternPenalty(patterns, "Loss Holding Bias")         * 0.8;

  // Consecutive losses as additional pressure signal
  const streakDeduction = clamp((m.maxConsecutiveLosses - 2) * 3, 0, 22);

  return clamp(base - penalty - streakDeduction);
}

function decisionQualityScore(m: TradeMetrics): number {
  // Normalise expectancy to [-1, 1] based on average trade magnitude
  const magnitude = Math.max(Math.abs(m.averageWin), Math.abs(m.averageLoss), 1);
  const expectancyScore = clamp(((m.expectancy / magnitude) * 0.5 + 0.5) * 100);

  const payoff  = linearScore(Math.min(m.payoffRatio, 4), 0.5, 2.5);
  const pfScore = linearScore(Math.min(m.profitFactor, 4), 0.5, 2.5);

  return clamp(expectancyScore * 0.40 + payoff * 0.30 + pfScore * 0.30);
}

// ── Public entry point ────────────────────────────────────────────────────────

export function computeScores(
  metrics: TradeMetrics,
  patterns: DetectedPattern[],
): AiensieScores {
  return {
    disciplineScore:         clamp(Math.round(disciplineScore(metrics, patterns))),
    riskControlScore:        clamp(Math.round(riskControlScore(metrics, patterns))),
    consistencyScore:        clamp(Math.round(consistencyScore(metrics, patterns))),
    emotionalStabilityScore: clamp(Math.round(emotionalStabilityScore(metrics, patterns))),
    decisionQualityScore:    clamp(Math.round(decisionQualityScore(metrics))),
  };
}

export function computeAiensieScore(scores: AiensieScores): number {
  const weighted =
    scores.disciplineScore         * 0.25 +
    scores.riskControlScore        * 0.25 +
    scores.consistencyScore        * 0.20 +
    scores.emotionalStabilityScore * 0.15 +
    scores.decisionQualityScore    * 0.15;

  return Math.round(clamp(weighted));
}
