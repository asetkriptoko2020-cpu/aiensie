import type {
  Trade,
  AiensieReport,
  AiensieScores,
  TradeMetrics,
  DetectedPattern,
  ScoreLabel,
} from "./types.js";
import { computeMetrics } from "./metrics.js";
import { detectPatterns } from "./patterns.js";
import { computeScores, computeAiensieScore } from "./scoring.js";

// ── Label / persona ───────────────────────────────────────────────────────────

function scoreLabel(score: number): ScoreLabel {
  if (score >= 85) return "Elite";
  if (score >= 70) return "Strong";
  if (score >= 55) return "Good";
  if (score >= 40) return "Fair";
  return "Poor";
}

function traderType(scores: AiensieScores): string {
  const { disciplineScore, riskControlScore, emotionalStabilityScore, decisionQualityScore } = scores;

  if (disciplineScore >= 75 && riskControlScore >= 75) return "Systematic Trader";
  if (emotionalStabilityScore < 55)                    return "Emotional Trader";
  if (decisionQualityScore >= 75)                      return "Strategic Trader";
  if (riskControlScore < 55)                           return "Risk-Unaware Trader";
  return "Developing Trader";
}

function persona(overall: number, type: string): string {
  if (overall >= 85) return "The Institutional — operates with machine-like consistency.";
  if (overall >= 70) return "The Disciplined Pro — solid fundamentals with room to optimise.";
  if (overall >= 55) return "The Developing Edge — identifiable strengths, clear growth areas.";
  if (overall >= 40) return "The Reactive Trader — pattern-driven but emotionally vulnerable.";
  return `The Early-Stage ${type} — foundational habits need reinforcement.`;
}

// ── Strengths & weaknesses ────────────────────────────────────────────────────

function buildStrengths(scores: AiensieScores, metrics: TradeMetrics): string[] {
  const out: string[] = [];

  if (scores.disciplineScore >= 70)
    out.push(`Strong trade frequency discipline (${scores.disciplineScore}/100).`);
  if (scores.riskControlScore >= 70)
    out.push(`Effective risk management with payoff ratio of ${metrics.payoffRatio.toFixed(2)}.`);
  if (scores.consistencyScore >= 70)
    out.push(`Consistent position sizing and win-rate stability.`);
  if (scores.emotionalStabilityScore >= 70)
    out.push(`Low emotional reactivity — minimal revenge trading detected.`);
  if (scores.decisionQualityScore >= 70)
    out.push(`Positive expectancy per trade (${metrics.expectancy.toFixed(2)} avg).`);
  if (metrics.profitFactor >= 1.5)
    out.push(`Profit factor of ${metrics.profitFactor.toFixed(2)} indicates an active edge.`);
  if (metrics.winRate >= 0.5)
    out.push(`Win rate of ${(metrics.winRate * 100).toFixed(0)}% — majority of trades profitable.`);

  if (out.length === 0) out.push("Completed sufficient trade history for meaningful analysis.");
  return out.slice(0, 4);
}

function buildWeaknesses(scores: AiensieScores, patterns: DetectedPattern[], metrics: TradeMetrics): string[] {
  const out: string[] = [];

  if (scores.disciplineScore < 60)
    out.push(`Discipline score of ${scores.disciplineScore}/100 — inconsistent execution.`);
  if (scores.riskControlScore < 60)
    out.push(`Risk control needs improvement; payoff ratio at ${metrics.payoffRatio.toFixed(2)}.`);
  if (scores.emotionalStabilityScore < 60)
    out.push(`Emotional trading patterns detected — impacting decision quality.`);
  if (metrics.profitDependencyTop10Percent > 0.55)
    out.push(`${(metrics.profitDependencyTop10Percent * 100).toFixed(0)}% of profits from top 10% of trades — fragile edge.`);
  if (metrics.maxConsecutiveLosses >= 5)
    out.push(`Max consecutive loss streak of ${metrics.maxConsecutiveLosses} — drawdown risk.`);

  for (const p of patterns.filter((p) => p.severity === "high"))
    out.push(`High-severity pattern: ${p.name}.`);

  if (out.length === 0) out.push("No critical weaknesses identified — focus on sustaining current performance.");
  return out.slice(0, 4);
}

// ── Action plan ───────────────────────────────────────────────────────────────

function buildActionPlan(
  scores: AiensieScores,
  patterns: DetectedPattern[],
  metrics: TradeMetrics,
): string[] {
  const actions: string[] = [];

  const hasRevenge = patterns.some((p) => p.name === "Revenge Trading Risk");
  const hasOverconf = patterns.some((p) => p.name === "Overconfidence After Wins");
  const hasSizeInst = patterns.some((p) => p.name === "Position Size Instability");

  if (hasRevenge)
    actions.push("Implement a 30-minute cooling-off rule after any losing trade before re-entering the market.");
  if (hasOverconf)
    actions.push("Cap position size increases to a maximum of 20% above your baseline after winning streaks.");
  if (hasSizeInst)
    actions.push("Define a fixed risk-per-trade framework (e.g. 1–2% of account) and automate position sizing.");
  if (scores.riskControlScore < 65)
    actions.push("Set hard stop-losses before entry and track your actual vs. planned risk-reward on every trade.");
  if (metrics.profitDependencyTop10Percent > 0.55)
    actions.push("Review your top-10% winning trades — identify whether their edge is reproducible or luck-driven.");
  if (metrics.maxConsecutiveLosses >= 5)
    actions.push("Introduce a daily loss limit: pause trading after 3 consecutive losses in a single session.");
  if (scores.consistencyScore < 65)
    actions.push("Journal every trade with pre-defined criteria — consistency in process precedes consistency in results.");

  if (actions.length === 0)
    actions.push("Continue tracking and reviewing performance; consider increasing position sizing incrementally.");

  return actions.slice(0, 5);
}

// ── Main generator ────────────────────────────────────────────────────────────

export function generateReport(trades: Trade[]): AiensieReport {
  const metrics  = computeMetrics(trades);
  const patterns = detectPatterns(
    trades,
    metrics.tradesPerActiveDay,
    metrics.positionSizeVariability,
    metrics.profitDependencyTop10Percent,
  );
  const scores   = computeScores(metrics, patterns);
  const overall  = computeAiensieScore(scores);
  const label    = scoreLabel(overall);
  const type     = traderType(scores);

  return {
    aiensieScore:     overall,
    label,
    traderType:       type,
    persona:          persona(overall, type),
    scores,
    metrics,
    detectedPatterns: patterns,
    strengths:        buildStrengths(scores, metrics),
    weaknesses:       buildWeaknesses(scores, patterns, metrics),
    actionPlan:       buildActionPlan(scores, patterns, metrics),
  };
}
