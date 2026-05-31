import type { BehaviorSnapshot, AiensieReport } from "@workspace/aiensie-engine";

const STORAGE_KEY = "aiensie_report_history";

export function saveReportSnapshot(report: AiensieReport, exchange: string, tradeCount: number): void {
  try {
    const existing = loadSnapshots();
    const snapshot: BehaviorSnapshot = {
      id:           `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp:    Date.now(),
      aiensieScore: report.aiensieScore,
      scores:       report.scores,
      traderType:   report.traderType,
      topPatterns:  report.detectedPatterns.slice(0, 3).map((p) => p.name),
      exchange,
      tradeCount,
    };
    const updated = [...existing, snapshot].slice(-10);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage may be unavailable
  }
}

export function loadSnapshots(): BehaviorSnapshot[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as BehaviorSnapshot[]) : [];
  } catch {
    return [];
  }
}

// ── Delete snapshot by approximate timestamp ────────────────────────────────
// Removes the snapshot whose timestamp is closest to the given value,
// within a 10-second window. Called when a SavedReport is deleted so
// that Behavior Evolution history stays in sync.

export function deleteSnapshotNear(timestamp: number): void {
  try {
    const existing = loadSnapshots();
    const idx = existing.findIndex((s) => Math.abs(s.timestamp - timestamp) < 10_000);
    if (idx !== -1) {
      const updated = [...existing.slice(0, idx), ...existing.slice(idx + 1)];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  } catch {
    // localStorage may be unavailable
  }
}
