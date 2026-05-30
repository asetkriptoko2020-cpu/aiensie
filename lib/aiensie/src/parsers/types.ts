import type { Trade } from "../types.js";

export type ExchangeId = "binance" | "bybit" | "okx" | "hyperliquid" | "generic" | "unknown";

export interface ParseResult {
  exchange: ExchangeId;
  exchangeLabel: string;
  trades: Trade[];
  tradeCount: number;
  skippedRows: number;
  warnings: string[];
}

export type CsvRow = Record<string, string>;
export type ExchangeParser = (rows: CsvRow[]) => ParseResult;
