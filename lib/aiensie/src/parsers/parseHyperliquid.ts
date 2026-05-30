/**
 * Hyperliquid Trade History CSV parser.
 *
 * Targets the portfolio export from Hyperliquid:
 *
 *   time, coin, dir, px, sz, ntl, fee, closedPnl, hash, crossed
 *
 * Each row represents a closed trade. `dir` is "Long" or "Short".
 * `closedPnl` is the realized P&L (net of fees in some versions).
 */

import type { Trade, TradeSide } from "../types.js";
import type { CsvRow, ParseResult } from "./types.js";

function num(s: string | undefined): number {
  if (!s) return 0;
  return parseFloat(s.replace(/[^0-9.eE+-]/g, "")) || 0;
}

function parseDate(s: string): Date {
  if (!s) return new Date(0);
  // Hyperliquid uses ISO: "2024-01-02T09:15:00.000Z"
  return new Date(s);
}

let idSeq = 0;

export function parseHyperliquid(rows: CsvRow[]): ParseResult {
  const warnings: string[] = [];
  let skipped = 0;
  const trades: Trade[] = [];

  for (const row of rows) {
    try {
      // Normalise lowercase/varied header names
      const keys = Object.keys(row);
      const get = (names: string[]): string =>
        row[keys.find((k) => names.includes(k.toLowerCase().trim())) ?? ""] ?? "";

      const coin     = get(["coin", "asset", "symbol"]).trim().toUpperCase();
      const rawDir   = get(["dir", "direction", "side"]).trim().toLowerCase();
      const side: TradeSide = rawDir.includes("long") || rawDir.includes("buy") ? "long" : "short";

      const px       = num(get(["px", "price", "fill price", "avg price"]));
      const sz       = num(get(["sz", "size", "qty", "quantity"]));
      const ntl      = num(get(["ntl", "notional", "value"])); // notional USD
      const fee      = num(get(["fee", "fees"]));
      const closedPnl = num(get(["closedpnl", "closed_pnl", "realized_pnl", "pnl", "realizedpnl"]));

      const timeStr  = get(["time", "timestamp", "date", "open time", "close time"]);

      if (!coin || sz <= 0) { skipped++; continue; }

      // Hyperliquid gives the exit px and sz of the closing trade.
      // Derive entry price from ntl and closed P&L when possible.
      // When direction is Long: closedPnl = (exitPx - entryPx) * sz - fee
      // entryPx = exitPx - (closedPnl + fee) / sz
      const exitPrice  = px > 0 ? px : (ntl > 0 && sz > 0 ? ntl / sz : 0);
      const entryPrice = sz > 0
        ? exitPrice - (closedPnl + fee) / sz
        : exitPrice;

      if (exitPrice <= 0) { skipped++; continue; }

      const symbol = coin.endsWith("USDC") || coin.endsWith("USDT")
        ? coin
        : `${coin}USDT`;

      const ts = parseDate(timeStr);

      trades.push({
        id:           `hl-${++idSeq}`,
        symbol,
        side,
        // Approximate entry time as 1 minute before close (not always available)
        entryTime:    new Date(ts.getTime() - 60_000),
        exitTime:     ts,
        entryPrice:   entryPrice > 0 ? entryPrice : exitPrice,
        exitPrice,
        positionSize: sz,
        pnl:          closedPnl,
        fees:         fee > 0 ? fee : undefined,
        platform:     "Hyperliquid",
        assetClass:   "crypto",
      });
    } catch {
      skipped++;
    }
  }

  if (trades.length === 0)
    warnings.push("No trades found. Ensure you export the full trade history from Hyperliquid portfolio.");

  return {
    exchange:      "hyperliquid",
    exchangeLabel: "Hyperliquid",
    trades,
    tradeCount:    trades.length,
    skippedRows:   skipped,
    warnings,
  };
}
