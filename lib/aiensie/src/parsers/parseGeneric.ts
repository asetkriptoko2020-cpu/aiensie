/**
 * Universal / Generic CSV parser.
 *
 * Accepts any trading CSV that contains at minimum:
 *   - A symbol column  (symbol / Symbol / Pair / pair / coin / Coin / ticker / instrument)
 *   - A side column    (side / Side / direction / Direction / type / Type / order type)
 *   - A PnL column     (pnl / PnL / Realized PnL / Realized Profit / Closed PnL / profit / net profit)
 *
 * All other fields (times, prices, size) are optional and default to safe values.
 */

import type { Trade, TradeSide } from "../types.js";
import type { CsvRow, ParseResult } from "./types.js";

// ── Header alias maps ─────────────────────────────────────────────────────────

const SYMBOL_KEYS   = ["symbol","pair","coin","instrument","ticker","market","contract","currency pair","asset"];
const SIDE_KEYS     = ["side","direction","type","order type","order side","pos side","position side","trade side","trade type"];
const PNL_KEYS      = ["pnl","realized pnl","realized profit","closed pnl","closed p&l","net profit","profit","p&l","realizedpnl","net pnl","profit/loss","gain/loss","realized gain"];
const ENTRY_TIME_KEYS = ["entry time","entry_time","entrytime","open time","open_time","opentime","time","date","date(utc)","timestamp","created time","created_time","trade time","trade date","datetime","opened"];
const EXIT_TIME_KEYS  = ["exit time","exit_time","exittime","close time","close_time","closetime","updated time","updated_time","closed time","closed","close date","closed at"];
const ENTRY_PRICE_KEYS = ["entry price","entry_price","entryprice","avg entry price","avg_entry_price","open price","open_price","average entry price","fill price"];
const EXIT_PRICE_KEYS  = ["exit price","exit_price","exitprice","avg exit price","avg_exit_price","close price","close_price","average exit price","closing price","last price"];
const SIZE_KEYS     = ["qty","quantity","size","position_size","positionsize","amount","contracts","volume","filled","executed qty","filled qty","base qty","position size","trade size","lots","shares"];

// ── Helpers ───────────────────────────────────────────────────────────────────

function normalizeKey(k: string): string {
  return k.toLowerCase().trim().replace(/\s+/g, " ");
}

/**
 * Build a lookup map from normalized header → original header key.
 */
function buildHeaderMap(row: CsvRow): Map<string, string> {
  const map = new Map<string, string>();
  for (const key of Object.keys(row)) {
    map.set(normalizeKey(key), key);
  }
  return map;
}

/**
 * Find the first matching alias in the header map. Returns the raw value or "".
 */
function get(map: Map<string, string>, row: CsvRow, aliases: string[]): string {
  for (const alias of aliases) {
    const original = map.get(alias);
    if (original !== undefined && row[original] !== undefined) {
      return (row[original] ?? "").trim();
    }
  }
  return "";
}

function num(s: string): number {
  if (!s) return 0;
  return parseFloat(s.replace(/[^0-9.eE+\-]/g, "")) || 0;
}

function parseDate(s: string): Date {
  if (!s) return new Date();
  const cleaned = s.replace(" ", "T");
  const d = new Date(cleaned.includes("Z") ? cleaned : cleaned + "Z");
  return isNaN(d.getTime()) ? new Date() : d;
}

function parseSide(raw: string): TradeSide {
  const s = raw.toLowerCase().trim();
  if (s === "long"  || s === "buy"  || s === "b") return "long";
  if (s === "short" || s === "sell" || s === "s") return "short";
  if (s.includes("buy")  || s.includes("long"))   return "long";
  if (s.includes("sell") || s.includes("short"))  return "short";
  return "long";
}

let idSeq = 0;

// ── Main parser ───────────────────────────────────────────────────────────────

export function parseGeneric(rows: CsvRow[]): ParseResult {
  if (rows.length === 0) {
    return {
      exchange:      "generic",
      exchangeLabel: "Generic",
      trades:        [],
      tradeCount:    0,
      skippedRows:   0,
      warnings:      ["Empty CSV file."],
    };
  }

  const headerMap = buildHeaderMap(rows[0]);
  const headers   = [...headerMap.keys()];

  console.log("[Aiensie] Generic parser — detected headers:", headers);

  // Verify minimum required columns exist
  const hasSymbol = SYMBOL_KEYS.some(k => headerMap.has(k));
  const hasSide   = SIDE_KEYS.some(k => headerMap.has(k));
  const hasPnl    = PNL_KEYS.some(k => headerMap.has(k));

  console.log("[Aiensie] Generic parser — required fields found:", { hasSymbol, hasSide, hasPnl });

  if (!hasSymbol || !hasSide || !hasPnl) {
    const missing: string[] = [];
    if (!hasSymbol) missing.push("symbol");
    if (!hasSide)   missing.push("side");
    if (!hasPnl)    missing.push("pnl");
    return {
      exchange:      "generic",
      exchangeLabel: "Generic",
      trades:        [],
      tradeCount:    0,
      skippedRows:   rows.length,
      warnings:      [`Missing required columns: ${missing.join(", ")}`],
    };
  }

  const warnings: string[] = [];
  let skipped = 0;
  const trades: Trade[] = [];

  // Build a running "last entry time" for generating exit times when absent
  let lastTime = new Date("2024-01-01T00:00:00Z");

  for (const row of rows) {
    try {
      const symbolRaw  = get(headerMap, row, SYMBOL_KEYS);
      const sideRaw    = get(headerMap, row, SIDE_KEYS);
      const pnlStr     = get(headerMap, row, PNL_KEYS);

      if (!symbolRaw || !sideRaw || !pnlStr) {
        skipped++;
        continue;
      }

      const pnl = num(pnlStr);

      // Times
      const entryStr   = get(headerMap, row, ENTRY_TIME_KEYS);
      const exitStr    = get(headerMap, row, EXIT_TIME_KEYS);

      let entryTime: Date;
      let exitTime: Date;

      if (entryStr) {
        entryTime = parseDate(entryStr);
        lastTime  = entryTime;
      } else {
        entryTime = lastTime;
      }

      if (exitStr) {
        exitTime = parseDate(exitStr);
      } else {
        // Auto-generate: entry + 1 hour
        exitTime = new Date(entryTime.getTime() + 60 * 60 * 1000);
      }

      // Prices & size
      const entryPrice   = num(get(headerMap, row, ENTRY_PRICE_KEYS)) || 1;
      const exitPrice    = num(get(headerMap, row, EXIT_PRICE_KEYS))  || 1;
      const positionSize = num(get(headerMap, row, SIZE_KEYS))        || 1;

      const side = parseSide(sideRaw);
      const symbol = symbolRaw.toUpperCase().replace(/\s+/g, "");

      trades.push({
        id:           `generic-${++idSeq}`,
        symbol,
        side,
        entryTime,
        exitTime,
        entryPrice,
        exitPrice,
        positionSize,
        pnl,
        platform:     "Generic",
        assetClass:   symbol.endsWith("USDT") || symbol.endsWith("BTC") || symbol.endsWith("ETH")
                        ? "crypto" : "other",
      });
    } catch {
      skipped++;
    }
  }

  console.log("[Aiensie] Generic parser — parsed trades:", trades.length, "skipped:", skipped);

  return {
    exchange:      "generic",
    exchangeLabel: "Generic",
    trades,
    tradeCount:    trades.length,
    skippedRows:   skipped,
    warnings,
  };
}
