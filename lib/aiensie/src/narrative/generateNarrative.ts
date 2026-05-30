import type { AiensieReport, AiensieScores, TradeMetrics, DetectedPattern } from "../types.js";

// ── Public result type ────────────────────────────────────────────────────────

export interface NarrativeResult {
  paragraphs: string[];
}

// ── Dimension helpers ─────────────────────────────────────────────────────────

type DimensionKey = "discipline" | "risk" | "emotional" | "consistency" | "decision";

function scoredDimensions(scores: AiensieScores): [DimensionKey, number][] {
  return [
    ["discipline",  scores.disciplineScore],
    ["risk",        scores.riskControlScore],
    ["emotional",   scores.emotionalStabilityScore],
    ["consistency", scores.consistencyScore],
    ["decision",    scores.decisionQualityScore],
  ];
}

function getDominantDimension(scores: AiensieScores): DimensionKey {
  return scoredDimensions(scores).reduce(
    (best, curr) => Math.abs(curr[1] - 60) > Math.abs(best[1] - 60) ? curr : best,
  )[0];
}

function getWeakestDimension(scores: AiensieScores): DimensionKey {
  return scoredDimensions(scores).reduce(
    (min, curr) => curr[1] < min[1] ? curr : min,
  )[0];
}

// ── P1 — Executive behavioral profile ────────────────────────────────────────

function p1Profile(
  score: number,
  scores: AiensieScores,
  traderType: string,
  metrics: TradeMetrics,
): string {
  const { disciplineScore, emotionalStabilityScore, riskControlScore, consistencyScore, decisionQualityScore } = scores;
  const dominant = getDominantDimension(scores);

  // Opening sentence — tier-calibrated
  const opening =
    score >= 85 ? `This assessment reflects a behavioral profile consistent with institutional-grade trading discipline. ` :
    score >= 70 ? `The behavioral data presents a profile of a trader with demonstrable structural competence — a foundation that differentiates deliberate execution from reactive market participation. ` :
    score >= 55 ? `The assessment reveals a trader in active development: identifiable technical foundations coexisting with behavioral friction points that are compressing the true potential of the underlying strategy. ` :
    score >= 40 ? `The behavioral record points to a trader operating with reactive tendencies that are materially constraining performance outcomes relative to what the strategy should theoretically deliver. ` :
    `The data indicates a trading profile where execution psychology is the primary performance constraint — the gap between strategic intent and actual results is being driven by behavioral, not analytical, factors. `;

  // Body — dominant-dimension characterization with embedded metrics
  let body: string;
  if (dominant === "discipline") {
    body = disciplineScore >= 75
      ? `Position discipline is the standout characteristic: ${metrics.tradesPerActiveDay.toFixed(1)} trades per active day with controlled sizing suggests an operator who respects the market's noise floor and does not feel compelled to manufacture activity. `
      : `Trade frequency and position sizing present the primary friction point — ${metrics.tradesPerActiveDay.toFixed(1)} trades per active day indicates a tendency toward over-activity that dilutes selectivity and expands behavioral variance. `;
  } else if (dominant === "risk") {
    body = riskControlScore >= 75
      ? `Risk architecture is well-structured — a payoff ratio of ${metrics.payoffRatio.toFixed(2)} combined with a profit factor of ${metrics.profitFactor.toFixed(2)} signals meaningful asymmetry between winning and losing trade magnitudes. `
      : `Risk asymmetry requires attention — a payoff ratio of ${metrics.payoffRatio.toFixed(2)} indicates that winning trades are not sufficiently outpacing losing ones, which concentrates the P&L burden on win rate alone. `;
  } else if (dominant === "emotional") {
    body = emotionalStabilityScore >= 70
      ? `Emotional regulation appears to be a relative strength — behavioral pattern analysis surfaces limited evidence of reactive execution or emotionally-driven sizing decisions across the sample period. `
      : `Emotional reactivity is the defining characteristic of this profile — the behavioral trace reveals execution decisions that deviate from systematic criteria under pressure, a pattern that tends to widen during drawdown periods. `;
  } else if (dominant === "consistency") {
    body = consistencyScore >= 70
      ? `Process consistency is the distinguishing quality — position sizing variance and win-rate distribution are tightly clustered, a hallmark of systematic execution rather than opportunistic improvisation. `
      : `Inconsistency in process is the primary drag — variance in sizing behavior and erratic win-rate distribution suggest execution has not reached the degree of systematic repeatability that underpins professional-grade performance. `;
  } else {
    body = decisionQualityScore >= 70
      ? `Decision quality metrics are the profile's strongest signal — a positive expectancy of ${metrics.expectancy.toFixed(2)} per trade indicates a genuine probabilistic edge is in operation, not noise. `
      : `Decision quality metrics reveal the central challenge — with expectancy at ${metrics.expectancy.toFixed(2)}, the current execution structure is not reliably extracting value from market opportunities, suggesting the entry and exit framework needs refinement. `;
  }

  // Closing — sample characterization
  const closing =
    score >= 75
      ? `Across ${metrics.totalTrades} trades, the behavioral footprint is that of a trader who has internalized structured execution habits.`
      : score >= 55
      ? `The ${metrics.totalTrades}-trade sample is sufficient to establish a meaningful behavioral baseline — the patterns observed are structural rather than attributable to random variance.`
      : `Over ${metrics.totalTrades} trades, the behavioral record is consistent enough to identify the root constraints that are limiting performance development, and precise enough to prioritize them.`;

  return opening + body + closing;
}

// ── P2 — Psychological dynamics ───────────────────────────────────────────────

function p2Patterns(
  score: number,
  scores: AiensieScores,
  patterns: DetectedPattern[],
  metrics: TradeMetrics,
): string {
  const { emotionalStabilityScore } = scores;

  const hasRevenge   = patterns.find((p) => p.name === "Revenge Trading Risk");
  const hasOverconf  = patterns.find((p) => p.name === "Overconfidence After Wins");
  const hasLossHold  = patterns.find((p) => p.name === "Loss Holding Bias");
  const hasSizeInst  = patterns.find((p) => p.name === "Position Size Instability");
  const hasOvertrade = patterns.find((p) => p.name === "Overtrading");
  const hasProfitDep = patterns.find((p) => p.name === "Profit Dependency");

  const highPatterns = patterns.filter((p) => p.severity === "high");

  // Clean profile
  if (patterns.length === 0) {
    return emotionalStabilityScore >= 68
      ? `Psychological analysis of the execution record reveals no significant behavioral anomalies. The absence of revenge trading markers, overconfidence signals, and loss-holding distortion is a genuine differentiator — most retail trading profiles exhibit at least one of these at measurable levels. This suggests a degree of emotional compartmentalization that is typically associated with traders who have either experienced meaningful drawdowns and adapted, or who approach markets with a systematic rule set that buffers against impulsive decision-making. The principal ongoing risk is complacency — sustained clean profiles require periodic re-examination as market conditions, position size, and performance streaks evolve.`
      : `Behavioral pattern screening returns a relatively clean profile, with no dominant psychological distortions surfacing at statistically significant thresholds. Some low-grade emotional variance is present in the execution record but does not rise to pattern-level severity. The primary psychological risk at this stage is operational drift — without explicit pattern reinforcement, execution discipline can erode gradually in ways that are difficult to detect until they have already embedded.`;
  }

  const sentences: string[] = [];

  if (hasRevenge) {
    sentences.push(
      hasRevenge.severity === "high"
        ? `The most operationally significant finding is a high-severity Revenge Trading pattern — trades entered shortly after losses carry the hallmarks of emotional re-entry: bypassed systematic criteria, compressed decision latency, and elevated sizing. This is among the most value-destructive behavioral patterns in active trading, as it compounds drawdowns precisely at points of maximum emotional fragility.`
        : hasRevenge.severity === "medium"
        ? `A moderate Revenge Trading signal is present — emotional re-entries following losses occur with enough frequency to be structurally behavioral rather than incidental. The evidence suggests that adverse outcomes are influencing subsequent decision architecture, even when the trader may not be consciously aware of it.`
        : `Low-level Revenge Trading markers are detectable — the frequency is not yet disruptive, but the signal indicates that emotional state influences entry timing following adverse outcomes. Left unaddressed, low-severity patterns at this stage tend to escalate under drawdown pressure.`,
    );
  }

  if (hasLossHold) {
    sentences.push(
      hasLossHold.severity === "high"
        ? `Loss Holding Bias is a critical finding — losing positions are held materially longer than winners, a behavioral signature of loss aversion overriding rational exit criteria. This pattern systematically increases the magnitude of losing trades relative to winners, undermining payoff ratio and creating asymmetric downside exposure.`
        : `A Loss Holding Bias is detectable — the asymmetry between average holding time on winners versus losers suggests difficulty accepting the finality of a loss. The behavioral reflex to hold and hope, while emotionally understandable, inverts the asymmetry that profitable trading requires.`,
    );
  }

  if (hasOverconf) {
    sentences.push(
      `Overconfidence following winning streaks manifests in position sizing escalation — a classic variance expansion pattern that concentrates drawdown risk at exactly the moment the trader feels most capable. The behavioral mechanism is well-documented: recent success temporarily overrides the systematic constraints that governed earlier, more disciplined execution.`,
    );
  }

  if (hasOvertrade) {
    sentences.push(
      hasOvertrade.severity === "high"
        ? `High-frequency execution at ${metrics.tradesPerActiveDay.toFixed(1)} trades per active day is a structural concern — at this volume, statistical edge dilutes as trade selectivity decreases and the proportion of noise-driven entries rises. Quantity of participation is not a substitute for quality of selection.`
        : `Trade frequency is elevated at ${metrics.tradesPerActiveDay.toFixed(1)} daily — suggesting a psychological pull toward market participation that occasionally overrides quality-based filtering. Overtrading is often driven by boredom, pressure to recover losses, or a misinterpretation of activity as productivity.`,
    );
  }

  if (hasSizeInst && sentences.length < 3) {
    sentences.push(
      `Position size instability reflects an inconsistent risk framework — when sizing deviates from a defined baseline, execution shifts from systematic to discretionary, introducing variance that obscures strategy assessment and makes edge quantification unreliable.`,
    );
  }

  if (hasProfitDep && sentences.length < 3) {
    sentences.push(
      `Profit concentration in a small subset of trades indicates the edge may be scenario-dependent rather than broadly systematic — a structural fragility that becomes particularly consequential if those high-value market conditions become less frequent.`,
    );
  }

  // Multi-pattern synthesis
  if (highPatterns.length >= 2) {
    sentences.push(
      `The co-occurrence of multiple high-severity patterns is not behaviorally independent — these traits reinforce one another, creating a feedback loop between emotional reactivity and execution quality that will require deliberate, structured intervention to resolve.`,
    );
  } else if (patterns.length >= 3 && sentences.length < 4) {
    sentences.push(
      `The pattern cluster, while individually manageable, collectively suggests that psychological factors account for a meaningful proportion of current performance variance.`,
    );
  }

  return sentences.slice(0, 4).join(" ");
}

// ── P3 — Edge and risk architecture ──────────────────────────────────────────

function p3Edge(
  score: number,
  scores: AiensieScores,
  metrics: TradeMetrics,
): string {
  const { consistencyScore } = scores;
  const winRatePct = (metrics.winRate * 100).toFixed(1);
  const sentences: string[] = [];

  // Win rate framing
  sentences.push(
    metrics.winRate >= 0.60
      ? `A win rate of ${winRatePct}% places this profile in the upper tier for hit frequency — the strategy is directionally correct the majority of the time, though the durability of that rate under extended sampling and regime shifts remains the critical open question.`
      : metrics.winRate >= 0.50
      ? `Win rate at ${winRatePct}% reflects a balanced execution structure — the edge here is not derived primarily from hit frequency, but from how winning and losing trade magnitudes relate to one another.`
      : metrics.winRate >= 0.40
      ? `At ${winRatePct}%, win rate operates below the 50% threshold — a structurally viable but demanding configuration that places the entire weight of profitability on payoff ratio discipline. The margin for execution error is narrow.`
      : `A win rate of ${winRatePct}% demands a high payoff ratio to generate positive expectancy — this is a viable edge profile in trend-following contexts, but requires rigorous loss management and strong winner extension to sustain.`,
  );

  // Payoff ratio framing
  sentences.push(
    metrics.payoffRatio >= 2.0
      ? `The payoff ratio of ${metrics.payoffRatio.toFixed(2)} is a structural strength — winners outpacing losers at this magnitude provides substantial cushion for win-rate deterioration during normal drawdown periods, a meaningful risk buffer.`
      : metrics.payoffRatio >= 1.5
      ? `A payoff ratio of ${metrics.payoffRatio.toFixed(2)} represents workable risk asymmetry, though the ceiling on this metric indicates room to either extend winners more aggressively or tighten stop-loss execution on losers.`
      : metrics.payoffRatio >= 1.0
      ? `The payoff ratio of ${metrics.payoffRatio.toFixed(2)} is operationally marginal — the gap between winner and loser magnitudes is insufficient to absorb meaningful win-rate variance without impacting overall expectancy.`
      : `A payoff ratio of ${metrics.payoffRatio.toFixed(2)} represents an inverted asymmetry — losing trades are outpacing winners in magnitude, which is the single most corrosive structural characteristic in a trading profile and takes precedence over all other optimization priorities.`,
  );

  // Profit factor or consistency
  if (metrics.profitFactor >= 1.8) {
    sentences.push(
      `Profit factor of ${metrics.profitFactor.toFixed(2)} is the strongest quantitative signal in this review — at this level, the strategy is generating material gross profit surplus relative to gross losses, which is the foundational requirement of a sustainable edge.`,
    );
  } else if (metrics.profitFactor >= 1.2) {
    sentences.push(
      `Profit factor of ${metrics.profitFactor.toFixed(2)} confirms the presence of a functional edge — the margin above breakeven is real, though the proximity to 1.0 warrants continued tracking as market regimes evolve.`,
    );
  } else {
    sentences.push(
      `A profit factor of ${metrics.profitFactor.toFixed(2)} indicates the strategy is operating near or at breakeven on a gross basis — transaction costs and execution slippage may be converting this into a structurally unprofitable operation.`,
    );
  }

  if (consistencyScore >= 70) {
    sentences.push(
      `Process consistency scores suggest a repeatable execution approach — the ability to apply an edge uniformly across varied market conditions is a distinguishing characteristic of professional-grade operations.`,
    );
  } else if (consistencyScore < 50) {
    sentences.push(
      `Low consistency scores indicate that whatever edge exists is not being applied systematically — performance is likely more sensitive to market conditions and emotional state than to strategic criteria, which limits its scalability.`,
    );
  }

  return sentences.slice(0, 3).join(" ");
}

// ── P4 — Development focus (conditional) ─────────────────────────────────────

function p4Development(
  score: number,
  scores: AiensieScores,
  patterns: DetectedPattern[],
): string | null {
  const highPatterns = patterns.filter((p) => p.severity === "high");
  if (score >= 80 && highPatterns.length === 0) return null;

  const primaryPattern = [...patterns].sort((a, b) => {
    const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
    return order[a.severity] - order[b.severity];
  })[0];

  const weakest = getWeakestDimension(scores);
  const sentences: string[] = [];

  // Primary development priority
  if (highPatterns.length >= 2) {
    sentences.push(
      `The priority intervention for this profile is behavioral, not strategic — the data indicates that execution psychology is the primary performance constraint, and technical refinements to the underlying strategy will deliver limited improvement until the behavioral layer is addressed.`,
    );
  } else if (highPatterns.length === 1) {
    sentences.push(
      `Development focus should concentrate on the ${primaryPattern.name} pattern — at high severity, this is the single behavioral variable with the greatest measurable impact on forward performance, and targeted intervention here will have a disproportionate effect on outcomes.`,
    );
  } else if (weakest === "discipline") {
    sentences.push(
      `The highest-leverage development opportunity for this profile is execution discipline — standardizing frequency and position sizing through explicit pre-trade rules is the structural intervention most likely to compress performance variance.`,
    );
  } else if (weakest === "risk") {
    sentences.push(
      `Risk architecture is the primary development focus — improving payoff ratio and reducing concentration risk would have a compounding positive effect across all other performance dimensions and should be treated as the foundational priority.`,
    );
  } else if (weakest === "consistency") {
    sentences.push(
      `Process standardization is the development priority — introducing systematic pre-trade criteria and fixed position-sizing rules would reduce behavioral variance and improve the repeatability of results, which is the precondition for reliable performance assessment.`,
    );
  } else if (weakest === "emotional") {
    sentences.push(
      `Emotional regulation is the highest-leverage development area — the behavioral data suggests that market stress is currently amplifying decision noise in ways that are both measurable and structurally addressable through protocol-based trading routines.`,
    );
  } else {
    sentences.push(
      `The development path for this profile involves sharpening decision criteria — improving trade selectivity and entry discipline would materially improve the expectancy profile without requiring changes to the core strategic framework.`,
    );
  }

  // Forward trajectory framing
  sentences.push(
    score >= 65
      ? `At this performance level, marginal improvements in behavioral consistency tend to produce disproportionate returns — the structural foundations for a strong profile are in place, and the remaining work is refinement rather than reconstruction.`
      : score >= 50
      ? `The distance between this profile and a structurally sound trading operation is bridgeable with targeted behavioral work — the diagnostic is clear, and the interventions are specific rather than requiring wholesale strategic revision.`
      : `Foundational behavioral protocols — fixed risk per trade, systematic entry criteria, and post-loss engagement rules — represent the highest-return investment at this stage, as they address root causes rather than surface symptoms.`,
  );

  return sentences.join(" ");
}

// ── Public entry point ────────────────────────────────────────────────────────

export function generateNarrative(report: AiensieReport): NarrativeResult {
  const { aiensieScore, scores, metrics, detectedPatterns, traderType } = report;

  const paragraphs: string[] = [
    p1Profile(aiensieScore, scores, traderType, metrics),
    p2Patterns(aiensieScore, scores, detectedPatterns, metrics),
    p3Edge(aiensieScore, scores, metrics),
  ];

  const dev = p4Development(aiensieScore, scores, detectedPatterns);
  if (dev) paragraphs.push(dev);

  return { paragraphs };
}
