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
