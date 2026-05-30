---
name: Vite Fast Refresh constraint
description: React component files must only export React components — exporting utility functions alongside components breaks HMR Fast Refresh.
---

Vite's React Fast Refresh plugin only works correctly when a file exclusively exports React components. If a file exports both a component AND a non-component function (e.g. `saveReportSnapshot`), Vite logs "Could not Fast Refresh (export is incompatible)" and falls back to a full reload.

**Why:** The Fast Refresh runtime patches individual components in place. Non-component exports confuse the detection heuristic.

**How to apply:** Whenever a component file needs to export utility functions (e.g. localStorage helpers, formatters), extract those utilities into a separate `.ts` file (not `.tsx`) in `src/lib/`. Import from there in both the component and any callers.
