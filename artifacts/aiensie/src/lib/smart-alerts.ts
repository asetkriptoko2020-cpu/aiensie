import type { MockReport } from "@/components/dashboard/mock-data";
import type { BehaviorSnapshot } from "@workspace/aiensie-engine";
import { loadSnapshots } from "@/lib/behavior-memory";

// ── Types ─────────────────────────────────────────────────────────────────────

export type AlertType = "improvement" | "warning" | "critical" | "insight";

export interface SmartAlert {
  type:    AlertType;
  message: string;
}

// ── Compute from mock report history ─────────────────────────────────────────

function computeFromMockReports(reports: MockReport[]): SmartAlert[] {
  if (reports.length < 2) return [];

  const alerts: SmartAlert[] = [];
  const latest   = reports[reports.length - 1];
  const previous = reports[reports.length - 2];
  const oldest   = reports[0];

  // ── Score trajectory ──────────────────────────────────────────────────────
  const scoreDelta  = latest.aiensieScore - previous.aiensieScore;
  const totalDelta  = latest.aiensieScore - oldest.aiensieScore;

  if (scoreDelta >= 6) {
    alerts.push({
      type:    "improvement",
      message: `Aiensie Score jumped +${scoreDelta} points since your last assessment. Behavioral execution is improving meaningfully.`,
    });
  } else if (scoreDelta >= 2) {
    alerts.push({
      type:    "improvement",
      message: `Score is trending upward (+${scoreDelta} pts). Consistency is the next lever — protect what's working.`,
    });
  } else if (scoreDelta <= -5) {
    alerts.push({
      type:    "warning",
      message: `Score declined ${Math.abs(scoreDelta)} points from your last assessment. Review which behavioral dimensions shifted.`,
    });
  } else if (scoreDelta <= -2) {
    alerts.push({
      type:    "warning",
      message: `Minor score regression detected. Pay close attention to emotional control and sizing consistency this week.`,
    });
  }

  // ── Pattern resolutions ───────────────────────────────────────────────────
  const prevPatternNames = previous.patterns.map((p) => p.name);
  const latestPatternNames = latest.patterns.map((p) => p.name);

  for (const p of prevPatternNames) {
    if (!latestPatternNames.includes(p)) {
      const verb =
        p === "Revenge Trading Risk"       ? "Revenge trading frequency has dropped significantly" :
        p === "Overtrading"                ? "Trade frequency has become more selective and controlled" :
        p === "Holding Losses Too Long"    ? "Loss-holding behavior has largely resolved" :
        p === "Overconfidence After Wins"  ? "Post-win overconfidence has stabilised" :
        p === "Erratic Position Sizing"    ? "Position sizing consistency has meaningfully improved" :
        `${p} pattern resolved`;
      alerts.push({ type: "improvement", message: `${verb} — no longer detected at significant levels.` });
    }
  }

  // ── New patterns ──────────────────────────────────────────────────────────
  for (const p of latestPatternNames) {
    if (!prevPatternNames.includes(p)) {
      const verb =
        p === "Revenge Trading Risk"       ? "Revenge trading re-emerged this period — re-entry after losses is increasing" :
        p === "Overtrading"                ? "Trade frequency escalated significantly this period" :
        p === "Holding Losses Too Long"    ? "Loss-holding bias resurfaced — exits are becoming slower on losing trades" :
        p === "Overconfidence After Wins"  ? "Overconfidence pattern detected following winning streak" :
        p === "Erratic Position Sizing"    ? "Position sizing inconsistency has increased this period" :
        `New pattern detected: ${p}`;
      alerts.push({ type: "warning", message: `${verb}. Address before it compounds.` });
    }
  }

  // ── High-severity pattern persistence ────────────────────────────────────
  for (const p of latest.patterns.filter((x) => x.severity === "high")) {
    if (prevPatternNames.includes(p.name)) {
      alerts.push({
        type:    "critical",
        message: `${p.name} remains at high severity for 2+ consecutive assessments. This pattern is actively suppressing your score ceiling.`,
      });
    }
  }

  // ── Dimension improvements ────────────────────────────────────────────────
  const dimDelta = {
    discipline:        latest.scores.discipline        - previous.scores.discipline,
    riskControl:       latest.scores.riskControl       - previous.scores.riskControl,
    consistency:       latest.scores.consistency       - previous.scores.consistency,
    emotionalStability: latest.scores.emotionalStability - previous.scores.emotionalStability,
    decisionQuality:   latest.scores.decisionQuality   - previous.scores.decisionQuality,
  };

  const maxImproved = Object.entries(dimDelta).sort((a, b) => b[1] - a[1])[0];
  const maxDeclined = Object.entries(dimDelta).sort((a, b) => a[1] - b[1])[0];

  const dimLabels: Record<string, string> = {
    discipline:         "Discipline",
    riskControl:        "Risk Control",
    consistency:        "Consistency",
    emotionalStability: "Emotional Stability",
    decisionQuality:    "Decision Quality",
  };

  if (maxImproved[1] >= 8) {
    alerts.push({
      type:    "improvement",
      message: `${dimLabels[maxImproved[0]]} improved by +${Math.round(maxImproved[1])} points — the fastest-moving dimension in your latest assessment.`,
    });
  }
  if (maxDeclined[1] <= -6) {
    alerts.push({
      type:    "warning",
      message: `${dimLabels[maxDeclined[0]]} declined by ${Math.round(maxDeclined[1])} points this period. Identify the specific behavior shift causing this regression.`,
    });
  }

  // ── Long-term trajectory ──────────────────────────────────────────────────
  if (reports.length >= 4 && totalDelta >= 15) {
    alerts.push({
      type:    "insight",
      message: `Score improved +${totalDelta} points across ${reports.length} assessments. This is a meaningful trajectory — sustained behavioral change at this rate is rare.`,
    });
  }

  // ── Emotional stability trend (multi-report) ──────────────────────────────
  if (reports.length >= 3) {
    const recentThree = reports.slice(-3);
    const emotionalScores = recentThree.map((r) => r.scores.emotionalStability);
    const allImproving = emotionalScores.every((s, i) => i === 0 || s >= emotionalScores[i - 1]);
    const allDeclining = emotionalScores.every((s, i) => i === 0 || s <= emotionalScores[i - 1]);

    if (allImproving && emotionalScores[emotionalScores.length - 1] - emotionalScores[0] >= 8) {
      alerts.push({
        type:    "improvement",
        message: `Emotional stability has improved consistently across your last 3 assessments. The behavioral foundation is becoming more resilient.`,
      });
    } else if (allDeclining) {
      alerts.push({
        type:    "warning",
        message: `Emotional stability has declined across 3 consecutive assessments. Something in your trading environment is increasing psychological pressure.`,
      });
    }
  }

  // ── Session-based insight ─────────────────────────────────────────────────
  const latestAsset = latest.assetClass?.toLowerCase();
  if (latestAsset === "crypto") {
    if (latest.scores.emotionalStability < 62) {
      alerts.push({
        type:    "insight",
        message: `Late-night and early-morning crypto sessions are statistically associated with your weakest emotional control readings. Apply a strict session cutoff.`,
      });
    } else {
      alerts.push({
        type:    "insight",
        message: `Crypto market structure favors your behavioral profile when session windows are defined. Maintain your structured approach through high-volatility periods.`,
      });
    }
  }

  return alerts.slice(0, 6);
}

// ── Compute from localStorage snapshots (real report history) ─────────────────

function computeFromSnapshots(snapshots: BehaviorSnapshot[]): SmartAlert[] {
  if (snapshots.length < 2) return [];

  const alerts: SmartAlert[] = [];
  const latest   = snapshots[snapshots.length - 1];
  const previous = snapshots[snapshots.length - 2];

  const scoreDelta = latest.aiensieScore - previous.aiensieScore;

  if (scoreDelta >= 5) {
    alerts.push({ type: "improvement", message: `Your last real assessment improved +${scoreDelta} points over your previous upload — behavioral execution is moving in the right direction.` });
  } else if (scoreDelta <= -5) {
    alerts.push({ type: "warning", message: `Your last real assessment declined ${Math.abs(scoreDelta)} points. Review which patterns changed between uploads.` });
  }

  // Pattern resolution across real uploads
  const prevPatterns = previous.topPatterns;
  const latestPatterns = latest.topPatterns;

  for (const p of prevPatterns) {
    if (!latestPatterns.includes(p)) {
      alerts.push({ type: "improvement", message: `Real data: ${p} resolved since your previous upload — a genuine behavioral improvement.` });
    }
  }

  for (const p of latestPatterns) {
    if (!prevPatterns.includes(p)) {
      alerts.push({ type: "warning", message: `Real data: New pattern detected in your latest upload — ${p}. Monitor closely.` });
    }
  }

  return alerts.slice(0, 2);
}

// ── Main export ───────────────────────────────────────────────────────────────

export function generateSmartAlerts(reports: MockReport[]): SmartAlert[] {
  const mockAlerts     = computeFromMockReports(reports);
  const snapshots      = loadSnapshots();
  const snapshotAlerts = computeFromSnapshots(snapshots);

  // Merge: real snapshot insights come first, then mock report analysis
  const combined = [...snapshotAlerts, ...mockAlerts];

  // Deduplicate by type — cap at 6 total
  return combined.slice(0, 6);
}
