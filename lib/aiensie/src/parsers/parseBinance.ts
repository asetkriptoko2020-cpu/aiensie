/**
 * Binance Trade History CSV parser.
 *
 * Handles two common Binance export formats:
 *
 * Format A — Spot Trade History (most common):
 *   Date(UTC), Pair, Side, Price, Executed, Amount, Fee, Fee Coin
 *
 * Format B — Futures / Derivatives trade history:
 *   Date(UTC), Symbol, Type, Side, Price, Amount, Total, Reduce Only
 *
 * Since Binance exports fill-level data, each side="BUY" opens a position
 * and each side="SELL" closes it. A simple FIFO matcher pairs them up.
 */

import type { Trade, TradeSide } from "../types.js";
import type { CsvRow, ParseResult } from "./types.js";

function num(s: string | undefined): number {
  if (!s) return 0;
  return parseFloat(s.replace(/[^0-9.eE+-]/g, "")) || 0;
}

function parseDate(s: string): Date {
  // "2024-01-02 09:15:00" → ISO
  return new Date(s.replace(" ", "T") + (s.includes("Z") ? "" : "Z"));
}

interface Fill {
  symbol: string;
  time: Date;
  side: "buy" | "sell";
  price: number;
  qty: number;
  fee: number;
}

interface OpenLeg {
  time: Date;
  price: number;
  remaining: number;
  feePerUnit: number; // fee per base-asset unit
}

let idSeq = 0;

function fifoMatch(fills: Fill[]): Trade[] {
  const open: Record<string, OpenLeg[]> = {};
  const trades: Trade[] = [];
  let idx = 0;

  for (const fill of fills) {
    const sym = fill.symbol;
    if (!open[sym]) open[sym] = [];

    if (fill.side === "buy") {
      open[sym].push({
        time: fill.time,
        price: fill.price,
        remaining: fill.qty,
        feePerUnit: fill.qty > 0 ? fill.fee / fill.qty : 0,
      });
    } else {
      let toClose = fill.qty;
      const exitFeePerUnit = fill.qty > 0 ? fill.fee / fill.qty : 0;

      while (toClose > 1e-10 && open[sym] && open[sym].length > 0) {
        const leg = open[sym][0];
        const matched = Math.min(toClose, leg.remaining);

        const entryFee = leg.feePerUnit * matched;
        const exitFee  = exitFeePerUnit  * matched;

        trades.push({
          id:            `bnb-${++idSeq}-${idx++}`,
          symbol:        sym,
          side:          "long" as TradeSide,
          entryTime:     leg.time,
          exitTime:      fill.time,
          entryPrice:    leg.price,
          exitPrice:     fill.price,
          positionSize:  matched,
          pnl:           (fill.price - leg.price) * matched - entryFee - exitFee,
          fees:          entryFee + exitFee,
          platform:      "Binance",
          assetClass:    sym.endsWith("USDT") || sym.endsWith("BTC") ? "crypto" : "equities",
        });

        leg.remaining -= matched;
        toClose       -= matched;
        if (leg.remaining <= 1e-10) open[sym].shift();
      }
    }
  }

  return trades;
}

export function parseBinance(rows: CsvRow[]): ParseResult {
  const warnings: string[] = [];
  let skipped = 0;
  const fills: Fill[] = [];

  for (const row of rows) {
    try {
      // Resolve column names for both formats
      const dateStr  = row["Date(UTC)"] ?? row["Date"] ?? row["Time"] ?? "";
      const symbol   = (row["Pair"] ?? row["Symbol"] ?? "").trim().toUpperCase();
      const rawSide  = (row["Side"] ?? row["Type"] ?? "").trim().toLowerCase();
      const side     = rawSide.includes("buy")  ? "buy" :
                       rawSide.includes("sell") ? "sell" : null;
      const price    = num(row["Price"] ?? row["Avg Price"]);
      const qty      = num(row["Executed"] ?? row["Amount"] ?? row["Filled"]);
      const fee      = num(row["Fee"]);

      if (!symbol || !side || !dateStr || price <= 0 || qty <= 0) { skipped++; continue; }

      fills.push({ symbol, time: parseDate(dateStr), side, price, qty, fee });
    } catch {
      skipped++;
    }
  }

  // Sort chronologically before FIFO matching
  fills.sort((a, b) => a.time.getTime() - b.time.getTime());
  const trades = fifoMatch(fills);

  if (trades.length === 0)
    warnings.push("No completed round-trip trades found. Ensure your export includes both BUY and SELL rows.");

  return {
    exchange:      "binance",
    exchangeLabel: "Binance",
    trades,
    tradeCount:    trades.length,
    skippedRows:   skipped,
    warnings,
  };
}
