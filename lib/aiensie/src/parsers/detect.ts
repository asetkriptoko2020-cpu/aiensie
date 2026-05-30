import type { ExchangeId } from "./types.js";

/**
 * Inspect CSV header columns and return the most likely exchange.
 * Each check tests for distinctive column combinations.
 */
export function detectExchange(headers: string[]): ExchangeId {
  const h = headers.map((s) => s.toLowerCase().trim().replace(/\s+/g, " "));
  const has = (...terms: string[]) => terms.every((t) => h.some((col) => col.includes(t)));
  const any = (...terms: string[]) => terms.some((t) => h.some((col) => col.includes(t)));

  // Hyperliquid: coin + dir + (closedpnl or ntl)
  if (has("coin", "dir") && any("closedpnl", "closed_pnl", "ntl")) return "hyperliquid";

  // Bybit Closed P&L export: entry price + exit price + closed p&l
  if (
    (has("avg entry price") || has("entry price")) &&
    (has("avg exit price") || has("exit price")) &&
    (has("closed p&l") || has("closed pnl"))
  )
    return "bybit";

  // OKX Positions History: opening avg price / closing avg price
  if (
    has("instrument id") &&
    (has("opening avg price") || has("opening time"))
  )
    return "okx";

  // Binance: Date(UTC) + Pair + Side, or Symbol + Executed
  if (
    has("pair") ||
    (has("date") && any("executed", "filled")) ||
    (has("symbol") && has("realized profit"))
  )
    return "binance";

  return "unknown";
}
