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

// ── P1 — Who this trader is ───────────────────────────────────────────────────

function p1Profile(
  score: number,
  scores: AiensieScores,
  traderType: string,
  metrics: TradeMetrics,
): string {
  const { disciplineScore, emotionalStabilityScore, riskControlScore, consistencyScore, decisionQualityScore } = scores;
  const dominant = getDominantDimension(scores);

  const opening =
    score >= 85
      ? `This assessment reflects a trader who has developed genuine institutional-grade habits — not just knowledge, but the ability to execute with discipline under real market conditions. `
      : score >= 70
      ? `The data presents a picture of a trader who has built a solid foundation — someone who understands what good trading looks like and largely acts on it. `
      : score >= 55
      ? `This assessment reveals a trader at a crossroads: you have the potential and the instincts, but some behavioral habits are quietly working against you. `
      : score >= 40
      ? `The trading record reflects a pattern that's common but costly — reacting to the market rather than executing a clear plan. The good news is that these patterns are entirely correctable. `
      : `The data tells a story that many traders recognize: the gap between knowing what to do and actually doing it under pressure. The underlying instincts may be sound, but the execution habits need rebuilding. `;

  let body: string;
  if (dominant === "discipline") {
    body = disciplineScore >= 75
      ? `Your standout quality is discipline — you trade ${metrics.tradesPerActiveDay.toFixed(1)} times per active day on average, which shows you're selective about when you get involved rather than forcing trades. `
      : `The area pulling you back most is discipline — at ${metrics.tradesPerActiveDay.toFixed(1)} trades per active day, you may be trading too frequently, chasing moves that aren't really there. `;
  } else if (dominant === "risk") {
    body = riskControlScore >= 75
      ? `Your risk management is a genuine strength — your winning trades are ${metrics.payoffRatio.toFixed(2)}× larger than your losers on average, which means you're protecting yourself well when things don't go to plan. `
      : `Risk management is the area most in need of attention — with winners averaging only ${metrics.payoffRatio.toFixed(2)}× the size of losers, there isn't enough cushion to sustain a healthy overall result. `;
  } else if (dominant === "emotional") {
    body = emotionalStabilityScore >= 70
      ? `What stands out most is your emotional composure — there's little sign of panic trading, revenge entries, or impulsive sizing in this record. You seem to have developed a healthy separation between your emotions and your decisions. `
      : `The defining theme of this profile is emotional trading — the data shows that how you feel is regularly influencing how you trade, particularly after losses or during rough patches. `;
  } else if (dominant === "consistency") {
    body = consistencyScore >= 70
      ? `Process consistency is your strongest quality — you apply the same approach repeatedly rather than improvising, which is what separates professionals from gamblers in the long run. `
      : `Inconsistency is the primary drag on this profile — results vary too much to indicate a repeatable approach. The trading feels more reactive than systematic at this stage. `;
  } else {
    body = decisionQualityScore >= 70
      ? `Your entry and exit decisions are the highlight here — the average return per trade is positive, which means you have a genuine edge, not just luck. `
      : `The quality of your individual trade decisions is the central challenge — on average, the timing and selection of entries and exits isn't generating enough value to build on. `;
  }

  const closing =
    score >= 75
      ? `Across ${metrics.totalTrades} trades, the behavioral pattern is clear and encouraging.`
      : score >= 55
      ? `With ${metrics.totalTrades} trades to analyse, the picture is clear enough to pinpoint exactly what's working and what isn't.`
      : `The ${metrics.totalTrades}-trade sample paints a consistent enough picture that the root issues are identifiable — and actionable.`;

  return opening + body + closing;
}

// ── P2 — Psychological habits and patterns ────────────────────────────────────

function p2Patterns(
  score: number,
  scores: AiensieScores,
  patterns: DetectedPattern[],
  metrics: TradeMetrics,
): string {
  const { emotionalStabilityScore } = scores;

  const hasRevenge   = patterns.find((p) => p.name === "Revenge Trading Risk");
  const hasOverconf  = patterns.find((p) => p.name === "Overconfidence After Wins");
  const hasLossHold  = patterns.find((p) => p.name === "Holding Losses Too Long");
  const hasSizeInst  = patterns.find((p) => p.name === "Erratic Position Sizing");
  const hasOvertrade = patterns.find((p) => p.name === "Overtrading");
  const hasProfitDep = patterns.find((p) => p.name === "Reliance on a Few Big Wins");

  const highPatterns = patterns.filter((p) => p.severity === "high");

  if (patterns.length === 0) {
    return emotionalStabilityScore >= 68
      ? `Looking at the psychology behind the numbers, this is a clean profile. There's no sign of revenge trading, no pattern of sizing up recklessly after wins, and no tendency to hold losses hoping they'll turn around. These might sound like basic things, but most traders struggle with at least one of them — often without realising it. The fact that none of these show up here suggests you've either learned from difficult experiences in the past, or you're naturally disciplined in how you approach the market. The main thing to guard against going forward is complacency: clean behavioral records can drift if you stop paying attention to the process.`
      : `The psychological screening returns a relatively clean picture — no major behavioral distortions are showing up at a meaningful level. There's some low-grade emotional influence present in the trading record, but it doesn't rise to the level of a recognizable pattern. The main risk for a profile like this is gradual drift: small bad habits that creep in slowly are the hardest to spot until they've already done damage.`;
  }

  const sentences: string[] = [];

  if (hasRevenge) {
    sentences.push(
      hasRevenge.severity === "high"
        ? `The most significant finding in this assessment is a strong tendency toward revenge trading — jumping back into the market shortly after a loss, driven by the urge to recover quickly. This is one of the most damaging habits a trader can develop, because it combines emotional decision-making with the moments when judgment is most impaired. A loss stings. The instinct to make it back immediately is completely human. But acting on that instinct almost always makes things worse.`
        : hasRevenge.severity === "medium"
        ? `There's a moderate pattern of re-entering the market too quickly after a loss — often within minutes. It's not happening every time, but it's frequent enough to be a real habit rather than a coincidence. The psychology here is straightforward: a loss triggers discomfort, and placing another trade feels like doing something about it. But a rushed trade after a loss is rarely the best trade of the day.`
        : `A mild tendency to re-enter the market quickly after losing trades is detectable in the data. It's not severe, but it's worth being aware of — these patterns tend to intensify during stressful market conditions or drawdown periods if they go unaddressed.`,
    );
  }

  if (hasLossHold) {
    sentences.push(
      hasLossHold.severity === "high"
        ? `A clear and costly pattern of holding losses too long is present in this record. Losing trades are being held much longer than winning ones — which is the opposite of what sound trading requires. This comes from a very understandable place: it's psychologically harder to accept a loss than to sit on a losing position and hope. But hope is not a strategy, and this habit is directly inflating the size of losses relative to wins.`
        : `There's a pattern of holding onto losing trades longer than winning ones. It's not extreme, but it's consistent enough to flag. The emotional mechanics are familiar to most traders: winners feel like they might reverse, but losses feel like they just need a bit more time. Cutting losses early is one of the most important — and most difficult — skills in trading.`,
    );
  }

  if (hasOverconf) {
    sentences.push(
      `After several wins in a row, position sizes are going up — sometimes significantly. This is overconfidence in a very recognizable form: a winning streak feels like evidence that you've figured something out, and the natural impulse is to press your advantage. The danger is that winning streaks don't change the probabilities of the next trade. Sizing up right before a loss is when overconfidence is most expensive.`,
    );
  }

  if (hasOvertrade) {
    sentences.push(
      hasOvertrade.severity === "high"
        ? `The trading frequency here is noticeably high at ${metrics.tradesPerActiveDay.toFixed(1)} trades per active day. At that volume, it's difficult to maintain the patience and selectivity that good setups require. High activity often masks a deeper issue — discomfort with doing nothing, a need to feel productive, or the compulsion to recover losses quickly. More trades doesn't mean more opportunity; it often means more noise.`
        : `Trade frequency is running a bit high at ${metrics.tradesPerActiveDay.toFixed(1)} per day. It's not extreme, but it suggests there may be times when trades are placed out of habit or impatience rather than genuine conviction. The best trades tend to come from waiting, not from staying perpetually busy.`,
    );
  }

  if (hasSizeInst && sentences.length < 3) {
    sentences.push(
      `Position sizing is inconsistent across the trading record — sometimes small, sometimes large, with no obvious systematic logic. When sizing varies this much, performance becomes heavily influenced by which trades happened to be sized up, rather than by the quality of decision-making overall. A fixed rule for how much to risk per trade solves this immediately.`,
    );
  }

  if (hasProfitDep && sentences.length < 3) {
    sentences.push(
      `A large portion of total profits comes from just a few exceptional trades. This is worth examining carefully — it means that if those specific trades were removed, the overall picture would look very different. It raises the question of whether those big winners are reliably reproducible, or whether they were unusual events that happened to go the right way.`,
    );
  }

  if (highPatterns.length >= 2) {
    sentences.push(
      `These patterns don't exist in isolation — they feed each other. Revenge trading leads to oversized positions; oversized losses create emotional pressure; emotional pressure leads to more revenge trading. Breaking one of these cycles tends to weaken the others, which is why targeted behavioral work delivers outsized results.`,
    );
  } else if (patterns.length >= 3 && sentences.length < 4) {
    sentences.push(
      `Taken individually, each of these patterns is manageable. Taken together, they suggest that emotional factors are playing a meaningful role in driving performance variance.`,
    );
  }

  return sentences.slice(0, 4).join(" ");
}

// ── P3 — The numbers behind the results ──────────────────────────────────────

function p3Edge(
  score: number,
  scores: AiensieScores,
  metrics: TradeMetrics,
): string {
  const { consistencyScore } = scores;
  const winRatePct = (metrics.winRate * 100).toFixed(1);
  const sentences: string[] = [];

  sentences.push(
    metrics.winRate >= 0.60
      ? `You win ${winRatePct}% of your trades — more often than most traders. That's a meaningful advantage, though the important question is whether that hit rate can hold up over a longer period and across different market conditions.`
      : metrics.winRate >= 0.50
      ? `A win rate of ${winRatePct}% sits just above the 50% mark — which means the edge here isn't about winning more often, it's about making sure winners are bigger than losers when they do occur.`
      : metrics.winRate >= 0.40
      ? `With ${winRatePct}% of trades ending in profit, most trades currently end at a loss. That's workable — some of the best trading approaches win less than half the time — but it means the size of each win becomes critically important.`
      : `A win rate of ${winRatePct}% is challenging to make profitable. It's possible, but it requires winning trades to be significantly larger than losing ones. Without that asymmetry, the math doesn't work in your favour.`,
  );

  sentences.push(
    metrics.payoffRatio >= 2.0
      ? `When you do win, your winning trades are on average ${metrics.payoffRatio.toFixed(2)}× larger than your losing ones — that's a strong risk-reward relationship. It gives you a lot of room to absorb losing streaks without serious damage.`
      : metrics.payoffRatio >= 1.5
      ? `Your average winning trade is ${metrics.payoffRatio.toFixed(2)}× larger than your average loser — a healthy relationship, though there's still room to let winners run a bit further or cut losers a bit sooner.`
      : metrics.payoffRatio >= 1.0
      ? `Wins and losses are running close to the same size on average (${metrics.payoffRatio.toFixed(2)}× ratio). That makes profitability almost entirely dependent on win rate, which is a fragile position to be in.`
      : `On average, your losing trades are larger than your winning ones (${metrics.payoffRatio.toFixed(2)}× ratio). This is the single most important number to improve — until wins are bigger than losses, consistent profitability is very difficult to achieve.`,
  );

  if (metrics.profitFactor >= 1.8) {
    sentences.push(
      `The overall picture is positive — for every dollar lost, you're making back ${metrics.profitFactor.toFixed(2)} dollars. That's a real edge, and it shows the strategy has genuine merit beyond lucky trades.`,
    );
  } else if (metrics.profitFactor >= 1.2) {
    sentences.push(
      `Overall, profits are outpacing losses (${metrics.profitFactor.toFixed(2)}× ratio) — which confirms a working edge, even if the margin is modest. The goal is to widen that margin through better execution.`,
    );
  } else {
    sentences.push(
      `At a profit efficiency of ${metrics.profitFactor.toFixed(2)}, overall losses are close to — or ahead of — overall profits. After accounting for transaction costs, this may be a net-negative operation at the moment.`,
    );
  }

  if (consistencyScore >= 70) {
    sentences.push(
      `The consistency in how you execute is also notable — you're not just getting lucky on a few big trades. The results reflect a repeatable approach, which is the foundation everything else is built on.`,
    );
  } else if (consistencyScore < 50) {
    sentences.push(
      `The inconsistency in approach means results are sensitive to factors outside your control — market conditions, emotional state, recent performance. Building a more repeatable process would make performance much more predictable.`,
    );
  }

  return sentences.slice(0, 3).join(" ");
}

// ── P4 — What to work on next ─────────────────────────────────────────────────

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

  if (highPatterns.length >= 2) {
    sentences.push(
      `The most important thing to understand about this profile is that the primary obstacle isn't the strategy — it's the behavior around it. Improving entries, finding better setups, or changing markets won't move the needle nearly as much as addressing the emotional patterns that are disrupting execution. That's where the real work is.`,
    );
  } else if (highPatterns.length === 1) {
    sentences.push(
      `The single highest-impact change available to this trader is addressing the ${primaryPattern.name} pattern. At the severity level detected here, this one habit is likely responsible for a disproportionate share of losses and missed profits. Fixing everything else while this remains unaddressed would be like bailing out a leaking boat.`,
    );
  } else if (weakest === "discipline") {
    sentences.push(
      `The highest-leverage improvement available is getting more deliberate about when and how much to trade. Reducing frequency and standardizing position sizing would immediately reduce the variability in results — and make it much easier to assess whether the strategy itself is actually working.`,
    );
  } else if (weakest === "risk") {
    sentences.push(
      `Improving the size relationship between winning and losing trades is the most important technical focus for this profile. Everything else — win rate, consistency, emotional discipline — becomes much more manageable once the risk-reward structure is sound.`,
    );
  } else if (weakest === "consistency") {
    sentences.push(
      `Building more consistency into the process is the priority here. That means defining clear criteria for entering and exiting trades, and sticking to them regardless of how you feel about the market on a given day. Process consistency is what turns a profitable strategy into reliable results.`,
    );
  } else if (weakest === "emotional") {
    sentences.push(
      `The biggest opportunity for this trader is in emotional management. The data shows that stress, losses, and winning streaks are influencing decisions in measurable ways. Simple protocols — cooling-off periods after losses, pre-set rules for sizing — can dramatically reduce the emotional variance in decision-making.`,
    );
  } else {
    sentences.push(
      `Refining the quality of individual trade decisions is the main development focus — being more selective about entries and more precise about exits would have a direct and meaningful impact on overall results.`,
    );
  }

  sentences.push(
    score >= 65
      ? `The foundations here are solid. The gap between this profile and a consistently strong one is real but manageable — it's about refinement, not reinvention.`
      : score >= 50
      ? `There's a clear path forward from here. The issues are specific, not systemic, which means targeted changes in a few areas could produce significant improvement relatively quickly.`
      : `Building durable trading habits — consistent sizing, clear entry rules, post-loss protocols — is the work of this stage. Get those right, and everything else becomes easier.`,
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
