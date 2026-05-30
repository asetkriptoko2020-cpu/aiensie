export type Plan = "free" | "pro";

export interface MockUser {
  name: string;
  email: string;
  plan: Plan;
  joinedDate: string;
  avatar: string;
}

export interface MockReport {
  id: string;
  date: string;
  exchange: string;
  tradeCount: number;
  aiensieScore: number;
  label: string;
  traderType: string;
  mainWeakness: string;
  mainStrength: string;
  scores: {
    discipline: number;
    riskControl: number;
    consistency: number;
    emotionalStability: number;
    decisionQuality: number;
  };
  patterns: { name: string; severity: "low" | "medium" | "high" }[];
  actionPlan: string[];
  winRate: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  maxLossStreak: number;
  persona: string;
}

export const MOCK_USER: MockUser = {
  name: "Alex Chen",
  email: "alex@trademail.com",
  plan: "pro",
  joinedDate: "Jan 2024",
  avatar: "AC",
};

export const MOCK_REPORTS: MockReport[] = [
  {
    id: "r1",
    date: "2024-01-15",
    exchange: "Binance",
    tradeCount: 68,
    aiensieScore: 52,
    label: "Fair",
    traderType: "Developing Trader",
    mainWeakness: "Revenge Trading Risk",
    mainStrength: "Consistent win frequency",
    scores: { discipline: 48, riskControl: 55, consistency: 60, emotionalStability: 42, decisionQuality: 58 },
    patterns: [
      { name: "Revenge Trading Risk", severity: "high" },
      { name: "Overtrading", severity: "medium" },
    ],
    actionPlan: [
      "After any losing trade, wait at least 30 minutes before placing the next one.",
      "Set a daily loss limit and stop trading when you hit it.",
      "Track your time-between-trades to spot emotional re-entries.",
    ],
    winRate: 0.48,
    avgWin: 178,
    avgLoss: -142,
    profitFactor: 1.12,
    maxLossStreak: 5,
    persona: "The foundation is being built. Every trade you analyze is a step closer to a repeatable edge.",
  },
  {
    id: "r2",
    date: "2024-02-10",
    exchange: "Binance",
    tradeCount: 72,
    aiensieScore: 58,
    label: "Good",
    traderType: "Developing Trader",
    mainWeakness: "Erratic Position Sizing",
    mainStrength: "Improved emotional control",
    scores: { discipline: 55, riskControl: 62, consistency: 58, emotionalStability: 55, decisionQuality: 63 },
    patterns: [{ name: "Erratic Position Sizing", severity: "medium" }],
    actionPlan: [
      "Pick a fixed percentage of capital to risk on every trade — 1% is a strong starting point.",
      "Review your last 20 trades for sizing consistency before your next session.",
    ],
    winRate: 0.52,
    avgWin: 195,
    avgLoss: -138,
    profitFactor: 1.28,
    maxLossStreak: 4,
    persona: "The foundation is being built. Every trade you analyze is a step closer to a repeatable edge.",
  },
  {
    id: "r3",
    date: "2024-03-08",
    exchange: "Bybit",
    tradeCount: 80,
    aiensieScore: 63,
    label: "Good",
    traderType: "Structured Trader",
    mainWeakness: "Holding Losses Too Long",
    mainStrength: "High win rate consistency",
    scores: { discipline: 65, riskControl: 60, consistency: 68, emotionalStability: 62, decisionQuality: 65 },
    patterns: [{ name: "Holding Losses Too Long", severity: "medium" }],
    actionPlan: [
      "Define your stop-loss before every entry — and honor it without exception.",
      "Compare your average hold time on winners vs losers each week.",
    ],
    winRate: 0.56,
    avgWin: 210,
    avgLoss: -128,
    profitFactor: 1.45,
    maxLossStreak: 3,
    persona: "You have a working framework in place. Sharpening consistency will convert potential into performance.",
  },
  {
    id: "r4",
    date: "2024-04-05",
    exchange: "Bybit",
    tradeCount: 75,
    aiensieScore: 68,
    label: "Good",
    traderType: "Structured Trader",
    mainWeakness: "Overconfidence After Wins",
    mainStrength: "Strong risk-reward ratio",
    scores: { discipline: 68, riskControl: 72, consistency: 70, emotionalStability: 65, decisionQuality: 70 },
    patterns: [{ name: "Overconfidence After Wins", severity: "low" }],
    actionPlan: [
      "After 3 wins in a row, cap your next trade at your normal position size — no larger.",
      "Winning streaks don't change the odds of the next trade.",
    ],
    winRate: 0.58,
    avgWin: 228,
    avgLoss: -122,
    profitFactor: 1.62,
    maxLossStreak: 3,
    persona: "You have a working framework in place. Sharpening consistency will convert potential into performance.",
  },
  {
    id: "r5",
    date: "2024-05-12",
    exchange: "Binance",
    tradeCount: 80,
    aiensieScore: 74,
    label: "Strong",
    traderType: "Systematic Trader",
    mainWeakness: "Minor sizing inconsistency on volatile sessions",
    mainStrength: "Disciplined, process-led execution",
    scores: { discipline: 76, riskControl: 75, consistency: 74, emotionalStability: 72, decisionQuality: 76 },
    patterns: [],
    actionPlan: [
      "Keep doing what you're doing — but review your last 20 trades weekly.",
      "Consider documenting your pre-trade checklist to reinforce your process.",
    ],
    winRate: 0.62,
    avgWin: 244,
    avgLoss: -114,
    profitFactor: 1.88,
    maxLossStreak: 2,
    persona: "Your approach is structured and repeatable — you follow a process rather than reacting to the market.",
  },
  {
    id: "r6",
    date: "2024-05-28",
    exchange: "Binance",
    tradeCount: 80,
    aiensieScore: 78,
    label: "Strong",
    traderType: "Systematic Trader",
    mainWeakness: "Occasional overtrading on high-volatility days",
    mainStrength: "Consistent profit efficiency across sessions",
    scores: { discipline: 78, riskControl: 80, consistency: 76, emotionalStability: 78, decisionQuality: 80 },
    patterns: [],
    actionPlan: [
      "On high-volatility days, set a hard trade count limit (e.g. max 4 trades).",
      "Keep tracking weekly — performance can drift quietly without regular review.",
    ],
    winRate: 0.63,
    avgWin: 258,
    avgLoss: -108,
    profitFactor: 2.05,
    maxLossStreak: 2,
    persona: "Your approach is structured and repeatable — you follow a process rather than reacting to the market.",
  },
];

export const SCORE_TREND = MOCK_REPORTS.map((r) => ({
  label: new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  score: r.aiensieScore,
}));

export const MONTHLY_DIMENSION_TREND = [
  { month: "Jan", Discipline: 48, "Emotional Control": 42, "Risk Control": 55, Consistency: 60, "Decision Quality": 58 },
  { month: "Feb", Discipline: 55, "Emotional Control": 55, "Risk Control": 62, Consistency: 58, "Decision Quality": 63 },
  { month: "Mar", Discipline: 65, "Emotional Control": 62, "Risk Control": 60, Consistency: 68, "Decision Quality": 65 },
  { month: "Apr", Discipline: 68, "Emotional Control": 65, "Risk Control": 72, Consistency: 70, "Decision Quality": 70 },
  { month: "May", Discipline: 77, "Emotional Control": 75, "Risk Control": 78, Consistency: 75, "Decision Quality": 78 },
];

export const MARKET_BREAKDOWN = [
  { market: "Crypto",  icon: "₿", reports: 6, avgScore: 66, trend: "+26pts", exchanges: "Binance · Bybit",      locked: false },
  { market: "Stocks",  icon: "📈", reports: 0, avgScore: 0,  trend: "—",      exchanges: "Not connected",        locked: true  },
  { market: "Forex",   icon: "💱", reports: 0, avgScore: 0,  trend: "—",      exchanges: "Not connected",        locked: true  },
  { market: "ETF",     icon: "🏦", reports: 0, avgScore: 0,  trend: "—",      exchanges: "Not connected",        locked: true  },
  { market: "Options", icon: "📊", reports: 0, avgScore: 0,  trend: "—",      exchanges: "Not connected",        locked: true  },
];
