import type { Trade, DetectedPattern, PatternSeverity } from "./types.js";

function holdingMinutes(trade: Trade): number {
  return (trade.exitTime.getTime() - trade.entryTime.getTime()) / 60_000;
}

function severity(score: number): PatternSeverity {
  if (score >= 0.66) return "high";
  if (score >= 0.33) return "medium";
  return "low";
}

// ── Revenge Trading Risk ──────────────────────────────────────────────────────
// A trade opened within 30 minutes of a losing trade closing.
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
        if (examples.length < 2)
          examples.push(
            `${sorted[j].id} entered ${gap.toFixed(0)}m after ${sorted[i].id} loss`,
          );
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
    description: "Trades opened within 30 minutes of a loss, suggesting emotional re-entry.",
    evidence: `${revengeCount} instance(s) detected. ${examples.join("; ")}.`,
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
    description: "High volume of trades per active day may indicate impulsive execution.",
    evidence: `Average ${tradesPerActiveDay.toFixed(1)} trades/day (threshold: ${THRESHOLD}).`,
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
  const min = Math.min(...sizes).toFixed(2);
  const max = Math.max(...sizes).toFixed(2);

  return {
    name: "Position Size Instability",
    severity: severity(score),
    description: "Significant variation in position sizing suggests lack of a fixed risk framework.",
    evidence: `Coefficient of variation: ${(positionSizeVariability * 100).toFixed(0)}%. Size range: ${min}–${max}.`,
  };
}

// ── Loss Holding Bias ─────────────────────────────────────────────────────────
// Losses held significantly longer than wins.
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
    name: "Loss Holding Bias",
    severity: severity(score),
    description: "Losing trades held significantly longer than winning ones — difficulty accepting losses.",
    evidence: `Avg loss hold: ${avgLossHold.toFixed(0)}m vs avg win hold: ${avgWinHold.toFixed(0)}m (${ratio.toFixed(1)}× longer).`,
  };
}

// ── Overconfidence After Wins ─────────────────────────────────────────────────
// Position size increases significantly after 3+ consecutive wins.
function detectOverconfidenceAfterWins(trades: Trade[]): DetectedPattern | null {
  const sorted = [...trades].sort(
    (a, b) => a.entryTime.getTime() - b.entryTime.getTime(),
  );

  let streak = 0;
  const avgBaseSize = sorted.reduce((s, t) => s + t.positionSize, 0) / sorted.length;
  const overconfidenceInstances: number[] = [];

  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].pnl > 0) {
      streak++;
    } else {
      streak = 0;
    }
    if (streak >= 3 && i + 1 < sorted.length) {
      const nextSize = sorted[i + 1].positionSize;
      const increase = nextSize / avgBaseSize;
      if (increase > 1.5) overconfidenceInstances.push(increase);
    }
  }

  if (overconfidenceInstances.length === 0) return null;

  const avgIncrease = overconfidenceInstances.reduce((s, v) => s + v, 0) / overconfidenceInstances.length;
  const score = Math.min(1, (avgIncrease - 1.5) / 1.5);

  return {
    name: "Overconfidence After Wins",
    severity: severity(score),
    description: "Position size increases sharply after winning streaks, indicating overconfidence.",
    evidence: `${overconfidenceInstances.length} instance(s) detected; average size ${(avgIncrease * 100).toFixed(0)}% of baseline.`,
  };
}

// ── Profit Dependency ─────────────────────────────────────────────────────────
function detectProfitDependency(profitDependency: number): DetectedPattern | null {
  const THRESHOLD = 0.5;
  if (profitDependency < THRESHOLD) return null;

  const score = Math.min(1, (profitDependency - THRESHOLD) / 0.5);
  return {
    name: "Profit Dependency",
    severity: severity(score),
    description: "A small number of outlier trades drive the majority of profits — not a sustainable edge.",
    evidence: `Top 10% of winning trades account for ${(profitDependency * 100).toFixed(0)}% of total gross profit.`,
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
