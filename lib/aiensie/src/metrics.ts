import type { Trade, TradeMetrics } from "./types.js";

function stddev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function holdingMinutes(trade: Trade): number {
  return (trade.exitTime.getTime() - trade.entryTime.getTime()) / 60_000;
}

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function computeMetrics(trades: Trade[]): TradeMetrics {
  if (trades.length === 0) {
    return {
      totalTrades: 0,
      winRate: 0,
      averageWin: 0,
      averageLoss: 0,
      payoffRatio: 0,
      profitFactor: 0,
      expectancy: 0,
      averageHoldingMinutes: 0,
      tradesPerActiveDay: 0,
      positionSizeVariability: 0,
      topSymbolExposure: 0,
      maxConsecutiveLosses: 0,
      profitDependencyTop10Percent: 0,
    };
  }

  const wins  = trades.filter((t) => t.pnl > 0);
  const losses = trades.filter((t) => t.pnl <= 0);

  const totalTrades = trades.length;
  const winRate     = wins.length / totalTrades;

  const averageWin  = wins.length > 0
    ? wins.reduce((s, t) => s + t.pnl, 0) / wins.length
    : 0;
  const averageLoss = losses.length > 0
    ? losses.reduce((s, t) => s + t.pnl, 0) / losses.length
    : 0;

  const payoffRatio = averageLoss !== 0
    ? Math.abs(averageWin / averageLoss)
    : averageWin > 0 ? Infinity : 0;

  const grossWins   = wins.reduce((s, t) => s + t.pnl, 0);
  const grossLosses = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));
  const profitFactor = grossLosses > 0 ? grossWins / grossLosses : grossWins > 0 ? Infinity : 0;

  const expectancy = winRate * averageWin + (1 - winRate) * averageLoss;

  const averageHoldingMinutes =
    trades.reduce((s, t) => s + holdingMinutes(t), 0) / totalTrades;

  // Unique active days
  const activeDays = new Set(trades.map((t) => dayKey(t.entryTime)));
  const tradesPerActiveDay = totalTrades / activeDays.size;

  // Position size variability — use notional dollar value so it's comparable
  // across asset classes (0.25 BTC and 5 SOL may represent very different dollar
  // exposures; positionSize × entryPrice normalises them to a common unit).
  const notionals = trades.map((t) => t.positionSize * t.entryPrice);
  const meanNotional = notionals.reduce((s, v) => s + v, 0) / notionals.length;
  const positionSizeVariability = meanNotional > 0 ? stddev(notionals) / meanNotional : 0;

  // Top symbol exposure (fraction of trades in most-traded symbol)
  const symbolCounts: Record<string, number> = {};
  for (const t of trades) symbolCounts[t.symbol] = (symbolCounts[t.symbol] ?? 0) + 1;
  const maxSymbolCount = Math.max(...Object.values(symbolCounts));
  const topSymbolExposure = maxSymbolCount / totalTrades;

  // Max consecutive losses
  let maxConsecutiveLosses = 0;
  let streak = 0;
  for (const t of trades) {
    if (t.pnl <= 0) {
      streak++;
      maxConsecutiveLosses = Math.max(maxConsecutiveLosses, streak);
    } else {
      streak = 0;
    }
  }

  // Profit dependency: % of total gross profit from top 10% of winning trades
  const sortedWins = [...wins].sort((a, b) => b.pnl - a.pnl);
  const top10Count = Math.max(1, Math.ceil(wins.length * 0.1));
  const top10Profit = sortedWins.slice(0, top10Count).reduce((s, t) => s + t.pnl, 0);
  const profitDependencyTop10Percent = grossWins > 0 ? top10Profit / grossWins : 0;

  return {
    totalTrades,
    winRate,
    averageWin,
    averageLoss,
    payoffRatio,
    profitFactor,
    expectancy,
    averageHoldingMinutes,
    tradesPerActiveDay,
    positionSizeVariability,
    topSymbolExposure,
    maxConsecutiveLosses,
    profitDependencyTop10Percent,
  };
}
