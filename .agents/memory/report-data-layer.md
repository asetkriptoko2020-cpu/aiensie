---
name: Report data layer
description: How full assessment reports are stored and read across the dashboard — localStorage now, Supabase-ready.
---

## Rule
All dashboard pages must read reports via `useReports()` from `artifacts/aiensie/src/lib/use-reports.ts`, never directly from `MOCK_REPORTS`.

**Why:** This was the migration from 100% mock data to a localStorage-backed flow. The hook returns real saved reports when present, and falls back to `MOCK_REPORTS` when the user has no history yet. The fallback is intentional — it keeps the dashboard populated on first visit.

## Storage
- Key: `aiensie_saved_reports` (full `SavedReport[]`, up to 20)
- File: `artifacts/aiensie/src/lib/report-store.ts`
- Types: `SavedReport` wraps the full `AiensieReport` + metadata (id, timestamp, exchange, tradeCount, assetClass)

## Shape adapter
`savedReportToMockReport(saved)` maps `SavedReport → MockReport` so all existing dashboard UI renders unchanged. This is the only layer that needs to change when swapping to Supabase.

## Supabase migration path
Replace `loadSavedReports()` inside `use-reports.ts` with a React Query / useSWR fetch against the Supabase reports table. The `MockReport` shape and all dashboard components stay untouched.

## Assessment page
After a report is generated, both `saveReportSnapshot` (behavior-memory.ts) and `saveFullReport` (report-store.ts) are called. When launched `?from=dashboard`, a "← View in Dashboard" button appears after completion and links to `/dashboard/reports`.
