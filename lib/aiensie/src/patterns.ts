import type { Trade, DetectedPattern, PatternSeverity } from "./types.js";

function holdingMinutes(trade: Trade): number {
  return (trade.exitTime.getTime() - trade.entryTime.getTime()) / 60_000;
}

function severity(score: number): PatternSeverity {
  if (score >= 0.66) return "high";
  if (score >= 0.33) return "medium";
  return "low";
}

function formatMinutes(mins: number): string {
  if (mins < 60) return `${Math.round(mins)} minutes`;
  const h = (mins / 60).toFixed(1);
  return `${h} hours`;
}

// ── Revenge Trading Risk ──────────────────────────────────────────────────────
function detectRevengeTradingRisk(trades: Trade[]): DetectedPattern | null {
  const sorted = [...trades].sort(
    (a, b) => a.entryTime.getTime() - b.entryTime.getTime(),
  );

  let revengeCount = 0;
  const examples: string[] = [];

  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].pnl >= 0) continue;
    const lossExit = sorted[i].exitTime.getTime();
    for (let j = i + 1; j < sorted.length; j++) {
      const nextEntry = sorted[j].entryTime.getTime();
      if (nextEntry < lossExit) continue;
      const gap = (nextEntry - lossExit) / 60_000;
      if (gap <= 30) {
        revengeCount++;
        if (examples.length < 1)
          examples.push(`jumped back in ${gap.toFixed(0)} minutes after a loss`);
        break;
      }
      break;
    }
  }

  if (revengeCount === 0) return null;

  const ratio = revengeCount / Math.max(1, trades.filter((t) => t.pnl < 0).length);

  return {
    name: "Revenge Trading Risk",
    severity: severity(ratio),
    description:
      "After a losing trade, you tend to jump straight back into the market — often driven by the urge to recover quickly. This emotional re-entry usually leads to poor decisions at exactly the wrong moment.",
    evidence: `Detected ${revengeCount} time${revengeCount > 1 ? "s" : ""}. Example: ${examples[0] ?? "rapid re-entry after a loss"}.`,
  };
}

// ── Overtrading ───────────────────────────────────────────────────────────────
function detectOvertrading(trades: Trade[], tradesPerActiveDay: number): DetectedPattern | null {
  const THRESHOLD = 6;
  if (tradesPerActiveDay < THRESHOLD) return null;

  const score = Math.min(1, (tradesPerActiveDay - THRESHOLD) / 10);
  return {
    name: "Overtrading",
    severity: severity(score),
    description:
      "You're placing a high number of trades each day. This often happens when traders feel they need to stay busy, or are chasing opportunities that aren't really there. More trades doesn't mean more profit — it usually means more noise.",
    evidence: `You averaged ${tradesPerActiveDay.toFixed(1)} trades per active day. A focused trader typically aims for fewer, higher-quality setups.`,
  };
}

// ── Position Size Instability ─────────────────────────────────────────────────
function detectPositionSizeInstability(
  trades: Trade[],
  positionSizeVariability: number,
): DetectedPattern | null {
  const THRESHOLD = 0.35;
  if (positionSizeVariability < THRESHOLD) return null;

  const score = Math.min(1, (positionSizeVariability - THRESHOLD) / 0.65);
  const sizes = trades.map((t) => t.positionSize);
  const min   = Math.min(...sizes).toFixed(2);
  const max   = Math.max(...sizes).toFixed(2);

  return {
    name: "Erratic Position Sizing",
    severity: severity(score),
    description:
      "The amount you risk on each trade varies a lot — sometimes you go in small, other times much larger. Without a consistent sizing rule, your results become unpredictable and heavily influenced by which trades you happened to size up on.",
    evidence: `Your position sizes ranged from ${min} to ${max}. This wide spread suggests sizing decisions are being made in the moment rather than following a set rule.`,
  };
}

// ── Loss Holding Bias ─────────────────────────────────────────────────────────
function detectLossHoldingBias(trades: Trade[]): DetectedPattern | null {
  const wins   = trades.filter((t) => t.pnl > 0);
  const losses = trades.filter((t) => t.pnl <= 0);
  if (wins.length === 0 || losses.length === 0) return null;

  const avgWinHold  = wins.reduce((s, t) => s + holdingMinutes(t), 0) / wins.length;
  const avgLossHold = losses.reduce((s, t) => s + holdingMinutes(t), 0) / losses.length;

  const ratio = avgLossHold / avgWinHold;
  if (ratio < 1.3) return null;

  const score = Math.min(1, (ratio - 1.3) / 1.7);
  return {
    name: "Holding Losses Too Long",
    severity: severity(score),
    description:
      "You tend to hold onto losing trades much longer than winning ones — a very common but costly habit. It usually comes from hoping a loss will turn around, which makes small losses grow into large ones over time.",
    evidence: `On average, you hold losing trades for ${formatMinutes(avgLossHold)} but cut winners after just ${formatMinutes(avgWinHold)} — that's ${ratio.toFixed(1)}× longer on the losing side.`,
  };
}

// ── Overconfidence After Wins ─────────────────────────────────────────────────
function detectOverconfidenceAfterWins(trades: Trade[]): DetectedPattern | null {
  const sorted = [...trades].sort(
    (a, b) => a.entryTime.getTime() - b.entryTime.getTime(),
  );

  let streak = 0;
  const avgBaseSize              = sorted.reduce((s, t) => s + t.positionSize, 0) / sorted.length;
  const overconfidenceInstances: number[] = [];

  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].pnl > 0) { streak++; } else { streak = 0; }
    if (streak >= 3 && i + 1 < sorted.length) {
      const nextSize = sorted[i + 1].positionSize;
      const increase = nextSize / avgBaseSize;
      if (increase > 1.5) overconfidenceInstances.push(increase);
    }
  }

  if (overconfidenceInstances.length === 0) return null;

  const avgIncrease = overconfidenceInstances.reduce((s, v) => s + v, 0) / overconfidenceInstances.length;
  const score       = Math.min(1, (avgIncrease - 1.5) / 1.5);

  return {
    name: "Overconfidence After Wins",
    severity: severity(score),
    description:
      "After a run of winning trades, you tend to bet bigger — sometimes significantly so. This is overconfidence in action: recent wins make the market feel easier than it is, right before it reminds you otherwise.",
    evidence: `Detected ${overconfidenceInstances.length} instance${overconfidenceInstances.length > 1 ? "s" : ""} where you sized up after 3+ consecutive wins — on average ${Math.round((avgIncrease - 1) * 100)}% above your usual size.`,
  };
}

// ── Profit Dependency ─────────────────────────────────────────────────────────
function detectProfitDependency(profitDependency: number): DetectedPattern | null {
  const THRESHOLD = 0.5;
  if (profitDependency < THRESHOLD) return null;

  const score = Math.min(1, (profitDependency - THRESHOLD) / 0.5);
  return {
    name: "Reliance on a Few Big Wins",
    severity: severity(score),
    description:
      "Most of your profits come from a small handful of exceptional trades. While that sounds good, it means your results depend heavily on catching lightning in a bottle — remove those few trades, and the performance picture changes dramatically.",
    evidence: `Your top 10% of winning trades generated ${(profitDependency * 100).toFixed(0)}% of your total profits. A more robust strategy spreads gains across many trades.`,
  };
}

// ── Public export ─────────────────────────────────────────────────────────────

export function detectPatterns(
  trades: Trade[],
  tradesPerActiveDay: number,
  positionSizeVariability: number,
  profitDependency: number,
): DetectedPattern[] {
  const results = [
    detectRevengeTradingRisk(trades),
    detectOvertrading(trades, tradesPerActiveDay),
    detectPositionSizeInstability(trades, positionSizeVariability),
    detectLossHoldingBias(trades),
    detectOverconfidenceAfterWins(trades),
    detectProfitDependency(profitDependency),
  ];

  return results.filter((p): p is DetectedPattern => p !== null);
}
