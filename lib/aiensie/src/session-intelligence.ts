import type { Trade, SessionIntelligence, SessionPeriod, SessionProfile } from "./types.js";

// ── Session bucket definitions ────────────────────────────────────────────────

interface SessionBucket {
  period: SessionPeriod;
  label: string;
  startHour: number;
  endHour: number;
}

const BUCKETS: SessionBucket[] = [
  { period: "morning",   label: "Morning (06:00–10:00)",   startHour: 6,  endHour: 10 },
  { period: "midday",    label: "Midday (10:00–14:00)",    startHour: 10, endHour: 14 },
  { period: "afternoon", label: "Afternoon (14:00–18:00)", startHour: 14, endHour: 18 },
  { period: "evening",   label: "Evening (18:00–22:00)",   startHour: 18, endHour: 22 },
  { period: "night",     label: "Late Night (22:00–06:00)", startHour: 22, endHour: 30 }, // wraps past midnight
];

function getSessionPeriod(date: Date): SessionPeriod {
  const h = date.getHours();
  if (h >= 6  && h < 10) return "morning";
  if (h >= 10 && h < 14) return "midday";
  if (h >= 14 && h < 18) return "afternoon";
  if (h >= 18 && h < 22) return "evening";
  return "night";
}

// ── Session quality score (0–100) ────────────────────────────────────────────

function sessionQuality(winRate: number, profitFactor: number): number {
  const wrScore = Math.min(100, winRate * 140);
  const pfScore = profitFactor >= 1 ? Math.min(100, (profitFactor - 1) * 60 + 40) : profitFactor * 40;
  return Math.round(Math.max(0, wrScore * 0.55 + pfScore * 0.45));
}

// ── Emotional risk for a session ──────────────────────────────────────────────
// Night/late sessions with low win rate = high emotional risk

function emotionalRisk(
  period: SessionPeriod,
  winRate: number,
  tradeCount: number,
  hasRevengeTrades: boolean,
): "low" | "medium" | "high" {
  const isRiskyPeriod = period === "night" || period === "evening";
  const isLowWinRate  = winRate < 0.38;

  if (isRiskyPeriod && isLowWinRate && tradeCount >= 3) return "high";
  if ((isRiskyPeriod && tradeCount >= 5) || (hasRevengeTrades && isLowWinRate)) return "medium";
  if (isRiskyPeriod || (isLowWinRate && tradeCount >= 4)) return "medium";
  return "low";
}

// ── Detect if revenge trades are clustered in a session ───────────────────────

function hasRevengeInSession(trades: Trade[]): boolean {
  const sorted = [...trades].sort((a, b) => a.entryTime.getTime() - b.entryTime.getTime());
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i].pnl < 0) {
      const gap = (sorted[i + 1].entryTime.getTime() - sorted[i].exitTime.getTime()) / 60_000;
      if (gap >= 0 && gap <= 30) return true;
    }
  }
  return false;
}

// ── Session insight narrative ─────────────────────────────────────────────────

function buildInsight(
  strongest: SessionPeriod,
  weakest: SessionPeriod,
  emotionalRiskPeriod: SessionPeriod | null,
  sessions: SessionProfile[],
): string {
  const labels: Record<SessionPeriod, string> = {
    morning:   "morning",
    midday:    "midday",
    afternoon: "afternoon",
    evening:   "evening",
    night:     "late-night",
  };

  const strongSess = sessions.find((s) => s.period === strongest);
  const weakSess   = sessions.find((s) => s.period === weakest);

  const parts: string[] = [];

  if (strongSess && strongSess.winRate >= 0.5) {
    parts.push(`Your ${labels[strongest]} sessions show the cleanest execution — higher win rate and more controlled sizing.`);
  } else if (strongSess) {
    parts.push(`${labels[strongest].charAt(0).toUpperCase() + labels[strongest].slice(1)} sessions produce your most consistent results across the dataset.`);
  }

  if (weakSess && weakSess.tradeCount >= 3) {
    parts.push(
      weakSess.emotionalRisk === "high"
        ? `${labels[weakest].charAt(0).toUpperCase() + labels[weakest].slice(1)} trading carries elevated emotional risk — decisions appear more impulsive and recovery entries are more frequent.`
        : `${labels[weakest].charAt(0).toUpperCase() + labels[weakest].slice(1)} sessions produce the weakest results. Consider reducing activity or applying stricter filters during this window.`,
    );
  }

  if (emotionalRiskPeriod && emotionalRiskPeriod !== weakest) {
    parts.push(`Emotional risk is elevated during ${labels[emotionalRiskPeriod]} sessions — expect more variance and apply tighter rules.`);
  }

  if (parts.length === 0) {
    return "Session data shows relatively consistent execution across all time windows. No single period shows a strong behavioral deviation.";
  }

  return parts.join(" ");
}

// ── Main export ───────────────────────────────────────────────────────────────

export function analyzeSessionIntelligence(trades: Trade[]): SessionIntelligence | null {
  if (trades.length < 8) return null;

  // Group trades by session
  const groups: Record<SessionPeriod, Trade[]> = {
    morning:   [],
    midday:    [],
    afternoon: [],
    evening:   [],
    night:     [],
  };

  for (const t of trades) {
    groups[getSessionPeriod(t.entryTime)].push(t);
  }

  // Only include sessions with enough trades
  const profiles: SessionProfile[] = [];

  for (const bucket of BUCKETS) {
    const ts = groups[bucket.period];
    if (ts.length < 2) continue;

    const wins    = ts.filter((t) => t.pnl > 0);
    const losses  = ts.filter((t) => t.pnl <= 0);
    const winRate = wins.length / ts.length;
    const avgPnl  = ts.reduce((s, t) => s + t.pnl, 0) / ts.length;

    const grossWins   = wins.reduce((s, t) => s + t.pnl, 0);
    const grossLosses = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));
    const profitFactor = grossLosses > 0 ? grossWins / grossLosses : grossWins > 0 ? 2 : 0;

    const hasRevenge = hasRevengeInSession(ts);
    const risk       = emotionalRisk(bucket.period, winRate, ts.length, hasRevenge);
    const quality    = sessionQuality(winRate, profitFactor);

    profiles.push({
      period:       bucket.period,
      label:        bucket.label,
      tradeCount:   ts.length,
      winRate,
      avgPnl,
      emotionalRisk: risk,
      quality,
    });
  }

  if (profiles.length < 2) return null;

  // Find strongest / weakest
  const sorted   = [...profiles].sort((a, b) => b.quality - a.quality);
  const strongest = sorted[0].period;
  const weakest   = sorted[sorted.length - 1].period;

  // Find emotional risk period
  const highRiskSess = profiles.find((s) => s.emotionalRisk === "high");
  const emotionalRiskPeriod = highRiskSess ? highRiskSess.period : null;

  // Best execution window — human readable
  const bestBucket   = BUCKETS.find((b) => b.period === strongest)!;
  const bestExecutionWindow = bestBucket.label;

  const insight = buildInsight(strongest, weakest, emotionalRiskPeriod, profiles);

  return { sessions: profiles, strongestSession: strongest, weakestSession: weakest, emotionalRiskPeriod, bestExecutionWindow, insight };
}
