import type { AiensieScores, TradeMetrics, DetectedPattern, TraderPersona } from "./types.js";

export function classifyPersona(
  scores: AiensieScores,
  metrics: TradeMetrics,
  patterns: DetectedPattern[],
  overall: number,
): TraderPersona {
  const { disciplineScore, emotionalStabilityScore, consistencyScore, riskControlScore } = scores;

  const hasRevenge     = patterns.some((p) => p.name === "Revenge Trading Risk");
  const hasOverconf    = patterns.some((p) => p.name === "Overconfidence After Wins");
  const hasOvertrading = patterns.some((p) => p.name === "Overtrading");
  const hasLossHold    = patterns.some((p) => p.name === "Holding Losses Too Long");
  const hasSizeInst    = patterns.some((p) => p.name === "Erratic Position Sizing");

  const isHighFreq       = metrics.tradesPerActiveDay > 8;
  const isLowFreq        = metrics.tradesPerActiveDay < 3.5;
  const isLongHolder     = metrics.averageHoldingMinutes > 240;
  const isScalper        = metrics.averageHoldingMinutes < 25;
  const hasHighPayoff    = metrics.payoffRatio >= 1.8;
  const isSizeConsistent = metrics.positionSizeVariability < 0.2;
  const isEmotional      = emotionalStabilityScore < 55 && (hasRevenge || hasOverconf);
  const highSevCount     = patterns.filter((p) => p.severity === "high").length;

  // ── Systematic Operator — elite process-driven ────────────────────────────
  if (overall >= 82 && disciplineScore >= 75 && consistencyScore >= 72 && emotionalStabilityScore >= 68 && !hasRevenge) {
    return {
      title: "Systematic Operator",
      summary: "Your execution is process-oriented and emotionally stable across most sessions. The behavioral data reflects habits most retail traders never develop — a consistent framework that runs independent of short-term market noise.",
      tone: "structured · disciplined · institutional",
      archetype: "Process-Driven",
      confidence: 92,
    };
  }

  // ── High-Pressure Scalper — ultra-fast, high frequency ───────────────────
  if (isScalper && isHighFreq) {
    return {
      title: "High-Pressure Scalper",
      summary: "You thrive in rapid-fire execution environments. Your edge — if consistent — lives in tight windows and split-second decisions. The risk is that speed compounds behavioral errors faster than any other trading style.",
      tone: "aggressive · fast · high-stress",
      archetype: "Speed-Driven",
      confidence: 86,
    };
  }

  // ── Reactive Trader — emotionally driven with multiple bad patterns ───────
  if (isEmotional && hasRevenge && (hasOvertrading || hasSizeInst || highSevCount >= 2)) {
    return {
      title: "Reactive Trader",
      summary: "You perform best when selective, but emotional escalation appears during rapid re-entry periods. Market events are driving decisions more often than your plan — the gap between what you know and what you do is the primary challenge.",
      tone: "reactive · impulsive · emotionally-driven",
      archetype: "Emotion-Led",
      confidence: 89,
    };
  }

  // ── Conviction Trader — low frequency, high quality ──────────────────────
  if (isLowFreq && hasHighPayoff && riskControlScore >= 65 && !hasOverconf) {
    return {
      title: "Conviction Trader",
      summary: "You rely on fewer, higher-conviction entries — and when the conditions align, you let them run. Your edge comes from patience and selectivity, not volume. The biggest risk is overriding your own process under pressure.",
      tone: "patient · selective · high-conviction",
      archetype: "Conviction-Based",
      confidence: 87,
    };
  }

  // ── Selective Swing Trader — deliberate, long-hold style ─────────────────
  if (isLowFreq && isLongHolder && !hasRevenge) {
    return {
      title: "Selective Swing Trader",
      summary: "You execute in a longer-timeframe style — entering when conditions align and allowing positions room to develop. Structure and patience define your edge. Emotional interference tends to appear only during extended drawdowns.",
      tone: "deliberate · patient · trend-aware",
      archetype: "Swing-Oriented",
      confidence: 84,
    };
  }

  // ── Discipline-Driven Trader — strong sizing and freq control ─────────────
  if (disciplineScore >= 75 && isSizeConsistent && !hasRevenge && !hasOvertrading) {
    return {
      title: "Discipline-Driven Trader",
      summary: "Consistent sizing, controlled frequency — your standout dimension is behavioral discipline. The execution process is sound. Sharpening decision quality and refining entries is the next frontier from here.",
      tone: "disciplined · structured · rule-following",
      archetype: "Rule-Based",
      confidence: 85,
    };
  }

  // ── Structured Performer — solid overall framework ────────────────────────
  if (overall >= 62 && consistencyScore >= 62 && disciplineScore >= 58 && !isEmotional) {
    return {
      title: "Structured Performer",
      summary: "Your trading reflects a working framework — the habits are forming and performance is becoming more repeatable. The edge is real. Protecting it from behavioral drift is the primary task.",
      tone: "process-aware · developing · structured",
      archetype: "Framework-Building",
      confidence: 79,
    };
  }

  // ── Aggressive Opportunist — high frequency + erratic sizing ─────────────
  if (isHighFreq && hasSizeInst && !isEmotional) {
    return {
      title: "Aggressive Opportunist",
      summary: "You move fast and size dynamically — seeking to capitalize on every perceived edge. This style can produce strong returns in ideal conditions, but it magnifies the cost of behavioral errors significantly.",
      tone: "opportunistic · high-velocity · variable",
      archetype: "Opportunity-Driven",
      confidence: 81,
    };
  }

  // ── Emotional Executor — moderate emotional interference ──────────────────
  if (emotionalStabilityScore < 62 && (hasRevenge || hasOverconf || hasLossHold)) {
    return {
      title: "Emotional Executor",
      summary: "Recent trading activity suggests emotionally reactive execution patterns. The strategy may have a genuine edge, but behavioral interference is reducing its effectiveness — especially after losses and during winning streaks.",
      tone: "emotionally-influenced · variable · pressure-sensitive",
      archetype: "Emotion-Influenced",
      confidence: 83,
    };
  }

  // ── Momentum Chaser — driven by streak behavior ───────────────────────────
  if (hasOverconf && metrics.winRate >= 0.48 && isHighFreq) {
    return {
      title: "Momentum Chaser",
      summary: "You rely heavily on momentum confidence after winning streaks — pressing advantage when the market is flowing your way. The challenge is that winning streaks don't change underlying probabilities, and the unwind is typically costly.",
      tone: "momentum-driven · streaky · confidence-sensitive",
      archetype: "Streak-Driven",
      confidence: 78,
    };
  }

  // ── Fallbacks based on overall ────────────────────────────────────────────
  if (overall >= 72) {
    return {
      title: "Systematic Trader",
      summary: "Your approach is structured and largely repeatable — you follow a process rather than reacting to market noise. That consistency is the real edge. Refinement, not reinvention, is the path forward.",
      tone: "structured · consistent · process-aware",
      archetype: "Process-Oriented",
      confidence: 74,
    };
  }

  if (overall >= 55) {
    return {
      title: "Developing Trader",
      summary: "The foundation is being built. The instincts are there — some behavioral habits are quietly working against you. Each assessment makes the picture clearer and the adjustments more targeted.",
      tone: "analytical · improving · self-aware",
      archetype: "In-Development",
      confidence: 70,
    };
  }

  return {
    title: "Developing Trader",
    summary: "The foundation is being built. Every trade you analyze is a step closer to a repeatable, reliable edge. The data gives you a clear picture of what to build on and what to address next.",
    tone: "in-development · learning · process-building",
    archetype: "Early-Stage",
    confidence: 66,
  };
}
