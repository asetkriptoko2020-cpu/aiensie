---
name: Behavior memory storage
description: How Aiensie stores assessment history locally for the Behavior Evolution card.
---

Snapshots are saved to `localStorage` under key `aiensie_report_history` as a JSON array of `BehaviorSnapshot` objects (max 10, oldest dropped).

Utility functions `saveReportSnapshot()` and `loadSnapshots()` live in `artifacts/aiensie/src/lib/behavior-memory.ts` (NOT in the component file — see vite-fast-refresh.md).

`saveReportSnapshot()` is called in `assessment.tsx` immediately before `setPhase({ name: "complete" })`, so the snapshot is in localStorage when `BehaviorEvolutionCard` first renders.

**Why:** BehaviorEvolutionCard compares `snapshots[length - 2]` (previous) against the current report. If only 1 snapshot exists (first run), `prevSnapshot` is null and the card shows a "First assessment" empty state.
