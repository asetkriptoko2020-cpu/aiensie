// ── Core types ────────────────────────────────────────────────────────────────
export type {
  Trade,
  TradeSide,
  AssetClass,
  TradeMetrics,
  DetectedPattern,
  PatternSeverity,
  AiensieScores,
  AiensieReport,
  ScoreLabel,
  TraderPersona,
  SessionPeriod,
  SessionProfile,
  SessionIntelligence,
  ArchetypeSignal,
  TraderArchetypeDNA,
  CrossMarketInsightType,
  CrossMarketInsight,
  CrossMarketIntelligence,
  BehaviorSnapshot,
  EvolutionDelta,
  BehaviorEvolution,
} from "./types.js";

// ── Engine pipeline ───────────────────────────────────────────────────────────
export { computeMetrics }                        from "./metrics.js";
export { detectPatterns }                        from "./patterns.js";
export { computeScores, computeAiensieScore }    from "./scoring.js";
export { generateReport }                        from "./report.js";

// ── Intelligence modules ──────────────────────────────────────────────────────
export { classifyPersona }                       from "./persona.js";
export { analyzeSessionIntelligence }            from "./session-intelligence.js";
export { buildArchetypeDNA }                     from "./archetype.js";
export { generateSmartSummary }                  from "./smart-summary.js";
export { analyzeCrossMarket }                    from "./cross-market.js";

// ── Narrative engine ──────────────────────────────────────────────────────────
export type { NarrativeResult }                  from "./narrative/generateNarrative.js";
export { generateNarrative }                     from "./narrative/generateNarrative.js";

// ── Sample data ───────────────────────────────────────────────────────────────
export { SAMPLE_TRADES }                         from "./sampleTrades.js";

// ── CSV parsers ───────────────────────────────────────────────────────────────
export type { ParseResult, ExchangeId, CsvRow }  from "./parsers/index.js";
export {
  detectExchange,
  detectAndParse,
  parseBinance,
  parseBybit,
  parseOKX,
  parseHyperliquid,
  parseGeneric,
}                                                from "./parsers/index.js";
