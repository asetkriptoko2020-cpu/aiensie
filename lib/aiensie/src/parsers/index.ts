export type { ParseResult, ExchangeId, CsvRow, ExchangeParser } from "./types.js";
export { detectExchange }    from "./detect.js";
export { parseBinance }      from "./parseBinance.js";
export { parseBybit }        from "./parseBybit.js";
export { parseOKX }          from "./parseOKX.js";
export { parseHyperliquid }  from "./parseHyperliquid.js";

import { detectExchange }   from "./detect.js";
import { parseBinance }     from "./parseBinance.js";
import { parseBybit }       from "./parseBybit.js";
import { parseOKX }         from "./parseOKX.js";
import { parseHyperliquid } from "./parseHyperliquid.js";
import type { CsvRow, ParseResult } from "./types.js";

/**
 * Auto-detect the exchange from CSV headers and parse all rows.
 * Returns a ParseResult — check `exchange === "unknown"` for unsupported formats.
 */
export function detectAndParse(rows: CsvRow[]): ParseResult {
  if (rows.length === 0) {
    return {
      exchange:      "unknown",
      exchangeLabel: "Unknown",
      trades:        [],
      tradeCount:    0,
      skippedRows:   0,
      warnings:      ["The CSV file is empty."],
    };
  }

  const headers = Object.keys(rows[0]);
  const exchange = detectExchange(headers);

  switch (exchange) {
    case "binance":     return parseBinance(rows);
    case "bybit":       return parseBybit(rows);
    case "okx":         return parseOKX(rows);
    case "hyperliquid": return parseHyperliquid(rows);
    default:
      return {
        exchange:      "unknown",
        exchangeLabel: "Unknown",
        trades:        [],
        tradeCount:    0,
        skippedRows:   rows.length,
        warnings: [
          `Unsupported CSV format. Detected headers: ${headers.slice(0, 6).join(", ")}.`,
        ],
      };
  }
}
