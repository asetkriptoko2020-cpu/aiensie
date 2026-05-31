import { useState, useEffect } from "react";
import type { MockReport } from "@/components/dashboard/mock-data";
import { MOCK_REPORTS } from "@/components/dashboard/mock-data";
import { loadSavedReports, savedReportToMockReport } from "@/lib/report-store";

// ── useReports ─────────────────────────────────────────────────────────────────
// Returns reports from localStorage when the user has uploaded real assessments,
// otherwise falls back to MOCK_REPORTS so the dashboard is never empty.
//
// Reactivity: listens to the "aiensie:reports-changed" custom event dispatched
// by report-store mutations (save, delete, replace) and re-reads localStorage.
//
// Supabase migration path:
//   Replace the loadSavedReports() call with a useSWR / React Query fetch
//   against your Supabase reports table. Subscribe to real-time events instead
//   of the custom DOM event. The MockReport shape and dashboard components stay unchanged.

function getReports(): { reports: MockReport[]; isFromRealData: boolean } {
  const saved = loadSavedReports();
  if (saved.length > 0) {
    return { reports: saved.map(savedReportToMockReport), isFromRealData: true };
  }
  return { reports: MOCK_REPORTS, isFromRealData: false };
}

export function useReports(): { reports: MockReport[]; isFromRealData: boolean } {
  const [state, setState] = useState(getReports);

  useEffect(() => {
    const refresh = () => setState(getReports());
    window.addEventListener("aiensie:reports-changed", refresh);
    return () => window.removeEventListener("aiensie:reports-changed", refresh);
  }, []);

  return state;
}
