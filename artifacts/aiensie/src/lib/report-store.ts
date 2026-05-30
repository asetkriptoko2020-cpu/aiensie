import type { AiensieReport } from "@workspace/aiensie-engine";
import type { MockReport } from "@/components/dashboard/mock-data";

// ── Storage key ────────────────────────────────────────────────────────────────
// Replace this constant's read/write calls with Supabase queries when adding a backend.

export const REPORTS_STORAGE_KEY = "aiensie_saved_reports";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface SavedReport {
  id:         string;
  timestamp:  number;
  exchange:   string;
  tradeCount: number;
  assetClass: string;
  report:     AiensieReport;
}

// ── Asset class normaliser ──────────────────────────────────────────────────────
// Maps the engine's CrossMarketIntelligence.assetClass display label
// (e.g. "Forex / FX") to the short filter string used in the dashboard
// (e.g. "Forex").  "Unknown" is used instead of "Crypto" for unrecognised data.

const DISPLAY_TO_FILTER: Record<string, string> = {
  "Crypto / Digital Assets": "Crypto",
  "Equities / Stocks":       "Stocks",
  "Forex / FX":              "Forex",
  "Options":                 "Options",
  "Futures":                 "Futures",
  "Other Markets":           "Unknown",
};

function normalizeAssetClass(report: AiensieReport): string {
  const displayLabel = report.crossMarketIntelligence?.assetClass ?? "";
  return DISPLAY_TO_FILTER[displayLabel] ?? "Unknown";
}

// ── Write ──────────────────────────────────────────────────────────────────────

export function saveFullReport(
  report:     AiensieReport,
  exchange:   string,
  tradeCount: number,
): SavedReport {
  const assetClass = normalizeAssetClass(report);
  const saved: SavedReport = {
    id:         `sr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp:  Date.now(),
    exchange,
    tradeCount,
    assetClass,
    report,
  };
  try {
    const existing = loadSavedReports();
    const updated  = [...existing, saved].slice(-20);
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage may be unavailable (private browsing, storage quota)
  }
  return saved;
}

// ── Read ───────────────────────────────────────────────────────────────────────

export function loadSavedReports(): SavedReport[] {
  try {
    const raw = localStorage.getItem(REPORTS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedReport[]) : [];
  } catch {
    return [];
  }
}

export function getSavedReportById(id: string): SavedReport | null {
  return loadSavedReports().find((r) => r.id === id) ?? null;
}

// ── Shape adapter ──────────────────────────────────────────────────────────────
// Maps a SavedReport → MockReport so all existing dashboard UI renders unchanged.
// When swapping localStorage for Supabase, only this function needs a DB schema
// that stores these same fields — the dashboard components remain untouched.

export function savedReportToMockReport(saved: SavedReport): MockReport {
  const { report, exchange, tradeCount, assetClass, timestamp, id } = saved;
  return {
    id,
    date:         new Date(timestamp).toISOString().slice(0, 10),
    exchange,
    assetClass,
    tradeCount,
    aiensieScore: report.aiensieScore,
    label:        report.label,
    traderType:   report.traderType,
    mainWeakness: report.weaknesses[0]          ?? report.detectedPatterns[0]?.name ?? "No major weaknesses detected",
    mainStrength: report.strengths[0]           ?? "Solid trading foundation",
    scores: {
      discipline:         report.scores.disciplineScore,
      riskControl:        report.scores.riskControlScore,
      consistency:        report.scores.consistencyScore,
      emotionalStability: report.scores.emotionalStabilityScore,
      decisionQuality:    report.scores.decisionQualityScore,
    },
    patterns:     report.detectedPatterns.map((p) => ({ name: p.name, severity: p.severity })),
    actionPlan:   report.actionPlan,
    winRate:      report.metrics.winRate,
    avgWin:       report.metrics.averageWin,
    avgLoss:      report.metrics.averageLoss,
    profitFactor: report.metrics.profitFactor,
    maxLossStreak:report.metrics.maxConsecutiveLosses,
    persona:      report.persona ?? report.dynamicPersona.summary,
  };
}
