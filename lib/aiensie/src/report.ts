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
  if (overall >= 85) return "You trade with the precision and discipline of an institutional operator.";
  if (overall >= 70) return "Solid foundations and a real edge — a few targeted improvements could take you to the next level.";
  if (overall >= 55) return "You have identifiable strengths, but some behavioral habits are holding back your potential.";
  if (overall >= 40) return "You react more than you plan — your emotions are influencing your trades more than your strategy.";
  return `You're in early-stage development. The habits you build now will define your trajectory as a trader.`;
}

// ── Strengths & weaknesses ────────────────────────────────────────────────────

function buildStrengths(scores: AiensieScores, metrics: TradeMetrics): string[] {
  const out: string[] = [];

  if (scores.disciplineScore >= 70)
    out.push(`You show good control over how often you trade — you don't overtrade or chase the market.`);
  if (scores.riskControlScore >= 70)
    out.push(`Your winning trades are meaningfully larger than your losing ones — a key sign of sound risk management.`);
  if (scores.consistencyScore >= 70)
    out.push(`You apply your approach consistently — your results don't rely on random sizing or lucky timing.`);
  if (scores.emotionalStabilityScore >= 70)
    out.push(`You stay calm after losses and don't let emotions push you into impulsive trades.`);
  if (scores.decisionQualityScore >= 70)
    out.push(`Your entries and exits generate a positive return on average — you have a genuine edge.`);
  if (metrics.profitFactor >= 1.5)
    out.push(`Your overall profits outpace your losses — the strategy is working on a fundamental level.`);
  if (metrics.winRate >= 0.5)
    out.push(`More than half your trades are profitable — you're directionally correct more often than not.`);

  if (out.length === 0) out.push("You have enough trade history to start building a clear picture of your habits.");
  return out.slice(0, 4);
}

function buildWeaknesses(scores: AiensieScores, patterns: DetectedPattern[], metrics: TradeMetrics): string[] {
  const out: string[] = [];

  if (scores.disciplineScore < 60)
    out.push(`Your trade frequency and position sizing are inconsistent — you're not following a clear plan each time.`);
  if (scores.riskControlScore < 60)
    out.push(`Your losing trades are too large relative to your winners — the risk-reward balance needs work.`);
  if (scores.emotionalStabilityScore < 60)
    out.push(`Emotional patterns in your data are affecting your judgment — especially after losses.`);
  if (metrics.profitDependencyTop10Percent > 0.55)
    out.push(`${(metrics.profitDependencyTop10Percent * 100).toFixed(0)}% of your profits come from just a handful of trades — remove those and results look very different.`);
  if (metrics.maxConsecutiveLosses >= 5)
    out.push(`Your longest losing streak was ${metrics.maxConsecutiveLosses} trades in a row — that level of drawdown creates serious psychological pressure.`);

  for (const p of patterns.filter((p) => p.severity === "high"))
    out.push(`You have a strong behavioral pattern that needs attention: ${p.name}.`);

  if (out.length === 0) out.push("No critical issues found — focus on staying consistent and protecting what's working.");
  return out.slice(0, 4);
}

// ── Action plan ───────────────────────────────────────────────────────────────

function buildActionPlan(
  scores: AiensieScores,
  patterns: DetectedPattern[],
  metrics: TradeMetrics,
): string[] {
  const actions: string[] = [];

  const hasRevenge  = patterns.some((p) => p.name === "Revenge Trading Risk");
  const hasOverconf = patterns.some((p) => p.name === "Overconfidence After Wins");
  const hasSizeInst = patterns.some((p) => p.name === "Erratic Position Sizing");

  if (hasRevenge)
    actions.push("After any losing trade, wait at least 30 minutes before placing the next one. Use that time to review what happened — not to recover the loss.");
  if (hasOverconf)
    actions.push("After 3 or more wins in a row, cap your next trade at your normal size — no bigger. Winning streaks feel good but they don't change the odds.");
  if (hasSizeInst)
    actions.push("Pick a fixed amount to risk on every single trade — whether you feel confident or not. Consistency in sizing makes your results honest and predictable.");
  if (scores.riskControlScore < 65)
    actions.push("Before entering any trade, write down your stop-loss and your target. If you can't define both in advance, don't take the trade.");
  if (metrics.profitDependencyTop10Percent > 0.55)
    actions.push("Look closely at your biggest winning trades — ask yourself honestly whether you could repeat them. If not, they may be luck rather than edge.");
  if (metrics.maxConsecutiveLosses >= 5)
    actions.push("Set a rule: if you lose 3 trades in a single session, stop trading for the day. Protecting your mental state is as important as protecting your capital.");
  if (scores.consistencyScore < 65)
    actions.push("Start keeping a simple trade journal — just write down your reason for entering before you enter. You'll quickly spot whether you're following a plan or reacting in the moment.");

  if (actions.length === 0)
    actions.push("Keep doing what you're doing — but keep tracking it. Performance can drift quietly without regular review. Set aside time each week to look at your last 20 trades.");

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
  const scores  = computeScores(metrics, patterns);
  const overall = computeAiensieScore(scores);
  const label   = scoreLabel(overall);
  const type    = traderType(scores);

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
