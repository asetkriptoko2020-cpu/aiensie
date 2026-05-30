import { useRef, useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Minus, GitCompare, Upload } from "lucide-react";
import { Link } from "wouter";
import type { BehaviorSnapshot, AiensieReport } from "@workspace/aiensie-engine";
import { loadSnapshots } from "@/lib/behavior-memory";

// ── Dimension label map ───────────────────────────────────────────────────────

const DIM_LABELS: Record<string, string> = {
  disciplineScore:         "Discipline",
  riskControlScore:        "Risk Control",
  consistencyScore:        "Consistency",
  emotionalStabilityScore: "Emotional Stability",
  decisionQualityScore:    "Decision Quality",
};

// ── Compute evolution deltas ──────────────────────────────────────────────────

interface EvolutionData {
  scoreDelta:       number;
  dimDeltas:        Array<{ key: string; label: string; prev: number; curr: number; delta: number }>;
  prevSnapshot:     BehaviorSnapshot;
  newPatterns:      string[];
  resolvedPatterns: string[];
}

function computeEvolution(current: AiensieReport, prev: BehaviorSnapshot): EvolutionData {
  const scoreDelta = current.aiensieScore - prev.aiensieScore;

  const dimDeltas = Object.entries(DIM_LABELS).map(([key, label]) => {
    const curr = current.scores[key as keyof typeof current.scores];
    const p    = prev.scores[key as keyof typeof prev.scores];
    return { key, label, prev: p, curr, delta: curr - p };
  });

  const currentPatterns = current.detectedPatterns.map((p) => p.name);
  const newPatterns      = currentPatterns.filter((n) => !prev.topPatterns.includes(n));
  const resolvedPatterns = prev.topPatterns.filter((n) => !currentPatterns.includes(n));

  return { scoreDelta, dimDeltas, prevSnapshot: prev, newPatterns, resolvedPatterns };
}

// ── Delta pill ────────────────────────────────────────────────────────────────

function DeltaPill({ delta }: { delta: number }) {
  const abs = Math.abs(delta);
  if (abs < 1) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/6 border border-white/10 text-muted-foreground">
        <Minus className="w-2.5 h-2.5" /> Stable
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
        delta > 0
          ? "bg-emerald-900/40 border-emerald-700/40 text-emerald-400"
          : "bg-red-900/40 border-red-700/40 text-red-400"
      }`}
    >
      {delta > 0
        ? <TrendingUp className="w-2.5 h-2.5" />
        : <TrendingDown className="w-2.5 h-2.5" />}
      {delta > 0 ? "+" : ""}{Math.round(delta)}
    </span>
  );
}

// ── Dimension row ─────────────────────────────────────────────────────────────

function DimRow({ label, prev, curr, delta, visible, index }: {
  label: string; prev: number; curr: number; delta: number; visible: boolean; index: number;
}) {
  const [barW, setBarW] = useState(prev);

  useEffect(() => {
    if (visible) {
      const t = setTimeout(() => setBarW(curr), index * 80 + 200);
      return () => clearTimeout(t);
    }
  }, [visible, curr, index]);

  const color = curr >= 70 ? "#10b981" : curr >= 50 ? "#06b6d4" : "#f59e0b";

  return (
    <div
      className="flex items-center gap-3"
      style={{
        opacity:    visible ? 1 : 0,
        transform:  visible ? "translateY(0)" : "translateY(6px)",
        transition: `opacity 0.35s ease ${index * 70}ms, transform 0.35s ease ${index * 70}ms`,
      }}
    >
      <p className="text-xs text-muted-foreground/80 w-32 flex-shrink-0">{label}</p>
      <div className="flex-1 relative h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full rounded-full"
          style={{
            width:      `${barW}%`,
            background: color,
            boxShadow:  `0 0 5px ${color}50`,
            transition: "width 0.85s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        />
      </div>
      <span className="text-xs font-bold tabular-nums text-foreground/70 w-7 text-right">{curr}</span>
      <DeltaPill delta={delta} />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  currentReport: AiensieReport;
}

export function BehaviorEvolutionCard({ currentReport }: Props) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const snapshots = loadSnapshots();
  // The last snapshot was just saved for the current report.
  // Compare against the one before it.
  const prevSnapshot = snapshots.length >= 2 ? snapshots[snapshots.length - 2] : null;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.05 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  // No history yet
  if (!prevSnapshot) {
    return (
      <div ref={ref} className="glass rounded-2xl p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-6 h-6 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center">
            <GitCompare className="w-3.5 h-3.5 text-primary" />
          </div>
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Behavior Evolution
          </h3>
        </div>
        <div className="rounded-xl bg-card/50 border border-border/40 p-5 text-center">
          <Upload className="w-6 h-6 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground/70 mb-1">First assessment on record</p>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
            Upload your next assessment and Aiensie will track how your behavioral dimensions evolve over time.
          </p>
          <Link href="/assessment">
            <button className="mt-4 text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
              Start next assessment →
            </button>
          </Link>
        </div>
        <p className="text-[11px] text-muted-foreground/40 text-center mt-3">
          {snapshots.length} report{snapshots.length !== 1 ? "s" : ""} stored locally
        </p>
      </div>
    );
  }

  const evo = computeEvolution(currentReport, prevSnapshot);
  const prevDate = new Date(prevSnapshot.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  // Generate progression insight
  const improving = evo.dimDeltas.filter((d) => d.delta > 3);
  const declining = evo.dimDeltas.filter((d) => d.delta < -3);
  let insight: string;

  if (evo.resolvedPatterns.length > 0 && evo.scoreDelta > 0) {
    insight = `${evo.resolvedPatterns[0]} pattern resolved since your last report. Score improved by ${Math.abs(evo.scoreDelta)} points.`;
  } else if (evo.scoreDelta >= 5) {
    insight = improving.length > 0
      ? `${improving[0].label} improved the most (+${Math.round(improving[0].delta)} pts). The trajectory is positive — stay consistent.`
      : `Overall score improved by ${evo.scoreDelta} points since your last assessment.`;
  } else if (evo.scoreDelta <= -5) {
    insight = declining.length > 0
      ? `${declining[0].label} declined the most (${Math.round(declining[0].delta)} pts). Review what changed in this period.`
      : `Score declined ${Math.abs(evo.scoreDelta)} points. Identify which behaviors shifted.`;
  } else if (evo.newPatterns.length > 0) {
    insight = `New pattern detected: ${evo.newPatterns[0]}. Address it early before it becomes entrenched.`;
  } else {
    insight = "Scores are largely stable since your last assessment. Consistency in both directions — continue refining your process.";
  }

  return (
    <div ref={ref} className="glass rounded-2xl p-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center">
            <GitCompare className="w-3.5 h-3.5 text-primary" />
          </div>
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Behavior Evolution
          </h3>
        </div>
        <span className="text-[11px] text-muted-foreground/50">vs. {prevDate} · {snapshots.length} reports</span>
      </div>

      {/* Score delta hero */}
      <div
        className="rounded-xl border p-4 mb-5 flex items-center gap-4"
        style={{
          background:  evo.scoreDelta >= 0 ? "oklch(0.13 0.02 160 / 0.4)" : "oklch(0.13 0.02 20 / 0.4)",
          borderColor: evo.scoreDelta >= 0 ? "rgba(16,185,129,0.2)"        : "rgba(239,68,68,0.2)",
          opacity:     visible ? 1 : 0,
          transition:  "opacity 0.4s ease",
        }}
      >
        {evo.scoreDelta >= 0
          ? <TrendingUp className="w-6 h-6 text-emerald-400 flex-shrink-0" />
          : <TrendingDown className="w-6 h-6 text-red-400 flex-shrink-0" />}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-0.5">
            Aiensie Score Change
          </p>
          <p className={`text-xl font-bold tabular-nums ${evo.scoreDelta >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {evo.scoreDelta >= 0 ? "+" : ""}{evo.scoreDelta} points
            <span className="text-sm font-normal text-muted-foreground ml-2">
              {prevSnapshot.aiensieScore} → {currentReport.aiensieScore}
            </span>
          </p>
        </div>
      </div>

      {/* Dimension deltas */}
      <div className="space-y-3 mb-5">
        {evo.dimDeltas.map((d, i) => (
          <DimRow
            key={d.key}
            label={d.label}
            prev={d.prev}
            curr={d.curr}
            delta={d.delta}
            visible={visible}
            index={i}
          />
        ))}
      </div>

      {/* Pattern changes */}
      {(evo.resolvedPatterns.length > 0 || evo.newPatterns.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {evo.resolvedPatterns.length > 0 && (
            <div className="rounded-xl bg-emerald-950/30 border border-emerald-800/30 p-3">
              <p className="text-[10px] font-bold text-emerald-400/60 uppercase tracking-widest mb-2">Resolved</p>
              {evo.resolvedPatterns.map((p) => (
                <p key={p} className="text-xs text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />{p}
                </p>
              ))}
            </div>
          )}
          {evo.newPatterns.length > 0 && (
            <div className="rounded-xl bg-amber-950/30 border border-amber-800/30 p-3">
              <p className="text-[10px] font-bold text-amber-400/60 uppercase tracking-widest mb-2">New Patterns</p>
              {evo.newPatterns.map((p) => (
                <p key={p} className="text-xs text-amber-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />{p}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Insight */}
      <div
        className="rounded-xl bg-primary/5 border border-primary/15 p-4"
        style={{
          opacity:    visible ? 1 : 0,
          transition: "opacity 0.5s ease 0.5s",
        }}
      >
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-1.5">Evolution Insight</p>
        <p className="text-sm text-foreground/80 leading-relaxed">{insight}</p>
      </div>
    </div>
  );
}
