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
  const scoreDelta = latest.aiensieScore - previous.aiensieScore;
  const totalDelta = latest.aiensieScore - oldest.aiensieScore;

  if (scoreDelta >= 8) {
    alerts.push({
      type:    "improvement",
      message: `Aiensie Score surged +${scoreDelta} points since your last assessment — a significant behavioral breakthrough. The discipline patterns that drove this improvement must be protected.`,
    });
  } else if (scoreDelta >= 4) {
    alerts.push({
      type:    "improvement",
      message: `Score trending upward (+${scoreDelta} pts). Behavioral execution is improving — your next leverage point is converting consistency into a permanent baseline shift.`,
    });
  } else if (scoreDelta >= 1) {
    alerts.push({
      type:    "insight",
      message: `Marginal improvement (+${scoreDelta} pts). Progress is directionally correct — the next assessment will reveal whether this is the start of a sustained behavioral shift.`,
    });
  } else if (scoreDelta <= -8) {
    alerts.push({
      type:    "critical",
      message: `Score declined sharply — ${Math.abs(scoreDelta)} points lost since last assessment. This is a behavioral regression, not a market problem. Review which dimensions collapsed and why.`,
    });
  } else if (scoreDelta <= -4) {
    alerts.push({
      type:    "warning",
      message: `Score regressed ${Math.abs(scoreDelta)} points. A clear behavioral deterioration has occurred. Identify the specific session or emotional trigger that drove the decline before your next upload.`,
    });
  } else if (scoreDelta <= -1) {
    alerts.push({
      type:    "warning",
      message: `Minor score regression (${Math.abs(scoreDelta)} pts). Monitor emotional control and sizing discipline closely — early regressions compound quickly if unaddressed.`,
    });
  }

  // ── Pattern resolutions ───────────────────────────────────────────────────
  const prevPatternNames   = previous.patterns.map((p) => p.name);
  const latestPatternNames = latest.patterns.map((p) => p.name);

  for (const p of prevPatternNames) {
    if (!latestPatternNames.includes(p)) {
      const verb =
        p === "Revenge Trading Risk"      ? "Revenge trading frequency has dropped to non-significant levels — the impulsive re-entry cycle is breaking down" :
        p === "Overtrading"               ? "Trade frequency is now controlled and selective — the overtrading pattern has been displaced by more patient execution" :
        p === "Holding Losses Too Long"   ? "Loss-holding behavior has largely resolved — exit discipline on losing positions is measurably improving" :
        p === "Overconfidence After Wins" ? "Post-win overconfidence has stabilized — position sizing is no longer inflating after winning streaks" :
        p === "Erratic Position Sizing"   ? "Position sizing consistency has improved materially — your risk framework is being applied more systematically" :
        `${p} pattern resolved`;
      alerts.push({
        type:    "improvement",
        message: `${verb}. This is a genuine behavioral improvement — not just noise.`,
      });
    }
  }

  // ── New patterns ──────────────────────────────────────────────────────────
  for (const p of latestPatternNames) {
    if (!prevPatternNames.includes(p)) {
      const verb =
        p === "Revenge Trading Risk"      ? "Revenge trading re-emerged this period — rapid re-entries after losses are increasing and compounding your drawdowns" :
        p === "Overtrading"               ? "Trade frequency escalated sharply — high-frequency sessions are degrading execution quality and suppressing your score" :
        p === "Holding Losses Too Long"   ? "Loss-holding bias resurfaced — exits are becoming slower and more emotionally driven on negative positions" :
        p === "Overconfidence After Wins" ? "Overconfidence pattern detected following recent winning streak — position sizing is expanding in response to equity highs" :
        p === "Erratic Position Sizing"   ? "Position sizing inconsistency has increased — emotional state is overriding your risk plan during high-pressure sessions" :
        `New behavioral pattern detected: ${p}`;
      alerts.push({
        type:    "warning",
        message: `${verb}. Address this before it compounds into your next session.`,
      });
    }
  }

  // ── High-severity pattern persistence ────────────────────────────────────
  for (const p of latest.patterns.filter((x) => x.severity === "high")) {
    if (prevPatternNames.includes(p.name)) {
      alerts.push({
        type:    "critical",
        message: `${p.name} remains at critical severity across 2+ consecutive assessments. This pattern is actively suppressing your score ceiling — it will not resolve without a deliberate behavioral intervention.`,
      });
    }
  }

  // ── Dimension improvements ────────────────────────────────────────────────
  const dimDelta = {
    discipline:         latest.scores.discipline         - previous.scores.discipline,
    riskControl:        latest.scores.riskControl        - previous.scores.riskControl,
    consistency:        latest.scores.consistency        - previous.scores.consistency,
    emotionalStability: latest.scores.emotionalStability - previous.scores.emotionalStability,
    decisionQuality:    latest.scores.decisionQuality    - previous.scores.decisionQuality,
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
      message: `${dimLabels[maxImproved[0]]} improved +${Math.round(maxImproved[1])} points — the fastest-moving dimension this period. Identify exactly what changed behaviorally and replicate it deliberately.`,
    });
  }
  if (maxDeclined[1] <= -6) {
    alerts.push({
      type:    "warning",
      message: `${dimLabels[maxDeclined[0]]} declined ${Math.round(Math.abs(maxDeclined[1]))} points this period. This dimension is now your primary behavioral bottleneck — targeted focus here has the highest score leverage.`,
    });
  }

  // ── Long-term trajectory ──────────────────────────────────────────────────
  if (reports.length >= 4 && totalDelta >= 15) {
    alerts.push({
      type:    "insight",
      message: `Score improved +${totalDelta} points across ${reports.length} assessments — a rare and meaningful trajectory. Sustained behavioral change at this rate puts you in the top tier of Aiensie users.`,
    });
  }

  // ── Emotional stability multi-report trend ────────────────────────────────
  if (reports.length >= 3) {
    const recentThree     = reports.slice(-3);
    const emotionalScores = recentThree.map((r) => r.scores.emotionalStability);
    const allImproving    = emotionalScores.every((s, i) => i === 0 || s >= emotionalScores[i - 1]);
    const allDeclining    = emotionalScores.every((s, i) => i === 0 || s <= emotionalScores[i - 1]);

    if (allImproving && emotionalScores[emotionalScores.length - 1] - emotionalScores[0] >= 8) {
      alerts.push({
        type:    "improvement",
        message: `Your last 3 uploads show improving emotional discipline — a consistent upward trend across consecutive assessments. The psychological foundation is stabilizing. Protect it.`,
      });
    } else if (allDeclining) {
      alerts.push({
        type:    "warning",
        message: `Emotional stability has declined across 3 consecutive assessments. Something in your trading environment or routine is increasing psychological pressure. This pattern requires deliberate intervention.`,
      });
    }
  }

  // ── Late-night session insight ────────────────────────────────────────────
  const latestAsset = latest.assetClass?.toLowerCase();
  if (latestAsset === "crypto") {
    if (latest.scores.emotionalStability < 60) {
      alerts.push({
        type:    "insight",
        message: `Late-night execution quality continues to decline — your data shows that crypto sessions after 10pm are statistically your worst-performing emotional windows. A strict session cutoff here has measurable score impact.`,
      });
    } else {
      alerts.push({
        type:    "insight",
        message: `Your structured approach is holding up through high-volatility crypto sessions. Trade patience improved significantly in your recent window — this is your edge manifesting.`,
      });
    }
  }

  // ── Win rate vs profitability discrepancy ─────────────────────────────────
  if (latest.winRate < 0.44 && latest.profitFactor > 1.4) {
    alerts.push({
      type:    "insight",
      message: `You're winning less than 44% of trades but maintaining a profit factor above 1.4 — your edge is real but behavioral. Emotional exits are likely cutting winners short and keeping you below your potential.`,
    });
  }

  return alerts.slice(0, 6);
}

// ── Compute from real snapshot history ────────────────────────────────────────

function computeFromSnapshots(snapshots: BehaviorSnapshot[]): SmartAlert[] {
  if (snapshots.length < 2) return [];

  const alerts: SmartAlert[] = [];
  const latest   = snapshots[snapshots.length - 1];
  const previous = snapshots[snapshots.length - 2];

  const scoreDelta = latest.aiensieScore - previous.aiensieScore;

  if (scoreDelta >= 6) {
    alerts.push({
      type:    "improvement",
      message: `Your last upload improved +${scoreDelta} points over the previous real assessment — a meaningful behavioral shift confirmed across consecutive data sets.`,
    });
  } else if (scoreDelta >= 2) {
    alerts.push({
      type:    "improvement",
      message: `Progressive improvement (+${scoreDelta} pts) confirmed across your real upload history. The behavioral trajectory is directionally correct.`,
    });
  } else if (scoreDelta <= -6) {
    alerts.push({
      type:    "critical",
      message: `Your last real upload declined ${Math.abs(scoreDelta)} points — a significant behavioral regression confirmed in your actual trade data. Review what changed between sessions.`,
    });
  } else if (scoreDelta <= -2) {
    alerts.push({
      type:    "warning",
      message: `Real data shows a ${Math.abs(scoreDelta)}-point decline across your last two uploads. Monitor emotional control and position sizing discipline closely.`,
    });
  }

  // ── Pattern resolution across real uploads ────────────────────────────────
  const prevPatterns   = previous.topPatterns;
  const latestPatterns = latest.topPatterns;

  for (const p of prevPatterns) {
    if (!latestPatterns.includes(p)) {
      alerts.push({
        type:    "improvement",
        message: `${p} resolved in your latest real upload — a genuine behavioral improvement confirmed by your actual trade data, not estimates.`,
      });
    }
  }

  for (const p of latestPatterns) {
    if (!prevPatterns.includes(p)) {
      alerts.push({
        type:    "warning",
        message: `New pattern in your latest upload: ${p}. This emerged in real trade data — not a mock signal. Address it before your next session.`,
      });
    }
  }

  // ── Multi-upload progression ───────────────────────────────────────────────
  if (snapshots.length >= 3) {
    const recentThree = snapshots.slice(-3);
    const scores      = recentThree.map((s) => s.aiensieScore);
    const allUp       = scores.every((s, i) => i === 0 || s >= scores[i - 1]);

    if (allUp && scores[scores.length - 1] - scores[0] >= 10) {
      alerts.push({
        type:    "improvement",
        message: `Your last 3 real uploads show consistent score improvement — an upward trajectory confirmed across your actual trading history. This is rare and significant.`,
      });
    }
  }

  return alerts.slice(0, 3);
}

// ── Main export ───────────────────────────────────────────────────────────────

export function generateSmartAlerts(reports: MockReport[]): SmartAlert[] {
  const mockAlerts     = computeFromMockReports(reports);
  const snapshots      = loadSnapshots();
  const snapshotAlerts = computeFromSnapshots(snapshots);

  // Real snapshot insights first, then mock report analysis
  return [...snapshotAlerts, ...mockAlerts].slice(0, 7);
}
