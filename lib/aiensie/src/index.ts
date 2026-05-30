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
} from "./types.js";

// ── Engine pipeline ───────────────────────────────────────────────────────────
export { computeMetrics }                        from "./metrics.js";
export { detectPatterns }                        from "./patterns.js";
export { computeScores, computeAiensieScore }    from "./scoring.js";
export { generateReport }                        from "./report.js";

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
