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

// ── Dynamic Trader Persona ────────────────────────────────────────────────────

export interface TraderPersona {
  title: string;
  summary: string;
  tone: string;
  archetype: string;
  confidence: number;
}

// ── Session Intelligence ──────────────────────────────────────────────────────

export type SessionPeriod = "morning" | "midday" | "afternoon" | "evening" | "night";

export interface SessionProfile {
  period: SessionPeriod;
  label: string;
  tradeCount: number;
  winRate: number;
  avgPnl: number;
  emotionalRisk: "low" | "medium" | "high";
  quality: number;
}

export interface SessionIntelligence {
  sessions: SessionProfile[];
  strongestSession: SessionPeriod;
  weakestSession: SessionPeriod;
  emotionalRiskPeriod: SessionPeriod | null;
  bestExecutionWindow: string;
  insight: string;
}

// ── Behavioral DNA / Archetype ────────────────────────────────────────────────

export interface ArchetypeSignal {
  text: string;
  confidence: number;
}

export interface TraderArchetypeDNA {
  signals: ArchetypeSignal[];
  primaryArchetype: string;
  secondaryArchetype?: string;
  edgeProfile: string;
}

// ── Cross-Market Intelligence ─────────────────────────────────────────────────

export type CrossMarketInsightType = "strength" | "risk" | "comparison" | "recommendation";

export interface CrossMarketInsight {
  type:       CrossMarketInsightType;
  text:       string;
  confidence: number;
}

export interface CrossMarketIntelligence {
  assetClass:     string;
  exchangeLabel:  string;
  insights:       CrossMarketInsight[];
  marketProfile:  string;
  executionStyle: string;
  primaryRisk:    string;
  behavioralNote: string;
}

// ── Behavior Memory Snapshot ──────────────────────────────────────────────────

export interface BehaviorSnapshot {
  id: string;
  timestamp: number;
  aiensieScore: number;
  scores: AiensieScores;
  traderType: string;
  topPatterns: string[];
  exchange: string;
  tradeCount: number;
}

// ── Behavior Evolution ────────────────────────────────────────────────────────

export interface EvolutionDelta {
  dimension: string;
  previous: number;
  current: number;
  delta: number;
  trend: "improved" | "declined" | "stable";
  insight: string;
}

export interface BehaviorEvolution {
  hasHistory: boolean;
  totalReports: number;
  scoreDelta: number;
  evolutionDeltas: EvolutionDelta[];
  progressInsight: string;
}

// ── Final report ──────────────────────────────────────────────────────────────

export type ScoreLabel = "Poor" | "Fair" | "Good" | "Strong" | "Elite";

export interface AiensieReport {
  aiensieScore: number;
  label: ScoreLabel;
  traderType: string;
  persona: string;
  dynamicPersona: TraderPersona;
  scores: AiensieScores;
  metrics: TradeMetrics;
  detectedPatterns: DetectedPattern[];
  strengths: string[];
  weaknesses: string[];
  actionPlan: string[];
  sessionIntelligence: SessionIntelligence | null;
  archetypeDNA: TraderArchetypeDNA;
  crossMarketIntelligence: CrossMarketIntelligence;
  smartSummary: string;
}
