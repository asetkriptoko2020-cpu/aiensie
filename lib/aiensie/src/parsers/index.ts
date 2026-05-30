export type { ParseResult, ExchangeId, CsvRow, ExchangeParser } from "./types.js";
export { detectExchange }    from "./detect.js";
export { parseBinance }      from "./parseBinance.js";
export { parseBybit }        from "./parseBybit.js";
export { parseOKX }          from "./parseOKX.js";
export { parseHyperliquid }  from "./parseHyperliquid.js";
export { parseGeneric }      from "./parseGeneric.js";

import { detectExchange }   from "./detect.js";
import { parseBinance }     from "./parseBinance.js";
import { parseBybit }       from "./parseBybit.js";
import { parseOKX }         from "./parseOKX.js";
import { parseHyperliquid } from "./parseHyperliquid.js";
import { parseGeneric }     from "./parseGeneric.js";
import type { CsvRow, ParseResult } from "./types.js";

/**
 * Auto-detect the exchange from CSV headers and parse all rows.
 * Falls back to the universal generic parser for unrecognised formats.
 * Returns exchange === "unknown" only when the file is empty or produces 0 trades.
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

  const headers  = Object.keys(rows[0]);
  const exchange = detectExchange(headers);

  console.log("[Aiensie] detectAndParse — detected exchange:", exchange);
  console.log("[Aiensie] detectAndParse — headers:", headers.slice(0, 10));

  switch (exchange) {
    case "binance":     {
      const r = parseBinance(rows);
      console.log("[Aiensie] Binance parser — trades:", r.tradeCount);
      return r;
    }
    case "bybit":       {
      const r = parseBybit(rows);
      console.log("[Aiensie] Bybit parser — trades:", r.tradeCount);
      return r;
    }
    case "okx":         {
      const r = parseOKX(rows);
      console.log("[Aiensie] OKX parser — trades:", r.tradeCount);
      return r;
    }
    case "hyperliquid": {
      const r = parseHyperliquid(rows);
      console.log("[Aiensie] Hyperliquid parser — trades:", r.tradeCount);
      return r;
    }
    default: {
      // Unknown exchange → try the universal generic parser as fallback
      console.log("[Aiensie] No exchange matched — trying generic parser");
      const r = parseGeneric(rows);
      if (r.tradeCount > 0) {
        console.log("[Aiensie] Generic parser succeeded — trades:", r.tradeCount);
        return r;
      }
      // Generic parser also produced 0 trades → truly unsupported
      console.warn("[Aiensie] Generic parser produced 0 trades — unsupported format");
      return {
        exchange:      "unknown",
        exchangeLabel: "Unknown",
        trades:        [],
        tradeCount:    0,
        skippedRows:   rows.length,
        warnings: [
          `Unsupported CSV format. Detected headers: ${headers.slice(0, 8).join(", ")}.`,
        ],
      };
    }
  }
}
