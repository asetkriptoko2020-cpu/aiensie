/**
 * Symbol-level and column-level asset class classifier.
 * Used by parseGeneric and detectAssetClass to correctly identify Forex,
 * Indonesian stocks, crypto, options, and futures from CSV data.
 */

import type { AssetClass } from "../types.js";
import type { CsvRow } from "./types.js";

// ── Forex symbols ─────────────────────────────────────────────────────────────

const FOREX_CURRENCIES = ["EUR", "GBP", "USD", "AUD", "NZD", "CAD", "CHF", "JPY", "SGD", "HKD", "NOK", "SEK", "DKK", "MXN", "ZAR", "TRY", "PLN", "CZK"];
const METAL_PREFIXES   = ["XAU", "XAG", "XPT", "XPD"];

export function isForexSymbol(sym: string): boolean {
  const s = sym.toUpperCase().replace(/[^A-Z]/g, "");
  // 6-char: standard pairs like EURUSD, GBPJPY, USDJPY, XAUUSD
  if (s.length === 6) {
    const base  = s.slice(0, 3);
    const quote = s.slice(3, 6);
    if (FOREX_CURRENCIES.includes(base) && FOREX_CURRENCIES.includes(quote)) return true;
    if (METAL_PREFIXES.includes(base)   && FOREX_CURRENCIES.includes(quote)) return true;
  }
  // 7-char: broker suffix variants like "EURUSDm", "EURUSD."
  if (s.length === 7) {
    const base  = s.slice(0, 3);
    const quote = s.slice(3, 6);
    if (FOREX_CURRENCIES.includes(base) && FOREX_CURRENCIES.includes(quote)) return true;
    if (METAL_PREFIXES.includes(base)   && FOREX_CURRENCIES.includes(quote)) return true;
  }
  return false;
}

// ── Crypto symbols ────────────────────────────────────────────────────────────

const CRYPTO_QUOTE_SUFFIXES = ["USDT", "USDC", "BUSD", "TUSD", "DAI", "BTC", "ETH", "BNB", "SOL", "XRP", "PERP"];

export function isCryptoSymbol(sym: string): boolean {
  const s = sym.toUpperCase().replace(/[-/]/g, "");
  return CRYPTO_QUOTE_SUFFIXES.some((q) => s.endsWith(q));
}

// ── Indonesian stock symbols (IDX: 4 uppercase letters) ──────────────────────

const KNOWN_IDX_TICKERS = new Set([
  "BBCA","BBRI","BMRI","TLKM","ASII","GOTO","AMMN","UNVR","HMSP","KLBF",
  "TPIA","ICBP","MAPI","AKRA","TOWR","ADRO","ITMG","PTBA","EXCL","BRIS",
  "ANTM","INCO","MDKA","HRUM","BYAN","PGAS","JSMR","WIKA","SMGR","INTP",
  "CPIN","JPFA","MYOR","SIDO","KAEF","MNCN","SCMA","EMTK","EMTK","ACES",
  "ERAA","LPPF","RALS","SIDO","ULTJ","GOOD","HOKI","SRTG","BFIN",
]);

export function isIndonesianStock(sym: string): boolean {
  const s = sym.toUpperCase().trim().replace(/[^A-Z]/g, "");
  if (KNOWN_IDX_TICKERS.has(s)) return true;
  // IDX tickers are exactly 4 uppercase letters
  if (/^[A-Z]{4}$/.test(s)) return true;
  return false;
}

// ── Column-based classification (reads explicit asset class columns) ───────────

export const ASSET_CLASS_COLUMN_KEYS = [
  "asset_class", "asset class", "assetclass",
  "instrument type", "product type", "asset type",
];

const ASSET_CLASS_VALUE_MAP: Record<string, AssetClass> = {
  forex: "forex", fx: "forex", "foreign exchange": "forex",
  currency: "forex", currencies: "forex", "currency pair": "forex",
  stock: "equities", stocks: "equities", equity: "equities", equities: "equities",
  shares: "equities", share: "equities", saham: "equities",
  crypto: "crypto", cryptocurrency: "crypto", digital: "crypto",
  token: "crypto", coin: "crypto",
  option: "options", options: "options",
  future: "futures", futures: "futures",
  etf: "equities", fund: "equities",
};

export function classifyFromColumns(
  row: CsvRow,
  headerMap: Map<string, string>,
): AssetClass | null {
  for (const key of ASSET_CLASS_COLUMN_KEYS) {
    const origKey = headerMap.get(key);
    if (origKey) {
      const val = (row[origKey] ?? "").toLowerCase().trim();
      if (!val) continue;
      const exact = ASSET_CLASS_VALUE_MAP[val];
      if (exact) return exact;
      if (val.includes("forex") || val.includes("fx") || val.includes("currency")) return "forex";
      if (val.includes("stock") || val.includes("equity") || val.includes("share") || val.includes("saham")) return "equities";
      if (val.includes("crypto")) return "crypto";
      if (val.includes("option")) return "options";
      if (val.includes("future")) return "futures";
    }
  }
  return null;
}

// ── Market column classification ──────────────────────────────────────────────

export function classifyFromMarketColumn(
  row: CsvRow,
  headerMap: Map<string, string>,
): AssetClass | null {
  const key = headerMap.get("market");
  if (!key) return null;
  const val = (row[key] ?? "").toLowerCase().trim();
  if (!val) return null;
  if (val.includes("indonesia") || val.includes("idx") || val.includes("bursa")) return "equities";
  if (val.includes("forex") || val.includes("fx") || val.includes("currency")) return "forex";
  if (val.includes("crypto") || val.includes("digital")) return "crypto";
  if (val.includes("option")) return "options";
  if (val.includes("future")) return "futures";
  if (val.includes("stock") || val.includes("equity") || val.includes("saham")) return "equities";
  return null;
}

// ── Header-level structural classification ────────────────────────────────────

export function classifyFromHeaders(headerMap: Map<string, string>): AssetClass | null {
  const keys = [...headerMap.keys()];
  const has  = (...terms: string[]) => terms.every((t) => keys.some((k) => k.includes(t)));
  const any  = (...terms: string[]) => terms.some((t) => keys.some((k) => k.includes(t)));

  // Indonesian stock CSV signals: Stock Code, Stock Name, Company + Broker
  if (any("stock code", "stock name", "kode saham")) return "equities";
  if (has("company") && any("broker", "stock")) return "equities";
  if (any("emiten")) return "equities";

  // MetaTrader / forex broker signals: Ticket + Volume + (Open Price | Profit)
  if (any("ticket") && any("volume") && any("profit")) return "forex";

  return null;
}

// ── Primary symbol classifier ─────────────────────────────────────────────────

export function classifySymbol(sym: string): AssetClass | null {
  const s = sym.toUpperCase().replace(/\s+/g, "");
  if (isCryptoSymbol(s))    return "crypto";
  if (isForexSymbol(s))     return "forex";
  if (isIndonesianStock(s)) return "equities";
  return null;
}

// ── Majority-vote over an array of trades ─────────────────────────────────────

export function majorityAssetClass(
  assetClasses: Array<AssetClass | null | undefined>,
): AssetClass | null {
  const counts: Partial<Record<AssetClass, number>> = {};
  for (const c of assetClasses) {
    if (c && c !== "other") {
      counts[c] = (counts[c] ?? 0) + 1;
    }
  }
  let best: AssetClass | null = null;
  let max = 0;
  for (const [cls, count] of Object.entries(counts) as [AssetClass, number][]) {
    if (count > max) { max = count; best = cls; }
  }
  return best;
}

// ── Display label → dashboard filter string ───────────────────────────────────
// Maps CrossMarketIntelligence.assetClass display labels → MarketFilter values.

const DISPLAY_TO_FILTER: Record<string, string> = {
  "Crypto / Digital Assets": "Crypto",
  "Equities / Stocks":       "Stocks",
  "Forex / FX":              "Forex",
  "Options":                 "Options",
  "Futures":                 "Futures",
  "Other Markets":           "Unknown",
};

export function assetClassDisplayToFilter(displayLabel: string): string {
  return DISPLAY_TO_FILTER[displayLabel] ?? "Unknown";
}
