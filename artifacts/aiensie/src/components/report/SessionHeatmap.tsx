import { useRef, useState, useEffect } from "react";
import { BarChart3 } from "lucide-react";
import type { SessionIntelligence, SessionProfile, SessionPeriod } from "@workspace/aiensie-engine";

// ── Constants ─────────────────────────────────────────────────────────────────

const SESSION_ORDER: SessionPeriod[] = ["morning", "midday", "afternoon", "evening", "night"];

const SESSION_META: Record<SessionPeriod, { label: string; time: string; emoji: string }> = {
  morning:   { label: "Morning",    time: "6–10am",   emoji: "🌅" },
  midday:    { label: "Midday",     time: "10am–2pm", emoji: "☀️"  },
  afternoon: { label: "Afternoon",  time: "2–6pm",    emoji: "🌤️" },
  evening:   { label: "Evening",    time: "6–10pm",   emoji: "🌆" },
  night:     { label: "Late Night", time: "10pm+",    emoji: "🌙" },
};

const METRIC_ROWS = [
  { key: "discipline",    label: "Discipline",          note: "" },
  { key: "profitability", label: "Profitability",       note: "" },
  { key: "stability",     label: "Emotional Stability", note: "" },
  { key: "impulsiveness", label: "Impulsiveness",       note: "↑ = more impulsive" },
] as const;

type MetricKey = typeof METRIC_ROWS[number]["key"];

// ── Helpers ───────────────────────────────────────────────────────────────────

function heatColor(value: number, inverted = false): string {
  const v = inverted ? 100 - value : value;
  if (v >= 75) return "#10b981";
  if (v >= 58) return "#34d399";
  if (v >= 42) return "#f59e0b";
  if (v >= 28) return "#f97316";
  return "#ef4444";
}

function computeMetrics(sessions: SessionProfile[]): Partial<Record<SessionPeriod, Record<MetricKey, number>>> {
  const pnls    = sessions.map((s) => s.avgPnl);
  const minPnl  = Math.min(...pnls);
  const maxPnl  = Math.max(...pnls);
  const pnlRange = maxPnl - minPnl || 1;

  const result: Partial<Record<SessionPeriod, Record<MetricKey, number>>> = {};

  for (const s of sessions) {
    const pnlNorm     = Math.round(((s.avgPnl - minPnl) / pnlRange) * 100);
    const stability   = s.emotionalRisk === "low" ? 82 : s.emotionalRisk === "medium" ? 48 : 16;
    const discipline  = Math.min(100, Math.round(s.quality * 0.65 + s.winRate * 35));
    const impulsive   = Math.min(100, Math.round(100 - s.quality + (s.tradeCount > 10 ? 20 : 0)));

    result[s.period] = {
      discipline,
      profitability: pnlNorm,
      stability,
      impulsiveness: impulsive,
    };
  }

  return result;
}

function ScoreCell({ value, inverted, visible, delay }: {
  value: number; inverted?: boolean; visible: boolean; delay: number;
}) {
  const color = heatColor(value, inverted);
  return (
    <div
      className="rounded-xl border flex items-center justify-center h-12 relative overflow-hidden"
      style={{
        background:   `${color}12`,
        borderColor:  `${color}30`,
        opacity:      visible ? 1 : 0,
        transform:    visible ? "scale(1)" : "scale(0.92)",
        transition:   `opacity 0.4s ease ${delay}ms, transform 0.4s ease ${delay}ms`,
      }}
    >
      <span className="text-sm font-bold tabular-nums" style={{ color }}>
        {value}
      </span>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function SessionHeatmap({ data }: { data: SessionIntelligence | null }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.05 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  if (!data || data.sessions.length === 0) return null;

  const metrics  = computeMetrics(data.sessions);
  const periods  = SESSION_ORDER.filter((p) => data.sessions.some((s) => s.period === p));
  const colCount = periods.length;

  return (
    <div ref={ref} className="glass rounded-2xl p-6 overflow-hidden">

      {/* Header */}
      <div className="flex items-center gap-2.5 mb-6">
        <div className="w-6 h-6 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center flex-shrink-0">
          <BarChart3 className="w-3.5 h-3.5 text-primary" />
        </div>
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Execution Heatmap</h3>
        <span className="ml-auto text-[10px] text-muted-foreground/35 uppercase tracking-widest">By session</span>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <div style={{ minWidth: `${120 + colCount * 100}px` }}>

          {/* Column headers */}
          <div
            className="grid mb-3"
            style={{ gridTemplateColumns: `110px repeat(${colCount}, 1fr)`, gap: "6px" }}
          >
            <div />
            {periods.map((p) => (
              <div key={p} className="text-center">
                <p className="text-base leading-none mb-0.5">{SESSION_META[p].emoji}</p>
                <p className="text-[11px] font-semibold text-foreground/80">{SESSION_META[p].label}</p>
                <p className="text-[9px] text-muted-foreground/45">{SESSION_META[p].time}</p>
              </div>
            ))}
          </div>

          {/* Metric rows */}
          {METRIC_ROWS.map((row, ri) => (
            <div
              key={row.key}
              className="grid mb-1.5"
              style={{ gridTemplateColumns: `110px repeat(${colCount}, 1fr)`, gap: "6px" }}
            >
              {/* Row label */}
              <div className="flex items-center">
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground/80">{row.label}</p>
                  {row.note && (
                    <p className="text-[9px] text-muted-foreground/40">{row.note}</p>
                  )}
                </div>
              </div>

              {/* Cells */}
              {periods.map((p, ci) => {
                const val = metrics[p]?.[row.key] ?? 50;
                const delay = ri * 50 + ci * 40;
                return (
                  <ScoreCell
                    key={p}
                    value={val}
                    inverted={row.key === "impulsiveness"}
                    visible={visible}
                    delay={delay}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-4 pt-4 border-t border-border/25">
        <p className="text-[10px] text-muted-foreground/40 uppercase tracking-widest">Heat scale</p>
        {[
          { color: "#ef4444", label: "Poor"     },
          { color: "#f97316", label: "Weak"     },
          { color: "#f59e0b", label: "Moderate" },
          { color: "#34d399", label: "Good"     },
          { color: "#10b981", label: "Strong"   },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
            <span className="text-[10px] text-muted-foreground/55">{label}</span>
          </div>
        ))}
      </div>

      {/* Insight row */}
      <div className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/12">
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary/50 mb-1">Heatmap insight</p>
        <p className="text-xs text-foreground/70 leading-relaxed">{data.insight}</p>
      </div>
    </div>
  );
}
