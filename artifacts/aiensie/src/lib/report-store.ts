import type { AiensieReport } from "@workspace/aiensie-engine";
import type { MockReport } from "@/components/dashboard/mock-data";
import { deleteSnapshotNear } from "@/lib/behavior-memory";

// ── Storage key ────────────────────────────────────────────────────────────────
// Replace this constant's read/write calls with Supabase queries when adding a backend.

export const REPORTS_STORAGE_KEY = "aiensie_saved_reports";

// ── Duplicate types ────────────────────────────────────────────────────────────

export type DuplicateTag = "duplicate-upload" | "re-uploaded-session" | "updated-report";

export interface DuplicateMatch {
  id:         string;
  similarity: number; // 0–100
  exchange:   string;
  tradeCount: number;
  timestamp:  number;
  score:      number;
}

// ── SavedReport type ───────────────────────────────────────────────────────────

export interface SavedReport {
  id:         string;
  timestamp:  number;
  exchange:   string;
  tradeCount: number;
  assetClass: string;
  report:     AiensieReport;
  tag?:       DuplicateTag;
}

// ── Reactivity event ──────────────────────────────────────────────────────────
// Dispatch so useReports() re-reads localStorage after any mutation.
// Supabase migration: replace with real-time subscription events.

function dispatchChanged(): void {
  try { window.dispatchEvent(new Event("aiensie:reports-changed")); } catch { /* SSR */ }
}

// ── Asset class normaliser ─────────────────────────────────────────────────────

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

// ── Write ──────────────────────────────────────────────────────────────────────

export function saveFullReport(
  report:     AiensieReport,
  exchange:   string,
  tradeCount: number,
  tag?:       DuplicateTag,
): SavedReport {
  const assetClass = normalizeAssetClass(report);
  const saved: SavedReport = {
    id:         `sr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp:  Date.now(),
    exchange,
    tradeCount,
    assetClass,
    report,
    tag,
  };
  try {
    const existing = loadSavedReports();
    const updated  = [...existing, saved].slice(-20);
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(updated));
    dispatchChanged();
  } catch { /* localStorage unavailable */ }
  return saved;
}

// ── Delete ─────────────────────────────────────────────────────────────────────

export function deleteReport(id: string): void {
  try {
    const reports = loadSavedReports();
    const target  = reports.find((r) => r.id === id);
    const updated = reports.filter((r) => r.id !== id);
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(updated));
    if (target) deleteSnapshotNear(target.timestamp);
    dispatchChanged();
  } catch { /* localStorage unavailable */ }
}

// ── Replace (same ID, updated content) ────────────────────────────────────────

export function replaceReport(
  oldId:      string,
  report:     AiensieReport,
  exchange:   string,
  tradeCount: number,
  tag?:       DuplicateTag,
): SavedReport {
  const assetClass = normalizeAssetClass(report);
  const newSaved: SavedReport = {
    id:        oldId,
    timestamp: Date.now(),
    exchange,
    tradeCount,
    assetClass,
    report,
    tag,
  };
  try {
    const updated = loadSavedReports().map((r) => (r.id === oldId ? newSaved : r));
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(updated));
    dispatchChanged();
  } catch { /* localStorage unavailable */ }
  return newSaved;
}

// ── Duplicate detection ────────────────────────────────────────────────────────
// Compares a candidate upload (trade count + exchange) against stored reports.
// Returns the best match if similarity >= 60, otherwise null.
//
// Supabase migration: replace localStorage scan with a query against the
// reports table using WHERE exchange = ? and trade_count BETWEEN ? AND ?.

export function detectDuplicateReport(
  tradeCount: number,
  exchange:   string,
): DuplicateMatch | null {
  const existing = loadSavedReports();
  let best: DuplicateMatch | null = null;

  for (const saved of existing) {
    let sim = 0;

    // Trade count proximity
    const tcRatio = Math.abs(saved.tradeCount - tradeCount) / Math.max(tradeCount, 1);
    if (tcRatio <= 0.05)      sim += 40;
    else if (tcRatio <= 0.12) sim += 20;

    // Exchange match (case-insensitive)
    if (saved.exchange.toLowerCase() === exchange.toLowerCase()) sim += 40;
    else if (saved.exchange.toLowerCase().includes(exchange.toLowerCase()) ||
             exchange.toLowerCase().includes(saved.exchange.toLowerCase())) sim += 20;

    // Recency boost — same file uploaded within 24h
    const ageMs = Date.now() - saved.timestamp;
    if (ageMs < 24 * 60 * 60 * 1000) sim += 10;

    if (sim >= 60 && (!best || sim > best.similarity)) {
      best = {
        id:         saved.id,
        similarity: Math.min(sim, 100),
        exchange:   saved.exchange,
        tradeCount: saved.tradeCount,
        timestamp:  saved.timestamp,
        score:      saved.report.aiensieScore,
      };
    }
  }

  return best;
}

// ── Shape adapter ──────────────────────────────────────────────────────────────
// Maps a SavedReport → MockReport so all existing dashboard UI renders unchanged.
// When swapping localStorage for Supabase, only this function needs updating.

export function savedReportToMockReport(saved: SavedReport): MockReport {
  const { report, exchange, tradeCount, assetClass, timestamp, id, tag } = saved;
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
    tag,
  };
}
