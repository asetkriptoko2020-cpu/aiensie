import { useState } from "react";
import type { MockReport } from "@/components/dashboard/mock-data";
import { MOCK_REPORTS } from "@/components/dashboard/mock-data";
import { loadSavedReports, savedReportToMockReport } from "@/lib/report-store";

// ── useReports ─────────────────────────────────────────────────────────────────
// Returns reports from localStorage when the user has uploaded real assessments,
// otherwise falls back to MOCK_REPORTS so the dashboard is never empty.
//
// Supabase migration path:
//   Replace the loadSavedReports() call below with a useSWR / React Query fetch
//   against your Supabase reports table. The MockReport shape and all dashboard
//   components remain unchanged.

function getInitialReports(): { reports: MockReport[]; isFromRealData: boolean } {
  const saved = loadSavedReports();
  if (saved.length > 0) {
    return { reports: saved.map(savedReportToMockReport), isFromRealData: true };
  }
  return { reports: MOCK_REPORTS, isFromRealData: false };
}

export function useReports(): { reports: MockReport[]; isFromRealData: boolean } {
  const [state] = useState(getInitialReports);
  return state;
}
