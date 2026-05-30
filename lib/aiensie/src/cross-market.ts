import type { Trade, AssetClass, AiensieScores, TradeMetrics, DetectedPattern } from "./types.js";

// ── Types ─────────────────────────────────────────────────────────────────────

export type CrossMarketInsightType = "strength" | "risk" | "comparison" | "recommendation";

export interface CrossMarketInsight {
  type:       CrossMarketInsightType;
  text:       string;
  confidence: number;
}

export interface CrossMarketIntelligence {
  assetClass:       string;
  exchangeLabel:    string;
  insights:         CrossMarketInsight[];
  marketProfile:    string;
  executionStyle:   string;
  primaryRisk:      string;
  behavioralNote:   string;
}

// ── Asset class detection ─────────────────────────────────────────────────────

const CEX_EXCHANGES    = ["binance", "bybit", "okx", "coinbase", "kucoin", "kraken", "gate"];
const DEX_EXCHANGES    = ["hyperliquid", "dydx", "gmx", "uniswap", "jupiter", "synthetix"];
const FOREX_EXCHANGES  = ["metatrader", "mt4", "mt5", "oanda", "fxpro", "pepperstone"];
const STOCK_EXCHANGES  = ["ibkr", "robinhood", "td ameritrade", "tastytrade", "webull"];

function detectAssetClass(trades: Trade[], exchangeLabel?: string): AssetClass {
  const label = exchangeLabel?.toLowerCase() ?? "";

  if (CEX_EXCHANGES.some((e) => label.includes(e))) return "crypto";
  if (DEX_EXCHANGES.some((e) => label.includes(e)))  return "crypto";
  if (FOREX_EXCHANGES.some((e) => label.includes(e))) return "forex";
  if (STOCK_EXCHANGES.some((e) => label.includes(e))) return "equities";
  if (label.includes("option"))  return "options";
  if (label.includes("future"))  return "futures";
  if (label.includes("etf"))     return "equities";
  if (label.includes("stock"))   return "equities";
  if (label.includes("forex") || label.includes("fx")) return "forex";
  if (label.includes("crypto"))  return "crypto";
  if (label === "sample data")   return "crypto";

  // Fall back to trade-level asset class
  const tradeLevelClass = trades.find((t) => t.assetClass)?.assetClass;
  return tradeLevelClass ?? "crypto";
}

// ── Per-asset-class profiles ──────────────────────────────────────────────────

interface AssetProfile {
  label:         string;
  marketProfile: string;
  executionStyle: string;
  primaryRisk:   string;
  behavioralNote: string;
}

const ASSET_PROFILES: Record<AssetClass, AssetProfile> = {
  crypto: {
    label:          "Crypto / Digital Assets",
    marketProfile:  "High-volatility, 24/7 market with elevated emotional and impulsive trading tendencies across the retail base.",
    executionStyle: "Speed and frequency often dominate crypto execution — the behavioral risk is overtrading and reactive re-entry.",
    primaryRisk:    "Emotional volatility. Crypto markets amplify revenge trading and overnight impulsive re-entries.",
    behavioralNote: "Crypto traders tend to have stronger discipline during structured session windows and weaker control during overnight or high-volatility periods.",
  },
  equities: {
    label:          "Equities / Stocks",
    marketProfile:  "Session-bound market with cleaner institutional structure — behavioral patterns are more stable and disciplined.",
    executionStyle: "Equity traders typically show stronger patience and session discipline compared to crypto participants.",
    primaryRisk:    "Overconfidence after earnings events and sizing escalation during momentum phases.",
    behavioralNote: "Equity trading sessions produce stronger behavioral consistency in most profiles due to fixed market hours and lower leverage.",
  },
  forex: {
    label:          "Forex / FX",
    marketProfile:  "Highly liquid, 24-hour market where psychological edge erosion correlates strongly with session overlap periods.",
    executionStyle: "Forex favors systematic rule-following. Deviation from plan tends to be the primary loss driver.",
    primaryRisk:    "Session-based emotional volatility — particularly during high-impact news windows and London/NY overlaps.",
    behavioralNote: "Forex execution quality typically peaks during the London session and deteriorates in the Asia overlap.",
  },
  options: {
    label:          "Options",
    marketProfile:  "Asymmetric risk market where sizing control is the primary behavioral lever.",
    executionStyle: "Options traders frequently exhibit aggressive sizing tendencies and overconfidence in complex strategies.",
    primaryRisk:    "Overtrading complex strategies and holding through expiration due to loss-aversion bias.",
    behavioralNote: "Options profiles show heightened sizing inconsistency and a tendency to over-hedge after losses.",
  },
  futures: {
    label:          "Futures",
    marketProfile:  "Leveraged market with fast-moving price action — behavioral errors compound quickly due to margin dynamics.",
    executionStyle: "Futures execution is leverage-amplified — disciplined stop adherence is the primary edge separator.",
    primaryRisk:    "Revenge trading and failure to honor stop levels under margin pressure.",
    behavioralNote: "Futures traders show stronger execution control during regular session hours and deterioration during pre/after-market periods.",
  },
  other: {
    label:          "Other Markets",
    marketProfile:  "Mixed market profile — behavioral analysis reflects general trading tendencies.",
    executionStyle: "Execution patterns follow your general behavioral profile rather than market-specific tendencies.",
    primaryRisk:    "Consistency and process adherence are the primary behavioral levers regardless of market.",
    behavioralNote: "Building consistent execution habits is the highest-leverage improvement across any market type.",
  },
};

// ── Insight generators ────────────────────────────────────────────────────────

function generateInsights(
  assetClass: AssetClass,
  scores: AiensieScores,
  metrics: TradeMetrics,
  patterns: DetectedPattern[],
  overall: number,
): CrossMarketInsight[] {
  const { disciplineScore, emotionalStabilityScore, riskControlScore, consistencyScore } = scores;
  const hasRevenge  = patterns.some((p) => p.name === "Revenge Trading Risk");
  const hasOverconf = patterns.some((p) => p.name === "Overconfidence After Wins");
  const hasLossHold = patterns.some((p) => p.name === "Holding Losses Too Long");
  const hasSizeInst = patterns.some((p) => p.name === "Erratic Position Sizing");

  const insights: CrossMarketInsight[] = [];

  // ── Crypto-specific ───────────────────────────────────────────────────────
  if (assetClass === "crypto") {
    if (emotionalStabilityScore >= 68 && !hasRevenge) {
      insights.push({
        type: "strength",
        text: "Emotional stability in crypto is genuinely rare. Your behavioral composure here would be a competitive advantage across any market class.",
        confidence: 88,
      });
    }
    if (hasRevenge || (metrics.tradesPerActiveDay > 7 && emotionalStabilityScore < 60)) {
      insights.push({
        type: "risk",
        text: "The 24/7 crypto market is amplifying impulsive re-entry patterns. The absence of session boundaries removes a natural behavioral circuit-breaker.",
        confidence: 91,
      });
    }
    if (metrics.tradesPerActiveDay < 4 && riskControlScore >= 65) {
      insights.push({
        type: "comparison",
        text: "Your crypto discipline profile mirrors the structure of an equity or futures trader — significantly more selective than the crypto retail average.",
        confidence: 83,
      });
    }
    if (hasSizeInst) {
      insights.push({
        type: "risk",
        text: "Crypto volatility is directly affecting your sizing decisions. Position size spikes correlate with high-volatility sessions — a pattern that erodes edge consistency.",
        confidence: 86,
      });
    }
    if (overall >= 72) {
      insights.push({
        type: "comparison",
        text: "Behavioral discipline at this level would rank in the top 15% of crypto traders analyzed. The structural habits are present — protect them.",
        confidence: 80,
      });
    }
    insights.push({
      type: "recommendation",
      text: "Apply session-specific rules to crypto: define a strict window for active trading rather than reacting to markets around the clock. This single constraint will improve most behavioral metrics.",
      confidence: 85,
    });
  }

  // ── Equities-specific ─────────────────────────────────────────────────────
  if (assetClass === "equities") {
    if (disciplineScore >= 70) {
      insights.push({
        type: "strength",
        text: "Equity session discipline is your strongest behavioral advantage. Fixed market hours align with your execution style — you respond well to structured environments.",
        confidence: 87,
      });
    }
    if (hasOverconf) {
      insights.push({
        type: "risk",
        text: "Overconfidence patterns frequently spike around earnings events in equity profiles. Position sizing discipline is more fragile than it appears during momentum conditions.",
        confidence: 84,
      });
    }
    insights.push({
      type: "comparison",
      text: "Equity traders with this behavioral profile often see execution quality improve further when switching between crypto — the session constraints create natural discipline checkpoints.",
      confidence: 78,
    });
    insights.push({
      type: "recommendation",
      text: "Your behavioral edge is strongest during structured session windows. Consider expanding your approach to other session-bound markets — forex or futures — where your discipline profile translates well.",
      confidence: 82,
    });
  }

  // ── Forex-specific ────────────────────────────────────────────────────────
  if (assetClass === "forex") {
    if (consistencyScore >= 68) {
      insights.push({
        type: "strength",
        text: "Behavioral consistency in forex indicates you're trading a systematic approach rather than reacting to price action. That's the primary edge separator in this market.",
        confidence: 86,
      });
    }
    insights.push({
      type: "risk",
      text: "Forex session overlap windows (particularly London/NY) are high-risk behavioral periods. Execution discipline tends to erode as volatility spikes during these windows.",
      confidence: 83,
    });
    insights.push({
      type: "recommendation",
      text: "Define specific session windows where you will and will not trade. Forex behavioral profiles improve significantly when time-based constraints are added to entry criteria.",
      confidence: 88,
    });
  }

  // ── Options-specific ──────────────────────────────────────────────────────
  if (assetClass === "options") {
    insights.push({
      type: "risk",
      text: "Options profiles frequently show loss-aversion bias — holding losing positions through expiration rather than cutting. This pattern compounds rapidly due to theta decay.",
      confidence: 87,
    });
    if (hasSizeInst) {
      insights.push({
        type: "risk",
        text: "Sizing inconsistency in options is significantly more dangerous than in other markets — premium costs and leverage create asymmetric behavioral error penalties.",
        confidence: 89,
      });
    }
    insights.push({
      type: "recommendation",
      text: "Apply a maximum-premium-at-risk rule per trade rather than sizing by position count. This single constraint directly addresses the primary behavioral risk in this market.",
      confidence: 85,
    });
  }

  // ── Futures-specific ──────────────────────────────────────────────────────
  if (assetClass === "futures") {
    if (hasLossHold) {
      insights.push({
        type: "risk",
        text: "Holding losses in a leveraged futures environment creates compounding margin pressure. Stop-loss adherence is the single most critical behavioral discipline in this market.",
        confidence: 92,
      });
    }
    if (disciplineScore >= 68) {
      insights.push({
        type: "strength",
        text: "Disciplined execution in futures — where leverage amplifies every behavioral error — reflects genuine process maturity. This score would be harder to maintain in a crypto or options environment.",
        confidence: 85,
      });
    }
    insights.push({
      type: "recommendation",
      text: "Define your maximum daily leverage exposure before each session. Futures behavioral profiles improve fastest when leverage constraints are pre-committed rather than managed in-session.",
      confidence: 87,
    });
  }

  // ── Universal fallback if insufficient insights ───────────────────────────
  if (insights.length < 2) {
    insights.push({
      type: "comparison",
      text: "Behavioral patterns in your profile are consistent with traders in this market class. Process-based execution — regardless of asset type — is the primary edge driver.",
      confidence: 72,
    });
  }

  return insights.slice(0, 4);
}

// ── Main export ───────────────────────────────────────────────────────────────

export function analyzeCrossMarket(
  trades: Trade[],
  scores: AiensieScores,
  metrics: TradeMetrics,
  patterns: DetectedPattern[],
  overall: number,
  exchangeLabel?: string,
): CrossMarketIntelligence {
  const assetClass = detectAssetClass(trades, exchangeLabel);
  const profile    = ASSET_PROFILES[assetClass];
  const insights   = generateInsights(assetClass, scores, metrics, patterns, overall);

  return {
    assetClass:     profile.label,
    exchangeLabel:  exchangeLabel ?? "Unknown",
    insights,
    marketProfile:  profile.marketProfile,
    executionStyle: profile.executionStyle,
    primaryRisk:    profile.primaryRisk,
    behavioralNote: profile.behavioralNote,
  };
}
