import type {
  AiensieScores,
  TradeMetrics,
  DetectedPattern,
  TraderArchetypeDNA,
  ArchetypeSignal,
} from "./types.js";

// ── Signal generators ─────────────────────────────────────────────────────────

function frequencySignal(metrics: TradeMetrics): ArchetypeSignal | null {
  const { tradesPerActiveDay, averageHoldingMinutes } = metrics;

  if (tradesPerActiveDay < 3 && averageHoldingMinutes > 180) {
    return {
      text: "You perform best in low-frequency, high-conviction environments. Your edge deteriorates when execution frequency increases beyond your natural pace.",
      confidence: 88,
    };
  }
  if (tradesPerActiveDay > 8 && averageHoldingMinutes < 30) {
    return {
      text: "Your trading style is speed-dependent. Short holding times and high frequency suggest your edge lives in momentum and rapid pattern recognition.",
      confidence: 84,
    };
  }
  if (tradesPerActiveDay > 6) {
    return {
      text: "Your execution frequency runs high. The data suggests that selectivity — rather than volume — would compound your edge more effectively.",
      confidence: 79,
    };
  }
  return null;
}

function riskSignal(scores: AiensieScores, metrics: TradeMetrics): ArchetypeSignal | null {
  const { riskControlScore } = scores;
  const { payoffRatio, topSymbolExposure } = metrics;

  if (riskControlScore >= 75 && payoffRatio >= 1.8) {
    return {
      text: "Your risk-reward architecture is a genuine edge. Winning trades significantly outpace losers — this asymmetry compounds over time in ways most traders never achieve.",
      confidence: 90,
    };
  }
  if (topSymbolExposure > 0.6) {
    return {
      text: "Your trading is heavily concentrated in a small number of assets. This creates dependency on specific market conditions — diversifying your focus would reduce behavioral fragility.",
      confidence: 82,
    };
  }
  if (riskControlScore < 50) {
    return {
      text: "Risk management is the primary structural weakness. Until winners consistently outpace losers, profitability depends on win rate holding up — a fragile foundation.",
      confidence: 85,
    };
  }
  return null;
}

function emotionalSignal(
  scores: AiensieScores,
  patterns: DetectedPattern[],
): ArchetypeSignal | null {
  const { emotionalStabilityScore } = scores;
  const hasRevenge  = patterns.some((p) => p.name === "Revenge Trading Risk");
  const hasOverconf = patterns.some((p) => p.name === "Overconfidence After Wins");

  if (emotionalStabilityScore >= 75 && !hasRevenge && !hasOverconf) {
    return {
      text: "Emotional composure is a genuine strength. The absence of revenge trading and overconfidence patterns reflects psychological discipline that most traders work years to develop.",
      confidence: 87,
    };
  }
  if (hasRevenge && hasOverconf) {
    return {
      text: "Your strongest decisions occur during neutral emotional states. Both losses and winning streaks distort your execution — building protocols around both conditions is the highest-leverage improvement available.",
      confidence: 91,
    };
  }
  if (hasRevenge) {
    return {
      text: "Your edge deteriorates most sharply immediately after losses. The data shows a consistent pattern of emotionally-driven re-entry that undermines otherwise sound execution.",
      confidence: 88,
    };
  }
  if (hasOverconf) {
    return {
      text: "You rely heavily on momentum confidence after winning streaks. Scaling up after wins feels rational, but the data suggests it's costing more than it gains.",
      confidence: 83,
    };
  }
  return null;
}

function consistencySignal(
  scores: AiensieScores,
  metrics: TradeMetrics,
): ArchetypeSignal | null {
  const { consistencyScore } = scores;
  const { positionSizeVariability, profitDependencyTop10Percent } = metrics;

  if (consistencyScore >= 75 && positionSizeVariability < 0.2) {
    return {
      text: "Your execution process is becoming increasingly repeatable and structured. Consistent sizing and stable win rates suggest a genuine system — not just a run of good trades.",
      confidence: 86,
    };
  }
  if (profitDependencyTop10Percent > 0.65) {
    return {
      text: "Your P&L curve is shaped by a small number of outlier trades. Remove the top 10% of wins, and the picture changes dramatically — the edge may be less repeatable than it appears.",
      confidence: 84,
    };
  }
  if (positionSizeVariability > 0.5) {
    return {
      text: "Sizing inconsistency means your results depend more on which trades happened to be sized up than on your actual decision quality. A fixed risk-per-trade rule would immediately improve result predictability.",
      confidence: 87,
    };
  }
  return null;
}

function streakSignal(metrics: TradeMetrics, patterns: DetectedPattern[]): ArchetypeSignal | null {
  const { maxConsecutiveLosses } = metrics;
  const hasLossHold = patterns.some((p) => p.name === "Holding Losses Too Long");

  if (maxConsecutiveLosses >= 6 && hasLossHold) {
    return {
      text: "Drawdown management is a structural vulnerability. Long losing streaks combined with an unwillingness to cut losses creates compounding psychological pressure that degrades all subsequent decisions.",
      confidence: 89,
    };
  }
  if (maxConsecutiveLosses >= 4) {
    return {
      text: "Extended losing streaks appear in the record with meaningful frequency. Building a hard daily stop rule — and sticking to it — would protect both capital and decision quality during difficult periods.",
      confidence: 81,
    };
  }
  return null;
}

function holdingSignal(metrics: TradeMetrics, patterns: DetectedPattern[]): ArchetypeSignal | null {
  const hasLossHold = patterns.some((p) => p.name === "Holding Losses Too Long");
  const { averageHoldingMinutes } = metrics;

  if (hasLossHold) {
    return {
      text: "You cut winners faster than you cut losers — the opposite of what asymmetric risk management requires. This single habit is directly compressing the win-to-loss size ratio.",
      confidence: 90,
    };
  }
  if (averageHoldingMinutes > 360) {
    return {
      text: "Your strongest decisions occur during structured, longer-duration conditions. You're built for conviction-based positioning, not quick-fire execution.",
      confidence: 77,
    };
  }
  return null;
}

// ── Primary/secondary archetype label ────────────────────────────────────────

function resolveArchetypes(
  scores: AiensieScores,
  metrics: TradeMetrics,
  patterns: DetectedPattern[],
  overall: number,
): { primary: string; secondary?: string; edgeProfile: string } {
  const { disciplineScore, emotionalStabilityScore, consistencyScore, riskControlScore } = scores;
  const hasRevenge  = patterns.some((p) => p.name === "Revenge Trading Risk");
  const hasOverconf = patterns.some((p) => p.name === "Overconfidence After Wins");

  const isLowFreq    = metrics.tradesPerActiveDay < 3.5;
  const isHighFreq   = metrics.tradesPerActiveDay > 8;
  const isLongHolder = metrics.averageHoldingMinutes > 240;

  let primary   = "Developing";
  let secondary: string | undefined;
  let edgeProfile = "Edge profile in formation. Consistent process is the primary lever.";

  if (overall >= 80 && disciplineScore >= 75 && !hasRevenge) {
    primary     = "Institutional";
    secondary   = "Process-Driven";
    edgeProfile = "Institutional-grade process with repeatable behavioral habits.";
  } else if (isLowFreq && metrics.payoffRatio >= 1.8) {
    primary     = "Conviction";
    secondary   = emotionalStabilityScore >= 65 ? "Disciplined" : "Volatile";
    edgeProfile = "Edge is built on selectivity and high-conviction positioning.";
  } else if (isLowFreq && isLongHolder) {
    primary     = "Swing";
    secondary   = riskControlScore >= 65 ? "Structured" : "Unstructured";
    edgeProfile = "Edge emerges in longer-duration, structured trend conditions.";
  } else if (isHighFreq && metrics.averageHoldingMinutes < 30) {
    primary     = "Scalper";
    secondary   = consistencyScore >= 60 ? "Systematic" : "Reactive";
    edgeProfile = "Edge depends on execution speed and rapid pattern recognition.";
  } else if (hasRevenge && hasOverconf) {
    primary     = "Reactive";
    secondary   = "Emotion-Led";
    edgeProfile = "Behavioral interference is the primary drag on an otherwise functional strategy.";
  } else if (emotionalStabilityScore >= 70 && disciplineScore >= 65) {
    primary     = "Systematic";
    secondary   = "Disciplined";
    edgeProfile = "Edge is process-based — consistent sizing and controlled frequency.";
  } else if (overall >= 60) {
    primary     = "Structured";
    secondary   = "Developing";
    edgeProfile = "Edge is present but not yet fully realized. Process consistency is the growth lever.";
  }

  return { primary, secondary, edgeProfile };
}

// ── Main export ───────────────────────────────────────────────────────────────

export function buildArchetypeDNA(
  scores: AiensieScores,
  metrics: TradeMetrics,
  patterns: DetectedPattern[],
  overall: number,
): TraderArchetypeDNA {
  const candidates: Array<ArchetypeSignal | null> = [
    frequencySignal(metrics),
    riskSignal(scores, metrics),
    emotionalSignal(scores, patterns),
    consistencySignal(scores, metrics),
    streakSignal(metrics, patterns),
    holdingSignal(metrics, patterns),
  ];

  // Take top 4 non-null signals, sorted by confidence descending
  const signals = candidates
    .filter((s): s is ArchetypeSignal => s !== null)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 4);

  // Fallback if not enough signals
  if (signals.length < 2) {
    signals.push({
      text: "Your trading profile is still developing enough history for deep pattern recognition. Continue uploading assessments to unlock richer behavioral intelligence.",
      confidence: 60,
    });
  }

  const { primary, secondary, edgeProfile } = resolveArchetypes(scores, metrics, patterns, overall);

  return {
    signals,
    primaryArchetype: primary,
    secondaryArchetype: secondary,
    edgeProfile,
  };
}
