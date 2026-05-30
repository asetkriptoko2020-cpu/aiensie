---
name: Smart alerts architecture
description: How Aiensie's dashboard Smart Alerts are generated dynamically rather than from a static array.
---

`artifacts/aiensie/src/lib/smart-alerts.ts` exports `generateSmartAlerts(reports: MockReport[])`.

It computes two layers:
1. **Mock report history alerts** — mines the MOCK_REPORTS progression (score delta, pattern resolution, pattern emergence, high-severity persistence, dimension improvements, multi-report emotional trend, session-based insight).
2. **Real snapshot alerts** — reads `localStorage` via `loadSnapshots()` and computes delta alerts from actual user uploads; these appear first.

The dashboard calls `generateSmartAlerts(filteredReports)` inside `DashboardOverview` and passes the result directly to the JSX (no static const).

**Why:** Static alerts were hardcoded and never reflected real data changes. Dynamic alerts respond to market filter state, pattern trajectory, and real user uploads.

**How to apply:** Whenever the MOCK_REPORTS array changes or a new alert type is needed, extend `computeFromMockReports` in `smart-alerts.ts`. Alert types: `improvement | warning | critical | insight`.
