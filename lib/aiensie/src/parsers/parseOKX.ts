/**
 * OKX Positions History CSV parser.
 *
 * Targets the "Positions History" export from OKX:
 *
 *   Instrument ID, Leverage, Opening time, Closing time,
 *   Opening avg price, Closing avg price, Realized PnL, Fees, Direction
 *
 * Each row is a complete closed position.
 */

import type { Trade, TradeSide } from "../types.js";
import type { CsvRow, ParseResult } from "./types.js";

function num(s: string | undefined): number {
  if (!s) return 0;
  return parseFloat(s.replace(/[^0-9.eE+-]/g, "")) || 0;
}

function parseDate(s: string): Date {
  if (!s) return new Date(0);
  // OKX format: "2024-01-02T09:15:00.000Z" or "2024-01-02 09:15:00"
  return new Date(s.replace(" ", "T") + (s.includes("Z") ? "" : "Z"));
}

/** Extract base coin from OKX instrument like "BTC-USDT-SWAP" or "BTC-USDT" */
function normalizeSymbol(raw: string): string {
  return raw.replace(/-SWAP$/, "").replace(/-/g, "").toUpperCase();
}

let idSeq = 0;

export function parseOKX(rows: CsvRow[]): ParseResult {
  const warnings: string[] = [];
  let skipped = 0;
  const trades: Trade[] = [];

  for (const row of rows) {
    try {
      const rawInstrument = row["Instrument ID"] ?? row["Instrument"] ?? "";
      if (!rawInstrument.trim()) { skipped++; continue; }

      const symbol = normalizeSymbol(rawInstrument);

      const rawDir = (row["Direction"] ?? row["Side"] ?? row["Order Side"] ?? "").trim().toLowerCase();
      const side: TradeSide = rawDir.includes("long") || rawDir.includes("buy") ? "long" : "short";

      const entryPrice = num(row["Opening avg price"] ?? row["Avg Entry Price"]);
      const exitPrice  = num(row["Closing avg price"] ?? row["Avg Exit Price"]);
      const pnl        = num(row["Realized PnL"] ?? row["Realized Profit"] ?? row["P&L"]);
      const fees       = num(row["Fees"] ?? row["Fee"]);
      const leverage   = num(row["Leverage"]) || 1;

      const openStr  = row["Opening time"]  ?? row["Open Time"]  ?? "";
      const closeStr = row["Closing time"]  ?? row["Close Time"] ?? "";

      if (entryPrice <= 0 || exitPrice <= 0) { skipped++; continue; }

      // Derive position size from PnL + prices when not provided
      const rawQty = num(row["Qty"] ?? row["Size"] ?? row["Amount"]);
      let qty = rawQty;
      if (qty <= 0 && entryPrice > 0) {
        const gross = Math.abs(pnl) + Math.abs(fees);
        const delta = Math.abs(exitPrice - entryPrice);
        qty = delta > 0 ? gross / delta : 0;
      }

      if (qty <= 0) { skipped++; continue; }

      trades.push({
        id:           `okx-${++idSeq}`,
        symbol,
        side,
        entryTime:    parseDate(openStr),
        exitTime:     parseDate(closeStr),
        entryPrice,
        exitPrice,
        positionSize: qty,
        pnl,
        fees:         fees > 0 ? fees : undefined,
        leverage:     leverage > 1 ? leverage : undefined,
        platform:     "OKX",
        assetClass:   symbol.includes("USD") || symbol.length <= 8 ? "crypto" : "equities",
      });
    } catch {
      skipped++;
    }
  }

  if (trades.length === 0)
    warnings.push("No closed positions found. Make sure you export 'Positions History', not open orders.");

  return {
    exchange:      "okx",
    exchangeLabel: "OKX",
    trades,
    tradeCount:    trades.length,
    skippedRows:   skipped,
    warnings,
  };
}
