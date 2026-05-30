/**
 * Bybit Closed P&L CSV parser.
 *
 * Targets the "Closed P&L" export from Bybit Derivatives / Unified Account:
 *
 *   Symbol, Side, Qty, Entry Price, Exit Price, Closed P&L,
 *   Open Time, Close Time, Leverage
 *
 * Also handles the Unified format with "Avg Entry Price" / "Avg Exit Price".
 *
 * Each row is a complete round-trip position — no FIFO matching required.
 */

import type { Trade, TradeSide } from "../types.js";
import type { CsvRow, ParseResult } from "./types.js";

function num(s: string | undefined): number {
  if (!s) return 0;
  return parseFloat(s.replace(/[^0-9.eE+-]/g, "")) || 0;
}

function parseDate(s: string): Date {
  if (!s) return new Date(0);
  return new Date(s.replace(" ", "T") + (s.includes("Z") ? "" : "Z"));
}

let idSeq = 0;

export function parseBybit(rows: CsvRow[]): ParseResult {
  const warnings: string[] = [];
  let skipped = 0;
  const trades: Trade[] = [];

  for (const row of rows) {
    try {
      const symbol = (row["Symbol"] ?? row["Contract"] ?? "").trim().toUpperCase();

      // Direction: "Buy"=Long, "Sell"=Short
      const rawSide = (
        row["Side"] ?? row["Direction"] ?? row["Order Side"] ?? ""
      ).trim().toLowerCase();
      const side: TradeSide = rawSide.includes("buy") || rawSide === "long"
        ? "long" : "short";

      const qty        = num(row["Qty"] ?? row["Contracts"] ?? row["Size"]);
      const entryPrice = num(row["Avg Entry Price"] ?? row["Entry Price"]);
      const exitPrice  = num(row["Avg Exit Price"]  ?? row["Exit Price"]);
      const closedPnl  = num(row["Closed P&L"] ?? row["Closed PnL"] ?? row["Realized PnL"]);
      const leverage   = num(row["Leverage"]) || 1;

      const openStr  = row["Open Time"]  ?? row["Opening Time"]  ?? row["Created Time"] ?? "";
      const closeStr = row["Close Time"] ?? row["Closing Time"]  ?? row["Updated Time"] ?? "";

      if (!symbol || qty <= 0 || entryPrice <= 0 || exitPrice <= 0) {
        skipped++;
        continue;
      }

      const entryTime = parseDate(openStr);
      const exitTime  = parseDate(closeStr);

      // Compute fee from PnL identity: pnl = gross - fees
      const gross = side === "long"
        ? (exitPrice - entryPrice) * qty
        : (entryPrice - exitPrice) * qty;
      const fees = Math.max(0, gross - closedPnl);

      trades.push({
        id:           `bybit-${++idSeq}`,
        symbol,
        side,
        entryTime:    entryTime,
        exitTime:     exitTime,
        entryPrice,
        exitPrice,
        positionSize: qty,
        pnl:          closedPnl,
        fees:         fees,
        leverage:     leverage > 1 ? leverage : undefined,
        platform:     "Bybit",
        assetClass:   symbol.endsWith("USDT") || symbol.endsWith("BTC") ? "crypto" : "equities",
      });
    } catch {
      skipped++;
    }
  }

  return {
    exchange:      "bybit",
    exchangeLabel: "Bybit",
    trades,
    tradeCount:    trades.length,
    skippedRows:   skipped,
    warnings,
  };
}
