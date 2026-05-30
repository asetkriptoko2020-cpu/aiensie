// ── Normalized trade record ───────────────────────────────────────────────────

export type TradeSide = "long" | "short" | "buy" | "sell";

export type AssetClass = "crypto" | "equities" | "forex" | "futures" | "options" | "other";

export interface Trade {
  id: string;
  symbol: string;
  side: TradeSide;
  entryTime: Date;
  exitTime: Date;
  entryPrice: number;
  exitPrice: number;
  positionSize: number;
  pnl: number;
  fees?: number;
  leverage?: number;
  platform?: string;
  assetClass?: AssetClass;
}

// ── Computed metrics ──────────────────────────────────────────────────────────

export interface TradeMetrics {
  totalTrades: number;
  winRate: number;
  averageWin: number;
  averageLoss: number;
  payoffRatio: number;
  profitFactor: number;
  expectancy: number;
  averageHoldingMinutes: number;
  tradesPerActiveDay: number;
  positionSizeVariability: number;
  topSymbolExposure: number;
  maxConsecutiveLosses: number;
  profitDependencyTop10Percent: number;
}

// ── Behavioral pattern ────────────────────────────────────────────────────────

export type PatternSeverity = "low" | "medium" | "high";

export interface DetectedPattern {
  name: string;
  severity: PatternSeverity;
  description: string;
  evidence: string;
}

// ── Scores ────────────────────────────────────────────────────────────────────

export interface AiensieScores {
  disciplineScore: number;
  riskControlScore: number;
  consistencyScore: number;
  emotionalStabilityScore: number;
  decisionQualityScore: number;
}

// ── Final report ──────────────────────────────────────────────────────────────

export type ScoreLabel = "Poor" | "Fair" | "Good" | "Strong" | "Elite";

export interface AiensieReport {
  aiensieScore: number;
  label: ScoreLabel;
  traderType: string;
  persona: string;
  scores: AiensieScores;
  metrics: TradeMetrics;
  detectedPatterns: DetectedPattern[];
  strengths: string[];
  weaknesses: string[];
  actionPlan: string[];
}
